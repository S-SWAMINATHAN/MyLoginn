"""
NEW FILE. Exposes GET /api/geocode/suggest for the frontend's place-of-birth
autocomplete. Reuses search_places() from the existing geocode service —
no new dependency, no change to how chart generation resolves place.
"""

from fastapi import APIRouter, Query
from backend.app.services.geocode import search_places, get_grouped_locations

router = APIRouter(prefix="/geocode", tags=["geocode"])


@router.get("/suggest")
def suggest_places(q: str = Query("", max_length=100)):
    """
    Response shape:
      { "results": [ { "display_name": str, "display_name_ta": str, "lat": float, "lon": float, "timezone": str }, ... ] }
    """
    return {"results": search_places(q)}


@router.get("/grouped")
def grouped_places():
    """
    Returns pre-grouped locations for the frontend dropdown:
    { "tamil_nadu": [...], "india": [...], "global": [...] }
    """
    return get_grouped_locations()