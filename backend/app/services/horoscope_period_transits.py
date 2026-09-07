"""
Period-specific transit differentiators for the Rasi Horoscope (Daily /
Weekly / Monthly / Yearly).

ROOT CAUSE THIS FIXES: get_rasi_horoscope() previously called
compute_current_transits() / analyze_gochara() / get_gochara_summary()
with today's date regardless of which period tab was selected. Since
those functions only track slow-moving planets (Saturn, Jupiter, Rahu,
Ketu — per gochara.py's scope), and slow movers don't change sign within
a day, a week, or usually even a month, every period tab showed
byte-identical predictions. That's a credibility bug per AGENTS.md §1,
not a cosmetic one.

THE FIX: layer genuinely period-appropriate FAST-MOVER data on top of the
existing (correct, untouched) slow-mover summary:
  - Daily:   the Moon's transit today — the single most important daily
             influence in classical Tamil daily-horoscope practice
             (Chandra Gochara / Chandrashtama check). Uses the SAME
             Chandrabalam favorable-house rule (3rd/6th/7th/10th/11th from
             the natal Rasi) already cited and used in
             muhurtha_finder.py — not a new invented rule, reused as-is.
  - Weekly:  the Moon's sign path across the 7-day window (Moon moves
             roughly one sign every ~2.25 days, so it typically crosses
             2-3 signs in a week) — genuinely different content from a
             single daily snapshot, not a re-wording of it.
  - Monthly: any Sun/Mercury/Venus/Mars sign-ingress within the ~30-day
             window — these are the only classical grahas whose sign can
             plausibly change within a month. If none change sign, that
             is stated explicitly rather than silently duplicating
             another period's content.
  - Yearly:  intentionally UNCHANGED. This is exactly the timeframe where
             the existing Saturn/Jupiter/Rahu/Ketu slow-transit summary
             is the classically correct focus — nothing was wrong with
             the yearly view's underlying data, only that every other
             period was incorrectly showing the same thing.

All positions are computed via the identical Lahiri-sidereal Swiss
Ephemeris method already used throughout ephemeris.py (swe.SIDM_LAHIRI,
FLG_SIDEREAL | FLG_SWIEPH) — not a new or different methodology.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
import swisseph as swe

_SWE_FAST_PLANETS = {
    "Moon": swe.MOON,
    "Sun": swe.SUN,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
}

# Same cited rule as muhurtha_finder.py's _CHANDRABALAM_FAVORABLE_HOUSES —
# standard Muhurtha Chintamani Chandrabala convention, reused here for the
# Moon's daily/weekly transit read rather than re-derived.
_CHANDRABALAM_FAVORABLE_HOUSES = {3, 6, 7, 10, 11}


def _sidereal_sign_at_noon(date_str: str, planet_id: int) -> int:
    """Sign (1-12) of a planet at noon UTC on the given date — a coarse,
    day-level snapshot appropriate for horoscope-tab granularity (not
    birth-chart precision)."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    jd = swe.julday(dt.year, dt.month, dt.day, 12.0)
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    res, _ = swe.calc_ut(jd, planet_id, flags)
    return int((res[0] % 360.0) // 30) + 1


def get_daily_moon_transit(natal_rasi_num: int, date_str: str) -> Dict[str, Any]:
    moon_sign = _sidereal_sign_at_noon(date_str, swe.MOON)
    house = ((moon_sign - natal_rasi_num) % 12) + 1
    return {
        "moon_sign": moon_sign,
        "house_from_moon_rasi": house,
        "favorable": house in _CHANDRABALAM_FAVORABLE_HOUSES,
        "is_chandrashtama": house == 8,
    }


def get_weekly_moon_path(natal_rasi_num: int, start_date_str: str) -> List[Dict[str, Any]]:
    """The distinct sign segments the Moon occupies across the 7-day
    window starting at start_date_str (only recording a new entry when
    the sign actually changes, so a still Moon-in-one-sign week returns a
    single segment rather than 7 duplicate rows)."""
    start = datetime.strptime(start_date_str, "%Y-%m-%d")
    path: List[Dict[str, Any]] = []
    last_sign = None
    for i in range(7):
        d = start + timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        sign = _sidereal_sign_at_noon(d_str, swe.MOON)
        if sign != last_sign:
            house = ((sign - natal_rasi_num) % 12) + 1
            path.append({
                "date": d_str,
                "moon_sign": sign,
                "house_from_moon_rasi": house,
                "favorable": house in _CHANDRABALAM_FAVORABLE_HOUSES,
            })
            last_sign = sign
    return path


def get_monthly_ingresses(start_date_str: str, days: int = 30) -> List[Dict[str, Any]]:
    """Sun/Mercury/Venus/Mars sign changes within the window. Moon is
    excluded here — it changes sign too often to be a meaningful
    'monthly' event; its movement is already covered by the weekly view."""
    start = datetime.strptime(start_date_str, "%Y-%m-%d")
    last_signs = {
        name: _sidereal_sign_at_noon(start_date_str, pid)
        for name, pid in _SWE_FAST_PLANETS.items() if name != "Moon"
    }
    ingresses: List[Dict[str, Any]] = []
    for i in range(1, days + 1):
        d_str = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        for name, pid in _SWE_FAST_PLANETS.items():
            if name == "Moon":
                continue
            sign = _sidereal_sign_at_noon(d_str, pid)
            if sign != last_signs[name]:
                ingresses.append({"planet": name, "date": d_str, "new_sign": sign})
                last_signs[name] = sign
    return ingresses