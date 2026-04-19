from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
import logging

from database.connection import get_db, close_client
from database.seed import seed_database
from routes.auth import router as auth_router
from routes.projects import router as projects_router
from routes.project_actions import router as project_actions_router
from routes.messages import router as messages_router
from routes.documents import router as documents_router
from routes.public import router as public_router
from routes.admin import router as admin_router

app = FastAPI(title="Ocean2Joy v2.0 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(project_actions_router)
app.include_router(messages_router)
app.include_router(documents_router)
app.include_router(public_router)
app.include_router(admin_router)


@app.get("/api")
async def root():
    return {"message": "Ocean2Joy v2.0 API", "status": "running"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


@app.on_event("startup")
async def startup():
    db = get_db()
    await seed_database(db)
    logging.info("O2J2 database seeded successfully")


@app.on_event("shutdown")
async def shutdown():
    close_client()


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
