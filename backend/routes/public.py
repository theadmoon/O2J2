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
            "title": "Custom Video Production",
            "description": "Full-service video production from concept to final cut. Our team handles scripting, filming, and post-production.",
            "base_price": 1050,
            "image_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
        },
        {
            "id": "video-editing",
            "title": "Video Editing",
            "description": "Professional post-production services including color grading, sound design, motion graphics, and visual effects.",
            "base_price": 500,
            "image_url": "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80",
        },
        {
            "id": "ai-video",
            "title": "AI-Generated Video",
            "description": "Cutting-edge AI-powered video creation. Transform your ideas into stunning visual content with machine learning.",
            "base_price": 750,
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
        "intermediary_bank": "Deutsche Bank AG, Frankfurt",
        "intermediary_swift": "DEUTDEFF",
        "paypal_email": CONTACT_EMAIL,
        "currency": "USD",
        "qr_code_url": None,
        "note": f"Tax ID: {TAX_ID}, {COUNTRY_OF_REGISTRATION}",
    }
