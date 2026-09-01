"""
High-Precision Vimshottari Dasha-Bhukti Timeline Generator.
Cites classical Brihat Parashara Hora Shastra (BPHS) Vimshottari Dasha system (120-year cycle).
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from backend.app.services.tamil_labels import PLANET_LABELS

# Standard Vimshottari Dasha Sequence & Durations (in Solar years)
DASHA_LORDS: List[Tuple[str, int]] = [
    ("Ketu", 7),
    ("Venus", 20),
    ("Sun", 6),
    ("Moon", 10),
    ("Mars", 7),
    ("Rahu", 18),
    ("Jupiter", 16),
    ("Saturn", 19),
    ("Mercury", 17)
]

def get_starting_dasha_idx(nakshatra_number: int) -> int:
    """Nakshatra (1-27) to starting Dasha index in DASHA_LORDS."""
    return (nakshatra_number - 1) % 9

def calculate_dasha_balance(moon_total_deg: float) -> Dict[str, Any]:
    """
    Computes exact Dasha balance at birth (ஆண்டுகள், மாதங்கள், நாட்கள்) according to BPHS.
    """
    nak_span = 360.0 / 27.0  # 13.333333333333334 degrees
    nak_number = int(moon_total_deg // nak_span) + 1
    deg_passed_in_nak = moon_total_deg % nak_span
    fraction_remaining = (nak_span - deg_passed_in_nak) / nak_span

    start_idx = get_starting_dasha_idx(nak_number)
    first_lord, first_duration = DASHA_LORDS[start_idx]
    lord_p_label = PLANET_LABELS.get(first_lord, {})
    lord_ta = lord_p_label.get("ta", first_lord)

    balance_float_years = fraction_remaining * first_duration

    y = int(balance_float_years)
    rem_months_float = (balance_float_years - y) * 12.0
    m = int(rem_months_float)
    rem_days_float = (rem_months_float - m) * 30.4375
    d = int(round(rem_days_float))
    if d >= 30:
        d = 0
        m += 1
    if m >= 12:
        m = 0
        y += 1

    formatted_ta = f"{lord_ta} மகா திசை — {y} ஆண்டுகள், {m} மாதங்கள், {d} நாட்கள்"
    formatted_en = f"{first_lord} Mahadasha — {y} years, {m} months, {d} days"

    return {
        "lord": first_lord,
        "lord_ta": lord_ta,
        "years": y,
        "months": m,
        "days": d,
        "total_years": round(balance_float_years, 4),
        "formatted_ta": formatted_ta,
        "formatted_en": formatted_en
    }

def calculate_vimshottari_dasha(
    moon_total_deg: float,
    dob_str: str,
    tob_str: str = "00:00:00"
) -> List[Dict[str, Any]]:
    """
    Computes complete Vimshottari Dasha and Bhukti periods starting from birth date.
    Calculates exact remaining balance of the first Dasha at birth and accurate sub-periods.
    """
    bal = calculate_dasha_balance(moon_total_deg)
    balance_years = bal["total_years"]

    nak_span = 360.0 / 27.0
    nak_number = int(moon_total_deg // nak_span) + 1
    start_idx = get_starting_dasha_idx(nak_number)

    birth_dt = datetime.strptime(f"{dob_str} {tob_str}", "%Y-%m-%d %H:%M:%S")
    now_dt = datetime.now()

    dasha_list = []
    current_dt = birth_dt

    for cycle in range(9):
        lord_idx = (start_idx + cycle) % 9
        lord_name, total_duration = DASHA_LORDS[lord_idx]
        lord_p_label = PLANET_LABELS.get(lord_name, {})

        if cycle == 0:
            duration_for_this = balance_years
        else:
            duration_for_this = float(total_duration)

        end_dt = current_dt + timedelta(days=duration_for_this * 365.2425)

        is_current_dasha = current_dt <= now_dt <= end_dt

        # Compute Bhuktis (Sub-periods) within this major dasha
        bhuktis = []
        bhukti_start_dt = current_dt
        for b_i in range(9):
            b_idx = (lord_idx + b_i) % 9
            b_name, b_total_dur = DASHA_LORDS[b_idx]
            b_p_label = PLANET_LABELS.get(b_name, {})

            # Standard formula: (Major_years * Minor_years) / 120
            nominal_bhukti_years = (total_duration * b_total_dur) / 120.0
            actual_bhukti_years = nominal_bhukti_years * (duration_for_this / total_duration)

            bhukti_end_dt = bhukti_start_dt + timedelta(days=actual_bhukti_years * 365.2425)
            is_current_bhukti = is_current_dasha and (bhukti_start_dt <= now_dt <= bhukti_end_dt)

            bhuktis.append({
                "planet": b_name,
                "planet_ta": b_p_label.get("ta", b_name),
                "start_date": bhukti_start_dt.strftime("%Y-%m-%d"),
                "end_date": bhukti_end_dt.strftime("%Y-%m-%d"),
                "duration_years": round(actual_bhukti_years, 2),
                "is_current": is_current_bhukti
            })
            bhukti_start_dt = bhukti_end_dt

        dasha_list.append({
            "planet": lord_name,
            "planet_ta": lord_p_label.get("ta", lord_name),
            "start_date": current_dt.strftime("%Y-%m-%d"),
            "end_date": end_dt.strftime("%Y-%m-%d"),
            "duration_years": round(duration_for_this, 2),
            "is_current": is_current_dasha,
            "bhuktis": bhuktis
        })

        current_dt = end_dt

    return dasha_list
