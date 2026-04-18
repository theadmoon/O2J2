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
