# 01 — Analisis Proyek NusaLingua (Kondisi Nyata)

> Audit berbasis kode aktual (`server/src`, `client/src`, `shared/`, git history 46 commit, Juni 2026). Tujuannya: memisahkan **yang benar-benar ada** dari **yang baru wacana**, supaya proposal & demo Anda tahan uji juri.

---

## 1. Apa itu NusaLingua — dalam 3 kalimat

**(ID)** NusaLingua adalah **platform AI percakapan multibahasa Nusantara** yang menyatukan chat teks, suara realtime, terjemahan, dan pembuat chatbot no-code dalam satu aplikasi. Secara teknis ia adalah **lapisan aplikasi & orkestrasi** di atas LLM berdaulat Indonesia/ASEAN (**SEA-LION / Sahabat-AI**), dengan kendali **tingkat tutur budaya** (krama/ngoko, lemes/loma) sebagai pembeda utama. Sasarannya: UMKM, Pemda, dan developer yang ingin melayani warga/pelanggan dalam bahasa ibu mereka, 24/7, tanpa menambah staf.

**(EN one-liner)** _The culture-aware application layer for Indonesian-language AI — chat, voice, translate, and a no-code studio on top of sovereign LLMs._

---

## 2. Arsitektur nyata (verified)

```
┌────────────────────────────────────────────────────────────────────┐
│  CLIENT — React 18 + Vite + TS + Tailwind + TanStack Query (:6101)  │
│  Pages: Landing · Explorer · Chat · Voice · Studio · Translate ·    │
│         Pricing · Login · NotFound                                  │
└───────────────┬───────────────────────────────┬────────────────────┘
                │ REST + SSE (Bearer JWT)        │ WebRTC (ephemeral token)
                ▼                                 ▼
┌──────────────────────────────────┐   ┌───────────────────────────────┐
│ SERVER — Node + Express + TS      │   │ OpenAI Realtime API           │
│ (:6100, Zod, jose JWT)            │   │ gpt-4o-realtime-preview        │
│ Routes: health, stats, languages, │   │ (voice bi-directional)         │
│ conversations, messages(SSE),     │   └───────────────────────────────┘
│ bots, voice, translate, me, trial │
│ Provider auto-select ▼            │
│   1. SEA-LION (default)  ── aisingapore/Llama-SEA-LION-v3-70B-IT      │
│   2. Groq (fallback)     ── llama-3.3-70b-versatile                   │
│   3. OpenAI (fallback)   ── gpt-4o-mini (chat) / realtime (voice)     │
└───────────────┬──────────────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────┐
│ Supabase — PostgreSQL + Auth      │
│ Drizzle ORM. Tabel: users,        │
│ languages, conversations,         │
│ messages, bots, api_keys          │
└──────────────────────────────────┘
```

**Poin kunci arsitektur (jadi bahan bagian "System Architecture" proposal):**

- **Multi-provider OpenAI-compatible** → bisa ganti model (SEA-LION↔Groq↔OpenAI) tanpa ubah kode streaming. Ini strength nyata: **tidak vendor lock-in**, dan bisa arahkan ke model **berdaulat** kapan pun.
- **Ephemeral token voice** → kunci OpenAI tidak pernah ke browser; token 60 detik. Security best-practice yang benar.
- **SSE streaming + abort on disconnect** → hemat biaya token saat user tutup tab.
- **JWT diverifikasi 2 mode** (HS256 cepat / asymmetric+JWKS) → kompatibel Supabase lama & baru.

---

## 3. Matriks kondisi fitur (dari inventaris kode)

| Fitur                        | Status            | Bukti / Catatan                                                                                        |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| Chat teks (SSE streaming)    | ✅ **100%**       | `POST /api/conversations/:id/messages`, delta SSE, auto-title, history 20 pesan, register halus/santai |
| Voice realtime (WebRTC)      | ✅ **100%**       | `POST /api/voice/session` → OpenAI Realtime; transcript live; mute; VAD server                         |
| Voice "Mode Hemat" (gratis)  | ✅ **100%**       | `POST /api/voice/reply` + Web Speech API browser (STT/TTS) — **biaya ~Rp0**                            |
| Terjemahan                   | ✅ **100%**       | `POST /api/translate`, auto-detect sumber, temperature 0.3                                             |
| Studio no-code (UI)          | ✅ **100%**       | 3-panel, 6 tipe node, properties panel, save/publish/archive                                           |
| Studio (eksekusi node/flow)  | ❌ **0%**         | Node disimpan di JSONB tapi **belum dieksekusi**; chat hanya pakai `systemPrompt`                      |
| Auth (Supabase JWT)          | ✅ **100%**       | Auto-upsert user saat login pertama; ownership check di query                                          |
| Katalog bahasa               | ✅ **100%**       | ~108 bahasa ter-seed; 8 core prompt budaya; ±4 "live"                                                  |
| Explorer bahasa              | ✅ **100%**       | Grid + search + badge status; CTA "Mulai Chat"                                                         |
| Pricing page + Trial 14 hari | ✅ **UI 100%**    | `GET /api/me`, `POST /api/trial/start` (idempoten)                                                     |
| Stats publik                 | ✅ **100%**       | `GET /api/stats`, cache 60s, query paralel                                                             |
| Billing / enforcement kuota  | ❌ **0%**         | Tidak ada Stripe/Xendit; kuota tidak dipaksakan                                                        |
| API keys (developer)         | ❌ **0%**         | Skema `api_keys` ada; **belum ada endpoint** penerbitan/manajemen                                      |
| Rate limiting (app-level)    | ⚠️ **infra saja** | Ada di rencana Nginx; belum di level aplikasi                                                          |
| Deploy WhatsApp/Telegram bot | ❌ **0%**         | Node `trigger` menyebut channel; webhook belum ada                                                     |

**Kesimpulan jujur untuk "Current Status":** _Prototype → mendekati Pilot_. Fitur inti (chat, voice, translate, studio-UI) **berfungsi live**; lapisan komersial (billing, API keys, kuota) adalah pekerjaan 6 bulan berikutnya.

---

## 4. Data & bahasa (bahan bagian "Data & Feasibility")

- **Sumber jawaban AI**: model SEA-LION/Sahabat-AI (dilatih AI Singapore + konsorsium Indonesia GoTo/Indosat untuk Sahabat-AI) — **bukan** korpus yang kita kumpulkan sendiri. Ini realistis & legal untuk MVP.
- **Konteks budaya**: di-inject lewat **system prompt per bahasa** (bukan fine-tuning). 8 bahasa punya prompt kurasi:
  - **Live**: Indonesia (`id`), Jawa (`jv`, default _krama alus_), Sunda (`su`, default _basa lemes_), Batak Toba (`bbc`, konteks marga/adat).
  - **Beta**: Bugis (`bug`, nilai _siri'/pesse_), Dayak Ngaju (`day`).
  - **Soon**: Minang (`min`), Bali (`ban`, tiga tingkat _alus singgih/madya/ketah_).
  - **+100 bahasa** regional ter-seed status "soon" dengan prompt template.
- **Data pengguna**: percakapan & pesan disimpan di Supabase Postgres (region Singapore untuk MVP; roadmap ke DC Indonesia untuk B2G). Cascade delete saat user dihapus → dukung hak "penghapusan" UU PDP.
- **Kualitas & keandalan**: kekuatan tertinggi di **Indonesia/Jawa/Sunda** (data digital melimpah); **risiko** di bahasa _tail_ (Bugis, Dayak, Papua) yang datanya langka → mitigasi lewat loop kontribusi native speaker (Fase 2–3).

---

## 5. Keamanan & kepatuhan (bahan bagian "Security & Compliance")

Yang **sudah** di kode/rencana:

- Ephemeral token voice (kunci tak bocor ke klien); `.env` mode 600; service_role hanya di server.
- JWT verify; ownership check per-resource (isolasi antar-user teruji 4/4 assertion).
- TLS 1.3 (Let's Encrypt), security headers + CSP (Nginx), rate-limit Nginx, bind `127.0.0.1` di prod.
- CI: secret scanning (gitleaks), npm audit, CodeQL/Semgrep (nightly).
- Cascade delete = dukungan hak subjek data UU PDP.

Yang masih **roadmap** (jangan diklaim sudah punya): sertifikasi ISO 27001, ITSE BSSN, DPO, SOC 2, penetration test — semua sudah terjadwal di `docs/strategy/TRUST-COMPLIANCE.md` (Q2–Year 2). **Framing yang benar**: _"compliance-by-design, roadmap sertifikasi jelas"_ — bukan _"sudah tersertifikasi"_.

---

## 6. Pemetaan ke Problem Statement PIDI DIGDAYA 2026 🎯

Dari template (halaman "problem statements"), ada **3 tema besar**. NusaLingua masuk **Tema 3**.

### Problem Statement yang dipilih

**#3 — Percepatan Layanan Publik, Ekonomi Kreatif, dan Ekspor Jasa Digital**

### Sub-Problem Statement (boleh >1) — pilih yang paling nyambung:

> **Digitalisasi Ekspor Layanan Digital →**
>
> - **#4 Otomatisasi Layanan Pelanggan Multibahasa** ✅ _(inti produk: chatbot/voice CS bahasa daerah)_
> - **#5 Local Language AI (LLM)** ✅ _(platform AI bahasa lokal + API untuk developer)_

**Sub-problem sekunder yang bisa disebut (memperkuat dampak nasional):**

> - Tema 3 → **Digitalisasi Layanan Publik & Pariwisata** (chatbot Pemda, personalisasi pariwisata dalam bahasa lokal)
> - Tema 3 → **Digitalisasi Museum & Warisan Budaya / Nasionalisme & Edukasi** (pelestarian bahasa daerah = warisan budaya digital)
> - Tema 2 → **Inklusi Ekonomi (UMKM)** (CS UMKM otomatis) — bila ingin menonjolkan sisi UMKM.

### Kenapa cocok (logika yang dinilai juri)

| Kriteria tema DIGDAYA               | Kontribusi NusaLingua                                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Ekspor jasa digital**             | API "Local Language AI" yang bisa dijual ke pasar ASEAN (bahasa serumpun: Malaysia, Brunei, diaspora) — devisa jasa digital. |
| **Otomatisasi CS multibahasa**      | Chatbot & voice yang melayani pelanggan dalam bahasa daerah — persis sub-problem #4.                                         |
| **Kedaulatan AI (Perpres 68/2024)** | Ditenagai LLM Indonesia/ASEAN (SEA-LION/Sahabat-AI), opsi on-prem, data di Indonesia.                                        |
| **Inklusi & pemerataan**            | 270 juta penduduk, 700+ bahasa; penutur bahasa daerah tak lagi harus tunduk ke bahasa mayoritas.                             |
| **Ekonomi kreatif**                 | Content creator berbahasa daerah, digitalisasi warisan budaya (unggah-ungguh).                                               |

---

## 7. Analisis kompetitif ringkas (bahan "Innovation & Differentiation")

| Alternatif                               | Kelemahannya untuk kasus ini                                                                        | Posisi NusaLingua                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **OpenAI / Google / Anthropic**          | Krama/ngoko sering salah; bahasa daerah minor campur Inggris; data ke luar negeri; mahal saat skala | Lebih paham unggah-ungguh; data bisa di Indonesia; lebih murah untuk tugas bahasa lokal |
| **Google Translate**                     | Terjemahan harfiah, tanpa tingkat tutur/konteks                                                     | Percakapan + tingkat tutur + suara, bukan sekadar translate                             |
| **SEA-LION / Sahabat-AI (mentah)**       | Model bagus tapi **bukan produk** — tak ada UI, no-code, voice, register control, distribusi        | Kita **membungkusnya jadi produk** — application layer di atasnya                       |
| **Chatbot vendor BUMN (existing Pemda)** | Resolution rate <40%, hanya Bahasa Indonesia formal, kaku                                           | Bahasa daerah natural + no-code + compliance lokal                                      |

**Moat (parit pertahanan) yang jujur & kuat:**

1. **Kontrol tingkat tutur budaya** — sulit ditiru, jualan emosional (martabat).
2. **Lapisan produk lengkap** (chat+voice+translate+studio) siap pakai UMKM/Pemda.
3. **Distribusi + data komunitas** native speaker (moat yang menguat seiring waktu).
4. **Compliance & kedaulatan data** — vendor asing tak bisa penuhi sekaligus.

Yang **bukan** moat (jangan diklaim): "kami punya model sendiri". Model dari SEA-LION/OpenAI — parit kita ada di **atas** model, bukan di modelnya.

---

## 8. SWOT ringkas (dikoreksi dari versi lama, disesuaikan realita)

|               | Positif                                                                                                                  | Negatif                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Internal**  | **S**: MVP live end-to-end; wedge tingkat tutur; multi-provider tanpa lock-in; QA/CI serius; selaras Perpres 68/2024     | **W**: tim inti kecil (1); institusi belum ada; billing/API belum jalan; kualitas bahasa _tail_ variatif; belum ada paying customer                                     |
| **Eksternal** | **O**: 65jt UMKM, 542 pemda, 1,2jt developer; pasar AI ASEAN; dukungan regulasi & funding AI nasional; diaspora serumpun | **T**: Big Tech tutup gap bahasa; korporasi (GoTo/Telkom/Indosat) bergerak; skeptisisme "chatbot pemerintah gagal"; regulasi AI/PDP berubah cepat; biaya voice realtime |

**Strategi turunan (TOWS) inti:** menang di **niche bahasa daerah bernilai tinggi** (bukan head-to-head Bahasa Indonesia umum), bangun **cash flow dari UMKM/developer cepat**, lalu **B2B/B2G** dengan compliance sebagai senjata. Tunda training model sendiri & ekspansi ASEAN sampai ada traksi.

---

## 9. Referensi silang

- Kondisi teknis penuh → lihat inventaris kode di sesi ini (matriks fitur §3).
- Persona & pasar → `docs/strategy/PERSONAS.md` (4 persona + TAM/SAM/SOM).
- Journey & konversi → `docs/strategy/CUSTOMER-JOURNEY.md`.
- Compliance detail → `docs/strategy/TRUST-COMPLIANCE.md`.
- Rencana kerja → [`02-working-plan.md`](./02-working-plan.md).
- Model bisnis → [`03-business-model.md`](./03-business-model.md).
