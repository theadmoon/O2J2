"""
Role-specific stage action endpoints for the 12-stage Operational Chain.
All timestamps are set to datetime.now(timezone.utc) — no hardcoded dates.
Each endpoint validates:
  - User role (admin vs client-owner)
  - Previous stage has been completed (enforced via timestamp presence)
"""
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from database.connection import get_db
from utils.security import get_current_user
from services.project_service import calculate_current_status, build_timeline
from services.document_service import get_or_generate_document_number
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import aiofiles

router = APIRouter(prefix="/api/projects", tags=["project-actions"])

DELIVERABLES_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "uploads",
    "deliverables",
)


# ---------- helpers ----------

async def _get_project_for_admin(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db, user, project


async def _get_project_for_client(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return db, user, project


def _require_stage(project: dict, field: str, stage_name: str):
    if not project.get(field):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot proceed: stage '{stage_name}' has not been completed yet",
        )


def _require_not_set(project: dict, field: str, action: str):
    if project.get(field):
        raise HTTPException(
            status_code=400,
            detail=f"Action '{action}' already performed at {project[field]}",
        )


async def _set_timestamp_and_return(
    db, project_id: str, updates: dict
):
    updates = {**updates}
    await db.projects.update_one({"id": project_id}, {"$set": updates})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    updated["status"] = calculate_current_status(updated)
    updated["timeline"] = build_timeline(updated)
    return updated


# =================================================================
# ADMIN ACTIONS
# =================================================================

class ActivateOrderBody(BaseModel):
    quote_amount: float
    quote_details: str = ""
    quote_request_manager_comments: str = ""
    project_title: Optional[str] = None
    estimated_start_date: Optional[str] = None      # ISO date YYYY-MM-DD
    estimated_delivery_date: Optional[str] = None   # ISO date YYYY-MM-DD


@router.post("/{project_id}/admin/activate-order")
async def admin_activate_order(project_id: str, body: ActivateOrderBody, request: Request):
    """Stage 1 → 2. Admin reviews, enters quote amount, activates the order."""
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_not_set(project, "order_activated_at", "activate-order")
    if body.quote_amount <= 0:
        raise HTTPException(status_code=400, detail="quote_amount must be > 0")

    import logging
    logging.info(f"[activate-order] project={project_id} quote_amount={body.quote_amount!r} (type={type(body.quote_amount).__name__})")

    updates = {
        "quote_amount": body.quote_amount,
        "quote_details": body.quote_details,
        "quote_request_manager_comments": body.quote_request_manager_comments,
        "order_activated_at": datetime.now(timezone.utc).isoformat(),
    }
    if body.project_title:
        updates["project_title"] = body.project_title
    if body.estimated_start_date:
        updates["estimated_start_date"] = body.estimated_start_date
    if body.estimated_delivery_date:
        updates["estimated_delivery_date"] = body.estimated_delivery_date

    updated = await _set_timestamp_and_return(db, project_id, updates)
    # Pre-generate Order Confirmation doc number
    await get_or_generate_document_number(db, updated, "order_confirmation")
    return await _set_timestamp_and_return(db, project_id, {})


@router.post("/{project_id}/admin/send-invoice")
async def admin_send_invoice(project_id: str, request: Request):
    """Stage 2 → 3. Admin sends invoice to client."""
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_stage(project, "order_activated_at", "order_activated")
    _require_not_set(project, "invoice_sent_at", "send-invoice")

    updated = await _set_timestamp_and_return(
        db, project_id,
        {"invoice_sent_at": datetime.now(timezone.utc).isoformat()},
    )
    await get_or_generate_document_number(db, updated, "invoice")
    return await _set_timestamp_and_return(db, project_id, {})


class StartProductionBody(BaseModel):
    production_notes: str = ""


@router.post("/{project_id}/admin/start-production")
async def admin_start_production(project_id: str, body: StartProductionBody, request: Request):
    """Stage 4 → 5. Admin starts production after client has signed invoice."""
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_stage(project, "invoice_signed_at", "invoice_signed")
    _require_not_set(project, "production_started_at", "start-production")

    updated = await _set_timestamp_and_return(
        db, project_id,
        {
            "production_started_at": datetime.now(timezone.utc).isoformat(),
            "production_notes": body.production_notes,
        },
    )
    await get_or_generate_document_number(db, updated, "production_notes")
    return await _set_timestamp_and_return(db, project_id, {})


@router.post("/{project_id}/admin/mark-delivered")
async def admin_mark_delivered(project_id: str, request: Request):
    """Stage 5 → 6. Admin marks work as delivered (requires at least one deliverable uploaded)."""
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_stage(project, "production_started_at", "production_started")
    _require_not_set(project, "delivered_at", "mark-delivered")
    if not project.get("deliverables"):
        raise HTTPException(
            status_code=400,
            detail="Cannot mark delivered: upload at least one deliverable file first",
        )

    updated = await _set_timestamp_and_return(
        db, project_id,
        {"delivered_at": datetime.now(timezone.utc).isoformat()},
    )
    await get_or_generate_document_number(db, updated, "download_confirmation")
    return await _set_timestamp_and_return(db, project_id, {})


class ConfirmPaymentBody(BaseModel):
    paypal_transaction_id: Optional[str] = None


@router.post("/{project_id}/admin/confirm-payment")
async def admin_confirm_payment(project_id: str, body: ConfirmPaymentBody, request: Request):
    """Stage 10 → 11. Admin confirms payment was received."""
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_stage(project, "payment_marked_by_client_at", "payment_sent")
    _require_not_set(project, "payment_confirmed_by_manager_at", "confirm-payment")

    updates = {
        "payment_confirmed_by_manager_at": datetime.now(timezone.utc).isoformat(),
        "payment_confirmed_by_admin": True,
    }
    if body.paypal_transaction_id:
        updates["paypal_transaction_id"] = body.paypal_transaction_id

    updated = await _set_timestamp_and_return(db, project_id, updates)
    await get_or_generate_document_number(db, updated, "payment_confirmation")
    return await _set_timestamp_and_return(db, project_id, {})


@router.post("/{project_id}/admin/complete")
async def admin_complete(project_id: str, request: Request):
    """Stage 11 → 12. Admin finalizes the project."""
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_stage(project, "payment_confirmed_by_manager_at", "payment_received")
    _require_not_set(project, "completed_at", "complete")

    updated = await _set_timestamp_and_return(
        db, project_id,
        {"completed_at": datetime.now(timezone.utc).isoformat()},
    )
    await get_or_generate_document_number(db, updated, "certificate_completion")
    return await _set_timestamp_and_return(db, project_id, {})


# =================================================================
# CLIENT ACTIONS
# =================================================================

@router.post("/{project_id}/client/sign-invoice")
async def client_sign_invoice(
    project_id: str,
    request: Request,
    file: UploadFile = File(...),
):
    """Stage 3 → 4. Client uploads the signed invoice scan and accepts terms."""
    db, user, project = await _get_project_for_client(project_id, request)
    _require_stage(project, "invoice_sent_at", "invoice_sent")
    _require_not_set(project, "invoice_signed_at", "sign-invoice")

    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Signed invoice file is required")

    # Accept PDF, PNG, JPG
    allowed_ext = {".pdf", ".png", ".jpg", ".jpeg"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed. Use PDF, PNG or JPG.")

    signed_root = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "uploads",
        "signed_invoices",
    )
    os.makedirs(signed_root, exist_ok=True)
    project_dir = os.path.join(signed_root, project_id)
    os.makedirs(project_dir, exist_ok=True)

    stored_name = f"signed_invoice{ext}"
    file_path = os.path.join(project_dir, stored_name)

    size = 0
    async with aiofiles.open(file_path, "wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            await out.write(chunk)

    return await _set_timestamp_and_return(
        db, project_id,
        {
            "invoice_signed_at": datetime.now(timezone.utc).isoformat(),
            "signed_invoice_file": os.path.join("uploads", "signed_invoices", project_id, stored_name),
            "signed_invoice_filename": file.filename,
            "signed_invoice_size": size,
        },
    )


@router.get("/{project_id}/signed-invoice")
async def download_signed_invoice(project_id: str, request: Request):
    """Owner client or admin downloads the signed invoice uploaded by the client."""
    db, _, project = await _get_project_for_client(project_id, request)
    rel = project.get("signed_invoice_file")
    if not rel:
        raise HTTPException(status_code=404, detail="No signed invoice uploaded yet")
    abs_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        rel,
    )
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="Signed invoice file not found on disk")
    download_name = project.get("signed_invoice_filename") or os.path.basename(abs_path)
    return FileResponse(abs_path, filename=download_name)


@router.post("/{project_id}/client/confirm-delivery")
async def client_confirm_delivery(project_id: str, request: Request):
    """Stage 7 → 8. Client confirms the deliverables are correct."""
    db, user, project = await _get_project_for_client(project_id, request)
    _require_stage(project, "files_accessed_at", "files_accessed")
    _require_not_set(project, "delivery_confirmed_at", "confirm-delivery")

    return await _set_timestamp_and_return(
        db, project_id,
        {"delivery_confirmed_at": datetime.now(timezone.utc).isoformat()},
    )


@router.post("/{project_id}/client/accept-work")
async def client_accept_work(project_id: str, request: Request):
    """Stage 8 → 9. Client signs the acceptance act."""
    db, user, project = await _get_project_for_client(project_id, request)
    _require_stage(project, "delivery_confirmed_at", "delivery_confirmed")
    _require_not_set(project, "work_accepted_at", "accept-work")

    updates = {
        "work_accepted_at": datetime.now(timezone.utc).isoformat(),
        "acceptance_status": "accepted",
    }
    updated = await _set_timestamp_and_return(db, project_id, updates)
    await get_or_generate_document_number(db, updated, "acceptance_act")
    return await _set_timestamp_and_return(db, project_id, {})


class MarkPaymentSentBody(BaseModel):
    paypal_transaction_id: Optional[str] = None


@router.post("/{project_id}/client/mark-payment-sent")
async def client_mark_payment_sent(project_id: str, body: MarkPaymentSentBody, request: Request):
    """Stage 9 → 10. Client marks that they have sent payment (via PayPal or bank transfer)."""
    db, user, project = await _get_project_for_client(project_id, request)
    _require_stage(project, "work_accepted_at", "work_accepted")
    _require_not_set(project, "payment_marked_by_client_at", "mark-payment-sent")

    updates = {"payment_marked_by_client_at": datetime.now(timezone.utc).isoformat()}
    if body.paypal_transaction_id:
        updates["paypal_transaction_id"] = body.paypal_transaction_id

    updated = await _set_timestamp_and_return(db, project_id, updates)
    await get_or_generate_document_number(db, updated, "payment_instructions")
    await get_or_generate_document_number(db, updated, "receipt")
    return await _set_timestamp_and_return(db, project_id, {})


# =================================================================
# DELIVERABLES — upload (admin) + download (client, auto-sets stage 7)
# =================================================================

@router.post("/{project_id}/deliverables")
async def add_deliverable(
    project_id: str,
    request: Request,
):
    """Admin adds a cloud-hosted deliverable (filename + URL).
    Materials are hosted in the cloud (Google Drive, Dropbox, WeTransfer, etc.);
    the platform stores only the filename + link visible to the client.
    Must be after 'production_started'.
    """
    db, _, project = await _get_project_for_admin(project_id, request)
    _require_stage(project, "production_started_at", "production_started")

    body = await request.json()
    filename = (body.get("filename") or "").strip()
    cloud_url = (body.get("cloud_url") or "").strip()
    description = (body.get("description") or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="filename is required")
    if not cloud_url:
        raise HTTPException(status_code=400, detail="cloud_url is required")
    if not (cloud_url.startswith("http://") or cloud_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="cloud_url must start with http:// or https://")

    deliverable = {
        "id": str(uuid.uuid4()),
        "original_filename": filename,
        "cloud_url": cloud_url,
        "description": description,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"deliverables": deliverable}},
    )
    return deliverable


@router.post("/{project_id}/deliverables/{file_id}/access")
async def record_deliverable_access(project_id: str, file_id: str, request: Request):
    """Client-side beacon: record that the client opened the cloud link.
    First access (after 'delivered') auto-advances stage 7 (files_accessed)."""
    db, user, project = await _get_project_for_client(project_id, request)

    deliverable = next(
        (d for d in project.get("deliverables", []) if d["id"] == file_id),
        None,
    )
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    now_iso = datetime.now(timezone.utc).isoformat()

    # Record per-deliverable access timestamp (first access wins)
    if not deliverable.get("first_accessed_at"):
        await db.projects.update_one(
            {"id": project_id, "deliverables.id": file_id},
            {"$set": {
                "deliverables.$.first_accessed_at": now_iso,
                "deliverables.$.first_accessed_by": user.get("id"),
            }},
        )

    # Auto-advance stage 7 (files_accessed) on first client access after delivery
    if (
        user["role"] != "admin"
        and project.get("delivered_at")
        and not project.get("files_accessed_at")
    ):
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"files_accessed_at": now_iso}},
        )
        fresh = await db.projects.find_one({"id": project_id}, {"_id": 0})
        await get_or_generate_document_number(db, fresh, "certificate_delivery")

    return await _set_timestamp_and_return(db, project_id, {})



@router.delete("/{project_id}/deliverables/{file_id}")
async def delete_deliverable(project_id: str, file_id: str, request: Request):
    """Admin-only: remove a deliverable before 'delivered'."""
    db, _, project = await _get_project_for_admin(project_id, request)
    if project.get("delivered_at"):
        raise HTTPException(status_code=400, detail="Cannot remove deliverable after delivery")

    deliverable = next(
        (d for d in project.get("deliverables", []) if d["id"] == file_id),
        None,
    )
    if not deliverable:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    await db.projects.update_one(
        {"id": project_id},
        {"$pull": {"deliverables": {"id": file_id}}},
    )
    return {"ok": True}
