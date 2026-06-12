import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { api, streamChat } from "../lib/api";
import type { Message } from "@shared/types";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // drawer mobile
  const bodyRef = useRef<HTMLDivElement>(null);

  // Load conversations (sidebar)
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.listConversations(),
  });

  // Load languages
  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  // Load current conversation
  const { data: currentConvo } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.getConversation(conversationId!),
    enabled: !!conversationId,
  });

  // Load messages
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.listMessages(conversationId!),
    enabled: !!conversationId,
  });

  // Auto-scroll ke bawah saat ada pesan baru / streaming
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Auto-create percakapan default kalau belum ada
  useEffect(() => {
    if (!conversationId && conversations.length > 0) {
      navigate(`/chat/${conversations[0].id}`, { replace: true });
    }
  }, [conversationId, conversations, navigate]);

  async function handleNewConversation(languageCode = "id") {
    const lang = languages.find((l) => l.code === languageCode);
    const convo = await api.createConversation({
      title: `Percakapan ${lang?.name ?? "Indonesia"}`,
      languageCode,
    });
    qc.invalidateQueries({ queryKey: ["conversations"] });
    setSidebarOpen(false);
    navigate(`/chat/${convo.id}`);
  }

  async function handleDeleteConversation(id: string) {
    if (!confirm("Hapus percakapan ini beserta seluruh pesannya?")) return;
    try {
      await api.deleteConversation(id);
      qc.invalidateQueries({ queryKey: ["conversations"] });
      if (id === conversationId) navigate("/chat", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus percakapan.");
    }
  }

  async function handleSend() {
    if (!input.trim() || !conversationId || isStreaming) return;
    const content = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    // Optimistic: tambahkan user message ke cache
    qc.setQueryData<Message[]>(["messages", conversationId], (prev = []) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        tokensUsed: null,
        createdAt: new Date().toISOString(),
      },
    ]);

    let assistantText = "";
    await streamChat(conversationId, content, {
      onDelta: (text) => {
        assistantText += text;
        setStreamingText(assistantText);
      },
      onDone: () => {
        setStreamingText("");
        setIsStreaming(false);
        qc.invalidateQueries({ queryKey: ["messages", conversationId] });
        qc.invalidateQueries({ queryKey: ["conversations"] });
      },
      onError: (err) => {
        console.error(err);
        alert(`Error: ${err}`);
        setIsStreaming(false);
        setStreamingText("");
        // Sinkronkan ulang dengan server — buang optimistic message temp
        // (pesan user mungkin sudah/belum tersimpan tergantung titik gagal).
        qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      },
    });
  }

  const currentLanguage = languages.find(
    (l) => l.code === currentConvo?.languageCode
  );

  return (
    <div className="h-screen flex flex-col">
      <Header
        showCta={false}
        rightSlot={
          <>
            {currentLanguage && (
              <div className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-semibold">
                🌐 {currentLanguage.name}
              </div>
            )}
            <button
              className="btn-primary btn-sm"
              onClick={() => navigate("/voice")}
            >
              🎤 Voice
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] flex-1 min-h-0">
        {/* Backdrop drawer (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR — drawer di mobile, kolom statis di desktop */}
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } md:flex fixed md:static inset-y-0 left-0 z-40 w-72 md:w-auto bg-stone-50 border-r border-line flex-col`}
        >
          <div className="p-4">
            <button
              className="btn-primary w-full"
              onClick={() => handleNewConversation("id")}
            >
              + Percakapan Baru
            </button>
          </div>
          <div className="px-3 flex-1 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold px-2 py-2">
              Percakapan
            </div>
            {conversations.length === 0 && (
              <div className="text-xs text-ink-mute px-2 py-3">
                Belum ada percakapan. Klik tombol di atas untuk mulai.
              </div>
            )}
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(`/chat/${c.id}`);
                }}
                className={`group flex items-center gap-1 w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors cursor-pointer ${
                  c.id === conversationId
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-ink-soft hover:bg-primary-50 hover:text-primary"
                }`}
              >
                <span className="flex-1 truncate">💬 {c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(c.id);
                  }}
                  className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs text-ink-mute hover:text-red-600 hover:bg-red-50 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  title="Hapus percakapan"
                  aria-label={`Hapus ${c.title}`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-line">
            <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold px-2 mb-2">
              Pilih Bahasa
            </div>
            <select
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white"
              onChange={(e) => {
                if (e.target.value) handleNewConversation(e.target.value);
                // Reset ke placeholder supaya bahasa yang sama bisa dipilih lagi
                e.target.value = "";
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Buat percakapan baru di...
              </option>
              {languages
                .filter((l) => l.status !== "soon")
                .map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} {l.status === "beta" ? "(Beta)" : ""}
                  </option>
                ))}
            </select>
          </div>
        </aside>

        {/* MAIN CHAT */}
        <main className="flex flex-col bg-white min-h-0">
          {!conversationId ? (
            <EmptyState
              onStart={() => handleNewConversation("id")}
              loading={languages.length === 0}
            />
          ) : (
            <>
              <div className="px-4 md:px-6 py-3.5 border-b border-line flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden shrink-0 w-9 h-9 rounded-lg border border-line flex items-center justify-center text-ink-soft hover:border-primary hover:text-primary"
                  title="Daftar percakapan"
                  aria-label="Buka daftar percakapan"
                >
                  ☰
                </button>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">
                    {currentConvo?.title ?? "Memuat..."}
                  </div>
                  <div className="text-[11px] text-ink-mute truncate">
                    Model: NusaLingua-Core (GPT-4o backend) · Bahasa:{" "}
                    {currentLanguage?.name}
                  </div>
                </div>
              </div>

              <div
                ref={bodyRef}
                className="flex-1 overflow-y-auto p-6 bg-stone-50 space-y-4"
              >
                {messages.length === 0 && !isStreaming && (
                  <div className="text-center text-ink-mute text-sm py-12">
                    Mulai percakapan dengan mengetik di bawah ↓
                  </div>
                )}
                {messages.map((m) => (
                  <Bubble key={m.id} role={m.role} content={m.content} />
                ))}
                {isStreaming && streamingText && (
                  <Bubble role="assistant" content={streamingText} streaming />
                )}
                {isStreaming && !streamingText && (
                  <Bubble role="assistant" content="..." streaming />
                )}
              </div>

              <div className="p-4 border-t border-line bg-white">
                <div className="flex items-center gap-2 bg-stone-50 border border-line rounded-2xl p-2.5">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isStreaming}
                    placeholder={`Tulis pesan dalam ${currentLanguage?.name ?? "Bahasa Indonesia"}...`}
                    className="flex-1 bg-transparent outline-none text-sm px-2"
                  />
                  <button
                    onClick={() => navigate("/voice")}
                    className="w-9 h-9 rounded-xl hover:bg-primary-50 hover:text-primary text-ink-soft flex items-center justify-center"
                    title="Mode Voice"
                  >
                    🎤
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-700 disabled:opacity-40 text-white flex items-center justify-center font-bold"
                  >
                    →
                  </button>
                </div>
                <div className="text-center text-[11px] text-ink-mute mt-2">
                  NusaLingua menggunakan AI. Respons mungkin tidak selalu
                  akurat.
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function Bubble({
  role,
  content,
  streaming,
}: {
  role: string;
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
          isUser ? "bg-stone-900 text-white" : "bg-primary text-white"
        }`}
      >
        {isUser ? "A" : "N"}
      </div>
      <div
        className={`px-4 py-3 max-w-xl whitespace-pre-wrap text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-white rounded-2xl rounded-tr-md"
            : "bg-white border border-line rounded-2xl rounded-tl-md"
        }`}
      >
        {content}
        {streaming && <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse" />}
      </div>
    </div>
  );
}

function EmptyState({
  onStart,
  loading,
}: {
  onStart: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold text-3xl mx-auto mb-6">
          N
        </div>
        <h2 className="text-2xl font-extrabold mb-2">
          Selamat datang di NusaLingua
        </h2>
        <p className="text-ink-soft text-sm mb-6">
          Mulai percakapan dalam Bahasa Indonesia atau bahasa daerah favoritmu.
        </p>
        <button
          className="btn-primary btn-lg"
          onClick={onStart}
          disabled={loading}
        >
          {loading ? "Memuat..." : "+ Mulai Percakapan Pertama"}
        </button>
      </div>
    </div>
  );
}
