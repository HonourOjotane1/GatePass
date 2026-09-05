import secrets
import os
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from fastapi import HTTPException
from jose import jwt

from app.api.v1.models.event import Event, EventVisibility
from app.api.v1.models.guest import Guest, RSVPStatus, InviteMethod
from app.api.v1.models.guest_session import GuestSession
from app.api.v1.models.user import User
from app.api.v1.schemas.public_event import (
    GuestSessionCreate, PublicRSVPRequest
)
from app.utils.og_meta import generate_og_meta
from app.utils.ical import generate_ical
from app.utils.emails import send_rsvp_confirmation_email, send_waitlist_promotion_email

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
SESSION_EXPIRE_HOURS = int(os.getenv("GUEST_SESSION_EXPIRE_HOURS", 72))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ── Internal helpers ───────────────────────────────────────────────────

def _generate_session_token(email: str, event_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=SESSION_EXPIRE_HOURS)
    payload = {
        "sub": email,
        "event_id": event_id,
        "type": "guest_session",
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _decode_session_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "guest_session":
            return None
        return payload
    except Exception:
        return None


async def _get_public_event(db: AsyncSession, slug: str) -> Event:
    result = await db.execute(select(Event).where(Event.slug == slug))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.visibility == EventVisibility.private:
        raise HTTPException(
            status_code=403,
            detail="This event is private."
        )
    return event


async def _get_confirmed_count(db: AsyncSession, event_id: str) -> int:
    result = await db.execute(
        select(func.count()).where(
            and_(
                Guest.event_id == event_id,
                Guest.rsvp_status == RSVPStatus.confirmed
            )
        )
    )
    return result.scalar() or 0


async def _get_next_waitlist_position(db: AsyncSession, event_id: str) -> int:
    result = await db.execute(
        select(func.max(Guest.waitlist_position)).where(
            and_(
                Guest.event_id == event_id,
                Guest.rsvp_status == RSVPStatus.waitlisted
            )
        )
    )
    return (result.scalar() or 0) + 1


async def _promote_from_waitlist(db: AsyncSession, event_id: str, event_name: str):
    """Promote first waitlisted guest when a spot opens."""
    result = await db.execute(
        select(Guest).where(
            and_(
                Guest.event_id == event_id,
                Guest.rsvp_status == RSVPStatus.waitlisted
            )
        ).order_by(Guest.waitlist_position.asc())
    )
    next_guest = result.scalars().first()
    if not next_guest:
        return

    next_guest.rsvp_status = RSVPStatus.pending
    next_guest.waitlist_position = None
    await db.commit()

    if next_guest.email:
        try:
            rsvp_link = f"{FRONTEND_URL}/events/{event_id}/rsvp?token={next_guest.rsvp_token}"
            guest_name = f"{next_guest.first_name or ''} {next_guest.last_name or ''}".strip()
            send_waitlist_promotion_email(
                next_guest.email, guest_name, event_name, rsvp_link
            )
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")


# ── Public event page ──────────────────────────────────────────────────

async def get_public_event(db: AsyncSession, slug: str) -> dict:
    event = await _get_public_event(db, slug)

    # fetch organizer name
    organizer_result = await db.execute(
        select(User).where(User.id == event.organizer_id)
    )
    organizer = organizer_result.scalar_one_or_none()
    organizer_name = None
    if organizer:
        organizer_name = f"{organizer.first_name or ''} {organizer.last_name or ''}".strip() or organizer.username

    confirmed_count = await _get_confirmed_count(db, event.id)
    tickets_remaining = max(0, event.total_tickets - confirmed_count)
    is_full = event.total_tickets > 0 and confirmed_count >= event.total_tickets

    og_meta = generate_og_meta(
        event_name=event.event_name,
        event_description=event.description,
        location=event.location,
        start_time=event.start_time,
        slug=event.slug
    )

    return {
        "id": event.id,
        "event_name": event.event_name,
        "slug": event.slug,
        "description": event.description,
        "location": event.location,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "is_free": event.is_free,
        "ticket_price": event.ticket_price,
        "total_tickets": event.total_tickets,
        "tickets_remaining": tickets_remaining,
        "is_full": is_full,
        "visibility": event.visibility,
        "organizer_name": organizer_name,
        "og_meta": og_meta
    }


# ── Guest session ──────────────────────────────────────────────────────

async def create_guest_session(
    db: AsyncSession,
    slug: str,
    data: GuestSessionCreate
) -> dict:
    """
    Create or retrieve a guest session for this event.
    If the guest was already invited, link their session to their guest record.
    If not, they can still RSVP and a guest record will be created.
    """
    event = await _get_public_event(db, slug)

    # check if a session already exists for this email + event
    existing_session = await db.execute(
        select(GuestSession).where(
            and_(
                GuestSession.event_id == event.id,
                GuestSession.email == data.email,
                GuestSession.is_active == True
            )
        )
    )
    session = existing_session.scalar_one_or_none()

    if session:
        # refresh the token
        session.session_token = _generate_session_token(data.email, event.id)
        session.expires_at = datetime.utcnow() + timedelta(hours=SESSION_EXPIRE_HOURS)
        await db.commit()
    else:
        token = _generate_session_token(data.email, event.id)

        # try to find an existing guest record for this email
        guest_result = await db.execute(
            select(Guest).where(
                and_(
                    Guest.event_id == event.id,
                    Guest.email == data.email
                )
            )
        )
        existing_guest = guest_result.scalar_one_or_none()

        session = GuestSession(
            event_id=event.id,
            guest_id=existing_guest.id if existing_guest else None,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            phone_number=data.phone_number,
            session_token=token,
            expires_at=datetime.utcnow() + timedelta(hours=SESSION_EXPIRE_HOURS)
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    guest_name = f"{data.first_name} {data.last_name}".strip()

    return {
        "session_token": session.session_token,
        "guest_name": guest_name,
        "email": data.email,
        "message": f"Session created for {event.event_name}. Use your session token to RSVP."
    }


# ── Public RSVP ────────────────────────────────────────────────────────

async def public_rsvp(
    db: AsyncSession,
    slug: str,
    data: PublicRSVPRequest
) -> dict:
    """
    Guest RSVPs using their session token.
    Creates a guest record if one doesn't exist yet.
    """
    event = await _get_public_event(db, slug)

    # validate session token
    payload = _decode_session_token(data.session_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")

    if payload.get("event_id") != event.id:
        raise HTTPException(status_code=400, detail="Session token is for a different event.")

    # fetch session
    session_result = await db.execute(
        select(GuestSession).where(
            and_(
                GuestSession.session_token == data.session_token,
                GuestSession.is_active == True
            )
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=401, detail="Session not found or expired.")

    guest_name = f"{session.first_name} {session.last_name}".strip()

    # get or create guest record
    if session.guest_id:
        guest_result = await db.execute(
            select(Guest).where(Guest.id == session.guest_id)
        )
        guest = guest_result.scalar_one_or_none()
    else:
        # check if a guest record was created since session was made
        guest_result = await db.execute(
            select(Guest).where(
                and_(
                    Guest.event_id == event.id,
                    Guest.email == session.email
                )
            )
        )
        guest = guest_result.scalar_one_or_none()

    if not guest:
        # guest walked in via public page — create their record
        confirmed_count = await _get_confirmed_count(db, event.id)
        is_full = event.total_tickets > 0 and confirmed_count >= event.total_tickets

        rsvp_token = secrets.token_urlsafe(32)
        guest = Guest(
            event_id=event.id,
            invited_by=event.organizer_id,
            first_name=session.first_name,
            last_name=session.last_name,
            email=session.email,
            phone_number=session.phone_number,
            invite_method=InviteMethod.email,
            rsvp_token=rsvp_token,
            rsvp_status=RSVPStatus.waitlisted if is_full else RSVPStatus.pending,
            waitlist_position=await _get_next_waitlist_position(db, event.id) if is_full else None
        )
        db.add(guest)
        await db.flush()
        session.guest_id = guest.id

    # process RSVP
    if data.status == RSVPStatus.confirmed:
        if guest.rsvp_status == RSVPStatus.checked_in:
            raise HTTPException(status_code=400, detail="You have already checked in.")

        confirmed_count = await _get_confirmed_count(db, event.id)
        is_full = event.total_tickets > 0 and confirmed_count >= event.total_tickets

        if is_full and guest.rsvp_status != RSVPStatus.waitlisted:
            guest.rsvp_status = RSVPStatus.waitlisted
            guest.waitlist_position = await _get_next_waitlist_position(db, event.id)
            await db.commit()

            return {
                "rsvp_status": RSVPStatus.waitlisted,
                "message": f"The event is full. You've been added to the waitlist at position {guest.waitlist_position}.",
                "guest_name": guest_name,
                "waitlist_position": guest.waitlist_position,
                "ical_url": None
            }

        guest.rsvp_status = RSVPStatus.confirmed
        guest.waitlist_position = None
        guest.rsvp_responded_at = datetime.utcnow()

        if data.plus_one_name and guest.plus_one_allowed:
            guest.plus_one_name = data.plus_one_name

        await db.commit()

        # send confirmation email
        if guest.email:
            try:
                send_rsvp_confirmation_email(guest.email, guest_name, event.event_name)
            except Exception as e:
                print(f"[EMAIL ERROR] {e}")

        ical_url = f"{FRONTEND_URL}/events/{slug}/calendar"

        return {
            "rsvp_status": RSVPStatus.confirmed,
            "message": f"You're confirmed for {event.event_name}! See you there.",
            "guest_name": guest_name,
            "waitlist_position": None,
            "ical_url": ical_url
        }

    elif data.status == RSVPStatus.declined:
        previous_status = guest.rsvp_status
        guest.rsvp_status = RSVPStatus.declined
        guest.waitlist_position = None
        guest.rsvp_responded_at = datetime.utcnow()
        await db.commit()

        if previous_status == RSVPStatus.confirmed:
            await _promote_from_waitlist(db, event.id, event.event_name)

        return {
            "rsvp_status": RSVPStatus.declined,
            "message": "You've declined the invitation.",
            "guest_name": guest_name,
            "waitlist_position": None,
            "ical_url": None
        }

    raise HTTPException(status_code=400, detail="Status must be 'confirmed' or 'declined'.")


# ── RSVP status check ──────────────────────────────────────────────────

async def get_rsvp_status(
    db: AsyncSession,
    slug: str,
    session_token: str
) -> dict:
    event = await _get_public_event(db, slug)

    payload = _decode_session_token(session_token)
    if not payload or payload.get("event_id") != event.id:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")

    session_result = await db.execute(
        select(GuestSession).where(
            GuestSession.session_token == session_token
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    guest = None
    if session.guest_id:
        guest_result = await db.execute(
            select(Guest).where(Guest.id == session.guest_id)
        )
        guest = guest_result.scalar_one_or_none()

    guest_name = f"{session.first_name} {session.last_name}".strip()

    return {
        "guest_name": guest_name,
        "email": session.email,
        "rsvp_status": guest.rsvp_status if guest else RSVPStatus.pending,
        "waitlist_position": guest.waitlist_position if guest else None,
        "checked_in_at": guest.checked_in_at if guest else None,
        "event_name": event.event_name,
        "event_slug": event.slug
    }


# ── iCal generation ────────────────────────────────────────────────────

async def get_ical(db: AsyncSession, slug: str) -> str:
    event = await _get_public_event(db, slug)

    if not event.start_time or not event.end_time:
        raise HTTPException(
            status_code=400,
            detail="Event does not have scheduled times yet."
        )

    event_url = f"{FRONTEND_URL}/events/{slug}"

    return generate_ical(
        event_name=event.event_name,
        event_description=event.description,
        location=event.location,
        start_time=event.start_time,
        end_time=event.end_time,
        event_url=event_url
    )