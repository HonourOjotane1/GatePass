from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ZoneType(str, Enum):
    general = "general"
    vip = "vip"
    backstage = "backstage"
    press = "press"
    staff_only = "staff_only"


class TierLevel(str, Enum):
    standard = "standard"
    premium = "premium"
    vip = "vip"
    vvip = "vvip"


class CheckInStatus(str, Enum):
    success = "success"
    denied = "denied"
    already_checked_in = "already_checked_in"
    invalid_qr = "invalid_qr"
    wrong_location = "wrong_location"
    outside_time_window = "outside_time_window"
    invalid_zone = "invalid_zone"
    expired = "expired"


class StaffRole(str, Enum):
    organizer = "organizer"
    check_in_staff = "check_in_staff"
    zone_manager = "zone_manager"


# ── Zone schemas ───────────────────────────────────────────────────────

class ZoneCreate(BaseModel):
    name: str
    zone_type: ZoneType = ZoneType.general
    description: Optional[str] = None
    access_start: Optional[datetime] = None
    access_end: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_meters: float = 100.0
    capacity: Optional[int] = None
    allowed_tiers: List[TierLevel] = [TierLevel.standard]


class ZoneResponse(BaseModel):
    id: str
    event_id: str
    name: str
    zone_type: ZoneType
    description: Optional[str] = None
    access_start: Optional[datetime] = None
    access_end: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_meters: float
    capacity: Optional[int] = None
    current_occupancy: int
    allowed_tiers: List[TierLevel] = []

    class Config:
        from_attributes = True


# ── QR code schemas ────────────────────────────────────────────────────

class QRCodeResponse(BaseModel):
    guest_id: str
    event_id: str
    qr_token: str
    tier_level: TierLevel
    expires_at: Optional[datetime] = None
    qr_image_url: Optional[str] = None  # base64 or URL

    class Config:
        from_attributes = True


# ── Check-in schemas ───────────────────────────────────────────────────

class CheckInRequest(BaseModel):
    """Sent by the check-in app when a QR is scanned."""
    qr_token: str
    zone_id: Optional[str] = None
    scan_latitude: Optional[float] = None
    scan_longitude: Optional[float] = None
    scanned_at: datetime  # client timestamp for offline support


class CheckInResult(BaseModel):
    status: CheckInStatus
    message: str
    guest_name: Optional[str] = None
    tier_level: Optional[str] = None
    zone_name: Optional[str] = None
    distance_from_venue: Optional[float] = None
    location_valid: Optional[bool] = None


# ── Offline sync schemas ───────────────────────────────────────────────

class OfflineScanItem(BaseModel):
    """Single scan that happened offline."""
    qr_token: str
    zone_id: Optional[str] = None
    scan_latitude: Optional[float] = None
    scan_longitude: Optional[float] = None
    scanned_at: datetime
    scanned_by_device: Optional[str] = None


class OfflineSyncRequest(BaseModel):
    """Batch of scans to sync when connectivity is restored."""
    event_id: str
    scans: List[OfflineScanItem]


class OfflineSyncResult(BaseModel):
    total: int
    synced: int
    failed: int
    results: List[CheckInResult]


# ── Staff assignment schemas ───────────────────────────────────────────

class StaffAssign(BaseModel):
    email: str
    staff_role: StaffRole = StaffRole.check_in_staff
    zone_id: Optional[str] = None


class StaffAssignmentResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    staff_role: StaffRole
    zone_id: Optional[str] = None

    class Config:
        from_attributes = True


# ── Check-in log schemas ───────────────────────────────────────────────

class CheckInLogResponse(BaseModel):
    id: str
    guest_id: Optional[str] = None
    event_id: str
    zone_id: Optional[str] = None
    status: CheckInStatus
    denial_reason: Optional[str] = None
    scan_latitude: Optional[float] = None
    scan_longitude: Optional[float] = None
    location_valid: Optional[bool] = None
    distance_from_venue: Optional[float] = None
    scanned_at: datetime
    is_offline_sync: bool

    class Config:
        from_attributes = True


class CheckInStatsResponse(BaseModel):
    total_checked_in: int
    total_denied: int
    total_scans: int
    by_zone: dict
    by_status: dict