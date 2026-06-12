from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.api.v1.schemas.guest import (
    GuestInviteSingle, GuestInviteBulk,
    RSVPResponse, GuestResponse, GuestListResponse, RSVPStatus
)
from app.api.v1.services.guest import (
    invite_guest, invite_guests_bulk, respond_to_rsvp,
    update_guest_status, get_guest_list, remove_guest, resend_invite
)
from app.api.v1.models.user import User, UserRole
from app.core.security import get_current_user
from app.db.database import get_db

guest_router = APIRouter()


def require_organizer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.organizer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizers can access this resource."
        )
    return current_user


@guest_router.post("/{event_id}/invite", response_model=GuestResponse)
async def invite_single(
    event_id: str,
    payload: GuestInviteSingle,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    return await invite_guest(db, event_id, current_user.id, payload)


@guest_router.post("/{event_id}/invite/bulk")
async def invite_bulk(
    event_id: str,
    payload: GuestInviteBulk,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    return await invite_guests_bulk(db, event_id, current_user.id, payload)


@guest_router.post("/{event_id}/guests/{guest_id}/resend")
async def resend(
    event_id: str,
    guest_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    return await resend_invite(db, guest_id, event_id, current_user.id)


@guest_router.post("/rsvp", response_model=GuestResponse)
async def rsvp(
    payload: RSVPResponse,
    db: AsyncSession = Depends(get_db)
):
    return await respond_to_rsvp(db, payload)


@guest_router.get("/{event_id}/guests", response_model=GuestListResponse)
async def list_guests(
    event_id: str,
    status: Optional[RSVPStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    return await get_guest_list(db, event_id, current_user.id, status, page, page_size)


@guest_router.patch("/{event_id}/guests/{guest_id}/status", response_model=GuestResponse)
async def update_status(
    event_id: str,
    guest_id: str,
    new_status: RSVPStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    return await update_guest_status(db, guest_id, event_id, current_user.id, new_status)


@guest_router.delete("/{event_id}/guests/{guest_id}")
async def remove(
    event_id: str,
    guest_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    return await remove_guest(db, guest_id, event_id, current_user.id)