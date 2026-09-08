"""
High-Precision Swiss Ephemeris calculation engine.
Strictly adheres to AGENTS.md §1 (Zero Hallucinations, Lahiri Ayanamsha, JPL-backed .se1 precision).
"""

import math
from datetime import datetime
from typing import Dict, List, Any, Tuple
import pytz
import swisseph as swe
from backend.app.core.config import settings
from backend.app.services.tamil_labels import (
    PLANET_LABELS, SIGN_LABELS, NAKSHATRA_LABELS,
    TITHI_NAMES, TITHI_NAMES_TA, VAARAM_NAMES,
    NITHYA_YOGAS, NITHYA_YOGAS_TA, KARANAS, KARANAS_TA,
    TAMIL_DINA_YOGAS
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

def format_dms(deg_float: float) -> str:
    """Formats decimal degrees into DD° MM' SS\" string."""
    deg_val = deg_float % 360.0
    d = int(deg_val)
    m_float = (deg_val - d) * 60.0
    m = int(m_float)
    s = int(round((m_float - m) * 60.0))
    if s >= 60:
        s = 0
        m += 1
    if m >= 60:
        m = 0
        d += 1
    return f"{d:02d}° {m:02d}' {s:02d}\""

def compute_navamsa_sign_num(total_degree: float) -> int:
    """Computes Navamsa (D9) sign (1 to 12) for a given sidereal longitude."""
    navamsa_idx = int((total_degree % 360.0) // (360.0 / 108))  # 0 to 107
    return (navamsa_idx % 12) + 1

def compute_tamil_dina_yoga(day_num: int, nak_num: int) -> Tuple[str, str, str, str, str]:
    """
    Computes canonical Tamil Panchangam Subha Yoga (Amrita, Siddha, Marana, Prabalarishta)
    based on Vaaram (Day of Week) and Janma Nakshatra.
    """
    yoga_map = TAMIL_DINA_YOGAS.get(day_num, {})
    if nak_num in yoga_map:
        y_en, y_ta = yoga_map[nak_num]
    else:
        y_en, y_ta = "Siddha Yoga", "சித்த யோகம்"

    if y_en == "Amrita Yoga":
        desc_en = "Highly auspicious for all sacred, prosperous, and positive endeavors."
        desc_ta = "மிகவும் சுபகரமானது, சகல காரியங்களுக்கும் உன்னதமான சுப யோகம்."
        status = "Auspicious"
    elif y_en == "Siddha Yoga":
        desc_en = "Auspicious and fruitful for work, education, and lasting accomplishments."
        desc_ta = "சுப பலன்களைத் தரும், காரிய சித்தி அளிக்கும் நற்பலன் யோகம்."
        status = "Auspicious"
    elif y_en == "Marana Yoga":
        desc_en = "Inauspicious; classical tradition advises caution and avoiding initiation of new ventures."
        desc_ta = "அசுப யோகம்; புதிய சுப காரியங்கள் துவங்குவதை தவிர்ப்பது மரபு."
        status = "Inauspicious"
    else:
        desc_en = "Prabalarishta Yoga; requires protective prayers and remedies."
        desc_ta = "பிரபாலாரிஷ்ட யோகம்; இறை வழிபாட்டுடன் தொடங்குவது நன்று."
        status = "Neutral"

    return y_en, y_ta, desc_en, desc_ta, status

def compute_planet_dignity(name: str, sign_num: int, is_retro: bool) -> Tuple[str, str]:
    """
    Computes exact classical dignity status according to Brihat Parashara Hora Shastra (BPHS):
    Exalted (உச்சம்), Debilitated (நீசம்), Own House (ஆட்சி), Friendly (நட்பு), Neutral (சமம்), Enemy House (பகை).
    """
    if name in ("Rahu", "Ketu"):
        return ("Retrograde", "வக்ரம்")

    # 1. Exalted / Debilitated
    exalt_debil = {
        "Sun": (1, 7, "Exalted", "உச்சம்", "Debilitated", "நீசம்"),
        "Moon": (2, 8, "Exalted", "உச்சம்", "Debilitated", "நீசம்"),
        "Mars": (10, 4, "Exalted", "உச்சம்", "Debilitated", "நீசம்"),
        "Mercury": (6, 12, "Exalted / Own House", "உச்சம் / ஆட்சி", "Debilitated", "நீசம்"),
        "Jupiter": (4, 10, "Exalted", "உச்சம்", "Debilitated", "நீசம்"),
        "Venus": (12, 6, "Exalted", "உச்சம்", "Debilitated", "நீசம்"),
        "Saturn": (7, 1, "Exalted", "உச்சம்", "Debilitated", "நீசம்")
    }
    if name in exalt_debil:
        e_sign, d_sign, e_en, e_ta, d_en, d_ta = exalt_debil[name]
        if sign_num == e_sign:
            return (f"{e_en} (Retrograde)" if is_retro else e_en, f"{e_ta} (வக்ரம்)" if is_retro else e_ta)
        if sign_num == d_sign:
            return (f"{d_en} (Retrograde)" if is_retro else d_en, f"{d_ta} (வக்ரம்)" if is_retro else d_ta)

    # 2. Own House
    own_signs = {
        "Sun": [5],
        "Moon": [4],
        "Mars": [1, 8],
        "Mercury": [3, 6],
        "Jupiter": [9, 12],
        "Venus": [2, 7],
        "Saturn": [10, 11]
    }
    if sign_num in own_signs.get(name, []):
        return ("Own House (Retrograde)" if is_retro else "Own House", "ஆட்சி (வக்ரம்)" if is_retro else "ஆட்சி")

    # 3. Permanent Relationships (Naisargika Sambandha)
    sign_lords = {
        1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
        5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
        9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
    }
    host_lord = sign_lords.get(sign_num, "")

    friends_map = {
        "Sun": ["Moon", "Mars", "Jupiter"],
        "Moon": ["Sun", "Mercury"],
        "Mars": ["Sun", "Moon", "Jupiter"],
        "Mercury": ["Sun", "Venus"],
        "Jupiter": ["Sun", "Moon", "Mars"],
        "Venus": ["Mercury", "Saturn"],
        "Saturn": ["Mercury", "Venus"]
    }
    enemies_map = {
        "Sun": ["Venus", "Saturn"],
        "Moon": [],
        "Mars": ["Mercury"],
        "Mercury": ["Moon"],
        "Jupiter": ["Mercury", "Venus"],
        "Venus": ["Sun", "Moon"],
        "Saturn": ["Sun", "Moon", "Mars"]
    }

    if host_lord in friends_map.get(name, []):
        rel_en, rel_ta = "Friendly", "நட்பு"
    elif host_lord in enemies_map.get(name, []):
        rel_en, rel_ta = "Enemy House", "பகை"
    else:
        rel_en, rel_ta = "Neutral", "சமம்"

    if is_retro:
        return (f"Retrograde ({rel_en})", f"வக்ரம் ({rel_ta})")
    return (rel_en, rel_ta)

def compute_astronomical_timings(
    jd: float,
    lat: float,
    lon: float,
    date_str: str,
    time_str: str,
    timezone_str: str = "Asia/Kolkata"
) -> Dict[str, Any]:
    """
    Calculates precise Sunrise, Sunset, Dinamani (Day duration), Ratri Mana (Night duration),
    Udhayadhi Nazhigai at birth, Rahu Kalam, Yamagandam, and Kuligai Kalam using Swiss Ephemeris DE431/441.
    """
    geopos = (lon, lat, 0.0)
    local_tz = pytz.timezone(timezone_str)

    # Local midnight converted to UTC Julian Day
    dt_local_midnight = local_tz.localize(datetime.strptime(f"{date_str} 00:00:00", "%Y-%m-%d %H:%M:%S"))
    dt_utc_midnight = dt_local_midnight.astimezone(pytz.utc)
    h_dec_utc = dt_utc_midnight.hour + dt_utc_midnight.minute / 60.0 + dt_utc_midnight.second / 3600.0
    jd_utc_start = swe.julday(dt_utc_midnight.year, dt_utc_midnight.month, dt_utc_midnight.day, h_dec_utc)

    # Calculate Sunrise and Sunset with Swiss Ephemeris
    try:
        ret_rise, tret_rise = swe.rise_trans(jd_utc_start, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos, 0.0, 0.0, swe.FLG_SWIEPH)
        ret_set, tret_set = swe.rise_trans(jd_utc_start, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, geopos, 0.0, 0.0, swe.FLG_SWIEPH)
        jd_rise = tret_rise[0]
        jd_set = tret_set[0]
    except Exception:
        # Fallback to standard 06:00 AM / 06:00 PM if extreme coordinate
        jd_rise = jd_utc_start + (0.5 / 24.0)
        jd_set = jd_utc_start + (12.5 / 24.0)

    def jd_to_local_data(jd_val: float) -> Tuple[str, float]:
        y, m, d, h_utc = swe.revjul(jd_val)
        sec_total = int(round(h_utc * 3600.0))
        sec = sec_total % 60
        mn_total = sec_total // 60
        mn = mn_total % 60
        hr = mn_total // 60
        if hr >= 24:
            hr = hr % 24
        dt_u = datetime(y, m, d, hr, mn, sec, tzinfo=pytz.utc)
        dt_loc = dt_u.astimezone(local_tz)
        dec_h = dt_loc.hour + dt_loc.minute / 60.0 + dt_loc.second / 3600.0
        return dt_loc.strftime("%I:%M:%S %p"), dec_h

    sunrise_str, sunrise_dec = jd_to_local_data(jd_rise)
    sunset_str, sunset_dec = jd_to_local_data(jd_set)

    # Day length (Dinamani) & Night length (Ratri Mana)
    day_hours = (sunset_dec - sunrise_dec) % 24.0
    if day_hours <= 0:
        day_hours += 24.0
    night_hours = 24.0 - day_hours

    d_h = int(day_hours)
    d_m = int(round((day_hours - d_h) * 60.0))
    if d_m >= 60:
        d_m = 0
        d_h += 1

    n_h = int(night_hours)
    n_m = int(round((night_hours - n_h) * 60.0))
    if n_m >= 60:
        n_m = 0
        n_h += 1

    dinamani_str = f"{d_h} மணி {d_m:02d} நிமிடம்"
    dinamani_en = f"{d_h}h {d_m:02d}m"
    ratrimana_str = f"{n_h} மணி {n_m:02d} நிமிடம்"
    ratrimana_en = f"{n_h}h {n_m:02d}m"

    # Birth Time Udhayadhi Nazhigai (உதயாதி நாழிகை)
    dt_birth = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
    birth_dec = dt_birth.hour + dt_birth.minute / 60.0 + dt_birth.second / 3600.0

    elapsed_from_sunrise = (birth_dec - sunrise_dec) % 24.0
    total_nazhigai = elapsed_from_sunrise * 2.5  # 1 hour = 2.5 Nazhigai
    nazhigai = int(total_nazhigai)
    vinazhigai = int(round((total_nazhigai - nazhigai) * 60.0))
    if vinazhigai >= 60:
        vinazhigai = 0
        nazhigai += 1

    nazhigai_str = f"{nazhigai} நாழிகை {vinazhigai:02d} விநாழிகை"
    nazhigai_en = f"{nazhigai} Nazhigai {vinazhigai:02d} Vinazhigai"

    # Day of week for Rahu Kalam / Yamagandam / Kuligai
    day_num = int(math.floor(jd + 1.5)) % 7
    one_eighth = day_hours / 8.0

    rahu_slots = {0: (7, 8), 1: (1, 2), 2: (6, 7), 3: (4, 5), 4: (5, 6), 5: (3, 4), 6: (2, 3)}
    yama_slots = {0: (4, 5), 1: (3, 4), 2: (2, 3), 3: (1, 2), 4: (0, 1), 5: (6, 7), 6: (5, 6)}
    guli_slots = {0: (6, 7), 1: (5, 6), 2: (4, 5), 3: (3, 4), 4: (2, 3), 5: (1, 2), 6: (0, 1)}

    def format_slot(s_start: int, s_end: int) -> str:
        t1 = (sunrise_dec + s_start * one_eighth) % 24.0
        t2 = (sunrise_dec + s_end * one_eighth) % 24.0
        def fmt(t: float) -> str:
            h = int(t)
            m = int((t - h) * 60.0)
            ampm = "AM" if h < 12 else "PM"
            h12 = h if (0 < h <= 12) else (h - 12 if h > 12 else 12)
            return f"{h12:02d}:{m:02d} {ampm}"
        return f"{fmt(t1)} – {fmt(t2)}"

    # --- NEW: raw UTC Julian Day of Kuligai Kalam's start ---
    # This is purely an additional return value for use by the Mandi/Gulika
    # longitude calculation in compute_planetary_positions(). It does not
    # change or recompute any of the existing timing strings above — it
    # reuses the same jd_rise + guli_slots[day_num] already established.
    guli_start_eighth, _guli_end_eighth = guli_slots[day_num]
    jd_kuligai_start = jd_rise + (guli_start_eighth * one_eighth) / 24.0

    return {
        "sun_rise": sunrise_str,
        "sun_set": sunset_str,
        "dinamani": dinamani_str,
        "dinamani_en": dinamani_en,
        "ratrimana": ratrimana_str,
        "ratrimana_en": ratrimana_en,
        "udhayadhi_nazhigai": nazhigai_str,
        "udhayadhi_nazhigai_en": nazhigai_en,
        "rahu_kalam": format_slot(*rahu_slots[day_num]),
        "yamagandam": format_slot(*yama_slots[day_num]),
        "kuligai": format_slot(*guli_slots[day_num]),
        "kuligai_start_jd": jd_kuligai_start,  # NEW
    }

def get_julian_day(date_str: str, time_str: str, timezone_str: str = "Asia/Kolkata") -> float:
    """Converts local date and time string to UTC Julian Day."""
    local_tz = pytz.timezone(timezone_str)
    dt_naive = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
    dt_local = local_tz.localize(dt_naive)
    dt_utc = dt_local.astimezone(pytz.utc)

    hour_decimal = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0 + dt_utc.microsecond / 3600000000.0
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour_decimal)
    return jd

def compute_planetary_positions(
    jd: float,
    lat: float,
    lon: float,
    panchangam_system: str = "thirukkanitham",
    date_str: str = "1996-08-15",
    time_str: str = "07:00:00",
    timezone_str: str = "Asia/Kolkata"
) -> Dict[str, Any]:
    """
    Computes sub-arcsecond sidereal planetary positions, Lagna, Nakshatras, Panchangam elements,
    Tamil Subha Yoga, and Astronomical timings.
    Uses Lahiri (Chitrapaksha) Ayanamsha (swe.SIDM_LAHIRI) backed by Swiss Ephemeris DE431/441 data files.
    """
    is_vakhyam = (panchangam_system.lower() == "vakhyam")
    if is_vakhyam:
        # Traditional Surya Siddhanta sidereal calculation used by Tamil Vakhyam Panchangams (Pambu Panchangam)
        # Citations: Surya Siddhanta, AGENTS.md §1.4, Swiss Ephemeris SIDM_SURYASIDDHANTA
        swe.set_sid_mode(swe.SIDM_SURYASIDDHANTA)
        ayanamsa_name = "Surya Siddhanta (வாக்கிய முறை)"
    else:
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        ayanamsa_name = "Lahiri (Chitrapaksha)"
    ayanamsa = swe.get_ayanamsa_ut(jd)

    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED | swe.FLG_SWIEPH

    planets_data = []
    positions_by_name = {}

    # Calculate Ascendant (Lagna)
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
    lagna_deg = ascmc[0] % 360.0

    lagna_sign_num = int(lagna_deg // 30) + 1
    lagna_deg_in_sign = lagna_deg % 30.0
    lagna_nak_num = int(lagna_deg // (360.0 / 27)) + 1
    lagna_nak_deg = lagna_deg % (360.0 / 27)
    lagna_pada = int(lagna_nak_deg // (360.0 / 108)) + 1

    lagna_sign_info = SIGN_LABELS.get(lagna_sign_num, {})
    lagna_nak_info = NAKSHATRA_LABELS[lagna_nak_num - 1]
    lagna_navamsa_sign = compute_navamsa_sign_num(lagna_deg)
    lagna_navamsa_info = SIGN_LABELS.get(lagna_navamsa_sign, {})

    positions_by_name["Lagna"] = {
        "name": "Lagna",
        "name_ta": "லக்னம்",
        "name_sa": "Lagna",
        "symbol": "லக்",  # CHANGED from "La" to the Tamil short-code, for
                           # visual consistency now that Lagna is rendered
                           # in the Tamil-styled Planetary Positions table
                           # (cosmetic label only — no calculation change).
        "rasi_number": lagna_sign_num,
        "rasi": lagna_sign_info.get("sa", ""),
        "rasi_ta": lagna_sign_info.get("ta", ""),
        "degree": round(lagna_deg_in_sign, 4),
        "degree_dms": format_dms(lagna_deg_in_sign),
        "total_degree": round(lagna_deg, 4),
        "total_degree_dms": format_dms(lagna_deg),
        "house": 1,
        "lord": lagna_sign_info.get("lord", ""),
        "lord_ta": PLANET_LABELS.get(lagna_sign_info.get("lord", ""), {}).get("ta", ""),
        "nakshatra": lagna_nak_info["sa"],
        "nakshatra_ta": lagna_nak_info["ta"],
        "nakshatra_number": lagna_nak_num,
        "nakshatra_lord": lagna_nak_info["lord"],
        "nakshatra_lord_ta": lagna_nak_info.get("lord_ta", ""),
        "pada": lagna_pada,
        "navamsa_sign": lagna_navamsa_sign,
        "navamsa_rasi": lagna_navamsa_info.get("sa", ""),
        "navamsa_rasi_ta": lagna_navamsa_info.get("ta", ""),
        "navamsa_lord": lagna_navamsa_info.get("lord", ""),
        "navamsa_lord_ta": PLANET_LABELS.get(lagna_navamsa_info.get("lord", ""), {}).get("ta", ""),
        "is_retrograde": False,
        "speed": 0.0,
        "status": "Ascendant",
        "status_ta": "லக்னம்",  # NEW — without this, the schema's default
                                  # ("சமம்" = "Neutral") would incorrectly
                                  # imply Lagna has a planetary dignity.
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
        p_nav_sign = compute_navamsa_sign_num(lon_deg)
        p_nav_info = SIGN_LABELS.get(p_nav_sign, {})

        # House from Lagna (1 to 12)
        house = ((sign_num - lagna_sign_num) % 12) + 1

        # Dignity status (Parashari Panchadha Maitri & Exaltation)
        status_en, status_ta = compute_planet_dignity(name, sign_num, is_retro)

        planet_obj = {
            "name": name,
            "name_ta": p_label.get("ta", name),
            "name_sa": p_label.get("sa", name),
            "symbol": p_label.get("ta_short", name[:2]),
            "rasi_number": sign_num,
            "rasi": sign_info.get("sa", ""),
            "rasi_ta": sign_info.get("ta", ""),
            "degree": round(deg_in_sign, 4),
            "degree_dms": format_dms(deg_in_sign),
            "total_degree": round(lon_deg, 4),
            "total_degree_dms": format_dms(lon_deg),
            "house": house,
            "lord": sign_info.get("lord", ""),
            "lord_ta": PLANET_LABELS.get(sign_info.get("lord", ""), {}).get("ta", ""),
            "nakshatra": nak_info["sa"],
            "nakshatra_ta": nak_info["ta"],
            "nakshatra_number": nak_num,
            "nakshatra_lord": nak_info["lord"],
            "nakshatra_lord_ta": nak_info.get("lord_ta", ""),
            "pada": pada,
            "navamsa_sign": p_nav_sign,
            "navamsa_rasi": p_nav_info.get("sa", ""),
            "navamsa_rasi_ta": p_nav_info.get("ta", ""),
            "navamsa_lord": p_nav_info.get("lord", ""),
            "navamsa_lord_ta": PLANET_LABELS.get(p_nav_info.get("lord", ""), {}).get("ta", ""),
            "is_retrograde": is_retro,
            "speed": round(speed, 6),
            "status": status_en,
            "status_ta": status_ta
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
    ketu_nav_sign = compute_navamsa_sign_num(ketu_deg)
    ketu_nav_info = SIGN_LABELS.get(ketu_nav_sign, {})

    ketu_obj = {
        "name": "Ketu",
        "name_ta": ketu_p_label.get("ta", "கேது"),
        "name_sa": ketu_p_label.get("sa", "Ketu"),
        "symbol": ketu_p_label.get("ta_short", "கே"),
        "rasi_number": ketu_sign_num,
        "rasi": ketu_sign_info.get("sa", ""),
        "rasi_ta": ketu_sign_info.get("ta", ""),
        "degree": round(ketu_deg_in_sign, 4),
        "degree_dms": format_dms(ketu_deg_in_sign),
        "total_degree": round(ketu_deg, 4),
        "total_degree_dms": format_dms(ketu_deg),
        "house": ketu_house,
        "lord": ketu_sign_info.get("lord", ""),
        "lord_ta": PLANET_LABELS.get(ketu_sign_info.get("lord", ""), {}).get("ta", ""),
        "nakshatra": ketu_nak_info["sa"],
        "nakshatra_ta": ketu_nak_info["ta"],
        "nakshatra_number": ketu_nak_num,
        "nakshatra_lord": ketu_nak_info["lord"],
        "nakshatra_lord_ta": ketu_nak_info.get("lord_ta", ""),
        "pada": ketu_pada,
        "navamsa_sign": ketu_nav_sign,
        "navamsa_rasi": ketu_nav_info.get("sa", ""),
        "navamsa_rasi_ta": ketu_nav_info.get("ta", ""),
        "navamsa_lord": ketu_nav_info.get("lord", ""),
        "navamsa_lord_ta": PLANET_LABELS.get(ketu_nav_info.get("lord", ""), {}).get("ta", ""),
        "is_retrograde": True,
        "speed": rahu_obj["speed"],
        "status": "Retrograde",
        "status_ta": "வக்ரம்"
    }
    planets_data.append(ketu_obj)
    positions_by_name["Ketu"] = ketu_obj

    # Panchangam calculations: Thithi, Vaaram, Yogam, Karanam
    sun_lon = positions_by_name["Sun"]["total_degree"]
    moon_lon = positions_by_name["Moon"]["total_degree"]

    # Difference in longitude (Moon - Sun) for Tithi & Karana
    diff = (moon_lon - sun_lon) % 360.0
    tithi_index = int(diff // 12.0)  # 0 to 29
    tithi_name = TITHI_NAMES[tithi_index]
    tithi_name_ta = TITHI_NAMES_TA[tithi_index]

    paksha_en = "Shukla Paksha" if tithi_index < 15 else "Krishna Paksha"
    paksha_ta = "வளர்பிறை" if tithi_index < 15 else "தேய்பிறை"
    paksha_full = f"{paksha_en} ({paksha_ta})"

    tithi_elapsed_pct = round(((diff % 12.0) / 12.0) * 100.0, 2)

    # Vaaram (Day of week from Julian Day)
    day_num = int(math.floor(jd + 1.5)) % 7
    vaaram_info = VAARAM_NAMES.get(day_num, VAARAM_NAMES[0])
    vaaram_lords = {0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury", 4: "Jupiter", 5: "Venus", 6: "Saturn"}
    vaaram_lord_name = vaaram_lords[day_num]
    vaaram_lord_ta = PLANET_LABELS.get(vaaram_lord_name, {}).get("ta", "")

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

    moon_nak_obj = positions_by_name["Moon"]
    moon_nak_num = moon_nak_obj["nakshatra_number"]
    moon_nak_info = NAKSHATRA_LABELS[moon_nak_num - 1]
    moon_nak = moon_nak_obj["nakshatra"]
    moon_nak_ta = moon_nak_obj["nakshatra_ta"]
    moon_pada = moon_nak_obj["pada"]
    moon_rasi = moon_nak_obj["rasi"]
    moon_rasi_ta = moon_nak_obj["rasi_ta"]
    moon_deg_in_nak = moon_lon % (360.0 / 27)
    nak_elapsed_pct = round((moon_deg_in_nak / (360.0 / 27)) * 100.0, 2)

    # Tamil Panchangam Subha Yoga (Amrita / Siddha / Marana)
    dina_yoga_en, dina_yoga_ta, dina_yoga_desc_en, dina_yoga_desc_ta, dina_yoga_status = compute_tamil_dina_yoga(
        day_num, moon_nak_num
    )

    # Astronomical Timings (Sunrise, Sunset, Dinamani, Udhayadhi Nazhigai, Rahu/Yama/Kuligai)
    astro_timings = compute_astronomical_timings(jd, lat, lon, date_str, time_str, timezone_str)

    # --- NEW: Mandi (Maandhi / Gulika) Upagraha Position ---
    # Classical method: Mandi's zodiacal position is the Ascendant (Lagna)
    # computed at the exact clock-moment the Kuligai Kalam period begins for
    # the birth weekday — reusing the same 8-fold daytime division already
    # established above for Rahu Kalam / Yamagandam / Kuligai Kalam timing.
    # This is the standard Gulika/Mandi computation method in Parashari
    # Jyotish (cf. Brihat Parashara Hora Shastra's Upagraha chapter; also
    # implemented as the "gulika" function in PyJHora's
    # horoscope/chart/house.py, which this project's ephemeris layer is
    # built on per README's Tech Stack).
    #
    # NOTE: like the pre-existing Kuligai Kalam timing this reuses, this
    # applies the daytime 8-fold division regardless of whether the birth
    # is a day or night birth. That is a pre-existing simplification already
    # present in this file's Rahu Kalam / Yamagandam / Kuligai Kalam timing
    # — not a new limitation introduced by this addition. If night-birth
    # handling is required later, it should be added as an explicit,
    # separately-cited branch per AGENTS.md §1.7, applied consistently to
    # Rahu Kalam / Yamagandam / Kuligai Kalam / Mandi together.
    jd_mandi = astro_timings.get("kuligai_start_jd")
    if jd_mandi is not None:
        _, ascmc_mandi = swe.houses_ex(jd_mandi, lat, lon, b'P', flags)
        mandi_deg = ascmc_mandi[0] % 360.0

        mandi_sign_num = int(mandi_deg // 30) + 1
        mandi_deg_in_sign = mandi_deg % 30.0
        mandi_nak_num = int(mandi_deg // (360.0 / 27)) + 1
        mandi_nak_deg = mandi_deg % (360.0 / 27)
        mandi_pada = int(mandi_nak_deg // (360.0 / 108)) + 1

        mandi_sign_info = SIGN_LABELS.get(mandi_sign_num, {})
        mandi_nak_info = NAKSHATRA_LABELS[mandi_nak_num - 1]
        mandi_house = ((mandi_sign_num - lagna_sign_num) % 12) + 1
        mandi_nav_sign = compute_navamsa_sign_num(mandi_deg)
        mandi_nav_info = SIGN_LABELS.get(mandi_nav_sign, {})

        positions_by_name["Mandi"] = {
            "name": "Mandi",
            "name_ta": "மாந்தி",
            "name_sa": "Gulika (Maandhi)",
            "symbol": "மா",
            "rasi_number": mandi_sign_num,
            "rasi": mandi_sign_info.get("sa", ""),
            "rasi_ta": mandi_sign_info.get("ta", ""),
            "degree": round(mandi_deg_in_sign, 4),
            "degree_dms": format_dms(mandi_deg_in_sign),
            "total_degree": round(mandi_deg, 4),
            "total_degree_dms": format_dms(mandi_deg),
            "house": mandi_house,
            "lord": mandi_sign_info.get("lord", ""),
            "lord_ta": PLANET_LABELS.get(mandi_sign_info.get("lord", ""), {}).get("ta", ""),
            "nakshatra": mandi_nak_info["sa"],
            "nakshatra_ta": mandi_nak_info["ta"],
            "nakshatra_number": mandi_nak_num,
            "nakshatra_lord": mandi_nak_info["lord"],
            "nakshatra_lord_ta": mandi_nak_info.get("lord_ta", ""),
            "pada": mandi_pada,
            "navamsa_sign": mandi_nav_sign,
            "navamsa_rasi": mandi_nav_info.get("sa", ""),
            "navamsa_rasi_ta": mandi_nav_info.get("ta", ""),
            "navamsa_lord": mandi_nav_info.get("lord", ""),
            "navamsa_lord_ta": PLANET_LABELS.get(mandi_nav_info.get("lord", ""), {}).get("ta", ""),
            "is_retrograde": False,
            "speed": 0.0,
            "status": "Upagraha",
            "status_ta": "உபக்கிரகம்"
        }

    # Basic Details Object (Section 2 Panchangam & Subha Yoga Elements)
    basic_details = {
        # 1. Lagna Particulars
        "lagnam": positions_by_name["Lagna"]["rasi"],
        "lagnam_ta": positions_by_name["Lagna"]["rasi_ta"],
        "lagnam_degree": positions_by_name["Lagna"]["degree"],
        "lagnam_dms": positions_by_name["Lagna"]["degree_dms"],
        "lagnam_total_degree": positions_by_name["Lagna"]["total_degree"],
        "lagnam_lord": positions_by_name["Lagna"]["lord"],
        "lagnam_lord_ta": positions_by_name["Lagna"]["lord_ta"],
        "lagnam_nakshatram": positions_by_name["Lagna"]["nakshatra"],
        "lagnam_nakshatram_ta": positions_by_name["Lagna"]["nakshatra_ta"],
        "lagnam_pada": positions_by_name["Lagna"]["pada"],
        "lagnam_nakshatra_lord": positions_by_name["Lagna"]["nakshatra_lord"],
        "lagnam_nakshatra_lord_ta": positions_by_name["Lagna"]["nakshatra_lord_ta"],
        "lagnam_navamsa": positions_by_name["Lagna"]["navamsa_rasi"],
        "lagnam_navamsa_ta": positions_by_name["Lagna"]["navamsa_rasi_ta"],
        "lagnam_navamsa_lord": positions_by_name["Lagna"]["navamsa_lord"],
        "lagnam_navamsa_lord_ta": positions_by_name["Lagna"]["navamsa_lord_ta"],

        # 2. Rasi (Moon Sign) Particulars
        "rasi": moon_rasi,
        "rasi_ta": moon_rasi_ta,
        "rasi_lord": moon_nak_obj["lord"],
        "rasi_lord_ta": PLANET_LABELS.get(moon_nak_obj["lord"], {}).get("ta", ""),

        # 3. Janma Nakshatra Particulars
        "nakshatram": moon_nak,
        "nakshatram_ta": moon_nak_ta,
        "pada": moon_pada,
        "nakshatra_lord": moon_nak_info["lord"],
        "nakshatra_lord_ta": moon_nak_info.get("lord_ta", ""),
        "nakshatra_deity": moon_nak_info.get("deity", ""),
        "nakshatra_elapsed_pct": nak_elapsed_pct,

        # 4. Five Panchangam Angas (பஞ்சாங்கம்)
        "thithi": f"{paksha_en} {tithi_name}",
        "thithi_ta": f"{paksha_ta} {tithi_name_ta}",
        "paksha": paksha_full,
        "paksha_en": paksha_en,
        "paksha_ta": paksha_ta,
        "thithi_elapsed_pct": tithi_elapsed_pct,
        "vaaram": vaaram_info["sa"],
        "vaaram_ta": vaaram_info["ta"],
        "vaaram_lord": vaaram_lord_name,
        "vaaram_lord_ta": vaaram_lord_ta,
        "yogam": yoga_name,
        "yogam_ta": yoga_name_ta,
        "karanam": k_name,
        "karanam_ta": k_name_ta,

        # 5. Tamil Panchangam Subha Yoga (பஞ்சாங்க சுப யோகம்)
        "subha_yogam": dina_yoga_en,
        "subha_yogam_ta": dina_yoga_ta,
        "subha_yogam_desc": dina_yoga_desc_en,
        "subha_yogam_desc_ta": dina_yoga_desc_ta,
        "subha_yogam_status": dina_yoga_status,

        # 6. Nakshatra Attributes (நட்சத்திர பஞ்சாங்க கூறுகள்)
        "ganam": moon_nak_info.get("ganam", ""),
        "ganam_ta": moon_nak_info.get("ganam_ta", ""),
        "yoni": moon_nak_info.get("yoni", ""),
        "yoni_ta": moon_nak_info.get("yoni_ta", ""),
        "rajju": moon_nak_info.get("rajju", ""),
        "rajju_ta": moon_nak_info.get("rajju_ta", ""),
        "bootham": moon_nak_info.get("bootham", ""),
        "bootham_ta": moon_nak_info.get("bootham_ta", ""),
        "nadi": moon_nak_info.get("nadi", ""),
        "nadi_ta": moon_nak_info.get("nadi_ta", ""),
        "vriksham_ta": moon_nak_info.get("vriksham_ta", ""),
        "pakshi_ta": moon_nak_info.get("pakshi_ta", ""),
        "mirugam_ta": moon_nak_info.get("mirugam_ta", ""),

        # 7. High-Precision Ephemeris & Astronomical Timings
        "ayanamsa_name": ayanamsa_name,
        "ayanamsa_value": round(ayanamsa, 4),
        "ayanamsa_dms": format_dms(ayanamsa),
        "panchangam_system": panchangam_system,
        "sun_rise": astro_timings["sun_rise"],
        "sun_set": astro_timings["sun_set"],
        "dinamani": astro_timings["dinamani"],
        "dinamani_en": astro_timings["dinamani_en"],
        "ratrimana": astro_timings["ratrimana"],
        "ratrimana_en": astro_timings["ratrimana_en"],
        "udhayadhi_nazhigai": astro_timings["udhayadhi_nazhigai"],
        "udhayadhi_nazhigai_en": astro_timings["udhayadhi_nazhigai_en"],
        "rahu_kalam": astro_timings["rahu_kalam"],
        "yamagandam": astro_timings["yamagandam"],
        "kuligai": astro_timings["kuligai"]
    }

    return {
        "basic_details": basic_details,
        "planets": planets_data,
        "positions_by_name": positions_by_name,
        "ayanamsa": ayanamsa,
        "lagna_info": positions_by_name["Lagna"],
        "mandi_info": positions_by_name.get("Mandi"),  # NEW
    }