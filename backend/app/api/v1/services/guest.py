from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_
from fastapi import HTTPException, status
from app.api.v1.models.guest import Guest, RSVPStatus, InviteMethod
from app.api.v1.models.event import Event
from app.api.v1.schemas.guest import GuestInviteSingle, GuestInviteBulk, GuestUpdate, RSVPResponse
from app.utils.emails import send_rsvp_invitation_email, send_rsvp_confirmation_email, send_waitlist_promotion_email
from app.utils.sms import send_rsvp_invitation_sms, send_waitlist_promotion_sms
import secrets
import os


# ── Internal helpers ───────────────────────────────────────────────────

def _generate_rsvp_token() -> str:
    return secrets.token_urlsafe(32)


def _build_rsvp_link(token: str) -> str:
    base = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return f"{base}/rsvp?token={token}"


async def _get_event(db: AsyncSession, event_id: str) -> Event:
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
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
    return result.scalar()


async def _get_next_waitlist_position(db: AsyncSession, event_id: str) -> int:
    result = await db.execute(
        select(func.max(Guest.waitlist_position)).where(
            and_(
                Guest.event_id == event_id,
                Guest.rsvp_status == RSVPStatus.waitlisted
            )
        )
    )
    max_pos = result.scalar()
    return (max_pos or 0) + 1


# ── Duplicate detection ────────────────────────────────────────────────

async def _check_duplicate(
    db: AsyncSession,
    event_id: str,
    email: str = None,
    phone_number: str = None
) -> Guest | None:
    if not email and not phone_number:
        return None

    conditions = [Guest.event_id == event_id]
    or_conditions = []

    if email:
        or_conditions.append(Guest.email == email)
    if phone_number:
        or_conditions.append(Guest.phone_number == phone_number)

    if or_conditions:
        conditions.append(or_(*or_conditions))

    result = await db.execute(select(Guest).where(and_(*conditions)))
    return result.scalar_one_or_none()


# ── Single invite ──────────────────────────────────────────────────────

async def invite_guest(
    db: AsyncSession,
    event_id: str,
    organizer_id: str,
    data: GuestInviteSingle
) -> Guest:
    # validate at least email or phone provided
    if not data.email and not data.phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of email or phone_number is required."
        )

    # validate invite method matches provided contact
    if data.invite_method == InviteMethod.email and not data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required for email invitations."
        )
    if data.invite_method == InviteMethod.sms and not data.phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is required for SMS invitations."
        )
    if data.invite_method == InviteMethod.both and not (data.email and data.phone_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both email and phone number are required for combined invitations."
        )

    # duplicate detection
    duplicate = await _check_duplicate(db, event_id, data.email, data.phone_number)
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A guest with this email or phone number is already on the list."
        )

    event = await _get_event(db, event_id)

    # check capacity and determine RSVP status
    confirmed_count = await _get_confirmed_count(db, event_id)
    is_full = event.total_tickets > 0 and confirmed_count >= event.total_tickets

    if is_full:
        rsvp_status = RSVPStatus.waitlisted
        waitlist_position = await _get_next_waitlist_position(db, event_id)
    else:
        rsvp_status = RSVPStatus.pending
        waitlist_position = None

    rsvp_token = _generate_rsvp_token()
    rsvp_link = _build_rsvp_link(rsvp_token)
    guest_name = f"{data.first_name or ''} {data.last_name or ''}".strip() or None

    guest = Guest(
        event_id=event_id,
        invited_by=organizer_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_number=data.phone_number,
        invite_method=data.invite_method,
        plus_one_allowed=data.plus_one_allowed,
        rsvp_status=rsvp_status,
        rsvp_token=rsvp_token,
        waitlist_position=waitlist_position,
        invite_sent_at=datetime.utcnow()
    )
    db.add(guest)
    await db.commit()
    await db.refresh(guest)

    # send invitations
    _dispatch_invite(
        method=data.invite_method,
        email=data.email,
        phone=data.phone_number,
        guest_name=guest_name,
        event_name=event.event_name,
        rsvp_link=rsvp_link
    )

    return guest


def _dispatch_invite(method, email, phone, guest_name, event_name, rsvp_link):
    """Send invite via email, SMS, or both. Silently fails in dev if SMTP not configured."""
    try:
        if method in (InviteMethod.email, InviteMethod.both) and email:
            send_rsvp_invitation_email(email, guest_name, event_name, rsvp_link)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

    try:
        if method in (InviteMethod.sms, InviteMethod.both) and phone:
            send_rsvp_invitation_sms(phone, guest_name, event_name, rsvp_link)
    except Exception as e:
        print(f"[SMS ERROR] {e}")


# ── Bulk invite ────────────────────────────────────────────────────────

async def invite_guests_bulk(
    db: AsyncSession,
    event_id: str,
    organizer_id: str,
    data: GuestInviteBulk
) -> dict:
    results = {"invited": [], "skipped": []}

    for guest_data in data.guests:
        try:
            guest = await invite_guest(db, event_id, organizer_id, guest_data)
            results["invited"].append({
                "email": guest.email,
                "phone_number": guest.phone_number,
                "status": guest.rsvp_status
            })
        except HTTPException as e:
            results["skipped"].append({
                "email": guest_data.email,
                "phone_number": guest_data.phone_number,
                "reason": e.detail
            })

    return results


# ── RSVP response ──────────────────────────────────────────────────────

async def respond_to_rsvp(db: AsyncSession, data: RSVPResponse) -> Guest:
    # find guest by token
    result = await db.execute(
        select(Guest).where(Guest.rsvp_token == data.token)
    )
    guest = result.scalar_one_or_none()

    if not guest:
        raise HTTPException(status_code=404, detail="Invalid RSVP token.")

    if guest.rsvp_status == RSVPStatus.checked_in:
        raise HTTPException(status_code=400, detail="Guest has already checked in.")

    if data.status not in (RSVPStatus.confirmed, RSVPStatus.declined):
        raise HTTPException(
            status_code=400,
            detail="RSVP response must be 'confirmed' or 'declined'."
        )

    event = await _get_event(db, guest.event_id)

    if data.status == RSVPStatus.confirmed:
        # check capacity if not already waitlisted
        if guest.rsvp_status != RSVPStatus.waitlisted:
            confirmed_count = await _get_confirmed_count(db, guest.event_id)
            if event.total_tickets > 0 and confirmed_count >= event.total_tickets:
                # event is full — move to waitlist
                guest.rsvp_status = RSVPStatus.waitlisted
                guest.waitlist_position = await _get_next_waitlist_position(db, guest.event_id)
                await db.commit()
                await db.refresh(guest)
                return guest

        guest.rsvp_status = RSVPStatus.confirmed
        guest.waitlist_position = None

        if data.plus_one_name and guest.plus_one_allowed:
            guest.plus_one_name = data.plus_one_name

        # send confirmation email
        if guest.email:
            try:
                send_rsvp_confirmation_email(
                    guest.email,
                    f"{guest.first_name or ''} {guest.last_name or ''}".strip(),
                    event.event_name
                )
            except Exception as e:
                print(f"[EMAIL ERROR] {e}")

    elif data.status == RSVPStatus.declined:
        previous_status = guest.rsvp_status
        guest.rsvp_status = RSVPStatus.declined
        guest.waitlist_position = None

        # auto-promote first person on waitlist if they were confirmed
        if previous_status == RSVPStatus.confirmed:
            await _promote_from_waitlist(db, guest.event_id, event.event_name)

    guest.rsvp_responded_at = datetime.utcnow()
    await db.commit()
    await db.refresh(guest)
    return guest


# ── Waitlist auto-promote ──────────────────────────────────────────────

async def _promote_from_waitlist(db: AsyncSession, event_id: str, event_name: str):
    """Promote the first person on the waitlist when a spot opens."""
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
        return  # nobody on waitlist

    # give them a fresh token for the new RSVP link
    new_token = _generate_rsvp_token()
    next_guest.rsvp_token = new_token
    next_guest.rsvp_status = RSVPStatus.pending
    next_guest.waitlist_position = None
    await db.commit()

    rsvp_link = _build_rsvp_link(new_token)
    guest_name = f"{next_guest.first_name or ''} {next_guest.last_name or ''}".strip()

    # notify them
    try:
        if next_guest.email:
            send_waitlist_promotion_email(next_guest.email, guest_name, event_name, rsvp_link)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

    try:
        if next_guest.phone_number:
            send_waitlist_promotion_sms(next_guest.phone_number, guest_name, event_name, rsvp_link)
    except Exception as e:
        print(f"[SMS ERROR] {e}")

    # reorder remaining waitlist positions
    result = await db.execute(
        select(Guest).where(
            and_(
                Guest.event_id == event_id,
                Guest.rsvp_status == RSVPStatus.waitlisted
            )
        ).order_by(Guest.waitlist_position.asc())
    )
    remaining = result.scalars().all()
    for i, g in enumerate(remaining, start=1):
        g.waitlist_position = i

    await db.commit()


# ── Status update (organizer override) ────────────────────────────────

async def update_guest_status(
    db: AsyncSession,
    guest_id: str,
    event_id: str,
    organizer_id: str,
    new_status: RSVPStatus
) -> Guest:
    # verify organizer owns the event
    event_result = await db.execute(
        select(Event).where(
            Event.id == event_id,
            Event.organizer_id == organizer_id
        )
    )
    if not event_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not authorised.")

    result = await db.execute(
        select(Guest).where(
            Guest.id == guest_id,
            Guest.event_id == event_id
        )
    )
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found.")

    previous_status = guest.rsvp_status
    guest.rsvp_status = new_status
    guest.updated_at = datetime.utcnow()

    if new_status == RSVPStatus.declined and previous_status == RSVPStatus.confirmed:
        await _promote_from_waitlist(db, event_id, (await _get_event(db, event_id)).event_name)

    await db.commit()
    await db.refresh(guest)
    return guest


# ── Guest list fetch ───────────────────────────────────────────────────

async def get_guest_list(
    db: AsyncSession,
    event_id: str,
    organizer_id: str,
    status_filter: RSVPStatus = None,
    page: int = 1,
    page_size: int = 50
) -> dict:
    # verify ownership
    event_result = await db.execute(
        select(Event).where(
            Event.id == event_id,
            Event.organizer_id == organizer_id
        )
    )
    if not event_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not authorised.")

    base_query = select(Guest).where(Guest.event_id == event_id)

    if status_filter:
        query = base_query.where(Guest.rsvp_status == status_filter)
    else:
        query = base_query

    # counts per status
    async def _count(s):
        r = await db.execute(
            select(func.count()).where(
                and_(Guest.event_id == event_id, Guest.rsvp_status == s)
            )
        )
        return r.scalar()

    confirmed = await _count(RSVPStatus.confirmed)
    declined = await _count(RSVPStatus.declined)
    pending = await _count(RSVPStatus.pending)
    waitlisted = await _count(RSVPStatus.waitlisted)
    total = confirmed + declined + pending + waitlisted

    offset = (page - 1) * page_size
    query = query.order_by(Guest.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    guests = result.scalars().all()

    return {
        "items": guests,
        "total": total,
        "confirmed": confirmed,
        "declined": declined,
        "pending": pending,
        "waitlisted": waitlisted,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-total // page_size)
    }


# ── Remove guest ───────────────────────────────────────────────────────

async def remove_guest(
    db: AsyncSession,
    guest_id: str,
    event_id: str,
    organizer_id: str
) -> dict:
    event_result = await db.execute(
        select(Event).where(
            Event.id == event_id,
            Event.organizer_id == organizer_id
        )
    )
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=403, detail="Not authorised.")

    result = await db.execute(
        select(Guest).where(
            Guest.id == guest_id,
            Guest.event_id == event_id
        )
    )
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found.")

    was_confirmed = guest.rsvp_status == RSVPStatus.confirmed
    await db.delete(guest)
    await db.commit()

    if was_confirmed:
        await _promote_from_waitlist(db, event_id, event.event_name)

    return {"message": "Guest removed successfully."}


# ── Resend invite ──────────────────────────────────────────────────────

async def resend_invite(
    db: AsyncSession,
    guest_id: str,
    event_id: str,
    organizer_id: str
) -> dict:
    event_result = await db.execute(
        select(Event).where(
            Event.id == event_id,
            Event.organizer_id == organizer_id
        )
    )
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=403, detail="Not authorised.")

    result = await db.execute(
        select(Guest).where(
            Guest.id == guest_id,
            Guest.event_id == event_id
        )
    )
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found.")

    rsvp_link = _build_rsvp_link(guest.rsvp_token)
    guest_name = f"{guest.first_name or ''} {guest.last_name or ''}".strip()

    _dispatch_invite(
        method=guest.invite_method,
        email=guest.email,
        phone=guest.phone_number,
        guest_name=guest_name,
        event_name=event.event_name,
        rsvp_link=rsvp_link
    )

    guest.invite_sent_at = datetime.utcnow()
    await db.commit()
    return {"message": "Invite resent successfully."}
