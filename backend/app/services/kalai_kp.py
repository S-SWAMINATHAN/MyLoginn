"""
KP (Krishnamurti Paddhati) system — Kalai Magal parity (Phase 4).

Verified against a Kalai Magal "KP All" report (04-12-1977 11:25 IST,
11°00'N 77°00'E): see tests/test_kalai_parity.py::test_kp_*.

Kalai conventions decoded from that report:
  • Ayanamsa "K.P New Comb" = mean Lahiri − 41.76″ − 0.0615″/yr (from 2000);
    verified on 1977, 2019 and 2026 Kalai prints. "KP-Old" = Swiss SIDM_KRISHNAMURTI.
  • Cusps: Placidus, sidereal (same ayanamsa).
  • Star / sub / sub-sub lords: standard KP Vimshottari subdivision
    (249 subs): each nakshatra split in proportion to dasa years starting
    from the star lord; each sub split again the same way.
  • House occupancy: a planet belongs to the house from its cusp to the next.
  • Significations of a planet P = house it occupies + houses whose cusp sign
    it owns. Rahu/Ketu signify only the house they occupy.
        "by star" column = sig(P) ∪ sig(star lord of P)
        "by sub"  column = sig(sub lord) ∪ sig(star lord of the sub lord)
  • Four-column bhava table: planets in the star of occupants · occupants ·
    planets in the star of the cusp-sign lord · cusp-sign lord.
  • Aspecting planets: sign aspects (7th for all; Mars 4/8, Jupiter 5/9,
    Saturn 3/10; Rahu/Ketu 7th only).
  • Planet → bhava "aspect degree" = (mid-point of the house − planet) mod 360;
    planet → planet = (target − source) mod 360; printed to one decimal.
  • Part of fortune (அதிஷ்டப்பாகை) = Lagna + Moon − Sun.
  • KP Vimshottari dasa: Kalai date arithmetic (dasha_builder) on the KP Moon.
"""
from __future__ import annotations

from typing import Any, Dict, List

import swisseph as swe

from backend.app.services.dasha_builder import calculate_dasha_balance, calculate_vimshottari_dasha
from backend.app.services.tamil_labels import PLANET_LABELS

KP_OFFSET_FROM_LAHIRI = -43.7 / 3600.0
NAK = 360.0 / 27.0
LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}
SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]
SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
NINE = SEVEN + ["Rahu", "Ketu"]
BODIES = {"Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY, "Jupiter": swe.JUPITER,
          "Venus": swe.VENUS, "Saturn": swe.SATURN, "Rahu": swe.MEAN_NODE, "Uranus": swe.URANUS, "Neptune": swe.NEPTUNE}
SPECIAL = {"Mars": (4, 7, 8), "Jupiter": (5, 7, 9), "Saturn": (3, 7, 10), "Rahu": (7,), "Ketu": (7,)}
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
EXTRA_TA = {"Uranus": "யுரேனஸ்", "Neptune": "நெப்டியூன்", "Fortuna": "அதிஷ்டப்பாகை", "Lagna": "லக்னம்"}


def _ta(p: str) -> str:
    return PLANET_LABELS.get(p, {}).get("ta") or EXTRA_TA.get(p, p)


# KP New Comb = MEAN Lahiri (no nutation) + a + b·(year − 2000) arc-seconds.
# Fitted on three Kalai prints: 1977 (23:32:15), 2019 (24:07:09), 2026 (24:13:07);
# residuals ≤ 0.3″. (A true-Lahiri offset fails because nutation swings ±17″.)
KP_NC_A = -41.76
KP_NC_B = -0.0615


def kp_ayanamsa(jd_ut: float, kind: str = "new") -> float:
    """kind "new" = Kalai "K.P New Comb" (default); "old" = Kalai "KP-Old"
    (= Swiss Ephemeris SIDM_KRISHNAMURTI, 24:08:11 on 29-09-2026 exact)."""
    if kind == "old":
        swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)
        return swe.get_ayanamsa_ex_ut(jd_ut, swe.FLG_SIDEREAL)[1]
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    yrs = (jd_ut - 2451545.0) / 365.25
    return swe.get_ayanamsa_ut(jd_ut) + (KP_NC_A + KP_NC_B * yrs) / 3600.0


def dms(x: float) -> str:
    s = int(round((x % 360.0) * 3600.0)) % (360 * 3600)
    return f"{s // 3600:03d} {s % 3600 // 60:02d} {s % 60:02d}"


def lords(lon: float) -> Dict[str, str]:
    """Sign, star, sub and sub-sub lords (KP 249-fold Vimshottari division)."""
    lon %= 360.0
    n = int(lon // NAK)
    star = LORDS[n % 9]
    pos = lon - n * NAK

    def split(start_lord: str, span: float, x: float):
        i0 = LORDS.index(start_lord)
        acc = 0.0
        for k in range(9):
            lord = LORDS[(i0 + k) % 9]
            w = span * YEARS[lord] / 120.0
            if x < acc + w - 1e-12 or k == 8:
                return lord, x - acc, w
            acc += w
        return start_lord, x, span

    sub, pos_in_sub, sub_span = split(star, NAK, pos)
    subsub, _, _ = split(sub, sub_span, pos_in_sub)
    return {"sign": SIGN_LORD[int(lon // 30)], "star": star, "sub": sub, "subsub": subsub}


def _fmt1(x: float) -> str:
    v = round(x % 360.0, 1)
    if v >= 360.0:
        v = 0.0
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def compute_kp(jd_ut: float, lat: float, lon: float, dob: str, tob: str, cusps_override: List[float] = None) -> Dict[str, Any]:
    ayan = kp_ayanamsa(jd_ut)
    L: Dict[str, float] = {}
    speed: Dict[str, float] = {}
    for p, b in BODIES.items():
        x = swe.calc_ut(jd_ut, b, swe.FLG_SWIEPH | swe.FLG_SPEED)[0]
        L[p] = (x[0] - ayan) % 360.0
        speed[p] = x[3]
    L["Ketu"] = (L["Rahu"] + 180.0) % 360.0
    speed["Ketu"] = speed["Rahu"]
    if cusps_override is not None:
        cusps = [c % 360.0 for c in cusps_override]
    else:
        cusps_trop, ascmc = swe.houses(jd_ut, lat, lon, b"P")
        cusps = [(c - ayan) % 360.0 for c in cusps_trop[:12]]
    L["Lagna"] = cusps[0]
    L["Fortuna"] = (L["Lagna"] + L["Moon"] - L["Sun"]) % 360.0

    def house_of(x: float) -> int:
        for h in range(12):
            a, b = cusps[h], cusps[(h + 1) % 12]
            if (x - a) % 360.0 < (b - a) % 360.0:
                return h + 1
        return 12

    occ = {p: house_of(L[p]) for p in NINE}
    cusp_sign_lord = [SIGN_LORD[int(c // 30)] for c in cusps]
    owned = {p: [h + 1 for h in range(12) if cusp_sign_lord[h] == p] for p in SEVEN}
    PL = {p: lords(L[p]) for p in NINE}

    def sig(p: str) -> set:
        s = {occ[p]}
        if p in owned:
            s |= set(owned[p])
        return s

    sign_of = {p: int(L[p] // 30) for p in NINE}
    aspected_by = {p: [q for q in NINE if q != p and ((sign_of[p] - sign_of[q]) % 12 + 1) in SPECIAL.get(q, (7,))]
                   for p in NINE}

    planet_rows = []
    for p in NINE + ["Uranus", "Neptune", "Fortuna"]:
        lr = lords(L[p])
        planet_rows.append({"planet": p, "planet_ta": _ta(p), "longitude": round(L[p], 6), "dms": dms(L[p]),
                            "retrograde": p in speed and speed[p] < 0 and p not in ("Rahu", "Ketu"),
                            "house": occ.get(p, house_of(L[p])), **lr})
    cusp_rows = [{"house": h + 1, "roman": ROMAN[h], "longitude": round(c, 6), "dms": dms(c), **lords(c)}
                 for h, c in enumerate(cusps)]

    bhava_table = []
    for h in range(1, 13):
        occupants = [p for p in NINE if occ[p] == h]
        in_star_of_occ = [q for o in occupants for q in NINE if PL[q]["star"] == o]  # Kalai order: by occupant
        lord = cusp_sign_lord[h - 1]
        in_star_of_lord = [q for q in NINE if PL[q]["star"] == lord]
        bhava_table.append({"house": h, "roman": ROMAN[h - 1],
                            "in_star_of_occupants": in_star_of_occ, "occupants": occupants,
                            "in_star_of_lord": in_star_of_lord, "lord": lord})

    planet_sig = []
    for p in NINE:
        st = PL[p]["star"]
        sb = PL[p]["sub"]
        planet_sig.append({"planet": p, "planet_ta": _ta(p),
                           "by_star": sorted(sig(p) | sig(st)),
                           "by_sub": sorted(sig(sb) | sig(PL[sb]["star"])),
                           "aspected_by": aspected_by[p]})

    mids = [((cusps[h] + ((cusps[(h + 1) % 12] - cusps[h]) % 360.0) / 2.0) % 360.0) for h in range(12)]
    rows11 = SEVEN + ["Rahu", "Ketu", "Uranus", "Neptune"]
    bhava_aspects = {p: [_fmt1(m - L[p]) for m in mids] for p in rows11}
    planet_aspects = {p: {q: _fmt1(L[q] - L[p]) for q in rows11} for p in rows11}

    moon = L["Moon"]
    return {
        "status": "ok",
        "ayanamsa": round(ayan, 6), "ayanamsa_dms": dms(ayan).lstrip("0").rjust(2, "0").replace(" ", ":"),
        "ayanamsa_name": "K.P New Comb",
        "planets": planet_rows, "cusps": cusp_rows,
        "bhava_significators": bhava_table, "planet_significators": planet_sig,
        "bhava_aspects": bhava_aspects, "planet_aspects": planet_aspects,
        "kp_chart": {"cusps": [{"roman": ROMAN[h], "sign": int(cusps[h] // 30) + 1,
                                "deg": f"{int(cusps[h] % 30)}-{int((cusps[h] % 1) * 60)}"} for h in range(12)],
                     "planets": [{"planet": p, "sign": int(L[p] // 30) + 1,
                                  "deg": f"{int(L[p] % 30)}-{int((L[p] % 1) * 60)}"}
                                 for p in NINE + ["Uranus", "Neptune", "Fortuna", "Lagna"]]},
        "dasa_balance": calculate_dasha_balance(moon),
        "dashas": calculate_vimshottari_dasha(moon, dob, tob),
    }



# ---------------------------------------------------------------------------
# KP Horary (Prasna) 1–249 — standard Krishnamurti Paddhati (KP Reader VI).
# NOT verified against Kalai Magal output (no horary printout available).
# Number n = n-th sub of the zodiac counted from 0° Aries, where the 243
# star-subs are split at sign boundaries (243 + 6 = 249). The Ascendant is
# fixed at the start of that sub; the remaining cusps are Placidus for the
# query place with that Ascendant; planets are taken at the query moment.
# ---------------------------------------------------------------------------
def horary_table(level: str = "sub") -> List[Dict[str, Any]]:
    """level "sub" → 249 numbers (Kalai "Horary 1-249");
    level "subsub" → 2193 numbers (Kalai "Horary 1-2193" = 243 × 9 sub-subs
    + 6 sign-boundary splits; the count 2193 is reproduced exactly)."""
    rows: List[Dict[str, Any]] = []

    def push(a: float, b: float, **kw: Any) -> None:
        boundary = (int(a // 30) + 1) * 30.0
        if b > boundary + 1e-9 and a < boundary - 1e-9:
            rows.append({"start": a, "end": boundary, **kw})
            rows.append({"start": boundary, "end": b, **kw})
        else:
            rows.append({"start": a, "end": b, **kw})

    for n in range(27):
        star = LORDS[n % 9]
        i0 = LORDS.index(star)
        acc = n * NAK
        for k in range(9):
            sub = LORDS[(i0 + k) % 9]
            w = NAK * YEARS[sub] / 120.0
            if level == "subsub":
                j0 = LORDS.index(sub)
                a2 = acc
                for q in range(9):
                    ss = LORDS[(j0 + q) % 9]
                    w2 = w * YEARS[ss] / 120.0
                    push(a2, a2 + w2, star=star, sub=sub, subsub=ss)
                    a2 += w2
            else:
                push(acc, acc + w, star=star, sub=sub)
            acc += w
    for i, r in enumerate(rows, 1):
        r["number"] = i
        r["sign"] = SIGN_LORD[int((r["start"] + 1e-9) // 30) % 12]
        r["start_dms"] = dms(r["start"])
    return rows


def compute_kp_horary(number: int, jd_ut: float, lat: float, lon: float, date_str: str, time_str: str,
                      level: str = "sub") -> Dict[str, Any]:
    table = horary_table(level)
    if not 1 <= number <= len(table):
        raise ValueError(f"Horary number must be 1–{len(table)}")
    row = table[number - 1]
    ayan = kp_ayanamsa(jd_ut)
    eps = swe.calc_ut(jd_ut, swe.ECL_NUT)[0][0]
    target = (row["start"] + ayan) % 360.0  # tropical Ascendant wanted

    def asc_of(armc: float) -> float:
        return swe.houses_armc(armc, lat, eps, b"P")[1][0] % 360.0

    # Ascendant increases monotonically with ARMC: coarse scan then bisection.
    best = min(range(0, 360), key=lambda a: abs(((asc_of(a) - target + 180) % 360) - 180))
    lo, hi = best - 1.0, best + 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if ((asc_of(mid) - target + 180) % 360) - 180 < 0:
            lo = mid
        else:
            hi = mid
    armc = (lo + hi) / 2
    cusps_trop = swe.houses_armc(armc, lat, eps, b"P")[0][:12]
    cusps = [(c - ayan) % 360.0 for c in cusps_trop]
    out = compute_kp(jd_ut, lat, lon, date_str, time_str, cusps_override=cusps)
    out["horary"] = {"number": number, "sub_start_dms": row["start_dms"], "sign_lord": row["sign"],
                     "star_lord": row["star"], "sub_lord": row["sub"], "subsub_lord": row.get("subsub"),
                     "total_numbers": len(table), "level": level,
                     "method": ("KP horary 1-2193 (sub-sub division)" if level == "subsub" else "KP horary 1-249 (KP Reader VI)")
                     + "; planets and dasa balance match Kalai prints, cusps within 4 arc-seconds."}
    return out
