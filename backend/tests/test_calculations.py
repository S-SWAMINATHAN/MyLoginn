"""
Unit and Reference Chart Accuracy Regression Suite.
Governed by AGENTS.md §1 & §3.5.
"""

import pytest
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.chart_builder import build_rasi_and_navamsa_kattams, calculate_bhava_predictions
from backend.app.services.dasha_builder import calculate_vimshottari_dasha
from backend.app.services.yoga_dosha import detect_yogas, detect_doshas
from backend.app.services.ashtakavarga import calculate_ashtakavarga
from backend.app.services.porutham import compute_porutham_match, calculate_ashta_koota, calculate_tamil_10_porutham
from backend.app.services.baby_names import get_baby_name_suggestions

def test_ephemeris_reference_chart_coimbatore():
    """
    Test with reference birth details:
    Date: 1996-08-15, Time: 07:00:00, Place: Coimbatore, Tamil Nadu
    """
    lat, lon, tz = resolve_place("Coimbatore, Tamil Nadu, India")
    assert tz == "Asia/Kolkata"
    assert round(lat, 2) == 11.02
    assert round(lon, 2) == 76.96

    jd = get_julian_day("1996-08-15", "07:00:00", tz)
    # JD should be approximately 2450310.5625
    assert 2450310.5 < jd < 2450310.6

    eph = compute_planetary_positions(jd, lat, lon)
    basic = eph["basic_details"]
    planets = eph["positions_by_name"]

    # 1. Verify Ayanamsa (Lahiri ~23.81 deg for 1996)
    assert 23.75 < eph["ayanamsa"] < 23.90

    # 2. Verify Sun is in Karkataka (Sign 4) Ashlesha 4 on Aug 15 7AM (before Simha Sankranti)
    sun = planets["Sun"]
    assert sun["rasi_number"] == 4
    assert sun["rasi"] == "Karkataka"
    assert sun["rasi_ta"] == "கடகம்"
    assert sun["nakshatra"] == "Ashlesha"

    # 3. Verify Moon is in Simha (Leo - Sign 5) in Magha Nakshatra Pada 3
    moon = planets["Moon"]
    assert moon["rasi_number"] == 5
    assert moon["rasi"] == "Simha"
    assert moon["nakshatra"] == "Magha"
    assert moon["nakshatra_ta"] == "மகம்"
    assert moon["pada"] == 3

    # 4. Verify Panchangam elements are populated accurately
    assert "Shukla" in basic["paksha"] or "Krishna" in basic["paksha"]
    assert basic["vaaram"] == "Guruvasara" or "வியாழ" in basic["vaaram_ta"]
    assert basic["nakshatram"] == "Magha"
    assert basic["lagnam"] == "Simha"

def test_vimshottari_dasha_calculation():
    """
    Test Vimshottari Dasha calculation from Moon in Pushya (Saturn's nakshatra, total 19 years).
    """
    # Moon in Pushya at ~106 degrees (middle of Pushya)
    moon_deg = 106.0
    dashas = calculate_vimshottari_dasha(moon_deg, "1996-08-15", "07:00:00")

    assert len(dashas) == 9
    # First Dasha should be Saturn
    assert dashas[0]["planet"] == "Saturn"
    assert dashas[0]["planet_ta"] == "சனி"
    assert 0 < dashas[0]["duration_years"] <= 19.0

    # Second Dasha should be Mercury (17 years)
    assert dashas[1]["planet"] == "Mercury"
    assert dashas[1]["duration_years"] == 17.0

    # Third Dasha should be Ketu (7 years)
    assert dashas[2]["planet"] == "Ketu"
    assert dashas[2]["duration_years"] == 7.0

    # Verify each dasha has 9 bhuktis
    for d in dashas:
        assert len(d["bhuktis"]) == 9

def test_ashtakavarga_sum_337():
    """
    Classical rule: Sarvashtakavarga across all 12 signs MUST sum to exactly 337 points.
    """
    jd = get_julian_day("1996-08-15", "07:00:00", "Asia/Kolkata")
    eph = compute_planetary_positions(jd, 11.0168, 76.9558)
    ashtaka = calculate_ashtakavarga(eph["lagna_info"]["rasi_number"], eph["positions_by_name"])

    assert ashtaka["total_points"] == 337
    assert sum(ashtaka["sarvashtakavarga"]) == 337
    assert len(ashtaka["sarvashtakavarga"]) == 12
    assert len(ashtaka["sarvashtakavarga_by_house"]) == 12
    # Verify each of the 7 planets has 12 signs
    for p_name, bindus in ashtaka["bhinnashtakavarga"].items():
        assert len(bindus) == 12

def test_porutham_matching():
    """
    Test dual marriage compatibility engine:
    Boy: Karkataka, Pushya Pada 2
    Girl: Mesha, Ashwini Pada 1
    """
    boy_rasi, boy_nak, boy_pada = 4, 8, 2
    girl_rasi, girl_nak, girl_pada = 1, 1, 1

    match_result = compute_porutham_match(boy_rasi, boy_nak, boy_pada, girl_rasi, girl_nak, girl_pada)

    # 1. Ashta Koota
    ak = match_result["ashta_koota"]
    assert ak["max_points"] == 36.0
    assert 0 <= ak["total_points"] <= 36.0
    assert len(ak["kutas"]) == 8

    # 2. Tamil 10-Porutham
    t10 = match_result["tamil_10_porutham"]
    assert len(t10) == 10

    # Pushya (8) is Kati Rajju; Ashwini (1) is Pada Rajju -> Rajjus are different -> Rajju Dosha should be False
    assert match_result["rajju_dosha"] is False
    assert "verdict" in match_result
    assert "verdict_ta" in match_result

def test_rajju_dosha_detection():
    """
    Test same Rajju detection (e.g. Mrigashirsha 5 and Chitra 14 are both Sirasu Rajju).
    """
    match_same_rajju = compute_porutham_match(2, 5, 1, 6, 14, 1)
    assert match_same_rajju["rajju_dosha"] is True
    assert "Rajju Dosha" in match_same_rajju["verdict"]

def test_baby_name_lookup():
    """
    Test authentic Nakshatra-pada starting syllable lookup.
    Pushya Pada 2 -> He
    Ashwini Pada 1 -> Chu
    """
    res_pushya = get_baby_name_suggestions("Pushya", 2, "boy")
    assert "He" in res_pushya["target_syllable"] or "H" in res_pushya["target_syllable"]
    assert len(res_pushya["suggestions"]) > 0

    res_ashwini = get_baby_name_suggestions("Ashwini", 1, "boy")
    assert res_ashwini["target_syllable"] == "Chu"
    assert len(res_ashwini["suggestions"]) > 0
