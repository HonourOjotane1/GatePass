from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.v1.services.user import login_user, logout_user, complete_onboarding, get_users, register
from app.api.v1.schemas.auth import LoginRequest, LoginResponse, LogoutResponse, OnBoardingComplete
from app.api.v1.schemas.user import UserBaseCreate
from app.api.v1.models.user import User
from app.core.security import get_current_user
from app.core.rate_limiting import check_rate_limit
from app.core.security_checks import validate_email_format, validate_password_strength
from app.db.database import get_db
import os

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

user_router = APIRouter()


@user_router.get("/")
async def list_users(db: AsyncSession = Depends(get_db)):
    users = await get_users(db)
    return {"message": "successful!", "data": users}

@user_router.post("/register")
async def register_user(payload: UserBaseCreate, db: AsyncSession = Depends(get_db)):
    validate_password_strength(payload.password)
    user = await register(db, payload)
    return {"message": "Registration successful.", "user_id": user.id}


@user_router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host

    for identifier in [client_ip, payload.email]:
        allowed, reason = check_rate_limit(identifier, "login")
        if not allowed:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=reason)

    result = await login_user(db, payload.email, payload.password)

    response.set_cookie(
        key="access_token",
        value= result["access_token"],
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, # can be 60 * 60 * 24 * 7 for 7 days
    )
    return result


@user_router.post("/logout", response_model=LogoutResponse)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="none")
    return await logout_user(db, current_user)


@user_router.post("/onboarding")
async def onboarding(
    payload: OnBoardingComplete,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = await complete_onboarding(db, current_user, payload)
    return {"message": "Profile complete.", "user_id": user.id, "role": user.role}


@user_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "last_login": current_user.last_login
    }


# DEV ONLY — remove before production
@user_router.patch("/dev/verify/{email}")
async def dev_verify_user(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_verified = True
    await db.commit()
    return {"message": f"{email} verified successfully."}