# NusaLingua × PIDI DIGDAYA & Hackathon 2026 — Paket Strategi

> Dokumen kerja untuk **Kelompok 10** (Lead: Albert Ade Kristadeo). Disusun sebagai peta jalan submission ke **Pusat Inovasi Digital Indonesia (PIDI) — Hackathon dan Digdaya 2026**.
> Status angka: sebagian **ilustratif/asumsi** — ditandai eksplisit dan wajib divalidasi sebelum dipakai sebagai klaim keras.

---

## 📁 Isi paket ini

| #   | File                                               | Isi                                                                                                             | Untuk siapa                   |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 0   | **README.md** (ini)                                | Ringkasan eksekutif (EN), memo gap/risiko, cara pakai                                                           | Semua — **baca dulu**         |
| 1   | [`01-analisis-proyek.md`](./01-analisis-proyek.md) | Audit mendalam: yang **nyata dibangun** vs yang **diklaim**, kondisi teknis, pemetaan ke problem statement PIDI | PM, Tech Lead, Juri           |
| 2   | [`02-working-plan.md`](./02-working-plan.md)       | Rencana kerja: sprint menuju submission + roadmap eksekusi 6 bulan, milestone, KPI, risiko                      | PM, seluruh tim               |
| 3   | [`03-business-model.md`](./03-business-model.md)   | Business Model Canvas 9 blok + revenue/cost/sustainability + unit economics                                     | Business Lead, Investor, Juri |
| 4   | [`04-proposal-draft.md`](./04-proposal-draft.md)   | Draft jawaban siap-isi, dipetakan ke **kedua** template (15-bagian & 2nd submission), patuh batas karakter      | PM (yang mengisi submission)  |
| —   | **Artifact pitch** (web)                           | Halaman visual: problem→solution fit, BMC, roadmap, angka kunci                                                 | Presentasi ke juri            |

Semua file **bilingual**: badan teks **Bahasa Indonesia** (bahasa wajib proposal), ringkasan & istilah kunci diberi konteks Inggris.

---

## 🇬🇧 Executive Summary (English)

**What NusaLingua is (verified from the codebase, not just the pitch):**
NusaLingua is a **working full-stack MVP** — a multilingual conversational-AI platform for Indonesian and regional (Nusantara) languages. It is an **application & orchestration layer** (chat + realtime voice + translation + a no-code bot studio) built **on top of Indonesian/ASEAN sovereign LLMs** (SEA-LION / Sahabat-AI), with Groq and OpenAI as fallbacks. Its real differentiator is **cultural register control** — getting Javanese _krama/ngoko_ and Sundanese _lemes/loma_ right — which foreign LLMs consistently fail at.

**Why it fits PIDI DIGDAYA 2026:**
It maps directly to **Problem Statement #3 → "Percepatan Layanan Publik, Ekonomi Kreatif, dan Ekspor Jasa Digital" → "Digitalisasi Ekspor Layanan Digital"**, specifically sub-points **#4 "Otomatisasi Layanan Pelanggan Multibahasa"** and **#5 "Local Language AI (LLM)"**. The angle is national: help UMKM, local governments, and developers serve citizens/customers in their mother tongue 24/7, and export that capability as an API to the ASEAN market.

**Current build state (real):** Chat (SSE streaming), realtime voice (WebRTC via OpenAI Realtime), a free "Mode Hemat" voice path (browser Web Speech), translation, a no-code Studio (UI complete), Supabase auth, a 100+ language catalog (8 with curated cultural prompts; ~4 truly "live"), a public pricing page, and a 14-day Pro trial. CI/CD, QA framework, and a production deployment plan already exist. **Not built yet:** billing/quota enforcement, API-key issuance, Studio flow-node execution, rate limiting — all correctly scoped as Phase 2.

**The single most important strategic correction:** an older strategy doc (`NusaLingua-SWOT-BusinessProcess.html`) still claims NusaLingua _trains its own LLaMA-3 sovereign model with a custom Nusantara tokenizer_. **The code does not do this** — it consumes SEA-LION/Groq/OpenAI via API. Pitch the **honest and stronger** story: NusaLingua is the **culture-aware application layer + distribution + community-data moat** on top of sovereign base models. This is more defensible, cheaper, faster, and still 100% aligned with "AI berdaulat" (Perpres 68/2024) because the base models it uses are Indonesian/ASEAN.

**Ask / next 90 days:** validate willingness-to-pay with 3–5 UMKM + 1–2 Pemda pilots, ship billing + API keys to turn the MVP into revenue, and record a clean 3-minute demo (Javanese _krama_ vs. ChatGPT side-by-side) for the judges.

---

## ⚠️ Memo Gap & Risiko — BACA SEBELUM MENGISI PROPOSAL

Ini bagian paling penting. Proposal Anda akan **lebih kuat** kalau jujur soal ini, dan **rawan dibantah juri** kalau tidak.

### Gap 1 — "Melatih LLM sendiri" vs. "Mengorkestrasi LLM berdaulat" 🔴 KRITIS

- **Klaim lama** (di `NusaLingua-SWOT-BusinessProcess.html`): latih LLaMA-3 8B + LoRA + RLHF, tokenizer SentencePiece Nusantara kustom, 3 varian model (1B/7B/70B), korpus 1B token.
- **Realita kode**: memakai **SEA-LION `aisingapore/Llama-SEA-LION-v3-70B-IT`** (default), **Groq `llama-3.3-70b-versatile`**, dan **OpenAI** (chat + voice realtime) lewat API OpenAI-compatible. Tidak ada training, tidak ada tokenizer kustom.
- **Rekomendasi**: **posisikan sebagai application/orchestration layer**, bukan foundation-model builder. Moat = (a) kontrol tingkat tutur/budaya, (b) no-code Studio + voice + distribusi, (c) data komunitas native speaker. Training model sendiri → taruh sebagai **opsi R&D jangka panjang (Fase 4)**, bukan klaim MVP. _Ini menghilangkan risiko terbesar Anda dibantah juri teknis._

### Gap 2 — SEA-LION: "ancaman" atau "fondasi"? 🟠

- SWOT lama menaruh **SEA-LION sebagai ancaman/kompetitor**, padahal **kode justru memakainya sebagai penyedia utama**. Kontradiktif.
- **Rekomendasi**: reframe SEA-LION/Sahabat-AI sebagai **infrastruktur yang kita bangun di atasnya** (analogi: kita bukan pesaing AWS, kita bikin produk di atas AWS). Kompetitor sesungguhnya = OpenAI/Google untuk tugas bahasa daerah, dan chatbot vendor BUMN yang resolution-rate-nya rendah.

### Gap 3 — Cakupan bahasa: angka tidak konsisten 🟡

- Muncul angka berbeda di dokumen: 6 / 8 / 20+ / 108 / 114 / 700+ bahasa.
- **Realita kode**: katalog **~108 bahasa** di-seed; **8 punya system prompt budaya kurasi**; hanya **±4 berstatus "live"** (Indonesia, Jawa, Sunda, Batak Toba), sisanya beta/soon.
- **Rekomendasi**: pakai kalimat presisi — _"1 bahasa nasional + 7 bahasa daerah dengan konteks budaya terkurasi, di atas katalog 100+ bahasa; kedalaman kualitas tertinggi di Jawa/Sunda."_ Jangan klaim "700 bahasa matang".

### Gap 4 — Monetisasi belum jalan di produk 🟡

- Pricing page, trial 14 hari, dan tabel harga API **ada**, tapi **billing, enforcement kuota, dan penerbitan API key belum diimplementasi** (Phase 2). Trial hanya menandai tanggal.
- **Rekomendasi**: di bagian "Implementation Readiness / Progress", nyatakan apa adanya — model bisnis **dirancang & ber-UI**, eksekusi pembayaran adalah item prioritas 6 bulan ke depan. Ini realistis dan tidak mengurangi nilai.

### Gap 5 — Dua dokumen harga tidak sinkron 🟡

- `PRICING-STRATEGY.md` (Pro Rp49k; API Rp12/Rp20/Rp7.000) vs `docs/strategy/PRICING.md` (Studio Rp99k/299k/799k; API Rp5/Rp15). Angka berbeda.
- **Rekomendasi**: pakai **satu tabel harga terpadu** (disusun ulang di [`03-business-model.md`](./03-business-model.md) §Revenue) untuk proposal. Simpan detail sebagai lampiran.

### Gap 6 — Institusi & tim 🟡

- SWOT menandai kelemahan: **"Institusi: -"** dan **tim inti = 1 orang** (Technical Lead). Template meminta Institusi + anggota tim & peran.
- **Rekomendasi**: sebelum submit, isi afiliasi (kampus/komunitas) bila ada, atau rekrut 1–2 advisor native speaker (UGM/Unpad) + jelaskan rencana mitigasi tim kecil (ikut akselerator). Juri menilai **kelayakan eksekusi**.

---

## ✅ Yang sudah kuat (jangan diragukan)

- **MVP betul-betul jalan** end-to-end — bukan mockup. Streaming chat, voice WebRTC, translate, Studio, auth, 108 bahasa ter-seed.
- **Rekayasa kualitas serius** untuk skala hackathon: CI/CD 8 job, QA framework 5 dokumen, 64/64 assertion business-process E2E, secret scanning, deployment plan Nginx+PM2 lengkap.
- **Wedge emosional + teknis yang sulit ditiru**: tingkat tutur (krama/ngoko). Ini jualan "martabat & inklusi", bukan sekadar fitur.
- **Selaras regulasi**: Perpres 68/2024 (AI berbahasa Indonesia prioritas nasional), UU PDP, data residency — moat terhadap vendor asing.

---

## 🧭 Cara pakai paket ini

1. **Baca memo gap di atas** → sepakati positioning (orchestration layer, bukan foundation-model builder).
2. Buka [`01-analisis-proyek.md`](./01-analisis-proyek.md) untuk memahami kondisi nyata + pemetaan problem statement.
3. Pakai [`02-working-plan.md`](./02-working-plan.md) untuk eksekusi (sprint submission + 6 bulan).
4. Pakai [`03-business-model.md`](./03-business-model.md) untuk mengisi bagian Business Model Canvas / Business Model & Scalability.
5. Salin-tempel dari [`04-proposal-draft.md`](./04-proposal-draft.md) ke template resmi, sesuaikan seperlunya (patuhi batas karakter).
6. Gunakan **Artifact pitch** saat presentasi ke juri.

---

_Disusun 2026-07-03. Semua klaim teknis diverifikasi langsung dari kode (`server/src`, `client/src`, `shared/`). Angka finansial bertanda "ilustratif" perlu validasi lapangan._
