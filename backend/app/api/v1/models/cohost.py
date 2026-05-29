from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class CoHostPermission(str, enum.Enum):
    view_only = "view_only"       # can see event details and stats
    check_in = "check_in"         # can scan and check in guests
    manage_guests = "manage_guests"  # can add/remove guests
    full_access = "full_access"   # can edit event, manage guests, view stats


class EventCoHost(Base):
    __tablename__ = "event_co_hosts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("organizers.id"), nullable=False)
    permission = Column(Enum(CoHostPermission), default=CoHostPermission.view_only, nullable=False)
    invited_by = Column(String(36), ForeignKey("organizers.id"), nullable=False)
    accepted = Column(Boolean, default=False)  # co-host must accept invite
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="co_hosts")
    user = relationship("User", foreign_keys=[user_id], backref="cohosted_events")
    inviter = relationship("User", foreign_keys=[invited_by])