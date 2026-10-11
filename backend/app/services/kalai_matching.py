"""
Marriage matching (12 poruthams, graded points) — Kalai Magal parity (Phase 5).

Verified on 3 Kalai matching printouts (matching.pdf, Match.pdf, Match_1.pdf):
totals 13/37, 18/37, 19/37 and every row reproduce. Each rule below is marked
[V] verified by those samples or [C] classical rule not yet seen in a Kalai
sample — the API returns this per row as `verified`.

Counts are from the girl's nakshatra/rasi to the boy's (1 = same).
 1 Dinam 3      [V] count ∈ {2,4,6,8,9,11,13,15,18,20,24,26} → 3 else 0
 2 Ganam 4      [V] girl Rakshasa, boy other → 0; [C] same → 4, girl Deva/boy
                Manushya → 4, girl Manushya/boy Deva → 2, boy Rakshasa → 0
 3 Mahendram 2  [V] count ∈ {4,7,10,13,16,19,22,25} → 2
 4 Stree Deergham 2 [V] count > 13 → 2, 7..13 → 1; [C] < 7 → 0
 5 Yoni 4       [V] different, non-enemy animals → 2, but 1 when the girl's yoni
                is male and the boy's female; [C] same animal → 4, enemies → 0
                Kalai (Tamil) genders: Chitra tiger male, Vishakha tiger female.
 6 Rasi 3       [V] count 11 → 3, count 6 → 1; [C] 7, 9, 10, 12 → 3; 1, 3, 4, 5 → 1; 2, 8 → 0
 7 Rasi Adhipathi 4 [V] enemy+neutral → 1, enemy+enemy → 0; [C] same lord or
                friend+friend → 4, friend+neutral → 3, neutral+neutral → 2, friend+enemy → 1
 8 Vasiyam 3    [V] girl's vasya list holds boy's rasi → 2; only boy's holds girl's → 0;
                [C] both → 3  (Tamil vasya table)
 9 Rajju 5      [V] different rajju → 5, same → 0
10 Vedhai 4     [V] not a vedha pair → 4; [C] vedha pair → 0
11 Nadi 2       [V] different nadi → 2, same → 0
12 Varnam 1     [V] boy's varna ≥ girl's → 1. Varna per nakshatra: 6 seen in Kalai
                (Krittika V, P.Phalguni K, U.Phalguni S, Hasta S, Vishakha K,
                Jyeshtha B); others [C] from the moon-sign varna.
Overall "பொருத்தம் உண்டு" when the score ≥ 50 %.
Sevvai dosham: Mars in 2, 4, 7, 8, 12 from Lagna → dosham; classical cancellations
make it "பரிகார செவ்வாய்" (a Mars in a merely friendly sign is NOT a cancellation —
M2 prints full "Dosha"). Match when both have none or both have (any) dosham.
Dasa sandhi: among the next 3 mahadasa changes of each (Ini "Dasa Nos" = 3) after the
report date, one pair less than 1 year apart → sandhi (not matching).
Verified on 9 Kalai printouts (matching, Match, Match_1, M1–M6): 108/108 rows.
"""
from __future__ import annotations

from datetime import date
from typing import Any, Dict, List, Optional

from backend.app.services.porutham import ENEMY_YONIS, GANA_MAP, RAJJU_MAP, VEDHA_PAIRS, YONI_MAP

NAK_TA = ["அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்",
          "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்",
          "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி",
          "உத்திரட்டாதி", "ரேவதி"]
RASI_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு",
           "மகரம்", "கும்பம்", "மீனம்"]
RASI_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]
PL_TA = {"Sun": "சூரியன்", "Moon": "சந்திரன்", "Mars": "செவ்வாய்", "Mercury": "புதன்", "Jupiter": "குரு",
         "Venus": "சுக்கிரன்", "Saturn": "சனி"}
GANA_TA = {"Deva": "தேவ", "Manushya": "மனுஷ", "Rakshasa": "ராட்சஷ"}
RAJJU_KALAI_TA = {"Pada": "பாதம்", "Kati": "தொடை", "Udhara": "வயிறு", "Kanta": "கண்டம்", "Sirasu": "சிரசு"}
ANIMAL_TA = {"Horse": "குதிரை", "Elephant": "யானை", "Sheep": "ஆடு", "Goat": "ஆடு", "Serpent": "பாம்பு", "Dog": "நாய்",
             "Cat": "பூனை", "Rat": "எலி", "Cow": "பசு", "Buffalo": "எருமை", "Tiger": "புலி", "Deer": "மான்",
             "Monkey": "குரங்கு", "Mongoose": "கீரி", "Lion": "சிங்கம்"}
NADI = {n: ("Vatham" if n in (1, 6, 7, 12, 13, 18, 19, 24, 25) else
            "Pitham" if n in (2, 5, 8, 11, 14, 17, 20, 23, 26) else "Sleshmam") for n in range(1, 28)}
NADI_TA = {"Vatham": "வாதம்", "Pitham": "பித்தம்", "Sleshmam": "சிலேஷ்மம்"}
VASYA_TAMIL = {1: [5, 8], 2: [4, 7], 3: [6], 4: [8, 9], 5: [7], 6: [3, 12], 7: [6, 10], 8: [4, 6],
               9: [12], 10: [1, 11], 11: [1], 12: [10]}
FRIENDS = {"Sun": (["Moon", "Mars", "Jupiter"], ["Venus", "Saturn"]), "Moon": (["Sun", "Mercury"], []),
           "Mars": (["Sun", "Moon", "Jupiter"], ["Mercury"]), "Mercury": (["Sun", "Venus"], ["Moon"]),
           "Jupiter": (["Sun", "Moon", "Mars"], ["Mercury", "Venus"]), "Venus": (["Mercury", "Saturn"], ["Sun", "Moon"]),
           "Saturn": (["Mercury", "Venus"], ["Sun", "Moon", "Mars"])}
VARNA_RANK = {"Brahmana": 4, "Kshatriya": 3, "Vaisya": 2, "Sudra": 1}
VARNA_TA = {"Brahmana": "பிராமண", "Kshatriya": "சத்திரிய", "Vaisya": "வைசிய", "Sudra": "சூத்திர"}
# Kalai assigns varna by the Moon's RASI (Visakam p2 Thula = Kshatriya, Visakam p4
# Vrischika = Brahmana). Seen in 9 printouts: water signs Brahmana, earth signs Sudra,
# Mesha/Mithuna/Kumbha Vaisya, Simha/Thula Kshatriya. Dhanus, Makara, Meena not yet seen.
RASI_VARNA_KALAI = {1: "Vaisya", 2: "Sudra", 3: "Vaisya", 4: "Brahmana", 5: "Kshatriya", 6: "Sudra",
                    7: "Kshatriya", 8: "Brahmana", 9: "Kshatriya", 10: "Sudra", 11: "Vaisya", 12: "Brahmana"}
RASI_VARNA_SEEN = {1, 2, 3, 4, 5, 6, 7, 8, 11}


def _yoni(n: int) -> Dict[str, str]:
    y = dict(YONI_MAP[n])
    if n == 14:
        y["gender"] = "M"  # Kalai: Chitra tiger male
    if n == 16:
        y["gender"] = "F"  # Kalai: Vishakha tiger female
    if n == 6:
        y["gender"] = "M"  # Kalai: Thiruvathirai dog male (M4)
    if n == 19:
        y["gender"] = "F"  # hence Moolam dog female [not yet seen]
    return y


def _rel(a: str, b: str) -> int:
    f, e = FRIENDS[a]
    return 1 if b in f else (-1 if b in e else 0)


def _verdict(points: float, maximum: int) -> str:
    return "நன்று" if points >= maximum else ("தீது" if points == 0 else "மத்திமம்")


def compute_poruthams(girl_nak: int, girl_rasi: int, boy_nak: int, boy_rasi: int) -> Dict[str, Any]:
    cnt = (boy_nak - girl_nak) % 27 + 1
    rc = (boy_rasi - girl_rasi) % 12 + 1
    rows: List[Dict[str, Any]] = []

    def add(no, key, ta, g_val, b_val, pts, mx, verified, verdict=None):
        rows.append({"no": no, "key": key, "name_ta": ta, "girl": g_val, "boy": b_val, "points": pts, "max": mx,
                     "verdict_ta": verdict or _verdict(pts, mx), "verified": verified})

    gn, bn = NAK_TA[girl_nak - 1], NAK_TA[boy_nak - 1]
    # Tamil dina list (counts 17, 22, 27 are NOT good although their remainder is even — 33263)
    add(1, "dinam", "தினம்", gn, bn, 3 if cnt in (2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26) else 0, 3, cnt != 1)

    gg, bg = GANA_MAP[girl_nak], GANA_MAP[boy_nak]
    if gg == "Rakshasa" and bg != "Rakshasa":
        gp, gv = 0, True
    elif gg == bg:
        gp, gv = 4, True                      # M1 (Deva-Deva), M4 (Manushya-Manushya)
    elif gg == "Deva" and bg == "Rakshasa":
        gp, gv = 2, True                      # M2, M3, M6
    else:
        gp, gv = 2, False                     # Deva/Manushya mixes, Manushya-Rakshasa: not yet seen
    add(2, "ganam", "கணம்", GANA_TA[gg], GANA_TA[bg], gp, 4, gv)

    add(3, "mahendram", "மகேந்திரம்", gn, bn, 2 if cnt in (4, 7, 10, 13, 16, 19, 22, 25) else 0, 2, True)

    sd = 2 if cnt > 13 else (1 if cnt >= 7 else 0)
    add(4, "stree_deergham", "ஸ்திரீ தீர்க்கம்", gn, bn, sd, 2, True)

    gy, by = _yoni(girl_nak), _yoni(boy_nak)
    if gy["gender"] == "M" and by["gender"] == "F":
        yp, yv = 1, True                      # even for the same animal (M2 horse/mare)
    elif gy["animal"] == by["animal"]:
        yp, yv = 4, False
    elif (gy["animal"], by["animal"]) in ENEMY_YONIS:
        yp, yv = 0, False
    else:
        yp, yv = 2, True
    def fmt(y):  # Kalai prints the bull as "எருது" without a gender mark
        if y["animal"] == "Cow" and y["gender"] == "M":
            return "எருது"
        return f"{ANIMAL_TA[y['animal']]}({'ஆ' if y['gender'] == 'M' else 'பெ'})"
    add(5, "yoni", "யோனி", fmt(gy), fmt(by), yp, 4, yv, "தீது" if yp <= 1 else None)

    rp = {11: 3, 6: 1, 2: 0, 5: 0, 7: 0, 8: 0, 1: 3, 3: 1, 4: 1, 9: 0, 10: 1, 12: 0}[rc]
    add(6, "rasi", "ராசி", RASI_TA[girl_rasi - 1], RASI_TA[boy_rasi - 1], rp, 3, rc in (2, 5, 6, 7, 8, 11))

    gl, bl = RASI_LORD[girl_rasi - 1], RASI_LORD[boy_rasi - 1]
    if gl == bl:
        ap, av = 4, True
    else:
        pair = sorted([_rel(gl, bl), _rel(bl, gl)])
        ap = {(1, 1): 4, (0, 1): 3, (0, 0): 2, (-1, 0): 1, (-1, 1): 1, (-1, -1): 0}[tuple(pair)]
        av = tuple(pair) in ((-1, 0), (-1, -1), (0, 1), (1, 1))
    add(7, "rasi_adhipathi", "ராசி அதிபதி", PL_TA[gl], PL_TA[bl], ap, 4, av)

    g_has = boy_rasi in VASYA_TAMIL[girl_rasi]
    b_has = girl_rasi in VASYA_TAMIL[boy_rasi]
    vp = 2 if g_has else 0                    # mutual also 2 (M6); 3 never seen yet
    add(8, "vasiyam", "வசியம்", RASI_TA[girl_rasi - 1], RASI_TA[boy_rasi - 1], vp, 3, True,
        "நன்று" if vp >= 2 else "தீது")

    gr, br = RAJJU_MAP[girl_nak], RAJJU_MAP[boy_nak]
    add(9, "rajju", "ரச்சு", RAJJU_KALAI_TA[gr], RAJJU_KALAI_TA[br], 0 if gr == br else 5, 5, True)

    vedha = (girl_nak, boy_nak) in VEDHA_PAIRS
    add(10, "vedhai", "வேதை", gn, bn, 0 if vedha else 4, 4, True)

    gnd, bnd = NADI[girl_nak], NADI[boy_nak]
    add(11, "nadi", "நாடி", NADI_TA[gnd], NADI_TA[bnd], 0 if gnd == bnd else 2, 2, True)

    gv_, bv_ = RASI_VARNA_KALAI[girl_rasi], RASI_VARNA_KALAI[boy_rasi]
    vv = girl_rasi in RASI_VARNA_SEEN and boy_rasi in RASI_VARNA_SEEN
    add(12, "varnam", "வர்ணம்", VARNA_TA[gv_], VARNA_TA[bv_], 1 if VARNA_RANK[bv_] >= VARNA_RANK[gv_] else 0, 1, vv)

    total = sum(r["points"] for r in rows)
    pct = round(total * 100.0 / 37.0, 2)
    return {"rows": rows, "total": total, "max": 37, "percent": pct,
            "star_match_ta": "பொருத்தம் உண்டு" if pct >= 50 else "பொருத்தம் இல்லை",
            "rajju_match": gr != br, "all_rows_verified": all(r["verified"] for r in rows)}


def sevvai_status(lagna_sign: int, mars_sign: int, cancellations: List[str]) -> str:
    """none | parihara | dosham"""
    h = (mars_sign - lagna_sign) % 12 + 1
    if h not in (2, 4, 7, 8, 12):
        return "none"
    return "parihara" if cancellations else "dosham"


def mars_cancellations(lagna_sign: int, mars_sign: int, moon_sign: int, jupiter_sign: int) -> List[str]:
    h = (mars_sign - lagna_sign) % 12 + 1
    out = []
    if mars_sign in (1, 8, 10):
        out.append("own/exalted")
    if mars_sign == 4:
        out.append("debilitated in Kataka")
    if mars_sign in (2, 7):
        out.append("in Venus's sign (Rishaba/Thula)")   # 33263 (2nd), S3 (8th), M4 (8th)
    if (mars_sign - jupiter_sign) % 12 + 1 in (1, 5, 7, 9):
        out.append("Jupiter conjunction/aspect")
    if mars_sign == moon_sign:
        out.append("with Moon")
    if h == 2 and mars_sign in (3, 6):
        out.append("2nd in Mithuna/Kanni")
    if h == 4 and mars_sign in (1, 8):
        out.append("4th in Mesha/Vrischika")
    if h == 7 and mars_sign in (4, 10):
        out.append("7th in Kataka/Makara")
    if h == 8 and mars_sign in (9, 12, 7, 2):
        out.append("8th in Dhanus/Meena/Thula/Rishaba")
    if h == 12 and mars_sign in (2, 7):
        out.append("12th in Rishaba/Thula")
    if lagna_sign in (4, 5, 11):
        out.append("lagna Kataka/Simha/Kumbha")
    return out


DASA_NOS = 3  # Kalai Ini setting "Dasa Nos": only the next 3 mahadasa changes are compared (M4)


def dasa_sandhi(girl_dashas: List[Dict[str, Any]], boy_dashas: List[Dict[str, Any]], today: Optional[date] = None):
    today = today or date.today()
    g = [(d["planet_ta"], date.fromisoformat(d["end_date"])) for d in girl_dashas if date.fromisoformat(d["end_date"]) > today][:DASA_NOS]
    b = [(d["planet_ta"], date.fromisoformat(d["end_date"])) for d in boy_dashas if date.fromisoformat(d["end_date"]) > today][:DASA_NOS]
    for gp, ge in g:
        for bp, be in b:
            if abs((ge - be).days) < 365:
                return {"sandhi": True, "girl": {"dasa_ta": gp, "end": ge.strftime("%d-%m-%Y")},
                        "boy": {"dasa_ta": bp, "end": be.strftime("%d-%m-%Y")}}
    return {"sandhi": False}



def build_kalai_matching(girl: Dict[str, Any], boy: Dict[str, Any], today: Optional[date] = None) -> Dict[str, Any]:
    """girl/boy: kwargs for build_kalai_report (name, date_of_birth, time_of_birth, place,
    latitude, longitude, timezone, time_correction)."""
    from backend.app.services.kalai_report import build_kalai_report

    def person(p: Dict[str, Any]) -> Dict[str, Any]:
        r = build_kalai_report(**p)
        g = r["general"]
        rc = r["rasi_chart"]
        sign = {pl: int(s) for s, ps in rc.items() for pl in ps}
        nak = next(x for x in r["graha_spudam"] if x["planet"] == "Moon")
        moon_deg = nak["longitude"]
        nak_no = int(moon_deg // (360 / 27)) + 1
        canc = mars_cancellations(sign["Lagna"], sign["Mars"], sign["Moon"], sign["Jupiter"])
        status = sevvai_status(sign["Lagna"], sign["Mars"], canc)
        # bhava exchange (பாவக மாற்றம்): planets whose Sripati bhava sign differs from their rasi sign
        lagna_sign = sign["Lagna"]
        bhava_moves = []
        for row in r["planet_details"]["rows"] if r.get("planet_details", {}).get("status") == "ok" else []:
            pl = row["planet"]
            if pl in sign and row["bhava"]:
                bsign = (lagna_sign - 1 + row["bhava"] - 1) % 12 + 1
                if bsign != sign[pl]:
                    bhava_moves.append({"planet": pl, "planet_ta": row["planet_ta"], "bhava_sign_ta": RASI_TA[bsign - 1]})
        today_ = today or date.today()
        cur = None
        for d in r["dashas"]:
            for b in d["bhuktis"]:
                if date.fromisoformat(b["start_date"]) <= today_ < date.fromisoformat(b["end_date"]):
                    cur = {"dasa_ta": d["planet_ta"], "bhukti_ta": b["planet_ta"], "end": b["end_date_display"]}
        return {"report": r, "general": g, "nakshatra": nak_no, "rasi": sign["Moon"], "sevvai": status,
                "sevvai_cancellations": canc, "bhava_moves": bhava_moves, "current_dasa_bhukti": cur,
                "rasi_chart": rc, "navamsa_chart": r["navamsa_chart"], "dasa_balance": r["dasa_balance"]}

    G, B = person(girl), person(boy)
    por = compute_poruthams(G["nakshatra"], G["rasi"], B["nakshatra"], B["rasi"])
    sv_match = (G["sevvai"] == "none") == (B["sevvai"] == "none")
    sandhi = dasa_sandhi(G["report"]["dashas"], B["report"]["dashas"], today)
    for P in (G, B):
        P.pop("report")
    return {"girl": G, "boy": B, "poruthams": por,
            "sevvai": {"girl": G["sevvai"], "boy": B["sevvai"], "match": sv_match},
            "rajju": {"exists": por["rajju_match"], "match": por["rajju_match"]},
            "dasa_sandhi": {**sandhi, "match": not sandhi["sandhi"]}}
