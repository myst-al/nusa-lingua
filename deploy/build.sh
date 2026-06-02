#!/usr/bin/env bash
# ============================================================
# NusaLingua — Install deps + build production
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[+]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

[ -f ".env" ] || err "Run deploy/configure-env.sh dulu (untuk generate .env)"

log "Install root deps..."
npm install --no-audit --no-fund

log "Install server deps..."
npm --prefix server install --no-audit --no-fund

log "Install client deps..."
npm --prefix client install --no-audit --no-fund

log "Build client (vite)..."
# Inject VITE_ env vars dari .env
set -a
source .env
set +a
npm --prefix client run build

log "Build server (tsc)..."
npm --prefix server run build

log "✅ Build selesai"
echo ""
echo "   Client output: client/dist/  ($(du -sh client/dist | cut -f1))"
echo "   Server output: server/dist/  ($(du -sh server/dist | cut -f1))"
