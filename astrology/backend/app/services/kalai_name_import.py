"""
Import names from Kalai Magal baby-name PRINTOUTS into the site's name bank.

Requested by the owner: "use Kalai's database also". Kalai's Master.mdb is
encrypted and is NOT decrypted or read. Instead, the names Kalai prints in
its baby-name reports (PDFs the owner generates with the licensed software)
are parsed and added to the `baby_names` table with source='kalai'.

  • seed_kalai_names()  — loads app/data/kalai_names.json (2,738 names from the
                          printouts supplied so far); runs at start-up, idempotent.
  • import_printout(pdf_bytes) — parses any further Kalai baby-name printout
                          (TAB-encoded Tamil), adds new names, returns counts.
A name row: English name, Tamil name (TAB → Unicode, ர்/ரி ligature repair),
gender (from the printout header), religion 'hindu', syllable = Tamil first
letter, no meaning (Kalai prints none).
"""
from __future__ import annotations

import io
import json
import os
import re
from typing import Any, Dict, List

from backend.app.services import name_db

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "kalai_names.json")
_TAMIL_MARKS = set(chr(c) for c in list(range(0x0BBE, 0x0BCE)) + [0x0BD7])
_FIXES = (("£¢", "ர்"), ("ா¢", "ர்"), ("£¤", "ரி"), ("ா¤", "ரி"), ("£¦", "ரீ"), ("ா¦", "ரீ"), ("£", "ர"))


def tamil_first_letter(s: str) -> str:
    s = (s or "").strip()
    if not s:
        return ""
    out = s[0]
    for ch in s[1:]:
        if ch in _TAMIL_MARKS:
            out += ch
        else:
            break
    if s.startswith("ஸ்ரீ"):
        return "ஸ்ரீ"
    return out


def _fix(ta: str) -> str:
    for a, b in _FIXES:
        ta = ta.replace(a, b)
    return ta


def _insert(rows: List[Dict[str, str]]) -> Dict[str, int]:
    name_db.init_db()
    con = name_db._connect()
    try:
        before = con.execute("SELECT COUNT(*) AS c FROM baby_names").fetchone()["c"]
        # never add a name that already exists for that gender (no repeated names in lists)
        have = {(r["n"], r["g"]) for r in con.execute(
            "SELECT LOWER(name_english) AS n, gender AS g FROM baby_names")}
        n_candidates = len(rows)
        rows = [r for r in rows if (r["en"].lower(), r["gender"]) not in have]
        con.executemany(
            """INSERT OR IGNORE INTO baby_names
               (syllable, name_english, name_tamil, meaning_english, meaning_tamil, gender, religion, source)
               VALUES (?, ?, ?, '', '', ?, 'hindu', 'kalai')""",
            [(tamil_first_letter(r["ta"]) or r["en"][:1], r["en"], r["ta"], r["gender"]) for r in rows])
        try:
            con.execute("UPDATE baby_names SET starting_letter = UPPER(SUBSTR(name_english, 1, 1)) "
                        "WHERE source = 'kalai' AND (starting_letter IS NULL OR starting_letter = '')")
        except Exception:
            pass  # older databases without the starting_letter column
        con.commit()
        after = con.execute("SELECT COUNT(*) AS c FROM baby_names").fetchone()["c"]
        return {"candidates": n_candidates, "added": after - before, "rows_in_table": after}
    finally:
        con.close()


def remove_duplicate_kalai_rows() -> int:
    """Delete Kalai rows whose English name already exists (same gender) from
    another source or an earlier Kalai row — keeps every name listed once."""
    con = name_db._connect()
    try:
        cur = con.execute(
            """DELETE FROM baby_names WHERE source = 'kalai' AND id NOT IN (
                   SELECT MIN(id) FROM baby_names GROUP BY LOWER(name_english), gender)""")
        con.commit()
        return cur.rowcount
    finally:
        con.close()


def seed_kalai_names() -> Dict[str, int]:
    if not os.path.exists(DATA_FILE):
        return {"candidates": 0, "added": 0}
    name_db.init_db()
    remove_duplicate_kalai_rows()
    with open(DATA_FILE, encoding="utf-8") as fh:
        rows = json.load(fh)["names"]
    return _insert(rows)


def parse_printout_text(text_unicode: str) -> List[Dict[str, str]]:
    gender = "girl" if re.search(r"ஆண் / பெண்\s*:\s*பெண்", text_unicode) else "boy"
    out, seen = [], set()
    for m in re.finditer(r"^((?:[A-Z]\.\s?)*)([A-Z]+) (\d+) ((?:[A-Z]\.\s?)*)(.+)$", text_unicode, re.M):
        en = m.group(2).title()
        ta = _fix(re.sub(r"^([A-Z]\.\s?)+", "", m.group(5)).strip())
        if (en, gender) in seen or re.search(r"[\u0080-\u00ff]", ta):
            continue
        seen.add((en, gender))
        out.append({"en": en, "ta": ta, "gender": gender})
    return out


def import_printout(pdf_bytes: bytes) -> Dict[str, Any]:
    try:
        import pdfplumber
        from tamil.txt2unicode import tab2unicode
    except ImportError as exc:  # pragma: no cover
        raise ValueError("Install pdfplumber and open-tamil (see requirements.txt)") from exc
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        raw = "\n".join((p.extract_text() or "") for p in pdf.pages)
    rows = parse_printout_text(tab2unicode(raw))
    if not rows:
        raise ValueError("No Kalai baby-name rows found in this PDF")
    return _insert(rows)
