# Ocean2Joy — Full Site Content Documentation

> **Purpose**: Single-file snapshot of every user-facing text on ocean2joy.com — titles, meta descriptions, hero copy, page bodies, service details, FAQ, policies, legal info, and footer. Generated from the live code on 23 April 2026.
>
> **Use**: share with reviewers, translators, legal counsel, or anyone who needs the complete content without crawling each page manually.
>
> **Format**: Markdown. Direct quotes are word-for-word from the production code. Dynamic elements (logos, hero images) are described in brackets.

---

## Table of Contents

1. [Global metadata (browser / SEO / AI)](#1-global-metadata-browser--seo--ai)
2. [Navigation](#2-navigation)
3. [Homepage (`/`)](#3-homepage-)
4. [Services overview (`/services`)](#4-services-overview-services)
5. [Service detail pages (`/services/:id`)](#5-service-detail-pages-servicesid)
6. [How It Works (`/how-it-works`)](#6-how-it-works-how-it-works)
7. [Contact (`/contact`)](#7-contact-contact)
8. [Legal Information (`/legal`)](#8-legal-information-legal)
9. [Policies (`/policies/:type`)](#9-policies-policiestype)
10. [Footer](#10-footer)
11. [Authentication pages](#11-authentication-pages)

---

## 1. Global metadata (browser / SEO / AI)

### Static HTML `<head>` (applies to every route)

- **Default `<title>`**: Ocean2Joy — Digital Video Production Studio
- **Default `<meta name="description">`**: Digital video production studio. Live-action with actors, cinematic VFX and AI-generated video. Pay only after you accept the final result.
- **Keywords**: video production studio, live-action video, cinematic VFX, AI video generation, AI-generated video, video editing, post-production, motion graphics, color grading, commercial video, brand video, explainer video, Ocean2Joy
- **Author**: Ocean2Joy
- **Robots** (public routes): `index, follow, max-image-preview:large, max-snippet:-1`
- **Robots** (auth/dashboard routes): `noindex, nofollow`
- **Canonical**: `https://ocean2joy.com/`
- **Favicon / Apple touch icon**: `/logo-vertical-clean.png`
- **Theme color**: `#0ea5e9` (brand sky)
- **Open Graph image (social share)**: `/logo-horizontal.png` (2752×1536)
- **Twitter card**: `summary_large_image`

### Organization schema (Knowledge Graph)

- Name: **Ocean2Joy**  
- Alternate name: Ocean2joy Video Production Studio  
- Slogan: "Dive into an ocean of video possibilities"  
- Address: Tbilisi, Georgia (GE)  
- Tax ID: 302335809  
- Logo: `/logo-vertical.png`  
- Area served: Worldwide  
- Price range: `$$`  
- Founder: Vera Iambaeva  
- Service types: Live-action video production, Cinematic VFX, AI-generated video, Video editing and post-production, Motion graphics, Color grading

### Per-page titles

| Route | `<title>` |
|---|---|
| `/` | Ocean2Joy — Digital Video Production Studio |
| `/services` | Video Production Services \| Ocean2Joy |
| `/services/custom-video` | Custom Video Production with Actors \| Ocean2Joy |
| `/services/video-editing` | Professional Video Editing & Special Effects \| Ocean2Joy |
| `/services/ai-video` | AI-Generated Video Content \| Ocean2Joy |
| `/how-it-works` | How It Works — 12-Stage Video Production Workflow \| Ocean2Joy |
| `/contact` | Contact Ocean2Joy — Video Production Studio |
| `/legal` | Legal Information \| Ocean2Joy |
| `/policies/terms` | Terms of Service \| Ocean2Joy |
| `/policies/digital_delivery` | Digital Delivery Policy \| Ocean2Joy |
| `/policies/refund` | Refund & Cancellation Policy \| Ocean2Joy |
| `/policies/revision` | Revision Policy \| Ocean2Joy |
| `/policies/privacy` | Privacy Policy \| Ocean2Joy |


---

## 2. Navigation

**Navbar links (left to right):**
- Ocean2Joy (logo, links to `/`)
- Services
- How It Works
- Contact
- Login (if signed out) / Dashboard (if signed in)
- Start Project (primary CTA button)


---

## 3. Homepage (`/`)

### Hero section

**H1**: Dive Into an Ocean of Video Possibilities  
**Subtitle**: Live-action with actors, cinematic VFX and AI-generated video — all delivered digitally. Pay only after you accept the final result.

**Primary CTA**: Start Your Project →  
**Secondary CTA**: View Our Services

### "HAVE QUESTIONS FIRST?" block

**H2**: Not sure yet? **Chat with us** — get a quick answer.

> You do not need a finished script or a completed brief to begin. **Start a project with a short request**, and the project chat inside the portal will open immediately. You can ask preliminary questions there before moving deeper into the workflow.

**Bullets:**
- A short idea is enough to open the workspace.
- Scripts, references, mood boards, and supporting files can be uploaded later inside the portal.
- The portal chat is the primary channel for preliminary questions, project communication, and document workflow.
- No payment is required to open the workspace and ask preliminary questions.

**CTA**: Chat with us — get a quick answer

**Preview caption (under mock chat bubble)**: *Example preview — the actual project chat opens after you create a project in the portal.*

### Our Services preview

**H2**: Our Services  
**Subtitle**: Professional video production for every need

(Renders the 3 service cards — see §4 for full details.)

### Demo Videos (reel)

**H2**: See Our Work  
**Subtitle**: Real examples of our video production expertise

(Renders up to N demo videos from the `demo_videos` collection — see §3.1 for the seeded defaults.)

#### 3.1. Seeded demo videos

1. **Cinematic Live-Action × VFX** — *A live-action shoot with professional performers fused with cinema-grade visual effects. This is the standard we hold every frame to — the feel of a streaming-series production, delivered at digital-studio speed. Scripting, directing, on-set crew, post, VFX and color are all handled end-to-end by our team.*  
   Tags: `Live Actors`, `Cinematic VFX`, `End-to-End Production`

2. **AI-Generated Video** — *Worlds, characters and motion that would be impossible — or prohibitively expensive — to shoot on a real set. Our AI creative pipeline turns a brief into a fully animated sequence with style, pacing and mood controlled by a human director. Unlimited imagination, cinema-level discipline.*  
   Tags: `AI-Generated`, `Unlimited Imagination`, `Director-Guided`

### Payments section

**H2**: Payments — Currently Semi-Manual  
**Subtitle**: Payment systems are currently not integrated into the portal. Payments are processed in semi-manual mode. Payment details are made available inside the project portal as part of the formal project workflow.

**PayPal card**:
- Title: PayPal
- Description: Fast and simple. Payment is confirmed in the portal after manual verification by our team.

**SWIFT card**:
- Title: International SWIFT Transfer
- Description: Reliable bank-to-bank transfer. Verification time depends on the correspondent chain.

**USDT-TRC20 card**:
- Title: USDT on TRON (TRC-20)
- Description: On-chain transfer; the transaction hash is used as proof. Verified after the confirmations appear on the TRON network.

### "How Payment Works" block

**H3**: How Payment Works

> After your order is activated, payment details are made available inside your project portal. The project then proceeds through invoice signature, production, electronic delivery, and client acceptance inside the portal workflow. Once the client accepts the completed work, the client transfers payment using the selected payment channel and reports the payment inside the portal by providing the transaction reference. Our team then verifies the payment and records the confirmation in the system. Project documents are issued throughout the project lifecycle and remain available inside the portal.

### Final CTA

**H2**: Ready to Get Started?  
**Subtitle**: Submit your project request in under 2 minutes  
**CTA**: Start Your Project Now →


---

## 4. Services overview (`/services`)

### Hero

**H1**: Our Services  
**Subtitle**: Professional video production services delivered digitally through our secure client portal

### Intro block

> Every project is handled through the secure client portal. Project communication, document exchange, delivery records, and final file access are managed inside the portal. No physical shipment is involved.

### Service cards list


#### 4.1. Custom Video Production with Actors

- **URL**: `/services/custom-video`
- **Description**: Professional video production with real actors, custom scripts, and high-quality filming. Perfect for commercials, short films, educational content, and brand stories.
- **Pricing**: $25-35 per minute, calculated based on duration and complexity
- **Turnaround**: 2-4 weeks depending on complexity
- **Revisions**: 2-3 rounds included
- **Features**:
  - Professional actors and crew
  - Custom scriptwriting
  - 4K filming
  - Color grading
  - Sound design
  - Multiple revision rounds
- **Deliverable type**: Digital video files
- **Formats**: MP4, MOV, AVI
- **Genres**: Commercial, Educational, Brand Story, Short Film, Corporate

#### 4.2. Professional Video Editing & Special Effects

- **URL**: `/services/video-editing`
- **Description**: Expert video editing and post-production services for your existing footage. From basic cuts to advanced special effects and motion graphics.
- **Pricing**: Starting at $10.99 per element, full project pricing calculated based on complexity
- **Turnaround**: 1-2 weeks
- **Revisions**: 2 rounds included
- **Features**:
  - Professional editing
  - Color correction
  - Motion graphics
  - Sound mixing
  - Transitions & effects
  - Format conversion
- **Deliverable type**: Edited video files
- **Formats**: MP4, MOV, ProRes

#### 4.3. AI-Generated Video Content

- **URL**: `/services/ai-video`
- **Description**: Cutting-edge AI-powered video creation with digital characters and environments. Perfect for creative projects, explainer videos, and unique visual content.
- **Pricing**: Custom pricing based on video length, complexity, and AI features used
- **Turnaround**: 1-3 weeks
- **Revisions**: 3 rounds included
- **Features**:
  - AI character generation
  - Digital environments
  - Voice synthesis
  - Automated editing
  - Style transfer
  - Custom animations
- **Deliverable type**: AI-generated video files
- **Formats**: MP4, MOV, WebM
- **Genres**: Explainer, Creative, Marketing, Social Media


---

## 5. Service detail pages (`/services/:id`)

Each service detail page shows:
1. Hero image + title + description (from §4)
2. **What's Included** (features list)
3. **Deliverable format** (output formats)
4. **Pricing** (price_description)
5. **Turnaround time** (turnaround_time)
6. **Revision policy** (revision_policy)
7. **"How It Works"** 5-step list (same on all 3 service pages):

### "How It Works" 5-step list (identical on all service detail pages)

1. **Submit in the Portal** — Create a project inside the portal — a short idea is enough; scripts, references, and files can be uploaded later.
2. **Order Activation and Invoice** — Our team activates the order and issues the invoice inside the portal once scope, deliverables, and timeline are agreed.
3. **Invoice Signature and Production** — The client signs the invoice inside the portal to lock the scope. Production then starts — no payment is required at this stage.
4. **Delivery, File Access, Client Acceptance** — Our team issues a Delivery Certificate, provides file access inside the portal, processes included revisions if requested, and the client signs the Acceptance Act inside the portal.
5. **Payment Reporting, Confirmation, Completion** — After acceptance, the client transfers payment, reports it inside the portal with the transaction reference; our team confirms it and the Certificate of Completion is issued.

**Footer disclaimer on each service detail page:**
> All project documents, communication, and deliverables are handled inside the secure client portal. Email is used only as an emergency fallback when portal communication is temporarily unavailable. Payment is processed under the Pay-After-Acceptance model.


---

## 6. How It Works (`/how-it-works`)

### Hero

**H1**: How Ocean2joy Works  
**Subtitle**: From your first idea to final electronic delivery — a smooth, transparent process designed for your success

### 6-step visual process (each step shown as a numbered card with icon)

#### Step 1 — Submit Your Project in the Portal
Create a project inside the secure client portal. A short idea or a single-sentence description is enough to open the workspace — **no complete brief or finished script is required**.
- Describe the idea briefly — the project chat opens immediately.
- Scripts, references, mood boards, or footage can be uploaded later, any time before the invoice is signed.
- No payment is required to open the workspace and start the conversation.

#### Step 2 — Order Activation and Invoice Issuance
Once enough information is collected inside the portal chat, the order is **activated**. Our team then issues the project invoice, which is stored inside the portal and accessible at any time.
- The invoice contains scope, timeline, deliverables, and payment details.
- All project documents are issued and stored inside the portal — no email delivery.
- Issuing the invoice does not yet require payment — it locks the scope for signature.

#### Step 3 — Invoice Signature and Production Start
The client **signs the invoice inside the portal**, confirming acceptance of the scope. Once the invoice is signed, the project enters production.
- Signature is performed directly in the portal — no external signing tools.
- Signing the invoice locks the scope but does not require payment at this stage.
- Payment is processed only after the client accepts the completed work — the Pay-After-Acceptance model.

#### Step 4 — In-House Production and Portal Communication
Our team works on the project internally. All communication about the project — status updates, drafts, feedback — happens **inside the portal chat**. Email is not used as a standard channel.
- Project status is tracked directly in the portal.
- Direct messaging with the production team via portal chat.
- Email is used only as an emergency fallback if portal communication is temporarily unavailable.

#### Step 5 — Electronic Delivery, File Access & Client Acceptance
Once the work is complete, our team issues a **Delivery Certificate** in the portal and provides secure access to the final files. The client reviews the work, requests any included revisions, and then signs the **Acceptance Act** inside the portal.
- All deliverables are accessible through the secure portal — no external sharing services.
- Included revision rounds are requested and processed inside the portal.
- Signing the Acceptance Act is the final confirmation before the payment stage.

#### Step 6 — Payment Reporting, Confirmation, and Completion
After the client signs the Acceptance Act, payment becomes due. The client transfers payment through the selected channel (PayPal, SWIFT bank transfer, or USDT on the TRON network) and then **reports the payment inside the portal** by providing the transaction reference. Our team verifies the payment and records the confirmation — a **Certificate of Completion** is then issued to close the project.
- **Payment Reported**: the client submits the transaction reference inside the portal.
- **Payment Confirmed**: our team verifies the transfer and records the confirmation in the portal.
- The Certificate of Completion and all project documents remain available inside the portal.

### "100% Digital Service Model" block

> Every project is custom-made by our in-house team and delivered electronically through our secure portal. No physical media. No shipping logistics. Just fast, professional digital delivery.

- CTA: **Learn About Digital Delivery** → `/policies/digital_delivery`
- CTA: **Read Terms of Service** → `/policies/terms`

### Frequently Asked Questions (7 Q&A)

**Q1: When do I pay for the project?**  
A: Ocean2Joy follows a pay-after-acceptance model. You sign the invoice upfront to lock the scope, but the actual payment is due only after you have reviewed the final delivery, confirmed it meets the brief, and signed the Acceptance Act. If you are not satisfied, you are not charged.

**Q2: How long does a typical video project take?**  
A: Turnaround depends on the service and complexity. Custom live-action videos typically take 2–4 weeks end-to-end (script → shoot → post). Video editing of existing footage usually ships in 5–10 business days. AI-generated videos are the fastest — often delivered in 3–7 days.

**Q3: How many revision rounds are included?**  
A: Every project includes 2–3 rounds of revisions at no extra cost, scoped to the agreed brief. Substantial re-directions that fall outside the original scope are quoted separately. See the Revision Policy for details.

**Q4: What video formats do you deliver?**  
A: We deliver master files in MP4 and MOV as standard. On request we can also provide AVI or a bespoke codec/resolution for broadcast or streaming platforms. All deliverables are uploaded to a secure client portal — no physical media, no shipping.

**Q5: Do you handle the script, storyboard and casting?**  
A: Yes. We offer end-to-end production: scriptwriting, storyboarding, casting professional actors, directing on-set, full post-production (editing, VFX, color grading, sound design). You can also come with your own script — we adapt the workflow to your starting point.

**Q6: What payment methods do you accept?**  
A: PayPal, international SWIFT bank transfer, and USDT on the TRON network (TRC-20). All payment details are printed on the invoice issued at stage 3 of the workflow.

**Q7: Do you work with clients internationally?**  
A: Yes — Ocean2Joy operates 100% digitally, and our service is available worldwide. Communication, briefs, revisions and final delivery all happen through the client portal. The legal entity is registered in Tbilisi, Georgia.

### Final CTA

**H3**: Ready to Get Started?  
**Subtitle**: Submit your project request in under 2 minutes  
**CTA**: Start Your Project Now →


---

## 7. Contact (`/contact`)

### Hero

**H1**: Contact Us  
**Subtitle**: Have questions about our video production services? Start a project in the portal to open the formal project workspace. Use email only if portal communication is temporarily unavailable.

### Contact cards (4)

#### 📧 Email
- ocean2joy@gmail.com
- **Emergency fallback contact only**

#### 📞 Phone
- +995 555 375 032
- Business hours: Mon–Fri, 9 AM – 6 PM GET

#### 📍 Digital Service
- We operate 100% digitally
- Electronic delivery worldwide

#### 💬 Portal Communication
- All project communication, document exchange, delivery tracking, and status updates are handled inside the secure client portal.

### Support note (small print)

> \* Email is used only in exceptional situations when portal communication is temporarily unavailable or when a technical issue prevents normal portal interaction.


---

## 8. Legal Information (`/legal`)

### Legal entity

- **Name**: Individual Entrepreneur Vera Iambaeva
- **Tax ID**: 302335809
- **Country of registration**: Georgia
- **Address**: Tbilisi, Georgia

### Payment channels

**PayPal:**
- Email: `302335809@postbox.ge`

**SWIFT bank transfer:**
- Beneficiary: Individual Entrepreneur Vera Iambaeva
- Beneficiary's bank: Bank of Georgia (Tbilisi, Georgia)
- SWIFT: BAGAGE22
- IBAN: GE29BG0000000541827200
- Intermediary 1: Citibank N.A., New York (SWIFT: CITIUS33)
- Intermediary 2: JPMorgan Chase Bank National Association, New York (SWIFT: CHASUS33)

**USDT on TRON (TRC-20):**
- Network: TRON (TRC-20)
- Asset: USDT
- Wallet address: `TH8qaDB7a2yYXHBBk6Df62vD2g6VKd2sXJ`

### Policies links

- [Terms of Service](/policies/terms)
- [Digital Delivery Policy](/policies/digital_delivery)
- [Refund & Cancellation Policy](/policies/refund)
- [Revision Policy](/policies/revision)
- [Privacy Policy](/policies/privacy)


---

## 9. Policies (`/policies/:type`)

### 9.1. Terms of Service

- **URL**: `/policies/terms`
- **Substantive version in force from**: 2025-10-21
- **Content version last refreshed**: 2026-04-21

---

## 1. General
These Terms govern the use of services provided by **Individual Entrepreneur Vera Iambaeva** (Tax ID: **302335809**, Tbilisi, Georgia), operating under the brand name **Ocean2Joy Digital Video Production** ("we", "us", "the Company").

By creating an account and submitting a project, you agree to these Terms.

## 2. Services
We design and produce custom digital video content (live-action, post-production & VFX, AI-assisted creation). All services are delivered **electronically only** — no physical media is shipped.

## 3. The 12-Stage Operational Chain
Every order follows a fixed 12-stage workflow inside the client portal. Each stage is time-stamped in UTC and produces auditable PDF + TXT records. **All stage timestamps are UTC-based and reflect the moment the corresponding event was recorded inside the portal** — they are portal-side events, not external system events.

1. **Project submitted** by the client inside the portal.
2. **Quote activated** by our team inside the portal.
3. **Invoice issued** by our team inside the portal.
4. **Invoice signed** by the client inside the portal — this is the moment the client contractually commits to the order. Signing the invoice does not require payment.
5. **Production started** by our team.
6. **Deliverables released** — our team posts the Delivery Certificate inside the portal and provides access to the final files.
7. **Deliverables accessed** — client access events are recorded inside the portal.
8. **Certificate of Delivery** signed by the client inside the portal.
9. **Acceptance Act** signed by the client inside the portal — the moment the client confirms the work meets the brief.
10. **Payment Reported** — the client reports the payment inside the portal by providing the transaction reference. The UTC timestamp for this stage reflects the moment the payment notice was submitted in the portal, not the internal settlement time of any external payment system.
11. **Payment Confirmed** — our team verifies the payment and records the confirmation in the portal. The UTC timestamp reflects the moment the confirmation was recorded in the portal.
12. **Project completed** — the Certificate of Completion is issued inside the portal.

## 4. Payment Model — Pay-After-Acceptance
Unlike conventional prepayment models, **actual payment is transferred only after** the client has inspected the deliverables and signed the Acceptance Act (Stage 9). The Invoice signature at Stage 4 is a contractual commitment, not a payment.

Payment is currently processed **manually** via one of three channels: **PayPal**, **SWIFT bank transfer**, or **USDT-TRC20** cryptocurrency. Full payment details for the channel you choose are provided inside the client portal after the quote is activated. Automated payment integration is planned for a future release; we will update these Terms accordingly.

## 5. Revisions
Revisions are handled inside the project chat before the Certificate of Delivery is signed (Stage 8). When changes are requested, we upload a new deliverable URL — previous versions remain visible in the deliverables history. See our **Revision Policy** for scope and limits.

## 6. Cancellation & Refunds
Refund entitlement depends on the stage reached at the time of cancellation. Full rules are described in our **Refund & Cancellation Policy**.

## 7. Intellectual Property
Upon full payment (recorded at Stage 11 — Payment Confirmed), the client receives full commercial usage rights to the final delivered content. Until full payment is confirmed in the portal, the deliverables remain the property of the Company and may not be used commercially.

Source files, project files, and working assets are not included by default; they may be delivered under a separate agreement.

## 8. Content Responsibility
The client is solely responsible for the legality of any content, brand, trademark, face, voice or other material provided to us. We may refuse or terminate a project that would require us to produce content that is illegal, infringing, or contrary to platform or payment-provider policies.

## 9. Communication — Portal-First
All project communication takes place **inside the secure client portal**:
- **Chat** for preliminary questions, project discussion, revisions, and coordination.
- **Timeline** for stage status, with UTC timestamps reflecting portal-side events.
- **Documents** (invoices, certificates, acts, receipts) stored inside the portal and downloadable as PDF/TXT.

We do **not** send marketing or notification emails. Email (ocean2joy@gmail.com) is used **only as an emergency fallback** when portal communication is temporarily unavailable or a technical issue prevents normal portal interaction. See our Privacy Policy for details.

## 10. Limitation of Liability
To the maximum extent permitted by law, our aggregate liability for any claim arising out of the services is limited to the fees actually paid for the specific project giving rise to the claim. We are not liable for consequential, indirect or lost-profit damages.

## 11. Jurisdiction & Governing Law
These Terms are governed by the laws of **Georgia**. Disputes will be heard before the competent courts of Tbilisi, Georgia, unless mandatory consumer-protection rules of the client's country require otherwise.

## 12. Changes to Terms
We may update these Terms. The "Substantive version in force from" date above reflects the date from which the current substantive version has been in force. Material changes are announced inside the client portal. Email is not used for Terms-change notifications.

## 13. Contact
**ocean2joy@gmail.com** — Individual Entrepreneur Vera Iambaeva, Tax ID 302335809, Tbilisi, Georgia.


---

### 9.2. Digital Delivery Policy

- **URL**: `/policies/digital_delivery`
- **Substantive version in force from**: 2025-10-21
- **Content version last refreshed**: 2026-04-21

---

## 1. Electronic Delivery Only
All Ocean2Joy services are delivered **exclusively in electronic form**. No physical media (DVD, USB, hard drive) is ever shipped.

## 2. How Delivery Works
1. Once production is complete, our team issues a **Delivery Certificate** inside the client portal and provides access to the final files. The access path is described inside the portal and may use our own storage or a third-party storage platform, depending on file size and security requirements. No specific third-party storage platform is guaranteed by default — the delivery mechanism is documented inside each project.
2. File access information is communicated **inside the portal only** — never by email.
3. When the client first opens the files, the portal records the exact access time in UTC as a portal-side event. This timestamp appears on the **Certificate of Delivery** for transparency and audit purposes.
4. The client reviews the deliverables, requests any revisions inside the portal chat (see Revision Policy), and once satisfied, signs the **Certificate of Delivery** inside the portal (Stage 8).

## 3. File Formats
Standard output formats: **MP4 (H.264)**, **MOV (ProRes, on request)**, **WebM**. Custom formats and resolutions are available — please specify in the brief or in chat.

Typical maximum resolution: **4K / UHD** for live-action productions, **1080p/4K** for AI-generated content.

## 4. File Retention
- File access from within the portal remains available for **at least 90 days** after delivery.
- After 90 days, continued availability is not guaranteed. The client is responsible for downloading and archiving deliverables locally before that window closes.
- Extended retention is available on request and may be subject to a storage fee.

## 5. Revisions as Updated Deliverables
If revisions are requested before the Certificate of Delivery is signed, a new file-access entry is provided inside the portal under the same project. Earlier versions remain visible in the deliverables history, but the latest version is treated as the canonical delivery.

## 6. Acceptance & Certificate of Delivery
The Certificate of Delivery is the document that closes out the "delivery" step of our 12-stage chain. It:
- Lists every file-access entry provided inside the portal,
- Includes the exact UTC time each file was first accessed by the client (portal-side event),
- Is signed by the client inside the portal.

We **do not** proceed to the Acceptance Act (Stage 9) until the Certificate of Delivery is signed inside the portal.

## 7. No Email Attachments
We do **not** send deliverables by email. All deliverables are accessed inside the client portal. This is a deliberate security and audit-trail measure.

## 8. Failure to Deliver
If a deliverable URL is unavailable or corrupted, please report it in the project chat immediately. Time spent replacing a broken URL is not counted against the delivery deadline.

## 9. Contact
**ocean2joy@gmail.com** — for any delivery-related question or escalation.


---

### 9.3. Refund & Cancellation Policy

- **URL**: `/policies/refund`
- **Substantive version in force from**: 2025-10-21
- **Content version last refreshed**: 2026-04-21

---

## 1. Overview
Because our payment model is **pay-after-acceptance** (actual funds are transferred only after the client has inspected and accepted the work at Stage 9, and are reported at Stage 10 — Payment Reported, then confirmed at Stage 11 — Payment Confirmed), most cancellations do not involve a refund at all — they are simply the termination of an unpaid order.

This policy describes what happens when a project is cancelled at each stage.

## 2. Cancellation Before Payment (Stages 1 – 9)
You may cancel your order at any time **before** the payment is reported at Stage 10, by posting a cancellation request in the project chat inside the portal. The amount due depends on the stage:

| Stage at cancellation | Amount due |
|---|---|
| 1 — Project submitted | **0 — no charge** |
| 2 — Quote activated | **0 — no charge** |
| 3 — Invoice issued (not yet signed) | **0 — no charge** |
| 4 — Invoice signed, production not yet started | **0 — no charge** (you may withdraw your commitment at this point without penalty) |
| 5 — Production started | **Partial fee** reflecting work actually completed, at our reasonable estimation. We will issue a pro-rata invoice with justification. |
| 6 — Delivered | **Full fee**, because the final product already exists. You may still refuse the delivery (see §3). |
| 7 — Files accessed | **Full fee** — see §3. |
| 8 — Certificate of Delivery signed | **Full fee**, cancellation no longer possible — your signature on the Certificate of Delivery is your confirmation that the deliverables were received. |
| 9 — Acceptance Act signed | **Full fee**, you have already accepted the work. |

## 3. Rejecting a Delivery at Stage 6 / 7
If the delivered content materially deviates from the agreed brief (e.g. wrong format, missing scenes, fundamentally different creative direction), you may refuse to sign the Certificate of Delivery. In that case:
- We work with you in chat and deliverables history to fix the issue, at no extra cost, within the revision scope of your package.
- If we cannot agree on a path to acceptance, the project is terminated. A refund is due only if payment has already been made (rare under our pay-after-acceptance model).

## 4. Refunds After Payment (Post-Stage 11 — Payment Confirmed)
Once the payment has been reported by the client at Stage 10 and confirmed by our team at Stage 11, a refund is possible only in the following limited cases:
- **Overpayment** or **duplicate transfer** — refunded to the original PayPal account, SWIFT bank account, or TRC20 crypto wallet (depending on the channel used for the original payment) within 10 business days. Crypto refunds are made in the same asset (USDT-TRC20) to the sending wallet.
- **Proven material breach** by us of the signed Acceptance Act (e.g. our final deliverable differs from the Acceptance Act description) — refunded in whole or in part at our discretion.

No refund is due after Stage 12 (Project completed and Certificate of Completion issued), save for statutory rights the client has under their local consumer-protection law.

## 5. How to Request a Refund or Cancellation
Post the request inside the project chat in the portal, including:
1. A clear statement that this is a cancellation or refund request.
2. The reason.
3. If a refund is owed, the destination account (PayPal email, SWIFT/IBAN, or TRC20 wallet address).

We respond within **5 business days**. Refunds are processed within **10 business days** of approval.

## 6. Non-Refundable Items
- Rush / expedited delivery fees are **non-refundable** once production has started.
- Work performed on client-supplied assets that are later found to be infringing or illegal is **non-refundable**.

## 7. Disputes
If you disagree with a refund decision, escalate inside the project chat first. Email (**ocean2joy@gmail.com**) is used only as an emergency fallback if portal communication is temporarily unavailable. For consumers in the EU, you retain your statutory rights under applicable consumer-protection law.


---

### 9.4. Revision Policy

- **URL**: `/policies/revision`
- **Substantive version in force from**: 2025-10-21
- **Content version last refreshed**: 2026-04-21

---

## 1. Where Revisions Happen
Revisions are an integral part of our 12-stage operational chain. They take place **inside the project chat and the deliverables list in the portal**, between:

- **Stage 5 (Production started)** — the client can refine the brief and react to work-in-progress previews the team shares, and
- **Stage 8 (Certificate of Delivery signed)** — once the Certificate is signed, the project is locked for revisions.

There is **no separate "revision stage"** in the operational chain — revisions are embedded in the normal production-to-delivery flow.

## 2. Included Revision Rounds
Each service package has a number of **included revision rounds**. See the service page for your package:
- **Custom Video Production:** 2–3 rounds.
- **Video Editing:** 2 rounds.
- **AI-Generated Video:** 3 rounds.

A **round** is one consolidated request from the client bundling all feedback on the current version, to which we respond with a new deliverable URL.

## 3. How a Revision Works
1. The client reviews the current deliverable inside the portal.
2. The client posts the revision request inside the portal chat, clearly describing all changes in one message (to count as a single round).
3. Our team implements the changes and provides a **new file-access entry** under the same project inside the portal. Previous versions remain visible in the deliverables history for audit purposes.
4. The access-time record is created for the new version, and the Certificate of Delivery (when finally signed) lists every file that was provided inside the portal.

## 4. Turnaround Time per Round
Typical turnaround: **3 – 5 business days** per round. Complex shoots or full AI re-generations may take longer; an ETA is always provided in chat.

## 5. Out-of-Scope Changes
The following are **not** considered revisions and require a new quote:
- Changing the fundamental creative direction, genre, or tone after production has started.
- Adding new scenes, actors, locations, or AI sequences not in the accepted brief.
- Changing output format, resolution, or aspect ratio after delivery at Stage 6.
- Any edit requested after the Certificate of Delivery (Stage 8) has been signed.

## 6. Additional Revision Rounds
Beyond the included rounds, additional revisions are available at our standard hourly rate, quoted per request. We will always confirm the extra cost in chat before performing the work.

## 7. Closing Revisions
By signing the Certificate of Delivery at Stage 8, you confirm that the last-delivered URL is the final version. No further revisions are possible after that signature, except at additional cost via a new separate quote.

## 8. Contact
For anything revision-related, use the project chat inside the portal. Email (**ocean2joy@gmail.com**) is used only as an emergency fallback when portal communication is temporarily unavailable.


---

### 9.5. Privacy Policy

- **URL**: `/policies/privacy`
- **Substantive version in force from**: 2025-10-21
- **Content version last refreshed**: 2026-02-18

---

This Privacy Policy explains how **Individual Entrepreneur Vera Iambaeva** (Tax ID: 302335809, Tbilisi, Georgia), operating the Ocean2Joy Digital Video Production brand ("we", "us", "the Controller"), collects and processes personal data in accordance with the **EU General Data Protection Regulation (GDPR)** and the **Law of Georgia on Personal Data Protection**.

## 1. Data Controller
- **Name:** Individual Entrepreneur Vera Iambaeva
- **Tax ID:** 302335809
- **Address:** Tbilisi, Georgia
- **Contact for privacy matters:** ocean2joy@gmail.com

## 2. What Data We Collect
- **Account data:** full name, email address, hashed password.
- **Optional PayPal account** (separate email, if different from account email) — used only to reconcile incoming PayPal payments.
- **Project data:** brief, uploaded scripts/reference files, deliverable downloads.
- **Payment data:** PayPal transaction ID (only if you voluntarily provide it), SWIFT transfer references, USDT-TRC20 transaction hashes. Cryptocurrency transactions are recorded on a public blockchain (TRON) — we have no control over that public record and do not collect or store your wallet seed, keys or balance.
- **Technical data:** IP address and session cookies strictly necessary for authentication.

We do **not** collect payment card details — all payments are handled by external channels (PayPal, your bank, or the TRON blockchain).

## 3. Why and On What Legal Basis
| Purpose | Legal basis (GDPR Art. 6) |
|---|---|
| Create and manage your account, deliver services you ordered | 6(1)(b) — Performance of a contract |
| Issue invoices, receipts, and legally required business records | 6(1)(c) — Legal obligation (Georgian tax law) |
| Authentication cookies, fraud prevention, platform security | 6(1)(f) — Legitimate interest |
| Reconcile incoming PayPal payments against the PayPal email you provided | 6(1)(b) — Performance of a contract |

We do **not** process your data for marketing, analytics, profiling, or newsletters. We do not collect consent (Art. 6(1)(a)) because we do not perform any processing that would require it.

## 4. How Long We Keep Your Data
- **Active accounts:** for as long as your account is active.
- **Closed accounts:** deleted within 30 days of your deletion request, **except** records we are legally required to keep (invoices, tax records) for **6 years** under Georgian tax law.
- **Project files & deliverables:** retained in your portal for 90 days after delivery unless you request earlier removal.

## 5. Who Has Access
Your data is accessed only by the Controller and authorised project managers. We do **not** sell, rent, or share your personal data with third parties for marketing. Limited processors may be used strictly to run the service (hosting, email delivery) under contractual confidentiality.

## 6. International Transfers
The Controller is based in Georgia, which has been recognised by the European Commission as providing an adequate level of data protection for transfers from the EU/EEA. No further safeguards are required.

## 7. Your Rights Under GDPR
You have the right to:
- **Access** the data we hold about you (Art. 15).
- **Rectify** inaccurate or incomplete data (Art. 16).
- **Erase** your data — "right to be forgotten" (Art. 17), subject to legal retention obligations.
- **Restrict** or **object** to processing (Art. 18 & 21).
- **Data portability** — receive your data in a machine-readable format (Art. 20).
- **Withdraw consent** at any time for processing based on consent (Art. 7(3)).
- **Lodge a complaint** with your local EU Data Protection Authority or the **Georgian Personal Data Protection Service** (personaldata.ge).

To exercise any right, email **ocean2joy@gmail.com**. We respond within 30 days.

## 8. Cookies
We use only **strictly necessary cookies** (httpOnly `access_token` and `refresh_token`) for authentication. No analytics, advertising, or third-party tracking cookies are set. No cookie consent banner is legally required for strictly necessary cookies under GDPR Recital 30 and ePrivacy Directive Art. 5(3).

## 9. How We Communicate With You (Portal-First)
All project communication takes place **inside your client portal**:
- **Messages** go through the project chat — to reach us, post a message in your project; we reply inside the portal.
- **Documents** (invoices, acceptance acts, receipts, certificates) are issued and stored inside the portal and downloadable as PDF/TXT at any time — we do not send project documents by email.
- **Status updates** on the 12-stage operational chain are visible inside the project page — no email notifications are sent.

We do **not** send marketing, newsletter, or notification emails. We do **not** send a "welcome" email on registration. Email (ocean2joy@gmail.com) is used **only as an emergency fallback** — for example, if portal communication is temporarily unavailable for a time-critical matter, or to fulfil a legal data-subject request. Because we do not push notifications, please sign in regularly to check your project status and messages.

## 10. Payments (Currently Semi-Manual)
At this time, **payment systems are not integrated into the portal**. Payments are processed in semi-manual mode, under the Pay-After-Acceptance model:
- Payment details (PayPal account, SWIFT/IBAN, or USDT-TRC20 wallet address) are made available inside the portal as part of the formal project workflow.
- After the client signs the Acceptance Act (Stage 9), the client transfers funds via the selected channel.
- The client **reports the payment inside the portal** (Stage 10 — Payment Reported) by providing the transaction reference (e.g. PayPal transaction ID, SWIFT reference, or TRC20 transaction hash). The UTC timestamp for Stage 10 reflects the moment the payment notice was submitted inside the portal.
- Our team verifies the transfer and records the confirmation inside the portal (Stage 11 — Payment Confirmed). The UTC timestamp for Stage 11 reflects the moment the confirmation was recorded inside the portal.

We plan to integrate automated payment providers in a future release. When that happens, this Policy will be updated to disclose the processors, data transfer destinations, and legal bases involved.

If you register a **PayPal Account** during sign-up (optional, see §2), we use it solely to reconcile incoming PayPal payments with your account. It is not used for marketing, not shared with third parties, and can be removed at any time by contacting us.

## 11. Security
Passwords are hashed with bcrypt. All traffic is served over HTTPS. Access tokens are stored in httpOnly, SameSite=Lax cookies to mitigate XSS and CSRF risks.

## 12. Children
Our services are not directed to individuals under 16. We do not knowingly collect personal data from minors.

## 13. Changes to This Policy
We may update this Policy. The "Substantive version in force from" date above reflects the date from which the current substantive version has been in force. Material changes will be notified through a prominent notice inside the client portal; email is not used for Policy-change notifications.

## 14. Contact
For any privacy-related question or to exercise your rights: **ocean2joy@gmail.com**.


---


---

## 10. Footer

- **Brand**: Ocean2Joy
- **Tagline**: Professional digital video production
- **Nav links**: Home, Services, How It Works, Contact
- **Legal links**: Terms of Service, Privacy Policy, Refund Policy, Digital Delivery, Revision Policy
- **Contact line**: `ocean2joy@gmail.com` · `+995 555 375 032`
- **Portal-first disclaimer**: Primary project communication takes place inside the secure client portal. Email is used only as an emergency fallback channel.
- **Service model note**: Digital video production services are delivered electronically. No physical products are shipped.
- **Copyright**: © 2026 Ocean2Joy. All rights reserved.


---

## 11. Authentication pages

These pages are marked `noindex, nofollow` — they are not discoverable through search engines.

### `/login`
- Title: `Sign in | Ocean2Joy`
- Description: `Sign in to your Ocean2Joy client account.`
- Form fields: Email, Password, [Sign In] button
- Secondary links: "Forgot your password?", "Don't have an account? Create one"

### `/register`
- Title: `Create account | Ocean2Joy`
- Description: `Create your Ocean2Joy client account to start a video project.`
- Form fields: Full name, Email, Password, PayPal email (optional), [Create Account] button
- Secondary link: "Already have an account? Sign in"

### Private (client/admin) pages (all noindexed)
- `/dashboard` — Dashboard | Ocean2Joy
- `/projects/new` — Start a new project | Ocean2Joy
- `/projects/:id` — Project number and title | Ocean2Joy
- `/profile` — Profile | Ocean2Joy
- `/admin` — Admin Panel | Ocean2Joy


---

## End of document

Generated directly from the source code on 23 April 2026.  
Source files: `backend/routes/public.py` (SERVICES + POLICIES), `backend/utils/constants.py` (legal/payment details), `frontend/src/pages/*.jsx` (hero/body text), `frontend/src/pages/HowItWorks.jsx` (FAQ constant).
