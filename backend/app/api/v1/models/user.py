from datetime import datetime
import uuid
from sqlalchemy import DateTime, Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class User(Base):
    __tablename__ = "organizers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), nullable=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String)
    is_verified = Column(Boolean, default=False)
    is_logged_in = Column(Boolean, default=False)
    # password = Column(str, nullable=False)
    hashed_password = Column(String, nullable=True) #nullable for magic-link users
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)