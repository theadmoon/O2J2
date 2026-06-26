from datetime import datetime, timezone
from utils.constants import DOCUMENT_TYPES, format_document_number
from services.project_service import get_next_sequence


async def get_or_generate_document_number(db, project: dict, doc_type: str) -> str:
    existing = project.get('document_numbers', {}).get(doc_type)
    if existing:
        return existing

    doc_code = DOCUMENT_TYPES[doc_type]['code']
    seq = await get_next_sequence(db, f"{doc_type}_seq")
    doc_number = format_document_number(
        project['project_number'],
        doc_code,
        seq,
        datetime.now(timezone.utc),
    )

    await db.projects.update_one(
        {"id": project['id']},
        {"$set": {f"document_numbers.{doc_type}": doc_number}},
    )
    return doc_number
