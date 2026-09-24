"""
General Baby Name Generator — browse every real name by starting letter.

RELATIONSHIP TO THE EXISTING FEATURE
------------------------------------
The Baby Birth Details feature selects names by the classical Nakshatra-Pada
syllable of the baby's Moon. This one has nothing to do with the chart: it is
a plain A-Z browse for parents who just want to look through names.

Both read the SAME `baby_names` rows, through different columns — `syllable`
for the Jathagam path, `starting_letter` here. One table, two ways in. A
second table would have duplicated every name and made "no repeating names"
impossible to guarantee across the two features.

NO GENERATED DATA
-----------------
Every row returned is an existing row. There is no generator, no fallback
that invents a name when a letter is empty, and no placeholder meaning. If a
letter has nothing behind it the response says so and returns an empty list.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from backend.app.services import name_db

router = APIRouter(prefix="/general-names", tags=["general-names"])

VALID_GENDERS = {"boy", "girl", "unisex", "male", "female", "all", "any", ""}


@router.get("")
def general_names(
    letter: str = Query(..., min_length=1, max_length=1,
                        description="Starting letter, A-Z"),
    gender: Optional[str] = Query(None,
                                  description="boy | girl | unisex; omit for all"),
    limit: int = Query(60, ge=1, le=500,
                       description="Max rows. Returns min(limit, matching rows)."),
    search: Optional[str] = Query(None, description="Free text, either script"),
):
    """Up to `limit` real names starting with `letter`.

    Returns `name_en`, `name_ta`, `meaning_en`, `meaning_ta`, `gender` and
    `starting_letter` per row, alphabetically ordered and de-duplicated.
    """
    letter = (letter or "").strip().upper()
    if not letter.isalpha():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="`letter` must be a single letter A-Z.",
        )

    g = (gender or "").strip().lower()
    if g not in VALID_GENDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"`gender` must be one of: boy, girl, unisex. Got '{gender}'.",
        )

    try:
        rows = name_db.fetch_by_letter(letter, gender=gender, limit=limit, search=search)
        counts = name_db.letter_counts(gender=gender)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read the name database: {exc}",
        )

    available = counts.get(letter, 0)
    return {
        "letter": letter,
        "gender": gender or None,
        "search": search or None,
        "count": len(rows),
        # What the table actually holds, versus what was asked for — so the UI
        # can say "100 of 100" instead of implying the limit was met.
        "available_count": available,
        "requested_limit": limit,
        "names": rows,
    }


@router.get("/letters")
def available_letters(gender: Optional[str] = Query(None)):
    """Real name count per letter, so the A-Z grid can grey out the letters
    that have nothing behind them rather than offering a dead button.

    Note: F, Q, W, X and Z come back empty. Tamil has no native names
    beginning with those sounds — that is the language, not missing data.
    """
    g = (gender or "").strip().lower()
    if g not in VALID_GENDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"`gender` must be one of: boy, girl, unisex. Got '{gender}'.",
        )
    counts = name_db.letter_counts(gender=gender)
    return {
        "gender": gender or None,
        "counts": counts,
        "total": sum(counts.values()),
    }


@router.get("/by-rasi")
def names_by_rasi(
    rasi: int = Query(..., ge=1, le=12, description="1 = Mesha … 12 = Meena"),
    gender: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(60, ge=1, le=500),
):
    """Names for a zodiac sign.

    A Rasi spans nine Nakshatra padas, and each pada carries its own naming
    syllable — the standard division printed in every Tamil panchangam. This
    returns the names that begin with those syllables, so "names for Mithuna"
    means something classical rather than a decorative label over an A-Z list.
    """
    g = (gender or "").strip().lower()
    if g not in VALID_GENDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"`gender` must be one of: boy, girl, unisex. Got '{gender}'.",
        )
    try:
        return name_db.fetch_by_rasi(rasi, gender=gender, search=search, limit=limit)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read the name database: {exc}",
        )


@router.get("/rasi-list")
def rasi_list():
    """The twelve signs with their syllables, for the picker."""
    return {
        "rasis": [
            {
                "rasi": n,
                "rasi_en": name_db.RASI_LABELS[n][0],
                "rasi_ta": name_db.RASI_LABELS[n][1],
                "syllables": name_db.syllables_for_rasi(n),
            }
            for n in range(1, 13)
        ]
    }
