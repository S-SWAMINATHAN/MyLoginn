import pytest
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.sampoorana import calculate_sampoorana_details

def test_sampoorana_calculation():
    lat = 11.0168
    lon = 76.9558
    tz = "Asia/Kolkata"
    jd = get_julian_day("1996-08-15", "07:00:00", tz)
    eph = compute_planetary_positions(jd, lat, lon)
    basic = eph["basic_details"]
    planets = eph["planets"]
    positions = eph["positions_by_name"]

    samp = calculate_sampoorana_details(
        jd=jd,
        lat=lat,
        lon=lon,
        date_str="1996-08-15",
        time_str="07:00:00",
        basic_details=basic,
        planets=planets,
        positions_by_name=positions
    )

    # 1. Check Tamil Year & Month
    assert samp["tamil_year"] in ["தாது", "யுவ"]
    assert samp["tamil_month"] in ["ஆடி", "ஆவணி"]
    assert samp["tamil_date"] >= 1

    # 2. Check Traditional Eras
    assert samp["salivahana_year"] > 1900
    assert samp["kaliyuga_year"] > 5000
    assert samp["kollam_year"] > 1100
    assert samp["fasli_year"] > 1300

    # 3. Check Ayana & Ritu
    assert samp["ayana_ta"] in ["உத்தராயணம்", "தட்சிணாயனம்"]
    assert samp["ritu_ta"] != ""

    # 4. Check Pancha Pakshi
    assert samp["pancha_pakshi_ta"] in ["வல்லூறு", "ஆந்தை", "காகம்", "கோழி", "மயில்"]
    assert samp["padupakshi_days_ta"] != ""

    # 5. Check Numerology
    assert samp["birth_number"] == 6  # 15th -> 1+5 = 6
    assert samp["destiny_number"] in range(1, 10)
    assert len(samp["lucky_numbers"]) > 0

    # 6. Check Bhava Sphutam (12 houses)
    assert len(samp["bhava_sphutam"]) == 12
    assert samp["bhava_sphutam"][0]["house"] == 1

    # 7. Check Varga Chakras (D1 to D60)
    assert "D1" in samp["varga_chakras"]
    assert "D9_Navamsa" in samp["varga_chakras"]
    assert "D10_Dasamsa" in samp["varga_chakras"]
    assert "D60_Shashtiamsa" in samp["varga_chakras"]

    # 8. Check Vakhyam Details & Jenana Vakhyam Prose
    assert "vakhyam_details" in samp
    vd = samp["vakhyam_details"]
    assert "ஸ்வஸ்திஸ்ரீ" in vd["jenana_vakhyam_prose"]
    assert vd["vikrama_year"] > 2000
    assert "நாழிகை" in vd["nakshatra_sentra_nazhigai"]
    assert "நாழிகை" in vd["paramanazhigai"]


def test_vakhyam_panchangam_calculation():
    lat = 11.0168
    lon = 76.9558
    tz = "Asia/Kolkata"
    jd = get_julian_day("1996-08-15", "07:00:00", tz)

    # Compute with Thirukanitham
    eph_thiru = compute_planetary_positions(jd, lat, lon, panchangam_system="thirukkanitham")
    # Compute with Vakhyam
    eph_vak = compute_planetary_positions(jd, lat, lon, panchangam_system="vakhyam")

    assert "Vakkiyam" in eph_vak["basic_details"]["ayanamsa_name"]
    assert "Lahiri" in eph_thiru["basic_details"]["ayanamsa_name"]
    assert eph_vak["basic_details"]["ayanamsa_value"] != eph_thiru["basic_details"]["ayanamsa_value"]
    # Vakkiyam mode must take its planets from the Vakkiyam engine (not Swiss Ephemeris)
    from backend.app.services.vakkiyam import vakkiyam_for_jd
    vak = vakkiyam_for_jd(jd, lat, lon)
    for p in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"):
        assert abs(eph_vak["positions_by_name"][p]["total_degree"] - round(vak[p]["lon"] % 360.0, 4)) < 1e-6
    assert abs(eph_vak["lagna_info"]["total_degree"] - round(vak["Lagna"]["lon"] % 360.0, 4)) < 1e-6

