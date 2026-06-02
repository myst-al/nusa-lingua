# NusaLingua — User Personas

> 4 persona primary yang menjadi target NusaLingua MVP. Setiap persona berbasis riset desk + interview asumsi (validasi lapangan dijadwalkan post-hackathon). Format: Job-to-be-Done (JTBD) + Pain/Gain + Channel.

| Field | Value |
|---|---|
| Document ID | NSL-STR-001 |
| Version | 1.0 |
| Owner | Product Lead (Albert Ade Kristadeo) |
| Last Review | 2026-05-25 |

---

## Persona 1 — Pak Bambang Hartono (B2G)

**Profil singkat**

| Item | Detail |
|---|---|
| Nama persona | Pak Bambang Hartono |
| Jabatan | Kepala Diskominfo Pemkot Bandung |
| Umur | 48 tahun |
| Latar belakang | S2 Magister Sistem Informasi, ASN 18 tahun, pernah ikut workshop Smart City Korea |
| Segmen | **B2G (Pemerintah Daerah)** |
| Anggaran tahunan IT | Rp 12 miliar |
| Tim digital | 24 staf (4 dev internal, sisanya operator) |

**Job-to-be-Done (JTBD)**

> "Bantu warga Bandung dapat informasi pelayanan publik **24/7 dalam bahasa Sunda dan Indonesia**, tanpa harus tambah headcount Call Center."

**Pain (yang menyiksa sekarang)**

1. Vendor chatbot existing (vendor BUMN) hanya paham Bahasa Indonesia formal → warga kampung sering bingung
2. Resolution rate chatbot di bawah 40 % — banyak escalation ke CS manusia, biaya naik
3. Data warga harus tetap di Indonesia (UU PDP + Permenkominfo) — vendor cloud asing sulit di-procure
4. Audit BSSN tiap tahun — vendor SaaS asing susah lulus
5. Tekanan dari Walikota untuk "AI-kan layanan" tapi dia tidak yakin teknologi mana yang fit

**Gain (yang dia inginkan)**

1. KPI Diskominfo (CSAT layanan publik) naik dari 72 % ke ≥ 85 %
2. Cost per ticket turun minimal 30 %
3. Bisa demo ke Walikota dengan bahasa Sunda — politik internal yang menguntungkan
4. Lulus audit BSSN tanpa drama
5. Bisa di-replikasi ke kabupaten lain (career growth: "ini program Pak Bambang")

**Trigger** (kapan dia akan beli?)
- Mendekati anggaran akhir tahun (Q4) — sisa pagu yang harus diserap
- Setelah artikel media lokal mengeluh CS pemkot lambat
- Setelah rekomendasi dari kepala Diskominfo daerah lain (lobi peer-to-peer)

**Channel preferensi**
- Pertemuan tatap muka + demo on-site (preferred — gaya birokrat)
- Whatsapp formal (bukan email)
- Workshop Smart City Indonesia (event tahunan AKKOPSI)
- Rekomendasi dari Kemendagri / KemenPAN-RB

**Pesan yang resonate**
- "Lulus audit BSSN, data tetap di Indonesia"
- "Hemat 50 % vs vendor asing"
- "Open-source, bisa di-audit, bisa di-on-prem"
- "Sudah dipakai Pemkot X dan Y"

**Anti-pesan** (jangan dipakai)
- "Cutting-edge AI" → kesan over-engineered
- "Disruptive" → konotasi mengganggu birokrasi
- Demo 100 % bahasa Inggris

---

## Persona 2 — Bu Sari Wulandari (B2B Enterprise)

**Profil singkat**

| Item | Detail |
|---|---|
| Nama persona | Bu Sari Wulandari |
| Jabatan | Head of Customer Experience, bank menengah (aset Rp 80T) |
| Umur | 41 tahun |
| Latar belakang | MBA luar negeri, ex-consultant Big-4, 8 tahun di banking digital |
| Segmen | **B2B Enterprise** |
| Anggaran proyek | Rp 800 jt - 2 M per inisiatif |
| Tim | 12 product manager + 30 contact center agent + 2 ML eng |

**JTBD**

> "Buat customer service bank kami **bisa melayani nasabah daerah dalam bahasa lokal mereka** (Jawa, Sunda, Batak), supaya NPS naik dan churn turun — tanpa melanggar compliance OJK/BSSN."

**Pain**

1. Vendor existing (OpenAI / Anthropic) bagus tapi data nasabah harus dikirim ke US — issue compliance OJK
2. Solusi lokal (vendor BUMN) feature-nya kurang, latency tinggi
3. Bahasa daerah hanya tersedia di vendor riset akademik — bukan production-grade
4. Cost OpenAI sudah Rp 60 jt/bulan dan terus naik
5. Sertifikasi ISO 27001 + SOC 2 vendor masih PR
6. Pressure dari Direksi: "AI strategy" tapi anggaran ketat

**Gain**

1. NPS contact center naik dari 32 → ≥ 50
2. First-Call Resolution naik dari 65 % → ≥ 80 %
3. Cost per conversation turun 40 %
4. Data residency di Indonesia (compliance hijau)
5. Vendor relationship yang bisa dia "sell" ke board

**Trigger**
- Audit OJK tahunan (Q1-Q2) menemukan gap data residency
- Komplain nasabah kampung di media sosial (PR risk)
- Kompetitor (bank besar) launch fitur multibahasa duluan

**Channel preferensi**
- LinkedIn (warm intro lebih efektif daripada cold)
- Webinar enterprise (AWS Summit, FinTech Indonesia)
- Conference Asia Pacific Customer Experience
- Email proposal formal + NDA siap

**Pesan yang resonate**
- "Data residency Indonesia by design"
- "On-prem deployment option (private cloud)"
- "SOC 2 Type II + ISO 27001 roadmap"
- "API kompatibel OpenAI — swap dalam 1 hari"
- "Cost 40-50 % lebih hemat"

**Anti-pesan**
- "Free tier" → kesan tidak serius enterprise
- Demo pakai use-case UMKM → tidak relevan
- "Powered by GPT" → defeat the purpose

---

## Persona 3 — Mas Eko Prasetyo (B2C / SMB)

**Profil singkat**

| Item | Detail |
|---|---|
| Nama persona | Mas Eko Prasetyo |
| Jabatan | Owner Batik Online Shop "EkoBatik Solo" |
| Umur | 33 tahun |
| Latar belakang | Lulusan SMK, otodidak digital marketing, 6 tahun jualan online |
| Segmen | **UMKM / SMB (Self-serve)** |
| Omzet bulanan | Rp 80 jt - 150 jt |
| Channel utama | Shopee, Tokopedia, WhatsApp Business, Instagram |

**JTBD**

> "Bantu saya jawab **pertanyaan pelanggan di WhatsApp 24/7 dalam bahasa Jawa & Indonesia campuran** (gaya percakapan asli pelanggan), supaya saya nggak kewalahan dan order tidak hilang malam hari."

**Pain**

1. WA Business agent template kaku, tidak natural ke pelanggan kampung Jawa
2. Ditanya "regane piro mas?" jawaban autobot "Selamat datang di EkoBatik" → pelanggan kabur
3. ChatGPT bagus tapi Rp 300rb/bulan + harus copy-paste manual dari WA → nggak efisien
4. Sudah coba bot Indonesia lain — robotic, formal banget, tidak masuk vibe Solo
5. Tidak bisa coding — butuh tools yang **no-code / drag-drop**

**Gain**

1. Response time WhatsApp turun dari 4 jam → < 2 menit
2. Konversi chat → order naik 20 %+
3. Bisa fokus produksi (bukan balas WA terus)
4. Bayar yang murah — max Rp 100rb/bulan
5. Punya "asisten virtual" yang bisa di-pamerin ke komunitas UMKM Solo

**Trigger**
- Peak season (Lebaran, akhir tahun) — order membludak
- Setelah lihat tutorial YouTube "AI buat UMKM"
- Rekomendasi dari grup WA komunitas batik Solo

**Channel preferensi**
- Instagram Reels + TikTok edukasi
- YouTube tutorial step-by-step Indonesia
- Komunitas UMKM offline (Tokopedia Center, Diskop Solo)
- Onboarding self-serve <10 menit (kalau lebih, dia frustrasi)

**Pesan yang resonate**
- "Bot WA yang bisa basa Jowo lho mas"
- "Setup 5 menit, gak perlu coding"
- "Mulai gratis, upgrade kalau udah jalan"
- "Sudah dipakai 1000+ UMKM di Solo & Yogya"

**Anti-pesan**
- "API REST" "SDK" "Webhook" → bahasa developer, scared off
- "Enterprise grade" → bukan dia
- Pricing per token → konfusing

---

## Persona 4 — Andre Wijaya (Developer / Indie Hacker)

**Profil singkat**

| Item | Detail |
|---|---|
| Nama persona | Andre Wijaya |
| Jabatan | Full-stack developer + indie hacker (side project) |
| Umur | 27 tahun |
| Latar belakang | S1 Informatika, 5 tahun pengalaman, aktif di komunitas dev Indonesia |
| Segmen | **Developer / API consumer** |
| Anggaran pribadi side-project | USD 50-200/bulan |
| Tools | VSCode, Vercel, Supabase, OpenAI |

**JTBD**

> "Saya bangun aplikasi voice-AI buat pasar Bali / NTT — saya butuh **API LLM yang paham bahasa daerah dan murah**, dengan SDK yang nggak ribet."

**Pain**

1. OpenAI murah di awal, lalu mahal saat trafik naik (kena rate limit + harga)
2. Output GPT-4 di bahasa Bali/Sasak campur Inggris — tidak natural
3. Vendor lokal: dokumentasi jelek, SLA tidak jelas, support lambat
4. Tidak ada API LLM yang punya endpoint Bali / Sasak benar-benar
5. Sulit dapat funding side-project → cost obsessed

**Gain**

1. Token cost 50 % lebih murah dari OpenAI
2. SDK Node.js + Python clean (mirip OpenAI client — drop-in)
3. Dokumentasi yang dia bisa langsung copy-paste
4. Bahasa daerah benar (validated by native speaker)
5. Free credit Rp 50rb buat coba
6. Komunitas Discord / Telegram aktif

**Trigger**
- Lihat tweet / Threads developer Indonesia review NusaLingua
- Cost OpenAI bill spike — googling "alternatif murah"
- Project ada deadline → butuh solusi cepat
- Lihat di Product Hunt

**Channel preferensi**
- Twitter / X + Threads developer Indonesia
- Hacker News + Reddit r/indonesia r/MachineLearning
- GitHub README + star
- Tech blog Medium / Dev.to
- Discord channel komunitas

**Pesan yang resonate**
- "OpenAI-compatible API, 50 % cheaper"
- "First-class Bali, Jawa, Sunda support"
- "5 min quickstart, copy-paste ready"
- "Open-source SDK, self-host option"
- "Free Rp 50rb credit, no card"

**Anti-pesan**
- "Hubungi sales untuk pricing" → lari
- Hanya doc Bahasa Indonesia → dia preferensi English untuk teknis
- Vendor lock-in tanpa opsi self-host

---

## Ringkasan: Mapping Persona vs Pilar Produk

| Persona | Studio (no-code) | Chat API | Voice WebRTC | Self-serve | Enterprise sales |
|---|---|---|---|---|---|
| Pak Bambang (B2G) | ✅ — sekretariat isi konten | ✅ — backend Diskominfo | ⏭️ Phase 2 | ❌ | ✅ Primary channel |
| Bu Sari (B2B Bank) | ⚠️ Light use | ✅ Primary | ⏭️ Phase 2 | ❌ | ✅ Primary channel |
| Mas Eko (UMKM) | ✅ **PRIMARY** | ⚠️ Via Studio | ❌ | ✅ Primary | ❌ |
| Andre (Dev) | ❌ | ✅ **PRIMARY** | ✅ | ✅ Primary | ❌ |

---

## Ukuran Pasar per Persona (TAM/SAM/SOM)

| Persona | TAM | SAM (5 tahun) | SOM (Year 1) |
|---|---|---|---|
| Pak Bambang | 542 pemda + 88 K/L = 630 entitas | 200 pemda + 30 K/L = 230 | 5 pemda pilot |
| Bu Sari | ~1.200 perusahaan enterprise IDX | 300 perusahaan | 3 enterprise pilot |
| Mas Eko | 65 juta UMKM | 4 juta UMKM digital aktif | 1.000 UMKM aktif |
| Andre | 1,2 juta developer Indonesia | 200rb dev aktif di AI | 1.000 developer aktif |

---

## Validation Plan (post-hackathon)

| Persona | Cara validasi | Target sample |
|---|---|---|
| Pak Bambang | Interview 5 Kadis Kominfo + survei Diskominfo nasional | 30 respon |
| Bu Sari | Interview 5 Head CX bank + 3 telco | 15 respon |
| Mas Eko | FGD komunitas UMKM Solo + survei via grup WA | 50 respon |
| Andre | Survei Twitter dev Indonesia + 20 1-on-1 | 200 respon |

Hasil validasi → update persona ini setiap kuartal.

---

*Persona ini bukan stereotipe — ini hypothesis kerja. Sebut nama mereka di setiap diskusi produk supaya konkret.*
