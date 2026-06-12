from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
# from uuid import UUID 

class RSVPStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    declined = "declined"
    waitlisted = "waitlisted"
    checked_in = "checked_in"


class InviteMethod(str, Enum):
    email = "email"
    sms = "sms"
    both = "both"


# ── Invite schemas ─────────────────────────────────────────────────────

class GuestInviteSingle(BaseModel):
    """Invite one guest."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    invite_method: InviteMethod = InviteMethod.email
    plus_one_allowed: bool = False

    class Config:
        # at least one of email or phone_number must be provided
        # validated in service layer
        pass


class GuestInviteBulk(BaseModel):
    """Invite multiple guests at once."""
    guests: List[GuestInviteSingle]


class GuestUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    plus_one_allowed: Optional[bool] = None
    invite_method: Optional[InviteMethod] = None


# ── RSVP schemas ───────────────────────────────────────────────────────

class RSVPResponse(BaseModel):
    """Submitted by guest via RSVP link."""
    token: str
    status: RSVPStatus  # confirmed or declined only
    plus_one_name: Optional[str] = None


# ── Response schemas ───────────────────────────────────────────────────

class GuestResponse(BaseModel):
    id: str
    event_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    rsvp_status: RSVPStatus
    plus_one_allowed: bool
    plus_one_name: Optional[str] = None
    plus_one_checked_in: bool
    waitlist_position: Optional[int] = None
    invite_sent_at: Optional[datetime] = None
    rsvp_responded_at: Optional[datetime] = None
    checked_in_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GuestListResponse(BaseModel):
    """Paginated guest list."""
    items: List[GuestResponse]
    total: int
    confirmed: int
    declined: int
    pending: int
    waitlisted: int
    page: int
    page_size: int
    total_pages: int

# class GuestDelete(BaseModel):
#     id: UUID


class WaitlistStatusResponse(BaseModel):
    position: int
    total_waitlisted: int
    message: str