"""
SQLite-backed baby-name store.

WHY THIS FILE EXISTS
--------------------
The names were living in Python dicts. This moves them into a real table in
the existing jathagam.db so they can be queried with SQL
(`ORDER BY RANDOM() LIMIT n`), and so a larger real dataset can be dropped in
later without touching any application code.

WHAT IT IS NOT
--------------
It does not invent names. The table is seeded from the SAME verified entries
already in backend/app/services/baby_name_bank*.py — every one a name that is
actually in use with the meaning it is actually given. `import_csv()` is the
door for a bigger REAL dataset; there is deliberately no generator.

IMPORTANT ABOUT COUNTS
----------------------
`ORDER BY RANDOM() LIMIT 150` returns min(150, matching rows). It cannot
manufacture rows. If a syllable has 26 real names, the query returns 26. The
way to get 150 is more rows in the table — see import_csv().

Schema (table `baby_names`):
    id               INTEGER PRIMARY KEY
    syllable         TEXT    -- Nakshatra-pada starting syllable, e.g. "Ku"
    name_english     TEXT
    name_tamil       TEXT
    meaning_english  TEXT
    meaning_tamil    TEXT
    gender           TEXT    -- "boy" | "girl"
    religion         TEXT    -- "hindu" | "christian" | "muslim"
    source           TEXT    -- where the row came from, for auditing
UNIQUE(syllable, name_english) keeps re-seeding idempotent.
"""

import csv
import os
import sqlite3
from typing import Any, Dict, List, Optional, Tuple

# Same database file the rest of the app already uses.
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))), "jathagam.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS baby_names (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    syllable        TEXT NOT NULL,
    name_english    TEXT NOT NULL,
    name_tamil      TEXT NOT NULL DEFAULT '',
    meaning_english TEXT NOT NULL DEFAULT '',
    meaning_tamil   TEXT NOT NULL DEFAULT '',
    gender          TEXT NOT NULL DEFAULT 'boy',
    religion        TEXT NOT NULL DEFAULT 'hindu',
    source          TEXT NOT NULL DEFAULT 'bank',
    UNIQUE (syllable, name_english)
);
CREATE INDEX IF NOT EXISTS idx_baby_names_syllable ON baby_names (syllable);
CREATE INDEX IF NOT EXISTS idx_baby_names_filters  ON baby_names (syllable, gender, religion);
"""


def _connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init_db() -> None:
    con = _connect()
    try:
        con.executescript(SCHEMA)
        _migrate_starting_letter(con)
        con.commit()
    finally:
        con.close()


def _migrate_starting_letter(con: sqlite3.Connection) -> None:
    """Adds `starting_letter` (A-Z) and backfills it from name_english.

    Written as an idempotent ALTER rather than a table rebuild so the
    existing Nakshatra-Pada feature keeps working untouched — the two
    features read the same rows through different columns: the Jathagam
    path filters on `syllable`, the General generator on `starting_letter`.
    """
    cols = {row["name"] for row in con.execute("PRAGMA table_info(baby_names)")}
    if "starting_letter" not in cols:
        con.execute("ALTER TABLE baby_names ADD COLUMN starting_letter TEXT")

    # Backfill anything missing. UPPER(SUBSTR(...)) is done in SQL so this
    # stays correct for rows added later by CSV import.
    con.execute(
        """UPDATE baby_names
           SET starting_letter = UPPER(SUBSTR(TRIM(name_english), 1, 1))
           WHERE starting_letter IS NULL OR starting_letter = ''"""
    )
    # Created here, not in SCHEMA: the column has to exist first, otherwise
    # init_db() throws "no such column" on every database seeded before this
    # migration shipped.
    con.execute(
        "CREATE INDEX IF NOT EXISTS idx_baby_names_letter "
        "ON baby_names (starting_letter, gender)"
    )


def fetch_by_letter(
    letter: str,
    gender: Optional[str] = None,
    limit: int = 200,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """General Baby Name Generator: every real name starting with `letter`.

    Ordered alphabetically (not randomly) — this is a browsable A-Z list, so
    a stable order is what a parent scanning the page expects.
    """
    init_db()
    letter = (letter or "").strip().upper()[:1]
    if not letter.isalpha():
        return []

    limit = max(1, min(int(limit or 200), 500))

    where = ["starting_letter = ?"]
    params: List[Any] = [letter]

    g = (gender or "").strip().lower()
    if g in ("boy", "male", "m"):
        where.append("gender = ?")
        params.append("boy")
    elif g in ("girl", "female", "f"):
        where.append("gender = ?")
        params.append("girl")
    elif g in ("unisex", "u"):
        where.append("gender = ?")
        params.append("unisex")

    # Free-text search within the chosen letter, matched against either script.
    q = (search or "").strip()
    if q:
        where.append("(name_english LIKE ? OR name_tamil LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])

    sql = f"""
        SELECT MIN(id)               AS id,
               name_english          AS name_en,
               MIN(name_tamil)       AS name_ta,
               MIN(meaning_english)  AS meaning_en,
               MIN(meaning_tamil)    AS meaning_ta,
               MIN(gender)           AS gender,
               MIN(starting_letter)  AS starting_letter
        FROM baby_names
        WHERE {' AND '.join(where)}
        GROUP BY LOWER(TRIM(name_english))
        ORDER BY name_english COLLATE NOCASE ASC
        LIMIT ?
    """
    params.append(limit)

    con = _connect()
    try:
        return [dict(r) for r in con.execute(sql, params)]
    finally:
        con.close()


# ── Zodiac (Rasi) browsing ───────────────────────────────────────────────
# A Rasi spans 9 Nakshatra padas, and each pada carries its own naming
# syllable — this is the standard Rasi/Nakshatra-pada division used in every
# Tamil panchangam, not something invented here. Browsing by zodiac sign
# therefore means: take that sign's padas, take their syllables, return the
# names that start with them. Same rows as the A-Z browse, selected the
# classical way.
RASI_NAKSHATRA_PADAS: Dict[int, List[Tuple[str, List[int]]]] = {
    1:  [("Ashwini", [1, 2, 3, 4]), ("Bharani", [1, 2, 3, 4]), ("Krittika", [1])],
    2:  [("Krittika", [2, 3, 4]), ("Rohini", [1, 2, 3, 4]), ("Mrigashirsha", [1, 2])],
    3:  [("Mrigashirsha", [3, 4]), ("Ardra", [1, 2, 3, 4]), ("Punarvasu", [1, 2, 3])],
    4:  [("Punarvasu", [4]), ("Pushya", [1, 2, 3, 4]), ("Ashlesha", [1, 2, 3, 4])],
    5:  [("Magha", [1, 2, 3, 4]), ("Purva Phalguni", [1, 2, 3, 4]), ("Uttara Phalguni", [1])],
    6:  [("Uttara Phalguni", [2, 3, 4]), ("Hasta", [1, 2, 3, 4]), ("Chitra", [1, 2])],
    7:  [("Chitra", [3, 4]), ("Swati", [1, 2, 3, 4]), ("Vishakha", [1, 2, 3])],
    8:  [("Vishakha", [4]), ("Anuradha", [1, 2, 3, 4]), ("Jyeshtha", [1, 2, 3, 4])],
    9:  [("Moola", [1, 2, 3, 4]), ("Purva Ashadha", [1, 2, 3, 4]), ("Uttara Ashadha", [1])],
    10: [("Uttara Ashadha", [2, 3, 4]), ("Shravana", [1, 2, 3, 4]), ("Dhanishta", [1, 2])],
    11: [("Dhanishta", [3, 4]), ("Shatabhisha", [1, 2, 3, 4]), ("Purva Bhadrapada", [1, 2, 3])],
    12: [("Purva Bhadrapada", [4]), ("Uttara Bhadrapada", [1, 2, 3, 4]), ("Revati", [1, 2, 3, 4])],
}

RASI_LABELS: Dict[int, Tuple[str, str]] = {
    1: ("Mesha", "மேஷம்"), 2: ("Vrishabha", "ரிஷபம்"), 3: ("Mithuna", "மிதுனம்"),
    4: ("Karkataka", "கடகம்"), 5: ("Simha", "சிம்மம்"), 6: ("Kanya", "கன்னி"),
    7: ("Tula", "துலாம்"), 8: ("Vrischika", "விருச்சிகம்"), 9: ("Dhanus", "தனுசு"),
    10: ("Makara", "மகரம்"), 11: ("Kumbha", "கும்பம்"), 12: ("Meena", "மீனம்"),
}


def syllables_for_rasi(rasi: int) -> List[Dict[str, Any]]:
    """The naming syllables that belong to a zodiac sign, via its padas."""
    from backend.app.services.baby_names import (
        NAKSHATRA_PADA_SYLLABLES, NAKSHATRA_PADA_SYLLABLES_TA,
    )
    out: List[Dict[str, Any]] = []
    for nak, padas in RASI_NAKSHATRA_PADAS.get(int(rasi), []):
        syl = NAKSHATRA_PADA_SYLLABLES.get(nak, [])
        syl_ta = NAKSHATRA_PADA_SYLLABLES_TA.get(nak, [])
        for p in padas:
            i = p - 1
            if i < len(syl):
                out.append({
                    "nakshatra": nak, "pada": p,
                    "syllable": syl[i],
                    "syllable_ta": syl_ta[i] if i < len(syl_ta) else syl[i],
                })
    return out


def fetch_by_rasi(
    rasi: int,
    gender: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 60,
) -> Dict[str, Any]:
    """Names belonging to a zodiac sign, grouped by its naming syllables."""
    mapping = syllables_for_rasi(rasi)
    if not mapping:
        return {"rasi": rasi, "syllables": [], "count": 0, "names": []}

    seen_syl: List[str] = []
    for m in mapping:
        if m["syllable"] not in seen_syl:
            seen_syl.append(m["syllable"])

    rows = fetch_by_syllables(seen_syl, gender=gender, search=search, limit=limit)
    en, ta = RASI_LABELS.get(int(rasi), ("", ""))
    return {
        "rasi": int(rasi), "rasi_en": en, "rasi_ta": ta,
        "syllables": mapping,
        "count": len(rows),
        "available_count": count_names(seen_syl, gender=gender),
        "names": rows,
    }


def fetch_by_syllables(
    syllables: List[str],
    gender: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 60,
) -> List[Dict[str, Any]]:
    """Distinct names for a set of syllables, optional free-text search."""
    if not syllables:
        return []
    limit = max(1, min(int(limit or 60), 500))

    where = ["syllable IN (%s)" % ",".join("?" for _ in syllables)]
    params: List[Any] = list(syllables)

    g = (gender or "").strip().lower()
    if g in ("boy", "male", "m"):
        where.append("gender = ?"); params.append("boy")
    elif g in ("girl", "female", "f"):
        where.append("gender = ?"); params.append("girl")

    q = (search or "").strip()
    if q:
        where.append("(name_english LIKE ? OR name_tamil LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])

    sql = f"""
        SELECT MIN(id) AS id,
               name_english         AS name_en,
               MIN(name_tamil)      AS name_ta,
               MIN(meaning_english) AS meaning_en,
               MIN(meaning_tamil)   AS meaning_ta,
               MIN(gender)          AS gender,
               MIN(syllable)        AS syllable
        FROM baby_names
        WHERE {' AND '.join(where)}
        GROUP BY LOWER(TRIM(name_english))
        ORDER BY name_english COLLATE NOCASE
        LIMIT ?
    """
    params.append(limit)
    con = _connect()
    try:
        return [dict(r) for r in con.execute(sql, params)]
    finally:
        con.close()


def letter_counts(gender: Optional[str] = None) -> Dict[str, int]:
    """How many real names exist per letter, so the A-Z grid can grey out
    letters that genuinely have nothing behind them instead of offering a
    button that returns an empty list."""
    init_db()
    where = ["starting_letter IS NOT NULL"]
    params: List[Any] = []
    g = (gender or "").strip().lower()
    if g in ("boy", "male", "m"):
        where.append("gender = ?")
        params.append("boy")
    elif g in ("girl", "female", "f"):
        where.append("gender = ?")
        params.append("girl")
    elif g in ("unisex", "u"):
        where.append("gender = ?")
        params.append("unisex")

    con = _connect()
    try:
        sql = f"""SELECT starting_letter AS l,
                         COUNT(DISTINCT LOWER(TRIM(name_english))) AS c
                  FROM baby_names WHERE {' AND '.join(where)}
                  GROUP BY starting_letter"""
        return {r["l"]: r["c"] for r in con.execute(sql, params) if r["l"]}
    finally:
        con.close()


def seed_from_banks(force: bool = False) -> Dict[str, Any]:
    """Loads the verified Python banks into the table. Idempotent.

    Runs once at startup. Existing rows are left alone unless force=True,
    so anything imported from a CSV is never clobbered by a re-seed.
    """
    from backend.app.services.baby_names import _merged_database

    init_db()
    con = _connect()
    try:
        if force:
            con.execute("DELETE FROM baby_names WHERE source = 'bank'")

        rows: List[tuple] = []
        for syllable, entries in _merged_database().items():
            for e in entries:
                rows.append((
                    syllable,
                    e.get("name", ""),
                    e.get("name_ta", ""),
                    e.get("meaning", ""),
                    e.get("meaning_ta", ""),
                    e.get("gender", "boy"),
                    e.get("religion", "hindu"),
                    "bank",
                ))

        # UPSERT, not INSERT OR IGNORE. A plain ignore would leave rows that
        # already exist untouched, so corrected meanings would never reach an
        # installation that had seeded before — the table would silently keep
        # the old text. Only rows this seeder owns (source='bank') are
        # refreshed; CSV-imported rows are never overwritten.
        con.executemany(
            """INSERT INTO baby_names
               (syllable, name_english, name_tamil, meaning_english,
                meaning_tamil, gender, religion, source)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(syllable, name_english) DO UPDATE SET
                   name_tamil      = excluded.name_tamil,
                   meaning_english = excluded.meaning_english,
                   meaning_tamil   = excluded.meaning_tamil,
                   gender          = excluded.gender,
                   religion        = excluded.religion
               WHERE baby_names.source = 'bank'""",
            rows,
        )
        con.commit()
        total = con.execute("SELECT COUNT(*) AS c FROM baby_names").fetchone()["c"]
        return {"seeded_candidates": len(rows), "rows_in_table": total}
    finally:
        con.close()


def import_csv(path: str, source: str = "csv") -> Dict[str, Any]:
    """Bulk-loads a REAL dataset. This is how the table grows past what the
    Python banks hold.

    Expected header (extra columns ignored):
        syllable,name_english,name_tamil,meaning_english,meaning_tamil,gender,religion

    Rows missing `syllable` or `name_english` are skipped and counted, never
    guessed at. Duplicates are ignored, so re-running is safe.
    """
    init_db()
    con = _connect()
    inserted = skipped = 0
    try:
        with open(path, newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            batch: List[tuple] = []
            for row in reader:
                syllable = (row.get("syllable") or "").strip()
                name_en = (row.get("name_english") or "").strip()
                if not syllable or not name_en:
                    skipped += 1
                    continue
                batch.append((
                    syllable,
                    name_en,
                    (row.get("name_tamil") or "").strip(),
                    (row.get("meaning_english") or "").strip(),
                    (row.get("meaning_tamil") or "").strip(),
                    (row.get("gender") or "boy").strip().lower(),
                    (row.get("religion") or "hindu").strip().lower(),
                    source,
                ))
            cur = con.executemany(
                """INSERT OR IGNORE INTO baby_names
                   (syllable, name_english, name_tamil, meaning_english,
                    meaning_tamil, gender, religion, source)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                batch,
            )
            inserted = cur.rowcount if cur.rowcount and cur.rowcount > 0 else 0
        con.commit()
        total = con.execute("SELECT COUNT(*) AS c FROM baby_names").fetchone()["c"]
        return {"inserted": inserted, "skipped": skipped, "rows_in_table": total}
    finally:
        con.close()


def fetch_names(
    syllables: List[str],
    gender: Optional[str] = None,
    religion: Optional[str] = None,
    limit: int = 150,
) -> List[Dict[str, Any]]:
    """Fetches up to `limit` real rows for the given starting syllables.

    ORDER BY RANDOM() so a fresh mix comes back each time. Note again: this
    returns min(limit, matching rows) — it cannot invent rows that are not
    in the table.
    """
    if not syllables:
        return []

    limit = max(1, min(int(limit or 150), 500))

    where = ["syllable IN (%s)" % ",".join("?" for _ in syllables)]
    params: List[Any] = list(syllables)

    g = (gender or "").strip().lower()
    if g in ("boy", "male", "m"):
        where.append("gender = ?")
        params.append("boy")
    elif g in ("girl", "female", "f"):
        where.append("gender = ?")
        params.append("girl")

    r = (religion or "").strip().lower()
    if r and r not in ("all", "any"):
        where.append("religion = ?")
        params.append(r)

    sql = f"""
        SELECT syllable, name_english, name_tamil,
               meaning_english, meaning_tamil, gender, religion
        FROM baby_names
        WHERE {' AND '.join(where)}
        ORDER BY RANDOM()
        LIMIT ?
    """
    params.append(limit)

    con = _connect()
    try:
        return [dict(row) for row in con.execute(sql, params)]
    finally:
        con.close()


def count_names(
    syllables: List[str],
    gender: Optional[str] = None,
    religion: Optional[str] = None,
) -> int:
    """How many rows actually match — so the UI can state the true number
    available rather than implying the requested limit was met."""
    if not syllables:
        return 0
    where = ["syllable IN (%s)" % ",".join("?" for _ in syllables)]
    params: List[Any] = list(syllables)

    g = (gender or "").strip().lower()
    if g in ("boy", "male", "m"):
        where.append("gender = ?")
        params.append("boy")
    elif g in ("girl", "female", "f"):
        where.append("gender = ?")
        params.append("girl")

    r = (religion or "").strip().lower()
    if r and r not in ("all", "any"):
        where.append("religion = ?")
        params.append(r)

    con = _connect()
    try:
        sql = f"SELECT COUNT(*) AS c FROM baby_names WHERE {' AND '.join(where)}"
        return int(con.execute(sql, params).fetchone()["c"])
    finally:
        con.close()


def db_stats() -> Dict[str, Any]:
    """Real, countable coverage of the table."""
    init_db()
    con = _connect()
    try:
        total = con.execute("SELECT COUNT(*) AS c FROM baby_names").fetchone()["c"]
        by_rel = {r["religion"]: r["c"] for r in con.execute(
            "SELECT religion, COUNT(*) AS c FROM baby_names GROUP BY religion")}
        by_gen = {r["gender"]: r["c"] for r in con.execute(
            "SELECT gender, COUNT(*) AS c FROM baby_names GROUP BY gender")}
        syllables = con.execute(
            "SELECT COUNT(DISTINCT syllable) AS c FROM baby_names").fetchone()["c"]
        thin = [dict(r) for r in con.execute(
            """SELECT syllable, COUNT(*) AS c FROM baby_names
               GROUP BY syllable HAVING c < 10 ORDER BY c ASC LIMIT 20""")]
        return {
            "db_path": DB_PATH,
            "total_rows": total,
            "distinct_syllables": syllables,
            "by_religion": by_rel,
            "by_gender": by_gen,
            # The syllables that keep a generation under 150, named openly.
            "thin_syllables": thin,
        }
    finally:
        con.close()
