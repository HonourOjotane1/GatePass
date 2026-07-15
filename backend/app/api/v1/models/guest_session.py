from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


class GuestSession(Base):
    """
    Lightweight session for guests who haven't created an account.
    Allows them to RSVP and check their status without registering.
    """
    __tablename__ = "guest_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    guest_id = Column(String(36), ForeignKey("guests.id"), nullable=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String, nullable=False)
    phone_number = Column(String(20), nullable=True)

    session_token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", backref="guest_sessions")
    guest = relationship("Guest", backref="session")