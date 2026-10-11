from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.db_models import Chart
from backend.app.models.schemas import NarrationRequest, NarrationResult
from backend.app.services.llm_narration import generate_chart_narration

router = APIRouter(prefix="/narration", tags=["narration"])

@router.post("", response_model=NarrationResult)
def create_narration(req: NarrationRequest, db: Session = Depends(get_db)):
    """
    Generates natural language reading in Tamil or English strictly from the chart payload.
    """
    chart_payload = req.chart_data

    if req.chart_id and not chart_payload:
        chart = db.query(Chart).filter(Chart.id == req.chart_id).first()
        if not chart:
            raise HTTPException(status_code=404, detail="Chart not found")
        chart_payload = chart.chart_json

    if not chart_payload:
        raise HTTPException(status_code=400, detail="Either chart_id or chart_data must be provided")

    result = generate_chart_narration(chart_payload, language=req.language or "ta")

    # Update narration in database if chart_id provided
    if req.chart_id:
        chart = db.query(Chart).filter(Chart.id == req.chart_id).first()
        if chart:
            chart.narration_json = result
            db.commit()

    return result
