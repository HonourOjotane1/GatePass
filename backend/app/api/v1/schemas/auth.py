from pydantic import BaseModel, EmailStr

class MagicLinkRequest(BaseModel):
    email: EmailStr

class MagicLinkVerify(BaseModel):
    token: str

class OTPRequest(BaseModel):
    token: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    code: str