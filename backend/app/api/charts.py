from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.db_models import Chart, Profile
from backend.app.models.schemas import GenerateChartRequest, ChartResponse, BabyNameResult, NarrationResult
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.chart_builder import build_rasi_and_navamsa_kattams, calculate_bhava_predictions
from backend.app.services.dasha_builder import calculate_vimshottari_dasha, calculate_dasha_balance
from backend.app.services.yoga_dosha import detect_yogas, detect_doshas
from backend.app.services.ashtakavarga import calculate_ashtakavarga
from backend.app.services.baby_names import get_baby_name_suggestions
from backend.app.services.llm_narration import generate_chart_narration
from backend.app.services.single_page_report import build_single_page_summary  # NEW

router = APIRouter(prefix="/charts", tags=["charts"])

def run_chart_calculation(req: GenerateChartRequest, profile_id: int = None) -> dict:
    # 1. Resolve Place & Timezone
    lat, lon, tz = resolve_place(req.place, req.latitude, req.longitude, req.timezone)

    # 2. Convert to Julian Day
    jd = get_julian_day(req.date_of_birth, req.time_of_birth, tz)

    # 3. Compute Planetary Positions & Panchangam Elements (using Lahiri)
    eph = compute_planetary_positions(
        jd, lat, lon,
        panchangam_system=req.panchangam_system,
        date_str=req.date_of_birth,
        time_str=req.time_of_birth,
        timezone_str=tz
    )
    basic_details = eph["basic_details"]
    planets = eph["planets"]
    positions_by_name = eph["positions_by_name"]
    lagna_info = eph["lagna_info"]
    mandi_info = eph.get("mandi_info")

    # 4. Build Rasi (D1) & Navamsa (D9) Kattams
    rasi_kattam, navamsa_kattam = build_rasi_and_navamsa_kattams(planets, lagna_info)

    # 5. Calculate 12 Bhava Analysis
    bhavas = calculate_bhava_predictions(lagna_info["rasi_number"], planets)

    # 6. Calculate Vimshottari Dasha-Bhukti Timeline & Balance at Birth
    moon_deg = positions_by_name["Moon"]["total_degree"]
    dasha_bal = calculate_dasha_balance(moon_deg)
    basic_details["dasha_balance_ta"] = dasha_bal["formatted_ta"]
    basic_details["dasha_balance_en"] = dasha_bal["formatted_en"]
    dashas = calculate_vimshottari_dasha(moon_deg, req.date_of_birth, req.time_of_birth)

    # 7. Identify Yogas & Doshas
    yogas = detect_yogas(lagna_info["rasi_number"], positions_by_name)
    doshas = detect_doshas(lagna_info["rasi_number"], positions_by_name)

    # 8. Compute Ashtakavarga
    ashtakavarga = calculate_ashtakavarga(lagna_info["rasi_number"], positions_by_name)

    # 9. Baby Name Suggestions
    baby_names = get_baby_name_suggestions(
        basic_details["nakshatram"],
        basic_details["pada"],
        req.gender,
        basic_details["nakshatram_ta"]
    )

    # Planetary Positions TABLE display list: Lagna + 9 Navagrahas + Mandi
    display_planets = [lagna_info] + planets + ([mandi_info] if mandi_info else [])

    # Build response payload
    payload = {
        "profile_id": profile_id,
        "name": req.name or "Jathagar",
        "gender": req.gender,
        "date_of_birth": req.date_of_birth,
        "time_of_birth": req.time_of_birth,
        "place": req.place,
        "latitude": round(lat, 4),
        "longitude": round(lon, 4),
        "timezone": tz,
        "panchangam_system": req.panchangam_system,
        "chart_style": req.chart_style,
        "output_mode": req.output_mode,
        "basic_details": basic_details,
        "planets": display_planets,
        "rasi_kattam": rasi_kattam,
        "navamsa_kattam": navamsa_kattam,
        "bhava_predictions": bhavas,
        "vimshottari_dasha": dashas,
        "yogas": yogas,
        "doshas": doshas,
        "ashtakavarga": ashtakavarga,
        "baby_names": baby_names,
        "computed_at": datetime.utcnow().isoformat()
    }

    # 10. Generate Narration
    narration = generate_chart_narration(payload, language="ta")
    payload["narration"] = narration

    # 11. NEW — Single-Page Report Summary (Saturn transit dosha, life
    # scorecard, remedies, current-period micro-prediction). Reuses the
    # positions_by_name["Moon"] sign, the already-computed ashtakavarga
    # bindus, the already-computed dasha list, and the already-computed
    # doshas/nakshatra deity — see single_page_report.py for citations.
    # Computed unconditionally (cheap) so it's available regardless of
    # which output_mode the frontend requested, matching the existing
    # pattern where bhava_predictions/ashtakavarga are always computed and
    # only conditionally *rendered* on the frontend.
    payload["single_page_summary"] = build_single_page_summary(
        moon_sign_num=positions_by_name["Moon"]["rasi_number"],
        sarvashtakavarga_by_house=ashtakavarga["sarvashtakavarga_by_house"],
        nakshatra_deity=basic_details.get("nakshatra_deity"),
        vimshottari_dasha=dashas,
        doshas=doshas,
    )

    return payload

@router.post("/generate", response_model=ChartResponse)
def generate_chart(req: GenerateChartRequest, db: Session = Depends(get_db)):
    """
    Computes a complete, deterministic Vedic Jathagam based on birth details.
    """
    try:
        # Create or find profile if details provided
        profile = Profile(
            name=req.name or "Jathagar",
            gender=req.gender,
            date_of_birth=req.date_of_birth,
            time_of_birth=req.time_of_birth,
            place_name=req.place,
            latitude=req.latitude,
            longitude=req.longitude,
            timezone=req.timezone,
            parent_name=req.parent_name,
            personal_details=req.personal_details,
            phone=req.phone,
            email=req.email,
            family_details=req.family_details
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        calc_result = run_chart_calculation(req, profile_id=profile.id)

        # Save chart in database
        db_chart = Chart(
            profile_id=profile.id,
            panchangam_system=req.panchangam_system,
            chart_style=req.chart_style,
            output_mode=req.output_mode,
            chart_json=calc_result,
            narration_json=calc_result.get("narration")
        )
        db.add(db_chart)
        db.commit()
        db.refresh(db_chart)

        return calc_result
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating chart: {str(e)}"
        )

@router.get("/{chart_id}", response_model=ChartResponse)
def get_chart(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return chart.chart_json

@router.get("/{chart_id}/dasha")
def get_chart_dasha(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {"vimshottari_dasha": chart.chart_json.get("vimshottari_dasha", [])}

@router.get("/{chart_id}/yogas-doshas")
def get_chart_yogas_doshas(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {
        "yogas": chart.chart_json.get("yogas", []),
        "doshas": chart.chart_json.get("doshas", [])
    }

@router.get("/{chart_id}/ashtakavarga")
def get_chart_ashtakavarga(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {"ashtakavarga": chart.chart_json.get("ashtakavarga", {})}

@router.get("/{chart_id}/baby-names")
def get_chart_baby_names(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {"baby_names": chart.chart_json.get("baby_names", {})}

@router.get("/{chart_id}/single-page-summary")
def get_chart_single_page_summary(chart_id: int, db: Session = Depends(get_db)):
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {"single_page_summary": chart.chart_json.get("single_page_summary", {})}