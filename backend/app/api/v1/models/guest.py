from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class RSVPStatus(str, enum.Enum):
    pending = "pending"       # invited, not yet responded
    confirmed = "confirmed"   # accepted
    declined = "declined"     # declined
    waitlisted = "waitlisted" # event full, on waitlist
    checked_in = "checked_in" # arrived at event


class InviteMethod(str, enum.Enum):
    email = "email"
    sms = "sms"
    both = "both"


class Guest(Base):
    __tablename__ = "guests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    invited_by = Column(String(36), ForeignKey("organizers.id"), nullable=False)

    # guest identity
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String, nullable=True)
    phone_number = Column(String(20), nullable=True)

    # RSVP
    rsvp_status = Column(Enum(RSVPStatus), default=RSVPStatus.pending, nullable=False)
    rsvp_token = Column(String, unique=True, nullable=True)  # for email/sms link
    rsvp_responded_at = Column(DateTime, nullable=True)

    # plus-one
    plus_one_allowed = Column(Boolean, default=False)
    plus_one_name = Column(String(200), nullable=True)
    plus_one_checked_in = Column(Boolean, default=False)

    # waitlist
    waitlist_position = Column(Integer, nullable=True)

    # invite
    invite_method = Column(Enum(InviteMethod), default=InviteMethod.email)
    invite_sent_at = Column(DateTime, nullable=True)

    # check-in
    checked_in_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", backref="guests")
    inviter = relationship("User", foreign_keys=[invited_by])