from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class GuestBase(BaseModel):
    event_id: UUID
    full_name: str
    email: EmailStr
    status: str
    is_verified: bool = Field(default=False)
    is_checked_in: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime


class Guest(GuestBase):
    id: UUID


class GuestCreate(GuestBase):
    pass


class GuestUpdate(Guest):
    event_id: UUID
    full_name: str
    email: EmailStr
    status: str
    is_verified: bool = Field(default=False)
    is_checked_in: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime


class GuestDelete(Guest):
    pass
