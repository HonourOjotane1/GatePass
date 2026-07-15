from datetime import datetime
import uuid


def generate_ical(
    event_name: str,
    event_description: str,
    location: str,
    start_time: datetime,
    end_time: datetime,
    event_url: str,
    organizer_email: str = None
) -> str:
    """
    Generate a valid .ics calendar file string.
    Compatible with Google Calendar, Apple Calendar, Outlook.
    """
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    uid = str(uuid.uuid4())

    def fmt(dt: datetime) -> str:
        return dt.strftime("%Y%m%dT%H%M%SZ")

    def escape(text: str) -> str:
        if not text:
            return ""
        return (
            text.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n")
        )

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//GatePass//GatePass Event//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{now}",
        f"DTSTART:{fmt(start_time)}",
        f"DTEND:{fmt(end_time)}",
        f"SUMMARY:{escape(event_name)}",
        f"DESCRIPTION:{escape(event_description or '')}",
        f"LOCATION:{escape(location or '')}",
        f"URL:{event_url}",
        "STATUS:CONFIRMED",
    ]

    if organizer_email:
        lines.append(f"ORGANIZER:mailto:{organizer_email}")

    lines += [
        "END:VEVENT",
        "END:VCALENDAR"
    ]

    return "\r\n".join(lines)