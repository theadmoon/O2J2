from fastapi import APIRouter
from utils.constants import (
    LEGAL_ENTITY_NAME, TAX_ID, COUNTRY_OF_REGISTRATION,
    CONTACT_EMAIL, CONTACT_PHONE, LOCATION,
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


@router.get("/demo-videos")
async def get_demo_videos():
    return []


@router.get("/payment-settings")
async def get_payment_settings():
    return {
        "bank_name": "Bank of Georgia",
        "bank_location": "Tbilisi, Georgia",
        "account_holder": LEGAL_ENTITY_NAME,
        "beneficiary": LEGAL_ENTITY_NAME,
        "iban": "GE29BG0000000541827200",
        "swift": "BAGAGE22",
        "intermediary_bank": "Citibank N.A., New York",
        "intermediary_swift": "CITIUS33",
        "intermediary_bank_2": "JPMorgan Chase Bank National Association, New York",
        "intermediary_swift_2": "CHASUS33",
        "paypal_email": CONTACT_EMAIL,
        "currency": "USD",
        "qr_code_url": None,
        "note": f"Tax ID: {TAX_ID}, {COUNTRY_OF_REGISTRATION}",
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
        "updated_at": "2025-02-17T00:00:00Z",
        "content": """# Privacy Policy\n\n## Data Collection\nWe collect only information necessary to provide our services: name, email, project details.\n\n## Data Usage\nYour data is used solely for project delivery and communication.\n\n## Data Protection\nAll data is stored securely and is not shared with third parties.\n\n## Contact\nFor privacy concerns: ocean2joy@gmail.com""",
    },
}


@router.get("/policies/{policy_type}")
async def get_policy(policy_type: str):
    if policy_type not in POLICIES:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Policy not found")
    return POLICIES[policy_type]
