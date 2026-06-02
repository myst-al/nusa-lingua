# NusaLingua — Pricing Matrix

> Struktur harga yang selaras dengan 4 persona di [PERSONAS.md](./PERSONAS.md) dan journey di [CUSTOMER-JOURNEY.md](./CUSTOMER-JOURNEY.md).

| Field | Value |
|---|---|
| Document ID | NSL-STR-004 |
| Version | 1.0 |
| Owner | Founder + Business Dev |
| Currency | IDR (default), USD untuk ekspor ASEAN |

---

## 1. Filosofi Penetapan Harga

1. **Land-and-expand** — masuk murah, tumbuh sesuai value
2. **3 model paralel** untuk 3 segmen yang berbeda (self-serve, subscription, enterprise contract)
3. **Anchor pada OpenAI** untuk B2C/dev (target: 40-50 % lebih murah)
4. **Anchor pada TCO vendor BUMN** untuk B2G (target: 30-50 % lebih hemat dengan output lebih baik)
5. **Bundel compliance** menjadi value-add B2B/B2G — bukan up-charge

---

## 2. Tiga Track Pricing

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Track 1: SELF-SERVE│  │  Track 2: SUBSCRIPTION  │  Track 3: ENTERPRISE │
│  (Andre + Mas Eko)  │  │  (UMKM scale-up)    │  │  (Bu Sari + Pak    │
│  Pay-as-you-go      │  │  Tier subscription  │  │   Bambang)         │
│  Self-checkout      │  │  Self-checkout      │  │  Contract + Invoice │
│  Stripe/Xendit      │  │  Auto-renew         │  │  PO + Tender        │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 3. TRACK 1 — Self-Serve API (Developer Pay-as-you-go)

Target: **Andre** + technical UMKM advanced.

### Tier "Hacker" (Free)

| Item | Value |
|---|---|
| Harga | Gratis |
| Credit awal | Rp 50.000 token gratis |
| Rate limit | 60 req/menit |
| Bahasa | Semua 6 MVP |
| Voice | ❌ |
| Support | Community Discord |
| SLA | None |
| Untuk | Trial + side-project kecil |

### Tier "Builder" (Pay-as-you-go)

| Item | Value |
|---|---|
| Harga input | **Rp 5 / 1.000 token** (chat & embedding) |
| Harga output | **Rp 15 / 1.000 token** |
| Voice (per menit) | **Rp 800 / menit input + Rp 1.200 / menit output** |
| Rate limit | 600 req/menit |
| Top-up | Min Rp 100rb via QRIS / GoPay / Dana / kartu kredit |
| Auto-recharge | Optional |
| Support | Email 24 jam |
| SLA | 99.5 % uptime |

**Anchor**: OpenAI gpt-4o-mini ≈ USD 0.15/1M input, USD 0.60/1M output.
Kita: ≈ USD 0.30/1M (input setara) / USD 0.90/1M output — tapi value-add: bahasa daerah + data residency.

### Tier "Scale" (Volume Discount)

| Volume bulanan | Diskon | Effective rate |
|---|---|---|
| < Rp 1jt | 0 % | normal |
| Rp 1jt - 5jt | -10 % | -10 % |
| Rp 5jt - 20jt | -20 % | -20 % |
| Rp 20jt - 100jt | -30 % | -30 % |
| > Rp 100jt | Custom (mulai -35 %, contract) | nego |

Auto-applied di invoice.

---

## 4. TRACK 2 — Subscription Studio (UMKM)

Target: **Mas Eko** + UMKM yang butuh no-code bot.

| Tier | Free | Starter | Pro | Business |
|---|---|---|---|---|
| **Harga / bulan** | Rp 0 | **Rp 99.000** | **Rp 299.000** | **Rp 799.000** |
| **Bot aktif** | 1 | 1 | 5 | Unlimited |
| **Pesan / bulan** | 100 | 2.000 | 10.000 | 50.000 |
| **Bahasa** | 2 | 4 | Semua 6 MVP | Semua + custom |
| **WhatsApp integration** | ❌ | ✅ | ✅ | ✅ |
| **Voice (menit/bulan)** | ❌ | ❌ | 60 | 300 |
| **Custom training** | ❌ | ❌ | ❌ | ✅ light fine-tune |
| **Branding removal** | ❌ | ❌ | ✅ | ✅ |
| **Team seats** | 1 | 1 | 3 | 10 |
| **Analytics** | Basic | Basic | Advanced | Advanced + Export |
| **Support** | Community | Email 24h | Email 12h + chat | Priority + WA |
| **SLA** | — | 99.5 % | 99.5 % | 99.9 % |

### Annual billing diskon
- Yearly upfront = **-20 %** (Pro tahunan: Rp 2.870.400 vs Rp 3.588.000)

### Overage policy
Lebih dari quota pesan: top-up Rp 50 per 1.000 pesan ekstra (atau auto-upgrade tier).

---

## 5. TRACK 3 — Enterprise Contract

Target: **Bu Sari (B2B)** + **Pak Bambang (B2G)**.

### B2B Enterprise SaaS (Cloud)

| Item | Detail |
|---|---|
| Model | Annual contract, minimum 12 bulan |
| Setup fee | Rp 50jt - Rp 200jt (tergantung kompleksitas integrasi) |
| Subscription base | **Mulai Rp 50jt / bulan** (50.000 monthly active conversations) |
| Per-conversation overage | Rp 750 / conversation di luar quota |
| Voice add-on | +Rp 30jt / bulan (10.000 menit) |
| Dedicated account manager | ✅ |
| SLA | 99.9 % uptime + p95 latency < 800 ms |
| Support | 4-jam response P0, dedicated Slack |
| Security questionnaire | SIG + CAIQ supported |
| DPA + MSA | ✅ legal review tahap awal |

### B2B Enterprise On-Prem

| Item | Detail |
|---|---|
| Setup fee | Rp 250jt - Rp 1 M |
| Annual license | **Rp 800jt - Rp 3 M** (tergantung pemakaian + jumlah node) |
| Update + support | Included (quarterly patch, annual major) |
| Implementation | 6-12 minggu, technical lead on-site |
| Air-gapped option | Tersedia (no telemetry) |

### B2G Pemda / K/L

Mengikuti kerangka SBM Kemenkeu dan SIRUP LKPP:

| Tier | Skup | Annual contract estimasi |
|---|---|---|
| **Pemkot/Pemkab kecil** (< 500rb populasi) | 1 layanan, 1 bahasa daerah | Rp 200jt - Rp 400jt |
| **Pemkot menengah** (500rb-2jt) | 3-5 layanan, 2 bahasa | Rp 400jt - Rp 800jt |
| **Pemprov / Kota besar** (> 2jt) | 5-10 layanan, multi-bahasa | Rp 800jt - Rp 2 M |
| **Kementerian / Lembaga** | Cross-cutting | Rp 1,5 M - Rp 5 M |

Termasuk:
- Implementation + training operator (3 batch)
- Hosting di Indonesia (Biznet Gio / IDC) ATAU on-prem klien
- TKDN sertifikat (rencana Q3 Year 1)
- Local presence + invoice PT Indonesia

---

## 6. Bundel & Add-Ons

### Compliance Bundle (B2B/B2G default included)
- DPA template + custom
- Audit log access (12 bulan retention)
- Vendor risk assessment support
- Dedicated DPO contact

### Voice Add-On (semua tier)
- B2B: Rp 30jt/bulan, 10rb menit included
- B2G: include di paket Pemprov ke atas
- B2C: Pro+ tier sudah include

### Fine-tune Bundle (Pro+ / Enterprise)
- One-time training fee: Rp 5jt - Rp 50jt per model
- Hosting model custom: +20 % dari base subscription
- Native speaker review include sampai 100 sample

### Multi-Tenant White-Label (Reseller — Year 2+)
- Revenue share 70/30 (NusaLingua/reseller)
- Custom domain + branding
- API rate limit pooled

---

## 7. Pricing Ladder per Persona

```
Mas Eko: Free → Starter (Rp 99k) → Pro (Rp 299k) → Business (Rp 799k)
         ↓ trigger: hit message limit, lihat ROI

Andre:   Free credit → Builder PAYG → Scale tier (vol discount) → Enterprise (kalau scale ke prod B2B)
         ↓ trigger: hit free credit, bill > Rp 500k/bln → mulai tier discount

Bu Sari: PoC paid (Rp 75jt 90 hari) → Enterprise SaaS Rp 50jt/bln → Expand (voice + more lines)
         ↓ trigger: PoC sukses, board approval

Pak Bambang: Pilot 1 layanan (Rp 200-400jt) → Multi-layanan (Rp 400-800jt) → Replikasi ke kab lain
             ↓ trigger: success story + tender Q4
```

---

## 8. Discount Policy

| Tipe | Diskon | Approval |
|---|---|---|
| Annual upfront (semua tier) | -20 % | Auto |
| Multi-year B2B (2-3 tahun) | -10 % per tahun extra | Sales Dir |
| Pemerintah daerah pilot pertama | -30 % (referral case study) | Founder |
| Akademisi / non-profit | -50 % subscription | Sales Dir |
| Startup early-stage (< 2 tahun, < USD 1M funding) | -30 % | Sales Dir |
| Reseller channel (Year 2+) | 30 % | Founder |
| Bundle (chat + voice + Studio) | -15 % paket | Auto |

**Hard floor**: tidak boleh dijual di bawah COGS + 30 % margin. Track COGS quarterly.

---

## 9. Free Tier Strategy — Untuk Apa?

Free tier bukan loss-leader — ini **akuisisi + funnel + advokat**:

| Manfaat | Mekanisme |
|---|---|
| User acquisition murah | Dev share di Twitter / forum, UMKM share di komunitas |
| Product feedback | 10× lebih banyak data quality bahasa daerah real |
| Community building | Discord ramai → vendor cred di mata enterprise |
| Sales enablement | "Sudah dipakai 5.000 dev + 2.000 UMKM" sebagai social proof B2B |
| Talent attraction | Engineer suka kerja di tempat yang produknya beneran dipakai |

**Limit guardrails** supaya tidak overrun:
- IP rate limit + email verification
- Penyalahgunaan → auto-degrade ke 30 req/menit
- Bot/abuse detection setelah Rp 30rb credit terbakar di < 1 jam

---

## 10. Unit Economics Snapshot

| Track | Avg ARPU/bln | CAC | Payback | LTV (3 tahun) | LTV/CAC |
|---|---|---|---|---|---|
| Self-serve PAYG (Andre) | Rp 200-800rb | Rp 25rb | < 1 bln | Rp 8-30jt | 320× |
| Subscription (Mas Eko) | Rp 150rb avg | Rp 50rb | 1 bln | Rp 4-8jt | 80× |
| Enterprise B2B (Bu Sari) | Rp 60-100jt | Rp 15jt | 3-4 bln | Rp 1,5-3 M | 100× |
| B2G (Pak Bambang) | Rp 30-150jt | Rp 30jt | 6 bln | Rp 1,2-5 M | 60× |

Catatan: Y1 fokus 70 % effort di Self-serve + Subscription (cycle pendek, modal CAC rendah) untuk membiayai sales B2B/B2G Y2+.

---

## 11. Roadmap Pricing (24 Bulan)

| Fase | Pricing fokus | Tujuan |
|---|---|---|
| Bulan 1-6 | Free + PAYG Builder + Starter | Akuisisi developer + UMKM awal |
| Bulan 4-9 | Tambah Pro + Business subscription | Up-tier UMKM, mulai B2B PoC |
| Bulan 6-12 | Enterprise SaaS + B2B PoC formal | Land 3-5 enterprise pilot |
| Bulan 9-15 | B2G pilot + tender prep | Win 3-5 pemda |
| Bulan 12-18 | On-prem + multi-year contract | Stabilkan recurring B2G + B2B |
| Bulan 18-24 | ASEAN pricing (USD) + reseller | Ekspansi regional |

---

## 12. Pricing Page Copy (Snippet untuk Website)

```
Bayar sesuai pemakaian. Mulai gratis hari ini.

[Hacker] Rp 0
- Coba semua bahasa Nusantara
- Rp 50rb credit gratis
- Komunitas Discord

[Builder] Pay-as-you-go
- Mulai dari Rp 5 / 1.000 token
- Voice + Chat + Studio API
- 50 % lebih hemat dari OpenAI
- Volume discount otomatis

[Studio Starter] Rp 99rb / bulan
- 1 bot WhatsApp di bahasa pilihanmu
- 2.000 pesan / bulan
- Setup 5 menit tanpa coding

[Enterprise] Hubungi Sales
- SLA 99,9 %
- On-prem atau private cloud
- Compliance UU PDP + ISO 27001
- Dedicated success manager
```

---

*Pricing ini hypothesis. A/B test landing page + interview 20 prospect per persona sebelum lock-in. Review quarterly.*
