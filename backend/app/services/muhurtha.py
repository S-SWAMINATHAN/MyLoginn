"""
Muhurtha (Vedic Electional Astrology) scanning engine.
Governed by AGENTS.md — every exclusion/inclusion rule below is cited.

Implemented event types:
  - "general" — universal Panchangam good/bad day screening only (Rikta
    Tithi, Amavasya, Bhadra/Vishti Karana, Marana Yoga, plus Tara Bala /
    Chandra Bala if a person's birth details are supplied). No event-specific
    rule is applied — this is the same "is this a generally auspicious day"
    check a traditional Tamil calendar/Panchangam gives, independent of what
    the day is being used for.
  - "marriage" (Vivaha Muhurtham) — general screening + Vivaha-auspicious
    Nakshatra check.
  - "travel" (Yatra / Dishashool) — general screening + Dishashool weekday
    direction check.

Other event types (Griha Pravesam, Business Start, etc.) are NOT
implemented — their rule sets involve additional variables (house-facing
direction, specific masa/paksha restrictions) that should not be
approximated from these three without their own cited sources, per
AGENTS.md §1.2 and §1.8 (no scope creep, flag what isn't built yet).

CHANGE LOG — location/time parity with the Jathagam feature
-----------------------------------------------------------
Previously this module only ever received PLACE NAME STRINGS for the two
people's birth places (`resolve_place(place)` with no coordinates), while
the main chart pipeline received the latitude/longitude/timezone that the
frontend's LocationPicker had already resolved. That asymmetry is why the
Muhurtha page's location handling behaved differently from the Jathagam
page's. Now every place — event + person A + person B — accepts optional
pre-resolved `latitude` / `longitude` / `timezone`, exactly like
`GenerateChartRequest`, and falls back to geocoding by name only when they
are absent. Birth times are also normalised ("HH:MM" → "HH:MM:SS") so the
12-hour time picker's output is always accepted.

No astrological rule was changed by that work.
"""

import math
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions

MAX_RANGE_DAYS = 60

MARRIAGE_AUSPICIOUS_NAKSHATRAS = {
    "Rohini", "Mrigashirsha", "Uttara Phalguni", "Hasta", "Swati",
    "Anuradha", "Uttara Ashadha", "Uttara Bhadrapada", "Revati",
}

DISHASHOOL_BY_WEEKDAY = {
    0: "W",  # Sunday
    1: "E",  # Monday
    2: "N",  # Tuesday
    3: "N",  # Wednesday
    4: "S",  # Thursday
    5: "W",  # Friday
    6: "E",  # Saturday
}

_TARA_BALA_TABLE = [
    None,
    ("Janma", "ஜென்ம", False),
    ("Sampat", "சம்பத்", True),
    ("Vipat", "விபத்", False),
    ("Kshema", "க்ஷேம", True),
    ("Pratyak", "பிரத்யக்", False),
    ("Sadhaka", "சாதக", True),
    ("Vadha", "வத", False),
    ("Mitra", "மித்ர", True),
    ("Ati Mitra", "அதி மித்ர", True),
]

CLASSICAL_SOURCES = [
    "General Panchangam good/bad day screening (Rikta Tithi, Amavasya, Bhadra/Vishti Karana, Tamil Dina Yoga)",
    "Muhurtha Chintamani (Vivaha & general Shuddhi chapters)",
    "Traditional Panchangam Dishashool table (Yatra Muhurtham)",
    "Standard Tara Bala / Chandra Bala rules used in Panchangam practice",
]

VALID_DIRECTIONS = {"N", "S", "E", "W"}


# ---------------------------------------------------------------------------
# Input normalisation helpers (no astrology here — parsing only)
# ---------------------------------------------------------------------------

_TIME_RE = re.compile(r"^\s*(\d{1,2})\s*:\s*(\d{1,2})\s*(?::\s*(\d{1,2})\s*)?$")


def _normalize_time(value: Optional[str], default: str = "07:00:00") -> str:
    """Accepts 'H:M', 'HH:MM' or 'HH:MM:SS' and returns 'HH:MM:SS'.

    The frontend's <TimeInput12h> already emits 24-hour 'HH:MM:SS', but a
    hand-typed or legacy value must not blow up the ephemeris call.
    """
    if not value:
        return default
    m = _TIME_RE.match(value)
    if not m:
        raise ValueError(f"Invalid time of birth '{value}'. Expected HH:MM or HH:MM:SS (24-hour).")
    hh, mm, ss = int(m.group(1)), int(m.group(2)), int(m.group(3) or 0)
    if not (0 <= hh <= 23 and 0 <= mm <= 59 and 0 <= ss <= 59):
        raise ValueError(f"Invalid time of birth '{value}'. Hours 0-23, minutes/seconds 0-59.")
    return f"{hh:02d}:{mm:02d}:{ss:02d}"


def _parse_date(value: str, field: str) -> datetime:
    try:
        return datetime.strptime(value.strip(), "%Y-%m-%d")
    except Exception:
        raise ValueError(f"Invalid {field} '{value}'. Expected YYYY-MM-DD.")


def _resolve_location(
    place: Optional[str],
    latitude: Optional[float],
    longitude: Optional[float],
    timezone: Optional[str],
    label: str,
) -> Tuple[float, float, str]:
    """Same contract as the chart pipeline: use the coordinates the frontend
    already resolved when present, otherwise geocode the place name."""
    if latitude is not None and longitude is not None:
        return float(latitude), float(longitude), (timezone or "Asia/Kolkata")
    if not place or not place.strip():
        raise ValueError(f"{label} is required — pick a place from the location search.")
    try:
        lat, lon, tz = resolve_place(place, latitude, longitude, timezone)
    except TypeError:
        # Older geocode.resolve_place signature (name only).
        lat, lon, tz = resolve_place(place)
    except Exception as e:
        raise ValueError(f"Could not resolve {label} '{place}': {e}")
    if lat is None or lon is None:
        raise ValueError(
            f"Could not resolve {label} '{place}'. Try selecting it from the location "
            f"suggestions, or enter the latitude/longitude manually."
        )
    return float(lat), float(lon), (tz or timezone or "Asia/Kolkata")


def _weekday_num(jd: float) -> int:
    return int(math.floor(jd + 1.5)) % 7


# ---------------------------------------------------------------------------
# Classical rule helpers
# ---------------------------------------------------------------------------

def compute_tara_bala(birth_nak_num: int, transit_nak_num: int) -> Dict[str, Any]:
    count = ((transit_nak_num - birth_nak_num) % 27) + 1
    tara_index = ((count - 1) % 9) + 1
    name_en, name_ta, favorable = _TARA_BALA_TABLE[tara_index]
    return {"name": name_en, "name_ta": name_ta, "favorable": favorable}


def compute_chandra_bala(birth_rasi_num: int, transit_rasi_num: int) -> bool:
    count = ((transit_rasi_num - birth_rasi_num) % 12) + 1
    return count not in (4, 8, 12)


def _rikta_or_amavasya(tithi_index_0based: int) -> Optional[str]:
    if tithi_index_0based == 29:
        return "amavasya"
    day_in_paksha = (tithi_index_0based % 15) + 1
    if day_in_paksha in (4, 9, 14):
        return "rikta"
    return None


def _resolve_person_moon(
    dob: Optional[str],
    tob: Optional[str],
    place: Optional[str],
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    timezone: Optional[str] = None,
    fallback: Optional[Tuple[float, float, str]] = None,
    label: str = "birth place",
):
    """Returns (nakshatra_number, rasi_number) of the person's natal Moon.

    `fallback` is the already-resolved event location, used when the caller
    supplied a date of birth but no birth place at all — better than silently
    dropping the personalised Tara/Chandra Bala checks the user asked for.
    The Moon moves ~13°/day, so a wrong-city (same-timezone) fallback shifts
    the Moon by a few arc-minutes at most; it is flagged in the response via
    `person_a_location_assumed` so the UI can say so if it ever needs to.
    """
    if not dob:
        return None, None, False

    tob_norm = _normalize_time(tob)
    assumed = False

    if latitude is not None and longitude is not None:
        lat, lon, tz = float(latitude), float(longitude), (timezone or "Asia/Kolkata")
    elif place and place.strip():
        lat, lon, tz = _resolve_location(place, None, None, timezone, label)
    elif fallback:
        lat, lon, tz = fallback
        assumed = True
    else:
        raise ValueError(f"{label} is required when a date of birth is supplied.")

    _parse_date(dob, "date of birth")
    jd = get_julian_day(dob, tob_norm, tz)
    eph = compute_planetary_positions(jd, lat, lon, date_str=dob, time_str=tob_norm, timezone_str=tz)
    moon = eph["positions_by_name"]["Moon"]
    return moon["nakshatra_number"], moon["rasi_number"], assumed


# ---------------------------------------------------------------------------
# Main scan
# ---------------------------------------------------------------------------

def scan_muhurtha_range(
    event_type: str,
    start_date: str,
    end_date: str,
    place: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    timezone: Optional[str] = None,
    person_a_dob: Optional[str] = None,
    person_a_tob: Optional[str] = None,
    person_a_place: Optional[str] = None,
    person_a_latitude: Optional[float] = None,
    person_a_longitude: Optional[float] = None,
    person_a_timezone: Optional[str] = None,
    person_b_dob: Optional[str] = None,
    person_b_tob: Optional[str] = None,
    person_b_place: Optional[str] = None,
    person_b_latitude: Optional[float] = None,
    person_b_longitude: Optional[float] = None,
    person_b_timezone: Optional[str] = None,
    travel_direction: Optional[str] = None,
) -> Dict[str, Any]:
    lat, lon, tz = _resolve_location(place, latitude, longitude, timezone, "event location")

    start = _parse_date(start_date, "start date")
    end = _parse_date(end_date, "end date")
    if (end - start).days < 0:
        raise ValueError("end_date must be on or after start_date.")
    if (end - start).days > MAX_RANGE_DAYS:
        raise ValueError(f"Date range too large — please search {MAX_RANGE_DAYS} days or fewer at a time.")

    direction = (travel_direction or "").strip().upper() or None
    if event_type == "travel" and direction and direction not in VALID_DIRECTIONS:
        raise ValueError(f"travel_direction must be one of {sorted(VALID_DIRECTIONS)}.")

    person_a_nak, person_a_rasi, a_assumed = _resolve_person_moon(
        person_a_dob, person_a_tob, person_a_place,
        person_a_latitude, person_a_longitude, person_a_timezone,
        fallback=(lat, lon, tz), label="Person A birth place",
    )
    person_b_nak, person_b_rasi, b_assumed = _resolve_person_moon(
        person_b_dob, person_b_tob, person_b_place,
        person_b_latitude, person_b_longitude, person_b_timezone,
        fallback=(lat, lon, tz), label="Person B birth place",
    )

    days: List[Dict[str, Any]] = []
    cur = start
    while cur <= end:
        date_str = cur.strftime("%Y-%m-%d")

        jd = get_julian_day(date_str, "06:00:00", tz)
        eph = compute_planetary_positions(
            jd, lat, lon, date_str=date_str, time_str="06:00:00", timezone_str=tz
        )
        bd = eph["basic_details"]
        moon = eph["positions_by_name"]["Moon"]
        sun_lon = eph["positions_by_name"]["Sun"]["total_degree"]
        moon_lon = moon["total_degree"]
        diff = (moon_lon - sun_lon) % 360.0
        tithi_index = int(diff // 12.0)

        universal_flags: List[str] = []
        universal_flags_ta: List[str] = []

        tithi_flag = _rikta_or_amavasya(tithi_index)
        if tithi_flag == "amavasya":
            universal_flags.append("Amavasya (no-moon day) — traditionally avoided for new beginnings")
            universal_flags_ta.append("அமாவாசை — புதிய காரியங்களுக்கு தவிர்க்கவும்")
        elif tithi_flag == "rikta":
            universal_flags.append("Rikta Tithi (4th/9th/14th) — traditionally avoided")
            universal_flags_ta.append("ரிக்தை திதி — பொதுவாக தவிர்க்கப்படுகிறது")

        if "Vishti" in bd["karanam"]:
            universal_flags.append("Bhadra (Vishti) Karana — avoid starting new ventures")
            universal_flags_ta.append("பத்திரை (விஷ்டி) கரணம் — தவிர்க்கவும்")

        if bd.get("subha_yogam_status") == "Inauspicious":
            universal_flags.append("Marana Yoga — inauspicious day per Tamil Dina Yoga")
            universal_flags_ta.append("மரண யோகம் — அசுப தினம்")

        event_flags: List[str] = []
        event_flags_ta: List[str] = []
        event_specific_ok: Optional[bool] = None
        dishashool_dir: Optional[str] = None
        dishashool_conflict: Optional[bool] = None

        if event_type == "marriage":
            event_specific_ok = bd["nakshatram"] in MARRIAGE_AUSPICIOUS_NAKSHATRAS
            if not event_specific_ok:
                event_flags.append(f"{bd['nakshatram']} is not among the classical Vivaha-auspicious Nakshatras")
                event_flags_ta.append(f"{bd['nakshatram_ta']} திருமண முகூர்த்த நட்சத்திரங்களில் இல்லை")
        elif event_type == "travel":
            dishashool_dir = DISHASHOOL_BY_WEEKDAY[_weekday_num(jd)]
            if direction and direction == dishashool_dir:
                event_specific_ok = False
                dishashool_conflict = True
                event_flags.append(f"Dishashool: {dishashool_dir} direction is inauspicious to travel today")
                event_flags_ta.append(f"திசைசூல் — இன்று {dishashool_dir} திசைக்கு பயணம் தவிர்க்கவும்")
            else:
                event_specific_ok = True
                dishashool_conflict = False
        # event_type == "general": no event-specific rule — event_specific_ok
        # stays None and event_flags stays empty on purpose. The day's rating
        # then rests entirely on the universal screening above, exactly like
        # a plain Panchangam "good day" check independent of any event.

        tara_a = compute_tara_bala(person_a_nak, moon["nakshatra_number"]) if person_a_nak else None
        tara_b = compute_tara_bala(person_b_nak, moon["nakshatra_number"]) if person_b_nak else None
        chandra_a_ok = compute_chandra_bala(person_a_rasi, moon["rasi_number"]) if person_a_rasi else None
        chandra_b_ok = compute_chandra_bala(person_b_rasi, moon["rasi_number"]) if person_b_rasi else None

        if tara_a and not tara_a["favorable"]:
            universal_flags.append(f"Tara Bala (Person A): {tara_a['name']} — unfavorable")
            universal_flags_ta.append(f"தாரா பலம் (நபர் A): {tara_a['name_ta']} — சாதகமற்றது")
        if tara_b and not tara_b["favorable"]:
            universal_flags.append(f"Tara Bala (Person B): {tara_b['name']} — unfavorable")
            universal_flags_ta.append(f"தாரா பலம் (நபர் B): {tara_b['name_ta']} — சாதகமற்றது")
        if chandra_a_ok is False:
            universal_flags.append("Chandra Bala (Person A): Moon in 4th/8th/12th from Janma Rasi")
            universal_flags_ta.append("சந்திர பலம் (நபர் A): அஷ்டம சந்திரம்")
        if chandra_b_ok is False:
            universal_flags.append("Chandra Bala (Person B): Moon in 4th/8th/12th from Janma Rasi")
            universal_flags_ta.append("சந்திர பலம் (நபர் B): அஷ்டம சந்திரம்")

        is_universally_clean = len(universal_flags) == 0

        if is_universally_clean and event_specific_ok is not False:
            rating, rating_ta = "Excellent", "மிகச் சிறந்தது"
        elif event_specific_ok is False or not is_universally_clean:
            rating, rating_ta = "Avoid", "தவிர்க்கவும்"
        else:
            rating, rating_ta = "Good", "நல்லது"

        days.append({
            "date": date_str,
            "vaaram": bd["vaaram"],
            "vaaram_ta": bd["vaaram_ta"],
            "tithi": bd["thithi"],
            "tithi_ta": bd["thithi_ta"],
            "karanam": bd["karanam"],
            "karanam_ta": bd["karanam_ta"],
            "nakshatra": bd["nakshatram"],
            "nakshatra_ta": bd["nakshatram_ta"],
            "subha_yogam_status": bd.get("subha_yogam_status", ""),
            "rahu_kalam": bd["rahu_kalam"],
            "yamagandam": bd["yamagandam"],
            "kuligai": bd["kuligai"],
            "is_universally_clean": is_universally_clean,
            "universal_flags": universal_flags,
            "universal_flags_ta": universal_flags_ta,
            "event_specific_ok": event_specific_ok,
            "event_specific_flags": event_flags,
            "event_specific_flags_ta": event_flags_ta,
            "tara_bala_a": tara_a["name"] if tara_a else None,
            "tara_bala_a_ta": tara_a["name_ta"] if tara_a else None,
            "tara_bala_a_favorable": tara_a["favorable"] if tara_a else None,
            "tara_bala_b": tara_b["name"] if tara_b else None,
            "tara_bala_b_ta": tara_b["name_ta"] if tara_b else None,
            "tara_bala_b_favorable": tara_b["favorable"] if tara_b else None,
            "chandra_bala_a_favorable": chandra_a_ok,
            "chandra_bala_b_favorable": chandra_b_ok,
            "dishashool_direction": dishashool_dir,
            "dishashool_conflict": dishashool_conflict,
            "overall_rating": rating,
            "overall_rating_ta": rating_ta,
            "classical_source": "; ".join(CLASSICAL_SOURCES),
        })

        cur += timedelta(days=1)

    best_days = [d["date"] for d in days if d["overall_rating"] in ("Excellent", "Good")]

    return {
        "event_type": event_type,
        "start_date": start_date,
        "end_date": end_date,
        # Echo back the resolved location so the UI can show exactly which
        # coordinates/timezone the Panchangam was computed for (the Jathagam
        # response already does this; Muhurtha didn't).
        "place": place,
        "latitude": lat,
        "longitude": lon,
        "timezone": tz,
        "travel_direction": direction if event_type == "travel" else None,
        "person_a_location_assumed": a_assumed,
        "person_b_location_assumed": b_assumed,
        "days": days,
        "best_days": best_days,
        "classical_sources": CLASSICAL_SOURCES,
    }