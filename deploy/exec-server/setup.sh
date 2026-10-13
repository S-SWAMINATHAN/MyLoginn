#!/usr/bin/env bash
# One-shot setup of the LogiQuest code-execution server (Piston behind Caddy with HTTPS + token).
# Run as root on a fresh Ubuntu 22.04/24.04 VPS whose DNS A record already points at it:
#
#   DOMAIN=exec.myloginn.com bash setup.sh
#
# At the end it prints the two values to put in Vercel (LQ_EXEC_URL, LQ_EXEC_TOKEN).
set -euo pipefail

: "${DOMAIN:?Set DOMAIN, e.g. DOMAIN=exec.myloginn.com bash setup.sh}"
[ "$(id -u)" -eq 0 ] || { echo "Run as root."; exit 1; }

echo "==> Checking DNS for $DOMAIN"
SERVER_IP=$(curl -fsS https://api.ipify.org || true)
DNS_IP=$(getent hosts "$DOMAIN" | awk '{print $1}' | head -n1 || true)
if [ -z "$DNS_IP" ] || [ "$DNS_IP" != "$SERVER_IP" ]; then
  echo "DNS for $DOMAIN resolves to '${DNS_IP:-nothing}' but this server is '$SERVER_IP'."
  echo "Create an A record  exec -> $SERVER_IP  (DNS only, no proxy), wait a few minutes, then re-run."
  exit 1
fi

echo "==> Installing Docker, Caddy, firewall"
apt-get update -y
apt-get install -y ca-certificates curl gnupg ufw python3 openssl debian-keyring debian-archive-keyring apt-transport-https
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y && apt-get install -y caddy
fi
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

echo "==> Starting Piston (listens on localhost only)"
docker rm -f piston >/dev/null 2>&1 || true
docker run --privileged -dit --name piston --restart unless-stopped \
  -v piston_packages:/piston/packages -p 127.0.0.1:2000:2000 ghcr.io/engineer-man/piston
for i in $(seq 1 30); do curl -fsS localhost:2000/api/v2/runtimes >/dev/null 2>&1 && break; sleep 2; done

echo "==> Installing language runtimes (this can take several minutes)"
for lang in python node java gcc mono go php kotlin; do
  ver=$(curl -fsS localhost:2000/api/v2/packages | python3 -c "
import sys, json
v = [p['language_version'] for p in json.load(sys.stdin) if p['language'] == '$lang']
print(v[-1] if v else '')")
  if [ -z "$ver" ]; then echo "  ! no package '$lang' offered by this Piston build"; continue; fi
  echo "  - $lang $ver"
  curl -fsS -X POST localhost:2000/api/v2/packages -H 'Content-Type: application/json' -d "{\"language\":\"$lang\",\"version\":\"$ver\"}" >/dev/null \
    || echo "  ! failed to install $lang"
done

echo "==> Configuring HTTPS + token"
TOKEN_FILE=/etc/caddy/lq-exec.token
[ -f "$TOKEN_FILE" ] || { openssl rand -hex 32 > "$TOKEN_FILE"; chmod 600 "$TOKEN_FILE"; }
TOKEN=$(cat "$TOKEN_FILE")
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
	@unauthorized not header Authorization "$TOKEN"
	respond @unauthorized "Unauthorized" 401
	request_body {
		max_size 200KB
	}
	reverse_proxy 127.0.0.1:2000
}
EOF
chmod 640 /etc/caddy/Caddyfile && chgrp caddy /etc/caddy/Caddyfile
systemctl restart caddy

cat <<EOF

============================================================
 Done. Add these to Vercel (Settings > Environment Variables),
 then redeploy:

   LQ_EXEC_URL=https://$DOMAIN
   LQ_EXEC_TOKEN=$TOKEN

 Keep the token secret. Check it from your PC with:
   LQ_EXEC_URL=https://$DOMAIN LQ_EXEC_TOKEN=... node scripts/lq-exec-check.mjs
============================================================
EOF
