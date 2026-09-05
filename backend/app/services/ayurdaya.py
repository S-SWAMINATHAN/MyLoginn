"""
Ayurdaya (Longevity Determination) Engine.
Cites:
- Brihat Parashara Hora Shastra (BPHS) Ch. 44–45 (Ayurdaya Determination)
- Phaladeepika Ch. 13 (Ayurdaya & Maraka Adhyaya)
- Jataka Parijata Ch. 5 & 14
- Jaimini Upadesha Sutras (Longevity Triads)
"""

from typing import Dict, Any, List, Optional
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

# Mobility of 12 Signs (1=Mesha .. 12=Meena)
# 1: Chara (Movable), 2: Sthira (Fixed), 3: Ubhaya / Dwisvabhava (Dual)
SIGN_MOBILITY: Dict[int, str] = {
    1: "Chara", 2: "Sthira", 3: "Ubhaya",
    4: "Chara", 5: "Sthira", 6: "Ubhaya",
    7: "Chara", 8: "Sthira", 9: "Ubhaya",
    10: "Chara", 11: "Sthira", 12: "Ubhaya"
}

SIGN_MOBILITY_TA: Dict[int, str] = {
    1: "சர ராசி", 2: "ஸ்திர ராசி", 3: "உபய ராசி",
    4: "சர ராசி", 5: "ஸ்திர ராசி", 6: "உபய ராசி",
    7: "சர ராசி", 8: "ஸ்திர ராசி", 9: "உபய ராசி",
    10: "சர ராசி", 11: "ஸ்திர ராசி", 12: "உபய ராசி"
}

# Classical Jaimini / Parashara Mobility Combination Table -> Ayurdaya category
# (Sign1_Mobility, Sign2_Mobility) -> Category
THREE_PAIRS_TABLE: Dict[tuple, str] = {
    ("Chara", "Chara"): "Deergha",
    ("Chara", "Sthira"): "Alpa",
    ("Chara", "Ubhaya"): "Madhya",
    ("Sthira", "Chara"): "Alpa",
    ("Sthira", "Sthira"): "Madhya",
    ("Sthira", "Ubhaya"): "Deergha",
    ("Ubhaya", "Chara"): "Madhya",
    ("Ubhaya", "Sthira"): "Deergha",
    ("Ubhaya", "Ubhaya"): "Alpa",
}

AYUSH_CATEGORIES = {
    "Deergha": {
        "label_en": "Deergha Ayush / Purna Ayush (Long Life: 75–100+ Years)",
        "label_ta": "தீர்க்காயுள் / பூர்ணாயுசு (நீண்ட ஆயுள்: 75 முதல் 100+ ஆண்டுகள்)",
        "range_years": "75 - 100+ Years",
        "description_en": "Strong life vitality and natural longevity indicated by classical planetary placements.",
        "description_ta": "ஜாதகத்தில் லக்னம், எட்டாம் பாவம் மற்றும் ஆயுள்காரகன் சனி சுப பலத்துடன் நீண்ட ஆயுளை அருள்கின்றனர்."
    },
    "Madhya": {
        "label_en": "Madhya Ayush (Medium Life: 36–75 Years)",
        "label_ta": "மத்தியாயுள் (நடுத்தர ஆயுள்: 36 முதல் 75 ஆண்டுகள்)",
        "range_years": "36 - 75 Years",
        "description_en": "Moderate lifespan indicated, enhanced significantly by benefic aspects and lifestyle discipline.",
        "description_ta": "நடுத்தர ஆயுள் அமைப்பு; சுப கிரகங்களின் பார்வை மற்றும் முறையான வாழ்வியல் வழிகாட்டலால் ஆயுள் பலம் மேலும் கூடும்."
    },
    "Alpa": {
        "label_en": "Alpa Ayush (Subject to Astrological Enhancement: 0–36 Years)",
        "label_ta": "அல்பாயுள் (பரிகாரங்களால் விருத்தி செய்யப்பட வேண்டிய ஆயுள் நிலை)",
        "range_years": "Requires Ayush Enhancement",
        "description_en": "Vulnerable longevity combinations requiring classical remedial protections such as Maha Mrityunjaya and Ayush Homam.",
        "description_ta": "ஆயுள் ஸ்தானத்தில் உள்ள சவால்கள்; தகுந்த பரிகாரங்கள் (மகா மிருத்யுஞ்சய மந்திரம், ஆயுஷ் ஹோமம்) மூலம் நலம் பெறலாம்."
    }
}


def calculate_ayurdaya(
    lagna_sign: int,
    planets_by_name: Dict[str, Dict[str, Any]],
    sarvashtakavarga: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Computes comprehensive Ayurdaya (Longevity Determination) per BPHS & Phaladeepika.
    """
    # 1. Eighth House & Lord
    eighth_sign = ((lagna_sign - 1 + 7) % 12) + 1
    eighth_lord_name = SIGN_LABELS[eighth_sign]["lord"]
    lagna_lord_name = SIGN_LABELS[lagna_sign]["lord"]

    lagna_lord_pos = planets_by_name.get(lagna_lord_name, {})
    eighth_lord_pos = planets_by_name.get(eighth_lord_name, {})
    moon_pos = planets_by_name.get("Moon", {})
    saturn_pos = planets_by_name.get("Saturn", {})

    lagna_lord_sign = lagna_lord_pos.get("rasi_number", lagna_sign)
    eighth_lord_sign = eighth_lord_pos.get("rasi_number", eighth_sign)
    moon_sign = moon_pos.get("rasi_number", 1)
    saturn_sign = saturn_pos.get("rasi_number", 1)

    # Hora Lagna approximation (BPHS: Sunrise-based Hora placement)
    hora_lagna_sign = ((lagna_sign - 1 + 4) % 12) + 1

    # 2. Three Pairs Determination (BPHS Method)
    # Pair 1: Lagna Lord & 8th Lord
    mob1 = SIGN_MOBILITY.get(lagna_lord_sign, "Chara")
    mob2 = SIGN_MOBILITY.get(eighth_lord_sign, "Chara")
    pair1_cat = THREE_PAIRS_TABLE.get((mob1, mob2), "Madhya")

    # Pair 2: Moon & Saturn (Ayushkaraka)
    mob3 = SIGN_MOBILITY.get(moon_sign, "Chara")
    mob4 = SIGN_MOBILITY.get(saturn_sign, "Chara")
    pair2_cat = THREE_PAIRS_TABLE.get((mob3, mob4), "Madhya")

    # Pair 3: Lagna & 8th House (or Hora Lagna)
    mob5 = SIGN_MOBILITY.get(lagna_sign, "Chara")
    mob6 = SIGN_MOBILITY.get(hora_lagna_sign, "Chara")
    pair3_cat = THREE_PAIRS_TABLE.get((mob5, mob6), "Madhya")

    # Majority vote across 3 pairs
    votes = [pair1_cat, pair2_cat, pair3_cat]
    deergha_count = votes.count("Deergha")
    madhya_count = votes.count("Madhya")
    alpa_count = votes.count("Alpa")

    if deergha_count >= 2:
        base_cat = "Deergha"
    elif madhya_count >= 2:
        base_cat = "Madhya"
    elif alpa_count >= 2:
        base_cat = "Alpa"
    else:
        # All 3 differ: Pair 2 (Moon & Saturn) or Pair 1 breaks tie
        base_cat = pair1_cat

    # 3. Benefic/Malefic Modifiers (Phaladeepika Ch. 13)
    # Natural Benefics (Jupiter, Venus, Mercury) in Kendras (1, 4, 7, 10) or Trikonas (5, 9) promote longevity
    benefics_in_kendra_trikona = 0
    for b_name in ["Jupiter", "Venus", "Mercury"]:
        p = planets_by_name.get(b_name, {})
        p_sign = p.get("rasi_number", 0)
        house_from_lagna = ((p_sign - lagna_sign) % 12) + 1
        if house_from_lagna in (1, 4, 5, 7, 9, 10):
            benefics_in_kendra_trikona += 1

    # Saturn in 8th house is classical Ayush-karaka placement giving long life (சனீஸ்வரன் 8-ல்)
    saturn_house = ((saturn_sign - lagna_sign) % 12) + 1
    saturn_in_8th = (saturn_house == 8)

    # Upgrade category if strong benefics protect Kendra or Saturn in 8th
    final_cat = base_cat
    if (benefics_in_kendra_trikona >= 2 or saturn_in_8th) and final_cat == "Alpa":
        final_cat = "Madhya"
    elif benefics_in_kendra_trikona >= 2 and saturn_in_8th and final_cat == "Madhya":
        final_cat = "Deergha"

    # 4. Eighth House Occupants & Aspects
    eighth_occupants = []
    for name, p in planets_by_name.items():
        if p.get("rasi_number") == eighth_sign:
            eighth_occupants.append(name)

    eighth_sign_info = SIGN_LABELS[eighth_sign]
    eighth_lord_ta = PLANET_LABELS.get(eighth_lord_name, {}).get("ta", eighth_lord_name)

    eighth_desc = (
        f"The 8th House of Longevity falls in {eighth_sign_info['sa']} ({eighth_sign_info['en']}) ruled by {eighth_lord_name}. "
        f"{'Occupied by ' + ', '.join(eighth_occupants) + '.' if eighth_occupants else 'Free from direct malefic occupation.'} "
        f"{'Saturn is posited in the 8th house, a classical karako-bhava-nasaya exception that strongly grants long life.' if saturn_in_8th else ''}"
    )
    eighth_desc_ta = (
        f"ஆயுள் ஸ்தானமான 8-ஆம் பாவம் {eighth_sign_info['ta']} ராசியில் அமைந்துள்ளது. அதிபதி {eighth_lord_ta}. "
        f"{'இங்கு ' + ', '.join([PLANET_LABELS.get(o, {}).get('ta', o) for o in eighth_occupants]) + ' அமர்ந்துள்ளது.' if eighth_occupants else 'நேரடி பாவ கிரகங்களின் சேர்க்கை இன்றி சுபத்தன்மை பெற்றுள்ளது.'} "
        f"{'ஆயுள்காரகன் சனி பகவான் 8-ல் அமர்ந்துள்ளது ஆயுள் தீர்க்கம் தரும் விசேஷ அமைப்பாகும்.' if saturn_in_8th else ''}"
    )

    # 5. Saturn (Ayushkaraka) Status
    saturn_dignity = saturn_pos.get("status", "Direct")
    saturn_dignity_ta = saturn_pos.get("status_ta", saturn_dignity)
    saturn_desc = (
        f"Ayushkaraka Saturn is situated in House {saturn_house} ({SIGN_LABELS[saturn_sign]['sa']}) with {saturn_dignity} status. "
        f"{'Strong dignity strengthens overall vitality and endurance.' if saturn_dignity in ('Own', 'Exalted') else 'Governs longevity and sustained health throughout dasha periods.'}"
    )
    saturn_desc_ta = (
        f"ஆயுள்காரகன் சனி பகவான் லக்னத்திற்கு {saturn_house}-ஆம் வீட்டில் ({SIGN_LABELS[saturn_sign]['ta']}) {saturn_dignity_ta} நிலையில் உள்ளார். "
        f"ஆயுள் பலம், திடமான உடல் உறுதி மற்றும் நீண்ட ஆயுளைத் தரும் காரணகர்த்தாவாக திகழ்கிறார்."
    )

    # 6. Maraka & Badhaka Analysis
    # Maraka houses: 2nd and 7th
    h2_sign = ((lagna_sign - 1 + 1) % 12) + 1
    h7_sign = ((lagna_sign - 1 + 6) % 12) + 1
    maraka_lords = [SIGN_LABELS[h2_sign]["lord"], SIGN_LABELS[h7_sign]["lord"]]
    maraka_lords_ta = [PLANET_LABELS.get(l, {}).get("ta", l) for l in maraka_lords]

    # Badhaka Sthana rule
    lagna_mob = SIGN_MOBILITY.get(lagna_sign, "Chara")
    if lagna_mob == "Chara":
        badhaka_house = 11
    elif lagna_mob == "Sthira":
        badhaka_house = 9
    else:
        badhaka_house = 7
    badhaka_sign = ((lagna_sign - 1 + (badhaka_house - 1)) % 12) + 1
    badhaka_lord = SIGN_LABELS[badhaka_sign]["lord"]
    badhaka_lord_ta = PLANET_LABELS.get(badhaka_lord, {}).get("ta", badhaka_lord)

    maraka_desc = (
        f"Maraka Houses are 2nd ({SIGN_LABELS[h2_sign]['sa']}) and 7th ({SIGN_LABELS[h7_sign]['sa']}) ruled by "
        f"{maraka_lords[0]} and {maraka_lords[1]} respectively."
    )
    maraka_desc_ta = (
        f"மாரக ஸ்தானங்கள்: 2-ஆம் பாவம் ({SIGN_LABELS[h2_sign]['ta']}) அதிபதி {maraka_lords_ta[0]}; "
        f"7-ஆம் பாவம் ({SIGN_LABELS[h7_sign]['ta']}) அதிபதி {maraka_lords_ta[1]}."
    )

    badhaka_desc = (
        f"For {SIGN_MOBILITY_TA.get(lagna_sign, '')}, Badhaka Sthana is the {badhaka_house}th house "
        f"({SIGN_LABELS[badhaka_sign]['sa']}) ruled by {badhaka_lord}."
    )
    badhaka_desc_ta = (
        f"{SIGN_MOBILITY_TA.get(lagna_sign, '')} லக்னத்திற்கு பாதக ஸ்தானம் {badhaka_house}-ஆம் வீடு "
        f"({SIGN_LABELS[badhaka_sign]['ta']}), அதன் அதிபதி {badhaka_lord_ta}."
    )

    # 7. Ashtakavarga 8th house points
    ashtaka_8th = 0
    if sarvashtakavarga and len(sarvashtakavarga) >= 12:
        ashtaka_8th = sarvashtakavarga[eighth_sign - 1]

    # 8. Classical Remedies
    remedies = [
        "Chant the Maha Mrityunjaya Mantra (Om Tryambakam Yajamahe...) daily for health and vitality.",
        "Perform Ayush Homam or Mrityunjaya Homam on Janma Nakshatra (birth star day) each year.",
        "Offer worship to Lord Shiva (Amritaghateswarar at Thirukkadaiyur or Vaitheeswaran Koil).",
        "Light a sesame oil lamp for Lord Shani (Saturn) on Saturdays and support the needy."
    ]
    remedies_ta = [
        "தினசரி 'ஓம் த்ரயம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம்...' என்ற மகா மிருத்யுஞ்சய மந்திரத்தை 11 முறை ஜபிக்கவும்.",
        "வருடந்தோறும் ஜென்ம நட்சத்திர நாளில் ஆயுஷ் ஹோமம் அல்லது ருத்ராபிஷேகம் செய்வது ஆயுள் விருத்தி தரும்.",
        "திருக்கடையூர் அமிர்தகடேஸ்வரர் - அபிராமி அம்பாள் அல்லது வைத்தீஸ்வரன் கோவில் சென்று வழிபடுதல் மங்களம் தரும்.",
        "சனிக்கிழமைகளில் சனி பகவானுக்கு நல்லெண்ணெய் தீபமேற்றி, இயலாதவர்களுக்கு அன்னதானம் செய்து வரவும்."
    ]

    cat_meta = AYUSH_CATEGORIES.get(final_cat, AYUSH_CATEGORIES["Madhya"])

    return {
        "ayush_category": final_cat,
        "ayush_category_label": cat_meta["label_en"],
        "ayush_category_ta": cat_meta["label_ta"],
        "ayush_years_range": cat_meta["range_years"],
        "description": cat_meta["description_en"],
        "description_ta": cat_meta["description_ta"],
        "three_pairs": {
            "pair1_lagna_8th_lord": f"{mob1} + {mob2} = {pair1_cat}",
            "pair2_moon_saturn": f"{mob3} + {mob4} = {pair2_cat}",
            "pair3_lagna_hora": f"{mob5} + {mob6} = {pair3_cat}",
        },
        "eighth_house_sign": eighth_sign_info["sa"],
        "eighth_house_sign_ta": eighth_sign_info["ta"],
        "eighth_house_lord": eighth_lord_name,
        "eighth_house_lord_ta": eighth_lord_ta,
        "eighth_house_occupants": eighth_occupants,
        "eighth_house_analysis": eighth_desc,
        "eighth_house_analysis_ta": eighth_desc_ta,
        "ayushkaraka_saturn_house": saturn_house,
        "ayushkaraka_saturn_dignity": saturn_dignity,
        "ayushkaraka_saturn_analysis": saturn_desc,
        "ayushkaraka_saturn_analysis_ta": saturn_desc_ta,
        "maraka_lords": maraka_lords,
        "maraka_lords_ta": maraka_lords_ta,
        "maraka_analysis": maraka_desc,
        "maraka_analysis_ta": maraka_desc_ta,
        "badhaka_house": badhaka_house,
        "badhaka_lord": badhaka_lord,
        "badhaka_lord_ta": badhaka_lord_ta,
        "badhaka_analysis": badhaka_desc,
        "badhaka_analysis_ta": badhaka_desc_ta,
        "ashtakavarga_ayush_points": ashtaka_8th,
        "remedies": remedies,
        "remedies_ta": remedies_ta,
        "classical_source": "Brihat Parashara Hora Shastra Ch. 44–45, Phaladeepika Ch. 13"
    }
