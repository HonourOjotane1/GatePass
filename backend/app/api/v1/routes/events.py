from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from fastapi import UploadFile, File
import os
import uuid as uuid_lib
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.api.v1.schemas.event import (
    WizardStep1,
    WizardStep2,
    WizardStep3,
    WizardStep4,
    EventCreate,
    EventResponse,
    EventStatsResponse,
    EventListResponse,
    DashboardStatsResponse,
    CoHostInvite,
    ShareableLinkResponse,
    EventDetailResponse,
)
from app.api.v1.models.events import EventStatus
from app.api.v1.models.cohost import CoHostPermission
from app.api.v1.models.user import User, UserRole
from app.api.v1.services.events import (
    wizard_step1,
    wizard_step2,
    wizard_step3,
    wizard_step4,
    publish_event,
    save_draft,
    create_event,
    get_organizer_events,
    update_event_status,
    get_event_stats,
    get_dashboard_stats,
    invite_co_host,
    accept_co_host_invite,
    update_co_host_permission,
    remove_co_host,
    get_event_by_slug,
    get_shareable_link,
    _get_own_event,
    get_event_detail,
)
from app.core.security import get_current_user
from app.db.database import get_db

event_router = APIRouter()


# ── Role guard — defined BEFORE any route that uses it ────────────────


def require_organizer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.organizer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizers can access this resource.",
        )
    return current_user


# ── Wizard endpoints ───────────────────────────────────────────────────


@event_router.post("/wizard/step1", response_model=EventResponse)
async def step1(
    payload: WizardStep1,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await wizard_step1(db, current_user.id, payload)


@event_router.patch("/wizard/{event_id}/step2", response_model=EventResponse)
async def step2(
    event_id: str,
    payload: WizardStep2,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await wizard_step2(db, event_id, current_user.id, payload)


@event_router.patch("/wizard/{event_id}/step3", response_model=EventResponse)
async def step3(
    event_id: str,
    payload: WizardStep3,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await wizard_step3(db, event_id, current_user.id, payload)


@event_router.patch("/wizard/{event_id}/step4", response_model=EventResponse)
async def step4(
    event_id: str,
    payload: WizardStep4,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await wizard_step4(db, event_id, current_user.id, payload)


# - Cover Image Upload-
@event_router.post("/upload/cover-image")
async def upload_cover_image(
    file: UploadFile = File(...), current_user: User = Depends(require_organizer)
):
    """
    Upload a cover image and return the URL to include in wizard step 1.
    In dev: saves to local /uploads folder.
    In prod; swap this for an S3/Cloudinary upload.
    """
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="Only JPEG AND PNG files are allowed."
        )

    max_size_mb = 100 * 1024 * 1024  # 100 MB
    contents = await file.read()
    if len(contents) > max_size_mb:
        raise HTTPException(
            status_code=400, detail="File size must be less than 100mb."
        )

    # save locally for dev
    upload_dir = "uploads/covers"
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"{uuid_lib.uuid4()}-{file.filename}"
    filepath = f"{upload_dir}/{file_name}"

    with open(filepath, "wb") as f:
        f.write(contents)

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8000")
    file_url = f"{frontend_url}/uploads/covers/{file_name}"

    return {"cover_image_url": file_url}


# ── Draft & publish ────────────────────────────────────────────────────


@event_router.patch("/wizard/{event_id}/draft", response_model=EventResponse)
async def draft(
    event_id: str,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await save_draft(db, event_id, current_user.id, payload)


@event_router.post("/wizard/{event_id}/publish", response_model=EventResponse)
async def publish(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await publish_event(db, event_id, current_user.id)


# ── Direct create (no wizard) ──────────────────────────────────────────


@event_router.post("/", response_model=EventResponse)
async def create(
    payload: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await create_event(db, current_user.id, payload)


@event_router.get("/dashboard/debug")
async def dashboard_debug(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    from app.api.v1.models.guest import Guest, RSVPStatus
    from sqlalchemy import func

    events_result = await db.execute(
        select(Event).where(Event.organizer_id == current_user.id)
    )
    events = events_result.scalars().all()
    event_ids = [e.id for e in events]

    async def count_guests(s=None):
        q = select(func.count()).where(Guest.event_id.in_(event_ids))
        if s:
            q = q.where(Guest.rsvp_status == s)
        r = await db.execute(q)
        return r.scalar() or 0

    total_invited = await count_guests()
    total_confirmed = await count_guests(RSVPStatus.confirmed)
    total_checked_in = await count_guests(RSVPStatus.checked_in)

    # also check what guest records actually exist
    all_guests_result = await db.execute(
        select(Guest).where(Guest.event_id.in_(event_ids))
    )
    all_guests = all_guests_result.scalars().all()

    return {
        "event_ids": event_ids,
        "event_count": len(events),
        "total_invited_count": total_invited,
        "total_confirmed_count": total_confirmed,
        "total_checked_in_count": total_checked_in,
        "raw_guest_records": [
            {
                "id": g.id,
                "event_id": g.event_id,
                "email": g.email,
                "rsvp_status": g.rsvp_status
            }
            for g in all_guests
        ]
    }
# ── List, status, stats ────────────────────────────────────────────────

@event_router.get("/dashboard", response_model=DashboardStatsResponse)
async def dashboard(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(require_organizer)
):
    return await get_dashboard_stats(db, current_user.id)

@event_router.get("/", response_model=EventListResponse)
async def list_events(
    status: Optional[EventStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    # total_pages: Optional[int] = Query(None),
    # items: Optional[int] = Query(None),
    # total: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await get_organizer_events(db, current_user.id, status, page, page_size)

@event_router.get("/share/{slug}", response_model=EventResponse)
async def get_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    return await get_event_by_slug(db, slug)

@event_router.get("/{event_id}", response_model=EventDetailResponse)
async def event_detail(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    """Full event details including guest summary and computed stats."""
    return await get_event_detail(db, event_id, current_user.id)

@event_router.patch("/{event_id}/status", response_model=EventResponse)
async def update_status(
    event_id: str,
    new_status: EventStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await update_event_status(db, event_id, current_user.id, new_status)


@event_router.get("/{event_id}/stats", response_model=EventStatsResponse)
async def event_stats(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await get_event_stats(db, event_id, current_user.id)


# ── Shareable link ─────────────────────────────────────────────────────


@event_router.get("/{event_id}/link", response_model=ShareableLinkResponse)
async def shareable_link(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    event = await _get_own_event(db, event_id, current_user.id)
    if not event.slug:
        raise HTTPException(status_code=400, detail="Event has no slug yet.")
    return {"slug": event.slug, "shareable_link": get_shareable_link(event.slug)}


# ── Co-host endpoints ──────────────────────────────────────────────────


@event_router.post("/{event_id}/co-hosts")
async def invite_cohost(
    event_id: str,
    payload: CoHostInvite,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await invite_co_host(db, event_id, current_user.id, payload)


@event_router.patch("/{event_id}/co-hosts/accept")
async def accept_invite(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await accept_co_host_invite(db, event_id, current_user.id)


@event_router.patch("/{event_id}/co-hosts/{co_host_user_id}/permission")
async def update_permission(
    event_id: str,
    co_host_user_id: str,
    new_permission: CoHostPermission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await update_co_host_permission(
        db, event_id, co_host_user_id, current_user.id, new_permission
    )


@event_router.delete("/{event_id}/co-hosts/{co_host_user_id}")
async def remove_cohost(
    event_id: str,
    co_host_user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    return await remove_co_host(db, event_id, co_host_user_id, current_user.id)


# from fastapi import APIRouter, Depends, HTTPException, Query, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from typing import Optional
# from app.api.v1.services.events import (
#     wizard_Step1, wizard_Step2, wizard_Step3, wizard_Step4, EventResponse,
#     EventUpdate, CoHostInvite, ShareableLinkResponse, create_event,
#     get_organizer_events, update_event_status, get_event_stats, get_dashboard_stats
# )
# from app.api.v1.schemas.event import EventCreate, EventUpdate, EventResponse, EventStatsResponse, DashboardStatsResponse
# from app.db.database import get_db
# from app.api.v1.models.events import EventStatus
# from app.api.v1.models.cohost import CoHostPermission

# from app.core.security import get_current_user
# from app.db.database import get_db
# from typing import Optional

# from app.api.v1.models.user import User, UserRole


# event_router = APIRouter()


# # ── Wizard endpoints ───────────────────────────────────────────────────

# @event_router.post("/wizard/step1", response_model=EventResponse)
# async def step1(
#     payload: WizardStep1,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await wizard_step1(db, current_user.id, payload)


# @event_router.patch("/wizard/{event_id}/step2", response_model=EventResponse)
# async def step2(
#     event_id: str,
#     payload: WizardStep2,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await wizard_step2(db, event_id, current_user.id, payload)


# @event_router.patch("/wizard/{event_id}/step3", response_model=EventResponse)
# async def step3(
#     event_id: str,
#     payload: WizardStep3,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await wizard_step3(db, event_id, current_user.id, payload)


# @event_router.patch("/wizard/{event_id}/step4", response_model=EventResponse)
# async def step4(
#     event_id: str,
#     payload: WizardStep4,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await wizard_step4(db, event_id, current_user.id, payload)


# # ── Draft & publish ────────────────────────────────────────────────────

# @event_router.patch("/wizard/{event_id}/draft", response_model=EventResponse)
# async def draft(
#     event_id: str,
#     payload: dict,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await save_draft(db, event_id, current_user.id, payload)


# @event_router.post("/wizard/{event_id}/publish", response_model=EventResponse)
# async def publish(
#     event_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await publish_event(db, event_id, current_user.id)


# # ── Shareable link ─────────────────────────────────────────────────────

# @event_router.get("/share/{slug}", response_model=EventResponse)
# async def get_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
#     return await get_event_by_slug(db, slug)


# @event_router.get("/{event_id}/link", response_model=ShareableLinkResponse)
# async def shareable_link(
#     event_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     from app.api.v1.services.event import _get_own_event
#     event = await _get_own_event(db, event_id, current_user.id)
#     if not event.slug:
#         raise HTTPException(status_code=400, detail="Event has no slug yet.")
#     return {
#         "slug": event.slug,
#         "shareable_link": get_shareable_link(event.slug)
#     }


# # ── Co-host endpoints ──────────────────────────────────────────────────

# @event_router.post("/{event_id}/co-hosts")
# async def invite_cohost(
#     event_id: str,
#     payload: CoHostInvite,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await invite_co_host(db, event_id, current_user.id, payload)


# @event_router.patch("/{event_id}/co-hosts/accept")
# async def accept_invite(
#     event_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     return await accept_co_host_invite(db, event_id, current_user.id)


# @event_router.patch("/{event_id}/co-hosts/{co_host_user_id}/permission")
# async def update_permission(
#     event_id: str,
#     co_host_user_id: str,
#     new_permission: CoHostPermission,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await update_co_host_permission(db, event_id, co_host_user_id, current_user.id, new_permission)


# @event_router.delete("/{event_id}/co-hosts/{co_host_user_id}")
# async def remove_cohost(
#     event_id: str,
#     co_host_user_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await remove_co_host(db, event_id, co_host_user_id, current_user.id)


# # ── Dashboard & stats ──────────────────────────────────────────────────

# @event_router.get("/dashboard")
# async def dashboard(
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await get_dashboard_stats(db, current_user.id)


# @event_router.get("/")
# async def list_events(
#     status: Optional[EventStatus] = Query(None),
#     page: int = Query(1, ge=1),
#     page_size: int = Query(10, ge=1, le=100),
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await get_organizer_events(db, current_user.id, status, page, page_size)


# @event_router.get("/{event_id}/stats")
# async def event_stats(
#     event_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await get_event_stats(db, event_id, current_user.id)

# def require_organizer(current_user: User = Depends(get_current_user)) -> User:
#     if current_user.role != UserRole.organizer:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only organizers can access this resource."
#         )
#     return current_user

# # wizard endpoints


# @event_router.post("/", response_model=EventResponse)
# async def create(
#     payload: EventCreate,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await create_event(db, current_user.id, payload)


# @event_router.get("/")
# async def list_events(
#     status: Optional[EventStatus] = Query(None),
#     page: int = Query(1, ge=1),
#     page_size: int = Query(10, ge=1, le=100),
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await get_organizer_events(db, current_user.id, status, page, page_size)


# @event_router.patch("/{event_id}/status")
# async def update_status(
#     event_id: str,
#     new_status: EventStatus,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await update_event_status(db, event_id, current_user.id, new_status)


# @event_router.get("/dashboard", response_model=DashboardStatsResponse)
# async def dashboard(
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await get_dashboard_stats(db, current_user.id)


# @event_router.get("/{event_id}/stats", response_model=EventStatsResponse)
# async def event_stats(
#     event_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_organizer)
# ):
#     return await get_event_stats(db, event_id, current_user.id)

# # @event_router.get("/")
# # def get_event(db:session=Depends(get_db)):
# #     events= EventsCrud.get_event(db)
# #     return {"message":"successful", "data": events}

# # @event_router.post("/create")
# # def event_create(payload:EventCreate, db:session=Depends(get_db)):
# #     user_id =1 # replace with auth later
# #     event = EventsCrud.eventcreate(db, payload, user_id)
# #     return {"message":"eventcreated successfully.","data": event}
