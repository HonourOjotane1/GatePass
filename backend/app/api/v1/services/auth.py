from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from app.api.v1.models.user import User
from app.api.v1.models.magic_link import MagicLinkToken
from app.core.security import generate_magic_token, get_expiry_time
from app.api.v1.models.otp import OTPCode
from app.core.security import generate_otp, get_otp_expiry_time

async def create_magic_link(db: AsyncSession, user):
    token = generate_magic_token()

    magic_token = MagicLinkToken(
        token=token,
        user_id=user.id,
        expires_at=get_expiry_time()
    )

    db.add(magic_token)
    await db.commit()
    return token

async def verify_magic_token(db: AsyncSession, token: str):
    result = await db.execute(select(MagicLinkToken).where(MagicLinkToken.token == token))
    record = result.scalar_one_or_none()

    if not record:
        return None

    if record.used:
        return None

    if record.expires_at < datetime.utcnow():
        return None

    record.used = True
    await db.commit()
    return record.user_id

async def create_otp(db: AsyncSession, user) -> str:
    #invalidate any existing unused OTPs for this user
    result = await db.execute(
        select(OTPCode).where(OTPCode.user_id == user.id, OTPCode.used == False))
    existing = result.scalars().all()
    for old in existing:
        old.used = True
    
    await db.flush() #persists the invalidation before adding new OTP

    code = generate_otp()

    otp = OTPCode(
        user_id=user.id,
        code=code,
        expires_at=get_otp_expiry_time()
    )
    db.add(otp)
    await db.commit()
    return code

async def verify_otp(db: AsyncSession, email: str, code: str):
    #find user first
    user_result = await db.execute(select(User).where(User.email== email))
    user =user_result.scalar_one_or_none()

    if not user:
        return None
    
    #find matching OTP
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.user_id == user.id,
            OTPCode.code == code,
            OTPCode.used == False
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        return None
    
    if record.expires_at < datetime.utcnow():
        return None
    
    record.used = True
    await db.commit()
    return user.id