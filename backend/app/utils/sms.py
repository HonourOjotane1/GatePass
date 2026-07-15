import os
from dotenv import load_dotenv

load_dotenv()

def send_sms(phone_number: str, message: str):
    """
    SMS sending via Termii (popular in Nigeria) or Twilio.
    Termii is recommended for the Nigerian market.
    Add TERMII_API_KEY and TERMII_SENDER_ID to your .env
    Install: pip install requests
    """
    import requests

    api_key = os.getenv("TERMII_API_KEY")
    sender_id = os.getenv("TERMII_SENDER_ID", "GatePass")

    if not api_key:
        # Dev mode — just print instead of sending
        print(f"[DEV SMS] To: {phone_number} | Message: {message}")
        return

    payload = {
        "to": phone_number,
        "from": sender_id,
        "sms": message,
        "type": "plain",
        "channel": "generic",
        "api_key": api_key,
    }

    response = requests.post(
        "https://api.ng.termii.com/api/sms/send",
        json=payload,
        timeout=10
    )
    response.raise_for_status()


def send_rsvp_invitation_sms(phone_number: str, guest_name: str, event_name: str, rsvp_link: str):
    message = f"Hi {guest_name or 'there'}, you're invited to {event_name}! RSVP here: {rsvp_link}"
    send_sms(phone_number, message)


def send_waitlist_promotion_sms(phone_number: str, guest_name: str, event_name: str, rsvp_link: str):
    message = f"Hi {guest_name or 'there'}, a spot opened up at {event_name}! Confirm here: {rsvp_link}"
    send_sms(phone_number, message)