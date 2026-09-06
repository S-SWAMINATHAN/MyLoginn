"""
Horoscope Narration Layer (Daily/Weekly/Monthly/Yearly Rasi Horoscope).
Mirrors llm_narration.py's pattern exactly: this is a deterministic,
template-based narration function — it only weaves together values it was
handed (Gochara summary/key-transits data), never invents a position,
house, or planet not present in that input. Per AGENTS.md §1 Rule 3.
"""

from typing import Dict, Any, List, Tuple

PERIOD_LABELS = {
    "daily": ("Today", "இன்றைய"),
    "weekly": ("This Week", "இந்த வார"),
    "monthly": ("This Month", "இந்த மாத"),
    "yearly": ("This Year", "இந்த ஆண்டு"),
}


def generate_rasi_horoscope_narration(
    rasi_ta: str,
    rasi_en: str,
    period: str,
    gochara_summary: Dict[str, Any],
    key_transits: List[Dict[str, Any]],
) -> Tuple[str, str]:
    """
    Returns (narration_ta, narration_en) built strictly from the given
    Gochara summary and key (slow-planet) transit data.
    """
    period_en, period_ta = PERIOD_LABELS.get(period, ("Today", "இன்றைய"))
    overall = gochara_summary.get("overall_assessment", "")
    overall_ta = gochara_summary.get("overall_assessment_ta", "")
    benefic = gochara_summary.get("benefic_transits", 0)
    challenging = gochara_summary.get("challenging_transits", 0)
    vedha = gochara_summary.get("vedha_cancellations", 0)

    slow_lines_ta: List[str] = []
    slow_lines_en: List[str] = []
    for kt in key_transits:
        slow_lines_ta.append(
            f"{kt.get('planet_ta', '')} {kt.get('transit_rasi_ta', '')} ராசியில் அமர்ந்து "
            f"{rasi_ta} ராசியிலிருந்து {kt.get('house_from_moon', '')}-ஆம் இடத்தில் இருப்பதால், "
            f"{kt.get('net_effect_ta', '')} அமைகிறது."
        )
        slow_lines_en.append(
            f"{kt.get('planet', '')} transiting {kt.get('transit_rasi_ta', '')} falls in the "
            f"{kt.get('house_from_moon', '')}th house from {rasi_en}, bringing a "
            f"{str(kt.get('net_effect', '')).lower()} phase on this front."
        )

    vedha_note_ta = f" இதில் {vedha} இடங்களில் வேதை பாதிப்பால் பலன் தணிக்கப்பட்டுள்ளது." if vedha else ""
    vedha_note_en = f" {vedha} of these are moderated by Vedha (obstruction) cancellation." if vedha else ""

    narration_ta = (
        f"{rasi_ta} ராசிக்கு {period_ta} பலன்: {overall_ta}. "
        f"மொத்தம் {benefic} கிரகங்கள் சுபமான இடங்களிலும், {challenging} கிரகங்கள் சவாலான இடங்களிலும் "
        f"அமைந்துள்ளன.{vedha_note_ta} "
        + " ".join(slow_lines_ta)
    ).strip()

    narration_en = (
        f"{period_en}'s outlook for {rasi_en}: {overall}. "
        f"{benefic} planet(s) currently occupy favorable houses from your Moon sign, while "
        f"{challenging} occupy more challenging ones.{vedha_note_en} "
        + " ".join(slow_lines_en)
    ).strip()

    return narration_ta, narration_en