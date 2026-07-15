from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import time, date, datetime
from enum import Enum


class RSVPStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    declined = "declined"
    waitlisted = "waitlisted"


# ── Public event view ──────────────────────────────────────────────────

class PublicEventResponse(BaseModel):
    """What a guest sees on the public event page — no sensitive data."""
    id: str
    event_name: str
    slug: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_free: bool
    ticket_price: float
    total_tickets: int
    tickets_remaining: int
    is_full: bool
    visibility: str
    organizer_name: Optional[str] = None

    # OG meta for frontend to populate <meta> tags
    og_meta: Optional[dict] = None

    class Config:
        from_attributes = True


# ── Guest session ──────────────────────────────────────────────────────

class GuestSessionCreate(BaseModel):
    """
    Guest provides minimal info to start a session.
    No account needed — session token returned.
    """
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None


class GuestSessionResponse(BaseModel):
    """Returned after session creation — guest uses this token for RSVP."""
    session_token: str
    guest_name: str
    email: str
    message: str


# ── Public RSVP ────────────────────────────────────────────────────────

class PublicRSVPRequest(BaseModel):
    """
    Guest RSVPs using their session token.
    The token identifies who they are without requiring a login.
    """
    session_token: str
    status: RSVPStatus  # confirmed or declined
    plus_one_name: Optional[str] = None


class PublicRSVPResponse(BaseModel):
    rsvp_status: RSVPStatus
    message: str
    guest_name: Optional[str] = None
    waitlist_position: Optional[int] = None
    ical_url: Optional[str] = None  # link to download calendar file


# ── RSVP status check ──────────────────────────────────────────────────

class RSVPStatusResponse(BaseModel):
    guest_name: str
    email: str
    rsvp_status: RSVPStatus
    waitlist_position: Optional[int] = None
    checked_in_at: Optional[datetime] = None
    event_name: str
    event_slug: str


# ── iCal ───────────────────────────────────────────────────────────────

class ICalRequest(BaseModel):
    event_slug: str
    guest_email: Optional[str] = None