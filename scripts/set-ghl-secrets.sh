#!/usr/bin/env bash
# Upload GHL secrets to Cloudflare for both staging and production workers.
# Run once per worker. Requires `wrangler login` beforehand.
#
# Usage:
#   scripts/set-ghl-secrets.sh            # staging  (wrangler.jsonc → astro-kingkong)
#   scripts/set-ghl-secrets.sh production # prod     (wrangler.production.jsonc → latinuspro)

set -euo pipefail

if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
else
  echo "No .env found — populate it from .env.example first." >&2
  exit 1
fi

CONFIG="wrangler.jsonc"
if [[ "${1:-}" == "production" ]]; then
  CONFIG="wrangler.production.jsonc"
fi

echo "Pushing secrets to $CONFIG ..."

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
