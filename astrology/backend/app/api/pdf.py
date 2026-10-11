"""
Print-quality PDF service (WeasyPrint).

POST /api/pdf/generate           — the full documented payload (PdfRequest)
POST /api/pdf/kanitha            — birth details  → Kanitha Jathagam PDF
POST /api/pdf/kp                 — birth details  → KP Jathagam PDF
POST /api/pdf/porutham           — girl + boy     → 12-Porutham PDF
POST /api/pdf/baby-names         — baby-name form → Baby names & numerology PDF
The four shortcut routes build the same PdfRequest server-side from the site's
own engines and then use the identical renderer.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, ValidationError

from backend.app.services.pdf.schemas import PdfRequest
from backend.app.services.pdf.web import BROWSER_MODE

async def _read_format(format: Optional[str] = Query(None)) -> None:
    """`?format=html` returns the print-ready HTML page instead of a PDF (for hosts without the PDF engine)."""
    BROWSER_MODE.set(format == "html")


router = APIRouter(prefix="/pdf", tags=["pdf"], dependencies=[Depends(_read_format)])


def _file_response(data: bytes, filename: str) -> Response:
    if data[:4] == b"%PDF":
        return Response(content=data, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
    return Response(content=data, media_type="text/html; charset=utf-8", headers={"Cache-Control": "no-store"})


def _pdf_response(req: PdfRequest, filename: str) -> Response:
    from backend.app.services.pdf.render import render_pdf
    try:
        data = render_pdf(req)
    except (OSError, ImportError) as exc:  # Pango/GTK runtime or WeasyPrint missing (Windows, serverless) — explain clearly
        raise HTTPException(status_code=503, detail=f"The PDF engine is not available on this server: {exc}")
    safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", filename) or "report.pdf"
    return _file_response(data, safe)


@router.post("/generate")
def generate_pdf(req: PdfRequest):
    try:
        req.parsed_data()
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors())
    return _pdf_response(req, f"{req.feature_type}.pdf")


class Options(BaseModel):
    language: Literal["ta", "en"] = "ta"
    god_image: Literal["ganesha", "murugan", "om"] = "ganesha"
    chart_style: Literal["south", "north"] = "south"
    theme: Optional[Dict[str, Any]] = None   # colour / Tamil-style panel: ink, inkSoft, accent, gold, paper, paperCard, fontId
    mode: Optional[str] = None               # kanitha: full | single | custom · kp: all | type_a | custom
    sections: Optional[List[str]] = None     # custom: the report sections ticked by the user (kanitha / kp keys)
    page_size: Literal["A4", "A5"] = "A4"    # full / custom Kanitha and KP: A4 or A5 book


class BirthPdfIn(Options):
    birth: Dict[str, Any]


class PoruthamPdfIn(Options):
    girl: Dict[str, Any]
    boy: Dict[str, Any]


class BabyPdfIn(Options):
    form: Dict[str, Any]


def _place_for(d: Dict[str, Any], lang: str) -> Dict[str, Any]:
    """Tamil PDF: an English place is printed with its Tamil name (ta_text.place_ta).
    Only when latitude and longitude are given — the place string is then not
    used for geocoding, so the Tamil text can never move the chart."""
    if lang != "ta" or not isinstance(d, dict) or d.get("latitude") is None or d.get("longitude") is None:
        return d
    from backend.app.services.pdf.ta_text import place_ta
    return {**d, "place": place_ta(d.get("place"))}


def _tz_hours(tz: str, date_str: str) -> float:
    try:
        from zoneinfo import ZoneInfo
        from datetime import datetime
        if str(tz).upper().startswith("UTC"):
            s = str(tz)[3:]
            sign = -1 if s.startswith("-") else 1
            h, m = (s.lstrip("+-").split(":") + ["0"])[:2]
            return sign * (int(h) + int(m) / 60)
        return datetime.fromisoformat(date_str + "T12:00:00").replace(tzinfo=ZoneInfo(tz)).utcoffset().total_seconds() / 3600
    except Exception:
        return 5.5


@router.post("/kanitha")
def kanitha_pdf(body: BirthPdfIn):
    if (body.mode or "full") == "single":
        # ஒரு பக்க ஜாதகம்: exactly one A4 sheet (Kalai single-page layout)
        from backend.app.services.geocode import resolve_place
        from backend.app.services.kalai_report import build_kalai_report
        from backend.app.services.pdf.builders import _theme
        from backend.app.services.pdf.render_single import render_single_pdf
        b = _place_for(body.birth, body.language)
        try:
            lat, lon, tz = resolve_place(b.get("place", ""), b.get("latitude"), b.get("longitude"), b.get("timezone"))
            tob = b["time_of_birth"] if len(b["time_of_birth"].split(":")) == 3 else b["time_of_birth"] + ":00"
            r = build_kalai_report(b.get("name", ""), b["date_of_birth"], tob, b.get("place", ""), lat, lon, tz,
                                   panchangam_system=b.get("panchangam_system") or "thirukkanitham")
            bio = b.get("bio_data") or {}
            data = render_single_pdf(r, body.language, _theme(body.theme), _tz_hours(tz, b["date_of_birth"]),
                                     b.get("father_name") or bio.get("father_name") or "", b.get("mother_name") or bio.get("mother_name") or "",
                                     god_image=body.god_image, chart_style=body.chart_style)
        except (KeyError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except (OSError, ImportError) as exc:
            raise HTTPException(status_code=503, detail=f"The PDF engine is not available on this server: {exc}")
        name = re.sub(r"[^A-Za-z0-9_.-]+", "_", f"oru-pakka-jathagam-{b.get('name', 'report')}.pdf")
        return _file_response(data, name)
    from backend.app.services.pdf.builders import kanitha_request
    try:
        req = kanitha_request(_place_for(body.birth, body.language), body.language, body.god_image, body.chart_style, body.theme, body.mode or "full",
                              sections=body.sections, page_size=body.page_size)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _pdf_response(req, f"kanitha-jathagam-{body.birth.get('name', 'report')}.pdf")


@router.post("/kp")
def kp_pdf(body: BirthPdfIn):
    from backend.app.services.pdf.builders import kp_request
    try:
        req = kp_request(_place_for(body.birth, body.language), body.language, body.god_image, body.chart_style, body.theme, body.mode or "all",
                         sections=body.sections, page_size=body.page_size)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _pdf_response(req, f"kp-jathagam-{body.birth.get('name', 'report')}.pdf")


@router.post("/porutham")
def porutham_pdf(body: PoruthamPdfIn):
    from backend.app.services.pdf.builders import porutham_request
    try:
        req = porutham_request(_place_for(body.girl, body.language), _place_for(body.boy, body.language), body.language, body.god_image, body.chart_style, body.theme)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _pdf_response(req, "porutham.pdf")


@router.post("/baby-names")
def baby_pdf(body: BabyPdfIn):
    from backend.app.services.pdf.builders import baby_request
    try:
        req = baby_request(body.form, body.language, body.god_image, body.theme)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _pdf_response(req, "baby-names.pdf")



@router.post("/kp-horary")
def kp_horary_pdf(body: BabyPdfIn):
    """{ form: {number, system, date, time, latitude, longitude, timezone, place}, language, god_image, theme }"""
    from backend.app.services.pdf.builders import kp_horary_request
    try:
        req = kp_horary_request(_place_for(body.form, body.language), body.language, body.god_image, body.chart_style, body.theme)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _pdf_response(req, f"kp-horary-{body.form.get('number', '')}.pdf")
