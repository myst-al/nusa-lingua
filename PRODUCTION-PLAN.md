# NusaLingua — Production Deployment Plan (Nginx)

> Target: VPS Ubuntu 22.04 + domain sudah ada. Arsitektur: **nginx (TLS, static, rate-limit) → Express :3001 (PM2) → Supabase + OpenAI/Groq**.
> Estimasi total: ~60 menit. Tanggal: 2026-06-12.

---

## Arsitektur Production

```
Internet ── HTTPS :443 ──► nginx
                            ├─ /            → /var/www/nusalingua (React build, cache 1y)
                            └─ /api/*       → proxy 127.0.0.1:3001 (Express via PM2)
                                              ├─ SSE streaming chat (proxy_buffering off)
                                              ├─ Supabase Postgres (Drizzle, pool max 10)
                                              ├─ Supabase Auth (JWT verify)
                                              └─ OpenAI (voice realtime) / Groq (chat)
Browser ── WebRTC ──► OpenAI Realtime (langsung, pakai ephemeral token dari /api/voice/session)
```

Server Node **bind ke 127.0.0.1** di production (sudah difix) — hanya bisa diakses lewat nginx.

---

## Fase 0 — Pra-deploy (lokal, sudah selesai hari ini)

- [x] Audit kode + 13 bug fix (lihat `BUGFIX-REPORT.md`)
- [x] Typecheck + build verifikasi
- [ ] Commit & push semua perubahan ke repo Git Anda

```bash
git add -A && git commit -m "fix: production hardening + bug fixes" && git push
```

## Fase 1 — Persiapan kredensial (15 menit)

Ikuti `deploy/HOW-TO-GET-KEYS.md`. Checklist:

- [ ] Supabase project (region Singapore) → URL, anon key, service_role key, JWT secret, DATABASE_URL (mode Transaction/pgbouncer)
- [ ] OpenAI API key (restricted) + saldo ≥ $10 — wajib untuk fitur Voice
- [ ] (Opsional, rekomen) Groq API key gratis — chat jadi gratis, OpenAI hanya untuk voice
- [ ] DNS A record: `@` dan `www` → IP VPS (TTL 300). Verifikasi: `dig +short DOMAIN`
- [ ] Supabase Auth → URL Configuration: set **Site URL** = `https://DOMAIN` dan tambah `https://DOMAIN/**` ke Redirect URLs (kalau tidak, OAuth/email verif balik ke localhost)
- [ ] (Kalau pakai OAuth) Google/GitHub OAuth callback URL diarahkan ke domain production

## Fase 2 — Setup server (10 menit)

```bash
ssh user@VPS_IP
git clone <repo-url> ~/nusalingua-mvp && cd ~/nusalingua-mvp
chmod +x deploy/*.sh
./deploy/setup-server.sh    # Node 20, nginx, certbot, PM2, ufw, fail2ban, swap
```

Catatan: script ini reset UFW → allow hanya SSH + Nginx Full (80/443). Port 3001 TIDAK dibuka — memang by design.

## Fase 3 — Environment (5 menit)

```bash
./deploy/configure-env.sh
```

Wizard menanyakan Supabase, OpenAI, **Groq (baru, opsional)**, domain. Hasil: `.env` mode 600 + test koneksi DB & OpenAI otomatis.

## Fase 4 — Build + database (5 menit)

```bash
./deploy/build.sh      # npm install (root+server+client) + vite build + tsc
./deploy/db-setup.sh   # drizzle push schema + seed 8 bahasa
```

Verifikasi: Supabase Dashboard → Table Editor → ada tabel `languages, users, conversations, messages, bots, api_keys` dan `languages` berisi 8 baris.

## Fase 5 — Nginx + SSL (10 menit)

```bash
./deploy/setup-nginx.sh
```

Script akan: copy client build → `/var/www/nusalingua`, pasang `deploy/nginx.conf` (sudah difix: map `$connection_upgrade`, keepalive, rate-limit, SSE no-buffering, security headers, CSP), lalu jalankan certbot (HTTPS + redirect + HSTS + auto-renewal).

Verifikasi manual:

```bash
sudo nginx -t
curl -I https://DOMAIN            # 200, ada security headers
```

## Fase 6 — Start aplikasi (5 menit)

```bash
./deploy/start.sh    # PM2 start + save + startup systemd + health check
```

Verifikasi:

```bash
pm2 status                              # online
curl https://DOMAIN/api/health          # {"status":"ok",...}
ss -tlnp | grep 3001                    # bind 127.0.0.1:3001 (bukan 0.0.0.0)
```

## Fase 7 — Smoke test production (10 menit)

| # | Test | Ekspektasi |
|---|---|---|
| 1 | Buka `https://DOMAIN` | Landing tampil, stats terisi |
| 2 | Signup email + verifikasi | Email masuk, link balik ke domain production |
| 3 | Login → buat percakapan bahasa Jawa → kirim pesan | Balasan streaming muncul bertahap (SSE jalan) |
| 4 | Voice: mulai sesi, bicara | Transkrip live + AI menjawab via audio |
| 5 | Studio: buat bot → Simpan → edit → Simpan Perubahan | Tidak ada error 400 (bug description sudah difix) |
| 6 | Explorer tanpa login → klik bahasa | Redirect ke /login (bukan gagal diam-diam) |
| 7 | Kirim pesan lalu tutup tab di tengah streaming | `pm2 logs` tidak menunjukkan stream lanjut berjalan lama |
| 8 | `curl -s -o /dev/null -w "%{http_code}" http://VPS_IP:3001/api/health` dari luar | Timeout/refused (port tertutup) |

## Fase 8 — Operasional

**Update/redeploy:**
```bash
cd ~/nusalingua-mvp && ./deploy/update.sh   # pull + rebuild + rsync + pm2 reload
```

**Monitoring rutin:**
```bash
pm2 monit                                   # CPU/RAM live
pm2 logs nusalingua-server --lines 100
sudo tail -f /var/log/nginx/nusalingua.error.log
sudo certbot renew --dry-run                # cek auto-renewal SSL
```

**Rollback:** `git checkout <commit-sebelumnya> && ./deploy/update.sh` (build ulang dari commit lama). DB schema additive (drizzle push) — hindari drop kolom tanpa backup.

**Backup:** Supabase free tier punya daily backup 7 hari. Untuk ekstra: `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql` via cron mingguan.

---

## Estimasi biaya bulanan

| Item | Biaya |
|---|---|
| VPS 2 vCPU/2GB (sudah ada) | ~$6–12 / Rp100–200rb |
| Supabase Free (500MB DB, 50k MAU auth) | $0 |
| Groq (chat Llama 3.3 70B) | $0 (free tier) |
| OpenAI — chat gpt-4o-mini (kalau dipakai) | ~$0.15–0.60 per 1jt token |
| OpenAI — voice realtime | ~$0.06/mnt in + $0.24/mnt out (komponen termahal — pantau!) |
| Domain + SSL (Let's Encrypt) | domain saja, SSL $0 |

Rekomendasi: set **Usage limit** di OpenAI dashboard (mis. $20/bulan) supaya voice tidak bisa membengkak tanpa batas.

## Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Biaya voice membengkak | OpenAI usage limit + rate limit nginx `/api/voice/session` (sudah ada, 5r/s) + ephemeral token 60 detik |
| Spam chat | Rate limit `/api/` 30r/s per IP (nginx) + history limit 20 pesan (fix baru) |
| Supabase free tier limit (500MB / pause 7 hari idle) | Pantau usage di dashboard; upgrade Pro ($25) saat traffic nyata |
| RAM 1GB sempit saat build Vite | setup-server.sh sudah auto-buat swap 2GB; alternatif: build di CI lalu rsync |
| Secret bocor | `.env` mode 600, tidak di-git (sudah diverifikasi); service_role key hanya di server |

## Next steps (pasca-launch, opsional)

1. CI/CD: GitHub Actions → SSH deploy otomatis saat push ke `main`
2. Uptime monitoring gratis (UptimeRobot/BetterStack) ke `/api/health`
3. Error tracking (Sentry) di client + server
4. PM2 cluster mode (`instances: "max"`) saat traffic naik — stats cache per-proses perlu dipindah ke Redis kalau >1 instance
5. CDN (Cloudflare) di depan nginx untuk cache static + proteksi DDoS
