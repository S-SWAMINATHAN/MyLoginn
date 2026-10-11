"""
Kalai Magal (KKC Astro) parity — Computation Report ("Type C/D" section order).

Builds the section structure of the Kalai Magal full computation report from
this project's own calculation engine. No vendor text or data is copied: every
value below is computed here. The formats and methods were matched by
comparing an anonymised Kalai Magal reference report against this engine
(see SUMMARY_Phase1_KalaiParity.md for the verification table).

Section order (Kalai Magal table of contents):
   1 General details            ✅ Phase 1
   2 Graha spudam               ✅ Phase 1
   3 Bhava spudam (Sripati)     ✅ Phase 1
   4 Dasa-bhukti                ✅ Phase 1
   5 Antharam                   ✅ Phase 1
   6 Ashtakavarga (per planet)  ✅ Phase 1 (Kalai reductions + pindas)
   7 Sarvashtakavarga           ✅ Phase 1
   8 Shadbala + Bhava bala      ✅ Phase 2 (see kalai_shadbala.py)
   9 Shodasa varga              ✅ Phase 2b (charts, varga lords, varga bala)
  10 Planet details table       ✅ Phase 2b
  11 Numerology                 ✅ existing engine (letter table under review)
  12 Kalachakra dasa            ✅ Phase 3 (Apasavya births; Savya pending a reference)
  13 Panchapakshi               ✅ Phase 6 (2 pages + detailed 2+21 pages)
Sections marked ⏳ are returned with status "pending". They are never filled
with placeholder values (AGENTS.md §1.2).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import swisseph as swe

from backend.app.services.ashtakavarga import ASHTAKAVARGA_RULES
from backend.app.services.dasha_builder import calculate_dasha_balance, calculate_vimshottari_dasha
from backend.app.services.ephemeris import compute_planetary_positions, get_julian_day, kalai_ephemeris
from backend.app.services.geocode import resolve_place
from backend.app.services.kalai_shadbala import compute_kalai_shadbala_auto
from backend.app.services.kalai_kalachakra import calculate_kalachakra
from backend.app.services.kalai_panchapakshi import panchapakshi_report
from backend.app.services.kalai_upagraha import compute_upagrahas
from backend.app.services.kalai_varga import planet_details, shodasa_varga_bala, varga_charts
from backend.app.services.tamil_labels import PLANET_LABELS

SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
NINE = SEVEN + ["Rahu", "Ketu"]

SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
           "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]
SIGN_EN = ["Mesha", "Rishabha", "Mithuna", "Kataka", "Simha", "Kanni",
           "Thula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena"]
SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
             "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]

BHAVA_NAMES_TA = ["லக்ன பாவம்", "தன பாவம்", "சகோதர பாவம்", "மாதா பாவம்",
                  "பித்துரு பாவம்", "சத்துரு பாவம்", "களத்திர பாவம்", "ஆயுர் பாவம்",
                  "பிதுர் பாவம்", "கர்ம பாவம்", "லாப பாவம்", "விரய பாவம்"]
BHAVA_NAMES_EN = ["Lagna", "Dhana", "Sahodhara", "Matha", "Puthra", "Sathru",
                  "Kalathra", "Ayur", "Pithru", "Karma", "Labha", "Vraya"]

# Pinda multipliers (BPHS 70; confirmed on all 7 Kalai Magal pages)
RASI_GUNAKARA = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12]
GRAHA_GUNAKARA = {"Sun": 5, "Moon": 5, "Mars": 8, "Mercury": 5,
                  "Jupiter": 10, "Venus": 7, "Saturn": 5}


def _ta(planet: str) -> str:
    return PLANET_LABELS.get(planet, {}).get("ta", planet)


def dms_parts(deg: float, round_seconds: bool = True) -> Dict[str, int]:
    x = deg % 360.0
    total = int(round(x * 3600.0)) if round_seconds else int(x * 3600.0)
    total %= 360 * 3600
    return {"d": total // 3600, "m": (total % 3600) // 60, "s": total % 60}


def dms_str(deg: float, width: int = 3, round_seconds: bool = True) -> str:
    p = dms_parts(deg, round_seconds)
    return f"{p['d']:0{width}d} {p['m']:02d} {p['s']:02d}"


# --------------------------------------------------------------------------
# 3. Bhava spudam — Sripati
# --------------------------------------------------------------------------
def sripati_bhava(jd_ut: float, lat: float, lon: float,
                  lagna_override: Optional[float] = None) -> List[Dict[str, Any]]:
    """
    Sripati bhava: Asc, IC, Desc and MC are the madhyas of houses 1/4/7/10.
    Each quadrant is trisected; a house begins and ends at the midpoints
    (sandhis) between adjacent madhyas. Source: Sripati Paddhati II.
    Matches a Kalai Magal report within 1 arc-second.

    lagna_override (Vakkiyam): the whole house frame is turned so that the
    1st bhava madhya equals the Vakkiyam lagna (Asc and MC move together,
    so the house sizes stay those of the real sky).
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    _, ascmc = swe.houses_ex(jd_ut, lat, lon, b"P", swe.FLG_SIDEREAL)
    asc, mc = ascmc[0] % 360.0, ascmc[1] % 360.0
    if lagna_override is not None:
        shift = (lagna_override - asc) % 360.0
        asc, mc = (asc + shift) % 360.0, (mc + shift) % 360.0
    cardinals = [asc, (mc + 180.0) % 360.0, (asc + 180.0) % 360.0, mc]

    def arc(a: float, b: float) -> float:
        return (b - a) % 360.0

    madhya = [0.0] * 12
    for q in range(4):
        start, end = cardinals[q], cardinals[(q + 1) % 4]
        span = arc(start, end)
        madhya[q * 3] = start
        madhya[q * 3 + 1] = (start + span / 3.0) % 360.0
        madhya[q * 3 + 2] = (start + 2.0 * span / 3.0) % 360.0

    rows = []
    for h in range(12):
        prev_m, this_m, next_m = madhya[h - 1], madhya[h], madhya[(h + 1) % 12]
        begin = (prev_m + arc(prev_m, this_m) / 2.0) % 360.0
        end = (this_m + arc(this_m, next_m) / 2.0) % 360.0
        rows.append({
            "house": h + 1,
            "name_ta": BHAVA_NAMES_TA[h],
            "name_en": BHAVA_NAMES_EN[h],
            "arambam": round(begin, 6), "arambam_dms": dms_str(begin, round_seconds=False),
            "madhyam": round(this_m, 6), "madhyam_dms": dms_str(this_m, round_seconds=False),
            "anthyam": round(end, 6), "anthyam_dms": dms_str(end, round_seconds=False),
        })
    return rows


def bhava_chart(rows: List[Dict[str, Any]], planets: List[Dict[str, Any]]) -> Dict[int, List[str]]:
    """Bhava (chalit) chart: planet placed in the bhava whose arambam-anthyam arc holds it."""
    out: Dict[int, List[str]] = {r["house"]: [] for r in rows}
    for p in planets:
        lon = p["total_degree"] % 360.0
        for r in rows:
            span = (r["anthyam"] - r["arambam"]) % 360.0
            if (lon - r["arambam"]) % 360.0 < span:
                out[r["house"]].append(p["name"])
                break
    return out


# --------------------------------------------------------------------------
# 6/7. Ashtakavarga — Kalai Magal reductions and pindas
# --------------------------------------------------------------------------
TRIKONA_GROUPS = [(0, 4, 8), (1, 5, 9), (2, 6, 10), (3, 7, 11)]
EKADHI_PAIRS = [(0, 7), (1, 6), (2, 5), (8, 11), (9, 10)]  # Mars, Venus, Mercury, Jupiter, Saturn


def kalai_trikona(bav: List[int]) -> List[int]:
    """Kalai Magal keeps the MINIMUM of each trikona group in all three signs
    (verified on all 7 planet pages of the reference report)."""
    out = [0] * 12
    for g in TRIKONA_GROUPS:
        low = min(bav[i] for i in g)
        for i in g:
            out[i] = low
    return out


def kalai_ekadhipatya(tri: List[int], occupied: List[bool]) -> List[int]:
    """
    Kalai Magal ekadhipatya (two-sign lords), derived from the reference report:
      - unequal pair            -> both signs take the smaller value
      - equal pair, both signs occupied (a planet or the Lagna) -> both 0
      - equal pair otherwise    -> unchanged
    Reproduces all 7 planet pages of the reference report. This rule was
    derived from ONE report; confirm it against more before relying on it.
    """
    out = list(tri)
    for a, b in EKADHI_PAIRS:
        if tri[a] != tri[b]:
            out[a] = out[b] = min(tri[a], tri[b])
        elif occupied[a] and occupied[b]:
            out[a] = out[b] = 0
    return out


def kalai_ashtakavarga(sign_of: Dict[str, int], lagna_sign: int) -> Dict[str, Any]:
    """sign_of: planet -> rasi number 1..12; lagna_sign 1..12."""
    donors = dict(sign_of)
    donors["Lagna"] = lagna_sign
    occupied = [False] * 12
    for name, s in donors.items():
        occupied[(s - 1) % 12] = True

    planets: Dict[str, Any] = {}
    sav = [0] * 12
    contrib: Dict[str, List[int]] = {}
    for recipient in SEVEN:
        bav = [0] * 12
        for donor, houses in ASHTAKAVARGA_RULES[recipient].items():
            base = donors[donor] - 1
            for h in houses:
                bav[(base + h - 1) % 12] += 1
        tri = kalai_trikona(bav)
        eka = kalai_ekadhipatya(tri, occupied)
        rasi_pinda = sum(eka[i] * RASI_GUNAKARA[i] for i in range(12))
        graha_pinda = sum(eka[sign_of[p] - 1] * GRAHA_GUNAKARA[p] for p in SEVEN)
        shuddha = rasi_pinda + graha_pinda
        guna = sum(bav) + sum(tri) + sum(eka)
        planets[recipient] = {
            "planet": recipient,
            "planet_ta": _ta(recipient),
            "bav": bav, "trikona": tri, "ekadhi": eka,
            "aadhi_paral": sum(bav), "trikona_total": sum(tri), "ekadhi_total": sum(eka),
            "rasi_gunakaram": rasi_pinda,
            "graha_gunakaram": graha_pinda,
            "shuddha_pindam": shuddha,
            "guna_samooham": guna,
            "eka_samooham": shuddha + guna,
        }
        contrib[recipient] = bav
        for i in range(12):
            sav[i] += bav[i]

    return {
        "planets": planets,
        "sarvashtakavarga": sav,
        "sarvashtakavarga_total": sum(sav),
        "contributions": contrib,
        "method_note": "Kalai Magal trikona (minimum retained) and ekadhipatya variant; pinda multipliers per BPHS 70.",
    }


def _single_page(dob: str, rasi_chart: Dict[str, Any], bhava_chart: Dict[str, Any], dashas: List[Dict[str, Any]],
                 moon_deg: float) -> Dict[str, Any]:
    """Extra lines of Kalai's single-page horoscope (Thirukanitam_single_page.pdf):
    bhava change (பாவக மாற்றம்), current dasa-bhukti end date, name numbers by
    numerology and first letters by star. Every value is computed here; the
    name numbers and star letters use the Kalai-verified tables."""
    from datetime import date as _d
    from backend.app.services.kalai_baby_names import allowed_numbers, date_numbers, star_letters
    rasi_of = {p: int(s) for s, ps in rasi_chart.items() for p in ps}
    bhava_of = {p: int(s) for s, ps in bhava_chart.items() for p in ps}
    moves = [{"planet": p, "planet_ta": _ta(p), "bhava_sign": bhava_of[p], "bhava_sign_ta": SIGN_TA[bhava_of[p] - 1]}
             for p in SEVEN + ["Rahu", "Ketu"] if p in rasi_of and p in bhava_of and bhava_of[p] != rasi_of[p]]
    today = _d.today()
    current = None
    for d in dashas:
        for b in d["bhuktis"]:
            if _d.fromisoformat(b["start_date"]) <= today < _d.fromisoformat(b["end_date"]):
                current = {"dasa": d["planet"], "dasa_ta": d["planet_ta"], "bhukti": b["planet"],
                           "bhukti_ta": b["planet_ta"], "end": b["end_date_display"]}
    y, m, dd = [int(x) for x in dob.split("-")]
    dn, sn = date_numbers(_d(y, m, dd))
    nums, verified = allowed_numbers(dn, sn)
    nak = int((moon_deg % 360.0) // (360.0 / 27.0)) + 1
    return {"bhava_moves": moves, "current_dasa_bhukti": current, "date_number": dn, "destiny_number": sn,
            "name_numbers": nums, "name_numbers_verified": verified, "star_letters": star_letters(nak)}


def _prasthara(sign_of: Dict[str, int], lagna_sign: int) -> Dict[str, Any]:
    """Kalai layout: rows = donors starting with the planet itself (Sun..Saturn,
    Lagna cyclic), columns = the 12 signs starting from the planet's own sign;
    True = bindu. Row and column totals equal the planet's BAV."""
    donors_all = SEVEN + ["Lagna"]
    pos_ = dict(sign_of)
    pos_["Lagna"] = lagna_sign
    out: Dict[str, Any] = {}
    for p in SEVEN:
        i = donors_all.index(p)
        donors = donors_all[i:] + donors_all[:i]
        start = sign_of[p] - 1
        signs = [(start + k) % 12 for k in range(12)]
        rows = []
        for d in donors:
            houses = ASHTAKAVARGA_RULES[p][d]
            got = {(pos_[d] - 1 + h - 1) % 12 for h in houses}
            cells = [s in got for s in signs]
            rows.append({"donor": d, "donor_ta": _ta(d) if d != "Lagna" else "லக்னம்", "cells": cells, "total": sum(cells)})
        col = [sum(r["cells"][k] for r in rows) for k in range(12)]
        out[p] = {"planet": p, "planet_ta": _ta(p), "signs": [s + 1 for s in signs],
                  "signs_ta": [SIGN_TA[s] for s in signs], "rows": rows, "column_totals": col, "total": sum(col)}
    return out


# --------------------------------------------------------------------------
# Full report
# --------------------------------------------------------------------------
def _pending(section_no: int, key: str, ta: str, en: str, phase: str) -> Dict[str, Any]:
    return {"no": section_no, "key": key, "title_ta": ta, "title_en": en,
            "status": "pending", "phase": phase}


def build_kalai_report(
    name: str,
    date_of_birth: str,
    time_of_birth: str,
    place: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    timezone: Optional[str] = None,
    gender: Optional[str] = None,
    father_name: Optional[str] = None,
    mother_name: Optional[str] = None,
    panchangam_system: str = "thirukkanitham",
    time_correction: Optional[str] = None,
) -> Dict[str, Any]:
    lat, lon, tz = resolve_place(place, latitude, longitude, timezone)
    if time_correction not in (None, "", "none"):
        from backend.app.services.ephemeris import apply_time_correction
        tz = apply_time_correction(tz, date_of_birth, time_of_birth, time_correction)
    if time_of_birth and len(time_of_birth.split(":")) == 2:
        time_of_birth = f"{time_of_birth}:00"
    jd = get_julian_day(date_of_birth, time_of_birth, tz)
    with kalai_ephemeris(jd):
        return _build(jd, lat, lon, tz, name, date_of_birth, time_of_birth, place, gender,
                      father_name, mother_name, panchangam_system)


def _build(jd, lat, lon, tz, name, date_of_birth, time_of_birth, place, gender,
           father_name, mother_name, panchangam_system):
    chart = compute_planetary_positions(jd, lat, lon, panchangam_system, date_of_birth, time_of_birth, tz)
    bd = chart["basic_details"]
    pos = chart["positions_by_name"]
    lagna = chart["lagna_info"]
    mandi = chart.get("mandi_info") or {}

    # 1. General details
    general = {
        "name": name, "gender": gender, "father_name": father_name, "mother_name": mother_name,
        "date_of_birth": date_of_birth, "time_of_birth": time_of_birth,
        "place": place, "latitude": round(lat, 4), "longitude": round(lon, 4), "timezone": tz,
        "latitude_dms": f"{int(abs(lat)):02d}:{int(abs(lat) % 1 * 60):02d} {'N' if lat >= 0 else 'S'}",
        "longitude_dms": f"{int(abs(lon)):03d}:{int(abs(lon) % 1 * 60):02d} {'E' if lon >= 0 else 'W'}",
        "weekday_ta": bd.get("vaaram_ta"), "weekday_en": bd.get("vaaram"),
        "udhayadhi_nazhigai": bd.get("udhayadhi_nazhigai_full") or bd.get("udhayadhi_nazhigai"),
        "udhayadhi_nazhigai_en": bd.get("udhayadhi_nazhigai_full_en") or bd.get("udhayadhi_nazhigai_en"),
        "sun_rise": bd.get("sun_rise"), "sun_set": bd.get("sun_set"),
        "sunrise_method_ta": "பிம்ப மத்தி", "sunrise_method_en": "Disc centre, no refraction",
        "ayanamsa_dms": bd.get("ayanamsa_dms"), "ayanamsa_name": bd.get("ayanamsa_name"),
        "nakshatra_horai": bd.get("nakshatra_horai"),
        "janma_rasi_ta": bd.get("rasi_ta"), "janma_rasi_en": bd.get("rasi"),
        "janma_nakshatra_ta": bd.get("nakshatram_ta"), "janma_nakshatra_en": bd.get("nakshatram"),
        "pada": bd.get("pada"),
        "lagna_ta": bd.get("lagnam_ta"), "lagna_en": bd.get("lagnam"),
        "yogam_ta": bd.get("yogam_ta"), "yogam_en": bd.get("yogam"),
        "karanam_ta": bd.get("karanam_ta"), "karanam_en": bd.get("karanam"),
        "thithi_ta": bd.get("thithi_ta"), "thithi_en": bd.get("thithi"),
        "paksha_ta": bd.get("paksha_ta"), "paksha_en": bd.get("paksha_en"),
        "panchangam_system": panchangam_system,
        "is_vakkiyam": (panchangam_system or "").strip().lower() in ("vakhyam", "vakkiyam", "vakyam", "vakya"),
        "graha_title_ta": ("வாக்கிய கிரக ஸ்புடம் (நிராயனம்)"
                           if (panchangam_system or "").strip().lower() in ("vakhyam", "vakkiyam", "vakyam", "vakya")
                           else "திருக்கணித கிரக ஸ்புடம் (நிராயனம்)"),
        "graha_title_en": ("Vakkiya Graha Spudam (Nirayana)"
                           if (panchangam_system or "").strip().lower() in ("vakhyam", "vakkiyam", "vakyam", "vakya")
                           else "Thirukanitha Graha Spudam (Nirayana)"),
    }
    try:
        from datetime import date as _date
        from backend.app.services.kalai_tamil_calendar import tamil_date
        td = tamil_date(_date.fromisoformat(date_of_birth), time_of_birth, lat, lon, tz)
        general["tamil_date_ta"], general["tamil_date_en"] = td["formatted_ta"], td["formatted_en"]
    except Exception:
        general["tamil_date_ta"] = general["tamil_date_en"] = None

    # 2. Graha spudam (nirayana)
    def spudam_row(label_en: str, label_ta: str, deg: float, nak_ta: str, pada: Any,
                   nav_ta: str, retro: bool = False) -> Dict[str, Any]:
        sign = int((deg % 360.0) // 30)
        return {
            "planet": label_en, "planet_ta": label_ta, "retrograde": retro,
            "longitude": round(deg % 360.0, 6), "longitude_dms": dms_str(deg),
            "nakshatra_ta": nak_ta, "pada": pada,
            "rasi_ta": SIGN_TA[sign], "rasi_en": SIGN_EN[sign],
            "degree_in_sign_dms": dms_str(deg % 30.0),
            "navamsa_ta": nav_ta,
        }

    graha = []
    for p in NINE:
        d = pos[p]
        graha.append(spudam_row(p, d.get("name_ta", _ta(p)), d["total_degree"], d.get("nakshatra_ta"),
                                d.get("pada"), d.get("navamsa_rasi_ta"),
                                bool(d.get("is_retrograde")) and p not in ("Rahu", "Ketu")))
    if mandi.get("total_degree") is not None:
        graha.append(spudam_row("Mandi", "மாந்தி", mandi["total_degree"], mandi.get("nakshatra_ta"),
                                mandi.get("pada"), mandi.get("navamsa_rasi_ta")))
    graha.append(spudam_row("Lagna", "லக்னம்", lagna["total_degree"], lagna.get("nakshatra_ta"),
                            lagna.get("pada"), lagna.get("navamsa_rasi_ta")))

    # 3. Bhava spudam (Vakkiyam: house frame turned onto the Vakkiyam lagna)
    is_vakkiyam = (panchangam_system or "").strip().lower() in ("vakhyam", "vakkiyam", "vakyam", "vakya")
    bhava_rows = sripati_bhava(jd, lat, lon, lagna["total_degree"] if is_vakkiyam else None)
    bhava_planets = bhava_chart(bhava_rows, [pos[p] for p in NINE])

    # 4/5. Dasa-bhukti-antharam
    moon_deg = pos["Moon"]["total_degree"]
    balance = calculate_dasha_balance(moon_deg)
    dashas = calculate_vimshottari_dasha(moon_deg, date_of_birth, time_of_birth)

    # 6/7. Ashtakavarga
    sign_of = {p: pos[p]["rasi_number"] for p in SEVEN}
    lagna_sign = int((lagna["total_degree"] % 360.0) // 30) + 1
    av = kalai_ashtakavarga(sign_of, lagna_sign)

    # 8. Shadbala + Bhava bala (Kalai parity engine)
    try:
        shadbala = {"status": "ok", **compute_kalai_shadbala_auto(jd, lat, lon, date_of_birth, time_of_birth, tz)}
    except Exception as exc:
        shadbala = {"status": "error", "error": str(exc)}

    # 9/10. Shodasa varga + planet details
    lon_all = {p: pos[p]["total_degree"] % 360.0 for p in NINE}
    lon_all["Lagna"] = lagna["total_degree"] % 360.0
    retro = {p: bool(pos[p].get("is_retrograde")) for p in NINE}
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    _ids = {"Mars": swe.MARS, "Mercury": swe.MERCURY, "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN}
    lat_ecl = {p: (lambda _r: (_r[0] if isinstance(_r[0], (tuple, list)) else _r)[4])(swe.pheno_ut(jd, i)) for p, i in _ids.items()}  # apparent magnitude (war winner)
    try:
        vargas = {"status": "ok", "charts": varga_charts(lon_all), "bala": shodasa_varga_bala(lon_all)}
    except Exception as exc:
        vargas = {"status": "error", "error": str(exc)}
    try:
        details = {"status": "ok", **planet_details(lon_all, retro, lat_ecl, bhava_rows,
                                                    shadbala if shadbala.get("status") == "ok" else None)}
    except Exception as exc:
        details = {"status": "error", "error": str(exc)}

    # 12. Kalachakra dasa
    try:
        kalachakra = calculate_kalachakra(moon_deg, date_of_birth)
    except Exception as exc:
        kalachakra = {"status": "error", "error": str(exc)}

    # 15. Upagraha spudam
    try:
        upagraha = compute_upagrahas(jd, lat, lon, date_of_birth, tz, pos["Sun"]["total_degree"] % 360.0)
    except Exception as exc:
        upagraha = {"status": "error", "error": str(exc)}

    # 16. Prasthara ashtakavarga (donor-by-sign bindu matrix, Kalai layout)
    try:
        prasthara = {"status": "ok", "planets": _prasthara(sign_of, lagna_sign)}
    except Exception as exc:
        prasthara = {"status": "error", "error": str(exc)}

    # 13. Panchapakshi
    try:
        sun_deg = pos["Sun"]["total_degree"] % 360.0
        shukla = ((moon_deg - sun_deg) % 360.0) < 180.0
        nak_no = int((moon_deg % 360.0) // (360.0 / 27.0)) + 1
        pakshi = panchapakshi_report(nak_no, shukla, detailed_pages=True)
    except Exception as exc:
        pakshi = {"status": "error", "error": str(exc)}

    # 11. Numerology (existing engine)
    numerology: Dict[str, Any]
    try:
        from backend.app.services.numerology import build_numerology_profile
        from backend.app.services.tamil_latin import has_latin, tamil_to_latin
        # name numerology needs English letters: a Tamil name is transliterated first
        num_name = name or ""
        if num_name and not has_latin(num_name):
            num_name = tamil_to_latin(num_name)
        numerology = {"status": "ok", "data": build_numerology_profile(num_name, date_of_birth)}
        numerology["data"]["name_used_for_numerology"] = num_name
    except Exception as exc:  # never fabricate — report the failure
        numerology = {"status": "error", "error": str(exc)}

    rasi_chart: Dict[int, List[str]] = {i: [] for i in range(1, 13)}
    for p in NINE:
        rasi_chart[pos[p]["rasi_number"]].append(p)
    rasi_chart[lagna_sign].insert(0, "Lagna")
    navamsa_chart: Dict[int, List[str]] = {i: [] for i in range(1, 13)}
    for p in NINE:
        navamsa_chart[int(pos[p]["navamsa_sign"])].append(p)
    lag_nav = int(lagna.get("navamsa_sign") or 0)
    if 1 <= lag_nav <= 12:
        navamsa_chart[lag_nav].insert(0, "Lagna")

    sections = [
        {"no": 1, "key": "general", "title_ta": "பொது விவரங்கள்", "title_en": "General Details", "status": "ok"},
        {"no": 2, "key": "graha_spudam", "title_ta": "கிரக ஸ்புடம்", "title_en": "Graha Spudam", "status": "ok"},
        {"no": 3, "key": "bhava_spudam", "title_ta": "பாவ ஸ்புடம்", "title_en": "Bhava Spudam", "status": "ok"},
        {"no": 4, "key": "dasa_bhukti", "title_ta": "தசா புக்தி", "title_en": "Dasa Bhukti", "status": "ok"},
        {"no": 5, "key": "antharam", "title_ta": "அந்தரம்", "title_en": "Antharam", "status": "ok"},
        {"no": 6, "key": "ashtakavarga", "title_ta": "அஷ்ட வர்க்கம்", "title_en": "Ashtakavarga", "status": "ok"},
        {"no": 7, "key": "sarvashtakavarga", "title_ta": "சர்வாஷ்டக வர்க்கம்", "title_en": "Sarvashtakavarga", "status": "ok"},
        {"no": 8, "key": "shadbala", "title_ta": "சட்பலம்", "title_en": "Shadbala", "status": shadbala["status"]},
        {"no": 9, "key": "shodasa_varga", "title_ta": "சோடச வர்க்கம்", "title_en": "Shodasa Varga", "status": vargas["status"]},
        {"no": 10, "key": "planet_details", "title_ta": "கிரகங்களின் விவர அட்டவணை", "title_en": "Planet Details Table", "status": details["status"]},
        {"no": 11, "key": "numerology", "title_ta": "நியுமராலஜி", "title_en": "Numerology", "status": numerology["status"]},
        {"no": 12, "key": "kalachakra", "title_ta": "காலச்சக்கிர தசை", "title_en": "Kalachakra Dasa",
         "status": kalachakra.get("status", "error"), "phase": "Savya reference needed" if kalachakra.get("status") == "pending" else None},
        {"no": 13, "key": "panchapakshi", "title_ta": "பஞ்சபட்சி", "title_en": "Panchapakshi", "status": pakshi.get("status", "error")},
        {"no": 15, "key": "upagraha", "title_ta": "உப கிரக ஸ்புடம்", "title_en": "Upagraha Spudam", "status": upagraha.get("status", "error")},
        {"no": 16, "key": "prasthara", "title_ta": "பிரஸ்தார் அஷ்டவர்க்கம்", "title_en": "Prasthara Ashtakavarga", "status": prasthara.get("status", "error")},
        {"no": 14, "key": "panchapakshi_detailed", "title_ta": "பஞ்சபட்சி (விரிவு)", "title_en": "Panchapakshi (detailed)", "status": pakshi.get("status", "error")},
    ]

    report = {
        "report_type": "kalai_computation",
        "sections": sections,
        "general": general,
        "graha_spudam": graha,
        "rasi_chart": rasi_chart,
        "navamsa_chart": navamsa_chart,
        "bhava_spudam": bhava_rows,
        "bhava_chart": bhava_planets,
        "dasa_balance": balance,
        "dashas": dashas,
        "ashtakavarga": av,
        "shadbala": shadbala,
        "shodasa_varga": vargas,
        "planet_details": details,
        "kalachakra": kalachakra,
        "panchapakshi": pakshi,
        "upagraha": upagraha,
        "prasthara": prasthara,
        "numerology": numerology,
        "palan_ta": None,
        "palan_en": None,
        "single_page": _single_page(date_of_birth, rasi_chart, bhava_planets, dashas, moon_deg),
    }
    # பலன்கள் (bhava, mahadasa, guru/sani gochara, yogas) — original site text, both languages
    try:
        from backend.app.services.palan.compose import compose_palan
        report["palan_ta"] = compose_palan(report, "ta")
        report["palan_en"] = compose_palan(report, "en")
    except Exception as exc:  # never break the report because of palan
        report["palan_error"] = str(exc)
    return report
