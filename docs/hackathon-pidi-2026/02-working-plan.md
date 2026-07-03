# 02 — Working Plan NusaLingua

> Rencana kerja dua lapis: **(A)** sprint menuju submission & demo hackathon, dan **(B)** roadmap eksekusi 6 bulan (jangka yang diminta template: _"realistis dibangun dalam 6 bulan–1 tahun ke depan"_).
> Konteks tanggal: disusun **3 Juli 2026**. Ganti `[DEADLINE]` dengan tanggal submission resmi PIDI.

**(EN summary)** Two-layer plan: a short sprint to make the submission + demo bullet-proof, then a 6-month roadmap that turns the working MVP into a revenue-ready pilot. Priorities: lock the honest positioning, ship billing + API keys, run 3–5 UMKM / 1–2 Pemda pilots, and record a clean Javanese-_krama_ demo.

---

## BAGIAN A — Sprint Submission & Demo (menuju `[DEADLINE]`)

**Sprint Goal:** submission lengkap + demo 3 menit bebas error, dengan positioning yang konsisten (application layer, bukan foundation-model builder).

### A0. Keputusan strategis (½ hari) — LAKUKAN DULU

- [ ] **Sepakati positioning** = _culture-aware application/orchestration layer di atas LLM berdaulat_. Terapkan konsisten di semua dokumen (lihat memo gap di [README](./README.md)).
- [ ] **Pilih problem statement final**: #3 → Ekspor Jasa Digital → **#4 Otomatisasi CS Multibahasa + #5 Local Language AI (LLM)**.
- [ ] **Satukan tabel harga** jadi satu versi (lihat [`03-business-model.md`](./03-business-model.md) §Revenue).
- [ ] **Isi identitas tim**: nama tim, anggota + peran, institusi/afiliasi (atau rencana advisor).

### A1. Kesiapan produk untuk demo (1–2 hari)

| Prio | Item                                                                            | Definition of Done                              |
| ---- | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| P0   | Set `SEA_LION_API_KEY` di produksi + smoke test Chat/Voice/Translate            | 8 skenario di `PRODUCTION-PLAN.md` Fase 7 hijau |
| P0   | Siapkan akun demo + prompt contoh (krama Jawa, CS UMKM, layanan Pemda)          | Login sekali klik, skrip demo tersimpan         |
| P0   | Guardrail biaya: OpenAI usage limit ($20/bln) + token voice singkat             | Tak bisa membengkak saat rekaman                |
| P1   | Uji `nusalingua.my.id` di jaringan lambat (juri bisa buka)                      | FCP < 2.5s, tidak blank                         |
| P2   | (Opsional) mapping model "nusalingua-core-\*" fiktif → provider nyata di Studio | Tidak ada nama model menyesatkan                |

### A2. Materi submission (2–3 hari)

- [ ] Isi proposal dari [`04-proposal-draft.md`](./04-proposal-draft.md) → template resmi (patuhi batas karakter).
- [ ] **Business Model Canvas** (wajib di template hal. 14) → ekspor dari [`03-business-model.md`](./03-business-model.md) sebagai 1 gambar.
- [ ] Lampiran: 4–6 screenshot (Chat krama, Voice transcript, Studio, Translate, Explorer, Pricing).
- [ ] **Bukti masalah**: screenshot uji ChatGPT salah krama vs NusaLingua benar (side-by-side) — bukti paling meyakinkan.
- [ ] Nama file PDF sesuai aturan: `NamaTim_NamaKetua_Proposal Hackathon dan Digdaya 2026.pdf`.

### A3. Video pitch 3 menit (2 hari)

Struktur (dari `BRAINSTORMING-DESIGN-THINKING.md`, sudah bagus):

1. **Masalah (30 dtk)** — "Minta ChatGPT bicara _krama_ ke simbah — pasti salah. 80 juta orang Jawa berhak dimengerti AI."
2. **Solusi (30 dtk)** — NusaLingua: chat/voice/translate 100+ bahasa, paham tingkat tutur, ditenagai AI Indonesia.
3. **Demo (90 dtk)** — Chat krama vs ChatGPT → Translate → Voice → Explorer.
4. **Dampak & Bisnis (30 dtk)** — 1 mitra hemat ±Rp18jt/th (ilustratif); freemium + API ekspor ASEAN.

### Checklist "siap submit"

- [ ] Positioning konsisten (tak ada klaim "latih LLM sendiri" sebagai MVP)
- [ ] Angka bertanda ilustratif/tervalidasi dengan jujur
- [ ] Demo bebas error (smoke test lulus)
- [ ] BMC + screenshot terlampir
- [ ] Batas karakter tiap field dipatuhi

---

## BAGIAN B — Roadmap Eksekusi 6 Bulan (pasca-hackathon)

Prinsip: **cash flow cepat dari self-serve (UMKM + developer)** membiayai sales B2B/B2G yang lebih lambat. Tunda training model & ekspansi ASEAN.

### Fase 1 — Hardening & Monetisasi Dasar (Bulan 1–2)

**Tujuan:** ubah MVP jadi produk yang bisa menagih.

| Milestone                     | Deliverable                                                       | Owner     | Indikator sukses                           |
| ----------------------------- | ----------------------------------------------------------------- | --------- | ------------------------------------------ |
| Billing hidup                 | Integrasi Xendit/Midtrans (QRIS/GoPay/Dana) + enforcement kuota   | Tech Lead | 1 transaksi Pro nyata berhasil             |
| API keys                      | Endpoint CRUD `api_keys` + halaman dashboard + rate limit per-key | Tech Lead | Developer bisa terbitkan key & panggil API |
| Rate limiting app-level       | Per-user/IP untuk chat & voice                                    | Tech Lead | Abuse & biaya terkendali                   |
| Trial → konversi              | Reminder trial + modal upgrade                                    | Product   | Funnel Free→Pro terukur                    |
| Pilih model default berdaulat | Set SEA-LION/Sahabat-AI sebagai default chat di prod              | Tech Lead | Narasi "AI Indonesia" jadi nyata di produk |

### Fase 2 — Validasi Pasar & Pilot (Bulan 2–4)

**Tujuan:** bukti permintaan (yang diminta bagian "Evidence of Demand" & "Market Validation").

| Milestone              | Deliverable                                     | Owner              | Indikator sukses                            |
| ---------------------- | ----------------------------------------------- | ------------------ | ------------------------------------------- |
| 3–5 pilot UMKM         | Bot WA CS batik/kuliner Solo/Yogya (via Studio) | Business + Product | Deflect ≥50% pertanyaan rutin; ≥1 testimoni |
| 1–2 pilot Pemda/UPT    | PoC chatbot layanan publik bahasa daerah        | Business           | ≥1 LOI/MoU                                  |
| Beta API developer     | 20 developer coba API + Discord komunitas       | Tech + DevRel      | 20 dev aktif; ≥1 aplikasi pihak ketiga      |
| Riset validasi         | 15 wawancara penutur + uji A/B vs ChatGPT       | Business           | ≥70% nilai output NusaLingua lebih tepat    |
| Loop kontribusi bahasa | Form koreksi native speaker → perbaikan prompt  | Product            | 2–3 advisor native (UGM/Unpad/Unhas)        |

### Fase 3 — Kualitas, Compliance, Skala Awal (Bulan 4–6)

**Tujuan:** siap jual ke B2B/B2G & mulai recurring revenue.

| Milestone                | Deliverable                                                                     | Owner           | Indikator sukses                         |
| ------------------------ | ------------------------------------------------------------------------------- | --------------- | ---------------------------------------- |
| Studio flow execution    | Eksekusi node (condition/branch/llm_call), bukan sekadar systemPrompt           | Tech Lead       | Bot bercabang jalan di produksi          |
| Deploy channel           | Webhook WhatsApp Business + Telegram                                            | Tech Lead       | Bot Studio live di WA                    |
| Compliance foundation    | PSE Kominfo, PT/NIB, DPA template, Privacy Policy final, ISO 27001 gap-analysis | Founder + Legal | Sales kit compliance siap                |
| Data residency Indonesia | Opsi hosting DC Indonesia (Biznet Gio/IDC) untuk B2G                            | Tech Lead       | 1 penawaran B2G dengan data di Indonesia |
| MRR pertama              | Bauran Pro + API + 1 kontrak enterprise/B2G kecil                               | Semua           | **MRR > Rp0**, minimal 1 kontrak         |

### Fase 4 — (Opsional, >6 bulan) R&D Kedaulatan Model

Hanya setelah ada traksi & funding: fine-tune ringan (LoRA) untuk bahasa daerah spesifik, atau kemitraan riset (BRIN/kampus). **Ini jawaban jujur untuk "kalau punya dana lebih"**, bukan klaim MVP.

---

## KPI (18 bulan, disesuaikan dari SWOT lama agar realistis)

| Kategori      | Metrik                                       | Target                       | Kapan       |
| ------------- | -------------------------------------------- | ---------------------------- | ----------- |
| Produk        | Akurasi/ketepatan output bahasa (uji native) | ≥85% (Jawa/Sunda/ID)         | Bulan 6     |
| Produk        | Latency p95 chat                             | < 2 dtk                      | Bulan 3     |
| Adopsi        | Developer aktif API                          | 1.000+                       | Bulan 6–12  |
| Adopsi        | MAU                                          | 10.000+                      | Bulan 24    |
| Komersial     | Pilot berbayar / LOI                         | 3–5 UMKM + 1–2 Pemda         | Bulan 4     |
| Komersial     | MRR pertama                                  | > Rp0 (target Rp10–30jt/bln) | Bulan 6     |
| Komersial     | Klien enterprise/B2G                         | 3–5                          | Bulan 12–18 |
| Dampak sosial | Bahasa daerah terkurasi ("live")             | 8 → 15                       | Bulan 12    |

_Catatan: target BEP bulan 18 & revenue API Rp500jt tahun-1 dari SWOT lama bersifat **ilustratif** — pertahankan sebagai aspirasi, bukan janji. Validasi willingness-to-pay dulu._

---

## Manajemen risiko eksekusi

| Risiko                                                        | Dampak | Mitigasi                                                                      |
| ------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| Tim inti 1 orang → bottleneck                                 | Tinggi | Ikut akselerator (Indigo Telkom/BRIN); rekrut co-founder/advisor; scope ketat |
| Kualitas bahasa _tail_ rendah                                 | Sedang | Mulai dari Jawa/Sunda/ID; loop koreksi komunitas; jangan overclaim            |
| Biaya voice realtime membengkak                               | Sedang | Mode Hemat gratis sebagai default; kuota; usage limit OpenAI                  |
| Ketergantungan API eksternal (SEA-LION rate limit 10rpm free) | Sedang | Hybrid SEA-LION+Groq; caching; upgrade tier saat traksi                       |
| Adopsi lambat (skeptis "AI lokal")                            | Tinggi | Fokus 1 wedge tajam (krama untuk creator/UMKM); bukti A/B; testimoni pilot    |
| Regulasi PDP/AI berubah                                       | Sedang | Compliance-by-design; roadmap sertifikasi; legal retainer                     |

---

## Referensi

- Sprint go-live teknis detail → `SPRINT-PLAN.md`, `PRODUCTION-PLAN.md`.
- Roadmap 3 fase versi tim → `BRAINSTORMING-DESIGN-THINKING.md` (Execution Roadmap).
- Compliance timeline → `docs/strategy/TRUST-COMPLIANCE.md`.
- Model bisnis & unit economics → [`03-business-model.md`](./03-business-model.md).
