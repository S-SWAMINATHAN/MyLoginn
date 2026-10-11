"""
Kalai Magal parity regression tests (AGENTS.md §1.9 / §5).

Fixture REF-001: an ANONYMISED reference birth taken from a Kalai Magal
"Type D" computation report (no name or family data kept). Expected values
are copied from that report's printed numbers.
A failure here blocks merge — do not "fix" a test by editing its numbers.
"""
import pytest

from backend.app.services.dasha_builder import calculate_vimshottari_dasha, calculate_dasha_balance
from backend.app.services.ephemeris import compute_planetary_positions, get_julian_day
from backend.app.services.kalai_report import build_kalai_report

REF = dict(date="1998-04-04", time="01:20:00", lat=10 + 37 / 60, lon=77 + 16 / 60, tz="Asia/Kolkata")


@pytest.fixture(scope="module")
def chart():
    jd = get_julian_day(REF["date"], REF["time"], REF["tz"])
    return compute_planetary_positions(jd, REF["lat"], REF["lon"], "thirukkanitham", REF["date"], REF["time"], REF["tz"])


@pytest.fixture(scope="module")
def report():
    return build_kalai_report("REF-001", REF["date"], REF["time"], "reference",
                              REF["lat"], REF["lon"], REF["tz"])


def _dms_to_sec(s):
    d, m, x = [int(v) for v in s.split()]
    return d * 3600 + m * 60 + x


def test_general_details(chart):
    b = chart["basic_details"]
    assert b["sun_rise"] == "06:19:58 AM"
    assert b["sun_set"] == "06:28:17 PM"
    assert b["ayanamsa_dms"].startswith("23° 49' 5")  # Kalai prints 23:49:51
    assert b["nakshatra_horai"] == "13:46:49"
    assert b["udhayadhi_nazhigai_full"].startswith("47 நாழிகை 30 விநாழிகை")


def test_graha_spudam_within_one_second(report):
    kalai = {"Sun": "350 01 24", "Moon": "079 47 09", "Mars": "359 14 51", "Mercury": "354 59 04",
             "Jupiter": "319 59 33", "Venus": "303 40 53", "Saturn": "358 17 40",
             "Rahu": "134 58 45", "Ketu": "314 58 45", "Mandi": "270 37 11", "Lagna": "266 52 47"}
    ours = {g["planet"]: g["longitude_dms"] for g in report["graha_spudam"]}
    for p, v in kalai.items():
        assert abs(_dms_to_sec(ours[p]) - _dms_to_sec(v)) <= 1, p


def test_bhava_sripati(report):
    rows = report["bhava_spudam"]
    assert (rows[0]["arambam_dms"], rows[0]["madhyam_dms"], rows[0]["anthyam_dms"]) == ("253 13 01", "266 52 47", "283 13 01")
    assert rows[3]["madhyam_dms"] == "004 54 14"
    assert rows[9]["madhyam_dms"] == "184 54 14"


def test_dasa_balance_and_bhuktis():
    moon = 79 + 47 / 60 + 9 / 3600
    bal = calculate_dasha_balance(moon)
    assert (bal["lord"], bal["years"], bal["months"], bal["days"]) == ("Rahu", 0, 3, 14)
    ds = calculate_vimshottari_dasha(moon, REF["date"])
    guru = next(d for d in ds if d["planet"] == "Jupiter")
    assert [b["end_date_display"] for b in guru["bhuktis"]] == [
        "06-09-2000", "18-03-2003", "24-06-2005", "01-06-2006", "01-02-2009",
        "18-11-2009", "18-03-2011", "24-02-2012", "18-07-2014"]
    assert guru["bhuktis"][3]["age_ymd"] == [8, 1, 27]
    sani = next(d for d in ds if d["planet"] == "Saturn")
    assert sani["bhuktis"][0]["antardashas"][0]["end_date_display"] == "09-01-2015"


def test_ashtakavarga_kalai(report):
    av = report["ashtakavarga"]
    assert av["sarvashtakavarga"] == [24, 27, 23, 28, 26, 27, 30, 29, 40, 39, 19, 25]
    sun = av["planets"]["Sun"]
    assert (sun["aadhi_paral"], sun["trikona_total"], sun["ekadhi_total"]) == (48, 30, 24)
    assert (sun["rasi_gunakaram"], sun["graha_gunakaram"], sun["shuddha_pindam"]) == (179, 44, 223)
    assert (sun["guna_samooham"], sun["eka_samooham"]) == (102, 325)
    moon = av["planets"]["Moon"]
    assert (moon["shuddha_pindam"], moon["eka_samooham"]) == (292, 399)


def test_shadbala_kalai(report):
    """Shadbala vs REF-001 (rupas). Exact components asserted to 0.001;
    components with a documented open gap use their measured tolerance."""
    sb = report["shadbala"]["planets"]
    P = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    kalai = {
        "sthana": [3.108, 3.678, 3.972, 2.180, 2.125, 3.016, 2.464],
        "dig": [0.083, 0.584, 0.031, 0.511, 0.705, 0.660, 0.508],
        "naisargika": [1.000, 0.857, 0.286, 0.428, 0.571, 0.714, 0.143],
        "kala": [2.345, 1.903, 2.078, 3.157, 2.225, 1.848, 2.460],
    }
    tol = {"sthana": 0.001, "dig": 0.001, "naisargika": 0.0015, "kala": 0.005}
    for comp, vals in kalai.items():
        for p, v in zip(P, vals):
            assert abs(sb[p][comp] - v) <= tol[comp], (comp, p, sb[p][comp], v)
    drik = [0.096, None, 0.115, 0.106, 0.125, 0.159, 0.113]  # Moon: open gap
    for p, v in zip(P, drik):
        if v is not None:
            assert abs(sb[p]["drik"] - v) <= 0.002, (p, sb[p]["drik"], v)
    assert [sb[p]["rank"] for p in P] == [6, 4, 2, 5, 7, 3, 1]


def test_bhava_bala_kalai(report):
    bh = report["shadbala"]["bhavas"]
    assert [b["dig"] for b in bh] == [0.5, 0.667, 0.833, 0.0, 0.167, 0.333, 0.0, 0.333, 0.333, 0.5, 0.333, 0.167]
    exact_drik = {1: -0.180, 2: 0.167, 3: 0.099, 4: 0.223, 5: 0.535, 8: -0.198, 9: 0.802, 10: -0.707, 12: -0.553}
    for h, v in exact_drik.items():
        assert abs(bh[h - 1]["drik"] - v) <= 0.002, (h, bh[h - 1]["drik"], v)


KALAI_VARGA_TOTALS = {"Sun": 191.25, "Moon": 165.0, "Mars": 245.625, "Mercury": 153.75, "Jupiter": 170.625,
                      "Venus": 183.75, "Saturn": 178.125, "Rahu": 123.75, "Ketu": 150.0, "Lagna": 228.75}


def test_shodasa_varga(report):
    sv = report["shodasa_varga"]
    assert sv["status"] == "ok"
    for p, v in KALAI_VARGA_TOTALS.items():
        assert abs(sv["bala"]["totals"][p] - v) < 0.01, p
    ch = sv["charts"]  # spot-check Kalai varga-adhipati table
    assert ch["D9"]["lords"]["Venus"] == "Mars"
    assert ch["D60"]["lords"]["Sun"] == "Moon" and ch["D60"]["lords"]["Moon"] == "Mercury"
    assert ch["D45"]["lords"]["Lagna"] == "Mars"
    assert ch["D24"]["lords"]["Rahu"] == "Moon"


def test_planet_details(report):
    rows = {r["planet"]: r for r in report["planet_details"]["rows"]}
    P9 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
    assert [rows[p]["bhava"] for p in P9] == [4, 7, 4, 4, 3, 2, 4, 8, 2]
    assert [rows[p]["suyam_bhava_bala_pct"] for p in P9] == [8, 48, 65, 39, 25, 74, 59, 5, 5]
    assert rows["Mars"]["lord_of"] == [5, 12] and rows["Venus"]["lord_of"] == [6, 11]
    assert rows["Mercury"]["dignity"] == "debilitated" and rows["Jupiter"]["dignity"] == "neutral"
    assert rows["Rahu"]["dignity"] == "enemy" and rows["Ketu"]["dignity"] == "enemy"
    assert sorted(rows["Moon"]["aspected_by"]) == ["Jupiter", "Mars"]
    assert rows["Jupiter"]["aspected_by"] == ["Rahu"]
    assert rows["Mercury"]["retrograde"] and rows["Mercury"]["combust"]
    assert rows["Saturn"]["vargottama"] and rows["Rahu"]["vargottama"]
    assert rows["Jupiter"]["parivartana_with"] == "Saturn"
    assert report["planet_details"]["wars"] == [{"planets": ["Mars", "Saturn"], "winner": "Saturn"}]
    assert [rows[p]["shadbala_class"] for p in ["Sun", "Mars", "Jupiter"]] == ["mathima", "poorna", "adhama"]


def test_kalachakra_apasavya(report):
    kc = report["kalachakra"]
    assert kc["status"] == "ok" and kc["direction"] == "apasavya" and kc["first_sign"] == "Sg"
    assert [d["sign"] for d in kc["dashas"]] == ["Sg", "Sc", "Li", "Vi", "Le", "Cn", "Ge", "Ta", "Ar", "Pi", "Aq", "Cp"]
    assert kc["dashas"][0]["balance_ymd"] == [0, 7, 21] and kc["dashas"][0]["end"] == "25-11-1998"
    sc = kc["dashas"][1]
    assert [b["sign"] for b in sc["bhuktis"]] == ["Sg", "Cp", "Aq", "Pi", "Ar", "Ta", "Ge", "Le", "Cn"]
    assert [b["end"] for b in sc["bhuktis"]][:3] == ["18-09-1999", "15-01-2000", "12-05-2000"]
    assert sc["bhuktis"][-1]["end"] == "25-11-2005"
    cp = kc["dashas"][11]
    assert [b["sign"] for b in cp["bhuktis"]] == ["Vi", "Le", "Cn", "Ge", "Ta", "Ar", "Sg", "Cp", "Aq"]
    assert cp["bhuktis"][-1]["end"] == "25-11-2106"


def test_kalachakra_savya_t01():
    """T01 (Bharani pada 4, Savya): first dasa Vrischika 5 y 3 m 17 d, then forward."""
    from backend.app.services.kalai_kalachakra import calculate_kalachakra
    r = calculate_kalachakra(24 + 8 / 60 + 36 / 3600, "2011-03-10")
    assert r["direction"] == "savya" and r["first_sign"] == "Sc"
    assert r["dashas"][0]["balance_ymd"] == [5, 3, 17]
    assert [d["sign"] for d in r["dashas"][:4]] == ["Sc", "Sg", "Cp", "Aq"]
    assert [b["sign"] for b in r["dashas"][1]["bhuktis"]] == ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg"]


def test_kalai_delta_t_and_fixed_offset_tz():
    from backend.app.services.ephemeris import get_tz, kalai_delta_t_seconds
    assert kalai_delta_t_seconds(2451545.0) is None           # 2000: modern table
    assert 83.0 < kalai_delta_t_seconds(2461160.0) < 85.5      # mid-2026: ~84 s
    assert get_tz("UTC-06:30").utcoffset(None).total_seconds() == -23400


def test_tamil_to_english_screenshots():
    from backend.app.services.kalai_tamil_calendar import tamil_to_english
    assert tamil_to_english(1, 1, 37, 24)["display"] == "13-04-1903"   # 1 Chithirai Sobhakrit
    assert tamil_to_english(1, 1, 37, 42)["display"] == "30-04-2983"
    assert tamil_to_english(6, 7, 59, 42)["display"] == "08-11-3005"   # 6 Aippasi Krodhana


def test_naligai_to_time_and_time_correction():
    from datetime import date
    from backend.app.services.kalai_tamil_calendar import naligai_to_time
    from backend.app.services.ephemeris import apply_time_correction
    r = naligai_to_time(date(2026, 4, 15), 13, 8, 43, 11.0, 77.0, "UTC+05:30")   # T001
    assert r["time"] == "15-04-2026 11:30:00 AM"
    assert apply_time_correction("Asia/Kolkata", "2008-05-06", "07:20", "dst") == "UTC+06:30"


def test_tamil_date_reference(report):
    assert report["general"]["tamil_date_ta"] == "ஈஸ்வர பங்குனி 20"



# ---------------------------------------------------------------------------
# KP — reference: Kalai "KP All" report, 04-12-1977 11:25 IST, 11N 77E
# ---------------------------------------------------------------------------
@pytest.fixture(scope="module")
def kp():
    import swisseph as swe
    from backend.app.services.kalai_kp import compute_kp
    return compute_kp(swe.julday(1977, 12, 4, 5 + 55 / 60), 11.0, 77.0, "1977-12-04", "11:25:00")


def test_kp_positions_and_lords(kp):
    assert kp["ayanamsa_dms"] in ("23:32:15", "23:32:14")
    P = {p["planet"]: p for p in kp["planets"]}
    for k, v in (("Sun", "228 26 03"), ("Moon", "142 40 15"), ("Fortuna", "214 21 40")):
        assert abs(_dms_to_sec(P[k]["dms"]) - _dms_to_sec(v)) <= 1, (k, P[k]["dms"], v)
    assert (P["Venus"]["star"], P["Venus"]["sub"], P["Venus"]["subsub"]) == ("Saturn", "Mercury", "Rahu")
    assert (P["Neptune"]["star"], P["Neptune"]["sub"], P["Neptune"]["subsub"]) == ("Mercury", "Sun", "Venus")
    C = kp["cusps"]
    for c, v in zip(C[:4], ["300 07 28", "334 56 46", "008 06 05", "037 17 44"]):
        assert abs(_dms_to_sec(c["dms"]) - _dms_to_sec(v)) <= 1, (c["dms"], v)
    assert (C[3]["sign"], C[3]["star"], C[3]["sub"], C[3]["subsub"]) == ("Venus", "Sun", "Ketu", "Mars")
    assert (C[11]["star"], C[11]["sub"], C[11]["subsub"]) == ("Sun", "Rahu", "Mercury")


def test_kp_significators(kp):
    S = {s["planet"]: s for s in kp["planet_significators"]}
    assert S["Sun"]["by_star"] == [5, 7, 8, 10, 11] and S["Sun"]["by_sub"] == [2, 5, 8, 11]
    assert S["Saturn"]["by_star"] == [1, 2, 7, 12] and S["Saturn"]["by_sub"] == [6, 7, 8]
    assert S["Mercury"]["aspected_by"] == ["Jupiter"] and S["Rahu"]["aspected_by"] == ["Ketu"]
    B = {b["house"]: b for b in kp["bhava_significators"]}
    assert B[7]["in_star_of_occupants"] == ["Rahu", "Venus"] and B[7]["occupants"] == ["Moon", "Saturn"]
    assert B[5]["in_star_of_lord"] == ["Sun", "Mars", "Ketu"] and B[5]["lord"] == "Mercury"


def test_kp_aspects_and_dasa(kp):
    assert kp["bhava_aspects"]["Sun"] == ["89.1", "123.1", "154.3", "182.1", "208.6", "236.8",
                                          "269.1", "303.1", "334.3", "2.1", "28.6", "56.8"]
    assert kp["planet_aspects"]["Moon"]["Sun"] == "85.8" and kp["planet_aspects"]["Rahu"]["Ketu"] == "180"
    b = kp["dasa_balance"]
    assert (b["lord"], b["years"], b["months"], b["days"]) == ("Venus", 5, 11, 27)
    assert [x["end_date_display"] for x in kp["dashas"][0]["bhuktis"]] == ["01-12-1979", "01-10-1982", "01-12-1983"]



def test_kp_horary_table_and_ascendant():
    import swisseph as swe
    from backend.app.services.kalai_kp import compute_kp_horary, horary_table
    tab = horary_table()
    assert len(tab) == 249
    assert (tab[0]["start_dms"], tab[0]["star"], tab[0]["sub"]) == ("000 00 00", "Ketu", "Ketu")
    assert tab[248]["sign"] == "Jupiter" and tab[248]["sub"] == "Saturn"
    r = compute_kp_horary(108, swe.julday(2026, 9, 28, 6.5), 11.0, 77.0, "2026-09-28", "12:00:00")
    assert r["cusps"][0]["dms"] == tab[107]["start_dms"]


def test_shadbala_2026_birth_t02():
    """T02 (anonymised): 25-05-2026 18:45 IST, 11N 77E — cheshta and kala lords."""
    r = build_kalai_report("T02", "2026-05-25", "18:45:00", "reference", 11.0, 77.0, "UTC+05:30")
    sb = r["shadbala"]
    kalai_cheshta = {"Mars": 0.766, "Mercury": 0.277, "Jupiter": 0.288, "Venus": 0.398, "Saturn": 0.289}
    for p, v in kalai_cheshta.items():
        assert abs(sb["planets"][p]["cheshta"] - v) <= 0.0015, (p, sb["planets"][p]["cheshta"], v)
    assert sb["context"]["abda_lord"] == "Jupiter" and sb["context"]["masa_lord"] == "Venus"
    assert sb["context"]["mercury_malefic"] is True


# ---------------------------------------------------------------------------
# Matching — 3 anonymised Kalai printouts (totals, verdicts, Sevvai, dasa sandhi)
# ---------------------------------------------------------------------------
def test_poruthams_three_kalai_samples():
    from backend.app.services.kalai_matching import compute_poruthams
    cases = [((3, 1, 12, 6), 13, [0, 0, 2, 1, 2, 1, 1, 0, 0, 4, 2, 0]),
             ((16, 7, 11, 5), 19, [0, 0, 0, 2, 2, 3, 0, 0, 5, 4, 2, 1]),
             ((18, 8, 13, 6), 18, [0, 0, 0, 2, 1, 3, 1, 2, 5, 4, 0, 0])]
    for args, total, pts in cases:
        r = compute_poruthams(*args)
        assert [x["points"] for x in r["rows"]] == pts and r["total"] == total


def test_matching_sevvai_and_sandhi():
    from datetime import date
    from backend.app.services.kalai_matching import build_kalai_matching
    g = dict(name="G", date_of_birth="2006-09-02", time_of_birth="06:55:00", place="x",
             latitude=10 + 40 / 60, longitude=77 + 1 / 60, timezone="Asia/Kolkata")
    b = dict(name="B", date_of_birth="1997-08-08", time_of_birth="21:55:00", place="x",
             latitude=10 + 37 / 60, longitude=77 + 16 / 60, timezone="Asia/Kolkata")
    m = build_kalai_matching(g, b, date(2026, 9, 28))
    assert m["sevvai"] == {"girl": "parihara", "boy": "parihara", "match": True}
    assert m["dasa_sandhi"]["sandhi"] and m["dasa_sandhi"]["girl"]["end"] == "06-04-2041"
    assert m["dasa_sandhi"]["boy"]["end"] == "18-09-2040"
    assert m["boy"]["current_dasa_bhukti"]["end"] == "06-11-2026"
    assert [x["planet"] for x in m["girl"]["bhava_moves"]] == ["Mars", "Venus", "Rahu", "Ketu"]


def test_kalai_uses_moshier_ephemeris():
    """Kalai Magal computes with Swiss Ephemeris' built-in Moshier ephemeris (no
    .se1 files ship with it). Our parity depends on the same backend."""
    import swisseph as swe
    from backend.app.core.config import settings
    import backend.app.services.ephemeris  # noqa: F401  (sets the ephemeris path)
    if settings.KALAI_EPHEMERIS != "moshier":
        pytest.skip("KALAI_EPHEMERIS=files — parity tests may differ by one day at boundaries")
    flags = swe.calc_ut(swe.julday(1997, 8, 8, 16.4), swe.MOON, swe.FLG_SWIEPH)[1]
    assert flags & swe.FLG_MOSEPH, "Swiss .se1 files are being used; unset SE_EPHE_PATH"



def test_panchapakshi_reference(report):
    pk = report["panchapakshi"]
    assert pk["birth_bird"] == "Owl" and pk["birth_paksha"] == "shukla"          # REF-001 Ardra, waxing
    assert pk["shukla"]["grid"][0]["activities"][:5] == ["Walk", "Rule", "Sleep", "Death", "Eat"]


def test_panchapakshi_detailed_t01():
    """T01 (Bharani, waxing → Vulture): Kalai's detailed pages, spot rows."""
    from backend.app.services.kalai_panchapakshi import panchapakshi_report
    r = panchapakshi_report(2, True, detailed_pages=True)
    p0 = r["detailed"][0]
    assert p0["weekdays"] == ["Sunday", "Tuesday"] and p0["ruling_bird"] == "Vulture"
    s = p0["yamas"][0]["subs"]
    assert [(x["bird"], x["activity"], x["start"], x["end"], x["relation"], x["result"]) for x in s] == [
        ("Vulture", "Eat", "06:00", "06:30", "Self", "Good"), ("Owl", "Walk", "06:30", "07:06", "Friend", "Good"),
        ("Crow", "Rule", "07:06", "07:54", "Enemy", "Good"), ("Cock", "Sleep", "07:54", "08:12", "Enemy", "Medium"),
        ("Peacock", "Death", "08:12", "08:24", "Friend", "Medium")]
    dark = [p for p in r["detailed"] if p["paksha"] == "krishna" and p["part"] == "day"][0]
    assert dark["weekdays"] == ["Sunday", "Tuesday"] and dark["ruling_bird"] == "Cock"
    assert dark["yamas"][0]["subs"][2]["relation"] == "Friend"   # Owl, friend list of the birth paksha
    assert len(r["detailed"]) == 20


def test_upagraha_and_prasthara_t04():
    """T04 (anonymised): 10-01-1945 08:00 IST, 11N 77E — upagraha spudam and prasthara."""
    r = build_kalai_report("T04", "1945-01-10", "08:00:00", "reference", 11.0, 77.0, "UTC+05:30")
    up = {x["key"]: _dms_to_sec(x["dms"]) for x in r["upagraha"]["rows"]}
    kalai = {"gulika": "355 21 32", "yamaghantaka": "301 52 56", "ardhaprahara": "277 38 41",
             "kala": "021 03 22", "mrityu": "066 01 48", "dhuma": "039 44 50", "vyatipata": "320 15 10",
             "parivesha": "140 15 10", "indrachapa": "219 44 50", "upaketu": "236 24 50"}
    for k, v in kalai.items():
        assert abs(up[k] - _dms_to_sec(v)) <= 1, (k, up[k], v)
    sun = r["prasthara"]["planets"]["Sun"]
    assert sun["column_totals"] == [4, 6, 3, 4, 4, 2, 4, 5, 5, 5, 4, 2] and sun["total"] == 48
    assert "".join("0" if c else "-" for c in sun["rows"][0]["cells"]) == "00-0--00000-"


def test_mandi_night_edge_t02_t03():
    """Kalai measures the neighbouring night from the birth-date sunrise/sunset ± 1 day."""
    t02 = build_kalai_report("T02", "2026-05-25", "18:45:00", "reference", 11.0, 77.0, "UTC+05:30")
    t03 = build_kalai_report("T03", "2026-06-02", "03:15:00", "reference", 11.0, 77.0, "UTC+05:30")
    up2 = {x["key"]: x["dms"] for x in t02["upagraha"]["rows"]}
    up3 = {x["key"]: x["dms"] for x in t03["upagraha"]["rows"]}
    m2 = next(g for g in t02["graha_spudam"] if g["planet"] == "Mandi")["longitude_dms"]
    m3 = next(g for g in t03["graha_spudam"] if g["planet"] == "Mandi")["longitude_dms"]
    assert abs(_dms_to_sec(m2) - _dms_to_sec("251 29 22")) <= 1     # Kalai T02 Mandi/Gulika
    assert abs(_dms_to_sec(m3) - _dms_to_sec("258 20 45")) <= 1     # Kalai T03 Mandi/Gulika
    assert abs(_dms_to_sec(up2["gulika"]) - _dms_to_sec("251 29 22")) <= 1
    assert abs(_dms_to_sec(up3["gulika"]) - _dms_to_sec("258 20 45")) <= 1



def test_matching_six_targeted_couples():
    """M1–M6 (Karaikkudi girl / Kovilpatti boy, IST): all 12 rows, Sevvai, dasa sandhi."""
    from datetime import date
    from backend.app.services.kalai_matching import build_kalai_matching
    G = dict(latitude=10 + 4 / 60, longitude=78 + 47 / 60, timezone="Asia/Kolkata", place="x")
    B = dict(latitude=9 + 10 / 60, longitude=77 + 52 / 60, timezone="Asia/Kolkata", place="x")
    C = {"M1": (("1996-01-06", "10:00:00"), ("1993-01-18", "10:00:00"), [3, 4, 0, 1, 2, 1, 1, 0, 5, 4, 2, 1], ("parihara", "none", True)),
         "M2": (("1997-04-08", "10:00:00"), ("1994-02-12", "10:00:00"), [3, 2, 0, 2, 1, 3, 1, 0, 5, 4, 0, 1], ("dosham", "none", False)),
         "M3": (("1998-05-23", "10:00:00"), ("1995-02-23", "10:00:00"), [3, 2, 0, 2, 2, 0, 4, 2, 0, 0, 0, 1], ("none", "parihara", False)),
         "M4": (("1999-01-27", "10:00:00"), ("1996-06-17", "10:00:00"), [0, 4, 0, 0, 2, 0, 4, 0, 0, 4, 2, 1], ("parihara", "none", False)),
         "M5": (("2000-01-23", "14:00:00"), ("1997-06-26", "14:00:00"), [0, 0, 2, 2, 2, 0, 0, 0, 5, 4, 2, 0], ("none", "parihara", False)),
         "M6": (("1996-03-02", "10:00:00"), ("1993-06-03", "10:00:00"), [3, 2, 0, 1, 1, 0, 3, 2, 5, 4, 2, 1], ("none", "none", False))}
    for k, (g, b, pts, (gs, bs, sandhi)) in C.items():
        m = build_kalai_matching(dict(name="g", date_of_birth=g[0], time_of_birth=g[1], **G),
                                 dict(name="b", date_of_birth=b[0], time_of_birth=b[1], **B), date(2026, 9, 29))
        assert [r["points"] for r in m["poruthams"]["rows"]] == pts, k
        assert (m["sevvai"]["girl"], m["sevvai"]["boy"], m["dasa_sandhi"]["sandhi"]) == (gs, bs, sandhi), k


def test_tamil_calendar_new_screenshots_and_matching_dates():
    from datetime import date
    from backend.app.services.kalai_tamil_calendar import tamil_date, tamil_to_english
    assert tamil_to_english(1, 5, 40, 26)["display"] == "18-08-2026"   # 1 Aavani Parabhava
    assert tamil_to_english(1, 6, 40, 26)["display"] == "18-09-2026"   # 1 Purattasi Parabhava
    assert tamil_to_english(1, 1, 22, 26)["display"] == "13-04-2008"   # 1 Chithirai Sarvadhari
    cases = [((2026, 8, 18), "06:01:00", "பராபவ ஆடி 32"), ((2026, 9, 12), "12:00:00", "பராபவ ஆவணி 26"),
             ((2026, 10, 5), "09:00:00", "பராபவ புரட்டாசி 18"), ((2008, 5, 6), "07:20:00", "சர்வதாரி சித்திரை 24"),
             ((1998, 7, 5), "04:50:00", "வெகுதாணிய ஆனி 20")]
    for d, t, exp in cases:
        assert tamil_date(date(*d), t, 11.0, 77.0, "UTC+05:30")["formatted_ta"] == exp, (d, exp)



def test_time_correction_options_and_old_births():
    from backend.app.services.ephemeris import apply_time_correction
    assert apply_time_correction("Asia/Kolkata", "2008-05-06", "07:20", "dst2") == "UTC+07:30"
    assert apply_time_correction("UTC+05:30", "1943-05-06", "07:20", "dst_war") == "UTC+07:30"
    # D2 (anonymised, 20-11-1975 14:15 IST, 10:45N 79:07E): Kalai Shadbala totals
    r = build_kalai_report("D2", "1975-11-20", "14:15:00", "reference", 10.75, 79 + 7 / 60, "UTC+05:30")
    assert r["shadbala"]["status"] == "ok"


def test_kp_new_comb_2019_and_kp_old():
    import swisseph as swe
    from backend.app.services.ephemeris import get_julian_day, kalai_ephemeris
    from backend.app.services.kalai_kp import compute_kp, kp_ayanamsa, dms
    jd = get_julian_day("2019-08-12", "10:20:00", "UTC+05:30")
    with kalai_ephemeris(jd):
        r = compute_kp(jd, 11.0, 77.0, "2019-08-12", "10:20:00")
    assert r["ayanamsa_dms"] == "24:07:09"
    assert [c["dms"] for c in r["cusps"][:3]] == ["175 44 27", "205 48 24", "235 06 05"]
    jd2 = get_julian_day("2026-09-29", "11:52:23", "UTC+05:30")
    with kalai_ephemeris(jd2):
        assert abs(kp_ayanamsa(jd2, "old") * 3600 - (24 * 3600 + 8 * 60 + 11)) <= 1.5



def test_kalai_baby_numbers_and_totals():
    from datetime import date
    from backend.app.services.kalai_baby_names import allowed_numbers, chaldean, date_numbers, star_letters
    assert date_numbers(date(2026, 3, 7)) == (7, 2)
    assert allowed_numbers(7, 2) == ([15, 24, 33, 42, 51, 69, 38, 47], True)            # BN1
    assert allowed_numbers(*date_numbers(date(2025, 12, 29)))[0] == [14, 23, 32, 41, 50, 6, 15, 24, 33, 42]  # BN4
    assert chaldean("CHANDRABOSE") == 38 and chaldean("CHANDRABOSE") + chaldean("D") == 42
    assert star_letters(26)["display"] == "து - ஞ - ச - ஸ்ரீ"                            # BN3 Uttarattathi
    assert star_letters(7)["display"] == "கே - கோ - ஹ - ஹி - ( கெ - கை - இ )"           # Punarpoosam


def test_kalai_baby_report_filters():
    from datetime import date
    from backend.app.services.kalai_baby_names import kalai_baby_names
    r = kalai_baby_names("star_numerology", "boy", date(2026, 6, 9), star=26, initials=["S"])
    assert r["date_number"] == 9 and r["destiny_number"] == 7
    assert kalai_baby_names("numerology_numbers", "boy", date(2025, 12, 29), initials=["R"])["count"] > 0
    for n in r["names"]:
        assert n["total"] in r["allowed_numbers"]
        assert any(n["name_ta"].split(".")[-1].startswith(l) for l in r["star_letters"]["letters"])


def test_horary_2193_table():
    from backend.app.services.kalai_kp import horary_table
    t = horary_table("subsub")
    assert len(t) == 2193 and t[0]["start"] == 0.0 and (t[0]["star"], t[0]["sub"], t[0]["subsub"]) == ("Ketu", "Ketu", "Ketu")



def test_kalai_names_seed_and_printout_import():
    import base64
    from backend.app.services.kalai_name_import import parse_printout_text, seed_kalai_names, tamil_first_letter
    r = seed_kalai_names()
    assert r["candidates"] >= 10000
    assert tamil_first_letter("ஸ்ரீராம்") == "ஸ்ரீ" and tamil_first_letter("சக்கரவர்த்தி") == "ச"
    rows = parse_printout_text("ஆண் / பெண் : பெண்\nK.ABHIRAMI 19 K.அபிராமி\nAMUTHA 19 அமுதா\n")
    assert rows == [{"en": "Abhirami", "ta": "அபிராமி", "gender": "girl"}, {"en": "Amutha", "ta": "அமுதா", "gender": "girl"}]


def test_matching_archive_couples():
    """KALAI_ASTRO archive: Magam girl / Uttarattathi boy (19/37) and a Vakyam couple (15/37)."""
    from datetime import date
    from backend.app.services.kalai_matching import build_kalai_matching, compute_poruthams
    assert [r["points"] for r in compute_poruthams(10, 5, 26, 12)["rows"]] == [0, 0, 0, 2, 1, 0, 4, 0, 5, 4, 2, 1]
    assert [r["points"] for r in compute_poruthams(11, 5, 26, 12)["rows"]] == [0, 4, 2, 2, 2, 0, 4, 0, 0, 0, 0, 1]
    m = build_kalai_matching(
        dict(name="g", date_of_birth="1999-03-01", time_of_birth="20:55:00", place="x", latitude=11.0, longitude=77 + 17 / 60, timezone="Asia/Kolkata"),
        dict(name="b", date_of_birth="1998-02-28", time_of_birth="15:20:00", place="x", latitude=10 + 37 / 60, longitude=77 + 16 / 60, timezone="Asia/Kolkata"),
        date(2026, 9, 29))
    assert (m["sevvai"]["girl"], m["sevvai"]["boy"], m["dasa_sandhi"]["sandhi"]) == ("parihara", "none", False)


def test_print_pdf_html_for_all_features():
    """The WeasyPrint service builds valid HTML for all four features (runtime-independent)."""
    from backend.app.services.pdf.builders import baby_request, kanitha_request, kp_request, porutham_request
    from backend.app.services.pdf.render import build_html
    birth = {"name": "T", "date_of_birth": "2004-10-06", "time_of_birth": "00:32:00", "place": "x",
             "latitude": 10.5833, "longitude": 77.25, "timezone": "Asia/Kolkata"}
    reqs = [kanitha_request(birth, "ta", "ganesha", "south"), kp_request(birth, "ta", "murugan", "south"),
            porutham_request(dict(birth, date_of_birth="2004-10-27", time_of_birth="16:40:00"), birth, "ta", "om", "north"),
            baby_request({"report_type": "star_numerology", "sex": "boy", "birth_date": "2026-06-09", "star": 26, "initials": ["S"]}, "ta", "ganesha")]
    for r in reqs:
        html = build_html(r)
        assert "@page" in html and "counter(pages)" in html and "break-inside: avoid" in html
    assert "விம்சோத்தரி தசா புக்தி" in build_html(reqs[0])
    assert "உப அதிபதி" in build_html(reqs[1])
    assert "✔" in build_html(reqs[2]) or "✕" in build_html(reqs[2])


def test_tamil_name_numerology_and_horary_pdf_html():
    from backend.app.services.tamil_latin import tamil_to_latin
    from backend.app.services.pdf.builders import kp_horary_request
    from backend.app.services.pdf.render import build_html
    assert tamil_to_latin("மித்ரா") == "mithraa" and tamil_to_latin("ஸ்ரீராம்") == "sriraam"
    r = build_kalai_report("குருபிரசாத்", "2004-10-06", "00:32:00", "x", 10.58, 77.25, "Asia/Kolkata")
    assert r["numerology"]["data"]["name_number"] != 0
    req = kp_horary_request({"number": 108, "system": "249", "date": "2026-09-29", "time": "11:52:40",
                             "latitude": 11, "longitude": 77, "timezone": "Asia/Kolkata", "place": "Coimbatore"}, "ta", "om", "south")
    html = build_html(req)
    assert "பொருளடக்கம்" in html and "மங்கள வாழ்த்துரை" in html and "&amp;" not in html.split("<body>")[0]


def test_palan_sections_complete():
    """Bhava (12), mahadasa (9 with 9 bhuktis each), Guru/Sani gochara periods, yogas — Tamil and English."""
    from datetime import date
    from backend.app.services.palan.compose import compose_palan
    r = build_kalai_report("T", "2004-10-06", "00:32:00", "x", 10.58, 77.25, "Asia/Kolkata")
    for lang in ("ta", "en"):
        p = compose_palan(r, lang, date(2026, 10, 1))
        assert len(p["bhava"]) == 12 and all(len(h["paragraphs"]) >= 4 for h in p["bhava"])
        assert len(p["dasa"]) == 9 and p["dasa"][0]["bhuktis"] and all(len(d["bhuktis"]) == 9 for d in p["dasa"][1:])
        assert len(p["gochara"]["guru"]) >= 10 and len(p["gochara"]["sani"]) >= 10
        assert p["yoga"]


def test_single_page_sheet_html():
    """ஒரு பக்க ஜாதகம்: one sheet with details, two planet tables, two charts and the summary lines."""
    from backend.app.services.pdf.render_single import build_single_html
    r = build_kalai_report("T", "2020-12-05", "16:20:00", "Udumalaipettai", 10 + 37 / 60, 77 + 16 / 60, "Asia/Kolkata")
    h = build_single_html(r, "ta")
    for s in ("ஓம் நமச்சிவாய", "திருக்கணித கிரக ஸ்புடம்", "ராசி", "நவாம்சம்", "பாவக மாற்றம்", "ஜனன கால தசை இருப்பு",
              "நியுமராலஜிப்படி பெயரின் கூட்டு எண்", "14-23-32-41-50-59-77-21-39", "சுபம்"):
        assert s in h
    assert "பொருளடக்கம்" not in h and "தமிழ் தாய் வாழ்த்து" not in h


def test_designed_pdf_bug_fixes_round_29():
    """Bug fixing (2026-10-07): transparent deity art and logo, Tamil gender on the cover, logo on the
    LAST page, single page = typed town only + two corner deities + themed border, fixed chart
    artwork in every theme, cyan-blue icons beside the details."""
    import os
    from backend.app.services.pdf.builders import kanitha_request
    from backend.app.services.pdf.chart_art import planet_of
    from backend.app.services.pdf.icons import icon_for
    from backend.app.services.pdf.render import APP_DIR, DEITY_DIR, build_html, gender_label
    from backend.app.services.pdf.render_single import build_single_html
    from backend.app.services.pdf.schemas import PdfTheme
    for path in [os.path.join(DEITY_DIR, n + ".png") for n in ("ganesha", "murugan", "om")] + [os.path.join(APP_DIR, "assets", "logo.png")]:
        with open(path, "rb") as f:
            assert f.read(26)[25] == 6, f"{path} must be an RGBA (transparent) PNG"
    assert (gender_label("male", "ta"), gender_label("Female", "ta"), gender_label("m", "en")) == ("ஆண்", "பெண்", "Male")
    birth = {"name": "T", "date_of_birth": "2004-10-06", "time_of_birth": "00:32:00", "place": "உடுமலைபேட்டை, தமிழ்நாடு, இந்தியா",
             "latitude": 10.5833, "longitude": 77.25, "timezone": "Asia/Kolkata", "gender": "male"}
    a = build_html(kanitha_request(birth, "ta", "ganesha", "south", {"accent": "#5b3fb5", "fontId": "kavivanar"}))
    b = build_html(kanitha_request(birth, "ta", "ganesha", "south", {"accent": "#0b6e4f", "fontId": "catamaran"}))
    cover = a.split('<section class="cover">', 1)[1].split("</section>", 1)[0]
    assert ": ஆண்" in cover and "male" not in cover and "logo.png" not in cover
    assert "logo.png" in a.split('class="new-page closing"', 1)[1]
    # charts: no black lines; lines / text follow the panel's accent and typeface; always square
    assert 'border: 2pt solid #5b3fb5' in a and 'border: 2pt solid #0b6e4f' in b and '#141414' not in a.split('/* ---------- charts:')[1]
    assert 'height: 8.0cm' in a and 'font-family: "Jathagam Panel"' in a
    assert 'class="ic"' in a and 'class="ic-h"' in a and planet_of("சனி (வ)") == "Saturn"
    assert icon_for("தமிழ் தாய் வாழ்த்து") == "star" and icon_for("தாயார் பெயர்") == "users" and icon_for("நட்சத்திர ஹோரை") == "telescope"
    r = build_kalai_report("T", "2004-10-06", "00:32:00", "உடுமலைபேட்டை, தமிழ்நாடு, இந்தியா", 10.5833, 77.25, "Asia/Kolkata")
    h = build_single_html(r, "ta", PdfTheme(gold="#123456"), god_image="om", chart_style="north")
    assert "உடுமலைபேட்டை" in h and "தமிழ்நாடு" not in h
    assert 'class="deity l"' in h and 'class="deity r"' in h and "om.png" in h and "3pt double #123456" in h
    assert 'class="chart north"' in h and 'class="ic"' in h


def test_cover_pictures_and_single_sheet_round_30():
    """Bug fixing (2026-10-07, 2nd list): 12 Porutham and Names covers show the owner's picture instead of
    the details box; the single-page bordered sheet fills the page (no extra space at the bottom)."""
    import os
    from backend.app.services.pdf.render import APP_DIR, _cover_picture
    for feature, name in (("thirumana_porutham", "porutham.png"), ("baby_numerology", "names.png")):
        assert os.path.exists(os.path.join(APP_DIR, "assets", "covers", name))
        assert name in _cover_picture(feature)
    assert _cover_picture("kanitha_jathagam") == ""
    from backend.app.services.pdf.render_single import build_single_html
    r = build_kalai_report("T", "2004-10-06", "00:32:00", "x", 10.5833, 77.25, "Asia/Kolkata")
    h = build_single_html(r, "ta")
    assert "height: 274mm" in h and "justify-content: space-between" in h and ".charts .south { height: 78mm; }" in h


def test_porutham_cover_has_no_duplicate_title():
    """The 12 Porutham picture carries 'திருமணப் பொருத்தம்', so the Tamil cover prints no second title."""
    from backend.app.services.pdf.builders import porutham_request
    from backend.app.services.pdf.render import cover
    b = {"name": "b", "date_of_birth": "2004-10-06", "time_of_birth": "00:32:00", "place": "x",
         "latitude": 10.58, "longitude": 77.25, "timezone": "Asia/Kolkata"}
    g = dict(b, name="g", date_of_birth="2004-10-27", time_of_birth="16:40:00")
    assert 'class="title-ta"' not in cover(porutham_request(g, b, "ta", "ganesha", "south"))
    assert 'class="title-ta"' in cover(porutham_request(g, b, "en", "ganesha", "south"))


def test_designed_pdf_round_31_tamil_custom_a5():
    """Bug fixing (2026-10-08): Tamil pages print no English words (times, time zone,
    N/E, ayanamsa name, time correction, initials), father / mother printed once,
    Custom report keeps only the ticked sections, A5 book = same layout on A5."""
    import re
    from backend.app.services.pdf.builders import _bio, kanitha_request, kp_request
    from backend.app.services.pdf.render import A5_ZOOM, build_html
    from backend.app.services.pdf.ta_text import initials_prefix_ta, time_ta, tz_ta, value_ta
    assert time_ta("12:32:00 AM") == "இரவு 12:32:00" and time_ta("06:13:01 AM (பிம்ப மத்தி)") == "காலை 06:13:01 (பிம்ப மத்தி)"
    assert tz_ta("Asia/Kolkata", 5.5) == "இந்திய திட்ட நேரம் (+05:30)"
    assert value_ta("10:34 N / 077:15 E") == "10:34 வடக்கு / 077:15 கிழக்கு"
    assert initials_prefix_ta("C.M.சரண்") == "ச.ம.சரண்"   # initials by sound (c = ச), 4.29.1
    assert [k.label for k in _bio({"father_name": "அ", "father_occupation": "x", "mother_name": "ஆ"}, "ta", skip=("father_name", "mother_name"))] == ["தந்தை தொழில்"]
    birth = {"name": "T", "date_of_birth": "2004-10-06", "time_of_birth": "00:32:00", "place": "உடுமலைபேட்டை",
             "latitude": 10.5833, "longitude": 77.25, "timezone": "Asia/Kolkata", "gender": "male", "father_name": "சந்திரசேகரன்"}
    full = kanitha_request(birth, "ta", "ganesha", "south")
    h = build_html(full)
    body = re.sub(r"<[^>]+>", " ", re.sub(r"<style>.*?</style>", "", h, flags=re.S))
    assert not re.search(r"\b(AM|PM|Asia|Kolkata|Lahiri|Standard|Comprehensive)\b", body)
    assert body.count("சந்திரசேகரன்") == 1          # general details only, not again in the bio card
    custom = kanitha_request(birth, "ta", "ganesha", "south", mode="custom", sections=["dasa_bhukti", "yoga"], page_size="A5")
    assert custom.page_size == "A5" and abs(A5_ZOOM * 182 - 148) < 1e-9
    hc = build_html(custom)
    assert "விம்சோத்தரி தசா புக்தி" in hc and "யோக அவயோகங்கள்" in hc
    assert "பொது விவரங்கள்" not in hc and "சட்பல கணிதம்" not in hc and "size: 182mm 258.25mm" in hc
    assert "தமிழ் தாய் வாழ்த்து" in hc and "மங்கள வாழ்த்துரை" in hc     # general pages stay
    kp = kp_request(birth, "ta", "ganesha", "south", mode="custom", sections=["dasa"])
    d = kp.parsed_data()
    assert not d.planets and not d.cusps and not d.basic_details and d.dashas and not d.extra_tables


def test_designed_pdf_round_32_place_background_centre():
    """Bug fixing (2026-10-09): an English place on a Tamil PDF is printed with its
    standard Tamil name (Palakkad → பாலக்காடு, never a letter-by-letter guess); the
    page background chosen in the panel (white / turmeric) reaches the PDF page;
    the chart centre is the premium ornament (frame, lotus corners, mandala)."""
    from backend.app.api.pdf import _place_for
    from backend.app.services.pdf.builders import _theme
    from backend.app.services.pdf.chart_art import CORNER_URI, FRAME_URI, MANDALA_URI, chart_css
    from backend.app.services.pdf.render import stylesheet
    from backend.app.services.pdf.ta_text import place_ta
    assert place_ta("Palakkad, Kerala, India") == "பாலக்காடு, கேரளா, இந்தியா"
    assert place_ta("Coimbatore, Tamil Nadu, India") == "கோயம்புத்தூர், தமிழ்நாடு, இந்தியா"
    assert place_ta("பாலக்காடு") == "பாலக்காடு" and place_ta("Unknownpur, India") == "Unknownpur, India"
    # only with coordinates (the place string is then not geocoded), only on Tamil pages
    assert _place_for({"place": "Palakkad", "latitude": 10.78, "longitude": 76.65}, "ta")["place"] == "பாலக்காடு"
    assert _place_for({"place": "Palakkad"}, "ta")["place"] == "Palakkad"
    assert _place_for({"place": "Palakkad", "latitude": 10.78, "longitude": 76.65}, "en")["place"] == "Palakkad"
    # background: the panel sends paper = paperCard = the chosen colour
    for colour in ("#FFFFFF", "#FCE38A"):
        css = stylesheet("x", "ta", _theme({"paper": colour, "paperCard": colour}))
        assert f"background: {colour};" in css and "#FDF6E2" not in css and "#FFFBEF" not in css
    # premium centre: corner flourishes, gilded frame and mandala layered in the centre box
    cc = chart_css("#800000", "#2B1B12", "x")
    assert all(u in cc for u in (CORNER_URI["tl"], CORNER_URI["br"], FRAME_URI, MANDALA_URI))
    assert "KEY_URI" not in cc


def test_designed_pdf_round_33_dasa_rows_and_tables():
    """Bug fixing (2026-10-09, PDF pages 7–8): dasa / antharam cards are rows of three
    (no column flow that left half-empty pages), the card text is sized to the chosen
    typeface so the end date never runs into வ / மா / நா, and table headers keep
    Tamil words whole (auto layout; wide tables fixed with a typeface-scaled face)."""
    from backend.app.services.pdf.render import dasa_block, dasa_font_pt, stylesheet, width_ratio
    from backend.app.services.pdf.schemas import BhuktiRow, DasaBlock, PdfTheme
    cards = [DasaBlock(lord=f"L{i}", years=7, start="06-10-2004", end="17-06-2015",
                       bhuktis=[BhuktiRow(lord="செவ்வாய்", end="17-06-2015", age="110 10 11")]) for i in range(4)]
    html = dasa_block(cards, "ta")
    assert html.count('class="dasa-row"') == 2 and html.count('class="dasa empty"') == 2   # 3 + 1 (padded)
    assert "<colgroup>" not in html                                                     # sized to content
    css = stylesheet("x", "ta", PdfTheme(font_id="mla-105"))
    assert "column-count: 3" not in css.split(".names")[0]
    assert dasa_font_pt("noto-sans") > dasa_font_pt("mla-105") >= 5.2                     # wide face → smaller
    assert dasa_font_pt("mla-105", "A5") < dasa_font_pt("mla-105")
    assert width_ratio("noto-sans") == 1.0 and width_ratio("mla-105") < 1.0
    assert "table-layout: auto" in css and "table.wide { table-layout: fixed; }" in css
