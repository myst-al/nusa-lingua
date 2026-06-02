# 🚀 NusaLingua — Deployment Guide

> Ubuntu 22.04 LTS + Nginx + PM2 + Let's Encrypt SSL.
> Estimasi waktu setup: **45 menit** (asumsi domain + akun Supabase/OpenAI sudah ada).

---

## Prasyarat

| Item | Spec minimum | Rekomendasi |
|---|---|---|
| **VPS Ubuntu 22.04** | 1 vCPU / 1 GB RAM | 2 vCPU / 2 GB RAM (Hetzner CX22, DigitalOcean Basic 2GB) |
| **Domain** | 1 domain (`.id`, `.com`, dll) | Pointing A record ke IP VPS |
| **Akun Supabase** | Free tier OK | https://supabase.com |
| **Akun OpenAI** | Saldo min $10 | https://platform.openai.com |
| **SSH access** | Sudah bisa SSH ke server | User non-root dengan sudo |

---

## Step 1 — Akuisisi semua API Key (15 menit)

Sebelum SSH ke server, dapatkan dulu credentials berikut.

### 1.1 Supabase

1. Buka https://supabase.com → **Sign up / Login** (pakai GitHub paling cepat).
2. Klik **New Project**.
3. Isi:
   - **Name**: `nusalingua`
   - **Database Password**: generate strong password (simpan!)
   - **Region**: `Southeast Asia (Singapore)` atau `Northeast Asia (Tokyo)`
   - **Pricing Plan**: Free
4. Tunggu provisioning ~2 menit.
5. Setelah ready, masuk **Settings (gear icon) → API**:

   | Field di .env | Lokasi di Supabase |
   |---|---|
   | `SUPABASE_URL` / `VITE_SUPABASE_URL` | "Project URL" |
   | `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | "Project API keys → anon public" |
   | `SUPABASE_SERVICE_ROLE_KEY` | "Project API keys → service_role" ⚠️ RAHASIA |
   | `SUPABASE_JWT_SECRET` | "JWT Settings → JWT Secret" |

6. Masuk **Settings → Database → Connection string → URI** (mode "Transaction"):
   - Copy yang ada `?pgbouncer=true` di akhir, ganti `[YOUR-PASSWORD]` dengan password DB yang tadi → ini `DATABASE_URL`

7. (Opsional) Untuk OAuth Google/GitHub:
   - **Authentication → Providers → Google** → enable, isi client ID/secret dari https://console.cloud.google.com
   - **Authentication → Providers → GitHub** → enable, isi dari https://github.com/settings/developers

### 1.2 OpenAI

1. Buka https://platform.openai.com/api-keys → **Create new secret key**.
2. Beri nama: `nusalingua-prod`.
3. Permission: pilih **Restricted**, allow:
   - `Models` (read)
   - `Model capabilities` (write)
4. Copy key (mulai `sk-proj-...` atau `sk-...`) — **tidak bisa dilihat lagi!**
5. **Settings → Billing → Add to credit balance** → top-up min **$10**.

### 1.3 Domain DNS

Pointing `A record` domain ke IP VPS:

```
Type: A
Name: @ (atau "nusalingua")
Value: <IP-VPS-kamu>
TTL: 300
```

Tunggu 5–30 menit propagasi. Verify: `dig nusalingua.id` (atau pakai https://dnschecker.org).

---

## Step 2 — Server Setup (5 menit, otomatis)

SSH ke server, lalu:

```bash
# Clone repo
git clone <your-repo-url> ~/nusalingua-mvp
cd ~/nusalingua-mvp

# Bikin semua script executable
chmod +x deploy/*.sh

# Jalankan setup otomatis (install Node 20, nginx, certbot, PM2, ufw, fail2ban)
./deploy/setup-server.sh
```

Script ini install: Node.js 20 LTS, Nginx, certbot, PM2, ufw firewall, fail2ban, swap (kalau RAM < 2GB).

---

## Step 3 — Configure Environment (5 menit, interactive)

```bash
./deploy/configure-env.sh
```

Wizard interactive nanya credentials satu-per-satu. Akan:
- Generate `.env` dengan mode `600` (owner only)
- Auto-generate `APP_SESSION_SECRET` (32 byte random)
- Test koneksi Supabase + OpenAI sebelum lanjut

---

## Step 4 — Build & Database (3 menit)

```bash
# Install dependencies + build client + build server
./deploy/build.sh

# Push schema ke Supabase + seed 8 bahasa daerah
./deploy/db-setup.sh
```

Verify di Supabase Dashboard → **Table Editor**: harus muncul tabel `languages`, `users`, `conversations`, `messages`, `bots`, `api_keys`.

---

## Step 5 — Nginx + SSL (10 menit)

```bash
./deploy/setup-nginx.sh
```

Wizard nanya:
- Domain utama (mis. `nusalingua.id`)
- Subdomain `www`? (y/n)
- Email untuk Let's Encrypt renewal notif

Auto: install nginx config, generate SSL cert via certbot, setup auto-renewal.

**Verifikasi:**
- `https://nusalingua.id` → harus tampil React app
- HTTPS otomatis (HTTP redirect ke HTTPS)

---

## Step 6 — Start Server (1 menit)

```bash
./deploy/start.sh
```

Auto: start Node server via PM2, setup auto-start on reboot, test health endpoint.

**Verifikasi:**

```bash
# Status process
pm2 status

# Live logs
pm2 logs nusalingua-server

# Hit health
curl https://nusalingua.id/api/health
```

---

## 🎉 Selesai!

| URL | Fungsi |
|---|---|
| `https://nusalingua.id` | Frontend (React) |
| `https://nusalingua.id/api/health` | Backend health check |
| `https://nusalingua.id/chat` | Chat AI (perlu login) |
| `https://nusalingua.id/voice` | Voice AI WebRTC (perlu HTTPS — sudah ✓) |
| `https://nusalingua.id/studio` | No-code chatbot builder |

---

## Operasi Sehari-hari

### Update kode

```bash
cd ~/nusalingua-mvp
./deploy/update.sh    # git pull + rebuild + reload PM2
```

### Lihat log

```bash
# Server logs (Node)
pm2 logs nusalingua-server

# Nginx access
sudo tail -f /var/log/nginx/nusalingua.access.log

# Nginx error
sudo tail -f /var/log/nginx/nusalingua.error.log
```

### Restart

```bash
pm2 restart nusalingua-server   # restart Node
sudo systemctl reload nginx     # reload Nginx config tanpa downtime
```

### Stop / Start

```bash
pm2 stop nusalingua-server
pm2 start nusalingua-server
```

### Monitoring

```bash
pm2 monit          # interactive CPU/RAM monitor
htop               # system overall
sudo nginx -t      # test nginx config valid
```

---

## Troubleshooting

### ❌ "502 Bad Gateway" di Nginx

Node server tidak jalan / port salah.
```bash
pm2 status         # cek status
pm2 logs nusalingua-server --lines 50
curl http://localhost:3001/api/health   # langsung hit backend
```

### ❌ Database connection refused

- Cek `DATABASE_URL` di `.env` — password benar?
- Supabase: **Settings → Database → Network Restrictions** — kalau aktif, whitelist IP server.

### ❌ Voice WebRTC tidak jalan

- Pastikan HTTPS aktif (browser block `getUserMedia` di HTTP non-localhost).
- Cek CSP header di nginx.conf: `connect-src` harus include `https://api.openai.com`.
- Console browser → cek error spesifik.

### ❌ SSE chat tidak streaming (tunggu lama lalu muncul sekaligus)

- Pastikan `proxy_buffering off;` di nginx.conf — di Step 5 sudah set.
- Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`

### ❌ OpenAI rate limit / "Insufficient quota"

- Top-up di https://platform.openai.com/settings/organization/billing
- Cek penggunaan: https://platform.openai.com/usage

---

## Security Checklist

- [ ] `.env` mode `600` (otomatis dari wizard)
- [ ] Firewall UFW aktif (otomatis dari setup-server.sh)
- [ ] SSL aktif + auto-renewal (otomatis dari setup-nginx.sh)
- [ ] HSTS header aktif (otomatis dari certbot --hsts)
- [ ] Rate limiting Nginx (sudah di nginx.conf)
- [ ] fail2ban aktif (auto-block IP brute force SSH)
- [ ] Automatic security updates (otomatis dari setup-server.sh)
- [ ] SSH key-only authentication — **manual**: edit `/etc/ssh/sshd_config`, set `PasswordAuthentication no`
- [ ] Rotate API keys tiap 90 hari — set reminder di kalender

---

## Cost Estimate (Production)

| Komponen | Provider | Biaya/bulan |
|---|---|---|
| VPS 2vCPU/2GB | Hetzner CX22 | €4 (~Rp 70K) |
| Domain `.id` | PANDI registrar | Rp 50K/bulan |
| Supabase | Supabase | Free (sampai 500MB DB + 50K MAU) |
| SSL | Let's Encrypt | Free |
| OpenAI (~5M token/bln) | OpenAI | ~$10 (~Rp 160K) |
| **Total** | | **~Rp 280K/bulan** |

Lebih murah dari kopi 2x seminggu, tapi sudah production-ready dengan SSL + monitoring. 🚀
