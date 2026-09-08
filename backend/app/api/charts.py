from datetime import datetime
import math
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.db_models import Chart, Profile
from backend.app.models.schemas import GenerateChartRequest, ChartResponse, BabyNameResult, NarrationResult
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.chart_builder import (
    build_rasi_and_navamsa_kattams,
    calculate_bhava_predictions,
    compute_hora_chart,
    compute_drekkana_chart
)
from backend.app.services.dasha_builder import calculate_vimshottari_dasha, calculate_dasha_balance
from backend.app.services.yoga_dosha import detect_yogas, detect_doshas
from backend.app.services.ashtakavarga import calculate_ashtakavarga
from backend.app.services.baby_names import get_baby_name_suggestions
from backend.app.services.shadbala import calculate_shadbala
from backend.app.services.gochara import compute_current_transits, analyze_gochara, get_gochara_summary
from backend.app.services.ayurdaya import calculate_ayurdaya
from backend.app.services.rasi_nakshatra import get_detailed_predictions
from backend.app.services.tamil_labels import NAKSHATRA_LABELS
from backend.app.services.sampoorana import calculate_sampoorana_details
from backend.app.services.single_page_report import build_single_page_summary
from backend.app.services.llm_narration import generate_chart_narration

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

    # 4b. Build Hora (D2) & Drekkana (D3) Kattams
    hora_kattam = compute_hora_chart(planets, lagna_info)
    drekkana_kattam = compute_drekkana_chart(planets, lagna_info)

    # 5. Calculate 12 Bhava Analysis
    bhavas = calculate_bhava_predictions(lagna_info["rasi_number"], planets)

    # 6. Calculate Vimshottari Dasha-Bhukti-Antardasha Timeline & Balance at Birth
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

    # 9. Compute Shadbala (6-fold planetary strength)
    # Determine day/night birth from sunrise timing
    sunrise_str = basic_details.get("sun_rise", "06:00:00 AM")
    sunset_str = basic_details.get("sun_set", "06:00:00 PM")
    birth_dt_parts = req.time_of_birth.split(":")
    birth_hour = float(birth_dt_parts[0]) + float(birth_dt_parts[1]) / 60.0
    # Simple day/night determination based on sunrise/sunset strings
    is_day_birth = 6.0 <= birth_hour <= 18.0  # Simplified; refined by actual sunrise
    is_shukla = basic_details.get("paksha_en", "Shukla Paksha") == "Shukla Paksha"
    vaaram_lord = basic_details.get("vaaram_lord", "Sun")
    day_num = int(math.floor(jd + 1.5)) % 7

    shadbala = calculate_shadbala(
        planets_by_name=positions_by_name,
        lagna_sign=lagna_info["rasi_number"],
        is_day_birth=is_day_birth,
        is_shukla_paksha=is_shukla,
        vaaram_lord=vaaram_lord,
        birth_hour=birth_hour,
        day_num=day_num
    )

    # 10. Compute Gochara (Current Transit Analysis)
    transit_planets = compute_current_transits(timezone_str=tz)
    natal_moon_sign = positions_by_name["Moon"]["rasi_number"]
    natal_bav = ashtakavarga.get("bhinnashtakavarga")
    gochara_transits = analyze_gochara(natal_moon_sign, natal_bav, transit_planets)
    gochara_summary = get_gochara_summary(gochara_transits)
    gochara = {
        "transits": gochara_transits,
        "summary": gochara_summary,
        "transit_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "classical_source": "BPHS Ch. 65, Phaladeepika Ch. 26"
    }

    # 11. Baby Name Suggestions
    baby_names = get_baby_name_suggestions(
        basic_details["nakshatram"],
        basic_details["pada"],
        req.gender,
        basic_details["nakshatram_ta"]
    )

    # 11b. Ayurdaya (Longevity Determination)
    ayurdaya = calculate_ayurdaya(
        lagna_sign=lagna_info["rasi_number"],
        planets_by_name=positions_by_name,
        sarvashtakavarga=ashtakavarga.get("sarvashtakavarga")
    )

    # 11c. Detailed Rasi, Nakshatra & Lagna Predictions
    moon_nak_idx = basic_details.get("nakshatra_number") or next(
        (n["index"] for n in NAKSHATRA_LABELS if n["sa"].lower() == basic_details["nakshatram"].lower() or n["ta"] == basic_details["nakshatram_ta"]),
        1
    )
    rasi_nakshatra_preds = get_detailed_predictions(
        lagna_sign=lagna_info["rasi_number"],
        rasi_sign=basic_details.get("rasi_number") or positions_by_name["Moon"]["rasi_number"],
        nakshatra_num=moon_nak_idx,
        pada=basic_details["pada"]
    )

    # Planetary Positions TABLE display list: Lagna + 9 Navagrahas + Mandi (11 rows)
    display_planets = [lagna_info] + planets + ([mandi_info] if mandi_info else [])

    # 11d. Sampoorana Jathagam Shastric Eras, Tatparai, Bhava Sphutam & Varga Chakras
    sampoorana = calculate_sampoorana_details(
        jd=jd,
        lat=lat,
        lon=lon,
        date_str=req.date_of_birth,
        time_str=req.time_of_birth,
        basic_details=basic_details,
        planets=display_planets,
        positions_by_name=positions_by_name
    )
    # Merge Shastric details into basic_details for seamless direct access
    for k, v in sampoorana.items():
        if k not in ["bhava_sphutam", "varga_chakras"]:
            basic_details[k] = v

    # Build Parents & Candidate Bio-Data object
    bio_data_dict = {}
    if req.bio_data:
        bio_data_dict = req.bio_data.model_dump()
    else:
        bio_data_dict = {
            "father_name": req.father_name or (req.parent_name if req.parent_name else None),
            "father_occupation": req.father_occupation,
            "mother_name": req.mother_name,
            "mother_occupation": req.mother_occupation,
            "gothram": req.gothram,
            "kula_deivam": req.kula_deivam or (req.family_details if req.family_details else None),
            "kula_deivam_place": req.kula_deivam_place,
            "native_place": req.native_place,
            "caste_subcaste": req.caste_subcaste,
            "siblings": req.siblings,
            "education": req.education,
            "occupation": req.occupation,
            "annual_income": req.annual_income,
            "height": req.height,
            "phone": req.phone,
            "alternate_phone": req.alternate_phone,
            "email": req.email,
            "residence_address": req.residence_address,
        }

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
        "hora_kattam": hora_kattam,
        "drekkana_kattam": drekkana_kattam,
        "bhava_predictions": bhavas,
        "vimshottari_dasha": dashas,
        "yogas": yogas,
        "doshas": doshas,
        "ashtakavarga": ashtakavarga,
        "shadbala": shadbala,
        "gochara": gochara,
        "ayurdaya": ayurdaya,
        "rasi_nakshatra_predictions": rasi_nakshatra_preds,
        "baby_names": baby_names,
        "sampoorana": sampoorana,
        "vakhyam_details": sampoorana.get("vakhyam_details"),
        "bio_data": bio_data_dict,
        "bhava_sphutam": sampoorana.get("bhava_sphutam"),
        "varga_chakras": sampoorana.get("varga_chakras"),
        "computed_at": datetime.utcnow().isoformat()
    }

    # 12. Generate Narration
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
    Includes Shadbala, Gochara transits, Hora (D2), Drekkana (D3), and Antardasha.
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

@router.get("/{chart_id}/shadbala")
def get_chart_shadbala(chart_id: int, db: Session = Depends(get_db)):
    """Returns the Shadbala (6-fold planetary strength) analysis for a saved chart."""
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {"shadbala": chart.chart_json.get("shadbala", {})}

@router.get("/{chart_id}/gochara")
def get_chart_gochara(
    chart_id: int,
    transit_date: str = Query(None, description="Optional transit date (YYYY-MM-DD). Defaults to today."),
    db: Session = Depends(get_db)
):
    """
    Returns real-time or date-specific Gochara (transit) analysis for a saved chart.
    Computes current transit positions and analyses effects relative to natal Moon sign.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")

    chart_data = chart.chart_json
    tz = chart_data.get("timezone", "Asia/Kolkata")

    # Compute transits for specified date or today
    transit_planets = compute_current_transits(
        date_str=transit_date or "",
        timezone_str=tz
    )

    # Get natal Moon sign and BAV from stored chart
    positions_by_name = {}
    for p in chart_data.get("planets", []):
        positions_by_name[p["name"]] = p
    natal_moon_sign = positions_by_name.get("Moon", {}).get("rasi_number", 1)
    natal_bav = chart_data.get("ashtakavarga", {}).get("bhinnashtakavarga")

    gochara_transits = analyze_gochara(natal_moon_sign, natal_bav, transit_planets)
    gochara_summary = get_gochara_summary(gochara_transits)

    return {
        "gochara": {
            "transits": gochara_transits,
            "summary": gochara_summary,
            "transit_date": transit_date or datetime.utcnow().strftime("%Y-%m-%d"),
            "classical_source": "BPHS Ch. 65, Phaladeepika Ch. 26"
        }
    }

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
