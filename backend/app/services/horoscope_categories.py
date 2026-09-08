"""
Category-Based Horoscope Sections (Career & Money / Love & Relationships /
Health & Wellness) — Daily/Weekly/Monthly/Yearly Rasi Horoscope.

Adds Prokerala-style subheaded sections on top of the existing single-
paragraph overview. Every sentence here is synthesized ONLY from fields
already present in gochara.py's per-planet transit output (planet,
transit_rasi, house_from_moon, classical_effect, net_effect) — no new
astronomical computation, and no invented specific claims (e.g. "skin and
teeth problems") that aren't traceable to an already-computed value, per
AGENTS.md §1 Rule 3 (narration must only describe values it was given).

House-to-life-area mapping (classical Bhava Karakatva / significations —
the SAME houses already used for the natal Life Scorecard in
single_page_report.py, applied here to the TRANSIT view instead of the
natal Ashtakavarga view):
  - Career & Money:       2nd (wealth), 10th (career), 11th (gains)
  - Love & Relationships: 5th (romance), 7th (partnership), 11th (fulfilment of desires)
  - Health & Wellness:    1st (self/body), 6th (illness/obstacles), 8th (chronic/longevity)

If no planet is currently transiting a category's houses, that is stated
explicitly rather than inventing generic filler text for that section.
"""

from typing import Dict, Any, List

_CATEGORIES = {
    "career": {
        "houses": (2, 10, 11),
        "title_en": "Career & Money Horoscope",
        "title_ta": "தொழில் & பொருளாதார பலன்",
    },
    "love": {
        "houses": (5, 7, 11),
        "title_en": "Love & Relationship Horoscope",
        "title_ta": "காதல் & உறவு பலன்",
    },
    "health": {
        "houses": (1, 6, 8),
        "title_en": "Health & Wellness Horoscope",
        "title_ta": "உடல்நலப் பலன்",
    },
}

_NO_TRANSIT_TEMPLATE = {
    "career": (
        "No major planet is currently transiting your 2nd, 10th, or 11th house from {rasi_en} "
        "— a relatively steady, status-quo period for career and money matters.",
        "தற்போது {rasi_ta} ராசிக்கு 2, 10, அல்லது 11-ஆம் இடங்களில் முக்கிய கிரக சஞ்சாரம் "
        "இல்லை — தொழில் மற்றும் பொருளாதார விஷயங்களில் நிலையான காலகட்டம்.",
    ),
    "love": (
        "No major planet is currently transiting your 5th, 7th, or 11th house from {rasi_en} "
        "— relationships continue along their existing course without a strong new influence.",
        "தற்போது {rasi_ta} ராசிக்கு 5, 7, அல்லது 11-ஆம் இடங்களில் முக்கிய கிரக சஞ்சாரம் "
        "இல்லை — உறவுகள் புதிய தாக்கம் இன்றி தொடரும்.",
    ),
    "health": (
        "No major planet is currently transiting your 1st, 6th, or 8th house from {rasi_en} "
        "— no specific transit-driven health concern stands out for this period.",
        "தற்போது {rasi_ta} ராசிக்கு 1, 6, அல்லது 8-ஆம் இடங்களில் முக்கிய கிரக சஞ்சாரம் "
        "இல்லை — இக்காலத்தில் குறிப்பிட்ட உடல்நல பாதிப்பு எதுவும் இல்லை.",
    ),
}


def build_categorized_horoscope(
    rasi_en: str,
    rasi_ta: str,
    gochara_results: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    """gochara_results is the FULL per-planet list returned by
    analyze_gochara() (not the already house-filtered summary). Returns
    one section per category: {key, title_en, title_ta, text_en, text_ta}.
    Built strictly from each transit's already-computed net_effect /
    classical_effect fields — this function invents no new facts."""
    sections = []
    for cat_key, cat in _CATEGORIES.items():
        relevant = [t for t in gochara_results if t.get("house_from_moon") in cat["houses"]]

        if not relevant:
            tmpl_en, tmpl_ta = _NO_TRANSIT_TEMPLATE[cat_key]
            text_en = tmpl_en.format(rasi_en=rasi_en, rasi_ta=rasi_ta)
            text_ta = tmpl_ta.format(rasi_en=rasi_en, rasi_ta=rasi_ta)
        else:
            favorable_count = sum(1 for t in relevant if t.get("net_benefic"))
            challenging_count = len(relevant) - favorable_count

            # Opening line — names the category and gives the at-a-glance
            # count, mirroring the structure of the main overview narration.
            if favorable_count > challenging_count:
                open_en = (
                    f"This is a broadly favorable period for {cat['title_en'].split(' Horoscope')[0]} "
                    f"matters, with {favorable_count} of {len(relevant)} active transit(s) working in your favor."
                )
                open_ta = (
                    f"இது {cat['title_ta']} விஷயங்களில் ஏற்புடைய காலகட்டம் — {len(relevant)} கிரக "
                    f"சஞ்சாரங்களில் {favorable_count} சாதகமாக உள்ளது."
                )
            elif challenging_count > favorable_count:
                open_en = (
                    f"This period calls for a little more care in {cat['title_en'].split(' Horoscope')[0]} "
                    f"matters, with {challenging_count} of {len(relevant)} active transit(s) more challenging."
                )
                open_ta = (
                    f"இது {cat['title_ta']} விஷயங்களில் சற்று கவனம் தேவைப்படும் காலகட்டம் — {len(relevant)} "
                    f"கிரக சஞ்சாரங்களில் {challenging_count} சவாலானதாக உள்ளது."
                )
            else:
                open_en = (
                    f"This is a mixed period for {cat['title_en'].split(' Horoscope')[0]} matters — "
                    f"favorable and challenging influences are evenly balanced right now."
                )
                open_ta = (
                    f"இது {cat['title_ta']} விஷயங்களில் கலவையான காலகட்டம் — சாதக, சவால் தாக்கங்கள் "
                    f"சமமாக உள்ளன."
                )

            # Per-transit sentences — built from the FULL classical_effect
            # description (the same field the main narration draws its
            # depth from), not the short net_effect label. net_effect is
            # kept only as a short parenthetical tag so the sentence stays
            # grammatical instead of being glued mid-phrase.
            detail_en, detail_ta = [], []
            for t in relevant:
                planet = t.get("planet", "")
                planet_ta = t.get("planet_ta", planet)
                house = t.get("house_from_moon")
                rasi_name = t.get("transit_rasi", "")
                rasi_name_ta = t.get("transit_rasi_ta", "")
                classical_en = (t.get("classical_effect") or t.get("net_effect") or "").strip().rstrip(".")
                classical_ta = (t.get("classical_effect_ta") or t.get("net_effect_ta") or "").strip().rstrip(".")
                tag_en = t.get("net_effect", "")
                tag_ta = t.get("net_effect_ta", "")
                vedha_note_en = " (moderated by Vedha cancellation)" if t.get("vedha_active") else ""
                vedha_note_ta = " (வேதை பாதிப்பால் தணிக்கப்பட்டது)" if t.get("vedha_active") else ""

                detail_en.append(
                    f"{planet} is transiting {rasi_name}, your {house}th house from {rasi_en}: "
                    f"{classical_en}{vedha_note_en} [{tag_en}]."
                )
                detail_ta.append(
                    f"{planet_ta}, தங்கள் {rasi_ta} ராசிக்கு {house}-ஆம் இடமான {rasi_name_ta} ராசியில் "
                    f"சஞ்சரிக்கிறார்: {classical_ta}{vedha_note_ta} [{tag_ta}]."
                )

            text_en = open_en + " " + " ".join(detail_en)
            text_ta = open_ta + " " + " ".join(detail_ta)

        sections.append({
            "key": cat_key,
            "title_en": cat["title_en"],
            "title_ta": cat["title_ta"],
            "text_en": text_en,
            "text_ta": text_ta,
        })
    return sections