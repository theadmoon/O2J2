from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse
from database.connection import get_db
from utils.security import get_current_user
from utils.constants import DOCUMENT_TYPES, OPERATIONAL_CHAIN_STAGES
from utils.constants import (
    LEGAL_ENTITY_NAME, TAX_ID, COUNTRY_OF_REGISTRATION,
    BRAND_NAME, CONTACT_EMAIL, CONTACT_PHONE, LOCATION,
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
            <div class="header"><span class="doc-number">{doc_number}</span><h1>INVOICE</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><h2>Bill To</h2><p><strong>{name}</strong><br>{email}</p></div>
            <div class="section"><h2>Project Details</h2>
            <table><tr><th>Project</th><td>{pn}</td></tr><tr><th>Title</th><td>{title}</td></tr><tr><th>Date</th><td>{date_created}</td></tr></table></div>
            <div class="section"><h2>Amount Due</h2><table><tr><th>Service</th><th>Amount</th></tr><tr><td>{title}</td><td><strong>{amount}</strong></td></tr></table></div>
            <div class="section"><h2>Payment Information</h2><p>Please remit payment to:<br>{LEGAL_ENTITY_NAME}<br>Tax ID: {TAX_ID}<br>{COUNTRY_OF_REGISTRATION}</p></div>
            <div class="signature-line">Authorized Signature</div>
            <div class="footer"><p>{LEGAL_ENTITY_NAME} | Tax ID: {TAX_ID} | {LOCATION}</p><p>{CONTACT_EMAIL} | {CONTACT_PHONE}</p></div>
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
            <div class="header"><span class="doc-number">{doc_number}</span><h1>ORDER CONFIRMATION</h1><div class="brand">{BRAND_NAME}</div></div>
            <div class="section"><p>Your order for project <strong>{pn}</strong> has been confirmed.</p>
            <table><tr><th>Client</th><td>{name}</td></tr><tr><th>Service</th><td>{title}</td></tr><tr><th>Date</th><td>{date_created}</td></tr></table></div>
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
            <div class="section"><h2>Payment Details</h2><p>Amount: <strong>{amount}</strong></p><p>Project: {pn}</p>
            <h2>How to Pay</h2><p>Transfer to:<br>{LEGAL_ENTITY_NAME}<br>Tax ID: {TAX_ID}<br>{COUNTRY_OF_REGISTRATION}</p>
            <p>Contact: {CONTACT_EMAIL}</p></div>
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

    lines = [
        f"{'='*60}",
        f"{BRAND_NAME}",
        f"{display}",
        f"Document #: {doc_number}",
        f"{'='*60}",
        f"",
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

    lines.extend([
        f"",
        f"{'-'*60}",
        f"",
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
