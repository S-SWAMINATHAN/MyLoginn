"""
Shadbala & Bhava Bala — Kalai Magal (KKC Astro) parity engine (Phase 2).

Classical basis: BPHS ch. 27 (Shadbala) and ch. 28 (Ishta/Kashta), with the
specific conventions Kalai Magal uses, decoded by comparing its printed
output for the anonymised reference REF-001 (see AGENTS.md §4).

Units: all internal values are VIRUPAS; the report prints RUPAS (virupas/60).

Verification vs REF-001 (rupas, 3 decimals as Kalai prints):
  Sthana bala ........ 7/7 exact            Dig bala .......... 7/7 exact
  Naisargika ......... 7/7 exact            Kala bala ......... 7/7 within 0.01
  Drik bala .......... 6/7 exact (Moon off) Cheshta ........... 4/5 within 0.03, Mercury ~0.07
  Bhavadhipati ....... 12/12 by definition  Bhava dig ......... 12/12 (2 signs "derived from 1 reference")
  Bhava drik ......... 9/12 exact (houses 6, 7, 11 open)

Kalai conventions (each marked where derived from one reference only):
  • Uchcha = arc from debilitation point / 3.
  • Saptavargaja over D1 D2 D3 D7 D9 D12 D30; moolatrikona 45 (D1 only), own 30,
    compound relation 22.5 / 15 / 7.5 / 3.75 / 1.875.
  • Kendradi by sign-house from Lagna.
  • Natonnata from the CLOCK time (standard time) distance to 00:00. [1 ref]
  • Paksha: benefics (Moon, Mercury, Jupiter, Venus) = elongation/3, malefics 60 − that;
    Moon's paksha doubled.
  • Abda/Masa lords by Kali ahargana: ((a//360)*3 + 4) mod 7 / ((a//30)*2 + 4) mod 7. [1 ref]
  • Vara = lord of the CIVIL weekday (not the Tamil day). [1 ref]
  • Hora: sequence starting with the civil weekday lord, 1-hour horas counted
    from the sunrise preceding birth. [1 ref]
  • Ayana: kranti from sayana longitude (no latitude), (ε + k)/(2ε) × 60;
    Moon & Saturn use −k, Mercury |k|; Sun's ayana doubled.
  • Cheshta (Mars..Saturn): BPHS cheshta-kendra with mean heliocentric elements;
    Sun and Moon cheshta = 0 in the total (Kalai prints 0.000).
  • Drik: BPHS drishti table; special aspects (Mars 4/8, Jupiter 5/9, Saturn 3/10)
    = full 60; Mercury is malefic when sharing a sign with Sun/Mars/Saturn;
    Moon benefic in Shukla paksha; sum/4.
  • Yuddha: not applied (Kalai's kala values are reproduced without it). [1 ref]
  • Ishta = √(uchcha × cheshta), Kashta = √((60−uchcha)(60−cheshta)); for these
    Moon's cheshta = paksha bala and Sun's = single ayana bala (Sun ≈0.03 off).
"""

from __future__ import annotations

import math
from datetime import datetime
from typing import Any, Dict, List, Optional

import swisseph as swe

from backend.app.services.tamil_labels import PLANET_LABELS

P7 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
PID = {"Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY,
       "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN}
WEEKDAY_LORD = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]  # Sun=0
HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]
SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
             "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]
EXALT = {"Sun": 10, "Moon": 33, "Mars": 298, "Mercury": 165, "Jupiter": 95, "Venus": 357, "Saturn": 200}
NAT_FRIEND = {"Sun": ["Moon", "Mars", "Jupiter"], "Moon": ["Sun", "Mercury"], "Mars": ["Sun", "Moon", "Jupiter"],
              "Mercury": ["Sun", "Venus"], "Jupiter": ["Sun", "Moon", "Mars"], "Venus": ["Mercury", "Saturn"],
              "Saturn": ["Mercury", "Venus"]}
NAT_ENEMY = {"Sun": ["Venus", "Saturn"], "Moon": [], "Mars": ["Mercury"], "Mercury": ["Moon"],
             "Jupiter": ["Mercury", "Venus"], "Venus": ["Sun", "Moon"], "Saturn": ["Sun", "Moon", "Mars"]}
MOOLATRIKONA = {"Sun": (4, 0, 20), "Moon": (1, 3, 30), "Mars": (0, 0, 12), "Mercury": (5, 15, 20),
                "Jupiter": (8, 0, 10), "Venus": (6, 0, 15), "Saturn": (10, 0, 20)}
OWN_SIGNS = {"Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5], "Jupiter": [8, 11],
             "Venus": [1, 6], "Saturn": [9, 10]}
NAISARGIKA = {"Sun": 60.0, "Moon": 51.43, "Mars": 17.14, "Mercury": 25.71,
              "Jupiter": 34.29, "Venus": 42.86, "Saturn": 8.57}
COMPOUND_VALUE = {2: 22.5, 1: 15.0, 0: 7.5, -1: 3.75, -2: 1.875}
# Required strength (virupas) — Kalai "பூர்ண பலம்" column (BPHS 27.39)
REQUIRED = {"Sun": 390.0, "Moon": 360.0, "Mars": 300.0, "Mercury": 420.0,
            "Jupiter": 390.0, "Venus": 330.0, "Saturn": 300.0}
# Mean elements (J2000, deg, deg/century) for cheshta kendra
MEAN_ELEM = {"Mercury": (252.25032350, 149472.67411175), "Venus": (181.97909950, 58517.81538729),
             "Earth": (100.46457166, 35999.37244981), "Mars": (-4.55343205, 19140.30268499),
             "Jupiter": (34.39644051, 3034.74612775), "Saturn": (49.95424423, 1222.49362201)}
# Bhava dig bala sign classes: strongest bhava (1 nara, 4 jalachara, 7 keeta, 10 chatushpada).
# Per half-sign where classical texts split the sign. Kumbha (jalachara) and
# Simha (nara) follow the Kalai reference [derived from 1 reference].
BHAVA_DIG_STRONG = {0: (10, 10), 1: (10, 10), 2: (1, 1), 3: (4, 4), 4: (1, 1), 5: (1, 1),
                    6: (1, 1), 7: (7, 7), 8: (1, 10), 9: (10, 4), 10: (4, 4), 11: (4, 4)}


# Kalai Magal's mean (sighrocca) longitudes differ from modern J2000 mean
# elements by near-constant amounts. Measured from the cheshta bala of
# REF-001 (1998) and T001-T08 (2026): (offset at J2000 in degrees, drift per
# year). A 1945 report (T04) disagrees by ~10° in the mean Sun and is not yet
# covered. [derived from 9 references]
KALAI_MEAN_CORR = {
    "Mars": (-1.03, -0.0187),
    "Mercury": (13.10, -0.0015),
    "Jupiter": (1.08, -0.0085),
    "Venus": (3.74, -0.0005),
    "Saturn": (-2.36, -0.0170),
}


def _kalai_mean_corr(body: str, years_from_j2000: float) -> float:
    c = KALAI_MEAN_CORR.get(body)
    return 0.0 if c is None else c[0] + c[1] * years_from_j2000


def _ta(p: str) -> str:
    return PLANET_LABELS.get(p, {}).get("ta", p)


def _arc(a: float, b: float) -> float:
    d = abs(a - b) % 360.0
    return min(d, 360.0 - d)


# ---------------------------------------------------------------- vargas
def _d2(l: float) -> int:
    s, x = int(l // 30), l % 30
    return 4 if (x < 15) == (s % 2 == 0) else 3


def _d3(l: float) -> int:
    return (int(l // 30) + (0, 4, 8)[int((l % 30) // 10)]) % 12


def _d7(l: float) -> int:
    s, k = int(l // 30), int((l % 30) / (30 / 7))
    return (s + k) % 12 if s % 2 == 0 else (s + 6 + k) % 12


def _d9(l: float) -> int:
    return int(l / (10 / 3)) % 12


def _d12(l: float) -> int:
    return (int(l // 30) + int((l % 30) // 2.5)) % 12


def _d30_lord(l: float) -> str:
    s, x = int(l // 30), l % 30
    tab = ([(5, "Mars"), (10, "Saturn"), (18, "Jupiter"), (25, "Mercury"), (30, "Venus")] if s % 2 == 0
           else [(5, "Venus"), (12, "Mercury"), (20, "Jupiter"), (25, "Saturn"), (30, "Mars")])
    for lim, lord in tab:
        if x < lim:
            return lord
    return tab[-1][1]


def _compound(p: str, q: str, sign: Dict[str, int]) -> int:
    n = 1 if q in NAT_FRIEND[p] else -1 if q in NAT_ENEMY[p] else 0
    t = 1 if ((sign[q] - sign[p]) % 12 + 1) in (2, 3, 4, 10, 11, 12) else -1
    return n + t


# ---------------------------------------------------------------- drishti
def _drishti_base(d: float) -> float:
    d %= 360.0
    if d < 30: return 0.0
    if d < 60: return (d - 30) / 2
    if d < 90: return d - 60 + 15
    if d < 120: return (120 - d) / 2 + 30
    if d < 150: return 150 - d
    if d < 180: return (d - 150) * 2
    if d < 300: return (300 - d) / 2
    return 0.0


def _drishti(aspecting: str, d: float) -> float:
    d %= 360.0
    if aspecting == "Saturn" and (60 <= d < 90 or 270 <= d < 300): return 60.0
    if aspecting == "Mars" and (90 <= d < 120 or 210 <= d < 240): return 60.0
    if aspecting == "Jupiter" and (120 <= d < 150 or 240 <= d < 270): return 60.0
    return _drishti_base(d)


# ---------------------------------------------------------------- main
def compute_kalai_shadbala(jd_ut: float, lat: float, lon: float, date_str: str, time_str: str,
                           tz_offset_hours: float, sunrise_jd: float, sunset_jd: float,
                           prev_sunrise_jd: Optional[float] = None) -> Dict[str, Any]:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED | swe.FLG_SWIEPH
    L: Dict[str, float] = {}
    for p in P7:
        L[p] = swe.calc_ut(jd_ut, PID[p], flags)[0][0] % 360.0
    ayan = swe.get_ayanamsa_ut(jd_ut)
    eps = swe.calc_ut(jd_ut, swe.ECL_NUT)[0][0]
    _, ascmc = swe.houses_ex(jd_ut, lat, lon, b"P", swe.FLG_SIDEREAL)
    asc, mc = ascmc[0] % 360.0, ascmc[1] % 360.0
    ic, dsc = (mc + 180.0) % 360.0, (asc + 180.0) % 360.0
    sign = {p: int(L[p] // 30) for p in P7}
    lagna = int(asc // 30)

    # ------------------------------------------------ 1. Sthana
    sthana: Dict[str, Dict[str, float]] = {}
    for p in P7:
        l = L[p]
        uchcha = _arc(l, (EXALT[p] + 180) % 360) / 3.0
        sv = 0.0
        vargas = [("D1", sign[p]), ("D2", _d2(l)), ("D3", _d3(l)), ("D7", _d7(l)),
                  ("D9", _d9(l)), ("D12", _d12(l))]
        for name, sg in vargas:
            mt = MOOLATRIKONA[p]
            if name == "D1" and mt[0] == sg and mt[1] <= l % 30 < mt[2]:
                sv += 45.0
            elif sg in OWN_SIGNS[p]:
                sv += 30.0
            else:
                sv += COMPOUND_VALUE[_compound(p, SIGN_LORD[sg], sign)]
        tl = _d30_lord(l)
        sv += 30.0 if tl == p else COMPOUND_VALUE[_compound(p, tl, sign)]
        odd_r, odd_n = sign[p] % 2 == 0, _d9(l) % 2 == 0
        if p in ("Moon", "Venus"):
            oj = (0 if odd_r else 15) + (0 if odd_n else 15)
        else:
            oj = (15 if odd_r else 0) + (15 if odd_n else 0)
        h = (sign[p] - lagna) % 12 + 1
        kendra = 60.0 if h in (1, 4, 7, 10) else 30.0 if h in (2, 5, 8, 11) else 15.0
        dk = int((l % 30) // 10)
        drek = 15.0 if ((p in ("Sun", "Mars", "Jupiter") and dk == 0) or
                        (p in ("Mercury", "Saturn") and dk == 1) or
                        (p in ("Moon", "Venus") and dk == 2)) else 0.0
        sthana[p] = {"uchcha": uchcha, "saptavargaja": sv, "ojayugma": float(oj),
                     "kendradi": kendra, "drekkana": drek}
        sthana[p]["total"] = sum(sthana[p].values())

    # ------------------------------------------------ 2. Dig
    strong_pt = {"Sun": mc, "Mars": mc, "Jupiter": asc, "Mercury": asc,
                 "Moon": ic, "Venus": ic, "Saturn": dsc}
    dig = {p: _arc(L[p], (strong_pt[p] + 180.0) % 360.0) / 3.0 for p in P7}

    # ------------------------------------------------ 3. Kala
    hh, mm, *ss = [int(x) for x in time_str.split(":")]
    clock_h = hh + mm / 60.0 + (ss[0] if ss else 0) / 3600.0
    nata_gh = min(clock_h, 24.0 - clock_h) * 2.5
    elong = (L["Moon"] - L["Sun"]) % 360.0
    shukla = elong < 180.0
    el = min(elong, 360.0 - elong)
    civil_wd = (datetime.strptime(date_str, "%Y-%m-%d").weekday() + 1) % 7
    vara_lord = WEEKDAY_LORD[civil_wd]
    day_birth = sunrise_jd <= jd_ut < sunset_jd
    # Hours since sunrise use the BIRTH-DATE sunrise time, wrapped for
    # pre-sunrise births (same rule as Kalai's Udhayathi nazhigai). [1 ref]
    hours_since_rise = ((jd_ut - sunrise_jd) * 24.0) % 24.0
    hora_lord = HORA_ORDER[(HORA_ORDER.index(vara_lord) + int(hours_since_rise)) % 7]
    # Kalai's ahargana epoch is 11 days later than 588466 (abda/masa lords of
    # REF-001, T001-T08 all reproduce with a shift of -11 or -12). [9 refs]
    ahargana = int(jd_ut + tz_offset_hours / 24.0 + 0.5) - 588466 - 11
    abda_lord = WEEKDAY_LORD[((ahargana // 360) * 3 + 4) % 7]
    masa_lord = WEEKDAY_LORD[((ahargana // 30) * 2 + 4) % 7]
    if day_birth:
        span = sunset_jd - sunrise_jd
        part = min(2, int((jd_ut - sunrise_jd) / (span / 3.0)))
        tribhaga_lord = ["Mercury", "Sun", "Saturn"][part]
    else:
        n_start = sunset_jd if jd_ut >= sunset_jd else sunset_jd - 1.0
        n_end = sunrise_jd + (1.0 if jd_ut >= sunset_jd else 0.0)
        part = min(2, max(0, int((jd_ut - n_start) / ((n_end - n_start) / 3.0))))
        tribhaga_lord = ["Moon", "Venus", "Mars"][part]

    merc_malefic = any(sign["Mercury"] == sign[m] for m in ("Sun", "Mars", "Saturn"))
    kala: Dict[str, Dict[str, float]] = {}
    ayana_single: Dict[str, float] = {}
    for p in P7:
        if p == "Mercury":
            nato = 60.0
        elif p in ("Moon", "Mars", "Saturn"):
            nato = 60.0 - 2.0 * nata_gh
        else:
            nato = 2.0 * nata_gh
        # Paksha benefics: Jupiter, Venus; Moon only in Shukla paksha; Mercury
        # unless it shares a sign with Sun/Mars/Saturn (T001, T02, T03, T04, T08).
        benefic = p in ("Jupiter", "Venus") or (p == "Moon" and shukla) or (p == "Mercury" and not merc_malefic)
        paksha = el / 3.0 if benefic else 60.0 - el / 3.0
        if p == "Moon":
            paksha *= 2.0
        tri = 60.0 if (p == "Jupiter" or p == tribhaga_lord) else 0.0
        abda = 15.0 if p == abda_lord else 0.0
        masa = 30.0 if p == masa_lord else 0.0
        vara = 45.0 if p == vara_lord else 0.0
        hora = 60.0 if p == hora_lord else 0.0
        sayana = (L[p] + ayan) % 360.0
        kr = math.degrees(math.asin(math.sin(math.radians(eps)) * math.sin(math.radians(sayana))))
        k_eff = abs(kr) if p == "Mercury" else (-kr if p in ("Moon", "Saturn") else kr)
        ayana = (eps + k_eff) / (2.0 * eps) * 60.0
        ayana_single[p] = ayana
        if p == "Sun":
            ayana *= 2.0
        kala[p] = {"natonnata": nato, "paksha": paksha, "tribhaga": tri, "abda": abda,
                   "masa": masa, "vara": vara, "hora": hora, "ayana": ayana, "yuddha": 0.0}
        kala[p]["total"] = sum(kala[p].values())

    # ------------------------------------------------ 4. Cheshta
    T = (jd_ut - 2451545.0) / 36525.0
    yrs = (jd_ut - 2451545.0) / 365.25  # years from J2000
    mean = {k: (a + b * T - ayan + _kalai_mean_corr(k, yrs)) % 360.0 for k, (a, b) in MEAN_ELEM.items()}
    mean_sun = (mean["Earth"] + 180.0) % 360.0

    def _ck(x: float) -> float:
        x %= 360.0
        return (360.0 - x if x > 180.0 else x) / 3.0

    cheshta = {"Sun": 0.0, "Moon": 0.0}
    for p in ("Mars", "Jupiter", "Saturn"):
        cheshta[p] = _ck(mean_sun - (mean[p] + L[p]) / 2.0)
    for p in ("Mercury", "Venus"):
        cheshta[p] = _ck(mean[p] - (mean_sun + L[p]) / 2.0)

    # ------------------------------------------------ 6. Drik
    def _is_benefic(a: str) -> bool:
        if a in ("Jupiter", "Venus"):
            return True
        if a == "Mercury":
            return not merc_malefic
        if a == "Moon":
            return shukla
        return False

    def _drik_on(target: float, exclude: Optional[str] = None) -> float:
        s = 0.0
        for a in P7:
            if a == exclude:
                continue
            v = _drishti(a, target - L[a])
            s += v if _is_benefic(a) else -v
        return s / 4.0

    drik = {p: _drik_on(L[p], exclude=p) for p in P7}

    def _bhava_drik(target: float) -> float:
        """BPHS bhava drishti: Jupiter's and Mercury's aspects are added in
        FULL, every other planet's at one quarter (9/12 houses exact vs REF-001)."""
        s = 0.0
        for a in P7:
            v = _drishti(a, target - L[a])
            v = v if _is_benefic(a) else -v
            s += v if a in ("Jupiter", "Mercury") else v / 4.0
        return s

    # ------------------------------------------------ totals
    planets: Dict[str, Any] = {}
    for p in P7:
        total = sthana[p]["total"] + dig[p] + kala[p]["total"] + cheshta[p] + NAISARGIKA[p] + drik[p]
        ch_for_ishta = kala["Moon"]["paksha"] / 2.0 if p == "Moon" else ayana_single["Sun"] if p == "Sun" else cheshta[p]
        u = sthana[p]["uchcha"]
        ishta = math.sqrt(max(0.0, u * ch_for_ishta))
        kashta = math.sqrt(max(0.0, (60.0 - u) * (60.0 - ch_for_ishta)))
        planets[p] = {
            "planet": p, "planet_ta": _ta(p),
            "sthana": round(sthana[p]["total"] / 60, 3), "sthana_parts": {k: round(v, 3) for k, v in sthana[p].items()},
            "kala": round(kala[p]["total"] / 60, 3), "kala_parts": {k: round(v, 3) for k, v in kala[p].items()},
            "dig": round(dig[p] / 60, 3), "cheshta": round(cheshta[p] / 60, 3),
            "naisargika": round(NAISARGIKA[p] / 60, 3), "drik": round(drik[p] / 60, 3),
            "total_rupas": round(total / 60, 3), "total_virupas": round(total, 2),
            "ishta": round(ishta / 60, 3), "kashta": round(kashta / 60, 3),
            "required_virupas": REQUIRED[p],
            "percentage": round(total / REQUIRED[p] * 100),
        }
    for rank, p in enumerate(sorted(P7, key=lambda q: -planets[q]["total_virupas"] / REQUIRED[q]), 1):
        planets[p]["rank"] = rank

    # ------------------------------------------------ Bhava bala
    cusps = [asc, None, None, ic, None, None, dsc, None, None, mc, None, None]
    quads = [asc, ic, dsc, mc]
    madhya = [0.0] * 12
    for q in range(4):
        a, b = quads[q], quads[(q + 1) % 4]
        span = (b - a) % 360.0
        for k in range(3):
            madhya[q * 3 + k] = (a + span * k / 3.0) % 360.0
    bhavas: List[Dict[str, Any]] = []
    for h in range(12):
        m = madhya[h]
        s = int(m // 30)
        first_half = (m % 30) < 15
        strong = BHAVA_DIG_STRONG[s][0 if first_half else 1]
        dist = min((h + 1 - strong) % 12, (strong - h - 1) % 12)
        bdig = max(0.0, 60.0 - dist * 10.0)
        bdrik = _bhava_drik(m)
        lord = SIGN_LORD[s]
        lord_total = planets[lord]["total_virupas"]
        total = bdig + bdrik + lord_total
        bhavas.append({
            "house": h + 1, "madhya_sign": s + 1, "lord": lord, "lord_ta": _ta(lord),
            "drik": round(bdrik / 60, 3), "dig": round(bdig / 60, 3),
            "adhipati": round(lord_total / 60, 3), "total_rupas": round(total / 60, 3),
            "total_virupas": round(total, 2),
        })
    for rank, b in enumerate(sorted(bhavas, key=lambda x: -x["total_virupas"]), 1):
        b["rank"] = rank

    return {
        "planets": planets,
        "bhavas": bhavas,
        "context": {
            "vara_lord": vara_lord, "hora_lord": hora_lord, "abda_lord": abda_lord,
            "masa_lord": masa_lord, "tribhaga_lord": tribhaga_lord,
            "is_day_birth": day_birth, "shukla_paksha": shukla, "mercury_malefic": merc_malefic,
        },
        "method_note": "Kalai Magal parity Shadbala (BPHS 27-28 with Kalai conventions); see module docstring.",
    }


def compute_kalai_shadbala_auto(jd_ut: float, lat: float, lon: float, date_str: str,
                                time_str: str, tz_name: str = "Asia/Kolkata") -> Dict[str, Any]:
    """Convenience wrapper: derives the timezone offset and the birth-date
    sunrise/sunset (disc centre, no refraction — Kalai convention)."""
    import pytz
    if len(time_str.split(":")) == 2:
        time_str = f"{time_str}:00"
    from backend.app.services.ephemeris import get_tz
    local = get_tz(tz_name).localize(datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S"))
    tz_off = local.utcoffset().total_seconds() / 3600.0
    y, m, d = [int(x) for x in date_str.split("-")]
    jd_midnight_ut = swe.julday(y, m, d, 0.0) - tz_off / 24.0
    geo = (lon, lat, 0.0)
    fl = swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION
    rise = swe.rise_trans(jd_midnight_ut, swe.SUN, swe.CALC_RISE | fl, geo, 0.0, 0.0, swe.FLG_SWIEPH)[1][0]
    sset = swe.rise_trans(jd_midnight_ut, swe.SUN, swe.CALC_SET | fl, geo, 0.0, 0.0, swe.FLG_SWIEPH)[1][0]
    return compute_kalai_shadbala(jd_ut, lat, lon, date_str, time_str, tz_off, rise, sset)
