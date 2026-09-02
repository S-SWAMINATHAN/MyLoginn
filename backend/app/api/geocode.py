"""
NEW FILE. Exposes GET /api/geocode/suggest for the frontend's place-of-birth
autocomplete. Reuses search_places() from the existing geocode service —
no new dependency, no change to how chart generation resolves place.
"""

from fastapi import APIRouter, Query
from backend.app.services.geocode import search_places

router = APIRouter(prefix="/geocode", tags=["geocode"])


@router.get("/suggest")
def suggest_places(q: str = Query(..., min_length=1, max_length=100)):
    """
    Response shape:
      { "results": [ { "display_name": str, "lat": float, "lon": float, "timezone": str }, ... ] }
    """
    return {"results": search_places(q)}