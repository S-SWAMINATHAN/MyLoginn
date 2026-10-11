"""
Kalachakra Dasa — Kalai Magal (KKC Astro) parity (Phase 3, rev. 2).

Classical basis: BPHS ch. 46. Savya (வல ஓட்டு) / Apasavya (இட ஓட்டு)
nakshatras; sign years Ar 7, Ta 16, Ge 9, Cn 21, Le 5, Vi 9, Li 16, Sc 7,
Sg 10, Cp 4, Aq 4, Pi 10.

Kalai Magal method — verified on 10 reference reports (REF-001, T001, T01–T08;
both directions, all four padas):
  • First dasa sign = navamsa sign of the Moon
        n = ((nakshatra-1)·4 + pada-1) mod 12
    Savya: n.  Apasavya: the mirror sign (7 − n) mod 12
    (Ar↔Sc, Ta↔Li, Ge↔Vi, Cn↔Le, Sg↔Pi, Cp↔Aq).
  • Balance = (unelapsed fraction of the pada) × years of that sign.
  • Savya dasas run forward through the zodiac, Apasavya dasas backward.
  • Bhukti order depends only on (direction, dasa sign) — see BHUKTI_CHAIN.
    Savya: sign index mod 8 → S1 S2 S3 S4 A1 A2 A3 A4 (chain read forward).
    Apasavya: Ar..Sc → S1..A4, Sg..Pi → A1..A4 (chain read REVERSED).
  • Bhukti = dasa years × bhukti-sign years ÷ chain total.
  • The balance dasa shows only the bhuktis still running at birth
    (walked back from the dasa end).
  • Dates use the Kalai Y/M/D arithmetic of dasha_builder.py.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from backend.app.services.dasha_builder import date_after_birth, years_to_ymd

SIGNS = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"]
SIGN_TA = ["மேஷ", "ரிஷப", "மிதுன", "கடக", "சிம்ம", "கன்னி", "துலா", "விருச்சிக", "தனுசு", "மகர", "கும்ப", "மீன"]
SIGN_LORD_TA = ["செவ்வாய்", "சுக்கிரன்", "புதன்", "சந்திரன்", "சூரியன்", "புதன்",
                "சுக்கிரன்", "செவ்வாய்", "குரு", "சனி", "சனி", "குரு"]
YEARS = {"Ar": 7, "Ta": 16, "Ge": 9, "Cn": 21, "Le": 5, "Vi": 9, "Li": 16, "Sc": 7,
         "Sg": 10, "Cp": 4, "Aq": 4, "Pi": 10}
CHAINS = {
    "S1": ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg"],
    "S2": ["Cp", "Aq", "Pi", "Sc", "Li", "Vi", "Cn", "Le", "Ge"],
    "S3": ["Ta", "Ar", "Pi", "Aq", "Cp", "Sg", "Ar", "Ta", "Ge"],
    "S4": ["Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"],
    "A1": ["Sc", "Li", "Vi", "Cn", "Le", "Ge", "Ta", "Ar", "Pi"],
    "A2": ["Aq", "Cp", "Sg", "Ar", "Ta", "Ge", "Cn", "Le", "Vi"],
    "A3": ["Li", "Sc", "Sg", "Cp", "Aq", "Pi", "Sc", "Li", "Vi"],
    "A4": ["Cn", "Le", "Ge", "Ta", "Ar", "Pi", "Aq", "Cp", "Sg"],
}
CYCLE = ["S1", "S2", "S3", "S4", "A1", "A2", "A3", "A4"]
# (direction, dasa sign index) -> (chain, reversed?)
def _bhukti_chain(direction: str, s: int):
    if direction == "savya":
        return CYCLE[s % 8], False
    return (CYCLE[s] if s < 8 else CYCLE[4 + (s - 8)]), True
# BPHS 46: Apasavya nakshatras (1-based numbers)
APASAVYA = {4, 5, 6, 10, 11, 12, 16, 17, 18, 22, 23, 24}
NAK_SPAN = 360.0 / 27.0
PADA_SPAN = NAK_SPAN / 4.0


def _label(sg: str) -> Dict[str, str]:
    i = SIGNS.index(sg)
    return {"sign": sg, "sign_ta": SIGN_TA[i], "lord_ta": SIGN_LORD_TA[i]}


def _fmt(d: date) -> str:
    return d.strftime("%d-%m-%Y")


def _seq(direction: str, sign: str) -> List[str]:
    name, rev = _bhukti_chain(direction, SIGNS.index(sign))
    return list(reversed(CHAINS[name])) if rev else list(CHAINS[name])


def calculate_kalachakra(moon_deg: float, dob: str, n_dasas: int = 12) -> Dict[str, Any]:
    moon = moon_deg % 360.0
    nak = int(moon // NAK_SPAN) + 1
    pada = int((moon % NAK_SPAN) // PADA_SPAN) + 1
    direction = "apasavya" if nak in APASAVYA else "savya"
    birth = datetime.strptime(dob, "%Y-%m-%d").date()
    frac_left = 1.0 - ((moon % PADA_SPAN) / PADA_SPAN)

    nav = ((nak - 1) * 4 + pada - 1) % 12
    first_idx = nav if direction == "savya" else (7 - nav) % 12
    first = SIGNS[first_idx]
    balance = frac_left * YEARS[first]
    step = 1 if direction == "savya" else -1
    dasa_signs = [SIGNS[(first_idx + step * k) % 12] for k in range(n_dasas)]

    dashas: List[Dict[str, Any]] = []
    # ---- balance dasa: bhuktis still running at birth, walked back from its end
    seq = _seq(direction, first)
    total = sum(YEARS[s] for s in seq)
    lengths = [YEARS[first] * YEARS[s] / total for s in seq]
    elapsed = YEARS[first] - balance
    rows = []
    cum = -elapsed
    for s, ln in zip(seq, lengths):
        b_start, cum = cum, cum + ln
        if cum <= 1e-9:
            continue
        e, age = date_after_birth(birth, cum)
        st = birth if b_start <= 0 else date_after_birth(birth, b_start)[0]
        rows.append({**_label(s), "start": _fmt(st), "end": _fmt(e), "age_ymd": list(age)})
    d_end, _ = date_after_birth(birth, balance)
    dashas.append({**_label(first), "years": YEARS[first], "balance_ymd": list(years_to_ymd(balance)),
                   "start": _fmt(birth), "end": _fmt(d_end), "bhuktis": rows})

    offset = balance
    for k in range(1, n_dasas):
        sg = dasa_signs[k]
        seq = _seq(direction, sg)
        total = sum(YEARS[s] for s in seq)
        start_off = offset
        bh = []
        for s in seq:
            b_start = offset
            offset += YEARS[sg] * YEARS[s] / total
            e, age = date_after_birth(birth, offset)
            bh.append({**_label(s), "start": _fmt(date_after_birth(birth, b_start)[0]),
                       "end": _fmt(e), "age_ymd": list(age)})
        dashas.append({**_label(sg), "years": YEARS[sg], "chain": _bhukti_chain(direction, SIGNS.index(sg))[0],
                       "start": _fmt(date_after_birth(birth, start_off)[0]), "end": bh[-1]["end"], "bhuktis": bh})

    return {"status": "ok", "direction": direction,
            "direction_ta": "வல ஓட்டு" if direction == "savya" else "இட ஓட்டு",
            "nakshatra": nak, "pada": pada, "first_sign": first,
            "dashas": dashas, "notes": []}
