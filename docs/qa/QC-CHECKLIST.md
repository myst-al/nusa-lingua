# NusaLingua — Quality Control Checklist

> Checklist eksekusi QC yang **wajib di-sign-off** sebelum release ke production. Disusun per layer agar bisa di-parallel.

| Field | Value |
|---|---|
| Document ID | NSL-QC-001 |
| Version | 1.0 |
| Cadence | Per release (minimal 2× per sprint) |
| Sign-off | QA Lead + Tech Lead |

---

## A. Code Quality Gates (otomatis via CI)

| # | Item | Tool | Pass Criteria | ✓ |
|---|---|---|---|---|
| A1 | TypeScript compile (server) | `tsc --noEmit` | 0 errors | ☐ |
| A2 | TypeScript compile (client) | `tsc -b --noEmit` | 0 errors | ☐ |
| A3 | ESLint (server) | `eslint .` | 0 errors, ≤ 5 warn | ☐ |
| A4 | ESLint (client) | `eslint .` | 0 errors, ≤ 5 warn | ☐ |
| A5 | Prettier formatting | `prettier --check` | 100 % conform | ☐ |
| A6 | Unit test (Vitest) | `vitest run` | Pass + coverage ≥ 70 % server, ≥ 60 % client | ☐ |
| A7 | Schema test | `test-schema.ts` | 8/8 pass | ☐ |
| A8 | Business process E2E | `test-business-process.ts` | 64/64 pass | ☐ |
| A9 | Playwright smoke | `playwright test` | 6/6 pass | ☐ |
| A10 | Build client production | `vite build` | Success, bundle ≤ 600 KB | ☐ |
| A11 | Lint deploy scripts | `bash -n` + shellcheck | 0 fatal | ☐ |
| A12 | Nginx config syntax | `nginx -t` | OK | ☐ |
| A13 | PM2 config | `node -e require(...)` | Valid object | ☐ |

---

## B. Security Gates

| # | Item | Tool | Pass Criteria | ✓ |
|---|---|---|---|---|
| B1 | npm audit (server) | `npm audit --production` | 0 high/critical | ☐ |
| B2 | npm audit (client) | `npm audit --production` | 0 high/critical | ☐ |
| B3 | Secret scan code | gitleaks + regex | 0 hits | ☐ |
| B4 | Secret scan history | gitleaks-history | 0 hits | ☐ |
| B5 | SAST (Semgrep) | `semgrep --config=auto` | 0 high severity | ☐ |
| B6 | `.env` permission | `stat -c %a .env` | 600 | ☐ |
| B7 | HTTPS enforced | curl health check | 301 redirect HTTP→HTTPS | ☐ |
| B8 | CSP header present | curl -I | `Content-Security-Policy` exists | ☐ |
| B9 | Rate limit aktif | curl loop 50× | 429 after threshold | ☐ |
| B10 | OAuth callback whitelist | manual check | Hanya Supabase URL valid | ☐ |
| B11 | Service-role-key not in client | grep client/ | 0 hits SUPABASE_SERVICE_ROLE | ☐ |
| B12 | JWT signature verify | manual fake token | 401 returned | ☐ |
| B13 | SQL injection (Drizzle param) | manual test `' OR 1=1` | Treated as literal | ☐ |
| B14 | XSS at message render | input `<script>alert(1)</script>` | Escaped, no execute | ☐ |
| B15 | CORS strict | preflight from unknown origin | Blocked | ☐ |

---

## C. Functional Gates (manual UAT)

### C1. Auth flow
- [ ] Sign-up dengan email — receive confirmation email
- [ ] Email confirm link → redirect ke dashboard
- [ ] Login dengan Google OAuth → success
- [ ] Login dengan GitHub OAuth → success
- [ ] Logout → session cleared, redirect ke landing
- [ ] Token expired → auto refresh atau redirect login
- [ ] Bad password → friendly error (no stack trace)

### C2. Chat (SSE streaming)
- [ ] Buat conversation baru di bahasa Indonesia → bot reply dalam Indonesia
- [ ] Switch bahasa ke Sunda → reply dalam Sunda
- [ ] Switch bahasa ke Jawa → reply dalam Jawa
- [ ] Switch bahasa ke Batak → reply dalam Batak
- [ ] Stream first-token latency < 1.5 detik
- [ ] Tombol "Stop generation" memutus stream
- [ ] Refresh page → message history persisted
- [ ] Token usage tercatat di analytics

### C3. Voice (WebRTC)
- [ ] Klik "Mulai voice" → browser minta mic permission
- [ ] Ephemeral token diterbitkan dari server
- [ ] WebRTC SDP exchange success (status connected)
- [ ] User bicara → bot transcript muncul di UI
- [ ] Bot respon audio terdengar
- [ ] Total handshake < 3 detik
- [ ] Klik "Stop" → connection closed, mic released
- [ ] Test di Chrome, Firefox, Safari, mobile Chrome

### C4. Studio (no-code bot builder)
- [ ] Create new bot → masuk canvas
- [ ] Pilih bahasa target → field tersimpan
- [ ] Tambah node Trigger → System Prompt → LLM → Send Reply → End
- [ ] Reorder node via tombol up/down
- [ ] Edit system prompt > 50 char → save success
- [ ] Save draft → status `draft`
- [ ] Publish → status `published`, public discoverable
- [ ] Test bot inline → respons sesuai system prompt
- [ ] Archive bot → tidak muncul di public listing
- [ ] Delete bot → cascade conversations cleared

### C5. Multi-user isolation
- [ ] User A buat bot private → User B GET → 404
- [ ] User A buat bot published → User B GET → 200 (public)
- [ ] User A buat conversation → User B GET messages → 404
- [ ] User A delete account → semua data ter-cascade hapus

### C6. Validation
- [ ] POST /api/bots tanpa name → 400 + Zod error
- [ ] POST /api/bots dengan languageCode invalid → 400
- [ ] System prompt < 10 char → 400
- [ ] Bahasa tidak ada di DB → 400
- [ ] Body > 1 MB → 413

---

## D. Performance Gates

| # | Item | Tool | Target | ✓ |
|---|---|---|---|---|
| D1 | Chat SSE TTFB | DevTools Network | < 800 ms (p50), < 1500 ms (p95) | ☐ |
| D2 | API GET /api/bots | k6 | p95 < 200 ms | ☐ |
| D3 | Voice WebRTC handshake | manual stopwatch | < 3 detik | ☐ |
| D4 | Cold start (server boot) | PM2 logs | < 5 detik | ☐ |
| D5 | Client First Contentful Paint | Lighthouse | < 1.8 detik | ☐ |
| D6 | Client Largest Contentful Paint | Lighthouse | < 2.5 detik | ☐ |
| D7 | Bundle size (JS + CSS) | Vite build output | < 600 KB total | ☐ |
| D8 | DB query p95 | pg_stat_statements | < 50 ms | ☐ |
| D9 | Memory leak (60 min run) | PM2 monit | No drift > 100 MB | ☐ |
| D10 | Concurrent users smoke | k6 (50 VU, 60 s) | Error rate < 1 % | ☐ |

---

## E. Accessibility Gates (WCAG 2.1 AA)

- [ ] Lighthouse a11y score ≥ 95
- [ ] axe-core scan: 0 critical violations
- [ ] Keyboard-only navigation: bisa akses semua interactive element
- [ ] Focus indicator visible di semua focus state
- [ ] Color contrast: text vs background ≥ 4.5 : 1
- [ ] Alt text di semua image (logo, illustration)
- [ ] Form label associated (htmlFor / aria-label)
- [ ] Screen reader (NVDA / VoiceOver) bisa narasi flow chat
- [ ] Dark mode toggle ada (kalau diimplementasikan)
- [ ] No autoplay video / audio tanpa user gesture

---

## F. Localization QA (per bahasa daerah baru)

Sign-off dari **native speaker** wajib sebelum bahasa baru go-live.

- [ ] System prompt mengarahkan output sesuai dialek
- [ ] Tes 10 prompt domain umum (perkenalan, transaksi, instruksi) → output natural
- [ ] Tes 5 prompt domain budaya (sapaan adat, terminologi tradisional) → kontekstual
- [ ] Tidak ada kata yang menyinggung (slur, taboo) muncul
- [ ] Code-mixing dengan Bahasa Indonesia konsisten (tidak random)
- [ ] Unicode glyph (mis. aksara Jawa kalau enabled) render benar
- [ ] Native speaker reviewer sign-off + tanda tangan/email

---

## G. Deploy & Operational Gates

| # | Item | Cara | ✓ |
|---|---|---|---|
| G1 | Backup database | `supabase db dump` ada artifact | ☐ |
| G2 | Rollback plan tertulis | docs/rollback-{release}.md | ☐ |
| G3 | DNS records benar (A + AAAA) | dig +short | ☐ |
| G4 | Let's Encrypt cert valid | `certbot certificates` exp > 30 hari | ☐ |
| G5 | PM2 startup hook installed | `pm2 startup` | ☐ |
| G6 | Logs rotate aktif | `/etc/logrotate.d/nusalingua` | ☐ |
| G7 | UFW firewall enabled | `ufw status` allow 22/80/443 only | ☐ |
| G8 | fail2ban aktif | `fail2ban-client status` | ☐ |
| G9 | Monitoring uptime | UptimeRobot / Pingdom — 1 check/5 min | ☐ |
| G10 | Alert channel siap | Discord webhook test ping | ☐ |
| G11 | OpenAI usage alert | Dashboard budget cap set | ☐ |
| G12 | Supabase usage alert | Project settings → billing notification | ☐ |
| G13 | Smoke test post-deploy | curl /api/health → 200 | ☐ |
| G14 | Real chat 1 msg setelah deploy | manual via UI | ☐ |
| G15 | Real voice 30 detik setelah deploy | manual via UI | ☐ |

---

## H. Documentation Gates

- [ ] README.md up-to-date (env vars, run steps)
- [ ] CHANGELOG.md entry baru ditambahkan
- [ ] API docs (Swagger / Postman collection) sync dengan kode
- [ ] Migration guide bila ada breaking change schema
- [ ] User-facing release note (Bahasa Indonesia) disiapkan
- [ ] Postmortem bila ada incident pre-release

---

## I. Sign-off Section

Release boleh masuk produksi setelah **semua checkbox di section A–G** ditandai dan **section H** diisi.

| Role | Nama | Tanggal | Tanda tangan |
|---|---|---|---|
| QA Lead | ............................. | ........... | ............................. |
| Tech Lead | ............................. | ........... | ............................. |
| Product Owner | ............................. | ........... | ............................. |

> Bila ada item di-skip, dokumentasikan **alasan + risk acceptance** di field comment PR release.

---

## J. Mini-Checklist (Quick PR Review)

Untuk PR kecil (< 200 LOC, no DB migration, no security touch):

- [ ] CI hijau
- [ ] Unit test ditambah / di-update
- [ ] Self-test manual di lokal
- [ ] No console.log / debugger left behind
- [ ] No commented-out code
- [ ] No `any` type baru tanpa justifikasi
- [ ] No hardcoded secret atau URL prod
- [ ] PR description menjelaskan **why**, bukan hanya **what**

---

*Update terakhir: 2026-05-25 — selaras dengan QA-MASTER-PLAN v1.0.*
