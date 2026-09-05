"""
Geocoding and accurate Timezone resolution service.
Handles Tamil Nadu towns, Indian cities, and international locations.
"""

from typing import Tuple, Dict, Any, Optional, List
import pytz
try:
    from timezonefinder import TimezoneFinder
    tf = TimezoneFinder()
except Exception:
    tf = None

# Comprehensive pre-indexed database of Tamil Nadu & Indian cities and towns
# Comprehensive pre-indexed database of Tamil Nadu (all 38 districts & key towns), Indian cities, and global diaspora
KNOWN_LOCATIONS: Dict[str, Dict[str, Any]] = {
    # ── Tamil Nadu: All 38 Districts & Prominent Towns ──
    "chennai": {"name_ta": "சென்னை", "lat": 13.0827, "lon": 80.2707, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "coimbatore": {"name_ta": "கோயம்புத்தூர் (கோவை)", "lat": 11.0168, "lon": 76.9558, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "madurai": {"name_ta": "மதுரை", "lat": 9.9252, "lon": 78.1198, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tiruchirappalli": {"name_ta": "திருச்சிராப்பள்ளி (திருச்சி)", "lat": 10.7905, "lon": 78.7047, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "trichy": {"name_ta": "திருச்சி", "lat": 10.7905, "lon": 78.7047, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "salem": {"name_ta": "சேலம்", "lat": 11.6643, "lon": 78.1460, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tirunelveli": {"name_ta": "திருநெல்வேலி", "lat": 8.7139, "lon": 77.7567, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "erode": {"name_ta": "ஈரோடு", "lat": 11.3410, "lon": 77.7172, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tiruppur": {"name_ta": "திருப்பூர்", "lat": 11.1085, "lon": 77.3411, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "vellore": {"name_ta": "வேலூர்", "lat": 12.9165, "lon": 79.1325, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "thanjavur": {"name_ta": "தஞ்சாவூர்", "lat": 10.7870, "lon": 79.1378, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "thoothukudi": {"name_ta": "தூத்துக்குடி", "lat": 8.7642, "lon": 78.1348, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tuticorin": {"name_ta": "தூத்துக்குடி", "lat": 8.7642, "lon": 78.1348, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "dindigul": {"name_ta": "திண்டுக்கல்", "lat": 10.3673, "lon": 77.9803, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "kanyakumari": {"name_ta": "கன்னியாகுமரி", "lat": 8.0883, "lon": 77.5385, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "nagercoil": {"name_ta": "நாகர்கோவில்", "lat": 8.1833, "lon": 77.4119, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "kanchipuram": {"name_ta": "காஞ்சிபுரம்", "lat": 12.8342, "lon": 79.7036, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tiruvannamalai": {"name_ta": "திருவண்ணாமலை", "lat": 12.2253, "lon": 79.0747, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "cuddalore": {"name_ta": "கடலூர்", "lat": 11.7480, "lon": 79.7714, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "chidambaram": {"name_ta": "சிதம்பரம்", "lat": 11.3992, "lon": 79.6935, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "kumbakonam": {"name_ta": "கும்பகோணம்", "lat": 10.9602, "lon": 79.3845, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "karur": {"name_ta": "கரூர்", "lat": 10.9601, "lon": 78.0766, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "namakkal": {"name_ta": "நாமக்கல்", "lat": 11.2189, "lon": 78.1674, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "dharmapuri": {"name_ta": "தருமபுரி", "lat": 12.1211, "lon": 78.1582, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "krishnagiri": {"name_ta": "கிருஷ்ணகிரி", "lat": 12.5186, "lon": 78.2137, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "hosur": {"name_ta": "ஓசூர்", "lat": 12.7409, "lon": 77.8253, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "ooty": {"name_ta": "ஊட்டி (நீலகிரி)", "lat": 11.4102, "lon": 76.6950, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "nilgiris": {"name_ta": "நீலகிரி", "lat": 11.4102, "lon": 76.6950, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "pudukkottai": {"name_ta": "புதுக்கோட்டை", "lat": 10.3833, "lon": 78.8001, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "karaikkudi": {"name_ta": "காரைக்குடி", "lat": 10.0735, "lon": 78.7732, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "sivaganga": {"name_ta": "சிவகங்கை", "lat": 9.8433, "lon": 78.4809, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "virudhunagar": {"name_ta": "விருதுநகர்", "lat": 9.5680, "lon": 77.9624, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "sivakasi": {"name_ta": "சிவகாசி", "lat": 9.4533, "lon": 77.7974, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "rajapalayam": {"name_ta": "ராஜபாளையம்", "lat": 9.4532, "lon": 77.5539, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "ramanathapuram": {"name_ta": "ராமநாதபுரம்", "lat": 9.3639, "lon": 78.8395, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "rameshwaram": {"name_ta": "ராமேஸ்வரம்", "lat": 9.2876, "lon": 79.3129, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tenkasi": {"name_ta": "தென்காசி", "lat": 8.9594, "lon": 77.3160, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "theni": {"name_ta": "தேனி", "lat": 10.0104, "lon": 77.4768, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "nagapattinam": {"name_ta": "நாகப்பட்டினம்", "lat": 10.7672, "lon": 79.8449, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "mayiladuthurai": {"name_ta": "மயிலாடுதுறை", "lat": 11.1035, "lon": 79.6550, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tiruvarur": {"name_ta": "திருவாரூர்", "lat": 10.7725, "lon": 79.6365, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "ariyalur": {"name_ta": "அரியலூர்", "lat": 11.1401, "lon": 79.0786, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "perambalur": {"name_ta": "பெரம்பலூர்", "lat": 11.2342, "lon": 78.8820, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "villupuram": {"name_ta": "விழுப்புரம்", "lat": 11.9401, "lon": 79.4861, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "kallakurichi": {"name_ta": "கள்ளக்குறிச்சி", "lat": 11.7383, "lon": 78.9639, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tiruvallur": {"name_ta": "திருவள்ளூர்", "lat": 13.1432, "lon": 79.9079, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "chengalpattu": {"name_ta": "செங்கல்பட்டு", "lat": 12.6841, "lon": 79.9836, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "ranipet": {"name_ta": "ராணிப்பேட்டை", "lat": 12.9272, "lon": 79.3328, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tirupathur": {"name_ta": "திருப்பத்தூர்", "lat": 12.4965, "lon": 78.5678, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "pollachi": {"name_ta": "பொள்ளாச்சி", "lat": 10.6609, "lon": 77.0084, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "palani": {"name_ta": "பழனி", "lat": 10.4504, "lon": 77.5197, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "tiruchendur": {"name_ta": "திருச்செந்தூர்", "lat": 8.4966, "lon": 78.1219, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "srirangam": {"name_ta": "ஸ்ரீரங்கம்", "lat": 10.8622, "lon": 78.6946, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},
    "neyveli": {"name_ta": "நெய்வேலி", "lat": 11.5974, "lon": 79.4861, "tz": "Asia/Kolkata", "state": "Tamil Nadu", "country": "India", "category": "tamil_nadu"},

    # ── Other Major Indian Cities & Neighboring States ──
    "bengaluru": {"name_ta": "பெங்களூரு", "lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata", "state": "Karnataka", "country": "India", "category": "india"},
    "bangalore": {"name_ta": "பெங்களூரு", "lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata", "state": "Karnataka", "country": "India", "category": "india"},
    "mumbai": {"name_ta": "மும்பை", "lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata", "state": "Maharashtra", "country": "India", "category": "india"},
    "delhi": {"name_ta": "தில்லி (புது தில்லி)", "lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata", "state": "Delhi", "country": "India", "category": "india"},
    "hyderabad": {"name_ta": "ஹைதராபாத்", "lat": 17.3850, "lon": 78.4867, "tz": "Asia/Kolkata", "state": "Telangana", "country": "India", "category": "india"},
    "kolkata": {"name_ta": "கொல்கத்தா", "lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata", "state": "West Bengal", "country": "India", "category": "india"},
    "thiruvananthapuram": {"name_ta": "திருவனந்தபுரம்", "lat": 8.5241, "lon": 76.9366, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India", "category": "india"},
    "kochi": {"name_ta": "கொச்சி", "lat": 9.9312, "lon": 76.2673, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India", "category": "india"},
    "palakkad": {"name_ta": "பாலக்காடு", "lat": 10.7867, "lon": 76.6548, "tz": "Asia/Kolkata", "state": "Kerala", "country": "India", "category": "india"},
    "puducherry": {"name_ta": "புதுச்சேரி (பாண்டிச்சேரி)", "lat": 11.9416, "lon": 79.8083, "tz": "Asia/Kolkata", "state": "Puducherry", "country": "India", "category": "india"},

    # ── Global Cities with Tamil Diaspora ──
    "singapore": {"name_ta": "சிங்கப்பூர்", "lat": 1.3521, "lon": 103.8198, "tz": "Asia/Singapore", "country": "Singapore", "category": "global"},
    "kuala lumpur": {"name_ta": "கோலாலம்பூர்", "lat": 3.1390, "lon": 101.6869, "tz": "Asia/Kuala_Lumpur", "country": "Malaysia", "category": "global"},
    "colombo": {"name_ta": "கொழும்பு", "lat": 6.9271, "lon": 79.8612, "tz": "Asia/Colombo", "country": "Sri Lanka", "category": "global"},
    "jaffna": {"name_ta": "யாழ்ப்பாணம்", "lat": 9.6615, "lon": 80.0255, "tz": "Asia/Colombo", "country": "Sri Lanka", "category": "global"},
    "london": {"name_ta": "லண்டன்", "lat": 51.5074, "lon": -0.1278, "tz": "Europe/London", "country": "United Kingdom", "category": "global"},
    "dubai": {"name_ta": "துபாய்", "lat": 25.2048, "lon": 55.2708, "tz": "Asia/Dubai", "country": "United Arab Emirates", "category": "global"},
    "new york": {"name_ta": "நியூயார்க்", "lat": 40.7128, "lon": -74.0060, "tz": "America/New_York", "country": "United States", "category": "global"},
    "toronto": {"name_ta": "டொராண்டோ", "lat": 43.6532, "lon": -79.3832, "tz": "America/Toronto", "country": "Canada", "category": "global"},
    "sydney": {"name_ta": "சிட்னி", "lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney", "country": "Australia", "category": "global"},
}


# In-memory cache for dynamic geocoding queries
_DYNAMIC_CACHE: Dict[str, List[Dict[str, Any]]] = {}


def fetch_dynamic_geocoding(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Queries free, unauthenticated geocoding APIs (Open-Meteo Geocoding & OpenStreetMap Nominatim)
    to dynamically resolve any village, town, city, or district worldwide without hardcoding.
    Includes in-memory caching and fallback resilience.
    """
    cleaned = (query or "").strip()
    if not cleaned or len(cleaned) < 2:
        return []

    cache_key = cleaned.lower()
    if cache_key in _DYNAMIC_CACHE:
        return _DYNAMIC_CACHE[cache_key]

    results: List[Dict[str, Any]] = []
    seen = set()

    import urllib.request
    import urllib.parse
    import json

    # Check if query contains non-ASCII characters (e.g., Tamil script)
    is_tamil_or_non_ascii = any(ord(c) > 127 for c in cleaned)

    # 1. Try Open-Meteo (Fastest, provides direct timezone, covers global places)
    if not is_tamil_or_non_ascii:
        try:
            encoded_name = urllib.parse.quote(cleaned)
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_name}&count={limit}&language=en&format=json"
            req = urllib.request.Request(url, headers={"User-Agent": "AIJathagam/1.0"})
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for item in data.get("results", []):
                    lat = float(item["latitude"])
                    lon = float(item["longitude"])
                    loc_id = f"{round(lat, 3)}_{round(lon, 3)}"
                    if loc_id in seen:
                        continue
                    seen.add(loc_id)

                    parts = [item.get("name", "")]
                    if item.get("admin2"):
                        parts.append(item["admin2"])
                    if item.get("admin1") and item.get("admin1") != item.get("name"):
                        parts.append(item["admin1"])
                    if item.get("country"):
                        parts.append(item["country"])

                    tz = item.get("timezone") or "Asia/Kolkata"
                    results.append({
                        "display_name": ", ".join(parts),
                        "display_name_ta": item.get("name", ""),
                        "lat": lat,
                        "lon": lon,
                        "timezone": tz,
                        "country": item.get("country", "India"),
                        "state": item.get("admin1", ""),
                    })
        except Exception:
            pass

    # 2. If no results or Tamil query, try OpenStreetMap Nominatim
    if not results:
        try:
            encoded_query = urllib.parse.quote(cleaned)
            url = f"https://nominatim.openstreetmap.org/search?q={encoded_query}&format=json&limit={limit}&addressdetails=1"
            req = urllib.request.Request(url, headers={"User-Agent": "AIJathagam-Astrology/1.0 (contact: info@aijathagam.internal)"})
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for item in data:
                    lat = float(item["lat"])
                    lon = float(item["lon"])
                    loc_id = f"{round(lat, 3)}_{round(lon, 3)}"
                    if loc_id in seen:
                        continue
                    seen.add(loc_id)

                    addr = item.get("address", {})
                    tz = "Asia/Kolkata"
                    if tf:
                        try:
                            detected = tf.timezone_at(lat=lat, lng=lon)
                            if detected:
                                tz = detected
                        except Exception:
                            pass

                    results.append({
                        "display_name": item.get("display_name", cleaned),
                        "display_name_ta": cleaned,
                        "lat": lat,
                        "lon": lon,
                        "timezone": tz,
                        "country": addr.get("country", "India"),
                        "state": addr.get("state", addr.get("state_district", "")),
                    })
        except Exception:
            pass

    if results:
        _DYNAMIC_CACHE[cache_key] = results[:limit]

    return results[:limit]


def resolve_place(place_name: str, lat: Optional[float] = None, lon: Optional[float] = None, tz: Optional[str] = None) -> Tuple[float, float, str]:
    """
    Resolves place query to (latitude, longitude, timezone_str).
    If lat and lon are provided, resolves timezone if needed.
    If place_name is given, dynamically searches using free geocoding APIs.
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
    # 1. Check known fast-path matches
    for key, data in KNOWN_LOCATIONS.items():
        if key in cleaned or cleaned in key:
            return data["lat"], data["lon"], data["tz"]

    # 2. Query dynamic free geocoding API for unindexed locations
    try:
        dynamic_matches = fetch_dynamic_geocoding(place_name, limit=1)
        if dynamic_matches:
            match = dynamic_matches[0]
            return match["lat"], match["lon"], match["timezone"]
    except Exception:
        pass

    # Fallback to Coimbatore / Tamil Nadu default if completely unreachable
    return 11.0168, 76.9558, "Asia/Kolkata"


def get_grouped_locations() -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns pre-grouped locations for the frontend dropdown:
    {
      "tamil_nadu": [...],
      "india": [...],
      "global": [...]
    }
    """
    grouped = {
        "tamil_nadu": [],
        "india": [],
        "global": []
    }
    seen = set()
    for key, data in KNOWN_LOCATIONS.items():
        # Avoid duplicates (e.g. trichy/tiruchirappalli or bangalore/bengaluru)
        loc_id = f"{round(data['lat'], 3)}_{round(data['lon'], 3)}"
        if loc_id in seen:
            continue
        seen.add(loc_id)

        cat = data.get("category", "tamil_nadu")
        item = {
            "key": key,
            "name": key.title(),
            "name_ta": data.get("name_ta", key.title()),
            "display_name": f"{key.title()}, {data.get('state', data.get('country', ''))}",
            "display_name_ta": f"{data.get('name_ta', key.title())}, {data.get('state', data.get('country', ''))}",
            "lat": data["lat"],
            "lon": data["lon"],
            "timezone": data["tz"],
            "state": data.get("state"),
            "country": data.get("country", "India")
        }
        if cat in grouped:
            grouped[cat].append(item)

    return grouped


def search_places(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Returns matches dynamically from the free geocoding API (Open-Meteo & Nominatim)
    along with instant fast-path local matches.
    """
    cleaned = (query or "").lower().strip()
    if not cleaned:
        # Return popular first few
        return [
            {
                "display_name": f"{k.title()}, {v.get('state', v.get('country', ''))}",
                "display_name_ta": f"{v.get('name_ta', k.title())}",
                "lat": v["lat"],
                "lon": v["lon"],
                "timezone": v["tz"],
            }
            for k, v in list(KNOWN_LOCATIONS.items())[:8]
        ]

    matches: List[Dict[str, Any]] = []
    seen = set()

    # 1. Fetch dynamic results from the free open geocoding API
    try:
        dynamic_results = fetch_dynamic_geocoding(cleaned, limit=limit)
        for item in dynamic_results:
            loc_id = f"{round(item['lat'], 3)}_{round(item['lon'], 3)}"
            if loc_id not in seen:
                seen.add(loc_id)
                # Check if there is a known Tamil name for this location
                for k, v in KNOWN_LOCATIONS.items():
                    if k in item["display_name"].lower() or item["display_name"].lower().startswith(k):
                        item["display_name_ta"] = v.get("name_ta", item["display_name_ta"])
                        break
                matches.append(item)
    except Exception:
        pass

    # 2. Also check KNOWN_LOCATIONS for immediate local hits
    for key, data in KNOWN_LOCATIONS.items():
        name_ta = data.get("name_ta", "")
        if cleaned in key or cleaned in name_ta.lower() or key in cleaned:
            loc_id = f"{round(data['lat'], 3)}_{round(data['lon'], 3)}"
            if loc_id in seen:
                continue
            seen.add(loc_id)

            label_parts = [key.title()]
            if data.get("state"):
                label_parts.append(data["state"])
            if data.get("country"):
                label_parts.append(data["country"])
            matches.append(
                {
                    "display_name": ", ".join(label_parts),
                    "display_name_ta": f"{name_ta} ({key.title()})",
                    "lat": data["lat"],
                    "lon": data["lon"],
                    "timezone": data["tz"],
                }
            )
        if len(matches) >= limit:
            break

    return matches