# Ocean2Joy v2.0 — Deployment Guide

This directory contains **everything needed** to deploy Ocean2Joy v2.0 on any Linux
server with Docker. The entire stack (frontend + backend + MongoDB + reverse
proxy) runs as four Docker containers managed by a single `docker-compose.yml`.

**Target audience:** a sysadmin / DevOps engineer familiar with Docker, Nginx
and basic Linux. No application-level knowledge of the codebase is required.

---

## 1. Prerequisites (on the target server)

| Component | Minimum version | Why |
|---|---|---|
| Linux (any distro) | — | Docker Engine must run on it |
| Docker Engine | 24.x | Container runtime |
| Docker Compose plugin | v2 | Orchestration |
| Open TCP port **80** (and **443** if enabling HTTPS) | — | Inbound HTTP |
| ≥ 2 GB RAM, ≥ 10 GB disk | — | Comfortable headroom for MongoDB + uploads |

Install Docker + Compose on Ubuntu 22.04/24.04:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER         # log out & back in after this
```

---

## 2. Deploy in **one command**

```bash
# 1. Clone the repository
git clone https://github.com/<OWNER>/<REPO>.git ocean2joy && cd ocean2joy/deploy

# 2. Configure environment
cp .env.example .env
nano .env                             # fill in values — see section 3

# 3. Launch the whole stack
docker compose up -d --build
```

That's it. The app is reachable on `http://<server-ip>/`.

On first start, the MongoDB container automatically restores the bundled dump
from `db_dump/ocean2joy_v2/` (admin account, 2 reference projects). On
subsequent starts the data persists in the `mongo_data` Docker volume.

### Verify

```bash
# All 4 containers should be Up
docker compose ps

# Backend health check (should print {"status":"healthy"})
curl http://localhost/api/health

# Tail logs
docker compose logs -f --tail=100
```

---

## 3. Filling in `.env` — variable-by-variable reference

| Variable | What it is | How to set |
|---|---|---|
| `DB_NAME` | MongoDB database name | **Leave as `ocean2joy_v2`** — changing this breaks the bundled dump |
| `CORS_ORIGINS` | Comma-separated list of allowed web origins for the API | `https://your-domain.com,https://www.your-domain.com` |
| `JWT_SECRET` | Cookie signing key | Generate a strong secret:<br>`python3 -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin account (ignored if the DB dump is restored — admin already exists there) | Keep `admin@ocean2joy.com` + a strong password |
| `FRONTEND_URL` | Public HTTPS URL of the site (used inside admin notification emails) | `https://your-domain.com` |
| `RESEND_API_KEY` | API key from https://resend.com (for admin email alerts) | Sign up → API Keys → Create → paste the `re_...` value |
| `SENDER_EMAIL` | Envelope sender | `onboarding@resend.dev` works until you verify your own domain |
| `ADMIN_NOTIFY_EMAIL` | Who receives admin alerts | In Resend "testing mode" this MUST equal the Resend account's verified email; to free it up, verify a domain in Resend |
| `REACT_APP_BACKEND_URL` | The React build bakes this in as the API endpoint | **Same as `FRONTEND_URL`** |

---

## 4. Enabling HTTPS

The stack ships with plain HTTP on port 80. For production HTTPS we recommend
putting **Caddy** or **Cloudflare Tunnel** in front, or swapping the bundled
Nginx for one that speaks LetsEncrypt.

### Option A — Caddy in front (simplest)

On the host, install Caddy (one-liner Ubuntu: `sudo apt install caddy`), then:

```caddyfile
# /etc/caddy/Caddyfile
your-domain.com {
    reverse_proxy localhost:80
}
```

`sudo systemctl reload caddy` — done. Automatic Let's Encrypt + HTTP/2 + HSTS.
Now change the stack to only listen on `127.0.0.1:80` by editing
`docker-compose.yml`:
```yaml
ports:
  - "127.0.0.1:80:80"
```

### Option B — Cloudflare Tunnel

If the domain is on Cloudflare, run `cloudflared` as a separate service that
tunnels `your-domain.com` → `localhost:80`. No open ports required.

---

## 5. What the 4 containers do

| Container | Image | Role |
|---|---|---|
| `o2j_mongo` | `mongo:7` | Database. On first boot restores `db_dump/` (seeded admin + demo projects). Data persists in the `mongo_data` Docker volume. |
| `o2j_backend` | built from `backend.Dockerfile` | FastAPI + WeasyPrint (PDF) + Resend client. Serves `/api/*`. Uploads persist in the `backend_uploads` Docker volume. |
| `o2j_frontend` | built from `frontend.Dockerfile` | Nginx serving the compiled React bundle. |
| `o2j_nginx` | `nginx:1.27-alpine` | Reverse proxy. Routes `/api/*` → backend, everything else → frontend. Only this container binds to the host's port 80. |

---

## 6. Upgrading

```bash
cd ocean2joy/deploy
git pull
docker compose up -d --build
```

Containers are rebuilt with the new code, volumes are preserved so user data is
safe. No database migrations are required for routine updates.

---

## 7. Backup

**Recommended daily cron:**

```bash
0 3 * * * cd /opt/ocean2joy/deploy && \
  docker exec o2j_mongo mongodump --db=ocean2joy_v2 --archive --gzip \
    > /backup/o2j-$(date +\%F).archive.gz
```

For full disaster recovery also back up the `backend_uploads` Docker volume:

```bash
docker run --rm -v backend_uploads:/vol -v /backup:/out alpine \
  tar czf /out/o2j-uploads-$(date +%F).tar.gz -C /vol .
```

Restore:

```bash
# DB
cat o2j-YYYY-MM-DD.archive.gz | docker exec -i o2j_mongo \
  mongorestore --drop --gzip --archive --nsInclude='ocean2joy_v2.*'

# Uploads
docker run --rm -v backend_uploads:/vol -v /backup:/in alpine \
  sh -c "cd /vol && tar xzf /in/o2j-uploads-YYYY-MM-DD.tar.gz"
```

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `curl: (52) Empty reply from server` on `/api/health` | Backend still starting (WeasyPrint libs take ~30s to import) | `docker compose logs backend` and wait |
| `500` on document PDF endpoints | Missing Pango/Harfbuzz system libs | These are installed by `backend.Dockerfile`; rebuild with `--no-cache` |
| Admin login fails | DB dump wasn't restored, ADMIN_PASSWORD not set | Check `docker logs o2j_mongo`; reset password via mongosh (see below) |
| Resend emails not arriving | In Resend testing-mode you can only send to the signup email of the Resend account | Either use that email as `ADMIN_NOTIFY_EMAIL`, or verify a custom domain in Resend |
| `413 Request Entity Too Large` on file upload | Default Nginx body limit | Already lifted to 50 MB in `nginx.conf` — raise further if you need bigger videos |
| React bundle shows old `REACT_APP_BACKEND_URL` | The env var is baked at **build time** | Rebuild with `docker compose up -d --build frontend` after changing `.env` |

### Reset admin password manually

```bash
docker exec -it o2j_mongo mongosh ocean2joy_v2
> db.users.updateOne(
    { email: "admin@ocean2joy.com" },
    { $set: { password_hash: "<BCRYPT_HASH>" } }
  )
```

Generate the hash on the backend container:
```bash
docker exec -it o2j_backend python -c \
  "from utils.security import hash_password; print(hash_password('YourNewStrongPwd!'))"
```

---

## 9. Tech stack cheat-sheet (for the installing engineer)

- **Frontend:** React 18.2 + TailwindCSS + shadcn/ui, built with CRA, served as static files.
- **Backend:** Python 3.11 + FastAPI + Motor (async Mongo driver) + WeasyPrint (PDF) + Resend SDK.
- **Database:** MongoDB 7 (single instance; no replica-set required for MVP).
- **Auth:** JWT in HttpOnly cookies (server-side).
- **Email:** Transactional via Resend (https://resend.com).
- **File uploads:** Stored on disk inside the backend container under
  `/app/backend/uploads/` — persisted via the `backend_uploads` Docker volume.

All configuration lives in a single `.env` file. No other config file in the
repository needs manual editing.

---

## 10. Support

For questions about business logic / PayPal-compliance / document templates,
refer to the project owner. For installation-level issues, the usual Docker
troubleshooting commands (`docker compose logs`, `docker compose ps`,
`docker exec -it <container> sh`) are sufficient.
