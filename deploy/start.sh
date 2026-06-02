#!/usr/bin/env bash
# ============================================================
# NusaLingua — Start Node server via PM2
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[+]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

[ -f "server/dist/server/src/index.js" ] || err "Belum build. Run: bash deploy/build.sh"
[ -f ".env" ] || err "Belum config env. Run: bash deploy/configure-env.sh"

mkdir -p logs

# Stop existing instance kalau ada
pm2 delete nusalingua-server 2>/dev/null || true

log "Starting NusaLingua server via PM2..."
pm2 start deploy/ecosystem.config.cjs

log "Save PM2 state untuk auto-start on reboot..."
pm2 save

log "Setup PM2 startup script..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo ""
log "✅ Server berjalan!"
echo ""
echo "   Status:   pm2 status"
echo "   Logs:     pm2 logs nusalingua-server"
echo "   Restart:  pm2 restart nusalingua-server"
echo "   Monitor:  pm2 monit"
echo ""
sleep 2
pm2 status

# Test health
echo ""
log "Test health endpoint..."
sleep 2
HTTP=$(curl -s -o /tmp/health_resp -w "%{http_code}" http://localhost:3001/api/health || echo "000")
if [ "$HTTP" = "200" ]; then
    log "✅ Health check OK"
    cat /tmp/health_resp; echo
else
    echo "❌ Health check failed (HTTP $HTTP). Cek log: pm2 logs nusalingua-server"
fi
