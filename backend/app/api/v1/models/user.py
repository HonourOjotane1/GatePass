from datetime import datetime
from sqlalchemy.orm import declarativebase
from sqlalchemy import DateTime, column, EmailStr, Timestamp
from uuid import UUID

Base = declarativebase()


class User(Base):
    __tablename__ = "organizers"
    id = column(UUID(), primary_key=True)
    username = column(str(50), nullable=False)
    first_name = column(str(50))
    last_name = column(str(50))
    email = column(EmailStr)
    is_verified = column(bool(Default=False))
    is_logged_in = column(bool(Default=False))
    hashed_password = column(str)
    created_at = column(DateTime(timezone=True), Default=datetime.utcnow)
    updated_at = column(DateTime(timezone=True), Default=datetime.utcnow, onupdate=datetime.utcnow)