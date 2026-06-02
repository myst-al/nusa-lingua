# NusaLingua — Test Strategy

> Detail teknis cara kita melakukan testing — selaras dengan [QA Master Plan](./QA-MASTER-PLAN.md).

| Field | Value |
|---|---|
| Document ID | NSL-QS-001 |
| Version | 1.0 |
| Owner | QA Lead |

---

## 1. Test Pyramid

```
                          ╱─────────────╲
                         ╱   E2E (~5%)   ╲              Playwright
                        ╱─────────────────╲             6 critical flows
                       ╱  Integration ~25% ╲            pglite + supertest
                      ╱─────────────────────╲           16 stages / 64 assertions
                     ╱    Component ~30%     ╲          Vitest + Testing Library
                    ╱─────────────────────────╲         React components
                   ╱         Unit ~40%         ╲        Vitest
                  ╱─────────────────────────────╲       Helpers, Zod, utils
```

**Prinsip**: lebih banyak test di layer bawah (cepat, deterministic), sedikit di atas (mahal, lambat tapi confidence tinggi).

---

## 2. Unit Tests

### Lokasi
- `server/src/**/*.test.ts` — co-located dengan kode
- `client/src/**/*.test.{ts,tsx}` — co-located

### Yang Wajib Di-test
- **Zod schemas** — round-trip serialize/parse, edge cases
- **Pure functions** — utility (slug, token counter, language map)
- **Express middleware** — auth, error handler (dengan mock req/res)
- **React hooks** — custom hooks (useAuth, useStreamChat)
- **Validators** — bot flow node validator

### Yang Tidak Perlu Unit Test (cukup integration)
- Express routes lengkap → diuji via integration
- React page yang banyak dependensi → diuji via component test
- Drizzle ORM raw query → diuji via integration (pglite)

### Naming
```
✓ describe('parseLanguageCode', () => {
✓   it('returns code for valid ISO-639-3', ...)
✓   it('throws on unknown code', ...)
✓ })
```

### Coverage Target
- Server: **≥ 70 %** statements
- Client: **≥ 60 %** statements (UI banyak yang covered via component)

---

## 3. Component Tests (React)

### Tooling
- Vitest + jsdom
- @testing-library/react + @testing-library/user-event
- MSW (Mock Service Worker) untuk mock API

### Yang Di-test
- Render component dengan props valid → tidak crash
- User interaction (click, type, hover) menghasilkan state expected
- Form validation menampilkan error message
- Loading state, error state, empty state render benar
- Accessibility queries (`getByRole`, `getByLabelText`) — memastikan a11y

### Contoh Skeleton

```tsx
// client/src/components/__tests__/ChatInput.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('disables submit when empty', () => {
    render(<ChatInput onSend={vi.fn()} />);
    expect(screen.getByRole('button', { name: /kirim/i })).toBeDisabled();
  });

  it('calls onSend dengan trimmed text', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox'), '  halo  ');
    await userEvent.click(screen.getByRole('button', { name: /kirim/i }));
    expect(onSend).toHaveBeenCalledWith('halo');
  });
});
```

---

## 4. Integration Tests (existing — keep)

### Sudah Ada
- `server/src/__tests__/test-schema.ts` — 8 assertions
- `server/src/__tests__/test-business-process.ts` — 64 assertions (16 stages)

### Pattern
- Spin up pglite (embedded WASM Postgres)
- Deploy schema via raw SQL
- Seed minimal data (2-8 languages, dummy users)
- Call routes via supertest atau direct controller invocation
- Assert DB state + response shape

### Yang Akan Ditambah (Phase 2)
- Test SSE streaming flow (mock OpenAI dengan ReadableStream)
- Test voice ephemeral token issuance (mock OpenAI Realtime endpoint)
- Test rate-limiting middleware (req loop)

---

## 5. E2E Tests (Playwright)

### Critical Smoke Flows (P0 — wajib pass setiap PR ke main)

1. **Landing → Login** — buka /, klik tombol login, modal Supabase muncul
2. **Signup → confirm → dashboard** — email confirm flow (test inbox)
3. **Chat happy path** — kirim 1 msg di bahasa Sunda, terima reply
4. **Studio flow** — buat bot draft, edit, publish, lihat di public listing
5. **Voice handshake (mocked)** — klik mulai voice, intercept WebRTC, status connected
6. **Logout** — klik logout, redirect ke landing, session cleared

### Config
- Browsers: Chromium, Firefox, WebKit (Safari)
- Viewport: desktop (1280×720) + mobile (375×667 iPhone SE)
- Trace on retry, screenshot on failure, video on first failure
- Run: nightly + pre-deploy

### Anti-flake
- Selector: `data-testid` di komponen interaktif (bukan className)
- Wait: `expect.toBeVisible()` bukan `setTimeout`
- Network: intercept dengan `page.route()` agar deterministik
- Isolation: fresh Supabase test user per scenario, cleanup di afterAll

---

## 6. API Contract Tests

Pastikan response shape stabil. Sumber kebenaran: Zod schema di `shared/api-types.ts`.

```ts
// server/src/__tests__/api-contract.test.ts
import { BotResponseSchema } from '../../../shared/api-types';

it('GET /api/bots/:id matches schema', async () => {
  const res = await request(app).get(`/api/bots/${botId}`).expect(200);
  const parsed = BotResponseSchema.parse(res.body); // throws on drift
  expect(parsed.id).toBe(botId);
});
```

Bila ada breaking change → bump version di header `X-API-Version` + update CHANGELOG.

---

## 7. Performance Tests

### Tooling: k6

```js
// perf/chat-load.k6.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp-up
    { duration: '1m',  target: 50 },   // sustained
    { duration: '30s', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/bots`, {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

### Frontend Performance: Lighthouse CI

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": { "url": ["https://staging.nusalingua.id"], "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## 8. Security Tests

| Layer | Tool | Frequency |
|---|---|---|
| SCA (deps) | npm audit + Dependabot | Continuous |
| SAST | Semgrep `--config=auto` | Per PR |
| Secret scan | gitleaks + custom regex | Per PR + history |
| Container scan | Trivy (kalau Docker dipakai) | Per release |
| DAST (web) | OWASP ZAP baseline | Monthly |
| Manual pentest | Internal team | Quarterly |
| External pentest | Vendor | Annually (Phase 2) |

### Auth-spesifik
- Token tampering test: ubah JWT payload, signature must invalid
- Replay attack: same nonce 2× → 401
- IDOR: ganti `:id` URL param → 404 / 403, bukan 200 dengan data lain

---

## 9. Localization Tests

Setiap bahasa daerah baru wajib lewat **3 lapis**:

1. **Automated** — Unicode roundtrip, system prompt regex (no English leak)
2. **Native speaker** — 10 prompt umum + 5 prompt budaya, output natural
3. **Cultural review** — tidak ada slur, tidak ada bias politis, sapaan adat benar

Output reviewer disimpan di `docs/localization/<lang>-signoff.md` dengan field:
- Reviewer name + qualification
- Tanggal review
- Sample input/output yang di-review
- Verdict + catatan perbaikan

---

## 10. Accessibility Tests

### Otomatis (CI)
- Lighthouse `categories:accessibility` ≥ 95
- Playwright + `@axe-core/playwright` di setiap page critical → 0 violation critical

### Manual (per release)
- Keyboard navigation: Tab order logis, focus visible
- Screen reader: NVDA / VoiceOver baca alur signup + chat
- Color contrast: pakai WebAIM Contrast Checker
- Zoom 200 %: layout tidak break

---

## 11. Test Data Management

### Test User Pool
- `alice@test.nusa.id` — admin Pemda profile
- `bob@test.nusa.id` — UMKM profile
- `charlie@test.nusa.id` — anonymous browse only
- Password: ENV var `TEST_PASSWORD`, rotated 30 hari

### Test Bots
- `bot-test-sunda-001` — published, public
- `bot-test-jawa-002` — draft, private

### Cleanup
- `afterAll()` hook hapus semua test data
- Nightly cron clear stale test conversations > 7 hari

---

## 12. Flaky Test Policy

| Aksi | Threshold |
|---|---|
| Tag `@flaky` + skip di CI | Gagal 3× berturut dalam 24 jam |
| Buka issue P2 dengan label `flaky-test` | Saat tag pertama |
| Wajib fix atau hapus | Dalam 1 sprint berikutnya |
| Re-introduce | Setelah 10× green berturut di branch test |

---

## 13. Test Runtime Budget

| Layer | Budget |
|---|---|
| Unit | ≤ 30 detik full suite |
| Component | ≤ 1 menit |
| Integration | ≤ 3 menit |
| E2E smoke | ≤ 5 menit |
| **Total PR CI** | **≤ 8 menit** (paralel jobs) |
| Nightly full | ≤ 30 menit |

Bila melewati budget → optimasi atau split ke nightly.

---

## 14. Test Reporting

- CI output → JUnit XML → upload artifact GitHub
- Coverage → c8 → upload ke Codecov (opsional, Phase 2)
- Performance trends → k6 cloud (opsional) atau commit graph ke `perf/baseline/`
- Accessibility → axe report HTML → artifact

Dashboard QA (Notion / public page): pass rate, coverage, runtime trend, escaped defects.

---

*Update terakhir: 2026-05-25.*
