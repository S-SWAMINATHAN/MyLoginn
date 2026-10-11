"""
Vimshottari Dasha / Bhukti / Antharam timeline — Kalai Magal (KKC Astro) parity.

Method (reverse-verified against a Kalai Magal "Type D" computation report:
all 73 dasa-bhukti end dates and the antharam dates reproduce exactly):

1. Balance at birth
   balance_years = (unelapsed arc of Moon's nakshatra / 13°20') x lord_years.

2. Every period end is anchored to the BIRTH DATE, not chained from the
   previous period.
   cumulative_years = balance_years + sum of every later period up to this end
   months           = cumulative_years x 12
   Y = floor(months / 12),  M = floor(months mod 12),
   D = floor(frac(months) x 30)                 (30-day month convention)

3. end_date = birth_date + Y years + M months + D days, where the day sum
   uses a 30-day carry:
       day = birth_day + D
       while day >= 30: day -= 30; month += 1
       if day == 0: day = 1
   then it is clamped to the real calendar month length.

4. Age printed beside each end date = calendar difference birth -> end date
   with a 30-day borrow.

5. The first (running) dasa lists only the bhuktis and antharams that end
   after birth. The first running sub-period starts at birth.

Period lengths are classical Vimshottari (BPHS 46): bhukti = D x B / 120 years,
antharam = D x B x A / 14400 years.
"""

from __future__ import annotations

import calendar
import math
from datetime import date, datetime
from typing import Any, Dict, List, Tuple

from backend.app.services.tamil_labels import PLANET_LABELS

DASHA_LORDS: List[Tuple[str, int]] = [
    ("Ketu", 7),
    ("Venus", 20),
    ("Sun", 6),
    ("Moon", 10),
    ("Mars", 7),
    ("Rahu", 18),
    ("Jupiter", 16),
    ("Saturn", 19),
    ("Mercury", 17),
]

NAK_SPAN = 360.0 / 27.0
TOTAL_CYCLE_YEARS = 120.0


# --------------------------------------------------------------------------
# Kalai Magal date arithmetic
# --------------------------------------------------------------------------
def years_to_ymd(years: float) -> Tuple[int, int, int]:
    """Fractional years -> (Y, M, D) using 12 months x 30 days, floored."""
    months = years * 12.0 + 1e-9
    y = int(months // 12)
    m = int(months % 12)
    d = int((months - math.floor(months)) * 30.0 + 1e-9)
    return y, m, d


def kalai_add_ymd(base: date, y: int, m: int, d: int) -> date:
    """Adds (y, m, d) to a date with Kalai Magal's 30-day day-carry rule."""
    year = base.year + y
    month = base.month + m
    day = base.day + d
    while day >= 30:
        day -= 30
        month += 1
    if day == 0:
        day = 1
    while month > 12:
        month -= 12
        year += 1
    last = calendar.monthrange(year, month)[1]
    if day > last:
        day -= last
        month += 1
        if month > 12:
            month = 1
            year += 1
    return date(year, month, day)


def kalai_age(birth: date, end: date) -> Tuple[int, int, int]:
    """Age printed beside a period end: calendar difference with a 30-day
    borrow (e.g. 04-04-1998 -> 01-06-2006 = 8 y 1 m 27 d, as Kalai prints)."""
    y = end.year - birth.year
    m = end.month - birth.month
    d = end.day - birth.day
    if d < 0:
        d += 30
        m -= 1
    if m < 0:
        m += 12
        y -= 1
    return y, m, d


def date_after_birth(birth: date, cumulative_years: float) -> Tuple[date, Tuple[int, int, int]]:
    end = kalai_add_ymd(birth, *years_to_ymd(cumulative_years))
    return end, kalai_age(birth, end)


def _label(planet: str) -> str:
    return PLANET_LABELS.get(planet, {}).get("ta", planet)


def get_starting_dasha_idx(nakshatra_number: int) -> int:
    """Nakshatra (1-27) -> starting index in DASHA_LORDS."""
    return (nakshatra_number - 1) % 9


def _balance(moon_total_deg: float) -> Tuple[int, float, float]:
    moon = moon_total_deg % 360.0
    nak_number = int(moon // NAK_SPAN) + 1
    remaining_fraction = (NAK_SPAN - (moon % NAK_SPAN)) / NAK_SPAN
    start_idx = get_starting_dasha_idx(nak_number)
    lord_years = DASHA_LORDS[start_idx][1]
    return start_idx, remaining_fraction * lord_years, remaining_fraction


def calculate_dasha_balance(moon_total_deg: float) -> Dict[str, Any]:
    """Dasa balance at birth in Kalai Magal's Y/M/D (30-day month) format."""
    start_idx, balance_years, _ = _balance(moon_total_deg)
    lord = DASHA_LORDS[start_idx][0]
    lord_ta = _label(lord)
    y, m, d = years_to_ymd(balance_years)
    return {
        "lord": lord,
        "lord_ta": lord_ta,
        "years": y,
        "months": m,
        "days": d,
        "total_years": round(balance_years, 6),
        "formatted_ta": f"{lord_ta} மகா திசை — {y} ஆண்டுகள், {m} மாதங்கள், {d} நாட்கள்",
        "formatted_en": f"{lord} Mahadasha — {y} years, {m} months, {d} days",
        # Kalai Magal print format
        "kalai_ta": f"ஜனன கால தசை இருப்பு {lord_ta} {y} வருடம் {m} மாதம் {d} நாள்",
    }


def _parse_birth(dob_str: str) -> date:
    return datetime.strptime(dob_str, "%Y-%m-%d").date()


def _fmt(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def _fmt_display(d: date) -> str:
    return d.strftime("%d-%m-%Y")


def calculate_vimshottari_dasha(
    moon_total_deg: float,
    dob_str: str,
    tob_str: str = "00:00:00",
    cycles: int = 1,
) -> List[Dict[str, Any]]:
    """
    Complete Vimshottari timeline (9 dasas per cycle) with bhuktis and antharams.

    The output keeps the existing schema (planet, planet_ta, start_date,
    end_date, duration_years, is_current, bhuktis[], antardashas[]). Kalai
    fields are added: end_date_display, age_ymd, running_at_birth.
    """
    birth = _parse_birth(dob_str)
    today = date.today()
    start_idx, balance_years, _ = _balance(moon_total_deg)
    first_lord_years = DASHA_LORDS[start_idx][1]
    elapsed_first = first_lord_years - balance_years

    # Signed years from birth: negative = before birth.
    # The first dasa theoretically started at -elapsed_first.
    offset = -elapsed_first
    dashas: List[Dict[str, Any]] = []

    for k in range(9 * max(1, cycles)):
        d_idx = (start_idx + k) % 9
        d_lord, d_years = DASHA_LORDS[d_idx]
        d_start_off = offset
        d_end_off = offset + d_years
        offset = d_end_off

        d_start_date = birth if d_start_off <= 0 else date_after_birth(birth, d_start_off)[0]
        d_end_date, d_age = date_after_birth(birth, d_end_off)

        bhuktis: List[Dict[str, Any]] = []
        b_off = d_start_off
        for bj in range(9):
            b_idx = (d_idx + bj) % 9
            b_lord, b_lord_years = DASHA_LORDS[b_idx]
            b_len = d_years * b_lord_years / TOTAL_CYCLE_YEARS
            b_start_off, b_end_off = b_off, b_off + b_len
            b_off = b_end_off
            if b_end_off <= 1e-9:
                continue  # fully elapsed before birth — Kalai omits it

            b_start_date = birth if b_start_off <= 0 else date_after_birth(birth, b_start_off)[0]
            b_end_date, b_age = date_after_birth(birth, b_end_off)

            antharams: List[Dict[str, Any]] = []
            a_off = b_start_off
            for aj in range(9):
                a_idx = (b_idx + aj) % 9
                a_lord, a_lord_years = DASHA_LORDS[a_idx]
                a_len = b_len * a_lord_years / TOTAL_CYCLE_YEARS
                a_start_off, a_end_off = a_off, a_off + a_len
                a_off = a_end_off
                if a_end_off <= 1e-9:
                    continue
                a_start_date = birth if a_start_off <= 0 else date_after_birth(birth, a_start_off)[0]
                a_end_date, a_age = date_after_birth(birth, a_end_off)
                antharams.append({
                    "planet": a_lord,
                    "planet_ta": _label(a_lord),
                    "start_date": _fmt(a_start_date),
                    "end_date": _fmt(a_end_date),
                    "end_date_display": _fmt_display(a_end_date),
                    "age_ymd": list(a_age),
                    "duration_years": round(a_len, 4),
                    "running_at_birth": a_start_off < 0,
                    "is_current": a_start_date <= today < a_end_date,
                })

            bhuktis.append({
                "planet": b_lord,
                "planet_ta": _label(b_lord),
                "start_date": _fmt(b_start_date),
                "end_date": _fmt(b_end_date),
                "end_date_display": _fmt_display(b_end_date),
                "age_ymd": list(b_age),
                "duration_years": round(b_len, 4),
                "running_at_birth": b_start_off < 0,
                "is_current": b_start_date <= today < b_end_date,
                "antardashas": antharams,
            })

        dashas.append({
            "planet": d_lord,
            "planet_ta": _label(d_lord),
            "lord_years": d_years,
            "start_date": _fmt(d_start_date),
            "end_date": _fmt(d_end_date),
            "start_date_display": _fmt_display(d_start_date),
            "end_date_display": _fmt_display(d_end_date),
            "age_ymd": list(d_age),
            "duration_years": round(d_end_off - max(d_start_off, 0.0), 4),
            "running_at_birth": d_start_off < 0,
            "is_current": d_start_date <= today < d_end_date,
            "bhuktis": bhuktis,
        })

    return dashas
