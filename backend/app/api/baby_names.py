"""
NEW FILE. Standalone Baby Name generation — independent of full chart
generation. Computes the real Moon Nakshatra/Pada from birth details via
the same ephemeris pipeline as everywhere else in this app (Swiss Ephemeris
DE431/441, Lahiri Ayanamsha), then returns Nakshatra-Pada based name
suggestions from the existing, already-accurate
backend/app/services/baby_names.py — no separate/simplified logic, no
numerology, no invented name data.

Pattern mirrors get_profile_rasi_and_nak() in backend/app/api/porutham.py:
resolve_place -> get_julian_day -> compute_planetary_positions -> read Moon.
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.models.schemas import BabyNameRequest, BabyNameResult
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.baby_names import get_baby_name_suggestions

router = APIRouter(prefix="/baby-names", tags=["baby-names"])


@router.post("/generate", response_model=BabyNameResult)
def generate_baby_names(req: BabyNameRequest):
    """
    Resolves place -> Julian Day -> full planetary/panchangam computation,
    reads the Moon's real Nakshatra + Pada from it, and returns the
    classical Nakshatra-Pada starting-syllable name suggestions via the
    existing get_baby_name_suggestions() service — identical accuracy to
    the Baby Names section already shown inside a full Jathagam.
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
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating baby names: {str(e)}"
        )