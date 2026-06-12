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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);

  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.stop().catch(() => undefined);
    };
  }, []);

  async function handleStart() {
    if (!audioRef.current) return;
    setError(null);

    if (status !== "idle" && status !== "error") {
      // Stop session
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
          if (text.trim()) {
            setTranscript((prev) => [...prev, { who: "user", text }]);
          }
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
          // Jangan override idle/error (mis. event telat masuk setelah sesi berakhir)
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

  function handleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    sessionRef.current?.setMicEnabled(!newMuted);
  }

  async function handleEnd() {
    await sessionRef.current?.stop();
    sessionRef.current = null;
    setStatus("idle");
    navigate("/chat");
  }

  const isActive = status === "listening" || status === "speaking";
  const langName = languages.find((l) => l.code === language)?.name ?? language;

  const statusText: Record<Status, string> = {
    idle: "Siap memulai",
    connecting: "Menghubungkan…",
    listening: "Mendengarkan…",
    speaking: "AI berbicara…",
    error: "Terjadi error",
  };

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
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isActive}
            className="mb-7 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200 disabled:opacity-50"
          >
            {languages
              .filter((l) => l.status !== "soon")
              .map((l) => (
                <option key={l.code} value={l.code}>
                  🌐 {l.name}
                </option>
              ))}
          </select>

          <button
            onClick={handleStart}
            disabled={status === "connecting"}
            className={`w-56 h-56 rounded-full mx-auto mb-7 cursor-pointer shadow-2xl shadow-primary/30 transition-transform ${
              isActive ? "animate-pulse-soft scale-105" : ""
            } ${status === "connecting" ? "opacity-70" : ""}`}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #FED7AA, #EA580C 80%)",
            }}
            aria-label={isActive ? "Akhiri sesi" : "Mulai sesi suara"}
          />

          <div className="text-2xl font-extrabold mb-2">
            {statusText[status]}
          </div>
          <p className="text-ink-soft text-sm mb-8">
            {status === "idle" &&
              `Tekan orb untuk mulai percakapan suara dalam ${langName}.`}
            {status === "connecting" && "Membuat sesi WebRTC realtime…"}
            {isActive && "Bicara natural — server VAD otomatis deteksi giliran."}
            {status === "error" && error}
          </p>

          <div className="flex gap-3 justify-center mb-8">
            <button
              disabled={!isActive}
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
              title="Ganti bahasa"
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

          {/* Live transcript */}
          {(transcript.length > 0 || partialAssistant) && (
            <div className="mt-4 bg-white border border-line rounded-2xl p-5 text-left text-sm max-h-72 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-widest text-ink-mute font-bold mb-3">
                Transkrip Live
              </div>
              {transcript.map((line, i) => (
                <div key={i} className="py-1 border-t border-dashed border-line first:border-t-0">
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
