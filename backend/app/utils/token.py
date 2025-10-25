from jose import jwt, JWTError
from datetime import datetime, timedelta

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY


def create_access_token(data: dict):
    """
    create a JWT token with the given data payload.

    """

    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update = {"exp": expire}

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str):
    """ "
    Verify a JWT token and return payload if valid

    """
    try:
        payload = jwt.decode(token, jwt, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
