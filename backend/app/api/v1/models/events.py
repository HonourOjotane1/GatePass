from datetime import datetime
from sqlalchemy.orm import declarativebase, relationship
from sqlalchemy import column, integer, DateTime, ForeignKey
from uuid import UUID

Base = declarativebase()


class Events(Base):
    __tablename__ = "events"
    id = column(UUID, primary_key=True)
    organizer_id = column(UUID), ForeignKey("organizers.id")  # foreign_key to organizer
    guest_id = column(UUID), ForeignKey("guest.id")  # foreign_key to guests
    description = column(str)
    event_name = column(str(255))
    available_seats = column(integer)
    is_full = column(bool(Default=False))
    schedule = column(DateTime.utc, nullable=False)
    is_valid = column(bool(Default=True))
    created_at = column(DateTime(timezone=True), Default=datetime.utcnow)
    updated_at = column(DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationship to organizer
    organizer = relationship("Organizer", back_populates="events")
    # relatiosnhip to guests
    guest = relationship("Guests", back_populates="events")
