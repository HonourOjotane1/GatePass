from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.schemas.public_event import (
    GuestSessionCreate, GuestSessionResponse,
    PublicRSVPRequest, PublicRSVPResponse,
    PublicEventResponse, RSVPStatusResponse
)
from app.api.v1.services.public_event import (
    get_public_event, create_guest_session,
    public_rsvp, get_rsvp_status, get_ical
)
from app.db.database import get_db

public_router = APIRouter()


# ── Public event page (no auth) ────────────────────────────────────────

@public_router.get("/{slug}", response_model=PublicEventResponse)
async def event_page(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Fully public — no login needed.
    Returns event details and OG meta tags for link previews.
    """
    return await get_public_event(db, slug)


# ── Guest session (no auth) ────────────────────────────────────────────

@public_router.post("/{slug}/session", response_model=GuestSessionResponse)
async def start_guest_session(
    slug: str,
    payload: GuestSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Guest provides name + email to get a session token.
    No account creation required.
    Token is used for all subsequent RSVP actions.
    """
    return await create_guest_session(db, slug, payload)


# ── Public RSVP (no auth) ──────────────────────────────────────────────

@public_router.post("/{slug}/rsvp", response_model=PublicRSVPResponse)
async def rsvp(
    slug: str,
    payload: PublicRSVPRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Guest RSVPs using their session token.
    Handles confirmation, declination, and auto-waitlisting.
    """
    return await public_rsvp(db, slug, payload)


# ── RSVP status check (no auth) ────────────────────────────────────────

@public_router.get("/{slug}/rsvp/status", response_model=RSVPStatusResponse)
async def rsvp_status(
    slug: str,
    session_token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Guest checks their own RSVP status using their session token."""
    return await get_rsvp_status(db, slug, session_token)


# ── iCal download (no auth) ────────────────────────────────────────────

@public_router.get("/{slug}/calendar")
async def download_ical(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Returns a .ics calendar file for download.
    Compatible with Google Calendar, Apple Calendar, Outlook.
    """
    ical_content = await get_ical(db, slug)
    filename = f"{slug}.ics"

    return Response(
        content=ical_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "text/calendar; charset=utf-8"
        }
    )


# ── OG meta only (for SSR frameworks) ────────────────────────────────

@public_router.get("/{slug}/meta")
async def og_meta(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Returns just the OG meta tags for server-side rendering.
    Next.js / Nuxt can call this to populate <head> tags
    before the page hydrates.
    """
    event_data = await get_public_event(db, slug)
    return event_data.get("og_meta", {})