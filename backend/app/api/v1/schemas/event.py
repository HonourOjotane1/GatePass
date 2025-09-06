from typing import Optional, bool
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime


class EventBase(BaseModel):
    event_name: str
    guest_id: UUID
    organizer_id: UUID
    description: str = Optional
    available_seats: int
    is_full: bool = Field(default=False)
    schedule: datetime
    is_valid: bool = Field(default=True)
    created_at: datetime
    updated_at: datetime


class Event(EventBase):
    id: UUID


class EventCreate(EventBase):
    pass


class EventUpdate(Event):
    event_name: str
    available_seats: int
    is_full: bool = Field(default=False)
    schedule: datetime
    is_valid: bool = Field(default=True)
    created_at: datetime
    updated_at: datetime


class EventDelete:
    id: UUID
