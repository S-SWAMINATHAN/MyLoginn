"""
NEW FILE. POST /api/muhurtha/search — date-range Muhurtha scanning.
See backend/app/services/muhurtha.py for the full rule set and citations.
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.models.schemas import MuhurthaRequest, MuhurthaSearchResponse
from backend.app.services.muhurtha import scan_muhurtha_range

router = APIRouter(prefix="/muhurtha", tags=["muhurtha"])

SUPPORTED_EVENT_TYPES = {"marriage", "travel", "general"}


@router.post("/search", response_model=MuhurthaSearchResponse)
def search_muhurtha(req: MuhurthaRequest):
    if req.event_type not in SUPPORTED_EVENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Event type '{req.event_type}' is not yet implemented. "
                f"Supported: {', '.join(sorted(SUPPORTED_EVENT_TYPES))}. "
                f"Griha Pravesam / Business Start require their own cited "
                f"rule sets and will be added in a future update."
            ),
        )
    try:
        return scan_muhurtha_range(
            event_type=req.event_type,
            start_date=req.start_date,
            end_date=req.end_date,
            place=req.place,
            latitude=req.latitude,
            longitude=req.longitude,
            timezone=req.timezone,
            person_a_dob=req.person_a_dob,
            person_a_tob=req.person_a_tob,
            person_a_place=req.person_a_place,
            person_b_dob=req.person_b_dob,
            person_b_tob=req.person_b_tob,
            person_b_place=req.person_b_place,
            travel_direction=req.travel_direction,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scanning muhurtha: {str(e)}",
        )
