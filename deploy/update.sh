#!/usr/bin/env bash
# ============================================================
# NusaLingua — Update deployment (pull + rebuild + restart)
# ============================================================
# Buat redeploy setelah `git pull`. Zero-downtime kalau pakai cluster mode.
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log() { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

log "1/5 Pull latest code..."
git pull --rebase

log "2/5 Install deps (kalau ada perubahan)..."
npm install --no-audit --no-fund
npm --prefix server install --no-audit --no-fund
npm --prefix client install --no-audit --no-fund

log "3/5 Rebuild..."
set -a; source .env; set +a
npm --prefix client run build
npm --prefix server run build

log "4/5 Sync client build ke nginx root..."
sudo rsync -a --delete client/dist/ /var/www/nusalingua/

log "5/5 Restart PM2 (graceful reload)..."
pm2 reload nusalingua-server

log "✅ Update selesai."
pm2 status
