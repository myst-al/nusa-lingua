import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

interface Tier {
  name: string;
  tagline: string;
  monthly: number | null; // null = custom (Enterprise)
  annualPerMonth: number | null;
  cta: string;
  highlight: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Gratis",
    tagline: "Untuk mencoba & pelajar",
    monthly: 0,
    annualPerMonth: 0,
    cta: "Mulai Gratis",
    highlight: false,
    features: [
      "Chat & Terjemahan 50/hari",
      "8 bahasa utama",
      "Voice Mode Hemat (gratis)",
      "Tingkat tutur dasar",
      "1 bot di Studio",
      "Dukungan komunitas",
    ],
  },
  {
    name: "Pro",
    tagline: "Untuk individu & UMKM",
    monthly: 49000,
    annualPerMonth: 40800,
    cta: "Coba 14 Hari Gratis",
    highlight: true,
    features: [
      "14 hari uji coba gratis (tanpa kartu kredit)",
      "Chat & Terjemahan tanpa batas wajar",
      "Semua 100+ bahasa Nusantara",
      "Voice realtime 60 menit/bln",
      "Tingkat tutur lengkap (krama/ngoko, lemes/loma)",
      "10 bot di Studio",
      "Riwayat & ekspor percakapan",
      "Kuota API 100rb token/bln",
      "Dukungan email prioritas",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Pemda, perusahaan & instansi",
    monthly: null,
    annualPerMonth: null,
    cta: "Hubungi Kami",
    highlight: false,
    features: [
      "Semua fitur Pro, tanpa batas",
      "Bahasa daerah kustom & fine-tune",
      "Voice realtime sesuai SLA",
      "Bot Studio tak terbatas",
      "SSO & on-premise / VPC",
      "API volume + diskon bertingkat",
      "SLA & dukungan dedicated",
    ],
  },
];

const API_ROWS = [
  { name: "Chat / Generasi teks", unit: "per 1.000 token", price: "Rp12", usd: "~$0,0008" },
  { name: "Terjemahan", unit: "per 1.000 karakter", price: "Rp20", usd: "~$0,0013" },
  { name: "Voice realtime", unit: "per menit", price: "Rp7.000", usd: "~$0,44" },
];

function rupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function Pricing() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [starting, setStarting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(),
    enabled: !!user,
  });

  async function startTrial() {
    if (!user) {
      navigate("/login");
      return;
    }
    setStarting(true);
    setMsg(null);
    try {
      await api.startTrial();
      await qc.invalidateQueries({ queryKey: ["me"] });
      setMsg("🎉 Uji coba Pro 14 hari kamu aktif! Nikmati semua fitur.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal mengaktifkan uji coba.");
    } finally {
      setStarting(false);
    }
  }

  function renderCta(t: Tier) {
    // Enterprise
    if (t.monthly === null) {
      return (
        <button
          onClick={() =>
            (window.location.href =
              "mailto:halo@nusalingua.my.id?subject=NusaLingua%20Enterprise")
          }
          className="w-full mb-5 btn-ghost border border-line"
        >
          {t.cta}
        </button>
      );
    }
    // Gratis
    if (!t.highlight) {
      return (
        <button
          onClick={() => navigate(user ? "/chat" : "/login")}
          className="w-full mb-5 btn-ghost border border-line"
        >
          {user ? "Buka NusaLingua" : t.cta}
        </button>
      );
    }
    // Pro — alur uji coba opt-in
    if (!user) {
      return (
        <button onClick={() => navigate("/login")} className="w-full mb-5 btn-primary">
          Coba 14 Hari Gratis
        </button>
      );
    }
    if (!me) {
      return (
        <button disabled className="w-full mb-5 btn-primary opacity-60">
          Memuat…
        </button>
      );
    }
    if (me.trialActive) {
      return (
        <div className="w-full mb-5 text-center rounded-xl bg-green-50 text-green-700 font-semibold py-2.5 border border-green-200 text-sm">
          ✨ Uji coba aktif · {me.trialDaysLeft} hari lagi
        </div>
      );
    }
    if (me.trialUsed) {
      return (
        <button
          onClick={() =>
            (window.location.href =
              "mailto:halo@nusalingua.my.id?subject=Langganan%20NusaLingua%20Pro")
          }
          className="w-full mb-5 btn-primary"
        >
          Langganan Pro
        </button>
      );
    }
    return (
      <button
        onClick={startTrial}
        disabled={starting}
        className="w-full mb-5 btn-primary disabled:opacity-60"
      >
        {starting ? "Mengaktifkan…" : "Mulai Uji Coba 14 Hari"}
      </button>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pt-14 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Harga yang <span className="text-primary">adil untuk semua</span>
          </h1>
          <p className="text-ink-soft max-w-2xl mx-auto">
            Mulai gratis untuk mengangkat bahasa daerah ke era digital. Tingkatkan
            saat butuh lebih — atau bangun di atas API NusaLingua untuk pasar ASEAN.
          </p>

          <div className="inline-flex items-center gap-1 mt-7 p-1 bg-stone-100 rounded-full border border-line">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                !annual ? "bg-white shadow text-ink" : "text-ink-mute"
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                annual ? "bg-white shadow text-ink" : "text-ink-mute"
              }`}
            >
              Tahunan{" "}
              <span className="text-[10px] text-green-600 font-bold">hemat 2 bln</span>
            </button>
          </div>
        </section>

        {msg && (
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="rounded-xl border border-green-200 bg-green-50 text-green-800 text-sm px-4 py-3 mb-2 text-center">
              {msg}
            </div>
          </div>
        )}

        {/* CONSUMER TIERS */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                t.highlight
                  ? "border-primary ring-2 ring-primary/20 bg-primary-50/40 relative"
                  : "border-line bg-white"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  PALING POPULER
                </span>
              )}
              <div className="font-extrabold text-lg">{t.name}</div>
              <div className="text-xs text-ink-mute mb-4">{t.tagline}</div>

              <div className="mb-5">
                {t.monthly === null ? (
                  <div className="text-3xl font-extrabold">Custom</div>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold">
                      {rupiah(annual ? (t.annualPerMonth ?? 0) : t.monthly)}
                    </span>
                    <span className="text-ink-mute text-sm"> /bln</span>
                    {annual && t.monthly > 0 && (
                      <div className="text-[11px] text-ink-mute mt-0.5">
                        ditagih {rupiah((t.annualPerMonth ?? 0) * 12)}/tahun
                      </div>
                    )}
                  </>
                )}
              </div>

              {renderCta(t)}

              <ul className="space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary font-bold shrink-0">✓</span>
                    <span className="text-ink-soft">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* API PRICING */}
        <section className="bg-stone-50 border-y border-line">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
            <div className="text-center mb-8">
              <div className="text-xs font-bold tracking-widest text-primary uppercase mb-2">
                Untuk Developer
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
                API NusaLingua — bayar sesuai pakai
              </h2>
              <p className="text-ink-soft max-w-2xl mx-auto text-sm">
                Bangun layanan berbahasa Indonesia & daerah di atas AI lokal.
                Gratis 100.000 token + 50.000 karakter terjemah setiap bulan untuk mulai.
              </p>
            </div>

            <div className="max-w-3xl mx-auto bg-white border border-line rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-ink-mute">
                    <th className="px-5 py-3 font-semibold">Layanan</th>
                    <th className="px-5 py-3 font-semibold">Satuan</th>
                    <th className="px-5 py-3 font-semibold text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {API_ROWS.map((r) => (
                    <tr key={r.name} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5 font-semibold">{r.name}</td>
                      <td className="px-5 py-3.5 text-ink-mute">{r.unit}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-extrabold">{r.price}</span>
                        <span className="block text-[10px] text-ink-mute">{r.usd}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-[12px] text-ink-mute mt-4">
              Contoh: chatbot UMKM ~15 juta token/bln ≈ <b>Rp180.000</b>. Volume besar?
              Diskon bertingkat di paket Enterprise.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 md:px-8 py-14 text-center">
          <h2 className="text-2xl font-extrabold mb-3">Siap mulai?</h2>
          <p className="text-ink-soft text-sm mb-6">
            Daftar gratis hari ini — lalu aktifkan uji coba Pro 14 hari kapan pun kamu mau.
          </p>
          <div className="flex gap-3 justify-center">
            <button className="btn-primary btn-lg" onClick={() => navigate(user ? "/chat" : "/login")}>
              {user ? "Buka NusaLingua" : "Daftar Gratis"}
            </button>
            <button className="btn-ghost btn-lg border border-line" onClick={() => navigate("/explorer")}>
              Jelajahi Bahasa
            </button>
          </div>
          <p className="text-[11px] text-ink-mute mt-8">
            Harga indikatif (Rupiah) untuk demo PIDI DIGDAYA 2026. Penawaran USD untuk
            pasar ekspor tersedia di paket Enterprise.
          </p>
        </section>
      </main>
    </div>
  );
}
