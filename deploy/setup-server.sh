#!/usr/bin/env bash
# ============================================================
# NusaLingua MVP — Ubuntu 22.04 Server Setup (Otomatis)
# ============================================================
# Jalankan sebagai user non-root dengan sudo access:
#   chmod +x setup-server.sh
#   ./setup-server.sh
#
# Script ini install: Node.js 20 LTS, Nginx, certbot, ufw, PM2, git
# Plus setup: firewall, swap (kalau RAM <2GB), automatic security updates
# ============================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# Verify Ubuntu 22.04
if ! grep -q "22.04" /etc/os-release; then
    warn "Detected non-Ubuntu-22.04. Script tested for Ubuntu 22.04 LTS — lanjut dengan risiko sendiri."
fi

# Don't run as root
if [ "$EUID" -eq 0 ]; then
    err "Jangan jalankan sebagai root. Pakai user biasa dengan sudo."
fi

# ============================================================
log "Step 1/8: Update sistem"
# ============================================================
sudo apt-get update
sudo apt-get upgrade -y

# ============================================================
log "Step 2/8: Install Node.js 20 LTS via NodeSource"
# ============================================================
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
log "Node version: $(node -v), npm version: $(npm -v)"

# ============================================================
log "Step 3/8: Install Nginx + certbot"
# ============================================================
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
log "Nginx version: $(nginx -v 2>&1)"

# ============================================================
log "Step 4/8: Install PM2 (process manager)"
# ============================================================
if ! command -v pm2 >/dev/null 2>&1; then
    sudo npm install -g pm2
fi
log "PM2 version: $(pm2 -v)"

# ============================================================
log "Step 5/8: Install tools tambahan (git, ufw, curl, fail2ban)"
# ============================================================
sudo apt-get install -y git ufw curl wget htop fail2ban unattended-upgrades

# ============================================================
log "Step 6/8: Setup firewall (UFW)"
# ============================================================
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw --force enable
sudo ufw status

# ============================================================
log "Step 7/8: Setup swap kalau RAM < 2GB"
# ============================================================
RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "$RAM_MB" -lt 2048 ] && [ ! -f /swapfile ]; then
    log "RAM rendah ($RAM_MB MB), buat 2GB swap..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# ============================================================
log "Step 8/8: Enable automatic security updates"
# ============================================================
sudo dpkg-reconfigure -plow unattended-upgrades || true

# ============================================================
log "Setup selesai!"
# ============================================================
echo ""
echo "============================================================"
echo "✅ Server siap. Langkah selanjutnya:"
echo ""
echo "  1. Clone repo NusaLingua:"
echo "     git clone <your-repo> ~/nusalingua-mvp"
echo "     cd ~/nusalingua-mvp"
echo ""
echo "  2. Setup environment (.env):"
echo "     bash deploy/configure-env.sh"
echo ""
echo "  3. Install & build:"
echo "     bash deploy/build.sh"
echo ""
echo "  4. Setup nginx + SSL:"
echo "     bash deploy/setup-nginx.sh"
echo ""
echo "  5. Start dengan PM2:"
echo "     bash deploy/start.sh"
echo "============================================================"
