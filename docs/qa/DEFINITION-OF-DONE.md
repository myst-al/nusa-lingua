# NusaLingua — Definition of Done

> Apa artinya "selesai" untuk setiap level pekerjaan. Tidak ada yang boleh masuk `main` atau `production` tanpa memenuhi DoD level yang relevan.

| Field | Value |
|---|---|
| Document ID | NSL-DOD-001 |
| Version | 1.0 |
| Owner | Tech Lead + QA Lead |

---

## Level 1 — Task / Sub-issue

Sebuah task individual dianggap selesai bila:

- [ ] Kode telah diimplementasikan sesuai acceptance criteria di issue
- [ ] Self-review: re-read diff sendiri sebelum minta review orang lain
- [ ] Unit test ditulis untuk logic baru / bug fix (TDD bila feasible)
- [ ] Test passing lokal sebelum push
- [ ] Tidak ada `console.log`, `debugger`, atau kode komentar mati
- [ ] Tidak ada hardcoded secret (env var dipakai)
- [ ] Naming variable/function jelas (bukan `data`, `tmp`, `x`)
- [ ] Tidak ada `any` baru tanpa komentar `// reason: ...`
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing (`tsc --noEmit`)

---

## Level 2 — User Story

Sebuah user story (mis. "User bisa publish bot") selesai bila Level 1 terpenuhi untuk semua sub-task, plus:

- [ ] Acceptance criteria di issue semua ✅
- [ ] Integration test menulis ulang skenario story (happy + 1 sad path)
- [ ] UI: responsive di mobile (375 px) dan desktop (1280 px)
- [ ] UI: keyboard accessible, focus visible
- [ ] UI: empty state + loading state + error state semua diimplementasikan
- [ ] Backend: error response bertaipe Zod, status code semantically correct
- [ ] Backend: log structured (level, requestId, userId hash)
- [ ] DB migration (kalau ada) reversible dan tested
- [ ] PR description menyebut **why**, bukan hanya **what**
- [ ] PR di-link ke issue (`Closes #123`)
- [ ] Screenshot / GIF dilampirkan kalau ada perubahan UI
- [ ] CI hijau (semua jobs)
- [ ] Code review approved oleh ≥ 1 reviewer
- [ ] Discussion thread di-resolve atau dijawab eksplisit

---

## Level 3 — Epic / Feature

Sebuah epic (mis. "Voice WebRTC end-to-end") selesai bila semua story di dalamnya Level 2 done, plus:

- [ ] E2E test Playwright menutup minimal 1 happy path keseluruhan epic
- [ ] Performance baseline diukur (Lighthouse / k6) — tidak regress > 10 %
- [ ] Security review oleh Tech Lead — checklist OWASP ASVS L2 relevant items pass
- [ ] Accessibility audit (axe) — 0 critical violation
- [ ] Dokumentasi user-facing dibuat / di-update (mis. README, in-app help)
- [ ] Dokumentasi developer di-update (architecture decision record bila ada keputusan besar)
- [ ] Telemetri / analytics events di-instrument (penggunaan feature bisa dipantau)
- [ ] Feature flag siap (default off untuk feature berisiko)
- [ ] Rollback plan ditulis bila feature menyentuh DB schema atau auth
- [ ] Cost impact (OpenAI tokens, Supabase row count, bandwidth) diestimasi

---

## Level 4 — Release (Sprint / Milestone)

Sebuah release siap deploy ke production bila Level 3 done untuk semua epic dalam scope, plus:

- [ ] **QC-CHECKLIST.md section A–G** semua ✅
- [ ] Coverage: server ≥ 70 %, client ≥ 60 %
- [ ] 0 bug P0/P1 terbuka
- [ ] CHANGELOG.md di-update dengan entry release
- [ ] Versi di-bump (semver) di package.json
- [ ] Git tag `vX.Y.Z` dibuat
- [ ] Release note (Bahasa Indonesia, user-facing) ditulis di GitHub Release
- [ ] Smoke test di staging pass — manual chat 1 msg + voice 30 detik + Studio 1 bot
- [ ] Backup database terbaru ada (Supabase auto + manual `pg_dump`)
- [ ] Monitoring & alert siap (UptimeRobot, Discord webhook)
- [ ] Budget alert OpenAI + Supabase aktif
- [ ] Sign-off form di [QC-CHECKLIST](./QC-CHECKLIST.md#i-sign-off-section) tertandatangani

---

## Level 5 — Bug Fix Khusus

Bug fix selesai bila Level 1 + 2 terpenuhi, plus:

- [ ] **Regression test** ditambah yang failing sebelum fix dan passing setelah
- [ ] Root cause didokumentasikan di PR description
- [ ] Postmortem ditulis bila bug masuk kategori P0 di production
- [ ] Jika bug menyebabkan data inconsistent → migration / cleanup script ditulis
- [ ] Bila bug muncul karena gap di QA → QC-CHECKLIST di-update agar tidak terulang

---

## Level 6 — Refactor

Refactor selesai bila Level 1 + 2 terpenuhi, plus:

- [ ] **Behavioral parity proven** — test suite lama masih hijau (tanpa modifikasi assertion)
- [ ] Diff fokus, tidak campur dengan feature baru atau bug fix
- [ ] Performance baseline tidak regress
- [ ] PR description menyebut motivasi (mis. "reduce duplication", "extract abstraction", "prep for X")

---

## Level 7 — Spike / Investigation

Spike selesai bila:

- [ ] Pertanyaan investigasi terjawab eksplisit (Yes / No / It depends + alasan)
- [ ] Hasil ditulis di docs/spikes/ atau Notion
- [ ] Rekomendasi tindak lanjut tertulis (next steps atau "tidak dilanjutkan karena …")
- [ ] Kode prototype dihapus atau dipisahkan branch `spike/` (tidak masuk main)

---

## Anti-Definition (apa yang BUKAN "done")

❌ "Sudah jalan di lokal saya" — tanpa CI hijau bukan done.
❌ "Saya akan tambah test nanti" — test wajib ada saat PR di-merge.
❌ "Tidak sempat update docs" — kalau public-facing, docs adalah deliverable.
❌ "Reviewer-nya ngebut, langsung di-merge" — minimal 1 reviewer harus eksplisit approve.
❌ "Feature flag off jadi aman" — feature flag mengurangi blast-radius, bukan menggantikan DoD.

---

## Eskalasi

Bila ada item DoD yang **harus di-skip** karena urgensi (mis. hotfix produksi):

1. Tech Lead approve eksplisit di PR comment
2. Tiket follow-up dibuat dengan label `tech-debt:dod-skip`
3. Closure tiket follow-up dalam ≤ 2 sprint
4. Di-review di QA Retro berikutnya

---

*Update terakhir: 2026-05-25.*
