from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    organizer = "organizer"
    staff = "staff"
    guest = "guest"

# Magic link
class MagicLinkRequest(BaseModel):
    email: EmailStr

class MagicLinkVerify(BaseModel):
    token: str

# OTP
class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    code: str

#Login / Logout
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: UserRole

class LogoutResponse(BaseModel):
    message: str

# Onboarding - step1 is just email(magic.otp)
# Step 2 is completing profile
class OnBoardingComplete(BaseModel):
    username: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    password: Optional[str] = None # optional - not needed for magiclink
    role: UserRole = UserRole.organizer

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None