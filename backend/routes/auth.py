from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel, EmailStr
from database.connection import get_db
from utils.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, get_current_user,
)
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str
    paypal_email: str = ""


class LoginInput(BaseModel):
    email: EmailStr
    password: str


def _set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(key="access_token", value=access, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")


@router.post("/register")
async def register(data: RegisterInput, response: Response):
    db = get_db()
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "name": data.name,
        "paypal_email": (data.paypal_email or "").strip().lower(),
        "role": "client",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
    }
    await db.users.insert_one(user_doc)

    access = create_access_token(user_id, data.email.lower())
    refresh = create_refresh_token(user_id)
    _set_auth_cookies(response, access, refresh)

    return {
        "id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "paypal_email": user_doc["paypal_email"],
        "role": "client",
    }


@router.post("/login")
async def login(data: LoginInput, response: Response):
    db = get_db()
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access = create_access_token(user["id"], user["email"])
    refresh = create_refresh_token(user["id"])
    _set_auth_cookies(response, access, refresh)

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "paypal_email": user.get("paypal_email", ""),
        "role": user["role"],
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@router.get("/me")
async def me(request: Request):
    db = get_db()
    user = await get_current_user(request, db)
    return user
