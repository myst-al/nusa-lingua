import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { api, streamChat } from "../lib/api";
import type { Language, Message } from "@shared/types";

const REGISTER_KEY = (id: string) => `nl-register:${id}`;

function formatSpeakers(n: number): string {
  if (!n) return "";
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10} jt penutur`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} rb penutur`;
  return `${n} penutur`;
}

function statusBadge(status: string): { label: string; cls: string } {
  if (status === "live") return { label: "Live", cls: "bg-green-100 text-green-700" };
  if (status === "beta") return { label: "Beta", cls: "bg-amber-100 text-amber-700" };
  return { label: "Segera", cls: "bg-stone-200 text-stone-600" };
}

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // drawer mobile
  const [showNewChat, setShowNewChat] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.listConversations(),
  });

  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  const { data: currentConvo } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.getConversation(conversationId!),
    enabled: !!conversationId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.listMessages(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, streamingText]);

  // Kalau belum ada percakapan terpilih, lompat ke yang terakhir (kalau ada)
  useEffect(() => {
    if (!conversationId && conversations.length > 0) {
      navigate(`/chat/${conversations[0].id}`, { replace: true });
    }
  }, [conversationId, conversations, navigate]);

  async function handleCreateConversation(languageCode: string, register: string) {
    const lang = languages.find((l) => l.code === languageCode);
    const convo = await api.createConversation({
      title: `Percakapan ${lang?.name ?? "Indonesia"}`,
      languageCode,
    });
    try {
      localStorage.setItem(REGISTER_KEY(convo.id), register);
    } catch {
      /* localStorage tidak tersedia - abaikan */
    }
    qc.invalidateQueries({ queryKey: ["conversations"] });
    setShowNewChat(false);
    setSidebarOpen(false);
    navigate(`/chat/${convo.id}`);
  }

  async function handleDeleteConversation(id: string) {
    if (!confirm("Hapus percakapan ini beserta seluruh pesannya?")) return;
    try {
      await api.deleteConversation(id);
      try {
        localStorage.removeItem(REGISTER_KEY(id));
      } catch {
        /* noop */
      }
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

    let register = "";
    try {
      register = localStorage.getItem(REGISTER_KEY(conversationId)) ?? "";
    } catch {
      /* noop */
    }

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
    await streamChat(
      conversationId,
      content,
      {
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
          qc.invalidateQueries({ queryKey: ["messages", conversationId] });
        },
      },
      register || undefined
    );
  }

  const currentLanguage = languages.find((l) => l.code === currentConvo?.languageCode);

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
            <button className="btn-primary btn-sm" onClick={() => navigate("/voice")}>
              🎤 Voice
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] flex-1 min-h-0">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } md:flex fixed md:static inset-y-0 left-0 z-40 w-72 md:w-auto bg-stone-50 border-r border-line flex-col`}
        >
          <div className="p-4">
            <button className="btn-primary w-full" onClick={() => setShowNewChat(true)}>
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
          <div className="p-3 border-t border-line text-[11px] text-ink-mute text-center">
            {languages.length} bahasa Nusantara tersedia
          </div>
        </aside>

        <main className="flex flex-col bg-white min-h-0">
          {!conversationId ? (
            <EmptyState onStart={() => setShowNewChat(true)} loading={languages.length === 0} />
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
                    Model: NusaLingua-Core · SEA-LION (AI Indonesia) · Bahasa:{" "}
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
                  NusaLingua menggunakan AI. Respons mungkin tidak selalu akurat.
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showNewChat && (
        <NewChatModal
          languages={languages}
          onClose={() => setShowNewChat(false)}
          onCreate={handleCreateConversation}
        />
      )}
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function NewChatModal({
  languages,
  onClose,
  onCreate,
}: {
  languages: Language[];
  onClose: () => void;
  onCreate: (languageCode: string, register: string) => Promise<void> | void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [register, setRegister] = useState("santai");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? languages.filter(
          (l) =>
            l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q)
        )
      : languages;
    const rank: Record<string, number> = { live: 0, beta: 1, soon: 2 };
    return [...list].sort(
      (a, b) =>
        (rank[a.status] ?? 3) - (rank[b.status] ?? 3) ||
        (b.speakers ?? 0) - (a.speakers ?? 0)
    );
  }, [languages, query]);

  async function start() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await onCreate(selected, register);
    } finally {
      setBusy(false);
    }
  }

  const selectedName = languages.find((l) => l.code === selected)?.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-line">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-lg">Percakapan Baru</h3>
            <button
              onClick={onClose}
              className="text-ink-mute hover:text-ink text-2xl leading-none"
              aria-label="Tutup"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-ink-mute">Pilih bahasa dulu untuk memulai.</p>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bahasa atau daerah..."
            className="mt-3 w-full px-3.5 py-2.5 border border-line rounded-xl text-sm bg-stone-50 outline-none focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 && (
            <div className="text-center text-ink-mute text-sm py-10">
              Tidak ada bahasa cocok dengan "{query}".
            </div>
          )}
          {filtered.map((l) => {
            const b = statusBadge(l.status);
            const isSel = selected === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelected(l.code)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 border transition-colors ${
                  isSel ? "border-primary bg-primary-50" : "border-transparent hover:bg-stone-50"
                }`}
              >
                <span className="shrink-0 w-9 h-9 rounded-lg bg-primary-100 text-primary-700 text-[10px] font-extrabold flex items-center justify-center">
                  {l.flag}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{l.name}</span>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${b.cls}`}>
                      {b.label}
                    </span>
                  </span>
                  <span className="block text-[11px] text-ink-mute truncate">
                    {l.region}
                    {l.speakers ? ` · ${formatSpeakers(l.speakers)}` : ""}
                  </span>
                </span>
                {isSel && <span className="shrink-0 text-primary font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-line">
          <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold mb-2">
            Tingkat tutur
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setRegister("halus")}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                register === "halus"
                  ? "border-primary bg-primary-50 text-primary-700"
                  : "border-line text-ink-soft hover:border-primary"
              }`}
            >
              Halus / Sopan
            </button>
            <button
              onClick={() => setRegister("santai")}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                register === "santai"
                  ? "border-primary bg-primary-50 text-primary-700"
                  : "border-line text-ink-soft hover:border-primary"
              }`}
            >
              Santai / Akrab
            </button>
          </div>
          <p className="text-[11px] text-ink-mute mb-3">
            Mis. Jawa: krama (halus) vs ngoko (santai); Sunda: lemes vs loma.
          </p>
          <button onClick={start} disabled={!selected || busy} className="btn-primary w-full disabled:opacity-40">
            {busy ? "Membuat..." : selected ? `Mulai dalam ${selectedName}` : "Pilih bahasa dulu"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

function EmptyState({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold text-3xl mx-auto mb-6">
          N
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Selamat datang di NusaLingua</h2>
        <p className="text-ink-soft text-sm mb-6">
          Mulai percakapan dalam Bahasa Indonesia atau bahasa daerah favoritmu.
        </p>
        <button className="btn-primary btn-lg" onClick={onStart} disabled={loading}>
          {loading ? "Memuat..." : "+ Mulai Percakapan"}
        </button>
      </div>
    </div>
  );
}
