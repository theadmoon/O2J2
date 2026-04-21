from fastapi import APIRouter
from utils.constants import (
    LEGAL_ENTITY_NAME, TAX_ID, COUNTRY_OF_REGISTRATION,
    CONTACT_EMAIL, CONTACT_PHONE, LOCATION, PAYPAL_EMAIL,
    CRYPTO_NETWORK, CRYPTO_ASSET,
)

router = APIRouter(prefix="/api", tags=["public"])

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
        "title": "Custom Video Production",
        "description": "A production-grade showcase demonstrating the end-to-end quality our team delivers for custom-video briefs.",
        "video_url": "https://customer-assets.emergentagent.com/job_o2j-creative-hub/artifacts/n92uamk0_Demo1_720p_O2J2.mp4",
        "video_type": "url",
        "thumbnail_url": None,
        "tags": ["Professional", "HD 720p", "Custom"],
    },
    {
        "id": "demo-2",
        "title": "AI-Assisted Creation",
        "description": "A short example highlighting the AI-enhanced workflow and the creative range we unlock for our clients.",
        "video_url": "https://customer-assets.emergentagent.com/job_o2j-creative-hub/artifacts/4l4efdg2_Demo2_720p_O2J2.mp4",
        "video_type": "url",
        "thumbnail_url": None,
        "tags": ["AI", "HD 720p", "Innovative"],
    },
]


@router.get("/demo-videos")
async def get_demo_videos():
    return DEMO_VIDEOS


@router.get("/payment-settings")
async def get_payment_settings():
    """Public-facing summary of available payment methods.

    We expose only minimum info needed to (a) let PayPal verify Vera Iambaeva's
    receiving account is legitimate, and (b) inform the client what to expect.
    Full payment details (IBAN, SWIFT, wallet address) are rendered only inside
    the authenticated invoice document after the quote has been activated.
    """
    return {
        "methods": [
            {
                "code": "paypal",
                "label": "PayPal",
                "description": "Fast and simple. Confirmed within minutes after the transaction clears.",
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
        "note": "Full payment details will be provided in your invoice after quote confirmation.",
    }


from pydantic import BaseModel
from datetime import datetime, timezone
import uuid


class ContactInput(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str


class QuickRequestInput(BaseModel):
    name: str
    email: str
    phone: str = ""
    service_type: str
    brief_description: str
    deadline: str = ""
    payment_method: str = "paypal"


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


@router.post("/quick-request")
async def submit_quick_request(data: QuickRequestInput):
    from database.connection import get_db
    from utils.security import hash_password
    db = get_db()
    request_id = str(uuid.uuid4())[:8].upper()

    existing = await db.users.find_one({"email": data.email.lower()})
    if not existing:
        user_id = str(uuid.uuid4())
        temp_password = str(uuid.uuid4())[:8]
        await db.users.insert_one({
            "id": user_id,
            "email": data.email.lower(),
            "password_hash": hash_password(temp_password),
            "name": data.name,
            "role": "client",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
        })

    await db.quick_requests.insert_one({
        "id": request_id,
        "name": data.name,
        "email": data.email.lower(),
        "phone": data.phone,
        "service_type": data.service_type,
        "brief_description": data.brief_description,
        "deadline": data.deadline,
        "payment_method": data.payment_method,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
    })
    return {
        "message": "Request submitted! We'll send you a custom quote within 24 hours.",
        "request_id": request_id,
    }


POLICIES = {
    "terms": {
        "title": "Terms of Service",
        "updated_at": "2025-02-17T00:00:00Z",
        "content": """# Terms of Service\n\n## 1. General\nThese terms govern the use of services provided by Individual Entrepreneur Vera Iambaeva (Tax ID: 302335809), operating under the brand name Ocean2Joy Digital Video Production.\n\n## 2. Services\nAll services are delivered electronically. No physical products are shipped.\n\n## 3. Payment\nPayment is due upon acceptance of quote. We accept PayPal and SWIFT bank transfers.\n\n## 4. Delivery\nAll deliverables are provided through our secure digital client portal.\n\n## 5. Revisions\nRevision rounds are included as specified in each service package.\n\n## 6. Intellectual Property\nUpon full payment, the client receives full usage rights to the delivered content.\n\n## 7. Jurisdiction\nThese terms are governed by the laws of Georgia.""",
    },
    "digital_delivery": {
        "title": "Digital Delivery Policy",
        "updated_at": "2025-02-17T00:00:00Z",
        "content": """# Digital Delivery Policy\n\n## Electronic Delivery Only\nAll Ocean2Joy services are delivered exclusively in electronic form. No physical media is shipped.\n\n## Delivery Method\nFiles are delivered through our secure client portal. Clients receive notification when files are ready for download.\n\n## File Formats\nStandard formats: MP4, MOV, AVI, WebM. Custom formats available on request.\n\n## File Retention\nFiles remain accessible in the client portal for 90 days. Extended retention available on request.""",
    },
    "refund": {
        "title": "Refund & Cancellation Policy",
        "updated_at": "2025-02-17T00:00:00Z",
        "content": """# Refund & Cancellation Policy\n\n## Before Production\nFull refund available if cancelled before production begins.\n\n## During Production\nPartial refund based on work completed.\n\n## After Delivery\nNo refunds after final delivery and client acceptance.""",
    },
    "revision": {
        "title": "Revision Policy",
        "updated_at": "2025-02-17T00:00:00Z",
        "content": """# Revision Policy\n\n## Included Revisions\nEach service package includes 2-3 revision rounds as specified.\n\n## Revision Process\n1. Review deliverables in your portal\n2. Submit feedback with specific changes\n3. Receive updated version within 3-5 business days\n\n## Additional Revisions\nExtra revision rounds available at additional cost.""",
    },
    "privacy": {
        "title": "Privacy Policy",
        "updated_at": "2026-02-18T00:00:00Z",
        "content": """_Last updated: February 18, 2026_

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
- **Payment data:** PayPal transaction ID (only if you voluntarily provide it), SWIFT transfer references.
- **Technical data:** IP address and session cookies strictly necessary for authentication.

We do **not** collect payment card details — all payments are handled by external providers (PayPal, your bank).

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

## 9. How We Communicate With You (In-Portal First)
All order communication takes place **inside your client portal**:
- **Messages** go through the project chat — to reach us, post a message in your project; we reply there.
- **Documents** (invoices, acceptance acts, receipts, certificates) are stored in your personal cabinet and downloadable as PDF/TXT at any time — we never attach them to emails.
- **Status updates** on the 12-stage operational chain are visible in real time in your project page — no email notifications are sent.

We do **not** send marketing, newsletter, or notification emails. We do **not** send a "welcome" email on registration. Email (ocean2joy@gmail.com) is used **only in exceptional cases** — for example, if we cannot reach you through the portal for a time-critical matter, or to fulfil a legal data-subject request. Because we do not push notifications, please sign in regularly to check your project status and messages.

## 10. Payments (Currently Manual)
At this time, **payment systems are not integrated into the portal**. Payments are processed in semi-manual mode:
- You receive payment details (PayPal account or SWIFT/IBAN) in the portal after accepting the quote.
- You transfer funds via your preferred method.
- You mark the payment as sent in the portal (optionally providing a PayPal transaction ID), and we verify receipt manually before advancing the project.

We plan to integrate automated payment providers (PayPal Checkout / Stripe) in a future release. When that happens, this Policy will be updated to disclose the processors, data transfer destinations, and legal bases involved.

If you register a **PayPal Account** during sign-up (optional, see §2), we use it solely to reconcile incoming PayPal payments with your account. It is not used for marketing, not shared with third parties, and can be removed at any time by contacting us.

## 11. Security
Passwords are hashed with bcrypt. All traffic is served over HTTPS. Access tokens are stored in httpOnly, SameSite=Lax cookies to mitigate XSS and CSRF risks.

## 12. Children
Our services are not directed to individuals under 16. We do not knowingly collect personal data from minors.

## 13. Changes to This Policy
We may update this Policy. The "Last updated" date above reflects the latest revision. Material changes will be notified through a prominent notice inside your client portal (no email).

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
