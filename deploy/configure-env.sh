#!/usr/bin/env bash
# ============================================================
# NusaLingua — Interactive Environment Setup Wizard
# ============================================================
# Wizard yang nanya credentials satu per satu, validasi format,
# dan generate .env file. Auto-generate session secrets.
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $*"; }

# Cek di root project
if [ ! -f ".env.example" ]; then
    err "Jalankan dari root project nusalingua-mvp/"
fi

# Backup .env lama kalau ada
if [ -f ".env" ]; then
    cp .env ".env.backup.$(date +%s)"
    warn ".env existing di-backup"
fi

clear
cat <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║       NusaLingua MVP — Environment Setup Wizard              ║
║                                                              ║
║  Wizard ini akan menanyakan credentials satu per satu.       ║
║  Sebelum mulai, pastikan kamu sudah:                         ║
║    [✓] Punya akun Supabase (supabase.com)                    ║
║    [✓] Punya akun OpenAI (platform.openai.com)               ║
║    [✓] Punya domain (untuk production)                       ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo ""
read -p "Press ENTER untuk mulai..." _

# ============================================================
# SECTION 1: Supabase
# ============================================================
clear
cat <<'EOF'
═══════════════════════════════════════════════════════════════
  SECTION 1/4 — Supabase (Database + Auth)
═══════════════════════════════════════════════════════════════

  📌 Cara dapat credentials:
  1. Buka https://supabase.com → login → New Project
  2. Pilih region Singapore atau Tokyo (terdekat ke ID)
  3. Set strong DB password (simpan!)
  4. Tunggu provisioning (~2 menit)
  5. Setelah ready, masuk ke Project Settings → API

  Yang dibutuhkan:
    • Project URL          (Project URL)
    • anon (public) key    (Project API keys → anon public)
    • service_role key     (Project API keys → service_role)  [RAHASIA]
    • JWT Secret           (JWT Settings → JWT Secret)
    • Database URL         (Database → Connection string → URI)

EOF
read -p "Sudah siap? (y/n): " ready
[ "$ready" != "y" ] && err "Setup dibatalkan."

echo ""
read -p "  Supabase URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -p "  Supabase anon key (eyJhbGc...): " SUPABASE_ANON_KEY
read -p "  Supabase service_role key (eyJhbGc...): " SUPABASE_SERVICE_ROLE_KEY
read -p "  Supabase JWT Secret: " SUPABASE_JWT_SECRET
read -p "  Database URL (postgres://...): " DATABASE_URL

# Validate format
[[ "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]] || warn "Format Supabase URL aneh, cek lagi"
[[ "$SUPABASE_ANON_KEY" =~ ^eyJ ]] || warn "anon key biasanya mulai 'eyJ', cek lagi"
[[ "$DATABASE_URL" =~ ^postgres ]] || warn "DATABASE_URL harus mulai 'postgres://'"

# ============================================================
# SECTION 2: OpenAI
# ============================================================
clear
cat <<'EOF'
═══════════════════════════════════════════════════════════════
  SECTION 2/4 — OpenAI (LLM + Voice)
═══════════════════════════════════════════════════════════════

  📌 Cara dapat API key:
  1. Buka https://platform.openai.com/api-keys
  2. Klik "Create new secret key"
  3. Beri nama (mis. "nusalingua-prod")
  4. Permission: "Restricted" (recommended) atau "All"
  5. Copy key (mulai sk-proj-... atau sk-...) — TIDAK BISA dilihat lagi!
  6. Top-up saldo minimal $10 di Billing → Add to credit balance

  💰 Estimasi biaya:
    • GPT-4o-mini: ~$0.15 per 1M input tokens
    • GPT-4o-realtime: ~$0.06/min audio in, $0.24/min audio out

EOF
read -p "Sudah punya key + saldo? (y/n): " ready
[ "$ready" != "y" ] && err "Top-up dulu lalu jalankan ulang script ini."

echo ""
read -p "  OpenAI API Key (sk-...): " OPENAI_API_KEY
read -p "  Chat model [gpt-4o-mini]: " OPENAI_CHAT_MODEL
OPENAI_CHAT_MODEL=${OPENAI_CHAT_MODEL:-gpt-4o-mini}
read -p "  Realtime model [gpt-4o-realtime-preview-2024-12-17]: " OPENAI_REALTIME_MODEL
OPENAI_REALTIME_MODEL=${OPENAI_REALTIME_MODEL:-gpt-4o-realtime-preview-2024-12-17}

[[ "$OPENAI_API_KEY" =~ ^sk- ]] || warn "OpenAI key biasanya mulai 'sk-', cek lagi"

# ============================================================
# SECTION 3: Domain + Server Config
# ============================================================
clear
cat <<'EOF'
═══════════════════════════════════════════════════════════════
  SECTION 3/4 — Domain & Server Config
═══════════════════════════════════════════════════════════════
EOF
echo ""
read -p "  Production domain (mis. nusalingua.id): " DOMAIN
[ -z "$DOMAIN" ] && err "Domain wajib"

CLIENT_ORIGIN="https://${DOMAIN}"
read -p "  Override CLIENT_ORIGIN? [$CLIENT_ORIGIN]: " override
[ -n "$override" ] && CLIENT_ORIGIN="$override"

read -p "  Server PORT [3001]: " PORT
PORT=${PORT:-3001}

# ============================================================
# SECTION 4: Generate auto secrets + write .env
# ============================================================
clear
log "SECTION 4/4 — Generate session secrets & write .env"
echo ""

# Generate random session secret untuk app-level usage (kalau perlu nanti)
APP_SESSION_SECRET=$(openssl rand -hex 32)
log "App session secret di-generate (64 hex)"

# ============================================================
# Write .env files
# ============================================================
cat > .env << EOF
# ============================================================
# NusaLingua Production .env — generated $(date -Iseconds)
# CONFIDENTIAL — JANGAN COMMIT KE GIT!
# ============================================================

NODE_ENV=production
PORT=$PORT
CLIENT_ORIGIN=$CLIENT_ORIGIN

# OpenAI
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_CHAT_MODEL=$OPENAI_CHAT_MODEL
OPENAI_REALTIME_MODEL=$OPENAI_REALTIME_MODEL

# Supabase
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET

# App-level secrets (auto-generated)
APP_SESSION_SECRET=$APP_SESSION_SECRET

# Vite (untuk client build, akan di-baca saat build time)
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

chmod 600 .env
log ".env created (mode 600 — owner read/write only)"

# Verifikasi koneksi Supabase
log "Test koneksi Supabase..."
if command -v psql >/dev/null 2>&1; then
    if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        log "✅ Database reachable"
    else
        warn "Database tidak reachable. Cek password & whitelist IP di Supabase Dashboard."
    fi
else
    warn "psql tidak terinstall — skip test (install: sudo apt install postgresql-client)"
fi

# Test OpenAI
log "Test API OpenAI..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    https://api.openai.com/v1/models)
if [ "$HTTP" = "200" ]; then
    log "✅ OpenAI API key valid"
else
    warn "OpenAI API returned HTTP $HTTP — cek key & saldo"
fi

echo ""
echo "============================================================"
echo "✅ Environment setup selesai!"
echo ""
echo "   File:    $(pwd)/.env"
echo "   Mode:    $(stat -c %a .env)"
echo "   Domain:  $DOMAIN"
echo ""
echo "Next steps:"
echo "  1. bash deploy/build.sh           # install deps + build client"
echo "  2. bash deploy/db-setup.sh        # push schema + seed bahasa"
echo "  3. bash deploy/setup-nginx.sh     # nginx + SSL"
echo "  4. bash deploy/start.sh           # start PM2"
echo "============================================================"
