# Ocean2Joy v2.0 (O2J2) — Product Requirements

## Original problem statement
Build a clean, modular web platform for digital video production using Marcos prototype as reference.
- Backend: FastAPI + Async MongoDB (Motor) + JWT Auth + WeasyPrint (PDF)
- Frontend: React 18.2 + TailwindCSS + shadcn/ui
- Key features: 12-stage Operational Chain, 11 document types (PDF + TXT), isolated project chat
- IMMUTABLE: Legal entity "Individual Entrepreneur Vera Iambaeva", Tax ID 302335809, Tbilisi, Georgia
- UI copy: English for all legal/PDF docs; assistant-to-user dialogue in Russian

## DEPLOY READINESS (as of 21 Apr 2026)
MVP is production-ready. Full audit passed (37/39 backend, all critical frontend flows). Ready for first Emergent Deploy.

## Post-deploy hardening (22 Apr 2026)
- **Emergent-independent deploy**: removed all references to emergentagent.com / emergent.sh / emergentbase from production build. Self-hosted Demo1/Demo2 MP4s in frontend/public/videos/. Stripped `<script src=emergent-main.js>`, «Made with Emergent» badge, PostHog tracker, and `@emergentbase/visual-edits` devDep.
- **SEO**: Proper `<title>`, meta description, Open Graph, Twitter Card, favicon, theme-color in index.html. VideoObject JSON-LD emitted from Homepage.jsx (one entry per demo video, absolute URLs, stable uploadDate from DB created_at).
- **Resend diagnostics**: `GET /api/admin/notifications/diagnostics` (config introspection, API key masked) and `POST /api/admin/notifications/test` (send real test email, surfaces Resend error text) in admin.py.
- **Demo Videos CMS**: demo reel moved from hardcoded Python list to MongoDB `demo_videos` collection (seeded on first start). Admin UI at `/admin` → Demo Videos section. Endpoints:
  - Public: GET /api/demo-videos (DB-sourced, sorted by order), GET /api/public/demo-media/{id}/{video|poster} (FileResponse streaming for uploaded records).
  - Admin: GET/POST /api/admin/demo-videos, PUT /api/admin/demo-videos/{id}, POST /{id}/video, POST /{id}/poster, DELETE /{id}, POST /api/admin/demo-videos/reorder.
  - Storage: uploaded media at /app/backend/uploads/demo_media/{id}/{video|poster}/. Size caps: video 200 MB, poster 10 MB. Extension whitelists enforced.
- Backend fully tested (testing_agent_v3_fork iteration_4: 16/16 PASS + all frontend flows).

## Implementation status

### Completed (all production-verified)
- JWT cookie auth with role-based access (admin/client)
- **Client isolation**: GET /api/projects filters by user_id unless role=admin
- 12-stage operational chain fully wired: submit → activate → invoice → sign → production → deliver → access → confirm-delivery → accept-work → pay → confirm-payment → complete
- 11 PDF+TXT document templates (Marcos-compliant, PayPal-defensible)
- Multipart signed-doc uploads with VERSIONING: invoice, delivery cert, acceptance act, payment proof — re-uploads archive to history, audit trail preserved
- Cloud URL deliverables with first-access beacon (UTC)
- Payment proof: Transaction ID + screenshot, with TX ID correction at admin confirm stage
- Admin-side: PayPal, SWIFT, USDT-TRC20 settings; project deletion (cascades messages, notifications, files)
- Homepage: hero, services (3 cards, Learn More aligned), Why Choose Us, demo videos (2 user-supplied MP4s with custom posters at /posters/demo[1,2].png, starts from 0:00), consultation block (1 CTA → /start), payments, testimonials
- /start smart redirect: guest → /register?next=/projects/new, client → /projects/new, admin → /dashboard
- Contact page: info-only, no form
- 5 policies (terms, digital_delivery, refund, revision, privacy) fully rewritten to match 12-stage chain, all mention USDT-TRC20 crypto alongside PayPal/SWIFT, no contradictions
- Footer: correct service-id links, no dead social icons
- Welcome message: auto-inserted on project create (from "Ocean2Joy Team")
- Brief field optional; script file accepts .pdf .doc .docx .txt .rtf .odt .pages .fdx .fountain .md
- Browser autofill prevention on admin Confirm Payment dialog (honeypot inputs + unique field names + data-lpignore)
- Resend email notifications on 5 client-action events (fire-and-forget, never crashes API)

### Audit cleanup (21 Apr 2026, this session)
- Removed QuickRequest.jsx (orphan component, not in router)
- Removed POST /api/quick-request endpoint and QuickRequestInput model
- Dropped unused mongo collection `quick_requests` (had 2 legacy docs)
- Removed 68 test/seed projects + all orphan upload dirs
- Cleaned 40 unused imports via ruff + 2 unused variables in documents.py

### Integrations
- **Resend** email — API key in .env, sender onboarding@resend.dev, recipient aaaaantipov@gmail.com
- **WeasyPrint** PDF — all 11 templates
- **MongoDB** via Motor, database `ocean2joy_v2`

## Database state (deploy snapshot)
- Collections: users (7), projects (2), messages, counters
- Projects: VAPP-51 (John, completed), VAPP-53 (Bob, stage 10)
- Admin account seeded from backend/.env on startup

## Files of reference
- /app/backend/routes/projects.py — CRUD + DELETE + isolation
- /app/backend/routes/project_actions.py — 12-stage transitions + versioning
- /app/backend/routes/documents.py — 11 doc templates (~2100 lines)
- /app/backend/routes/public.py — services, demo videos, contact, policies
- /app/backend/services/notification_service.py — Resend integration
- /app/frontend/src/App.js — routes, ProtectedRoute/PublicRoute/StartRedirect
- /app/frontend/src/pages/Homepage.jsx — lander
- /app/frontend/src/pages/ProjectDetails.jsx — workspace
- /app/frontend/src/components/OperationalChain/* — chain UI

## P0 — NEXT ACTION (user)
- Click **Deploy** in Emergent UI (snapshot-based; each deploy requires re-click)
- After Deploy succeeds, fork for next iteration

## P1 — Post-deploy improvements
- Change `ADMIN_PASSWORD` in backend/.env to a strong value (currently admin123)
- Verify a domain in Resend (ocean2joy.com) to unlock arbitrary recipients — so notifications can route to ocean2joy@gmail.com instead of aaaaantipov@gmail.com
- Optional: remove POST /api/contact endpoint if the contact form won't be reinstated (currently orphan endpoint, no UI calls it)

## P2 — Backlog (post-MVP)
- Workspace redesign to match landing-page visual richness (call design_agent_full_stack)
- Privacy Policy localization to Russian
- Higher-bitrate demo videos (currently 720p for load perf)
- Extract WeasyPrint templates from documents.py string literals into Jinja2 files
- Server-side pagination on admin dashboard
- Automated payment integration (PayPal Checkout / Stripe)

## Known non-issues
- bob@gmail.com / john@gmail.com / client@test.com visible only to admin (isolation verified)
- resend.dev sender may land in Gmail Promotions/Spam on first contact
