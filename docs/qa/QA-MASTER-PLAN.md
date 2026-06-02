# NusaLingua — QA Master Plan

> Dokumen induk Quality Assurance untuk NusaLingua MVP. Selaras dengan tema **PIDI DIGDAYA 2026** — ekspor layanan digital Indonesia berbasis LLM Nusantara.

| Field | Value |
|---|---|
| Document ID | NSL-QA-001 |
| Version | 1.0 |
| Owner | QA Lead (Albert Ade Kristadeo) |
| Status | Active |
| Last Review | 2026-05-25 |
| Next Review | 2026-08-25 |

---

## 1. Tujuan & Ruang Lingkup

### 1.1 Tujuan
NusaLingua mendorong AI berbahasa Nusantara go-to-market di pasar ASEAN. Sebagai produk multilingual LLM yang menangani **data budaya sensitif**, kualitas wajib terjaga di 4 sisi:

1. **Functional correctness** — output bahasa daerah benar secara gramatikal & kultural.
2. **Security & privacy** — data percakapan, OAuth tokens, OpenAI keys tidak bocor.
3. **Performance** — chat SSE first-token < 800 ms, voice WebRTC handshake < 2 s.
4. **Compliance** — UU PDP 2022, GDPR-equivalent untuk pasar ASEAN.

### 1.2 Scope
**In scope:**
- Web app (React 18 + Vite client)
- API server (Express + TypeScript)
- Database schema (Supabase PostgreSQL)
- Studio no-code bot builder
- Chat SSE streaming (GPT-4o-mini)
- Voice WebRTC (gpt-4o-realtime-preview)
- Deploy scripts (Ubuntu 22.04 + Nginx + PM2)
- CI/CD pipelines (GitHub Actions)

**Out of scope (deferred Phase 2):**
- Native mobile apps
- On-prem self-hosted LLM training
- B2B SLA contract testing
- Penetration testing oleh third-party

---

## 2. Standards & Referensi

| Standar | Penerapan |
|---|---|
| ISO/IEC 25010 | Software product quality model (8 karakteristik) |
| ISTQB Foundation | Test level & test type taxonomy |
| OWASP ASVS L2 | Application security verification |
| UU No. 27 / 2022 (PDP) | Perlindungan data pribadi Indonesia |
| WCAG 2.1 AA | Web accessibility |
| Anthropic AI Safety Principles | LLM output guardrails |

---

## 3. Test Levels (V-model)

```
         ┌─────────────────────────────┐
         │  L5 Acceptance / UAT        │  ← Real users (hackathon judges, pilot Pemda)
         └─────────────────────────────┘
       ┌──────────────────────────────────┐
       │  L4 End-to-End (Playwright)      │  ← Browser flow: signup → chat → publish bot
       └──────────────────────────────────┘
      ┌────────────────────────────────────┐
      │  L3 Integration (test-business-*)  │  ← 64 assertions, 16 stages
      └────────────────────────────────────┘
     ┌──────────────────────────────────────┐
     │  L2 Component (Vitest)               │  ← React components, helpers, hooks
     └──────────────────────────────────────┘
    ┌────────────────────────────────────────┐
    │  L1 Unit (Vitest)                      │  ← Pure functions, Zod schemas
    └────────────────────────────────────────┘
```

| Level | Tooling | Coverage Target | Runs Where |
|---|---|---|---|
| L1 Unit | Vitest | ≥ 70 % statements | Local pre-commit + CI |
| L2 Component | Vitest + Testing Library | ≥ 60 % critical paths | CI |
| L3 Integration | pglite + Express supertest | 100 % business process | CI on every PR |
| L4 E2E | Playwright | 6 smoke flows | CI nightly + pre-deploy |
| L5 UAT | Manual checklist (QC-CHECKLIST.md) | All P0/P1 features | Before each release |

---

## 4. Test Types

| Type | Goal | Owner | When |
|---|---|---|---|
| **Functional** | Verify spec correctness | Dev + QA | Every PR |
| **Regression** | No previously-fixed bug returns | Automation | Every PR |
| **Smoke** | App boots + critical paths alive | Automation | Pre-deploy + nightly |
| **Security** | OWASP Top-10, secret scan, SAST | Automation + manual | Every PR + monthly |
| **Performance** | SSE TTFB, WebRTC latency, p95 API | k6 + Lighthouse | Pre-release |
| **Accessibility** | WCAG 2.1 AA, keyboard nav | axe-core + manual | Pre-release |
| **Localization** | Bahasa daerah accuracy + RTL/Unicode | Native speaker reviewer | Before each new language |
| **Usability** | Heuristic + 5-user testing | Designer + 5 users | Every major feature |
| **Compatibility** | Chrome/Safari/Firefox + mobile | BrowserStack (manual) | Pre-release |

---

## 5. Roles & Responsibilities (RACI)

| Activity | Dev | QA Lead | Tech Lead | Product Owner |
|---|---|---|---|---|
| Write unit tests | R | A | C | I |
| Write integration tests | R | A | C | I |
| Maintain CI/CD pipeline | C | R | A | I |
| Run E2E suite | C | R | C | I |
| Bug triage | C | R | A | C |
| Release sign-off | I | R | C | A |
| Localization QA | I | R | I | C |

**R** = Responsible · **A** = Accountable · **C** = Consulted · **I** = Informed

---

## 6. Environments

| Env | Hosting | DB | OpenAI | Purpose |
|---|---|---|---|---|
| **local** | localhost | pglite (in-memory) | mock key | Dev daily |
| **CI** | GitHub Actions | pglite | mock key | Pre-merge gates |
| **staging** | Hetzner VPS | Supabase staging project | sk-staging | Pre-prod smoke + UAT |
| **prod** | Hetzner VPS | Supabase prod project | sk-prod | Live for users |

Promotion path: `local → CI ✅ → staging ✅ → prod (manual approval)`

---

## 7. Entry & Exit Criteria

### 7.1 Entry — sebuah feature boleh masuk QA cycle bila:
- Spec ditulis di Notion + acceptance criteria explicit
- Branch dibuat dari `develop` dan up-to-date
- Unit test sudah ditulis bersama kode (TDD direkomendasikan)
- Self-review dilakukan dengan QC-CHECKLIST.md
- PR opened dengan template terisi lengkap

### 7.2 Exit — release boleh masuk production bila:
- ✅ Semua CI jobs hijau
- ✅ Code coverage ≥ target per layer
- ✅ 0 issue P0/P1 open
- ✅ Smoke test E2E pass di staging
- ✅ Manual UAT checklist signed-off
- ✅ Security audit clean (npm audit high+ = 0)
- ✅ Performance baseline tidak regress (p95 < 200 ms)
- ✅ Rollback plan didokumentasi

---

## 8. Risk-Based Testing

Mengacu ISO 25010 — prioritas testing diatur berdasarkan **business impact × probability**:

| Risk Area | Impact | Probability | Priority | Mitigasi |
|---|---|---|---|---|
| LLM output salah / hallucination bahasa daerah | High | High | **P0** | Native speaker review, system prompt locking, output guardrails |
| Token API key bocor (OpenAI / Supabase) | Critical | Low | **P0** | Secret scan CI, .env mode 600, rotate 90 hari |
| WebRTC voice gagal di Safari/mobile | Medium | High | **P1** | Compatibility test pre-release, fallback ke text chat |
| Supabase RLS bypass (data user lain) | Critical | Medium | **P0** | Cross-user isolation test (Stage 13 sudah pass), RLS policy audit |
| Cost explosion (OpenAI bill) | High | Medium | **P1** | Token tracking per message, rate limit per user, Stripe budget alert |
| Vendor lock-in OpenAI | Medium | Low | **P2** | Abstraksi `aiProvider` interface, sudah designed |
| DDoS / abuse | High | Medium | **P1** | Nginx rate limit + Cloudflare di depan |

---

## 9. Metrics & KPI

Pantau via dashboard QA (Notion / GitHub Insights):

| Metric | Target | Cadence |
|---|---|---|
| Test pass rate | ≥ 98 % | Per PR |
| Code coverage (server) | ≥ 70 % | Per merge |
| Code coverage (client) | ≥ 60 % | Per merge |
| Mean time to detect (MTTD) | < 1 jam | Monthly |
| Mean time to resolve (MTTR) — P0 | < 4 jam | Monthly |
| Escaped defects (bug lolos ke prod) | ≤ 2 per release | Per release |
| CI duration (PR → green) | < 8 menit | Weekly |
| Build failure rate | < 5 % | Weekly |
| Accessibility violations | 0 critical, ≤ 5 minor | Per release |

---

## 10. Tools Stack

| Layer | Tool | Lisensi |
|---|---|---|
| Unit + Component | Vitest | MIT |
| React testing | @testing-library/react | MIT |
| E2E | Playwright | Apache 2.0 |
| Integration DB | @electric-sql/pglite | Apache 2.0 |
| Static analysis | ESLint + @typescript-eslint | MIT |
| Code style | Prettier | MIT |
| Pre-commit | Husky + lint-staged | MIT |
| SAST | Semgrep (community rules) | LGPL |
| SCA | npm audit + Dependabot | MIT |
| Secret scan | gitleaks + custom regex | MIT |
| Performance | k6 + Lighthouse CI | AGPL / Apache |
| Accessibility | axe-core + Playwright a11y | MPL 2.0 |
| Coverage | c8 / Istanbul | ISC |
| CI/CD | GitHub Actions | — |

---

## 11. Deliverables QA per Release

1. **Test execution report** (auto-generated dari CI)
2. **QC Checklist** signed-off (QC-CHECKLIST.md)
3. **Risk assessment update** (bila ada feature baru)
4. **Known issues list** (carried over ke next sprint)
5. **Performance baseline diff** (k6 result vs last release)
6. **Accessibility scan report** (axe + manual screen reader)
7. **Localization QA sign-off** (per bahasa daerah baru)

---

## 12. Continuous Improvement

Setiap akhir sprint (2 minggu) tim mengadakan **QA Retro**:
- Bug yang lolos → root-cause + add ke regression suite
- Flaky test → quarantine atau fix
- Test runtime → optimasi bila > 10 menit
- Coverage gap → ticket untuk closure

---

## 13. Referensi Internal

- [QC Checklist](./QC-CHECKLIST.md) — checklist eksekusi per release
- [Test Strategy](./TEST-STRATEGY.md) — detail teknis test pyramid
- [Definition of Done](./DEFINITION-OF-DONE.md) — kriteria selesai per level
- [Bug Triage Matrix](./BUG-TRIAGE.md) — severity, priority, SLA
- [TEST-REPORT.md](../../TEST-REPORT.md) — hasil eksekusi terbaru

---

*Dokumen ini hidup. Update wajib bila: (a) tech stack berubah, (b) regulasi baru, (c) skor risiko naik.*
