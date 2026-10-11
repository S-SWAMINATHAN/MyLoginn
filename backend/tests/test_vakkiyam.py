"""
Vakkiyam (வாக்கியம்) parity tests — engine + app wiring vs Kalai Magal.

Reference data: backend/tests/data/kalai_vakkiyam_all.json
  * 42 reports from Vakkiyam_datas.zip (Oct 2026)
  * 9 reports from docs/vakkiyam/kalai_vakkiyam_v01_v10.json (no place -> planets only)
  * 1 report from the KALAI_ASTRO archive (32233.pdf, Nagapattinam 1996)

Run:  python -m pytest -q backend/tests/test_vakkiyam.py
"""
import json
import os

import pytest

from backend.app.services import vakkiyam as V
from backend.app.services.ephemeris import compute_planetary_positions, get_julian_day
from backend.app.services.kalai_report import build_kalai_report

HERE = os.path.dirname(os.path.abspath(__file__))
ROWS = json.load(open(os.path.join(HERE, "data", "kalai_vakkiyam_all.json"), encoding="utf-8"))

# max |error| allowed, arc-minutes (current worst case + margin)
TOL = {"Sun": 1.0, "Moon": 1.5, "Rahu": 0.1, "Ketu": 0.1, "Mercury": 10.0,
       "Jupiter": 14.0, "Saturn": 6.0, "Mars": 46.0, "Venus": 84.0,
       "Lagna": 30.0, "Mandi": 56.0}
KEY = {"Sun": "sun", "Moon": "moon", "Mars": "mars", "Mercury": "mercury", "Jupiter": "jupiter",
       "Venus": "venus", "Saturn": "saturn", "Rahu": "rahu", "Ketu": "ketu",
       "Mandi": "mandi", "Lagna": "lagna"}
# V02's Sun in the old v01-v10 file is 57' off every other Kalai Sun (data-entry slip) -> skipped
SKIP = {("V02", "Sun")}


def _err(a, b):
    return abs((a - b + 180.0) % 360.0 - 180.0) * 60.0


def _report(r):
    lat, lon = (r["lat"], r["lon"]) if r.get("lat") is not None else (11.0, 77.0)
    return build_kalai_report("", r["date"], r["time"], "test", lat, lon, "UTC+05:30",
                              panchangam_system="vakhyam")


@pytest.mark.parametrize("row", ROWS, ids=[r["code"] for r in ROWS])
def test_vakkiyam_report_matches_kalai(row):
    rep = _report(row)
    got = {g["planet"]: g["longitude"] for g in rep["graha_spudam"]}
    for planet, tol in TOL.items():
        if (row["code"], planet) in SKIP:
            continue
        if planet in ("Lagna", "Mandi") and row.get("lat") is None:
            continue
        e = _err(got[planet], row[KEY[planet]])
        assert e <= tol, f"{row['code']} {planet}: {e:.2f}' > {tol}'"
    # star + pada always equal to Kalai
    moon = next(g for g in rep["graha_spudam"] if g["planet"] == "Moon")
    assert V.nakshatra_pada(row["moon"])[1] == moon["pada"]
    assert int(row["moon"] // (360 / 27)) == int(moon["longitude"] // (360 / 27))
    assert rep["general"]["graha_title_ta"].startswith("வாக்கிய")


def test_thirukanitham_unchanged():
    """Thirukanitham must still come from Swiss Ephemeris (Lahiri)."""
    jd = get_julian_day("2025-01-01", "02:45:00", "UTC+05:30")
    t = compute_planetary_positions(jd, 11.0, 77.0, "thirukkanitham", "2025-01-01", "02:45:00", "UTC+05:30")
    v = compute_planetary_positions(jd, 11.0, 77.0, "vakhyam", "2025-01-01", "02:45:00", "UTC+05:30")
    assert "Lahiri" in t["basic_details"]["ayanamsa_name"]
    assert "Vakkiyam" in v["basic_details"]["ayanamsa_name"]
    # Kalai MA01: Thirukanitham Moon ≈ 268°10′, Vakkiyam Moon 267°17′11″
    assert _err(v["positions_by_name"]["Moon"]["total_degree"], 267 + 17 / 60 + 11 / 3600) < 1.5
    assert _err(t["positions_by_name"]["Moon"]["total_degree"],
                v["positions_by_name"]["Moon"]["total_degree"]) > 30


def test_planets_do_not_depend_on_place():
    jd = get_julian_day("2025-04-15", "08:30:00", "UTC+05:30")
    a = V.vakkiyam_for_jd(jd, 11.0, 77.0)
    b = V.vakkiyam_for_jd(jd, 13.0833, 80.2833)
    for p in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"):
        assert a[p]["lon"] == b[p]["lon"]
