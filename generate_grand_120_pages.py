"""
Complete 120-Page Vedic Jathagam Grand Volume (20 Topics) PDF Generator
Strictly adheres to AGENTS.md §1 (Zero Hallucinations, Swiss Ephemeris & Classical Surya Siddhanta).
Generates an exhaustive 120-page traditional A4 manuscript book in Red & Blue inks on antique parchment.
"""

import os
import sys
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import fitz  # PyMuPDF
from playwright.sync_api import sync_playwright

# Force utf-8 in Windows shell
sys.stdout.reconfigure(encoding='utf-8')

from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions, format_dms
from backend.app.services.chart_builder import build_rasi_and_navamsa_kattams, compute_drekkana_chart, compute_hora_chart, calculate_bhava_predictions
from backend.app.services.dasha_builder import calculate_vimshottari_dasha, calculate_dasha_balance, DASHA_LORDS
from backend.app.services.yoga_dosha import detect_yogas, detect_doshas
from backend.app.services.ashtakavarga import calculate_ashtakavarga
from backend.app.services.shadbala import calculate_shadbala
from backend.app.services.ayurdaya import calculate_ayurdaya
from backend.app.services.sampoorana import calculate_sampoorana_details
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

GRAHA_VENBAS = {
    "Sun": ("சூரியன் வெண்பா", "செங்கதிர்த் தேவன் சிறந்திடு மாண்பினன் | எங்கணும் ஒளிவீசி எழிலுறச் செய்பவன் | பொங்கு புகழ்நல்கும் பூதலத்தே என்றும் | அங்கணன் சூரியன் பாதம் பணிவாமே."),
    "Moon": ("சந்திரன் வெண்பா", "முத்துச் சுடரோன் முழுமதி நாயகன் | நித்தமும் உள்ளத்து நேசம் தருபவன் | பத்தினி பார்வதி தேவியின் அன்பினால் | சித்த மலர்விக்கும் திங்களை வாழி."),
    "Mars": ("செவ்வாய் வெண்பா", "செவ்வான வண்ணன் செழுஞ்சுடர் வேலோன் | தைரியம் வீரமும் தனமும் அளிப்பவன் | பையவே போற்றும் பரமனின் மைந்தனாம் | செய்யவன் பாதத்தை சேவிப்போம் நாமே."),
    "Mercury": ("புதன் வெண்பா", "பச்சை நிறத்தோன் பாவலர் காவலன் | விச்சை பலதரும் வித்தக நாயகன் | அச்சம் தவிர்த்து அறிவினை ஊட்டுவான் | நித்தம் புதனைப் பணிந்து நலம் பெறுவோம்."),
    "Jupiter": ("குரு வெண்பா", "மறைநூல் புகலும் மாமுனி தேசிகன் | குறைவில்லாச் செல்வம் கொழித்திடச் செய்பவன் | நறையணி வேந்தன் நற்புகழ் ஈந்திடும் | இறையவன் பொற்பாதம் ஏத்திடு வோமே."),
    "Venus": ("சுக்கிரன் வெண்பா", "வெள்ளி ஒளிரும் விண்மீன் நாயகன் | சுள்ளென இன்பம் சுகமுடன் ஈபவன் | தெள்ளிய நூற்கலை தேறிடச் செய்திடும் | வள்ளல் சுக்கிரன் வாழிய வாழி."),
    "Saturn": ("சனி வெண்பா", "சங்கடம் தீர்க்கும் சனீஸ்வர நாயகன் | மங்கல வாழ்வை மனிதர்க்கு ஈபவன் | தங்கு பெரும்புகழ் சன்மார்க்கம் தந்திடும் | எங்கள் சனீஸ்வரன் பாதம் பணிவாமே."),
    "Rahu": ("ராகு வெண்பா", "கரிய நிறத்தோன் கரும்பாம்பின் மேனியன் | பெரிய பதவியும் பேரருள் செய்பவன் | வரியணி நாகத்து மன்னனாம் ராகுவை | தினமும் தொழுதால் தீரும் வினையே."),
    "Ketu": ("கேது வெண்பா", "செம்பாம்பின் மேனியன் ஞானப் பெருங்கடல் | இன்ப முக்திக்கும் ஈடில்லா நாயகன் | வம்பினை நீக்கி வளங்களை ஈந்திடும் | நம்பும் கேதுவின் நற்பாதம் போற்றி.")
}

TEMPLE_WORSHIP = {
    "Sun": ("சூரியனார் கோவில் (தஞ்சாவூர்)", "கோதுமை", "செந்தாமரை", "மாணிக்கம்", "செந்நிறம்"),
    "Moon": ("திங்களூர் கைலாசநாதர் (தஞ்சாவூர்)", "நெல் (பச்சரிசி)", "வெண்தாமரை", "முத்து", "வெண்மை"),
    "Mars": ("வைத்தீஸ்வரன் கோவில் (மயிலாடுதுறை)", "துவரை", "செவ்வரளி", "பவளம்", "சிவப்பு"),
    "Mercury": ("திருவெண்காடு சுவேதாரண்யேஸ்வரர்", "பச்சைப்பயறு", "வெண்காந்தள்", "மரகதம்", "பச்சை"),
    "Jupiter": ("ஆலங்குடி ஆபத்சகாயேஸ்வரர்", "கொண்டைக்கடலை", "முல்லை", "புஷ்பராகம்", "மஞ்சள்"),
    "Venus": ("கஞ்சனூர் அக்னீஸ்வரர்", "மொச்சை", "வெண்தாமரை", "வைரம்", "வெண்மை"),
    "Saturn": ("திருநள்ளாறு தர்பாரண்யேஸ்வரர்", "எள்", "கருங்குவளை", "நீலமணி", "கருப்பு / நீலம்"),
    "Rahu": ("திருநாகேஸ்வரம் நாகநாதசுவாமி", "உளுந்து", "மந்தாரை", "கோமேதகம்", "கருநீலம்"),
    "Ketu": ("கீழப்பெரும்பள்ளம் நாகநாதர்", "கொள்ளு", "செவ்வல்லி", "வைடூரியம்", "பல்வண்ணம்")
}

def format_rasi_dms(deg_in_sign: float) -> str:
    deg_val = deg_in_sign % 30.0
    d = int(deg_val)
    m_float = (deg_val - d) * 60.0
    m = int(m_float)
    s = int(round((m_float - m) * 60.0))
    if s >= 60: s = 0; m += 1
    if m >= 60: m = 0; d += 1
    return f"{d:02d}° {m:02d}′ {s:02d}″"

def format_total_dms(deg_total: float) -> str:
    deg_val = deg_total % 360.0
    d = int(deg_val)
    m_float = (deg_val - d) * 60.0
    m = int(m_float)
    s = int(round((m_float - m) * 60.0))
    if s >= 60: s = 0; m += 1
    if m >= 60: m = 0; d += 1
    return f"{d:03d}° {m:02d}′ {s:02d}″"

def render_kattam_grid_html(kattam_dict: Dict[int, List[Dict[str, Any]]], title: str, center_sub: str = "", compact: bool = False) -> str:
    sign_names = {
        1: "மேஷம்", 2: "ரிஷபம்", 3: "மிதுனம்", 4: "கடகம்",
        5: "சிம்மம்", 6: "கன்னி", 7: "துலாம்", 8: "விருச்சிகம்",
        9: "தனுசு", 10: "மகரம்", 11: "கும்பம்", 12: "மீனம்"
    }
    
    row_height = "42px" if compact else "54px"
    font_scale = "9px" if compact else "10.5px"

    def cell_content(s_num: int) -> str:
        s_name = sign_names[s_num]
        occupants = kattam_dict.get(s_num, [])
        occ_html = ""
        for occ in occupants:
            sym = occ.get("symbol", occ.get("name_ta", ""))
            deg_txt = ""
            if "degree" in occ:
                d_int = int(occ["degree"] % 30)
                deg_txt = f"<span class='deg-sub'>{d_int}°</span>"
            ret_txt = "<span class='ret-sub'>(வ)</span>" if occ.get("is_retrograde") else ""
            if occ.get("is_lagna"):
                occ_html += f"<div class='occ-tag lagna-tag' style='font-size:{font_scale};'>{sym}{deg_txt}</div>"
            else:
                occ_html += f"<div class='occ-tag' style='font-size:{font_scale};'>{sym}{deg_txt}{ret_txt}</div>"
        
        return f"""
        <div class='kattam-cell cell-{s_num}'>
            <div class='sign-lbl' style='font-size:{font_scale};'>{s_name}</div>
            <div class='occ-container'>{occ_html}</div>
        </div>
        """

    return f"""
    <div class='kattam-wrapper'>
        <div class='kattam-grid' style='grid-template-rows: repeat(4, {row_height});'>
            {cell_content(12)}{cell_content(1)}{cell_content(2)}{cell_content(3)}
            {cell_content(11)}
            <div class='kattam-center'>
                <div class='kattam-title' style='font-size:{'11px' if compact else '13px'};'>{title}</div>
                {f"<div class='kattam-sub' style='font-size:{'8.5px' if compact else '9.5px'};'>{center_sub}</div>" if center_sub else ""}
            </div>
            {cell_content(4)}
            {cell_content(10)}{cell_content(5)}
            {cell_content(9)}{cell_content(8)}{cell_content(7)}{cell_content(6)}
        </div>
    </div>
    """

def generate_common_styles() -> str:
    return """
    @import url('https://fonts.googleapis.com/css2?family=Kavivanar&display=swap');
    
    @page {
        size: A4 portrait;
        margin: 0;
    }
    
    * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    body {
        margin: 0;
        padding: 0;
        background: #e9e4d4;
        font-family: 'Kavivanar', cursive, sans-serif;
        color: #1e3a8a; /* Royal Blue Ink */
    }
    
    .manuscript-page {
        width: 210mm;
        height: 297mm;
        min-height: 297mm;
        max-height: 297mm;
        page-break-after: always;
        break-after: page;
        position: relative;
        overflow: hidden;
        background: #fdfbf6;
        padding: 10mm 12mm 8mm 12mm;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin: 0 auto;
    }
    
    .page-border {
        position: absolute;
        top: 5mm;
        left: 5mm;
        right: 5mm;
        bottom: 5mm;
        border: 2.5px solid #9b2c1c; /* Red Ink Frame */
        pointer-events: none;
        outline: 1px dashed #c97a6e;
        outline-offset: -4px;
        z-index: 10;
    }
    
    .corner-ornament {
        position: absolute;
        width: 12px;
        height: 12px;
        border: 2px solid #9b2c1c;
        background: #fdfbf6;
        z-index: 11;
    }
    .corner-tl { top: 4.5mm; left: 4.5mm; border-bottom: none; border-right: none; }
    .corner-tr { top: 4.5mm; right: 4.5mm; border-bottom: none; border-left: none; }
    .corner-bl { bottom: 4.5mm; left: 4.5mm; border-top: none; border-right: none; }
    .corner-br { bottom: 4.5mm; right: 4.5mm; border-top: none; border-left: none; }
    
    .ink-red { color: #9b2c1c !important; }
    .ink-blue { color: #1e3a8a !important; }
    .ink-gold { color: #b45309 !important; }
    
    .header-masthead {
        text-align: center;
        margin-bottom: 5px;
        border-bottom: 1.5px solid #9b2c1c;
        padding-bottom: 3px;
    }
    .masthead-title {
        font-size: 15px;
        font-weight: 700;
        color: #9b2c1c;
        line-height: 1.15;
    }
    .masthead-sloka {
        font-size: 9.5px;
        color: #9b2c1c;
        font-style: italic;
        margin-top: 1px;
    }
    .chapter-badge {
        display: inline-block;
        background: #9b2c1c;
        color: #fdfbf6;
        padding: 1.5px 8px;
        border-radius: 10px;
        font-size: 9.5px;
        font-weight: bold;
        margin-top: 2px;
    }
    
    .section-banner {
        background: #f7eedb;
        border-left: 4px solid #9b2c1c;
        border-right: 1px solid #c97a6e;
        border-top: 1px solid #c97a6e;
        border-bottom: 1px solid #c97a6e;
        padding: 2.5px 6px;
        font-size: 11px;
        font-weight: 700;
        color: #9b2c1c;
        margin: 4px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .manuscript-table {
        width: 100%;
        border-collapse: collapse;
        margin: 4px 0;
        font-size: 9px;
        background: #fffdfa;
    }
    .manuscript-table th {
        background: #f2e3c6;
        color: #9b2c1c;
        font-weight: bold;
        border: 1px solid #9b2c1c;
        padding: 3px 4px;
        text-align: center;
    }
    .manuscript-table td {
        border: 1px solid #c97a6e;
        padding: 2.5px 4px;
        color: #1e3a8a;
        text-align: center;
    }
    .manuscript-table tr:nth-child(even) td {
        background: #faf6eb;
    }
    
    .kattam-wrapper {
        margin: 3px auto;
        width: 100%;
        max-width: 320px;
    }
    .kattam-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border: 2px solid #9b2c1c;
        background: #fffdfa;
    }
    .kattam-cell {
        border: 1px solid #9b2c1c;
        padding: 2px;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
    .sign-lbl {
        font-size: 8px;
        color: #8c7355;
        font-weight: bold;
        text-align: right;
    }
    .occ-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-top: 1px;
    }
    .occ-tag {
        color: #1e3a8a;
        font-weight: bold;
        line-height: 1.1;
    }
    .lagna-tag {
        color: #9b2c1c !important;
    }
    .deg-sub {
        font-size: 7.5px;
        color: #555;
        margin-left: 1px;
    }
    .ret-sub {
        font-size: 7.5px;
        color: #c2410c;
        font-weight: bold;
    }
    .kattam-center {
        grid-column: 2 / 4;
        grid-row: 2 / 4;
        border: 1.5px solid #9b2c1c;
        background: #fbf8ee;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4px;
        text-align: center;
    }
    .kattam-title {
        color: #9b2c1c;
        font-weight: bold;
    }
    .kattam-sub {
        color: #1e3a8a;
        margin-top: 2px;
    }
    
    .panel-card {
        background: #fffdfa;
        border: 1px solid #c97a6e;
        border-radius: 4px;
        padding: 5px 8px;
        margin: 4px 0;
    }
    
    .shastric-verse {
        background: #fbf6ec;
        border-left: 3px solid #9b2c1c;
        padding: 4px 8px;
        font-size: 9px;
        font-style: italic;
        color: #6b4712;
        margin: 3px 0;
        line-height: 1.35;
    }
    
    .page-footer {
        position: absolute;
        bottom: 6mm;
        left: 10mm;
        right: 10mm;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #c97a6e;
        padding-top: 2px;
        font-size: 8px;
        color: #7c6853;
    }
    """

def build_page_wrapper(page_num: int, total_pages: int, chap_num: int, chap_title: str, sub_title: str, content: str, name: str, dob: str, sys_name: str) -> str:
    return f"""
    <div class="manuscript-page" id="page_{page_num}">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">|| ௐ ஸ்ரீ கணபதயே நமஹ || &nbsp; • &nbsp; || ஸ்ரீ ராமஜெயம் ||</div>
            <div class="masthead-sloka">ஜெனனீ ஜென்ம சௌக்கியானாம் வர்தனீ குல சம்பதாம் | பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா ||</div>
            <div class="chapter-badge">அத்தியாயம் {chap_num} / Topic {chap_num}: {chap_title}</div>
        </div>
        
        <div class="section-banner">
            <span>{sub_title}</span>
            <span>{sys_name} • பக்கம் {page_num} / {total_pages}</span>
        </div>
        
        {content}
        
        <div class="page-footer">
            <span>ஜாதகர்: {name} | பிறந்த தேதி: {dob}</span>
            <span>{sys_name} சம்பூர்ண ஜாதக மகா காண்டம் (120 பக்க நூல்)</span>
            <span>பக்கம் {page_num}</span>
        </div>
    </div>
    """

def compute_native_complete_data(
    name: str,
    gender: str,
    dob: str,
    tob: str,
    place: str,
    lat: float,
    lon: float,
    tz: str,
    panchangam_system: str,
    father_name: str = "பெருமாள்",
    mother_name: str = "பாப்புஅம்மாள்",
    gothram: str = "சிவ கோத்திரம்",
    kula_deivam: str = "ஸ்ரீ குலதெய்வம்",
    native_place: str = "வெண்ணந்தூர் (Salem)"
) -> Dict[str, Any]:
    jd = get_julian_day(dob, tob, tz)
    eph = compute_planetary_positions(jd, lat, lon, panchangam_system, dob, tob, tz)
    basic = eph['basic_details']
    lagna = eph['lagna_info']
    planets = eph['planets']
    pos = eph['positions_by_name']
    
    samp = calculate_sampoorana_details(jd, lat, lon, dob, tob, basic, planets, pos)
    rasi_k, nav_k = build_rasi_and_navamsa_kattams(planets, lagna)
    drek_k = compute_drekkana_chart(planets, lagna)
    hora_k = compute_hora_chart(planets, lagna)
    dashas = calculate_vimshottari_dasha(pos['Moon']['total_degree'], dob, tob)
    dasha_bal = calculate_dasha_balance(pos['Moon']['total_degree'])
    ashtaka = calculate_ashtakavarga(lagna['rasi_number'], pos)
    yogas = detect_yogas(lagna['rasi_number'], pos)
    doshas = detect_doshas(lagna['rasi_number'], pos)
    bhavas = calculate_bhava_predictions(lagna['rasi_number'], planets)
    
    birth_hour = float(tob.split(':')[0]) + float(tob.split(':')[1]) / 60.0
    day_num = int(math.floor(jd + 1.5)) % 7
    shadbala = calculate_shadbala(pos, lagna['rasi_number'], 6.0 <= birth_hour <= 18.0, True, 'Jupiter', birth_hour, day_num)
    ayur = calculate_ayurdaya(lagna['rasi_number'], pos, ashtaka['sarvashtakavarga'])
    
    # Bhava Chalit Kattam
    chalit_k: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(1, 13)}
    chalit_k[lagna['rasi_number']].append({"name": "Lagna", "name_ta": "லக்னம்", "symbol": "லக்", "degree": lagna['degree'], "is_lagna": True})
    for p in planets:
        if p['name'] == 'Lagna': continue
        h_num = int(((p['total_degree'] - lagna['total_degree'] + 15.0) % 360.0) // 30.0) + 1
        s_num = ((lagna['rasi_number'] - 1 + (h_num - 1)) % 12) + 1
        chalit_k[s_num].append({"name": p['name'], "name_ta": p['name_ta'], "symbol": p['symbol'], "degree": p['degree'], "is_lagna": False, "is_retrograde": p.get('is_retrograde', False)})

    # Upagrahas
    sun_deg = pos['Sun']['total_degree']
    dhuma_deg = (sun_deg + 133.3333) % 360.0
    vyatipata_deg = (360.0 - dhuma_deg) % 360.0
    parivesha_deg = (vyatipata_deg + 180.0) % 360.0
    indrachapa_deg = (360.0 - parivesha_deg) % 360.0
    upaketu_deg = (indrachapa_deg + 16.6667) % 360.0
    upagrahas = [
        {"name_ta": "தூமன்", "total_dms": format_total_dms(dhuma_deg), "rasi_dms": format_rasi_dms(dhuma_deg % 30), "rasi_num": int(dhuma_deg // 30) + 1},
        {"name_ta": "வியதீபாதன்", "total_dms": format_total_dms(vyatipata_deg), "rasi_dms": format_rasi_dms(vyatipata_deg % 30), "rasi_num": int(vyatipata_deg // 30) + 1},
        {"name_ta": "பரிவேடன்", "total_dms": format_total_dms(parivesha_deg), "rasi_dms": format_rasi_dms(parivesha_deg % 30), "rasi_num": int(parivesha_deg // 30) + 1},
        {"name_ta": "இந்திரதனுசு", "total_dms": format_total_dms(indrachapa_deg), "rasi_dms": format_rasi_dms(indrachapa_deg % 30), "rasi_num": int(indrachapa_deg // 30) + 1},
        {"name_ta": "உபகேது", "total_dms": format_total_dms(upaketu_deg), "rasi_dms": format_rasi_dms(upaketu_deg % 30), "rasi_num": int(upaketu_deg // 30) + 1},
    ]

    return {
        "name": name,
        "gender": gender,
        "dob": dob,
        "tob": tob,
        "place": place,
        "lat": lat,
        "lon": lon,
        "tz": tz,
        "panchangam_system": panchangam_system,
        "father_name": father_name,
        "mother_name": mother_name,
        "gothram": gothram,
        "kula_deivam": kula_deivam,
        "native_place": native_place,
        "basic": basic,
        "lagna": lagna,
        "planets": planets,
        "positions": pos,
        "sampoorana": samp,
        "rasi_kattam": rasi_k,
        "navamsa_kattam": nav_k,
        "drekkana_kattam": drek_k,
        "hora_kattam": hora_k,
        "chalit_kattam": chalit_k,
        "dashas": dashas,
        "dasha_bal": dasha_bal,
        "ashtaka": ashtaka,
        "yogas": yogas,
        "doshas": doshas,
        "bhavas": bhavas,
        "shadbala": shadbala,
        "ayur": ayur,
        "upagrahas": upagrahas
    }
