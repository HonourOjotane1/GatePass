from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Boolean, Integer, Float, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class ZoneType(str, enum.Enum):
    general = "general"
    vip = "vip"
    backstage = "backstage"
    press = "press"
    staff_only = "staff_only"


class TierLevel(str, enum.Enum):
    standard = "standard"
    premium = "premium"
    vip = "vip"
    vvip = "vvip"


class CheckInStatus(str, enum.Enum):
    success = "success"
    denied = "denied"
    already_checked_in = "already_checked_in"
    invalid_qr = "invalid_qr"
    wrong_location = "wrong_location"
    outside_time_window = "outside_time_window"
    invalid_zone = "invalid_zone"
    expired = "expired"


class StaffRole(str, enum.Enum):
    organizer = "organizer"
    check_in_staff = "check_in_staff"
    zone_manager = "zone_manager"


class EventZone(Base):
    """Defines zones within an event with access rules."""
    __tablename__ = "event_zones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    name = Column(String(100), nullable=False)
    zone_type = Column(Enum(ZoneType), default=ZoneType.general, nullable=False)
    description = Column(String(300), nullable=True)

    # access time window for this zone
    access_start = Column(DateTime, nullable=True)
    access_end = Column(DateTime, nullable=True)

    # location validation for this zone
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    radius_meters = Column(Float, default=100.0)  # allowed radius from zone location

    # capacity
    capacity = Column(Integer, nullable=True)
    current_occupancy = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", backref="zones")
    access_rules = relationship("ZoneAccessRule", back_populates="zone", cascade="all, delete-orphan")


class ZoneAccessRule(Base):
    """Which ticket tiers can access which zones."""
    __tablename__ = "zone_access_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_id = Column(String(36), ForeignKey("event_zones.id"), nullable=False)
    tier_level = Column(Enum(TierLevel), nullable=False)

    zone = relationship("EventZone", back_populates="access_rules")


class GuestQRCode(Base):
    """QR code issued per guest per event."""
    __tablename__ = "guest_qr_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    guest_id = Column(String(36), ForeignKey("guests.id"), nullable=False)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)

    qr_token = Column(String, unique=True, nullable=False)  # signed JWT
    tier_level = Column(Enum(TierLevel), default=TierLevel.standard, nullable=False)

    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    guest = relationship("Guest", backref="qr_codes")
    event = relationship("Event", backref="qr_codes")


class CheckInLog(Base):
    """Every scan attempt — success or failure — is logged."""
    __tablename__ = "check_in_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    guest_id = Column(String(36), ForeignKey("guests.id"), nullable=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    zone_id = Column(String(36), ForeignKey("event_zones.id"), nullable=True)
    scanned_by = Column(String(36), ForeignKey("organizers.id"), nullable=True)  # staff who scanned

    qr_token = Column(String, nullable=True)  # raw token that was scanned
    status = Column(Enum(CheckInStatus), nullable=False)
    denial_reason = Column(String(300), nullable=True)

    # location at time of scan
    scan_latitude = Column(Float, nullable=True)
    scan_longitude = Column(Float, nullable=True)
    location_valid = Column(Boolean, nullable=True)
    distance_from_venue = Column(Float, nullable=True)  # metres

    # offline queue support
    scanned_at = Column(DateTime, nullable=False)  # when scan actually happened
    synced_at = Column(DateTime, nullable=True)    # when it reached the server
    is_offline_sync = Column(Boolean, default=False)

    extra_data = Column(JSON, nullable=True)  # flexible field for future use

    guest = relationship("Guest", backref="check_in_logs")
    event = relationship("Event", backref="check_in_logs")
    zone = relationship("EventZone", backref="check_in_logs")
    scanner = relationship("User", foreign_keys=[scanned_by])


class EventStaffAssignment(Base):
    """Staff assigned to an event with a specific role and optional zone."""
    __tablename__ = "event_staff_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("organizers.id"), nullable=False)
    staff_role = Column(Enum(StaffRole), default=StaffRole.check_in_staff, nullable=False)
    zone_id = Column(String(36), ForeignKey("event_zones.id"), nullable=True)  # zone manager only

    assigned_by = Column(String(36), ForeignKey("organizers.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", backref="staff_assignments")
    user = relationship("User", foreign_keys=[user_id], backref="staff_assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])
    zone = relationship("EventZone", backref="staff_assignments")