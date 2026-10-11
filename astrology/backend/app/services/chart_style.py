"""
Chart Style Transformation Service.
Governed by AGENTS.md §1 & §4 (Rendering-layer concern only; never alters underlying astronomical data).
"""

from typing import Dict, List, Any

# Regional Chart Grid Mappings
# Tamil/South Indian grid coordinates (3x4 or 4x4 perimeter):
# Row 0: [12 (Meena), 1 (Mesha), 2 (Vrishabha), 3 (Mithuna)]
# Row 1: [11 (Kumbha), Center, Center, 4 (Karkataka)]
# Row 2: [10 (Makara), Center, Center, 5 (Simha)]
# Row 3: [9 (Dhanus), 8 (Vrischika), 7 (Tula), 6 (Kanya)]

SOUTH_INDIAN_BOX_ORDER = [
    # Top row
    {"sign_num": 12, "row": 0, "col": 0, "name": "Meena", "ta": "மீனம்"},
    {"sign_num": 1,  "row": 0, "col": 1, "name": "Mesha", "ta": "மேஷம்"},
    {"sign_num": 2,  "row": 0, "col": 2, "name": "Vrishabha", "ta": "ரிஷபம்"},
    {"sign_num": 3,  "row": 0, "col": 3, "name": "Mithuna", "ta": "மிதுனம்"},
    # Right column
    {"sign_num": 4,  "row": 1, "col": 3, "name": "Karkataka", "ta": "கடகம்"},
    {"sign_num": 5,  "row": 2, "col": 3, "name": "Simha", "ta": "சிம்மம்"},
    # Bottom row (right to left)
    {"sign_num": 6,  "row": 3, "col": 3, "name": "Kanya", "ta": "கன்னி"},
    {"sign_num": 7,  "row": 3, "col": 2, "name": "Tula", "ta": "துலாம்"},
    {"sign_num": 8,  "row": 3, "col": 1, "name": "Vrischika", "ta": "விருச்சிகம்"},
    {"sign_num": 9,  "row": 3, "col": 0, "name": "Dhanus", "ta": "தனுசு"},
    # Left column (bottom to top)
    {"sign_num": 10, "row": 2, "col": 0, "name": "Makara", "ta": "மகரம்"},
    {"sign_num": 11, "row": 1, "col": 0, "name": "Kumbha", "ta": "கும்பம்"},
]

def format_chart_for_style(
    kattam_data: Dict[int, List[Dict[str, Any]]],
    chart_style: str = "tamil"
) -> Dict[str, Any]:
    """
    Transforms the 12-sign kattam data into the visual coordinates required by the requested style.
    Style options: "tamil" (South Indian), "kerala", "north_indian" (Diamond).
    """
    style_normalized = chart_style.lower()

    if style_normalized in ("tamil", "south_indian", "kerala"):
        boxes = []
        for box in SOUTH_INDIAN_BOX_ORDER:
            s_num = box["sign_num"]
            planets_in_box = kattam_data.get(s_num, [])
            boxes.append({
                "sign_number": s_num,
                "sign_name": box["name"],
                "sign_name_ta": box["ta"],
                "row": box["row"],
                "col": box["col"],
                "planets": planets_in_box
            })
        return {
            "style": "south_indian" if style_normalized == "tamil" else "kerala",
            "boxes": boxes
        }
    elif style_normalized in ("north_indian", "diamond"):
        # North Indian houses are fixed diamonds 1 to 12.
        # House 1 is top-center.
        # The sign in House 1 is Lagna's sign.
        houses = []
        # Find which sign has Lagna
        lagna_sign = 1
        for s_num, p_list in kattam_data.items():
            if any(p.get("is_lagna") for p in p_list):
                lagna_sign = s_num
                break

        for h in range(1, 13):
            s_num = ((lagna_sign - 1 + (h - 1)) % 12) + 1
            houses.append({
                "house_number": h,
                "sign_number": s_num,
                "planets": kattam_data.get(s_num, [])
            })
        return {
            "style": "north_indian",
            "houses": houses
        }

    return {"style": "south_indian", "boxes": []}
