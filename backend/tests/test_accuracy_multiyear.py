"""
Comprehensive Multi-Year Astrological Accuracy Test Suite.
Validates Lagnam, 5 Panchangam Limbs, Tamil Subha Yoga, Nakshatra attributes, and Timings
across distinct epochs from 1950 to 2026 using Swiss Ephemeris DE431/441 precision files.
Governed by AGENTS.md §1 & §3.5.
"""

import pytest
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions

def test_1950_republic_day_chart():
    """
    Test 1: 1950-01-26 09:00:00 IST, New Delhi
    Historical Epoch: Ayanamsa ~23.16 deg
    """
    lat, lon, tz = resolve_place("New Delhi, Delhi, India")
    jd = get_julian_day("1950-01-26", "09:00:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="1950-01-26",
        time_str="09:00:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # 1. Ayanamsa
    assert 23.10 < eph["ayanamsa"] < 23.22
    assert "23° 09'" in b["ayanamsa_dms"] or "23° 08'" in b["ayanamsa_dms"] or "23°" in b["ayanamsa_dms"]

    # 2. Lagna: Kumbha (Aquarius) in Shatabhisha Nakshatra Pada 3
    assert lagna["rasi_number"] == 11
    assert lagna["rasi"] == "Kumbha"
    assert lagna["rasi_ta"] == "கும்பம்"
    assert lagna["nakshatra"] == "Shatabhisha"
    assert lagna["nakshatra_ta"] == "சதயம்"
    assert lagna["pada"] == 3
    assert lagna["lord"] == "Saturn"
    assert lagna["lord_ta"] == "சனி"
    assert "15° 06'" in lagna["degree_dms"]

    # 3. Moon Rasi & Star: Mesha (Aries), Ashwini Pada 4
    assert b["rasi"] == "Mesha"
    assert b["rasi_ta"] == "மேஷம்"
    assert b["nakshatram"] == "Ashwini"
    assert b["nakshatram_ta"] == "அசுவினி"
    assert b["pada"] == 4
    assert b["nakshatra_lord"] == "Ketu"

    # 4. Panchangam & Subha Yoga
    assert b["paksha_ta"] == "வளர்பிறை"
    assert "வளர்பிறை" in b["thithi_ta"]
    assert "aksh" not in b["thithi_ta"]  # Verification of string slicing bug fix
    assert "Ashtami" in b["thithi"]
    assert "அஷ்டமி" in b["thithi_ta"]
    assert b["vaaram_ta"] == "வியாழக்கிழமை"
    assert b["vaaram_lord"] == "Jupiter"
    assert b["karanam_ta"] == "பத்திரை (விஷ்டி)"
    assert b["yogam"] == "Shubha"

    # 5. Nakshatra Attributes
    assert b["ganam_ta"] == "தேவ கணம்"
    assert b["yoni_ta"] == "ஆண் குதிரை"
    assert b["rajju_ta"] == "பாத ரஜ்ஜு"
    assert b["bootham_ta"] == "நிலம்"
    assert "வாதம்" in b["nadi_ta"]

    # 6. Sunrise & Timings
    assert "AM" in b["sun_rise"]
    assert "PM" in b["sun_set"]
    assert "நாழிகை" in b["udhayadhi_nazhigai"]

def test_1985_chennai_chart():
    """
    Test 2: 1985-05-12 10:30:00 IST, Chennai, Tamil Nadu
    1980s Epoch
    """
    lat, lon, tz = resolve_place("Chennai, Tamil Nadu, India")
    jd = get_julian_day("1985-05-12", "10:30:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="1985-05-12",
        time_str="10:30:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # Lagna: Karkataka (Cancer) in Pushya Pada 1
    assert lagna["rasi_number"] == 4
    assert lagna["rasi"] == "Karkataka"
    assert lagna["rasi_ta"] == "கடகம்"
    assert lagna["nakshatra"] == "Pushya"
    assert lagna["nakshatra_ta"] == "பூசம்"
    assert lagna["pada"] == 1
    assert lagna["lord"] == "Moon"
    assert lagna["lord_ta"] == "சந்திரன்"

    # Moon: Kumbha (Aquarius), Dhanishta Pada 3
    assert b["rasi"] == "Kumbha"
    assert b["rasi_ta"] == "கும்பம்"
    assert b["nakshatram"] == "Dhanishta"
    assert b["nakshatram_ta"] == "அவிட்டம்"
    assert b["pada"] == 3

    # Tithi: Krishna Ashtami (Sunday)
    assert b["paksha_ta"] == "தேய்பிறை"
    assert "தேய்பிறை அஷ்டமி" in b["thithi_ta"]
    assert b["vaaram_ta"] == "ஞாயிற்றுக்கிழமை"
    assert b["subha_yogam_ta"] == "சித்த யோகம்"

def test_1996_coimbatore_reference_chart():
    """
    Test 3: 1996-08-15 07:00:00 IST, Coimbatore, Tamil Nadu
    1990s Reference Chart
    """
    lat, lon, tz = resolve_place("Coimbatore, Tamil Nadu, India")
    jd = get_julian_day("1996-08-15", "07:00:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="1996-08-15",
        time_str="07:00:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # Lagna: Simha (Leo) in Magha Pada 3
    assert lagna["rasi_number"] == 5
    assert lagna["rasi"] == "Simha"
    assert lagna["rasi_ta"] == "சிம்மம்"
    assert lagna["nakshatra"] == "Magha"
    assert lagna["nakshatra_ta"] == "மகம்"
    assert lagna["pada"] == 3

    # Moon: Simha, Magha Pada 3
    assert b["rasi"] == "Simha"
    assert b["rasi_ta"] == "சிம்மம்"
    assert b["nakshatram"] == "Magha"
    assert b["nakshatram_ta"] == "மகம்"
    assert b["pada"] == 3

    # Tithi: Shukla Prathama
    assert "வளர்பிறை பிரதமை" in b["thithi_ta"]
    assert b["vaaram_ta"] == "வியாழக்கிழமை"
    assert b["yogam"] == "Parigha"
    assert b["karanam_ta"] == "பவம்"

def test_2004_manosakthi_chart():
    """
    Test 4: 2004-12-31 14:10:00 IST, Pollachi, Tamil Nadu
    2000s Epoch (User Reference Profile)
    """
    lat, lon, tz = resolve_place("Pollachi, Tamil Nadu, India")
    jd = get_julian_day("2004-12-31", "14:10:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="2004-12-31",
        time_str="14:10:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # 1. Verify Ayanamsa: Lahiri ~23.9269 deg (23° 55' 37")
    assert 23.90 < eph["ayanamsa"] < 23.95
    assert "23° 55'" in b["ayanamsa_dms"]

    # 2. Lagna: Mesha (Aries) 18° 39' 37", Bharani Pada 2, Lord Mars
    assert lagna["rasi_number"] == 1
    assert lagna["rasi"] == "Mesha"
    assert lagna["rasi_ta"] == "மேஷம்"
    assert "18° 39' 37\"" in lagna["degree_dms"]
    assert lagna["nakshatra"] == "Bharani"
    assert lagna["nakshatra_ta"] == "பரணி"
    assert lagna["pada"] == 2
    assert lagna["lord"] == "Mars"
    assert lagna["lord_ta"] == "செவ்வாய்"
    assert lagna["nakshatra_lord"] == "Venus"
    assert lagna["nakshatra_lord_ta"] == "சுக்கிரன்"
    assert lagna["navamsa_rasi"] == "Kanya"
    assert lagna["navamsa_rasi_ta"] == "கன்னி"

    # 3. Moon: Simha (Leo), Magha Pada 3, Lord Ketu
    assert b["rasi"] == "Simha"
    assert b["rasi_ta"] == "சிம்மம்"
    assert b["nakshatram"] == "Magha"
    assert b["nakshatram_ta"] == "மகம்"
    assert b["pada"] == 3
    assert b["nakshatra_lord"] == "Ketu"
    assert b["nakshatra_lord_ta"] == "கேது"

    # 4. Panchangam & Subha Yoga
    assert b["paksha_ta"] == "தேய்பிறை"
    assert "தேய்பிறை பஞ்சமி" in b["thithi_ta"]
    assert b["thithi"] == "Krishna Paksha Panchami"
    assert b["vaaram_ta"] == "வெள்ளிக்கிழமை"
    assert b["vaaram_lord"] == "Venus"
    assert b["vaaram_lord_ta"] == "சுக்கிரன்"
    assert b["yogam_ta"] == "ப்ரீதி"
    assert b["karanam_ta"] == "கௌலவம்"
    assert b["subha_yogam_ta"] == "சித்த யோகம்"  # Friday + Magha gives Siddha Yoga

    # 5. Nakshatra Attributes for Magha
    assert b["ganam_ta"] == "ராக்ஷஸ கணம்"
    assert b["yoni_ta"] == "ஆண் எலி"
    assert b["rajju_ta"] == "பாத ரஜ்ஜு"
    assert b["vriksham_ta"] == "ஆலமரம்"
    assert b["pakshi_ta"] == "ஆண் மயில்"
    assert b["mirugam_ta"] == "எலி"
    assert "கபம்" in b["nadi_ta"]

    # 6. Sunrise & Astronomical Timings in Pollachi
    assert "06:40" in b["sun_rise"]
    assert "06:09" in b["sun_set"]
    assert "18 நாழிகை" in b["udhayadhi_nazhigai"]

def test_2015_madurai_chart():
    """
    Test 5: 2015-06-20 18:45:00 IST, Madurai, Tamil Nadu
    2010s Epoch
    """
    lat, lon, tz = resolve_place("Madurai, Tamil Nadu, India")
    jd = get_julian_day("2015-06-20", "18:45:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="2015-06-20",
        time_str="18:45:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # Lagna: Dhanus (Sagittarius) in Moola Pada 3
    assert lagna["rasi_number"] == 9
    assert lagna["rasi"] == "Dhanus"
    assert lagna["rasi_ta"] == "தனுசு"
    assert lagna["nakshatra"] == "Moola"
    assert lagna["nakshatra_ta"] == "மூலம்"
    assert lagna["pada"] == 3
    assert lagna["lord"] == "Jupiter"

    # Moon: Karkataka (Cancer), Ashlesha Pada 2
    assert b["rasi"] == "Karkataka"
    assert b["rasi_ta"] == "கடகம்"
    assert b["nakshatram"] == "Ashlesha"
    assert b["nakshatram_ta"] == "ஆயில்யம்"
    assert b["pada"] == 2

    # Tithi: Shukla Chaturthi on Saturday
    assert "வளர்பிறை சதுர்த்தி" in b["thithi_ta"]
    assert b["vaaram_ta"] == "சனிக்கிழமை"

def test_2024_trichy_chart():
    """
    Test 6: 2024-01-01 06:00:00 IST, Tiruchirappalli, Tamil Nadu
    2020s Epoch
    """
    lat, lon, tz = resolve_place("Tiruchirappalli, Tamil Nadu, India")
    jd = get_julian_day("2024-01-01", "06:00:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="2024-01-01",
        time_str="06:00:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # Lagna: Dhanus (Sagittarius) in Moola Pada 3
    assert lagna["rasi"] == "Dhanus"
    assert lagna["nakshatra"] == "Moola"
    assert lagna["pada"] == 3

    # Moon: Simha (Leo), Magha Pada 4
    assert b["rasi"] == "Simha"
    assert b["nakshatram"] == "Magha"
    assert b["pada"] == 4
    assert "தேய்பிறை பஞ்சமி" in b["thithi_ta"]
    assert b["vaaram_ta"] == "திங்கட்கிழமை"

def test_2026_present_chart():
    """
    Test 7: 2026-09-01 12:00:00 IST, Coimbatore, Tamil Nadu
    Present Day Epoch
    """
    lat, lon, tz = resolve_place("Coimbatore, Tamil Nadu, India")
    jd = get_julian_day("2026-09-01", "12:00:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="2026-09-01",
        time_str="12:00:00",
        timezone_str=tz
    )
    b = eph["basic_details"]
    lagna = eph["lagna_info"]

    # Lagna: Vrischika (Scorpio) in Anuradha Pada 2
    assert lagna["rasi"] == "Vrischika"
    assert lagna["rasi_ta"] == "விருச்சிகம்"
    assert lagna["nakshatra"] == "Anuradha"
    assert lagna["nakshatra_ta"] == "அனுஷம்"
    assert lagna["pada"] == 2
    assert lagna["lord"] == "Mars"

    # Moon: Mesha (Aries), Ashwini Pada 2
    assert b["rasi"] == "Mesha"
    assert b["rasi_ta"] == "மேஷம்"
    assert b["nakshatram"] == "Ashwini"
    assert b["nakshatram_ta"] == "அசுவினி"
    assert b["pada"] == 2
    assert "தேய்பிறை பஞ்சமி" in b["thithi_ta"]
    assert b["vaaram_ta"] == "செவ்வாய்க்கிழமை"
    assert b["subha_yogam_ta"] == "அமிர்த யோகம்"  # Tuesday + Ashwini = Amrita Yoga!

def test_dasha_balance_and_dignity_precision():
    """
    Test 8: Validates exact Dasha balance and classical Dignity (Own House, Exalted, Friendly, etc.)
    """
    from backend.app.services.dasha_builder import calculate_dasha_balance, calculate_vimshottari_dasha

    lat, lon, tz = resolve_place("Pollachi, Tamil Nadu, India")
    jd = get_julian_day("2004-12-31", "14:10:00", tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str="2004-12-31",
        time_str="14:10:00",
        timezone_str=tz
    )
    pos = eph["positions_by_name"]
    moon_deg = pos["Moon"]["total_degree"]

    # Dasha Balance at Birth
    bal = calculate_dasha_balance(moon_deg)
    assert bal["lord"] == "Ketu"
    assert bal["lord_ta"] == "கேது"
    assert bal["years"] == 2
    assert bal["months"] == 11
    assert "கேது மகா திசை" in bal["formatted_ta"]
    assert "ஆண்டுகள்" in bal["formatted_ta"]

    # Classical Dignities for Manosakthi chart
    assert pos["Mars"]["status"] == "Own House"
    assert pos["Mars"]["status_ta"] == "ஆட்சி"

    assert pos["Sun"]["status"] == "Friendly"
    assert pos["Sun"]["status_ta"] == "நட்பு"

    assert pos["Mercury"]["status"] == "Neutral"
    assert pos["Mercury"]["status_ta"] == "சமம்"

    assert "வக்ரம்" in pos["Saturn"]["status_ta"]
    assert "Retrograde" in pos["Saturn"]["status"]

    # Active Bhukti in 2026 (Venus Dasa, Mercury Bhukti)
    dashas = calculate_vimshottari_dasha(moon_deg, "2004-12-31", "14:10:00")
    venus_dasha = dashas[1]
    assert venus_dasha["planet"] == "Venus"
    assert venus_dasha["is_current"] is True

    # Active Bhukti right now (Mercury Bhukti until Oct 2026)
    active_bhuktis = [b for b in venus_dasha["bhuktis"] if b["is_current"]]
    assert len(active_bhuktis) == 1
    assert active_bhuktis[0]["planet"] == "Mercury"
    assert active_bhuktis[0]["planet_ta"] == "புதன்"
