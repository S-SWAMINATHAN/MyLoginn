"""
Standalone Baby Name generation — independent of full chart generation.
Computes the real Moon Nakshatra/Pada from birth details via the same
ephemeris pipeline as everywhere else in this app (Swiss Ephemeris
DE431/441, Lahiri Ayanamsha), then returns Nakshatra-Pada based name
suggestions from the existing, already-accurate
backend/app/services/baby_names.py — no separate/simplified logic, no
invented name data.

Pattern mirrors get_profile_rasi_and_nak() in backend/app/api/porutham.py:
resolve_place -> get_julian_day -> compute_planetary_positions -> read Moon.

--- NUMEROLOGY ENRICHMENT (added) -------------------------------------------
Each returned suggestion is additionally annotated with a Chaldean
numerology summary (Namank + its relation to the baby's Moolank/Bhagyank).

CRITICAL BOUNDARY: this enrichment happens strictly AFTER
get_baby_name_suggestions() has already selected the names. The
Nakshatra-Pada selection logic itself is NOT altered, NOT filtered, and NOT
reordered by numerology. Numerology never removes a classically-correct
name from the list — it only labels it, so the user can see both systems'
verdicts side by side and decide for themselves. This preserves AGENTS.md
1.7 (never silently mix systems).
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.models.schemas import BabyNameRequest, BabyNameResult
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.baby_names import get_baby_name_suggestions
from backend.app.services.numerology import (
    compute_name_number,
    compute_birth_number,
    compute_destiny_number,
    _relation,          # shared so name-level and page-level verdicts can never diverge
    _RELATION_TA,
)

router = APIRouter(prefix="/baby-names", tags=["baby-names"])


def _enrich_with_numerology(result: dict, date_of_birth: str) -> dict:
    """Annotates each suggestion with numerology_* fields and adds the two
    baby-level numbers to the top level.

    Wrapped in its own try/except: if numerology fails for any reason, the
    classical Nakshatra-Pada suggestions must still return successfully.
    An optional add-on may never take down the core feature.
    """
    try:
        moolank = compute_birth_number(date_of_birth)
        bhagyank = compute_destiny_number(date_of_birth)
    except Exception:
        return result  # malformed DOB — skip enrichment, core feature unaffected

    result["numerology_birth_number"] = moolank
    result["numerology_destiny_number"] = bhagyank

    for suggestion in result.get("suggestions", []):
        try:
            nr = compute_name_number(suggestion.get("name", ""))
            namank = nr["name_number"]
            rel_m = _relation(namank, moolank)
            rel_b = _relation(namank, bhagyank)

            has_enemy = "Enemy" in (rel_m, rel_b)
            friendly_count = [rel_m, rel_b].count("Friendly")
            if has_enemy:
                status_en, status_ta = "Needs Better Alignment", "மேம்பாடு தேவை"
            elif friendly_count == 2:
                status_en, status_ta = "Favourable", "சாதகமானது"
            elif friendly_count == 1:
                status_en, status_ta = "Partially Aligned", "பகுதியளவு பொருத்தம்"
            else:
                status_en, status_ta = "Needs Better Alignment", "மேம்பாடு தேவை"

            suggestion["numerology_name_number"] = namank
            suggestion["numerology_compound_total"] = nr["compound_total"]
            suggestion["numerology_relation_birth"] = rel_m
            suggestion["numerology_relation_birth_ta"] = _RELATION_TA[rel_m]
            suggestion["numerology_relation_destiny"] = rel_b
            suggestion["numerology_relation_destiny_ta"] = _RELATION_TA[rel_b]
            suggestion["numerology_alignment_status"] = status_en
            suggestion["numerology_alignment_status_ta"] = status_ta
            suggestion["numerology_is_favorable"] = status_en == "Favourable"
        except Exception:
            # Skip this one name rather than failing the whole request.
            continue

    return result


@router.post("/generate", response_model=BabyNameResult)
def generate_baby_names(req: BabyNameRequest):
    """
    Resolves place -> Julian Day -> full planetary/panchangam computation,
    reads the Moon's real Nakshatra + Pada from it, and returns the
    classical Nakshatra-Pada starting-syllable name suggestions via the
    existing get_baby_name_suggestions() service — identical accuracy to
    the Baby Names section already shown inside a full Jathagam — each now
    additionally labelled with its Chaldean numerology alignment.
    """
    try:
        lat, lon, tz = resolve_place(req.place, req.latitude, req.longitude, req.timezone)
        jd = get_julian_day(req.date_of_birth, req.time_of_birth, tz)

        eph = compute_planetary_positions(
            jd, lat, lon,
            date_str=req.date_of_birth,
            time_str=req.time_of_birth,
            timezone_str=tz
        )
        moon = eph["positions_by_name"]["Moon"]

        result = get_baby_name_suggestions(
            moon["nakshatra"],
            moon["pada"],
            req.gender,
            moon["nakshatra_ta"]
        )

        result = _enrich_with_numerology(result, req.date_of_birth)

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating baby names: {str(e)}"
        )