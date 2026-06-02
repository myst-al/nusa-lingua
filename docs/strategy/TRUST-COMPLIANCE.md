# NusaLingua — Pilar Trust & Compliance

> Pilar ke-6 di proses bisnis NusaLingua (melengkapi 5 pilar di [SWOT-BusinessProcess](../../../NusaLingua-SWOT-BusinessProcess.html)). Compliance bukan beban — ini moat kompetitif terhadap vendor asing.

| Field | Value |
|---|---|
| Document ID | NSL-STR-003 |
| Version | 1.0 |
| Owner | CTO + Legal/Compliance Lead |
| Last Review | 2026-05-25 |

---

## 1. Mengapa Compliance = Moat

Vendor asing (OpenAI, Anthropic) **tidak bisa** memenuhi 3 hal sekaligus:

1. Data residency 100 % di Indonesia (UU PDP)
2. Audit on-prem oleh BSSN
3. Bahasa daerah Nusantara native quality

NusaLingua bisa = **monopoli niche** untuk segmen B2G + bank teratur.

---

## 2. Regulasi yang Relevan

### 2.1 UU No. 27 Tahun 2022 — Pelindungan Data Pribadi (UU PDP)

| Pasal | Implikasi untuk NusaLingua | Status kepatuhan kita |
|---|---|---|
| Pasal 16-18: Hak subjek data | User bisa akses, koreksi, hapus, portable data | ✅ MVP support delete cascade |
| Pasal 20-26: Kewajiban controller | Lawful basis, transparansi, akurasi | ✅ Privacy Policy + Consent flow |
| Pasal 31: Cross-border transfer | Hanya ke negara dengan tingkat perlindungan setara | ⏳ Default Indonesia-only |
| Pasal 35: Notifikasi pelanggaran | 3×24 jam ke Lembaga PDP + subjek | ⏳ Incident response runbook ada |
| Pasal 53: Sanksi administratif | Hingga 2 % omzet tahunan | ⚠️ Insurance E&O dijaga |
| Pasal 67-73: Sanksi pidana | Hingga 6 tahun penjara + denda 6 M | ⚠️ Compliance officer wajib |

**Tindak lanjut**:
- DPO (Data Protection Officer) wajib ditunjuk bulan 6 (saat user > 10rb)
- DPIA (Data Protection Impact Assessment) untuk fitur high-risk: voice transcript, fine-tune
- DPA (Data Processing Agreement) template ready untuk B2B/B2G

### 2.2 Perpres No. 68/2024 — Strategi Kecerdasan Buatan Nasional

| Klausul | Implikasi |
|---|---|
| Prioritas AI berbahasa Indonesia | NusaLingua eligible untuk dukungan pemerintah |
| Kedaulatan data | On-prem option wajib untuk klien B2G |
| Pengembangan ekosistem | Open-source release komponen non-core |

### 2.3 Permenkominfo No. 5/2020 — PSE Lingkup Privat

| Klausul | Implikasi |
|---|---|
| Pendaftaran PSE | NusaLingua wajib daftar saat layanan komersial (Bulan 3) |
| Take-down 24 jam (4 jam untuk darurat) | SOP konten moderasi ada |
| Akses ke data oleh penegak hukum | Legal request playbook |

### 2.4 POJK 11/POJK.03/2022 — Penyelenggaraan Teknologi Informasi Bank Umum

Berlaku untuk klien Bu Sari:

| Klausul | Implikasi |
|---|---|
| TKO (Teknologi Kritis & Operasional) | Penyedia layanan kritis perbankan butuh sertifikat OJK |
| Risk assessment vendor | Klien bank wajib due-diligence NusaLingua |
| Disaster Recovery | RTO ≤ 4 jam, RPO ≤ 1 jam |

### 2.5 BSSN — Standar Pengamanan Siber

| Item | Standar | Status |
|---|---|---|
| Sandi/kripto SNI 7873/8369 | TLS 1.3 + at-rest AES-256 | ✅ |
| Sertifikasi ITSE (Indonesia Trusted Security Evaluation) | Untuk produk B2G strategis | ⏳ Roadmap bulan 12 |
| ISO/IEC 27001 | Sistem manajemen keamanan info | ⏳ Audit gap-analysis bulan 6, sertifikasi bulan 12-15 |
| SOC 2 Type II | Untuk klien international | ⏳ Bulan 15-18 |

---

## 3. Roadmap Kepatuhan (24 Bulan)

### Q1 (Bulan 1-3) — Foundation
- ✅ Privacy Policy + Terms of Service (Indonesia + English)
- ✅ Consent flow di signup (granular: marketing, analytics, AI training)
- ✅ Encryption at-rest (Supabase default) + TLS 1.3 (Let's Encrypt)
- ⏳ Pendaftaran PSE Kominfo
- ⏳ Pendaftaran NIB + PT setup
- ⏳ DPA template untuk klien B2B/B2G
- ⏳ Incident Response Runbook

### Q2 (Bulan 4-6) — Operationalize
- ⏳ Tunjuk DPO (internal atau outsource)
- ⏳ DPIA untuk fitur voice (transcript handling)
- ⏳ Vendor risk assessment (OpenAI, Supabase) → DPA mereka
- ⏳ Audit log retention 12 bulan
- ⏳ Penetration test eksternal (vendor lokal: Xynexis, Spentera)
- ⏳ ISO 27001 gap analysis + remediation plan

### Q3-Q4 (Bulan 7-12) — Certify
- ⏳ ISO 27001 sertifikasi (lead time 6-9 bulan)
- ⏳ Sertifikat ITSE BSSN (untuk B2G)
- ⏳ Bug bounty program (HackerOne / Indonesian researcher)
- ⏳ Backup + DR drill quarterly
- ⏳ Bisnis continuity plan (BCP)

### Year 2 (Bulan 13-24) — Scale
- ⏳ SOC 2 Type II audit (untuk ASEAN export)
- ⏳ PCI-DSS scope review (kalau handle pembayaran langsung)
- ⏳ Privacy-by-design refresh quarterly
- ⏳ Re-sertifikasi ISO 27001 (annual surveillance)

---

## 4. Proses Bisnis "Trust & Compliance" — 5 Sub-Proses

### 4.1 Privacy Operations

```
Subject Request (Akses/Hapus/Portabilitas)
       │
       ├─ Verify identity (MFA + email re-confirm)
       ├─ Route ke DPO untuk review
       ├─ Eksekusi (max 30 hari kalender per UU PDP)
       └─ Audit log + confirmation ke subjek
```

Owner: DPO (R) + Customer Success (C) + Tech Lead (C)

### 4.2 Incident Response

```
Detect (alert / report) → Triage (15 min) → Contain → Eradicate → Recover → Postmortem
        │
        └─ Bila personal data breach: Notif Lembaga PDP < 72 jam + subjek terdampak
```

Severity matrix sama dengan [BUG-TRIAGE](../qa/BUG-TRIAGE.md).
Tambahan kategori: **Privacy Incident** otomatis P0.

### 4.3 Vendor Management

```
Vendor onboarding → Risk assessment (security questionnaire) → DPA signed → Annual review
```

Vendor saat ini:
| Vendor | Tipe data | DPA | Lokasi data |
|---|---|---|---|
| OpenAI | Chat/voice content | Pending (OpenAI Business) | US (gunakan opt-out training) |
| Supabase | User PII, content | ✅ Available | US (region pilih Singapore) |
| Hetzner | Hosting | DPA Hetzner | Germany |
| Stripe/Xendit | Payment | DPA | US/SG |

**Gap**: untuk B2G strict, butuh provider Indonesia. Roadmap bulan 12 — migrate ke Biznet Gio / IDC Indonesia atau setup hybrid.

### 4.4 Audit & Evidence Collection

```
Continuous: log retention + access review
Quarterly: Internal audit sampling
Annually: External ISO 27001 surveillance
On-demand: Client / regulator audit response
```

Tools:
- Audit log: Supabase + custom append-only table
- Evidence repository: Notion vault dengan tag compliance
- Access review: quarterly review semua role + cleanup

### 4.5 Training & Awareness

```
Onboarding: Compliance 101 modul wajib bagi setiap karyawan baru
Quarterly: Phishing simulation + lessons learned
Annual: Refresh PDP + ISO 27001 wajib semua karyawan
```

---

## 5. RACI Compliance

| Aktivitas | DPO | CTO | Founder | Legal Eksternal |
|---|---|---|---|---|
| PDP request handling | R/A | C | I | C |
| Incident response | R | A | I | C |
| ISO 27001 implementasi | C | A/R | I | C |
| Kontrak DPA klien | R | C | A | R |
| Regulator inquiry | R | C | A | C |
| Vendor risk assessment | R | A | I | C |
| Privacy Policy update | R | C | A | R |

---

## 6. KPI Compliance (sinkron dengan [QA Master Plan](../qa/QA-MASTER-PLAN.md))

| Metric | Target | Cadence |
|---|---|---|
| PDP request response time | ≤ 30 hari (target 14 hari) | Real-time |
| Privacy incident MTTD | < 1 jam | Monthly |
| Privacy incident MTTR | < 4 jam (containment) | Monthly |
| Personal data breach reportable | 0 | Annual |
| External audit findings (high) | 0 | Annual |
| Phishing simulation click rate | < 5 % | Quarterly |
| ISO 27001 control coverage | 100 % (semua A.5–A.18) | Continuous |
| Vendor DPA coverage | 100 % vendor yang akses PII | Quarterly |
| Training completion | 100 % karyawan dalam 30 hari onboard | Continuous |

---

## 7. Bujet Compliance Year 1

| Item | Estimasi |
|---|---|
| DPO (outsource part-time atau hire) | Rp 60-180jt/tahun |
| Legal counsel (retainer) | Rp 36-72jt/tahun |
| ISO 27001 gap analysis + consulting | Rp 80-150jt one-time |
| ISO 27001 sertifikasi (auditor) | Rp 60-120jt one-time + Rp 30jt/tahun surveillance |
| Penetration test eksternal | Rp 40-80jt/tahun |
| Bug bounty program (HackerOne) | Rp 50-150jt/tahun (pool) |
| Insurance E&O + Cyber | Rp 30-60jt/tahun |
| **Total Year 1** | **Rp 350-810 jt** |

Justifikasi: 5-10 % dari proyeksi revenue Year 1. Bila skip → tidak bisa win B2G dan B2B bank.

---

## 8. Risiko Compliance (sinkron dengan [QA Master Plan §8](../qa/QA-MASTER-PLAN.md#8-risk-based-testing))

| Risk | Impact | Probability | Mitigasi |
|---|---|---|---|
| Personal data breach via vendor (OpenAI leak) | Critical | Medium | DPA + opt-out training + sensitive data redaction |
| Regulator inquiry tanpa siap | High | Medium | Compliance officer ready + evidence repository |
| Klien B2G batal karena gagal audit BSSN | High | Medium | ISO 27001 + ITSE roadmap; sertifikat sebelum push B2G |
| OpenAI cut akses tiba-tiba | High | Low | Multi-provider abstraksi (sudah designed) |
| Karyawan leak credential | Critical | Low | Vault (1Password) + just-in-time access + audit log |
| LLM output discriminatory / berbahaya | Medium | Medium | Output filter + jailbreak test suite + human review queue |

---

## 9. Integrasi dengan Pilar Lain

| Pilar | Touchpoint compliance |
|---|---|
| Data & Research | Data provenance + consent native speaker; bias audit korpus |
| Model Engineering | Eval set untuk fairness + safety; jailbreak test |
| Platform & Product | Privacy-by-design: minimal data collection, encryption default |
| Go-To-Market | DPA template, sertifikat di sales kit, compliance one-pager |
| Operasi & Support | Incident response, audit log, change management |
| **Trust & Compliance** | Cross-cutting — touch semua pilar di atas |

---

## 10. Sebagai Pesan Eksternal (untuk pitch + sales)

Talking points untuk B2G/B2B:

1. **"Data Anda tidak meninggalkan Indonesia"** — kecuali Anda explicitly opt-in untuk fitur premium tertentu.
2. **"Compliance-first, bukan compliance-tacked-on"** — DPO ditunjuk sejak Bulan 6, ISO 27001 sebelum scale.
3. **"Open-source komponen non-core"** — Anda bisa audit kode kami.
4. **"On-prem deployment tersedia"** — untuk klien strict, jalankan di data center Anda.
5. **"Bug bounty publik aktif"** — komunitas riset keamanan terus uji kami.

---

*Compliance adalah investasi front-loaded. Vendor asing tidak bisa mengejar kita di sini — ini moat utama NusaLingua.*
