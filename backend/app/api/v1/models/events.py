from datetime import datetime
from sqlalchemy.orm import declarativebase, relationship
from sqlalchemy import Column, integer, DateTime, ForeignKey
from uuid import UUID

Base = declarativebase()


class Events(Base):
    __tablename__ = "events"
    id = Column(UUID, primary_key=True)
    organizer_id = Column(UUID), ForeignKey("organizers.id")  # foreign_key to organizer
    guest_id = Column(UUID), ForeignKey("guest.id")  # foreign_key to guests
    description = Column(str)
    event_type = Column(str)
    event_categroy = Column(str)
    cover_image = Column(str)  # can be filepath or image url
    venue = Column(str)
    is_virtual = Column(bool)
    address = Column(str)
    map_coordinates = Column(str)
    created_by = Column(str)
    event_name = Column(str(255))
    available_seats = Column(integer)
    is_full = Column(bool(Default=False))
    schedule = Column(DateTime.utc, nullable=False)
    is_valid = Column(bool(Default=True))
    created_at = Column(DateTime(timezone=True), Default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # relationship to organizer
    organizer = relationship("Organizer", back_populates="events")
    # relatiosnhip to guests
    guest = relationship("Guests", back_populates="events")


class TicketTier(Base):
    __tablename__ = "tickettier"
    id = Column(UUID, primary_key=True)
    event_id = Column(UUID, Foreign_key=True)
    name = Column(str)
    price = Column(float)
    quantity = Column(int)
    description = Column(str)
    created_at = Column(DateTime(timezone=True), Default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow
    )


# relationship to event
event = relationship("events", back_populates="tickettier")
# relationship to guests
guest = relationship("guests", back_populates="tickettier")


class AccessControl:
    __table_name__ = "accesscontrol"
    id = Column(UUID, Primary_key=True)
    event_id = Column(UUID, Foreign_key=True)
    access_type = Column(str)
    qr_enabled = Column(bool, Default=True)
    invite_only = Column(bool, Default=True)
    created_at = Column(DateTime(timezone=True), Default=datetime.utcnow)

    # relationhship to evenhts
    event = relationship("events", back_populates="accesscontrol")
    guests = relationship("guests", back_populates="acesscontrol")


class Branding:
    __tabglename__ = "branding"
    id = Column(UUID, Primary_key=True)
    event_id = Column(UUID, Foreign_key=True)
    theme_color = Column(str)
    logo = Column(str)  # canh bge file_name or image url
    banner = Column(str)  # can be file_name or image url
    email_template = Column(str)

    # relationship to events
    events = relationship("events", back_populates="branding")
