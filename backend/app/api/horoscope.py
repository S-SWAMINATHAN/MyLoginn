"""
Horoscope API — Daily/Weekly/Monthly/Yearly Rasi-based Gochara horoscope,
plus a lightweight Rasi-to-Rasi Love Horoscope.

Reuses the existing Gochara transit engine (gochara.py) exactly as it's
used elsewhere in this codebase — no new astronomical computation, no
invented data. See AGENTS.md §1.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend.app.services.gochara import (
    compute_current_transits,
    analyze_gochara,
    get_gochara_summary,
)
from backend.app.services.horoscope_narration import (
    generate_rasi_horoscope_narration,
    PERIOD_LABELS,
)
from backend.app.services.rasi_love_horoscope import compute_rasi_love_horoscope
from backend.app.services.tamil_labels import SIGN_LABELS

router = APIRouter(prefix="/horoscope", tags=["horoscope"])

VALID_PERIODS = {"daily", "weekly", "monthly", "yearly"}


def _reference_date_for_period(period: str) -> str:
    """
    Chooses the reference date whose transit positions represent the
    requested period.

    KNOWN LIMITATION (documented per AGENTS.md §1.2 rather than hidden):
    weekly/monthly/yearly currently use a single snapshot (today's date)
    rather than scanning for a sign-change (ingress) that happens mid-period.
    Slow movers (Saturn/Jupiter/Rahu/Ketu) rarely change sign within a
    single week or month, so this is a reasonable classical approximation
    for those periods, but a Rasi could still see a real mid-period ingress
    this snapshot won't reflect — most likely to matter for the yearly view.
    If exact ingress-date tracking is wanted, backend/app/services/
    single_page_report.py already contains a day-level Saturn-transit
    ingress scanner for the birth-chart flow; the same scanning approach
    could be extended here as a follow-up.
    """
    return datetime.now().strftime("%Y-%m-%d")


@router.get("/{period}/{rasi_number}")
def get_rasi_horoscope(period: str, rasi_number: int):
    if period not in VALID_PERIODS:
        raise HTTPException(
            status_code=400, detail=f"period must be one of {sorted(VALID_PERIODS)}"
        )
    if rasi_number < 1 or rasi_number > 12:
        raise HTTPException(status_code=400, detail="rasi_number must be 1-12")

    ref_date = _reference_date_for_period(period)
    transits = compute_current_transits(date_str=ref_date)
    gochara_results = analyze_gochara(
        natal_moon_sign=rasi_number, natal_bav=None, transit_planets=transits
    )
    summary = get_gochara_summary(gochara_results)

    sign_info = SIGN_LABELS[rasi_number]
    period_en, period_ta = PERIOD_LABELS.get(period, ("Today", "இன்றைய"))

    narration_ta, narration_en = generate_rasi_horoscope_narration(
        sign_info["ta"], sign_info["sa"], period, summary, summary["key_slow_planet_transits"]
    )

    return {
        "rasi_number": rasi_number,
        "rasi": sign_info["sa"],
        "rasi_ta": sign_info["ta"],
        "period": period,
        "period_label": period_en,
        "period_label_ta": period_ta,
        "reference_date": ref_date,
        "overall_assessment": summary["overall_assessment"],
        "overall_assessment_ta": summary["overall_assessment_ta"],
        "benefic_transits": summary["benefic_transits"],
        "challenging_transits": summary["challenging_transits"],
        "vedha_cancellations": summary["vedha_cancellations"],
        "key_transits": summary["key_slow_planet_transits"],
        "narration": narration_en,
        "narration_ta": narration_ta,
        "classical_source": summary["classical_source"],
    }


@router.get("/love/{rasi1}/{rasi2}")
def get_rasi_love_horoscope(rasi1: int, rasi2: int):
    if not (1 <= rasi1 <= 12) or not (1 <= rasi2 <= 12):
        raise HTTPException(status_code=400, detail="rasi numbers must be 1-12")
    return compute_rasi_love_horoscope(rasi1, rasi2)