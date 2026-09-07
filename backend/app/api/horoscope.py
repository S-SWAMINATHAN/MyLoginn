"""
Horoscope API — Daily/Weekly/Monthly/Yearly Rasi-based Gochara horoscope,
plus a lightweight Rasi-to-Rasi Love Horoscope.

Reuses the existing Gochara transit engine (gochara.py) exactly as it's
used elsewhere in this codebase for the slow-mover (Saturn/Jupiter/Rahu/
Ketu) summary — no change to that engine. On top of it, this file adds
genuinely period-appropriate fast-mover data via
horoscope_period_transits.py so Daily/Weekly/Monthly/Yearly no longer
show identical content (see that file's module docstring for the full
root-cause explanation and citations). See AGENTS.md §1.
"""

from datetime import datetime, timedelta
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
from backend.app.services.horoscope_period_transits import (
    get_daily_moon_transit,
    get_weekly_moon_path,
    get_monthly_ingresses,
)
from backend.app.services.horoscope_categories import build_categorized_horoscope
from backend.app.services.rasi_love_horoscope import compute_rasi_love_horoscope
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

router = APIRouter(prefix="/horoscope", tags=["horoscope"])

VALID_PERIODS = {"daily", "weekly", "monthly", "yearly"}


def _window_and_display(period: str) -> tuple:
    """Returns (window_start_date_str, display_date_str). The slow-mover
    Gochara summary is still evaluated at window_start (today) for every
    period — that part is correct and unchanged, since Saturn/Jupiter/
    Rahu/Ketu genuinely don't move enough within any of these windows to
    need a different snapshot. display_date_str is what's shown to the
    user, and now actually reflects the period's span instead of always
    showing today's date for every tab."""
    today = datetime.now()
    start_str = today.strftime("%Y-%m-%d")

    if period == "daily":
        return start_str, start_str
    if period == "weekly":
        end = today + timedelta(days=6)
        return start_str, f"{start_str} to {end.strftime('%Y-%m-%d')}"
    if period == "monthly":
        return start_str, today.strftime("%B %Y")
    if period == "yearly":
        return start_str, today.strftime("%Y")
    return start_str, start_str


def _build_period_addendum(period: str, rasi_number: int, window_start: str) -> tuple:
    """Returns (addendum_en, addendum_ta, period_detail_dict) — the
    genuinely period-specific text and structured data that makes each
    tab differ. Returns ("", "", {}) for yearly, since the base
    slow-mover narration is already the correct, sufficient content for
    that timeframe."""
    if period == "daily":
        info = get_daily_moon_transit(rasi_number, window_start)
        s = SIGN_LABELS[info["moon_sign"]]
        if info["is_chandrashtama"]:
            en = (
                f"Today the Moon transits {s['sa']}, the 8th house from your Rasi — "
                f"classically the Chandrashtama period. Handle emotional matters and "
                f"important decisions with a little extra care today."
            )
            ta = (
                f"இன்று சந்திரன் {s['ta']} ராசியில் (உங்கள் ராசிக்கு 8-ஆம் இடம்) சஞ்சரிக்கிறார் — "
                f"இதுவே சந்திராஷ்டமம். இன்று மனநிலை மற்றும் முக்கிய முடிவுகளில் கூடுதல் "
                f"கவனம் தேவை."
            )
        elif info["favorable"]:
            en = (
                f"Today the Moon transits {s['sa']}, the {info['house_from_moon_rasi']}th "
                f"house from your Rasi — a favorable Chandrabalam position, supporting "
                f"smooth day-to-day activities."
            )
            ta = (
                f"இன்று சந்திரன் {s['ta']} ராசியில் (உங்கள் ராசிக்கு "
                f"{info['house_from_moon_rasi']}-ஆம் இடம்) சஞ்சரிக்கிறார் — இது சாதகமான "
                f"சந்திரபல இடம், இன்றைய காரியங்கள் இலகுவாக அமையும்."
            )
        else:
            en = (
                f"Today the Moon transits {s['sa']}, the {info['house_from_moon_rasi']}th "
                f"house from your Rasi — not among the classically favorable Chandrabalam "
                f"houses, so proceed with a little more patience today."
            )
            ta = (
                f"இன்று சந்திரன் {s['ta']} ராசியில் (உங்கள் ராசிக்கு "
                f"{info['house_from_moon_rasi']}-ஆம் இடம்) சஞ்சரிக்கிறார் — இது சிறப்பான "
                f"சந்திரபல இடம் அல்ல, இன்று சற்று பொறுமையாக செயல்படுவது நல்லது."
            )
        return en, ta, {"daily_moon_transit": info}

    if period == "weekly":
        path = get_weekly_moon_path(rasi_number, window_start)
        segs_en, segs_ta = [], []
        for seg in path:
            s = SIGN_LABELS[seg["moon_sign"]]
            segs_en.append(
                f"{s['sa']} (from {seg['date']}, house {seg['house_from_moon_rasi']}, "
                f"{'favorable' if seg['favorable'] else 'neutral/challenging'})"
            )
            segs_ta.append(
                f"{s['ta']} ({seg['date']} முதல், {seg['house_from_moon_rasi']}-ஆம் இடம், "
                f"{'சாதகம்' if seg['favorable'] else 'நடுநிலை/சவாலானது'})"
            )
        en = "This week the Moon moves through: " + "; ".join(segs_en) + "."
        ta = "இந்த வாரம் சந்திரன் கடக்கும் ராசிகள்: " + "; ".join(segs_ta) + "."
        return en, ta, {"weekly_moon_path": path}

    if period == "monthly":
        ingresses = get_monthly_ingresses(window_start, days=30)
        if ingresses:
            lines_en, lines_ta = [], []
            for ing in ingresses:
                s = SIGN_LABELS[ing["new_sign"]]
                p_ta = PLANET_LABELS.get(ing["planet"], {}).get("ta", ing["planet"])
                lines_en.append(f"{ing['planet']} enters {s['sa']} on {ing['date']}")
                lines_ta.append(f"{p_ta} {ing['date']} அன்று {s['ta']} ராசியில் பிரவேசிக்கிறார்")
            en = "Key transits this month: " + "; ".join(lines_en) + "."
            ta = "இந்த மாதத்தின் முக்கிய கிரக மாற்றங்கள்: " + "; ".join(lines_ta) + "."
        else:
            en = (
                "No Sun/Mercury/Venus/Mars sign change falls within this month — the "
                "month's tone stays consistent with today's positions."
            )
            ta = (
                "இந்த மாதத்தில் சூரிய/புதன்/சுக்ர/செவ்வாய் ராசி மாற்றம் இல்லை — மாத பலன் "
                "இன்றைய நிலைகளுடன் ஒத்திருக்கும்."
            )
        return en, ta, {"monthly_ingresses": ingresses}

    return "", "", {}


@router.get("/{period}/{rasi_number}")
def get_rasi_horoscope(period: str, rasi_number: int):
    if period not in VALID_PERIODS:
        raise HTTPException(
            status_code=400, detail=f"period must be one of {sorted(VALID_PERIODS)}"
        )
    if rasi_number < 1 or rasi_number > 12:
        raise HTTPException(status_code=400, detail="rasi_number must be 1-12")

    window_start, display_date = _window_and_display(period)

    # Slow-mover (Saturn/Jupiter/Rahu/Ketu) summary — unchanged engine,
    # unchanged snapshot logic (correct as-is for all 4 periods, since
    # none of these planets move enough within a day/week/month/year-so-far
    # to need a different reference point here).
    transits = compute_current_transits(date_str=window_start)
    gochara_results = analyze_gochara(
        natal_moon_sign=rasi_number, natal_bav=None, transit_planets=transits
    )
    summary = get_gochara_summary(gochara_results)

    sign_info = SIGN_LABELS[rasi_number]
    period_en, period_ta = PERIOD_LABELS.get(period, ("Today", "இன்றைய"))

    narration_ta, narration_en = generate_rasi_horoscope_narration(
        sign_info["ta"], sign_info["sa"], period, summary, summary["key_slow_planet_transits"]
    )

    # NEW: genuinely period-specific fast-mover addendum — this is what
    # makes Daily/Weekly/Monthly differ from each other and from Yearly.
    addendum_en, addendum_ta, period_detail = _build_period_addendum(
        period, rasi_number, window_start
    )
    if addendum_en:
        narration_en = f"{narration_en} {addendum_en}".strip()
        narration_ta = f"{narration_ta} {addendum_ta}".strip()

    # NEW: Prokerala-style subheaded sections (Career & Money / Love &
    # Relationships / Health & Wellness), built strictly from the
    # already-computed gochara_results list above — zero extra ephemeris
    # calls, zero new astrology invented. See horoscope_categories.py.
    category_sections = build_categorized_horoscope(
        sign_info["sa"], sign_info["ta"], gochara_results
    )

    return {
        "rasi_number": rasi_number,
        "rasi": sign_info["sa"],
        "rasi_ta": sign_info["ta"],
        "period": period,
        "period_label": period_en,
        "period_label_ta": period_ta,
        "reference_date": display_date,
        "overall_assessment": summary["overall_assessment"],
        "overall_assessment_ta": summary["overall_assessment_ta"],
        "benefic_transits": summary["benefic_transits"],
        "challenging_transits": summary["challenging_transits"],
        "vedha_cancellations": summary["vedha_cancellations"],
        "key_transits": summary["key_slow_planet_transits"],
        "period_detail": period_detail,
        "category_sections": category_sections,
        "narration": narration_en,
        "narration_ta": narration_ta,
        "classical_source": summary["classical_source"],
    }


@router.get("/love/{rasi1}/{rasi2}")
def get_rasi_love_horoscope(rasi1: int, rasi2: int):
    if not (1 <= rasi1 <= 12) or not (1 <= rasi2 <= 12):
        raise HTTPException(status_code=400, detail="rasi numbers must be 1-12")
    return compute_rasi_love_horoscope(rasi1, rasi2)