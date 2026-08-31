from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.db_models import Profile, MatchResult
from backend.app.models.schemas import PoruthamRequest, PoruthamMatchResult
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.porutham import compute_porutham_match
from backend.app.services.tamil_labels import SIGN_LABELS, NAKSHATRA_LABELS

router = APIRouter(prefix="/porutham", tags=["porutham"])

def get_profile_rasi_and_nak(dob: str, tob: str, place: str):
    lat, lon, tz = resolve_place(place)
    jd = get_julian_day(dob, tob, tz)
    eph = compute_planetary_positions(jd, lat, lon)
    moon = eph["positions_by_name"]["Moon"]
    return moon["rasi_number"], moon["nakshatra_number"], moon["pada"], moon

@router.post("", response_model=PoruthamMatchResult)
def calculate_porutham(req: PoruthamRequest, db: Session = Depends(get_db)):
    """
    Computes Ashta Koota (36 points) and Tamil 10-Porutham compatibility between boy and girl.
    """
    boy_details = {}
    girl_details = {}

    b_rasi, b_nak, b_pada = 1, 1, 1
    g_rasi, g_nak, g_pada = 1, 1, 1

    if req.profile_id_boy and req.profile_id_girl:
        p_boy = db.query(Profile).filter(Profile.id == req.profile_id_boy).first()
        p_girl = db.query(Profile).filter(Profile.id == req.profile_id_girl).first()
        if not p_boy or not p_girl:
            raise HTTPException(status_code=404, detail="One or both profiles not found")

        b_rasi, b_nak, b_pada, b_moon = get_profile_rasi_and_nak(p_boy.date_of_birth, p_boy.time_of_birth, p_boy.place_name)
        g_rasi, g_nak, g_pada, g_moon = get_profile_rasi_and_nak(p_girl.date_of_birth, p_girl.time_of_birth, p_girl.place_name)
        boy_details = {"name": p_boy.name, "rasi": b_moon["rasi"], "rasi_ta": b_moon["rasi_ta"], "nakshatra": b_moon["nakshatra"], "nakshatra_ta": b_moon["nakshatra_ta"], "pada": b_pada}
        girl_details = {"name": p_girl.name, "rasi": g_moon["rasi"], "rasi_ta": g_moon["rasi_ta"], "nakshatra": g_moon["nakshatra"], "nakshatra_ta": g_moon["nakshatra_ta"], "pada": g_pada}

    elif req.boy_dob and req.boy_tob and req.boy_place and req.girl_dob and req.girl_tob and req.girl_place:
        b_rasi, b_nak, b_pada, b_moon = get_profile_rasi_and_nak(req.boy_dob, req.boy_tob, req.boy_place)
        g_rasi, g_nak, g_pada, g_moon = get_profile_rasi_and_nak(req.girl_dob, req.girl_tob, req.girl_place)
        boy_details = {"name": "Boy / மணமகன்", "rasi": b_moon["rasi"], "rasi_ta": b_moon["rasi_ta"], "nakshatra": b_moon["nakshatra"], "nakshatra_ta": b_moon["nakshatra_ta"], "pada": b_pada}
        girl_details = {"name": "Girl / மணமகள்", "rasi": g_moon["rasi"], "rasi_ta": g_moon["rasi_ta"], "nakshatra": g_moon["nakshatra"], "nakshatra_ta": g_moon["nakshatra_ta"], "pada": g_pada}

    elif req.boy_nakshatra and req.girl_nakshatra:
        # Find nakshatra index
        b_nak = next((n["index"] for n in NAKSHATRA_LABELS if n["sa"].lower() == req.boy_nakshatra.lower() or n["ta"] == req.boy_nakshatra), 1)
        g_nak = next((n["index"] for n in NAKSHATRA_LABELS if n["sa"].lower() == req.girl_nakshatra.lower() or n["ta"] == req.girl_nakshatra), 1)
        b_pada = req.boy_pada or 1
        g_pada = req.girl_pada or 1
        # Derive rasi from nakshatra + pada
        b_rasi = int(((b_nak - 1) * 4 + (b_pada - 1)) / 9) + 1
        g_rasi = int(((g_nak - 1) * 4 + (g_pada - 1)) / 9) + 1
        boy_details = {"name": "Boy", "rasi": SIGN_LABELS[b_rasi]["sa"], "rasi_ta": SIGN_LABELS[b_rasi]["ta"], "nakshatra": NAKSHATRA_LABELS[b_nak-1]["sa"], "nakshatra_ta": NAKSHATRA_LABELS[b_nak-1]["ta"], "pada": b_pada}
        girl_details = {"name": "Girl", "rasi": SIGN_LABELS[g_rasi]["sa"], "rasi_ta": SIGN_LABELS[g_rasi]["ta"], "nakshatra": NAKSHATRA_LABELS[g_nak-1]["sa"], "nakshatra_ta": NAKSHATRA_LABELS[g_nak-1]["ta"], "pada": g_pada}
    else:
        # Fallback sample check
        b_rasi, b_nak, b_pada = 4, 8, 2
        g_rasi, g_nak, g_pada = 1, 1, 1
        boy_details = {"name": "Boy", "rasi": "Karkataka", "rasi_ta": "கடகம்", "nakshatra": "Pushya", "nakshatra_ta": "பூசம்", "pada": 2}
        girl_details = {"name": "Girl", "rasi": "Mesha", "rasi_ta": "மேஷம்", "nakshatra": "Ashwini", "nakshatra_ta": "அசுவினி", "pada": 1}

    match_res = compute_porutham_match(b_rasi, b_nak, b_pada, g_rasi, g_nak, g_pada)
    match_res["boy_details"] = boy_details
    match_res["girl_details"] = girl_details

    # Persist in match_results if profile ids present
    if req.profile_id_boy and req.profile_id_girl:
        db_match = MatchResult(
            profile_id_boy=req.profile_id_boy,
            profile_id_girl=req.profile_id_girl,
            result_json=match_res
        )
        db.add(db_match)
        db.commit()

    return match_res
