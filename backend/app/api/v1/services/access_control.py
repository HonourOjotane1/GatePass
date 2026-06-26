from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from fastapi import HTTPException, status
from app.api.v1.models.access_control import (
    EventZone, ZoneAccessRule, GuestQRCode, CheckInLog,
    EventStaffAssignment, CheckInStatus, StaffRole, TierLevel, ZoneType
)
from app.api.v1.models.guest import Guest, RSVPStatus
from app.api.v1.models.events import Event
from app.api.v1.models.user import User
from app.api.v1.schemas.access_control import (
    ZoneCreate, CheckInRequest, OfflineSyncRequest,
    CheckInResult, StaffAssign
)
from app.utils.location import is_within_radius
from app.utils.qr import generate_qr_token, decode_qr_token, generate_qr_image_base64
import os


# ── Permission helpers ─────────────────────────────────────────────────

async def get_staff_role(
    db: AsyncSession, event_id: str, user_id: str
) -> StaffRole | None:
    """Get the staff role of a user for a specific event."""
    result = await db.execute(
        select(EventStaffAssignment).where(
            and_(
                EventStaffAssignment.event_id == event_id,
                EventStaffAssignment.user_id == user_id
            )
        )
    )
    assignment = result.scalar_one_or_none()

    if not assignment:
        # check if they're the event organizer
        event_result = await db.execute(
            select(Event).where(
                and_(Event.id == event_id, Event.organizer_id == user_id)
            )
        )
        if event_result.scalar_one_or_none():
            return StaffRole.organizer
        return None

    return assignment.staff_role


async def require_event_access(
    db: AsyncSession,
    event_id: str,
    user_id: str,
    minimum_role: StaffRole = StaffRole.check_in_staff
):
    """Raise 403 if user doesn't have the required role for this event."""
    role = await get_staff_role(db, event_id, user_id)
    if role is None:
        raise HTTPException(status_code=403, detail="Not authorised for this event.")

    role_hierarchy = {
        StaffRole.check_in_staff: 1,
        StaffRole.zone_manager: 2,
        StaffRole.organizer: 3
    }

    if role_hierarchy.get(role, 0) < role_hierarchy.get(minimum_role, 0):
        raise HTTPException(
            status_code=403,
            detail=f"This action requires at least {minimum_role} access."
        )


# ── Zone management ────────────────────────────────────────────────────

async def create_zone(
    db: AsyncSession, event_id: str, organizer_id: str, data: ZoneCreate
) -> EventZone:
    await require_event_access(db, event_id, organizer_id, StaffRole.organizer)

    zone = EventZone(
        event_id=event_id,
        name=data.name,
        zone_type=data.zone_type,
        description=data.description,
        access_start=data.access_start,
        access_end=data.access_end,
        latitude=data.latitude,
        longitude=data.longitude,
        radius_meters=data.radius_meters,
        capacity=data.capacity
    )
    db.add(zone)
    await db.flush()  # get zone.id before adding rules

    for tier in data.allowed_tiers:
        rule = ZoneAccessRule(zone_id=zone.id, tier_level=tier)
        db.add(rule)

    await db.commit()
    await db.refresh(zone)
    return zone


async def get_event_zones(db: AsyncSession, event_id: str) -> list:
    result = await db.execute(
        select(EventZone).where(EventZone.event_id == event_id)
    )
    return result.scalars().all()


# ── QR code generation ─────────────────────────────────────────────────

async def generate_guest_qr(
    db: AsyncSession,
    guest_id: str,
    event_id: str,
    organizer_id: str,
    tier_level: TierLevel = TierLevel.standard
) -> dict:
    await require_event_access(db, event_id, organizer_id, StaffRole.organizer)

    # verify guest belongs to this event
    result = await db.execute(
        select(Guest).where(
            and_(Guest.id == guest_id, Guest.event_id == event_id)
        )
    )
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found.")

    if guest.rsvp_status != RSVPStatus.confirmed:
        raise HTTPException(
            status_code=400,
            detail="QR code can only be generated for confirmed guests."
        )

    # deactivate any existing QR codes for this guest+event
    existing = await db.execute(
        select(GuestQRCode).where(
            and_(
                GuestQRCode.guest_id == guest_id,
                GuestQRCode.event_id == event_id,
                GuestQRCode.is_active == True
            )
        )
    )
    for old_qr in existing.scalars().all():
        old_qr.is_active = False

    qr_token = generate_qr_token(guest_id, event_id, tier_level.value)

    qr_record = GuestQRCode(
        guest_id=guest_id,
        event_id=event_id,
        qr_token=qr_token,
        tier_level=tier_level
    )
    db.add(qr_record)
    await db.commit()

    qr_image = generate_qr_image_base64(qr_token)

    return {
        "guest_id": guest_id,
        "event_id": event_id,
        "qr_token": qr_token,
        "tier_level": tier_level,
        "qr_image_base64": qr_image
    }


# ── Core check-in logic ────────────────────────────────────────────────

async def process_check_in(
    db: AsyncSession,
    event_id: str,
    staff_user_id: str,
    data: CheckInRequest
) -> CheckInResult:
    """
    Full check-in pipeline:
    1. Validate QR token
    2. Validate location
    3. Validate time window
    4. Validate zone access
    5. Check for duplicate check-in
    6. Log result
    7. Update guest status
    """
    await require_event_access(db, event_id, staff_user_id, StaffRole.check_in_staff)

    scanned_at = data.scanned_at or datetime.utcnow()
    log_kwargs = {
        "event_id": event_id,
        "zone_id": data.zone_id,
        "scanned_by": staff_user_id,
        "qr_token": data.qr_token,
        "scan_latitude": data.scan_latitude,
        "scan_longitude": data.scan_longitude,
        "scanned_at": scanned_at,
        "synced_at": datetime.utcnow(),
        "is_offline_sync": False
    }

    # ── Step 1: Decode and validate QR token ──────────────────────────
    payload = decode_qr_token(data.qr_token)
    if not payload:
        return await _log_and_return(
            db, log_kwargs, CheckInStatus.invalid_qr,
            "Invalid or expired QR code.", guest_id=None
        )

    qr_event_id = payload.get("event_id")
    guest_id = payload.get("guest_id")
    tier_level = payload.get("tier_level", TierLevel.standard)

    if qr_event_id != event_id:
        return await _log_and_return(
            db, log_kwargs, CheckInStatus.invalid_qr,
            "QR code does not belong to this event.", guest_id=guest_id
        )

    # verify QR is active in DB
    qr_result = await db.execute(
        select(GuestQRCode).where(
            and_(
                GuestQRCode.qr_token == data.qr_token,
                GuestQRCode.is_active == True
            )
        )
    )
    qr_record = qr_result.scalar_one_or_none()
    if not qr_record:
        return await _log_and_return(
            db, log_kwargs, CheckInStatus.expired,
            "QR code has been deactivated or already used.", guest_id=guest_id
        )

    # ── Step 2: Fetch guest ────────────────────────────────────────────
    guest_result = await db.execute(select(Guest).where(Guest.id == guest_id))
    guest = guest_result.scalar_one_or_none()
    if not guest:
        return await _log_and_return(
            db, log_kwargs, CheckInStatus.invalid_qr,
            "Guest record not found.", guest_id=guest_id
        )

    log_kwargs["guest_id"] = guest_id
    guest_name = f"{guest.first_name or ''} {guest.last_name or ''}".strip() or "Guest"

    # ── Step 3: Check for duplicate check-in ──────────────────────────
    if guest.rsvp_status == RSVPStatus.checked_in:
        return await _log_and_return(
            db, log_kwargs, CheckInStatus.already_checked_in,
            f"{guest_name} has already checked in.", guest_id=guest_id,
            guest_name=guest_name, tier_level=tier_level
        )

    # ── Step 4: Location validation ────────────────────────────────────
    location_valid = None
    distance = None

    if data.scan_latitude is not None and data.scan_longitude is not None:
        # check against event-level location first
        event_result = await db.execute(select(Event).where(Event.id == event_id))
        event = event_result.scalar_one_or_none()

        # check against zone location if zone provided
        zone = None
        zone_lat, zone_lon, zone_radius = None, None, 100.0

        if data.zone_id:
            zone_result = await db.execute(
                select(EventZone).where(EventZone.id == data.zone_id)
            )
            zone = zone_result.scalar_one_or_none()
            if zone and zone.latitude and zone.longitude:
                zone_lat = zone.latitude
                zone_lon = zone.longitude
                zone_radius = zone.radius_meters

        # prefer zone location, fall back to event location
        check_lat = zone_lat
        check_lon = zone_lon
        check_radius = zone_radius

        if check_lat is None:
            # try to get event location from event model
            # Event model stores location as string — use zone only for now
            # If your event model adds lat/lon later, use it here
            check_lat = None

        if check_lat is not None:
            location_valid, distance = is_within_radius(
                data.scan_latitude, data.scan_longitude,
                check_lat, check_lon, check_radius
            )
            log_kwargs["location_valid"] = location_valid
            log_kwargs["distance_from_venue"] = distance

            if not location_valid:
                return await _log_and_return(
                    db, log_kwargs, CheckInStatus.wrong_location,
                    f"Scan location is {distance}m from venue. Must be within {check_radius}m.",
                    guest_id=guest_id, guest_name=guest_name,
                    distance=distance, location_valid=False
                )

    # ── Step 5: Time window validation ────────────────────────────────
    if data.zone_id and zone:
        now = datetime.utcnow()
        if zone.access_start and now < zone.access_start:
            return await _log_and_return(
                db, log_kwargs, CheckInStatus.outside_time_window,
                f"Zone {zone.name} does not open until {zone.access_start}.",
                guest_id=guest_id, guest_name=guest_name
            )
        if zone.access_end and now > zone.access_end:
            return await _log_and_return(
                db, log_kwargs, CheckInStatus.outside_time_window,
                f"Zone {zone.name} access ended at {zone.access_end}.",
                guest_id=guest_id, guest_name=guest_name
            )

    # ── Step 6: Zone tier access validation ───────────────────────────
    if data.zone_id and zone:
        rules_result = await db.execute(
            select(ZoneAccessRule).where(ZoneAccessRule.zone_id == data.zone_id)
        )
        allowed_tiers = [r.tier_level.value for r in rules_result.scalars().all()]

        if allowed_tiers and tier_level not in allowed_tiers:
            return await _log_and_return(
                db, log_kwargs, CheckInStatus.invalid_zone,
                f"Tier '{tier_level}' is not permitted in zone '{zone.name}'.",
                guest_id=guest_id, guest_name=guest_name
            )

        # zone capacity check
        if zone.capacity and zone.current_occupancy >= zone.capacity:
            return await _log_and_return(
                db, log_kwargs, CheckInStatus.denied,
                f"Zone '{zone.name}' is at full capacity.",
                guest_id=guest_id, guest_name=guest_name
            )

        zone.current_occupancy += 1

    # ── Step 7: Success — update guest status ─────────────────────────
    guest.rsvp_status = RSVPStatus.checked_in
    guest.checked_in_at = datetime.utcnow()

    await _log_and_return(
        db, log_kwargs, CheckInStatus.success,
        f"{guest_name} checked in successfully.",
        guest_id=guest_id, guest_name=guest_name,
        tier_level=tier_level, distance=distance,
        location_valid=location_valid,
        zone_name=zone.name if zone else None,
        commit=False  # we commit below with guest update
    )

    await db.commit()

    return CheckInResult(
        status=CheckInStatus.success,
        message=f"{guest_name} checked in successfully.",
        guest_name=guest_name,
        tier_level=tier_level,
        zone_name=zone.name if (data.zone_id and zone) else None,
        distance_from_venue=distance,
        location_valid=location_valid
    )


async def _log_and_return(
    db: AsyncSession,
    log_kwargs: dict,
    check_status: CheckInStatus,
    message: str,
    guest_id: str = None,
    guest_name: str = None,
    tier_level: str = None,
    distance: float = None,
    location_valid: bool = None,
    zone_name: str = None,
    commit: bool = True
) -> CheckInResult:
    """Write a check-in log entry and return a CheckInResult."""
    log = CheckInLog(
        **{k: v for k, v in log_kwargs.items()
           if k in CheckInLog.__table__.columns.keys()},
        status=check_status,
        denial_reason=message if check_status != CheckInStatus.success else None,
        location_valid=location_valid,
        distance_from_venue=distance
    )
    if guest_id:
        log.guest_id = guest_id

    db.add(log)
    if commit:
        await db.commit()

    return CheckInResult(
        status=check_status,
        message=message,
        guest_name=guest_name,
        tier_level=tier_level,
        zone_name=zone_name,
        distance_from_venue=distance,
        location_valid=location_valid
    )


# ── Offline sync ───────────────────────────────────────────────────────

async def sync_offline_scans(
    db: AsyncSession,
    staff_user_id: str,
    data: OfflineSyncRequest
) -> dict:
    """Process a batch of offline scans in chronological order."""
    await require_event_access(db, data.event_id, staff_user_id, StaffRole.check_in_staff)

    # sort by scanned_at so earlier scans are processed first
    scans = sorted(data.scans, key=lambda s: s.scanned_at)

    results = []
    synced = 0
    failed = 0

    for scan in scans:
        check_in_request = CheckInRequest(
            qr_token=scan.qr_token,
            zone_id=scan.zone_id,
            scan_latitude=scan.scan_latitude,
            scan_longitude=scan.scan_longitude,
            scanned_at=scan.scanned_at
        )
        result = await process_check_in(db, data.event_id, staff_user_id, check_in_request)

        # mark as offline sync in the log
        log_result = await db.execute(
            select(CheckInLog).where(
                and_(
                    CheckInLog.qr_token == scan.qr_token,
                    CheckInLog.scanned_at == scan.scanned_at
                )
            )
        )
        log = log_result.scalars().first()
        if log:
            log.is_offline_sync = True
            log.synced_at = datetime.utcnow()

        results.append(result)
        if result.status == CheckInStatus.success:
            synced += 1
        else:
            failed += 1

    await db.commit()

    return {
        "total": len(scans),
        "synced": synced,
        "failed": failed,
        "results": results
    }


# ── Staff assignment ───────────────────────────────────────────────────

async def assign_staff(
    db: AsyncSession,
    event_id: str,
    organizer_id: str,
    data: StaffAssign
) -> EventStaffAssignment:
    await require_event_access(db, event_id, organizer_id, StaffRole.organizer)

    user_result = await db.execute(select(User).where(User.email == data.email))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    existing = await db.execute(
        select(EventStaffAssignment).where(
            and_(
                EventStaffAssignment.event_id == event_id,
                EventStaffAssignment.user_id == user.id
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already assigned to this event.")

    assignment = EventStaffAssignment(
        event_id=event_id,
        user_id=user.id,
        staff_role=data.staff_role,
        zone_id=data.zone_id,
        assigned_by=organizer_id
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


# ── Check-in stats and logs ────────────────────────────────────────────

async def get_checkin_stats(
    db: AsyncSession, event_id: str, user_id: str
) -> dict:
    await require_event_access(db, event_id, user_id, StaffRole.check_in_staff)

    logs_result = await db.execute(
        select(CheckInLog).where(CheckInLog.event_id == event_id)
    )
    logs = logs_result.scalars().all()

    by_status = {}
    by_zone = {}

    for log in logs:
        s = log.status.value
        by_status[s] = by_status.get(s, 0) + 1
        if log.zone_id:
            z = log.zone_id
            by_zone[z] = by_zone.get(z, 0) + 1

    return {
        "total_checked_in": by_status.get("success", 0),
        "total_denied": sum(v for k, v in by_status.items() if k != "success"),
        "total_scans": len(logs),
        "by_zone": by_zone,
        "by_status": by_status
    }


async def get_checkin_logs(
    db: AsyncSession,
    event_id: str,
    user_id: str,
    page: int = 1,
    page_size: int = 50
) -> dict:
    await require_event_access(db, event_id, user_id, StaffRole.check_in_staff)

    total_result = await db.execute(
        select(func.count()).where(CheckInLog.event_id == event_id)
    )
    total = total_result.scalar()

    offset = (page - 1) * page_size
    result = await db.execute(
        select(CheckInLog)
        .where(CheckInLog.event_id == event_id)
        .order_by(CheckInLog.scanned_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    logs = result.scalars().all()

    return {
        "items": logs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-total // page_size)
    }