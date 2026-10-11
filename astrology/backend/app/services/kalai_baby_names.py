"""
Baby names — Kalai Magal parity (Phase 8).

Kalai's "Baby Names" menu (7 report types) combines two filters:
  • STAR letters — the first letter of the name for the child's nakshatra
    (classical Tamil nama-nakshatra letters; Kalai adds extra letters in
    brackets for some stars, e.g. Punarpoosam "கே - கோ - ஹ - ஹி - (கெ - கை - இ)").
  • NUMEROLOGY — the Chaldean total of the name (Kalai letter table, identical
    to ours) must be one of the allowed name numbers for the birth date.
    A name is listed as "INITIAL.NAME total" when the total WITH the initials
    qualifies, and as a bare "NAME total" when the name alone qualifies.

Date number = digital root of the day; destiny ("தேதியின் கூட்டு எண்") = digital
root of the full date. Allowed name numbers come from a Kalai table keyed by
(date number, destiny number). The 9 pairs seen in Kalai printouts are
reproduced exactly (ALLOWED_KALAI, 56 of the 81 pairs); other pairs use the union of the root
groups Kalai prints for the date and destiny numbers, flagged `verified: false`.

The names themselves come from this project's own name bank (baby_names table);
Kalai's name database is not copied.
"""
from __future__ import annotations

import sqlite3
from datetime import date
from typing import Any, Dict, List, Optional, Tuple

from backend.app.services.numerology import _CHALDEAN_CHART
from backend.app.services.kalai_name_import import tamil_first_letter

# (date number, destiny number) -> allowed name totals, exactly as Kalai prints them
ALLOWED_KALAI: Dict[Tuple[int, int], List[int]] = {
    (1, 2): [15, 24, 33, 42, 69],                                   # baby_names.pdf
    (6, 3): [19, 37, 46, 64, 27, 36, 45],                           # package report (Moolam)
    (4, 8): [19, 37, 46, 15, 33, 42, 51, 14, 23, 32, 41, 50],       # REF-001
    (1, 3): [19, 37, 46, 64],                                       # T04
    (7, 3): [14, 23, 32, 41, 50, 59, 77, 21, 39],                   # single_page.pdf
    (7, 2): [15, 24, 33, 42, 51, 69, 38, 47],                       # BN1
    (4, 6): [19, 37, 46, 73, 15, 24, 33, 42, 60, 69],               # BN2
    (9, 7): [6, 15, 24, 33, 42, 14, 23, 32, 41, 50],                # BN3
    (2, 5): [14, 23, 32, 41, 50, 6, 15, 24, 33, 42],                # BN4
    # KALAI_ASTRO archive (36 baby-name printouts)
    (9, 6): [27, 36, 45, 15, 24, 33, 42, 51, 60, 69],
    (5, 1): [14, 23, 32, 41, 50, 59, 19, 37, 46, 64],
    (4, 1): [10, 19, 37, 46, 15, 24, 33, 42, 51, 60],
    (2, 9): [15, 24, 33, 42, 51, 14, 23, 32, 41, 50],
    (8, 4): [14, 23, 41, 50, 15, 24, 33, 42, 51, 19, 37, 46],
    (7, 5): [14, 23, 32, 41, 50, 59, 15, 24, 33, 42],
    # name-number lines printed on the KALAI_ASTRO horoscope / single-page reports
    (1, 4): [19, 37, 46, 64, 15, 24, 33, 42, 60, 69],
    (1, 5): [19, 37, 46, 64, 14, 23, 32, 41, 59, 77],
    (1, 9): [19, 37, 46, 64, 27, 45, 15, 24, 42, 69],
    (2, 1): [15, 24, 33, 42, 51, 60, 69],
    (2, 3): [14, 23, 41, 50, 59, 21, 39],
    (2, 4): [15, 24, 33, 42, 60, 69],
    (2, 6): [15, 24, 33, 42, 68],
    (2, 7): [15, 24, 33, 42, 51, 69, 34, 43],
    (2, 8): [6, 24, 33, 42, 51, 14, 23, 32, 41, 50],
    (3, 2): [21, 39, 14, 23, 41, 50, 59],
    (3, 4): [21, 39, 19, 37, 46, 64],
    (3, 5): [21, 39, 14, 23, 41, 50],
    (3, 7): [21, 39, 14, 23, 32, 41, 50, 59, 77],
    (3, 8): [21, 39, 14, 23, 32, 41, 50, 59, 19, 37, 46],
    (4, 2): [15, 24, 33, 42, 51, 60, 19, 37, 46, 64],
    (4, 3): [10, 19, 37, 46, 64, 73],
    (4, 4): [10, 19, 37, 46, 15, 24, 33, 42, 51, 60],
    (4, 5): [19, 37, 46, 15, 24, 33, 42, 51, 14, 23, 32, 41],
    (4, 9): [15, 24, 33, 42, 51, 19, 37, 46, 14, 23, 32, 41],
    (5, 2): [14, 23, 32, 41, 59, 77],
    (5, 3): [14, 23, 32, 41, 50, 59, 77, 21, 39],
    (5, 8): [14, 23, 32, 41, 50, 6, 15, 24, 33, 42],
    (5, 9): [14, 23, 32, 41, 50, 59, 77, 27, 36, 45],
    (6, 2): [15, 24, 33, 42, 60, 69],
    (6, 7): [19, 37, 46, 64, 15, 24, 33, 42, 60, 69],
    (6, 9): [15, 24, 33, 42, 60, 69, 27, 36, 45, 51],
    (7, 1): [15, 24, 33, 42, 51, 60, 19, 37, 46, 64],
    (7, 4): [15, 24, 33, 42, 51, 60, 69],
    (7, 7): [15, 24, 33, 42, 51, 14, 23, 32, 41, 50, 38, 47],
    (7, 8): [15, 24, 33, 42, 51, 14, 23, 32, 41, 50],
    (8, 1): [14, 23, 41, 50, 15, 24, 33, 42, 51, 19, 37, 46],
    (8, 2): [14, 23, 32, 41, 50, 15, 24, 33, 42, 51],
    (8, 3): [14, 23, 32, 41, 50, 59, 77],
    (8, 6): [23, 41, 50, 24, 33, 42, 51, 19, 37, 46],
    (8, 9): [14, 23, 32, 41, 50, 15, 24, 33, 42, 51],
    (9, 1): [27, 45, 19, 46, 15, 24, 42, 51, 14, 23, 41, 50],
    (9, 2): [6, 15, 24, 33, 42, 14, 23, 32, 41, 50],
    (9, 3): [14, 23, 32, 41, 50, 21, 39, 27, 36, 45],
    (9, 4): [27, 36, 45, 19, 37, 46, 15, 24, 42, 51, 14, 50],
    (9, 5): [14, 23, 32, 41, 50, 59, 77, 27, 36, 45],
    (9, 8): [14, 23, 41, 50, 27, 36, 45, 15, 24, 33, 42, 51],
}
# compound numbers Kalai prints for each root: union of every list above (used
# only for (date, destiny) pairs that no Kalai printout has shown yet)
def _root_groups() -> Dict[int, List[int]]:
    out: Dict[int, List[int]] = {}
    for nums in ALLOWED_KALAI.values():
        for x in nums:
            r = x
            while r > 9:
                r = sum(int(c) for c in str(r))
            if x not in out.setdefault(r, []):
                out[r].append(x)
    return {r: sorted(v) for r, v in out.items()}


ROOT_GROUPS: Dict[int, List[int]] = _root_groups()

# Classical Tamil nama-nakshatra letters (padas 1-4) + Kalai's bracketed extras where seen
STAR_LETTERS: Dict[int, Dict[str, List[str]]] = {
    1: {"main": ["சு", "சே", "சோ", "லா"]}, 2: {"main": ["லி", "லு", "லே", "லோ"]},
    3: {"main": ["அ", "இ", "உ", "ஏ"]}, 4: {"main": ["ஒ", "வ", "வி", "வு"]},
    5: {"main": ["வே", "வோ", "கா", "கி"], "extra": ["வை", "வெ"]}, 6: {"main": ["கு", "க", "ஞ", "ச"]},
    7: {"main": ["கே", "கோ", "ஹ", "ஹி"], "extra": ["கெ", "கை", "இ"]},
    8: {"main": ["ஹு", "ஹே", "ஹோ", "ட"]}, 9: {"main": ["தே", "டி", "டு", "டே"], "extra": ["டோ", "மெ", "மை", "மே", "தி", "து"]},
    10: {"main": ["ம", "மி", "மு", "மெ"], "extra": ["மா", "மீ", "மூ"]}, 11: {"main": ["மோ", "ட", "டி", "டு"], "extra": ["மௌ", "த", "தி", "து"]},
    12: {"main": ["டே", "டோ", "ப", "பி"]}, 13: {"main": ["பு", "ஷ", "ந", "ட"]},
    14: {"main": ["பே", "போ", "ர", "ரி"]}, 15: {"main": ["ரு", "ரே", "ரோ", "தா"]},
    16: {"main": ["தி", "து", "தே", "தோ"], "extra": ["தூ", "தை", "தீ", "தெ"]}, 17: {"main": ["ந", "நி", "நு", "நெ"]},
    18: {"main": ["நோ", "ய", "யி", "யு"]}, 19: {"main": ["யே", "யோ", "ப", "பி"]},
    20: {"main": ["பு", "த", "ப", "ட"]}, 21: {"main": ["பே", "போ", "ஜ", "ஜி"]},
    22: {"main": ["ஜூ", "ஜே", "ஜோ", "கா"], "extra": ["க"]}, 23: {"main": ["க", "கி", "கு", "கெ"]},
    24: {"main": ["கோ", "ஸ", "ஸி", "ஸு"]}, 25: {"main": ["ஸே", "ஸோ", "த", "தி"]},
    26: {"main": ["து", "ஞ", "ச", "ஸ்ரீ"]}, 27: {"main": ["தே", "தோ", "ச", "சி"]},
}
STAR_LETTERS_SEEN = {5, 6, 7, 9, 10, 11, 16, 19, 22, 26}

REPORT_TYPES = ["single_star_letter", "single_numerology_no", "star_letters", "numerology_numbers",
                "single_star_letter_numerology", "single_numerology_no_star", "star_numerology"]


def digital_root(n: int) -> int:
    while n > 9:
        n = sum(int(c) for c in str(n))
    return n


def date_numbers(d: date) -> Tuple[int, int]:
    dn = digital_root(d.day)
    total = sum(int(c) for c in d.strftime("%d%m%Y"))
    return dn, digital_root(total)


def allowed_numbers(dn: int, sn: int) -> Tuple[List[int], bool]:
    if (dn, sn) in ALLOWED_KALAI:
        return ALLOWED_KALAI[(dn, sn)], True
    out: List[int] = []
    for r in (dn, sn):
        for x in ROOT_GROUPS.get(r, []):
            if x not in out:
                out.append(x)
    return out, False


def chaldean(text: str) -> int:
    return sum(_CHALDEAN_CHART.get(ch, 0) for ch in text.upper() if ch.isalpha())


def star_letters(nak: int) -> Dict[str, Any]:
    s = STAR_LETTERS[nak]
    main, extra = s["main"], s.get("extra", [])
    text = " - ".join(main) + (f" - ( {' - '.join(extra)} )" if extra else "")
    return {"letters": main + extra, "display": text, "verified": nak in STAR_LETTERS_SEEN}


def _all_names(db_path: str, gender: Optional[str], religion: Optional[str]) -> List[Dict[str, Any]]:
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    where, params = [], []
    g = (gender or "").lower()
    if g in ("boy", "male", "m"):
        where.append("gender IN ('boy','unisex')")
    elif g in ("girl", "female", "f"):
        where.append("gender IN ('girl','unisex')")
    if religion:
        where.append("religion = ?")
        params.append(religion.lower())
    sql = "SELECT * FROM baby_names" + (" WHERE " + " AND ".join(where) if where else "")
    rows = [dict(r) for r in con.execute(sql, params)]
    con.close()
    return rows


def kalai_baby_names(report_type: str, sex: str, birth_date: date, star: Optional[int] = None,
                     first_letter: Optional[str] = None, numerology_no: Optional[int] = None,
                     initials: Optional[List[str]] = None, religion: Optional[str] = "hindu",
                     db_path: Optional[str] = None, limit: int = 2000) -> Dict[str, Any]:
    if report_type not in REPORT_TYPES:
        raise ValueError(f"report_type must be one of {REPORT_TYPES}")
    dn, sn = date_numbers(birth_date)
    allowed, allowed_verified = allowed_numbers(dn, sn)
    initials = [i.strip().upper() for i in (initials or []) if i and i.strip()]
    init_prefix = "".join(f"{i}." for i in initials)
    init_total = sum(chaldean(i) for i in initials)

    letters: List[str] = []
    sl = None
    if star:
        sl = star_letters(star)
    if report_type in ("single_star_letter", "single_star_letter_numerology"):
        letters = [first_letter] if first_letter else (sl["letters"] if sl else [])
    elif report_type in ("star_letters", "star_numerology", "single_numerology_no_star"):
        letters = sl["letters"] if sl else []
    use_numbers: Optional[List[int]] = None
    if report_type in ("single_numerology_no", "single_numerology_no_star"):
        use_numbers = [int(numerology_no)] if numerology_no else []
    elif report_type in ("numerology_numbers", "single_star_letter_numerology", "star_numerology"):
        use_numbers = allowed

    if db_path is None:
        from backend.app.services import name_db
        db_path = getattr(name_db, "DB_PATH", None) or getattr(name_db, "_DB_PATH", None)
    rows = _all_names(db_path, sex, religion)
    out: List[Dict[str, Any]] = []
    listed = set()
    for r in sorted(rows, key=lambda x: (x.get("name_english") or x.get("name_en") or x.get("name") or "").upper()):
        en = (r.get("name_english") or r.get("name_en") or r.get("name") or "").strip()
        ta = (r.get("name_tamil") or r.get("name_ta") or "").strip()
        if not en:
            continue
        # Kalai matches the whole first letter (grapheme): "ச" lists சக்ரபாணி but not சைதன்யா
        if letters and tamil_first_letter(ta) not in letters:
            continue
        plain = chaldean(en)
        cand = []
        if use_numbers is None:
            cand.append(("plain", plain))
        else:
            if initials and (plain + init_total) in use_numbers:
                cand.append(("with_initials", plain + init_total))
            if plain in use_numbers:
                cand.append(("plain", plain))
        for kind, tot in cand:
            key = (en.upper(), kind)
            if key in listed:          # same name from two sources/syllables: list once
                continue
            listed.add(key)
            out.append({"name_en": (init_prefix + en.upper()) if kind == "with_initials" else en.upper(),
                        "name_ta": (init_prefix + ta) if kind == "with_initials" else ta,
                        "total": tot, "with_initials": kind == "with_initials",
                        "meaning_en": r.get("meaning_english") or r.get("meaning_en"),
                        "meaning_ta": r.get("meaning_tamil") or r.get("meaning_ta")})
        if len(out) >= limit:
            break
    return {
        "report_type": report_type, "sex": sex, "birth_date": birth_date.isoformat(),
        "date_number": dn, "destiny_number": sn,
        "allowed_numbers": allowed, "allowed_verified": allowed_verified,
        "star": star, "star_letters": sl, "first_letter": first_letter, "numerology_no": numerology_no,
        "initials": initials, "letter_table": dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                                                       [_CHALDEAN_CHART.get(c, 0) for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ"])),
        "names": out, "count": len(out),
    }
