"""
Tamil wording for values that the engines print in English (designed PDFs).

The calculation engines keep machine-friendly English strings ("06:13:01 AM",
"Asia/Kolkata", "10:34 N", "Lahiri (Chitrapaksha)", "Standard Time"). On Tamil
pages these are shown in Tamil; the numbers themselves are never changed —
only the words around them.
"""
from __future__ import annotations

import re
from typing import Optional

# hour of the day (24 h) -> Tamil part of the day, as Tamil jathagams write times
def _day_part(h24: int) -> str:
    if 4 <= h24 < 6:
        return "அதிகாலை"
    if 6 <= h24 < 12:
        return "காலை"
    if 12 <= h24 < 16:
        return "மதியம்"
    if 16 <= h24 < 19:
        return "மாலை"
    return "இரவு"


_AMPM = re.compile(r"\b(\d{1,2})([:.])(\d{2})(?:\2(\d{2}))?\s*(AM|PM|am|pm)\b")


def time_ta(text: Optional[str]) -> str:
    """'12:32:00 AM' -> 'இரவு 12:32:00', '06:04:58 PM' -> 'மாலை 06:04:58'.
    Works inside a longer string ('07:02:00 PM (பிம்ப மத்தி)'); a plain
    24-hour 'HH:MM[:SS]' is converted too."""
    s = "" if text is None else str(text)

    def sub(m: re.Match) -> str:
        h, sep, mi, se, ap = int(m.group(1)), m.group(2), m.group(3), m.group(4), m.group(5).upper()
        h24 = (h % 12) + (12 if ap == "PM" else 0)
        clock = f"{(h % 12) or 12:02d}{sep}{mi}" + (f"{sep}{se}" if se else "")
        return f"{_day_part(h24)} {clock}"
    out = _AMPM.sub(sub, s)
    if out == s:
        m = re.fullmatch(r"\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*", s)
        if m:
            h = int(m.group(1))
            out = f"{_day_part(h)} {(h % 12) or 12:02d}:{m.group(2)}" + (f":{m.group(3)}" if m.group(3) else "")
    return out


AYANAMSA_TA = {
    "Lahiri (Chitrapaksha)": "லஹரி (சித்ரபக்ஷம்)",
    "Lahiri": "லஹரி",
    "K.P New Comb": "கே.பி புதிய முறை",
    "KP-Old": "கே.பி பழைய முறை",
    "Krishnamurti": "கிருஷ்ணமூர்த்தி",
    "Surya Siddhanta": "சூரிய சித்தாந்தம்",
    "Vakkiyam": "வாக்கியம்",
}


def ayanamsa_ta(name: Optional[str]) -> str:
    s = "" if name is None else str(name)
    for en, ta in sorted(AYANAMSA_TA.items(), key=lambda kv: -len(kv[0])):
        s = s.replace(en, ta)
    return s


def dms_dir_ta(text: Optional[str]) -> str:
    """'10:34 N' -> '10:34 வடக்கு', '077:15 E' -> '077:15 கிழக்கு'."""
    s = "" if text is None else str(text)
    return re.sub(r"\s([NSEW])\b", lambda m: " " + {"N": "வடக்கு", "S": "தெற்கு", "E": "கிழக்கு", "W": "மேற்கு"}[m.group(1)], s)


def _offset(hours: float) -> str:
    sign = "+" if hours >= 0 else "-"
    a = abs(hours)
    return f"{sign}{int(a):02d}:{int(round((a % 1) * 60)):02d}"


INDIA = ("Asia/Kolkata", "Asia/Calcutta")


def tz_ta(tz: Optional[str], hours: Optional[float] = None) -> str:
    """Time-zone line in Tamil: 'Asia/Kolkata' -> 'இந்திய திட்ட நேரம் (+05:30)'."""
    t = "" if tz is None else str(tz)
    if t in INDIA or (hours == 5.5 and not t):
        return f"இந்திய திட்ட நேரம் ({_offset(5.5)})"
    if t.upper().startswith("UTC"):
        return "கிரீன்விச் நேரம் " + (t[3:] or "+00:00")
    if hours is not None:
        return f"{t} ({_offset(hours)})"
    return t


def tz_hours_of(tz: Optional[str], date_iso: str) -> Optional[float]:
    try:
        from datetime import datetime
        from zoneinfo import ZoneInfo
        t = str(tz or "")
        if t.upper().startswith("UTC"):
            s = t[3:]
            sign = -1 if s.startswith("-") else 1
            h, m = (s.lstrip("+-").split(":") + ["0"])[:2]
            return sign * (int(h or 0) + int(m or 0) / 60)
        off = datetime.fromisoformat(date_iso[:10] + "T12:00:00").replace(tzinfo=ZoneInfo(t)).utcoffset()
        return off.total_seconds() / 3600 if off is not None else None
    except Exception:
        return None


TIME_CORRECTION_TA = "திட்ட நேரம் (திருத்தம் இல்லை)"

# Initials on Tamil pages are written with the letter's Tamil SOUND, the same
# reading as the website's Thanglish rules (c = ச): "C.M." -> "ச.ம.", "R.K." -> "ர.க.".
# Keep in sync with frontend/lib/tamilTransliterate.ts LETTER_NAMES.
LETTER_TA = {"A": "அ", "B": "ப", "C": "ச", "D": "த", "E": "எ", "F": "ஃப", "G": "க", "H": "ஹ", "I": "இ",
             "J": "ஜ", "K": "க", "L": "ல", "M": "ம", "N": "ந", "O": "ஒ", "P": "ப", "Q": "க", "R": "ர",
             "S": "ச", "T": "த", "U": "உ", "V": "வ", "W": "வ", "X": "க்ஸ", "Y": "ய", "Z": "ஜ"}


def initial_ta(letter: str) -> str:
    return LETTER_TA.get(str(letter).strip().upper(), str(letter))


def initials_prefix_ta(name: str) -> str:
    """'C.M.சக்கரேஷ்' -> 'ச.ம.சக்கரேஷ்' (Latin initials before a Tamil name)."""
    m = re.match(r"^((?:[A-Za-z]\.)+)(.*)$", str(name or ""))
    if not m:
        return str(name or "")
    return "".join(initial_ta(c) + "." for c in m.group(1) if c.isalpha()) + m.group(2)


def value_ta(text: Optional[str]) -> str:
    """Generic pass for a detail value on a Tamil page: times, ayanamsa names,
    'Standard Time', N/E/S/W after degree values."""
    s = time_ta(text)
    s = ayanamsa_ta(s)
    s = s.replace("Standard Time (No Correction)", TIME_CORRECTION_TA).replace("Standard Time", "திட்ட நேரம்")
    s = s.replace("Indian Standard Time", "இந்திய திட்ட நேரம்")
    if re.search(r"\d\s[NSEW]\b", s):
        s = dms_dir_ta(s)
    return s


# --- place names --------------------------------------------------------------
_STATE_TA = {"tamil nadu": "தமிழ்நாடு", "kerala": "கேரளா", "karnataka": "கர்நாடகா", "andhra pradesh": "ஆந்திரப் பிரதேசம்",
             "telangana": "தெலுங்கானா", "puducherry": "புதுச்சேரி", "pondicherry": "புதுச்சேரி", "maharashtra": "மகாராஷ்டிரா",
             "delhi": "டெல்லி"}
_COUNTRY_TA = {"india": "இந்தியா", "sri lanka": "இலங்கை", "singapore": "சிங்கப்பூர்", "malaysia": "மலேசியா",
               "united states": "அமெரிக்கா", "usa": "அமெரிக்கா", "united kingdom": "இங்கிலாந்து", "uk": "இங்கிலாந்து",
               "canada": "கனடா", "australia": "ஆஸ்திரேலியா", "united arab emirates": "ஐக்கிய அரபு அமீரகம்",
               "uae": "ஐக்கிய அரபு அமீரகம்"}
_TAMIL = re.compile(r"[\u0B80-\u0BFF]")


def place_ta(place: Optional[str]) -> str:
    """Safety net for a place that reaches a Tamil PDF still in English
    ('Palakkad, Kerala, India' → 'பாலக்காடு, கேரளா, இந்தியா'). The website sends
    the Tamil name the place picker showed; this only covers other callers.
    Uses the curated names of geocode.KNOWN_LOCATIONS — never a letter-by-letter
    guess; an unknown town is left exactly as given."""
    s = "" if place is None else str(place).strip()
    if not s or _TAMIL.search(s) or not re.search(r"[A-Za-z]", s):
        return s
    from backend.app.services.geocode import KNOWN_LOCATIONS
    parts = [p.strip() for p in s.split(",") if p.strip()]
    hit = KNOWN_LOCATIONS.get(parts[0].lower()) if parts else None
    if not hit:
        return s
    town = re.sub(r"\s*\([^)]*\)", "", hit["name_ta"]).strip()
    state = next((_STATE_TA[p.lower()] for p in parts[1:] if p.lower() in _STATE_TA), None)
    country = _COUNTRY_TA.get(parts[-1].lower()) if len(parts) > 1 else None
    return ", ".join(x for x in (town, state, country) if x)
