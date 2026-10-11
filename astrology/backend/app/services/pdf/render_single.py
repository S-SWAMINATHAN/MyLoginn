"""
ஒரு பக்க ஜாதகம் — ONE A4 sheet, laid out like Kalai's single-page horoscope
(Thirukanitam_single_page.pdf):

  ஓம் நமச்சிவாய + two invocation lines            (date at the right)
  details in two label : value columns (left: name … udhayadi nazhigai,
  right: place, latitude … time zone)
  திருக்கணித கிரக ஸ்புடம் — two side-by-side planet tables
  ராசி and நவாம்சம் charts side by side
  பாவக மாற்றம் · ஜனன கால தசை இருப்பு · நடப்பு தசா புக்தி · name numbers · star letters
  சுபம்

No cover, contents, prayer or closing pages. Colours and typeface follow the
Jathagam panel (PdfTheme): the double page border, headings and text. Two small
deity pictures (transparent PNG, embedded unchanged) sit in the top corners; the
charts are the fixed sample artwork (chart_art) in South or North style; every
detail label carries its cyan-blue icon (icons). Everything fits one page.
"""
from __future__ import annotations

import html
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.app.services.pdf.builders import star_en
from backend.app.services.pdf.chart_art import chart_css, north_chart_html, south_chart_html, use_chart_theme
from backend.app.services.pdf.icons import ICON_CSS, icon
from backend.app.services.pdf.render import FONT_DIR, _find_deity_file, _font_file
from backend.app.services.pdf.schemas import PdfTheme
from backend.app.services.pdf.ta_text import TIME_CORRECTION_TA, dms_dir_ta, time_ta, tz_ta

SIGN_POS = {12: (1, 1), 1: (1, 2), 2: (1, 3), 3: (1, 4), 11: (2, 1), 4: (2, 4),
            10: (3, 1), 5: (3, 4), 9: (4, 1), 8: (4, 2), 7: (4, 3), 6: (4, 4)}
SH_TA = {"Sun": "சூரி", "Moon": "சந்", "Mars": "செவ்", "Mercury": "புத", "Jupiter": "குரு", "Venus": "சுக்",
         "Saturn": "சனி", "Rahu": "ராகு", "Ketu": "கேது", "Lagna": "லக்", "Mandi": "மாந்"}
SH_EN = {"Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me", "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa",
         "Rahu": "Ra", "Ketu": "Ke", "Lagna": "Asc", "Mandi": "Md"}


def e(x: Any) -> str:
    return html.escape("" if x is None else str(x))


def _ampm(t: str) -> str:
    h, m, *s = [int(x) for x in t.split(":")]
    return f"{(h % 12) or 12:02d}.{m:02d}.{(s[0] if s else 0):02d} {'AM' if h < 12 else 'PM'}"


def _gmt(dob: str, tob: str, tz_hours: float) -> str:
    dt = datetime.fromisoformat(f"{dob}T{tob if len(tob.split(':')) == 3 else tob + ':00'}") - timedelta(hours=tz_hours)
    return dt.strftime("%I.%M.%S %p")


def _short_place(place: str) -> str:
    """Only the place the user typed — "உடுமலைபேட்டை, தமிழ்நாடு, இந்தியா" → "உடுமலைபேட்டை",
    "Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India" → "Udumalaipettai"."""
    parts = [x.strip() for x in str(place or "").split(",") if x.strip()]
    return parts[0] if parts else ""


def _chart(cells: Dict[str, List[str]], title: str, lang: str, style: str = "south") -> str:
    sh = SH_TA if lang == "ta" else SH_EN
    short = {str(k): [sh.get(p, p) for p in v] for k, v in cells.items()}
    if style == "north":
        lagna = next((int(k) for k, v in cells.items() if "Lagna" in v), 1)
        return north_chart_html(title, short, lagna)
    return south_chart_html(title, short)


def _deity(kind: str, side: str) -> str:
    path = _find_deity_file(kind)
    if not path:
        return ""
    return f'<img class="deity {side}" src="{Path(path).resolve().as_uri()}" alt=""/>'


def _logo(h_mm: float) -> str:
    path = Path(FONT_DIR).parent / "assets" / "logo.png"
    if not path.exists():
        return ""
    return f'<img src="{path.resolve().as_uri()}" style="height:{h_mm}mm;width:auto;vertical-align:middle;margin-right:2mm" alt=""/>'


def _with_mandi(r: Dict[str, Any]) -> Dict[str, List[str]]:
    cells = {str(k): list(v) for k, v in r["rasi_chart"].items()}
    md = next((x for x in r["graha_spudam"] if x["planet"] == "Mandi"), None)
    if md and not any("Mandi" in v for v in cells.values()):
        cells.setdefault(str(int(md["longitude"] // 30) + 1), []).append("Mandi")
    return cells


def build_single_html(r: Dict[str, Any], lang: str, theme: Optional[PdfTheme] = None, tz_hours: float = 5.5,
                      father: str = "", mother: str = "", god_image: str = "ganesha", chart_style: str = "south") -> str:
    theme = theme or PdfTheme()
    g = r["general"]
    sp = r.get("single_page") or {}
    ta = lang == "ta"
    L = lambda a, b: a if ta else b
    dob = g["date_of_birth"]
    dd = "-".join(reversed(dob.split("-")))
    sun = next((x["longitude"] for x in r["graha_spudam"] if x["planet"] == "Sun"), 0)
    ayanam = L("உத்தராயணம்" if (sun >= 270 or sun < 90) else "தட்சிணாயனம்", "Uttarayana" if (sun >= 270 or sun < 90) else "Dakshinayana")
    if ta:   # Tamil page: every word in Tamil (numbers unchanged)
        tz_label = tz_ta(g.get("timezone"), tz_hours)
    else:
        tz_label = f'{int(tz_hours):02d}.{int(round((tz_hours % 1) * 60)):02d}E Indian Standard Time' if tz_hours == 5.5 else str(g.get("timezone"))
    T = time_ta if ta else (lambda x: x)
    D = dms_dir_ta if ta else (lambda x: x)
    left = [
        (L("பெயர்", "Name"), g.get("name") or ""), (L("தந்தை பெயர்", "Father's name"), father or g.get("father_name") or ""),
        (L("தாயார் பெயர்", "Mother's name"), mother or g.get("mother_name") or ""),
        (L("பிறந்த தேதி", "Date of birth"), f'{dd} {(g.get("weekday_ta") or "").replace("க்கிழமை", "") if ta else g.get("weekday_en", "")}'),
        (L("தமிழ் தேதி", "Tamil date"), g.get("tamil_date_ta") if ta else g.get("tamil_date_en")),
        (L("பிறந்த நேரம்", "Time of birth"), f'{T(_ampm(g["time_of_birth"]))} ({L("கிரீன்விச்", "GMT")} {T(_gmt(dob, g["time_of_birth"], tz_hours))})'),
        (L("நட்சத்திர ஹோரை", "Sidereal time"), g.get("nakshatra_horai")),
        (L("அயனாம்சம்", "Ayanamsa"), f'{g.get("ayanamsa_dms")} ({L("வாக்கியம்", "Vakkiyam") if g.get("is_vakkiyam") else L("லஹரி", "Lahiri")})'),
        (L("சூரிய உதயம்", "Sunrise"), f'{T(g.get("sun_rise"))} ({g.get("sunrise_method_ta") if ta else "disc centre"})'),
        (L("சூரிய அஸ்தமனம்", "Sunset"), f'{T(g.get("sun_set"))} ({g.get("sunrise_method_ta") if ta else "disc centre"})'),
        (L("நேர திருத்தம்", "Time correction"), L(TIME_CORRECTION_TA, "Standard Time (No Correction)")),
    ]
    right = [
        (L("பிறந்த ஊர்", "Place of birth"), _short_place(g.get("place") or "")), (L("அட்சாம்சம்", "Latitude"), D(g.get("latitude_dms"))),
        (L("தீர்க்காம்சம்", "Longitude"), D(g.get("longitude_dms"))),
        (L("ஜன்ம நட்சத்திரம்", "Birth star"), f'{g.get("janma_nakshatra_ta") if ta else g.get("janma_nakshatra_en")} {L("பாதம்", "pada")} {g.get("pada")}'),
        (L("ஜன்ம ராசி", "Moon sign"), g.get("janma_rasi_ta") if ta else g.get("janma_rasi_en")),
        (L("ஜன்ம லக்னம்", "Lagna"), g.get("lagna_ta") if ta else g.get("lagna_en")),
        (L("திதி", "Tithi"), g.get("thithi_ta") if ta else g.get("thithi_en")),
        (L("யோகம்", "Yogam"), g.get("yogam_ta") if ta else g.get("yogam_en")),
        (L("கரணம்", "Karanam"), g.get("karanam_ta") if ta else g.get("karanam_en")),
        (L("அயனம்", "Ayanam"), ayanam),
        (L("நேர மண்டலம்", "Time zone"), tz_label),
    ]
    det = "".join(
        f'<tr><td class="k">{icon(a)}{e(a)}</td><td class="c">:</td><td class="v">{e(b)}</td>'
        f'<td class="gap"></td><td class="k">{icon(c)}{e(c)}</td><td class="c">:</td><td class="v">{e(d)}</td></tr>'
        for (a, b), (c, d) in zip(left, right))
    udh = L("உதயாதி நாழிகை", "Udhayadi nazhigai")
    det += (f'<tr><td class="k">{icon(udh)}{e(udh)}</td><td class="c">:</td>'
            f'<td class="v" colspan="5">{e(g.get("udhayadhi_nazhigai") if ta else g.get("udhayadhi_nazhigai_en"))} {dd}</td></tr>')

    rows = [x for x in r["graha_spudam"]]
    half = (len(rows) + 1) // 2

    def ptable(items):
        body = "".join(
            f'<tr><td>{e(x["planet_ta"] if ta else x["planet"])}{e(" (வ)" if ta and x.get("retrograde") else " (R)" if x.get("retrograde") else "")}</td>'
            + "".join(f'<td class="n">{e(v)}</td>' for v in (x["longitude_dms"].split() + ["", "", ""])[:3])
            + f'<td>{e(x.get("nakshatra_ta") if ta else star_en(x))}</td><td class="n">{e(x.get("pada"))}</td></tr>'
            for x in items)
        return (f'<table class="pt"><colgroup><col style="width:25%"><col style="width:9%"><col style="width:8%"><col style="width:8%">'
                f'<col style="width:36%"><col style="width:14%"></colgroup><thead><tr><th>{e(L("கிரகம்", "Planet"))}</th>'
                f'<th colspan="3" class="n">{e(L("பாகை", "Longitude"))}</th><th>{e(L("நட்சத்திரம்", "Star"))}</th><th class="n">{e(L("பாதம்", "Pada"))}</th></tr></thead>'
                f'<tbody>{body}</tbody></table>')

    moves = sp.get("bhava_moves") or []
    cur = sp.get("current_dasa_bhukti")
    bal = (r.get("dasa_balance") or {})
    bottom = [
        (L("பாவக மாற்றம்", "Bhava change"), " ".join(f'{m["planet_ta"]}({m["bhava_sign_ta"]})' for m in moves) or L("இல்லை", "None")),
        (L("ஜனன கால தசை இருப்பு", "Dasa balance at birth"),
         str((bal.get("kalai_ta") or bal.get("formatted_ta")) if ta else bal.get("formatted_en") or "")
         .replace("ஜனன கால தசை இருப்பு", "").replace("Dasa balance at birth", "").strip(" :-")),
    ]
    if cur:
        bottom.append((L("நடப்பு தசா புக்தி முடிவு தேதி", "Current dasa-bhukti ends"),
                       f'{cur["dasa_ta"]} தசா {cur["bhukti_ta"]} புக்தி {cur["end"]}' if ta else f'{cur["dasa"]} dasa {cur["bhukti"]} bhukti {cur["end"]}'))
    if sp.get("name_numbers"):
        bottom.append((L("நியுமராலஜிப்படி பெயரின் கூட்டு எண்", "Name numbers by numerology"), "-".join(map(str, sp["name_numbers"]))))
    if sp.get("star_letters"):
        bottom.append((L("நட்சத்திரப்படி பெயரின் முதல் எழுத்து", "First letters by star"), sp["star_letters"]["display"]))
    bot = "".join(f'<tr><td class="k">{icon(a)}{e(a)}</td><td class="c">:</td><td class="v">{e(b)}</td></tr>' for a, b in bottom)

    font = Path(_font_file(theme.font_id)).resolve().as_uri()
    base = Path(Path(FONT_DIR) / "NotoSansTamil.ttf").resolve().as_uri()
    # two corner pictures: Vinayagar first (as every jathagam begins), the chosen deity on the right
    left_god = "ganesha"
    right_god = god_image if god_image in ("murugan", "om") else "murugan"
    css = f"""
@font-face {{ font-family: "Panel"; src: url("{font}"); }}
@font-face {{ font-family: "Base"; src: url("{base}"); }}
@page {{ size: A4; margin: 7mm; background: {theme.paper}; border: 3pt double {theme.gold}; padding: 3.2mm 4.5mm; }}
html {{ font-family: "Panel", "Base", sans-serif; font-size: 9pt; color: {theme.ink}; line-height: 1.3; }}
body {{ margin: 0; }}
/* the bordered sheet fills the page exactly (A4 297 − 2×7 margin − 2×1.06 border − 2×3.2 padding ≈ 274.5 mm);
   spare height is shared evenly between the blocks, so the top and bottom inner spaces match */
.sheet {{ border: 0.8pt solid {theme.accent}; padding: 2.4mm 2.6mm; height: 274mm; box-sizing: border-box;
          display: flex; flex-direction: column; justify-content: space-between; }}
.sheet > * {{ flex: 0 0 auto; }}
.top {{ width: 100%; table-layout: fixed; margin-bottom: 2.5mm; }}
.top td {{ vertical-align: middle; padding: 0; }}
.top td.side {{ width: 22mm; text-align: center; }}
.top td.mid {{ text-align: center; }}
.top .om {{ color: {theme.accent}; font-weight: 700; font-size: 10.5pt; }}
.top .inv {{ font-size: 8.8pt; }}
.top .date {{ font-size: 8pt; text-align: right; margin-top: 0.6mm; }}
img.deity {{ height: 17mm; width: auto; max-width: 21mm; object-fit: contain; display: inline-block; }}
table {{ border-collapse: collapse; width: 100%; table-layout: fixed; }}
td, th {{ vertical-align: top; padding: 0.6pt 2pt; overflow-wrap: anywhere; }}
.det td.c {{ text-align: center; }}
.det td {{ padding: 0.75pt 2pt; }}
h3 {{ text-align: center; font-size: 10pt; color: {theme.accent}; margin: 3mm 0 1.4mm 0; font-weight: 700; }}
.pts {{ display: flex; gap: 6mm; }}
.pts > div {{ flex: 1 1 0; min-width: 0; }}
.pt td {{ white-space: nowrap; padding: 0.7pt 2pt; }}
.pt th {{ text-align: left; white-space: nowrap; border-bottom: 0.7pt solid {theme.ink}; border-top: 0.7pt solid {theme.ink}; color: {theme.accent}; font-weight: 600; }}
.pt tbody tr:last-child td {{ border-bottom: 0.7pt solid {theme.ink}; }}
.n {{ text-align: right; font-variant-numeric: tabular-nums; }}
.charts {{ display: flex; justify-content: space-around; margin-top: 4mm; }}
.charts .chart {{ width: 78mm; }}
.charts .south {{ height: 78mm; }}
.charts .south .cell {{ font-size: 9.4pt; }}
.charts .north .nbox {{ width: 78mm; height: 78mm; }}
.bot {{ margin-top: 3.5mm; }}
.bot td.k {{ width: 44%; }} .bot td.c {{ width: 2%; text-align: center; }}
.bot td {{ padding: 0.75pt 2pt; }}
.subam {{ text-align: center; margin-top: 2mm; color: {theme.accent}; font-weight: 700; }}
.foot {{ text-align: center; margin-top: 2.5mm; padding-top: 1.5mm; border-top: 0.6pt solid {theme.gold}; font-size: 8.5pt; }}
"""
    css += chart_css(theme.accent, theme.ink, '"Panel", "Base"') + ICON_CSS
    use_chart_theme(theme.accent, theme.ink)
    rasi_t, nav_t = L("ராசி", "Rasi"), L("நவாம்சம்", "Navamsa")
    return f"""<!DOCTYPE html><html lang="{lang}"><head><meta charset="utf-8"/><title>{e(L("ஒரு பக்க ஜாதகம்", "Single-page horoscope"))}</title>
<style>{css}</style></head><body><div class="sheet">
<table class="top"><tr><td class="side">{_deity(left_god, "l")}</td>
<td class="mid"><div class="om">ஓம் நமச்சிவாய</div>
<div class="inv">ஜெனனீ ஜென்ம சௌக்கியானாம் வர்த்தனீ குல சம்பதாம்<br/>பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்திரிகா</div>
<div class="date">{date.today().strftime("%d-%m-%Y")}</div></td>
<td class="side">{_deity(right_god, "r")}</td></tr></table>
<table class="det"><colgroup><col style="width:22.4%"><col style="width:1.4%"><col style="width:27.6%"><col style="width:0.8%"><col style="width:20%"><col style="width:1.4%"><col style="width:26.4%"></colgroup>{det}</table>
<h3>{e(L("வாக்கிய கிரக ஸ்புடம் (நிராயனம்)", "Vakkiyam planetary positions (sidereal)") if g.get("is_vakkiyam") else L("திருக்கணித கிரக ஸ்புடம் (நிராயனம்)", "Thirukanitham planetary positions (sidereal)"))}</h3>
<div class="pts"><div>{ptable(rows[:half])}</div><div>{ptable(rows[half:])}</div></div>
<div class="charts">{_chart(_with_mandi(r), rasi_t, lang, chart_style)}{_chart(r["navamsa_chart"], nav_t, lang, chart_style)}</div>
<table class="bot">{bot}</table>
<div class="subam">{e(L("சுபம்", "Subham"))}</div>
<div class="foot">{_logo(9)} MyLoginn Astrology</div>
</div></body></html>"""


def render_single_pdf(r: Dict[str, Any], lang: str, theme: Optional[PdfTheme] = None, tz_hours: float = 5.5,
                      father: str = "", mother: str = "", god_image: str = "ganesha", chart_style: str = "south") -> bytes:
    from backend.app.services.pdf.web import BROWSER_MODE, browser_html
    page = build_single_html(r, lang, theme, tz_hours, father, mother, god_image, chart_style)
    if BROWSER_MODE.get():  # format=html: the browser prints the page (no WeasyPrint on this host)
        return browser_html(page).encode("utf-8")
    from weasyprint import HTML
    return HTML(string=page, base_url=FONT_DIR).write_pdf()
