"""
Kalai Magal parity API.

POST /api/kalai/report — Kalai Magal-structured computation report
(sections 1-7 and 11 computed; 8-10, 12, 13 returned as "pending").
"""

from fastapi import APIRouter, HTTPException

from backend.app.models.schemas import GenerateChartRequest
from backend.app.services.kalai_report import build_kalai_report

router = APIRouter(prefix="/kalai", tags=["Kalai Magal Parity"])


@router.post("/report")
def kalai_report(req: GenerateChartRequest):
    try:
        return build_kalai_report(
            name=req.name or "",
            date_of_birth=req.date_of_birth,
            time_of_birth=req.time_of_birth,
            place=req.place,
            latitude=req.latitude,
            longitude=req.longitude,
            timezone=req.timezone,
            gender=req.gender,
            father_name=getattr(req, "father_name", None) or req.parent_name,
            mother_name=getattr(req, "mother_name", None),
            panchangam_system=req.panchangam_system or "thirukkanitham",
            time_correction=getattr(req, "time_correction", None),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Kalai report failed: {exc}")


# ---------------------------------------------------------------------------
# Kalai "Utilities" menu (Phase 3c)
# ---------------------------------------------------------------------------
from datetime import date as _date

from pydantic import BaseModel, Field

from backend.app.services.geocode import resolve_place
from backend.app.services.kalai_tamil_calendar import (
    MONTHS_EN, MONTHS_TA, YEARS_EN, YEARS_TA, naligai_to_time, tamil_date, tamil_to_english)


class TamilToEnglishIn(BaseModel):
    day: int = Field(ge=1, le=32)
    month: int = Field(ge=1, le=12)
    year_index: int = Field(ge=1, le=60)
    pariviruthi: int = Field(ge=1, le=60)


class NaligaiIn(BaseModel):
    date: str
    nazhigai: int = Field(ge=0, le=60)
    vinazhigai: int = Field(ge=0, le=59)
    tharparai: int = Field(default=0, ge=0, le=59)
    place: str = ""
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    time_correction: str | None = None


class TamilDateIn(BaseModel):
    date: str
    time: str | None = None
    place: str = ""
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None


@router.get("/utilities/tamil-calendar-names")
def tamil_calendar_names():
    return {"months_ta": MONTHS_TA, "months_en": MONTHS_EN, "years_ta": YEARS_TA, "years_en": YEARS_EN}


@router.post("/utilities/tamil-to-english")
def util_tamil_to_english(body: TamilToEnglishIn):
    return tamil_to_english(body.day, body.month, body.year_index, body.pariviruthi)


@router.post("/utilities/naligai-to-time")
def util_naligai_to_time(body: NaligaiIn):
    try:
        lat, lon, tz = resolve_place(body.place, body.latitude, body.longitude, body.timezone)
        if body.time_correction not in (None, "", "none"):
            from backend.app.services.ephemeris import apply_time_correction
            tz = apply_time_correction(tz, body.date, "12:00:00", body.time_correction)
        return naligai_to_time(_date.fromisoformat(body.date), body.nazhigai, body.vinazhigai,
                               body.tharparai, lat, lon, tz)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/utilities/tamil-date")
def util_tamil_date(body: TamilDateIn):
    try:
        lat, lon, tz = resolve_place(body.place, body.latitude, body.longitude, body.timezone)
        return tamil_date(_date.fromisoformat(body.date), body.time, lat, lon, tz)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ---------------------------------------------------------------------------
# KP system (Phase 4)
# ---------------------------------------------------------------------------
@router.post("/kp")
def kalai_kp(req: GenerateChartRequest):
    from backend.app.services.ephemeris import apply_time_correction, get_julian_day, kalai_ephemeris
    from backend.app.services.kalai_kp import compute_kp
    try:
        lat, lon, tz = resolve_place(req.place, req.latitude, req.longitude, req.timezone)
        if getattr(req, "time_correction", None) not in (None, "", "none"):
            tz = apply_time_correction(tz, req.date_of_birth, req.time_of_birth, req.time_correction)
        tob = req.time_of_birth if len(req.time_of_birth.split(":")) == 3 else f"{req.time_of_birth}:00"
        jd = get_julian_day(req.date_of_birth, tob, tz)
        with kalai_ephemeris(jd):
            out = compute_kp(jd, lat, lon, req.date_of_birth, tob)
        out["general"] = {"name": req.name, "date_of_birth": req.date_of_birth, "time_of_birth": tob,
                          "place": req.place, "latitude": round(lat, 4), "longitude": round(lon, 4), "timezone": tz}
        return out
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))



class KpHoraryIn(BaseModel):
    number: int = Field(ge=1, le=2193)
    name: str = ""
    system: str = "249"   # "249" or "2193"
    date: str
    time: str
    place: str = ""
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    time_correction: str | None = None


@router.post("/kp-horary")
def kalai_kp_horary(body: KpHoraryIn):
    from backend.app.services.ephemeris import apply_time_correction, get_julian_day, kalai_ephemeris
    from backend.app.services.kalai_kp import compute_kp_horary
    try:
        lat, lon, tz = resolve_place(body.place, body.latitude, body.longitude, body.timezone)
        if body.time_correction not in (None, "", "none"):
            tz = apply_time_correction(tz, body.date, body.time, body.time_correction)
        t = body.time if len(body.time.split(":")) == 3 else f"{body.time}:00"
        jd = get_julian_day(body.date, t, tz)
        with kalai_ephemeris(jd):
            out = compute_kp_horary(body.number, jd, lat, lon, body.date, t,
                                    level="subsub" if body.system == "2193" else "sub")
        out["general"] = {"name": body.name or "", "horary_number": body.number, "date_of_birth": body.date, "time_of_birth": t,
                          "place": body.place, "latitude": round(lat, 4), "longitude": round(lon, 4), "timezone": tz}
        return out
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ---------------------------------------------------------------------------
# Marriage matching — 12 poruthams (Phase 5)
# ---------------------------------------------------------------------------
class MatchPerson(BaseModel):
    name: str = ""
    date_of_birth: str
    time_of_birth: str
    place: str = ""
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    time_correction: str | None = None


class MatchIn(BaseModel):
    girl: MatchPerson
    boy: MatchPerson


@router.post("/matching")
def kalai_matching(body: MatchIn):
    from backend.app.services.kalai_matching import build_kalai_matching
    try:
        return build_kalai_matching(body.girl.model_dump(), body.boy.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))



# ---------------------------------------------------------------------------
# Baby names — Kalai report types (Phase 8)
# ---------------------------------------------------------------------------
class KalaiBabyIn(BaseModel):
    report_type: str = "star_numerology"
    sex: str = "boy"
    birth_date: str
    star: int | None = Field(default=None, ge=1, le=27)
    first_letter: str | None = None
    numerology_no: int | None = None
    initials: list[str] = []
    religion: str | None = "hindu"
    limit: int = Field(default=2000, ge=1, le=5000)


@router.post("/baby-names")
def kalai_baby_names_api(body: KalaiBabyIn):
    from backend.app.services.kalai_baby_names import kalai_baby_names
    try:
        return kalai_baby_names(body.report_type, body.sex, _date.fromisoformat(body.birth_date), body.star,
                                body.first_letter, body.numerology_no, body.initials, body.religion, limit=body.limit)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))



class KalaiNameImportIn(BaseModel):
    pdf_base64: str


@router.post("/import-names")
def kalai_import_names(body: KalaiNameImportIn):
    """Upload a Kalai baby-name printout (PDF, base64) to add its names to the bank."""
    import base64
    from backend.app.services.kalai_name_import import import_printout
    try:
        return import_printout(base64.b64decode(body.pdf_base64))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/name-bank-stats")
def kalai_name_bank_stats():
    from backend.app.services import name_db
    con = name_db._connect()
    try:
        rows = con.execute("SELECT source, gender, COUNT(*) AS c FROM baby_names GROUP BY source, gender").fetchall()
        return {"by_source_gender": [dict(r) for r in rows]}
    finally:
        con.close()


@router.get("/star-letters/{star}")
def kalai_star_letters(star: int):
    from backend.app.services.kalai_baby_names import star_letters
    if not 1 <= star <= 27:
        raise HTTPException(status_code=400, detail="star must be 1-27")
    return star_letters(star)
