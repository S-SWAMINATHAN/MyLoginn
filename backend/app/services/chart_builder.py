"""
Chart Builder for Rasi (D1), Navamsa (D9), and 12 Bhava Predictions.
Cites Brihat Parashara Hora Shastra (BPHS) and Phaladeepika.
"""

from typing import Dict, List, Any
from backend.app.services.tamil_labels import SIGN_LABELS, BHAVA_LABELS, PLANET_LABELS

def compute_navamsa_sign(total_degree: float) -> int:
    """
    Computes Navamsa (D9) sign (1 to 12) for a given sidereal longitude.
    Each Navamsa span = 3°20' (3.3333333 degrees).
    27 Nakshatras * 4 Padas = 108 Padas mapped cyclically to 12 signs starting from Mesha.
    """
    navamsa_idx = int(total_degree // (360.0 / 108))  # 0 to 107
    navamsa_sign = (navamsa_idx % 12) + 1
    return navamsa_sign

def build_rasi_and_navamsa_kattams(planets: List[Dict[str, Any]], lagna_info: Dict[str, Any]):
    """
    Constructs the 12-house grid representation for Rasi (D1) and Navamsa (D9).
    Keys are sign numbers 1 to 12 (1=Mesha, 2=Vrishabha ... 12=Meena).
    """
    rasi_kattam: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(1, 13)}
    navamsa_kattam: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(1, 13)}

    # Add Lagna
    rasi_kattam[lagna_info["rasi_number"]].append({
        "name": "Lagna",
        "name_ta": "லக்னம்",
        "symbol": "லக்",
        "degree": lagna_info["degree"],
        "is_lagna": True,
        "is_retrograde": False
    })

    lagna_navamsa_sign = compute_navamsa_sign(lagna_info["total_degree"])
    navamsa_kattam[lagna_navamsa_sign].append({
        "name": "Lagna",
        "name_ta": "லக்னம்",
        "symbol": "லக்",
        "degree": round(lagna_info["degree"] % 3.3333, 2),
        "is_lagna": True,
        "is_retrograde": False
    })

    # Add Planets
    for p in planets:
        rasi_kattam[p["rasi_number"]].append({
            "name": p["name"],
            "name_ta": p["name_ta"],
            "symbol": p["symbol"],
            "degree": p["degree"],
            "is_lagna": False,
            "is_retrograde": p.get("is_retrograde", False),
            "status": p.get("status", "Direct")
        })

        p_nav_sign = compute_navamsa_sign(p["total_degree"])
        navamsa_kattam[p_nav_sign].append({
            "name": p["name"],
            "name_ta": p["name_ta"],
            "symbol": p["symbol"],
            "degree": round(p["degree"] % 3.3333, 2),
            "is_lagna": False,
            "is_retrograde": p.get("is_retrograde", False),
            "status": p.get("status", "Direct")
        })

    return rasi_kattam, navamsa_kattam

def calculate_bhava_predictions(lagna_sign_num: int, planets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Computes detailed 12 Bhava (House) analysis:
    - Lord of the house
    - Occupants
    - Aspects received
    - Significations in Tamil and English
    - Classical prediction
    """
    # Map planets to signs
    occupants_by_sign = {i: [] for i in range(1, 13)}
    planets_by_name = {}
    for p in planets:
        occupants_by_sign[p["rasi_number"]].append(p["name"])
        planets_by_name[p["name"]] = p

    # Aspect calculations (Vedic full drishti):
    # All planets aspect 7th from their placement.
    # Mars aspects 4th, 7th, 8th.
    # Jupiter aspects 5th, 7th, 9th.
    # Saturn aspects 3rd, 7th, 10th.
    # Rahu/Ketu aspect 5th, 7th, 9th.
    aspects_by_sign = {i: [] for i in range(1, 13)}
    for p in planets:
        p_sign = p["rasi_number"]
        name = p["name"]
        # Standard 7th aspect
        h7 = ((p_sign - 1 + 6) % 12) + 1
        aspects_by_sign[h7].append(name)

        if name == "Mars":
            h4 = ((p_sign - 1 + 3) % 12) + 1
            h8 = ((p_sign - 1 + 7) % 12) + 1
            aspects_by_sign[h4].append(name)
            aspects_by_sign[h8].append(name)
        elif name in ("Jupiter", "Rahu", "Ketu"):
            h5 = ((p_sign - 1 + 4) % 12) + 1
            h9 = ((p_sign - 1 + 8) % 12) + 1
            aspects_by_sign[h5].append(name)
            aspects_by_sign[h9].append(name)
        elif name == "Saturn":
            h3 = ((p_sign - 1 + 2) % 12) + 1
            h10 = ((p_sign - 1 + 9) % 12) + 1
            aspects_by_sign[h3].append(name)
            aspects_by_sign[h10].append(name)

    bhava_list = []
    for house_num in range(1, 13):
        sign_num = ((lagna_sign_num - 1 + (house_num - 1)) % 12) + 1
        sign_info = SIGN_LABELS[sign_num]
        bhava_info = BHAVA_LABELS[house_num]

        occupants = occupants_by_sign[sign_num]
        aspects = list(set(aspects_by_sign[sign_num]))
        lord_name = sign_info["lord"]
        lord_label = PLANET_LABELS.get(lord_name, {})

        # Classical interpretation synthesis
        occ_str = ", ".join(occupants) if occupants else "None (சுப பார்வை)"
        occ_str_ta = ", ".join([PLANET_LABELS.get(o, {}).get("ta", o) for o in occupants]) if occupants else "கிரகங்கள் இல்லை"

        if house_num == 1:
            pred = f"Lagna is in {sign_info['sa']} ({sign_info['en']}) governed by {lord_name}. " \
                   f"{f'Occupied by {occ_str}.' if occupants else 'Free from direct malefic occupancy.'} " \
                   f"Indicates strong vitality, character, and distinctive personality."
            pred_ta = f"லக்னம் {sign_info['ta']} ராசியில் அமைந்துள்ளது. அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"{f'இங்கு {occ_str_ta} அமர்ந்துள்ளது.' if occupants else 'நேரடி பாவ கிரகங்கள் இன்றி சுபத்தன்மை பெற்றுள்ளது.'} " \
                      f"நல்ல உடல் நலம், திடமான மன உறுதி மற்றும் நற்பெயரை தரும்."
        elif house_num == 2:
            pred = f"2nd House of Wealth & Family in {sign_info['sa']}. Lord is {lord_name}. " \
                   f"Influences speech, family prosperity, and financial stability."
            pred_ta = f"தன & குடும்ப பாவம் {sign_info['ta']} ராசியில், அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"குடும்ப ஒற்றுமை, சிறந்த வாக்கு வன்மை மற்றும் நிலையான பொருளாதார வளர்ச்சியை குறிக்கிறது."
        elif house_num == 4:
            pred = f"4th House of Domestic Happiness, Mother & Vehicles in {sign_info['sa']}. Lord is {lord_name}."
            pred_ta = f"சுக பாவம் {sign_info['ta']} ராசியில், அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"தாய் வழி பாசம், சொந்த வீடு, வாகன யோகம் மற்றும் மன அமைதியை வழங்குகிறது."
        elif house_num == 5:
            pred = f"5th House of Purva Punya & Progeny in {sign_info['sa']}. Lord is {lord_name}."
            pred_ta = f"பூர்வ புண்ணிய பாவம் {sign_info['ta']} ராசியில், அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"குழந்தை பாக்கியம், கல்வி நுண்ணறிவு, மற்றும் ஆன்மீக யோகத்தை குறிக்கிறது."
        elif house_num == 7:
            pred = f"7th House of Marriage & Partnership in {sign_info['sa']}. Lord is {lord_name}."
            pred_ta = f"களத்திர பாவம் {sign_info['ta']} ராசியில், அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"வாழ்க்கைத் துணை அமையப் பெறுதல், இல்லற நல்லிணக்கம் மற்றும் கூட்டு முயற்சிகளை விளக்குகிறது."
        elif house_num == 9:
            pred = f"9th House of Fortune & Dharma in {sign_info['sa']}. Lord is {lord_name}."
            pred_ta = f"பாக்கிய & தர்ம பாவம் {sign_info['ta']} ராசியில், அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"தந்தையின் ஆதரவு, பூர்வ புண்ணிய பாக்கியம் மற்றும் குருவருளை தருகிறது."
        elif house_num == 10:
            pred = f"10th House of Career & Karma in {sign_info['sa']}. Lord is {lord_name}."
            pred_ta = f"ஜீவன & தொழில் பாவம் {sign_info['ta']} ராசியில், அதிபதி {lord_label.get('ta', lord_name)}. " \
                      f"தொழில் மேன்மை, அதிகார பதவி, சமூக அந்தஸ்து மற்றும் நற்புகழை அருள்கிறது."
        else:
            pred = f"House {house_num} situated in {sign_info['sa']} governed by {lord_name}."
            pred_ta = f"{house_num}-ஆம் பாவம் {sign_info['ta']} ராசியில் அமர்ந்துள்ளது. அதிபதி {lord_label.get('ta', lord_name)}."

        bhava_list.append({
            "house_number": house_num,
            "rasi_number": sign_num,
            "rasi": sign_info["sa"],
            "rasi_ta": sign_info["ta"],
            "lord": lord_name,
            "lord_ta": lord_label.get("ta", lord_name),
            "occupants": occupants,
            "aspecting_planets": aspects,
            "significations": bhava_info["significations"],
            "significations_ta": bhava_info["significations_ta"],
            "prediction": pred,
            "prediction_ta": pred_ta
        })

    return bhava_list


def compute_hora_chart(
    planets: List[Dict[str, Any]],
    lagna_info: Dict[str, Any]
) -> Dict[int, List[Dict[str, Any]]]:
    """
    Computes the Hora Chart (D2) — Divisional Chart for Wealth Analysis.

    Classical Rule (BPHS Ch. 6, Shloka 7-8):
    - For planets in ODD signs (1, 3, 5, 7, 9, 11):
      - First half (0°–15°) → Leo (5) — Sun's Hora (Solar wealth)
      - Second half (15°–30°) → Cancer (4) — Moon's Hora (Lunar wealth)
    - For planets in EVEN signs (2, 4, 6, 8, 10, 12):
      - First half (0°–15°) → Cancer (4) — Moon's Hora
      - Second half (15°–30°) → Leo (5) — Sun's Hora

    Returns a 12-house grid (same format as Rasi/Navamsa kattam).
    Only signs 4 (Cancer) and 5 (Leo) will have occupants in a pure D2 chart.
    """
    hora_kattam: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(1, 13)}

    def get_hora_sign(rasi_num: int, degree_in_sign: float) -> int:
        is_odd = rasi_num % 2 == 1
        is_first_half = degree_in_sign < 15.0
        if is_odd:
            return 5 if is_first_half else 4  # Leo or Cancer
        else:
            return 4 if is_first_half else 5  # Cancer or Leo

    # Add Lagna
    lagna_hora = get_hora_sign(lagna_info["rasi_number"], lagna_info["degree"])
    hora_kattam[lagna_hora].append({
        "name": "Lagna",
        "name_ta": "லக்னம்",
        "symbol": "லக்",
        "degree": lagna_info["degree"],
        "is_lagna": True,
        "is_retrograde": False,
        "hora_type": "Sun" if lagna_hora == 5 else "Moon",
        "hora_type_ta": "சூரிய ஹோரா" if lagna_hora == 5 else "சந்திர ஹோரா"
    })

    # Add Planets
    for p in planets:
        p_hora = get_hora_sign(p["rasi_number"], p["degree"])
        hora_kattam[p_hora].append({
            "name": p["name"],
            "name_ta": p["name_ta"],
            "symbol": p["symbol"],
            "degree": p["degree"],
            "is_lagna": False,
            "is_retrograde": p.get("is_retrograde", False),
            "hora_type": "Sun" if p_hora == 5 else "Moon",
            "hora_type_ta": "சூரிய ஹோரா" if p_hora == 5 else "சந்திர ஹோரா"
        })

    return hora_kattam


def compute_drekkana_chart(
    planets: List[Dict[str, Any]],
    lagna_info: Dict[str, Any]
) -> Dict[int, List[Dict[str, Any]]]:
    """
    Computes the Drekkana Chart (D3) — Divisional Chart for Siblings & Courage.

    Classical Rule (BPHS Ch. 6, Shloka 9-10):
    - 0°–10° (1st Decanate) → Same sign
    - 10°–20° (2nd Decanate) → 5th sign from the Rasi sign
    - 20°–30° (3rd Decanate) → 9th sign from the Rasi sign

    Returns a 12-house grid (same format as Rasi/Navamsa kattam).
    """
    drekkana_kattam: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(1, 13)}

    def get_drekkana_sign(rasi_num: int, degree_in_sign: float) -> int:
        if degree_in_sign < 10.0:
            return rasi_num  # Same sign
        elif degree_in_sign < 20.0:
            return ((rasi_num - 1 + 4) % 12) + 1  # 5th from it
        else:
            return ((rasi_num - 1 + 8) % 12) + 1  # 9th from it

    # Add Lagna
    lagna_drek = get_drekkana_sign(lagna_info["rasi_number"], lagna_info["degree"])
    lagna_sign_info = SIGN_LABELS.get(lagna_drek, {})
    drekkana_kattam[lagna_drek].append({
        "name": "Lagna",
        "name_ta": "லக்னம்",
        "symbol": "லக்",
        "degree": lagna_info["degree"],
        "drekkana_sign": lagna_drek,
        "drekkana_rasi_ta": lagna_sign_info.get("ta", ""),
        "is_lagna": True,
        "is_retrograde": False
    })

    # Add Planets
    for p in planets:
        p_drek = get_drekkana_sign(p["rasi_number"], p["degree"])
        drek_sign_info = SIGN_LABELS.get(p_drek, {})
        drekkana_kattam[p_drek].append({
            "name": p["name"],
            "name_ta": p["name_ta"],
            "symbol": p["symbol"],
            "degree": p["degree"],
            "drekkana_sign": p_drek,
            "drekkana_rasi_ta": drek_sign_info.get("ta", ""),
            "is_lagna": False,
            "is_retrograde": p.get("is_retrograde", False)
        })

    return drekkana_kattam
