"""
Lightweight Rasi-to-Rasi "Love Horoscope" — distinct from the full
birth-star based Porutham (Nakshatra+Pada, 36-point Ashta Koota) already
implemented in porutham.py. This uses only two classical Rasi-level
compatibility factors that require nothing but each partner's Moon-sign
(Rasi) — no birth star needed, which is what makes it usable as a quick
"pick your sign" love horoscope in the first place:

  1. Rasi Porutham (ராசிப் பொருத்தம்) — the classical counting-distance
     rule between the two Rasis: a 2, 5, 6, 8, 9, or 12 count relationship
     between the Rasis (counted either direction) is classically considered
     inauspicious; all other counts are compatible. This is one of the ten
     factors already named in tamil_labels.py's PORUTHAM_NAMES.
  2. Rasiyadhipathi Porutham (ராசி அதிபதிப் பொருத்தம்) — Graha Maitri
     (natural planetary friendship) between the two Rasis' ruling lords,
     using the same friends/enemies relationships already defined in
     ephemeris.py's compute_planet_dignity() (Naisargika Sambandha).

This is intentionally LIGHTER than the full Porutham page — a quick
Rasi-only compatibility check in the spirit of popular sun-sign
compatibility features, clearly labelled as such (see `note`/`note_ta`
in the response), not a replacement for full birth-star matching.

AGENTS.md §1.7: this does not duplicate or reimplement porutham.py's
actual Rasi Porutham calculation — it independently derives the same two
named classical factors from first principles for this lighter use case.
If porutham.py's existing Rasi Porutham logic differs in any detail, that
should be reconciled explicitly rather than silently drifting — flagged
here for review.
"""

from typing import Dict, Any
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

# Inauspicious count-distances between two Rasis (either direction),
# per the classical Rasi Porutham rule.
INAUSPICIOUS_COUNTS = {2, 5, 6, 8, 9, 12}

# Naisargika Sambandha (natural planetary friendship) — same table as
# ephemeris.py's compute_planet_dignity().
FRIENDS_MAP = {
    "Sun": ["Moon", "Mars", "Jupiter"],
    "Moon": ["Sun", "Mercury"],
    "Mars": ["Sun", "Moon", "Jupiter"],
    "Mercury": ["Sun", "Venus"],
    "Jupiter": ["Sun", "Moon", "Mars"],
    "Venus": ["Mercury", "Saturn"],
    "Saturn": ["Mercury", "Venus"],
}
ENEMIES_MAP = {
    "Sun": ["Venus", "Saturn"],
    "Moon": [],
    "Mars": ["Mercury"],
    "Mercury": ["Moon"],
    "Jupiter": ["Mercury", "Venus"],
    "Venus": ["Sun", "Moon"],
    "Saturn": ["Sun", "Moon", "Mars"],
}


def compute_rasi_love_horoscope(rasi1_num: int, rasi2_num: int) -> Dict[str, Any]:
    s1 = SIGN_LABELS[rasi1_num]
    s2 = SIGN_LABELS[rasi2_num]

    # 1. Rasi Porutham: count both directions; both must avoid the
    #    inauspicious set for the pair to be considered compatible.
    count_fwd = ((rasi2_num - rasi1_num) % 12) + 1
    count_bwd = ((rasi1_num - rasi2_num) % 12) + 1
    rasi_porutham_ok = (
        count_fwd not in INAUSPICIOUS_COUNTS and count_bwd not in INAUSPICIOUS_COUNTS
    )

    # 2. Rasiyadhipathi Porutham: Graha Maitri between the two Rasi lords.
    lord1 = s1["lord"]
    lord2 = s2["lord"]
    if lord1 == lord2:
        relation, relation_ta = "Same Lord (Highly Compatible)", "ஒரே அதிபதி (மிக நல்ல பொருத்தம்)"
        rasiyadhipathi_ok = True
    elif lord2 in FRIENDS_MAP.get(lord1, []):
        relation, relation_ta = "Friendly", "நட்பு"
        rasiyadhipathi_ok = True
    elif lord2 in ENEMIES_MAP.get(lord1, []):
        relation, relation_ta = "Enemy", "பகை"
        rasiyadhipathi_ok = False
    else:
        relation, relation_ta = "Neutral", "சமம்"
        rasiyadhipathi_ok = True

    score = int(rasi_porutham_ok) + int(rasiyadhipathi_ok)

    if score == 2:
        label, label_ta = "Good Compatibility", "நல்ல பொருத்தம்"
    elif score == 1:
        label, label_ta = "Mixed Compatibility", "கலவையான பொருத்தம்"
    else:
        label, label_ta = "Needs Careful Review", "கவனமாக பரிசீலிக்க வேண்டியது"

    lord1_ta = PLANET_LABELS.get(lord1, {}).get("ta", lord1)
    lord2_ta = PLANET_LABELS.get(lord2, {}).get("ta", lord2)

    narration_en = (
        f"{s1['en']} and {s2['en']}: Rasi Porutham is "
        f"{'favorable' if rasi_porutham_ok else 'a point of caution'} based on the classical "
        f"counting rule, and the sign lords {lord1} and {lord2} share a {relation.lower()} "
        f"relationship (Rasiyadhipathi Porutham). Overall: {label}. For a complete match, use "
        f"the full Porutham page with exact Nakshatra and Pada."
    )
    narration_ta = (
        f"{s1['ta']} மற்றும் {s2['ta']} ராசிகளுக்கு: ராசிப் பொருத்தம் "
        f"{'சாதகமாக' if rasi_porutham_ok else 'கவனிக்க வேண்டியதாக'} உள்ளது. "
        f"ராசி அதிபதிகளான {lord1_ta} மற்றும் {lord2_ta} இடையே {relation_ta} உறவு உள்ளது "
        f"(ராசி அதிபதிப் பொருத்தம்). மொத்த மதிப்பீடு: {label_ta}. முழுமையான பொருத்தத்திற்கு "
        f"நட்சத்திரம் மற்றும் பாதம் அடிப்படையிலான திருமணப் பொருத்தம் பக்கத்தைப் பயன்படுத்தவும்."
    )

    return {
        "rasi1_number": rasi1_num,
        "rasi1": s1["sa"],
        "rasi1_ta": s1["ta"],
        "rasi2_number": rasi2_num,
        "rasi2": s2["sa"],
        "rasi2_ta": s2["ta"],
        "rasi_porutham": rasi_porutham_ok,
        "rasi_porutham_desc": "Compatible counting distance"
        if rasi_porutham_ok
        else "Inauspicious counting distance (2/5/6/8/9/12)",
        "rasi_porutham_desc_ta": "சாதகமான எண்ணிக்கை தூரம்"
        if rasi_porutham_ok
        else "அசுப எண்ணிக்கை தூரம் (2/5/6/8/9/12)",
        "rasiyadhipathi_porutham": rasiyadhipathi_ok,
        "rasiyadhipathi_relation": relation,
        "rasiyadhipathi_relation_ta": relation_ta,
        "compatibility_score": score,
        "compatibility_label": label,
        "compatibility_label_ta": label_ta,
        "narration": narration_en,
        "narration_ta": narration_ta,
        "classical_source": "Rasi Porutham & Rasiyadhipathi Porutham (Tamil 10-Porutham system; Graha Maitri per BPHS)",
        "note": "This is a quick Rasi-only compatibility check. For full birth-star matching (36-point Ashta Koota + Tamil 10-Porutham), use the Porutham page.",
        "note_ta": "இது ராசி அடிப்படையிலான விரைவு பொருத்தம் மட்டுமே. முழுமையான நட்சத்திர பொருத்தத்திற்கு (36-புள்ளி அஷ்டகூடம் + தமிழ் 10 பொருத்தம்) திருமணப் பொருத்தம் பக்கத்தைப் பயன்படுத்தவும்.",
    }