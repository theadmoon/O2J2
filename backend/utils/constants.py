from datetime import datetime

LEGAL_ENTITY_NAME = "Individual Entrepreneur Vera Iambaeva"
TAX_ID = "302335809"
COUNTRY_OF_REGISTRATION = "Georgia"
BRAND_NAME = "Ocean2Joy Digital Video Production"
CONTACT_EMAIL = "ocean2joy@gmail.com"
PAYPAL_EMAIL = "302335809@postbox.ge"
CONTACT_PHONE = "+995 555 375 032"
LOCATION = "Tbilisi, Georgia"

# Bank transfer (SWIFT)
BANK_BENEFICIARY_NAME = LEGAL_ENTITY_NAME
BANK_BENEFICIARY_BANK = "Bank of Georgia"
BANK_BENEFICIARY_BANK_LOCATION = "Tbilisi, Georgia"
BANK_BENEFICIARY_BANK_SWIFT = "BAGAGE22"
BANK_BENEFICIARY_IBAN = "GE29BG0000000541827200"
BANK_INTERMEDIARY_1_NAME = "Citibank N.A., New York"
BANK_INTERMEDIARY_1_SWIFT = "CITIUS33"
BANK_INTERMEDIARY_2_NAME = "JPMorgan Chase Bank National Association, New York"
BANK_INTERMEDIARY_2_SWIFT = "CHASUS33"

# Crypto (USDT TRC-20)
CRYPTO_NETWORK = "TRON (TRC-20)"
CRYPTO_ASSET = "USDT"
CRYPTO_WALLET_ADDRESS = "TH8qaDB7a2yYXHBBk6Df62vD2g6VKd2sXJ"

# Payment method options shown to the client
PAYMENT_METHODS = {
    "paypal": {"label": "PayPal", "display": "PayPal"},
    "bank_transfer": {"label": "Bank Transfer", "display": "Bank Transfer (SWIFT)"},
    "crypto": {"label": "Crypto", "display": "USDT (TRC-20)"},
}

SERVICE_TYPES = {
    "custom_video": {"label": "Custom", "display": "Custom Video Production"},
    "video_editing": {"label": "Editing", "display": "Video Editing"},
    "ai_video": {"label": "AI", "display": "AI-Generated Video"},
}

OPERATIONAL_CHAIN_STAGES = [
    {"stage_number": 1, "status_key": "submitted", "display_name": "Submitted", "timestamp_field": "created_at", "documents": ["quote_request"]},
    {"stage_number": 2, "status_key": "order_activated", "display_name": "Order Activated", "timestamp_field": "order_activated_at", "documents": ["order_confirmation"]},
    {"stage_number": 3, "status_key": "invoice_sent", "display_name": "Invoice Sent", "timestamp_field": "invoice_sent_at", "documents": ["invoice"]},
    {"stage_number": 4, "status_key": "invoice_signed", "display_name": "Invoice Signed", "timestamp_field": "invoice_signed_at", "documents": []},
    {"stage_number": 5, "status_key": "production_started", "display_name": "Production Started", "timestamp_field": "production_started_at", "documents": ["production_notes"]},
    {"stage_number": 6, "status_key": "delivered", "display_name": "Delivered", "timestamp_field": "delivered_at", "documents": ["download_confirmation"]},
    {"stage_number": 7, "status_key": "files_accessed", "display_name": "Files Accessed", "timestamp_field": "files_accessed_at", "documents": ["certificate_delivery"]},
    {"stage_number": 8, "status_key": "delivery_confirmed", "display_name": "Delivery Confirmed", "timestamp_field": "delivery_confirmed_at", "documents": []},
    {"stage_number": 9, "status_key": "work_accepted", "display_name": "Work Accepted", "timestamp_field": "work_accepted_at", "documents": ["acceptance_act", "payment_instructions"]},
    {"stage_number": 10, "status_key": "payment_sent", "display_name": "Payment Reported", "timestamp_field": "payment_marked_by_client_at", "documents": []},
    {"stage_number": 11, "status_key": "payment_received", "display_name": "Payment Confirmed", "timestamp_field": "payment_confirmed_by_manager_at", "documents": ["payment_confirmation"]},
    {"stage_number": 12, "status_key": "completed", "display_name": "Completed", "timestamp_field": "completed_at", "documents": ["certificate_completion"]},
]

DOCUMENT_TYPES = {
    "invoice": {"code": "INV", "display_name": "Invoice", "requires_signature": True},
    "certificate_completion": {"code": "CRT", "display_name": "Certificate of Completion", "requires_signature": False},
    "certificate_delivery": {"code": "DEL", "display_name": "Certificate of Delivery", "requires_signature": False},
    "acceptance_act": {"code": "ACC", "display_name": "Acceptance Act", "requires_signature": True},
    "payment_confirmation": {"code": "PAY", "display_name": "Payment Confirmation", "requires_signature": False},
    "order_confirmation": {"code": "ORD", "display_name": "Order Confirmation", "requires_signature": False},
    "quote_request": {"code": "QUO", "display_name": "Quote Request", "requires_signature": False},
    "production_notes": {"code": "PRD", "display_name": "Production Notes", "requires_signature": False},
    "payment_instructions": {"code": "INS", "display_name": "Payment Instructions", "requires_signature": False},
    "download_confirmation": {"code": "DWN", "display_name": "Delivery Notes", "requires_signature": False},
    "receipt": {"code": "RCP", "display_name": "Receipt", "requires_signature": False},
}


def format_document_number(project_number: str, doc_code: str, sequence: int, date: datetime) -> str:
    parts = project_number.split('-')
    project_short = parts[0] + parts[1] if len(parts) >= 2 else parts[0]
    seq_str = f"{sequence:04d}"
    date_str = date.strftime('%y%m%d')
    return f"{project_short}-{doc_code}-{seq_str}-{date_str}"
