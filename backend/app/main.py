from fastapi import FastAPI
from app.api.v1.routes.user import user_router
from app.db.database import engine, Base
from app.api.v1.models.user import User
from app.api.v1.models.magic_link import MagicLinkToken
from app.api.v1.routes.guests import guest_router
from app.api.v1.routes.auth import auth_router
from app.api.v1.models.otp import OTPCode
from app.core.middleware import SecurityHeadersMiddleware, BlockedIPMiddleware

app = FastAPI()

# middleware runs top to buttom -blocked IP check first
app.add_middleware(BlockedIPMiddleware)
app.add_middleware(SecurityHeadersMiddleware)


@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(user_router, prefix="/users", tags=["User"])
app.include_router(guest_router, prefix="/guests", tags=["Guest"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])


@app.get("/")
def Home():
    return {"message": "Welcome to GatePass!"}
