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
    script: UploadFile = File(None),
):
    db = get_db()
    user = await get_current_user(request, db)

    project_id = str(uuid.uuid4())
    project_number = await generate_project_number(db, service_type, user.get("name", ""), user.get("email", ""))

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
        "service_type": service_type,
        "project_title": brief[:50] if brief else "Untitled Project",
        "brief": brief,
        "script_file": script_path,
        "script_filename": script_filename,
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
    return project


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
async def replace_script(project_id: str, request: Request, script: UploadFile = File(...)):
    """Upload or replace the script/reference file. Allowed for the project owner or admin,
    as long as the project has not progressed past 'order_activated'."""
    db = get_db()
    user = await get_current_user(request, db)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if project.get("invoice_sent_at"):
        raise HTTPException(status_code=400, detail="Cannot change script after invoice has been sent")
    if not script.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(backend_root, "uploads", "scripts")
    os.makedirs(upload_dir, exist_ok=True)

    # Remove old file if present
    if project.get("script_file"):
        old_path = os.path.join(backend_root, project["script_file"])
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    ext = os.path.splitext(script.filename)[1] or ""
    stored_name = f"{project_id}{ext}"
    file_path = os.path.join(upload_dir, stored_name)
    import aiofiles as _af
    async with _af.open(file_path, "wb") as f:
        content = await script.read()
        await f.write(content)

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "script_file": f"uploads/scripts/{stored_name}",
            "script_filename": script.filename,
        }},
    )
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    updated["status"] = calculate_current_status(updated)
    updated["timeline"] = build_timeline(updated)
    return updated


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
