#!/usr/bin/env bash
# Upload GHL secrets to the Cloudflare Worker that serves latinuspro.com.
# Requires `wrangler login` and a populated local .env beforehand.
#
# Usage:
#   npm run build                # generates dist/server/wrangler.json
#   scripts/set-ghl-secrets.sh   # pushes secrets to astro-kingkong

set -euo pipefail

if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
else
  echo "No .env found — populate it from .env.example first." >&2
  exit 1
fi

CONFIG="dist/server/wrangler.json"
if [[ ! -f "$CONFIG" ]]; then
  echo "$CONFIG not found. Run 'npm run build' first." >&2
  exit 1
fi

echo "Pushing secrets to $CONFIG (worker: astro-kingkong) ..."

push() {
  local key="$1"
  local value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "  skip $key (empty)"
    return
  fi
  printf '%s' "$value" | npx wrangler secret put "$key" --config "$CONFIG"
}

push GHL_LOCATION_ID
push GHL_FORM_ID
push GHL_API_KEY
push DEBUG

echo "Done."
