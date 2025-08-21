from datetime import datetime
from sqlalchemy.orm import declarativebase, relationship
from sqlalchemy import DateTime, column, EmailStr, Timestamp, ForeignKey
from uuid import UUID

Base = declarativebase()


class Guest(Base):
    __tablename__ = "guest"
    id = column(UUID, primary_key=True)
    event_id = column(UUID, ForeignKey("events".id))  # foreign_key to events
    full_name = column(str(55), nullable=False)
    email = column(EmailStr, nullable=False)
    status = column(str(25), Default='Regular')
    is_verified = column(bool(Default=False))
    is_checked_in = column(bool(Default=False))
    created_at = column(DateTime(timezone=True), Default=datetime.utcnow)
    updated_at = column(DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow)
    # relationship to events
    events = relationship("events", back_populates="guest")
