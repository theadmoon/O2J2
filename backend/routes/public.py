from fastapi import APIRouter
from utils.constants import (
    LEGAL_ENTITY_NAME, TAX_ID, COUNTRY_OF_REGISTRATION,
    CONTACT_EMAIL, CONTACT_PHONE, LOCATION,
)

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/services")
async def get_services():
    return [
        {
            "id": "custom-video",
            "type": "custom_video",
            "title": "Custom Video Production with Actors",
            "description": "Professional video production with real actors, custom scripts, and high-quality filming. Perfect for commercials, short films, educational content, and brand stories.",
            "pricing_model": "per_minute",
            "base_price": 25.0,
            "price_description": "$25-35 per minute, calculated based on duration and complexity",
            "image_url": "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=600&q=80",
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
        },
    ]


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
