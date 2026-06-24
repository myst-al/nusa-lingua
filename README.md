# NusaLingua MVP

> Platform AI percakapan multibahasa Nusantara — MVP Stack 1 (Rapid Prototype).

Stack:
- **Client**: React 18 + Vite + TypeScript + Tailwind + React Router + TanStack Query
- **Server**: Node.js + Express + TypeScript + Zod + jose (JWT verify)
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Auth**: Supabase Auth (email/password + OAuth Google & GitHub)
- **AI**: OpenAI GPT-4o (chat + SSE streaming), gpt-4o-realtime (voice via WebRTC)
- **Dev**: concurrently untuk run client+server bareng

## Struktur folder

```
nusalingua-mvp/
├── client/              # React + Vite frontend (port 6101)
├── server/              # Express + TS backend (port 6100)
├── shared/              # Shared TypeScript types
└── .env.example
```

## Quick start

### 1. Prerequisites

- Node.js 18+
- Akun [Supabase](https://supabase.com) (gratis)
- OpenAI API key — [platform.openai.com](https://platform.openai.com)

### 2. Setup Supabase

1. Daftar/login di [supabase.com](https://supabase.com), buat project baru.
2. Di **Project Settings → API**, copy:
   - Project URL → `SUPABASE_URL` & `VITE_SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY` & `VITE_SUPABASE_ANON_KEY`
   - service_role key (RAHASIA!) → `SUPABASE_SERVICE_ROLE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET`
3. Di **Project Settings → Database → Connection string → URI**, copy ke `DATABASE_URL`.
4. (Opsional) **Authentication → Providers**: aktifkan Google & GitHub OAuth.

### 3. Install dependencies

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 4. Setup environment

```bash
cp .env.example .env
# Edit .env dan isi semua nilai dari Supabase + OPENAI_API_KEY
```

### 5. Push schema ke Supabase

```bash
npm --prefix server run db:push
npm --prefix server run db:seed
```

`db:push` membuat tabel `users`, `languages`, `conversations`, `messages`, `bots`, `api_keys` di Supabase Postgres.
`db:seed` mengisi 8 bahasa daerah (Indonesia + Jawa + Sunda + Batak + Bugis + Dayak + Minang + Bali).

### 6. Jalankan dev server

```bash
npm run dev
```

- Client: http://localhost:6101
- Server: http://localhost:6100
- Health check: http://localhost:6100/api/health

## Fitur MVP

### Phase 1: Foundation ✅
- [x] Landing page (replikasi mockup PDF)
- [x] Supabase Auth (email/password + Google + GitHub OAuth)
- [x] User profile mirror ke tabel `users` saat login pertama kali
- [x] Protected routes via `<RequireAuth>` HOC

### Phase 2: Chat ✅
- [x] Chat AI multibahasa (text streaming via SSE)
- [x] Conversation history persistent di Supabase
- [x] System prompt per bahasa (konteks budaya Jawa krama, Sunda lemes, dll)
- [x] Multi-conversation sidebar dengan switcher

### Phase 3: Voice ✅
- [x] Voice AI **full bi-directional via WebRTC** (OpenAI Realtime API)
- [x] Ephemeral token generated server-side (security best-practice)
- [x] Live transcript display (user + assistant)
- [x] Mute, switch language, end-call controls
- [x] Server VAD (Voice Activity Detection)

### Phase 4: Studio ✅
- [x] No-code chatbot builder (3-panel canvas)
- [x] Drag-tap palette: Trigger / System Prompt / LLM Call / Condition / Send Reply / End
- [x] Properties panel kontekstual (per node + global bot config)
- [x] Save & Test bot → buat conversation dengan custom system prompt

## API Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/api/health` | – | Health check |
| `GET` | `/api/languages` | – | Daftar bahasa daerah |
| `GET` | `/api/languages/:code` | – | Detail satu bahasa |
| `GET` | `/api/conversations` | ✓ | List percakapan user |
| `POST` | `/api/conversations` | ✓ | Buat percakapan baru |
| `GET` | `/api/conversations/:id` | ✓ | Detail percakapan |
| `GET` | `/api/conversations/:id/messages` | ✓ | History messages |
| `POST` | `/api/conversations/:id/messages` | ✓ | Send message (SSE streaming) |
| `DELETE` | `/api/conversations/:id` | ✓ | Hapus percakapan |
| `POST` | `/api/voice/session` | ✓ | Generate ephemeral token Realtime |
| `GET` | `/api/bots` | ✓ | List bots user |
| `POST` | `/api/bots` | ✓ | Buat bot baru |
| `GET` | `/api/bots/:id` | ✓ | Detail bot |
| `PATCH` | `/api/bots/:id` | ✓ | Update bot |
| `DELETE` | `/api/bots/:id` | ✓ | Hapus bot |

Auth headers: `Authorization: Bearer <supabase-access-token>` (didapat dari `supabase.auth.getSession()`).

## Skema database

Lihat `server/src/db/schema.ts`. Tabel utama:

| Tabel | Deskripsi |
|---|---|
| `users` | Mirror dari Supabase `auth.users` (UUID), dengan metadata tambahan |
| `languages` | 8 bahasa daerah dengan system prompt khusus |
| `conversations` | Sesi chat (user + language + optional bot) |
| `messages` | Message dalam conversation (role, content, tokens) |
| `bots` | NusaLingua Studio: bot config + flow JSON |
| `api_keys` | (Phase 2) API keys untuk developer |

## License

MIT — open source sesuai mission NusaLingua.
