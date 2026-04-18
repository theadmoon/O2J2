# Ocean2Joy v2.0 (O2J2) - Product Requirements Document

## Original Problem Statement
Build a clean, modular web platform for digital video production (Ocean2Joy).
Platform for Individual Entrepreneur Vera Iambaeva (Georgia, Tax ID: 302335809).
Features: Homepage, Auth, Project Management, 12-stage Operational Chain, 11 document types (PDF+TXT), project-isolated Chat.

## Architecture
- **Frontend**: React 18 + TailwindCSS + shadcn/ui + Framer Motion
- **Backend**: FastAPI + Motor (Async MongoDB)
- **PDF Generation**: WeasyPrint
- **Auth**: JWT (bcrypt) with httpOnly cookies
- **Database**: MongoDB (ocean2joy_v2)

## User Personas
1. **Client**: Creates video projects, tracks progress, downloads documents, chats with manager
2. **Admin**: Manages projects, advances stages, views all projects/chats

## Core Requirements (Static)
- 12-stage Operational Chain (immutable stages)
- 11 document types (immutable codes: INV, CRT, DEL, ACC, PAY, ORD, QUO, PRD, INS, DWN, RCP)
- Legal entity: Individual Entrepreneur Vera Iambaeva, Tax ID 302335809, Georgia
- Document number format: {PROJECT_SHORT}-{DOC_CODE}-{SEQ}-{YYMMDD}

## What's Been Implemented (April 18, 2026)
### Backend
- [x] FastAPI modular architecture (server.py + routes/ + services/ + utils/)
- [x] JWT auth (register, login, logout, /me) with httpOnly cookies
- [x] Project CRUD with multipart file upload
- [x] 12-stage Operational Chain with stage advancement
- [x] 11 document types - HTML, TXT, PDF generation (WeasyPrint)
- [x] Project-isolated chat (messages per project)
- [x] Admin seeding + test client
- [x] MongoDB indexes

### Frontend
- [x] Homepage: Hero section, Demo Videos, Service Tiers, Legal Footer
- [x] Auth: Login/Register with split-screen ocean background
- [x] Client Dashboard: Project cards with status badges
- [x] New Project: Form with service type select, brief, file upload
- [x] Project Details: Operational Chain timeline + Chat
- [x] Dark theme (Abyssal Navy #050A14 + Luminous Coral #FF6B6B)
- [x] Cormorant Garamond / Outfit / JetBrains Mono typography

## Testing Results
- Backend: 22/22 tests passed (100%)
- Frontend: All flows working (100%)

## Prioritized Backlog
### P0 (Critical)
- All implemented

### P1 (Important)
- Admin dashboard (separate view for managing all projects)
- Client signature upload for invoice/acceptance_act
- Demo video placeholders replaced with real videos
- PayPal transaction ID tracking

### P2 (Nice to Have)
- Email notifications on stage changes
- Real-time chat (WebSocket)
- Export package (o2j2-export.zip)
- Password reset flow
- File size limits and validation

## Next Tasks
1. Admin dashboard for managing projects
2. Upload real demo videos
3. Client-side signature/payment proof upload
4. Export zip package for local hosting

## Task #001: Design Fix (April 18, 2026)
- Changed frontend from dark cinematic theme (#050A14 + #FF6B6B) to light ocean theme (#0ea5e9 + #f59e0b)
- Files changed: index.css, Homepage.jsx, Navbar.jsx, Footer.jsx, Logo.jsx, App.css, tailwind.config.js
- Deleted: design_guidelines.json
- Backend: NOT touched (remains perfect)
- Hero: Ocean gradient + SVG waves + "Dive Into an Ocean of Video Possibilities"
- Note: Login, Register, Dashboard, ProjectDetails pages still have dark styles (separate task needed)

## Task #002: Full Light Theme Migration (April 18, 2026)
- Updated ALL remaining pages: Login, Register, ClientDashboard, NewProject, ProjectDetails
- Updated components: ChainTimeline, ChatContainer
- Updated App.js loading spinners
- Color mapping: #050A14 → bg-white/bg-gray-50, #FF6B6B → sky-500/sky-600, #0B1325 → bg-white
- Zero dark theme references remaining (verified via grep)
- Testing: 22/22 backend + all frontend flows = 100%
- Backend: NOT touched (all APIs working)

## Task #004: Visual Calibration to 99% (April 18, 2026)
- Applied 30+ visual calibrations to Homepage.jsx (388 -> 423 lines)
- All headings: text-4xl md:text-5xl (was text-3xl md:text-4xl)
- All containers: max-w-7xl (was max-w-6xl), Payments max-w-5xl, CTA max-w-4xl
- Services: aspect-video hover zoom, text-2xl prices, gradient "Learn More" buttons
- Payments: emoji icons (🏦💳), bg-sky-50 structured blocks, Intermediary Banks, QR code conditional
- Demo Videos: tags (Drama, Professional, HD Quality etc.), italic footnote
- CTA: text-xl button, "Quick request form takes less than 2 minutes"
- Backend: added bank_location, beneficiary, qr_code_url to /api/payment-settings


## Task #006: PayPal Email Correction (Feb 18, 2026)
- The REAL "серьёзная ошибка": Homepage Payments блок показывал PayPal account `ocean2joy@gmail.com` (это contact email), а правильный PayPal аккаунт бизнеса — `302335809@postbox.ge` (подтверждено в прототипе `LegalInformation.js` строка 238)
- Added `PAYPAL_EMAIL = "302335809@postbox.ge"` в `backend/utils/constants.py`
- Updated `routes/public.py` `/api/payment-settings` → `"paypal_email": PAYPAL_EMAIL`
- Verified via curl: `PayPal: 302335809@postbox.ge`

## Task #005: Deep Text Audit Homepage vs Prototype (Feb 18, 2026)
- Found and fixed "серьёзная ошибка в тексте": /api/payment-settings returned FLAT schema while Homepage prototype expected NESTED `bank_transfer` object
- Backend public.py: flat payment-settings → nested `bank_transfer.{beneficiary_bank_name, beneficiary_bank_location, beneficiary_bank_swift, beneficiary_iban, beneficiary_name, intermediary_bank_1.{name,swift}, intermediary_bank_2.{name,swift}, qr_code_url}`
- Frontend Homepage.jsx Payments block rewritten to use nested schema (prototype-identical)
- All 5 H2 headings normalized to `text-4xl md:text-5xl` (Services, Why Choose Us, Demo Videos, Payments, CTA)
- Demo Videos grid: added `max-w-5xl mx-auto` 
- Demo video tags: added `flex-wrap` for proper wrapping
- Verified via curl + screenshot: Bank of Georgia, IBAN GE29BG0000000541827200, SWIFT BAGAGE22, Citibank/JPMorgan intermediaries, PayPal ocean2joy@gmail.com — all render correctly
- P2 (renderVideoPlayer Yandex/GDrive wrapper fix) skipped per user: "мы не будем использовать ссылки, только грузить физически видео"
