import uuid
import os
from datetime import datetime, timezone
from utils.security import hash_password


async def seed_database(db):
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@ocean2joy.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')

    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Ocean2Joy Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
        })

    test_email = "client@test.com"
    existing_test = await db.users.find_one({"email": test_email})
    if existing_test is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": test_email,
            "password_hash": hash_password("client123"),
            "name": "Test Client",
            "role": "client",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
        })

    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.projects.create_index("id", unique=True)
    await db.projects.create_index("user_id")
    await db.messages.create_index("project_id")
    await db.demo_videos.create_index("id", unique=True)

    # Seed demo videos (homepage reel) on first start only.
    if await db.demo_videos.count_documents({}) == 0:
        from routes.public import DEMO_VIDEOS  # noqa: WPS433 — avoid circular at import time
        now = datetime.now(timezone.utc).isoformat()
        await db.demo_videos.insert_many([
            {**d, "created_at": now, "updated_at": now} for d in DEMO_VIDEOS
        ])

    # Write test credentials
    creds_path = "/app/memory/test_credentials.md"
    os.makedirs("/app/memory", exist_ok=True)
    with open(creds_path, "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Test Client\n- Email: client@test.com\n- Password: client123\n- Role: client\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n")
