from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse
from database.connection import get_db
from utils.security import get_current_user
from utils.constants import DOCUMENT_TYPES, OPERATIONAL_CHAIN_STAGES
from utils.constants import (
    LEGAL_ENTITY_NAME, TAX_ID, COUNTRY_OF_REGISTRATION,
    BRAND_NAME, CONTACT_EMAIL, CONTACT_PHONE, LOCATION,
    PAYPAL_EMAIL,
    BANK_BENEFICIARY_NAME, BANK_BENEFICIARY_BANK, BANK_BENEFICIARY_BANK_LOCATION,
    BANK_BENEFICIARY_BANK_SWIFT, BANK_BENEFICIARY_IBAN,
    BANK_INTERMEDIARY_1_NAME, BANK_INTERMEDIARY_1_SWIFT,
    BANK_INTERMEDIARY_2_NAME, BANK_INTERMEDIARY_2_SWIFT,
    CRYPTO_NETWORK, CRYPTO_ASSET, CRYPTO_WALLET_ADDRESS,
    PAYMENT_METHODS,
)
from utils.formatters import format_date_utc, format_currency
from services.document_service import get_or_generate_document_number
from datetime import datetime, timezone

router = APIRouter(prefix="/api/projects/{project_id}/documents", tags=["documents"])


def _get_doc_stage(doc_type: str) -> dict:
    for stage in OPERATIONAL_CHAIN_STAGES:
        if doc_type in stage["documents"]:
            return stage
    return None


async def _get_project_and_validate(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return db, project


def _service_default_description(service_type: str) -> str:
    m = {
        "custom_video": "Custom digital video production according to client's script and brief.",
        "video_editing": "Professional digital video editing services according to client's source materials and specifications.",
        "ai_video": "AI-generated digital video production according to client's concept and specifications.",
    }
    return m.get(service_type, "Custom digital video services according to client's brief.")


def _payment_confirmation_phrase(payment_method: str) -> str:
    phrases = {
        "paypal": "By completing payment via PayPal",
        "bank_transfer": "By completing the SWIFT bank transfer",
        "crypto": "By completing the USDT (TRC-20) transfer",
    }
    return phrases.get(payment_method, "By completing the payment")



def _invoice_dates(project: dict) -> dict:
    """Compute issue/start/delivery dates for the invoice. Uses admin-provided
    values when available, otherwise derives sensible defaults from timestamps."""
    from datetime import datetime as _dt, timedelta as _td
    issued_iso = project.get("invoice_sent_at") or project.get("order_activated_at") or project.get("created_at")
    issued = _dt.fromisoformat(issued_iso.replace("Z", "+00:00")) if issued_iso else _dt.now(timezone.utc)

    start_str = project.get("estimated_start_date")
    delivery_str = project.get("estimated_delivery_date")

    if start_str:
        start_date = _dt.fromisoformat(start_str)
    else:
        start_date = issued + _td(days=2)
    if delivery_str:
        delivery_date = _dt.fromisoformat(delivery_str)
    else:
        delivery_date = start_date + _td(days=21)

    def fmt(d):
        return d.strftime("%B %d, %Y")

    return {"issued": fmt(issued), "start": fmt(start_date), "delivery": fmt(delivery_date)}


def _payment_method_details_html(project: dict) -> str:
    method = (project.get("payment_method") or "paypal")
    pn = project.get("project_number", "")
    service_label = (project.get("service_type") or "Custom").replace("_", " ").title()
    memo_line = f"{pn} / {service_label} / Ocean2Joy"
    memo_block = (
        "<div style='margin-top:12px;padding:10px 14px;background:#f0f9ff;border-left:3px solid #0ea5e9;border-radius:4px;'>"
        "<p style='margin:0 0 4px 0;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;'>"
        "Payment note — copy this exact text into your payment memo/reference field:</p>"
        f"<code style='font-size:13px;font-weight:600;color:#0a1628;'>{memo_line}</code>"
        "</div>"
    )
    if method == "paypal":
        return (
            "<p><strong>Method:</strong> PayPal</p>"
            "<table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>"
            f"<tr><th>Send to</th><td><code>{PAYPAL_EMAIL}</code></td></tr>"
            f"<tr><th>Beneficiary</th><td>{LEGAL_ENTITY_NAME}</td></tr>"
            "</table>"
            + memo_block
        )
    if method == "bank_transfer":
        return (
            "<p><strong>Method:</strong> Bank Transfer (SWIFT)</p>"
            "<table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>"
            f"<tr><th>Beneficiary</th><td>{BANK_BENEFICIARY_NAME}</td></tr>"
            f"<tr><th>Beneficiary Bank</th><td>{BANK_BENEFICIARY_BANK}, {BANK_BENEFICIARY_BANK_LOCATION}</td></tr>"
            f"<tr><th>SWIFT</th><td><code>{BANK_BENEFICIARY_BANK_SWIFT}</code></td></tr>"
            f"<tr><th>IBAN</th><td><code>{BANK_BENEFICIARY_IBAN}</code></td></tr>"
            f"<tr><th>Intermediary 1</th><td>{BANK_INTERMEDIARY_1_NAME} (SWIFT: {BANK_INTERMEDIARY_1_SWIFT})</td></tr>"
            f"<tr><th>Intermediary 2</th><td>{BANK_INTERMEDIARY_2_NAME} (SWIFT: {BANK_INTERMEDIARY_2_SWIFT})</td></tr>"
            "</table>"
            + memo_block
        )
    if method == "crypto":
        return (
            f"<p><strong>Method:</strong> {CRYPTO_ASSET} on {CRYPTO_NETWORK}</p>"
            "<table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>"
            f"<tr><th>Asset</th><td>{CRYPTO_ASSET}</td></tr>"
            f"<tr><th>Network</th><td>{CRYPTO_NETWORK} — <strong>TRC-20 only</strong></td></tr>"
            f"<tr><th>Wallet address</th><td><code style='word-break:break-all'>{CRYPTO_WALLET_ADDRESS}</code></td></tr>"
            f"<tr><th>Beneficiary</th><td>{LEGAL_ENTITY_NAME}</td></tr>"
            "</table>"
            + memo_block
            + "<p style='font-size:11px;color:#555;margin-top:8px;'>After the transfer, send the transaction hash through your project chat and mark the payment as sent.</p>"
            "<p style='color:#b45309;font-size:11px;margin-top:4px;'>"
            "⚠ Only TRON network (TRC-20) transfers are supported. Assets sent via a different network may be lost."
            "</p>"
        )
    return "<p><em>No payment method selected.</em></p>"



    method = (project.get("payment_method") or "paypal")
    if method == "paypal":
        return (
            "<p><strong>Method:</strong> PayPal</p>"
            "<table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>"
            f"<tr><th>Send to</th><td><code>{PAYPAL_EMAIL}</code></td></tr>"
            f"<tr><th>Beneficiary</th><td>{LEGAL_ENTITY_NAME}</td></tr>"
            f"<tr><th>Reference</th><td>Include your project number <strong>{project.get('project_number','')}</strong> in the PayPal note.</td></tr>"
            "</table>"
        )
    if method == "bank_transfer":
        return (
            "<p><strong>Method:</strong> Bank Transfer (SWIFT)</p>"
            "<table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>"
            f"<tr><th>Beneficiary</th><td>{BANK_BENEFICIARY_NAME}</td></tr>"
            f"<tr><th>Beneficiary Bank</th><td>{BANK_BENEFICIARY_BANK}, {BANK_BENEFICIARY_BANK_LOCATION}</td></tr>"
            f"<tr><th>SWIFT</th><td><code>{BANK_BENEFICIARY_BANK_SWIFT}</code></td></tr>"
            f"<tr><th>IBAN</th><td><code>{BANK_BENEFICIARY_IBAN}</code></td></tr>"
            f"<tr><th>Intermediary 1</th><td>{BANK_INTERMEDIARY_1_NAME} (SWIFT: {BANK_INTERMEDIARY_1_SWIFT})</td></tr>"
            f"<tr><th>Intermediary 2</th><td>{BANK_INTERMEDIARY_2_NAME} (SWIFT: {BANK_INTERMEDIARY_2_SWIFT})</td></tr>"
            f"<tr><th>Reference</th><td>Include project number <strong>{project.get('project_number','')}</strong> in the transfer message.</td></tr>"
            "</table>"
        )
    if method == "crypto":
        return (
            f"<p><strong>Method:</strong> {CRYPTO_ASSET} on {CRYPTO_NETWORK}</p>"
            "<table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>"
            f"<tr><th>Asset</th><td>{CRYPTO_ASSET}</td></tr>"
            f"<tr><th>Network</th><td>{CRYPTO_NETWORK} — <strong>TRC-20 only</strong></td></tr>"
            f"<tr><th>Wallet address</th><td><code style='word-break:break-all'>{CRYPTO_WALLET_ADDRESS}</code></td></tr>"
            f"<tr><th>Beneficiary</th><td>{LEGAL_ENTITY_NAME}</td></tr>"
            f"<tr><th>Reference</th><td>After the transfer, send the transaction hash through your project chat and mark the payment as sent. Include project number <strong>{project.get('project_number','')}</strong> for our records.</td></tr>"
            "</table>"
            "<p style='color:#b45309;font-size:11px;margin-top:8px;'>"
            "⚠ Only TRON network (TRC-20) transfers are supported. Assets sent via a different network may be lost."
            "</p>"
        )
    return "<p><em>No payment method selected.</em></p>"


def _payment_method_details_txt(project: dict) -> list[str]:
    method = (project.get("payment_method") or "paypal")
    pn = project.get("project_number", "")
    service_label = (project.get("service_type") or "Custom").replace("_", " ").title()
    memo_line = f"{pn} / {service_label} / Ocean2Joy"
    memo_block = [
        "",
        "  ┌─ PAYMENT NOTE — copy this exact text into your payment memo ─",
        f"  │ {memo_line}",
        "  └──────────────────────────────────────────────────────────────",
    ]
    if method == "paypal":
        return [
            "Method: PayPal",
            f"  Send to: {PAYPAL_EMAIL}",
            f"  Beneficiary: {LEGAL_ENTITY_NAME}",
        ] + memo_block
    if method == "bank_transfer":
        return [
            "Method: Bank Transfer (SWIFT)",
            f"  Beneficiary: {BANK_BENEFICIARY_NAME}",
            f"  Beneficiary Bank: {BANK_BENEFICIARY_BANK}, {BANK_BENEFICIARY_BANK_LOCATION}",
            f"  SWIFT: {BANK_BENEFICIARY_BANK_SWIFT}",
            f"  IBAN: {BANK_BENEFICIARY_IBAN}",
            f"  Intermediary 1: {BANK_INTERMEDIARY_1_NAME} (SWIFT: {BANK_INTERMEDIARY_1_SWIFT})",
            f"  Intermediary 2: {BANK_INTERMEDIARY_2_NAME} (SWIFT: {BANK_INTERMEDIARY_2_SWIFT})",
        ] + memo_block
    if method == "crypto":
        return [
            f"Method: {CRYPTO_ASSET} on {CRYPTO_NETWORK}",
            f"  Asset: {CRYPTO_ASSET}",
            f"  Network: {CRYPTO_NETWORK} — TRC-20 ONLY",
            f"  Wallet address: {CRYPTO_WALLET_ADDRESS}",
            f"  Beneficiary: {LEGAL_ENTITY_NAME}",
        ] + memo_block + [
            "  After the transfer, send the transaction hash via project chat.",
            "  WARNING: Only TRON network (TRC-20) transfers are supported. Assets sent via other networks may be lost.",
        ]
    return ["Method: (not selected)"]


def _attachments_html_block(project: dict) -> str:
    """Build an HTML block listing the project's attachments at the moment of rendering.
    Includes the initial submission (immutable) and all additional reference files,
    each with original filename + upload date/time in UTC."""
    rows = []

    # 1. Initial submission
    if project.get("script_file"):
        name = project.get("script_filename") or "(original filename not captured)"
        submitted_at = format_date_utc(project.get("created_at"))
        rows.append(
            f"<tr><td>Initial submission</td><td>{name}</td><td>{submitted_at} UTC</td><td>{project.get('user_name', 'Client')}</td></tr>"
        )

    # 2. Additional reference files — sorted by upload time ascending
    refs = sorted(project.get("reference_files") or [], key=lambda r: r.get("uploaded_at", ""))
    for r in refs:
        uploader = r.get("uploaded_by_name") or "Unknown"
        if r.get("uploaded_by_role") == "admin":
            uploader = "Ocean2Joy Team"
        rows.append(
            f"<tr><td>Reference file</td><td>{r.get('original_filename', '')}</td>"
            f"<td>{format_date_utc(r.get('uploaded_at'))} UTC</td><td>{uploader}</td></tr>"
        )

    if not rows:
        return "<p><em>No attachments.</em></p>"

    return (
        "<table class='attachments-table'>"
        "<colgroup>"
        "<col style='width:18%' />"
        "<col style='width:42%' />"
        "<col style='width:22%' />"
        "<col style='width:18%' />"
        "</colgroup>"
        "<thead><tr>"
        "<th>Type</th><th>File name</th><th>Uploaded (UTC)</th><th>Uploaded by</th>"
        "</tr></thead><tbody>"
        + "".join(rows)
        + "</tbody></table>"
    )


def _generate_document_html(doc_type: str, project: dict, doc_number: str) -> str:
    p = project
    name = p.get("user_name", "Client")
    email = p.get("user_email", "")
    pn = p.get("project_number", "")
    title = p.get("project_title", "")
    amount = format_currency(p.get("quote_amount", 0))
    date_created = format_date_utc(p.get("created_at"))
    attachments_block = _attachments_html_block(p)
    rendered_at = format_date_utc(datetime.now(timezone.utc).isoformat())
    payment_details_block = _payment_method_details_html(p)
    pm_code = (p.get("payment_method") or "paypal")
    payment_method_label = PAYMENT_METHODS.get(pm_code, {}).get("display", pm_code.upper())
    service_type_label = (p.get("service_type") or "").replace("_", " ").title()
    order_activated_at = format_date_utc(p.get("order_activated_at")) if p.get("order_activated_at") else date_created
    inv_dates = _invoice_dates(p)

    base_css = """
    <style>
        @page { size: A4; margin: 18mm 15mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; color: #1a1a2e; line-height: 1.6; }
        .header { border-bottom: 3px solid #0a1628; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 24px; color: #0a1628; margin: 0; }
        .header .brand { font-size: 14px; color: #666; }
        .doc-number { font-size: 12px; color: #888; float: right; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 16px; color: #0a1628; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; table-layout: fixed; }
        table th, table td {
          border: 1px solid #ddd; padding: 8px 10px; text-align: left;
          vertical-align: top; font-size: 12px;
          word-wrap: break-word; overflow-wrap: anywhere; word-break: break-word;
        }
        table th { background: #f5f5f5; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #0a1628; font-size: 11px; color: #666; }
        .signature-line { margin-top: 50px; border-top: 1px solid #333; width: 250px; padding-top: 5px; font-size: 12px; }
    </style>"""

    templates = {
        "invoice": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>INVOICE</h1>
            <div class="brand">{LEGAL_ENTITY_NAME}</div>
            <p style="font-size:11px;color:#666;margin:2px 0;">Tax ID: {TAX_ID} · Country of Registration: {COUNTRY_OF_REGISTRATION}</p>
            <p style="font-size:11px;color:#666;margin:2px 0 10px 0;">Custom Digital Video Services</p>
            </div>

            <div class="section"><table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Invoice</th><td><code>{doc_number}</code></td></tr>
            <tr><th>Date Issued</th><td>{inv_dates['issued']}</td></tr>
            <tr><th>Due Date</th><td>Upon Delivery of Digital Assets</td></tr>
            </table></div>

            <div class="section"><h2>Bill To</h2>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Client</th><td><strong>{name}</strong></td></tr>
            <tr><th>Email</th><td>{email}</td></tr>
            <tr><th>Project Reference</th><td><code>{pn}</code></td></tr>
            <tr><th>Project Title</th><td>{title}</td></tr>
            </table></div>

            <div class="section"><h2>Service Description</h2>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Service Type</th><td>{service_type_label}</td></tr>
            </table>
            <p style="font-weight:600;margin-top:14px;margin-bottom:6px;">Project Reference:</p>
            <div style="font-size: 12px; border: 1px solid #e5e7eb; padding: 12px; background: #fafafa; border-radius: 4px;">Customer film production according to client's script — {service_type_label} (Project {pn})</div>
            <p style="font-weight:600;margin-top:14px;margin-bottom:6px;">Estimated Production Period:</p>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Start</th><td>{inv_dates['start']}</td></tr>
            <tr><th>Delivery</th><td>{inv_dates['delivery']}</td></tr>
            </table>
            </div>

            <div class="section"><h2>Pricing</h2>
            <table><colgroup><col style='width:70%'/><col style='width:30%'/></colgroup>
            <thead><tr><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
            <tbody>
            <tr><td>Service Fee</td><td style="text-align:right;font-family:monospace;">{amount}</td></tr>
            </tbody>
            </table>
            <table style="margin-top:12px;"><colgroup><col style='width:70%'/><col style='width:30%'/></colgroup>
            <tr><td style="border:none;">Subtotal</td><td style="border:none;text-align:right;font-family:monospace;">{amount}</td></tr>
            <tr><td style="border:none;">Tax (Digital Services)</td><td style="border:none;text-align:right;font-family:monospace;">$0.00</td></tr>
            <tr style="border-top:2px solid #0a1628;"><td style="border:none;border-top:2px solid #0a1628;font-weight:700;padding-top:8px;">TOTAL AMOUNT DUE</td><td style="border:none;border-top:2px solid #0a1628;text-align:right;font-family:monospace;font-weight:700;padding-top:8px;">{amount}</td></tr>
            </table>
            </div>

            <div class="section"><h2>Payment Terms</h2>
            <ul style="padding-left:20px;font-size:12px;line-height:1.7;">
                <li>100% post-payment model — pay after delivery</li>
                <li>Invoice issued before production begins</li>
                <li>Payment due upon delivery of digital files</li>
                <li>Payment confirms acceptance of delivered work</li>
                <li>No refunds after delivery completion</li>
                <li>All deliverables provided electronically</li>
            </ul></div>

            <div class="section"><h2>Payment Method</h2>
            <p style="font-size:14px;font-weight:600;color:#0a1628;">{payment_method_label}</p>
            {payment_details_block}
            </div>

            <div class="section"><h2>Communication</h2>
            <p style="font-size:12px;">All project communication should be conducted through the secure client portal chat system.</p>
            <p style="font-size:11px;color:#666;">For urgent technical matters only: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a></p>
            </div>

            <div class="section"><h2>Notes</h2>
            <ul style="padding-left:20px;font-size:12px;line-height:1.7;">
                <li>This is a digital service — no physical goods shipped</li>
                <li>All files delivered via secure client portal</li>
                <li>By accepting this invoice, you agree to the terms above</li>
                <li>Production begins after invoice confirmation</li>
                <li>Delivery timeline confirmed after production start</li>
            </ul></div>

            <div class="section"><h2>Legal Framework & Terms</h2>
            <p style="font-size:12px;">This Invoice-Offer is governed by:</p>
            <ul style="padding-left:20px;font-size:12px;line-height:1.7;">
                <li>Terms of Service: <a href="https://ocean2joy.com/policies/terms">ocean2joy.com/policies/terms</a></li>
                <li>Service Agreement: <a href="https://ocean2joy.com/legal">ocean2joy.com/legal</a></li>
                <li>Refund Policy: <a href="https://ocean2joy.com/policies/refund">ocean2joy.com/policies/refund</a></li>
                <li>Privacy Policy: <a href="https://ocean2joy.com/policies/privacy">ocean2joy.com/policies/privacy</a></li>
            </ul>
            <p style="font-size:12px;margin-top:10px;font-weight:600;">By accepting this invoice in the client portal, Client confirms:</p>
            <ul style="padding-left:20px;font-size:12px;line-height:1.7;">
                <li>Reading and accepting all documents listed above</li>
                <li>Agreement with 100% post-payment terms</li>
                <li>Understanding that no refunds apply after delivery</li>
                <li>Acceptance that this is a digital service (no physical goods)</li>
            </ul>
            </div>

            <div class="section"><h2>Client Acceptance</h2>
            <p style="font-size:12px;">By accepting this invoice in the client portal, the Client confirms:</p>
            <ul style="padding-left:20px;font-size:12px;line-height:1.7;">
                <li>Agreement with all terms and pricing stated above</li>
                <li>Authorization to begin production</li>
                <li>Understanding of payment terms (due upon delivery)</li>
            </ul>
            <table style="margin-top:14px;"><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Client Name</th><td>{name}</td></tr>
            <tr><th>Email</th><td>{email}</td></tr>
            <tr><th>Acceptance Date</th><td>{format_date_utc(p.get('invoice_signed_at')) + ' UTC' if p.get('invoice_signed_at') else '(pending)'}</td></tr>
            </table>
            <p style="font-size:11px;color:#666;margin-top:10px;font-style:italic;">Acceptance is recorded electronically in the client portal.</p>
            </div>

            <div class="footer">
            <p style="font-style:italic;text-align:center;margin-bottom:12px;">Thank you for choosing {BRAND_NAME}! Professional digital video production services.</p>
            <p><strong>Legal Entity:</strong> {LEGAL_ENTITY_NAME} · Tax ID: {TAX_ID} · {COUNTRY_OF_REGISTRATION}</p>
            <p><strong>Brand:</strong> {BRAND_NAME}</p>
            <p>Contact: {CONTACT_EMAIL} · {CONTACT_PHONE} · {LOCATION}</p>
            </div>
            </body></html>""",

        "certificate_completion": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>CERTIFICATE OF COMPLETION</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>This certifies that the project <strong>{pn}</strong> — "{title}" — has been completed in full.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Email</th><td>{email}</td></tr><tr><th>Amount</th><td>{amount}</td></tr></table></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "certificate_delivery": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>CERTIFICATE OF DELIVERY</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>This certifies that deliverables for project <strong>{pn}</strong> have been delivered to the client.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Project</th><td>{title}</td></tr><tr><th>Date</th><td>{date_created}</td></tr></table></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "acceptance_act": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>ACCEPTANCE ACT</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>The client hereby confirms acceptance of work performed under project <strong>{pn}</strong>.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Project</th><td>{title}</td></tr><tr><th>Amount</th><td>{amount}</td></tr></table></div>
            <div class="signature-line">Client Signature</div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "payment_confirmation": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>PAYMENT CONFIRMATION</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>Payment for project <strong>{pn}</strong> has been received and confirmed.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Amount</th><td>{amount}</td></tr><tr><th>Project</th><td>{title}</td></tr></table></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "order_confirmation": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>ORDER CONFIRMATION</h1><div class="brand">{BRAND_NAME}</div><p style='font-size:12px;color:#666;margin-top:4px;'>Order Activation Confirmation</p></div>

            <div class="section"><table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Order</th><td><code>{doc_number}</code></td></tr>
            <tr><th>Project Reference</th><td><code>{pn}</code></td></tr>
            <tr><th>Date Activated</th><td>{order_activated_at} UTC</td></tr>
            </table></div>

            <div class="section"><h2>Client Information</h2>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Name</th><td>{name}</td></tr>
            <tr><th>Email</th><td>{email}</td></tr>
            <tr><th>Project Title</th><td>{title}</td></tr>
            </table></div>

            <div class="section"><h2>Order Details</h2>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Service Type</th><td>{service_type_label}</td></tr>
            </table>
            <p style="font-weight:600;margin-top:14px;margin-bottom:6px;">Project Brief:</p>
            <div style="white-space: pre-wrap; font-size: 12px; border: 1px solid #e5e7eb; padding: 12px; background: #fafafa; border-radius: 4px;">{p.get('brief','')}</div>
            </div>

            <div class="section"><h2>Uploaded Materials</h2>
            <p style="font-size:11px;color:#888;margin-top:-8px;">Snapshot generated at {rendered_at} UTC.</p>
            {attachments_block}</div>

            <div class="section"><h2>Payment Method Selected</h2>
            <p style="font-size:14px;font-weight:600;color:#0a1628;">{payment_method_label}</p>
            <p style="font-size:11px;color:#666;margin-top:4px;">Full payment details will be provided in the invoice once the quote is issued.</p>
            </div>

            <div class="section" style="background:#f0fdf4;border:1px solid #86efac;padding:12px;border-radius:4px;">
            <p style="margin:0;font-weight:600;color:#15803d;">✓ ORDER STATUS: ACTIVATED</p>
            <p style="margin:4px 0 0 0;font-size:12px;color:#166534;">Your order has been activated and sent to our production team for review.</p>
            </div>

            <div class="section"><h2>Next Steps</h2>
            <ol style="padding-left:20px;font-size:12px;line-height:1.7;">
                <li>Manager will review your order and materials</li>
                <li>You will receive an Invoice with quote and timeline</li>
                <li>After Invoice confirmation, production will begin</li>
                <li>You will receive updates during production</li>
                <li>Final deliverables will be available in your portal</li>
            </ol></div>

            <div class="section"><h2>Estimated Timeline</h2>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Review</th><td>1–2 business days</td></tr>
            <tr><th>Quote / Invoice</th><td>Will be sent after review</td></tr>
            <tr><th>Production</th><td>Timeline specified in Invoice</td></tr>
            <tr><th>Delivery</th><td>Via secure electronic portal</td></tr>
            </table></div>

            <div class="section" style="font-size:11px;color:#666;">
            <p>All communication takes place through the secure client portal chat. Email is used only for urgent matters: <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.</p>
            <p style="margin-top:8px;">Order Reference: <strong><code>{pn}</code></strong> — please keep this number for all future correspondence.</p>
            <p style="margin-top:8px;font-style:italic;">Thank you for choosing {BRAND_NAME}!</p>
            </div>

            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "quote_request": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>QUOTE REQUEST</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>Quote request received from <strong>{name}</strong> for project <strong>{pn}</strong>.</p>
            <table><colgroup><col style='width:22%' /><col style='width:78%' /></colgroup>
            <tr><th>Client</th><td>{name}</td></tr>
            <tr><th>Email</th><td>{email}</td></tr>
            <tr><th>Submitted</th><td>{date_created} UTC</td></tr>
            </table></div>
            <div class="section"><h2>Brief</h2>
            <div style="white-space: pre-wrap; font-size: 12px; border: 1px solid #e5e7eb; padding: 12px; background: #fafafa; border-radius: 4px;">{p.get('brief','')}</div>
            </div>
            <div class="section"><h2>Attachments</h2>
            <p style="font-size:11px;color:#888;margin-top:-8px;">Snapshot generated at {rendered_at} UTC. The initial submission is immutable; additional reference files are append-only.</p>
            {attachments_block}</div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "production_notes": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>PRODUCTION NOTES</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>Production notes for project <strong>{pn}</strong>.</p>
            <table><tr><th>Project</th><td>{title}</td></tr><tr><th>Client</th><td>{name}</td></tr></table>
            <p><strong>Notes:</strong><br>{p.get('production_notes','No notes yet.')}</p></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "payment_instructions": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>PAYMENT INSTRUCTIONS</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><h2>Summary</h2>
            <table><colgroup><col style='width:30%'/><col style='width:70%'/></colgroup>
            <tr><th>Project</th><td>{pn}</td></tr>
            <tr><th>Title</th><td>{title}</td></tr>
            <tr><th>Amount Due</th><td><strong>{amount}</strong></td></tr>
            </table></div>
            <div class="section"><h2>How to Pay</h2>{payment_details_block}</div>
            <div class="section"><p style='font-size:11px;color:#666;'>After sending the payment, please mark it as sent in your project portal. Include the transaction ID/reference where applicable. Contact us at {CONTACT_EMAIL} for any questions.</p></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "download_confirmation": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>DOWNLOAD CONFIRMATION</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>Files for project <strong>{pn}</strong> have been accessed/downloaded by the client.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Project</th><td>{title}</td></tr></table></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",

        "receipt": f"""<html><head>{base_css}</head><body>
            <div class="header"><span class="doc-number">{doc_number}</span><h1>RECEIPT</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>Receipt for payment on project <strong>{pn}</strong>.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Amount</th><td>{amount}</td></tr><tr><th>Project</th><td>{title}</td></tr><tr><th>Date</th><td>{date_created}</td></tr></table></div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
            </body></html>""",
    }
    return templates.get(doc_type, f"<html><body><h1>{doc_type}</h1><p>Document not found</p></body></html>")


def _attachments_txt_block(project: dict) -> list[str]:
    lines = ["", "-" * 60, "ATTACHMENTS (snapshot at download time)"]
    any_row = False
    if project.get("script_file"):
        name = project.get("script_filename") or "(original filename not captured)"
        lines.append(
            f"  [Initial submission · immutable] {name}  —  "
            f"{format_date_utc(project.get('created_at'))} UTC  —  by {project.get('user_name', 'Client')}"
        )
        any_row = True
    refs = sorted(project.get("reference_files") or [], key=lambda r: r.get("uploaded_at", ""))
    for r in refs:
        uploader = "Ocean2Joy Team" if r.get("uploaded_by_role") == "admin" else (r.get("uploaded_by_name") or "Unknown")
        lines.append(
            f"  [Reference file] {r.get('original_filename', '')}  —  "
            f"{format_date_utc(r.get('uploaded_at'))} UTC  —  by {uploader}"
        )
        any_row = True
    if not any_row:
        lines.append("  (none)")
    return lines


def _generate_document_txt(doc_type: str, project: dict, doc_number: str) -> str:
    p = project
    name = p.get("user_name", "Client")
    email = p.get("user_email", "")
    pn = p.get("project_number", "")
    title = p.get("project_title", "")
    amount = format_currency(p.get("quote_amount", 0))
    date_created = format_date_utc(p.get("created_at"))
    display = DOCUMENT_TYPES.get(doc_type, {}).get("display_name", doc_type.upper())

    # Special rich template for order_confirmation
    if doc_type == "order_confirmation":
        pm_code = (p.get("payment_method") or "paypal")
        pm_label = PAYMENT_METHODS.get(pm_code, {}).get("display", pm_code.upper()).upper()
        service_type_label = (p.get("service_type") or "").replace("_", " ").title()
        order_activated_at = format_date_utc(p.get("order_activated_at")) if p.get("order_activated_at") else date_created

        sep = "═" * 60
        lines = [
            display.upper(),
            sep,
            "",
            BRAND_NAME,
            "Order Activation Confirmation",
            "",
            f"Order: {doc_number}",
            f"Project Reference: {pn}",
            f"Date Activated: {order_activated_at} UTC",
            "",
            sep,
            "",
            "CLIENT INFORMATION:",
            f"Name: {name}",
            f"Email: {email}",
            f"Project Title: {title}",
            "",
            sep,
            "",
            "ORDER DETAILS:",
            "",
            f"Service Type: {service_type_label}",
            "",
            "Project Brief:",
            p.get("brief", "").strip() or "(not provided)",
            "",
            sep,
            "",
            "UPLOADED MATERIALS:",
            "",
        ]
        materials_rows = []
        if p.get("script_file"):
            fname = p.get("script_filename") or "(original filename not captured)"
            materials_rows.append(f"✓ {fname} (initial submission · uploaded by {name})")
        refs = sorted(p.get("reference_files") or [], key=lambda r: r.get("uploaded_at", ""))
        for r in refs:
            uploader = "Ocean2Joy Team" if r.get("uploaded_by_role") == "admin" else (r.get("uploaded_by_name") or "Unknown")
            materials_rows.append(f"✓ {r.get('original_filename', '')} (reference file · uploaded by {uploader})")
        if not materials_rows:
            materials_rows.append("(no materials uploaded yet)")
        lines.extend(materials_rows)
        lines.extend([
            "",
            sep,
            "",
            "PAYMENT METHOD SELECTED:",
            pm_label,
            "",
            sep,
            "",
            "ORDER STATUS: ✓ ACTIVATED",
            "",
            "Your order has been activated and sent to our production",
            "team for review.",
            "",
            sep,
            "",
            "NEXT STEPS:",
            "",
            "1. Manager will review your order and materials",
            "2. You will receive an Invoice with quote and timeline",
            "3. After Invoice confirmation, production will begin",
            "4. You will receive updates during production",
            "5. Final deliverables will be available in your portal",
            "",
            sep,
            "",
            "ESTIMATED TIMELINE:",
            "Review: 1-2 business days",
            "Quote/Invoice: Will be sent after review",
            "Production: Timeline specified in Invoice",
            "Delivery: Via secure electronic portal",
            "",
            sep,
            "",
            "All communication through secure client portal chat.",
            f"For urgent matters only: {CONTACT_EMAIL}",
            "",
            sep,
            "",
            f"Thank you for choosing {BRAND_NAME.split(' Digital')[0]}!",
            "",
            f"Order Reference: {pn}",
            "Keep this number for all future correspondence.",
            "",
            sep,
        ]
        )
        return "\n".join(lines)

    # Special rich template for invoice (matches Marcos's format)
    if doc_type == "invoice":
        sep = "═" * 60
        inv_dates = _invoice_dates(p)
        service_type_label = (p.get("service_type") or "").replace("_", " ").title()
        pm_code = (p.get("payment_method") or "paypal")
        pm_label = PAYMENT_METHODS.get(pm_code, {}).get("display", pm_code.upper()).upper()
        pm_txt_lines = _payment_method_details_txt(p)
        acceptance_date = (format_date_utc(p.get("invoice_signed_at")) + " UTC") if p.get("invoice_signed_at") else ""
        tax_str = "$0.00"

        lines = [
            "INVOICE",
            sep,
            "",
            LEGAL_ENTITY_NAME,
            f"Tax ID: {TAX_ID}",
            f"Country of Registration: {COUNTRY_OF_REGISTRATION}",
            "",
            "Custom Digital Video Services",
            "",
            f"Invoice: {doc_number}",
            f"Date Issued: {inv_dates['issued']}",
            "Due Date: Upon Delivery of Digital Assets",
            "",
            sep,
            "",
            "BILL TO:",
            name,
            f"Email: {email}",
            f"Project Reference: {pn}",
            f"Project Title: {title}",
            "",
            sep,
            "",
            "SERVICE DESCRIPTION:",
            "",
            f"Service Type: {service_type_label}",
            "",
            "Project Reference:",
            f"Customer film production according to client's script — {service_type_label} (Project {pn})",
            "",
            "Estimated Production Period:",
            f"Start: {inv_dates['start']}",
            f"Delivery: {inv_dates['delivery']}",
            "",
            sep,
            "",
            "PRICING:",
            "",
            f"Service Fee                           {amount}",
            "",
            sep,
            "",
            f"SUBTOTAL:                             {amount}",
            f"Tax (Digital Services):                          {tax_str}",
            "                                      ────────────────",
            f"TOTAL AMOUNT DUE:                     {amount}",
            "",
            sep,
            "",
            "PAYMENT TERMS:",
            "",
            "✓ 100% post-payment model (pay after delivery)",
            "✓ Invoice issued before production begins",
            "✓ Payment due upon delivery of digital files",
            "✓ Payment confirms acceptance of delivered work",
            "✓ No refunds after delivery completion",
            "✓ All deliverables provided electronically",
            "",
            sep,
            "",
            "PAYMENT METHOD:",
            "",
            pm_label,
            "",
        ]
        lines.extend(pm_txt_lines[1:])  # drop the first "Method: ..." line (already shown as PAYMENT METHOD)
        lines.extend([
            "",
            sep,
            "",
            "COMMUNICATION:",
            "",
            "All project communication should be conducted through",
            "the secure client portal chat system.",
            "",
            "For urgent technical matters only:",
            CONTACT_EMAIL,
            "",
            sep,
            "",
            "NOTES:",
            "",
            "• This is a digital service — no physical goods shipped",
            "• All files delivered via secure client portal",
            "• By accepting this invoice, you agree to the terms above",
            "• Production begins after invoice confirmation",
            "• Delivery timeline confirmed after production start",
            "",
            sep,
            "",
            "LEGAL FRAMEWORK & TERMS:",
            "",
            "This Invoice-Offer is governed by:",
            "",
            "• Terms of Service: ocean2joy.com/policies/terms",
            "• Service Agreement: ocean2joy.com/legal",
            "• Refund Policy: ocean2joy.com/policies/refund",
            "• Privacy Policy: ocean2joy.com/policies/privacy",
            "",
            "By accepting this invoice in the client portal, Client confirms:",
            "✓ Reading and accepting all documents listed above",
            "✓ Agreement with 100% post-payment terms",
            "✓ Understanding that no refunds apply after delivery",
            "✓ Acceptance that this is a digital service (no physical goods)",
            "",
            "Full legal documentation: ocean2joy.com/legal",
            "",
            sep,
            "",
            "CLIENT ACCEPTANCE:",
            "",
            "By accepting this invoice in the client portal, the Client confirms:",
            "✓ Agreement with all terms and pricing stated above",
            "✓ Authorization to begin production",
            "✓ Understanding of payment terms (due upon delivery)",
            "",
            f"Client Name: {name}",
            f"Email: {email}",
            f"Acceptance Date: {acceptance_date or '(pending)'}",
            "",
            "Acceptance is recorded electronically in the client portal.",
            "",
            sep,
            "",
            f"Thank you for choosing {BRAND_NAME.split(' Digital')[0]}!",
            "Professional digital video production services.",
            "",
            sep,
            "",
            f"Legal Entity: {LEGAL_ENTITY_NAME}",
            f"Tax ID: {TAX_ID} | {COUNTRY_OF_REGISTRATION}",
            f"Brand: {BRAND_NAME}",
            "",
            f"Contact: {CONTACT_EMAIL} | {CONTACT_PHONE}",
            LOCATION,
            "",
            sep,
        ])
        return "\n".join(lines)

    lines = [
        f"{'='*60}",
        f"{BRAND_NAME}",
        f"{display}",
        f"Document #: {doc_number}",
        f"{'='*60}",
        "",
        f"Client: {name}",
        f"Email: {email}",
        f"Project: {pn}",
        f"Title: {title}",
        f"Amount: {amount}",
        f"Date: {date_created}",
    ]

    if doc_type == "quote_request":
        brief_text = p.get("brief", "").strip()
        if brief_text:
            lines.extend(["", "-" * 60, "BRIEF", "", brief_text])
        lines.extend(_attachments_txt_block(p))

    if doc_type == "payment_instructions":
        lines.extend(["", "-" * 60, "PAYMENT DETAILS"])
        lines.extend(_payment_method_details_txt(p))

    lines.extend([
        "",
        f"{'-'*60}",
        "",
        f"{LEGAL_ENTITY_NAME}",
        f"Tax ID: {TAX_ID}",
        f"Country: {COUNTRY_OF_REGISTRATION}",
        f"Contact: {CONTACT_EMAIL} | {CONTACT_PHONE}",
        f"Location: {LOCATION}",
        f"{'='*60}",
    ])
    return "\n".join(lines)


@router.get("/{doc_type}/html")
async def get_document_html(project_id: str, doc_type: str, request: Request):
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {doc_type}")
    db, project = await _get_project_and_validate(project_id, request)
    doc_number = await get_or_generate_document_number(db, project, doc_type)
    html = _generate_document_html(doc_type, project, doc_number)
    return HTMLResponse(content=html)


@router.get("/{doc_type}/txt")
async def get_document_txt(project_id: str, doc_type: str, request: Request):
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {doc_type}")
    db, project = await _get_project_and_validate(project_id, request)
    doc_number = await get_or_generate_document_number(db, project, doc_type)
    txt = _generate_document_txt(doc_type, project, doc_number)
    return PlainTextResponse(content=txt)


@router.get("/{doc_type}/pdf")
async def get_document_pdf(project_id: str, doc_type: str, request: Request):
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {doc_type}")
    db, project = await _get_project_and_validate(project_id, request)
    doc_number = await get_or_generate_document_number(db, project, doc_type)
    html = _generate_document_html(doc_type, project, doc_number)

    from weasyprint import HTML
    from fastapi.responses import Response as FastAPIResponse
    import io

    pdf_bytes = HTML(string=html).write_pdf()
    display_name = DOCUMENT_TYPES[doc_type]["display_name"].replace(" ", "_")
    filename = f"{display_name}_{doc_number}.pdf"

    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("")
async def list_documents(project_id: str, request: Request):
    db, project = await _get_project_and_validate(project_id, request)
    docs = []
    for doc_type, info in DOCUMENT_TYPES.items():
        stage = _get_doc_stage(doc_type)
        available = False
        if stage and project.get(stage["timestamp_field"]):
            available = True
        docs.append({
            "type": doc_type,
            "code": info["code"],
            "display_name": info["display_name"],
            "requires_signature": info["requires_signature"],
            "available": available,
            "document_number": project.get("document_numbers", {}).get(doc_type),
        })
    return docs
