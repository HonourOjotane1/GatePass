import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance in metres between two GPS coordinates
    using the Haversine formula.
    """
    R = 6371000  # Earth's radius in metres

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c  # metres


def is_within_radius(
    scan_lat: float,
    scan_lon: float,
    venue_lat: float,
    venue_lon: float,
    radius_meters: float
) -> tuple[bool, float]:
    """
    Returns (is_within, distance_in_metres).
    """
    distance = haversine_distance(scan_lat, scan_lon, venue_lat, venue_lon)
    return distance <= radius_meters, round(distance, 2)