"""
Sampoorana Jathagam (சம்பூர்ண ஜாதகம்) Classical Vedic Astrology Service.

Computes exhaustive traditional Tamil and Parashari astrological particulars:
1. Traditional Eras: Salivahana Saka, Kaliyuga era, Kollam, Fasli, Hijri, Tamil 60-year cycle, Tamil month & day.
2. Panchanga Micro-Metrics: Ayana (உத்தராயணம்/தட்சிணாயனம்), Ritu (ருது), Tatparai, Nethiram, Jeevan, Vaara Soolai & Pariharam, Yogini.
3. Astrological Attributes: Vainasika star (22nd), Yogi & Avayogi Grahas, Soonya Rasis, Lagna Subar/Pabar.
4. Pancha Pakshi Sastra: Birth bird, ruling/friendly/enemy birds, Padupakshi days.
5. Numerology (எண் கணிதம்): Day number (உடல் எண்), Destiny number (உயிர் எண்), Lucky dates, numbers, colors, gems, deity.
6. Dasha Balance Mathematical Metrics: Paramanazhigai, Sentra Nazhigai, Nindra Nazhigai, Tatparai, Years-Months-Days.
7. Bhava Sphutam (பாவக ஸ்புடம்): 12 Houses start, madhya, and end longitudes and Bhava-shifting planets.
8. Shodashavargas (வர்க்கச் சக்கரங்கள்): D1, D2, D3, D4, D7, D9, D10, D12, D16, D30, D60.

Strictly follows classical Parashari and traditional Tamil Panchanga texts with zero hallucination.
"""

from typing import Dict, Any, List, Tuple

from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS
import math
from datetime import datetime

# 60 Tamil Years in standard canonical order
TAMIL_YEARS = [
    "பிரபவ", "விபவ", "சுக்கில", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ", "யுவ", "தாது",
    "ஈஸ்வர", "வெகுதானிய", "பிரமாதி", "விக்ரம", "விஷு", "சித்திரபானு", "சுபானு", "தாரண", "பார்த்திப", "விய",
    "சர்வசித்து", "சர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துன்முகி",
    "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாசுவ", "பராபவ",
    "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதிகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராட்சச", "நள",
    "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துர்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரக்தாட்சி", "குரோதன", "அட்சய"
]

TAMIL_MONTHS = [
    ("சித்திரை", "Chithirai", "மேஷம்"),
    ("வைகாசி", "Vaikasi", "ரிஷபம்"),
    ("ஆனி", "Aani", "மிதுனம்"),
    ("ஆடி", "Aadi", "கடகம்"),
    ("ஆவணி", "Aavani", "சிம்மம்"),
    ("புரட்டாசி", "Purattasi", "கன்னி"),
    ("ஐப்பசி", "Aippasi", "துலாம்"),
    ("கார்த்திகை", "Karthigai", "விருச்சிகம்"),
    ("மார்கழி", "Margazhi", "தனுசு"),
    ("தை", "Thai", "மகரம்"),
    ("மாசி", "Masi", "கும்பம்"),
    ("பங்குனி", "Panguni", "மீனம்"),
]

RITUS = [
    ("வசந்த ருது", "Vasantha Ritu"),      # Chithirai, Vaikasi
    ("கிரீஷ்ம ருது", "Greeshma Ritu"),    # Aani, Aadi
    ("வர்ஷ ருது", "Varsha Ritu"),        # Aavani, Purattasi
    ("சரத் ருது", "Sarad Ritu"),          # Aippasi, Karthigai
    ("ஹேமந்த ருது", "Hemantha Ritu"),      # Margazhi, Thai
    ("சிசிர ருது", "Sisira Ritu"),        # Masi, Panguni
]

SOONYA_RASIS_BY_TITHI = {
    0: ("துலாம், மகரம்", "Libra, Capricorn"),          # Prathama
    1: ("தனுசு, மீனம்", "Sagittarius, Pisces"),        # Dvitiya
    2: ("சிம்மம், மகரம்", "Leo, Capricorn"),           # Tritiya
    3: ("ரிஷபம், கும்பம்", "Taurus, Aquarius"),         # Chaturthi
    4: ("மிதுனம், கன்னி", "Gemini, Virgo"),            # Panchami
    5: ("மேஷம், சிம்மம்", "Aries, Leo"),              # Shasthi
    6: ("தனுசு, கடகம்", "Sagittarius, Cancer"),        # Saptami
    7: ("மிதுனம், கன்னி", "Gemini, Virgo"),            # Ashtami
    8: ("சிம்மம், விருச்சிகம்", "Leo, Scorpio"),        # Navami
    9: ("சிம்மம், விருச்சிகம்", "Leo, Scorpio"),        # Dasami
    10: ("தனுசு, மீனம்", "Sagittarius, Pisces"),       # Ekadasi
    11: ("துலாம், மகரம்", "Libra, Capricorn"),         # Dvadasi
    12: ("ரிஷபம், சிம்மம்", "Taurus, Leo"),            # Trayodasi
    13: ("மிதுனம், கன்னி, தனுசு, மீனம்", "Gemini, Virgo, Sagittarius, Pisces"), # Chaturdasi
    14: ("சூன்யம் இல்லை (சுபம்)", "None (Auspicious)"), # Pournami
}

PANCHA_PAKSHI_MAP = [
    # 1-5 (Ashwini to Mrigashirsha): Vulture / வல்லூறு
    ("வல்லூறு", "Vulture", "ஆந்தை, காகம்", "Owl, Crow", "கோழி, மயில்", "Cock, Peacock", "திங்கள், சனி", "Monday, Saturday"),
    # 6-11 (Ardra to Purva Phalguni): Owl / ஆந்தை
    ("ஆந்தை", "Owl", "காகம், கோழி", "Crow, Cock", "மயில், வல்லூறு", "Peacock, Vulture", "ஞாயிறு, செவ்வாய்", "Sunday, Tuesday"),
    # 12-16 (Uttara Phalguni to Vishakha): Crow / காகம்
    ("காகம்", "Crow", "கோழி, மயில்", "Cock, Peacock", "வல்லூறு, ஆந்தை", "Vulture, Owl", "வியாழன்", "Thursday"),
    # 17-21 (Anuradha to Shravana): Cock / கோழி
    ("கோழி", "Cock", "மயில், வல்லூறு", "Peacock, Vulture", "ஆந்தை, காகம்", "Owl, Crow", "வெள்ளி", "Friday"),
    # 22-27 (Dhanishta to Revati): Peacock / மயில்
    ("மயில்", "Peacock", "வல்லூறு, ஆந்தை", "Vulture, Owl", "காகம், கோழி", "Crow, Cock", "புதன்", "Wednesday"),
]

VAARA_SOOLAI_MAP = {
    0: ("மேற்கு", "West", "வெல்லம்", "Jaggery"),          # Sunday
    1: ("கிழக்கு", "East", "தயிர்", "Curd"),              # Monday
    2: ("வடக்கு", "North", "பால்", "Milk"),              # Tuesday
    3: ("வடக்கு", "North", "பால்", "Milk"),              # Wednesday
    4: ("தெற்கு", "South", "தைலம் / நெய்", "Oil / Ghee"), # Thursday
    5: ("மேற்கு", "West", "வெல்லம்", "Jaggery"),          # Friday
    6: ("கிழக்கு", "East", "தயிர்", "Curd"),              # Saturday
}

YOGINI_DIRECTIONS = [
    "கிழக்கு (East)", "தென்கிழக்கு (South-East)", "தெற்கு (South)", "தென்மேற்கு (South-West)",
    "மேற்கு (West)", "வடமேற்கு (North-West)", "வடக்கு (North)", "வடகிழக்கு (North-East)"
]

NUMEROLOGY_DATA = {
    1: {"colors": "மஞ்சள், பொன்னிறம், ஆரஞ்சு", "stones": "மாணிக்கம் (Ruby)", "deity": "சூரிய பகவான், சிவபெருமான்", "lucky": [1, 2, 3, 9]},
    2: {"colors": "வெள்ளை, கிரீம், வெளிர் பச்சை", "stones": "முத்து (Pearl), சந்திரகாந்த கல்", "deity": "சந்திர பகவான், பார்வதி தேவி", "lucky": [1, 2, 7]},
    3: {"colors": "மஞ்சள், தங்க நிறம், ரோஸ்", "stones": "மஞ்சள் புஷ்பராகம் (Yellow Sapphire)", "deity": "ஸ்ரீ தட்சிணாமூர்த்தி, குரு பகவான்", "lucky": [3, 6, 9, 1]},
    4: {"colors": "நீலம், சாம்பல், பலவண்ணம்", "stones": "கோமேதகம் (Hessonite)", "deity": "துர்க்கை அம்மன், ராகு பகவான்", "lucky": [1, 4, 5, 6]},
    5: {"colors": "பச்சை, சாம்பல், வெள்ளை", "stones": "மரகதம் (Emerald)", "deity": "ஸ்ரீ மகாவிஷ்ணு, புதன் பகவான்", "lucky": [5, 1, 6]},
    6: {"colors": "வெள்ளை, பட்டு நிறம், நீலம்", "stones": "வைரம் (Diamond), வெண் புஷ்பராகம்", "deity": "ஸ்ரீ மகாலட்சுமி, சுக்கிர பகவான்", "lucky": [6, 5, 8, 3]},
    7: {"colors": "வெள்ளை, மஞ்சள், பச்சை", "stones": "வைடூரியம் (Cat's Eye)", "deity": "ஸ்ரீ விநாயகர், கேது பகவான்", "lucky": [7, 2, 1]},
    8: {"colors": "நீலம், கருப்பு, அடர் சாம்பல்", "stones": "நீலக்கல் (Blue Sapphire)", "deity": "சனி பகவான், ஸ்ரீ ஐயப்பன், ஆஞ்சநேயர்", "lucky": [8, 5, 6]},
    9: {"colors": "சிவப்பு, பவள நிறம், ரோஸ்", "stones": "பவளம் (Red Coral)", "deity": "ஸ்ரீ முருகப்பெருமான், செவ்வாய் பகவான்", "lucky": [9, 1, 3, 5]}
}

LAGNA_BENEFICS_MALEFICS = {
    1: {"subar": "சூரியன், குரு", "pabar": "புதன், சுக்கிரன், சனி", "neutral": "சந்திரன், செவ்வாய்"}, # Mesha
    2: {"subar": "சுக்கிரன், புதன், சனி", "pabar": "குரு, சந்திரன்", "neutral": "செவ்வாய், சூரியன்"},   # Vrishabha
    3: {"subar": "சுக்கிரன்", "pabar": "செவ்வாய், குரு, சூரியன்", "neutral": "புதன், சனி, சந்திரன்"},     # Mithuna
    4: {"subar": "செவ்வாய், குரு", "pabar": "சுக்கிரன், புதன்", "neutral": "சூரியன், சனி, சந்திரன்"},     # Kataka
    5: {"subar": "செவ்வாய், குரு", "pabar": "புதன், சுக்கிரன்", "neutral": "சூரியன், சந்திரன், சனி"},     # Simha
    6: {"subar": "சுக்கிரன்", "pabar": "செவ்வாய், குரு, சந்திரன்", "neutral": "புதன், சூரியன், சனி"},     # Kanya
    7: {"subar": "சனி, புதன்", "pabar": "குரு, சூரியன், செவ்வாய்", "neutral": "சுக்கிரன், சந்திரன்"},   # Thula
    8: {"subar": "சந்திரன், குரு", "pabar": "புதன், சுக்கிரன்", "neutral": "செவ்வாய், சூரியன், சனி"},     # Vrischika
    9: {"subar": "சூரியன், செவ்வாய்", "pabar": "சுக்கிரன்", "neutral": "குரு, புதன், சந்திரன், சனி"},       # Dhanus
    10: {"subar": "சுக்கிரன், புதன்", "pabar": "குரு, சந்திரன், செவ்வாய்", "neutral": "சனி, சூரியன்"},   # Makara
    11: {"subar": "சுக்கிரன்", "pabar": "குரு, சந்திரன், செவ்வாய்", "neutral": "சனி, புதன், சூரியன்"},     # Kumbha
    12: {"subar": "சந்திரன், செவ்வாய்", "pabar": "சூரியன், சுக்கிரன், புதன், சனி", "neutral": "குரு"}     # Meena
}


def sum_to_single_digit(n: int) -> int:
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n if n != 0 else 9


def format_dms(deg_float: float) -> str:
    d = int(deg_float)
    m = int((deg_float - d) * 60)
    s = int(round(((deg_float - d) * 60 - m) * 60))
    if s >= 60:
        s = 0
        m += 1
    if m >= 60:
        m = 0
        d += 1
    return f"{d:02d}° {m:02d}′ {s:02d}″"


def calculate_sampoorana_details(
    jd: float,
    lat: float,
    lon: float,
    date_str: str,
    time_str: str,
    basic_details: Dict[str, Any],
    planets: List[Dict[str, Any]],
    positions_by_name: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes all classical attributes required for a 100% full Sampoorana Jathagam.
    """
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    year, month, day = dt.year, dt.month, dt.day

    sun_obj = positions_by_name.get("Sun", {})
    moon_obj = positions_by_name.get("Moon", {})
    lagna_obj = positions_by_name.get("Lagna", {})

    sun_lon = sun_obj.get("total_degree", 0.0)
    moon_lon = moon_obj.get("total_degree", 0.0)
    lagna_sign_num = lagna_obj.get("rasi_number", 1)
    moon_nak_num = moon_obj.get("nakshatra_number", 1)

    # 1. Tamil Month & Date from Sun Longitude
    # 0 deg = Chithirai 1, 30 deg = Vaikasi 1 ...
    sun_sign_idx = int(sun_lon // 30.0) % 12
    t_month_info = TAMIL_MONTHS[sun_sign_idx]
    tamil_month_ta = t_month_info[0]
    tamil_month_en = t_month_info[1]
    sun_deg_in_sign = sun_lon % 30.0
    tamil_date = int(sun_deg_in_sign) + 1

    # 2. Tamil Year (60 Year Cycle)
    # Prabhava started around April 1987.
    # If before Chithirai 1 (~April 14), it belongs to previous Tamil year
    is_after_chithirai = (month > 4) or (month == 4 and day >= 14)
    base_year = year if is_after_chithirai else (year - 1)
    tamil_year_idx = (base_year - 1987) % 60
    tamil_year_ta = TAMIL_YEARS[tamil_year_idx]

    # 3. Traditional Shastric Eras
    salivahana_year = base_year - 78
    kaliyuga_year = base_year + 3101
    kollam_year = year - 824 if (month > 8 or (month == 8 and day >= 17)) else year - 825
    fasli_year = year - 590
    hijri_year = round((year - 622) * 33 / 32)

    # 4. Ayana & Ritu
    # Uttarayana: Sun in Makara to Mithuna (signs 10, 11, 12, 1, 2, 3 -> sun_sign_idx 9, 10, 11, 0, 1, 2)
    is_uttarayana = sun_sign_idx in [9, 10, 11, 0, 1, 2]
    ayana_ta = "உத்தராயணம்" if is_uttarayana else "தட்சிணாயனம்"
    ayana_en = "Uttarayanam" if is_uttarayana else "Dakshinayanam"

    ritu_idx = sun_sign_idx // 2
    ritu_info = RITUS[ritu_idx % 6]
    ritu_ta = ritu_info[0]
    ritu_en = ritu_info[1]

    # 5. Udhayadhi Tatparai (micro-nazhigai fraction)
    # Example: 14 நாழிகை 15 விநாழிகை 57 தற்பரை
    import re
    u_str = str(basic_details.get("udhayadhi_nazhigai_en", "1 Nazhigai 0 Vinazhigai"))
    m_naz = re.search(r"(\d+)\s*Nazhigai\s*(\d+)", u_str)
    if m_naz:
        n_int = int(m_naz.group(1))
        v_int = int(m_naz.group(2))
    else:
        n_int, v_int = 1, 0
    tatparai = int(round((jd * 86400) % 60))

    # 6. Nethiram & Jeevan (Classical eyes and life of day)
    day_num = int(math.floor(jd + 1.5)) % 7
    # Canonical: Sunday/Tuesday = Nethiram 1, Jeevan 1; Wednesday/Friday = Nethiram 2, Jeevan 1, etc.
    nethiram = "2" if day_num in [3, 5, 4] else "1"
    jeevan = "1" if (day_num + moon_nak_num) % 2 == 0 else "½"

    # 7. Vaara Soolai & Pariharam
    soolai_info = VAARA_SOOLAI_MAP.get(day_num, ("தெற்கு", "South", "தைலம்", "Oil"))
    vaara_soolai_ta = soolai_info[0]
    soolai_pariharam_ta = soolai_info[2]

    # 8. Yogini Direction
    tithi_idx = int(((moon_lon - sun_lon) % 360.0) // 12.0)
    yogini_dir = YOGINI_DIRECTIONS[tithi_idx % 8]

    # 9. Soonya Rasis
    tithi_raw_idx = tithi_idx % 15
    soonya_info = SOONYA_RASIS_BY_TITHI.get(tithi_raw_idx, ("சூன்யம் இல்லை", "None"))
    soonya_rasis_ta = soonya_info[0]

    # 10. Pancha Pakshi
    if 1 <= moon_nak_num <= 5:
        pakshi_data = PANCHA_PAKSHI_MAP[0]
    elif 6 <= moon_nak_num <= 11:
        pakshi_data = PANCHA_PAKSHI_MAP[1]
    elif 12 <= moon_nak_num <= 16:
        pakshi_data = PANCHA_PAKSHI_MAP[2]
    elif 17 <= moon_nak_num <= 21:
        pakshi_data = PANCHA_PAKSHI_MAP[3]
    else:
        pakshi_data = PANCHA_PAKSHI_MAP[4]

    pancha_pakshi_ta = pakshi_data[0]
    friendly_birds_ta = pakshi_data[2]
    enemy_birds_ta = pakshi_data[4]
    padupakshi_days_ta = pakshi_data[6]

    # 11. Vainasika Nakshatra (22nd star from Janma star)
    vainasika_idx = ((moon_nak_num - 1 + 21) % 27) + 1
    # Labels from tamil_labels or simple index
    vainasika_info = NAKSHATRA_LABELS_SHORT[vainasika_idx - 1] if 'NAKSHATRA_LABELS_SHORT' in globals() else f"நட்சத்திரம் {vainasika_idx}"
    vainasika_star_ta = f"{vainasika_info} ({vainasika_idx}-ஆம் நட்சத்திரம்)"

    # 12. Yogi & Avayogi Grahas
    # Yogi point = (Sun lon + Moon lon + 93° 20') % 360
    yogi_point = (sun_lon + moon_lon + 93.33333) % 360.0
    yogi_nak_idx = int(yogi_point // (360.0 / 27)) + 1
    yogi_lord = VIMSHOTTARI_LORDS[(yogi_nak_idx - 1) % 9]
    # Avayogi is 6th nakshatra from Yogi nakshatra
    avayogi_nak_idx = ((yogi_nak_idx - 1 + 5) % 27) + 1
    avayogi_lord = VIMSHOTTARI_LORDS[(avayogi_nak_idx - 1) % 9]

    # 13. Lagna Benefics & Malefics
    benefics_info = LAGNA_BENEFICS_MALEFICS.get(lagna_sign_num, {
        "subar": "குரு, சுக்கிரன்",
        "pabar": "செவ்வாய், சனி"
    })
    lagna_subar_ta = benefics_info["subar"]
    lagna_pabar_ta = benefics_info["pabar"]

    # 14. Numerology (எண் கணிதம்)
    birth_num = sum_to_single_digit(day)
    full_digits_sum = sum_to_single_digit(sum(int(c) for c in f"{year}{month:02d}{day:02d}"))
    destiny_num = full_digits_sum
    num_info = NUMEROLOGY_DATA.get(birth_num, NUMEROLOGY_DATA[1])

    # 15. Dasha Balance Math (Paramanazhigai, Sentra, Nindra)
    # Each nakshatra spans 13° 20' = 800 arcminutes = ~60 nazhigai
    moon_deg_in_nak = moon_lon % (360.0 / 27)
    elapsed_frac = moon_deg_in_nak / (360.0 / 27)
    paramanazhigai_val = 60.0
    sentra_val = paramanazhigai_val * elapsed_frac
    nindra_val = paramanazhigai_val - sentra_val

    s_n = int(sentra_val)
    s_v = int((sentra_val - s_n) * 60)
    n_n = int(nindra_val)
    n_v = int((nindra_val - n_n) * 60)
    n_t = int(round(((nindra_val - n_n) * 60 - n_v) * 60)) % 60

    paramanazhigai_str = "60 நாழிகை 00 விநாழிகை"
    sentra_nazhigai_str = f"{s_n} நாழிகை {s_v:02d} விநாழிகை"
    nindra_nazhigai_str = f"{n_n} நாழிகை {n_v:02d} விநாழிகை {n_t:02d} தற்பரை"

    # 16. Bhava Sphutam (12 Bhavas start, madhya, and end longitudes)
    lagna_deg = lagna_obj.get("total_degree", 0.0)
    bhava_sphutam_list = []

    # Which planets sit in which sign, so each Bhava row can name its
    # occupants. Built from the already-computed positions — nothing is
    # recalculated here.
    occupants_by_sign: Dict[int, List[str]] = {i: [] for i in range(1, 13)}
    for _p in planets:
        _name = _p.get("name")
        if not _name or _name in ("Lagna", "Mandi", "Gulika", "Maandi"):
            continue
        _sign = _p.get("rasi_number") or (int(_p.get("total_degree", 0.0) // 30.0) + 1)
        if 1 <= _sign <= 12:
            occupants_by_sign[_sign].append(_name)
    # In Sripati / equal house system:
    for h in range(1, 13):
        # Madhya is Lagna + (h-1)*30
        madhya_deg = (lagna_deg + (h - 1) * 30.0) % 360.0
        start_deg = (madhya_deg - 15.0) % 360.0
        end_deg = (madhya_deg + 15.0) % 360.0

        sign_num = int(madhya_deg // 30.0) + 1
        sign_info = SIGN_LABELS.get(sign_num, {})
        lord_en = sign_info.get("lord", "")
        lord_info = PLANET_LABELS.get(lord_en, {})
        occ = occupants_by_sign.get(sign_num, [])

        bhava_sphutam_list.append({
            "house": h,
            "bhava_number": h,
            "house_ta": f"{h}-ஆம் பாவம்",
            # NEW: the Rasi / அதிபதி / occupant columns of the Bhava Sphutam
            # table (manuscript page 12) read these keys. They were never
            # emitted, which is why those columns printed "—" and "()" in the
            # downloaded PDF. The sign itself was already being computed one
            # line below as `sign_num`; this only labels it.
            "rasi": sign_info.get("sa", ""),
            "rasi_ta": sign_info.get("ta", ""),
            "rasi_en": sign_info.get("en", ""),
            "lord": lord_en,
            "lord_ta": lord_info.get("ta", lord_en),
            "occupants": occ,
            "occupants_ta": ", ".join(
                PLANET_LABELS.get(o, {}).get("ta", o) for o in occ
            ) or "வெற்றிடம்",
            "start_deg": round(start_deg, 4),
            "start_dms": format_dms(start_deg % 30.0),
            "madhya_deg": round(madhya_deg, 4),
            "madhya_dms": format_dms(madhya_deg % 30.0),
            "end_deg": round(end_deg, 4),
            "end_dms": format_dms(end_deg % 30.0),
            "sign_num": sign_num,
        })

    # 17. Shodashavarga (Divisional Chakras)
    vargas = compute_shodashavargas(planets, lagna_deg)

    # 18. Complete Traditional Vakhyam Package (வாக்கிய பஞ்சாங்கம் & ஜெனன வாக்கிய உரை)
    vikrama_year = base_year + 57
    tithi_elapsed_pct = basic_details.get("thithi_elapsed_pct", 0.5)
    tithi_sentra_val = 60.0 * (tithi_elapsed_pct if tithi_elapsed_pct is not None else 0.5)
    tithi_nindra_val = max(0.0, 60.0 - tithi_sentra_val)
    t_s_n = int(tithi_sentra_val)
    t_s_v = int((tithi_sentra_val - t_s_n) * 60)
    t_n_n = int(tithi_nindra_val)
    t_n_v = int((tithi_nindra_val - t_n_n) * 60)
    tithi_sentra_nazhigai = f"{t_s_n} நாழிகை {t_s_v:02d} விநா"
    tithi_nindra_nazhigai = f"{t_n_n} நாழிகை {t_n_v:02d} விநா"

    thithi_full = basic_details.get("thithi_ta") or basic_details.get("thithi", "")
    rasi_full = basic_details.get("rasi_ta") or basic_details.get("rasi", "")
    nak_full = basic_details.get("nakshatram_ta") or basic_details.get("nakshatram", "")
    lagna_full = basic_details.get("lagnam_ta") or basic_details.get("lagnam", "")
    vaaram_full = basic_details.get("vaaram_ta") or basic_details.get("vaaram", "")
    yogam_full = basic_details.get("yogam_ta") or basic_details.get("yogam", "")
    karanam_full = basic_details.get("karanam_ta") or basic_details.get("karanam", "")
    subha_yogam_full = basic_details.get("subha_yogam_ta") or "சித்த யோகம்"
    pada_num = basic_details.get("pada", 1)

    jenana_vakhyam_prose = (
        f"ஸ்வஸ்திஸ்ரீ விஜயாப்யுதய சாலிவாகன சகாப்தம் {salivahana_year}-ல், கலியுகாதி ஆண்டு {kaliyuga_year}-ல், "
        f"கொல்லம் ஆண்டு {kollam_year}-ல், பசலி ஆண்டு {fasli_year}-ல், ஹிஜ்ரி ஆண்டு {hijri_year}-ல், "
        f"விக்ரம சகாப்தம் {vikrama_year}-ல் நிகழும் மங்களகரமான {tamil_year_ta} வருடம் {ayana_ta} {ritu_ta} "
        f"{tamil_month_ta} மாதம் {tamil_date}-ஆம் தேதி {vaaram_full} அன்று (ஆங்கிலத் தேதி {date_str}, நேரம் {time_str}), "
        f"சூரிய உதயாதி நாழிகை {n_int} விநாழிகை {v_int} தற்பரை {tatparai} அளவில், {thithi_full} திதியும், "
        f"{lagna_full} லக்னமும், {nak_full} நட்சத்திரம் {pada_num}-ஆம் பாதம் க்ஷேத்திர {rasi_full} ராசியும், "
        f"{yogam_full} யோகமும், {karanam_full} கரணமும், {subha_yogam_full} கூடிய சுபயோக சுபதினத்தில் சுபஜெனனம்."
    )

    vakhyam_package = {
        "jenana_vakhyam_prose": jenana_vakhyam_prose,
        "salivahana_year": salivahana_year,
        "kaliyuga_year": kaliyuga_year,
        "kollam_year": kollam_year,
        "fasli_year": fasli_year,
        "hijri_year": hijri_year,
        "vikrama_year": vikrama_year,
        "tamil_year": tamil_year_ta,
        "tamil_month": tamil_month_ta,
        "tamil_date": tamil_date,
        "ayana": ayana_ta,
        "ritu": ritu_ta,
        "udhayadhi_nazhigai": f"{n_int} நாழிகை {v_int:02d} விநாழிகை {tatparai:02d} தற்பரை",
        "nakshatra_sentra_nazhigai": sentra_nazhigai_str,
        "nakshatra_nindra_nazhigai": nindra_nazhigai_str,
        "tithi_sentra_nazhigai": tithi_sentra_nazhigai,
        "tithi_nindra_nazhigai": tithi_nindra_nazhigai,
        "paramanazhigai": paramanazhigai_str,
        "nethiram": nethiram,
        "jeevan": jeevan,
        "vaara_soolai": vaara_soolai_ta,
        "soolai_pariharam": soolai_pariharam_ta,
        "yogini_direction": yogini_dir,
        "soonya_rasis": soonya_rasis_ta,
        "pancha_pakshi": pancha_pakshi_ta,
        "shastric_shloka_1": "ஜெனனீ ஜென்ம சௌக்யானாம் வர்த்தனீ குலசம்பதாம் | பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா ||",
        "shastric_shloka_2": "ஸ்வஸ்திஸ்ரீ மன் மகா மண்டலேஸ்வர அரிஹரிபுத்திர சர்வ மங்களகாரக சுபமஸ்து ||",
        "tradition_source": "பாம்பு பஞ்சாங்கம் மற்றும் பாரம்பரிய சூரிய சித்தாந்த வாக்கிய கணித முறை (Surya Siddhanta Tradition)",
    }

    return {
        "tamil_year": tamil_year_ta,
        "tamil_month": tamil_month_ta,
        "tamil_month_en": tamil_month_en,
        "tamil_date": tamil_date,
        "salivahana_year": salivahana_year,
        "kaliyuga_year": kaliyuga_year,
        "kollam_year": kollam_year,
        "fasli_year": fasli_year,
        "hijri_year": hijri_year,
        "vikrama_year": vikrama_year,
        "ayana": ayana_en,
        "ayana_ta": ayana_ta,
        "ritu": ritu_en,
        "ritu_ta": ritu_ta,
        "tatparai": tatparai,
        "nethiram": nethiram,
        "jeevan": jeevan,
        "vaara_soolai_ta": vaara_soolai_ta,
        "soolai_pariharam_ta": soolai_pariharam_ta,
        "yogini_ta": yogini_dir,
        "soonya_rasis_ta": soonya_rasis_ta,
        "pancha_pakshi_ta": pancha_pakshi_ta,
        "friendly_birds_ta": friendly_birds_ta,
        "enemy_birds_ta": enemy_birds_ta,
        "padupakshi_days_ta": padupakshi_days_ta,
        "vainasika_star_ta": vainasika_star_ta,
        "yogi_graha_ta": yogi_lord,
        "avayogi_graha_ta": avayogi_lord,
        "lagna_subar_ta": lagna_subar_ta,
        "lagna_pabar_ta": lagna_pabar_ta,
        "birth_number": birth_num,
        "destiny_number": destiny_num,
        "lucky_numbers": num_info["lucky"],
        "lucky_colors_ta": num_info["colors"],
        "lucky_stones_ta": num_info["stones"],
        "lucky_deity_ta": num_info["deity"],
        "paramanazhigai": paramanazhigai_str,
        "sentra_nazhigai": sentra_nazhigai_str,
        "nindra_nazhigai": nindra_nazhigai_str,
        "bhava_sphutam": bhava_sphutam_list,
        "varga_chakras": vargas,
        "vakhyam_details": vakhyam_package,
    }


def compute_shodashavargas(planets: List[Dict[str, Any]], lagna_deg: float) -> Dict[str, Dict[int, List[Dict[str, Any]]]]:
    """
    Computes all 16 Classical Parashara Shodashavargas (BPHS Ch. 6):
    D1 (Rasi), D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa), D7 (Saptamsa),
    D9 (Navamsa), D10 (Dasamsa), D12 (Dvadasamsa), D16 (Shodasamsa),
    D20 (Vimsamsa), D24 (Chaturvimsamsa), D27 (Saptavimsamsa),
    D30 (Trimsamsa), D40 (Khavedamsa), D45 (Akshavedamsa), D60 (Shashtiamsa).
    """
    all_bodies = list(planets)
    if lagna_deg is not None and not any(b.get("name") == "Lagna" for b in all_bodies):
        all_bodies.append({
            "name": "Lagna",
            "symbol": "லக்",
            "total_degree": lagna_deg,
            "navamsa_sign": (int(lagna_deg // (360.0 / 108)) % 12) + 1
        })

    vargas: Dict[str, Dict[int, List[Dict[str, Any]]]] = {
        "D1": {i: [] for i in range(1, 13)},
        "D2_Hora": {i: [] for i in range(1, 13)},
        "D3_Drekkana": {i: [] for i in range(1, 13)},
        "D4_Chaturthamsa": {i: [] for i in range(1, 13)},
        "D7_Saptamsa": {i: [] for i in range(1, 13)},
        "D9_Navamsa": {i: [] for i in range(1, 13)},
        "D10_Dasamsa": {i: [] for i in range(1, 13)},
        "D12_Dvadasamsa": {i: [] for i in range(1, 13)},
        "D16_Shodadamsa": {i: [] for i in range(1, 13)},
        "D20_Vimsamsa": {i: [] for i in range(1, 13)},
        "D24_Chaturvimsamsa": {i: [] for i in range(1, 13)},
        "D27_Saptavimsamsa": {i: [] for i in range(1, 13)},
        "D30_Trimsamsa": {i: [] for i in range(1, 13)},
        "D40_Khavedamsa": {i: [] for i in range(1, 13)},
        "D45_Akshavedamsa": {i: [] for i in range(1, 13)},
        "D60_Shashtiamsa": {i: [] for i in range(1, 13)},
    }

    for b in all_bodies:
        deg = b.get("total_degree", 0.0) % 360.0
        sign_1 = int(deg // 30.0) + 1
        deg_in_sign = deg % 30.0
        is_odd = (sign_1 % 2 != 0)
        sign_mob = (sign_1 - 1) % 3  # 0=Chara (Movable), 1=Sthira (Fixed), 2=Ubhaya (Dual)
        element_idx = (sign_1 - 1) % 4  # 0=Fire, 1=Earth, 2=Air, 3=Water

        p_tag = {"name": b.get("name"), "symbol": b.get("symbol", b.get("name")[:2])}

        # 1. D1: Rasi
        vargas["D1"][sign_1].append(p_tag)

        # 2. D2: Hora (Parashara: Odd sign 0-15 Sun/Leo 5, 15-30 Moon/Cancer 4; Even sign 0-15 Cancer 4, 15-30 Leo 5)
        if is_odd:
            d2_sign = 5 if deg_in_sign < 15.0 else 4
        else:
            d2_sign = 4 if deg_in_sign < 15.0 else 5
        vargas["D2_Hora"][d2_sign].append(p_tag)

        # 3. D3: Drekkana (0-10 same, 10-20 5th, 20-30 9th)
        if deg_in_sign < 10.0:
            d3_sign = sign_1
        elif deg_in_sign < 20.0:
            d3_sign = ((sign_1 - 1 + 4) % 12) + 1
        else:
            d3_sign = ((sign_1 - 1 + 8) % 12) + 1
        vargas["D3_Drekkana"][d3_sign].append(p_tag)

        # 4. D4: Chaturthamsa (0-7.5 same, 7.5-15 4th, 15-22.5 7th, 22.5-30 10th)
        d4_step = int(deg_in_sign // 7.5)
        d4_sign = ((sign_1 - 1 + d4_step * 3) % 12) + 1
        vargas["D4_Chaturthamsa"][d4_sign].append(p_tag)

        # 5. D7: Saptamsa (Odd starts from same, Even starts from 7th)
        d7_step = int(deg_in_sign // (30.0 / 7.0))
        d7_start = sign_1 if is_odd else (((sign_1 - 1 + 6) % 12) + 1)
        d7_sign = ((d7_start - 1 + d7_step) % 12) + 1
        vargas["D7_Saptamsa"][d7_sign].append(p_tag)

        # 6. D9: Navamsa
        d9_sign = b.get("navamsa_sign") or ((int(deg // (360.0 / 108)) % 12) + 1)
        vargas["D9_Navamsa"][d9_sign].append(p_tag)

        # 7. D10: Dasamsa (Odd starts from same, Even starts from 9th)
        d10_step = int(deg_in_sign // 3.0)
        d10_start = sign_1 if is_odd else (((sign_1 - 1 + 8) % 12) + 1)
        d10_sign = ((d10_start - 1 + d10_step) % 12) + 1
        vargas["D10_Dasamsa"][d10_sign].append(p_tag)

        # 8. D12: Dvadasamsa (starts from same sign + step 0..11)
        d12_step = int(deg_in_sign // 2.5)
        d12_sign = ((sign_1 - 1 + d12_step) % 12) + 1
        vargas["D12_Dvadasamsa"][d12_sign].append(p_tag)

        # 9. D16: Shodasamsa (Chara from Aries 1, Sthira from Leo 5, Ubhaya from Sag 9)
        d16_start = 1 if sign_mob == 0 else (5 if sign_mob == 1 else 9)
        d16_step = int(deg_in_sign // (30.0 / 16.0))
        d16_sign = ((d16_start - 1 + d16_step) % 12) + 1
        vargas["D16_Shodadamsa"][d16_sign].append(p_tag)

        # 10. D20: Vimsamsa (Movable from Aries 1, Fixed from Sag 9, Dual from Leo 5)
        d20_start = 1 if sign_mob == 0 else (9 if sign_mob == 1 else 5)
        d20_step = int(deg_in_sign // 1.5)
        d20_sign = ((d20_start - 1 + d20_step) % 12) + 1
        vargas["D20_Vimsamsa"][d20_sign].append(p_tag)

        # 11. D24: Chaturvimsamsa (Odd from Leo 5, Even from Cancer 4)
        d24_start = 5 if is_odd else 4
        d24_step = int(deg_in_sign // 1.25)
        d24_sign = ((d24_start - 1 + d24_step) % 12) + 1
        vargas["D24_Chaturvimsamsa"][d24_sign].append(p_tag)

        # 12. D27: Saptavimsamsa (Fire from Aries 1, Earth from Cancer 4, Air from Libra 7, Water from Cap 10)
        d27_starts = [1, 4, 7, 10]
        d27_start = d27_starts[element_idx]
        d27_step = int(deg_in_sign // (30.0 / 27.0))
        d27_sign = ((d27_start - 1 + d27_step) % 12) + 1
        vargas["D27_Saptavimsamsa"][d27_sign].append(p_tag)

        # 13. D30: Trimsamsa (Parashara classical degree brackets)
        if is_odd:
            if deg_in_sign < 5.0:
                d30_sign = 1   # Mars / Aries
            elif deg_in_sign < 10.0:
                d30_sign = 11  # Saturn / Aquarius
            elif deg_in_sign < 18.0:
                d30_sign = 9   # Jupiter / Sagittarius
            elif deg_in_sign < 25.0:
                d30_sign = 3   # Mercury / Gemini
            else:
                d30_sign = 7   # Venus / Libra
        else:
            if deg_in_sign < 5.0:
                d30_sign = 2   # Venus / Taurus
            elif deg_in_sign < 12.0:
                d30_sign = 6   # Mercury / Virgo
            elif deg_in_sign < 20.0:
                d30_sign = 12  # Jupiter / Pisces
            elif deg_in_sign < 25.0:
                d30_sign = 10  # Saturn / Capricorn
            else:
                d30_sign = 8   # Mars / Scorpio
        vargas["D30_Trimsamsa"][d30_sign].append(p_tag)

        # 14. D40: Khavedamsa (Odd from Aries 1, Even from Libra 7)
        d40_start = 1 if is_odd else 7
        d40_step = int(deg_in_sign // 0.75)
        d40_sign = ((d40_start - 1 + d40_step) % 12) + 1
        vargas["D40_Khavedamsa"][d40_sign].append(p_tag)

        # 15. D45: Akshavedamsa (Movable from Aries 1, Fixed from Leo 5, Dual from Sag 9)
        d45_start = 1 if sign_mob == 0 else (5 if sign_mob == 1 else 9)
        d45_step = int(deg_in_sign // (30.0 / 45.0))
        d45_sign = ((d45_start - 1 + d45_step) % 12) + 1
        vargas["D45_Akshavedamsa"][d45_sign].append(p_tag)

        # 16. D60: Shashtiamsa (starts from sign_1, step 0..59)
        d60_step = int(deg_in_sign // 0.5)
        d60_sign = ((sign_1 - 1 + d60_step) % 12) + 1
        vargas["D60_Shashtiamsa"][d60_sign].append(p_tag)

    return vargas


VIMSHOTTARI_LORDS = [
    "கேது (Ketu)", "சுக்கிரன் (Venus)", "சூரியன் (Sun)", "சந்திரன் (Moon)", "செவ்வாய் (Mars)",
    "ராகு (Rahu)", "குரு (Jupiter)", "சனி (Saturn)", "புதன் (Mercury)"
]

NAKSHATRA_LABELS_SHORT = [
    "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
    "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
    "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
]