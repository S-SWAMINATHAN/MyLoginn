"""
Shodasa Varga tables + Planet Details table — Kalai Magal parity (Phase 2b).

Verified against the anonymised Kalai Magal reference REF-001:
  • Varga-sign lords (வர்காதிபதி): 16 vargas × 10 points = 160/160 exact.
  • Shodasa varga bala (சோடச வர்க்க பலம்): all 160 values + totals exact
    (see tests/test_kalai_parity.py).
  • Planet details table: bhava, suyam bhava bala %, lordships, kendra/trikona,
    dignity, conjunctions, aspects, retro/combust/vargottama, parivartana, war.

Varga schemes (BPHS 6): D1, D2 (Parashara hora: Leo/Cancer), D3 (1-5-9),
D4 (1-4-7-10), D7 (odd from sign, even from 7th), D9, D10 (odd from sign,
even from 9th), D12, D16 (movable Aries / fixed Leo / dual Sagittarius),
D20 (movable Aries / fixed Sagittarius / dual Leo), D24 (odd Leo, even Cancer),
D27 (fire Aries, earth Cancer, air Libra, water Capricorn), D30 (odd 5/5/8/7/5,
even 5/7/8/5/5), D40 (odd Aries, even Libra), D45 (movable Aries / fixed Leo /
dual Sagittarius), D60 (from sign, ½° parts).

Varga bala values (Kalai):
  own sign 30 · compound relation 22.5 / 15 / 7.5 / 3.75 / 1.875, where the
  TEMPORAL relation is taken from the positions IN THAT VARGA chart.
  Rasi (D1) row: natural relation only (15 / 7.5 / 3.75); debilitated 1.875.
  Rahu/Ketu natural relations: friends Venus, Saturn; neutral Mercury, Jupiter;
  enemies Sun, Moon, Mars (consistent across all 15 vargas of REF-001).
  Rahu/Ketu in the Rasi row: Saturn treated as enemy [derived from 1 reference].
  Lagna: value = the varga value of the lord of the Lagna's varga sign.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from backend.app.services.tamil_labels import PLANET_LABELS

SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
             "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]
SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
           "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]
P7 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
P9 = P7 + ["Rahu", "Ketu"]
POINTS = P9 + ["Lagna"]


def _s(l: float) -> int: return int((l % 360.0) // 30)
def _x(l: float) -> float: return l % 30.0
def _mfd(s: int, m: int, f: int, d: int) -> int: return (m, f, d)[s % 3]


def d1(l): return _s(l)
def d2(l):
    s, x = _s(l), _x(l)
    return (4 if x < 15 else 3) if s % 2 == 0 else (3 if x < 15 else 4)
def d3(l): return (_s(l) + (0, 4, 8)[int(_x(l) // 10)]) % 12
def d4(l): return (_s(l) + 3 * int(_x(l) // 7.5)) % 12
def d7(l):
    s, k = _s(l), int(_x(l) / (30 / 7))
    return (s + k) % 12 if s % 2 == 0 else (s + 6 + k) % 12
def d9(l): return int((l % 360.0) / (10 / 3)) % 12
def d10(l):
    s, k = _s(l), int(_x(l) // 3)
    return (s + k) % 12 if s % 2 == 0 else (s + 8 + k) % 12
def d12(l): return (_s(l) + int(_x(l) // 2.5)) % 12
def d16(l): return (_mfd(_s(l), 0, 4, 8) + int(_x(l) / (30 / 16))) % 12
def d20(l): return (_mfd(_s(l), 0, 8, 4) + int(_x(l) / 1.5)) % 12
def d24(l): return ((4 if _s(l) % 2 == 0 else 3) + int(_x(l) / 1.25)) % 12
def d27(l): return ((0, 3, 6, 9)[_s(l) % 4] + int(_x(l) / (30 / 27))) % 12
def d30(l):
    s, x = _s(l), _x(l)
    tab = ([(5, 0), (10, 10), (18, 8), (25, 2), (30, 6)] if s % 2 == 0
           else [(5, 1), (12, 5), (20, 11), (25, 9), (30, 7)])
    for lim, sg in tab:
        if x < lim:
            return sg
    return tab[-1][1]
def d40(l): return ((0 if _s(l) % 2 == 0 else 6) + int(_x(l) / 0.75)) % 12
def d45(l): return (_mfd(_s(l), 0, 4, 8) + int(_x(l) / (30 / 45))) % 12
def d60(l): return (_s(l) + int(_x(l) * 2)) % 12


# Kalai order of the Shodasa-varga bala table
VARGAS: List[Tuple[str, str, str, Any]] = [
    ("D1", "ராசி", "Rasi", d1), ("D2", "ஹோரை", "Hora", d2), ("D3", "திரேக்காணம்", "Drekkana", d3),
    ("D7", "சப்தாம்சம்", "Saptamsa", d7), ("D9", "நவாம்சம்", "Navamsa", d9), ("D10", "தசாம்சம்", "Dasamsa", d10),
    ("D12", "துவாதசாம்சம்", "Dwadasamsa", d12), ("D30", "திரிசாம்சம்", "Trimsamsa", d30),
    ("D16", "சோடசாம்சம்", "Shodasamsa", d16), ("D60", "சஷ்டியாம்சம்", "Shashtiamsa", d60),
    ("D4", "சதுர்தாம்சம்", "Chaturthamsa", d4), ("D20", "விம்சாம்சம்", "Vimsamsa", d20),
    ("D24", "சதுர்விம்சாம்சம்", "Chaturvimsamsa", d24), ("D27", "பம்சா", "Bhamsa", d27),
    ("D40", "காவேதாம்சம்", "Khavedamsa", d40), ("D45", "அக்ஷவேதாம்சம்", "Akshavedamsa", d45),
]

NAT_FRIEND = {"Sun": ["Moon", "Mars", "Jupiter"], "Moon": ["Sun", "Mercury"], "Mars": ["Sun", "Moon", "Jupiter"],
              "Mercury": ["Sun", "Venus"], "Jupiter": ["Sun", "Moon", "Mars"], "Venus": ["Mercury", "Saturn"],
              "Saturn": ["Mercury", "Venus"], "Rahu": ["Venus", "Saturn"], "Ketu": ["Venus", "Saturn"]}
NAT_ENEMY = {"Sun": ["Venus", "Saturn"], "Moon": [], "Mars": ["Mercury"], "Mercury": ["Moon"],
             "Jupiter": ["Mercury", "Venus"], "Venus": ["Sun", "Moon"], "Saturn": ["Sun", "Moon", "Mars"],
             "Rahu": ["Sun", "Moon", "Mars"], "Ketu": ["Sun", "Moon", "Mars"]}
NODE_RASI_ENEMY = ["Sun", "Moon", "Mars", "Saturn"]  # [derived from 1 reference]
OWN = {"Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5], "Jupiter": [8, 11],
       "Venus": [1, 6], "Saturn": [9, 10], "Rahu": [], "Ketu": []}
EXALT_SIGN = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6}
DEBIL_SIGN = {p: (s + 6) % 12 for p, s in EXALT_SIGN.items()}
COMPOUND = {2: 22.5, 1: 15.0, 0: 7.5, -1: 3.75, -2: 1.875}


def _ta(p: str) -> str:
    return PLANET_LABELS.get(p, {}).get("ta", "லக்னம்" if p == "Lagna" else p)


def _nat(p: str, q: str) -> int:
    return 1 if q in NAT_FRIEND[p] else -1 if q in NAT_ENEMY[p] else 0


def _temp(sp: int, sq: int) -> int:
    return 1 if ((sq - sp) % 12 + 1) in (2, 3, 4, 10, 11, 12) else -1


def varga_charts(lon: Dict[str, float]) -> Dict[str, Dict[str, Any]]:
    """{varga_code: {point: sign(1..12)}, plus lords}"""
    out: Dict[str, Dict[str, Any]] = {}
    for code, ta, en, f in VARGAS:
        signs = {p: f(lon[p]) + 1 for p in POINTS}
        out[code] = {"title_ta": ta, "title_en": en, "signs": signs,
                     "lords": {p: SIGN_LORD[signs[p] - 1] for p in POINTS}}
    return out


def shodasa_varga_bala(lon: Dict[str, float]) -> Dict[str, Any]:
    rows: List[Dict[str, Any]] = []
    totals = {p: 0.0 for p in POINTS}
    for code, ta, en, f in VARGAS:
        vals: Dict[str, float] = {}
        for p in P9:
            sg = f(lon[p])
            q = SIGN_LORD[sg]
            if code == "D1" and p in EXALT_SIGN and sg == EXALT_SIGN[p]:
                v = 22.5  # exalted in Rasi: 22.5, even when also own sign (T001, T03, T05, T07)
            elif sg in OWN[p]:
                v = 30.0
            elif code == "D1":
                if p in DEBIL_SIGN and sg == DEBIL_SIGN[p]:
                    v = 1.875
                elif p in ("Rahu", "Ketu"):
                    v = 3.75 if q in NODE_RASI_ENEMY else 15.0 if q in NAT_FRIEND[p] else 7.5
                else:
                    v = {1: 15.0, 0: 7.5, -1: 3.75}[_nat(p, q)]
            else:
                v = COMPOUND[_nat(p, q) + _temp(sg, f(lon[q]))]
            vals[p] = v
        vals["Lagna"] = vals[SIGN_LORD[f(lon["Lagna"])]]
        for p in POINTS:
            totals[p] += vals[p]
        rows.append({"varga": code, "title_ta": ta, "title_en": en,
                     "values": {p: round(vals[p], 3) for p in POINTS}})
    return {"rows": rows,
            "totals": {p: round(totals[p], 3) for p in POINTS},
            "totals_rupas": {p: round(totals[p] / 60.0, 2) for p in POINTS}}


# --------------------------------------------------------------------------
# Planet details table (கிரகங்களின் விவர அட்டவணை)
# --------------------------------------------------------------------------
COMBUST_DEG = {"Moon": 12.0, "Mars": 17.0, "Mercury": 14.0, "Jupiter": 11.0, "Venus": 10.0, "Saturn": 15.0}
COMBUST_DEG_RETRO = {"Mercury": 12.0, "Venus": 8.0}
SPECIAL_ASPECTS = {"Mars": (4, 7, 8), "Jupiter": (5, 7, 9), "Saturn": (3, 7, 10),
                   "Rahu": (7,), "Ketu": (7,)}  # others: 7th only (Kalai: nodes 7th only)


def _arc(a: float, b: float) -> float:
    d = abs(a - b) % 360.0
    return min(d, 360.0 - d)


def planet_details(lon: Dict[str, float], retro: Dict[str, bool], lat_ecl: Dict[str, float],  # lat_ecl = apparent MAGNITUDE per planet
                   bhava_rows: List[Dict[str, Any]], shadbala: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    sign = {p: _s(lon[p]) for p in POINTS}
    lagna = sign["Lagna"]
    rows: List[Dict[str, Any]] = []

    def bhava_of(l: float) -> Tuple[int, int]:
        for r in bhava_rows:
            a, m, e = r["arambam"], r["madhyam"], r["anthyam"]
            if (l - a) % 360.0 < (e - a) % 360.0:
                if (l - a) % 360.0 <= (m - a) % 360.0:
                    frac = ((l - a) % 360.0) / max(1e-9, (m - a) % 360.0)
                else:
                    frac = ((e - l) % 360.0) / max(1e-9, (e - m) % 360.0)
                return r["house"], int(frac * 100.0)
        return 0, 0

    # Planetary war (graha yuddha): Mars..Saturn within 1°. Winner = the
    # BRIGHTER planet (lower apparent magnitude; Brihat Samhita 17). The
    # northern-latitude rule gives the opposite result for REF-001, where Kalai
    # declares Saturn the winner over Mars. [derived from 1 reference]
    wars: List[Dict[str, str]] = []
    fighters = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    for i, a in enumerate(fighters):
        for b in fighters[i + 1:]:
            if _arc(lon[a], lon[b]) < 1.0:
                win = a if lat_ecl.get(a, 0.0) < lat_ecl.get(b, 0.0) else b
                wars.append({"planets": [a, b], "winner": win})

    for p in P9:
        s = sign[p]
        house_sign = (s - lagna) % 12 + 1
        bh, pct = bhava_of(lon[p])
        owned = [((o - lagna) % 12) + 1 for o in OWN.get(p, [])]
        status = "kendra" if house_sign in (1, 4, 7, 10) else "trikona" if house_sign in (5, 9) else None
        if p in EXALT_SIGN and s == EXALT_SIGN[p]:
            dignity = "exalted"
        elif p in DEBIL_SIGN and s == DEBIL_SIGN[p]:
            dignity = "debilitated"
        elif s in OWN.get(p, []):
            dignity = "own"
        elif p in ("Rahu", "Ketu"):
            q = SIGN_LORD[s]
            dignity = "enemy" if q in NODE_RASI_ENEMY else "friend" if q in NAT_FRIEND[p] else "neutral"
        else:
            dignity = {1: "friend", 0: "neutral", -1: "enemy"}[_nat(p, SIGN_LORD[s])]
        conj = [q for q in P9 if q != p and sign[q] == s]
        aspected_by = [q for q in P9 if q != p and ((s - sign[q]) % 12 + 1) in SPECIAL_ASPECTS.get(q, (7,))]
        combust = False
        if p in COMBUST_DEG:
            lim = COMBUST_DEG_RETRO.get(p, COMBUST_DEG[p]) if retro.get(p) else COMBUST_DEG[p]
            combust = _arc(lon[p], lon["Sun"]) <= lim
        vargottama = d9(lon[p]) == s
        parivartana = None
        if p in P7:
            lord = SIGN_LORD[s]
            if lord != p and lord in P7 and SIGN_LORD[sign[lord]] == p:
                parivartana = lord
        war = next((w for w in wars if p in w["planets"]), None)
        sb = (shadbala or {}).get("planets", {}).get(p) if p in P7 else None
        cls = None
        if sb:
            pct_s = sb["percentage"]
            cls = "poorna" if pct_s >= 120 else "mathima" if pct_s >= 100 else "adhama"  # thresholds [derived from 1 reference]
        rows.append({
            "planet": p, "planet_ta": _ta(p),
            "bhava": bh, "suyam_bhava_bala_pct": pct, "lord_of": owned,
            "status": status, "dignity": dignity,
            "conjunct": conj, "aspected_by": aspected_by,
            "retrograde": bool(retro.get(p)) and p not in ("Rahu", "Ketu"),
            "combust": combust, "vargottama": vargottama,
            "parivartana_with": parivartana,
            "war": war,
            "shadbala_rupas": round(sb["total_rupas"], 1) if sb else None,
            "shadbala_class": cls,
        })
    return {"rows": rows, "wars": wars}
