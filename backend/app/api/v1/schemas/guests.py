from uuid import UUID
from pydantic import BaseModel, EmailStr, Timestamp


class GuestBase(BaseModel):
    event_id: UUID
    full_name: str
    email: EmailStr
    status: str
    is_verified: bool = False
    is_checked_in: False
    created_at: Timestamp
    updated_at: Timestamp


class Guest(GuestBase):
    id: UUID


class GuestCreate(GuestBase):
    pass


class GuestUpdate(Guest):
    event_id: UUID
    full_name: str
    email: EmailStr
    status: str
    is_verified: bool = False
    is_checked_in: False
    created_at: Timestamp
    updated_at: Timestamp


class GuestDelete(Guest):
    pass
