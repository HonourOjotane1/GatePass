from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.api.v1.models.user import User
from app.api.v1.schemas.user import UserBaseCreate
from app.core.security import hash_password, verify_password, create_access_token
from datetime import timedelta, datetime
import os

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))


async def get_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()


async def register(db: AsyncSession, user: UserBaseCreate):
    result = await db.execute(select(User).where(User.email == user.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = User(
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        hashed_password=hash_password(user.password)
    )
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception:
        await db.rollback()
        raise


# async def register(db: AsyncSession, user: UserBaseCreate):
#     result = await db.execute(select(User).where(User.email == user.email))
#     existing = result.scalar_one_or_none()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already registered.")

#     data = user.model_dump()
#     data["hashed_password"] = hash_password(data.pop("password"))
#     new_user = User(**data)
#     try:
#         db.add(new_user)
#         await db.commit()
#         await db.refresh(new_user)
#         return new_user
#     except Exception:
#         await db.rollback()
#         raise


async def login_user(db: AsyncSession, email: str, password: str) -> dict:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses magic link or OTP. No password set."
        )
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please verify your email first."
        )

    user.is_logged_in = True
    user.last_login = datetime.utcnow()
    await db.commit()

    token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        'username': user.username,
        "email": user.email,
    }


async def logout_user(db: AsyncSession, user: User) -> dict:
    user.is_logged_in = False
    await db.commit()
    return {"message": "Logged out successfully."}


async def complete_onboarding(db: AsyncSession, user: User, data) -> User:
    user.username = data.username
    user.first_name = data.first_name
    user.last_name = data.last_name
    user.phone_number = data.phone_number
    user.role = data.role

    if data.password:
        user.hashed_password = hash_password(data.password)

    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return user