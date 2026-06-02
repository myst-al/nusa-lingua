# NusaLingua — Customer Journey Map

> Pemetaan touchpoint setiap persona dari awareness sampai renewal. Selaras dengan [PERSONAS.md](./PERSONAS.md).

| Field | Value |
|---|---|
| Document ID | NSL-STR-002 |
| Version | 1.0 |
| Owner | Product Lead + Business Dev |

---

## Framework: 6 Stage Universal

```
Awareness → Consideration → Trial → Purchase → Activation → Renewal/Expansion
```

Setiap stage punya: **Goal user**, **Touchpoint kita**, **Pain di stage ini**, **Metric sukses**.

---

## Journey 1 — Pak Bambang (B2G Pemda)

**Total durasi estimasi**: 6–14 bulan (siklus tender Pemda lambat).

### Stage 1. Awareness (Bulan 1)

| Aspek | Detail |
|---|---|
| Goal user | Tahu solusi chatbot multibahasa lokal yang ada di pasar |
| Trigger | Walikota minta strategi AI; lihat showcase di event Smart City |
| Touchpoint kita | Press release media Kompas/Detik; demo di Smart City Indonesia Expo; rekomendasi peer Kadis lain |
| Pain | Bingung pilih vendor — banyak janji manis |
| Konten yang dia konsumsi | Whitepaper "Chatbot Pemda yang Lulus Audit BSSN"; case study singkat |
| Metric kita | MQL — Marketing Qualified Lead (mengisi form demo) |

### Stage 2. Consideration (Bulan 2–4)

| Aspek | Detail |
|---|---|
| Goal user | Yakin NusaLingua superior vs vendor lain; risk acceptable |
| Touchpoint kita | Site visit + demo on-prem; presentation ke Sekda; ROI calculator custom |
| Pain | Banyak pihak internal harus di-convince (Sekda, Bappeda, Inspektorat) |
| Konten | TCO comparison vs OpenAI/vendor BUMN; compliance matrix BSSN/PDP; reference Pemkot lain |
| Metric kita | SQL — Sales Qualified Lead; proposal request |

### Stage 3. Trial (Bulan 4–6)

| Aspek | Detail |
|---|---|
| Goal user | PoC (Proof of Concept) jalan di sandbox internal |
| Touchpoint kita | Setup PoC 1 bulan gratis di staging; weekly check-in; training operator |
| Pain | Tim internal butuh training; data internal belum bersih |
| Output | Dashboard PoC menunjukkan resolution rate naik 25 %+ |
| Metric kita | PoC success rate; conversion to commercial |

### Stage 4. Purchase (Bulan 6–10)

| Aspek | Detail |
|---|---|
| Goal user | Selesaikan tender / PBJ; tanda tangan kontrak |
| Touchpoint kita | Dokumen tender lengkap (TKDN, KAK, RAB, sertifikasi); LKPP siap |
| Pain | Birokrasi PBJ lambat; harga harus masuk SBM; tender bisa di-protest |
| Konten | Sertifikat ISO; legal entity Indonesia; rekening BUMN |
| Metric kita | Won contract; nilai kontrak Rp 200jt–1M/tahun |

### Stage 5. Activation (Bulan 10–12)

| Aspek | Detail |
|---|---|
| Goal user | Chatbot live di portal pemkot; KPI mulai keangkat |
| Touchpoint kita | Implementation team on-site 1 minggu; training 3 batch; runbook ops |
| Pain | Integrasi sistem legacy lambat; staff Diskominfo skeptis |
| Output | Soft-launch internal → public launch dengan press conference |
| Metric kita | Time-to-first-message; CSAT internal; adoption rate Diskominfo |

### Stage 6. Renewal & Expansion (Tahun ke-2+)

| Aspek | Detail |
|---|---|
| Goal user | Renewal kontrak; ekspansi ke layanan lain (e-samsat, dukcapil) |
| Touchpoint kita | Quarterly Business Review (QBR); roadmap aligning; case study publishing |
| Pain | Pergantian Walikota / Kadis bisa reset semua |
| Expansion | Cross-sell: dari 1 layanan jadi 3-5 layanan; upsell premium tier |
| Metric kita | Net Revenue Retention (NRR) ≥ 120 %; reference customer aktif |

---

## Journey 2 — Bu Sari (B2B Enterprise Bank)

**Total durasi**: 4–8 bulan.

### Stage 1. Awareness (Minggu 1–4)

| Aspek | Detail |
|---|---|
| Trigger | Audit OJK temuan; pressure board; kompetitor launch fitur |
| Touchpoint | LinkedIn thought-leadership; webinar AWS/FinTech Indonesia; warm intro VC |
| Konten | "Compliance-First LLM for Indonesian Banks"; analyst report (e.g. Gartner cool vendor) |
| Metric | MQL via LinkedIn ads + content download |

### Stage 2. Consideration (Bulan 2–3)

| Aspek | Detail |
|---|---|
| Goal | Validate technical fit + security posture |
| Touchpoint | Solution architect call; security questionnaire (SIG, CAIQ); demo bilingual |
| Konten | Architecture whitepaper; data flow diagram; SOC 2 readiness statement |
| Pain | InfoSec team detailed scrutiny; legal MSA negotiation |
| Metric | Security questionnaire passed |

### Stage 3. Trial (Bulan 3–4)

| Aspek | Detail |
|---|---|
| Goal | Limited production pilot di 1 product line (e.g. credit card support) |
| Touchpoint | Paid PoC Rp 75 jt (90 hari); A/B test vs incumbent |
| Output | Metric: NPS pilot vs control, FCR, AHT |
| Metric | PoC NPS uplift ≥ 8 poin; FCR uplift ≥ 10 % |

### Stage 4. Purchase (Bulan 4–5)

| Aspek | Detail |
|---|---|
| Goal | MSA + DPA + SLA signed; PO issued |
| Touchpoint | Legal review (2-4 weeks); procurement; CISO sign-off |
| Konten | Detailed SLA (99.9 % uptime, p95 < 800 ms); incident escalation matrix |
| Pricing | Rp 150-400 jt setup + Rp 80-200 jt/bulan subscription |
| Metric | Contract Annual Value (CAV) ≥ Rp 1M |

### Stage 5. Activation (Bulan 5–7)

| Aspek | Detail |
|---|---|
| Goal | Production rollout di multiple product lines |
| Touchpoint | Dedicated Customer Success Manager; weekly call selama 90 hari |
| Output | Migration plan; phased rollout (10 % → 50 % → 100 %) |
| Metric | Time-to-Value (TTV) < 60 hari; Production NPS lift ≥ 5 |

### Stage 6. Renewal & Expansion (Year 2+)

| Aspek | Detail |
|---|---|
| Goal | Renewal multi-year + add use cases (lending, investment) |
| Touchpoint | QBR with VP Operations; roadmap co-design; reference call agreement |
| Expansion | Multi-product line; voice channel; agent assist |
| Metric | NRR ≥ 130 %; multi-year contract |

---

## Journey 3 — Mas Eko (UMKM Self-serve)

**Total durasi**: 1 hari–2 minggu (fast funnel).

### Stage 1. Awareness (Hari 1)

| Aspek | Detail |
|---|---|
| Trigger | Lihat Reels Instagram / TikTok "Bot WA bahasa Jawa" |
| Touchpoint | Konten edukasi 60 detik dengan use case batik Solo |
| Pain | Skeptis "AI" — banyak janji palsu |
| Konten | Sosmed organik + ads micro-targeted UMKM kota tier-2 |
| Metric | Klik landing page; CPC < Rp 2.000 |

### Stage 2. Consideration (Hari 1–3)

| Aspek | Detail |
|---|---|
| Goal | Yakin ini beda (paham bahasa Jawa beneran) |
| Touchpoint | Landing page dengan demo live preview tanpa signup |
| Konten | Video testimoni UMKM lain; preview output bahasa Jawa real |
| Pain | Trust issue — takut data toko bocor; takut bayar duluan tanpa coba |
| Metric | Signup rate ≥ 5 % visitor |

### Stage 3. Trial (Hari 1–7)

| Aspek | Detail |
|---|---|
| Goal | Setup bot WA pertama dalam < 10 menit |
| Touchpoint | Onboarding wizard 5 langkah; chatbot Studio drag-and-drop |
| Free tier | 100 pesan/bulan, 1 bot, 2 bahasa |
| Pain | Stuck di integrasi WA Business API (manual setup) |
| Konten | YouTube tutorial step-by-step + WhatsApp support template |
| Metric | Activation rate (bot publish ≤ 24 jam): ≥ 40 % |

### Stage 4. Purchase (Hari 7–14)

| Aspek | Detail |
|---|---|
| Goal | Upgrade dari Free ke Starter (Rp 99rb/bulan) |
| Trigger | Limit 100 pesan tercapai; lihat ROI nyata (order naik) |
| Touchpoint | In-app upgrade modal; reminder email; preview "kalau upgrade kamu hemat X jam/minggu" |
| Pricing | Starter Rp 99rb, Pro Rp 299rb, Business Rp 799rb |
| Pain | Bayar via QRIS / Dana / GoPay (bukan kartu kredit) |
| Metric | Free-to-paid conversion: ≥ 8 % dalam 14 hari |

### Stage 5. Activation (Minggu 2–4)

| Aspek | Detail |
|---|---|
| Goal | Bot jalan 24/7 menjawab pelanggan |
| Touchpoint | Weekly digest email "kamu sudah jawab 1.234 pesan minggu ini, hemat 18 jam" |
| Konten | Komunitas Telegram grup UMKM NusaLingua |
| Metric | Weekly active bot ≥ 80 % paid users |

### Stage 6. Renewal & Expansion

| Aspek | Detail |
|---|---|
| Goal | Tetap subscribe + add bot kedua (e.g. customer service vs sales bot) |
| Touchpoint | Loyalty tier (3 bulan, 6 bulan, 12 bulan discount) |
| Expansion | Up-tier Pro/Business; multi-bot; voice add-on |
| Metric | Logo retention ≥ 70 % per 12 bulan; ARPU growth |

---

## Journey 4 — Andre (Developer / API)

**Total durasi**: 30 menit–2 minggu.

### Stage 1. Awareness (Menit 1)

| Aspek | Detail |
|---|---|
| Trigger | Tweet developer Indonesia; spike OpenAI bill; lihat di Product Hunt |
| Touchpoint | Twitter / X thread; GitHub README dengan demo gif |
| Konten | Quickstart 5 menit; benchmark vs OpenAI (latency + price) |
| Metric | GitHub stars; landing page CTR |

### Stage 2. Consideration (Menit 1–30)

| Aspek | Detail |
|---|---|
| Goal | Yakin API kualitas + kompatibel + cheap |
| Touchpoint | API playground (no signup); docs side-by-side dengan OpenAI |
| Konten | Benchmark Bahasa Bali/Sasak quality; pricing calculator |
| Pain | "Vendor lock-in" + dokumentasi membingungkan |
| Metric | Playground execution → signup rate ≥ 25 % |

### Stage 3. Trial (Menit 30–Hari 7)

| Aspek | Detail |
|---|---|
| Goal | Integrate API ke side-project, lihat hasil real |
| Touchpoint | Free credit Rp 50rb (tanpa kartu kredit); SDK Node/Python npm install |
| Konten | Discord channel real-time support; cookbook examples |
| Pain | Edge case di bahasa daerah → butuh dev support |
| Metric | First API call < 24 jam dari signup; weekly active dev |

### Stage 4. Purchase (Hari 7–14)

| Aspek | Detail |
|---|---|
| Goal | Add billing card / top-up; production deployment |
| Trigger | Free credit habis; project deadline mendekat |
| Touchpoint | Stripe / Xendit billing; pricing transparent per 1M token |
| Pricing | Pay-as-you-go: Rp 5/1K input token, Rp 15/1K output (50 % lebih murah dari OpenAI) |
| Metric | Free-to-paid: ≥ 15 % dalam 30 hari |

### Stage 5. Activation (Bulan 1–3)

| Aspek | Detail |
|---|---|
| Goal | Produksi stable; trafik naik |
| Touchpoint | Status page; monthly usage report; rate limit alert proactive |
| Pain | Latency spike di peak hour |
| Metric | Monthly Active Developer (MAD); Token volume |

### Stage 6. Renewal & Expansion

| Aspek | Detail |
|---|---|
| Goal | Stay + expand ke voice API + fine-tuning |
| Touchpoint | Volume discount tier (Tier 1-4 berdasarkan monthly spend) |
| Expansion | Voice WebRTC; custom model fine-tune; team workspace |
| Metric | Net token volume growth; multi-product attach rate |

---

## Cross-Journey Metric Summary

| Stage | Pak Bambang | Bu Sari | Mas Eko | Andre |
|---|---|---|---|---|
| **Cycle length** | 6-14 bulan | 4-8 bulan | 1-14 hari | 30 menit-14 hari |
| **CAC budget** | Rp 30jt | Rp 15jt | Rp 50rb | Rp 25rb |
| **Avg deal size (Y1)** | Rp 400jt | Rp 1,2 M | Rp 1,2jt | Rp 2,4jt |
| **LTV target** | Rp 1,8 M | Rp 6 M | Rp 4jt | Rp 18jt |
| **LTV/CAC ratio** | 60× | 400× | 80× | 720× |
| **Conversion bottleneck** | PBJ birokrasi | InfoSec review | Activation < 24jam | First API call |

---

## Strategi GTM Berlapis

Dari journey map ini, urutan GTM yang masuk akal:

1. **Bulan 1–6**: Fokus **Andre + Mas Eko** (self-serve, cycle pendek, modal CAC rendah) — bangun brand + community + revenue runway
2. **Bulan 4–12**: Mulai **Bu Sari** (B2B enterprise) dengan case study dari Andre/Eko
3. **Bulan 6–18**: **Pak Bambang** (B2G) pakai testimoni B2B + dukungan Kominfo
4. **Bulan 18+**: Ekspansi ASEAN

---

*Customer journey ini hypothesis. Update setelah ada minimal 10 win/loss per persona.*
