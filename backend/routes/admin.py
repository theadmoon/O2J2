"""Admin-only reference endpoints. Authenticated + role=admin guarded."""
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
