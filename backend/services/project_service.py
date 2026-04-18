from datetime import datetime, timezone
from utils.constants import OPERATIONAL_CHAIN_STAGES, SERVICE_TYPES


async def get_next_sequence(db, counter_name: str) -> int:
    result = await db.counters.find_one_and_update(
        {"_id": counter_name},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=True,
    )
    return result["value"]


async def generate_project_number(db, service_type: str, quote_amount: int = 0) -> str:
    seq = await get_next_sequence(db, "project")
    label = SERVICE_TYPES.get(service_type, {}).get("label", "Custom")
    date_str = datetime.now(timezone.utc).strftime('%d%b%Y')
    return f"VAPP-{seq}-{label}{quote_amount}USD-{date_str}"


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
