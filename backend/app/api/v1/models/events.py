from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy import Boolean, Column, Enum, Float, Integer, String, Text, DateTime, ForeignKey
import enum
from app.db.database import Base


class EventStatus(str, enum.Enum):
    draft = "draft"
    published= "published"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class EventVisibility(str, enum.Enum):
    public = "public"
    private = "private"
    invite_only = "invite_only"


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True,default=lambda: str(uuid.uuid4()))
    organizer_id = Column(String(36), ForeignKey("organizers.id"), nullable=False)  # foreign_key to organizer
    title = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String(300), nullable=True)
    start_time = Column(DateTime, nullable=True) # nullable for wizard draft support
    end_time = Column(DateTime, nullable=True) # nullable for wizard draft support 
    status = Column(Enum(EventStatus), default=EventStatus.draft, nullable=False)
    visibility = Column(Enum(EventVisibility), default=EventVisibility.public, nullable=False)
    total_tickets = Column(Integer, default=0)
    tickets_sold = Column(Integer, default=0)
    ticket_price = Column(Float, default=0.0)
    check_ins = Column(Integer, default=0)
    is_free = Column(Boolean, default=False)
    wizard_step = Column(Integer, default=1) # tracks how far wizard has progressed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organizer = relationship("User", foreign_keys=[organizer_id], backref="events")
    co_hosts = relationship("EventCoHost", back_populates="event", cascade="all, delete-orphan", lazy="raise")


#TO-DO; CREATE A PYDANTIC MODEL FOR DRAFT SUCH THAT PAYLOAD CAN PASS A DICT!

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


