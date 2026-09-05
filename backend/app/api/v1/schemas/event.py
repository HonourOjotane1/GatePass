from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import time, date, datetime
from enum import Enum
from app.api.v1.models.event import (
    EventType,
    EventCategory,  
    EventVisibility,
    AccessType,
    EventStatus, 
    EventType,
)


class CoHostPermission(str, Enum):
    view_only = "view_only"
    check_in = "check_in"
    manage_guests = "manage_guests"
    full_access = "full_access"


# wizard step schemas
class WizardStep1(BaseModel):
    """Basic info"""

    event_name: str
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    category: Optional[EventCategory] = None
    cover_image_url: Optional[str] = (
        None  # set to accept only; png,jpg,jpeg and max size of 100mb
    )


class WizardStep2(BaseModel):
    """Date, time and location."""

    venue_name: Optional[str] = None
    address: Optional[str] = None
    is_virtual: bool = False
    virtual_link: Optional[str] = None
    start_time: time
    end_time: time
    start_date: date
    end_date: date

    # @field_validator("end_time")
    # @classmethod
    # def end_must_be_after_start(cls, end_time, info):
    #     if "start_time" in info.data and end_time <= info.data["start_time"]:
    #         raise ValueError("end_time must be after start_time.")
    #     return end_time

    @field_validator("end_date")
    @classmethod
    def end_date_must_not_be_before_start(cls, end_date, info):
        if "start_date" in info.data and end_date < info.data["start_date"]:
            raise ValueError("end_date cannot be before start_date.")
        return end_date

    @model_validator(mode="after")
    def end_must_be_after_start(self):
        """
        If same day event, end_time must be after start_time.
        If multi-day event, end_date being after start_date is enough.
        """
        if (
            self.start_date
            and self.end_date
            and self.start_time
            and self.end_time
            and self.start_date == self.end_date
            and self.end_time <= self.start_time
        ):
            raise ValueError(
                "For same-day events, end_time must be after start_time."
            )
        return self


class WizardStep3(BaseModel):
    """Step 3: Access type selection."""
    access_type: AccessType = AccessType.open
    # invite_only: bool Default=False
    # ticketed_event: bool Default=False

    # @field_validator("total_tickets")
    # @classmethod
    # def tickets_must_be_positive(cls, v):
    #     if v <= 0:
    #         raise ValueError("total_tickets must be greater than 0.")
    #     return v

    # @field_validator("ticket_price")
    # @classmethod
    # def price_must_be_non_negative(cls, v):
    #     if v < 0:
    #         raise ValueError("ticket_price cannot be negative.")
    #     return v


class WizardStep4(BaseModel):
    """Ticketing and pricing."""

    # ticketing (required if access_type is ticketed)
    ticket_name: Optional[str] = None
    ticket_price: float = 0.0
    total_tickets: int = 0
    ticket_description: Optional[str] = None
    is_free: bool = False

    # # visibility setting
    # visibility: EventVisibility = EventVisibility.public

    @field_validator("ticket_price")
    @classmethod
    def price_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("ticket_price cannot be negative.")
        return v

    @field_validator("total_tickets")
    @classmethod
    def tickets_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("total_tickets must be greater than or equal to 0.")
        return v


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


# General event schemas
# TODO: Remove before production - kept for API testing only.
class EventCreate(BaseModel):
    """Direct create - no wizard- for API use."""

    event_name: str
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    category: Optional[EventCategory] = None
    cover_image_url: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    is_virtual: bool = False
    virtual_link: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    access_type: AccessType = AccessType.open
    ticket_name: Optional[str] = None
    total_tickets: int = 0
    ticket_price: float = 0.0
    is_free: bool = False
    # visibility: EventVisibility = EventVisibility.public
    # location: Optional[str] = None


class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    category: Optional[EventCategory] = None
    cover_image_url: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    is_virtual: Optional[bool] = None
    virtual_link: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    access_type: Optional[AccessType] = None
    ticket_name: Optional[str] = None
    total_tickets: Optional[int] = None
    ticket_price: Optional[float] = None
    is_free: Optional[bool] = None
    visibility: Optional[EventVisibility] = None
    status: Optional[EventStatus] = None


class EventResponse(BaseModel):
    id: str
    event_name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    category: Optional[EventCategory] = None
    cover_image_url: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    is_virtual: bool = False
    virtual_link: Optional[str] = None
    access_type: Optional[AccessType] = None
    ticket_name: Optional[str] = None
    ticket_description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
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
    event_name: str
    tickets_sold: int
    total_tickets: int
    check_ins: int
    revenue: float
    occupancy_percent: float

class EventListResponse(BaseModel):
    events: List[EventResponse]
    items: int
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True

class GuestSummary(BaseModel):
    total_invited: int
    confirmed: int
    declined: int
    waitlisted: int
    checked_in: int


class EventDetailResponse(BaseModel):
    id: str
    event_name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    category: Optional[EventCategory] = None
    cover_image_url: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    is_virtual: bool = False
    virtual_link: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: EventStatus
    visibility: EventVisibility
    access_type: Optional[AccessType] = None
    ticket_name: Optional[str] = None
    ticket_price: float
    ticket_description: Optional[str] = None
    total_tickets: int
    tickets_sold: int
    is_free: bool
    check_ins: int
    wizard_step: int
    created_at: datetime
    updated_at: datetime

    # computed
    guests: GuestSummary
    rsvp_rate: Optional[float] = None
    checkin_rate: Optional[float] = None
    revenue: float
    occupancy_percent: Optional[float] = None
    shareable_link: Optional[str] = None

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_events: int
    published_events: int
    completed_events: int
    total_tickets_sold: int
    total_check_ins: int
    total_revenue: float
    total_guests_invited: int
    total_guests_confirmed: int
    total_guests_declined: int
    total_guests_waitlisted: int
    overall_rsvp_rate: Optional[float] = None    # None shows dash on frontend
    overall_checkin_rate: Optional[float] = None  # None shows dash on frontend

class ShareableLinkResponse(BaseModel):
    slug: str
    shareable_link: str


class EventDelete(BaseModel):
    id: UUID

