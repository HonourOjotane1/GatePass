from datetime import datetime
import uuid
from sqlalchemy import DateTime, Column, String, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    organizer = "organizer"
    staff = "staff"
    guest = "guest"

class User(Base):
    __tablename__ = "organizers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), nullable=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String)
    phone_number = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.organizer, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_logged_in = Column(Boolean, default=False)
    # password = Column(str, nullable=False)
    hashed_password = Column(String, nullable=True) #nullable for magic-link users
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)