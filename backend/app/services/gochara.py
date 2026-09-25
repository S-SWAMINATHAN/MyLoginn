"""
Gochara (Transit Analysis) Engine.
Computes current planetary transits relative to natal Moon sign,
applies Vedha (obstruction) cancellation rules, and scores transits
using the natal Ashtakavarga bindu matrix.

Strictly adheres to AGENTS.md §1 — every position from Swiss Ephemeris,
every Vedha rule from classical texts.

Classical Sources:
  - BPHS Ch. 65 (Gochara Phala Adhyaya)
  - Phaladeepika Ch. 26 (Transit Effects)
  - Uttara Kalamrita (Vedha rules & exceptions)
"""

import math
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
import pytz
import swisseph as swe
from backend.app.core.config import settings
from backend.app.services.tamil_labels import PLANET_LABELS, SIGN_LABELS
from backend.app.services.ephemeris import get_julian_day, format_dms

# Initialize Swiss Ephemeris Path
try:
    swe.set_ephe_path(settings.EPHE_PATH)
except Exception:
    pass


# ──────────────────────────────────────────────────────────
# Classical Gochara Transit Effects Table
# Source: BPHS Ch. 65 / Phaladeepika Ch. 26
# Key: house from natal Moon (1-12)
# Value: (effect_en, effect_ta, is_benefic)
# ──────────────────────────────────────────────────────────

GOCHARA_EFFECTS = {
    1: ("Expenditure, health concerns, travel fatigue", "செலவு, உடல் சோர்வு, பயணக் களைப்பு", False),
    2: ("Wealth loss, family discord, speech issues", "பண இழப்பு, குடும்ப பிரச்சனை, வாக்கு கோளாறு", False),
    3: ("Success, gains, victory, auspicious events", "வெற்றி, சுப நிகழ்வுகள், தன லாபம்", True),
    4: ("Mental unrest, domestic trouble, vehicle issues", "மன அமைதியின்மை, வீட்டில் பிரச்சனை", False),
    5: ("Obstacles to progeny/education, mental strain", "புத்திர தடை, கல்வி தடங்கல், மனக் கவலை", False),
    6: ("Victory over enemies, health recovery, success", "எதிரிகளை வெல்லுதல், சுகம், வெற்றி", True),
    7: ("Travel, marital harmony (varies by planet)", "பயணம், தாம்பத்ய நலன் (கிரக அடிப்படையில் மாறும்)", False),
    8: ("Sudden troubles, accidents, legal issues", "திடீர் தொல்லை, விபத்து, வழக்கு", False),
    9: ("Obstacles to fortune, father's health, disputes", "பாக்கிய தடை, தந்தை நலம், பிரச்சனை", False),
    10: ("Career advancement, authority, recognition", "தொழில் முன்னேற்றம், அதிகாரம், அங்கீகாரம்", True),
    11: ("Income, gains, wish fulfillment, celebrations", "வருமான உயர்வு, ஆதாயம், ஆசைகள் நிறைவேறும்", True),
    12: ("Loss, expenditure, foreign travel, spiritual growth", "இழப்பு, செலவு, வெளிநாடு, ஆன்மீக வளர்ச்சி", False),
}


# ──────────────────────────────────────────────────────────
# Vedha (Obstruction) Rules
# Source: Uttara Kalamrita / Phaladeepika Ch. 26
# Key: benefic transit house -> Vedha obstruction house
# If another transiting planet occupies the Vedha house,
# the benefic effect of the transit is cancelled.
# ──────────────────────────────────────────────────────────

VEDHA_PAIRS = {
    # Benefic House -> Vedha Obstruction House
    1: 5,
    2: 12,
    3: 9,
    4: 10,
    5: 1,
    6: 12,
    7: 3,
    8: 2,
    9: 3,
    10: 4,
    11: 5,
    12: 6
}

# Exception: Sun-Saturn pair are exempt from mutual Vedha.
# Source: Uttara Kalamrita.
VEDHA_EXCEPTIONS = [("Sun", "Saturn"), ("Saturn", "Sun")]


# ──────────────────────────────────────────────────────────
# Planet Constants
# ──────────────────────────────────────────────────────────

SWE_PLANET_MAP = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,
}


# ──────────────────────────────────────────────────────────
# CORE FUNCTIONS
# ──────────────────────────────────────────────────────────

def compute_current_transits(
    date_str: str = "",
    time_str: str = "12:00:00",
    timezone_str: str = "Asia/Kolkata"
) -> Dict[str, Dict[str, Any]]:
    """
    Computes current (or specified date) sidereal planetary positions
    for transit analysis using Swiss Ephemeris DE431/441.

    If date_str is empty, uses current date/time.
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    if not date_str:
        local_tz = pytz.timezone(timezone_str)
        now = datetime.now(local_tz)
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")

    jd = get_julian_day(date_str, time_str, timezone_str)
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED | swe.FLG_SWIEPH

    transit_planets = {}

    for name, swe_id in SWE_PLANET_MAP.items():
        res, flag = swe.calc_ut(jd, swe_id, flags)
        lon_deg = res[0] % 360.0
        speed = res[3]
        is_retro = speed < 0

        sign_num = int(lon_deg // 30) + 1
        deg_in_sign = lon_deg % 30.0
        nak_num = int(lon_deg // (360.0 / 27)) + 1

        sign_info = SIGN_LABELS.get(sign_num, {})
        p_label = PLANET_LABELS.get(name, {})

        transit_planets[name] = {
            "name": name,
            "name_ta": p_label.get("ta", name),
            "rasi_number": sign_num,
            "rasi": sign_info.get("sa", ""),
            "rasi_ta": sign_info.get("ta", ""),
            "degree": round(deg_in_sign, 4),
            "degree_dms": format_dms(deg_in_sign),
            "total_degree": round(lon_deg, 4),
            "is_retrograde": is_retro,
            "speed": round(speed, 6),
            "nakshatra_number": nak_num
        }

    # Ketu = 180° from Rahu
    rahu = transit_planets["Rahu"]
    ketu_deg = (rahu["total_degree"] + 180.0) % 360.0
    ketu_sign = int(ketu_deg // 30) + 1
    ketu_sign_info = SIGN_LABELS.get(ketu_sign, {})
    ketu_label = PLANET_LABELS.get("Ketu", {})

    transit_planets["Ketu"] = {
        "name": "Ketu",
        "name_ta": ketu_label.get("ta", "கேது"),
        "rasi_number": ketu_sign,
        "rasi": ketu_sign_info.get("sa", ""),
        "rasi_ta": ketu_sign_info.get("ta", ""),
        "degree": round(ketu_deg % 30.0, 4),
        "degree_dms": format_dms(ketu_deg % 30.0),
        "total_degree": round(ketu_deg, 4),
        "is_retrograde": True,
        "speed": rahu["speed"],
        "nakshatra_number": int(ketu_deg // (360.0 / 27)) + 1
    }

    return transit_planets


def analyze_gochara(
    natal_moon_sign: int,
    natal_bav: Optional[Dict[str, List[int]]],
    transit_planets: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Analyses Gochara (transit) effects for each transiting planet relative to natal Moon sign.
    Applies Vedha cancellation rules and Ashtakavarga transit scoring.

    Parameters:
    -----------
    natal_moon_sign : int (1-12), the natal Moon Rasi number
    natal_bav : dict of Bhinnashtakavarga from the natal chart (planet -> [12 scores])
    transit_planets : dict from compute_current_transits()

    Returns:
    --------
    List of transit analysis results per planet.
    """
    # Build a quick lookup: which houses from natal Moon are occupied by transiting planets
    occupied_houses: Dict[int, List[str]] = {i: [] for i in range(1, 13)}
    for p_name, p_data in transit_planets.items():
        if p_name in ("Lagna", "Mandi"):
            continue
        house_from_moon = ((p_data["rasi_number"] - natal_moon_sign) % 12) + 1
        occupied_houses[house_from_moon].append(p_name)

    results = []
    seven_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

    for planet_name in seven_planets:
        p_data = transit_planets.get(planet_name)
        if not p_data:
            continue

        transit_sign = p_data["rasi_number"]
        house_from_moon = ((transit_sign - natal_moon_sign) % 12) + 1

        # Get classical effect
        effect_en, effect_ta, is_benefic = GOCHARA_EFFECTS.get(
            house_from_moon, ("Neutral effect", "நடுநிலை பலன்", False)
        )

        # Check Vedha cancellation
        vedha_house = VEDHA_PAIRS.get(house_from_moon)
        vedha_active = False
        vedha_by = ""

        if vedha_house:
            for vedha_planet in occupied_houses.get(vedha_house, []):
                if vedha_planet == planet_name:
                    continue
                # Check Sun-Saturn exception
                pair = (planet_name, vedha_planet)
                if pair in VEDHA_EXCEPTIONS:
                    continue
                vedha_active = True
                vedha_by = vedha_planet
                break

        # Ashtakavarga transit score
        bav_score = None
        bav_quality = ""
        bav_quality_ta = ""
        if natal_bav and planet_name in natal_bav:
            # BAV index: sign_number - 1 (0-indexed)
            bav_idx = transit_sign - 1
            bav_score = natal_bav[planet_name][bav_idx]
            if bav_score >= 5:
                bav_quality = "Highly Beneficial"
                bav_quality_ta = "மிக நற்பலன்"
            elif bav_score >= 4:
                bav_quality = "Beneficial"
                bav_quality_ta = "நற்பலன்"
            elif bav_score >= 3:
                bav_quality = "Moderate"
                bav_quality_ta = "சராசரி"
            else:
                bav_quality = "Challenging"
                bav_quality_ta = "சவால் நிறைந்த காலம்"

        # Net effect determination
        if vedha_active:
            net_effect = "Vedha Cancelled"
            net_effect_ta = "வேதை பாதிப்பால் பலன் குறைவு"
            net_benefic = False
        elif bav_score is not None and bav_score >= 4 and not is_benefic:
            # Strong BAV can uplift a classically negative transit
            net_effect = "Mitigated by Ashtakavarga"
            net_effect_ta = "அஷ்டகவர்க்க நற்புள்ளிகளால் தீமை குறைவு"
            net_benefic = False
        else:
            net_effect = "Benefic" if is_benefic else "Challenging"
            net_effect_ta = "சுபம்" if is_benefic else "சவாலானது"
            net_benefic = is_benefic

        p_label = PLANET_LABELS.get(planet_name, {})
        sign_info = SIGN_LABELS.get(transit_sign, {})

        results.append({
            "planet": planet_name,
            "planet_ta": p_label.get("ta", planet_name),
            "transit_sign": transit_sign,
            "transit_rasi": sign_info.get("sa", ""),
            "transit_rasi_en": sign_info.get("en", ""),
            "transit_rasi_ta": sign_info.get("ta", ""),
            "house_from_moon": house_from_moon,
            "degree": p_data["degree"],
            "degree_dms": p_data["degree_dms"],
            "is_retrograde": p_data["is_retrograde"],
            "classical_effect": effect_en,
            "classical_effect_ta": effect_ta,
            "is_classically_benefic": is_benefic,
            "vedha_active": vedha_active,
            "vedha_by": vedha_by,
            "vedha_by_ta": PLANET_LABELS.get(vedha_by, {}).get("ta", vedha_by) if vedha_by else "",
            "bav_score": bav_score,
            "bav_quality": bav_quality,
            "bav_quality_ta": bav_quality_ta,
            "net_effect": net_effect,
            "net_effect_ta": net_effect_ta,
            "net_benefic": net_benefic
        })

    return results


def get_gochara_summary(gochara_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Produces a high-level summary of the Gochara analysis.
    """
    benefic_count = sum(1 for r in gochara_results if r["net_benefic"])
    challenging_count = sum(1 for r in gochara_results if not r["net_benefic"])
    vedha_count = sum(1 for r in gochara_results if r["vedha_active"])

    # Highlight the most impactful transits
    key_transits = []
    slow_planets = ["Saturn", "Jupiter", "Rahu", "Ketu"]
    for r in gochara_results:
        if r["planet"] in slow_planets:
            key_transits.append({
                "planet": r["planet"],
                "planet_ta": r["planet_ta"],
                "transit_rasi_ta": r["transit_rasi_ta"],
                # Carried through so the English UI and narration can show
                # "Gemini" instead of the Sanskrit or the Tamil name.
                "transit_rasi": r.get("transit_rasi", ""),
                "transit_rasi_en": r.get("transit_rasi_en", ""),
                "house_from_moon": r["house_from_moon"],
                "net_effect": r["net_effect"],
                "net_effect_ta": r["net_effect_ta"]
            })

    if benefic_count > challenging_count:
        overall = "Favorable Period"
        overall_ta = "சாதகமான காலகட்டம்"
    elif benefic_count == challenging_count:
        overall = "Mixed Period"
        overall_ta = "கலவையான காலகட்டம்"
    else:
        overall = "Challenging Period"
        overall_ta = "சவாலான காலகட்டம்"

    return {
        "overall_assessment": overall,
        "overall_assessment_ta": overall_ta,
        "benefic_transits": benefic_count,
        "challenging_transits": challenging_count,
        "vedha_cancellations": vedha_count,
        "key_slow_planet_transits": key_transits,
        "classical_source": "BPHS Ch. 65 (Gochara Phala), Phaladeepika Ch. 26, Uttara Kalamrita"
    }
