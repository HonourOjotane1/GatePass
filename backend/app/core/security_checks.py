import re
from fastapi import HTTPException, status


def validate_email_format(email: str):
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid email format."
        )


def validate_otp_format(token: str):
    """OTP must be exactly 6 digits. """
    if not token.isdigit() or len(token) != 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="OTP mustbe a 6-digit number."
        )
    
def validate_token_format(token: str):
    """Magic link token basic sanity check."""
    if len(token)< 20 or not token.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid token format."
        )
    
def validate_password_strength(password: str):
    """Enforce password rules for traditional auth."""
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("one number")
    if not re.search(r"[!@#$%^&(),.?\":{}|<>]", password):
        errors.append("one special character")
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"password must contain: {', '.join(errors)}."
        )  
