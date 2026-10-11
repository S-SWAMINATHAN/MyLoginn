"""
Build a PdfRequest (the documented payload) straight from the site's own
calculation engines, so the frontend can ask for a print PDF with the same
inputs it used on screen. Nothing is invented: every value is read from the
Kalai-parity report, the KP engine, the matching engine or the baby-name
engine, and the chart-engine bio data.
"""
from __future__ import annotations

from datetime import date
from typing import Any, Dict, List, Optional, Sequence

from backend.app.services.pdf.schemas import (
    BabyData, ChartGrid, ChartSet, DasaBlock, BhuktiRow, KanithaData, KeyValue, KpData, KpRow, KpSignificator,
    NameRow, NumberMeaning, PdfMetadata, PdfRequest, PdfTheme, PersonSummary, PoruthamData, PoruthamRow, SimpleTable,
    TextSection,
)
from backend.app.services.pdf.ta_text import (
    TIME_CORRECTION_TA, ayanamsa_ta, dms_dir_ta, initial_ta, initials_prefix_ta, time_ta, tz_hours_of, tz_ta, value_ta,
)

SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]
SIGN_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
P7 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
STAR_TA = ["அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்",
           "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்",
           "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"]
STAR_EN = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
           "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola",
           "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]


def star_en(row: Dict[str, Any]) -> str:
    """English star name of a graha-spudam row; the rows carry only the Tamil name,
    so it is read from the same sidereal longitude (27 equal stars of 13°20′)."""
    if row.get("nakshatra_en"):
        return str(row["nakshatra_en"])
    try:
        return STAR_EN[int(float(row["longitude"]) // (40.0 / 3.0)) % 27]
    except (KeyError, TypeError, ValueError):
        return ""


def _theme(theme: Optional[Dict[str, Any]]) -> PdfTheme:
    if not theme:
        return PdfTheme()
    keys = {"ink": "ink", "inkSoft": "ink_soft", "accent": "accent", "accentDeep": "accent_deep", "gold": "gold",
            "paper": "paper", "paperCard": "paper_card", "fontId": "font_id", "navy": "navy"}
    data = {v: theme[k] for k, v in keys.items() if theme.get(k)}
    data.setdefault("navy", data.get("accent_deep", PdfTheme().navy))
    return PdfTheme(**data)


def _L(lang: str, ta: str, en: str) -> str:
    return ta if lang == "ta" else en


def _ayanam(r: Dict[str, Any], lang: str) -> str:
    """உத்தராயணம் when the Sun is between Makara (270°) and Mithuna (90°), else தட்சிணாயனம்."""
    try:
        sun = next(x for x in r["graha_spudam"] if x["planet"] == "Sun")["longitude"]
    except StopIteration:
        return ""
    north = sun >= 270 or sun < 90
    return _L(lang, "உத்தராயணம்" if north else "தட்சிணாயனம்", "Uttarayana" if north else "Dakshinayana")


NAK_TA = ["அசுவனி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்",
          "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்",
          "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"]
EXALT = {"Sun": 1, "Moon": 2, "Mars": 10, "Mercury": 6, "Jupiter": 4, "Venus": 12, "Saturn": 7, "Rahu": 2, "Ketu": 8}
OWN = {"Sun": {5}, "Moon": {4}, "Mars": {1, 8}, "Mercury": {3, 6}, "Jupiter": {9, 12}, "Venus": {2, 7}, "Saturn": {10, 11}, "Rahu": {11}, "Ketu": {8}}
NAT_FRIENDS = {"Sun": {"Moon", "Mars", "Jupiter"}, "Moon": {"Sun", "Mercury"}, "Mars": {"Sun", "Moon", "Jupiter"},
               "Mercury": {"Sun", "Venus"}, "Jupiter": {"Sun", "Moon", "Mars"}, "Venus": {"Mercury", "Saturn"},
               "Saturn": {"Mercury", "Venus"}, "Rahu": {"Venus", "Saturn", "Mercury"}, "Ketu": {"Mars", "Jupiter"}}
NAT_ENEMIES = {"Sun": {"Venus", "Saturn"}, "Moon": set(), "Mars": {"Mercury"}, "Mercury": {"Moon"}, "Jupiter": {"Mercury", "Venus"},
               "Venus": {"Sun", "Moon"}, "Saturn": {"Sun", "Moon", "Mars"}, "Rahu": {"Sun", "Moon", "Mars"}, "Ketu": {"Moon", "Venus"}}
SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]


def _guna(planet: str, sign: int, lang: str) -> str:
    """Kalai 'கிரககுணம்' letter: உ உச்சம், நீ நீசம், ஆ ஆட்சி, ந நட்பு, ச சமம், ப பகை."""
    if planet not in EXALT:
        return "-"
    ex = EXALT[planet]
    if sign == ex:
        return _L(lang, "உ", "Ex")
    if sign == (ex + 5) % 12 + 1:
        return _L(lang, "நீ", "Db")
    if sign in OWN[planet]:
        return _L(lang, "ஆ", "Own")
    lord = SIGN_LORD[sign - 1]
    if lord in NAT_FRIENDS[planet]:
        return _L(lang, "ந", "Fr")
    if lord in NAT_ENEMIES[planet]:
        return _L(lang, "ப", "En")
    return _L(lang, "ச", "Nu")


def _full_kanitha_sections(r: Dict[str, Any], ch: Optional[Dict[str, Any]], lang: str):
    """Every section of the Kalai report as print tables / chart sets / text."""
    blocks: List[Dict[str, Any]] = []
    cur = ["general"]   # report section key of the blocks being added (frontend MODULE_KEYS / palan keys)

    class _Sink:
        def __init__(self, kind):
            self.kind = kind

        def append(self, x):
            blocks.append({"kind": self.kind, "data": x.model_dump(), "key": cur[0]})

    tables, chart_sets, texts = _Sink("table"), _Sink("charts"), _Sink("text")
    sg = SIGN_TA if lang == "ta" else SIGN_EN
    pl = lambda p: _pl(p, lang)

    def safe(fn):
        try:
            fn()
        except Exception:
            pass

    def bhava():
        sub = ["பாகை", "கலை", "விகலை"] if lang == "ta" else ["Deg", "Min", "Sec"]
        grp = [_L(lang, "ஆரம்பம்", "Start"), _L(lang, "மத்தியம்", "Middle"), _L(lang, "அந்தியம்", "End")]
        cols = [_L(lang, "பாவம்", "House")] + [s for g in grp for s in sub]
        rows = []
        for b in r["bhava_spudam"]:
            vals = []
            for k in ("arambam_dms", "madhyam_dms", "anthyam_dms"):
                vals += (str(b[k]).split() + ["", "", ""])[:3]
            rows.append([f'{b["house"]}. {b["name_ta"] if lang == "ta" else b["name_en"]}'] + vals)
        tables.append(SimpleTable(title=_L(lang, "பாவ ஸ்புடம் (பாகை · கலை · விகலை)", "Bhava Spudam (deg · min · sec)"),
            columns=cols, rows=rows, widths=[19] + [9] * 9, group_header=[["", 1]] + [[g, 3] for g in grp]))
        chart_sets.append(ChartSet(title=_L(lang, "பாவ சக்கரம்", "Bhava chart"),
                                   charts=[ChartGrid(title=_L(lang, "பாவ சக்கரம்", "Bhava chart"), cells=_cells(r["bhava_chart"], lang),
                                                     lagna_sign=_lagna(r["bhava_chart"]))]))

    def antharam():
        # Kalai layout: one small card per bhukti, listing its antharams with end dates (compact, 3 cards per row)
        cards = []
        for d in r["dashas"]:
            for b in d["bhuktis"]:
                ants = b.get("antardashas", [])
                if not ants:
                    continue
                cards.append(DasaBlock(lord=_L(lang, f'{pl(d["planet"])} தசா — {pl(b["planet"])} புக்தி', f'{d["planet"]} dasa — {b["planet"]} bhukti'),
                                       start=_ddmmyyyy(ants[0].get("start_date", "")) if ants[0].get("start_date") else "", end=b["end_date_display"],
                                       bhuktis=[BhuktiRow(lord=pl(a["planet"]), end=a["end_date_display"],
                                                          age=" ".join(str(v) for v in a.get("age_ymd", []))) for a in ants]).model_dump())
        blocks.append({"kind": "antharam", "key": "antharam", "data": {"title": _L(lang, "அந்தரம் (கீழே உள்ள தேதிகள் அந்தரங்களின் முடிவு தேதிகளைக் குறிக்கின்றன)",
                                                              "Antharam (dates are the end dates of each antharam)"), "cards": cards}})

    def ashtaka():
        av = r["ashtakavarga"]["planets"]
        rows, sav = [], [0] * 12
        for p in P7:
            x = av[p]
            rows.append([pl(p)] + [str(v) for v in x["bav"]] + [str(sum(x["bav"]))])
            sav = [a + b for a, b in zip(sav, x["bav"])]
        rows.append([_L(lang, "சர்வாஷ்டகம்", "SAV")] + [str(v) for v in sav] + [str(sum(sav))])
        charts = []
        for p in P7:
            cells = {str(i + 1): [str(v)] for i, v in enumerate(av[p]["bav"])}
            charts.append(ChartGrid(title=_L(lang, f"{PL_TA[p]} அஷ்ட வர்க்கம்", f"{p} ashtakavarga"), cells=cells,
                                    center_note=_L(lang, f"மொத்தம் {sum(av[p]['bav'])}", f"Total {sum(av[p]['bav'])}")))
        charts.append(ChartGrid(title=_L(lang, "சர்வாஷ்டக வர்கம்", "Sarvashtakavarga"), cells={str(i + 1): [str(v)] for i, v in enumerate(sav)},
                                center_note=_L(lang, f"மொத்தம் {sum(sav)}", f"Total {sum(sav)}")))
        chart_sets.append(ChartSet(title=_L(lang, "அஷ்ட வர்க்கம்", "Ashtakavarga"), charts=charts, small=True))
        cur[0] = "sarvashtakavarga"
        tables.append(SimpleTable(title=_L(lang, "சர்வாஷ்டக வர்கம் (கிரகவாரி பரல்கள்)", "Sarvashtakavarga (bindus by planet)"),
            columns=[_L(lang, "கிரகம்", "Planet")] + sg + [_L(lang, "மொத்தம்", "Total")], rows=rows,
            widths=[11] + [6.6] * 12 + [9.8]))
        pin = [["aadhi_paral", "ஆதிப்பரல்", "Aadhi"], ["trikona_total", "திரிகோணம்", "Trikona"], ["ekadhi_total", "ஏகாதி", "Ekadhi"],
               ["rasi_gunakaram", "இராசி குணகாரம்", "Rasi guna"], ["graha_gunakaram", "கிரக குணகாரம்", "Graha guna"],
               ["shuddha_pindam", "சுத்த பிண்டம்", "Shuddha"], ["guna_samooham", "குண சமூகம்", "Guna sam."], ["eka_samooham", "ஏக சமூகம்", "Eka sam."]]
        tables.append(SimpleTable(title=_L(lang, "அஷ்டவர்க்க பிண்டங்கள்", "Ashtakavarga pindas"),
            columns=[_L(lang, "கிரகம்", "Planet")] + [_L(lang, a, b) for _, a, b in pin],
            rows=[[pl(p)] + [str(av[p][k]) for k, _, _ in pin] for p in P7], widths=[16] + [10.5] * 8))

    def prasthara():
        pr = r["prasthara"]["planets"]
        rows = []
        for p in P7:
            x = pr[p]
            by = [0] * 12
            for s, v in zip(x["signs"], x["column_totals"]):
                by[s - 1] = v
            rows.append([pl(p)] + [str(v) for v in by] + [str(x["total"])])
        for p in P7:
            x = pr[p]
            cols = [_L(lang, "கொடுப்பவர்", "Donor")] + [(SIGN_TA if lang == "ta" else SIGN_EN)[s - 1] for s in x["signs"]] + [_L(lang, "மொத்தம்", "Total")]
            rows = [[_pl(row["donor"], lang)] + ["●" if c else "–" for c in row["cells"]] + [str(row["total"])] for row in x["rows"]]
            rows.append([_L(lang, "மொத்தம்", "Total")] + [str(v) for v in x["column_totals"]] + [str(x["total"])])
            tables.append(SimpleTable(title=_L(lang, f"{PL_TA[p]} பிரஸ்தார் அஸ்டவர்கம்", f"{p} Prasthara ashtakavarga"),
                                      columns=cols, rows=rows, widths=[13] + [6.6] * 12 + [7.8]))
        tables.append(SimpleTable(title=_L(lang, "பிரஸ்தார் அஷ்டவர்க்கம் (ராசி வாரியாக)", "Prasthara (bindus per sign)"),
            columns=[_L(lang, "கிரகம்", "Planet")] + sg + [_L(lang, "மொத்தம்", "Total")], rows=rows, widths=[11] + [6.6] * 12 + [9.8]))

    def shadbala():
        sb = r["shadbala"]["planets"]
        cols = [("sthana", "ஸ்தான", "Sthana"), ("kala", "கால", "Kala"), ("dig", "திக்", "Dig"), ("cheshta", "சேஷ்டா", "Cheshta"),
                ("naisargika", "நைசர்கிக", "Naisarg."), ("drik", "திருஷ்டி", "Drik"), ("total_rupas", "மொத்தம்", "Total"),
                ("ishta", "இஷ்ட", "Ishta"), ("kashta", "கஷ்ட", "Kashta")]
        names = [("sthana", "ஸ்தான பலம்", "Sthana bala"), ("kala", "கால பலம்", "Kala bala"), ("dig", "திக் பலம்", "Dig bala"),
                 ("cheshta", "சேஷ்டா பலம்", "Cheshta bala"), ("naisargika", "நைசர்கிக பலம்", "Naisargika bala"),
                 ("drik", "திருஷ்டி பலம்", "Drik bala"), ("total_rupas", "மொத்தம் (ரூபம்)", "Total (rupas)")]
        tables.append(SimpleTable(title=_L(lang, "சட்பல கணிதம்", "Shadbala calculation"),
            columns=[_L(lang, "பலம்", "Strength")] + [pl(p) for p in P7],
            rows=[[_L(lang, a, b)] + [f'{sb[p][k]:.3f}' for p in P7] for k, a, b in names], widths=[23] + [11] * 7))
        tables.append(SimpleTable(title=_L(lang, "கிரக சட்பலம்", "Graha shadbala"),
            columns=[_L(lang, "கிரகம்", "Planet"), _L(lang, "சட்பலம் (விரூபம்)", "Shadbala (virupa)"), _L(lang, "பூர்ண பலம்", "Required"),
                     _L(lang, "சதவிகிதம்", "Percent"), _L(lang, "வரிசை", "Rank"), _L(lang, "இஷ்ட", "Ishta"), _L(lang, "கஷ்ட", "Kashta")],
            rows=[[pl(p), f'{sb[p]["total_virupas"]:.2f}', f'{sb[p]["required_virupas"]:.0f}', f'{sb[p]["percentage"]:.2f}',
                   str(sb[p]["rank"]), f'{sb[p]["ishta"]:.2f}', f'{sb[p]["kashta"]:.2f}'] for p in P7],
            widths=[16, 16, 14, 14, 10, 15, 15]))
        bh = r["shadbala"].get("bhavas") or []
        if bh:
            tables.append(SimpleTable(title=_L(lang, "பாவ சட்பலம்", "Bhava shadbala"),
                columns=[_L(lang, "பாவம்", "House"), _L(lang, "பாவாதிபதி", "Lord"), _L(lang, "பாவாதிபதி பலம்", "Lord's strength"),
                         _L(lang, "திக் பலம்", "Dig"), _L(lang, "திருஷ்டி பலம்", "Drik"), _L(lang, "பாவ பலம் (ரூபம்)", "Bhava bala (rupas)"),
                         _L(lang, "விரூபம்", "Virupa"), _L(lang, "வரிசை", "Rank")],
                rows=[[str(b["house"]), b["lord_ta"] if lang == "ta" else b["lord"], f'{b["adhipati"]:.3f}', f'{b["dig"]:.3f}',
                       f'{b["drik"]:.3f}', f'{b["total_rupas"]:.3f}', f'{b["total_virupas"]:.2f}', str(b["rank"])] for b in bh],
                widths=[9, 14, 15, 11, 12, 15, 13, 11]))

    def varga():
        sv = r["shodasa_varga"]
        bodies = P7 + ["Rahu", "Ketu", "Lagna"]
        rows = [[(x["title_ta"] if lang == "ta" else x["title_en"])] + [f'{x["values"].get(b, 0):.2f}' for b in bodies] for x in sv["bala"]["rows"]]
        rows.append([_L(lang, "மொத்தம்", "Total")] + [f'{sv["bala"]["totals"].get(b, 0):.2f}' for b in bodies])
        rows.append([_L(lang, "ரூபங்கள்", "Rupas")] + [f'{sv["bala"].get("totals_rupas", {}).get(b, 0):.2f}' for b in bodies])
        tables.append(SimpleTable(title=_L(lang, "சோடச வர்க்க பலம்", "Shodasa varga bala"),
            columns=[_L(lang, "வர்க்கம்", "Varga")] + [PL_SH_TA.get(b, b) if lang == "ta" else PL_SH_EN.get(b, b) for b in bodies],
            rows=rows, widths=[18] + [8.2] * 10))
        charts = []
        for code, c in sv["charts"].items():
            cells: Dict[str, List[str]] = {}
            for planet, sign in c["signs"].items():
                cells.setdefault(str(sign), []).append(planet)
            charts.append(ChartGrid(title=c["title_ta"] if lang == "ta" else c["title_en"], cells=_cells(cells, lang), lagna_sign=_lagna(cells)))
        chart_sets.append(ChartSet(title=_L(lang, "சோடச வர்க்கம்", "Shodasa varga"), charts=charts, small=False))
        nine = P7 + ["Rahu", "Ketu"]
        tables.append(SimpleTable(title=_L(lang, "சோடச வர்க்க கிரககுணம்", "Shodasa varga — planetary dignity"),
            columns=[_L(lang, "வர்க்கம்", "Varga")] + [PL_SH_TA.get(b, b) if lang == "ta" else PL_SH_EN.get(b, b) for b in nine],
            rows=[[(c["title_ta"] if lang == "ta" else c["title_en"])] + [_guna(b, int(c["signs"].get(b, 0) or 0), lang) if c["signs"].get(b) else "-" for b in nine]
                  for c in sv["charts"].values()],
            widths=[19] + [9] * 9))
        tables.append(SimpleTable(title=_L(lang, "வர்காதிபதி (ஒவ்வொரு வர்க்கத்திலும் கிரகம் நின்ற ராசிநாதன்)", "Varga lords (dispositor in each varga)"),
            columns=[_L(lang, "வர்க்கம்", "Varga")] + [PL_SH_TA.get(b, b) if lang == "ta" else PL_SH_EN.get(b, b) for b in nine],
            rows=[[(c["title_ta"] if lang == "ta" else c["title_en"])] + [(PL_SH_TA.get(c["lords"].get(b), c["lords"].get(b) or "-") if lang == "ta" else (c["lords"].get(b) or "-")) for b in nine]
                  for c in sv["charts"].values() if c.get("lords")],
            widths=[19] + [9] * 9))

    def details():
        dig = {"exalted": ("உச்சம்", "Exalted"), "debilitated": ("நீசம்", "Debilitated"), "own": ("ஆட்சி", "Own"),
               "friend": ("நட்பு", "Friend"), "neutral": ("சமம்", "Neutral"), "enemy": ("பகை", "Enemy")}
        rows = []
        for x in r["planet_details"]["rows"]:
            flags = [f for f, on in ((_L(lang, "வ", "R"), x["retrograde"]), (_L(lang, "அ", "C"), x["combust"]), (_L(lang, "வர்", "V"), x["vargottama"])) if on]
            rows.append([pl(x["planet"]), str(x["bhava"]), str(x["suyam_bhava_bala_pct"]), ", ".join(map(str, x["lord_of"])) or "-",
                         _L(lang, *dig.get(x["dignity"], (x["dignity"], x["dignity"]))), " ".join(pl(q) for q in x["conjunct"]) or "-",
                         " ".join(pl(q) for q in x["aspected_by"]) or "-", " ".join(flags) or "-"])
        tables.append(SimpleTable(title=_L(lang, "கிரகங்களின் விவர அட்டவணை", "Planet details"),
            columns=[_L(lang, "கிரகம்", "Planet"), _L(lang, "பாவகம்", "Bhava"), "%", _L(lang, "ஆதிபத்தியம்", "Lord of"),
                     _L(lang, "நிலை", "Dignity"), _L(lang, "சேர்க்கை", "With"), _L(lang, "பார்வை", "Aspected by"), _L(lang, "வ/அ/வர்", "R/C/V")],
            rows=rows, widths=[13, 8, 7, 12, 12, 16, 20, 12]))

    def upagraha():
        tables.append(SimpleTable(title=_L(lang, "உப கிரக ஸ்புடம்", "Upagraha spudam"),
            columns=[_L(lang, "உப கிரகம்", "Upagraha"), _L(lang, "பா க வி", "D M S"), _L(lang, "நட்சத்திரம்", "Star"), _L(lang, "பாதம்", "Pada"),
                     _L(lang, "ராசி", "Sign"), _L(lang, "ராசியில் பா க வி", "In sign")],
            rows=[[x["name_ta"] if lang == "ta" else x["key"], x["dms"], NAK_TA[int(x["longitude"] // (360 / 27)) % 27],
                   str(int((x["longitude"] % (360 / 27)) // (360 / 108)) + 1), sg[x["sign"] - 1], x["degree_in_sign_dms"]] for x in r["upagraha"]["rows"]],
            widths=[24, 16, 18, 8, 16, 18]))

    def kalachakra():
        kc = r["kalachakra"]
        dir_en = str(kc.get("direction", "")).lower()
        # Kalai prints the direction as வல வோட்டு (savya, clockwise) / இட வோட்டு (apasavya)
        direction = (("இட வோட்டு" if "apa" in dir_en or "anti" in dir_en else "வல வோட்டு") if lang == "ta"
                     else ("Apasavya" if "apa" in dir_en or "anti" in dir_en else "Savya"))
        for d in kc["dashas"]:
            bal = d.get("balance_ymd")
            head = (f'{direction} {d["sign_ta"]} {d["lord_ta"]} தசா {d["years"]} வருடம்' if lang == "ta"
                    else f'{direction} {d.get("sign", "")} dasa — {d["years"]} years')
            if bal:
                head += _L(lang, f' (இருப்பு {bal[0]} வ {bal[1]} மா {bal[2]} நா)', f' (balance {bal[0]}y {bal[1]}m {bal[2]}d)')
            rows = [[(b.get("sign_ta") + " " + b.get("lord_ta", "")) if lang == "ta" else b.get("sign", ""), b["start"], b["end"],
                     *[str(v) for v in (b.get("age_ymd") or ["", "", ""])]] for b in d["bhuktis"]]
            tables.append(SimpleTable(title=_L(lang, "காலச்சக்கிர தசை — ", "Kalachakra dasa — ") + head,
                columns=[_L(lang, "புக்தி", "Bhukti"), _L(lang, "ஆரம்ப தேதி", "Start"), _L(lang, "முடிவு தேதி", "End"),
                         _L(lang, "வ", "Y"), _L(lang, "மா", "M"), _L(lang, "நா", "D")],
                rows=rows, widths=[30, 20, 20, 10, 10, 10]))

    def pakshi():
        pk = r["panchapakshi"]
        for half in ("shukla", "krishna"):
            s = pk[half]
            title = _L(lang, f'பஞ்சபட்சி — {pk["birth_bird_ta"]} ({"வளர் பிறை" if half == "shukla" else "தேய்பிறை"})',
                       f'Panchapakshi — {pk["birth_bird"]} ({"bright half" if half == "shukla" else "dark half"})')
            tables.append(SimpleTable(title=title,
                columns=[_L(lang, "கிழமை", "Day")] + ["06-00", "08-24", "10-48", "01-12", "03-36"] * 2,
                rows=[[g["day_ta"] if lang == "ta" else g["day"]] + (g["activities_ta"] if lang == "ta" else g["activities"]) for g in s["grid"]],
                widths=[14.8] + [8.52] * 10))

    def numerology():
        d = r["numerology"]["data"]
        paras = [f'{_L(lang, "பிறந்த தேதி எண்", "Birth number")}: {d["birth_number"]} · {_L(lang, "கூட்டு எண்", "Destiny number")}: {d["destiny_number"]} · '
                 f'{_L(lang, "பெயர் எண்", "Name number")}: {d["name_number"]} ({d["name_compound_total"]})']
        for k in ("analysis_ta" if lang == "ta" else "analysis",):
            if d.get(k):
                paras.append(d[k])
        sp = r.get("single_page") or {}
        if sp.get("name_numbers"):
            paras.append(f'{_L(lang, "நியுமராலஜிப்படி பெயரின் கூட்டு எண்", "Name numbers by numerology")}: {"-".join(map(str, sp["name_numbers"]))}')
        if sp.get("star_letters"):
            paras.append(f'{_L(lang, "நட்சத்திரப்படி பெயரின் முதல் எழுத்து", "First letters by star")}: {sp["star_letters"]["display"]}')
        texts.append(TextSection(title=_L(lang, "நியுமராலஜி", "Numerology"), paragraphs=paras))
        vals = [("A", 1), ("B", 2), ("C", 3), ("D", 4), ("E", 5), ("F", 8), ("G", 3), ("H", 5), ("I", 1), ("J", 1), ("K", 2), ("L", 3), ("M", 4),
                ("N", 5), ("O", 7), ("P", 8), ("Q", 1), ("R", 2), ("S", 3), ("T", 4), ("U", 6), ("V", 6), ("W", 6), ("X", 5), ("Y", 1), ("Z", 7)]
        tables.append(SimpleTable(title=_L(lang, "நியுமராலஜி எழுத்து எண் அட்டவணை", "Numerology letter values"),
                                  columns=[a_ for a_, _ in vals[:13]], rows=[[str(v) for _, v in vals[:13]], [a_ for a_, _ in vals[13:]], [str(v) for _, v in vals[13:]]],
                                  widths=[100 / 13] * 13))

    def palans():
        P = r.get("palan_" + lang) or r.get("palan_ta")
        if not P:
            return
        cur[0] = "bhava_palan"
        texts.append(TextSection(title=_L(lang, "பாவக பலன்கள்", "Bhava palan"),
                                 paragraphs=[x for h in P["bhava"] for x in (["## " + h["title"]] + h["paragraphs"])]))
        cur[0] = "dasa_palan"
        texts.append(TextSection(title=_L(lang, "மகாதிசை பலன்கள்", "Mahadasa palan"),
                                 paragraphs=[x for d in P["dasa"] for x in (["## " + d["title"]] + d["paragraphs"] + ["- " + b for b in d["bhuktis"]])]))
        # Guru / Sani gochara as paragraphs, exactly in the order of the reference reports
        for key, ta, en in (("guru", "குரு கோச்சார பலன்கள்", "Guru gochara palan"), ("sani", "சனி கோச்சார பலன்கள்", "Sani gochara palan")):
            cur[0] = key + "_gochara"
            texts.append(TextSection(title=_L(lang, ta, en),
                                     paragraphs=[x for g in P["gochara"][key] for x in (["## " + g["title"]] + g["paragraphs"])]))
        cur[0] = "yoga"
        texts.append(TextSection(title=_L(lang, "யோக அவயோகங்கள்", "Yogas and avayogas"),
                                 paragraphs=[x for y in P["yoga"] for x in ("## " + y["name"], y["text"])]))
    # Kalai order (Thirukanitam_refernce.pdf contents)
    cur[0] = "bhava_spudam"
    safe(bhava)
    blocks.append({"kind": "dasa", "data": {}, "key": "dasa_bhukti"})
    for key, fn_ in (("antharam", antharam), ("ashtakavarga", ashtaka), ("prasthara", prasthara), ("shadbala", shadbala),
                     ("shodasa_varga", varga), ("planet_details", details), ("numerology", numerology), ("upagraha", upagraha),
                     ("kalachakra", kalachakra), ("panchapakshi", pakshi), ("bhava_palan", palans)):
        cur[0] = key
        safe(fn_)
    return blocks


PL_TA = {"Sun": "சூரியன்", "Moon": "சந்திரன்", "Mars": "செவ்வாய்", "Mercury": "புதன்", "Jupiter": "குரு",
         "Venus": "சுக்கிரன்", "Saturn": "சனி", "Rahu": "ராகு", "Ketu": "கேது", "Lagna": "லக்னம்", "Mandi": "மாந்தி",
         "Uranus": "யுரேனஸ்", "Neptune": "நெப்டியூன்", "Fortuna": "அதிஷ்டப்பாகை"}
PL_SH_TA = {"Sun": "சூரி", "Moon": "சந்", "Mars": "செவ்", "Mercury": "புத", "Jupiter": "குரு", "Venus": "சுக்",
            "Saturn": "சனி", "Rahu": "ராகு", "Ketu": "கேது", "Lagna": "லக்", "Mandi": "மாந்",
            "Uranus": "யுரே", "Neptune": "நெப்", "Fortuna": "அ.பா"}
PL_SH_EN = {"Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me", "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa",
            "Rahu": "Ra", "Ketu": "Ke", "Lagna": "Asc", "Mandi": "Md", "Uranus": "Ur", "Neptune": "Ne", "Fortuna": "Fo"}


def _pl(p: str, lang: str) -> str:
    return PL_TA.get(p, p) if lang == "ta" else p


def _cells(chart: Dict[str, List[str]], lang: str) -> Dict[str, List[str]]:
    sh = PL_SH_TA if lang == "ta" else PL_SH_EN
    return {str(k): [sh.get(p, p) for p in v] for k, v in chart.items()}


def _lagna(chart: Dict[str, List[str]]) -> Optional[int]:
    for k, v in chart.items():
        if "Lagna" in v:
            return int(k)
    return None


def _ddmmyyyy(iso: str) -> str:
    y, m, d = iso.split("-")
    return f"{d}-{m}-{y}"


def _ampm(t: str) -> str:
    h, m, *s = [int(x) for x in t.split(":")]
    return f"{(h % 12) or 12:02d}:{m:02d}:{(s[0] if s else 0):02d} {'AM' if h < 12 else 'PM'}"


def _dashas(dashas: List[Dict[str, Any]], lang: str) -> List[DasaBlock]:
    out = []
    for d in dashas:
        out.append(DasaBlock(
            lord=d["planet_ta"] if lang == "ta" else d["planet"], years=d.get("lord_years"),
            start=d["start_date_display"], end=d["end_date_display"],
            bhuktis=[BhuktiRow(lord=b["planet_ta"] if lang == "ta" else b["planet"], end=b["end_date_display"],
                               age=" ".join(str(x) for x in b.get("age_ymd", []))) for b in d["bhuktis"]]))
    return out


# Every field of the site's bio-data form (models.schemas.ParentsBioData), in the
# order of the website's bio-data card, with its Tamil and English label.
BIO_LABELS = {
    "father_name": ("தந்தை பெயர்", "Father's name"), "father_occupation": ("தந்தை தொழில்", "Father's occupation"),
    "mother_name": ("தாயார் பெயர்", "Mother's name"), "mother_occupation": ("தாயார் தொழில்", "Mother's occupation"),
    "gothram": ("கோத்திரம் / குலம்", "Gothram / Kulam"), "kula_deivam": ("குலதெய்வம்", "Kula deivam"),
    "kula_deivam_place": ("குலதெய்வக் கோவில் ஊர்", "Kula deivam temple"), "native_place": ("பூர்வீகம் / சொந்த ஊர்", "Native place"),
    "caste_subcaste": ("சாதி / உட்பிரிவு", "Caste / Sub-caste"), "siblings": ("உடன் பிறந்தோர்", "Siblings"),
    "education": ("கல்வித் தகுதி", "Education"), "occupation": ("தொழில் / உத்தியோகம்", "Occupation"),
    "annual_income": ("வருமானம்", "Income"), "height": ("உயரம்", "Height"),
    "phone": ("கைபேசி", "Phone"), "alternate_phone": ("மாற்று எண்", "Alternate phone"), "email": ("மின்னஞ்சல்", "Email"),
    "residence_address": ("வசிப்பிட முகவரி", "Address"),
    # older keys some callers still send
    "complexion": ("நிறம்", "Complexion"), "religion": ("மதம்", "Religion"), "caste": ("குலம்", "Community"),
    "address": ("முகவரி", "Address"), "contact": ("தொடர்பு", "Contact"), "income": ("வருமானம்", "Income"),
    "expectations": ("எதிர்பார்ப்பு", "Expectations"),
}


def _bio(bio: Optional[Dict[str, Any]], lang: str, skip: Sequence[str] = ()) -> List[KeyValue]:
    """Bio-data rows with Tamil labels on Tamil pages. Keys already printed
    elsewhere in the report (e.g. father / mother names in the general details)
    are left out so nothing is printed twice."""
    if not bio:
        return []
    out = []
    keys = [k for k in BIO_LABELS if k in bio] + [k for k in bio if k not in BIO_LABELS]
    for k in keys:
        v = bio.get(k)
        if k in skip or v in (None, "", [], {}):
            continue
        ta, en = BIO_LABELS.get(k, (k.replace("_", " ").title(), k.replace("_", " ").title()))
        out.append(KeyValue(label=ta if lang == "ta" else en, value=str(v)))
    return out


def _tob(t: str, lang: str) -> str:
    return time_ta(_ampm(t)) if lang == "ta" else _ampm(t)


def _meta(name: str, dob: str, tob: str, place: str, lat: float, lon: float, tz: str, gender: Optional[str] = None,
          lang: str = "en") -> PdfMetadata:
    return PdfMetadata(name=name or "-", dob=_ddmmyyyy(dob), tob=_tob(tob, lang), pob=place or "-",
                       latitude=f"{lat:.4f}", longitude=f"{lon:.4f}", timezone=tz, gender=gender,
                       report_date=date.today().strftime("%d-%m-%Y"))


def _parent(req: Dict[str, Any], key: str) -> str:
    v = req.get(key) or (req.get("bio_data") or {}).get(key)
    if not v and key == "father_name":
        v = req.get("parent_name")      # the chart engine uses parent_name as the father's name
    return str(v or "")


def _want(sections: Optional[Sequence[str]], key: str) -> bool:
    """Custom report: only the sections the user ticked (None = every section)."""
    return sections is None or key in sections


def kanitha_request(req: Dict[str, Any], lang: str, god: str, style: str, theme: Optional[Dict[str, Any]] = None,
                    mode: str = "full", sections: Optional[Sequence[str]] = None, page_size: str = "A4") -> PdfRequest:
    """mode: full | single | custom. For custom, `sections` lists the report
    section keys to print (the general opening and closing pages always stay)."""
    from backend.app.services.kalai_report import build_kalai_report
    from backend.app.services.geocode import resolve_place
    lat, lon, tz = resolve_place(req.get("place", ""), req.get("latitude"), req.get("longitude"), req.get("timezone"))
    tob = req["time_of_birth"] if len(req["time_of_birth"].split(":")) == 3 else req["time_of_birth"] + ":00"
    r = build_kalai_report(req.get("name", ""), req["date_of_birth"], tob, req.get("place", ""), lat, lon, tz,
                           panchangam_system=req.get("panchangam_system") or "thirukkanitham")
    g = r["general"]
    ta = lang == "ta"
    tv = (lambda v: value_ta(v)) if ta else (lambda v: v)
    sel = list(sections) if (mode == "custom" and sections is not None) else None
    father, mother = _parent(req, "father_name"), _parent(req, "mother_name")
    basic = [KeyValue(label=row[0] if lang == "ta" else row[1], value=str(row[2])) for row in [
        ("பிறந்த நாள்", "Weekday", g.get("weekday_ta") if lang == "ta" else g.get("weekday_en")),
        ("தமிழ் தேதி", "Tamil date", g.get("tamil_date_ta") if lang == "ta" else g.get("tamil_date_en")),
        ("உதயாதி நாழிகை", "Udhayathi nazhigai", g.get("udhayadhi_nazhigai") if lang == "ta" else g.get("udhayadhi_nazhigai_en")),
        ("அட்சாம்சம் / தீர்க்காம்சம்", "Latitude / Longitude", tv(f'{g.get("latitude_dms")} / {g.get("longitude_dms")}')),
        ("நேர மண்டலம்", "Time zone", tz_ta(g.get("timezone"), tz_hours_of(g.get("timezone"), req["date_of_birth"])) if ta else g.get("timezone")),
        ("சூரிய உதயம்", "Sunrise", tv(f'{g.get("sun_rise")} ({g.get("sunrise_method_ta") if lang == "ta" else g.get("sunrise_method_en")})')),
        ("சூரிய அஸ்தமனம்", "Sunset", tv(g.get("sun_set"))),
        ("அயனாம்சம்", "Ayanamsa", tv(f'{g.get("ayanamsa_dms")} ({g.get("ayanamsa_name")})')), ("நட்சத்திர ஹோரை", "Sidereal time", g.get("nakshatra_horai")),
        ("ஜன்ம நட்சத்திரம்", "Birth star", f'{g.get("janma_nakshatra_ta") if lang == "ta" else g.get("janma_nakshatra_en")} {g.get("pada", "")}'),
        ("ஜன்ம ராசி", "Moon sign", g.get("janma_rasi_ta") if lang == "ta" else g.get("janma_rasi_en")),
        ("லக்னம்", "Lagna", g.get("lagna_ta") if lang == "ta" else g.get("lagna_en")),
        ("திதி", "Tithi", g.get("thithi_ta") if lang == "ta" else g.get("thithi_en")),
        ("யோகம்", "Yogam", g.get("yogam_ta") if lang == "ta" else g.get("yogam_en")),
        ("கரணம்", "Karanam", g.get("karanam_ta") if lang == "ta" else g.get("karanam_en")),
        ("பட்சம்", "Paksha", g.get("paksha_ta") if lang == "ta" else g.get("paksha_en")),
        ("அயனம்", "Ayanam", _ayanam(r, lang)),
        ("நேர திருத்தம்", "Time correction", _L(lang, TIME_CORRECTION_TA, "Standard Time (No Correction)")),
        ("தந்தை பெயர்", "Father's name", father),
        ("தாயார் பெயர்", "Mother's name", mother),
    ] if row[2] not in (None, "", "None")]
    def _dms3(s):
        return (str(s).split() + ["", "", ""])[:3]
    planets = SimpleTable(
        title="", columns=(["கிரகம்", "பாகை", "கலை", "விகலை", "நட்சத்திரம்", "பாதம்", "ராசி", "பாகை", "கலை", "விகலை", "நவாம்சம்"] if lang == "ta"
                           else ["Planet", "Deg", "Min", "Sec", "Star", "Pada", "Sign", "Deg", "Min", "Sec", "Navamsa"]),
        rows=[[_pl(x["planet"], lang) + (" (வ)" if x.get("retrograde") and lang == "ta" else " (R)" if x.get("retrograde") else "")]
              + _dms3(x["longitude_dms"])
              + [x.get("nakshatra_ta") if lang == "ta" else star_en(x), str(x.get("pada", "")),
                 x.get("rasi_ta") if lang == "ta" else x.get("rasi_en", "")]
              + _dms3(x.get("degree_in_sign_dms", ""))
              + [x.get("navamsa_ta") if lang == "ta" else x.get("navamsa_en", "")] for x in r["graha_spudam"]],
        widths=[13, 6.5, 6, 8, 13, 7, 11, 6.5, 6, 8, 15],   # விகலை / பாதம் columns wide enough to stay whole
        group_header=[["", 1], [_L(lang, "ஸ்புடம்", "Longitude"), 3], ["", 3], [_L(lang, "ராசியில்", "In sign"), 3], ["", 1]])
    charts = [ChartGrid(title="ராசி" if lang == "ta" else "Rasi", cells=_cells(r["rasi_chart"], lang), lagna_sign=_lagna(r["rasi_chart"])),
              ChartGrid(title="நவாம்சம்" if lang == "ta" else "Navamsam", cells=_cells(r["navamsa_chart"], lang), lagna_sign=_lagna(r["navamsa_chart"]))]
    bal = r.get("dasa_balance", {})
    # bio data from the chart engine (the same card the site shows)
    bio: List[KeyValue] = []
    ch: Optional[Dict[str, Any]] = None
    try:
        from backend.app.api.charts import run_chart_calculation
        from backend.app.models.schemas import GenerateChartRequest
        ch = run_chart_calculation(GenerateChartRequest(**req))
        ch = ch if isinstance(ch, dict) else None
        # father / mother are already in the general details: print them once only
        bio = _bio(ch.get("bio_data") if ch else None, lang, skip=("father_name", "mother_name"))
    except Exception:
        bio = []
    if mode == "single":
        # Kalai "ஒரு பக்க ஜாதகம்": general details, planets, rasi/navamsa, and the single-page lines
        sp = r.get("single_page") or {}
        notes = []
        if sp:
            notes.append(KeyValue(label=_L(lang, "பாவக மாற்றம்", "Bhava change"),
                                  value=" ".join(f'{m["planet_ta"]}({m["bhava_sign_ta"]})' for m in sp.get("bhava_moves", [])) or _L(lang, "மாற்றம் இல்லை", "No change")))
            cur = sp.get("current_dasa_bhukti")
            if cur:
                notes.append(KeyValue(label=_L(lang, "நடப்பு தசா புக்தி முடிவு", "Current dasa-bhukti ends"),
                                      value=f'{cur["dasa_ta"]} தசா {cur["bhukti_ta"]} புக்தி {cur["end"]}' if lang == "ta" else f'{cur["dasa"]} / {cur["bhukti"]} {cur["end"]}'))
            notes.append(KeyValue(label=_L(lang, "நியுமராலஜிப்படி பெயரின் கூட்டு எண்", "Name numbers"), value="-".join(map(str, sp.get("name_numbers", [])))))
            if sp.get("star_letters"):
                notes.append(KeyValue(label=_L(lang, "நட்சத்திரப்படி பெயரின் முதல் எழுத்து", "First letters by star"), value=sp["star_letters"]["display"]))
        notes.insert(0, KeyValue(label=_L(lang, "ஜனன கால தசை இருப்பு", "Dasa balance at birth"),
                                 value=str((r.get("dasa_balance") or {}).get("formatted_ta" if lang == "ta" else "formatted_en", ""))))
        return PdfRequest(feature_type="kanitha_jathagam", god_image=god, language=lang, chart_style=style, theme=_theme(theme),
                          metadata=_meta(req.get("name", ""), req["date_of_birth"], tob, req.get("place", ""), lat, lon, tz, req.get("gender"), lang),
                          feature_data=KanithaData(basic_details=basic, bio_data=bio, planets=planets, charts=charts[:2], notes=notes).model_dump())
    ordered = [b for b in _full_kanitha_sections(r, ch, lang) if _want(sel, b.get("key", ""))]
    # (the bhava chart is printed with the bhava spudam, as in the reference)
    return PdfRequest(feature_type="kanitha_jathagam", god_image=god, language=lang, chart_style=style, theme=_theme(theme),
                      page_size="A5" if str(page_size).upper() == "A5" else "A4",
                      metadata=_meta(req.get("name", ""), req["date_of_birth"], tob, req.get("place", ""), lat, lon, tz, req.get("gender"), lang),
                      feature_data=KanithaData(basic_details=basic if _want(sel, "general") else [],
                                               bio_data=bio if _want(sel, "general") else [],
                                               planets=planets if _want(sel, "graha_spudam") else None,
                                               charts=charts if _want(sel, "graha_spudam") else [],
                                               dasa_balance=bal.get("formatted_ta") if lang == "ta" else bal.get("formatted_en"),
                                               dashas=_dashas(r["dashas"], lang) if _want(sel, "dasa_bhukti") else [],
                                               ordered=ordered).model_dump())


def kp_request(req: Dict[str, Any], lang: str, god: str, style: str, theme: Optional[Dict[str, Any]] = None,
               mode: str = "all", sections: Optional[Sequence[str]] = None, page_size: str = "A4") -> PdfRequest:
    """mode: all | type_a | custom. Section keys (frontend KpReport MODULES):
    general, planets, cusps, chart, significators, aspects, dasa, antharam."""
    from backend.app.services.ephemeris import get_julian_day, kalai_ephemeris
    from backend.app.services.geocode import resolve_place
    from backend.app.services.kalai_kp import compute_kp
    lat, lon, tz = resolve_place(req.get("place", ""), req.get("latitude"), req.get("longitude"), req.get("timezone"))
    tob = req["time_of_birth"] if len(req["time_of_birth"].split(":")) == 3 else req["time_of_birth"] + ":00"
    jd = get_julian_day(req["date_of_birth"], tob, tz)
    with kalai_ephemeris(jd):
        k = compute_kp(jd, lat, lon, req["date_of_birth"], tob)
    pl = lambda p: _pl(p, lang)
    ta = lang == "ta"
    if mode == "custom" and sections is not None:
        sel: Optional[List[str]] = list(sections)
    elif mode == "type_a":   # KP Type A stops at dasa-bhukti, as in Kalai
        sel = ["general", "planets", "cusps", "chart", "significators", "aspects", "dasa"]
    else:
        sel = None
    latlon = f"{abs(lat):.4f} {'N' if lat >= 0 else 'S'} / {abs(lon):.4f} {'E' if lon >= 0 else 'W'}"
    basic = [KeyValue(label="அட்சாம்சம் / தீர்க்காம்சம்" if ta else "Latitude / Longitude", value=dms_dir_ta(latlon) if ta else latlon),
             KeyValue(label="நேர மண்டலம்" if ta else "Time zone", value=tz_ta(tz, tz_hours_of(tz, req["date_of_birth"])) if ta else tz)]
    bal = k.get("dasa_balance", {})
    bio: List[KeyValue] = []
    try:
        from backend.app.api.charts import run_chart_calculation
        from backend.app.models.schemas import GenerateChartRequest
        chr_ = run_chart_calculation(GenerateChartRequest(**req))
        bio = _bio(chr_.get("bio_data") if isinstance(chr_, dict) else None, lang)
    except Exception:
        bio = []
    kp_cells: Dict[str, List[str]] = {}
    for p in k["kp_chart"]["planets"]:
        kp_cells.setdefault(str(p["sign"]), []).append(p["planet"])
    extra: List[SimpleTable] = []
    if _want(sel, "significators"):
        extra.append(SimpleTable(title=_L(lang, "பாவ காரகத்துவம்", "Bhava significators"),
            columns=[_L(lang, "பாவம்", "Bhava"), _L(lang, "பாவத்திலுள்ள கிரக நட்சத்திரத்தில்", "In star of occupants"), _L(lang, "பாவத்திலுள்ள கிரகங்கள்", "Occupants"),
                     _L(lang, "அதிபதி நட்சத்திரத்தில்", "In star of lord"), _L(lang, "பாவ அதிபதி", "Lord")],
            rows=[[b["roman"], " ".join(pl(x) for x in b["in_star_of_occupants"]) or "-", " ".join(pl(x) for x in b["occupants"]) or "-",
                   " ".join(pl(x) for x in b["in_star_of_lord"]) or "-", pl(b["lord"])] for b in k["bhava_significators"]], widths=[10, 26, 20, 26, 18]))
    rows11 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus", "Neptune"]
    if _want(sel, "aspects"):
        extra.append(SimpleTable(title=_L(lang, "கிரக - பாவ பார்வைகள்", "Graha - Bhava aspects"),
            columns=[""] + ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"],
            rows=[[pl(p)] + list(k["bhava_aspects"][p]) for p in rows11], widths=[13.6] + [7.2] * 12))
        extra.append(SimpleTable(title=_L(lang, "கிரக - கிரக பார்வைகள்", "Graha - Graha aspects"),
            columns=[""] + [PL_SH_TA.get(q, q[:3]) if ta else q[:3] for q in rows11],
            rows=[[pl(p)] + [k["planet_aspects"][p][q] for q in rows11] for p in rows11], widths=[12.3] + [7.97] * 11))
    if _want(sel, "antharam"):
        rows = [[pl(d["planet"]), pl(b["planet"]), pl(a["planet"]), a["end_date_display"]]
                for d in k["dashas"] for b in d["bhuktis"] for a in b.get("antardashas", [])]
        extra.append(SimpleTable(title=_L(lang, "அந்தரம்", "Antharam"),
                                 columns=[_L(lang, "தசை", "Dasa"), _L(lang, "புக்தி", "Bhukti"), _L(lang, "அந்தரம்", "Antharam"), _L(lang, "முடிவு", "Ends")],
                                 rows=rows, widths=[25, 25, 25, 25]))
    ayan = f'{k["ayanamsa_dms"]} ({k["ayanamsa_name"]})'
    return PdfRequest(feature_type="kp_jathagam", god_image=god, language=lang, chart_style=style, theme=_theme(theme),
                      page_size="A5" if str(page_size).upper() == "A5" else "A4",
                      metadata=_meta(req.get("name", ""), req["date_of_birth"], tob, req.get("place", ""), lat, lon, tz, req.get("gender"), lang),
                      feature_data=KpData(
                          basic_details=basic if _want(sel, "general") else [], bio_data=bio if _want(sel, "general") else [],
                          extra_tables=extra,
                          charts=[ChartGrid(title="கே.பி ராசி" if ta else "KP Rasi", cells=_cells(kp_cells, lang), lagna_sign=_lagna(kp_cells))]
                          if _want(sel, "chart") else [],
                          ayanamsa=(ayanamsa_ta(ayan) if ta else ayan) if _want(sel, "general") else None,
                          planets=[KpRow(name=pl(p["planet"]), dms=p["dms"], sign_lord=pl(p["sign"]), star_lord=pl(p["star"]),
                                         sub_lord=pl(p["sub"]), subsub_lord=pl(p["subsub"])) for p in k["planets"]] if _want(sel, "planets") else [],
                          cusps=[KpRow(name=c["roman"], dms=c["dms"], sign_lord=pl(c["sign"]), star_lord=pl(c["star"]),
                                       sub_lord=pl(c["sub"]), subsub_lord=pl(c["subsub"])) for c in k["cusps"]] if _want(sel, "cusps") else [],
                          significators=[KpSignificator(planet=pl(s["planet"]), by_star=", ".join(map(str, s["by_star"])),
                                                        by_sub=", ".join(map(str, s["by_sub"])),
                                                        aspected_by=", ".join(pl(x) for x in s["aspected_by"]) or "-") for s in k["planet_significators"]]
                          if _want(sel, "significators") else [],
                          dasa_balance=bal.get("formatted_ta") if ta else bal.get("formatted_en"),
                          dashas=_dashas(k["dashas"], lang) if _want(sel, "dasa") else []).model_dump())


def porutham_request(girl: Dict[str, Any], boy: Dict[str, Any], lang: str, god: str, style: str, theme: Optional[Dict[str, Any]] = None) -> PdfRequest:
    from backend.app.services.kalai_matching import build_kalai_matching
    m = build_kalai_matching(girl, boy)
    def person(p, who_ta, who_en):
        g = p["general"]
        det = [KeyValue(label="பிறந்த தேதி" if lang == "ta" else "Date of birth", value=_ddmmyyyy(str(g.get("date_of_birth")))),
               KeyValue(label="பிறந்த நேரம்" if lang == "ta" else "Time of birth", value=_tob(str(g.get("time_of_birth")), lang)),
               KeyValue(label="நட்சத்திரம்" if lang == "ta" else "Star", value=f'{g.get("janma_nakshatra_ta") if lang == "ta" else g.get("janma_nakshatra_en")} {g.get("pada", "")}'),
               KeyValue(label="ராசி" if lang == "ta" else "Rasi", value=str(g.get("janma_rasi_ta") if lang == "ta" else g.get("janma_rasi_en"))),
               KeyValue(label="லக்னம்" if lang == "ta" else "Lagna", value=str(g.get("lagna_ta") if lang == "ta" else g.get("lagna_en"))),
               KeyValue(label="செவ்வாய் தோஷம்" if lang == "ta" else "Sevvai", value={"none": "இல்லை" if lang == "ta" else "None", "parihara": "பரிகார செவ்வாய்" if lang == "ta" else "With remedy", "dosham": "தோஷம்" if lang == "ta" else "Dosham"}[p["sevvai"]])]
        return PersonSummary(title=f'{who_ta if lang == "ta" else who_en}: {g.get("name") or "-"}', details=det,
                             charts=[ChartGrid(title="ராசி" if lang == "ta" else "Rasi", cells=_cells(p["rasi_chart"], lang), lagna_sign=_lagna(p["rasi_chart"]))])
    rows = []
    for r in m["poruthams"]["rows"]:
        status = "matched" if r["points"] >= r["max"] else ("not_matched" if r["points"] == 0 else "partial")
        rows.append(PoruthamRow(name=r["name_ta"], girl_value=r["girl"], boy_value=r["boy"], max_points=r["max"],
                                points=r["points"], status=status, result_text=r["verdict_ta"] if lang == "ta" else None))
    ok = lambda b: ("பொருத்தம் உண்டு" if b else "பொருத்தம் இல்லை") if lang == "ta" else ("Compatible" if b else "Not compatible")
    extras = [KeyValue(label="செவ்வாய் தோஷம்" if lang == "ta" else "Sevvai dosham", value=ok(m["sevvai"]["match"])),
              KeyValue(label="ரச்சுப் பொருத்தம்" if lang == "ta" else "Rajju", value=ok(m["rajju"]["match"])),
              KeyValue(label="தசா சந்தி" if lang == "ta" else "Dasa sandhi", value=ok(m["dasa_sandhi"]["match"]))]
    P = m["poruthams"]
    gm = m["girl"]["general"]
    return PdfRequest(feature_type="thirumana_porutham", god_image=god, language=lang, chart_style=style, theme=_theme(theme),
                      metadata=PdfMetadata(name=f'{girl.get("name") or "-"} - {boy.get("name") or "-"}', dob=_ddmmyyyy(girl["date_of_birth"]),
                                           tob=_tob(girl["time_of_birth"] if len(girl["time_of_birth"].split(":")) == 3 else girl["time_of_birth"] + ":00", lang),
                                           pob=girl.get("place") or "-", report_date=date.today().strftime("%d-%m-%Y")),
                      feature_data=PoruthamData(girl=person(m["girl"], "செல்வி", "Bride"), boy=person(m["boy"], "செல்வன்", "Groom"),
                                                rows=rows, total_points=P["total"], max_points=P["max"], percent=P["percent"],
                                                verdict=P["star_match_ta"] if lang == "ta" else ("Compatible" if P["percent"] >= 50 else "Not compatible"),
                                                extra_checks=extras).model_dump())


def baby_request(body: Dict[str, Any], lang: str, god: str, theme: Optional[Dict[str, Any]] = None) -> PdfRequest:
    from backend.app.services.kalai_baby_names import kalai_baby_names
    from backend.app.services import numerology as num
    r = kalai_baby_names(body["report_type"], body.get("sex", "boy"), date.fromisoformat(body["birth_date"]), body.get("star"),
                         body.get("first_letter"), body.get("numerology_no"), body.get("initials") or [], body.get("religion"), limit=3000)
    meanings = []
    for label_ta, label_en, n, table in (("பிறந்த தேதி எண்", "Birth number", r["date_number"], num._MOOLANK_PERSONALITY),
                                        ("கூட்டு (விதி) எண்", "Destiny number", r["destiny_number"], num._BHAGYANK_PATH)):
        planet = num._NUMBER_PLANET.get(n, {})
        meanings.append(NumberMeaning(number=n, title=f'{label_ta if lang == "ta" else label_en} · {planet.get(lang, "")}',
                                      text=table.get(n, {}).get(lang, "")))
    return PdfRequest(feature_type="baby_numerology", god_image=god, language=lang, theme=_theme(theme),
                      metadata=PdfMetadata(name=body.get("child_name") or ("குழந்தை பெயர் பரிந்துரை" if lang == "ta" else "Baby name suggestions"),
                                           dob=_ddmmyyyy(body["birth_date"]), tob="-", pob="-",
                                           report_date=date.today().strftime("%d-%m-%Y")),
                      feature_data=BabyData(
                          sex=("பெண்" if lang == "ta" else "Female") if r["sex"] in ("girl", "female", "f") else ("ஆண்" if lang == "ta" else "Male"),
                          birth_date=_ddmmyyyy(r["birth_date"]),
                          star=(STAR_TA[r["star"] - 1] if lang == "ta" else STAR_EN[r["star"] - 1]) if r.get("star") else None,
                          star_letters=r["star_letters"]["display"] if r.get("star_letters") else None,
                          date_number=r["date_number"], destiny_number=r["destiny_number"],
                          allowed_numbers=r["allowed_numbers"],
                          initials=" / ".join(initial_ta(i) if lang == "ta" else i for i in r["initials"]) or None,
                          number_meanings=meanings,
                          # Tamil column fully in Tamil: "C.M.சக்கரேஷ்" -> "ச.ம.சக்கரேஷ்" (initials by sound)
                          names=[NameRow(name_en=n["name_en"], name_ta=initials_prefix_ta(n["name_ta"]) if n.get("name_ta") else n.get("name_ta"),
                                         total=n["total"]) for n in r["names"]],
                          letter_values=r["letter_table"]).model_dump())



def kp_horary_request(body: Dict[str, Any], lang: str, god: str, style: str, theme: Optional[Dict[str, Any]] = None) -> PdfRequest:
    """KP horary (1-249 / 1-2193) as a designed PDF: same layout as the KP report,
    with the horary number and ascendant on the cover and in the details."""
    from backend.app.services.ephemeris import get_julian_day, kalai_ephemeris
    from backend.app.services.geocode import resolve_place
    from backend.app.services.kalai_kp import compute_kp_horary
    lat, lon, tz = resolve_place(body.get("place", ""), body.get("latitude"), body.get("longitude"), body.get("timezone"))
    tm = body["time"] if len(body["time"].split(":")) == 3 else body["time"] + ":00"
    jd = get_julian_day(body["date"], tm, tz)
    level = "subsub" if str(body.get("system", "249")) == "2193" else "sub"
    with kalai_ephemeris(jd):
        k = compute_kp_horary(int(body["number"]), jd, lat, lon, body["date"], tm, level=level)
    h = k["horary"]
    pl = lambda p: _pl(p, lang)
    basic = [KeyValue(label=_L(lang, "பிரசன்ன எண்", "Horary number"), value=f'{h["number"]} / {h["total_numbers"]}'),
             KeyValue(label=_L(lang, "லக்னம்", "Ascendant"), value=f'{h["sub_start_dms"]} ({pl(h["sign_lord"])} · {pl(h["star_lord"])} · {pl(h["sub_lord"])}{(" · " + pl(h["subsub_lord"])) if h.get("subsub_lord") else ""})'),
             KeyValue(label=_L(lang, "அட்சாம்சம் / தீர்க்காம்சம்", "Latitude / Longitude"), value=f"{lat:.4f} / {lon:.4f}"),
             KeyValue(label=_L(lang, "நேர மண்டலம்", "Time zone"), value=tz_ta(tz, tz_hours_of(tz, body["date"])) if lang == "ta" else tz)]
    kp_cells: Dict[str, List[str]] = {}
    for p in k["kp_chart"]["planets"]:
        kp_cells.setdefault(str(p["sign"]), []).append(p["planet"])
    bal = k.get("dasa_balance", {})
    return PdfRequest(feature_type="kp_jathagam", god_image=god, language=lang, chart_style=style, theme=_theme(theme),
                      metadata=PdfMetadata(name=body.get("name") or "-", dob=_ddmmyyyy(body["date"]),
                                           tob=_tob(tm, lang), pob=body.get("place") or "-", report_title_ta="கே.பி பிரசன்ன ஜாதகம்",
                                           report_title_en="KP Horary", report_date=date.today().strftime("%d-%m-%Y")),
                      feature_data=KpData(
                          basic_details=basic,
                          ayanamsa=(ayanamsa_ta if lang == "ta" else str)(f'{k["ayanamsa_dms"]} ({k["ayanamsa_name"]})'),
                          charts=[ChartGrid(title=_L(lang, "பிரசன்ன ராசி", "Horary Rasi"), cells=_cells(kp_cells, lang), lagna_sign=_lagna(kp_cells))],
                          planets=[KpRow(name=pl(p["planet"]), dms=p["dms"], sign_lord=pl(p["sign"]), star_lord=pl(p["star"]),
                                         sub_lord=pl(p["sub"]), subsub_lord=pl(p["subsub"])) for p in k["planets"]],
                          cusps=[KpRow(name=c["roman"], dms=c["dms"], sign_lord=pl(c["sign"]), star_lord=pl(c["star"]),
                                       sub_lord=pl(c["sub"]), subsub_lord=pl(c["subsub"])) for c in k["cusps"]],
                          significators=[KpSignificator(planet=pl(s["planet"]), by_star=", ".join(map(str, s["by_star"])),
                                                        by_sub=", ".join(map(str, s["by_sub"])),
                                                        aspected_by=", ".join(pl(x) for x in s["aspected_by"]) or "-") for s in k["planet_significators"]],
                          dasa_balance=bal.get("formatted_ta") if lang == "ta" else bal.get("formatted_en"),
                          dashas=_dashas(k["dashas"], lang)).model_dump())
