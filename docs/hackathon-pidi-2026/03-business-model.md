# 03 — Business Model NusaLingua

> Menjawab **template hal. 14 (Bisnis Model & Keberlanjutan — Business Model Canvas)** dan bagian **"Business Model & Scalability"** di 2nd submission (Value Proposition, Revenue/Funding, Cost Structure, Scalability, Partnership).
> Semua angka Rupiah = **indikatif**, perlu validasi willingness-to-pay.

**(EN summary)** NusaLingua monetizes three ways: a low-priced consumer **subscription** (Pro Rp49k/mo) for reach, a developer **pay-as-you-go API** (the DIGDAYA "digital service export" angle), and **enterprise/B2G contracts** (the real money, where compliance + on-prem + regional-language quality is the moat). Text COGS is near-zero (SEA-LION/Groq free tiers); realtime voice is the one real cost and is quota-capped. Strategy: cheap self-serve funds slower B2B/B2G sales.

---

## 1. Business Model Canvas (9 blok)

```
┌──────────────────┬──────────────────┬────────────────────┬──────────────────┬──────────────────┐
│ KEY PARTNERS     │ KEY ACTIVITIES   │ VALUE PROPOSITIONS │ CUSTOMER RELATION│ CUSTOMER SEGMENTS│
│                  │                  │                    │                  │                  │
│ • AI Singapore   │ • Orkestrasi &   │  "AI pertama yang  │ • Self-serve +   │ • UMKM digital   │
│   (SEA-LION)     │   prompt-eng     │  paham bahasa DAN  │   komunitas      │   (CS bhs daerah)│
│ • GoTo/Indosat   │   tingkat tutur  │  budaya Nusantara" │   (Discord/WA)   │ • Pemda/K/L (B2G)│
│   (Sahabat-AI)   │ • Bangun produk  │                    │ • Trial 14 hari  │ • Enterprise/bank│
│ • Groq, OpenAI   │   (chat/voice/   │ • Krama/ngoko benar│   → konversi     │   (B2B)          │
│   (infra model)  │   translate/     │ • Layanan CS 24/7  │ • Success mgr    │ • Developer/indie│
│ • Supabase/cloud │   studio)        │   tanpa tambah staf│   (enterprise)   │   (API consumer) │
│ • Kampus (UGM/   │ • Loop data      │ • Data di Indonesia│ • QBR (B2G/B2B)  │ • Content creator│
│   Unpad/Unhas)   │   native speaker │   (kedaulatan)     │                  │   berbhs daerah  │
│ • Akselerator/VC │ • Compliance &   │ • API murah 40-50% │                  │                  │
│ • Pemda/Diskominfo│   sales B2G      │   < LLM asing      │                  │                  │
│                  ├──────────────────┤ • No-code (setup   ├──────────────────┤                  │
│                  │ KEY RESOURCES    │   5 menit)         │ CHANNELS         │                  │
│                  │ • Codebase MVP   │ • On-prem opsi B2G │ • nusalingua.my.id│                 │
│                  │ • Katalog 100+   │                    │ • Sosmed/Reels   │                  │
│                  │   bhs + prompt   │                    │   (UMKM)         │                  │
│                  │   budaya         │                    │ • Twitter/GitHub │                  │
│                  │ • Data komunitas │                    │   (developer)    │                  │
│                  │ • Tim + advisor  │                    │ • Tender/LKPP,   │                  │
│                  │   native speaker │                    │   event Smart    │                  │
│                  │ • Brand & konten │                    │   City (B2G)     │                  │
│                  │                  │                    │ • Webinar (B2B)  │                  │
├──────────────────┴──────────────────┴────────────────────┴──────────────────┴──────────────────┤
│ COST STRUCTURE                                    │ REVENUE STREAMS                              │
│ • Inferensi AI: teks ~Rp0 (SEA-LION/Groq free),   │ 1. Subscription konsumen — Pro Rp49k/bln     │
│   voice realtime ~Rp4.800/mnt (biaya nyata utama) │ 2. API pay-as-you-go (developer/UMKM):       │
│ • Infra: VPS ~Rp150k + Supabase (Free→Pro $25)    │    chat Rp12/1k token · translate Rp20/1k    │
│ • Compliance Y1: Rp350–810jt (DPO, ISO, pentest)  │    karakter · voice Rp7.000/mnt              │
│ • SDM: dev + BD/sales + advisor native speaker    │ 3. Enterprise/B2G contract: Rp200jt–5M/tahun │
│ • Akuisisi (CAC): rendah self-serve, tinggi B2G   │ 4. (Opsi) Studio SMB Rp99k/299k/799k · add-on│
│                                                    │    voice · fine-tune · white-label reseller  │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> **Untuk submission**: render blok di atas jadi 1 gambar rapi (9 kotak). Bisa pakai Canva/draw.io, atau ambil dari **Artifact pitch** yang menyertai paket ini.

---

## 2. Value Proposition (per segmen)

| Segmen                        | Nilai utama (job-to-be-done)                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **UMKM** (Mas Eko)            | Bot WhatsApp yang **bisa basa Jowo**, jawab pelanggan 24/7, setup 5 menit tanpa coding, mulai gratis             |
| **Pemda/B2G** (Pak Bambang)   | Layanan publik bahasa daerah, **data tetap di Indonesia**, lulus audit BSSN, hemat vs vendor asing, opsi on-prem |
| **Enterprise/Bank** (Bu Sari) | CS multibahasa daerah, compliance OJK/PDP, API kompatibel OpenAI (swap cepat), 40–50% lebih hemat                |
| **Developer** (Andre)         | API "Local Language AI" murah, first-class Jawa/Sunda/Bali, SDK drop-in, kredit gratis, self-host opsi           |
| **Content creator**           | Nulis konten **krama** yang benar & natural — percaya diri berbahasa daerah secara digital                       |

**Benang merah:** bukan "banyak bahasa", tapi **"paham budaya"** (unggah-ungguh). Itu wedge yang sulit ditiru.

---

## 3. Revenue Streams (tabel harga terpadu)

> ⚠️ Menyatukan dua dokumen harga yang sebelumnya tak sinkron. **Pakai versi ini untuk proposal.** Detail alternatif → arsipkan.

### Track 1 — Subscription konsumen/prosumer

|                  | Gratis              | **Pro**                                  | Enterprise      |
| ---------------- | ------------------- | ---------------------------------------- | --------------- |
| Harga            | Rp0                 | **Rp49.000/bln** (tahunan ~Rp40.800/bln) | Custom          |
| Chat & translate | 50/hari             | Tanpa batas wajar                        | Kustom          |
| Bahasa           | 8 utama             | Semua (100+)                             | + kustom        |
| Tingkat tutur    | Dasar               | Lengkap (krama/ngoko)                    | Lengkap         |
| Voice            | Mode Hemat (gratis) | + Realtime 60 mnt/bln                    | Sesuai SLA      |
| Studio (bot)     | 1                   | 10                                       | Tak terbatas    |
| API              | —                   | 100rb token/bln                          | Volume + diskon |

_Trial: setiap pendaftar dapat **Pro gratis 14 hari** (sudah ada di produk)._

### Track 2 — API developer (pay-as-you-go) → **sudut "ekspor jasa digital" DIGDAYA**

| Layanan              | Satuan             | Harga       | ~USD     |
| -------------------- | ------------------ | ----------- | -------- |
| Chat / generasi teks | per 1.000 token    | **Rp12**    | ~$0,0008 |
| Terjemahan           | per 1.000 karakter | **Rp20**    | ~$0,0013 |
| Voice realtime       | per menit          | **Rp7.000** | ~$0,44   |

Gratis awal: 100rb token + 50rb karakter/bln. Diskon volume: >10jt token −20%, >100jt −35%.

### Track 3 — Enterprise / B2G (kontrak)

| Tier                                   | Estimasi kontrak/tahun        |
| -------------------------------------- | ----------------------------- |
| Pemkot/Pemkab kecil (1 layanan, 1 bhs) | Rp200jt–400jt                 |
| Pemkot menengah (3–5 layanan, 2 bhs)   | Rp400jt–800jt                 |
| Pemprov/kota besar (multi-bahasa)      | Rp800jt–2M                    |
| Kementerian/Lembaga                    | Rp1,5M–5M                     |
| B2B on-prem (lisensi tahunan)          | Rp800jt–3M + setup Rp250jt–1M |

### (Opsional) Track 4 — Studio SMB & add-on

Starter Rp99k / Pro Rp299k / Business Rp799k per bulan (bot WA + kuota pesan); add-on voice, fine-tune, dan white-label reseller (bagi hasil 70/30) untuk Tahun 2+.

---

## 4. Cost Structure & Sustainability

### COGS (biaya barang terjual)

| Komponen                    | Biaya                                                                           | Implikasi                                                                |
| --------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Chat & translate            | **~Rp0** (SEA-LION/Groq free tier); skala besar LLM berbayar ≈ $0,0004/1k token | **Margin sangat tinggi** — mesin margin                                  |
| **Voice realtime** (OpenAI) | **~Rp4.800/menit** — komponen termahal                                          | Dibatasi kuota + di-premium-kan; default = Mode Hemat (Web Speech, ~Rp0) |
| Infrastruktur               | VPS ~Rp150k/bln + Supabase Free→Pro ($25) + domain                              | Rendah; tertutup mulai puluhan pelanggan Pro                             |

### Opex (di luar COGS)

- SDM (dev, BD/sales, advisor native speaker), akuisisi (CAC), dan **compliance Year-1 Rp350–810jt** (DPO, ISO 27001, pentest — investasi front-loaded yang jadi moat B2G/B2B).

### Jalur keberlanjutan (sustainability)

1. **Teks = margin, voice = biaya** → jaga voice lewat kuota + Mode Hemat gratis default.
2. **Self-serve murah (UMKM+dev) → cash flow cepat** untuk membiayai sales B2B/B2G bersiklus panjang.
3. **Compliance sebagai value B2B/B2G** (bukan biaya hangus) → tiket masuk kontrak besar bermargin tinggi.
4. **Target BEP ~bulan 18** (ilustratif, dari SWOT) — validasi setelah ada pilot berbayar.

---

## 5. Unit Economics (ilustratif)

| Track             | ARPU/bln    | CAC    | Payback | LTV      | LTV/CAC |
| ----------------- | ----------- | ------ | ------- | -------- | ------- |
| API developer     | Rp200–800rb | Rp25rb | < 1 bln | Rp8–30jt | tinggi  |
| Subscription UMKM | Rp150rb     | Rp50rb | ~1 bln  | Rp4–8jt  | tinggi  |
| Enterprise B2B    | Rp60–100jt  | Rp15jt | 3–4 bln | Rp1,5–3M | ~100×   |
| B2G Pemda         | Rp30–150jt  | Rp30jt | ~6 bln  | Rp1,2–5M | ~60×    |

**Contoh ROI 1 mitra UMKM/Pemda (dari `BRAINSTORMING`):** 1.000 interaksi/bln, deflect 60% → hemat ~50 jam staf → **±Rp1,5jt/bln (±Rp18jt/th)**; biaya API ±Rp180rb/bln → **ROI ±730%/th, payback < 1 bulan**. _(asumsi biaya staf Rp30rb/jam — verifikasi per mitra.)_

**Proyeksi tahun-1 (murni ilustrasi):** 10.000 user gratis × konversi 3% = 300 Pro (±Rp14,7jt/bln) + 5 enterprise (±Rp25jt/bln) + 20 developer API (±Rp5jt/bln) ≈ **±Rp44,7jt/bln (±Rp536jt/tahun)**. Butuh validasi go-to-market.

---

## 6. Scalability

- **Teknis:** stateless Express + Supabase pooling; siap PM2 cluster + Redis (stats cache) + Cloudflare CDN. Multi-provider → bisa arahkan trafik ke model termurah/tercepat. Skala marginal murah karena COGS teks ~0.
- **Bahasa:** tambah bahasa = tambah baris `languages` + system prompt (bukan retrain model). **Skala bahasa nyaris tanpa biaya** — keunggulan model orkestrasi.
- **Produk:** satu platform, tiga kanal monetisasi (subscription, API, enterprise) → land-and-expand.
- **Geografis:** bahasa serumpun (Melayu) memudahkan ekspor ke Malaysia/Brunei + diaspora ASEAN (8jt jiwa) — **sudut ekspor jasa digital DIGDAYA**. Tunda sampai BEP domestik.

---

## 7. Partnership & Distribution

| Mitra                                                       | Peran                                                    | Status                  |
| ----------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| **AI Singapore (SEA-LION)** / **GoTo·Indosat (Sahabat-AI)** | Penyedia model berdaulat (fondasi)                       | Dipakai di produk (API) |
| **Groq / OpenAI**                                           | Infra model (fallback + voice realtime)                  | Terintegrasi            |
| **Kampus (UGM, Unpad, Unhas, UI)**                          | Advisor & anotator native speaker; kredibilitas akademik | Target rekrut           |
| **Akselerator (Indigo Telkom, BRIN)**                       | Mentor + funding + jejaring co-founder                   | Target                  |
| **Pemda/Diskominfo**                                        | Kanal B2G + validasi layanan publik                      | Target pilot            |
| **Komunitas UMKM (Solo/Yogya)**                             | Distribusi self-serve + testimoni                        | Target pilot            |

**Strategi distribusi berlapis (GTM):** Bulan 1–6 fokus **developer + UMKM** (siklus pendek, CAC rendah) → Bulan 4–12 **B2B enterprise** dengan studi kasus → Bulan 6–18 **B2G** dengan compliance + testimoni → Bulan 18+ **ASEAN**.

---

## 8. Funding (untuk "Model Revenue / Funding")

Jalur pendanaan yang realistis & selaras DIGDAYA:

1. **Revenue (bootstrapping)** — API + Pro + pilot berbayar (utama).
2. **Grant/dukungan pemerintah** — Perpres 68/2024 (AI berbahasa Indonesia prioritas), BRIN/Kemendikbud, program inklusi digital.
3. **Akselerator/VC lokal** — AI sovereignty plays (Indigo, East Ventures, dsb).
4. **Donor pelestarian bahasa** — sudut warisan budaya (700+ bahasa terancam punah).

---

## Referensi

- Detail harga asli → `PRICING-STRATEGY.md`, `docs/strategy/PRICING.md` (arsip; ada perbedaan angka — lihat memo gap).
- Persona & TAM/SAM/SOM → `docs/strategy/PERSONAS.md`.
- Compliance sebagai moat → `docs/strategy/TRUST-COMPLIANCE.md`.
- Draft jawaban proposal → [`04-proposal-draft.md`](./04-proposal-draft.md).
