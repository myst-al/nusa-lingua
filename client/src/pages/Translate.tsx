import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { api } from "../lib/api";

export default function Translate() {
  const navigate = useNavigate();
  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  const [source, setSource] = useState("id");
  const [target, setTarget] = useState("jv");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const rank: Record<string, number> = { live: 0, beta: 1, soon: 2 };
    return [...languages].sort(
      (a, b) =>
        (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || a.name.localeCompare(b.name)
    );
  }, [languages]);

  async function handleTranslate() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult("");
    try {
      const r = await api.translate(text.trim(), target, source || undefined);
      setResult(r.translation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menerjemahkan");
    } finally {
      setBusy(false);
    }
  }

  function swap() {
    if (!source) return; // tidak bisa tukar kalau sumber auto-deteksi
    setSource(target);
    setTarget(source);
    setText(result || text);
    setResult("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showCta={false}
        rightSlot={
          <button className="btn-ghost btn-sm" onClick={() => navigate("/chat")}>
            ← Chat
          </button>
        }
      />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Terjemahan</h1>
        <p className="text-ink-soft text-sm mb-6">
          Terjemahkan teks ke Bahasa Indonesia dan bahasa daerah Nusantara —
          ditenagai AI Indonesia.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2.5 border border-line rounded-xl text-sm bg-white"
          >
            <option value="">Auto-deteksi</option>
            {sorted.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <button
            onClick={swap}
            disabled={!source}
            className="shrink-0 w-10 h-10 rounded-xl border border-line hover:border-primary hover:text-primary disabled:opacity-40"
            title="Tukar arah"
            aria-label="Tukar arah terjemahan"
          >
            ⇄
          </button>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2.5 border border-line rounded-xl text-sm bg-white"
          >
            {sorted.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik teks yang ingin diterjemahkan..."
              rows={8}
              maxLength={4000}
              className="w-full px-4 py-3 border border-line rounded-2xl text-sm resize-none outline-none focus:border-primary bg-white"
            />
            <div className="text-[11px] text-ink-mute mt-1">{text.length}/4000</div>
          </div>
          <div>
            <div className="w-full min-h-[13rem] px-4 py-3 border border-line rounded-2xl text-sm bg-stone-50 whitespace-pre-wrap">
              {busy ? (
                <span className="text-ink-mute">Menerjemahkan…</span>
              ) : result ? (
                result
              ) : (
                <span className="text-ink-mute">Hasil terjemahan muncul di sini.</span>
              )}
            </div>
            {result && (
              <button
                onClick={() => navigator.clipboard?.writeText(result)}
                className="text-[11px] text-primary hover:underline mt-1"
              >
                Salin hasil
              </button>
            )}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <button
          onClick={handleTranslate}
          disabled={!text.trim() || busy}
          className="btn-primary btn-lg mt-5 disabled:opacity-40"
        >
          {busy ? "Menerjemahkan…" : "Terjemahkan"}
        </button>
      </main>
    </div>
  );
}
