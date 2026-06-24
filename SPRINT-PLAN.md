# Sprint Plan: NusaLingua Sprint 1 — "Go-Live"

**Tanggal:** Senin 15 Jun — Jumat 19 Jun 2026 (5 hari kerja) | **Tim:** 1 developer (Albert)
**Sprint Goal:** NusaLingua live di domain production (HTTPS via nginx) dengan semua fitur inti (chat, voice, studio) berfungsi dan termonitor.

> Prasyarat sudah beres (12 Jun): 19 bug fix diterapkan & terverifikasi (lihat `BUGFIX-REPORT.md`), plan deployment siap (`PRODUCTION-PLAN.md`).

## Kapasitas

| Person | Hari tersedia | Alokasi efektif | Catatan |
|---|---|---|---|
| Albert | 5 dari 5 | ~4 hari (80%) | Buffer 20% untuk interrupt/debugging |

## Sprint Backlog

| Prio | Item | Estimasi | Dependensi |
|---|---|---|---|
| P0 | Commit & push semua bug fix + dokumen ke repo | 0.5 jam | — |
| P0 | Deploy Fase 1: kredensial (Supabase, OpenAI, Groq, DNS A record, Supabase Auth Site URL + OAuth callback ke domain production) | 0.5 hari | Akses registrar domain |
| P0 | Deploy Fase 2–4: setup-server.sh, configure-env.sh, build.sh, db-setup.sh | 0.5 hari | SSH VPS |
| P0 | Deploy Fase 5–6: setup-nginx.sh (SSL/certbot) + start.sh (PM2) | 0.5 hari | DNS sudah propagasi |
| P0 | Smoke test production — 8 skenario di PRODUCTION-PLAN.md Fase 7 + fix temuan | 1 hari | Deploy selesai |
| P0 | Guardrail biaya & uptime: OpenAI usage limit ($20/bln) + UptimeRobot ke /api/health | 0.5 jam | Deploy selesai |
| P1 | CI gate: GitHub Actions lint + typecheck + test di setiap push/PR | 0.5 hari | — |
| P1 | Backup DB mingguan: cron `pg_dump` + simpan off-server | 0.25 hari | Deploy selesai |
| P1 | E2E Playwright smoke run terhadap URL production | 0.5 hari | Deploy selesai |
| P2 (stretch) | Vendor chunk splitting (main bundle masih 649kB — supabase/react) | 0.5 hari | — |
| P2 (stretch) | Perketat CSP nginx (hilangkan `unsafe-inline` script) + uji regresi | 0.5 hari | Deploy selesai |
| P2 (stretch) | Studio: mapping pilihan model fiktif (nusalingua-core-*) ke model provider nyata | 0.5 hari | — |
| P2 (stretch) | Sentry error tracking (client + server) | 0.5 hari | — |

**Beban P0:** ~2.5 hari | **P0+P1:** ~3.75 hari (≈94% dari kapasitas efektif — P2 hanya kalau P0/P1 selesai lebih cepat)

## Carryover

Tidak ada — sprint pertama. Bug fixing pra-sprint selesai 12 Jun.

## Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| DNS propagasi lambat | SSL/certbot tertunda | Set A record di hari pertama (Fase 1), TTL 300 |
| Biaya voice realtime membengkak saat testing | Tagihan OpenAI tinggi | Usage limit hari pertama; test voice singkat-singkat |
| OAuth callback salah konfigurasi | Login Google/GitHub gagal di production | Checklist Fase 1: Supabase Site URL + redirect URLs sebelum smoke test |
| Supabase free tier pause/limit | Downtime | Pantau dashboard; siapkan keputusan upgrade Pro ($25) |
| VPS RAM kecil saat build | Build gagal | Swap 2GB otomatis dari setup-server.sh; fallback: build lokal + rsync `dist/` |

## Definition of Done

- [ ] Semua P0 selesai; `https://DOMAIN` & `/api/health` hijau
- [ ] 8 skenario smoke test lulus (chat streaming, voice, studio save/edit, auth, port 6100 tertutup)
- [ ] Typecheck + build + test hijau di CI
- [ ] PM2 auto-start on reboot terverifikasi (`pm2 save` + reboot test)
- [ ] Monitoring uptime aktif + OpenAI usage limit terpasang
- [ ] Dokumen deploy diperbarui kalau ada langkah yang meleset dari plan

## Key Dates

| Tanggal | Event |
|---|---|
| Sen 15 Jun | Sprint start — kredensial + DNS + setup server |
| Sel 16 Jun | Deploy nginx + SSL + PM2 → app live |
| Rab 17 Jun | Mid-sprint check: smoke test selesai, keputusan scope P1/P2 |
| Jum 19 Jun | Sprint end — demo + retro singkat |

## Backlog Sprint 2 (kandidat, di luar scope)

CD otomatis (push → deploy), Redis untuk stats cache (prasyarat PM2 cluster), Cloudflare CDN/DDoS, rate limiting per-user di level app, halaman API keys (tabel `api_keys` sudah ada), lockfile (`package-lock.json`) untuk reproducible build, hapus `pnpm-lock.yaml` yang menyesatkan.
