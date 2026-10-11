"""
HTML/CSS builder + WeasyPrint renderer for the four printable features.

Design (from the owner's brief):
  • A4, 0.6 in margins, ivory paper (#FDF6E2) on every page, thin double gold
    border drawn by the @page box itself so it repeats on every page.
  • Accents: deep maroon #800000, royal navy #1A365D, matte gold #D4AF37.
  • Cover page (@page:first): deity line-art slot, bilingual title, birth
    profile box; no header/footer.
  • Inner pages: running subtitle + rule at the top, "Page X of Y" bottom-right.
  • Robust layout: table-layout fixed + percentage widths, wrapping cells,
    break-inside: avoid on charts, rows, dasa blocks and the verdict box,
    break-before: page for major sections.
Tamil shaping comes from HarfBuzz inside WeasyPrint/Pango; the bundled
Noto Sans Tamil (OFL) is used so the output does not depend on system fonts.
"""
from __future__ import annotations

import html
import os
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence

from backend.app.services.pdf.chart_art import chart_css, north_chart_html, south_chart_html, use_chart_theme
from backend.app.services.pdf.icons import ICON_CSS, icon
from backend.app.services.pdf.schemas import (
    BabyData, ChartGrid, ChartSet, DasaBlock, KanithaData, KeyValue, KpData, PdfRequest, PdfTheme, PoruthamData,
    SimpleTable, TextSection,
)

APP_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT_DIR = os.path.join(APP_DIR, "fonts")
DEITY_DIR = os.path.join(APP_DIR, "assets", "deity")

# Tamil-style panel id -> bundled font file (frontend lib/jathagamTheme.tsx -> TAMIL_FONTS).
# "kavivanar" is the kept handwriting face (SIL OFL). The 13 "mla-NNN" faces are the
# owner's STMZH fonts converted to Unicode OpenType (app/fonts/MLATamil-NNN.ttf).
PANEL_FONTS = {
    "kavivanar": "Kavivanar-Regular.ttf",
    "mla-090": "MLATamil-090.ttf",
    "mla-138": "MLATamil-138.ttf",
    "mla-089": "MLATamil-089.ttf",
    "mla-133": "MLATamil-133.ttf",
    "mla-108": "MLATamil-108.ttf",
    "mla-111": "MLATamil-111.ttf",
    "mla-103": "MLATamil-103.ttf",
    "mla-123": "MLATamil-123.ttf",
    "mla-144": "MLATamil-144.ttf",
    "mla-105": "MLATamil-105.ttf",
    "mla-126": "MLATamil-126.ttf",
    "mla-130": "MLATamil-130.ttf",
    "mla-132": "MLATamil-132.ttf",
}


def _font_file(font_id: str) -> str:
    # Unknown / old ids (e.g. a request without a panel choice) keep the previous
    # behaviour: Noto Sans Tamil.
    name = PANEL_FONTS.get(font_id, "NotoSansTamil.ttf")
    path = os.path.join(FONT_DIR, name)
    if not os.path.exists(path):
        path = os.path.join(FONT_DIR, "NotoSansTamil.ttf")
    return path


# --- dasa card text size per typeface ---------------------------------------
# A dasa / antharam card row ("செவ்வாய் 17-06-2015 110 10 11") must fit inside one
# of three cards. The panel typefaces differ a lot in width (MLA 105 is about twice
# as wide as Noto Sans Tamil), and CSS cannot shrink text to fit, so the row is
# measured with the typeface's own glyph advances (fontTools; characters missing in
# the panel font are measured in Noto Sans Tamil, as the PDF falls back to it) and
# the card text size is chosen so the widest row fits.
_DASA_SAMPLE = ("செவ்வாய்", "17-06-2015", "110", "10", "11")
_ADV_CACHE: Dict[str, Any] = {}


def _advance_em(path: str, text: str) -> float:
    """Unshaped advance width of `text` in em (good enough to size, with margin)."""
    from fontTools.ttLib import TTFont

    def load(pth):
        if pth not in _ADV_CACHE:
            f = TTFont(pth, lazy=True)
            _ADV_CACHE[pth] = (f.getBestCmap() or {}, f["hmtx"].metrics, f["head"].unitsPerEm)
        return _ADV_CACHE[pth]
    cmap, hmtx, upm = load(path)
    bcmap, bhmtx, bupm = load(os.path.join(FONT_DIR, "NotoSansTamil.ttf"))
    total = 0.0
    for ch in text:
        cp = ord(ch)
        if 0x0BCD == cp or 0x0B82 == cp:      # pulli / anusvara: drawn over the letter, no width of their own
            continue
        if cp in cmap and cmap[cp] in hmtx:
            total += hmtx[cmap[cp]][0] / upm
        elif cp in bcmap and bcmap[cp] in bhmtx:
            total += bhmtx[bcmap[cp]][0] / bupm
        else:
            total += 0.55
    return total


_TABLE_SAMPLE = ("பாகை", "கலை", "விகலை", "நட்சத்திரம்", "பாதம்", "மேஷம்", "மொத்தம்", "168", "57", "255.00")


def width_ratio(font_id: str) -> float:
    """How much narrower than Noto Sans Tamil the panel typeface sets table text
    (1.0 = as wide or narrower). Wide decorative faces get a smaller table face
    so headers such as பாதம் / விகலை fit their column instead of breaking."""
    try:
        base = sum(_advance_em(os.path.join(FONT_DIR, "NotoSansTamil.ttf"), t) for t in _TABLE_SAMPLE)
        cur = sum(_advance_em(_font_file(font_id), t) for t in _TABLE_SAMPLE)
        r = base / cur if cur else 1.0
        # unshaped advances underestimate the wide decorative faces (their ligatures are
        # wider than the sum of the letters) by about 10 % — measured on MLA 105 / 130
        return max(0.6, min(1.0, r * 0.9 if r < 1 else 1.0))
    except Exception:
        return 1.0


def dasa_font_pt(font_id: str, page_size: str = "A4") -> float:
    """Card text size (pt) so the widest card row fits, never above the design size."""
    # text room in one card: A4 content 484.6 pt − 2 gaps (10 pt) / 3 − card padding
    # and border − cell paddings; A5 CSS page (182 mm) likewise with its own sizes
    room, cap = (112.0, 7.6) if page_size != "A5" else (94.0, 6.5)
    try:
        em = sum(_advance_em(_font_file(font_id), t) for t in _DASA_SAMPLE)
    except Exception:
        return cap
    return round(max(5.2, min(cap, room / (em * 1.06))), 2)   # 6 % safety margin


DEITY_ALIASES = {
    "ganesha": ["ganesha", "ganesh", "ganapathi", "ganapati", "vinayagar", "vinayaka", "pillaiyar", "pillayar", "vinayak"],
    "murugan": ["murugan", "muruga", "murugar", "karthikeya", "subramanya", "vel"],
    "om": ["om", "aum", "omkar", "ohm"],
}
IMAGE_EXT = (".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff")


def _find_deity_file(kind: str) -> Optional[str]:
    """Owner's picture in app/assets/deity. Matches the file name (any case) to the
    choice or a common alias, e.g. Vinayagar.PNG, murugan.jpeg, OM.svg."""
    if not os.path.isdir(DEITY_DIR):
        return None
    names = DEITY_ALIASES.get(kind, [kind])
    files = [f for f in os.listdir(DEITY_DIR) if f.lower().endswith(IMAGE_EXT)]
    for alias in names:                       # exact stem first
        for f in files:
            if os.path.splitext(f)[0].lower() == alias:
                return os.path.join(DEITY_DIR, f)
    for alias in names:                       # then stem containing the alias
        for f in files:
            if alias in os.path.splitext(f)[0].lower():
                return os.path.join(DEITY_DIR, f)
    return None


def _deity_image(kind: str) -> str:
    """Embed the original file unchanged (vector stays vector, raster keeps every pixel)."""
    path = _find_deity_file(kind)
    if not path:
        return ""
    uri = Path(path).resolve().as_uri()
    return f'<img src="{uri}" style="width:4.6cm;height:4.6cm;object-fit:contain" alt="{e(kind)}"/>'


SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்",
           "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]
SIGN_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
           "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
# South-Indian grid: (row, col) of each sign (1-based sign numbers)
SOUTH_POS = {12: (0, 0), 1: (0, 1), 2: (0, 2), 3: (0, 3), 11: (1, 0), 4: (1, 3),
             10: (2, 0), 5: (2, 3), 9: (3, 0), 8: (3, 1), 7: (3, 2), 6: (3, 3)}

T = {
    "ta": {"page": "பக்கம்", "of": "/", "name": "பெயர்", "dob": "பிறந்த தேதி", "tob": "பிறந்த நேரம்",
           "pob": "பிறந்த ஊர்", "gender": "பாலினம்", "basic": "பொது விவரங்கள்", "bio": "சுய விவரம்",
           "planets": "கிரக ஸ்புடம்", "charts": "ராசி & நவாம்சம்", "dasa": "விம்சோத்தரி தசா புக்தி",
           "balance": "ஜனன கால தசை இருப்பு", "start": "ஆரம்பம்", "end": "முடிவு", "bhukti": "புக்தி",
           "age": "வ மா நா", "kp_planets": "கிரக அட்டவணை (கே.பி)", "kp_cusps": "பாவ அட்டவணை (கே.பி)",
           "house": "பாவம்", "planet": "கிரகம்", "position": "பா க வி", "sign_lord": "ராசி அதிபதி",
           "star_lord": "நட்சத்திர அதிபதி", "sub_lord": "உப அதிபதி", "subsub_lord": "உ.உ. அதிபதி",
           "signif": "காரக கிரகங்கள்", "by_star": "நட்சத்திரப்படி", "by_sub": "உபநட்சத்திரப்படி",
           "aspected": "பார்க்கும் கிரகங்கள்", "porutham": "திருமணப் பொருத்தம்", "match": "பொருத்தம்",
           "girl": "பெண்", "boy": "ஆண்", "max": "அதிகபட்சம்", "got": "பெற்றது", "status": "நிலை",
           "total": "மொத்தம்", "verdict": "முடிவு", "baby": "குழந்தை பெயர் & நியுமராலஜி",
           "date_no": "பிறந்த தேதி எண்", "destiny_no": "தேதியின் கூட்டு எண்", "allowed": "அமைக்க வேண்டிய பெயர் எண்கள்",
           "letters": "நட்சத்திரப்படி முதல் எழுத்துக்கள்", "initials": "இனிசியல்", "names": "பரிந்துரைக்கப்படும் பெயர்கள்",
           "meaning": "எண்களின் பொருள்", "letter_table": "எழுத்து எண் அட்டவணை", "sex": "பாலினம்",
           "ayanamsa": "அயனாம்சம்", "star": "நட்சத்திரம்", "kp": "கே.பி ஜாதகம்"},
    "en": {"page": "Page", "of": "of", "name": "Name", "dob": "Date of Birth", "tob": "Time of Birth",
           "pob": "Place of Birth", "gender": "Gender", "basic": "Basic Details", "bio": "Bio Data",
           "planets": "Planetary Positions", "charts": "Rasi & Navamsam", "dasa": "Vimshottari Dasa – Bhukti",
           "balance": "Dasa balance at birth", "start": "Start", "end": "End", "bhukti": "Bhukti",
           "age": "Y M D", "kp_planets": "KP Planet Table", "kp_cusps": "KP Cusp Table", "house": "House",
           "planet": "Planet", "position": "D M S", "sign_lord": "Sign Lord", "star_lord": "Star Lord",
           "sub_lord": "Sub-Lord", "subsub_lord": "Sub-Sub-Lord", "signif": "Significators",
           "by_star": "By star", "by_sub": "By sub", "aspected": "Aspected by", "porutham": "Marriage Matching",
           "match": "Porutham", "girl": "Girl", "boy": "Boy", "max": "Max", "got": "Obtained",
           "status": "Status", "total": "Total", "verdict": "Verdict", "baby": "Baby Names & Numerology",
           "date_no": "Birth (date) number", "destiny_no": "Destiny number", "allowed": "Allowed name numbers",
           "letters": "First letters by star", "initials": "Initials", "names": "Suggested names",
           "meaning": "Meaning of the numbers", "letter_table": "Letter-value table", "sex": "Sex",
           "ayanamsa": "Ayanamsa", "star": "Star", "kp": "KP Horoscope"},
}

TITLES = {
    "kanitha_jathagam": ("மங்கள ஜாதகம்", "Comprehensive Horoscope"),
    "kp_jathagam": ("கே.பி ஜாதகம்", "KP Horoscope"),
    "thirumana_porutham": ("திருமணப் பொருத்தம்", "Marriage Compatibility"),
    "baby_numerology": ("குழந்தை பெயர் & நியுமராலஜி", "Baby Names & Numerology"),
}


def css_str(s: object) -> str:
    """Text for a CSS content string: no HTML entities, quotes escaped."""
    return ("" if s is None else str(s)).replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")


def e(s: object) -> str:
    return html.escape("" if s is None else str(s))


# --------------------------------------------------------------------------
# Deity / emblem line art (original simple SVG line drawings)
# --------------------------------------------------------------------------
END_CSS = """
.end-logo { text-align: center; margin-top: 22pt; padding-top: 12pt; break-inside: avoid; }
.end-logo img { display: inline-block; }
.end-name { font-size: 9pt; color: #5E5E5E; margin-top: 4pt; letter-spacing: 0.6pt; }
"""


def _logo_img(height_mm: float) -> str:
    """Site logo — transparent PNG, 1534 px wide (≈1000 dpi at 26 mm), embedded
    unchanged, so it stays sharp on the paper colour of every palette."""
    path = os.path.join(APP_DIR, "assets", "logo.png")
    if not os.path.exists(path):
        return ""
    return f'<img src="{Path(path).resolve().as_uri()}" style="height:{height_mm}mm;width:auto" alt="MyLoginn"/>'


def deity_svg(kind: str) -> str:
    img = _deity_image(kind)
    if img:
        return img
    gold, maroon = "#D4AF37", "#800000"
    if kind == "murugan":
        # The Vel (Murugan's spear) with a peacock-feather arc
        return f"""<svg viewBox="0 0 200 200" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="92" fill="none" stroke="{gold}" stroke-width="2"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="{gold}" stroke-width="0.8"/>
  <path d="M100 28 C118 52 122 72 100 96 C78 72 82 52 100 28 Z" fill="none" stroke="{maroon}" stroke-width="3"/>
  <path d="M100 44 C108 58 109 70 100 82 C91 70 92 58 100 44 Z" fill="{gold}" opacity="0.55"/>
  <line x1="100" y1="96" x2="100" y2="172" stroke="{maroon}" stroke-width="4" stroke-linecap="round"/>
  <line x1="86" y1="104" x2="114" y2="104" stroke="{maroon}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="100" cy="112" r="4" fill="{gold}"/>
  <path d="M40 150 Q100 120 160 150" fill="none" stroke="#1A365D" stroke-width="1.6"/>
  <path d="M50 162 Q100 136 150 162" fill="none" stroke="#1A365D" stroke-width="1.2"/>
</svg>"""
    if kind == "ganesha":
        # Simplified line-art Ganesha: crown, head with ears, curled trunk, tilak
        return f"""<svg viewBox="0 0 200 200" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="92" fill="none" stroke="{gold}" stroke-width="2"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="{gold}" stroke-width="0.8"/>
  <path d="M78 58 L86 40 L94 52 L100 34 L106 52 L114 40 L122 58 Z" fill="none" stroke="{gold}" stroke-width="2.4" stroke-linejoin="round"/>
  <ellipse cx="100" cy="86" rx="26" ry="28" fill="none" stroke="{maroon}" stroke-width="3"/>
  <path d="M74 76 C48 62 38 94 52 112 C60 122 72 116 76 104" fill="none" stroke="{maroon}" stroke-width="2.6"/>
  <path d="M126 76 C152 62 162 94 148 112 C140 122 128 116 124 104" fill="none" stroke="{maroon}" stroke-width="2.6"/>
  <path d="M100 112 C100 132 92 146 80 150 C70 153 66 144 74 140" fill="none" stroke="{maroon}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M112 112 C118 120 122 126 120 132" fill="none" stroke="#FFFFFF" stroke-width="0"/>
  <path d="M114 110 L122 124" stroke="{gold}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="90" cy="84" r="2.6" fill="{maroon}"/><circle cx="110" cy="84" r="2.6" fill="{maroon}"/>
  <path d="M96 66 L100 60 L104 66" fill="none" stroke="#C0392B" stroke-width="2"/>
  <path d="M60 170 Q100 152 140 170" fill="none" stroke="#1A365D" stroke-width="1.6"/>
</svg>"""
    # fallback: Tamil "ஓம்" in a double ring
    return f"""<svg viewBox="0 0 200 200" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="92" fill="none" stroke="{gold}" stroke-width="2"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="{gold}" stroke-width="0.8"/>
  <text x="100" y="122" text-anchor="middle" font-family="Noto Sans Tamil Base" font-size="62" fill="{maroon}">ஓம்</text>
</svg>"""


# --------------------------------------------------------------------------
# Stylesheet
# --------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# A5 book. A5 (148 x 210 mm) has the same 1 : sqrt(2) shape as A4. The layout is
# made on a 182 x 258.25 mm CSS page (tuned below so charts, dasa cards and the
# 14-column tables fit with no overlap) and WeasyPrint's zoom (148 / 182) scales
# every page onto the A5 sheet exactly: body text about 7.6 pt, same structure,
# same theme, same contents as A4.
# ---------------------------------------------------------------------------
A5_CSS_PAGE = "182mm 258.25mm"
A5_ZOOM = 148.0 / 182.0
A5_CSS = """
/* ---------- A5 book (CSS page 182 x 258.25 mm, zoomed to 148 x 210 mm) ---------- */
html { font-size: 9.4pt; }
th { font-size: 8.4pt; }
th, td { padding: 2.6pt 3pt; }
.cover { height: 21.3cm; padding: 16pt 14pt; }
.cover .title-ta { font-size: 26pt; }
.cover .profile { width: 92%; padding: 10pt 12pt; }
.cover .cover-pic img { max-height: 7.6cm; }
.chart { width: 6.6cm; margin: 0 4pt 12pt 4pt; }
.south { height: 6.6cm; }
.south .cell { font-size: 8.4pt; }
.south .center .ctext { font-size: 11pt; }
.north .nbox { width: 6.6cm; height: 6.6cm; }
.charts.small .chart { width: 4.4cm; margin: 0 2.5pt 10pt 2.5pt; }
.charts.small .south { height: 4.4cm; }
.charts.small .south .cell { font-size: 7pt; }
.charts.small .south .center { padding: 3mm 2.4mm; }
.charts.small .north .nbox { width: 4.4cm; height: 4.4cm; }
.pchart .chart { width: 6.4cm; }
.pchart .south { height: 6.4cm; }
.dasa-row { gap: 6pt; margin-bottom: 8pt; }
.dasa { padding: 2.5pt 2.5pt; }
.dasa td, .dasa th { font-size: 6.5pt; padding: 1.4pt 0.8pt; }
.dasa td.num, .dasa th.num { padding-left: 2pt; }
.dasa td:first-child, .dasa th:first-child { padding-right: 2pt; }
.dasa .dh { font-size: 8.4pt; }
.dasa .dd { font-size: 7.4pt; }
.stuti { padding: 6pt 8pt; }
.st-b { font-size: 9.6pt; }
.toc li { font-size: 10pt; padding: 3pt 0; }
/* tables with 9 or more columns: compact face so Tamil words stay whole */
table.wide th, table.wide td { font-size: 7.6pt; padding: 2pt 1.6pt; }
"""


def stylesheet(subtitle: str, lang: str, theme: PdfTheme = PdfTheme(), page_size: str = "A4") -> str:
    font_url = Path(_font_file(theme.font_id)).resolve().as_uri()
    base_url = Path(os.path.join(FONT_DIR, "NotoSansTamil.ttf")).resolve().as_uri()
    t = T[lang]
    css = f"""
@font-face {{ font-family: "Noto Sans Tamil"; src: url("{font_url}"); }}
@page {{
  size: A4;
  margin: 0.6in;
  background: #FDF6E2;
  border: 3pt double #D4AF37;
  padding: 10pt 12pt;
  @top-center {{ content: "{css_str(subtitle)}"; font-family: "Noto Sans Tamil"; font-size: 8.5pt; color: #1A365D;
                 border-bottom: 0.6pt solid #D4AF37; width: 100%; padding-bottom: 3pt; vertical-align: bottom; }}
  @bottom-right {{ content: "{t['page']} " counter(page) " {t['of']} " counter(pages);
                   font-family: "Noto Sans Tamil"; font-size: 8pt; color: #800000; }}
}}
@page :first {{
  border: 4pt double #D4AF37;
  @top-center {{ content: none; border: none; }}
  @bottom-right {{ content: none; }}
}}
html {{ font-family: "Noto Sans Tamil", sans-serif; font-size: 9.6pt; color: #2B1B12; line-height: 1.45; }}
body {{ margin: 0; }}
h1, h2, h3 {{ color: #800000; margin: 0; font-weight: 700; }}
h2.section {{ font-size: 13pt; border-bottom: 1.2pt solid #D4AF37; padding-bottom: 3pt; margin: 0 0 8pt 0;
              break-after: avoid; page-break-after: avoid; }}
h2.section + * {{ break-before: avoid; }}
h3.sub {{ font-size: 10.5pt; color: #1A365D; margin: 8pt 0 4pt 0; break-after: avoid; }}
.new-page {{ break-before: page; }}
.avoid {{ break-inside: avoid; }}

/* ---------- cover ---------- */
.cover {{ height: 25.2cm; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          border: 0.8pt solid #D4AF37; padding: 22pt 18pt; box-sizing: border-box; }}
.cover .inner-rule {{ width: 70%; border-top: 0.8pt solid #D4AF37; margin: 6pt auto; }}
.cover .invocation {{ color: #800000; font-size: 11pt; text-align: center; }}
.cover .title-ta {{ font-size: 30pt; color: #800000; text-align: center; font-weight: 700; margin-top: 10pt; }}
.cover .title-en {{ font-size: 16pt; color: #1A365D; text-align: center; letter-spacing: 1.5pt; text-transform: uppercase; }}
.cover .profile {{ width: 82%; border: 1.4pt solid #800000; outline: 0.6pt solid #D4AF37; outline-offset: 3pt;
                   padding: 12pt 16pt; background: #FFFBEF; }}
.cover .profile table td {{ border: none; padding: 3pt 4pt; font-size: 11pt; }}
.cover .profile table td.k {{ color: #1A365D; font-weight: 700; width: 38%; }}
.cover .date {{ color: #6B5B45; font-size: 9pt; text-align: center; }}
.cover .cover-pic {{ width: 100%; max-width: 15cm; text-align: center; break-inside: avoid; }}
.cover .cover-pic img {{ display: block; width: 100%; height: auto; max-height: 9.2cm; object-fit: contain; margin: 0 auto; }}
.cover .cover-pic.framed img {{ border: 1pt solid #D4AF37; border-radius: 4pt; }}

/* ---------- tables ---------- */
/* auto layout: each column is at least as wide as its longest word, so headers such as
   பாதம் / மேஷம் and numbers such as 255.00 are never split; the colgroup widths stay the
   preferred widths. break-word (not anywhere) breaks a word only if it cannot fit at all. */
table {{ width: 100%; table-layout: auto; border-collapse: collapse; margin: 0 0 8pt 0; }}
th, td {{ border: 0.6pt solid #C9B37E; padding: 3pt 4pt; vertical-align: top;
          word-wrap: break-word; overflow-wrap: break-word; word-break: normal; white-space: normal; }}
td.num, th.num {{ white-space: nowrap; }}
th {{ background: #1A365D; color: #FFFFFF; font-weight: 700; font-size: 9pt; text-align: left; }}
tr {{ break-inside: avoid; }}
thead {{ display: table-header-group; }}
tbody tr:nth-child(even) td {{ background: rgba(212,175,55,0.07); }}
td.num, th.num {{ text-align: right; font-variant-numeric: tabular-nums; }}
td.center, th.center {{ text-align: center; }}
td.tint, th.tint {{ background: rgba(128,0,0,0.08) !important; }}
th.tint {{ background: #800000 !important; }}
table.kv, table.pair {{ table-layout: fixed; }}
table.kv td {{ border: none; border-bottom: 0.5pt dotted #C9B37E; padding: 3pt 4pt; }}
table.kv td.k {{ width: 36%; color: #1A365D; font-weight: 700; }}
.card {{ border: 1pt solid #D4AF37; border-radius: 4pt; padding: 8pt 10pt; background: #FFFBEF; margin-bottom: 10pt; }}
.two-col {{ display: flex; gap: 12pt; }}
.two-col > div {{ flex: 1 1 0; min-width: 0; }}

/* ---------- charts: placement only; the artwork is chart_art.chart_css ---------- */
.charts {{ display: block; text-align: center; margin: 4pt 0 10pt 0; }}
.chart {{ width: 8.0cm; display: inline-block; vertical-align: top; margin: 0 6pt 16pt 6pt; text-align: left; }}
.charts.small .chart {{ margin: 0 4pt 12pt 4pt; }}
p.para {{ margin: 0 0 6pt 0; text-align: justify; break-inside: avoid; }}
section.flow {{ margin-top: 12pt; }}
.daily {{ margin: 0 0 10pt 0; padding-left: 16pt; }}
.daily li {{ margin: 3pt 0; }}
.toc .toc-h {{ font-size: 18pt; text-align: center; color: #800000; margin: 6pt 0 14pt 0; }}
.toc ol {{ margin: 0 auto; width: 88%; padding-left: 18pt; }}
.toc li {{ font-size: 11pt; padding: 4pt 0; border-bottom: 0.5pt dotted #C9B37E; }}
.toc li a {{ color: #2B1B12; text-decoration: none; }}
.toc li a::after {{ content: leader(".") target-counter(attr(href), page); color: #800000; }}
.verse {{ border: 1pt solid #D4AF37; background: #FFFBEF; padding: 10pt 14pt; margin: 4pt auto 12pt auto; width: 80%; text-align: center; }}
.st-h {{ color: #800000; font-weight: 700; font-size: 11pt; margin-bottom: 5pt; text-align: center; }}
.st-b {{ font-size: 10.4pt; line-height: 1.7; text-align: center; }}
.st-s {{ color: #6B5B45; font-size: 8.5pt; text-align: center; margin-top: 4pt; }}
.stuti-grid {{ display: flex; flex-wrap: wrap; gap: 10pt; }}
.stuti {{ width: calc(50% - 5pt); box-sizing: border-box; border: 0.8pt solid #D4AF37; background: #FFFBEF; padding: 8pt 10pt; }}
.center-line {{ text-align: center; color: #800000; font-weight: 700; margin: 2pt 0 8pt 0; }}
table.pair {{ border: none; }}
table.pair > tbody > tr > td {{ border: none; padding: 0 5pt; vertical-align: top; background: none !important; }}
.pchart .chart {{ width: 7.4cm; display: block; margin: 0 auto 10pt auto; }}
table.pair table.kv td.k {{ width: 47%; }}
.pchart .south {{ height: 7.4cm; }}
.pchart .north svg {{ width: 100%; height: auto; }}
table.names-t td {{ padding: 4pt 6pt; font-size: 10pt; }}
p.para b {{ color: #800000; }}
p.para.bullet {{ margin-left: 12pt; }}

/* ---------- dasa ---------- */
/* rows of three cards: a row never splits, rows break between pages, so every page
   fills from the top and the first row stays with the section heading */
.dasa-bal {{ break-after: avoid; page-break-after: avoid; margin: 0 0 6pt 0; }}
.dasa-row {{ display: flex; gap: 10pt; margin: 0 0 10pt 0; break-inside: avoid; page-break-inside: avoid; }}
.dasa-row > .dasa {{ flex: 1 1 0; min-width: 0; }}
.dasa-row > .dasa.empty {{ visibility: hidden; }}
.dasa {{ break-inside: avoid; display: block; margin: 0; font-size: 9.6pt; border: 0.8pt solid #D4AF37; background: #FFFBEF; padding: 4pt 4pt; box-sizing: border-box; }}
.dasa .dh {{ color: #800000; font-weight: 700; font-size: 9pt; margin-bottom: 2pt; }}
.dasa .dd {{ color: #1A365D; font-size: 8pt; margin-bottom: 4pt; }}
/* card table sized to its content: the end date and the வ / மா / நா columns can never
   run into each other, whatever the typeface */
.dasa table {{ margin: 0; table-layout: auto; width: 100%; }}
.dasa td, .dasa th {{ font-size: 7.6pt; padding: 1.6pt 1.2pt; white-space: nowrap; overflow-wrap: normal; border: none; border-bottom: 0.4pt dotted #C9B37E; }}
.dasa td.num, .dasa th.num {{ text-align: right; padding-left: 3pt; }}
.dasa td:first-child, .dasa th:first-child {{ padding-right: 3pt; }}
.dasa th {{ background: none; color: #1A365D; }}

/* ---------- porutham ---------- */
.tick {{ color: #1E7B34; font-weight: 700; font-size: 11pt; }}
.partial {{ color: #B7791F; font-weight: 700; }}
.cross {{ color: #8A8A8A; font-weight: 700; }}
.verdict {{ break-inside: avoid; border: 2pt solid #800000; outline: 0.8pt solid #D4AF37; outline-offset: 3pt;
            padding: 10pt 14pt; margin: 14pt 0 8pt 0; background: #FFFBEF; text-align: center; }}
.verdict .big {{ font-size: 18pt; color: #800000; font-weight: 700; }}
.verdict .sub {{ color: #1A365D; font-size: 11pt; }}

/* ---------- baby names ---------- */
.stats {{ display: flex; gap: 10pt; margin-bottom: 10pt; }}
.stat {{ flex: 1 1 0; border: 1pt solid #D4AF37; background: #FFFBEF; text-align: center; padding: 8pt 4pt; break-inside: avoid; }}
.stat .v {{ font-size: 20pt; color: #800000; font-weight: 700; }}
.stat .l {{ color: #1A365D; font-size: 8.5pt; }}
.meaning {{ break-inside: avoid; margin-bottom: 8pt; padding: 6pt 10pt; border-left: 3pt solid #D4AF37; background: #FFFBEF; }}
.meaning b {{ color: #800000; }}
.names {{ column-count: 3; column-gap: 14pt; }}
.names .n {{ break-inside: avoid; display: flex; justify-content: space-between; gap: 4pt;
             border-bottom: 0.4pt dotted #C9B37E; padding: 2pt 0; font-size: 8.8pt; }}
.names .n .t {{ color: #800000; font-weight: 700; min-width: 16pt; text-align: right; }}
"""
    # theme: the colour / Tamil-style panel reaches every colour and the typeface
    def rgba(hexcol: str, a: float) -> str:
        h = hexcol.lstrip("#")
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        try:
            r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        except ValueError:
            return hexcol
        return f"rgba({r},{g},{b},{a})"
    css = (css.replace("rgba(212,175,55,0.07)", rgba(theme.gold, 0.10))
              .replace("rgba(128,0,0,0.08)", rgba(theme.accent, 0.10)))
    for src, dst in (("#800000", theme.accent), ("#1A365D", theme.navy), ("#D4AF37", theme.gold),
                     ("#FDF6E2", theme.paper), ("#FFFBEF", theme.paper_card), ("#2B1B12", theme.ink),
                     ("#6B5B45", theme.ink_soft), ("#C9B37E", theme.gold), ("#B8963E", theme.gold),
                     ("#8A7A5E", theme.ink_soft)):
        css = css.replace(src, dst)
    css = css.replace('font-family: "Noto Sans Tamil"; src: url("' + font_url + '");',
                      'font-family: "Jathagam Panel"; src: url("' + font_url + '");') \
        if False else css
    css = css.split("\n", 2)[2] if css.lstrip().startswith("@font-face") else css
    out = (f'@font-face {{ font-family: "Jathagam Panel"; src: url("{font_url}"); }}\n'
            f'@font-face {{ font-family: "Noto Sans Tamil Base"; src: url("{base_url}"); }}\n'
            + css.replace('"Noto Sans Tamil", sans-serif', '"Jathagam Panel", "Noto Sans Tamil Base", sans-serif')
                 .replace('font-family: "Noto Sans Tamil";', 'font-family: "Jathagam Panel", "Noto Sans Tamil Base";')
            # charts: fixed artwork with the panel's colours; icons keep their own blue
            + chart_css(theme.accent, theme.ink, '"Jathagam Panel", "Noto Sans Tamil Base"') + ICON_CSS + END_CSS)
    if page_size == "A5":
        out = out.replace("size: A4;", f"size: {A5_CSS_PAGE};") + A5_CSS
    # dasa / antharam card rows sized to the chosen typeface (see dasa_font_pt)
    fs = dasa_font_pt(theme.font_id, page_size)
    out += f"\n.dasa td, .dasa th {{ font-size: {fs}pt; }}\n"
    # tables with 9+ columns keep a fixed layout (they must never be wider than the
    # page); a wide typeface gets a proportionally smaller face so words stay whole
    r = width_ratio(theme.font_id)
    wide_pt = 7.6
    out += (f"table.wide {{ table-layout: fixed; }}\n"
            f"table.wide th, table.wide td {{ font-size: {round(wide_pt * r, 2)}pt; padding: 2pt 1.6pt; }}\n")
    if r < 0.999:
        out += f"th {{ font-size: {round((8.4 if page_size == 'A5' else 9.0) * r, 2)}pt; }}\n"
    return out


# --------------------------------------------------------------------------
# Building blocks
# --------------------------------------------------------------------------
def kv_table(items: Sequence[KeyValue]) -> str:
    rows = "".join(f'<tr><td class="k">{icon(i.label)}{e(i.label)}</td><td>{e(i.value)}</td></tr>' for i in items)
    return f'<table class="kv"><tbody>{rows}</tbody></table>'


def _share_by_header(widths: List[float], headers: List[str]) -> List[float]:
    """Wide tables: columns that were given the same width (e.g. the 12 sign columns)
    share that total in proportion to their header length, so விருச்சிகம் gets more
    room than கடகம் and long headers stay whole. Other columns and the table total
    are unchanged; no column gets less than 90 % of its original width."""
    def size(h: str) -> float:   # approximate visible width in letters
        w = 0.0
        for ch in h:
            cp = ord(ch)
            if cp == 0x0BCD:                       # pulli: drawn on the letter
                continue
            if cp in (0x0BBF, 0x0BC0, 0x0BC1, 0x0BC2):   # ி ீ ு ூ: attach to the letter
                w += 0.2
            elif cp in (0x0BBE, 0x0BC6, 0x0BC7, 0x0BC8, 0x0BD7):   # ா ெ ே ை ௗ: spacing glyphs
                w += 0.8
            elif cp in (0x0BCA, 0x0BCB, 0x0BCC):   # ொ ோ ௌ: two-part signs
                w += 1.6
            else:
                w += 1.0
        return w or 1.0
    out = list(widths)
    groups: Dict[float, List[int]] = {}
    for i, w in enumerate(widths):
        groups.setdefault(round(w, 3), []).append(i)
    for w, idx in groups.items():
        if len(idx) < 4:
            continue
        total = w * len(idx)
        want = [max(size(headers[i]), 1.0) ** 0.6 for i in idx]   # gentle: short names keep most of their room
        share = [max(0.9 * w, total * x / sum(want)) for x in want]
        k = total / sum(share)
        for i, v in zip(idx, share):
            out[i] = v * k
    return out


def simple_table(tbl: SimpleTable, numeric_from: Optional[int] = None) -> str:
    n = len(tbl.columns)
    widths = tbl.widths if tbl.widths and len(tbl.widths) == n else [100.0 / n] * n
    if n >= 9:
        widths = _share_by_header(list(widths), [str(c) for c in tbl.columns])
    cols = "".join(f'<col style="width:{w:.2f}%">' for w in widths)
    head = "".join(
        f'<th class="{"tint" if i in tbl.highlight_columns else ""}">{e(c)}</th>' for i, c in enumerate(tbl.columns))
    body = []
    for r in tbl.rows:
        cells = []
        for i, v in enumerate(r):
            cls = []
            if i in tbl.highlight_columns:
                cls.append("tint")
            if numeric_from is not None and i >= numeric_from:
                cls.append("num")
            cells.append(f'<td class="{" ".join(cls)}">{e(v)}</td>')
        body.append("<tr>" + "".join(cells) + "</tr>")
    group = ""
    if tbl.group_header:
        group = "<tr>" + "".join(f'<th class="center" colspan="{int(span)}">{e(label)}</th>' for label, span in tbl.group_header) + "</tr>"
    return (f'<h3 class="sub">{e(tbl.title)}</h3>' if tbl.title else "") + \
        f'<table class="{"wide" if n >= 9 else ""}"><colgroup>{cols}</colgroup><thead>{group}<tr>{head}</tr></thead><tbody>{"".join(body)}</tbody></table>'


def south_chart(c: ChartGrid, lang: str) -> str:
    """South-Indian / Kerala chart in the owner's sample style (chart_art)."""
    return south_chart_html(c.title, c.cells, c.center_note)


def north_chart(c: ChartGrid, lang: str) -> str:
    """North-Indian diamond in the same fixed colours (chart_art)."""
    return north_chart_html(c.title, c.cells, c.lagna_sign)


def charts_block(charts: Iterable[ChartGrid], lang: str, style: str) -> str:
    fn = north_chart if style == "north" else south_chart
    return '<div class="charts">' + "".join(fn(c, lang) for c in charts) + "</div>"


def dasa_block(dashas: Sequence[DasaBlock], lang: str) -> str:
    t = T[lang]
    out = []
    for d in dashas:
        def ymd(a):
            parts = (a or "").split()
            return (parts + ["", "", ""])[:3]
        rows = "".join(
            f'<tr><td>{e(b.lord)}</td><td class="num">{e(b.end)}</td>'
            + "".join(f'<td class="num">{e(x)}</td>' for x in ymd(b.age)) + "</tr>" for b in d.bhuktis)
        yrs = f" · {d.years}" if d.years is not None else ""
        out.append(
            f'<div class="dasa"><div class="dh">{e(d.lord)}{e(yrs)}</div>'
            f'<div class="dd">{t["start"]}: {e(d.start)}<br>{t["end"]}: {e(d.end)}</div>'
            f'<table>'
            f'<thead><tr><th>{t["bhukti"]}</th><th class="num">{t["end"]}</th>'
            + "".join(f'<th class="num">{x}</th>' for x in (["வ", "மா", "நா"] if lang == "ta" else ["Y", "M", "D"])) + '</tr></thead>'
            f'<tbody>{rows}</tbody></table></div>')
    rows_html = []
    for i in range(0, len(out), 3):
        row = out[i:i + 3]
        row += ['<div class="dasa empty"></div>'] * (3 - len(row))   # keep card widths equal in the last row
        rows_html.append('<div class="dasa-row">' + "".join(row) + "</div>")
    return '<div class="dasa-grid">' + "".join(rows_html) + "</div>"


GENDER = {"ta": {"male": "ஆண்", "female": "பெண்"}, "en": {"male": "Male", "female": "Female"}}
_GENDER_KEYS = {"male": "male", "m": "male", "boy": "male", "man": "male", "ஆண்": "male",
                "female": "female", "f": "female", "girl": "female", "woman": "female", "பெண்": "female"}


def gender_label(g: Optional[str], lang: str) -> str:
    """'male' / 'M' / 'boy' → ஆண் on Tamil pages, Male on English pages (unknown text unchanged)."""
    key = _GENDER_KEYS.get(str(g or "").strip().lower())
    return GENDER[lang][key] if key else str(g or "")


# 12 Porutham and Names & Numerology show the owner's feature picture on the cover
# instead of the details box (the details follow on the inner pages).
COVER_PICTURES = {"thirumana_porutham": ("porutham.png", False), "baby_numerology": ("names.png", True)}


def _cover_picture(feature: str) -> str:
    name, framed = COVER_PICTURES.get(feature, ("", False))
    path = os.path.join(APP_DIR, "assets", "covers", name) if name else ""
    if not path or not os.path.exists(path):
        return ""
    return (f'<div class="cover-pic{" framed" if framed else ""}"><img src="{Path(path).resolve().as_uri()}" alt=""/></div>')


def cover(req: PdfRequest) -> str:
    t = T[req.language]
    m = req.metadata
    ta, en = TITLES[req.feature_type]
    ta = m.report_title_ta or ta
    en = m.report_title_en or en
    rows = [(t["name"], m.name), (t["dob"], m.dob), (t["tob"], m.tob), (t["pob"], m.pob)]
    if m.gender:
        rows.append((t["gender"], gender_label(m.gender, req.language)))
    data = req.parsed_data()
    if req.feature_type == "kp_jathagam" and data.basic_details and data.basic_details[0].label in ("பிரசன்ன எண்", "Horary number"):
        rows.insert(1, (data.basic_details[0].label, data.basic_details[0].value))
    if req.feature_type == "thirumana_porutham":
        rows = []
        for p in (data.girl, data.boy):
            rows.append((p.title, ""))
            rows += [(kv.label, kv.value) for kv in p.details[:3]]
    elif req.feature_type == "baby_numerology":
        rows = [(t["sex"], data.sex), (t["dob"], data.birth_date)]
        if data.star:
            rows.append((t["star"], data.star))
        if data.initials:
            rows.append((t["initials"], data.initials))
        rows.append((t["allowed"], "-".join(str(x) for x in data.allowed_numbers)))
    prof = "".join((f'<tr><td class="k" colspan="2" style="color:#800000;padding-top:6pt">{icon(k)}{e(k)}</td></tr>' if v == "" else
                    f'<tr><td class="k">{icon(k)}{e(k)}</td><td>: {e(v)}</td></tr>') for k, v in rows)
    return f"""
<section class="cover">
  <div style="text-align:center">{deity_svg(req.god_image)}
    <div class="invocation">{"ஓம் ஸ்ரீ கணேசாய நம:" if req.god_image == "ganesha" else ("ஓம் சரவண பவ" if req.god_image == "murugan" else "ஓம் நமசிவாய")}</div>
  </div>
  {"" if req.feature_type == "thirumana_porutham" and req.language == "ta" and _cover_picture(req.feature_type) else
   f'<div><div class="title-ta">{e(ta)}</div><div class="inner-rule"></div></div>'}
  {_cover_picture(req.feature_type) or f'<div class="profile"><table><colgroup><col style="width:38%"><col style="width:62%"></colgroup><tbody>{prof}</tbody></table></div>'}
  <div class="date">{e(m.report_date or "")}</div>
</section>"""


# --------------------------------------------------------------------------
# Feature layouts
# --------------------------------------------------------------------------
def layout_kanitha(d: KanithaData, req: PdfRequest) -> str:
    t = T[req.language]
    parts: List[str] = []
    if d.basic_details or d.bio_data:   # a custom report may leave the general details out
        parts.append(f'<section class="new-page"><h2 class="section">{t["basic"]}</h2>')
        if d.basic_details:
            parts.append(f'<div class="card">{kv_table(d.basic_details)}</div>')
        if d.bio_data:
            parts.append(f'<h3 class="sub">{t["bio"]}</h3><div class="card avoid">{kv_table(d.bio_data)}</div>')
        parts.append("</section>")
    compact = not d.dashas and not d.extra_tables and not d.chart_sets and not d.ordered   # single-page jathagam
    if d.planets or d.charts:
        parts.append(f'<section class="{"" if compact and parts else "new-page"}"><h2 class="section">{t["planets"]}</h2>')
        if d.planets:
            parts.append(simple_table(d.planets))
        if d.charts:
            # heading and charts kept together: never a lone heading at the bottom of a page
            parts.append(f'<div class="avoid"><h3 class="sub">{t["charts"]}</h3>' + charts_block(d.charts, req.language, req.chart_style) + "</div>")
        parts.append("</section>")
    if getattr(d, "ordered", None):
        # Kalai order: bhava spudam, dasa, antharam, ashtakavarga … numerology, upagraha, kalachakra, panchapakshi, palan
        fn = north_chart if req.chart_style == "north" else south_chart
        for blk in d.ordered:
            k, x = blk.get("kind"), blk.get("data") or {}
            if k == "dasa" and d.dashas:
                bal = f'<p class="dasa-bal"><b>{t["balance"]}:</b> {e(d.dasa_balance)}</p>' if d.dasa_balance else ""
                parts.append(f'<section class="flow"><h2 class="section">{t["dasa"]}</h2>{bal}{dasa_block(d.dashas, req.language)}</section>')
            elif k == "antharam":
                cards = [DasaBlock(**c) for c in x.get("cards", [])]
                parts.append(f'<section class="flow"><h2 class="section">{e(x.get("title", ""))}</h2>{dasa_block(cards, req.language)}</section>')
            elif k == "table":
                tb = SimpleTable(**x)
                parts.append(f'<section class="flow"><h2 class="section">{e(tb.title)}</h2>'
                             + simple_table(SimpleTable(title="", columns=tb.columns, rows=tb.rows, widths=tb.widths,
                                                        highlight_columns=tb.highlight_columns, group_header=tb.group_header)) + "</section>")
            elif k == "charts":
                cs = ChartSet(**x)
                parts.append(f'<section class="flow"><h2 class="section">{e(cs.title)}</h2><div class="{"charts small" if cs.small else "charts"}">'
                             + "".join(fn(c, req.language) for c in cs.charts) + "</div></section>")
            elif k == "text":
                ts = TextSection(**x)
                paras = "".join((f'<h3 class="sub">{e(p[3:])}</h3>' if p.startswith("## ") else
                                 f'<p class="para bullet">• {e(p[2:])}</p>' if p.startswith("- ") else
                                 f'<p class="para">{e(p)}</p>') for p in ts.paragraphs)
                parts.append(f'<section class="flow"><h2 class="section">{e(ts.title)}</h2>{paras}</section>')
        if d.notes:
            parts.append(f'<section class="avoid"><div class="card">{kv_table(d.notes)}</div></section>')
        return "".join(parts)
    if d.dashas:
        parts.append(f'<section class="new-page"><h2 class="section">{t["dasa"]}</h2>')
        if d.dasa_balance:
            parts.append(f'<p class="dasa-bal"><b>{t["balance"]}:</b> {e(d.dasa_balance)}</p>')
        parts.append(dasa_block(d.dashas, req.language) + "</section>")
    for tbl in d.extra_tables:
        parts.append(f'<section class="flow"><h2 class="section">{e(tbl.title)}</h2>{simple_table(SimpleTable(title="", columns=tbl.columns, rows=tbl.rows, widths=tbl.widths, highlight_columns=tbl.highlight_columns))}</section>')
    for cs in d.chart_sets:
        cls = "charts small" if cs.small else "charts"
        fn = north_chart if req.chart_style == "north" else south_chart
        parts.append(f'<section class="flow"><h2 class="section">{e(cs.title)}</h2><div class="{cls}">'
                     + "".join(fn(c, req.language) for c in cs.charts) + "</div></section>")
    for ts in d.text_sections:
        paras = "".join((f'<h3 class="sub">{e(p[3:])}</h3>' if p.startswith("## ") else
                         f'<p class="para bullet">• {e(p[2:])}</p>' if p.startswith("- ") else
                         f'<p class="para">{e(p)}</p>') for p in ts.paragraphs)
        parts.append(f'<section class="flow"><h2 class="section">{e(ts.title)}</h2>{paras}</section>')
    if d.notes:
        parts.append(f'<section class="avoid"><div class="card">{kv_table(d.notes)}</div></section>')
    return "".join(parts)


def _kp_table(rows, first_col: str, t: dict) -> SimpleTable:
    return SimpleTable(title="", columns=[first_col, t["position"], t["sign_lord"], t["star_lord"], t["sub_lord"], t["subsub_lord"]],
                       rows=[[r.name, r.dms, r.sign_lord, r.star_lord, r.sub_lord, r.subsub_lord] for r in rows],
                       widths=[18, 18, 16, 16, 16, 16], highlight_columns=[4, 5])


def layout_kp(d: KpData, req: PdfRequest) -> str:
    t = T[req.language]
    basic = list(d.basic_details) + ([KeyValue(label=t["ayanamsa"], value=d.ayanamsa)] if d.ayanamsa else [])
    parts: List[str] = []
    if basic or d.bio_data or d.charts:   # a custom KP report may leave any of these out
        parts.append('<section class="new-page">')
        if basic:
            parts.append(f'<h2 class="section">{t["basic"]}</h2><div class="card">{kv_table(basic)}</div>')
        if d.bio_data:
            parts.append(f'<h3 class="sub">{t["bio"]}</h3><div class="card avoid">{kv_table(d.bio_data)}</div>')
        if d.charts:
            parts.append(("" if basic else f'<h2 class="section">{e(d.charts[0].title)}</h2>')
                         + charts_block(d.charts, req.language, req.chart_style))
        parts.append("</section>")
    if d.planets:
        parts.append(f'<section class="{"flow" if parts else "new-page"}"><h2 class="section">{t["kp_planets"]}</h2>'
                     f'{simple_table(_kp_table(d.planets, t["planet"], t))}</section>')
    if d.cusps:
        parts.append(f'<section class="{"flow" if parts else "new-page"}"><h2 class="section">{t["kp_cusps"]}</h2>'
                     f'{simple_table(_kp_table(d.cusps, t["house"], t))}</section>')
    if d.significators:
        sig = SimpleTable(title="", columns=[t["planet"], t["by_star"], t["by_sub"], t["aspected"]],
                          rows=[[s.planet, s.by_star, s.by_sub, s.aspected_by or "-"] for s in d.significators],
                          widths=[22, 28, 28, 22])
        parts.append(f'<section class="flow"><h2 class="section">{t["signif"]}</h2>{simple_table(sig)}</section>')
    if getattr(d, "ordered", None):
        # Kalai order: bhava spudam, dasa, antharam, ashtakavarga … numerology, upagraha, kalachakra, panchapakshi, palan
        fn = north_chart if req.chart_style == "north" else south_chart
        for blk in d.ordered:
            k, x = blk.get("kind"), blk.get("data") or {}
            if k == "dasa" and d.dashas:
                bal = f'<p class="dasa-bal"><b>{t["balance"]}:</b> {e(d.dasa_balance)}</p>' if d.dasa_balance else ""
                parts.append(f'<section class="flow"><h2 class="section">{t["dasa"]}</h2>{bal}{dasa_block(d.dashas, req.language)}</section>')
            elif k == "antharam":
                cards = [DasaBlock(**c) for c in x.get("cards", [])]
                parts.append(f'<section class="flow"><h2 class="section">{e(x.get("title", ""))}</h2>{dasa_block(cards, req.language)}</section>')
            elif k == "table":
                tb = SimpleTable(**x)
                parts.append(f'<section class="flow"><h2 class="section">{e(tb.title)}</h2>'
                             + simple_table(SimpleTable(title="", columns=tb.columns, rows=tb.rows, widths=tb.widths,
                                                        highlight_columns=tb.highlight_columns, group_header=tb.group_header)) + "</section>")
            elif k == "charts":
                cs = ChartSet(**x)
                parts.append(f'<section class="flow"><h2 class="section">{e(cs.title)}</h2><div class="{"charts small" if cs.small else "charts"}">'
                             + "".join(fn(c, req.language) for c in cs.charts) + "</div></section>")
            elif k == "text":
                ts = TextSection(**x)
                paras = "".join((f'<h3 class="sub">{e(p[3:])}</h3>' if p.startswith("## ") else
                                 f'<p class="para bullet">• {e(p[2:])}</p>' if p.startswith("- ") else
                                 f'<p class="para">{e(p)}</p>') for p in ts.paragraphs)
                parts.append(f'<section class="flow"><h2 class="section">{e(ts.title)}</h2>{paras}</section>')
        if d.notes:
            parts.append(f'<section class="avoid"><div class="card">{kv_table(d.notes)}</div></section>')
        return "".join(parts)
    if d.dashas:
        parts.append(f'<section class="new-page"><h2 class="section">{t["dasa"]}</h2>')
        if d.dasa_balance:
            parts.append(f'<p class="dasa-bal"><b>{t["balance"]}:</b> {e(d.dasa_balance)}</p>')
        parts.append(dasa_block(d.dashas, req.language) + "</section>")
    for tbl in d.extra_tables:
        parts.append(f'<section class="flow"><h2 class="section">{e(tbl.title)}</h2>{simple_table(SimpleTable(title="", columns=tbl.columns, rows=tbl.rows, widths=tbl.widths, highlight_columns=tbl.highlight_columns))}</section>')
    return "".join(parts)


def layout_porutham(d: PoruthamData, req: PdfRequest) -> str:
    t = T[req.language]
    fn = north_chart if req.chart_style == "north" else south_chart

    def person(p):
        charts = "".join(fn(c, req.language) for c in p.charts)
        return f'<h3 class="sub">{e(p.title)}</h3><div class="card">{kv_table(p.details)}</div><div class="pchart">{charts}</div>'
    people = [person(d.girl), person(d.boy)]
    rows = []
    for r in d.rows:
        mark = {"matched": '<span class="tick">✔</span>', "partial": '<span class="partial">◐</span>',
                "not_matched": '<span class="cross">✕</span>'}[r.status]
        rows.append(
            f'<tr><td>{e(r.name)}</td><td>{e(r.girl_value)}</td><td>{e(r.boy_value)}</td>'
            f'<td class="num">{r.max_points:g}</td><td class="num">{r.points:g}</td>'
            f'<td class="center">{mark} {e(r.result_text or "")}</td></tr>')
    table = (f'<table><colgroup><col style="width:20%"><col style="width:18%"><col style="width:18%">'
             f'<col style="width:10%"><col style="width:12%"><col style="width:22%"></colgroup>'
             f'<thead><tr><th>{t["match"]}</th><th>{t["girl"]}</th><th>{t["boy"]}</th><th class="num">{t["max"]}</th>'
             f'<th class="num">{t["got"]}</th><th class="center">{t["status"]}</th></tr></thead><tbody>{"".join(rows)}'
             f'<tr><td colspan="3"><b>{t["total"]}</b></td><td class="num"><b>{d.max_points:g}</b></td>'
             f'<td class="num"><b>{d.total_points:g}</b></td><td class="center"><b>{d.percent:.2f} %</b></td></tr></tbody></table>')
    extras = kv_table(d.extra_checks) if d.extra_checks else ""
    verdict = (f'<div class="verdict"><div class="sub">{t["verdict"]}</div>'
               f'<div class="big">{d.total_points:g} / {d.max_points:g} · {d.percent:.2f} %</div>'
               f'<div class="sub">{e(d.verdict)}</div></div>')
    pair = (f'<table class="pair"><colgroup><col style="width:50%"><col style="width:50%"></colgroup><tbody><tr>'
            f'<td>{people[0]}</td><td>{people[1]}</td></tr></tbody></table>')
    return (f'<section class="new-page"><h2 class="section">{t["porutham"]}</h2>{pair}</section>'
            f'<section class="new-page"><h2 class="section">{t["match"]}</h2>{table}{extras}{verdict}</section>')


def layout_baby(d: BabyData, req: PdfRequest) -> str:
    t = T[req.language]
    info = [KeyValue(label=t["sex"], value=d.sex), KeyValue(label=t["dob"], value=d.birth_date)]
    if d.star:
        info.append(KeyValue(label=t["star"], value=d.star))
    if d.star_letters:
        info.append(KeyValue(label=t["letters"], value=d.star_letters))
    if d.initials:
        info.append(KeyValue(label=t["initials"], value=d.initials))
    info.append(KeyValue(label=t["allowed"], value="-".join(str(x) for x in d.allowed_numbers)))
    stats = (f'<div class="stats"><div class="stat"><div class="v">{d.date_number}</div><div class="l">{t["date_no"]}</div></div>'
             f'<div class="stat"><div class="v">{d.destiny_number}</div><div class="l">{t["destiny_no"]}</div></div>'
             f'<div class="stat"><div class="v">{len(d.names)}</div><div class="l">{t["names"]}</div></div></div>')
    meanings = "".join(f'<div class="meaning"><b>{m.number} — {e(m.title)}</b><br/>{e(m.text)}</div>' for m in d.number_meanings)
    letters = ""
    if d.letter_values:
        keys = list(d.letter_values.keys())
        def row(ks):
            return ("<tr>" + "".join(f'<th class="center">{e(k)}</th>' for k in ks) + "</tr><tr>" +
                    "".join(f'<td class="center">{d.letter_values[k]}</td>' for k in ks) + "</tr>")
        letters = f'<h3 class="sub">{t["letter_table"]}</h3><table class="avoid"><tbody>{row(keys[:13])}{row(keys[13:])}</tbody></table>'
    names_rows = "".join(f'<tr><td class="center">{i + 1}</td><td>{e(n.name_en)}</td><td>{e(n.name_ta or "")}</td><td class="num">{n.total}</td></tr>'
                         for i, n in enumerate(d.names))
    names = (f'<table class="names-t"><colgroup><col style="width:9%"><col style="width:38%"><col style="width:38%"><col style="width:15%"></colgroup>'
             f'<thead><tr><th class="center">#</th><th>{"பெயர் (ஆங்கிலம்)" if req.language == "ta" else "Name"}</th>'
             f'<th>{"பெயர் (தமிழ்)" if req.language == "ta" else "Tamil"}</th><th class="num">{"கூட்டு எண்" if req.language == "ta" else "Total"}</th></tr></thead>'
             f'<tbody>{names_rows}</tbody></table>')
    return (f'<section class="new-page"><h2 class="section">{t["baby"]}</h2>{stats}<div class="card">{kv_table(info)}</div>'
            f'{("<h3 class=" + chr(34) + "sub" + chr(34) + ">" + t["meaning"] + "</h3>" + meanings) if meanings else ""}{letters}</section>'
            f'<section class="new-page"><h2 class="section">{t["names"]}</h2>{names}</section>')


# --------------------------------------------------------------------------
# General opening pages — the same texts the site's 50-page manuscript uses
# (components/manuscript/Chapter1Invocations.tsx), plus the zodiac table.
# --------------------------------------------------------------------------
TAMIL_THAI = ["நீராருங் கடலுடுத்த நிலமடந்தைக் கெழிலொழுகும்", "சீராரும் வதனமெனத் திகழ்பரதக் கண்டமிதில்",
              "தெக்கணமும் அதிற்சிறந்த திராவிடநல் திருநாடும்", "தக்கசிறு பிறைநுதலும் தரித்தநறுந் திலகமுமே!",
              "அத்திலக வாசனைபோல் அனைத்துலகும் இன்பமுற", "எத்திசையும் புகழ்மணக்க இருந்தபெருந் தமிழணங்கே!",
              "தமிழணங்கே!", "உன் சீரிளமைத் திறம்வியந்து செயல்மறந்து", "வாழ்த்துதுமே! வாழ்த்துதுமே! வாழ்த்துதுமே!"]
STUTIS = [
    ("ஸ்ரீ விநாயகர் துதி", ["ஐந்து கரத்தனை யானை முகத்தினை", "இந்தின் இளம்பிறை போலும் எயிற்றனை",
                           "நந்தி மகன்தனை ஞானக் கொழுந்தினை", "புந்தியில் வைத்தடி போற்றுகின்றேனே"], "திருமந்திரம் (திருமூலர்)"),
    ("ஸ்ரீ சுப்பிரமணியர் துதி", ["வாக்குண்டாம் நல்ல மனமுண்டாம் மாமலராள்", "நோக்குண்டாம் மேனி நுடங்காது — பூக்கொண்டு",
                                "துப்பார் திருமேனித் தும்பிக்கையான் பாதம்", "தப்பாமல் சார்வார் தமக்கு"], "ஔவையார் நல்வழி"),
    ("ஸ்ரீ சரஸ்வதி தேவி வந்தனம்", ["சரஸ்வதி நமஸ்துப்யம் வரதே காமரூபிணி", "வித்யாரம்பம் கரிஷ்யாமி சித்திர்பவது மே ஸதா",
                                   "வெள்ளைத் தாமரைப் பூவிலிருப்பாள்", "வீணை செய்யும் ஒலியில் இருப்பாள்!"], "மகாகவி பாரதி"),
    ("ஸ்ரீ தட்சிணாமூர்த்தி ஸ்தோத்திரம்", ["குருவே சர்வ லோகானாம் பிஷஜே பவரோகிணாம்", "நிதயே சர்வ வித்யானாம் ஸ்ரீ தட்சிணாமூர்த்தயே நம:",
                                         "ஞானம், வித்தை அருளும் ஞானாசிரியன் சரணம்!"], "ஆதிசங்கரர் ஸ்தோத்திரம்"),
]
NAVAGRAHA = [
    ("சூரியன்", "ஜபாகுஸும ஸங்காசம் காஷ்யபேயம் மஹாத்யுதிம் | தமோரிம் ஸர்வபாபக்னம் ப்ரணதோஸ்மி திவாகரம் ||"),
    ("சந்திரன்", "ததிஸங்க துஷாராபம் க்ஷீரோதார்ணவ ஸம்பவம் | நமாமி சசினம் சோமம் சம்போர் மகுட பூஷணம் ||"),
    ("செவ்வாய்", "தரணீகர்ப்ப ஸம்பூதம் வித்யுத்காந்தி ஸமப்ரபம் | குமாரம் சக்திஹஸ்தம் தம் மங்களம் ப்ரணமாம்யஹம் ||"),
    ("புதன்", "ப்ரியங்கு கலிகாச்யாமம் ரூபேணாப்ரதிமம் புதம் | ஸௌம்யம் ஸௌம்யகுணோபேதம் தம் புதம் ப்ரணமாம்யஹம் ||"),
    ("குரு", "தேவானாஞ்ச ரிஷீணாஞ்ச குரும் காஞ்சனஸந்நிபம் | புத்திபூதம் த்ரிலோகேசம் தம் நமாமி பிருஹஸ்பதிம் ||"),
    ("சுக்கிரன்", "ஹிமகுந்த ம்ருணாலாபம் தைத்யானாம் பரமம் குரும் | ஸர்வசாஸ்த்ர ப்ரவக்தாரம் பார்கவம் ப்ரணமாம்யஹம் ||"),
    ("சனி", "நீலாஞ்ஜன ஸமாபாஸம் ரவிபுத்ரம் யமாக்ரஜம் | சாயாமார்த்தாண்ட ஸம்பூதம் தம் நமாமி சனைச்சரம் ||"),
    ("ராகு", "அர்த்தகாயம் மஹாவீர்யம் சந்த்ராதித்ய விமர்தனம் | ஸிம்ஹிகாகர்ப்ப ஸம்பூதம் தம் ராகும் ப்ரணமாம்யஹம் ||"),
    ("கேது", "பலாசபுஷ்ப ஸங்காசம் தாரகாக்ரஹ மஸ்தகம் | ரௌத்ரம் ரௌத்ராத்மகம் கோரம் தம் கேதும் ப்ரணமாம்யஹம் ||"),
]
# standard classical attributes of the 12 signs
ZODIAC = [("மேஷம்", "செவ்வாய்", "நெருப்பு", "சரம்"), ("ரிஷபம்", "சுக்கிரன்", "நிலம்", "ஸ்திரம்"), ("மிதுனம்", "புதன்", "காற்று", "உபயம்"),
          ("கடகம்", "சந்திரன்", "நீர்", "சரம்"), ("சிம்மம்", "சூரியன்", "நெருப்பு", "ஸ்திரம்"), ("கன்னி", "புதன்", "நிலம்", "உபயம்"),
          ("துலாம்", "சுக்கிரன்", "காற்று", "சரம்"), ("விருச்சிகம்", "செவ்வாய்", "நீர்", "ஸ்திரம்"), ("தனுசு", "குரு", "நெருப்பு", "உபயம்"),
          ("மகரம்", "சனி", "நிலம்", "சரம்"), ("கும்பம்", "சனி", "காற்று", "ஸ்திரம்"), ("மீனம்", "குரு", "நீர்", "உபயம்")]


DAILY = [("காலை விடியற்காலை", "சூரிய நமஸ்காரம் மற்றும் குலதெய்வ தியானம்."),
         ("விளக்கேற்றுதல்", "காலை, மாலை இருவேளையும் நெய் தீபம் ஏற்றி இஷ்ட தெய்வ வழிபாடு."),
         ("அன்னதானம்", "ஜீவராசிகளுக்கு (காகம், எறும்பு, பசு, ஆதரவற்றோர்) உணவளித்தல்."),
         ("வார்த்தை சுத்தி", "உண்மை பேசுதல், பெரியோர்களை வணங்குதல், தர்ம நெறி தவறாமை.")]
TEMPLES = [("சூரியன்", "சூரியனார் கோவில்"), ("சந்திரன்", "திங்களூர்"), ("செவ்வாய்", "வைத்தீஸ்வரன் கோவில்"),
           ("புதன்", "திருவெண்காடு"), ("குரு", "ஆலங்குடி"), ("சுக்கிரன்", "கஞ்சனூர்"), ("சனி", "திருநள்ளாறு"),
           ("ராகு", "திருநாகேஸ்வரம்"), ("கேது", "கீழப்பெரும்பள்ளம்")]


def closing_page() -> str:
    daily = "".join(f'<li><b>{e(a)}:</b> {e(b)}</li>' for a, b in DAILY)
    temples = "".join(f'<tr><td class="center">{i + 1}</td><td>{e(a)}</td><td>{e(b)}</td></tr>' for i, (a, b) in enumerate(TEMPLES))
    return (f'<section class="new-page closing"><h2 class="section">மங்கள வாழ்த்துரை & சுப நிறைவு</h2>'
            f'<h3 class="sub">✦ தினசரி சுப வழிபாடுகள் ✦</h3><ul class="daily">{daily}</ul>'
            f'<h3 class="sub">✦ நவக்கிரக திருத்தலங்கள் ✦</h3>'
            f'<table class="avoid"><colgroup><col style="width:10%"><col style="width:35%"><col style="width:55%"></colgroup>'
            f'<thead><tr><th class="center">எண்</th><th>கிரகம்</th><th>திருத்தலம்</th></tr></thead><tbody>{temples}</tbody></table>'
            f'<div class="verse avoid" style="margin-top:14pt"><div class="st-h">॥ மங்கள வாழ்த்துரை ॥</div>'
            f'<div class="st-b">“ஸர்வே பவந்து ஸுகின: ஸர்வே ஸந்து நிராமயா: |<br/>ஸர்வே பத்ராணி பஷ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ||<br/>'
            f'ஓம் சாந்தி: சாந்தி: சாந்தி: ||”</div>'
            f'<div class="st-s">எல்லா உயிர்களும் இன்புற்று வாழ்க • வையகம் நலம் பெறுக • வாழ்க வளமுடன்!</div></div>'
            f'<p class="center-line" style="margin-top:12pt">॥ சுபமஸ்து — மங்களம் உண்டாகுக ॥</p>'
            f'<div class="end-logo">{_logo_img(26)}<div class="end-name">MyLoginn Astrology</div></div></section>')


def general_pages(req: "PdfRequest") -> str:
    thai = "<br/>".join(e(x) for x in TAMIL_THAI)
    stutis = "".join(
        f'<div class="stuti avoid"><div class="st-h">✦ {e(h)} ✦</div><div class="st-b">{"<br/>".join(e(l) for l in lines)}</div>'
        f'<div class="st-s">— {e(src)}</div></div>' for h, lines, src in STUTIS)
    page1 = (f'<section class="new-page" id="sec-general"><h2 class="section">தமிழ் தாய் வாழ்த்து & கடவுள் வாழ்த்து</h2>'
             f'<div class="verse avoid"><div class="st-h">❧ தமிழ் தாய் வாழ்த்து ❧</div><div class="st-b">{thai}</div>'
             f'<div class="st-s">— மனோன்மணீயம் பெ. சுந்தரனார்</div></div><div class="stuti-grid">{stutis}</div></section>')
    if req.feature_type not in ("kanitha_jathagam", "kp_jathagam"):
        return page1
    rows = "".join(f'<tr><td>{e(n)}</td><td>{e(s)}</td></tr>' for n, s in NAVAGRAHA)
    zrows = "".join(f'<tr><td class="center">{i + 1}</td><td>{e(a)}</td><td>{e(b)}</td><td>{e(c)}</td><td>{e(d)}</td></tr>' for i, (a, b, c, d) in enumerate(ZODIAC))
    page2 = (f'<section class="new-page"><h2 class="section">நவக்கிரக தியான ஸ்லோகங்கள்</h2>'
             f'<p class="center-line">“நம: சூர்யாய சந்திராய மங்களாய புதாய ச | குரு சுக்ர சனிப்யஸ்ச ராகவே கேதவே நம: ||”</p>'
             f'<table><colgroup><col style="width:16%"><col style="width:84%"></colgroup><thead><tr><th>கிரகம்</th><th>தியான ஸ்லோகம்</th></tr></thead><tbody>{rows}</tbody></table>'
             f'<h2 class="section" style="margin-top:14pt">ராசி மண்டலம்</h2>'
             f'<table><colgroup><col style="width:8%"><col style="width:28%"><col style="width:24%"><col style="width:20%"><col style="width:20%"></colgroup>'
             f'<thead><tr><th class="center">எண்</th><th>ராசி</th><th>அதிபதி</th><th>தத்துவம்</th><th>தன்மை</th></tr></thead><tbody>{zrows}</tbody></table></section>')
    return page1 + page2


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------
_H2 = __import__("re").compile(r'<h2 class="section"([^>]*)>(.*?)</h2>')
_H3 = __import__("re").compile(r'<h3 class="sub"([^>]*)>(.*?)</h3>')


TOC_SECTIONS = [  # (key text in the heading, contents label) — the reference report's contents
    ("பொது விவரங்கள்", "பொது விவரங்கள்", "Basic Details"), ("கிரக ஸ்புடம்", "கிரக ஸ்புடம்", "Planetary Positions"),
    ("பாவ ஸ்புடம்", "பாவ ஸ்புடம்", "Bhava Spudam"), ("தசா புக்தி", "தசா புக்தி", "Dasa Bhukti"),
    ("அந்தரம்", "அந்தரம்", "Antharam"), ("சர்வாஷ்டக", "சர்வாஷ்டக வர்கம்", "Sarvashtakavarga"),
    ("அஷ்ட வர்க்கம்", "அஷ்ட வர்க்கம்", "Ashtakavarga"), ("பிரஸ்தார்", "பிரஸ்தார் அஸ்டவர்கம்", "Prasthara Ashtakavarga"),
    ("சட்பல", "சட்பலம்", "Shadbala"), ("சோடச வர்க்க", "சோடச வர்க்கம்", "Shodasa Varga"),
    ("கிரகங்களின் விவர அட்டவணை", "கிரகங்களின் விவர அட்டவணை", "Planet Details"), ("நியுமராலஜி", "நியுமராலஜி", "Numerology"),
    ("உப கிரக ஸ்புடம்", "உப கிரக ஸ்புடம்", "Upagraha Spudam"), ("காலச்சக்கிர தசை", "காலச்சக்கிர தசை", "Kalachakra Dasa"),
    ("பஞ்சபட்சி", "பஞ்சபட்சி", "Panchapakshi"), ("பாவக பலன்கள்", "பாவக பலன்கள்", "Bhava Palan"),
    ("மகாதிசை பலன்கள்", "மகாதிசை பலன்கள்", "Mahadasa Palan"), ("குரு கோச்சார", "குரு கோச்சார பலன்கள்", "Guru Gochara Palan"),
    ("சனி கோச்சார", "சனி கோச்சார பலன்கள்", "Sani Gochara Palan"), ("யோக அவயோக", "யோக அவயோகங்கள்", "Yogas and Avayogas"),
    # English headings
    ("Basic Details", "பொது விவரங்கள்", "Basic Details"), ("Planetary Positions", "கிரக ஸ்புடம்", "Planetary Positions"),
    ("Bhava Spudam", "பாவ ஸ்புடம்", "Bhava Spudam"), ("Vimshottari", "தசா புக்தி", "Dasa Bhukti"), ("Antharam", "அந்தரம்", "Antharam"),
    ("Sarvashtakavarga", "சர்வாஷ்டக வர்கம்", "Sarvashtakavarga"), ("Ashtakavarga", "அஷ்ட வர்க்கம்", "Ashtakavarga"), ("Prasthara", "பிரஸ்தார் அஸ்டவர்கம்", "Prasthara Ashtakavarga"),
    ("Shadbala", "சட்பலம்", "Shadbala"), ("Shodasa varga", "சோடச வர்க்கம்", "Shodasa Varga"), ("Planet details", "கிரகங்களின் விவர அட்டவணை", "Planet Details"),
    ("Numerology", "நியுமராலஜி", "Numerology"), ("Upagraha", "உப கிரக ஸ்புடம்", "Upagraha Spudam"), ("Kalachakra", "காலச்சக்கிர தசை", "Kalachakra Dasa"),
    ("Panchapakshi", "பஞ்சபட்சி", "Panchapakshi"), ("Bhava palan", "பாவக பலன்கள்", "Bhava Palan"), ("Mahadasa palan", "மகாதிசை பலன்கள்", "Mahadasa Palan"),
    ("Guru gochara", "குரு கோச்சார பலன்கள்", "Guru Gochara Palan"), ("Sani gochara", "சனி கோச்சார பலன்கள்", "Sani Gochara Palan"),
    ("Yogas", "யோக அவயோகங்கள்", "Yogas and Avayogas"),
    # other features keep their main headings
    ("திருமணப் பொருத்தம்", "திருமணப் பொருத்தம்", "Marriage Matching"), ("Marriage Matching", "திருமணப் பொருத்தம்", "Marriage Matching"),
    ("பொருத்தம்", "பொருத்தம்", "Porutham"), ("Porutham", "பொருத்தம்", "Porutham"),
    ("குழந்தை பெயர்", "குழந்தை பெயர் & நியுமராலஜி", "Baby Names & Numerology"), ("Baby Names", "குழந்தை பெயர் & நியுமராலஜி", "Baby Names & Numerology"),
    ("பரிந்துரைக்கப்படும் பெயர்கள்", "பரிந்துரைக்கப்படும் பெயர்கள்", "Suggested names"), ("Suggested names", "பரிந்துரைக்கப்படும் பெயர்கள்", "Suggested names"),
    ("கே.பி", "கே.பி அட்டவணைகள்", "KP Tables"), ("KP ", "கே.பி அட்டவணைகள்", "KP Tables"),
    ("காரக கிரகங்கள்", "காரக கிரகங்கள்", "Significators"), ("Significators", "காரக கிரகங்கள்", "Significators"),
]


def _with_toc(body: str, lang: str) -> str:
    """Contents page like the reference: one line per MAIN section (first heading
    of each), page numbers filled in by WeasyPrint (target-counter). Sub-tables,
    the opening prayers and the closing page are not listed."""
    items = []
    counter = [0]
    used = set()

    def sub(m):
        counter[0] += 1
        hid = f"h{counter[0]}"
        plain = __import__("re").sub(r"<[^>]+>", "", m.group(2))
        for key, ta, en in TOC_SECTIONS:
            label = ta if lang == "ta" else en
            if key in plain and label not in used:
                used.add(label)
                items.append((hid, e(label)))
                break
        return f'<h2 class="section" id="{hid}"{m.group(1)}>{icon(plain, cls="ic-h")}{m.group(2)}</h2>'
    body = _H2.sub(sub, body)
    # sub-headings get their icon too (decorated ✦ headings keep their own ornament)
    body = _H3.sub(lambda m: m.group(0) if m.group(2).lstrip().startswith("✦") else
                   f'<h3 class="sub"{m.group(1)}>{icon(m.group(2), cls="ic-h")}{m.group(2)}</h3>', body)
    rows = "".join(f'<li>{icon(title)}<a href="#{hid}">{title}</a></li>' for hid, title in items)
    toc = (f'<section class="new-page toc"><h2 class="toc-h">{"பொருளடக்கம்" if lang == "ta" else "Contents"}</h2>'
           f'<ol>{rows}</ol></section>')
    return toc + body


def build_html(req: PdfRequest) -> str:
    data = req.parsed_data()
    use_chart_theme(req.theme.accent, req.theme.ink)   # north-chart lines follow the panel
    ta, en = TITLES[req.feature_type]
    subtitle = f"{req.metadata.report_title_ta or ta} · {req.metadata.name}" if req.language == "ta" else \
        f"{req.metadata.report_title_en or en} · {req.metadata.name}"
    body = {
        "kanitha_jathagam": layout_kanitha, "kp_jathagam": layout_kp,
        "thirumana_porutham": layout_porutham, "baby_numerology": layout_baby,
    }[req.feature_type](data, req)
    body = _with_toc(general_pages(req) + body + closing_page(), req.language)
    return (f'<!DOCTYPE html><html lang="{req.language}"><head><meta charset="utf-8"/>'
            f"<title>{e(ta if req.language == 'ta' else en)}</title><style>{stylesheet(subtitle, req.language, req.theme, req.page_size)}</style></head>"
            f"<body>{cover(req)}{body}</body></html>")


def render_pdf(req: PdfRequest) -> bytes:
    from weasyprint import HTML  # imported lazily: WeasyPrint needs Pango at runtime
    zoom = A5_ZOOM if req.page_size == "A5" else 1
    return HTML(string=build_html(req), base_url=FONT_DIR).write_pdf(zoom=zoom)
