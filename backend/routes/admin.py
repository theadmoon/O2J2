"""Admin-only reference endpoints. Authenticated + role=admin guarded."""
import asyncio
import json
import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import aiofiles
import resend
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
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


# ---------------------------------------------------------------------------
# Demo videos (Homepage reel) — admin CRUD + media upload
# ---------------------------------------------------------------------------

DEMO_MEDIA_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "uploads",
    "demo_media",
)

ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v"}
ALLOWED_POSTER_EXT = {".png", ".jpg", ".jpeg", ".webp"}
MAX_VIDEO_MB = 200
MAX_POSTER_MB = 10


class DemoVideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


def _safe_ext(filename: str, allowed: set) -> str:
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type {ext or '(none)'} not allowed. Use one of: {', '.join(sorted(allowed))}",
        )
    return ext


async def _save_upload(upload: UploadFile, dest_path: str, max_mb: int) -> int:
    """Stream an UploadFile to disk, enforcing a size cap. Returns bytes written."""
    max_bytes = max_mb * 1024 * 1024
    size = 0
    async with aiofiles.open(dest_path, "wb") as out:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                await out.close()
                try:
                    os.remove(dest_path)
                except OSError:
                    pass
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds the {max_mb} MB limit",
                )
            await out.write(chunk)
    return size


def _clear_dir(path: str) -> None:
    if os.path.isdir(path):
        for name in os.listdir(path):
            try:
                os.remove(os.path.join(path, name))
            except OSError:
                pass


@router.get("/demo-videos")
async def admin_list_demo_videos(request: Request):
    await _require_admin(request)
    db = get_db()
    docs = await db.demo_videos.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)
    return docs


@router.post("/demo-videos")
async def admin_create_demo_video(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    tags: str = Form("[]"),
    video: UploadFile = File(...),
    poster: UploadFile = File(...),
):
    """Create a new demo video. Both the MP4 and the poster image are required
    on creation — the homepage relies on having a poster for lazy/cold frames."""
    await _require_admin(request)
    db = get_db()

    try:
        parsed_tags = json.loads(tags) if tags else []
        if not isinstance(parsed_tags, list):
            parsed_tags = []
    except json.JSONDecodeError:
        parsed_tags = []

    video_ext = _safe_ext(video.filename, ALLOWED_VIDEO_EXT)
    poster_ext = _safe_ext(poster.filename, ALLOWED_POSTER_EXT)

    demo_id = f"demo-{uuid.uuid4().hex[:8]}"
    video_dir = os.path.join(DEMO_MEDIA_ROOT, demo_id, "video")
    poster_dir = os.path.join(DEMO_MEDIA_ROOT, demo_id, "poster")
    os.makedirs(video_dir, exist_ok=True)
    os.makedirs(poster_dir, exist_ok=True)

    video_name = f"video{video_ext}"
    poster_name = f"poster{poster_ext}"
    video_size = await _save_upload(video, os.path.join(video_dir, video_name), MAX_VIDEO_MB)
    poster_size = await _save_upload(poster, os.path.join(poster_dir, poster_name), MAX_POSTER_MB)

    now = datetime.now(timezone.utc).isoformat()
    max_order = await db.demo_videos.find_one({}, sort=[("order", -1)], projection={"order": 1, "_id": 0})
    next_order = (max_order or {}).get("order", 0) + 1

    doc = {
        "id": demo_id,
        "title": title.strip(),
        "description": (description or "").strip(),
        "tags": [t.strip() for t in parsed_tags if isinstance(t, str) and t.strip()],
        "order": next_order,
        "video_storage": "uploaded",
        "video_filename": video_name,
        "video_original_name": video.filename,
        "video_size": video_size,
        "poster_storage": "uploaded",
        "poster_filename": poster_name,
        "poster_original_name": poster.filename,
        "poster_size": poster_size,
        "created_at": now,
        "updated_at": now,
    }
    await db.demo_videos.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/demo-videos/{demo_id}")
async def admin_update_demo_video(demo_id: str, payload: DemoVideoUpdate, request: Request):
    await _require_admin(request)
    db = get_db()
    existing = await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Demo video not found")

    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if payload.title is not None:
        update["title"] = payload.title.strip()
    if payload.description is not None:
        update["description"] = payload.description.strip()
    if payload.tags is not None:
        update["tags"] = [t.strip() for t in payload.tags if isinstance(t, str) and t.strip()]

    await db.demo_videos.update_one({"id": demo_id}, {"$set": update})
    return await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})


@router.post("/demo-videos/{demo_id}/video")
async def admin_replace_demo_video_file(demo_id: str, request: Request, file: UploadFile = File(...)):
    await _require_admin(request)
    db = get_db()
    if not await db.demo_videos.find_one({"id": demo_id}, {"_id": 0}):
        raise HTTPException(status_code=404, detail="Demo video not found")

    ext = _safe_ext(file.filename, ALLOWED_VIDEO_EXT)
    video_dir = os.path.join(DEMO_MEDIA_ROOT, demo_id, "video")
    os.makedirs(video_dir, exist_ok=True)
    _clear_dir(video_dir)
    name = f"video{ext}"
    size = await _save_upload(file, os.path.join(video_dir, name), MAX_VIDEO_MB)

    await db.demo_videos.update_one({"id": demo_id}, {"$set": {
        "video_storage": "uploaded",
        "video_filename": name,
        "video_original_name": file.filename,
        "video_size": size,
        "video_url": None,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }})
    return await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})


@router.post("/demo-videos/{demo_id}/poster")
async def admin_replace_demo_poster(demo_id: str, request: Request, file: UploadFile = File(...)):
    await _require_admin(request)
    db = get_db()
    if not await db.demo_videos.find_one({"id": demo_id}, {"_id": 0}):
        raise HTTPException(status_code=404, detail="Demo video not found")

    ext = _safe_ext(file.filename, ALLOWED_POSTER_EXT)
    poster_dir = os.path.join(DEMO_MEDIA_ROOT, demo_id, "poster")
    os.makedirs(poster_dir, exist_ok=True)
    _clear_dir(poster_dir)
    name = f"poster{ext}"
    size = await _save_upload(file, os.path.join(poster_dir, name), MAX_POSTER_MB)

    await db.demo_videos.update_one({"id": demo_id}, {"$set": {
        "poster_storage": "uploaded",
        "poster_filename": name,
        "poster_original_name": file.filename,
        "poster_size": size,
        "poster_url": None,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }})
    return await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})


@router.delete("/demo-videos/{demo_id}")
async def admin_delete_demo_video(demo_id: str, request: Request):
    await _require_admin(request)
    db = get_db()
    doc = await db.demo_videos.find_one({"id": demo_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Demo video not found")
    await db.demo_videos.delete_one({"id": demo_id})
    media_dir = os.path.join(DEMO_MEDIA_ROOT, demo_id)
    if os.path.isdir(media_dir):
        shutil.rmtree(media_dir, ignore_errors=True)
    return {"ok": True, "id": demo_id}


class ReorderPayload(BaseModel):
    order: List[str]


@router.post("/demo-videos/reorder")
async def admin_reorder_demo_videos(payload: ReorderPayload, request: Request):
    await _require_admin(request)
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    for idx, demo_id in enumerate(payload.order, start=1):
        await db.demo_videos.update_one(
            {"id": demo_id},
            {"$set": {"order": idx, "updated_at": now}},
        )
    docs = await db.demo_videos.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)
    return docs
