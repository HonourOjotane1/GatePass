from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.v1.models.user import User
from app.api.v1.schemas.auth import MagicLinkRequest, MagicLinkVerify, OTPRequest, OTPVerify
from app.api.v1.services.auth import create_magic_link, verify_magic_token, create_otp, verify_otp
from app.utils.emails import send_magic_link, send_otp
from app.db.database import get_db
from app.core.rate_limiting import check_rate_limit
from app.core.security_checks import validate_email_format, validate_otp_format, validate_token_format

auth_router = APIRouter()


@auth_router.post("/magic-link")
async def request_magic_link(payload: MagicLinkRequest, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host
    validate_email_format(payload.email)

    # check by IP and by email to catch both distributed and single-user abuse
    for identifier in [client_ip, payload.email]:
        allowed, reason = check_rate_limit(identifier, "magic_link_request")
        if not allowed:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=reason)

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(email=payload.email)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = await create_magic_link(db, user)
    send_magic_link(user.email, token)
    return {"message": "Magic link sent"}


@auth_router.post("/magic-link/verify")
async def verify_magic_link(payload: MagicLinkVerify, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host
    validate_token_format(payload.token)

    allowed, reason = check_rate_limit(client_ip, "magic_link_verify")
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=reason)

    user_id = await verify_magic_token(db, payload.token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token.")

    return {"message": "Authenticated", "user_id": user_id}


@auth_router.post("/otp/request")
async def request_otp(payload: OTPRequest, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host
    validate_email_format(payload.email)

    for identifier in [client_ip, payload.email]:
        allowed, reason = check_rate_limit(identifier, "otp_request")
        if not allowed:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=reason)

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(email=payload.email)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    code = await create_otp(db, user)
    send_otp(user.email, code)
    return {"message": "OTP sent to your email"}


@auth_router.post("/otp/verify")
async def verify_otp_route(payload: OTPVerify, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host
    validate_email_format(payload.email)
    validate_otp_format(payload.code)

    for identifier in [client_ip, payload.email]:
        allowed, reason = check_rate_limit(identifier, "otp_verify")
        if not allowed:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=reason)

    user_id = await verify_otp(db, payload.email, payload.code)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")

    return {"message": "Authenticated", "user_id": user_id}

# WITHOUT RATE LIMITING PLUGGED IN
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from app.api.v1.models.user import User
# from app.api.v1.schemas.auth import MagicLinkRequest, MagicLinkVerify, OTPRequest, OTPVerify
# from app.api.v1.services.auth import create_magic_link, verify_magic_token, create_otp, verify_otp
# from app.utils.emails import send_magic_link, send_otp
# from app.db.database import get_db

# auth_router = APIRouter()


# @auth_router.post("/magic-link")
# async def request_magic_link(payload: MagicLinkRequest, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(User).where(User.email == payload.email))
#     user = result.scalar_one_or_none()
#     if not user:
#         user = User(email=payload.email)
#         db.add(user)
#         await db.commit()
#         await db.refresh(user)

#     token = await create_magic_link(db, user)
#     send_magic_link(user.email, token)

#     return {"message": "Magic link sent"}

# @auth_router.post("/verify")
# async def verify_link(payload: MagicLinkVerify, db: AsyncSession = Depends(get_db)):
#     user_id = await verify_magic_token(db, payload.token)

#     if not user_id:
#         raise HTTPException(status_code=400, detail="Invalid or expired token")

#     return {"message": "Authenticated", "user_id": user_id}

# @auth_router.post("/otp/request")
# async def request_otp(payload: OTPRequest, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(User).where(User.email == payload.email))
#     user = result.scalar_one_or_none()

#     if not user:
#         user = User(email=payload.email)
#         db.add(user)
#         await db.commit()
#         await db.refresh(user)

#     code = await create_otp(db, user)
#     send_otp(user.email, code)

#     return {"message": "OTP sent to your email"}


# @auth_router.post("/otp/verify")
# async def verify_otp_route(payload: OTPVerify, db: AsyncSession = Depends(get_db)):
#     user_id = await verify_otp(db, payload.email, payload.code)

#     if not user_id:
#         raise HTTPException(status_code=400, detail="Invalid orexpired OTP")

#     return {"message": "Authenticated", "user_id": user_id}

