from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.db.database import Base
import uuid

class MagicLinkToken(Base):
    __tablename__ = "magic_link_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    token = Column(String, unique=True, nullable= False)
    user_id = Column(String(36), ForeignKey("organizers.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
