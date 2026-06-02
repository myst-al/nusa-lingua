# NusaLingua — QA / QC Documentation

Folder ini berisi seluruh artefak Quality Assurance & Quality Control untuk NusaLingua MVP. Disusun agar reviewer hackathon, auditor, dan tim baru bisa memahami mutu produk dengan cepat.

---

## 📚 Daftar Dokumen

| # | Dokumen | Tujuan | Audience |
|---|---|---|---|
| 1 | [QA-MASTER-PLAN.md](./QA-MASTER-PLAN.md) | Strategi induk QA: scope, role, level test, KPI | Tech Lead, QA Lead, Judges |
| 2 | [TEST-STRATEGY.md](./TEST-STRATEGY.md) | Detail teknis pyramid test + tools | Engineer, QA |
| 3 | [QC-CHECKLIST.md](./QC-CHECKLIST.md) | Checklist sign-off per release | QA, Tech Lead |
| 4 | [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md) | Kriteria "selesai" per level kerja | Semua kontributor |
| 5 | [BUG-TRIAGE.md](./BUG-TRIAGE.md) | Severity, priority, SLA bug | QA, Dev, Support |

---

## 🎯 Quick Read untuk Reviewer

Bila hanya punya 5 menit:

1. Baca **QA-MASTER-PLAN §1–3** untuk paham scope + level test
2. Skim **QC-CHECKLIST section A & I** untuk lihat gate quality + sign-off ritual
3. Lihat hasil eksekusi terbaru di [TEST-REPORT.md](../../TEST-REPORT.md)

---

## 🧭 Alur Kerja Standar

```
1. Sprint kick-off
   └─ Tim sepakat scope; QA siapkan test plan per epic.

2. Development
   ├─ Dev tulis kode + unit test bareng (TDD recommended)
   ├─ Pre-commit hook (Husky) auto-jalankan lint + format
   └─ Push → buka PR

3. Pull Request
   ├─ CI auto-run: lint, typecheck, unit, integration, build, security
   ├─ Reviewer cek vs Definition of Done
   └─ Squash-merge ke develop bila hijau

4. Pre-release
   ├─ QA jalankan QC-CHECKLIST manual
   ├─ Deploy ke staging
   ├─ Smoke test E2E + manual UAT
   └─ Tech Lead sign-off

5. Release
   ├─ Tag versi semver
   ├─ Deploy ke production via cd.yml
   └─ Post-deploy smoke + monitoring 24 jam

6. Post-release
   ├─ Bug triage berkala
   ├─ QA Retro tiap akhir sprint
   └─ Update dokumentasi bila ada gap
```

---

## 🛠️ Tooling Aktif

| Layer | Tool | Lokasi config |
|---|---|---|
| Lint | ESLint | `.eslintrc.json` |
| Format | Prettier | `.prettierrc` |
| Unit + Component | Vitest | `vitest.config.ts` |
| Integration | pglite + tsx | `server/src/__tests__/` |
| E2E | Playwright | `playwright.config.ts` |
| Pre-commit | Husky + lint-staged | `.husky/` + `.lintstagedrc` |
| Secret scan | gitleaks + regex | `.github/workflows/qa.yml` |
| SAST | Semgrep | `.github/workflows/qa.yml` |
| CI | GitHub Actions | `.github/workflows/ci.yml` |
| QA gates nightly | GitHub Actions | `.github/workflows/qa.yml` |

---

## 📊 Hasil QA Saat Ini

| Kategori | Status |
|---|---|
| Schema test | ✅ 8 / 8 pass |
| Business process E2E | ✅ 64 / 64 pass |
| TypeScript compile | ✅ 0 error |
| Client build | ✅ Sukses, 478 KB total bundle |
| Deploy scripts syntax | ✅ Semua valid |
| Nginx config | ✅ `nginx -t` OK |
| OAuth + OpenAI live test | ⏳ Pending user setup credential |

Detail lengkap: [TEST-REPORT.md](../../TEST-REPORT.md)

---

## 🔗 Lihat Juga

- Root README: [`../../README.md`](../../README.md)
- Deploy guide: [`../../deploy/HOW-TO-GET-KEYS.md`](../../deploy/HOW-TO-GET-KEYS.md)
- CI workflow: [`../../.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- QA nightly workflow: [`../../.github/workflows/qa.yml`](../../.github/workflows/qa.yml)
- PR template: [`../../.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)

---

*Versi: 1.0 — terakhir di-review 2026-05-25.*
