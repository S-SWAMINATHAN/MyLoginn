"""
High-Precision Swiss Ephemeris calculation engine.
Strictly adheres to AGENTS.md §1 (Zero Hallucinations, Lahiri Ayanamsha, JPL-backed .se1 precision).
"""

import math
from datetime import datetime, time
import pytz
import swisseph as swe
from backend.app.core.config import settings
from backend.app.services.tamil_labels import (
    PLANET_LABELS, SIGN_LABELS, NAKSHATRA_LABELS,
    TITHI_NAMES, TITHI_NAMES_TA, VAARAM_NAMES,
    NITHYA_YOGAS, NITHYA_YOGAS_TA, KARANAS, KARANAS_TA
)

# Initialize Swiss Ephemeris Path
try:
    swe.set_ephe_path(settings.EPHE_PATH)
except Exception as e:
    print(f"Warning: Could not set ephemeris path: {e}")

# Planetary Constants in Swiss Ephemeris
SWE_PLANET_MAP = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,  # Mean lunar node (standard in Vedic)
}

def get_julian_day(date_str: str, time_str: str, timezone_str: str = "Asia/Kolkata") -> float:
    """
    Converts local date and time string to UTC Julian Day.
    """
    local_tz = pytz.timezone(timezone_str)
    # Parse date and time
    dt_naive = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
    dt_local = local_tz.localize(dt_naive)
    dt_utc = dt_local.astimezone(pytz.utc)

    # Julian day for UTC
    hour_decimal = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0 + dt_utc.microsecond / 3600000000.0
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour_decimal)
    return jd

def compute_planetary_positions(jd: float, lat: float, lon: float, panchangam_system: str = "thirukkanitham"):
    """
    Computes accurate sidereal planetary positions, Lagna, Nakshatras, and Panchangam elements.
    Uses Lahiri (Chitrapaksha) Ayanamsha (swe.SIDM_LAHIRI).
    """
    # Set Sidereal Mode to Lahiri
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)

    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED | swe.FLG_SWIEPH

    planets_data = []
    positions_by_name = {}

    # Calculate Ascendant (Lagna)
    # swe.houses_ex returns (cusps, ascmc) where ascmc[0] is Ascendant
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)  # Placidus or Equal
    lagna_deg = ascmc[0] % 360.0

    lagna_sign_num = int(lagna_deg // 30) + 1
    lagna_deg_in_sign = lagna_deg % 30.0
    lagna_nak_num = int(lagna_deg // (360.0 / 27)) + 1
    lagna_nak_deg = lagna_deg % (360.0 / 27)
    lagna_pada = int(lagna_nak_deg // (360.0 / 108)) + 1

    lagna_sign_info = SIGN_LABELS.get(lagna_sign_num, {})
    lagna_nak_info = NAKSHATRA_LABELS[lagna_nak_num - 1]

    positions_by_name["Lagna"] = {
        "name": "Lagna",
        "name_ta": "லக்னம்",
        "name_sa": "Lagna",
        "symbol": "La",
        "rasi_number": lagna_sign_num,
        "rasi": lagna_sign_info.get("sa", ""),
        "rasi_ta": lagna_sign_info.get("ta", ""),
        "degree": round(lagna_deg_in_sign, 4),
        "total_degree": round(lagna_deg, 4),
        "house": 1,
        "nakshatra": lagna_nak_info["sa"],
        "nakshatra_ta": lagna_nak_info["ta"],
        "nakshatra_number": lagna_nak_num,
        "pada": lagna_pada,
        "is_retrograde": False,
        "speed": 0.0,
        "status": "Ascendant"
    }

    # Calculate 7 main planets + Rahu
    for name, swe_id in SWE_PLANET_MAP.items():
        res, flag = swe.calc_ut(jd, swe_id, flags)
        lon_deg = res[0] % 360.0
        speed = res[3]
        is_retro = speed < 0

        sign_num = int(lon_deg // 30) + 1
        deg_in_sign = lon_deg % 30.0
        nak_num = int(lon_deg // (360.0 / 27)) + 1
        nak_deg = lon_deg % (360.0 / 27)
        pada = int(nak_deg // (360.0 / 108)) + 1

        sign_info = SIGN_LABELS.get(sign_num, {})
        nak_info = NAKSHATRA_LABELS[nak_num - 1]
        p_label = PLANET_LABELS.get(name, {})

        # House from Lagna (1 to 12)
        house = ((sign_num - lagna_sign_num) % 12) + 1

        # Dignity status (Exalted, Debilitated, Own sign)
        status = "Direct"
        if is_retro:
            status = "Retrograde"
        if name == "Sun":
            if sign_num == 1: status = "Exalted"
            elif sign_num == 7: status = "Debilitated"
            elif sign_num == 5: status = "Own House"
        elif name == "Moon":
            if sign_num == 2: status = "Exalted"
            elif sign_num == 8: status = "Debilitated"
            elif sign_num == 4: status = "Own House"
        elif name == "Mars":
            if sign_num == 10: status = "Exalted"
            elif sign_num == 4: status = "Debilitated"
            elif sign_num in (1, 8): status = "Own House"
        elif name == "Mercury":
            if sign_num == 6: status = "Exalted / Own House"
            elif sign_num == 12: status = "Debilitated"
            elif sign_num == 3: status = "Own House"
        elif name == "Jupiter":
            if sign_num == 4: status = "Exalted"
            elif sign_num == 10: status = "Debilitated"
            elif sign_num in (9, 12): status = "Own House"
        elif name == "Venus":
            if sign_num == 12: status = "Exalted"
            elif sign_num == 6: status = "Debilitated"
            elif sign_num in (2, 7): status = "Own House"
        elif name == "Saturn":
            if sign_num == 7: status = "Exalted"
            elif sign_num == 1: status = "Debilitated"
            elif sign_num in (10, 11): status = "Own House"

        planet_obj = {
            "name": name,
            "name_ta": p_label.get("ta", name),
            "name_sa": p_label.get("sa", name),
            "symbol": p_label.get("ta_short", name[:2]),
            "rasi_number": sign_num,
            "rasi": sign_info.get("sa", ""),
            "rasi_ta": sign_info.get("ta", ""),
            "degree": round(deg_in_sign, 4),
            "total_degree": round(lon_deg, 4),
            "house": house,
            "nakshatra": nak_info["sa"],
            "nakshatra_ta": nak_info["ta"],
            "nakshatra_number": nak_num,
            "pada": pada,
            "is_retrograde": is_retro,
            "speed": round(speed, 6),
            "status": status
        }
        planets_data.append(planet_obj)
        positions_by_name[name] = planet_obj

    # Calculate Ketu (180 degrees opposite to Rahu)
    rahu_obj = positions_by_name["Rahu"]
    ketu_deg = (rahu_obj["total_degree"] + 180.0) % 360.0
    ketu_sign_num = int(ketu_deg // 30) + 1
    ketu_deg_in_sign = ketu_deg % 30.0
    ketu_nak_num = int(ketu_deg // (360.0 / 27)) + 1
    ketu_nak_deg = ketu_deg % (360.0 / 27)
    ketu_pada = int(ketu_nak_deg // (360.0 / 108)) + 1
    ketu_sign_info = SIGN_LABELS.get(ketu_sign_num, {})
    ketu_nak_info = NAKSHATRA_LABELS[ketu_nak_num - 1]
    ketu_house = ((ketu_sign_num - lagna_sign_num) % 12) + 1
    ketu_p_label = PLANET_LABELS.get("Ketu", {})

    ketu_obj = {
        "name": "Ketu",
        "name_ta": ketu_p_label.get("ta", "கேது"),
        "name_sa": ketu_p_label.get("sa", "Ketu"),
        "symbol": ketu_p_label.get("ta_short", "கே"),
        "rasi_number": ketu_sign_num,
        "rasi": ketu_sign_info.get("sa", ""),
        "rasi_ta": ketu_sign_info.get("ta", ""),
        "degree": round(ketu_deg_in_sign, 4),
        "total_degree": round(ketu_deg, 4),
        "house": ketu_house,
        "nakshatra": ketu_nak_info["sa"],
        "nakshatra_ta": ketu_nak_info["ta"],
        "nakshatra_number": ketu_nak_num,
        "pada": ketu_pada,
        "is_retrograde": True,
        "speed": rahu_obj["speed"],
        "status": "Retrograde"
    }
    planets_data.append(ketu_obj)
    positions_by_name["Ketu"] = ketu_obj

    # Panchangam calculations: Thithi, Vaaram, Yogam, Karanam
    sun_lon = positions_by_name["Sun"]["total_degree"]
    moon_lon = positions_by_name["Moon"]["total_degree"]

    # Difference in longitude (Moon - Sun)
    diff = (moon_lon - sun_lon) % 360.0
    tithi_index = int(diff // 12.0)  # 0 to 29
    tithi_name = TITHI_NAMES[tithi_index]
    tithi_name_ta = TITHI_NAMES_TA[tithi_index]
    paksha = "Shukla Paksha (வளர்பிறை)" if tithi_index < 15 else "Krishna Paksha (தேய்பிறை)"

    # Vaaram (Day of week from Julian Day)
    # JD 0.5 was Monday
    day_num = int(math.floor(jd + 1.5)) % 7
    vaaram_info = VAARAM_NAMES.get(day_num, VAARAM_NAMES[0])

    # Nithya Yoga: (Sun + Moon) % 360 / (360/27)
    sum_lon = (sun_lon + moon_lon) % 360.0
    yoga_index = int(sum_lon // (360.0 / 27))
    yoga_name = NITHYA_YOGAS[yoga_index % 27]
    yoga_name_ta = NITHYA_YOGAS_TA[yoga_index % 27]

    # Karana: half of tithi (6 degrees)
    karana_idx = int(diff // 6.0)
    if karana_idx == 0:
        k_name, k_name_ta = KARANAS[10], KARANAS_TA[10]  # Kinstughna
    elif karana_idx >= 57:
        fixed_idx = karana_idx - 57
        k_name, k_name_ta = KARANAS[7 + fixed_idx], KARANAS_TA[7 + fixed_idx]
    else:
        movable_idx = (karana_idx - 1) % 7
        k_name, k_name_ta = KARANAS[movable_idx], KARANAS_TA[movable_idx]

    moon_nak = positions_by_name["Moon"]["nakshatra"]
    moon_nak_ta = positions_by_name["Moon"]["nakshatra_ta"]
    moon_pada = positions_by_name["Moon"]["pada"]
    moon_rasi = positions_by_name["Moon"]["rasi"]
    moon_rasi_ta = positions_by_name["Moon"]["rasi_ta"]

    # Basic Details
    basic_details = {
        "lagnam": positions_by_name["Lagna"]["rasi"],
        "lagnam_ta": positions_by_name["Lagna"]["rasi_ta"],
        "lagnam_degree": positions_by_name["Lagna"]["degree"],
        "rasi": moon_rasi,
        "rasi_ta": moon_rasi_ta,
        "nakshatram": moon_nak,
        "nakshatram_ta": moon_nak_ta,
        "pada": moon_pada,
        "thithi": f"{paksha.split(' ')[0]} {tithi_name}",
        "thithi_ta": f"{paksha.split(' ')[1][1:-1]} {tithi_name_ta}",
        "paksha": paksha,
        "vaaram": vaaram_info["sa"],
        "vaaram_ta": vaaram_info["ta"],
        "yogam": yoga_name,
        "yogam_ta": yoga_name_ta,
        "karanam": k_name,
        "karanam_ta": k_name_ta,
        "ayanamsa_name": "Lahiri (Chitrapaksha)",
        "ayanamsa_value": round(ayanamsa, 4),
        "panchangam_system": panchangam_system
    }

    return {
        "basic_details": basic_details,
        "planets": planets_data,
        "positions_by_name": positions_by_name,
        "ayanamsa": ayanamsa,
        "lagna_info": positions_by_name["Lagna"]
    }
