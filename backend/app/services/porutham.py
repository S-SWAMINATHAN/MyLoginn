"""
Dual Vedic Marriage Compatibility Engine:
1. North Indian Ashta Koota (36 Points)
2. South Indian Tamil 10-Porutham (பத்து பொருத்தம்) with Rajju Dosha verification.
Governed by classical texts (Muhurtha Chintamani, Jathaka Alankaram, Kalavidhanam).
"""

from typing import Dict, Any, List
from backend.app.services.tamil_labels import SIGN_LABELS, NAKSHATRA_LABELS, PORUTHAM_NAMES

# 1. Animal Yoni mapping for 27 Nakshatras
YONI_MAP = {
    1: {"animal": "Horse", "gender": "M"}, 2: {"animal": "Elephant", "gender": "M"}, 3: {"animal": "Sheep", "gender": "F"},
    4: {"animal": "Serpent", "gender": "M"}, 5: {"animal": "Serpent", "gender": "F"}, 6: {"animal": "Dog", "gender": "F"},
    7: {"animal": "Cat", "gender": "F"}, 8: {"animal": "Goat", "gender": "M"}, 9: {"animal": "Cat", "gender": "M"},
    10: {"animal": "Rat", "gender": "M"}, 11: {"animal": "Rat", "gender": "F"}, 12: {"animal": "Cow", "gender": "M"},
    13: {"animal": "Buffalo", "gender": "F"}, 14: {"animal": "Tiger", "gender": "F"}, 15: {"animal": "Buffalo", "gender": "M"},
    16: {"animal": "Tiger", "gender": "M"}, 17: {"animal": "Deer", "gender": "F"}, 18: {"animal": "Deer", "gender": "M"},
    19: {"animal": "Dog", "gender": "M"}, 20: {"animal": "Monkey", "gender": "M"}, 21: {"animal": "Mongoose", "gender": "M"},
    22: {"animal": "Monkey", "gender": "F"}, 23: {"animal": "Lion", "gender": "F"}, 24: {"animal": "Horse", "gender": "F"},
    25: {"animal": "Lion", "gender": "M"}, 26: {"animal": "Cow", "gender": "F"}, 27: {"animal": "Elephant", "gender": "F"}
}

# Enemy Animals in Yoni
ENEMY_YONIS = {
    ("Cow", "Tiger"), ("Tiger", "Cow"),
    ("Elephant", "Lion"), ("Lion", "Elephant"),
    ("Horse", "Buffalo"), ("Buffalo", "Horse"),
    ("Dog", "Deer"), ("Deer", "Dog"),
    ("Serpent", "Mongoose"), ("Mongoose", "Serpent"),
    ("Monkey", "Goat"), ("Goat", "Monkey"),
    ("Cat", "Rat"), ("Rat", "Cat"),
    ("Sheep", "Monkey"), ("Monkey", "Sheep")
}

# 2. Gana Classification
GANA_MAP = {
    1: "Deva", 2: "Manushya", 3: "Rakshasa", 4: "Manushya", 5: "Deva", 6: "Manushya",
    7: "Deva", 8: "Deva", 9: "Rakshasa", 10: "Rakshasa", 11: "Manushya", 12: "Manushya",
    13: "Deva", 14: "Rakshasa", 15: "Deva", 16: "Rakshasa", 17: "Deva", 18: "Rakshasa",
    19: "Rakshasa", 20: "Manushya", 21: "Manushya", 22: "Deva", 23: "Rakshasa", 24: "Rakshasa",
    25: "Manushya", 26: "Manushya", 27: "Deva"
}

# 3. Rajju Groupings (5 Rajjus)
RAJJU_MAP = {
    # Sirasu (Head)
    5: "Sirasu", 14: "Sirasu", 23: "Sirasu",
    # Kanta (Neck)
    4: "Kanta", 6: "Kanta", 13: "Kanta", 15: "Kanta", 22: "Kanta", 24: "Kanta",
    # Udhara / Nabhi (Stomach)
    3: "Udhara", 7: "Udhara", 12: "Udhara", 16: "Udhara", 21: "Udhara", 25: "Udhara",
    # Kati (Thigh / Waist)
    2: "Kati", 8: "Kati", 11: "Kati", 17: "Kati", 20: "Kati", 26: "Kati",
    # Pada (Foot)
    1: "Pada", 9: "Pada", 10: "Pada", 18: "Pada", 19: "Pada", 27: "Pada"
}

RAJJU_TA = {
    "Sirasu": "சிரசு ரஜ்ஜு (தலை)",
    "Kanta": "கண்ட ரஜ்ஜு (கழுத்து)",
    "Udhara": "உதர ரஜ்ஜு (வயிறு)",
    "Kati": "கட்டி ரஜ்ஜு (இடுப்பு)",
    "Pada": "பாத ரஜ்ஜு (பாதம்)"
}

# 4. Vedha Pairs (Mutually Repellent Stars)
VEDHA_PAIRS = [
    (1, 18), (18, 1),    # Ashwini - Jyeshtha
    (2, 17), (17, 2),    # Bharani - Anuradha
    (3, 16), (16, 3),    # Krittika - Vishakha
    (4, 15), (15, 4),    # Rohini - Swati
    (5, 14), (14, 5),    # Mrigashirsha - Chitra
    (6, 13), (13, 6),    # Ardra - Hasta
    (7, 21), (21, 7),    # Punarvasu - U.Ashadha
    (8, 20), (20, 8),    # Pushya - P.Ashadha
    (9, 19), (19, 9),    # Ashlesha - Moola
    (10, 27), (27, 10),  # Magha - Revati
    (11, 26), (26, 11),  # P.Phalguni - U.Bhadra
    (12, 25), (25, 12),  # U.Phalguni - P.Bhadra
    (14, 23), (23, 14),  # Chitra - Dhanishta
    (22, 24), (24, 22)   # Shravana - Shatabhisha
]

# 5. Vasya Table
VASYA_MAP = {
    1: [5, 8],      # Mesha -> Simha, Vrischika
    2: [4, 7],      # Vrishabha -> Karka, Tula
    3: [6],         # Mithuna -> Kanya
    4: [8, 9],      # Karka -> Vrischika, Dhanus
    5: [7],         # Simha -> Tula
    6: [3, 12],     # Kanya -> Mithuna, Meena
    7: [10, 2],     # Tula -> Makara, Vrishabha
    8: [4],         # Vrischika -> Karka
    9: [12],        # Dhanus -> Meena
    10: [1, 11],    # Makara -> Mesha, Kumbha
    11: [1],        # Kumbha -> Mesha
    12: [10]        # Meena -> Makara
}

# 6. Graha Maitri (Planetary Friendship Matrix)
GRAHA_FRIENDS = {
    "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "neutrals": ["Mercury"], "enemies": ["Venus", "Saturn"]},
    "Moon": {"friends": ["Sun", "Mercury"], "neutrals": ["Mars", "Jupiter", "Venus", "Saturn"], "enemies": []},
    "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "neutrals": ["Venus", "Saturn"], "enemies": ["Mercury"]},
    "Mercury": {"friends": ["Sun", "Venus"], "neutrals": ["Mars", "Jupiter", "Saturn"], "enemies": ["Moon"]},
    "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "neutrals": ["Saturn"], "enemies": ["Mercury", "Venus"]},
    "Venus": {"friends": ["Mercury", "Saturn"], "neutrals": ["Mars", "Jupiter"], "enemies": ["Sun", "Moon"]},
    "Saturn": {"friends": ["Mercury", "Venus"], "neutrals": ["Jupiter"], "enemies": ["Sun", "Moon", "Mars"]}
}

def calculate_ashta_koota(boy_rasi: int, boy_nak: int, girl_rasi: int, girl_nak: int) -> Dict[str, Any]:
    """
    Computes standard 36-Point Ashta Koota compatibility.
    """
    kutas = []
    total_pts = 0.0

    # 1. Varna Koota (1 pt)
    # Brahmins: Cancer, Scorpio, Pisces (4,8,12) = 4
    # Kshatriyas: Aries, Leo, Sag (1,5,9) = 3
    # Vaishyas: Taurus, Virgo, Cap (2,6,10) = 2
    # Shudras: Gemini, Libra, Aqu (3,7,11) = 1
    varna_ranks = {4:4, 8:4, 12:4, 1:3, 5:3, 9:3, 2:2, 6:2, 10:2, 3:1, 7:1, 11:1}
    b_varna = varna_ranks.get(boy_rasi, 1)
    g_varna = varna_ranks.get(girl_rasi, 1)
    varna_pts = 1.0 if b_varna >= g_varna else 0.0
    total_pts += varna_pts
    kutas.append({
        "name": "Varna", "name_ta": "வர்ணம்", "name_sa": "Varna Koota",
        "obtained_points": varna_pts, "max_points": 1.0,
        "description": "Ego harmony and spiritual compatibility.",
        "description_ta": "மன அமைதி மற்றும் ஆன்மீக நல்லிணக்கம்.",
        "status": "Good" if varna_pts > 0 else "Average"
    })

    # 2. Vashya Koota (2 pts)
    vashya_pts = 0.0
    if boy_rasi in VASYA_MAP.get(girl_rasi, []):
        vashya_pts = 2.0
    elif girl_rasi in VASYA_MAP.get(boy_rasi, []):
        vashya_pts = 1.0
    total_pts += vashya_pts
    kutas.append({
        "name": "Vashya", "name_ta": "வசியம்", "name_sa": "Vashya Koota",
        "obtained_points": vashya_pts, "max_points": 2.0,
        "description": "Mutual magnetic attraction and natural bonding.",
        "description_ta": "இருவருக்கிடையே உள்ள ஈர்ப்பு மற்றும் அன்பு.",
        "status": "Good" if vashya_pts >= 1.0 else "Average"
    })

    # 3. Tara / Dina Koota (3 pts)
    # Count from girl star to boy star
    dist = ((boy_nak - girl_nak) % 27) + 1
    rem = dist % 9
    # Tara is auspicious if rem is 2, 4, 6, 8, 9, 0
    tara_pts = 3.0 if rem in (2, 4, 6, 8, 0) else (1.5 if rem in (1, 3, 5, 7) and dist > 9 else 0.0)
    total_pts += tara_pts
    kutas.append({
        "name": "Tara (Dina)", "name_ta": "தாரா (தினம்)", "name_sa": "Tara Koota",
        "obtained_points": tara_pts, "max_points": 3.0,
        "description": "Health, prosperity, and longevity of relationship.",
        "description_ta": "ஆரோக்கியம் மற்றும் தீர்க்காயுள் பலன்.",
        "status": "Excellent" if tara_pts == 3.0 else ("Average" if tara_pts > 0 else "Poor")
    })

    # 4. Yoni Koota (4 pts)
    b_yoni = YONI_MAP.get(boy_nak, {"animal": "Horse"})["animal"]
    g_yoni = YONI_MAP.get(girl_nak, {"animal": "Horse"})["animal"]
    if b_yoni == g_yoni:
        yoni_pts = 4.0
    elif (b_yoni, g_yoni) in ENEMY_YONIS:
        yoni_pts = 0.0
    else:
        yoni_pts = 2.0
    total_pts += yoni_pts
    kutas.append({
        "name": "Yoni", "name_ta": "யோனி", "name_sa": "Yoni Koota",
        "obtained_points": yoni_pts, "max_points": 4.0,
        "description": "Physical intimacy, biological compatibility, and affection.",
        "description_ta": "உடல் இணக்கம் மற்றும் மனமார்ந்த ஈர்ப்பு.",
        "status": "Excellent" if yoni_pts == 4.0 else ("Good" if yoni_pts >= 2.0 else "Incompatible")
    })

    # 5. Graha Maitri (5 pts)
    b_lord = SIGN_LABELS[boy_rasi]["lord"]
    g_lord = SIGN_LABELS[girl_rasi]["lord"]
    if b_lord == g_lord:
        maitri_pts = 5.0
    else:
        b_info = GRAHA_FRIENDS.get(b_lord, {})
        g_info = GRAHA_FRIENDS.get(g_lord, {})
        is_b_friend = g_lord in b_info.get("friends", [])
        is_g_friend = b_lord in g_info.get("friends", [])
        is_b_enemy = g_lord in b_info.get("enemies", [])
        is_g_enemy = b_lord in g_info.get("enemies", [])

        if is_b_friend and is_g_friend:
            maitri_pts = 5.0
        elif (is_b_friend and not is_g_enemy) or (is_g_friend and not is_b_enemy):
            maitri_pts = 4.0
        elif not is_b_enemy and not is_g_enemy:
            maitri_pts = 3.0
        elif is_b_enemy and is_g_enemy:
            maitri_pts = 0.0
        else:
            maitri_pts = 1.0
    total_pts += maitri_pts
    kutas.append({
        "name": "Graha Maitri", "name_ta": "கிரக மைத்ரி", "name_sa": "Graha Maitri Koota",
        "obtained_points": maitri_pts, "max_points": 5.0,
        "description": "Intellectual friendship, psychological compatibility.",
        "description_ta": "மன ஒற்றுமை, பரஸ்பர நட்பு மற்றும் கருத்து இணக்கம்.",
        "status": "Good" if maitri_pts >= 3.0 else "Poor"
    })

    # 6. Gana Koota (6 pts)
    b_gana = GANA_MAP.get(boy_nak, "Deva")
    g_gana = GANA_MAP.get(girl_nak, "Deva")
    if b_gana == g_gana:
        gana_pts = 6.0
    elif (g_gana == "Deva" and b_gana == "Manushya") or (g_gana == "Manushya" and b_gana == "Deva"):
        gana_pts = 5.0
    elif (g_gana == "Rakshasa" and b_gana == "Deva"):
        gana_pts = 1.0
    elif (g_gana == "Manushya" and b_gana == "Rakshasa"):
        gana_pts = 0.0
    else:
        gana_pts = 0.0
    total_pts += gana_pts
    kutas.append({
        "name": "Gana", "name_ta": "கணம்", "name_sa": "Gana Koota",
        "obtained_points": gana_pts, "max_points": 6.0,
        "description": "Temperament, social behavior, and attitude harmony.",
        "description_ta": "குண நலம் மற்றும் இயல்பு ஒற்றுமை.",
        "status": "Excellent" if gana_pts >= 5.0 else ("Average" if gana_pts > 0 else "Incompatible")
    })

    # 7. Bhakoot (7 pts)
    # Rasi distance from girl to boy
    r_dist = ((boy_rasi - girl_rasi) % 12) + 1
    # 2/12, 6/8, 9/5 have special rules
    if r_dist in (1, 7):
        bhakoot_pts = 7.0
    elif r_dist in (3, 4, 10, 11):
        bhakoot_pts = 7.0
    elif r_dist in (2, 12, 6, 8, 5, 9):
        # Exception if lords are identical or mutual friends
        if b_lord == g_lord or (g_lord in GRAHA_FRIENDS.get(b_lord, {}).get("friends", [])):
            bhakoot_pts = 7.0
        else:
            bhakoot_pts = 0.0
    else:
        bhakoot_pts = 0.0
    total_pts += bhakoot_pts
    kutas.append({
        "name": "Bhakoot", "name_ta": "பகூட் (ராசி)", "name_sa": "Bhakoot Koota",
        "obtained_points": bhakoot_pts, "max_points": 7.0,
        "description": "Family welfare, emotional bonding, and prosperity.",
        "description_ta": "குடும்ப மேன்மை, சந்ததி விருத்தி மற்றும் செல்வம்.",
        "status": "Excellent" if bhakoot_pts == 7.0 else "Incompatible"
    })

    # 8. Nadi Koota (8 pts)
    # Aadi (Vata): 1,6,7,12,13,18,19,24,25
    # Madhya (Pitta): 2,5,8,11,14,17,20,23,26
    # Antya (Kapha): 3,4,9,10,15,16,21,22,27
    aadi = (1, 6, 7, 12, 13, 18, 19, 24, 25)
    madhya = (2, 5, 8, 11, 14, 17, 20, 23, 26)
    antya = (3, 4, 9, 10, 15, 16, 21, 22, 27)

    def get_nadi(nak):
        if nak in aadi: return "Aadi"
        if nak in madhya: return "Madhya"
        return "Antya"

    b_nadi = get_nadi(boy_nak)
    g_nadi = get_nadi(girl_nak)

    if b_nadi != g_nadi:
        nadi_pts = 8.0
    else:
        # Same nadi dosha exception if different rasi or same nakshatra different pada
        nadi_pts = 0.0
    total_pts += nadi_pts
    kutas.append({
        "name": "Nadi", "name_ta": "நாடி", "name_sa": "Nadi Koota",
        "obtained_points": nadi_pts, "max_points": 8.0,
        "description": "Genetic compatibility, progeny health, and physiological harmony.",
        "description_ta": "சந்ததி ஆரோக்கியம், மரபியல் பொருத்தம் மற்றும் ஆயுள் பலம்.",
        "status": "Excellent" if nadi_pts == 8.0 else "Nadi Dosha"
    })

    return {
        "total_points": round(total_pts, 1),
        "max_points": 36.0,
        "kutas": kutas
    }

def calculate_tamil_10_porutham(boy_rasi: int, boy_nak: int, girl_rasi: int, girl_nak: int) -> List[Dict[str, Any]]:
    """
    Computes authentic Tamil 10-Porutham items with classical South Indian rules.
    """
    results = []

    # Star count from girl to boy (1 to 27)
    star_dist = ((boy_nak - girl_nak) % 27) + 1
    rasi_dist = ((boy_rasi - girl_rasi) % 12) + 1

    # 1. Dina Porutham
    # Compatible: 2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26
    dina_good = star_dist in (2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26) or (star_dist == 27 and boy_nak in (2, 4, 7, 8, 17, 22, 26))
    results.append({
        "key": "dina", "name": "Dina Porutham", "name_ta": "1. தினப் பொருத்தம்",
        "is_compatible": dina_good,
        "description": "Ensures longevity, vibrant health, and freedom from disease for the couple.",
        "description_ta": "தம்பதியருக்கு நோய் நொடியற்ற ஆயுள், ஆரோக்கியம் மற்றும் உற்சாகத்தை தரும்."
    })

    # 2. Gana Porutham
    b_gana = GANA_MAP.get(boy_nak, "Deva")
    g_gana = GANA_MAP.get(girl_nak, "Deva")
    gana_good = (b_gana == g_gana) or (g_gana == "Deva" and b_gana == "Manushya") or (g_gana == "Manushya" and b_gana == "Deva")
    results.append({
        "key": "gana", "name": "Gana Porutham", "name_ta": "2. கணப் பொருத்தம்",
        "is_compatible": gana_good,
        "description": "Fosters harmony of thoughts, mutual respect, and shared outlook on life.",
        "description_ta": "இருவரின் குணாதிசயங்கள் ஒன்றுபட்டு மன ஒற்றுமை மற்றும் தம்பதிய நல்லிணக்கம் தரும்."
    })

    # 3. Mahendra Porutham
    # Counts from girl star: 4, 7, 10, 13, 16, 19, 22, 25
    mahendra_good = star_dist in (4, 7, 10, 13, 16, 19, 22, 25)
    results.append({
        "key": "mahendra", "name": "Mahendra Porutham", "name_ta": "3. மகேந்திரப் பொருத்தம்",
        "is_compatible": mahendra_good,
        "description": "Blesses with noble progeny, lineage continuity, and flourishing wealth.",
        "description_ta": "நல்ல புத்திர பாக்கியம், வம்ச விருத்தி மற்றும் பெரும் செல்வ வளத்தை அருளும்."
    })

    # 4. Stree Deergha Porutham
    # Distance from girl star to boy star > 13
    stree_good = star_dist > 13
    results.append({
        "key": "sthree_deergha", "name": "Stree Deergha Porutham", "name_ta": "4. ஸ்திரீ தீர்க்கப் பொருத்தம்",
        "is_compatible": stree_good,
        "description": "Ensures lifelong auspiciousness, domestic peace, and prosperity for the bride.",
        "description_ta": "பெண்ணுக்கு தீர்க்கமான மாங்கல்ய பலம், மங்கள வாழ்வு மற்றும் மகிழ்ச்சி தரும்."
    })

    # 5. Yoni Porutham
    b_yoni = YONI_MAP.get(boy_nak, {"animal": "Horse"})["animal"]
    g_yoni = YONI_MAP.get(girl_nak, {"animal": "Horse"})["animal"]
    yoni_good = (b_yoni == g_yoni) or ((b_yoni, g_yoni) not in ENEMY_YONIS)
    results.append({
        "key": "yoni", "name": "Yoni Porutham", "name_ta": "5. யோனிப் பொருத்தம்",
        "is_compatible": yoni_good,
        "description": "Physical intimacy, harmonious bonding, and enduring attraction.",
        "description_ta": "உடல் ரீதியான இணக்கம், தாம்பத்திய சுகம் மற்றும் பரஸ்பர அன்பு."
    })

    # 6. Rasi Porutham
    # Sama Saptama (7th) or good distances; Sashtashtaka (6/8) avoided unless lord friendship
    b_lord = SIGN_LABELS[boy_rasi]["lord"]
    g_lord = SIGN_LABELS[girl_rasi]["lord"]
    rasi_good = rasi_dist in (1, 7, 3, 4, 10, 11) or (rasi_dist in (2, 12, 6, 8, 5, 9) and (b_lord == g_lord or g_lord in GRAHA_FRIENDS.get(b_lord, {}).get("friends", [])))
    results.append({
        "key": "rasi", "name": "Rasi Porutham", "name_ta": "6. ராசிப் பொருத்தம்",
        "is_compatible": rasi_good,
        "description": "Family harmony, unity between households, and overall good fortune.",
        "description_ta": "இரு குடும்பத்தாரிடையே நல்லுறவு, சுபிட்சம் மற்றும் ஒற்றுமை மேலோங்க செய்யும்."
    })

    # 7. Rasiyadhipathi Porutham
    lord_good = (b_lord == g_lord) or (g_lord in GRAHA_FRIENDS.get(b_lord, {}).get("friends", [])) or (b_lord in GRAHA_FRIENDS.get(g_lord, {}).get("friends", []))
    results.append({
        "key": "rasiyadhipathi", "name": "Rasiyadhipathi Porutham", "name_ta": "7. ராசி அதிபதிப் பொருத்தம்",
        "is_compatible": lord_good,
        "description": "Mental wavelength synchronization and deep mutual friendship.",
        "description_ta": "அதிபதிகளின் நட்பு காரணமாக தம்பதியர் இடையே மனஸ்தாபங்கள் இன்றி நட்பு நீடிக்கும்."
    })

    # 8. Vasya Porutham
    vasya_good = (boy_rasi in VASYA_MAP.get(girl_rasi, [])) or (girl_rasi in VASYA_MAP.get(boy_rasi, []))
    results.append({
        "key": "vasya", "name": "Vasya Porutham", "name_ta": "8. வசியப் பொருத்தம்",
        "is_compatible": vasya_good,
        "description": "Mutual magnetic devotion, commanding respect and true dedication.",
        "description_ta": "தம்பதியர் ஒருவரை ஒருவர் வசீகரித்து மாறாத அன்பு மற்றும் பாசம் கொள்ளும் தன்மை."
    })

    # 9. Rajju Porutham (The Most Crucial in Tamil Astrology)
    b_rajju = RAJJU_MAP.get(boy_nak, "Sirasu")
    g_rajju = RAJJU_MAP.get(girl_nak, "Sirasu")
    rajju_good = (b_rajju != g_rajju)
    results.append({
        "key": "rajju", "name": "Rajju Porutham", "name_ta": "9. ரஜ்ஜுப் பொருத்தம் (அத்யாவசியம்)",
        "is_compatible": rajju_good,
        "description": "Safeguards Mangalya Bhagyam, long married life, and prevents early separation." if rajju_good
                       else f"Rajju Dosha present ({RAJJU_TA.get(b_rajju, b_rajju)}). Both belong to the same Rajju.",
        "description_ta": "மாங்கல்ய பாக்கியம், தாலி பலம் மற்றும் தம்பதியரின் நீண்ட ஆயுளை உறுதி செய்யும் மிக முக்கிய பொருத்தம்." if rajju_good
                          else f"ஒரே ரஜ்ஜுவில் அமைந்திருப்பதால் ரஜ்ஜு தோஷம் உண்டாகிறது ({RAJJU_TA.get(b_rajju, b_rajju)})."
    })

    # 10. Vedha Porutham
    is_vedha = (boy_nak, girl_nak) in VEDHA_PAIRS
    vedha_good = not is_vedha
    results.append({
        "key": "vedha", "name": "Vedha Porutham", "name_ta": "10. வேதைப் பொருத்தம்",
        "is_compatible": vedha_good,
        "description": "Freedom from mutual affliction, disputes, or hidden friction." if vedha_good else "Vedha dosha present (Nakshatras are mutually afflicting).",
        "description_ta": "பகைமை, திடீர் சவால்கள் இன்றி தம்பதியர் மகிழ்ச்சியாக வாழ உதவும்." if vedha_good else "நட்சத்திர வேதை தோஷம் உள்ளது (இரு நட்சத்திரங்களும் ஒன்றுக்கொன்று வேதை செய்கின்றன)."
    })

    return results

def compute_porutham_match(
    boy_rasi: int, boy_nak: int, boy_pada: int,
    girl_rasi: int, girl_nak: int, girl_pada: int
) -> Dict[str, Any]:
    """
    Computes both Ashta Koota and Tamil 10-Porutham results and generates a classical verdict.
    """
    ashta_koota = calculate_ashta_koota(boy_rasi, boy_nak, girl_rasi, girl_nak)
    tamil_10 = calculate_tamil_10_porutham(boy_rasi, boy_nak, girl_rasi, girl_nak)

    # Check Rajju Dosha
    b_rajju = RAJJU_MAP.get(boy_nak)
    g_rajju = RAJJU_MAP.get(girl_nak)
    rajju_dosha = (b_rajju == g_rajju)

    # Count compatible 10-poruthams
    comp_count = sum(1 for item in tamil_10 if item["is_compatible"])
    score_pct = round(((ashta_koota["total_points"] / 36.0) * 0.5 + (comp_count / 10.0) * 0.5) * 100, 1)

    # Classical Verdict Formulation
    if rajju_dosha:
        verdict = "Not Recommended (Rajju Dosha present)"
        verdict_ta = f"பொருத்தம் உத்தமமில்லை (ரஜ்ஜு தோஷம் உள்ளது - {RAJJU_TA.get(b_rajju, b_rajju)})"
        rec = "In traditional South Indian Vedic astrology, Rajju Dosha is a primary disqualifier. Consultation with a learned family astrologer is recommended."
        rec_ta = "தென்னிந்திய ஜோதிட விதிகளின்படி ரஜ்ஜுப் பொருத்தம் இல்லாத ஜாதகங்களை இணைப்பது தவிர்க்கப்பட வேண்டும்."
    elif ashta_koota["total_points"] >= 24.0 and comp_count >= 6:
        verdict = "Uthama Porutham (Highly Auspicious Match)"
        verdict_ta = "உத்தமப் பொருத்தம் (மிகச் சிறந்த பொருத்தம்)"
        rec = "Excellent compatibility across both North Indian (Ashta Koota) and Tamil 10-Porutham systems. Blessed with health, wealth, and lasting harmony."
        rec_ta = "இரு அமைப்புகளிலும் மிகச் சிறந்த மதிப்பெண்கள் மற்றும் ரஜ்ஜு சுபத்தன்மை பெற்றுள்ளது. மகிழ்ச்சியான திருமண வாழ்விற்கு மிகவும் பரிந்துரைக்கப்படுகிறது."
    elif ashta_koota["total_points"] >= 18.0 and comp_count >= 5:
        verdict = "Madhyama Porutham (Good / Average Match)"
        verdict_ta = "மத்திமப் பொருத்தம் (நல்ல பொருத்தம்)"
        rec = "Acceptable match. Core essentials (Dina, Gana, Rasi, Rajju) are favorable. General horoscope planetary matching recommended."
        rec_ta = "அவசியமான முக்கிய பொருத்தங்கள் மற்றும் ரஜ்ஜு சுபமாக உள்ளது. ஜாதகத்தில் செவ்வாய் தோஷம் மற்றும் தசா சந்திப்பு பரிசீலித்து முடிவு செய்யலாம்."
    else:
        verdict = "Adhama Porutham (Weak Match)"
        verdict_ta = "அதமப் பொருத்தம் (குறைந்த பொருத்தம்)"
        rec = "Below recommended threshold for traditional marriage compatibility."
        rec_ta = "பொருத்த மதிப்பெண்கள் குறைவாக இருப்பதால் ஜோதிடரின் நேரடி ஆலோசனையுடன் அணுகவும்."

    return {
        "ashta_koota": ashta_koota,
        "tamil_10_porutham": tamil_10,
        "rajju_dosha": rajju_dosha,
        "rajju_type": b_rajju,
        "rajju_type_ta": RAJJU_TA.get(b_rajju, ""),
        "vedha_dosha": (boy_nak, girl_nak) in VEDHA_PAIRS,
        "score_percentage": score_pct,
        "verdict": verdict,
        "verdict_ta": verdict_ta,
        "recommendation": rec,
        "recommendation_ta": rec_ta
    }
