import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { api } from "../lib/api";
import { formatNumber } from "../lib/utils";

export default function Explorer() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.listLanguages(),
  });

  const startMutation = useMutation({
    mutationFn: (code: string) =>
      api.createConversation({ languageCode: code }),
    onSuccess: (convo) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      navigate(`/chat/${convo.id}`);
    },
  });

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header
        showCta={false}
        rightSlot={
          <button className="btn-ghost btn-sm" onClick={() => navigate("/")}>
            ← Kembali
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">
              Jelajahi 700+ Bahasa Daerah
            </h1>
            <p className="text-ink-soft text-sm">
              Pilih bahasa untuk mulai percakapan dengan NusaLingua.
            </p>
          </div>
          <div className="bg-white border border-line rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 min-w-[320px]">
            <span>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari bahasa daerah..."
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-ink-mute py-20">Memuat bahasa...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((lang) => (
              <button
                key={lang.code}
                disabled={lang.status === "soon" || startMutation.isPending}
                onClick={() => startMutation.mutate(lang.code)}
                className={`text-left card p-5 transition-all ${
                  lang.status === "soon"
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-primary hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-300 to-primary-600 text-white font-extrabold flex items-center justify-center mb-3.5">
                  {lang.flag}
                </div>
                <div className="font-bold text-base mb-0.5">{lang.name}</div>
                <div className="text-[11px] text-ink-mute mb-2.5">
                  {lang.region}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                  <span
                    className={
                      lang.status === "live"
                        ? "pill-success"
                        : lang.status === "beta"
                        ? "pill-warning"
                        : "pill-info"
                    }
                  >
                    ●{" "}
                    {lang.status === "live"
                      ? "LIVE"
                      : lang.status === "beta"
                      ? "BETA"
                      : "SOON"}
                  </span>
                  <span>{formatNumber(lang.speakers)} penutur</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center text-ink-mute py-20">
            Tidak ada bahasa yang cocok dengan "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
