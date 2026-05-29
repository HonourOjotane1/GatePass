from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum


class EventStatus(str, Enum):
    draft = "draft"
    published = "published"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class EventVisibility(str, Enum):
    public = "public"
    private = "private"
    invite_only = "invite_only"

class CoHostPermission(str, Enum):
    view_only = "view-only"
    check_in = "check_in"
    manage_guests = "manage_guests"
    full_access = "full_access"


# wizard step schemas
class WizardStep1(BaseModel):
    """Basic info - title and description """
    title: str
    description: Optional[str] = None

class WizardStep2(BaseModel):
    """Date, time and location."""
    location: str
    start_time: datetime
    end_time: datetime

    @field_validator("end_time")
    @classmethod
    def end_must_be_after_start(cls, end_time, info):
        if "start_time" in info.data and end_time <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time.")
        return end_time
    
class WizardStep3(BaseModel):
    """Ticketing info."""
    total_tickets: int
    ticket_price: float = 0.0
    is_free: bool = False

    @field_validator("total_tickets")
    @classmethod
    def tickets_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("total_tickets must be greater than 0.")
        return v

    @field_validator("ticket_price")
    @classmethod
    def price_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("ticket_price cannot be negative.")
        return v


class WizardStep4(BaseModel):
    """Visibility and publishing settings."""
    visibility: EventVisibility = EventVisibility.public

# co-host schemas
class CoHostInvite(BaseModel):
    email: str
    permission: CoHostPermission = CoHostPermission.view_only


class CoHostResponse(BaseModel):
    id: str
    user_id: str
    permission: CoHostPermission
    accepted: bool

    class Config:
        from_attributes = True


# class EventBase(BaseModel):
#     event_name: str
#     guest_id: UUID
#     organizer_id: UUID
#     description: Optional[str] = None
#     available_seats: int
#     is_full: bool = Field(default=False)
#     schedule: datetime
#     is_valid: bool = Field(default=True)
#     created_at: datetime
#     updated_at: datetime


# class Event(EventBase):
#     id: UUID

#     class Config:
#         from_attributes = True


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    total_tickets: int
    ticket_price: float = 0.0
    is_free: bool = False
    visibility: EventVisibility = EventVisibility.public


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    total_tickets: Optional[int] = None
    ticket_price: Optional[float] = None
    is_free: Optional[bool] = None
    visibility: Optional[EventVisibility] = None
    status: Optional[EventStatus] = None


class EventResponse(BaseModel):
    id: str
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: EventStatus
    visibility: EventVisibility
    total_tickets: int
    tickets_sold: int
    ticket_price: float
    check_ins: int
    is_free: bool
    wizard_step: int 
    created_at: datetime
    co_hosts: List[CoHostResponse] = []

    class Config:
        from_attributes = True


class EventStatsResponse(BaseModel):
    event_id: str
    title: str
    tickets_sold: int
    total_tickets: int
    check_ins: int
    revenue: float
    occupancy_percent: float


class DashboardStatsResponse(BaseModel):
    total_events: int
    published_events: int
    completed_events: int
    total_tickets_sold: int
    total_check_ins: int
    total_revenue: float

class ShareableLinkResponse(BaseModel):
    slug: str
    shareable_link: str


class EventDelete(BaseModel):
    id: UUID