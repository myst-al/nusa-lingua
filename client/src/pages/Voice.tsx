import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { api } from "../lib/api";
import { RealtimeSession } from "../lib/realtime";

type Status = "idle" | "connecting" | "listening" | "speaking" | "error";

interface TranscriptLine {
  who: "user" | "assistant";
  text: string;
}

export default function Voice() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("su");
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [partialAssistant, setPartialAssistant] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [freeMode, setFreeMode] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  useEffect(() => {
    return () => {
      sessionRef.current?.stop().catch(() => undefined);
      try {
        recognitionRef.current?.stop();
        window.speechSynthesis?.cancel();
      } catch {
        /* noop */
      }
    };
  }, []);

  // ---------- OpenAI Realtime (default) ----------
  async function handleStart() {
    if (!audioRef.current) return;
    setError(null);

    if (status !== "idle" && status !== "error") {
      await sessionRef.current?.stop();
      sessionRef.current = null;
      setStatus("idle");
      return;
    }

    try {
      setStatus("connecting");
      const session = new RealtimeSession(audioRef.current, {
        onConnected: () => setStatus("listening"),
        onDisconnected: () => setStatus("idle"),
        onUserTranscript: (text) => {
          if (text.trim()) setTranscript((prev) => [...prev, { who: "user", text }]);
        },
        onAssistantTranscript: (text, isFinal) => {
          if (isFinal) {
            setTranscript((prev) => [...prev, { who: "assistant", text }]);
            setPartialAssistant("");
          } else {
            setPartialAssistant(text);
          }
        },
        onSpeakingChange: (speaking) => {
          setStatus((prev) =>
            prev === "idle" || prev === "error" || prev === "connecting"
              ? prev
              : speaking
                ? "speaking"
                : "listening"
          );
        },
        onError: (err) => {
          setError(err);
          setStatus("error");
        },
      });
      sessionRef.current = session;
      await session.start(language);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Gagal memulai sesi voice";
      setError(msg);
      setStatus("error");
    }
  }

  // ---------- Mode Hemat: Web Speech API (gratis, tanpa OpenAI) ----------
  function speak(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "id-ID"; // suara browser terbatas; id-ID dipakai untuk semua bahasa
      u.onstart = () => setStatus("speaking");
      u.onend = () => setStatus("idle");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      setStatus("idle");
    }
  }

  function handleFreeListen() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Browser tidak mendukung pengenalan suara. Coba Chrome atau Edge.");
      setStatus("error");
      return;
    }
    if (status === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "id-ID";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    setError(null);
    setStatus("listening");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = async (e: any) => {
      const text: string = e.results?.[0]?.[0]?.transcript ?? "";
      if (!text.trim()) return;
      setTranscript((prev) => [...prev, { who: "user", text }]);
      setStatus("connecting"); // berpikir
      try {
        const r = await api.voiceReply(text, language);
        setTranscript((prev) => [...prev, { who: "assistant", text: r.reply }]);
        speak(r.reply);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mendapat balasan");
        setStatus("error");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      setError(`Suara: ${e.error ?? "error"}`);
      setStatus("error");
    };
    rec.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };
    rec.start();
  }

  function handleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    sessionRef.current?.setMicEnabled(!newMuted);
  }

  async function handleEnd() {
    await sessionRef.current?.stop();
    sessionRef.current = null;
    try {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    setStatus("idle");
    navigate("/chat");
  }

  const isActive = status === "listening" || status === "speaking";
  const langName = languages.find((l) => l.code === language)?.name ?? language;

  const statusText: Record<Status, string> = {
    idle: "Siap memulai",
    connecting: freeMode ? "Berpikir…" : "Menghubungkan…",
    listening: "Mendengarkan…",
    speaking: "AI berbicara…",
    error: "Terjadi error",
  };

  const onOrbClick = freeMode ? handleFreeListen : handleStart;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showCta={false}
        rightSlot={
          <button className="btn-ghost btn-sm" onClick={() => navigate("/chat")}>
            ← Kembali ke Chat
          </button>
        }
      />

      <audio ref={audioRef} autoPlay />

      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="text-center max-w-md w-full">
          <div className="flex items-center justify-center gap-2 mb-7 flex-wrap">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isActive}
              className="px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200 disabled:opacity-50"
            >
              {languages
                .filter((l) => l.status !== "soon")
                .map((l) => (
                  <option key={l.code} value={l.code}>
                    🌐 {l.name}
                  </option>
                ))}
            </select>
            <label
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer flex items-center gap-1.5 ${
                freeMode
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-white text-ink-soft border-line"
              } ${isActive ? "opacity-50 pointer-events-none" : ""}`}
              title="Pakai pengenalan & suara bawaan browser - gratis, tanpa OpenAI"
            >
              <input
                type="checkbox"
                checked={freeMode}
                onChange={(e) => setFreeMode(e.target.checked)}
                className="accent-green-600"
              />
              Mode Hemat (gratis)
            </label>
          </div>

          <button
            onClick={onOrbClick}
            disabled={status === "connecting"}
            className={`block w-56 h-56 rounded-full mx-auto mb-7 cursor-pointer shadow-2xl shadow-primary/30 transition-transform ${
              isActive ? "animate-pulse-soft scale-105" : ""
            } ${status === "connecting" ? "opacity-70" : ""}`}
            style={{
              background: "radial-gradient(circle at 30% 30%, #FED7AA, #EA580C 80%)",
            }}
            aria-label={isActive ? "Akhiri sesi" : "Mulai sesi suara"}
          />

          <div className="text-2xl font-extrabold mb-2">{statusText[status]}</div>
          <p className="text-ink-soft text-sm mb-8">
            {status === "idle" &&
              (freeMode
                ? `Mode Hemat: tekan orb lalu bicara dalam ${langName}. Suara bawaan browser (gratis).`
                : `Tekan orb untuk mulai percakapan suara dalam ${langName}.`)}
            {status === "connecting" &&
              (freeMode ? "Menyiapkan balasan…" : "Membuat sesi WebRTC realtime…")}
            {isActive &&
              (freeMode
                ? "Bicara, lalu tunggu balasan."
                : "Bicara natural - server VAD otomatis deteksi giliran.")}
            {status === "error" && (
              <>
                {error}
                {!freeMode && (
                  <>
                    {" "}
                    <button
                      onClick={() => setFreeMode(true)}
                      className="text-primary underline"
                    >
                      Coba Mode Hemat (gratis)
                    </button>
                  </>
                )}
              </>
            )}
          </p>

          <div className="flex gap-3 justify-center mb-8">
            <button
              disabled={!isActive || freeMode}
              onClick={handleMute}
              className={`w-14 h-14 rounded-full border bg-white hover:border-primary text-xl flex items-center justify-center disabled:opacity-40 ${
                muted
                  ? "border-red-500 text-red-500"
                  : "border-line text-ink-soft hover:text-primary"
              }`}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🎙"}
            </button>
            <button
              onClick={() => navigate("/explorer")}
              className="w-14 h-14 rounded-full border border-line bg-white hover:border-primary hover:text-primary text-ink-soft text-xl flex items-center justify-center"
              title="Jelajahi bahasa"
            >
              🌐
            </button>
            <button
              onClick={handleEnd}
              className="w-14 h-14 rounded-full bg-red-600 text-white border border-red-600 text-xl flex items-center justify-center hover:bg-red-700"
              title="Akhiri"
            >
              ✕
            </button>
          </div>

          {(transcript.length > 0 || partialAssistant) && (
            <div className="mt-4 bg-white border border-line rounded-2xl p-5 text-left text-sm max-h-72 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold mb-3">
                Transkrip Live
              </div>
              {transcript.map((line, i) => (
                <div
                  key={i}
                  className="py-1 border-t border-dashed border-line first:border-t-0"
                >
                  <span
                    className={`font-bold ${
                      line.who === "user" ? "text-stone-900" : "text-primary"
                    }`}
                  >
                    {line.who === "user" ? "Anda:" : "NusaLingua:"}
                  </span>{" "}
                  {line.text}
                </div>
              ))}
              {partialAssistant && (
                <div className="py-1 border-t border-dashed border-line opacity-70">
                  <span className="font-bold text-primary">NusaLingua:</span>{" "}
                  {partialAssistant}
                  <span className="inline-block w-1 h-3 bg-primary ml-1 animate-pulse" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
