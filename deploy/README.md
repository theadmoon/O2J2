# Ocean2Joy v2.0 — deployment package

Hand this folder (along with the rest of the repository) to your DevOps engineer.
Full step-by-step instructions are in **`DEPLOY.md`**.

TL;DR for a one-command install on any Linux + Docker host:

```bash
git clone <this repo> ocean2joy && cd ocean2joy/deploy
cp .env.example .env      # fill in values
docker compose up -d --build
```

Contents:

```
deploy/
├── DEPLOY.md               ← full install & troubleshooting guide
├── README.md               ← this file
├── docker-compose.yml      ← 4-service stack (mongo + backend + frontend + nginx)
├── backend.Dockerfile      ← FastAPI + WeasyPrint image
├── frontend.Dockerfile     ← React build → nginx static image
├── nginx.conf              ← reverse proxy (/api → backend, rest → frontend)
├── .env.example            ← environment variables template
├── scripts/
│   └── restore_db.sh       ← auto-restores db_dump/ on first mongo start
└── db_dump/
    └── ocean2joy_v2/       ← MongoDB seed (admin + 2 reference projects)
```
