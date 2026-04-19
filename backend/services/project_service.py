from datetime import datetime, timezone
from utils.constants import OPERATIONAL_CHAIN_STAGES, SERVICE_TYPES
import re


async def get_next_sequence(db, counter_name: str) -> int:
    result = await db.counters.find_one_and_update(
        {"_id": counter_name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=True,
    )
    return result["value"]


def _client_slug(user_name: str, user_email: str) -> str:
    """Produce an uppercase, URL-safe client slug from the user's name.
    Falls back to the email local-part if the name is empty."""
    source = (user_name or "").strip() or (user_email or "").split("@")[0]
    slug = re.sub(r"[^A-Za-z0-9]+", "", source).upper()
    return slug[:16] or "CLIENT"


async def generate_project_number(db, service_type: str, user_name: str = "", user_email: str = "") -> str:
    seq = await get_next_sequence(db, "project")
    service_label = SERVICE_TYPES.get(service_type, {}).get("label", "Custom").upper()
    client = _client_slug(user_name, user_email)
    date_str = datetime.now(timezone.utc).strftime('%y%m%d')
    return f"VAPP-{seq}-{client}-{service_label}-{date_str}"


def calculate_current_status(project: dict) -> str:
    current_status = "submitted"
    for stage in OPERATIONAL_CHAIN_STAGES:
        if project.get(stage['timestamp_field']):
            current_status = stage['status_key']
        else:
            break
    return current_status


def build_timeline(project: dict) -> list:
    timeline = []
    for stage in OPERATIONAL_CHAIN_STAGES:
        ts = project.get(stage['timestamp_field'])
        timeline.append({
            "stage_number": stage['stage_number'],
            "status_key": stage['status_key'],
            "display_name": stage['display_name'],
            "timestamp_field": stage['timestamp_field'],
            "timestamp": ts,
            "completed": ts is not None,
            "documents": stage['documents'],
        })
    return timeline
