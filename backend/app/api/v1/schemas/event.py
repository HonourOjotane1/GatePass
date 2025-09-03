from typing import Optional, bool
from uuid import UUID
from pydantic import BaseModel, Timestamp
from datetime import datetime


class EventBase(BaseModel):
    event_name: str
    guest_id: UUID
    organizer_id: UUID
    description: str = Optional
    available_seats: int
    is_full: bool = False
    schedule: datetime
    is_valid: bool = True
    created_at: Timestamp
    updated_at: Timestamp


class Event(EventBase):
    id: UUID


class EventCreate(EventBase):
    pass


class EventUpdate(Event):
    event_name: str
    available_seats: int
    is_full: bool = False
    schedule: datetime
    is_valid: bool = True
    created_at: Timestamp
    updated_at: Timestamp


class EventDelete:
    id: UUID
