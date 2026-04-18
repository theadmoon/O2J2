from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database.connection import get_db
from utils.security import get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/projects/{project_id}/messages", tags=["messages"])


class MessageInput(BaseModel):
    message: str


@router.get("")
async def get_messages(project_id: str, request: Request):
    db = get_db()
    user = await get_current_user(request, db)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = await db.messages.find(
        {"project_id": project_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    return messages


@router.post("")
async def send_message(project_id: str, data: MessageInput, request: Request):
    db = get_db()
    user = await get_current_user(request, db)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "admin" and project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    msg_doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "sender_id": user["id"],
        "sender_name": user["name"],
        "sender_role": user["role"],
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "attachments": [],
    }
    await db.messages.insert_one(msg_doc)
    msg_doc.pop("_id", None)
    return msg_doc
