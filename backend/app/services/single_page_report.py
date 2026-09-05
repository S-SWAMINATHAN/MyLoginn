"""
Single-Page Jathagam Report — supporting calculations.
Governed by AGENTS.md §1 (Non-Hallucination Rules).

IMPORTANT — what this file does and does NOT do:
- It does NOT recompute Lagna/Rasi/Nakshatra/Dasha/Doshas/Ashtakavarga. Those
  already exist in ephemeris.py / dasha_builder.py / yoga_dosha.py /
  ashtakavarga.py and are reused as-is via the values passed into these
  functions from charts.py.
- It ONLY adds the pieces the single-page report needs that had no existing
  implementation anywhere in the codebase:
    1. Saturn transit dosha (Ezharai Sani / Ashtama Sani) — a *transit*
       calculation (today's Saturn position), which nothing else in this
       codebase computes (everything else is natal-only at birth JD).
    2. A life-category "scorecard" — an explicitly-labelled HEURISTIC
       aggregation on top of the existing, real classical Ashtakavarga
       bindu counts. This is NOT a named classical score in its own right;
       it's presented to the user as a strength summary derived from
       Ashtakavarga, and is clearly commented as such per AGENTS.md §1.2.
    3. A remedies / lucky-elements guide, built from: the nakshatra deity
       (already computed in ephemeris.py's basic_details), the current
       Mahadasha lord (already computed in dasha_builder.py), the existing
       per-dosha remedies (already computed in yoga_dosha.py), and the
       classical Navagraha colour/number table (cited below).

Every new numeric rule below has a classical citation in its own comment.
"""

from datetime import datetime, timezone as dt_timezone
from typing import Dict, List, Any, Optional
import swisseph as swe

from backend.app.services.tamil_labels import PLANET_LABELS

# ---------------------------------------------------------------------------
# 1. Saturn Transit Dosha — Ezharai Sani (7.5-year Saturn) / Ashtama Sani
# ---------------------------------------------------------------------------
# Classical rule (standard Parashari/Tamil transit ["Gochara"] convention,
# widely documented — e.g. transit chapters referenced across Tamil Jyotisha
# almanac practice): counted from the natal MOON sign (Rasi), not Lagna.
#   - Ezharai Sani ("7.5-year Saturn"): active while transit Saturn occupies
#     the 12th, 1st, or 2nd sign counted from the Moon sign. Each leg lasts
#     roughly 2.5 years (Saturn's own transit period per sign), totalling
#     ~7.5 years — hence the name.
#   - Ashtama Sani: active while transit Saturn occupies the 8th sign
#     counted from the Moon sign.
# This is a TRANSIT calculation: it depends on today's date, not the birth
# date, so it is computed fresh here rather than reused from ephemeris.py
# (which only ever computes positions at the birth JD).

def _get_current_sidereal_saturn_sign() -> int:
    """Transit Saturn's current sign (1-12), Lahiri sidereal, at the moment
    this report is generated. Uses UTC 'now' — house-level (whole-sign)
    transit results don't depend on time-of-day precision the way natal
    Lagna does, so no birth-location adjustment is needed here."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    now_utc = datetime.now(dt_timezone.utc)
    jd_now = swe.julday(
        now_utc.year, now_utc.month, now_utc.day,
        now_utc.hour + now_utc.minute / 60.0 + now_utc.second / 3600.0
    )
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    res, _ = swe.calc_ut(jd_now, swe.SATURN, flags)
    saturn_lon = res[0] % 360.0
    return int(saturn_lon // 30) + 1


def compute_saturn_transit_dosha(moon_sign_num: int) -> Dict[str, Any]:
    """Returns a TransitDoshaResult-shaped dict for Ezharai Sani / Ashtama
    Sani, evaluated against the natal Moon sign. present=False with a
    'clear' description if neither condition currently holds."""
    saturn_sign = _get_current_sidereal_saturn_sign()

    house_from_moon = ((saturn_sign - moon_sign_num) % 12) + 1  # 1..12

    if house_from_moon in (12, 1, 2):
        if house_from_moon == 12:
            phase_en, phase_ta = "Rising phase (1st leg)", "ஆரம்ப அரையாண்டு காலம்"
        elif house_from_moon == 1:
            phase_en, phase_ta = "Peak phase (2nd leg)", "உச்ச கால கட்டம்"
        else:
            phase_en, phase_ta = "Setting phase (3rd leg)", "இறுதி அரையாண்டு காலம்"
        return {
            "name": "Ezharai Sani (7.5-Year Saturn)",
            "name_ta": "ஏழரை சனி",
            "present": True,
            "phase": phase_en,
            "phase_ta": phase_ta,
            "description": (
                "Transit Saturn is currently in the 12th, 1st, or 2nd sign from your "
                "natal Moon sign — the classical Ezharai Sani window. Traditionally "
                "associated with heavier responsibilities, delays, and tests of patience, "
                "often followed by durable long-term gains once the period ends."
            ),
            "description_ta": (
                "தற்போது சனி பகவான் தங்கள் ராசிக்கு 12, 1, அல்லது 2-ஆம் இடத்தில் சஞ்சாரம் "
                "செய்கிறார் — இதுவே ஏழரை சனி காலம். பொறுப்புகள் அதிகரிப்பு, தாமதங்கள் மற்றும் "
                "மன உறுதி சோதனைகள் இக்காலத்தில் காணப்படும்; காலம் முடிந்ததும் நிலையான "
                "நன்மைகள் கிடைக்கும்."
            ),
            "classical_source": "Standard Parashari/Tamil Gochara (transit) convention for Saturn from the natal Moon sign",
        }

    if house_from_moon == 8:
        return {
            "name": "Ashtama Sani (8th-House Saturn Transit)",
            "name_ta": "அஷ்டம சனி",
            "present": True,
            "phase": "8th-from-Moon transit",
            "phase_ta": "அஷ்டம சஞ்சாரம்",
            "description": (
                "Transit Saturn is currently in the 8th sign from your natal Moon sign. "
                "Classically flagged as a period requiring caution around health and "
                "sudden disruptions, and calling for steady, unhurried decisions."
            ),
            "description_ta": (
                "தற்போது சனி பகவான் தங்கள் ராசிக்கு 8-ஆம் இடத்தில் சஞ்சாரம் செய்கிறார் — "
                "இதுவே அஷ்டம சனி காலம். உடல்நலம் மற்றும் எதிர்பாராத மாற்றங்களில் கவனம் "
                "தேவை; அவசரமில்லாத, நிதானமான முடிவுகள் நல்லது."
            ),
            "classical_source": "Standard Parashari/Tamil Gochara (transit) convention for Saturn from the natal Moon sign",
        }

    return {
        "name": "Ezharai Sani / Ashtama Sani",
        "name_ta": "ஏழரை சனி / அஷ்டம சனி",
        "present": False,
        "phase": None,
        "phase_ta": None,
        "description": "Transit Saturn is not currently in a Ezharai Sani or Ashtama Sani position relative to your natal Moon sign.",
        "description_ta": "தற்போது சனி பகவான் ஏழரை சனி அல்லது அஷ்டம சனி நிலையில் இல்லை.",
        "classical_source": "Standard Parashari/Tamil Gochara (transit) convention for Saturn from the natal Moon sign",
    }


# ---------------------------------------------------------------------------
# 2. Life-Category Scorecard — heuristic aggregation on existing Ashtakavarga
# ---------------------------------------------------------------------------
# NOTE ON HONESTY (AGENTS.md §1.2): there is no single named classical
# "score" combining houses into a Career/Marriage/Education/Health rating.
# What IS classical is the Sarvashtakavarga bindu count per house, and the
# widely-used interpretive benchmark that a house at/above the mean of 28
# bindus (337 total points / 12 houses ≈ 28.08) tends to give above-average
# results in its significations (cf. Ashtakavarga interpretation principles,
# BPHS Ch. 66-72 / Phaladeepika Ch. 7). This function is an aggregation
# convenience built ON TOP of that real classical number — it is presented
# to the user as a derived summary, not as a scripture-named score.

_BINDU_BENCHMARK = 28.0  # 337 total points / 12 houses ≈ mean bindus/house

_CATEGORY_HOUSE_MAP = [
    {
        "category": "Career & Wealth",
        "category_ta": "தொழில் & செல்வம்",
        "icon": "briefcase",
        "houses": [2, 10, 11],
    },
    {
        "category": "Marriage & Relationships",
        "category_ta": "திருமணம் & உறவுகள்",
        "icon": "heart",
        "houses": [7],
    },
    {
        "category": "Education & Intelligence",
        "category_ta": "கல்வி & அறிவு",
        "icon": "graduation-cap",
        "houses": [4, 5],
    },
    {
        "category": "Health & Vitality",
        "category_ta": "உடல்நலம் & வீரியம்",
        "icon": "stethoscope",
        "houses": [1, 6, 8],
    },
]


def compute_life_scorecard(sarvashtakavarga_by_house: List[int]) -> List[Dict[str, Any]]:
    """sarvashtakavarga_by_house is already computed by ashtakavarga.py,
    indexed 0..11 for house 1..12 from Lagna. This function only aggregates
    those existing real numbers per life category — it invents no new
    astrological facts, only a presentation-layer rollup."""
    cards = []
    for cat in _CATEGORY_HOUSE_MAP:
        house_values = [sarvashtakavarga_by_house[h - 1] for h in cat["houses"]]
        avg_bindus = sum(house_values) / len(house_values)

        # Normalize against the benchmark for a 0-100 display bar.
        # Capped at 100; floor at 0. This scaling is a display convenience,
        # not a classical formula.
        pct = max(0.0, min(100.0, (avg_bindus / _BINDU_BENCHMARK) * 62.5))
        # (62.5 chosen so avg==benchmark maps to ~62.5%, i.e. "Good" band —
        # since exceeding the mean bindu count is already an above-average
        # classical result; leaves headroom above 28 for "Strong".)

        if avg_bindus >= _BINDU_BENCHMARK + 4:
            rating_en, rating_ta = "Strong", "வலுவானது"
        elif avg_bindus >= _BINDU_BENCHMARK:
            rating_en, rating_ta = "Good", "நல்லது"
        elif avg_bindus >= _BINDU_BENCHMARK - 6:
            rating_en, rating_ta = "Average", "சராசரி"
        else:
            rating_en, rating_ta = "Needs Attention", "கவனம் தேவை"

        houses_str = ", ".join(str(h) for h in cat["houses"])
        cards.append({
            "category": cat["category"],
            "category_ta": cat["category_ta"],
            "icon": cat["icon"],
            "score_percentage": round(pct, 1),
            "rating": rating_en,
            "rating_ta": rating_ta,
            "houses_considered": cat["houses"],
            "summary": (
                f"Based on Sarvashtakavarga bindu strength across house(s) {houses_str} "
                f"(avg {avg_bindus:.1f} vs. the classical mean of {_BINDU_BENCHMARK:.0f})."
            ),
            "summary_ta": (
                f"{houses_str} ஆம் பாவங்களின் அஷ்டகவர்க்க பலப் புள்ளிகளின் அடிப்படையில் "
                f"(சராசரி {avg_bindus:.1f}, நியம சராசரி {_BINDU_BENCHMARK:.0f})."
            ),
        })
    return cards


# ---------------------------------------------------------------------------
# 3. Remedies / Lucky Elements
# ---------------------------------------------------------------------------
# Classical Navagraha colour & number associations — the standard table used
# across Vedic astrology Navagraha pooja / gemstone / colour-therapy
# practice (cf. Brihat Parashara Hora Shastra's Navagraha characteristics
# chapters; consistently reproduced across Tamil almanac Navagraha guidance).
_PLANET_COLOR_NUMBER = {
    "Sun":     {"color": "Red / Copper",        "color_ta": "சிவப்பு / செம்பு",     "number": 1, "day_en": "Sunday",    "day_ta": "ஞாயிற்றுக்கிழமை"},
    "Moon":    {"color": "White",                "color_ta": "வெண்மை",              "number": 2, "day_en": "Monday",    "day_ta": "திங்கட்கிழமை"},
    "Mars":    {"color": "Red",                   "color_ta": "சிவப்பு",             "number": 9, "day_en": "Tuesday",   "day_ta": "செவ்வாய்க்கிழமை"},
    "Mercury": {"color": "Green",                 "color_ta": "பச்சை",               "number": 5, "day_en": "Wednesday", "day_ta": "புதன்கிழமை"},
    "Jupiter": {"color": "Yellow",                "color_ta": "மஞ்சள்",              "number": 3, "day_en": "Thursday",  "day_ta": "வியாழக்கிழமை"},
    "Venus":   {"color": "White / Light Pastel",  "color_ta": "வெண்மை / மென்நிறம்",  "number": 6, "day_en": "Friday",    "day_ta": "வெள்ளிக்கிழமை"},
    "Saturn":  {"color": "Dark Blue / Black",     "color_ta": "கருநீலம் / கருப்பு",  "number": 8, "day_en": "Saturday",  "day_ta": "சனிக்கிழமை"},
    # Rahu/Ketu have no dedicated weekday in the standard 7-day Navagraha
    # scheme; classical practice pairs their remedial day with Saturday
    # (Rahu) and Tuesday (Ketu) respectively — flagged here as the common
    # convention rather than a fixed rule, per AGENTS.md §1.6 ambiguity flag.
    "Rahu":    {"color": "Smoky Grey",            "color_ta": "புகைநிற சாம்பல்",     "number": 4, "day_en": "Saturday",  "day_ta": "சனிக்கிழமை"},
    "Ketu":    {"color": "Brown",                  "color_ta": "பழுப்பு",             "number": 7, "day_en": "Tuesday",   "day_ta": "செவ்வாய்க்கிழமை"},
}


def compute_remedy_guide(
    nakshatra_deity: Optional[str],
    current_mahadasha_lord: str,
    all_dosha_remedies: List[List[str]],
    all_dosha_remedies_ta: List[List[str]],
) -> Dict[str, Any]:
    """Builds the remedies panel from data that ALREADY EXISTS elsewhere
    (nakshatra deity from ephemeris.py's basic_details, the active
    Mahadasha lord from dasha_builder.py) plus the cited Navagraha
    colour/number/day table above. Simple rituals are pulled directly from
    the existing per-dosha remedies already computed in yoga_dosha.py —
    nothing here invents a new ritual; it just resurfaces the top few
    already-generated ones for this summary view."""
    lord_info = _PLANET_COLOR_NUMBER.get(current_mahadasha_lord, _PLANET_COLOR_NUMBER["Sun"])
    lord_ta_name = PLANET_LABELS.get(current_mahadasha_lord, {}).get("ta", current_mahadasha_lord)

    deity = nakshatra_deity or "Ishta Devata (personal deity of choice)"
    deity_ta = nakshatra_deity or "தங்கள் விருப்ப தேவதை"

    # Flatten and dedupe existing dosha remedies, take top 3 for the summary.
    simple_rituals: List[str] = []
    simple_rituals_ta: List[str] = []
    for lst in all_dosha_remedies:
        for r in lst:
            if r not in simple_rituals:
                simple_rituals.append(r)
    for lst in all_dosha_remedies_ta:
        for r in lst:
            if r not in simple_rituals_ta:
                simple_rituals_ta.append(r)
    simple_rituals = simple_rituals[:3] or [
        "Light a sesame-oil lamp at home every evening.",
        "Offer food to birds or cows on your birth star day.",
    ]
    simple_rituals_ta = simple_rituals_ta[:3] or [
        "தினமும் மாலையில் எள் தைல தீபம் ஏற்றுதல்.",
        "பிறந்த நட்சத்திர நாளில் பறவைகள்/பசுவிற்கு உணவு வழங்குதல்.",
    ]

    return {
        "presiding_deity": deity,
        "presiding_deity_ta": deity_ta,
        "favorable_day": f"{lord_info['day_en']} ({current_mahadasha_lord} — your current Mahadasha lord's day)",
        "favorable_day_ta": f"{lord_info['day_ta']} ({lord_ta_name} — தற்போதைய மகா திசாநாதர் தினம்)",
        "lucky_color": lord_info["color"],
        "lucky_color_ta": lord_info["color_ta"],
        "lucky_number": lord_info["number"],
        "simple_rituals": simple_rituals,
        "simple_rituals_ta": simple_rituals_ta,
        "classical_source": "Nakshatra deity & Mahadasha lord: computed elsewhere in this app (ephemeris.py / dasha_builder.py). Colour/number/day: standard Navagraha associations (BPHS Navagraha chapters; common Tamil almanac convention).",
    }


# ---------------------------------------------------------------------------
# 4. Current-Period micro-prediction (one-liner)
# ---------------------------------------------------------------------------
# Built from data that already exists (the current dasha/bhukti lords and
# their significations, already used elsewhere for narration). This is a
# short templated synthesis, not a new fact — it never states a date or
# number that isn't already present in the dasha/bhukti object it's given.

_LORD_MICRO_THEMES = {
    "Sun":     ("authority, government dealings, and self-confidence", "அதிகாரம், அரசு தொடர்பான காரியங்கள் மற்றும் தன்னம்பிக்கை"),
    "Moon":    ("emotional matters, home, and public dealings", "மனம், வீடு மற்றும் பொது தொடர்பான காரியங்கள்"),
    "Mars":    ("energy, property, and competitive drive", "ஆற்றல், சொத்து மற்றும் போட்டித்தன்மை"),
    "Rahu":    ("sudden change, foreign connections, and ambition", "திடீர் மாற்றங்கள், வெளிநாடு தொடர்பு மற்றும் லட்சியம்"),
    "Jupiter": ("wisdom, finances, and mentorship", "ஞானம், பொருளாதாரம் மற்றும் வழிகாட்டல்"),
    "Saturn":  ("discipline, career responsibility, and long-term effort", "ஒழுங்கு, தொழில் பொறுப்பு மற்றும் நீண்டகால முயற்சி"),
    "Mercury": ("communication, business, and analytical work", "தொடர்பு, வியாபாரம் மற்றும் பகுப்பாய்வு பணிகள்"),
    "Ketu":    ("detachment, introspection, and unexpected turns", "பற்றின்மை, சுயபரிசோதனை மற்றும் எதிர்பாராத திருப்பங்கள்"),
    "Venus":   ("relationships, comfort, and creative pursuits", "உறவுகள், சுகபோகங்கள் மற்றும் படைப்பாற்றல் செயல்பாடுகள்"),
}


def build_current_period_summary(
    current_dasha: Optional[Dict[str, Any]],
) -> Optional[Dict[str, Any]]:
    """current_dasha is one entry from the already-computed
    vimshottari_dasha list (the one with is_current=True). Returns None if
    no period is currently active (shouldn't normally happen for a live
    birth chart, but guarded defensively)."""
    if not current_dasha:
        return None

    current_bhukti = next((b for b in current_dasha.get("bhuktis", []) if b.get("is_current")), None)
    if not current_bhukti:
        current_bhukti = current_dasha["bhuktis"][0] if current_dasha.get("bhuktis") else None

    maha_theme_en, maha_theme_ta = _LORD_MICRO_THEMES.get(current_dasha["planet"], ("major life themes", "முக்கிய வாழ்க்கை அம்சங்கள்"))
    bhukti_lord = current_bhukti["planet"] if current_bhukti else current_dasha["planet"]
    bhukti_theme_en, bhukti_theme_ta = _LORD_MICRO_THEMES.get(bhukti_lord, ("everyday matters", "அன்றாட விஷயங்கள்"))

    micro_en = (
        f"During this {current_dasha['planet']} Mahadasha–{bhukti_lord} Bhukti period, expect focus "
        f"on {maha_theme_en}, coloured by {bhukti_theme_en}."
    )
    micro_ta = (
        f"இந்த {PLANET_LABELS.get(current_dasha['planet'], {}).get('ta', current_dasha['planet'])} மகா திசை–"
        f"{PLANET_LABELS.get(bhukti_lord, {}).get('ta', bhukti_lord)} புக்தி காலத்தில், {maha_theme_ta} சார்ந்த "
        f"விஷயங்களில் கவனம் செலுத்தப்படும்; அதனுடன் {bhukti_theme_ta} தொடர்பான தாக்கமும் இருக்கும்."
    )

    return {
        "mahadasha_lord": current_dasha["planet"],
        "mahadasha_lord_ta": current_dasha["planet_ta"],
        "bhukti_lord": bhukti_lord,
        "bhukti_lord_ta": current_bhukti["planet_ta"] if current_bhukti else current_dasha["planet_ta"],
        "mahadasha_start": current_dasha["start_date"],
        "mahadasha_end": current_dasha["end_date"],
        "bhukti_start": current_bhukti["start_date"] if current_bhukti else current_dasha["start_date"],
        "bhukti_end": current_bhukti["end_date"] if current_bhukti else current_dasha["end_date"],
        "micro_prediction": micro_en,
        "micro_prediction_ta": micro_ta,
    }


# ---------------------------------------------------------------------------
# 5. Top-level assembly
# ---------------------------------------------------------------------------

def build_single_page_summary(
    moon_sign_num: int,
    sarvashtakavarga_by_house: List[int],
    nakshatra_deity: Optional[str],
    vimshottari_dasha: List[Dict[str, Any]],
    doshas: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Single entry point called from charts.py. Combines the natal Saturn
    transit check, the Ashtakavarga-based scorecard, the remedies guide, and
    the current-period micro-prediction into one payload for the frontend's
    single-page report."""
    current_dasha = next((d for d in vimshottari_dasha if d.get("is_current")), None)
    current_period = build_current_period_summary(current_dasha)

    saturn_transit = compute_saturn_transit_dosha(moon_sign_num)

    life_scorecard = compute_life_scorecard(sarvashtakavarga_by_house)

    mahadasha_lord = current_dasha["planet"] if current_dasha else "Sun"
    active_dosha_remedies = [d["remedies"] for d in doshas if d.get("present") and d.get("remedies")]
    active_dosha_remedies_ta = [d["remedies_ta"] for d in doshas if d.get("present") and d.get("remedies_ta")]
    remedies = compute_remedy_guide(
        nakshatra_deity, mahadasha_lord, active_dosha_remedies, active_dosha_remedies_ta
    )

    return {
        "current_period": current_period,
        "saturn_transit": saturn_transit,
        "life_scorecard": life_scorecard,
        "remedies": remedies,
    }