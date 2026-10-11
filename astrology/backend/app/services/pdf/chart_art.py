"""
Rasi-chart artwork shared by every printed Jathagam (full designed PDF,
single-page PDF, KP, 12 Porutham): the owner's sample chart —

  • pale-yellow houses with a soft radial glow (light centre, yellow edge),
  • grid lines and outer frame in the panel's accent colour,
  • a premium ornamental centre box (since 4.29.0): ivory-gold glow, gold /
    maroon triple frame with side gems, lotus corner flourishes and a faint
    lotus mandala behind the chart name (in the accent colour),
  • planet text in the panel's ink and typeface (Lagna in accent), the Lagna house marked with the
    traditional double diagonal stroke.

Since 4.27.0 the chart has no black lines: the grid lines, the chart name and
the planet text take the colour / Tamil-style panel's accent, ink and typeface;
the yellow houses and the framed centre stay the same. Every chart is an exact
square. The website uses the same artwork (frontend/lib/chartArt.ts).
"""
from __future__ import annotations

import base64
import html
import math
from contextvars import ContextVar
from typing import Dict, List, Optional

# --- fixed chart palette (keep in sync with frontend/lib/chartArt.ts) -----------
LINE = "#262626"          # grid lines
FRAME = "#141414"         # outer frame
CELL_IN = "#FFFFF4"       # house centre
CELL_MID = "#FFFAD6"
CELL_OUT = "#F4E98F"      # house edge
CENTRE_IN = "#FFFFFF"
CENTRE_MID = "#FFFCF0"
CENTRE_OUT = "#F3DE9C"
KEY = "#7A231C"           # maroon of the centre ornament
TITLE = "#1C3FD8"         # chart name in the centre
OTHER = "#1B2140"         # numbers, cusps and any label that is not a planet

PLANET_INK = {
    "Lagna": "#E8590C", "Sun": "#C92A2A", "Moon": "#2B8A3E", "Mars": "#E03131", "Mercury": "#0B7285",
    "Jupiter": "#AD6800", "Venus": "#C2255C", "Saturn": "#1C3FD8", "Rahu": "#5F3DC4", "Ketu": "#087F5B",
    "Mandi": "#E67700", "Uranus": "#495057", "Neptune": "#495057", "Fortuna": "#495057",
}
# every label form the PDFs print → planet
_ALIASES = {
    "Lagna": ["லக்", "லக்னம்", "ல", "Asc", "As", "Lagna", "Lg"],
    "Sun": ["சூரி", "சூரியன்", "சூ", "Su", "Sun"], "Moon": ["சந்", "சந்திரன்", "Mo", "Moon"],
    "Mars": ["செவ்", "செவ்வாய்", "செ", "Ma", "Mars"], "Mercury": ["புத", "புதன்", "பு", "Me", "Mercury"],
    "Jupiter": ["குரு", "கு", "Ju", "Jupiter"], "Venus": ["சுக்", "சுக்கிரன்", "சு", "Ve", "Venus"],
    "Saturn": ["சனி", "Sa", "Saturn"], "Rahu": ["ராகு", "ரா", "Ra", "Rahu"], "Ketu": ["கேது", "கே", "Ke", "Ketu"],
    "Mandi": ["மாந்", "மாந்தி", "மா", "Md", "Mandi"], "Uranus": ["யுரே", "Ur", "Uranus"],
    "Neptune": ["நெப்", "Ne", "Neptune"], "Fortuna": ["அ.பா", "அ. பா", "Fo", "Fortuna"],
}
_LABEL_PLANET = {a: p for p, xs in _ALIASES.items() for a in xs}


def planet_of(label: str) -> Optional[str]:
    """'சனி (வ)' → 'Saturn'; numbers and cusp labels → None."""
    s = str(label or "").replace("(வ)", "").replace("(R)", "").strip()
    head = s.split(" ")[0] if s else s
    return _LABEL_PLANET.get(s) or _LABEL_PLANET.get(head)


def ink_of(label: str) -> str:
    p = planet_of(label)
    return PLANET_INK.get(p, OTHER) if p else OTHER


def is_lagna(label: str) -> bool:
    return planet_of(label) == "Lagna"


def _e(s: object) -> str:
    return html.escape("" if s is None else str(s))


def _data_svg(svg: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode("utf-8")).decode("ascii")


# --- centre box: premium ornamental design (4.29.0) -----------------------------
# Ivory-to-gold glow; gold / maroon / gold triple frame with a small gem on the
# middle of each side; lotus-leaf corner flourishes; a faint 16 + 8 petal lotus
# mandala behind the chart name. Same paths as frontend/lib/chartArt.ts
# (CENTRE_FRAME, CENTRE_CORNER, CENTRE_MANDALA) so screen and print match.
GOLD = "#B8860B"
GOLD_SOFT = "#EFD58A"


def _n2(v: float) -> str:
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _circle(cx: float, cy: float, r: float) -> str:
    return (f"M{_n2(cx - r)} {_n2(cy)}a{_n2(r)} {_n2(r)} 0 1 0 {_n2(2 * r)} 0"
            f"a{_n2(r)} {_n2(r)} 0 1 0 {_n2(-2 * r)} 0Z")


def _rect(a: float, b: float) -> str:
    return f"M{_n2(a)} {_n2(a)}H{_n2(b)}V{_n2(b)}H{_n2(a)}Z"


def _gem(cx: float, cy: float, r: float) -> str:
    return f"M{_n2(cx)} {_n2(cy - r)}L{_n2(cx + r)} {_n2(cy)}L{_n2(cx)} {_n2(cy + r)}L{_n2(cx - r)} {_n2(cy)}Z"


def _polar(r: float, deg: float):
    a = math.radians(deg)
    return 50 + r * math.cos(a), 50 + r * math.sin(a)


def _petal(r0: float, r1: float, rc: float, at: float, half: float, ctrl: float) -> str:
    ax, ay = _polar(r0, at - half)
    c1x, c1y = _polar(rc, at - ctrl)
    tx, ty = _polar(r1, at)
    c2x, c2y = _polar(rc, at + ctrl)
    bx, by = _polar(r0, at + half)
    return (f"M{_n2(ax)} {_n2(ay)}Q{_n2(c1x)} {_n2(c1y)} {_n2(tx)} {_n2(ty)}"
            f"Q{_n2(c2x)} {_n2(c2y)} {_n2(bx)} {_n2(by)}Z")


def _shape(d: str, fill: Optional[str] = None, fo: Optional[float] = None, stroke: Optional[str] = None,
           so: Optional[float] = None, w: float = 1, evenodd: bool = False) -> str:
    out = (f'<path d="{d}" fill="{fill or "none"}"' + (f' fill-opacity="{fo}"' if fo is not None else "")
           + (' fill-rule="evenodd"' if evenodd else ""))
    if stroke:
        out += (f' stroke="{stroke}" stroke-width="{w}"' + (f' stroke-opacity="{so}"' if so is not None else "")
                + ' stroke-linejoin="round" stroke-linecap="round"')
    return out + "/>"


_FRAME_SHAPES = [_shape(_rect(4, 96) + _rect(7.2, 92.8), fill=GOLD_SOFT, fo=0.55, evenodd=True),   # gilded band
                 _shape(_rect(4, 96), stroke=GOLD, w=2.2), _shape(_rect(7.2, 92.8), stroke=KEY, w=0.9),
                 _shape(_rect(9.6, 90.4), stroke=GOLD, w=0.45)]
for _cx, _cy in ((50, 4), (96, 50), (50, 96), (4, 50)):
    _FRAME_SHAPES += [_shape(_gem(_cx, _cy, 3.2), fill=GOLD_SOFT, stroke=KEY, w=0.55), _shape(_circle(_cx, _cy, 0.9), fill=KEY)]

_CORNER_SHAPES = [
    _shape("M9 4.8Q15 1.4 21.5 4.8Q15 8.2 9 4.8Z", fill=GOLD_SOFT, stroke=GOLD, w=0.5),
    _shape("M4.8 9Q1.4 15 4.8 21.5Q8.2 15 4.8 9Z", fill=GOLD_SOFT, stroke=GOLD, w=0.5),
    _shape("M9.4 9.4Q13.19 13.17 17.62 11.91Q14.65 8.39 9.4 9.4Z", fill=GOLD_SOFT, stroke=GOLD, w=0.45),
    _shape("M9.4 9.4Q8.39 14.65 11.91 17.62Q13.17 13.19 9.4 9.4Z", fill=GOLD_SOFT, stroke=GOLD, w=0.45),
    _shape("M9.4 9.4Q11.21 16.3 17.32 17.32Q16.3 11.21 9.4 9.4Z", fill=GOLD_SOFT, stroke=KEY, w=0.5),
    _shape("M10.25 10.25L16.05 16.05", stroke=KEY, so=0.7, w=0.35),
    _shape(_circle(9.4, 9.4, 1.1), fill=KEY),
    _shape(_gem(4.8, 4.8, 4), fill=KEY, stroke=GOLD, w=0.6),
    _shape(_circle(4.8, 4.8, 1.3), fill=GOLD_SOFT),
]

_MANDALA_SHAPES = ([_shape(_circle(50, 50, 33), stroke=GOLD, so=0.5, w=0.7),
                    _shape(_circle(50, 50, 30.6), stroke=KEY, so=0.3, w=0.35)]
                   + [_shape(_petal(15, 29.6, 25.5, k * 22.5 - 90, 11.25, 7.5), fill=GOLD_SOFT, fo=0.18, stroke=GOLD, so=0.5, w=0.4)
                      for k in range(16)]
                   + [_shape(_petal(7.5, 16.5, 14, k * 45 - 67.5, 22.5, 14), fill=GOLD_SOFT, fo=0.22, stroke=KEY, so=0.35, w=0.35)
                      for k in range(8)]
                   + [_shape(_circle(50, 50, 7.5), fill="#FFFFFF", fo=0.6, stroke=GOLD, so=0.55, w=0.45),
                      _shape(_circle(50, 50, 1.8), fill=KEY, fo=0.35)])


def _svg_uri(shapes: List[str], size: int, rotate: int = 0, stretch: bool = False) -> str:
    body = "".join(shapes)
    if rotate:
        body = f'<g transform="rotate({rotate} {size / 2:g} {size / 2:g})">{body}</g>'
    return _data_svg(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}"'
                     + (' preserveAspectRatio="none"' if stretch else "") + f">{body}</svg>")


CORNER_URI = {c: _svg_uri(_CORNER_SHAPES, 24, r) for c, r in (("tl", 0), ("tr", 90), ("br", 180), ("bl", 270))}
FRAME_URI = _svg_uri(_FRAME_SHAPES, 100, stretch=True)
MANDALA_URI = _svg_uri(_MANDALA_SHAPES, 100)
CENTRE_GLOW = (f"radial-gradient(ellipse farthest-corner at center, {CENTRE_IN} 0%, {CENTRE_MID} 40%, "
               f"#FBF1CF 75%, {CENTRE_OUT} 100%)")


# South-Indian grid: (row, col) of each sign (1-based sign numbers, 1 = Mesham)
SOUTH_POS = {12: (0, 0), 1: (0, 1), 2: (0, 2), 3: (0, 3), 11: (1, 0), 4: (1, 3),
             10: (2, 0), 5: (2, 3), 9: (3, 0), 8: (3, 1), 7: (3, 2), 6: (3, 3)}

# Colours a chart takes from the Jathagam panel, set per render with
# use_chart_theme() — a ContextVar, so concurrent PDF requests never mix themes.
_THEME: ContextVar[Dict[str, str]] = ContextVar("chart_theme", default={"accent": "#800000", "ink": "#2B1B12"})


def use_chart_theme(accent: str, ink: str) -> None:
    _THEME.set({"accent": accent, "ink": ink})


def _lagna_uri(colour: str) -> str:
    return _data_svg(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">'
        f'<line x1="0" y1="11" x2="11" y2="0" stroke="{colour}" stroke-width="1.3"/>'
        f'<line x1="0" y1="15" x2="15" y2="0" stroke="{colour}" stroke-width="1.3"/></svg>')


def chart_css(accent: str, ink: str, family: str) -> str:
    """Chart CSS. The artwork (yellow glowing houses, framed centre, Greek-key
    corners) is fixed; the lines, the chart name and the planet text follow the
    panel's colours, and the text uses the panel's Tamil typeface. Every chart is
    an exact square: the grid has a fixed height equal to its width."""
    cell_bg = (f"radial-gradient(ellipse farthest-corner at center, {CELL_IN} 0%, #FFFDE6 18%, {CELL_MID} 40%, "
               f"#F9F0B4 72%, {CELL_OUT} 100%)")
    return f"""
/* ---------- charts: fixed artwork, panel colours and typeface for lines and text ---------- */
.chart {{ break-inside: avoid; page-break-inside: avoid; }}
.chart .ctitle {{ text-align: center; color: {accent}; font-family: {family}; font-weight: 700; margin-bottom: 3pt; }}
.south {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(0, 1fr));
          width: 100%; height: 8.0cm; box-sizing: border-box; border: 2pt solid {accent}; background: {CELL_OUT};
          font-family: {family}; color: {ink}; }}
.south .cell {{ border: 0.9pt solid {accent}; padding: 2pt 1.5pt; min-width: 0; min-height: 0; overflow: hidden; overflow-wrap: anywhere;
                display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                font-size: 9pt; font-weight: 700; line-height: 1.2; background: {cell_bg}; }}
.south .cell.lagna-cell {{ background: url("{_lagna_uri(accent)}") no-repeat 0 0 / 7mm 7mm, {cell_bg}; }}
.south .cell .pl {{ display: block; color: {ink}; }}
.south .cell .pl.lag {{ color: {accent}; }}
/* centre: layered backgrounds (corner keys on top, then the frame, then the glow) —
   no positioned children, so the grid always gives it the full 2 x 2 area */
.south .center {{ grid-column: 2 / span 2; grid-row: 2 / span 2; min-width: 0; min-height: 0; border: 0.9pt solid {accent};
                  display: flex; align-items: center; justify-content: center; text-align: center; padding: 6mm 3.6mm;
                  background:
                    url("{CORNER_URI['tl']}") no-repeat 0 0 / 20% auto,
                    url("{CORNER_URI['tr']}") no-repeat 100% 0 / 20% auto,
                    url("{CORNER_URI['br']}") no-repeat 100% 100% / 20% auto,
                    url("{CORNER_URI['bl']}") no-repeat 0 100% / 20% auto,
                    url("{FRAME_URI}") no-repeat 0 0 / 100% 100%,
                    url("{MANDALA_URI}") no-repeat center / contain,
                    {CENTRE_GLOW}; }}
.south .center .ctext {{ color: {accent}; font-weight: 700; font-size: 12.5pt; line-height: 1.2; overflow-wrap: anywhere;
                       background: rgba(255,255,255,0.62); border-radius: 3pt; padding: 0.5pt 3pt; }}
.south .center .ctext.long {{ font-size: 9.2pt; overflow-wrap: normal; }}
.south .center .ctext.xlong {{ font-size: 7.8pt; overflow-wrap: normal; }}
.north .nbox {{ position: relative; width: 8.0cm; height: 8.0cm; font-family: {family}; }}
.north .nbox svg {{ position: absolute; left: 0; top: 0; width: 100%; height: 100%; }}
.north .nlab {{ position: absolute; transform: translate(-50%, -50%); text-align: center; line-height: 1.2; font-weight: 700;
                overflow-wrap: anywhere; color: {ink}; }}
.north .nlab .lag {{ color: {accent}; }}
.north .nlab .nsig {{ font-size: 6.5pt; color: {ink}; opacity: 0.6; line-height: 1; font-weight: 400; }}
.charts.small .chart {{ width: 5.05cm; }}
.charts.small .chart .ctitle {{ font-size: 8.2pt; line-height: 1.15; height: 2.3em; display: flex; align-items: flex-end; justify-content: center; }}
.charts.small .south {{ height: 5.05cm; border-width: 1.6pt; }}
.charts.small .south .cell {{ font-size: 7.4pt; border-width: 0.7pt; padding: 1pt; }}
.charts.small .south .cell.lagna-cell {{ background-size: 4.6mm 4.6mm, auto; }}
.charts.small .south .center {{ padding: 4mm 3mm; }}
.charts.small .south .center .ctext {{ font-size: 8.4pt; }}
.charts.small .south .center .ctext.long {{ font-size: 7.2pt; }}
.charts.small .south .center .ctext.xlong {{ font-size: 6.4pt; }}
.charts.small .north .nbox {{ width: 5.05cm; height: 5.05cm; }}
"""


def south_chart_html(title: str, cells: Dict[str, List[str]], center_note: Optional[str] = None,
                     show_title_above: Optional[bool] = None) -> str:
    """South-Indian (Tamil / Kerala) fixed-sign chart. The chart name sits in the
    centre box; a centre note (e.g. 'மொத்தம் 48') replaces it there and the name
    then goes above the chart."""
    out = []
    for sign, (r, c) in SOUTH_POS.items():
        items = cells.get(str(sign)) or cells.get(sign) or []   # type: ignore[call-overload]
        n = len(items)
        size = "" if n <= 3 else (' style="font-size:0.86em;line-height:1.12"' if n <= 5 else ' style="font-size:0.74em;line-height:1.08"')
        pls = "".join(f'<span class="pl{" lag" if is_lagna(it) else ""}">{_e(it)}</span>' for it in items)
        cls = "cell lagna-cell" if any(is_lagna(it) for it in items) else "cell"
        out.append(f'<div class="{cls}" style="grid-row:{r + 1};grid-column:{c + 1}"><div{size}>{pls}</div></div>')
    centre_text = center_note or title
    # long names (e.g. திரேக்காணம், சதுர்விம்சாம்சம்) get a smaller face instead of breaking mid-word
    n = len(str(centre_text or ""))
    size = "" if n <= 9 else (" long" if n <= 13 else " xlong")
    out.append(f'<div class="center"><span class="ctext{size}">{_e(centre_text)}</span></div>')
    above = bool(center_note) if show_title_above is None else show_title_above
    head = f'<div class="ctitle">{_e(title)}</div>' if above else ""
    return f'<div class="chart">{head}<div class="south">{"".join(out)}</div></div>'


# North-Indian diamond (fixed houses, house 1 at the top), 0..400 box
_P = {"A": (0, 0), "B": (400, 0), "C": (400, 400), "D": (0, 400), "T": (200, 0), "R": (400, 200), "M": (200, 400),
      "L": (0, 200), "O": (200, 200), "P1": (100, 100), "P2": (300, 100), "P3": (300, 300), "P4": (100, 300)}
_H = [["T", "P2", "O", "P1"], ["A", "T", "P1"], ["A", "P1", "L"], ["L", "P1", "O", "P4"], ["L", "P4", "D"],
      ["D", "P4", "M"], ["M", "P4", "O", "P3"], ["M", "P3", "C"], ["C", "P3", "R"], ["R", "P3", "O", "P2"],
      ["R", "P2", "B"], ["B", "P2", "T"]]


def north_chart_html(title: str, cells: Dict[str, List[str]], lagna_sign: Optional[int]) -> str:
    """North-Indian diamond. Lines and the yellow house fills are SVG; the planet
    labels are HTML boxes over each house centroid, so Tamil is shaped properly and
    wraps inside its house."""
    spots = []
    for h in _H:
        xs = [_P[k][0] for k in h]
        ys = [_P[k][1] for k in h]
        spots.append((sum(xs) / len(xs), sum(ys) / len(ys), 30 if len(h) == 4 else 21))
    lagna = lagna_sign or 1
    line = _THEME.get()["accent"]
    svg = [f'<defs><radialGradient id="hg" cx="50%" cy="50%" r="60%">'
           f'<stop offset="0" stop-color="{CELL_IN}"/><stop offset="0.55" stop-color="{CELL_MID}"/>'
           f'<stop offset="1" stop-color="{CELL_OUT}"/></radialGradient></defs>']
    for h in _H:
        pts = " ".join(f"{_P[k][0]},{_P[k][1]}" for k in h)
        svg.append(f'<polygon points="{pts}" fill="url(#hg)" stroke="{line}" stroke-width="2" stroke-linejoin="round"/>')
    svg.append(f'<rect x="2.5" y="2.5" width="395" height="395" fill="none" stroke="{line}" stroke-width="4"/>')
    labels = []
    for i, (x, y, wpct) in enumerate(spots):
        sign = (lagna - 1 + i) % 12 + 1
        items = cells.get(str(sign)) or cells.get(sign) or []   # type: ignore[call-overload]
        n = len(items)
        fs = 8.6 if n <= 2 else (7.6 if n <= 4 else 6.6)
        body = " ".join(f'<span class="{"lag" if is_lagna(it) else ""}">{_e(it)}</span>' for it in items)
        labels.append(f'<div class="nlab" style="left:{x / 4:.2f}%;top:{y / 4:.2f}%;width:{wpct}%;font-size:{fs}pt">'
                      f'<div class="nsig">{sign}</div>{body}</div>')
    return (f'<div class="chart north"><div class="ctitle">{_e(title)}</div><div class="nbox">'
            f'<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">{"".join(svg)}</svg>{"".join(labels)}</div></div>')
