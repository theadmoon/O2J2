from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
import os

from database.connection import get_db
from utils.constants import (
    LEGAL_ENTITY_NAME, PAYPAL_EMAIL,
    CRYPTO_ASSET,
)

router = APIRouter(prefix="/api", tags=["public"])


DEMO_MEDIA_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "uploads",
    "demo_media",
)


def _build_public_demo_video(doc: dict) -> dict:
    """Turn a stored demo_videos doc into the public-facing shape used by the UI.
    - Static-seeded records keep their /videos/... and /posters/... URLs (served
      by the frontend nginx).
    - Admin-uploaded records expose streaming URLs under /api/public/demo-media.
    """
    def _video_url():
        if doc.get("video_storage") == "uploaded":
            return f"/api/public/demo-media/{doc['id']}/video"
        return doc.get("video_url") or ""

    def _thumb_url():
        if doc.get("poster_storage") == "uploaded":
            return f"/api/public/demo-media/{doc['id']}/poster"
        return doc.get("poster_url") or ""

    return {
        "id": doc["id"],
        "title": doc.get("title") or "",
        "description": doc.get("description") or "",
        "tags": doc.get("tags") or [],
        "video_url": _video_url(),
        "video_type": "url",
        "thumbnail_url": _thumb_url(),
        "created_at": doc.get("created_at") or "",
    }

# Full services data with features, genres, etc.
SERVICES_DATA = [
    {
        "id": "custom-video",
        "type": "custom_video",
        "title": "Custom Video Production with Actors",
        "description": "Professional video production with real actors, custom scripts, and high-quality filming. Perfect for commercials, short films, educational content, and brand stories.",
        "pricing_model": "per_minute",
        "base_price": 25.0,
        "price_description": "$25-35 per minute, calculated based on duration and complexity",
        "image_url": "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=600&q=80",
        "features": ["Professional actors and crew", "Custom scriptwriting", "4K filming", "Color grading", "Sound design", "Multiple revision rounds"],
        "deliverable_type": "Digital video files",
        "output_format": ["MP4", "MOV", "AVI"],
        "genres": ["Commercial", "Educational", "Brand Story", "Short Film", "Corporate"],
        "turnaround_time": "2-4 weeks depending on complexity",
        "revision_policy": "2-3 rounds included",
    },
    {
        "id": "video-editing",
        "type": "video_editing",
        "title": "Professional Video Editing & Special Effects",
        "description": "Expert video editing and post-production services for your existing footage. From basic cuts to advanced special effects and motion graphics.",
        "pricing_model": "per_project",
        "base_price": 10.99,
        "price_description": "Starting at $10.99 per element, full project pricing calculated based on complexity",
        "image_url": "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=600&q=80",
        "features": ["Professional editing", "Color correction", "Motion graphics", "Sound mixing", "Transitions & effects", "Format conversion"],
        "deliverable_type": "Edited video files",
        "output_format": ["MP4", "MOV", "ProRes"],
        "genres": [],
        "turnaround_time": "1-2 weeks",
        "revision_policy": "2 rounds included",
    },
    {
        "id": "ai-video",
        "type": "ai_video",
        "title": "AI-Generated Video Content",
        "description": "Cutting-edge AI-powered video creation with digital characters and environments. Perfect for creative projects, explainer videos, and unique visual content.",
        "pricing_model": "custom",
        "base_price": 20.0,
        "price_description": "Custom pricing based on video length, complexity, and AI features used",
        "image_url": "https://images.unsplash.com/photo-1677442135136-760c813028c0?auto=format&fit=crop&w=600&q=80",
        "features": ["AI character generation", "Digital environments", "Voice synthesis", "Automated editing", "Style transfer", "Custom animations"],
        "deliverable_type": "AI-generated video files",
        "output_format": ["MP4", "MOV", "WebM"],
        "genres": ["Explainer", "Creative", "Marketing", "Social Media"],
        "turnaround_time": "1-3 weeks",
        "revision_policy": "3 rounds included",
    },
]


@router.get("/services")
async def get_services():
    return SERVICES_DATA


@router.get("/services/{service_id}")
async def get_service_details(service_id: str):
    for s in SERVICES_DATA:
        if s["id"] == service_id:
            return s
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Service not found")


DEMO_VIDEOS = [
    {
        "id": "demo-1",
        "title": "Cinematic Live-Action × VFX",
        "description": "A live-action shoot with professional performers fused with cinema-grade visual effects. This is the standard we hold every frame to — the feel of a streaming-series production, delivered at digital-studio speed. Scripting, directing, on-set crew, post, VFX and color are all handled end-to-end by our team.",
        "video_storage": "static",
        "video_url": "/videos/Ocean2Joy_Demo1_720p.mp4",
        "poster_storage": "static",
        "poster_url": "/posters/demo1.png",
        "tags": ["Live Actors", "Cinematic VFX", "End-to-End Production"],
        "order": 1,
    },
    {
        "id": "demo-2",
        "title": "AI-Generated Video",
        "description": "Worlds, characters and motion that would be impossible — or prohibitively expensive — to shoot on a real set. Our AI creative pipeline turns a brief into a fully animated sequence with style, pacing and mood controlled by a human director. Unlimited imagination, cinema-level discipline.",
        "video_storage": "static",
        "video_url": "/videos/Ocean2Joy_Demo2_720p.mp4",
        "poster_storage": "static",
        "poster_url": "/posters/demo2.png",
        "tags": ["AI-Generated", "Unlimited Imagination", "Director-Guided"],
        "order": 2,
    },
]


@router.get("/demo-videos")
async def get_demo_videos():
    """Public list of demo videos, sorted by `order`. Source of truth is the
    `demo_videos` Mongo collection (seeded on first start, editable in admin)."""
    db = get_db()
    docs = await db.demo_videos.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)
    return [_build_public_demo_video(d) for d in docs]


@router.get("/public/demo-media/{demo_id}/video")
async def get_demo_video_file(demo_id: str):
    db = get_db()
    doc = await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})
    if not doc or doc.get("video_storage") != "uploaded":
        raise HTTPException(status_code=404, detail="Demo video not found")
    filename = doc.get("video_filename") or "video.mp4"
    abs_path = os.path.join(DEMO_MEDIA_ROOT, demo_id, "video", filename)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="Demo video file missing on disk")
    return FileResponse(abs_path, media_type="video/mp4")


@router.get("/public/demo-media/{demo_id}/poster")
async def get_demo_poster_file(demo_id: str):
    db = get_db()
    doc = await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})
    if not doc or doc.get("poster_storage") != "uploaded":
        raise HTTPException(status_code=404, detail="Demo poster not found")
    filename = doc.get("poster_filename") or "poster.png"
    abs_path = os.path.join(DEMO_MEDIA_ROOT, demo_id, "poster", filename)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="Demo poster file missing on disk")
    return FileResponse(abs_path)


@router.get("/payment-settings")
async def get_payment_settings():
    """Public-facing summary of available payment methods.

    We expose only minimum info needed to (a) let PayPal verify Vera Iambaeva's
    receiving account is legitimate, and (b) inform the client what to expect.
    Full payment details (IBAN, SWIFT, wallet address) are rendered only inside
    the authenticated invoice document after the order has been activated.
    """
    return {
        "methods": [
            {
                "code": "paypal",
                "label": "PayPal",
                "description": "Fast and simple. Payment is confirmed in the portal after manual verification by our team.",
                "public_account": PAYPAL_EMAIL,
                "public_account_label": "PayPal account",
            },
            {
                "code": "bank_transfer",
                "label": "Bank Transfer (SWIFT)",
                "description": "International wire via SWIFT. Recommended for larger invoices. Typically 3–5 business days.",
                "public_account": None,
                "public_account_label": None,
            },
            {
                "code": "crypto",
                "label": f"{CRYPTO_ASSET} (TRC-20)",
                "description": "Stablecoin transfer over the TRON network. Only TRC-20 assets are supported.",
                "public_account": None,
                "public_account_label": None,
            },
        ],
        "currency": "USD",
        "beneficiary": LEGAL_ENTITY_NAME,
        "note": "Full payment details will be provided in your invoice after the order is activated.",
    }


from pydantic import BaseModel
from datetime import datetime, timezone
import uuid


class ContactInput(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str


@router.post("/contact")
async def submit_contact(data: ContactInput):
    from database.connection import get_db
    db = get_db()
    msg = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "subject": data.subject,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new",
    }
    await db.contact_messages.insert_one(msg)
    return {"message": "Message received. We'll respond within 24 hours."}


POLICIES = {
    "terms": {
        "title": "Terms of Service",
        "substantive_version_date": "2025-10-21T00:00:00Z",
        "content": """## 1. General
These Terms govern the use of services provided by **Individual Entrepreneur Vera Iambaeva** (Tax ID: **302335809**, Tbilisi, Georgia), operating under the brand name **Ocean2Joy Digital Video Production** ("we", "us", "the Company").

By creating an account and submitting a project, you agree to these Terms.

## 2. Services
We design and produce custom digital video content (live-action, post-production & VFX, AI-assisted creation). All services are delivered **electronically only** — no physical media is shipped.

## 3. The 12-Stage Operational Chain
Every order follows a fixed 12-stage workflow inside the client portal. Each stage is time-stamped in UTC and produces auditable PDF + TXT records. **All stage timestamps are UTC-based and reflect the moment the corresponding event was recorded inside the portal** — they are portal-side events, not external system events.

1. **Project submitted** by the client inside the portal.
2. **Order Activated** by our team inside the portal.
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

Payment is currently processed **manually** via one of three channels: **PayPal**, **SWIFT bank transfer**, or **USDT-TRC20** cryptocurrency. Full payment details for the channel you choose are provided inside the client portal after the order is activated. Automated payment integration is planned for a future release; we will update these Terms accordingly.

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
""",
    },
    "digital_delivery": {
        "title": "Digital Delivery Policy",
        "substantive_version_date": "2025-10-21T00:00:00Z",
        "content": """## 1. Electronic Delivery Only
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

## 9. Delivery Questions & Escalation — Portal-First
All delivery-related questions, file-access issues, and revision requests are handled **inside the project chat in the client portal**. The portal keeps a full audit trail of every delivery message, file-access event, and revision turn, which is what the Certificate of Delivery is ultimately built from.

Email (**ocean2joy@gmail.com**) is used **only as an emergency fallback** when portal communication is temporarily unavailable — for example, if you cannot sign in, the portal is under maintenance, or a technical issue prevents you from posting a delivery message. We do not deliver files by email and we do not answer substantive delivery questions by email.
""",
    },
    "refund": {
        "title": "Refund & Cancellation Policy",
        "substantive_version_date": "2025-10-21T00:00:00Z",
        "content": """## 1. Overview
Because our payment model is **pay-after-acceptance** (actual funds are transferred only after the client has inspected and accepted the work at Stage 9, and are reported at Stage 10 — Payment Reported, then confirmed at Stage 11 — Payment Confirmed), most cancellations do not involve a refund at all — they are simply the termination of an unpaid order.

This policy describes what happens when a project is cancelled at each stage.

## 2. Cancellation Before Payment (Stages 1 – 9)
You may cancel your order at any time **before** the payment is reported at Stage 10, by posting a cancellation request in the project chat inside the portal. The amount due depends on the stage:

| Stage at cancellation | Amount due |
|---|---|
| 1 — Project submitted | **0 — no charge** |
| 2 — Order Activated | **0 — no charge** |
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
""",
    },
    "revision": {
        "title": "Revision Policy",
        "substantive_version_date": "2025-10-21T00:00:00Z",
        "content": """## 1. Where Revisions Happen
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
""",
    },
    "privacy": {
        "title": "Privacy Policy",
        "substantive_version_date": "2025-10-21T00:00:00Z",
        "content": """This Privacy Policy explains how **Individual Entrepreneur Vera Iambaeva** (Tax ID: 302335809, Tbilisi, Georgia), operating the Ocean2Joy Digital Video Production brand ("we", "us", "the Controller"), collects and processes personal data in accordance with the **EU General Data Protection Regulation (GDPR)** and the **Law of Georgia on Personal Data Protection**.

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
""",
    },
}


@router.get("/policies/{policy_type}")
async def get_policy(policy_type: str):
    if policy_type not in POLICIES:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Policy not found")
    return POLICIES[policy_type]
