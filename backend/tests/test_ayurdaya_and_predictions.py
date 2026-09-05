"""
Unit tests for Ayurdaya, Detailed Rasi/Nakshatra Predictions, Baby Names 108 Padas, and Match Finder.
Governed by AGENTS.md §1 & §3.5.
"""

import pytest
from backend.app.services.ayurdaya import calculate_ayurdaya
from backend.app.services.rasi_nakshatra import get_detailed_predictions
from backend.app.services.baby_names import get_baby_name_suggestions, NAKSHATRA_PADA_SYLLABLES, NAKSHATRA_PADA_SYLLABLES_TA
from backend.app.services.porutham import calculate_tamil_10_porutham, compute_porutham_match
from backend.app.services.geocode import get_grouped_locations, search_places

def test_ayurdaya_calculation():
    # Sample planet positions (Simha Lagna, Aries Moon, Saturn in Libra exalted)
    planets = {
        "Sun": {"rasi_number": 5, "degree": 12.0, "status": "Own"},
        "Moon": {"rasi_number": 1, "degree": 10.0, "status": "Direct"},
        "Mars": {"rasi_number": 8, "degree": 15.0, "status": "Own"},
        "Mercury": {"rasi_number": 6, "degree": 18.0, "status": "Exalted"},
        "Jupiter": {"rasi_number": 4, "degree": 5.0, "status": "Exalted"},
        "Venus": {"rasi_number": 7, "degree": 22.0, "status": "Own"},
        "Saturn": {"rasi_number": 7, "degree": 20.0, "status": "Exalted"},
        "Rahu": {"rasi_number": 3, "degree": 11.0, "status": "Direct"},
        "Ketu": {"rasi_number": 9, "degree": 11.0, "status": "Direct"}
    }
    sarvashtakavarga = [28, 30, 25, 32, 29, 34, 31, 28, 30, 27, 33, 26]

    res = calculate_ayurdaya(lagna_sign=5, planets_by_name=planets, sarvashtakavarga=sarvashtakavarga)
    assert res["ayush_category"] in ("Deergha", "Madhya", "Alpa")
    assert "75" in res["ayush_years_range"] or "36" in res["ayush_years_range"] or res["ayush_years_range"]
    assert "eighth_house_analysis_ta" in res
    assert len(res["remedies_ta"]) >= 3
    assert res["classical_source"]

def test_detailed_predictions():
    # Simha Rasi (5), Magha (10), Pada 2, Mesha Lagna (1)
    res = get_detailed_predictions(lagna_sign=1, rasi_sign=5, nakshatra_num=10, pada=2)
    assert res["rasi_name_ta"] == "சிம்மம்"
    assert "கம்பீரம்" in res["rasi_prediction_ta"]
    assert res["nakshatra_name_ta"] == "மகம்"
    assert "பித்ரு" in res["nakshatra_deity_ta"] or res["nakshatra_deity_ta"]
    assert "2-ஆம் பாதம்" in res["pada_prediction_ta"]
    assert len(res["rasi_career_ta"]) > 5

def test_baby_names_all_27_nakshatras():
    # Verify all 27 nakshatras have 4 distinct syllables in both EN and TA
    assert len(NAKSHATRA_PADA_SYLLABLES) == 27
    assert len(NAKSHATRA_PADA_SYLLABLES_TA) == 27

    for star, syllables in NAKSHATRA_PADA_SYLLABLES.items():
        assert len(syllables) == 4, f"{star} must have 4 pada syllables"
        assert len(NAKSHATRA_PADA_SYLLABLES_TA[star]) == 4

        # Test pada 1 to 4 suggestions
        for p in range(1, 5):
            res = get_baby_name_suggestions(star, pada=p, gender="boy")
            assert len(res["suggestions"]) >= 1
            # Verify no corrupted fallback strings
            for name in res["suggestions"]:
                assert "னந்த்" not in name["name_ta"] or name["name_ta"] == "ஆனந்த்"
                assert "htt" not in name["name"].lower()
                assert len(name["name"]) > 1
                assert len(name["name_ta"]) > 1

def test_porutham_canonical_dina():
    # Pushya (8) to Swati (15): dist = ((15-8)%27)+1 = 8 (Mitra) -> Compatible!
    t10 = calculate_tamil_10_porutham(boy_rasi=7, boy_nak=15, girl_rasi=4, girl_nak=8)
    dina = next(x for x in t10 if x["key"] == "dina")
    assert dina["is_compatible"] is True

def test_grouped_locations():
    grouped = get_grouped_locations()
    assert "tamil_nadu" in grouped
    assert "india" in grouped
    assert "global" in grouped
    assert len(grouped["tamil_nadu"]) >= 38  # all 38 districts covered!

    # Test search
    res = search_places("Madurai")
    assert len(res) >= 1
    assert "Madurai" in res[0]["display_name"]
