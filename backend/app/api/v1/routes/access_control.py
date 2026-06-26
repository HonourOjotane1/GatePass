from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.api.v1.schemas.access_control import (
    ZoneCreate, ZoneResponse, CheckInRequest, CheckInResult,
    OfflineSyncRequest, OfflineSyncResult, StaffAssign,
    StaffAssignmentResponse, CheckInStatsResponse, TierLevel
)
from app.api.v1.services.access_control import (
    create_zone, get_event_zones, generate_guest_qr,
    process_check_in, sync_offline_scans,
    assign_staff, get_checkin_stats, get_checkin_logs
)
from app.api.v1.models.user import User
from app.core.security import get_current_user
from app.db.database import get_db

access_router = APIRouter()


# ── Zone management ────────────────────────────────────────────────────

@access_router.post("/{event_id}/zones", response_model=ZoneResponse)
async def create_event_zone(
    event_id: str,
    payload: ZoneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await create_zone(db, event_id, current_user.id, payload)


@access_router.get("/{event_id}/zones")
async def list_zones(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_event_zones(db, event_id)


# ── QR code generation ─────────────────────────────────────────────────

@access_router.post("/{event_id}/guests/{guest_id}/qr")
async def generate_qr(
    event_id: str,
    guest_id: str,
    tier_level: TierLevel = TierLevel.standard,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await generate_guest_qr(db, guest_id, event_id, current_user.id, tier_level)


# ── Check-in ───────────────────────────────────────────────────────────

@access_router.post("/{event_id}/checkin", response_model=CheckInResult)
async def check_in(
    event_id: str,
    payload: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await process_check_in(db, event_id, current_user.id, payload)


# ── Offline sync ───────────────────────────────────────────────────────

@access_router.post("/{event_id}/checkin/sync")
async def sync_offline(
    event_id: str,
    payload: OfflineSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await sync_offline_scans(db, current_user.id, payload)


# ── Staff assignment ───────────────────────────────────────────────────

@access_router.post("/{event_id}/staff", response_model=StaffAssignmentResponse)
async def assign_event_staff(
    event_id: str,
    payload: StaffAssign,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await assign_staff(db, event_id, current_user.id, payload)


# ── Stats and logs ─────────────────────────────────────────────────────

@access_router.get("/{event_id}/checkin/stats", response_model=CheckInStatsResponse)
async def checkin_stats(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_checkin_stats(db, event_id, current_user.id)


@access_router.get("/{event_id}/checkin/logs")
async def checkin_logs(
    event_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_checkin_logs(db, event_id, current_user.id, page, page_size)