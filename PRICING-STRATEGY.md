# NusaLingua — Strategi Harga (Pricing)

> Dokumen pendukung PIDI DIGDAYA 2026. Harga **indikatif** (Rupiah), perlu validasi pasar sebelum komersialisasi.
> Halaman publik tersedia di `/pricing`.

## 1. Filosofi

Tiga prinsip yang menyetir harga NusaLingua:

1. **Adopsi luas dulu, monetisasi kemudian.** Tier Gratis sengaja murah-hati supaya pelajar, UMKM, dan komunitas bisa memakai AI berbahasa daerah tanpa hambatan — ini sekaligus misi sosial "mengangkat bahasa daerah ke era digital".
2. **Monetisasi di tempat yang bernilai tinggi.** Pendapatan inti dari **Pro** (individu/UMKM) dan **Enterprise** (pemda, perusahaan, instansi), serta **API** untuk developer yang membangun layanan ekspor.
3. **Selaras tema DIGDAYA — ekspor layanan digital.** API berbasis pemakaian dalam Rupiah + setara USD agar developer ASEAN/global bisa membangun di atas AI bahasa Nusantara.

## 2. Basis biaya (COGS)

| Komponen | Biaya | Implikasi harga |
|---|---|---|
| Chat & Terjemahan | ~Rp0 (SEA-LION/Sahabat-AI & Groq gratis); skala besar pakai LLM berbayar ≈ $0,0004/1.000 token | **Margin sangat tinggi** → boleh murah & "tanpa batas wajar" |
| Voice realtime (OpenAI) | ~$0,30/menit (≈ Rp4.800) — **komponen termahal** | **Dibatasi & di-premium-kan**; di Gratis pakai "Mode Hemat" (Web Speech, $0) |
| Infrastruktur | VPS ~$6–12/bln, Supabase Free→Pro $25, domain | Tetap rendah; tertutup mulai puluhan pelanggan Pro |

**Kesimpulan:** teks (chat/terjemah) = mesin margin; voice realtime = biaya nyata yang harus dikontrol lewat kuota & harga premium. Mode Hemat menjaga voice tetap bisa "gratis" tanpa membakar biaya.

## 3. Tier konsumen

| | **Gratis** | **Pro** | **Enterprise** |
|---|---|---|---|
| Harga | Rp0 | **Rp49.000/bln** (tahunan Rp490.000 ≈ Rp40.800/bln, hemat 2 bln) | Custom (hubungi) |
| Target | Coba, pelajar, komunitas | Individu & UMKM | Pemda, perusahaan, instansi |
| Chat & Terjemah | 50/hari | Tanpa batas wajar | Tanpa batas + kustom |
| Bahasa | 8 utama | Semua 100+ | Semua + bahasa kustom/fine-tune |
| Tingkat tutur | Dasar | Lengkap (krama/ngoko, lemes/loma) | Lengkap |
| Voice | Mode Hemat (gratis) | + Realtime 60 mnt/bln | Realtime sesuai SLA |
| Studio (bot) | 1 | 10 | Tak terbatas |
| API | — | 100rb token/bln | Volume + diskon |
| Lain | Dukungan komunitas | Riwayat, ekspor, prioritas email | SSO, on-prem/VPC, SLA, dedicated |

**Uji coba:** setiap pendaftar baru otomatis mendapat **Pro gratis 14 hari** (tanpa kartu kredit) untuk mendorong konversi Gratis -> Pro.

**Rasional harga Pro Rp49.000:** terjangkau untuk pasar massal Indonesia (setara ~2 gelas kopi), cukup menutup biaya + margin sehat karena COGS teks ~0. Kuota voice 60 mnt/bln membatasi paparan biaya termahal.

## 4. API developer (bayar sesuai pakai)

**Gratis tiap bulan:** 100.000 token + 50.000 karakter terjemahan (untuk mencoba).

| Layanan | Satuan | Harga | Setara USD |
|---|---|---|---|
| Chat / Generasi teks | per 1.000 token | **Rp12** | ~$0,0008 |
| Terjemahan | per 1.000 karakter | **Rp20** | ~$0,0013 |
| Voice realtime | per menit | **Rp7.000** | ~$0,44 |

**Contoh tagihan** — chatbot CS UMKM, ~500 percakapan/hari × 30 hari × ~1.000 token ≈ **15 juta token/bln → ±Rp180.000/bln.**

**Diskon volume (Enterprise):** >10 juta token/bln −20%, >100 juta −35% (indikatif, dinegosiasikan).

**Rasional:** harga chat Rp12/1.000 token ≈ 2× biaya LLM berbayar termurah, namun mendekati margin penuh saat memakai model lokal gratis (SEA-LION/Groq). Cukup untuk **memotong harga LLM asing** pada tugas bahasa Indonesia & daerah, sambil tetap untung.

## 5. Positioning vs LLM asing

- **Lebih murah** untuk tugas bahasa Indonesia/daerah dibanding OpenAI/Anthropic.
- **Lebih paham konteks lokal** (tingkat tutur, budaya) — model dilatih untuk Nusantara.
- **Kedaulatan data**: bisa di-host di Indonesia/ASEAN, opsi on-prem/VPC untuk instansi pemerintah.
- **Bahasa daerah**: cakupan 100+ bahasa Nusantara yang tidak dilayani vendor global.

## 6. Proyeksi ilustratif (asumsi, bukan janji)

Skenario konservatif tahun pertama pasca-launch:

| Sumber | Asumsi | Pendapatan/bln |
|---|---|---|
| Pro | 10.000 user gratis, konversi 3% = 300 × Rp49.000 | ±Rp14,7 jt |
| Enterprise | 5 klien × Rp5 jt | ±Rp25 jt |
| API | 20 developer aktif × ±Rp250rb | ±Rp5 jt |
| **Total** | | **±Rp44,7 jt/bln (±Rp536 jt/tahun)** |

Angka **murni ilustrasi** untuk menunjukkan model bisnis; butuh validasi go-to-market.

## 7. Asumsi & catatan

- Harga indikatif Juni 2026; biaya provider (OpenAI/Supabase) & kurs bisa berubah.
- "Tanpa batas wajar" = fair-use policy untuk cegah penyalahgunaan.
- Mata uang utama Rupiah; penawaran USD untuk pasar ekspor di paket Enterprise & API.
- Sebelum komersial: validasi willingness-to-pay (survei UMKM/pemda), uji konversi Gratis→Pro, dan finalisasi biaya provider pada skala.
