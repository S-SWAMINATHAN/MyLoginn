"""
Numerology API — standalone Chaldean name-number check.

Separate router so the Nakshatra-Pada baby-name flow in api/baby_names.py
is never coupled to numerology logic. See services/numerology.py for the
full scope, confidence levels, and the system-boundary rationale.
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.models.schemas import NumerologyCheckRequest, NumerologyProfile
from backend.app.services.numerology import build_numerology_profile, get_reference_tables

router = APIRouter(prefix="/numerology", tags=["numerology"])


@router.post("/check", response_model=NumerologyProfile)
def check_numerology(req: NumerologyCheckRequest):
    """
    Computes a Chaldean numerology profile for ANY candidate name against a
    date of birth: Namank (Name Number) with its compound total, Moolank
    (Birth Number), Bhagyank (Destiny Number), the friend/neutral/enemy
    relation of the Namank to each, and the resulting alignment verdict.
    """
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=422, detail="name must not be empty")

    if not re_is_valid_date(req.date_of_birth):
        raise HTTPException(
            status_code=422, detail="date_of_birth must be in YYYY-MM-DD format"
        )

    try:
        return build_numerology_profile(req.name.strip(), req.date_of_birth)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error computing numerology profile: {str(e)}",
        )


def re_is_valid_date(value: str) -> bool:
    """Cheap shape check so a malformed date returns 422 (client error)
    rather than surfacing as a 500 from deep inside the engine."""
    from datetime import datetime
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False


@router.get("/reference")
def numerology_reference():
    """
    Static reference data for the UI:
      - Meaning of Numbers 1-9 (planet, traits, lucky numbers/colours/days)
      - Chaldean letter-number chart
      - Master numbers 11 / 22 / 33

    Pure lookup — no computation, no user input, so it is safe to cache
    client-side. Mirrors the reference tables shown by comparable calculators.
    """
    return get_reference_tables()