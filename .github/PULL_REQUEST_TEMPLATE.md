# Pull Request

## Konteks

<!-- Apa yang berubah dan KENAPA. Sebut motivasi, bukan hanya deskripsi diff. -->

Closes #

## Tipe Perubahan

- [ ] 🚀 Feature baru
- [ ] 🐛 Bug fix
- [ ] ♻️ Refactor (no behavior change)
- [ ] 📝 Documentation
- [ ] 🎨 Style / formatting (Prettier, ESLint)
- [ ] ✅ Test only
- [ ] 🔧 Build / CI / chore
- [ ] 💥 Breaking change

## Area Terdampak

- [ ] Server (Express / Drizzle / Supabase)
- [ ] Client (React / Vite)
- [ ] Shared (api-types, schemas)
- [ ] Database schema / migration
- [ ] Auth flow (Supabase / OAuth)
- [ ] Chat SSE streaming
- [ ] Voice WebRTC
- [ ] Studio bot builder
- [ ] Deploy scripts / Nginx / PM2
- [ ] CI/CD pipeline

## Definition of Done

Sebelum minta review, pastikan poin berikut sudah ✅. Detail di [docs/qa/DEFINITION-OF-DONE.md](../docs/qa/DEFINITION-OF-DONE.md).

- [ ] Acceptance criteria di issue dipenuhi
- [ ] Unit test ditulis / di-update
- [ ] CI hijau lokal (`npm run qa:all`)
- [ ] Tidak ada `console.log`, `debugger`, atau kode komentar mati
- [ ] Tidak ada hardcoded secret
- [ ] Tidak ada `any` baru tanpa komentar `// reason: ...`
- [ ] PR description jelas — menyebut **why**
- [ ] Screenshot / GIF dilampirkan kalau ada perubahan UI
- [ ] Migration / rollback plan ditulis (kalau touch DB)
- [ ] CHANGELOG.md di-update (kalau release)

## Testing

<!-- Bagaimana kamu test perubahan ini? Manual + automated. -->

- Manual steps:
  1.
  2.
- Automated:
  - [ ] Unit (Vitest)
  - [ ] Integration (`npm run test:integration`)
  - [ ] E2E (Playwright)

## Risk Assessment

<!-- Risk level (Low / Medium / High) dengan alasan, dan rollback plan kalau Medium+ -->

- **Risk level**:
- **Blast radius**: <!-- berapa banyak user / fitur terdampak -->
- **Rollback plan**: <!-- bagaimana kalau perlu rollback -->

## Screenshot / Demo (kalau ada UI change)

<!-- Drop image / GIF di sini -->

## Reviewer Notes

<!-- Catatan khusus untuk reviewer. Apa yang harus diperhatikan ekstra? -->

---

<sub>Selaras dengan [QA Master Plan](../docs/qa/QA-MASTER-PLAN.md) dan [QC Checklist](../docs/qa/QC-CHECKLIST.md).</sub>
