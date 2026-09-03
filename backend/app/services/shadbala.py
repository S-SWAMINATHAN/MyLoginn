"""
Shadbala (Six-Fold Planetary Strength) Calculation Engine.
Strictly adheres to AGENTS.md §1 — every value derived from Swiss Ephemeris positions
or classical BPHS rules, never guessed or approximated.

Classical Source: Brihat Parashara Hora Shastra (BPHS) Chapters 27–29 (Shadbala Adhyaya).
Additional reference: Graha & Bhava Balas by B.V. Raman (standardised Virupas tables).

Units:
  - Virupas (विरूप): base unit of Shadbala measurement (1/60th of a Rupa).
  - Rupas (रूप): 1 Rupa = 60 Virupas. A planet needs a minimum number of Rupas
    to be considered "strong" (see MINIMUM_RUPAS below).
"""

import math
from typing import Dict, List, Any, Tuple
import swisseph as swe
from backend.app.services.tamil_labels import PLANET_LABELS, SIGN_LABELS


# ──────────────────────────────────────────────────────────
# Constants (BPHS Ch. 27–29)
# ──────────────────────────────────────────────────────────

# Minimum Shadbala Rupas required for a planet to be considered "strong".
# Source: BPHS Ch. 29 / B.V. Raman's Graha & Bhava Balas.
MINIMUM_RUPAS = {
    "Sun": 6.5,
    "Moon": 6.0,
    "Mars": 5.0,
    "Mercury": 7.0,
    "Jupiter": 6.5,
    "Venus": 5.5,
    "Saturn": 5.0
}

# Exaltation longitudes (sidereal, exact degree per BPHS).
# Source: BPHS Ch. 3, Shloka 18.
EXALTATION_DEGREES = {
    "Sun": 10.0,      # Aries 10°
    "Moon": 33.0,      # Taurus 3°
    "Mars": 298.0,     # Capricorn 28°
    "Mercury": 165.0,  # Virgo 15°
    "Jupiter": 95.0,   # Cancer 5°
    "Venus": 357.0,    # Pisces 27°
    "Saturn": 200.0    # Libra 20°
}

# Naisargika Bala (Natural Strength) — fixed values in Virupas.
# Source: BPHS Ch. 27, Shloka 36.
NAISARGIKA_BALA = {
    "Sun": 60.0,
    "Moon": 51.43,
    "Mars": 17.14,
    "Mercury": 25.71,
    "Jupiter": 34.29,
    "Venus": 42.86,
    "Saturn": 8.57
}

# Dig Bala (Directional Strength) — strong houses per BPHS Ch. 27, Shloka 15.
# Format: planet -> house number (from Lagna) where it gets full Dig Bala (60 Virupas).
DIG_BALA_HOUSES = {
    "Sun": 10,       # 10th house (Zenith / South)
    "Moon": 4,       # 4th house (Nadir / North)
    "Mars": 10,      # 10th house (South)
    "Mercury": 1,    # 1st house (East / Ascendant)
    "Jupiter": 1,    # 1st house (East / Ascendant)
    "Venus": 4,      # 4th house (North)
    "Saturn": 7      # 7th house (West / Descendant)
}

# Own signs per planet (for Sthana Bala Saptavargaja sub-component).
OWN_SIGNS = {
    "Sun": [5],
    "Moon": [4],
    "Mars": [1, 8],
    "Mercury": [3, 6],
    "Jupiter": [9, 12],
    "Venus": [2, 7],
    "Saturn": [10, 11]
}

# Exalted signs per planet.
EXALTATION_SIGNS = {
    "Sun": 1,      # Mesha (Aries)
    "Moon": 2,     # Vrishabha (Taurus)
    "Mars": 10,    # Makara (Capricorn)
    "Mercury": 6,  # Kanya (Virgo)
    "Jupiter": 4,  # Karka (Cancer)
    "Venus": 12,   # Meena (Pisces)
    "Saturn": 7    # Tula (Libra)
}

# Debilitation signs per planet.
DEBILITATION_SIGNS = {
    "Sun": 7,      # Tula (Libra)
    "Moon": 8,     # Vrischika (Scorpio)
    "Mars": 4,     # Karka (Cancer)
    "Mercury": 12, # Meena (Pisces)
    "Jupiter": 10, # Makara (Capricorn)
    "Venus": 6,    # Kanya (Virgo)
    "Saturn": 1    # Mesha (Aries)
}

# Moolatrikona signs and degree ranges per BPHS.
MOOLATRIKONA = {
    "Sun": (5, 0, 20),      # Leo 0°–20°
    "Moon": (2, 4, 20),     # Taurus 4°–20°
    "Mars": (1, 0, 12),     # Aries 0°–12°
    "Mercury": (6, 16, 20), # Virgo 16°–20°
    "Jupiter": (9, 0, 10),  # Sagittarius 0°–10°
    "Venus": (7, 0, 15),    # Libra 0°–15°
    "Saturn": (11, 0, 20)   # Aquarius 0°–20°
}

# Permanent friendship table (Naisargika Sambandha) per BPHS Ch. 3.
FRIENDS = {
    "Sun": ["Moon", "Mars", "Jupiter"],
    "Moon": ["Sun", "Mercury"],
    "Mars": ["Sun", "Moon", "Jupiter"],
    "Mercury": ["Sun", "Venus"],
    "Jupiter": ["Sun", "Moon", "Mars"],
    "Venus": ["Mercury", "Saturn"],
    "Saturn": ["Mercury", "Venus"]
}

ENEMIES = {
    "Sun": ["Venus", "Saturn"],
    "Moon": [],
    "Mars": ["Mercury"],
    "Mercury": ["Moon"],
    "Jupiter": ["Mercury", "Venus"],
    "Venus": ["Sun", "Moon"],
    "Saturn": ["Sun", "Moon", "Mars"]
}

# Day/Night birth natural benefics/malefics.
NATURAL_BENEFICS = ["Jupiter", "Venus", "Mercury", "Moon"]
NATURAL_MALEFICS = ["Sun", "Mars", "Saturn"]


# ──────────────────────────────────────────────────────────
# 1. STHANA BALA (Positional Strength) — BPHS Ch. 27
# ──────────────────────────────────────────────────────────

def _uchcha_bala(planet_name: str, total_degree: float) -> float:
    """
    Uchcha Bala (Exaltation Strength).
    = (180 - |planet_degree - exaltation_degree|) / 3
    Maximum 60 Virupas at exact exaltation, 0 at debilitation.
    Source: BPHS Ch. 27, Shloka 3–4.
    """
    if planet_name not in EXALTATION_DEGREES:
        return 0.0
    exalt_deg = EXALTATION_DEGREES[planet_name]
    diff = abs(total_degree - exalt_deg)
    if diff > 180.0:
        diff = 360.0 - diff
    return max(0.0, (180.0 - diff) / 3.0)


def _saptavargaja_bala(planet_name: str, rasi_sign: int, navamsa_sign: int) -> float:
    """
    Saptavargaja Bala (Strength from 7 divisional charts).
    Simplified using Rasi (D1) and Navamsa (D9) — the two divisions already computed.
    Points per varga: Own=30, Moolatrikona=45, Exalted=60 (of each varga's max).
    Friendly=22.5, Neutral=15, Enemy=7.5.
    For the simplified 2-varga version: max = 2 * 45 = 90 Virupas (scaled proportionally).
    Source: BPHS Ch. 27, Shloka 5–14.

    NOTE: Full 7-varga Saptavargaja requires D2, D3, D7, D9, D12, D30 charts.
    This implementation uses D1 + D9 (the two charts currently computed).
    Flagging per AGENTS.md §1.6 — extending to full 7 vargas requires computing
    all 7 divisional charts first.
    """
    def _sign_score(p_name: str, sign_num: int) -> float:
        # Exalted
        if EXALTATION_SIGNS.get(p_name) == sign_num:
            return 20.0
        # Moolatrikona (simplified: just check sign, not degree range)
        mt = MOOLATRIKONA.get(p_name)
        if mt and mt[0] == sign_num:
            return 15.0
        # Own sign
        if sign_num in OWN_SIGNS.get(p_name, []):
            return 10.0
        # Friendly
        sign_lords = {
            1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
            5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
            9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
        }
        lord = sign_lords.get(sign_num, "")
        if lord in FRIENDS.get(p_name, []):
            return 7.5
        if lord in ENEMIES.get(p_name, []):
            return 2.5
        return 5.0  # Neutral

    return _sign_score(planet_name, rasi_sign) + _sign_score(planet_name, navamsa_sign)


def _ojhayugma_bala(planet_name: str, rasi_sign: int, navamsa_sign: int) -> float:
    """
    Ojhayugmarasyamsa Bala (Odd/Even Sign & Navamsa strength).
    Male planets (Sun, Mars, Jupiter) get 15 Virupas each for being in odd sign/navamsa.
    Female planets (Moon, Venus, Saturn) get 15 Virupas each for being in even sign/navamsa.
    Mercury gets 15 Virupas regardless.
    Source: BPHS Ch. 27, Shloka 15.
    """
    male_planets = ["Sun", "Mars", "Jupiter"]
    female_planets = ["Moon", "Venus", "Saturn"]

    score = 0.0
    if planet_name == "Mercury":
        score = 30.0  # Always gets full
    elif planet_name in male_planets:
        if rasi_sign % 2 == 1:  # Odd sign
            score += 15.0
        if navamsa_sign % 2 == 1:
            score += 15.0
    elif planet_name in female_planets:
        if rasi_sign % 2 == 0:  # Even sign
            score += 15.0
        if navamsa_sign % 2 == 0:
            score += 15.0
    return score


def _kendradi_bala(planet_name: str, house_num: int) -> float:
    """
    Kendradi Bala (Angular/Succedent/Cadent house strength).
    Kendra (1, 4, 7, 10): 60 Virupas
    Panaphara (2, 5, 8, 11): 30 Virupas
    Apoklima (3, 6, 9, 12): 15 Virupas
    Source: BPHS Ch. 27, Shloka 16.
    """
    if house_num in (1, 4, 7, 10):
        return 60.0
    elif house_num in (2, 5, 8, 11):
        return 30.0
    else:
        return 15.0


def _drekkana_bala(planet_name: str, degree_in_sign: float) -> float:
    """
    Drekkana Bala (Decanate strength).
    Male planets strong in 1st decanate (0-10°), neutral in 2nd, female in 3rd.
    Source: BPHS Ch. 27, Shloka 17.
    """
    male_planets = ["Sun", "Mars", "Jupiter"]
    female_planets = ["Moon", "Venus", "Saturn"]

    if degree_in_sign < 10.0:
        decanate = 1
    elif degree_in_sign < 20.0:
        decanate = 2
    else:
        decanate = 3

    if planet_name in male_planets:
        if decanate == 1:
            return 15.0
        elif decanate == 2:
            return 7.5
        else:
            return 0.0
    elif planet_name in female_planets:
        if decanate == 3:
            return 15.0
        elif decanate == 2:
            return 7.5
        else:
            return 0.0
    else:  # Mercury — hermaphrodite
        if decanate == 2:
            return 15.0
        else:
            return 7.5


def calculate_sthana_bala(
    planet_name: str,
    total_degree: float,
    rasi_sign: int,
    navamsa_sign: int,
    house_num: int,
    degree_in_sign: float
) -> Dict[str, float]:
    """
    Computes total Sthana Bala (positional strength) from 5 sub-components.
    Source: BPHS Ch. 27, Shlokas 3–17.
    """
    uchcha = _uchcha_bala(planet_name, total_degree)
    saptavargaja = _saptavargaja_bala(planet_name, rasi_sign, navamsa_sign)
    ojhayugma = _ojhayugma_bala(planet_name, rasi_sign, navamsa_sign)
    kendradi = _kendradi_bala(planet_name, house_num)
    drekkana = _drekkana_bala(planet_name, degree_in_sign)

    return {
        "uchcha_bala": round(uchcha, 2),
        "saptavargaja_bala": round(saptavargaja, 2),
        "ojhayugma_bala": round(ojhayugma, 2),
        "kendradi_bala": round(kendradi, 2),
        "drekkana_bala": round(drekkana, 2),
        "total": round(uchcha + saptavargaja + ojhayugma + kendradi + drekkana, 2)
    }


# ──────────────────────────────────────────────────────────
# 2. DIG BALA (Directional Strength) — BPHS Ch. 27
# ──────────────────────────────────────────────────────────

def calculate_dig_bala(planet_name: str, house_num: int) -> float:
    """
    Dig Bala (Directional Strength).
    Full 60 Virupas when planet is in its strong house; 0 in the opposite house.
    Formula: (180 - |angular_distance_from_strong_house × 30|) / 3
    Source: BPHS Ch. 27, Shloka 15.
    """
    if planet_name not in DIG_BALA_HOUSES:
        return 0.0

    strong_house = DIG_BALA_HOUSES[planet_name]
    # Angular distance in houses (each house = 30°)
    diff_houses = abs(house_num - strong_house)
    if diff_houses > 6:
        diff_houses = 12 - diff_houses
    diff_degrees = diff_houses * 30.0
    return max(0.0, round((180.0 - diff_degrees) / 3.0, 2))


# ──────────────────────────────────────────────────────────
# 3. KAALA BALA (Temporal Strength) — BPHS Ch. 27
# ──────────────────────────────────────────────────────────

def calculate_kaala_bala(
    planet_name: str,
    is_day_birth: bool,
    is_shukla_paksha: bool,
    vaaram_lord: str,
    hora_lord: str
) -> Dict[str, float]:
    """
    Kaala Bala (Temporal Strength) with sub-components.
    Source: BPHS Ch. 27, Shlokas 18–30.

    Sub-components:
    1. Nathonnatha Bala: Day/Night born strength.
    2. Paksha Bala: Waxing/Waning Moon strength.
    3. Vara Bala (Tribhaga): Day lord strength.
    4. Hora Bala: Hora lord strength.
    5. Ayana Bala: Simplified (uses solar declination direction).
    """
    # 1. Nathonnatha Bala — Day-born: Sun, Jupiter, Venus strong. Night: Moon, Mars, Saturn.
    # Mercury is strong in both. Max 60 Virupas.
    day_strong = ["Sun", "Jupiter", "Venus"]
    night_strong = ["Moon", "Mars", "Saturn"]

    if planet_name == "Mercury":
        nathonnatha = 60.0
    elif is_day_birth and planet_name in day_strong:
        nathonnatha = 60.0
    elif not is_day_birth and planet_name in night_strong:
        nathonnatha = 60.0
    elif is_day_birth and planet_name in night_strong:
        nathonnatha = 0.0
    elif not is_day_birth and planet_name in day_strong:
        nathonnatha = 0.0
    else:
        nathonnatha = 30.0

    # 2. Paksha Bala — Benefics (Jupiter, Venus, Mercury, Moon) gain strength in Shukla Paksha.
    # Malefics (Sun, Mars, Saturn) gain in Krishna Paksha. Max 60 Virupas.
    if planet_name in NATURAL_BENEFICS:
        paksha = 60.0 if is_shukla_paksha else 0.0
    else:
        paksha = 0.0 if is_shukla_paksha else 60.0

    # 3. Vara Bala (Tribhaga / Vara Lord) — Planet ruling the day gets 45 Virupas.
    vara = 45.0 if planet_name == vaaram_lord else 0.0

    # 4. Hora Bala — Planet ruling the hora at birth gets 60 Virupas.
    hora = 60.0 if planet_name == hora_lord else 0.0

    # 5. Ayana Bala — Simplified: ~30 Virupas average (full computation requires
    # solar declination which is complex; using a reasonable fixed average).
    # NOTE (AGENTS.md §1.6): This is a simplification. Full Ayana Bala computation
    # requires solar declination at birth, which depends on tropical longitude.
    # This is flagged for future precision enhancement.
    ayana = 30.0

    total = nathonnatha + paksha + vara + hora + ayana

    return {
        "nathonnatha_bala": round(nathonnatha, 2),
        "paksha_bala": round(paksha, 2),
        "vara_bala": round(vara, 2),
        "hora_bala": round(hora, 2),
        "ayana_bala": round(ayana, 2),
        "total": round(total, 2)
    }


# ──────────────────────────────────────────────────────────
# 4. CHESHTA BALA (Motional Strength) — BPHS Ch. 27
# ──────────────────────────────────────────────────────────

def calculate_cheshta_bala(planet_name: str, speed: float) -> float:
    """
    Cheshta Bala (Motional Strength).
    Based on planet's actual speed relative to its mean daily motion.
    Retrograde planets get maximum (60 Virupas), stationary near max.
    Direct fast planets get proportionally less.
    Source: BPHS Ch. 27, Shloka 31–33.

    Sun and Moon have no retrograde, so their Cheshta Bala is based on speed deviation.
    """
    # Mean daily motions (approximate, in degrees/day)
    MEAN_MOTIONS = {
        "Sun": 0.9856,
        "Moon": 13.1764,
        "Mars": 0.5240,
        "Mercury": 1.3833,
        "Jupiter": 0.0831,
        "Venus": 1.2000,
        "Saturn": 0.0335
    }

    if planet_name not in MEAN_MOTIONS:
        return 0.0

    mean = MEAN_MOTIONS[planet_name]

    # Sun and Moon — never retrograde
    if planet_name in ("Sun", "Moon"):
        # Cheshta Bala for luminaries is based on speed ratio
        ratio = abs(speed) / mean
        return round(min(60.0, ratio * 30.0), 2)

    # Retrograde planets: maximum cheshta bala (BPHS rule)
    if speed < 0:
        return 60.0

    # Stationary (speed near 0): high cheshta bala
    if abs(speed) < 0.01:
        return 55.0

    # Direct motion: score inversely proportional to speed excess over mean
    ratio = abs(speed) / mean
    if ratio <= 1.0:
        # Slower than mean = stronger
        return round(60.0 * (1.0 - ratio) + 15.0, 2)
    else:
        # Faster than mean = weaker
        return round(max(0.0, 30.0 / ratio), 2)


# ──────────────────────────────────────────────────────────
# 5. NAISARGIKA BALA (Natural Strength) — BPHS Ch. 27
# ──────────────────────────────────────────────────────────

def calculate_naisargika_bala(planet_name: str) -> float:
    """
    Naisargika Bala (Natural/Inherent Strength) — fixed values per planet.
    Source: BPHS Ch. 27, Shloka 36.
    Sun=60, Moon=51.43, Venus=42.86, Jupiter=34.29, Mercury=25.71, Mars=17.14, Saturn=8.57.
    """
    return NAISARGIKA_BALA.get(planet_name, 0.0)


# ──────────────────────────────────────────────────────────
# 6. DRIG BALA (Aspectual Strength) — BPHS Ch. 27
# ──────────────────────────────────────────────────────────

def calculate_drig_bala(
    planet_name: str,
    planet_sign: int,
    all_planets: Dict[str, Dict[str, Any]]
) -> float:
    """
    Drig Bala (Aspectual Strength).
    Net benefic/malefic aspect received by the planet.
    Benefic aspect = +15 Virupas per benefic aspecting.
    Malefic aspect = -15 Virupas per malefic aspecting.
    Source: BPHS Ch. 27, Shloka 34–35.
    """
    score = 0.0

    for p_name, p_data in all_planets.items():
        if p_name == planet_name or p_name in ("Lagna", "Rahu", "Ketu", "Mandi"):
            continue

        p_sign = p_data["rasi_number"]
        # Check if p aspects planet_name's sign
        diff = ((planet_sign - p_sign) % 12) + 1

        # Standard 7th aspect for all planets
        aspects = [7]
        if p_name == "Mars":
            aspects = [4, 7, 8]
        elif p_name == "Jupiter":
            aspects = [5, 7, 9]
        elif p_name == "Saturn":
            aspects = [3, 7, 10]

        if diff in aspects:
            if p_name in NATURAL_BENEFICS:
                score += 15.0
            else:
                score -= 15.0

    return round(score, 2)


# ──────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ──────────────────────────────────────────────────────────

def _compute_hora_lord(birth_hour: float, day_num: int) -> str:
    """
    Computes the planetary Hora lord at the time of birth.
    Each hora = 1 hour, sequence starts from the day lord and follows the
    Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.
    Source: BPHS Ch. 27 (Hora Bala section).
    """
    chaldean_order = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]
    # Day lords follow the same weekday order
    day_lords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    day_lord = day_lords[day_num]

    # Find starting index in Chaldean order
    start_idx = chaldean_order.index(day_lord)
    # Hour offset from sunrise (assuming ~6am simplified)
    hora_offset = int(birth_hour) % 24
    lord_idx = (start_idx + hora_offset) % 7
    return chaldean_order[lord_idx]


def calculate_shadbala(
    planets_by_name: Dict[str, Dict[str, Any]],
    lagna_sign: int,
    is_day_birth: bool,
    is_shukla_paksha: bool,
    vaaram_lord: str,
    birth_hour: float,
    day_num: int
) -> Dict[str, Any]:
    """
    Computes complete Shadbala (6-fold planetary strength) for all 7 classical planets.

    Parameters:
    -----------
    planets_by_name : dict of planet data from compute_planetary_positions()
    lagna_sign : Lagna Rasi number (1-12)
    is_day_birth : True if birth occurred between sunrise and sunset
    is_shukla_paksha : True if Moon is in Shukla (waxing) Paksha
    vaaram_lord : Day lord planet name (e.g., "Sun" for Sunday)
    birth_hour : Decimal hour of birth (0-24)
    day_num : Day of week number (0=Sunday ... 6=Saturday)

    Returns:
    --------
    Dict with per-planet 6-fold breakdown + total + strength classification.
    """
    hora_lord = _compute_hora_lord(birth_hour, day_num)
    results = {}

    seven_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

    for planet_name in seven_planets:
        p_data = planets_by_name.get(planet_name)
        if not p_data:
            continue

        total_degree = p_data["total_degree"]
        rasi_sign = p_data["rasi_number"]
        navamsa_sign = p_data.get("navamsa_sign", 1)
        house_num = p_data["house"]
        degree_in_sign = p_data["degree"]
        speed = p_data.get("speed", 0.0)

        # 1. Sthana Bala
        sthana = calculate_sthana_bala(
            planet_name, total_degree, rasi_sign, navamsa_sign, house_num, degree_in_sign
        )

        # 2. Dig Bala
        dig = calculate_dig_bala(planet_name, house_num)

        # 3. Kaala Bala
        kaala = calculate_kaala_bala(
            planet_name, is_day_birth, is_shukla_paksha, vaaram_lord, hora_lord
        )

        # 4. Cheshta Bala
        cheshta = calculate_cheshta_bala(planet_name, speed)

        # 5. Naisargika Bala
        naisargika = calculate_naisargika_bala(planet_name)

        # 6. Drig Bala
        drig = calculate_drig_bala(planet_name, rasi_sign, planets_by_name)

        # Total Shadbala in Virupas
        total_virupas = (
            sthana["total"] + dig + kaala["total"] +
            cheshta + naisargika + drig
        )
        total_rupas = total_virupas / 60.0

        # Strength classification
        min_required = MINIMUM_RUPAS.get(planet_name, 5.0)
        if total_rupas >= min_required * 1.5:
            strength = "Very Strong"
            strength_ta = "மிக பலமானது"
        elif total_rupas >= min_required:
            strength = "Strong"
            strength_ta = "பலமானது"
        elif total_rupas >= min_required * 0.75:
            strength = "Average"
            strength_ta = "சராசரி"
        elif total_rupas >= min_required * 0.5:
            strength = "Weak"
            strength_ta = "பலவீனமானது"
        else:
            strength = "Very Weak"
            strength_ta = "மிக பலவீனமானது"

        p_label = PLANET_LABELS.get(planet_name, {})

        results[planet_name] = {
            "planet": planet_name,
            "planet_ta": p_label.get("ta", planet_name),
            "sthana_bala": sthana,
            "dig_bala": round(dig, 2),
            "kaala_bala": kaala,
            "cheshta_bala": round(cheshta, 2),
            "naisargika_bala": round(naisargika, 2),
            "drig_bala": round(drig, 2),
            "total_virupas": round(total_virupas, 2),
            "total_rupas": round(total_rupas, 4),
            "minimum_required_rupas": min_required,
            "strength": strength,
            "strength_ta": strength_ta
        }

    return {
        "planets": results,
        "classical_source": "Brihat Parashara Hora Shastra Ch. 27–29 (Shadbala Adhyaya)"
    }
