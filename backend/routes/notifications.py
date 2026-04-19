"""Per-user notifications: projects that either (a) require an action from the
current user based on role + stage, or (b) advanced to a new stage since the
user last opened them."""
from fastapi import APIRouter, Request
from database.connection import get_db
from utils.security import get_current_user
from services.project_service import calculate_current_status

router = APIRouter(prefix="/api", tags=["notifications"])


# Stages that need the given role to act next
CLIENT_ACTION_STAGES = {
    "invoice_sent",        # → sign-invoice
    "delivered",           # → click deliverable link (auto-advances to files_accessed)
    "files_accessed",      # → confirm-delivery
    "delivery_confirmed",  # → accept-work
    "work_accepted",       # → mark-payment-sent
}

ADMIN_ACTION_STAGES = {
    "submitted",           # → activate-order
    "order_activated",     # → send-invoice
    "invoice_signed",      # → start-production
    "production_started",  # → mark-delivered (only when deliverables exist)
    "payment_sent",        # → confirm-payment
    "payment_received",    # → complete
}


# Human labels for stages (used in notification text)
STAGE_LABEL = {
    "submitted": "Submitted",
    "order_activated": "Order Activated",
    "invoice_sent": "Invoice Sent",
    "invoice_signed": "Invoice Signed",
    "production_started": "Production Started",
    "delivered": "Delivered",
    "files_accessed": "Files Accessed",
    "delivery_confirmed": "Delivery Confirmed",
    "work_accepted": "Work Accepted",
    "payment_sent": "Payment Sent",
    "payment_received": "Payment Received",
    "completed": "Completed",
}


def _action_hint(role: str, status: str, project: dict) -> str | None:
    """Short instruction describing the next action expected from role."""
    if role == "admin":
        if status == "submitted":
            return "Activate order (set quote)"
        if status == "order_activated":
            return "Send invoice"
        if status == "invoice_signed":
            return "Start production"
        if status == "production_started":
            if project.get("deliverables"):
                return "Mark delivered"
            return "Upload deliverables, then mark delivered"
        if status == "payment_sent":
            return "Confirm payment received"
        if status == "payment_received":
            return "Complete project"
    else:  # client
        if status == "invoice_sent":
            return "Accept invoice & terms"
        if status == "delivered":
            return "Open deliverable link to access materials"
        if status == "files_accessed":
            return "Confirm delivery"
        if status == "delivery_confirmed":
            return "Accept work"
        if status == "work_accepted":
            return "Send payment"
    return None


@router.get("/notifications")
async def list_notifications(request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    is_admin = user["role"] == "admin"

    full_user = await db.users.find_one({"id": user["id"]}, {"seen_project_status": 1, "_id": 0}) or {}
    seen_map: dict = full_user.get("seen_project_status") or {}

    query = {} if is_admin else {"user_id": user["id"]}
    cursor = db.projects.find(query, {"_id": 0})

    items = []
    async for project in cursor:
        status = calculate_current_status(project)
        if status == "completed":
            continue  # nothing to do for finalized projects

        previous_seen = seen_map.get(project["id"])
        stage_changed = previous_seen != status

        action_stages = ADMIN_ACTION_STAGES if is_admin else CLIENT_ACTION_STAGES
        action_required = status in action_stages
        if is_admin and status == "production_started" and not project.get("deliverables"):
            # Admin still has to upload deliverables — still counts as "needs action"
            action_required = True

        if not stage_changed and not action_required:
            continue

        items.append({
            "project_id": project["id"],
            "project_number": project["project_number"],
            "project_title": project["project_title"],
            "user_name": project.get("user_name"),
            "status": status,
            "status_label": STAGE_LABEL.get(status, status.replace("_", " ").title()),
            "previous_status": previous_seen,
            "previous_status_label": STAGE_LABEL.get(previous_seen) if previous_seen else None,
            "stage_changed": stage_changed,
            "action_required": action_required,
            "action_hint": _action_hint(user["role"], status, project) if action_required else None,
        })

    items.sort(key=lambda x: (not x["action_required"], not x["stage_changed"]))
    return {
        "count_total": len(items),
        "count_action_required": sum(1 for i in items if i["action_required"]),
        "count_stage_changed": sum(1 for i in items if i["stage_changed"]),
        "items": items,
    }
