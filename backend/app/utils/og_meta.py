import os
from datetime import datetime


def generate_og_meta(
    event_name: str,
    event_description: str,
    location: str,
    start_time: datetime,
    slug: str,
    image_url: str = None
) -> dict:
    """
    Generate Open Graph and Twitter Card meta tag data.
    The frontend uses these values to populate <meta> tags
    for rich link previews on WhatsApp, Twitter, Telegram etc.
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    event_url = f"{frontend_url}/events/{slug}"

    # format date for display
    formatted_date = start_time.strftime("%A, %d %B %Y at %I:%M %p") if start_time else ""
    description = event_description or f"Join us at {event_name}"
    if location:
        description += f" — {location}"
    if formatted_date:
        description += f" — {formatted_date}"

    default_image = f"{frontend_url}/og-default.png"

    return {
        # Open Graph
        "og:type": "event",
        "og:event-name": event_name,
        "og:description": description[:200],
        "og:url": event_url,
        "og:image": image_url or default_image,
        "og:site_name": "GatePass",

        # Twitter Card
        "twitter:card": "summary_large_image",
        "twitter:event_name": event_name,
        "twitter:description": description[:200],
        "twitter:image": image_url or default_image,

        # Structured extras for frontend
        "event_url": event_url,
        "formatted_date": formatted_date,
        "location": location or "",
    }