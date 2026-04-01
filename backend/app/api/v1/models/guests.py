from datetime import datetime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import DateTime, Column, ForeignKey
from uuid import UUID
from pydantic import EmailStr

Base = declarative_base()


class Guest(Base):
    __tablename__ = "guest"
    id = Column(UUID, primary_key=True)
    event_id = Column(UUID, ForeignKey("events".id))  # foreign_key to events
    full_name = Column(str(55), nullable=False)
    email = Column(EmailStr, nullable=False)
    status = Column(str(25), Default='Regular')
    is_verified = Column(bool(Default=False))
    is_checked_in = Column(bool(Default=False))
    created_at = Column(DateTime(timezone=True), Default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow)
    # relationship to events
    events = relationship("events", back_populates="guest")
