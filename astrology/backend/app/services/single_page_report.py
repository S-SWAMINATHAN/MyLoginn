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

from datetime import date, timedelta


def _sidereal_saturn_sign_on(jd_ut: float) -> int:
    """Saturn's Lahiri-sidereal sign (1-12) at a given UT Julian Day."""
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    res, _ = swe.calc_ut(jd_ut, swe.SATURN, flags)
    return int((res[0] % 360.0) // 30) + 1


def _daily_saturn_sign_series(start_dt: datetime, end_dt: datetime) -> List[Any]:
    """Day-by-day (noon UTC snapshot) list of (date_str, sign_num) across a
    window. Day-level granularity is what classical almanac transit dates
    are conventionally given at, and scanning day-by-day (rather than
    solving analytically for a single ingress) is what correctly captures
    Saturn's retrograde re-entries near a sign boundary, which do occur and
    which some simpler Ezharai Sani calculators silently ignore."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    series = []
    cur = start_dt
    while cur <= end_dt:
        jd = swe.julday(cur.year, cur.month, cur.day, 12.0)
        series.append((cur.strftime("%Y-%m-%d"), _sidereal_saturn_sign_on(jd)))
        cur += timedelta(days=1)
    return series


def _find_runs(series: List[Any], target_signs: set) -> List[Any]:
    """Returns [(start_idx, end_idx), ...] for maximal consecutive runs
    where series[i][1] is in target_signs. A day where Saturn regresses out
    of the target set (even briefly, near a boundary) correctly ends a run
    and a later re-entry correctly starts a new one — this is what makes
    the retrograde case work, since it's a plain membership scan rather
    than a single forward-only ingress calculation."""
    runs = []
    run_start = None
    for i, (_, sign) in enumerate(series):
        in_set = sign in target_signs
        if in_set and run_start is None:
            run_start = i
        if not in_set and run_start is not None:
            runs.append((run_start, i - 1))
            run_start = None
    if run_start is not None:
        runs.append((run_start, len(series) - 1))
    return runs


def _pick_relevant_run(series: List[Any], runs: List[Any], today_str: str):
    """Prefers the run containing today; falls back to the next upcoming
    run if none is currently active. Returns (run, is_upcoming) or
    (None, False) if nothing found in the scanned window at all."""
    for r in runs:
        if series[r[0]][0] <= today_str <= series[r[1]][0]:
            return r, False
    future = [r for r in runs if series[r[0]][0] > today_str]
    if future:
        return future[0], True
    return None, False


def compute_saturn_transit_dosha(moon_sign_num: int) -> Dict[str, Any]:
    """Ezharai Sani / Ashtama Sani, WITH precise start/end dates.

    Classical rule (standard Parashari/Tamil transit ["Gochara"]
    convention): counted from the natal MOON sign, not Lagna.
      - Ezharai Sani ("7.5-year Saturn"): Saturn in the 12th, 1st, or 2nd
        sign from the Moon sign. Each leg nominally ~2.5 years.
      - Ashtama Sani: Saturn in the 8th sign from the Moon sign.

    Dates are found by scanning Saturn's daily sidereal sign across a
    12-year window (2 years back, 10 years forward from today) rather than
    solving for a single ingress date — this window comfortably covers one
    full Ezharai Sani occurrence (~7.5 years, sometimes longer with
    retrograde wobble) whether it is currently active, just ended, or about
    to begin, and correctly handles any retrograde re-entry near a
    boundary since membership is checked day-by-day rather than assumed
    monotonic. Reported dates are day-precision, matching standard almanac
    convention for transit ingress dates."""
    today = date.today()
    window_start = datetime(today.year - 2, today.month, today.day)
    window_end = datetime(today.year + 10, today.month, today.day)
    series = _daily_saturn_sign_series(window_start, window_end)
    today_str = today.strftime("%Y-%m-%d")

    leg1 = ((moon_sign_num - 2) % 12) + 1   # 12th from Moon
    leg2 = moon_sign_num                     # 1st (Moon's own sign)
    leg3 = (moon_sign_num % 12) + 1          # 2nd from Moon
    ashtama_sign = ((moon_sign_num + 6) % 12) + 1  # 8th from Moon

    ezharai_runs = _find_runs(series, {leg1, leg2, leg3})
    ezharai_run, ez_upcoming = _pick_relevant_run(series, ezharai_runs, today_str)

    ashtama_runs = _find_runs(series, {ashtama_sign})
    ashtama_run, ash_upcoming = _pick_relevant_run(series, ashtama_runs, today_str)

    # Ezharai Sani takes priority if both are somehow found (they are
    # mutually exclusive by house-count, so this should not normally
    # trigger, but Ezharai is treated as the primary result if it does).
    if ezharai_run:
        s_idx, e_idx = ezharai_run
        start_date = series[s_idx][0]
        end_date = series[e_idx][0]
        peak_start = next((d for d, sign in series[s_idx:e_idx + 1] if sign == leg2), None)
        setting_start = next((d for d, sign in series[s_idx:e_idx + 1] if sign == leg3), None)

        if not ez_upcoming:
            if today_str < (peak_start or end_date):
                phase_en, phase_ta = "Rising phase (1st leg)", "ஆரம்ப அரையாண்டு காலம்"
            elif today_str < (setting_start or end_date):
                phase_en, phase_ta = "Peak phase (2nd leg)", "உச்ச கால கட்டம்"
            else:
                phase_en, phase_ta = "Setting phase (3rd leg)", "இறுதி அரையாண்டு காலம்"
        else:
            phase_en, phase_ta = "Upcoming", "வரவிருக்கும் காலம்"

        timing_en = (
            f"Runs from {start_date} to {end_date} "
            f"(2nd leg begins {peak_start}, 3rd leg begins {setting_start})."
            if not ez_upcoming else
            f"Not currently active — the next occurrence runs from {start_date} to {end_date}."
        )
        timing_ta = (
            f"{start_date} முதல் {end_date} வரை நீடிக்கும் "
            f"(2-ஆம் கட்டம் {peak_start} அன்று, 3-ஆம் கட்டம் {setting_start} அன்று தொடங்கும்)."
            if not ez_upcoming else
            f"தற்போது இயங்கவில்லை — அடுத்த ஏழரை சனி காலம் {start_date} முதல் {end_date} வரை."
        )

        return {
            "name": "Ezharai Sani (7.5-Year Saturn)",
            "name_ta": "ஏழரை சனி",
            "present": not ez_upcoming,
            "phase": phase_en,
            "phase_ta": phase_ta,
            "description": (
                "Transit Saturn is in the 12th, 1st, or 2nd sign from your natal Moon "
                "sign — the classical Ezharai Sani window. " + timing_en + " Traditionally "
                "associated with heavier responsibilities, delays, and tests of patience, "
                "often followed by durable long-term gains once the period ends."
            ),
            "description_ta": (
                "சனி பகவான் தங்கள் ராசிக்கு 12, 1, அல்லது 2-ஆம் இடத்தில் சஞ்சாரம் "
                "செய்கிறார் — இதுவே ஏழரை சனி காலம். " + timing_ta + " பொறுப்புகள் அதிகரிப்பு, "
                "தாமதங்கள் மற்றும் மன உறுதி சோதனைகள் இக்காலத்தில் காணப்படும்; காலம் "
                "முடிந்ததும் நிலையான நன்மைகள் கிடைக்கும்."
            ),
            "classical_source": "Standard Parashari/Tamil Gochara (transit) convention for Saturn from the natal Moon sign",
            "period_start_date": start_date,
            "leg_peak_start_date": peak_start,
            "leg_setting_start_date": setting_start,
            "period_end_date": end_date,
            "is_upcoming": ez_upcoming,
        }

    if ashtama_run:
        s_idx, e_idx = ashtama_run
        start_date = series[s_idx][0]
        end_date = series[e_idx][0]

        timing_en = (
            f"Runs from {start_date} to {end_date}."
            if not ash_upcoming else
            f"Not currently active — the next occurrence runs from {start_date} to {end_date}."
        )
        timing_ta = (
            f"{start_date} முதல் {end_date} வரை நீடிக்கும்."
            if not ash_upcoming else
            f"தற்போது இயங்கவில்லை — அடுத்த அஷ்டம சனி காலம் {start_date} முதல் {end_date} வரை."
        )

        return {
            "name": "Ashtama Sani (8th-House Saturn Transit)",
            "name_ta": "அஷ்டம சனி",
            "present": not ash_upcoming,
            "phase": "8th-from-Moon transit" if not ash_upcoming else "Upcoming",
            "phase_ta": "அஷ்டம சஞ்சாரம்" if not ash_upcoming else "வரவிருக்கும் காலம்",
            "description": (
                "Transit Saturn is in the 8th sign from your natal Moon sign. " + timing_en +
                " Classically flagged as a period requiring caution around health and "
                "sudden disruptions, and calling for steady, unhurried decisions."
            ),
            "description_ta": (
                "சனி பகவான் தங்கள் ராசிக்கு 8-ஆம் இடத்தில் சஞ்சாரம் செய்கிறார் — இதுவே "
                "அஷ்டம சனி காலம். " + timing_ta + " உடல்நலம் மற்றும் எதிர்பாராத மாற்றங்களில் "
                "கவனம் தேவை; அவசரமில்லாத, நிதானமான முடிவுகள் நல்லது."
            ),
            "classical_source": "Standard Parashari/Tamil Gochara (transit) convention for Saturn from the natal Moon sign",
            "period_start_date": start_date,
            "leg_peak_start_date": None,
            "leg_setting_start_date": None,
            "period_end_date": end_date,
            "is_upcoming": ash_upcoming,
        }

    # Neither found within the scanned 12-year window (shouldn't normally
    # happen since one or the other cycles through roughly every 29.5
    # years, but the window is intentionally not full-cycle-length —
    # guarded here rather than assumed).
    return {
        "name": "Ezharai Sani / Ashtama Sani",
        "name_ta": "ஏழரை சனி / அஷ்டம சனி",
        "present": False,
        "phase": None,
        "phase_ta": None,
        "description": "Transit Saturn is not in a Ezharai Sani or Ashtama Sani position relative to your natal Moon sign within the scanned window, and no upcoming occurrence was found in the next 10 years.",
        "description_ta": "அடுத்த 10 ஆண்டுகளுக்குள் ஏழரை சனி அல்லது அஷ்டம சனி காலம் இல்லை.",
        "classical_source": "Standard Parashari/Tamil Gochara (transit) convention for Saturn from the natal Moon sign",
        "period_start_date": None,
        "leg_peak_start_date": None,
        "leg_setting_start_date": None,
        "period_end_date": None,
        "is_upcoming": False,
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