# NusaLingua — Bug Triage Matrix

> Cara klasifikasi, prioritisasi, dan SLA penanganan bug. Tujuan: konsisten antara reporter, dev, dan QA — tidak ada bug yang dibiarkan tanpa keputusan.

| Field | Value |
|---|---|
| Document ID | NSL-BT-001 |
| Version | 1.0 |
| Owner | QA Lead |

---

## 1. Severity (dampak teknis)

Seberapa parah bug ini bila terjadi.

| Sev | Label | Kriteria |
|---|---|---|
| **S1** | Critical | Sistem down, data loss/corruption, security breach, semua user terdampak |
| **S2** | High | Fitur utama broken (chat, voice, auth, Studio), workaround sulit |
| **S3** | Medium | Fitur sekunder broken, workaround mudah, ≤ 25 % user terdampak |
| **S4** | Low | Minor UI glitch, typo, edge case langka, tidak menghambat task |

## 2. Priority (urgency bisnis)

Seberapa cepat harus ditangani.

| P | Label | Kriteria |
|---|---|---|
| **P0** | Drop everything | Halt semua kerja → fix sekarang juga |
| **P1** | This sprint | Harus selesai sprint berjalan |
| **P2** | Next sprint | Masukkan backlog sprint berikutnya |
| **P3** | Someday | Acknowledged, dikerjakan bila ada slot luang |

## 3. Severity × Priority Matrix

|        | P0 | P1 | P2 | P3 |
|--------|----|----|----|----|
| **S1** | ✅ Default | (rarely) | ❌ | ❌ |
| **S2** | (escalate) | ✅ Default | (acceptable) | ❌ |
| **S3** | ❌ | (acceptable) | ✅ Default | (acceptable) |
| **S4** | ❌ | ❌ | (acceptable) | ✅ Default |

✅ = mapping wajar · (escalate / acceptable) = boleh tapi perlu justifikasi di tiket · ❌ = mismatch, perlu re-triage

---

## 4. SLA Penanganan

| Priority | First response | Diagnose | Fix deployed |
|---|---|---|---|
| **P0** | ≤ 15 menit | ≤ 1 jam | ≤ 4 jam |
| **P1** | ≤ 4 jam | ≤ 1 hari kerja | ≤ 5 hari kerja |
| **P2** | ≤ 1 hari kerja | ≤ 3 hari kerja | ≤ 2 sprint |
| **P3** | ≤ 1 minggu | Best effort | Best effort |

> Jam = jam kerja (Senin–Jumat 09.00–18.00 WIB) kecuali untuk P0 yang 24/7.

---

## 5. Lifecycle Sebuah Bug

```
[Reported]──→[Triaged]──→[Assigned]──→[In Progress]──→[Code Review]──→[QA Verify]──→[Closed]
    │            │            │             │                                │
    │            └─dup────────┴─wontfix     │                                ↓
    │                                       └─cannot reproduce ──────→ [Need Info]
    │
    └──── invalid / not-a-bug ──→ [Rejected]
```

### Status meaning
| Status | Artinya |
|---|---|
| `reported` | Baru masuk, belum di-triage |
| `triaged` | Severity + priority assigned, menunggu assignee |
| `assigned` | Sudah ada owner dev |
| `in-progress` | Dev sedang ngerjain |
| `code-review` | PR open, menunggu review |
| `qa-verify` | Sudah di staging / branch test, menunggu QA verify fix |
| `closed-fixed` | QA confirm, deployed |
| `closed-dup` | Duplikat tiket existing (link ke parent) |
| `closed-wontfix` | Bug valid tapi diputuskan tidak diperbaiki (kasih alasan) |
| `closed-rejected` | Tidak reproducible, not-a-bug, atau user error |
| `need-info` | Reporter perlu kasih info tambahan (auto-close 14 hari kalau silent) |

---

## 6. Required Info di Setiap Bug Report

Reporter wajib isi minimal:

1. **Judul** — `[area] Ringkasan 1 baris` (mis. `[chat] SSE stream stuck di first token kalau pakai Sunda`)
2. **Environment** — local / staging / prod, browser, OS, app version
3. **User type** — anonymous / authenticated / admin / Studio creator
4. **Steps to reproduce** — numbered list, minimal 3 langkah
5. **Expected behavior** — apa yang seharusnya terjadi
6. **Actual behavior** — apa yang terjadi
7. **Screenshot / video / log** — minimal 1 evidence
8. **Frequency** — always / sometimes (X out of Y) / once
9. **Severity** dari reporter (boleh ditolak triager dengan alasan)

Template tersedia di [.github/ISSUE_TEMPLATE/bug.md](../../.github/ISSUE_TEMPLATE/bug.md).

---

## 7. Triage Process

### Cadence
- **Daily standup** (10 menit): bahas P0/P1 baru
- **Weekly triage meeting** (Senin 14.00, 30 menit): bahas P2/P3 baru + re-triage yang stuck
- **Async backlog grooming**: setiap PM bisa request re-prioritisasi via PR comment

### Triager
- QA Lead → primary triager
- Tech Lead → backup, otomatis triage S1
- Anyone dengan label `triage-helper` → boleh ambil S3/S4 backlog

### Output triage
- Severity + Priority assigned
- Assignee assigned (atau backlog kalau P2/P3)
- Label area (`area:chat`, `area:voice`, `area:studio`, `area:auth`, ...)
- Estimasi: XS (< 2 jam), S (< 1 hari), M (< 3 hari), L (1 sprint), XL (re-scope ke epic)
- Tag tambahan: `regression`, `flaky-test`, `security`, `a11y`, `localization`, `customer-reported`

---

## 8. Special Categories

### 8.1 Security Bugs
- **Default P0/P1**, tidak peduli severity teknis kecil
- Buat tiket **private** (GitHub Security Advisory)
- Tidak diumumkan public sampai fix deployed
- CVE / disclosure: koordinasikan dengan Tech Lead
- Postmortem wajib

### 8.2 Data Loss / Corruption
- Auto-P0
- Eskalasi langsung ke Tech Lead
- Cleanup / migration script wajib
- Customer notification (kalau prod) wajib

### 8.3 Localization Bug
- Sertakan reviewer native speaker di assignee atau consulted
- Jangan close tanpa konfirmasi reviewer
- Bila bug sistemik (LLM hallucination) → re-tuning system prompt + add ke regression set

### 8.4 Accessibility Bug
- Minimal P2 untuk semua a11y critical violation
- P1 bila menghambat user dengan disabilitas mengakses fitur utama
- Patokan: WCAG 2.1 AA

### 8.5 Flaky Test
- Bukan bug produk tapi bug test → label `flaky-test`
- Quarantine (skip di CI) bila gagal 3× dalam 24 jam
- Wajib fix atau hapus dalam 1 sprint

---

## 9. Re-triage Triggers

Bug bisa di-bump prioritas bila:

- Customer report eskalasi (≥ 3 user complain)
- Terjadi di production (otomatis +1 priority level)
- Block feature lain yang lebih prioritas
- Compliance / legal risk

Sebaliknya, bisa di-down-prioritize bila:
- Workaround mudah ditemukan
- Frequency sangat rendah (< 0.1 % session)
- Akan jadi obsolete dalam ≤ 1 sprint

---

## 10. Reporting & Metrics

QA Lead publish mingguan:

| Metric | Target |
|---|---|
| New bugs reported | (trend, tidak ada target) |
| Bugs closed-fixed | ≥ bugs reported (positive trend) |
| Avg time-to-triage | < 24 jam |
| Avg time-to-fix P0 | < 4 jam |
| Avg time-to-fix P1 | < 5 hari |
| Escaped defects (lolos ke prod) | ≤ 2 per release |
| Re-opened bugs | ≤ 5 % dari closed |

Dashboard: GitHub Projects board + chart di Notion / Google Sheets.

---

## 11. Contoh Klasifikasi

| Skenario | Sev | Prio | Alasan |
|---|---|---|---|
| Login pakai Google OAuth gagal 100 % di production | S1 | P0 | Block semua signup baru |
| Voice WebRTC handshake intermittent di Safari iOS | S2 | P1 | Block 1 platform, workaround text chat ada |
| Tombol "Publish bot" loading icon tidak muncul tapi action sukses | S4 | P3 | Cosmetic, tidak block flow |
| Token usage tracking off-by-one di analytics page | S3 | P2 | Misleading metric tapi tidak block user |
| OpenAI key bocor di response header karena bug logging | S1 | P0 | Security breach, drop everything |
| Bot bahasa Sunda jawab campur bahasa Jawa kalau prompt > 500 char | S2 | P1 | Localization quality, customer-facing impact |
| Typo "lupa pasword" di error message | S4 | P3 | Easy fix, batch dengan typo lain |
| DB migration baru gagal di staging karena kolom nullable | S2 | P0 | Block release, drop everything |

---

## 12. Eskalasi Path

```
Reporter ─→ QA Lead (triage)
              │
              ├── S1/P0 ────→ Tech Lead + War room
              │
              ├── S2/P1 ────→ Assignee dev (sprint board)
              │
              └── S3/S4 ────→ Backlog
```

Bila assignee blocked > 24 jam tanpa komentar update → QA Lead poke + re-assign bila perlu.

---

*Update terakhir: 2026-05-25.*
