import qrcode
import base64
import io
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
QR_EXPIRE_HOURS = int(os.getenv("QR_EXPIRE_HOURS", 24))


def generate_qr_token(guest_id: str, event_id: str, tier_level: str) -> str:
    """Generate a signed JWT to embed in the QR code."""
    expire = datetime.utcnow() + timedelta(hours=QR_EXPIRE_HOURS)
    payload = {
        "guest_id": guest_id,
        "event_id": event_id,
        "tier_level": tier_level,
        "type": "qr_checkin",
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_qr_token(token: str) -> dict | None:
    """Decode and validate a QR token. Returns None if invalid or expired."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "qr_checkin":
            return None
        return payload
    except Exception:
        return None


def generate_qr_image_base64(data: str) -> str:
    """Generate a QR code image and return it as a base64 string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode()