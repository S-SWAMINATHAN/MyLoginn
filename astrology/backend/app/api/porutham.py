from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.db.session import get_db
from backend.app.models.db_models import Profile, MatchResult
from backend.app.models.schemas import PoruthamRequest, PoruthamMatchResult, StarMatchFinderRequest, StarMatchFinderResponse, StarMatchItem
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.porutham import compute_porutham_match
from backend.app.services.tamil_labels import SIGN_LABELS, NAKSHATRA_LABELS, PLANET_LABELS

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


# ──────────────────────────────────────────────────────────
# NEW: Star Match Finder — MATCH feature
# For a given Boy (or Girl) Nakshatra/Pada, return compatibility
# ratings for ALL target Rasi/Nakshatra combinations (108 pada combos)
# ──────────────────────────────────────────────────────────

def _resolve_nakshatra_index(name: str) -> int:
    """Resolve English or Tamil nakshatra name to 1-27 index. Case-insensitive."""
    if not name:
        return 1
    name_norm = name.strip().lower()
    for n in NAKSHATRA_LABELS:
        if n["sa"].lower() == name_norm or n["ta"] == name.strip() or n["sa"].lower().replace(" ", "") == name_norm.replace(" ", ""):
            return n["index"]
    # Try partial/fuzzy: e.g., 'Mriga' matches Mrigashirsha
    for n in NAKSHATRA_LABELS:
        if name_norm in n["sa"].lower() or n["sa"].lower() in name_norm:
            return n["index"]
    raise HTTPException(status_code=400, detail=f"Unknown nakshatra: {name}. Expected one of {', '.join([n['sa'] for n in NAKSHATRA_LABELS])}")


def _rasi_from_nak_pada(nak: int, pada: int) -> int:
    """Derive Rasi (1-12) from Nakshatra (1-27) + Pada (1-4). Classical: ((nak-1)*4 + pada-1)//9 +1"""
    return int(((nak - 1) * 4 + (pada - 1)) / 9) + 1


def _like_rate_from_score(score: float, rajju_dosha: bool, vedha_dosha: bool) -> tuple[int, str, str]:
    """Map compatibility to 1-5 star like-rate."""
    if rajju_dosha:
        return 1, "Very Low (Rajju Dosha)", "மிக குறைவு (ரஜ்ஜு தோஷம்)"
    if score >= 70:
        return 5, "Excellent Match", "மிகச் சிறந்த பொருத்தம்"
    if score >= 60:
        return 4, "Very Good Match", "மிக நல்ல பொருத்தம்"
    if score >= 50:
        return 3, "Good Match", "நல்ல பொருத்தம்"
    if score >= 35:
        return 2, "Average Match", "சராசரி பொருத்தம்"
    return 1, "Low Compatibility", "குறைந்த பொருத்தம்"


def _build_star_matches(
    input_nak: int, input_pada: int, input_gender: str,
    filter_rasi: Optional[int] = None, sort_by: str = "score"
):
    input_rasi = _rasi_from_nak_pada(input_nak, input_pada)
    input_details_info = NAKSHATRA_LABELS[input_nak - 1]
    input_rasi_info = SIGN_LABELS[input_rasi]

    input_details = {
        "nakshatra": input_details_info["sa"],
        "nakshatra_ta": input_details_info["ta"],
        "nakshatra_number": input_nak,
        "pada": input_pada,
        "rasi_number": input_rasi,
        "rasi": input_rasi_info["sa"],
        "rasi_ta": input_rasi_info["ta"],
        "rasi_lord": input_rasi_info["lord"],
        "rasi_lord_ta": PLANET_LABELS.get(input_rasi_info["lord"], {}).get("ta", input_rasi_info["lord"]),
        "rajju": input_details_info.get("rajju", ""),
        "rajju_ta": input_details_info.get("rajju_ta", ""),
        "gender": input_gender,
    }

    matches = []
    for target_nak in range(1, 28):
        for target_pada in range(1, 5):
            target_rasi = _rasi_from_nak_pada(target_nak, target_pada)
            if filter_rasi is not None and target_rasi != filter_rasi:
                continue

            # Compute porutham in correct gender orientation
            if input_gender.lower() == "girl":
                # input is girl, target is boy
                b_rasi, b_nak, b_pada = target_rasi, target_nak, target_pada
                g_rasi, g_nak, g_pada = input_rasi, input_nak, input_pada
            else:
                # default: input is boy, target is girl
                b_rasi, b_nak, b_pada = input_rasi, input_nak, input_pada
                g_rasi, g_nak, g_pada = target_rasi, target_nak, target_pada

            res = compute_porutham_match(b_rasi, b_nak, b_pada, g_rasi, g_nak, g_pada)
            target_info = NAKSHATRA_LABELS[target_nak - 1]
            target_rasi_info = SIGN_LABELS[target_rasi]
            like_rate, like_label, like_label_ta = _like_rate_from_score(
                res["score_percentage"], res["rajju_dosha"], res["vedha_dosha"]
            )

            # Count Tamil compatible for display convenience
            tamil_count = sum(1 for x in res["tamil_10_porutham"] if x["is_compatible"])

            item = {
                "target_nakshatra": target_info["sa"],
                "target_nakshatra_ta": target_info["ta"],
                "target_nakshatra_number": target_nak,
                "target_pada": target_pada,
                "target_rasi_number": target_rasi,
                "target_rasi": target_rasi_info["sa"],
                "target_rasi_ta": target_rasi_info["ta"],
                "target_rasi_lord": target_rasi_info["lord"],
                "target_rasi_lord_ta": PLANET_LABELS.get(target_rasi_info["lord"], {}).get("ta", target_rasi_info["lord"]),
                "target_rasi_element": target_rasi_info.get("element", ""),
                "target_rasi_element_ta": target_rasi_info.get("element_ta", ""),
                "ashta_koota_total": res["ashta_koota"]["total_points"],
                "ashta_koota_max": 36.0,
                "tamil_compatible_count": tamil_count,
                "tamil_total": 10,
                "score_percentage": res["score_percentage"],
                "rajju_dosha": res["rajju_dosha"],
                "rajju_type": res["rajju_type"],
                "rajju_type_ta": res["rajju_type_ta"],
                "vedha_dosha": res["vedha_dosha"],
                "verdict": res["verdict"],
                "verdict_ta": res["verdict_ta"],
                "like_rate": like_rate,
                "like_rate_label": like_label,
                "like_rate_label_ta": like_label_ta,
                "tamil_10_porutham": res["tamil_10_porutham"],
                "ashta_koota": res["ashta_koota"],
            }
            matches.append(item)

    # Sorting
    if sort_by == "ashta":
        matches.sort(key=lambda x: x["ashta_koota_total"], reverse=True)
    elif sort_by == "tamil":
        matches.sort(key=lambda x: x["tamil_compatible_count"], reverse=True)
    else:
        matches.sort(key=lambda x: x["score_percentage"], reverse=True)

    # Rasi summary: per Rasi aggregated stats
    rasi_summary = []
    for rasi_num in range(1, 13):
        rasi_matches = [m for m in matches if m["target_rasi_number"] == rasi_num]
        if not rasi_matches:
            continue
        avg_score = round(sum(m["score_percentage"] for m in rasi_matches) / len(rasi_matches), 1) if rasi_matches else 0
        best = max(rasi_matches, key=lambda x: x["score_percentage"]) if rasi_matches else None
        uthama_cnt = sum(1 for m in rasi_matches if m["score_percentage"] >= 70 and not m["rajju_dosha"])
        rajju_safe_cnt = sum(1 for m in rasi_matches if not m["rajju_dosha"])
        rasi_info = SIGN_LABELS[rasi_num]
        rasi_summary.append({
            "rasi_number": rasi_num,
            "rasi": rasi_info["sa"],
            "rasi_ta": rasi_info["ta"],
            "rasi_lord": rasi_info["lord"],
            "rasi_lord_ta": PLANET_LABELS.get(rasi_info["lord"], {}).get("ta", rasi_info["lord"]),
            "total_combinations": len(rasi_matches),
            "avg_score": avg_score,
            "best_score": best["score_percentage"] if best else 0,
            "best_nakshatra": best["target_nakshatra"] if best else "",
            "best_nakshatra_ta": best["target_nakshatra_ta"] if best else "",
            "best_pada": best["target_pada"] if best else 1,
            "uthama_count": uthama_cnt,
            "rajju_safe_count": rajju_safe_cnt,
        })
    # Sort rasi summary by avg_score desc
    rasi_summary.sort(key=lambda x: x["avg_score"], reverse=True)

    # Overall summary
    total = len(matches)
    uthama = sum(1 for m in matches if m["score_percentage"] >= 70 and not m["rajju_dosha"])
    good = sum(1 for m in matches if 50 <= m["score_percentage"] < 70 and not m["rajju_dosha"])
    avg_all = round(sum(m["score_percentage"] for m in matches) / total, 1) if total else 0
    rajju_dosha_cnt = sum(1 for m in matches if m["rajju_dosha"])
    vedha_cnt = sum(1 for m in matches if m["vedha_dosha"])

    summary = {
        "total_combinations": total,
        "uthama_count": uthama,
        "good_count": good,
        "average_score": avg_all,
        "rajju_dosha_count": rajju_dosha_cnt,
        "rajju_safe_count": total - rajju_dosha_cnt,
        "vedha_dosha_count": vedha_cnt,
        "filter_rasi": filter_rasi,
        "sort_by": sort_by,
    }

    return input_details, input_rasi, input_nak, matches, rasi_summary, summary


@router.post("/star-matches", response_model=StarMatchFinderResponse)
def star_match_finder(req: StarMatchFinderRequest):
    """
    MATCH Finder — Given ONE side's Nakshatra/Pada (Boy or Girl),
    return LIKE-RATE for EVERY target Rasi/Nakshatra combination (108 pada-level matches).
    Powers the new MATCH feature: 'For this Boy Nakshatra, which Girl Rasi/Nakshatra matches best?'
    """
    input_nak = _resolve_nakshatra_index(req.input_nakshatra)
    if req.input_pada not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="input_pada must be 1-4")
    gender = req.input_gender.lower() if req.input_gender.lower() in ("boy", "girl") else "boy"

    input_details, input_rasi, input_nak, matches, rasi_summary, summary = _build_star_matches(
        input_nak, input_pada=req.input_pada, input_gender=gender,
        filter_rasi=req.filter_rasi, sort_by=req.sort_by or "score"
    )

    return {
        "input_details": input_details,
        "input_rasi_number": input_rasi,
        "input_nakshatra_number": input_nak,
        "matches": matches,
        "rasi_summary": rasi_summary,
        "summary": summary,
    }


@router.get("/star-matches", response_model=StarMatchFinderResponse)
def star_match_finder_get(
    nakshatra: str = Query(..., description="Input Nakshatra English or Tamil"),
    pada: int = Query(1, ge=1, le=4, description="Pada 1-4"),
    gender: str = Query("boy", description="boy or girl"),
    filter_rasi: Optional[int] = Query(None, ge=1, le=12),
    sort_by: str = Query("score", description="score | ashta | tamil"),
):
    """
    GET variant of Star Match Finder for easy browser testing.
    Example: /api/porutham/star-matches?nakshatra=Pushya&pada=2&gender=boy
    """
    # Reuse POST logic via request object
    req = StarMatchFinderRequest(
        input_nakshatra=nakshatra, input_pada=pada, input_gender=gender,
        filter_rasi=filter_rasi, sort_by=sort_by
    )
    return star_match_finder(req)
