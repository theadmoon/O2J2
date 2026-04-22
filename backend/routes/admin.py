"""Admin-only reference endpoints. Authenticated + role=admin guarded."""
import asyncio
import os

import resend
from fastapi import APIRouter, Request, HTTPException
from database.connection import get_db
from utils.security import get_current_user
from utils.constants import (
    PAYPAL_EMAIL, LEGAL_ENTITY_NAME, TAX_ID, COUNTRY_OF_REGISTRATION,
    BANK_BENEFICIARY_NAME, BANK_BENEFICIARY_BANK, BANK_BENEFICIARY_BANK_LOCATION,
    BANK_BENEFICIARY_BANK_SWIFT, BANK_BENEFICIARY_IBAN,
    BANK_INTERMEDIARY_1_NAME, BANK_INTERMEDIARY_1_SWIFT,
    BANK_INTERMEDIARY_2_NAME, BANK_INTERMEDIARY_2_SWIFT,
    CRYPTO_NETWORK, CRYPTO_ASSET, CRYPTO_WALLET_ADDRESS,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def _require_admin(request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


@router.get("/payment-reference")
async def get_payment_reference(request: Request):
    """Full, authoritative payment details for all three methods.
    Used to render a reference card in the admin panel so the team doesn't have
    to open an invoice every time they need the IBAN/wallet."""
    await _require_admin(request)
    return {
        "beneficiary": LEGAL_ENTITY_NAME,
        "tax_id": TAX_ID,
        "country": COUNTRY_OF_REGISTRATION,
        "paypal": {"email": PAYPAL_EMAIL},
        "bank_transfer": {
            "beneficiary_name": BANK_BENEFICIARY_NAME,
            "beneficiary_bank": BANK_BENEFICIARY_BANK,
            "beneficiary_bank_location": BANK_BENEFICIARY_BANK_LOCATION,
            "beneficiary_bank_swift": BANK_BENEFICIARY_BANK_SWIFT,
            "beneficiary_iban": BANK_BENEFICIARY_IBAN,
            "intermediary_bank_1": {"name": BANK_INTERMEDIARY_1_NAME, "swift": BANK_INTERMEDIARY_1_SWIFT},
            "intermediary_bank_2": {"name": BANK_INTERMEDIARY_2_NAME, "swift": BANK_INTERMEDIARY_2_SWIFT},
        },
        "crypto": {
            "asset": CRYPTO_ASSET,
            "network": CRYPTO_NETWORK,
            "wallet_address": CRYPTO_WALLET_ADDRESS,
        },
    }


def _mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 10:
        return "***"
    return f"{key[:6]}...{key[-4:]}"


@router.get("/notifications/diagnostics")
async def notifications_diagnostics(request: Request):
    """Return the active Resend configuration so the admin can verify that
    the production `.env` is loaded correctly (without leaking the full key)."""
    await _require_admin(request)
    api_key = os.environ.get("RESEND_API_KEY") or ""
    return {
        "resend_api_key_present": bool(api_key),
        "resend_api_key_preview": _mask_key(api_key),
        "sender_email": os.environ.get("SENDER_EMAIL") or "",
        "admin_notify_email": os.environ.get("ADMIN_NOTIFY_EMAIL") or "",
        "frontend_url": os.environ.get("FRONTEND_URL") or "",
    }


@router.post("/notifications/test")
async def notifications_test(request: Request):
    """Send a synthetic test email using the exact same Resend path as the
    operational chain. Returns the raw Resend response (or error) so the admin
    can immediately see issues like testing-mode restrictions or bad API keys."""
    await _require_admin(request)
    api_key = os.environ.get("RESEND_API_KEY") or ""
    sender = os.environ.get("SENDER_EMAIL") or "onboarding@resend.dev"
    recipient = os.environ.get("ADMIN_NOTIFY_EMAIL") or ""

    if not api_key:
        raise HTTPException(status_code=400, detail="RESEND_API_KEY is not set in backend environment")
    if not recipient:
        raise HTTPException(status_code=400, detail="ADMIN_NOTIFY_EMAIL is not set in backend environment")

    def _send():
        resend.api_key = api_key
        return resend.Emails.send({
            "from": sender,
            "to": [recipient],
            "subject": "[O2J2] Test email — Resend diagnostics",
            "html": (
                "<p>This is a diagnostic email from the Ocean2Joy admin panel.</p>"
                f"<p>Sender: <code>{sender}</code><br/>Recipient: <code>{recipient}</code></p>"
                "<p>If you received this, Resend is wired correctly.</p>"
            ),
        })

    try:
        result = await asyncio.to_thread(_send)
        return {
            "ok": True,
            "sender": sender,
            "recipient": recipient,
            "resend_response": result,
        }
    except Exception as exc:  # noqa: BLE001 — surface the error to the admin
        raise HTTPException(
            status_code=502,
            detail=f"Resend rejected the email: {exc}",
        )
