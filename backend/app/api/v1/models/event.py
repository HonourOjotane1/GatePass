from datetime import date, time, datetime
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    Float,
    Integer,
    String,
    Text,
    DateTime,
    Date,
    Time,
    ForeignKey,
)
import enum
from app.db.database import Base


class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class EventVisibility(str, enum.Enum):
    public = "public"
    private = "private"
    invite_only = "invite_only"


class EventType(str, enum.Enum): # Format of the event( How it's structured)
    conference = "conference"
    concert = "concert"
    workshop = "workshop"
    party = "party"
    sports = "sports"
    networking = "networking"
    other = "other"
    festival = "festival"
    meetup = "meetup"
    seminar = "seminar"
    exhibition = "exhibition"
    screening = "screening"
    webinar = "webinar"



class EventCategory(str, enum.Enum): # Content/industry (What it's about)
    music = "music"
    tech = "tech"
    business = "business"
    arts = "arts"
    food = "food"
    sports = "sports"
    education = "education"
    entertainment = "entertainment"
    fashion = "fashion"
    health_wellness = "health_wellness"
    community = "community"
    religious = "religious"
    other = "other"


class AccessType(str, enum.Enum):
    open = "open"
    invite_only = "invite_only"
    ticketed = "ticketed"


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organizer_id = Column(
        String(36), ForeignKey("organizers.id"), nullable=False
    )  # foreign_key to organizer

    # Step1 fields
    event_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(Enum(EventType), nullable=True)
    category = Column(Enum(EventCategory), nullable=True)
    cover_image_url = Column(String(500), nullable=True)  # stored URL after upload

    # Step2 fields
    venue_name = Column(String(200), nullable=True)
    address = Column(String(300), nullable=True)
    location = Column(String(300), nullable=True)
    is_virtual = Column(Boolean, default=False)
    virtual_link = Column(String(500), nullable=True)
    start_time = Column(Time, nullable=True)  # nullable for wizard draft support
    end_time = Column(Time, nullable=True)  # nullable for wizard draft support
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    # Step3 fields
    access_type = Column(Enum(AccessType), default=AccessType.open, nullable=False)

    # Step4 fields
    ticket_name = Column(String(100), nullable=True)
    ticket_price = Column(Float, default=0.0)
    total_tickets = Column(Integer, default=0)
    ticket_description = Column(Text, nullable=True)
    is_free = Column(Boolean, default=False)

    slug = Column(String(250), unique=True, nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.draft, nullable=False)
    visibility = Column(
        Enum(EventVisibility), default=EventVisibility.public, nullable=False
    )
    tickets_sold = Column(Integer, default=0)
    check_ins = Column(Integer, default=0)
    wizard_step = Column(Integer, default=1)  # tracks how far wizard has progressed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organizer = relationship("User", foreign_keys=[organizer_id], backref="events")
    co_hosts = relationship(
        "EventCoHost",
        back_populates="event",
        cascade="all, delete-orphan",
        lazy="raise",
    )


# TO-DO; CREATE A PYDANTIC MODEL FOR DRAFT SUCH THAT PAYLOAD CAN PASS A DICT!

# # relationship to organizer
# organizer = relationship("Organizer", back_populates="events")
# # relatiosnhip to guests
# guest = relationship("Guests", back_populates="events")


# class TicketTier(Base):
#     __tablename__ = "tickettier"
#     id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4))
#     event_id = Column(String(36), Foreign_key=True)
#     name = Column(str)
#     price = Column(float)
#     quantity = Column(int)
#     description = Column(str)
#     created_at = Column(DateTime(timezone=True), Default=datetime.utcnow)
#     updated_at = Column(
#         DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow
#     )


# # relationship to event
# event = relationship("events", back_populates="tickettier")
# # relationship to guests
# guest = relationship("guests", back_populates="tickettier")


# class AccessControl:
#     __table_name__ = "accesscontrol"
#     id = Column(UUID, Primary_key=True)
#     event_id = Column(UUID, Foreign_key=True)
#     access_type = Column(str)
#     qr_enabled = Column(bool, Default=True)
#     invite_only = Column(bool, Default=True)
#     created_at = Column(DateTime(timezone=True), Default=datetime.utcnow)

#     # relationhship to evenhts
#     event = relationship("events", back_populates="accesscontrol")
#     guests = relationship("guests", back_populates="acesscontrol")


# class Branding:
#     __tabglename__ = "branding"
#     id = Column(UUID, Primary_key=True)
#     event_id = Column(UUID, Foreign_key=True)
#     theme_color = Column(str)
#     logo = Column(str)  # can be file_name or image url
#     banner = Column(str)  # can be file_name or image url
#     email_template = Column(str)

#     # relationship to events
#     events = relationship("events", back_populates="branding")
