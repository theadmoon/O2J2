# Ocean2Joy v2.0 (O2J2) — Product Requirements

## Original problem statement
Build a clean, modular web platform for digital video production using Marcos prototype as reference.
- Backend: FastAPI + Async MongoDB (Motor) + JWT Auth + WeasyPrint (PDF)
- Frontend: React 18.2 + TailwindCSS + shadcn/ui
- Key features: 12-stage Operational Chain, 11 document types (PDF + TXT), isolated project chat
- IMMUTABLE params: Legal entity "Individual Entrepreneur Vera Iambaeva", Tax ID 302335809
- Language: Russian UI copy for the user-facing assistant, English for all legal/PDF docs

## Implementation status (as of 21 Apr 2026)

### Completed
- Auth: JWT cookie auth, register/login/logout, role-based (admin/client)
- **Client isolation (verified)**: backend GET /api/projects filters by `user_id` for non-admin; 403 on any cross-user access
- 12-stage operational chain (client ↔ admin handshake) — all 12 stages wired
- 11 PDF + TXT document templates (Marcos-compliant): Order Confirmation, Invoice, Signed Invoice, Production Notes, Delivery Notes, Certificate of Delivery, Signed Certificate of Delivery, Acceptance Act, Signed Acceptance Act, Payment Instructions, Receipt/Payment Confirmation, Certificate of Completion
- Multipart signed-doc uploads (Invoice, Delivery Cert, Acceptance Act)
- Cloud deliverables with first-access beacon (UTC timestamp)
- Payment proof flow (Transaction ID + screenshot) on stage 10
- Admin side: payment reference panel (PayPal, SWIFT, USDT-TRC20)
- **Admin project deletion** (21 Apr): DELETE /api/projects/{id} + Trash icon on dashboard, cascades files/messages/notifications
- **Demo videos on Homepage** (21 Apr): 2 MP4s hosted on Emergent CDN, custom posters at 0:38 / 0:16, SKU-accurate copy
- **Resend transactional email** (21 Apr): admin notifications on 5 client events

### Integrations
- **Resend** (transactional email). API key in `.env`. Sender `onboarding@resend.dev`. Recipient `aaaaantipov@gmail.com` (testing-mode restriction).
  - Triggers: project_submitted, invoice_signed, delivery_confirmed, work_accepted, payment_sent
  - Fire-and-forget via `asyncio.create_task`. Non-blocking, safe to Resend downtime.
  - Implementation: `/app/backend/services/notification_service.py`
- WeasyPrint (PDF generation, all document templates)

### Database state (prod-ready snapshot)
- Collections: users (10), projects (1 — only John kept), messages, counters
- Only client John (`john@gmail.com`) has a project (VAPP-51, completed, $660)
- Admin: `admin@ocean2joy.com` / `admin123`

## Files of reference
- `/app/backend/routes/documents.py` — all 11 HTML/TXT templates (~2100 lines)
- `/app/backend/routes/project_actions.py` — stage transitions, multipart uploads, **email triggers**
- `/app/backend/routes/projects.py` — CRUD, **DELETE endpoint**, list isolation
- `/app/backend/services/notification_service.py` — Resend integration (NEW)
- `/app/backend/routes/public.py` — demo videos, services, payment settings
- `/app/frontend/src/pages/ClientDashboard.jsx` — list + **admin delete button**
- `/app/frontend/src/pages/Homepage.jsx` — lander + demo video section
- `/app/frontend/src/components/OperationalChain/*` — chain UI

## P0 — awaiting user action
- **E2E manual walkthrough** by Artem with a fresh client account (all 12 stages) before Deploy

## P1 — Before / after Deploy
- Change admin password from `admin123` to strong one in `backend/.env` before prod Deploy
- Verify Resend domain (ocean2joy.com) to unlock arbitrary recipients — needed to properly route notifications to `ocean2joy@gmail.com` (currently: `aaaaantipov@gmail.com` + Artem forwards manually or accepts as-is per decision 21 Apr)

## P2 — Backlog
- Replace demo videos with final higher-bitrate versions (currently 720p for page-load perf)
- Extract WeasyPrint templates from `documents.py` string literals into Jinja2 files
- Server-side pagination on admin dashboard (once project count grows)

## Known non-issues
- Test users `client@test.com` and `john@gmail.com` intentionally kept in DB — visible only to admin (verified by isolation rules)
- `resend.dev` sender may land in Gmail Promotions/Spam on first contact; marking as "not spam" once trains Gmail
