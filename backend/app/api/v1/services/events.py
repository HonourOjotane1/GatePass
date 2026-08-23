from app.api.v1.models.events import Event, EventStatus, EventVisibility
from app.api.v1.models.cohost import EventCoHost, CoHostPermission
from app.api.v1.models.user import User
from app.api.v1.models.guest import Guest, RSVPStatus 
from app.api.v1.schemas.event import (
    WizardStep1, WizardStep2, WizardStep3, WizardStep4,
    EventCreate, EventUpdate, CoHostInvite, EventVisibility, AccessType
)
import re
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload


# ── Slug generation ────────────────────────────────────────────────────

def generate_slug(event_name: str, event_id: str) -> str:
    slug = event_name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    slug = re.sub(r"^-+|-+$", "", slug)
    short_id = event_id[:8]
    return f"{slug}-{short_id}"


def get_shareable_link(slug: str, base_url: str = "https://gatepass.app/events") -> str:
    return f"{base_url}/{slug}"


# ── Internal helper ────────────────────────────────────────────────────

async def _get_own_event(db: AsyncSession, event_id: str, organizer_id: str) -> Event:
    result = await db.execute(
        select(Event).options(selectinload(Event.co_hosts)).where(Event.id == event_id, Event.organizer_id == organizer_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return event


# ── Wizard steps ───────────────────────────────────────────────────────

async def wizard_step1(db: AsyncSession, organizer_id: str, data: WizardStep1) -> Event:
    """Step1: Basic info - event_name, description, type, category, cover image."""
    event = Event(
        organizer_id=organizer_id,
        event_name=data.event_name,
        description=data.description,
        event_type=data.event_type,
        category=data.category,
        cover_image_url=data.cover_image_url,
        status=EventStatus.draft,
        wizard_step=1
    )
    db.add(event)
    await db.commit()

    event.slug = generate_slug(data.event_name, event.id)
    await db.commit()

    result = await db.execute(
        select(Event)
        .options(selectinload(Event.co_hosts))
        .where(Event.id == event.id)
    )
    return result.scalar_one()


async def wizard_step2(db: AsyncSession, event_id: str, organizer_id: str, data: WizardStep2) -> Event:
    """Step2: Date, times, venue, virtual toggle."""
    event = await _get_own_event(db, event_id, organizer_id)

    if event.wizard_step < 1:
        raise HTTPException(status_code=400, detail="Complete step 1 first.")

    event.venue_name = data.venue_name
    event.address = data.address
    event.location = data.address #in sync for backward compat
    event.is_virtual = data.is_virtual
    event.virtual_link = data.virtual_link if data.is_virtual else None
    event.start_time = data.start_time
    event.end_time = data.end_time
    event.start_date = data.start_date
    event.end_date = data.end_date
    event.wizard_step = max(event.wizard_step, 2)
    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


async def wizard_step3(db: AsyncSession, event_id: str, organizer_id: str, data: WizardStep3) -> Event:
    """Step3: Access type - open, invite-only, or ticketed."""
    event = await _get_own_event(db, event_id, organizer_id)

    if event.wizard_step < 2:
        raise HTTPException(status_code=400, detail="Complete step 2 first.")

    event.access_type = data.access_type
    #set visibility to match access type
    if data.access_type == AccessType.invite_only:
        event.visibility = EventVisibility.invite_only
    else:
        event.visibility = EventVisibility.public

    event.wizard_step = max(event.wizard_step, 3)
    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


async def wizard_step4(db: AsyncSession, event_id: str, organizer_id: str, data: WizardStep4) -> Event:
    """Step4: Ticketing details and visibility."""
    event = await _get_own_event(db, event_id, organizer_id)

    if event.wizard_step < 3:
        raise HTTPException(status_code=400, detail="Complete step 3 first.")
    #validate; a tcketed event must have ticket info
    if event.access_type == AccessType.ticketed:
        if not data.ticket_name:
            raise HTTPException(status_code=400, detail="ticket_name is required for ticketed events.")
    if not data.is_free and data.ticket_price <= 0:
        raise HTTPException(status_code=400, detail="ticket_price must be greater than 0 for paid events.")
    event.ticket_name = data.ticket_name
    event.ticket_price = 0.0 if data.is_free else data.ticket_price
    event.total_tickets = data.total_tickets
    event.ticket_description = data.ticket_description
    event.is_free = data.is_free
    event.visibility = data.visibility
    event.wizard_step = max(event.wizard_step, 4)
    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


# ── Publishing ─────────────────────────────────────────────────────────

async def publish_event(db: AsyncSession, event_id: str, organizer_id: str) -> Event:
    """Final validation and publish."""
    event = await _get_own_event(db, event_id, organizer_id)

    errors = []
    if not event.event_name:
        errors.append("event name is required.")
    if not event.location:
        errors.append("location is required.")
    if not event.start_date or not event.start_time:
        errors.append("start_date and start_time are required.")
    if not event.end_date or not event.end_time:
        errors.append("end_date and end_time are required.")
    if event.start_time and event.end_time and event.start_time >= event.end_time:
        errors.append("start_time must be before end_time.")
    if not event.is_virtual and not event.address:
        errors.append("address is required for non-virtual events.")
    if event.access_type == AccessType.ticketed:
        if event.total_tickets <= 0:
            errors.append("total_tickets must be greater than 0 for ticketed events.")
            if not event.is_free and event.ticket_price <= 0:
                errors.append("ticket_price must be greater than 0 for paid events.")
    if event.total_tickets <= 0:
        errors.append("total_tickets must be greater than 0.")
    if not event.is_free and event.ticket_price <= 0:
        errors.append("ticket_price must be greater than 0 for paid events.")
    if event.wizard_step < 4:
        errors.append(f"Wizard incomplete — on step {event.wizard_step}. Complete all 4 steps first.")

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Event cannot be published.", "errors": errors}
        )

    event.status = EventStatus.published
    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


# ── Draft saving ───────────────────────────────────────────────────────

async def save_draft(db: AsyncSession, event_id: str, organizer_id: str, data: dict) -> Event:
    event = await _get_own_event(db, event_id, organizer_id)

    allowed_fields = [
        "event_name", "description", "location", "start_time",
        "end_time", "total_tickets", "ticket_price", "is_free", "visibility"
    ]
    for field, value in data.items():
        if field in allowed_fields and value is not None:
            setattr(event, field, value)

    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


# ── Create event (direct, no wizard) ──────────────────────────────────
# kept alongside wizard — useful for programmatic/API creation without stepping

async def create_event(db: AsyncSession, organizer_id: str, data: EventCreate) -> Event:
    if data.start_time and data.end_time and data.start_time >= data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_time must be before end_time."
        )

    event = Event(
        organizer_id=organizer_id,
        event_name=data.event_name,
        description=data.description,
        event_type=data.event_type,
        category=data.category,
        cover_image_url=data.cover_image_url,
        venue_name=data.venue_name,
        address=data.address,
        location=data.address,
        is_virtual=data.is_virtual,
        virtual_link=data.virtual_link,
        start_time=data.start_time,
        end_time=data.end_time,
        access_type=data.access_type,
        ticket_name=data.ticket_name,
        total_tickets=data.total_tickets,
        ticket_price=data.ticket_price,
        is_free=data.is_free,
        visibility=data.visibility,
        wizard_step=4,  # created in one shot so mark as complete
        status=EventStatus.draft
    )
    db.add(event)
    await db.commit()

    event.slug = generate_slug(data.event_name, event.id)
    await db.commit()

    result = await db.execute(
        select(Event)
        .options(selectinload(Event.co_hosts))
        .where(Event.id == event.id)
    )
    return result.scalar_one()


# ── List & pagination ──────────────────────────────────────────────────

async def get_organizer_events(
    db: AsyncSession,
    organizer_id: str,
    status_filter: str = None,
    page: int = 1,
    page_size: int = 10
) -> dict:
    query = select(Event).options(selectinload(Event.co_hosts)).where(Event.organizer_id == organizer_id)

    if status_filter:
        query = query.where(Event.status == status_filter)

    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(Event.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    events = result.scalars().all()

    return {
        "events": events,
        "items": len(events),
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-total // page_size)
    }

async def get_event_detail(
    db: AsyncSession, event_id: str, organizer_id: str
) -> dict:
    """
    Full event details for the organizer event details page.
    Includes guest summary counts and per-event RSVP/check-in rates.
    """
    event = await _get_own_event(db, event_id, organizer_id)

    async def count_guests(s=None):
        q = select(func.count()).where(Guest.event_id == event_id)
        if s:
            q = q.where(Guest.rsvp_status == s)
        r = await db.execute(q)
        return r.scalar() or 0

    total_invited = await count_guests()
    total_confirmed = await count_guests(RSVPStatus.confirmed)
    total_declined = await count_guests(RSVPStatus.declined)
    total_waitlisted = await count_guests(RSVPStatus.waitlisted)
    total_checked_in = await count_guests(RSVPStatus.checked_in)

    rsvp_rate = round(total_confirmed / total_invited * 100, 1) if total_invited > 0 else None
    checkin_rate = round(total_checked_in / total_confirmed * 100, 1) if total_confirmed > 0 else None
    revenue = round(event.tickets_sold * event.ticket_price, 2)
    occupancy = round(event.tickets_sold / event.total_tickets * 100, 1) if event.total_tickets > 0 else None

    return {
        # core event fields
        "id": event.id,
        "event_name": event.event_name,
        "slug": event.slug,
        "description": event.description,
        "event_type": event.event_type,
        "category": event.category,
        "cover_image_url": event.cover_image_url,
        "venue_name": event.venue_name,
        "address": event.address,
        "is_virtual": event.is_virtual,
        "virtual_link": event.virtual_link,
        "start_date": event.start_date,
        "end_date": event.end_date,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "status": event.status,
        "visibility": event.visibility,
        "access_type": event.access_type,
        "ticket_name": event.ticket_name,
        "ticket_price": event.ticket_price,
        "ticket_description": event.ticket_description,
        "total_tickets": event.total_tickets,
        "tickets_sold": event.tickets_sold,
        "is_free": event.is_free,
        "check_ins": event.check_ins,
        "wizard_step": event.wizard_step,
        "created_at": event.created_at,
        "updated_at": event.updated_at,

        # guest summary
        "guests": {
            "total_invited": total_invited,
            "confirmed": total_confirmed,
            "declined": total_declined,
            "waitlisted": total_waitlisted,
            "checked_in": total_checked_in,
        },

        # computed rates, return null if no data
        "rsvp_rate": rsvp_rate,
        "checkin_rate": checkin_rate,
        "revenue": revenue,
        "occupancy_percent": occupancy,

        # shareable link
        "shareable_link": get_shareable_link(event.slug) if event.slug else None,
    }


# ── Status transitions ─────────────────────────────────────────────────

async def update_event_status(
    db: AsyncSession,
    event_id: str,
    organizer_id: str,
    new_status: EventStatus
) -> Event:
    event = await _get_own_event(db, event_id, organizer_id)

    allowed_transitions = {
        EventStatus.draft:      [EventStatus.published, EventStatus.cancelled],
        EventStatus.published:  [EventStatus.ongoing, EventStatus.cancelled],
        EventStatus.ongoing:    [EventStatus.completed, EventStatus.cancelled],
        EventStatus.completed:  [],
        EventStatus.cancelled:  []
    }

    if new_status not in allowed_transitions[event.status]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {event.status} to {new_status}."
        )

    event.status = new_status
    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


# ── Stats ──────────────────────────────────────────────────────────────

async def get_event_stats(db: AsyncSession, event_id: str, organizer_id: str) -> dict:
    event = await _get_own_event(db, event_id, organizer_id)

    revenue = event.tickets_sold * event.ticket_price
    occupancy = (event.tickets_sold / event.total_tickets * 100) if event.total_tickets else 0

    return {
        "event_id": event.id,
        "event_name": event.event_name,
        "tickets_sold": event.tickets_sold,
        "total_tickets": event.total_tickets,
        "check_ins": event.check_ins,
        "revenue": round(revenue, 2),
        "occupancy_percent": round(occupancy, 2)
    }


async def get_dashboard_stats(db: AsyncSession, organizer_id: str) -> dict:
    result = await db.execute(select(Event).where(Event.organizer_id == organizer_id))
    events = result.scalars().all()

    if not events:
        return {
           "total_events": 0,
            "published_events": 0,
            "completed_events": 0,
            "total_tickets_sold": 0,
            "total_check_ins": 0,
            "total_revenue": 0.0,
            "total_guests_invited": 0,
            "total_guests_confirmed": 0,
            "total_guests_declined": 0,
            "total_guests_waitlisted": 0,
            "overall_rsvp_rate": None,     # None shows as dash on frontend
            "overall_checkin_rate": None,
        }

        event_ids = [e.id for e in events]

    async def count_guests(s=None):
        q = select(func.count()).where(Guest.event_id.in_(event_ids))
        if s:
            q = q.where(Guest.rsvp_status == s)
        r = await db.execute(q)
        return r.scalar() or 0

    total_invited = await count_guests()
    total_confirmed = await count_guests(RSVPStatus.confirmed)
    total_declined = await count_guests(RSVPStatus.declined)
    total_waitlisted = await count_guests(RSVPStatus.waitlisted)
    total_checked_in = await count_guests(RSVPStatus.checked_in)

    total_tickets_sold = sum(e.tickets_sold for e in events)
    total_check_ins = sum(e.check_ins for e in events)
    total_revenue = sum(e.tickets_sold * e.ticket_price for e in events)

    # RSVP rate = confirmed / total invited * 100
    rsvp_rate = round(total_confirmed / total_invited * 100, 1) if total_invited > 0 else None

    # check-in rate = checked_in / confirmed * 100
    checkin_rate = round(total_checked_in / total_confirmed * 100, 1) if total_confirmed > 0 else None

    return {
        "total_events": len(events),
        "published_events": sum(1 for e in events if e.status == EventStatus.published),
        "completed_events": sum(1 for e in events if e.status == EventStatus.completed),
        "total_tickets_sold": total_tickets_sold,
        "total_check_ins": total_check_ins,
        "total_revenue": round(total_revenue, 2),
        "total_guests_invited": total_invited,
        "total_guests_confirmed": total_confirmed,
        "total_guests_declined": total_declined,
        "total_guests_waitlisted": total_waitlisted,
        "overall_rsvp_rate": rsvp_rate,        # null if no guests yet
        "overall_checkin_rate": checkin_rate,  # null if no confirmed guests yet
    }
    # return {
    #     "total_events": len(events),
    #     "published_events": sum(1 for e in events if e.status == EventStatus.published),
    #     "completed_events": sum(1 for e in events if e.status == EventStatus.completed),
    #     "total_tickets_sold": sum(e.tickets_sold for e in events),
    #     "total_check_ins": sum(e.check_ins for e in events),
    #     "total_revenue": round(sum(e.tickets_sold * e.ticket_price for e in events), 2)
    # }


# ── Co-host management ─────────────────────────────────────────────────

async def invite_co_host(
    db: AsyncSession, event_id: str, organizer_id: str, data: CoHostInvite
) -> EventCoHost:
    await _get_own_event(db, event_id, organizer_id)

    result = await db.execute(select(User).where(User.email == data.email))
    invitee = result.scalar_one_or_none()
    if not invitee:
        raise HTTPException(status_code=404, detail="User with that email not found.")

    if invitee.id == organizer_id:
        raise HTTPException(status_code=400, detail="You cannot invite yourself as a co-host.")

    existing = await db.execute(
        select(EventCoHost).where(
            EventCoHost.event_id == event_id,
            EventCoHost.user_id == invitee.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a co-host.")

    co_host = EventCoHost(
        event_id=event_id,
        user_id=invitee.id,
        permission=data.permission,
        invited_by=organizer_id
    )
    db.add(co_host)
    await db.commit()
    await db.refresh(co_host)
    return co_host


async def accept_co_host_invite(db: AsyncSession, event_id: str, user_id: str) -> EventCoHost:
    result = await db.execute(
        select(EventCoHost).where(
            EventCoHost.event_id == event_id,
            EventCoHost.user_id == user_id
        )
    )
    co_host = result.scalar_one_or_none()
    if not co_host:
        raise HTTPException(status_code=404, detail="Co-host invite not found.")
    if co_host.accepted:
        raise HTTPException(status_code=400, detail="Invite already accepted.")

    co_host.accepted = True
    await db.commit()
    await db.refresh(co_host)
    return co_host


async def update_co_host_permission(
    db: AsyncSession, event_id: str, co_host_user_id: str,
    organizer_id: str, new_permission: CoHostPermission
) -> EventCoHost:
    await _get_own_event(db, event_id, organizer_id)

    result = await db.execute(
        select(EventCoHost).where(
            EventCoHost.event_id == event_id,
            EventCoHost.user_id == co_host_user_id
        )
    )
    co_host = result.scalar_one_or_none()
    if not co_host:
        raise HTTPException(status_code=404, detail="Co-host not found.")

    co_host.permission = new_permission
    await db.commit()
    await db.refresh(co_host)
    return co_host


async def remove_co_host(
    db: AsyncSession, event_id: str, co_host_user_id: str, organizer_id: str
) -> dict:
    await _get_own_event(db, event_id, organizer_id)

    result = await db.execute(
        select(EventCoHost).where(
            EventCoHost.event_id == event_id,
            EventCoHost.user_id == co_host_user_id
        )
    )
    co_host = result.scalar_one_or_none()
    if not co_host:
        raise HTTPException(status_code=404, detail="Co-host not found.")

    await db.delete(co_host)
    await db.commit()
    return {"message": "Co-host removed successfully."}


# ── Shareable link ─────────────────────────────────────────────────────

async def get_event_by_slug(db: AsyncSession, slug: str) -> Event:
    result = await db.execute(select(Event).where(Event.slug == slug))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.visibility == EventVisibility.private:  # was comparing to string "private"
        raise HTTPException(status_code=403, detail="This event is private.")
    return event















# from app.api.v1.models.events import Event, EventStatus, EventVisibility
# from app.api.v1.models.cohost import EventCoHost, CoHostPermission
# from app.api.v1.models.user import User
# from app.api.v1.schemas.event import (
#     WizardStep1, WizardStep2, WizardStep3, WizardStep4, 
#     EventCreate, EventUpdate, CoHostInvite
#     )
# import re
# import uuid
# from datetime import datetime
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy import func
# from fastapi import HTTPException, status



# # ── Slug generation ────────────────────────────────────────────────────

# def generate_slug(title: str, event_id: str) -> str:
#     """Convert title to URL-safe slug and append short ID to ensure uniqueness."""
#     slug = title.lower().strip()
#     slug = re.sub(r"[^\w\s-]", "", slug)       # remove special chars
#     slug = re.sub(r"[\s_-]+", "-", slug)        # spaces to hyphens
#     slug = re.sub(r"^-+|-+$", "", slug)         # strip leading/trailing hyphens
#     short_id = event_id[:8]                      # first 8 chars of UUID
#     return f"{slug}-{short_id}"


# def get_shareable_link(slug: str, base_url: str = "https://gatepass.app/events") -> str:
#     return f"{base_url}/{slug}"


# # ── Wizard steps ───────────────────────────────────────────────────────

# async def wizard_step1(db: AsyncSession, organizer_id: str, data: WizardStep1) -> Event:
#     """Create the event draft with basic info."""
#     event = Event(
#         organizer_id=organizer_id,
#         title=data.title,
#         description=data.description,
#         status=EventStatus.draft,
#         wizard_step=1
#     )
#     db.add(event)
#     await db.commit()
#     await db.refresh(event)

#     # generate slug after we have the event ID
#     event.slug = generate_slug(data.title, event.id)
#     await db.commit()
#     await db.refresh(event)
#     return event


# async def wizard_step2(db: AsyncSession, event_id: str, organizer_id: str, data: WizardStep2) -> Event:
#     """Save date, time and location."""
#     event = await _get_own_event(db, event_id, organizer_id)

#     if event.wizard_step < 1:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Complete step 1 first."
#         )

#     event.location = data.location
#     event.start_time = data.start_time
#     event.end_time = data.end_time
#     event.wizard_step = max(event.wizard_step, 2)
#     event.updated_at = datetime.utcnow()
#     await db.commit()
#     await db.refresh(event)
#     return event


# async def wizard_step3(db: AsyncSession, event_id: str, organizer_id: str, data: WizardStep3) -> Event:
#     """Save ticketing info."""
#     event = await _get_own_event(db, event_id, organizer_id)

#     if event.wizard_step < 2:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Complete step 2 first."
#         )

#     event.total_tickets = data.total_tickets
#     event.ticket_price = 0.0 if data.is_free else data.ticket_price
#     event.is_free = data.is_free
#     event.wizard_step = max(event.wizard_step, 3)
#     event.updated_at = datetime.utcnow()
#     await db.commit()
#     await db.refresh(event)
#     return event


# async def wizard_step4(db: AsyncSession, event_id: str, organizer_id: str, data: WizardStep4) -> Event:
#     """Save visibility settings."""
#     event = await _get_own_event(db, event_id, organizer_id)

#     if event.wizard_step < 3:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Complete step 3 first."
#         )

#     event.visibility = data.visibility
#     event.wizard_step = max(event.wizard_step, 4)
#     event.updated_at = datetime.utcnow()
#     await db.commit()
#     await db.refresh(event)
#     return event


# # ── Publishing ─────────────────────────────────────────────────────────

# async def publish_event(db: AsyncSession, event_id: str, organizer_id: str) -> Event:
#     """Validate all steps are complete then publish."""
#     event = await _get_own_event(db, event_id, organizer_id)

#     # full validation before publishing
#     errors = []
#     if not event.title:
#         errors.append("title is required.")
#     if not event.location:
#         errors.append("location is required.")
#     if not event.start_time:
#         errors.append("start_time is required.")
#     if not event.end_time:
#         errors.append("end_time is required.")
#     if event.start_time and event.end_time and event.start_time >= event.end_time:
#         errors.append("start_time must be before end_time.")
#     if event.total_tickets <= 0:
#         errors.append("total_tickets must be greater than 0.")
#     if not event.is_free and event.ticket_price <= 0:
#         errors.append("ticket_price must be greater than 0 for paid events.")
#     if event.wizard_step < 4:
#         errors.append(f"Wizard incomplete — currently on step {event.wizard_step}. Complete all 4 steps first.")

#     if errors:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail={"message": "Event cannot be published.", "errors": errors}
#         )

#     event.status = EventStatus.published
#     event.updated_at = datetime.utcnow()
#     await db.commit()
#     await db.refresh(event)
#     return event


# # ── Draft saving ───────────────────────────────────────────────────────

# async def save_draft(db: AsyncSession, event_id: str, organizer_id: str, data: dict) -> Event:
#     """Save any partial data to draft without validation."""
#     event = await _get_own_event(db, event_id, organizer_id)

#     allowed_fields = [
#         "title", "description", "location", "start_time",
#         "end_time", "total_tickets", "ticket_price", "is_free", "visibility"
#     ]
#     for field, value in data.items():
#         if field in allowed_fields and value is not None:
#             setattr(event, field, value)

#     event.updated_at = datetime.utcnow()
#     await db.commit()
#     await db.refresh(event)
#     return event


# # ── Co-host management ─────────────────────────────────────────────────

# async def invite_co_host(
#     db: AsyncSession,
#     event_id: str,
#     organizer_id: str,
#     data: CoHostInvite
# ) -> EventCoHost:
#     # verify the inviter owns the event
#     event = await _get_own_event(db, event_id, organizer_id)

#     # find the user being invited
#     result = await db.execute(select(User).where(User.email == data.email))
#     invitee = result.scalar_one_or_none()
#     if not invitee:
#         raise HTTPException(status_code=404, detail="User with that email not found.")

#     # prevent duplicate invites
#     existing = await db.execute(
#         select(EventCoHost).where(
#             EventCoHost.event_id == event_id,
#             EventCoHost.user_id == invitee.id
#         )
#     )
#     if existing.scalar_one_or_none():
#         raise HTTPException(status_code=400, detail="User is already a co-host.")

#     # prevent organizer inviting themselves
#     if invitee.id == organizer_id:
#         raise HTTPException(status_code=400, detail="You cannot invite yourself as a co-host.")

#     co_host = EventCoHost(
#         event_id=event_id,
#         user_id=invitee.id,
#         permission=data.permission,
#         invited_by=organizer_id
#     )
#     db.add(co_host)
#     await db.commit()
#     await db.refresh(co_host)
#     return co_host


# async def accept_co_host_invite(db: AsyncSession, event_id: str, user_id: str) -> EventCoHost:
#     result = await db.execute(
#         select(EventCoHost).where(
#             EventCoHost.event_id == event_id,
#             EventCoHost.user_id == user_id
#         )
#     )
#     co_host = result.scalar_one_or_none()
#     if not co_host:
#         raise HTTPException(status_code=404, detail="Co-host invite not found.")
#     if co_host.accepted:
#         raise HTTPException(status_code=400, detail="Invite already accepted.")

#     co_host.accepted = True
#     await db.commit()
#     await db.refresh(co_host)
#     return co_host


# async def update_co_host_permission(
#     db: AsyncSession,
#     event_id: str,
#     co_host_user_id: str,
#     organizer_id: str,
#     new_permission: CoHostPermission
# ) -> EventCoHost:
#     await _get_own_event(db, event_id, organizer_id)  # verify ownership

#     result = await db.execute(
#         select(EventCoHost).where(
#             EventCoHost.event_id == event_id,
#             EventCoHost.user_id == co_host_user_id
#         )
#     )
#     co_host = result.scalar_one_or_none()
#     if not co_host:
#         raise HTTPException(status_code=404, detail="Co-host not found.")

#     co_host.permission = new_permission
#     await db.commit()
#     await db.refresh(co_host)
#     return co_host


# async def remove_co_host(
#     db: AsyncSession,
#     event_id: str,
#     co_host_user_id: str,
#     organizer_id: str
# ) -> dict:
#     await _get_own_event(db, event_id, organizer_id)

#     result = await db.execute(
#         select(EventCoHost).where(
#             EventCoHost.event_id == event_id,
#             EventCoHost.user_id == co_host_user_id
#         )
#     )
#     co_host = result.scalar_one_or_none()
#     if not co_host:
#         raise HTTPException(status_code=404, detail="Co-host not found.")

#     await db.delete(co_host)
#     await db.commit()
#     return {"message": "Co-host removed successfully."}


# # ── Shareable link ─────────────────────────────────────────────────────

# async def get_event_by_slug(db: AsyncSession, slug: str) -> Event:
#     result = await db.execute(select(Event).where(Event.slug == slug))
#     event = result.scalar_one_or_none()
#     if not event:
#         raise HTTPException(status_code=404, detail="Event not found.")
#     if event.visibility == "private":
#         raise HTTPException(status_code=403, detail="This event is private.")
#     return event


# # ── Internal helper ────────────────────────────────────────────────────

# async def _get_own_event(db: AsyncSession, event_id: str, organizer_id: str) -> Event:
#     """Fetch event and verify the requester owns it."""
#     result = await db.execute(
#         select(Event).where(Event.id == event_id, Event.organizer_id == organizer_id)
#     )
#     event = result.scalar_one_or_none()
#     if not event:
#         raise HTTPException(status_code=404, detail="Event not found.")
#     return event

# # crete event (direct, no wizard)
# #kept alongside wizar - usefulfor programmatic /API creation without 
# async def create_event(db: AsyncSession, organizer_id: str, data: EventCreate) -> Event:
#     if data.start_time >= data.end_time:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="start_time must be before end_time."
#         )

#     event = Event(
#         organizer_id=organizer_id,
#         title=data.title,
#         description=data.description,
#         location=data.location,
#         start_time=data.start_time,
#         end_time=data.end_time,
#         total_tickets=data.total_tickets,
#         ticket_price=data.ticket_price,
#         is_free=data.is_free
#         visibility=data.visibility,
#         wizard_step=4
#         status=EventStatus.draft
#     )
#     db.add(event)
#     await db.commit()
#     await db.refresh(event)

#     event.slug = generate_slug(data.title, event.id)
#     await db.commit()
#     await db.refresh(event)
#     return event

# # List & pagination
# async def get_organizer_events(
#     db: AsyncSession,
#     organizer_id: str,
#     status_filter: str = None,
#     page: int = 1,
#     page_size: int = 10
# ) -> dict:
#     query = select(Event).where(Event.organizer_id == organizer_id)

#     if status_filter:
#         query = query.where(Event.status == status_filter)

#     # total count for pagination
#     count_result = await db.execute(
#         select(func.count()).select_from(
#             query.subquery()
#         )
#     )
#     total = count_result.scalar()

#     # paginated results — newest first
#     offset = (page - 1) * page_size
#     query = query.order_by(Event.created_at.desc()).offset(offset).limit(page_size)
#     result = await db.execute(query)
#     events = result.scalars().all()

#     return {
#         "items": events,
#         "total": total,
#         "page": page,
#         "page_size": page_size,
#         "total_pages": -(-total // page_size)  # ceiling division
#     }

# # status transitions
# async def update_event_status(
#     db: AsyncSession,
#     event_id: str,
#     organizer_id: str,
#     new_status: EventStatus
# ) -> Event:
#     event = await _get_own_event(db, event_id, organizer_id)
#     # result = await db.execute(
#     #     select(Event).where(Event.id == event_id, Event.organizer_id == organizer_id)
#     # )
#     # event = result.scalar_one_or_none()

#     if not event:
#         raise HTTPException(status_code=404, detail="Event not found.")

#     # status transition rules
#     allowed_transitions = {
#         EventStatus.draft:      [EventStatus.published, EventStatus.cancelled],
#         EventStatus.published:  [EventStatus.ongoing, EventStatus.cancelled],
#         EventStatus.ongoing:    [EventStatus.completed, EventStatus.cancelled],
#         EventStatus.completed:  [],
#         EventStatus.cancelled:  []
#     }

#     if new_status not in allowed_transitions[event.status]:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Cannot transition from {event.status} to {new_status}."
#         )

#     event.status = new_status
#     event.updated_at = datetime.utcnow()
#     await db.commit()
#     await db.refresh(event)
#     return event

# # Stats
# async def get_event_stats(db: AsyncSession, event_id: str, organizer_id: str) -> dict:
#     # result = await db.execute(
#     #     select(Event).where(Event.id == event_id, Event.organizer_id == organizer_id)
#     # )
#     # event = result.scalar_one_or_none()
#     # if not event:
#     #     raise HTTPException(status_code=404, detail="Event not found.")
#     event = await _get_own_event(db, event_id,organizer_id)

#     revenue = event.tickets_sold * event.ticket_price
#     occupancy = (event.tickets_sold / event.total_tickets * 100) if event.total_tickets else 0

#     return {
#         "event_id": event.id,
#         "title": event.title,
#         "tickets_sold": event.tickets_sold,
#         "total_tickets": event.total_tickets,
#         "check_ins": event.check_ins,
#         "revenue": round(revenue, 2),
#         "occupancy_percent": round(occupancy, 2)
#     }

# async def get_dashboard_stats(db: AsyncSession, organizer_id: str) -> dict:
#     result = await db.execute(select(Event).where(Event.organizer_id == organizer_id))
#     events = result.scalars().all()

#     return {
#         "total_events": len(events),
#         "published_events": sum(1 for e in events if e.status == EventStatus.published),
#         "completed_events": sum(1 for e in events if e.status == EventStatus.completed),
#         "total_tickets_sold": sum(e.tickets_sold for e in events),
#         "total_check_ins": sum(e.check_ins for e in events),
#         "total_revenue": round(sum(e.tickets_sold * e.ticket_price for e in events), 2)
#     }
# # async def get_dashboard_stats(db: AsyncSession, organizer_id: str) -> dict:
# #     result = await db.execute(
# #         select(Event).where(Event.organizer_id == organizer_id)
# #     )
# #     events = result.scalars().all()

# #     total_tickets_sold = sum(e.tickets_sold for e in events)
# #     total_check_ins = sum(e.check_ins for e in events)
# #     total_revenue = sum(e.tickets_sold * e.ticket_price for e in events)
# #     published = sum(1 for e in events if e.status == EventStatus.published)
# #     completed = sum(1 for e in events if e.status == EventStatus.completed)

# #     return {
# #         "total_events": len(events),
# #         "published_events": published,
# #         "completed_events": completed,
# #         "total_tickets_sold": total_tickets_sold,
# #         "total_check_ins": total_check_ins,
# #         "total_revenue": round(total_revenue, 2)
# #     }



# # class EventsCrud:
# #     @staticmethod
# #     def get_event(db):
# #         return db.query(Events).all()
#     # @staticmethod
#     # def event_create(db, event: EventCreate,user_id:int):
#     #     new_event = Events(
#     #         name=event.name,
#     #         description=event.description,
#     #         type=event.type,
#     #         category=event.category,
#     #         cover_image=event.cover_image,
#     #         start_time=event.start_time,
#     #         end_time=event.end_time,
#     #         venue=event.venue,
#     #         is_virtual=event.is_virtual,
#     #         address=event.address,
#     #         map_coordinates=event.map_coordinates,
#     #         created_by=user_id
#     #     )
#     #     # error handling
#     #     try:
#     #         db.add(new_event)
#     #         db.commit()
#     #         db.refresh(new_event)
#     #         return new_event
#     #     except Exception:
#     #         db.rollback()
#     #         raise
