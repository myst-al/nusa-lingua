import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { api } from "../lib/api";

export default function Landing() {
  // Fetch stats live dari API. Cached 60 detik di server + 60 detik di client (staleTime).
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: api.getStats,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Format angka jadi compact: 1.234 -> "1.2K", 1.500.000 -> "1.5M".
  const fmt = (n: number | undefined) => {
    if (n === undefined) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const statCards = [
    { num: fmt(stats?.languages), label: "Bahasa Tersedia", icon: "🌐", to: "/explorer" },
    { num: fmt(stats?.conversations), label: "Percakapan", icon: "💬", to: "/chat" },
    { num: fmt(stats?.messages), label: "Pesan Terkirim", icon: "✉️", to: "/chat" },
    { num: fmt(stats?.users), label: "Pengguna Terdaftar", icon: "👤", to: "/explorer" },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-8 py-20 text-center">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold tracking-wide mb-6">
          PIDI DIGDAYA × HACKATHON 2026
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
          Suara Indonesia
          <br />
          <span className="text-primary">dalam Satu Platform</span>
        </h1>
        <p className="text-lg text-ink-soft max-w-2xl mx-auto mb-8">
          NusaLingua adalah platform AI percakapan pertama Indonesia yang
          mendukung 700+ bahasa daerah. Berbicara, bertanya, dan belajar dalam
          bahasa leluhur Anda — dengan teknologi AI terkini.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          <Link to="/voice" className="btn-primary btn-lg">
            🎤 Mulai Percakapan
          </Link>
          <Link to="/explorer" className="btn-outline btn-lg">
            🌐 Jelajahi Bahasa
          </Link>
        </div>

        {/* STATS — data live dari /api/stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {statCards.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="card p-5 flex items-center gap-3.5 hover:border-primary transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-extrabold text-lg">
                {s.icon}
              </div>
              <div className="text-left">
                <div className="text-xl font-extrabold leading-tight">
                  {statsLoading ? (
                    <span className="inline-block w-10 h-5 bg-stone-200 rounded animate-pulse" />
                  ) : (
                    s.num
                  )}
                </div>
                <div className="text-xs text-ink-mute">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>
        {stats?.updatedAt && (
          <div className="text-[10px] text-ink-mute mt-3">
            Data live • diperbarui {new Date(stats.updatedAt).toLocaleTimeString("id-ID")}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="bg-white rounded-3xl border border-line p-12">
          <div className="text-center mb-10">
            <div className="text-primary font-bold text-xs tracking-widest uppercase mb-2">
              TIGA PRODUK · SATU EKOSISTEM
            </div>
            <h2 className="text-3xl font-extrabold mb-2">
              NusaLingua Core, API &amp; Studio
            </h2>
            <p className="text-ink-soft max-w-xl mx-auto">
              Solusi end-to-end untuk pemerintah, enterprise, developer, sampai
              pengguna akhir.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "⚙",
                title: "NusaLingua Core",
                desc: "Model LLM open-source berbasis LLaMA-3 yang dioptimalkan untuk bahasa Nusantara dengan tokenizer kustom.",
                to: "/chat",
              },
              {
                icon: "⟨/⟩",
                title: "NusaLingua API",
                desc: "REST API OpenAI-compatible untuk developer. Chat, terjemahan, sentimen, voice — semua dalam satu endpoint.",
                to: "/chat",
              },
              {
                icon: "▦",
                title: "NusaLingua Studio",
                desc: "Platform no-code untuk membuat chatbot & asisten virtual dalam bahasa daerah tanpa coding.",
                to: "/studio",
              },
            ].map((f) => (
              <Link
                key={f.title}
                to={f.to}
                className="border border-line rounded-2xl p-6 hover:border-primary hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-extrabold text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-soft">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
