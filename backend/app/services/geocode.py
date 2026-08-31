"""
Geocoding and accurate Timezone resolution service.
Handles Tamil Nadu towns, Indian cities, and international locations.
"""

from typing import Tuple, Dict, Any, Optional
import pytz
try:
    from timezonefinder import TimezoneFinder
    tf = TimezoneFinder()
except Exception:
    tf = None

# Comprehensive pre-indexed database of Tamil Nadu & Indian cities and towns
KNOWN_LOCATIONS: Dict[str, Dict[str, Any]] = {
    # Tamil Nadu Cities & Towns
    "chennai": {"lat": 13.0827, "lon": 80.2707, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "coimbatore": {"lat": 11.0168, "lon": 76.9558, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "madurai": {"lat": 9.9252, "lon": 78.1198, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tiruchirappalli": {"lat": 10.7905, "lon": 78.7047, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "trichy": {"lat": 10.7905, "lon": 78.7047, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "salem": {"lat": 11.6643, "lon": 78.1460, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tirunelveli": {"lat": 8.7139, "lon": 77.7567, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "erode": {"lat": 11.3410, "lon": 77.7172, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "vellore": {"lat": 12.9165, "lon": 79.1325, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "thoothukudi": {"lat": 8.7642, "lon": 78.1348, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tuticorin": {"lat": 8.7642, "lon": 78.1348, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "dindigul": {"lat": 10.3673, "lon": 77.9803, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "thanjavur": {"lat": 10.7870, "lon": 79.1378, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tanjore": {"lat": 10.7870, "lon": 79.1378, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "ranipet": {"lat": 12.9272, "lon": 79.3328, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "sivakasi": {"lat": 9.4533, "lon": 77.7974, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "karur": {"lat": 10.9601, "lon": 78.0766, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "udhagamandalam": {"lat": 11.4102, "lon": 76.6950, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "ooty": {"lat": 11.4102, "lon": 76.6950, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "hosur": {"lat": 12.7409, "lon": 77.8253, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "nagercoil": {"lat": 8.1833, "lon": 77.4119, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "kanchipuram": {"lat": 12.8342, "lon": 79.7036, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "kumarapalayam": {"lat": 11.4422, "lon": 77.7126, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "karaikkudi": {"lat": 10.0735, "lon": 78.7732, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "neyveli": {"lat": 11.5974, "lon": 79.4861, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "cuddalore": {"lat": 11.7480, "lon": 79.7714, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "kumbakonam": {"lat": 10.9602, "lon": 79.3845, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tiruvannamalai": {"lat": 12.2253, "lon": 79.0747, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "pollachi": {"lat": 10.6609, "lon": 77.0084, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "rajapalayam": {"lat": 9.4532, "lon": 77.5539, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "gudiyatham": {"lat": 12.9463, "lon": 78.8681, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "pudukkottai": {"lat": 10.3833, "lon": 78.8001, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "vaniyambadi": {"lat": 12.6825, "lon": 78.6186, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "ambur": {"lat": 12.7904, "lon": 78.7166, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "nagapattinam": {"lat": 10.7672, "lon": 79.8449, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "mayiladuthurai": {"lat": 11.1035, "lon": 79.6550, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tiruchengode": {"lat": 11.3800, "lon": 77.8967, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "ramanathapuram": {"lat": 9.3639, "lon": 78.8395, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "rameshwaram": {"lat": 9.2876, "lon": 79.3129, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "palani": {"lat": 10.4504, "lon": 77.5197, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "dharmapuri": {"lat": 12.1211, "lon": 78.1582, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "krishnagiri": {"lat": 12.5186, "lon": 78.2137, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "namakkal": {"lat": 11.2189, "lon": 78.1674, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tirupathur": {"lat": 12.4965, "lon": 78.5678, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tiruppur": {"lat": 11.1085, "lon": 77.3411, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tenkasi": {"lat": 8.9594, "lon": 77.3160, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "kanyakumari": {"lat": 8.0883, "lon": 77.5385, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "perambalur": {"lat": 11.2342, "lon": 78.8820, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "ariyalur": {"lat": 11.1401, "lon": 79.0786, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "villupuram": {"lat": 11.9401, "lon": 79.4861, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "kallakurichi": {"lat": 11.7383, "lon": 78.9639, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "chengalpattu": {"lat": 12.6841, "lon": 79.9836, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},
    "tiruvallur": {"lat": 13.1432, "lon": 79.9079, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India"},

    # Other Major Indian Cities
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata", "state": "Karnataka", "country": "India"},
    "bangalore": {"lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata", "state": "Karnataka", "country": "India"},
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata", "state": "Maharashtra", "country": "India"},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata", "state": "Delhi", "country": "India"},
    "new delhi": {"lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata", "state": "Delhi", "country": "India"},
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "tz": "Asia/Kolkata", "state": "Telangana", "country": "India"},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata", "state": "West Bengal", "country": "India"},
    "thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India"},
    "trivandrum": {"lat": 8.5241, "lon": 76.9366, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India"},
    "kochi": {"lat": 9.9312, "lon": 76.2673, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India"},
    "palakkad": {"lat": 10.7867, "lon": 76.6548, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India"},
    "puducherry": {"lat": 11.9416, "lon": 79.8083, "tz": "Asia/Kolkata", "state": "Puducherry", "country": "India"},
    "pondicherry": {"lat": 11.9416, "lon": 79.8083, "tz": "Asia/Kolkata", "state": "Puducherry", "country": "India"},

    # Global Cities with Tamil diaspora
    "singapore": {"lat": 1.3521, "lon": 103.8198, "tz": "Asia/Singapore", "country": "Singapore"},
    "kuala lumpur": {"lat": 3.1390, "lon": 101.6869, "tz": "Asia/Kuala_Lumpur", "country": "Malaysia"},
    "colombo": {"lat": 6.9271, "lon": 79.8612, "tz": "Asia/Colombo", "country": "Sri Lanka"},
    "jaffna": {"lat": 9.6615, "lon": 80.0255, "tz": "Asia/Colombo", "country": "Sri Lanka"},
    "london": {"lat": 51.5074, "lon": -0.1278, "tz": "Europe/London", "country": "United Kingdom"},
    "dubai": {"lat": 25.2048, "lon": 55.2708, "tz": "Asia/Dubai", "country": "United Arab Emirates"},
    "new york": {"lat": 40.7128, "lon": -74.0060, "tz": "America/New_York", "country": "United States"},
    "toronto": {"lat": 43.6532, "lon": -79.3832, "tz": "America/Toronto", "country": "Canada"},
    "sydney": {"lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney", "country": "Australia"},
}

def resolve_place(place_name: str, lat: Optional[float] = None, lon: Optional[float] = None, tz: Optional[str] = None) -> Tuple[float, float, str]:
    """
    Resolves place query to (latitude, longitude, timezone_str).
    If lat and lon are provided, resolves timezone if needed.
    """
    if lat is not None and lon is not None:
        if tz:
            return lat, lon, tz
        if tf:
            detected_tz = tf.timezone_at(lat=lat, lng=lon)
            if detected_tz:
                return lat, lon, detected_tz
        return lat, lon, "Asia/Kolkata"

    cleaned = place_name.lower().strip()
    # Check known matches
    for key, data in KNOWN_LOCATIONS.items():
        if key in cleaned or cleaned in key:
            return data["lat"], data["lon"], data["tz"]

    # Fallback to Coimbatore / Tamil Nadu default if unknown
    return 11.0168, 76.9558, "Asia/Kolkata"
