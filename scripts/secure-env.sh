#!/usr/bin/env bash
set -euo pipefail

# Move local .env to a secure location and create a safe example file
# Usage: ./scripts/secure-env.sh

SRC="web/.env.local"
DST="$HOME/.config/reefx/web.env.local"
EXAMPLE="web/.env.local.example"

mkdir -p "$(dirname "$DST")"

if [ -f "$SRC" ]; then
  mv "$SRC" "$DST"
  echo "Moved $SRC -> $DST"
else
  echo "No $SRC found — nothing to move"
fi

if [ ! -f "$EXAMPLE" ]; then
  cat > "$EXAMPLE" <<'EOF'
# Example environment file for REEFX web
# Copy to .env.local and fill in your secrets for local development.

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Admin configuration is deprecated — set `is_admin` in the `profiles` table instead.
# See web/supabase/add-admin-flag.sql
EOF
  echo "Created example env at $EXAMPLE"
else
  echo "$EXAMPLE already exists — leaving it unchanged"
fi

echo "Done. Your real env is now at: $DST"
