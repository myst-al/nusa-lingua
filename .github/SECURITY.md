# Security Policy — NusaLingua

> Selaras dengan [Bug Triage Matrix §8.1](../docs/qa/BUG-TRIAGE.md#81-security-bugs).

## Versi yang Di-support

| Versi | Status |
|---|---|
| 0.1.x (MVP) | ✅ Active |
| < 0.1   | ❌ Tidak di-support |

## Cara Melaporkan Kerentanan

**Jangan** membuka issue publik untuk security bug. Gunakan salah satu jalur privat:

1. **Preferred** — GitHub Private Security Advisory:
   `https://github.com/<org>/<repo>/security/advisories/new`

2. **Alternatif** — Email terenkripsi: security@nusalingua.id (PGP key tersedia atas permintaan)

## Yang Dibutuhkan di Laporan

- Deskripsi kerentanan (dampak teknis)
- Steps to reproduce (PoC singkat)
- Versi/komponen terdampak
- Asumsi attacker model (anonymous / authenticated / privileged)
- Saran mitigasi (kalau ada)

## SLA Respons

| Tahap | Target |
|---|---|
| Acknowledgement | ≤ 48 jam |
| Triage + severity | ≤ 5 hari kerja |
| Fix dirilis (Critical/High) | ≤ 30 hari kalender |
| Fix dirilis (Medium/Low) | next release cycle |
| Public disclosure | Setelah fix deployed + reporter approve |

## Safe Harbor

Kami berkomitmen tidak melakukan tindakan hukum terhadap penemu kerentanan yang:

- Melaporkan via jalur privat di atas
- Tidak mengeksploitasi kerentanan di luar PoC minimum
- Tidak mengakses, modifikasi, atau hapus data user lain
- Memberi waktu wajar untuk fix sebelum disclosure publik

## Ruang Lingkup

**In-scope:**
- Domain produksi `*.nusalingua.id` dan staging
- API server (Express)
- Web client (React)
- Studio bot builder
- Auth flow (Supabase / OAuth)
- Deploy scripts di `deploy/` (kalau dipublish)

**Out-of-scope:**
- Social engineering tanpa technical exploit
- Physical attack pada infrastruktur
- DoS / DDoS volume tinggi
- Third-party services (Supabase, OpenAI) — laporkan langsung ke vendor
- Best-practice findings tanpa exploit (mis. missing security header tanpa CVE)

## Hall of Fame

Daftar reporter yang berkontribusi (dengan persetujuan):

_(Belum ada — kamu bisa jadi yang pertama!)_
