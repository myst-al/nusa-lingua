# 🔑 Panduan Dapatkan Semua Secret Keys

> Step-by-step ambil credential dari OpenAI, Supabase, Google OAuth, GitHub OAuth. Estimasi total: **30–45 menit**.

---

## Checklist apa yang akan kamu dapatkan

Setelah selesai panduan ini, kamu akan punya 12 credential di `.env`:

| # | Variable | Untuk apa | Pricing |
|---|---|---|---|
| 1 | `OPENAI_API_KEY` | Chat GPT-4o + Voice Realtime | Pay-as-you-go ($10 min top-up) |
| 2 | `SUPABASE_URL` | Database + Auth endpoint | Free tier (500MB DB, 50K MAU) |
| 3 | `SUPABASE_ANON_KEY` | Public client key | (sama) |
| 4 | `SUPABASE_SERVICE_ROLE_KEY` | Admin key (server-only) | (sama) |
| 5 | `SUPABASE_JWT_SECRET` | Verify JWT di server | (sama) |
| 6 | `DATABASE_URL` | Postgres connection string | (sama) |
| 7 | `VITE_SUPABASE_URL` | Mirror untuk client build | (sama) |
| 8 | `VITE_SUPABASE_ANON_KEY` | Mirror untuk client build | (sama) |
| 9 | Google OAuth Client ID | "Sign in with Google" button | Gratis |
| 10 | Google OAuth Client Secret | (sama) | Gratis |
| 11 | GitHub OAuth Client ID | "Sign in with GitHub" button | Gratis |
| 12 | GitHub OAuth Client Secret | (sama) | Gratis |

---

# 1️⃣ OpenAI API Key (paling penting)

**Yang akan kamu pakai untuk:** Chat AI streaming (`GPT-4o-mini`), Voice Realtime WebRTC (`gpt-4o-realtime-preview`).

### Langkah

1. Buka **https://platform.openai.com/signup** → daftar (atau login kalau sudah punya).
   - **Tip**: pakai email kantor/utama, jangan email throwaway — billing setup butuh verifikasi.

2. **Verifikasi nomor HP** (wajib). Setiap nomor cuma bisa dipakai 1x untuk freebie.

3. Masuk ke **Settings → Billing**:
   - https://platform.openai.com/settings/organization/billing/overview
   - Klik **"Add payment method"** → masukkan kartu kredit/debit (Visa/Mastercard/JCB).
   - Klik **"Add to credit balance"** → top-up minimal **$10**.
   - Centang **"Enable auto recharge"** kalau mau otomatis isi ulang saat saldo habis.

4. Masuk ke **API Keys**:
   - https://platform.openai.com/api-keys
   - Klik **"Create new secret key"**.
   - **Name**: `nusalingua-prod`
   - **Permissions**: pilih **"Restricted"** (lebih aman) lalu allow:
     - `Models` → Read
     - `Model capabilities` → Write
   - Klik **Create** → **COPY KEY SEKARANG** (mulai `sk-proj-...` atau `sk-...`).
   - ⚠️ **Key cuma tampil sekali!** Kalau hilang, harus revoke & buat baru.

5. Paste ke `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-AbCdEf123456...
   OPENAI_CHAT_MODEL=gpt-4o-mini
   OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
   ```

### 💰 Estimasi biaya bulanan

| Penggunaan | Volume | Biaya |
|---|---|---|
| Chat (gpt-4o-mini) | 5M token | ~$0.75 (~Rp 12K) |
| Voice realtime | 100 menit total | ~$30 (~Rp 480K) |
| **Total realistic** | Light usage | **~$5–10/bln** |

**Tip menghemat:**
- Pakai `gpt-4o-mini` (cukup bagus untuk Bahasa Indonesia + bahasa daerah, jauh lebih murah)
- Set rate limit di nginx (sudah ada di config kita)
- Cache common queries pakai Redis kalau scale

---

# 2️⃣ Supabase (Database + Auth)

**Yang akan kamu pakai untuk:** PostgreSQL database, user authentication (email/password + OAuth), JWT.

### Langkah

1. Buka **https://supabase.com** → klik **"Start your project"** → login pakai **GitHub** (paling cepat) atau email.

2. Klik **"New project"**:
   - **Name**: `nusalingua`
   - **Database Password**: klik 🎲 generate, **SIMPAN PASSWORD INI** (mis. di password manager).
   - **Region**: **Southeast Asia (Singapore)** — paling dekat ke Indonesia.
   - **Pricing Plan**: **Free** (cukup untuk MVP, 500MB database + 50K MAU + 2GB bandwidth).
   - Klik **"Create new project"** → tunggu 2 menit.

3. Setelah ready, masuk ke **Settings (gear icon di sidebar) → API**:
   - URL: `https://supabase.com/dashboard/project/<your-project-id>/settings/api`
   - Copy 3 nilai:

   | Field di Supabase | Variable .env |
   |---|---|
   | **Project URL** | `SUPABASE_URL` & `VITE_SUPABASE_URL` |
   | **Project API keys → `anon` `public`** | `SUPABASE_ANON_KEY` & `VITE_SUPABASE_ANON_KEY` |
   | **Project API keys → `service_role` `secret`** ⚠️ | `SUPABASE_SERVICE_ROLE_KEY` |

   ⚠️ **`service_role` key HARUS RAHASIA** — jangan masuk ke client/git. Cuma server yang pakai.

4. Masih di **Settings**, klik **JWT Settings** (sub-tab):
   - Copy **JWT Secret** → `SUPABASE_JWT_SECRET`

5. Masuk ke **Settings → Database**:
   - URL: `https://supabase.com/dashboard/project/<your-project-id>/settings/database`
   - Scroll ke **"Connection string"** → pilih tab **URI**.
   - Pilih mode **"Transaction"** (untuk Drizzle/PgBouncer):
   ```
   postgres://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
   - **GANTI `[YOUR-PASSWORD]`** dengan password database yang di-generate di step 2.
   - Hasilnya → `DATABASE_URL`

6. Paste ke `.env`:
   ```env
   DATABASE_URL=postgres://postgres.abcdefg:YOUR_REAL_PW@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   SUPABASE_URL=https://abcdefg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_JWT_SECRET=super-secret-jwt-string-from-jwt-settings
   VITE_SUPABASE_URL=https://abcdefg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

### Test koneksi cepat

```bash
# Test database
psql "$DATABASE_URL" -c "SELECT current_database();"

# Test API
curl "https://abcdefg.supabase.co/rest/v1/" \
  -H "apikey: YOUR_ANON_KEY"
```

---

# 3️⃣ Google OAuth (Sign in with Google)

**Yang akan kamu pakai untuk:** tombol "Lanjut dengan Google" di halaman login.

### Langkah

1. Buka **https://console.cloud.google.com** → login pakai akun Google.

2. **Buat project baru:**
   - Klik dropdown project di top bar → **"New Project"**.
   - **Name**: `NusaLingua`
   - Klik **Create** → tunggu 30 detik.

3. Aktifkan **People API** (wajib untuk OAuth):
   - URL: https://console.cloud.google.com/apis/library/people.googleapis.com
   - Klik **Enable**.

4. **Setup OAuth Consent Screen** (wajib sebelum bisa bikin OAuth client):
   - URL: https://console.cloud.google.com/apis/credentials/consent
   - Pilih **"External"** → **Create**.
   - Isi:
     - **App name**: `NusaLingua`
     - **User support email**: email kamu
     - **App logo**: optional (200x200 PNG)
     - **App domain → Application home page**: `https://nusalingua.id` (domain produksi kamu)
     - **Authorized domains**: tambah `nusalingua.id` dan `supabase.co`
     - **Developer contact**: email kamu
   - **Scopes**: pilih `email`, `profile`, `openid`.
   - **Test users** (kalau App Status masih "Testing"): tambah email kamu sendiri untuk uji coba.
   - **Save**.

5. **Buat OAuth Client ID:**
   - URL: https://console.cloud.google.com/apis/credentials
   - Klik **"Create Credentials" → "OAuth client ID"**.
   - **Application type**: **Web application**
   - **Name**: `NusaLingua Web`
   - **Authorized JavaScript origins**: tambah:
     - `https://nusalingua.id` (atau domain prod kamu)
     - `http://localhost:5173` (untuk dev)
   - **Authorized redirect URIs**: tambah **callback URL dari Supabase** (PENTING!):
     ```
     https://abcdefg.supabase.co/auth/v1/callback
     ```
     (ganti `abcdefg` dengan project ref kamu)
   - Klik **Create**.
   - Modal akan tampil **Client ID** + **Client Secret** → **COPY DUA-DUANYA**.

6. **Connect ke Supabase:**
   - Masuk Supabase Dashboard → **Authentication → Providers** (di sidebar).
   - Cari **Google** → toggle **Enable**.
   - Paste:
     - **Client ID (for OAuth)** → dari step 5
     - **Client Secret (for OAuth)** → dari step 5
   - Klik **Save**.

### Test

Buka `https://nusalingua.id/login` → klik **"Lanjut dengan Google"** → harus redirect ke consent screen Google → setelah authorize, balik ke `/chat`.

---

# 4️⃣ GitHub OAuth (Sign in with GitHub)

**Yang akan kamu pakai untuk:** tombol "Lanjut dengan GitHub" di halaman login.

### Langkah

1. Login ke **https://github.com** → klik foto profile (kanan atas) → **Settings**.

2. Di sidebar kiri, scroll ke paling bawah → **Developer settings**.

3. Klik **OAuth Apps** → **"New OAuth App"**.

4. Isi:
   - **Application name**: `NusaLingua`
   - **Homepage URL**: `https://nusalingua.id` (domain prod kamu)
   - **Application description**: `Platform LLM multibahasa Nusantara` (opsional)
   - **Authorization callback URL** (PENTING!):
     ```
     https://abcdefg.supabase.co/auth/v1/callback
     ```
     (ganti `abcdefg` dengan Supabase project ref kamu)

5. Klik **"Register application"**.

6. Halaman berikutnya tampil **Client ID** — copy.

7. Klik **"Generate a new client secret"** → COPY (cuma muncul sekali).

8. **Connect ke Supabase:**
   - Supabase Dashboard → **Authentication → Providers**.
   - Cari **GitHub** → toggle **Enable**.
   - Paste **Client ID** + **Client Secret**.
   - **Save**.

### Test

Buka `https://nusalingua.id/login` → klik **"Lanjut dengan GitHub"** → authorize → balik ke `/chat`.

---

# 5️⃣ Final: Pasang Semua ke `.env`

Setelah punya semua key, jalankan wizard interactive:

```bash
cd ~/nusalingua-mvp
./deploy/configure-env.sh
```

Wizard akan nanya satu-satu, validasi format, dan auto-generate session secret. File `.env` dibikin dengan permission `600` (cuma owner bisa baca).

**Atau manual:** copy `.env.example` ke `.env` lalu isi semua nilai.

---

# 📋 Checklist Akhir

Sebelum deploy, verify:

- [ ] OpenAI API key valid + saldo ≥ $10
  - Test: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"` → harus 200
- [ ] Supabase project running (status: Active hijau)
- [ ] Database connection string valid
  - Test: `psql "$DATABASE_URL" -c "SELECT 1;"` → harus return 1
- [ ] Schema sudah di-push: `npm --prefix server run db:push`
- [ ] 8 bahasa sudah di-seed: cek di Supabase Dashboard → Table Editor → `languages`
- [ ] Google OAuth callback URL = `https://<project>.supabase.co/auth/v1/callback`
- [ ] GitHub OAuth callback URL = sama
- [ ] Domain `nusalingua.id` (atau apapun) pointing A record ke IP VPS
- [ ] Port 80 + 443 terbuka di firewall

---

# 🚨 Troubleshooting

### "Invalid OAuth redirect URL"
Callback URL di Google/GitHub harus **persis sama** dengan yang Supabase berikan (`https://<ref>.supabase.co/auth/v1/callback`). Cek tidak ada trailing slash atau typo.

### "OpenAI 401 Unauthorized"
- Key sudah revoked? Cek di https://platform.openai.com/api-keys
- Saldo habis? Top-up di Billing
- Permission key tidak include `Models`? Buat ulang dengan "All" untuk debug

### "Supabase connection refused"
- IP server tidak di-whitelist? Cek **Settings → Database → Network Restrictions** — kalau aktif, allow IP server kamu (atau set ke `0.0.0.0/0` sementara untuk debug).

### Voice WebRTC stuck di "Connecting..."
- HTTPS aktif? Browser block `getUserMedia` di HTTP non-localhost.
- OpenAI Realtime model masih di **preview/beta** — pastikan org kamu punya akses (kalau perlu, request di developer.openai.com).
- CSP header allow `https://api.openai.com`? (Sudah di-set di `deploy/nginx.conf`)

---

# 💸 Total Biaya Bulanan (Estimasi)

| Komponen | Provider | Biaya/bulan |
|---|---|---|
| OpenAI (chat + voice ringan) | OpenAI | $5–10 (~Rp 80–160K) |
| Supabase Free tier | Supabase | Rp 0 |
| Google OAuth | Google Cloud | Rp 0 |
| GitHub OAuth | GitHub | Rp 0 |
| VPS Ubuntu 22.04 (2vCPU/4GB) | Hetzner CX22 | Rp 70K |
| Domain `.id` | Namecheap/PANDI | Rp 50K (avg) |
| **Total** | | **~Rp 200–280K/bulan** |

---

# 🔒 Best Practice Keamanan

1. **Jangan commit `.env`** ke git (sudah di `.gitignore`).
2. **Rotate OpenAI key tiap 90 hari** — set reminder di kalender.
3. **Setup OpenAI usage limits** di https://platform.openai.com/settings/organization/limits supaya tidak overspend.
4. **Enable 2FA** di Google + GitHub + Supabase + OpenAI accounts.
5. **Set up billing alerts** di OpenAI (Settings → Limits → Email alerts).
6. **Backup database** Supabase rutin (Dashboard → Database → Backups, free tier 7 days retention).

---

Selesai! Total waktu setup ~30–45 menit kalau lancar. Kalau stuck, screenshot error-nya dan kasih ke saya — saya bantu debug.
