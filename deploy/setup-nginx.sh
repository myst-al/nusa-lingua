#!/usr/bin/env bash
# ============================================================
# NusaLingua — Setup Nginx + SSL (Let's Encrypt)
# ============================================================
# Jalankan dari root project (~/nusalingua-mvp):
#   bash deploy/setup-nginx.sh
#
# Prerequisites:
#   - Domain sudah pointing A record ke IP server ini
#   - Port 80 & 443 sudah terbuka di firewall
#   - setup-server.sh sudah dijalankan (nginx + certbot terinstall)
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# Tanya domain & email
read -p "Domain utama (mis. nusalingua.id): " DOMAIN
read -p "Tambah www subdomain juga? (y/n): " WWW
read -p "Email untuk Let's Encrypt (notif renewal): " EMAIL

[ -z "$DOMAIN" ] && err "Domain wajib diisi"
[ -z "$EMAIL" ]  && err "Email wajib diisi"

# Build domain args
DOMAIN_ARGS="-d $DOMAIN"
SERVER_NAMES="$DOMAIN"
if [ "$WWW" = "y" ]; then
    DOMAIN_ARGS="$DOMAIN_ARGS -d www.$DOMAIN"
    SERVER_NAMES="$DOMAIN www.$DOMAIN"
fi

# ============================================================
log "Step 1/5: Build path setup"
# ============================================================
sudo mkdir -p /var/www/nusalingua
sudo chown -R "$USER:$USER" /var/www/nusalingua

# Copy client build kalau ada
if [ -d "client/dist" ]; then
    cp -r client/dist/* /var/www/nusalingua/
    log "Client build dicopy ke /var/www/nusalingua/"
else
    warn "client/dist belum ada. Jalankan: bash deploy/build.sh dulu"
fi

# ============================================================
log "Step 2/5: Install nginx config"
# ============================================================
sed "s/YOUR_DOMAIN.COM www.YOUR_DOMAIN.COM/$SERVER_NAMES/" \
    deploy/nginx.conf | sudo tee /etc/nginx/sites-available/nusalingua > /dev/null

# Enable site
sudo ln -sf /etc/nginx/sites-available/nusalingua /etc/nginx/sites-enabled/nusalingua

# Disable default kalau aktif
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t || err "Nginx config invalid"
sudo systemctl reload nginx
log "Nginx config terpasang"

# ============================================================
log "Step 3/5: Tunggu DNS propagation"
# ============================================================
SERVER_IP=$(curl -s ifconfig.me)
log "Server IP: $SERVER_IP"
log "Pastikan A record $DOMAIN sudah pointing ke $SERVER_IP"

read -p "DNS sudah propagate? (cek dengan: dig $DOMAIN) (y/n): " READY
[ "$READY" != "y" ] && err "Setup SSL ditunda. Jalankan ulang setelah DNS ready."

# ============================================================
log "Step 4/5: Generate SSL cert via Let's Encrypt"
# ============================================================
sudo certbot --nginx $DOMAIN_ARGS \
    --non-interactive --agree-tos \
    --email "$EMAIL" \
    --redirect \
    --hsts \
    --staple-ocsp

log "SSL certificate aktif. Auto-renewal sudah di-setup."

# Test renewal dry-run
sudo certbot renew --dry-run

# ============================================================
log "Step 5/5: Test akses HTTPS"
# ============================================================
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    log "✅ https://$DOMAIN/ OK (HTTP $HTTP_STATUS)"
else
    warn "https://$DOMAIN/ returned HTTP $HTTP_STATUS — cek log: /var/log/nginx/nusalingua.error.log"
fi

echo ""
echo "============================================================"
echo "✅ Nginx + SSL aktif!"
echo "   Frontend:  https://$DOMAIN"
echo "   API:       https://$DOMAIN/api/health"
echo ""
echo "Next: jalankan PM2 untuk start Node server"
echo "   bash deploy/start.sh"
echo "============================================================"
