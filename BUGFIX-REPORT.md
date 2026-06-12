# NusaLingua — Bug Fix Report (Production Hardening)

> Audit & perbaikan 2026-06-12. Semua fix sudah diterapkan langsung di kode dan diverifikasi via typecheck + production build.

## Kritis

| # | File | Bug | Dampak | Fix |
|---|---|---|---|---|
| 1 | `server/src/routes/messages.ts` | Riwayat chat dikirim ke LLM **tanpa limit** (komentar bilang max 20, kode load semua) | Biaya token naik linear per panjang percakapan; akhirnya melebihi context window → error | Query `desc + limit 20` lalu reverse ke kronologis |
| 2 | `server/src/routes/messages.ts` | Stream LLM tidak di-abort saat client disconnect | Token OpenAI/Groq terus terpakai setelah user tutup tab | `AbortController` + `res.on("close")`; partial response tetap disimpan ke DB |
| 3 | `server/src/routes/messages.ts`, `conversations.ts` | **Authz gap**: `botId` apa pun bisa dipakai — termasuk bot private milik user lain (system prompt-nya ikut terpakai) | Kebocoran prompt/konfigurasi antar user | Bot hanya boleh dipakai jika milik sendiri ATAU `isPublic && published`; divalidasi saat create conversation & saat kirim pesan |
| 4 | `server/src/routes/bots.ts` | `description: null` ditolak Zod (`.optional()` ≠ nullable) | Tombol **"Simpan Perubahan"** di Studio selalu gagal 400 untuk bot tanpa deskripsi | Schema jadi `.nullish()`; PATCH juga validasi `languageCode` → 400 (bukan FK error 500) |
| 5 | `server/src/routes/voice.ts` | Enum voice berisi `fable/onyx/nova` — hanya valid untuk TTS API, **ditolak Realtime API** | Pilihan voice tertentu → error 400 dari OpenAI | Enum diganti ke voice yang didukung Realtime: `alloy, ash, ballad, coral, echo, sage, shimmer, verse` |
| 6 | `client/src/lib/realtime.ts` | Model realtime **hardcoded** di client | Ganti `OPENAI_REALTIME_MODEL` di server → client tetap handshake ke model lama (mismatch) | Pakai `session.model` dari response server, hardcode tinggal fallback |
| 7 | `server/src/index.ts` | Tidak ada `trust proxy`; listen di semua interface | Di belakang nginx `req.ip` = IP proxy; port 3001 berpotensi diakses langsung dari internet | `app.set("trust proxy", 1)`; production bind `127.0.0.1` |
| 8 | `deploy/nginx.conf` | `proxy_set_header Connection "upgrade"` hardcoded | Keepalive ke upstream mati untuk semua request biasa → koneksi TCP baru per request | Tambah `map $http_upgrade $connection_upgrade`, header pakai variabel |

## Sedang

| # | File | Bug | Fix |
|---|---|---|---|
| 9 | `client/src/pages/Studio.tsx` | Pindah dari bot existing ke "+ Bot Baru" tidak mereset form → bot lama tersimpan duplikat | `useEffect` reset draft saat `botId` kosong |
| 10 | `client/src/pages/Studio.tsx` | Input Temperature/Max Tokens dikosongkan → `NaN` → JSON `null` → 400 | Guard `Number.isFinite` + clamp; kosong = pakai default server |
| 11 | `client/src/pages/Explorer.tsx` | Halaman publik tapi klik bahasa butuh auth → gagal diam-diam (mutation tanpa onError) | Cek `user` → redirect `/login` (dengan return path); `onError` handler ditambahkan |
| 12 | `server/src/middleware/auth.ts` | Upsert user ke DB di **setiap request** | Cache in-memory `Set` user-id (cap 10k) — write DB hanya sekali per user per proses |

## Minor

| # | File | Bug | Fix |
|---|---|---|---|
| 13 | `deploy/configure-env.sh` | Tidak menanyakan `GROQ_API_KEY`/`AI_PROVIDER` padahal app mendukung Groq (chat gratis) | Section Groq opsional ditambahkan; keys ikut ditulis ke `.env` |
| 14 | `deploy/ecosystem.config.cjs` | `env_file: ".env"` — opsi yang tidak ada di PM2 (diabaikan diam-diam, menyesatkan) | Dihapus + komentar penjelasan (dotenv di app yang load `.env`) |
| 15 | `server/package.json` | `src/__tests__/test-schema.ts` mengimpor `@electric-sql/pglite` tapi paket **tidak terdaftar** di dependencies mana pun (typecheck & `npm run test` gagal di instalasi bersih) | Ditambahkan ke devDependencies (`^0.2.17`) + terpasang |

## Ronde 2 (12 Jun, sore)

| # | File | Bug | Fix |
|---|---|---|---|
| 16 | `client/src/lib/realtime.ts`, `Voice.tsx` | Status `"speaking"` tidak pernah ter-set — UI selalu "Mendengarkan" walau AI sedang bicara | Event `onSpeakingChange` baru (dari `output_audio_buffer.started/stopped` + `response.done`); Voice.tsx toggle listening↔speaking dengan guard idle/error |
| 17 | `client/src/pages/Chat.tsx` | Select "Pilih Bahasa" tidak reset — memilih bahasa yang sama dua kali tidak memicu percakapan baru | Reset value ke placeholder setelah onChange |
| 18 | `client/src/pages/Chat.tsx` | Saat stream error, optimistic message temp (`tmp-*`) tertinggal di UI dan tidak sinkron dengan DB | `invalidateQueries(messages)` di onError untuk resync |
| 19 | `client/src/App.tsx` | Seluruh app dalam 1 bundle 710kB (warning Vite) | Route-level code splitting (`React.lazy` + `Suspense`); halaman jadi chunk terpisah (Studio 23kB, Chat 13kB, Voice 10kB, Login 9kB, Explorer 6kB), Landing tetap eager |

## Ronde 3 — UI/UX (13 Jun, diverifikasi visual via browser)

| # | File | Masalah | Fix |
|---|---|---|---|
| 20 | `Voice.tsx` | Select bahasa nempel di samping orb (button orb bukan block element, ikut inline flow) | Tambah `block` — select kini di atas orb, layout kolom benar |
| 21 | `Chat.tsx` | **Tidak ada tombol hapus percakapan** (API ada, UI tidak) | Tombol 🗑 per item sidebar (hover di desktop, selalu tampak di mobile) + konfirmasi + redirect kalau yang dihapus sedang dibuka |
| 22 | `Chat.tsx` | Layout `grid-cols-[280px_1fr]` fixed — rusak di mobile | Sidebar jadi drawer mobile (hamburger ☰ + backdrop), desktop tetap 2 kolom |
| 23 | `Studio.tsx` | Layout 3 kolom `260px_1fr_320px` fixed — rusak di mobile | Mobile: panel di-stack (canvas dulu, lalu palette & properties dengan max-height); desktop lg tetap 3 kolom |
| 24 | `Landing.tsx` | Tidak ada footer — halaman berakhir mendadak | Footer: logo, nav (Explorer/Chat/Voice/Studio), copyright |
| 25 | `Landing.tsx` | Timestamp stats "diperbarui 00.11.10" (detik ikut, mirip nomor versi) | Format jam:menit saja |
| 26 | `Header.tsx` | Header semi-transparan — teks hero tembus saat scroll; padding mobile terlalu lebar | `bg-white` solid + `px-4 md:px-8` |
| 27 | `Explorer.tsx` | Search box `min-w-[320px]` overflow di mobile; grid 2 kolom sempit di ponsel kecil | `w-full sm:min-w-[320px]`; grid `1 → sm:2 → md:3 → lg:4` |
| 28 | `Login.tsx` | Padding `p-12` terlalu besar di mobile | `p-8 md:p-12` + gap antar blok brand panel |

Verifikasi ronde 3: tsc 0 error, vite build sukses, halaman Landing/Voice/Chat/Explorer/Studio dicek visual di browser (desktop); perilaku mobile via breakpoint Tailwind standar.

## Catatan (tidak diubah, sadar-desain)

- `DELETE /conversations/:id` dan `/bots/:id` balas 204 walau id tidak ada — idempotent, dapat diterima.
- `stats.ts` cache in-memory per proses — aman selama PM2 `fork` 1 instance; pindah ke Redis kalau cluster mode.
- Upsert user cache reset saat restart proses — `onConflictDoNothing` membuatnya tetap aman.
- Main bundle masih 649kB (supabase-js + react vendor) — vendor chunk splitting masuk stretch goal Sprint 1.

## Verifikasi (dijalankan di mesin lokal, 2026-06-12)

- Server `tsc --noEmit`: **0 error**
- Client `tsc -b --noEmit`: **0 error**
- Client `vite build`: **sukses** (4.6s; catatan: bundle 710 kB — kandidat code-splitting, bukan bug)
- Server `tsc` emit: output di `server/dist/server/src/index.js` — **cocok** dengan path PM2/systemd config
- nginx config: struktur valid (map di http-context via sites-enabled)
- `server/node_modules` di-reinstall bersih via npm (162 paket) — sebelumnya dalam keadaan hybrid npm/pnpm yang rusak
