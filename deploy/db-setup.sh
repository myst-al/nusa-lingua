#!/usr/bin/env bash
# ============================================================
# NusaLingua — Push schema + seed bahasa ke Supabase
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[+]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

[ -f ".env" ] || err "Run deploy/configure-env.sh dulu"

# Export env supaya drizzle-kit bisa baca
set -a
source .env
set +a

log "Push schema ke Supabase Postgres..."
npm --prefix server run db:push

log "Seed bahasa daerah..."
npm --prefix server run db:seed

log "✅ Database siap. Cek di Supabase Dashboard → Table Editor."
