from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

#In-memorystore - tobe replaced with Redis when we move to production
_request_counts: dict = defaultdict(list)
_blocked_ips: dict = {}

RATE_LIMIT_RULES = {
    "otp_request":        {"max": 3, "window_minutes": 10},
    "magic_link_request": {"max": 3, "window_minutes": 10},
    "otp_verify":         {"max": 5, "window_minutes": 10},
    "magic_link_verify":  {"max": 5, "window_minutes": 10},
    "login":              {"max": 5, "window_minutes": 15} 
}

BLOCK_DURATION_MINUTES = 30

def _clean_old_requests(key: str, window_minutes: int):
    cutoff = datetime.utcnow() - timedelta(minutes=window_minutes)
    _request_counts[key] = [
        t for t in _request_counts[key] if t > cutoff
    ]

def is_blocked(identifier: str) -> bool:
    if identifier in _blocked_ips:
        if datetime.utcnow()< _blocked_ips[identifier]:
            return True
        else:
            del _blocked_ips[identifier] #block expired
        return False
    
def block(identifier: str):
    _blocked_ips[identifier] = datetime.utcmow() + timedelta(minutes=BLOCK_DURATION_MINUTES)


def check_rate_limit(identifier: str, action: str) -> tuple[bool, str]:
    """
    Returns (is_allowed, reason).
    identifier is usually IP or email.
    action isone of the keys in RATE_LIMIT_RULES.
    """
    if is_blocked(identifier):
        unblock_time = _blocked_ips[identifier].strftime("%H:%M UTC")
        return False, f"Too many attempts. You are blocked until {unblock_time}"
    rule = RATE_LIMIT_RULES.get(action)
    if not rule:
        return True, ""
    
    key = f"{action}:{identifier}"
    _clean_old_requests(key, rule["window_minutes"])
    _request_counts[key].append(datetime.utcnow())

    if len(_request_counts[key]) > rule["max"]:
        block(identifier)
        return False, f"Too many{action.replace('_', ' ')} attempts. Blocked for {BLOCK_DURATION_MINUTES} minutes."
    
    remaining = rule["max"] - len(_request_counts[key])
    return True, f"{remaining} attempts remaining"
    