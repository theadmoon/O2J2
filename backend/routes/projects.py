from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from database.connection import get_db
from utils.security import get_current_user
from services.project_service import (
    generate_project_number, calculate_current_status, build_timeline,
)
from utils.constants import OPERATIONAL_CHAIN_STAGES
from datetime import datetime, timezone
import uuid
import os
import aiofiles

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("")
async def list_projects(request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    query = {} if user["role"] == "admin" else {"user_id": user["id"]}
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for p in projects:
        p["status"] = calculate_current_status(p)
    return projects


@router.post("")
async def create_project(
    request: Request,
    service_type: str = Form(...),
    brief: str = Form(...),
    project_title: str = Form(""),
    payment_method: str = Form(...),
    script: UploadFile = File(None),
):
    db = get_db()
    user = await get_current_user(request, db)

    from utils.constants import PAYMENT_METHODS
    if payment_method not in PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    project_id = str(uuid.uuid4())
    project_number = await generate_project_number(db, service_type, user.get("name", ""), user.get("email", ""))

    # Title: respect client's choice if provided; otherwise use a neutral "<Name> — DD Mon YYYY" label
    title_clean = (project_title or "").strip()
    if not title_clean:
        today_str = datetime.now(timezone.utc).strftime("%d %b %Y")
        owner_label = (user.get("name") or "").strip() or (user.get("email") or "Client").split("@")[0]
        title_clean = f"{owner_label} — {today_str}"
    title_clean = title_clean[:120]

    script_path = None
    script_filename = None
    if script and script.filename:
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "scripts")
        os.makedirs(upload_dir, exist_ok=True)
        ext = os.path.splitext(script.filename)[1] if script.filename else ".pdf"
        file_path = os.path.join(upload_dir, f"{project_id}{ext}")
        async with aiofiles.open(file_path, 'wb') as f:
            content = await script.read()
            await f.write(content)
        script_path = f"uploads/scripts/{project_id}{ext}"
        script_filename = script.filename

    project_doc = {
        "id": project_id,
        "project_number": project_number,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "user_paypal_email": user.get("paypal_email", ""),
        "service_type": service_type,
        "project_title": title_clean,
        "brief": brief,
        "script_file": script_path,
        "script_filename": script_filename,
        "reference_files": [],
        "payment_method": payment_method,
        "quote_amount": 0,
        "quote_details": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "order_activated_at": None,
        "invoice_sent_at": None,
        "invoice_signed_at": None,
        "production_started_at": None,
        "delivered_at": None,
        "files_accessed_at": None,
        "delivery_confirmed_at": None,
        "work_accepted_at": None,
        "payment_marked_by_client_at": None,
        "payment_confirmed_by_manager_at": None,
        "completed_at": None,
        "status": "submitted",
        "document_numbers": {},
        "paypal_transaction_id": None,
        "payment_confirmed_by_admin": False,
        "deliverables": [],
        "production_notes": "",
        "quote_request_manager_comments": "",
        "acceptance_status": "pending",
    }
    await db.projects.insert_one(project_doc)
    project_doc.pop("_id", None)
    import asyncio as _asyncio
    from services.notification_service import notify_admin_stage_event
    _asyncio.create_task(notify_admin_stage_event(project_doc, "project_submitted"))
    return project_doc


@router.get("/{project_id}")
async def get_project(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    project["status"] = calculate_current_status(project)
    project["timeline"] = build_timeline(project)
    # Ensure user_paypal_email is always populated (backfill for legacy projects)
    if not project.get("user_paypal_email"):
        owner = await db.users.find_one({"id": project["user_id"]}, {"_id": 0, "paypal_email": 1})
        if owner and owner.get("paypal_email"):
            project["user_paypal_email"] = owner["paypal_email"]
            await db.projects.update_one(
                {"id": project_id},
                {"$set": {"user_paypal_email": owner["paypal_email"]}},
            )
    # Mark current status as "seen" by this user — clears the stage_changed notification
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {f"seen_project_status.{project_id}": project["status"]}},
    )
    return project


@router.patch("/{project_id}")
async def patch_project(project_id: str, request: Request):
    """Update editable fields of a project. Currently: project_title only.
    Allowed for owner and admin, and only until the invoice has been sent."""
    payload = await request.json()
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if project.get("invoice_sent_at"):
        raise HTTPException(status_code=400, detail="Cannot edit after invoice has been sent")

    updates = {}
    if "project_title" in payload:
        new_title = (payload["project_title"] or "").strip()
        if not new_title:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        updates["project_title"] = new_title[:120]

    if "payment_method" in payload:
        from utils.constants import PAYMENT_METHODS
        pm = (payload.get("payment_method") or "").strip()
        if pm not in PAYMENT_METHODS:
            raise HTTPException(status_code=400, detail="Invalid payment method")
        updates["payment_method"] = pm

    if not updates:
        raise HTTPException(status_code=400, detail="No updatable fields provided")

    await db.projects.update_one({"id": project_id}, {"$set": updates})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    updated["status"] = calculate_current_status(updated)
    updated["timeline"] = build_timeline(updated)
    return updated


@router.get("/{project_id}/script")
async def download_script(project_id: str, request: Request):
    """Download the client's original brief/script attachment."""
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if not project.get("script_file"):
        raise HTTPException(status_code=404, detail="No script file attached")

    # script_file is stored as "uploads/scripts/<id>.ext"
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(backend_root, project["script_file"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Script file missing on disk")

    filename = project.get("script_filename")
    if not filename:
        # Legacy project: original filename was not preserved at upload time.
        # Serve with a neutral name that does not pretend to be the client's.
        ext = os.path.splitext(file_path)[1] or ""
        filename = f"attachment{ext}"
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream",
    )


@router.put("/{project_id}/script")
async def replace_script_deprecated(project_id: str, request: Request):
    """Deprecated. The initial script is part of the immutable Quote Request.
    Use POST /reference-files to add supplementary documents."""
    raise HTTPException(
        status_code=410,
        detail="The initial submission is immutable. Please use 'Add reference file' to submit additional documents.",
    )


REFERENCE_FILES_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "uploads",
    "reference_files",
)


@router.post("/{project_id}/reference-files")
async def add_reference_file(
    project_id: str,
    request: Request,
    file: UploadFile = File(...),
    note: str = Form(""),
):
    """Attach an additional reference document to the project. Append-only: does not
    modify or replace the original submission. Allowed for owner and admin until
    invoice is sent."""
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if project.get("invoice_sent_at"):
        raise HTTPException(
            status_code=400,
            detail="Cannot add reference files after invoice has been sent",
        )
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    project_dir = os.path.join(REFERENCE_FILES_ROOT, project_id)
    os.makedirs(project_dir, exist_ok=True)

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ""
    stored_name = f"{file_id}{ext}"
    file_path = os.path.join(project_dir, stored_name)

    size = 0
    async with aiofiles.open(file_path, "wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            await out.write(chunk)

    ref = {
        "id": file_id,
        "original_filename": file.filename,
        "stored_filename": stored_name,
        "size_bytes": size,
        "uploaded_by": user["id"],
        "uploaded_by_name": user["name"],
        "uploaded_by_role": user["role"],
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "note": note.strip(),
    }
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"reference_files": ref}},
    )
    return ref


@router.get("/{project_id}/reference-files/{file_id}")
async def download_reference_file(project_id: str, file_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    ref = next((r for r in project.get("reference_files", []) if r["id"] == file_id), None)
    if not ref:
        raise HTTPException(status_code=404, detail="Reference file not found")
    file_path = os.path.join(REFERENCE_FILES_ROOT, project_id, ref["stored_filename"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")

    return FileResponse(
        path=file_path,
        filename=ref["original_filename"],
        media_type="application/octet-stream",
    )


@router.delete("/{project_id}/reference-files/{file_id}")
async def delete_reference_file(project_id: str, file_id: str, request: Request):
    """Delete a reference file. Allowed for its original uploader or admin,
    only while invoice has not been sent."""
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.get("invoice_sent_at"):
        raise HTTPException(status_code=400, detail="Cannot delete after invoice has been sent")

    ref = next((r for r in project.get("reference_files", []) if r["id"] == file_id), None)
    if not ref:
        raise HTTPException(status_code=404, detail="Reference file not found")

    if user["role"] != "admin" and ref.get("uploaded_by") != user["id"]:
        raise HTTPException(status_code=403, detail="Only the uploader or admin can delete this file")

    file_path = os.path.join(REFERENCE_FILES_ROOT, project_id, ref["stored_filename"])
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass
    await db.projects.update_one(
        {"id": project_id},
        {"$pull": {"reference_files": {"id": file_id}}},
    )
    return {"ok": True}


@router.put("/{project_id}/advance")
async def advance_stage(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    current_status = calculate_current_status(project)
    next_stage = None
    for i, stage in enumerate(OPERATIONAL_CHAIN_STAGES):
        if stage["status_key"] == current_status and i + 1 < len(OPERATIONAL_CHAIN_STAGES):
            next_stage = OPERATIONAL_CHAIN_STAGES[i + 1]
            break

    if not next_stage:
        raise HTTPException(status_code=400, detail="Project already at final stage")

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {next_stage["timestamp_field"]: datetime.now(timezone.utc).isoformat()}},
    )
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    updated["status"] = calculate_current_status(updated)
    updated["timeline"] = build_timeline(updated)
    return updated


@router.put("/{project_id}")
async def update_project(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    body = await request.json()
    allowed_fields = [
        "quote_amount", "quote_details", "production_notes",
        "quote_request_manager_comments", "payment_confirmed_by_admin",
        "project_title",
    ]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    updated["status"] = calculate_current_status(updated)
    return updated



@router.delete("/{project_id}")
async def delete_project(project_id: str, request: Request):
    """Admin-only. Hard-delete a project and cascade-clean its artifacts.

    Cleans: project doc, its messages, its notifications (if collection exists),
    and any uploaded files on disk under /app/backend/uploads for that project_id.
    """
    import shutil
    db = get_db()
    user = await get_current_user(request, db)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    uploads_root = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    per_project_dirs = [
        "signed_invoices", "signed_delivery_certs", "signed_acceptance_acts",
        "payment_proof", "reference_files", "deliverables",
    ]
    for sub in per_project_dirs:
        path = os.path.join(uploads_root, sub, project_id)
        if os.path.isdir(path):
            shutil.rmtree(path, ignore_errors=True)

    # Script file (stored as uploads/scripts/<project_id>.<ext>)
    scripts_dir = os.path.join(uploads_root, "scripts")
    if os.path.isdir(scripts_dir):
        for fname in os.listdir(scripts_dir):
            if fname.startswith(f"{project_id}."):
                try:
                    os.remove(os.path.join(scripts_dir, fname))
                except OSError:
                    pass

    await db.messages.delete_many({"project_id": project_id})
    try:
        await db.notifications.delete_many({"project_id": project_id})
    except Exception:
        pass

    await db.projects.delete_one({"id": project_id})
    return {"deleted": True, "project_id": project_id}
