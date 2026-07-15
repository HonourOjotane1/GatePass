import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()


def _send_email(to: str, subject: str, body: str):
    """Shared SMTP sender used by all email functions."""
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = to

    with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
        server.starttls()
        server.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
        server.send_message(msg)


# ── Auth emails ────────────────────────────────────────────────────────

def send_magic_link(email: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL")
    link = f"{frontend_url}/auth/verify?token={token}"
    _send_email(
        to=email,
        subject="Your GatePass Login Link",
        body=f"Click to login:\n\n{link}"
    )


def send_otp(email: str, code: str):
    _send_email(
        to=email,
        subject="Your GatePass OTP Code",
        body=f"Your GatePass verification code is:\n\n{code}\n\nIt expires in 10 minutes."
    )


# ── Guest / RSVP emails ────────────────────────────────────────────────

def send_rsvp_invitation_email(email: str, guest_name: str, event_name: str, rsvp_link: str):
    body = f"""Hi {guest_name or 'there'},

You're invited to {event_name}!

Please confirm your attendance by clicking the link below:

{rsvp_link}

This link is unique to you. Please do not share it.

See you there!
The GatePass Team"""
    _send_email(
        to=email,
        subject=f"You're invited to {event_name}",
        body=body
    )


def send_rsvp_confirmation_email(email: str, guest_name: str, event_name: str):
    # _send_email is eliminates the repeated SMTP block such that any future email simply calls _send_email with the appropriate parameters with a subject and body.
    _send_email(
        to=email,
        subject=f"RSVP Confirmed — {event_name}",
        body=f"Hi {guest_name or 'there'},\n\nYour RSVP for {event_name} is confirmed. See you there!\n\nThe GatePass Team"
    )


def send_waitlist_promotion_email(email: str, guest_name: str, event_name: str, rsvp_link: str):
    _send_email(
        to=email,
        subject=f"A spot opened up — {event_name}",
        body=f"Hi {guest_name or 'there'},\n\nGreat news! A spot has opened up for {event_name}.\n\nConfirm your attendance here:\n{rsvp_link}\n\nThis offer expires in 24 hours.\n\nThe GatePass Team"
    )