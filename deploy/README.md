# Backend deployment (Oracle Always Free VM + Cloudflare Tunnel)

The API runs as one always-on container. It keeps the live order stream (SSE), the email
outbox worker and the task queue in memory, so never run more than one replica.

```
GitHub push to main
  -> .github/workflows/deploy-backend.yml (rsync over SSH, then docker compose up -d --build)
       -> VM: backend container  <-- cloudflared tunnel <-- https://api.menusqr.in
```

## One-time VM setup (Ubuntu 24.04)

```bash
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"   # log out and back in afterwards

mkdir -p ~/menuqr/backend ~/menuqr/deploy
```

Create these files on the VM. None are committed to Git.

`~/menuqr/backend/.env` is the API environment. Copy every variable from the old host, then make
sure these are set:

```
NODE_ENV=production
TRUST_PROXY=true
STORAGE_DRIVER=s3
S3_ENDPOINT=...
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
ASSET_BASE_URL=...
```

The tunnel is created with the `cloudflared` CLI, so no Cloudflare payment method or Zero Trust
subscription is needed:

```bash
cloudflared tunnel login                              # authorize the menusqr.in zone in a browser
cloudflared tunnel create menusqr-api                 # prints the tunnel id, writes ~/.cloudflared/<id>.json
cloudflared tunnel route dns menusqr-api api-new.menusqr.in
cp ~/menuqr/deploy/cloudflared/config.example.yml ~/menuqr/deploy/cloudflared/config.yml   # then put the id in
```

## Cutover

1. Start the stack and test `https://api-new.menusqr.in/api/health`.
2. Add `api.menusqr.in` to `cloudflared/config.yml` ingress, run
   `cloudflared tunnel route dns --overwrite-dns menusqr-api api.menusqr.in`, restart `cloudflared`.
3. Keep the old host for a few days as a fallback.

## GitHub secrets

`ORACLE_HOST` (VM public IP), `ORACLE_USER` (`ubuntu`) and `ORACLE_SSH_KEY` (the private key).

## First start

```bash
cd ~/menuqr/deploy && docker compose up -d --build
docker compose logs -f backend
```

## Daily job

Subscription reminder emails are a standalone script, not part of the server. Schedule it on the
VM (the VM clock is UTC; 03:00 UTC is 08:30 IST):

```
0 3 * * * cd ~/menuqr/deploy && docker compose exec -T backend node scripts/subscription-reminders.js >> ~/reminders.log 2>&1
```

## Uploaded images

Images belong in the S3 bucket (`STORAGE_DRIVER=s3`), not on the VM disk. Files that were saved on
the old host's disk before the bucket existed can be copied over with
`node scripts/backfill-uploads-to-bucket.js` (run it where those files exist). The `/uploads/*`
route redirects to the bucket for anything it cannot find locally.
