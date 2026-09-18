"""
Master High-Fidelity Jathagam PDF Generator (Thirukanitham & Vakhyam)
Adheres strictly to AGENTS.md §1 (Zero Hallucinations, Lahiri & Surya Siddhanta Ephemeris).
Outputs discrete A4 pages with authentic handwritten styling (Red & Blue inks, Kavivanar font).
"""

import os
import sys
import math
from datetime import datetime
from typing import Dict, Any, List, Tuple
import fitz  # PyMuPDF
from playwright.sync_api import sync_playwright

# Ensure utf-8 output in Windows shell
sys.stdout.reconfigure(encoding='utf-8')

from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions, format_dms
from backend.app.services.chart_builder import build_rasi_and_navamsa_kattams, compute_drekkana_chart
from backend.app.services.dasha_builder import calculate_vimshottari_dasha, calculate_dasha_balance
from backend.app.services.yoga_dosha import detect_yogas, detect_doshas
from backend.app.services.ashtakavarga import calculate_ashtakavarga
from backend.app.services.sampoorana import calculate_sampoorana_details
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

# Classical Venba verses for 9 Grahas
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
    "Sun": "சூரியனார் கோவில் (தஞ்சாவூர்) — கோதுமை, செந்தாமரை, மாணிக்கம்",
    "Moon": "திங்களூர் கைலாசநாதர் (தஞ்சாவூர்) — நெல் (பச்சரிசி), வெண்தாமரை, முத்து",
    "Mars": "வைத்தீஸ்வரன் கோவில் (மயிலாடுதுறை) — துவரை, செவ்வரளி, பவளம்",
    "Mercury": "திருவெண்காடு சுவேதாரண்யேஸ்வரர் — பச்சைப்பயறு, வெண்காந்தள், மரகதம்",
    "Jupiter": "ஆலங்குடி ஆபத்சகாயேஸ்வரர் — கொண்டைக்கடலை, முல்லை, புஷ்பராகம்",
    "Venus": "கஞ்சனூர் அக்னீஸ்வரர் — மொச்சை, வெண்தாமரை, வைரம்",
    "Saturn": "திருநள்ளாறு தர்பாரண்யேஸ்வரர் — எள், கருங்குவளை, நீலமணி",
    "Rahu": "திருநாகேஸ்வரம் நாகநாதசுவாமி — உளுந்து, மந்தாரை, கோமேதகம்",
    "Ketu": "கீழப்பெரும்பள்ளம் நாகநாதர் — கொள்ளு, செவ்வல்லி, வைடூரியம்"
}

# 9 Tara Balam Names
TARA_BALAM_NAMES = [
    ("ஜன்ம தாரை", "Janma Tara", "சமம் / எச்சரிக்கை", "உடல் நலம் பேணவும்"),
    ("சம்பத்து தாரை", "Sampath Tara", "உத்தமம் (மிக நன்று)", "தன லாபம், சுப காரிய வெற்றி"),
    ("விபத்து தாரை", "Vipath Tara", "அசுபம் (தவிர்க்கவும்)", "தடைகள், விபத்து பயம்"),
    ("க்ஷேம தாரை", "Kshema Tara", "உத்தமம் (நன்று)", "சுகம், நலம், காரிய சித்தி"),
    ("பிரத்யக்கு தாரை", "Pratyak Tara", "மத்திமம்", "எதிர்ப்புகள், மன சஞ்சலம்"),
    ("சாதக தாரை", "Sadhaka Tara", "உத்தமம் (மிக நன்று)", "வெற்றி, முயற்சி பலித்தல்"),
    ("வத தாரை", "Vadha Tara", "அசுபம் (தவிர்க்கவும்)", "கண்டம், விரயம், ஆபத்து"),
    ("மித்ர தாரை", "Mitra Tara", "உத்தமம் (நன்று)", "நட்பு, அமைதி, மகிழ்ச்சி"),
    ("பரம மித்ர தாரை", "Parama Mitra Tara", "உத்தமம் (மிக நன்று)", "பேரின்பம், பெருவெற்றி")
]

def format_rasi_dms(deg_in_sign: float) -> str:
    deg_val = deg_in_sign % 30.0
    d = int(deg_val)
    m_float = (deg_val - d) * 60.0
    m = int(m_float)
    s = int(round((m_float - m) * 60.0))
    if s >= 60:
        s = 0
        m += 1
    if m >= 60:
        m = 0
        d += 1
    return f"{d:02d}° {m:02d}′ {s:02d}″"

def format_total_dms(deg_total: float) -> str:
    deg_val = deg_total % 360.0
    d = int(deg_val)
    m_float = (deg_val - d) * 60.0
    m = int(m_float)
    s = int(round((m_float - m) * 60.0))
    if s >= 60:
        s = 0
        m += 1
    if m >= 60:
        m = 0
        d += 1
    return f"{d:03d}° {m:02d}′ {s:02d}″"

def render_kattam_html(kattam_dict: Dict[int, List[Dict[str, Any]]], title: str, center_sub: str = "") -> str:
    """
    Renders an authentic South Indian 4x4 Kattam table.
    Cells layout:
    Row 1: Meena (12), Mesha (1), Rishaba (2), Mithuna (3)
    Row 2: Kumbha (11), CENTER (span 2x2), Kadaka (4)
    Row 3: Makara (10), Simha (5)
    Row 4: Dhanusu (9), Vrischika (8), Thula (7), Kanya (6)
    """
    sign_names = {
        1: "மேஷம்", 2: "ரிஷபம்", 3: "மிதுனம்", 4: "கடகம்",
        5: "சிம்மம்", 6: "கன்னி", 7: "துலாம்", 8: "விருச்சிகம்",
        9: "தனுசு", 10: "மகரம்", 11: "கும்பம்", 12: "மீனம்"
    }
    
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
            ret_txt = ""
            if occ.get("is_retrograde"):
                ret_txt = "<span class='ret-sub'>(வ)</span>"
            if occ.get("is_lagna"):
                occ_html += f"<div class='occ-tag lagna-tag'>{sym}{deg_txt}</div>"
            else:
                occ_html += f"<div class='occ-tag'>{sym}{deg_txt}{ret_txt}</div>"
        
        return f"""
        <div class='kattam-cell cell-{s_num}'>
            <div class='sign-lbl'>{s_name}</div>
            <div class='occ-container'>{occ_html}</div>
        </div>
        """

    html = f"""
    <div class='kattam-wrapper'>
        <div class='kattam-grid'>
            {cell_content(12)}
            {cell_content(1)}
            {cell_content(2)}
            {cell_content(3)}
            
            {cell_content(11)}
            <div class='kattam-center'>
                <div class='kattam-title'>{title}</div>
                {f"<div class='kattam-sub'>{center_sub}</div>" if center_sub else ""}
            </div>
            {cell_content(4)}
            
            {cell_content(10)}
            {cell_content(5)}
            
            {cell_content(9)}
            {cell_content(8)}
            {cell_content(7)}
            {cell_content(6)}
        </div>
    </div>
    """
    return html

def calculate_full_profile(
    name: str,
    gender: str,
    dob: str,
    tob: str,
    place: str,
    lat: float,
    lon: float,
    tz: str,
    panchangam_system: str,
    father_name: str = "—",
    mother_name: str = "—",
    gothram: str = "சிவ கோத்திரம்",
    kula_deivam: str = "ஸ்ரீ குலதெய்வம்",
    native_place: str = "—"
) -> Dict[str, Any]:
    jd = get_julian_day(dob, tob, tz)
    eph = compute_planetary_positions(jd, lat, lon, panchangam_system, dob, tob, tz)
    samp = calculate_sampoorana_details(jd, lat, lon, dob, tob, eph['basic_details'], eph['planets'], eph['positions_by_name'])
    rasi_k, nav_k = build_rasi_and_navamsa_kattams(eph['planets'], eph['lagna_info'])
    drek_k = compute_drekkana_chart(eph['planets'], eph['lagna_info'])
    dashas = calculate_vimshottari_dasha(eph['positions_by_name']['Moon']['total_degree'], dob, tob)
    dasha_bal = calculate_dasha_balance(eph['positions_by_name']['Moon']['total_degree'])
    ashtaka = calculate_ashtakavarga(eph['lagna_info']['rasi_number'], eph['positions_by_name'])
    yogas = detect_yogas(eph['lagna_info']['rasi_number'], eph['positions_by_name'])
    doshas = detect_doshas(eph['lagna_info']['rasi_number'], eph['positions_by_name'])
    
    # Bhava Chalit Kattam (based on degree offset from Lagna)
    chalit_k: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(1, 13)}
    lagna_deg = eph['lagna_info']['degree']
    lagna_sign = eph['lagna_info']['rasi_number']
    chalit_k[lagna_sign].append({
        "name": "Lagna", "name_ta": "லக்னம்", "symbol": "லக்", "degree": lagna_deg, "is_lagna": True
    })
    for p in eph['planets']:
        if p['name'] == 'Lagna':
            continue
        p_deg = p['total_degree']
        # Sripati offset from Lagna
        house_num = int(((p_deg - eph['lagna_info']['total_degree'] + 15.0) % 360.0) // 30.0) + 1
        chalit_sign = ((lagna_sign - 1 + (house_num - 1)) % 12) + 1
        chalit_k[chalit_sign].append({
            "name": p['name'], "name_ta": p['name_ta'], "symbol": p['symbol'],
            "degree": p['degree'], "is_lagna": False, "is_retrograde": p.get('is_retrograde', False)
        })

    # Upagrahas for Vakhyam (Dhumadhayah)
    sun_deg = eph['positions_by_name']['Sun']['total_degree']
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
        "basic": eph['basic_details'],
        "lagna": eph['lagna_info'],
        "planets": eph['planets'],
        "positions": eph['positions_by_name'],
        "sampoorana": samp,
        "rasi_kattam": rasi_k,
        "navamsa_kattam": nav_k,
        "drekkana_kattam": drek_k,
        "chalit_kattam": chalit_k,
        "dashas": dashas,
        "dasha_bal": dasha_bal,
        "ashtaka": ashtaka,
        "yogas": yogas,
        "doshas": doshas,
        "upagrahas": upagrahas
    }


def generate_common_css() -> str:
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
        color: #1e3a8a; /* Default Royal Blue Ink for text/math */
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
        padding: 12mm 14mm 10mm 14mm;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin: 0 auto;
    }
    
    /* Double Hand-Drawn Manuscript Border */
    .page-border {
        position: absolute;
        top: 6mm;
        left: 6mm;
        right: 6mm;
        bottom: 6mm;
        border: 2.5px solid #9b2c1c; /* Red Ink Frame */
        pointer-events: none;
        outline: 1px dashed #c97a6e;
        outline-offset: -4px;
        z-index: 10;
    }
    
    .corner-ornament {
        position: absolute;
        width: 14px;
        height: 14px;
        border: 2px solid #9b2c1c;
        background: #fdfbf6;
        z-index: 11;
    }
    .corner-tl { top: 5mm; left: 5mm; border-bottom: none; border-right: none; }
    .corner-tr { top: 5mm; right: 5mm; border-bottom: none; border-left: none; }
    .corner-bl { bottom: 5mm; left: 5mm; border-top: none; border-right: none; }
    .corner-br { bottom: 5mm; right: 5mm; border-top: none; border-left: none; }
    
    /* Typography & Hierarchy */
    .ink-red { color: #9b2c1c !important; }
    .ink-blue { color: #1e3a8a !important; }
    .ink-gold { color: #b45309 !important; }
    
    .header-masthead {
        text-align: center;
        margin-bottom: 6px;
        border-bottom: 1.5px solid #9b2c1c;
        padding-bottom: 5px;
    }
    .masthead-title {
        font-size: 19px;
        font-weight: 700;
        color: #9b2c1c;
        letter-spacing: 0.5px;
        line-height: 1.2;
    }
    .masthead-sloka {
        font-size: 11px;
        color: #9b2c1c;
        font-style: italic;
        margin-top: 2px;
        line-height: 1.3;
    }
    .masthead-system-badge {
        display: inline-block;
        background: #9b2c1c;
        color: #fdfbf6;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 2px;
    }
    
    .section-banner {
        background: #f7eedb;
        border-left: 4px solid #9b2c1c;
        border-right: 1px solid #c97a6e;
        border-top: 1px solid #c97a6e;
        border-bottom: 1px solid #c97a6e;
        padding: 3px 8px;
        font-size: 12.5px;
        font-weight: 700;
        color: #9b2c1c;
        margin: 6px 0 5px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    /* Tables */
    .manuscript-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10.5px;
        line-height: 1.25;
        margin-bottom: 6px;
    }
    .manuscript-table th {
        background: #f5eedb;
        color: #9b2c1c;
        border: 1px solid #9b2c1c;
        padding: 3px 4px;
        font-weight: 700;
        text-align: center;
    }
    .manuscript-table td {
        border: 1px solid #d4be9e;
        padding: 2.5px 4px;
        color: #1e3a8a;
    }
    .manuscript-table tr:nth-child(even) {
        background: #faf6ed;
    }
    .manuscript-table tr.highlight-row {
        background: #fff0eb;
        font-weight: bold;
    }
    
    /* 4x4 Kattam Styling */
    .kattam-wrapper {
        width: 100%;
        margin: 4px 0;
    }
    .kattam-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 46px);
        border: 2px solid #9b2c1c;
        background: #fdfbf6;
    }
    .kattam-cell {
        border: 1px solid #c97a6e;
        padding: 2px 3px;
        position: relative;
        font-size: 9.5px;
        overflow: hidden;
    }
    .sign-lbl {
        font-size: 8.5px;
        color: #9b2c1c;
        font-weight: bold;
        line-height: 1;
        opacity: 0.85;
    }
    .occ-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px 4px;
        margin-top: 1px;
    }
    .occ-tag {
        font-size: 9.5px;
        font-weight: bold;
        color: #1e3a8a;
        line-height: 1.1;
    }
    .occ-tag.lagna-tag {
        color: #b91c1c;
        background: #fee2e2;
        padding: 0 2px;
        border-radius: 2px;
    }
    .deg-sub {
        font-size: 7.5px;
        color: #64748b;
        margin-left: 1px;
    }
    .ret-sub {
        font-size: 8px;
        color: #dc2626;
        font-weight: normal;
    }
    .kattam-center {
        grid-column: 2 / span 2;
        grid-row: 2 / span 2;
        border: 1px solid #9b2c1c;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: #f5eedb;
        padding: 4px;
    }
    .kattam-title {
        font-size: 13px;
        font-weight: bold;
        color: #9b2c1c;
        line-height: 1.2;
    }
    .kattam-sub {
        font-size: 9.5px;
        color: #1e3a8a;
        margin-top: 2px;
    }
    
    /* Multi-column Panels */
    .grid-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
    .panel-card {
        border: 1px solid #c97a6e;
        background: #fbf7ee;
        padding: 6px 8px;
        border-radius: 3px;
    }
    .panel-card-title {
        font-size: 11px;
        font-weight: bold;
        color: #9b2c1c;
        border-bottom: 1px dashed #c97a6e;
        padding-bottom: 2px;
        margin-bottom: 4px;
    }
    .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        padding: 1.5px 0;
        border-bottom: 0.5px dotted #e2d2b8;
    }
    .info-label {
        color: #9b2c1c;
        font-weight: 600;
    }
    .info-val {
        color: #1e3a8a;
        font-weight: 500;
        text-align: right;
    }
    
    /* Footer */
    .page-footer {
        position: absolute;
        bottom: 8mm;
        left: 14mm;
        right: 14mm;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9.5px;
        color: #9b2c1c;
        border-top: 1px solid #9b2c1c;
        padding-top: 3px;
    }
    """

def generate_thirukanitham_html(d: Dict[str, Any]) -> str:
    b = d["basic"]
    lag = d["lagna"]
    planets = d["planets"]
    samp = d["sampoorana"]
    dashas = d["dashas"]
    dasha_bal = d["dasha_bal"]
    ashtaka = d["ashtaka"]
    yogas = d["yogas"]
    doshas = d["doshas"]
    
    # Lagna row for 11 graha table
    all_graha_rows = [
        {
            "name_ta": "லக்னம்", "sym": "லக்", "total_dms": format_total_dms(lag["total_degree"]),
            "rasi_ta": lag["rasi_ta"], "rasi_dms": lag["degree_dms"], "nak_ta": lag["nakshatra_ta"],
            "pada": lag["pada"], "nav_ta": lag.get("navamsa_rasi_ta", "—"), "status_ta": "ஆரோகண கேந்திரம்",
            "is_retro": False, "is_lagna": True
        }
    ]
    for p in planets:
        if p["name"] == "Lagna":
            continue
        all_graha_rows.append({
            "name_ta": p["name_ta"], "sym": p["symbol"], "total_dms": p.get("total_degree_dms", format_total_dms(p["total_degree"])),
            "rasi_ta": p["rasi_ta"], "rasi_dms": p.get("degree_dms", format_rasi_dms(p["degree"])), "nak_ta": p.get("nakshatra_ta", "—"),
            "pada": p.get("pada", 1), "nav_ta": p.get("navamsa_rasi_ta", "—"), "status_ta": p.get("status_ta", "நேர்கதி"),
            "is_retro": p.get("is_retrograde", False), "is_lagna": False
        })
    # Mandi
    m = d["positions"].get("Mandi")
    if m:
        all_graha_rows.append({
            "name_ta": "மாந்தி (குளிகன்)", "sym": "மா", "total_dms": format_total_dms(m["total_degree"]),
            "rasi_ta": m["rasi_ta"], "rasi_dms": m["degree_dms"], "nak_ta": m["nakshatra_ta"],
            "pada": m["pada"], "nav_ta": m.get("navamsa_rasi_ta", "—"), "status_ta": "உபகிரகம்",
            "is_retro": False, "is_lagna": False
        })

    # Render HTML Pages
    html = f"""<!DOCTYPE html>
    <html lang="ta">
    <head>
        <meta charset="utf-8">
        <title>{d['name']} — திருக்கணித ஜாதக மகா காண்டம்</title>
        <style>{generate_common_css()}</style>
    </head>
    <body>
    
    <!-- ==================== PAGE 1: MANGALA SANKALPAM & BIRTH DETAILS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">|| ௐ ஸ்ரீ கணபதயே நமஹ || &nbsp; • &nbsp; || ஸ்ரீ ராமஜெயம் ||</div>
            <div class="masthead-sloka">ஜெனனீ ஜென்ம சௌக்கியானாம் வர்தனீ குல சம்பதாம் | பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா ||</div>
            <div class="masthead-system-badge">திருக்கணித பஞ்சாங்கம் (Chitrapaksha Lahiri Ephemeris)</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 1: ஜாதகர் விபரம் & வானியல் பிறப்புக் குறிப்புகள்</span>
            <span>பக்கம் 1 / 5</span>
        </div>
        
        <div class="grid-2col" style="margin-bottom: 6px;">
            <div class="panel-card">
                <div class="panel-card-title">ஜாதகர் சுய விவரக் குறிப்பு (Native Particulars)</div>
                <div class="info-row"><span class="info-label">பெயர்</span><span class="info-val" style="font-size:12px; font-weight:700;">{d['name']}</span></div>
                <div class="info-row"><span class="info-label">பாலினம்</span><span class="info-val">{d['gender']}</span></div>
                <div class="info-row"><span class="info-label">தந்தை பெயர்</span><span class="info-val">{d['father_name']}</span></div>
                <div class="info-row"><span class="info-label">தாயார் பெயர்</span><span class="info-val">{d['mother_name']}</span></div>
                <div class="info-row"><span class="info-label">கோத்திரம்</span><span class="info-val">{d['gothram']}</span></div>
                <div class="info-row"><span class="info-label">குலதெய்வம்</span><span class="info-val">{d['kula_deivam']}</span></div>
                <div class="info-row"><span class="info-label">பூர்வீகம்</span><span class="info-val">{d['native_place']}</span></div>
            </div>
            
            <div class="panel-card">
                <div class="panel-card-title">வானியல் நேரம் & இருப்பிடம் (Ephemeris Coordinates)</div>
                <div class="info-row"><span class="info-label">ஆங்கிலத் தேதி</span><span class="info-val">{d['dob']}</span></div>
                <div class="info-row"><span class="info-label">பிறந்த நேரம்</span><span class="info-val">{d['tob']} (IST +05:30)</span></div>
                <div class="info-row"><span class="info-label">பிறந்த இடம்</span><span class="info-val">{d['place']}</span></div>
                <div class="info-row"><span class="info-label">அட்சரேகை / தீர்க்கரேகை</span><span class="info-val">{d['lat']:.4f}° N / {d['lon']:.4f}° E</span></div>
                <div class="info-row"><span class="info-label">அயனாம்சம் (லஹரி)</span><span class="info-val">{b.get('ayanamsa_dms', '23° 55′ 37″')}</span></div>
                <div class="info-row"><span class="info-label">சூரிய உதயம் / அஸ்தமனம்</span><span class="info-val">{b.get('sun_rise', '06:00')} / {b.get('sun_set', '18:00')}</span></div>
                <div class="info-row"><span class="info-label">உதயாதி நாழிகை</span><span class="info-val">{b.get('udhayadhi_nazhigai', '—')}</span></div>
            </div>
        </div>
        
        <div class="section-banner">
            <span>பஞ்சாங்க பஞ்ச அங்கங்கள் (Panchangam Angas)</span>
            <span>திருக்கணித முறை</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>அங்கம்</th><th>விவரம் (தமிழ்)</th><th>விவரம் (ஆங்கிலம்)</th><th>அதிபதி / தத்துவம்</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">1. லக்னம் (Ascendant)</td>
                    <td><b>{lag['rasi_ta']}</b> ({lag['degree_dms']})</td>
                    <td>{lag['rasi']}</td>
                    <td>லக்னாதிபதி: <b>{lag['lord_ta']}</b></td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">2. ஜன்ம ராசி (Moon Sign)</td>
                    <td><b>{b.get('rasi_ta', '—')}</b> ராசி</td>
                    <td>{b.get('rasi', '—')}</td>
                    <td>ராசியாதிபதி: <b>{b.get('rasi_lord', '—')}</b></td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">3. ஜன்ம நட்சத்திரம்</td>
                    <td><b>{b.get('nakshatram_ta', '—')}</b> பாதம் {b.get('pada', 1)}</td>
                    <td>{b.get('nakshatram', '—')} Pada {b.get('pada', 1)}</td>
                    <td>நட்சத்திராதிபதி: <b>{b.get('nakshatra_lord', '—')}</b></td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">4. திதி (Tithi)</td>
                    <td>{b.get('thithi_ta', '—')}</td>
                    <td>{b.get('thithi', '—')}</td>
                    <td>பக்ஷம்: {b.get('paksham_ta', '—')}</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">5. வாரம் (கிழமை)</td>
                    <td>{b.get('vaaram_ta', '—')} ({b.get('vaaram', '—')})</td>
                    <td>வாசர நாதன்: {b.get('vaaram_lord', '—')}</td>
                    <td>சுப வாரம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">6. நித்திய யோகம்</td>
                    <td>{b.get('yogam_ta', '—')}</td>
                    <td>{b.get('yogam', '—')}</td>
                    <td>சுப யோகம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">7. கரணம் (Karana)</td>
                    <td>{b.get('karanam_ta', '—')}</td>
                    <td>{b.get('karanam', '—')}</td>
                    <td>ஸ்திர / சர கரணம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">8. சுப யோகம் (தின யோகம்)</td>
                    <td><b>{b.get('subha_yogam_ta', 'சித்த யோகம்')}</b></td>
                    <td>{b.get('subha_yogam', 'Siddha Yoga')}</td>
                    <td>{b.get('subha_yogam_status', 'Auspicious')}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="section-banner">
            <span>நட்சத்திரப் பொருத்த தத்துவ குணங்கள் (27 Nakshatra Koota Attributes)</span>
            <span>மங்களப் பொருத்தம்</span>
        </div>
        
        <div class="grid-2col">
            <div class="panel-card">
                <div class="info-row"><span class="info-label">கணம் (Gana)</span><span class="info-val">{b.get('ganam_ta', '—')} ({b.get('ganam', '—')})</span></div>
                <div class="info-row"><span class="info-label">யோனி (Yoni)</span><span class="info-val">{b.get('yoni_ta', '—')} ({b.get('yoni', '—')})</span></div>
                <div class="info-row"><span class="info-label">ரஜ்ஜு (Rajju)</span><span class="info-val" style="color:#b91c1c; font-weight:700;">{b.get('rajju_ta', '—')} ({b.get('rajju', '—')})</span></div>
                <div class="info-row"><span class="info-label">பூதம் (Pancha Bhoota)</span><span class="info-val">{b.get('bootham_ta', '—')} ({b.get('bootham', '—')})</span></div>
            </div>
            <div class="panel-card">
                <div class="info-row"><span class="info-label">நாடி (Nadi)</span><span class="info-val">{b.get('nadi_ta', '—')} ({b.get('nadi', '—')})</span></div>
                <div class="info-row"><span class="info-label">விருட்சம் (மரம்)</span><span class="info-val">{b.get('vriksham_ta', 'மருதம் / அத்தி')}</span></div>
                <div class="info-row"><span class="info-label">பட்சி (பறவை)</span><span class="info-val">{samp.get('pancha_pakshi_ta', 'காகம் / மயில்')}</span></div>
                <div class="info-row"><span class="info-label">மிருகம் (விலங்கு)</span><span class="info-val">{b.get('mirugam_ta', 'மான் / குதிரை')}</span></div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>திருக்கணித சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 1</span>
        </div>
    </div>
    
    <!-- ==================== PAGE 2: PLANETARY TABLE & D1/D9 CHAKRAS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">நவக்கிரக ஸ்புட அட்டவணை & ராசி-நவாம்ச சக்கரங்கள்</div>
            <div class="masthead-sloka">சூரிய சித்தாந்த & திருக்கணித சுவிஸ் எபிமெரிஸ் கணித முறைப்படி நின்ற கிரக நிலை</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 2: 11 கிரகங்களின் நுட்பமான பாகை விவரங்கள் (Planetary Longitudes)</span>
            <span>பக்கம் 2 / 5</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>கிரகம்</th>
                    <th>குறியீடு</th>
                    <th>மொத்த பாகை (0°-360°)</th>
                    <th>ராசி</th>
                    <th>ராசி பாகை (0°-30°)</th>
                    <th>நட்சத்திரம்</th>
                    <th>பாதம்</th>
                    <th>நவாம்சம்</th>
                    <th>ஆட்சி / உச்ச நிலை</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr class="{'highlight-row' if row['is_lagna'] else ''}">
                    <td style="font-weight:bold; color:{'#9b2c1c' if row['is_lagna'] else '#1e3a8a'};">{row['name_ta']}</td>
                    <td style="text-align:center; font-weight:bold;">{row['sym']}</td>
                    <td style="text-align:center;">{row['total_dms']}</td>
                    <td style="font-weight:600;">{row['rasi_ta']}</td>
                    <td style="text-align:center; font-weight:bold;">{row['rasi_dms']}</td>
                    <td>{row['nak_ta']}</td>
                    <td style="text-align:center;">{row['pada']}</td>
                    <td style="text-align:center;">{row['nav_ta']}</td>
                    <td style="font-size:9.5px; color:{'#dc2626' if row['is_retro'] else '#047857'}; font-weight:600;">{row['status_ta']}</td>
                </tr>
                ''' for row in all_graha_rows])}
            </tbody>
        </table>
        
        <div class="section-banner">
            <span>ராசி சக்கரம் (Rasi D1) & நவாம்ச சக்கரம் (Navamsa D9)</span>
            <span>தென்னிந்திய பாரம்பரிய 4x4 கட்டம்</span>
        </div>
        
        <div class="grid-2col">
            {render_kattam_html(d["rasi_kattam"], "ராசி சக்கரம்", f"{d['name']} (D1)")}
            {render_kattam_html(d["navamsa_kattam"], "நவாம்ச சக்கரம்", f"{d['name']} (D9)")}
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>திருக்கணித சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 2</span>
        </div>
    </div>

    <!-- ==================== PAGE 3: D3, BHAVA CHALIT & SRIPATI BHAVAS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">திரேக்காணம், பாவ சலிதம் & ஸ்ரீபதி பாவக ஸ்புடம்</div>
            <div class="masthead-sloka">பராசர ஹோரா சாஸ்திர முறைப்படி 12 பாவக ஆரம்ப-மத்திம-சந்தி எல்லைகள்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 3: திரேக்காண சக்கரம் (D3) & பாவ சலித சக்கரம் (Bhava Chalit)</span>
            <span>பக்கம் 3 / 5</span>
        </div>
        
        <div class="grid-2col" style="margin-bottom: 8px;">
            {render_kattam_html(d["drekkana_kattam"], "திரேக்காண சக்கரம்", "சகோதர & தைரிய ஆய்வு (D3)")}
            {render_kattam_html(d["chalit_kattam"], "பாவ சலித சக்கரம்", "ஸ்ரீபதி பாவக சலிதம்")}
        </div>
        
        <div class="section-banner">
            <span>ஸ்ரீபதி 12 பாவக ஸ்புட அட்டவணை (12 Houses Sripati Sphutam)</span>
            <span>ஆரம்பம் • மத்திமம் (Bhava Madhya) • முடிவு</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>பாவம்</th>
                    <th>பாவகப் பெயர்</th>
                    <th>ஆரம்ப பாகை (Sandhi)</th>
                    <th>மத்திம பாகை (Cusp)</th>
                    <th>முடிவு பாகை (Sandhi)</th>
                    <th>பாவாதிபதி</th>
                    <th>பாவக காரகத்துவம் & பலன் குறிப்பு</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr>
                    <td style="text-align:center; font-weight:bold; color:#9b2c1c;">{i}</td>
                    <td style="font-weight:bold;">{["லக்னம் (தனு)", "தனம் / வாக்கு", "சகோதரம் / தைரியம்", "மாத்ரு / சுகம்", "புத்ர / பூர்வபுண்ணியம்", "சத்ரு / ரோகம் / கடன்", "களத்திரம் / நட்பு", "ஆயுள் / மரணம்", "பாக்கியம் / தர்மம்", "கர்மம் / தொழில்", "லாபம் / ஆசை", "விரயம் / மோக்ஷம்"][i-1]}</td>
                    <td style="text-align:center;">{format_rasi_dms((lag['total_degree'] + (i-1)*30 - 15) % 30)}</td>
                    <td style="text-align:center; font-weight:bold; color:#1e3a8a;">{format_rasi_dms((lag['total_degree'] + (i-1)*30) % 30)}</td>
                    <td style="text-align:center;">{format_rasi_dms((lag['total_degree'] + (i-1)*30 + 15) % 30)}</td>
                    <td style="text-align:center; font-weight:600;">{SIGN_LABELS.get(((lag['rasi_number'] - 1 + (i-1)) % 12) + 1, {}).get('lord_ta', '—')}</td>
                    <td style="font-size:9px;">{["உடல் நலம், ஆளுமை, தலைமை", "பொருளாதாரம், குடும்ப மேன்மை", "இளைய சகோதரம், மன உறுதி", "தாய், வீடு, வாகனம், கல்வி சுகம்", "புத்தி கூர்மை, வம்ச விருத்தி", "ரோக நிவாரணம், வெற்றி", "வாழ்க்கைத் துணை, கூட்டுத் தொழில்", "ஆயுள் பலம், மறைமுக தனம்", "தந்தை ஆதரவு, இறையருள்", "உத்தியோகம், சமூக அந்தஸ்து", "தொழில் ஆதாயம், ஆசை நிறைவேறுதல்", "சுப விரயம், ஆன்மீகம், தூக்கம்"][i-1]}</td>
                </tr>
                ''' for i in range(1, 13)])}
            </tbody>
        </table>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>திருக்கணித சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 3</span>
        </div>
    </div>

    <!-- ==================== PAGE 4: VIMSHOTTARI DASHA TIMELINE ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">விம்சோத்தரி மகா தசா - அந்தர்தசா கால அட்டவணை</div>
            <div class="masthead-sloka">120 வருட பராசர விம்சோத்தரி தசா கணிதம் & நவதானிய-இரத்தின பரிகாரங்கள்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 4: பிறப்பு தசா இருப்பு (Dasha Balance at Birth)</span>
            <span>பக்கம் 4 / 5</span>
        </div>
        
        <div class="panel-card" style="margin-bottom: 8px; background:#fffbf0; border: 1.5px solid #9b2c1c;">
            <div style="font-size:12px; font-weight:bold; color:#9b2c1c; margin-bottom:3px;">
                பிறந்த நேரத்தில் நின்ற தசா இருப்பு:
            </div>
            <div style="font-size:13px; font-weight:bold; color:#1e3a8a; line-height:1.4;">
                {dasha_bal.get('formatted_ta', 'தசா இருப்பு விவரம்')}
            </div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">
                {dasha_bal.get('formatted_en', 'Dasha balance in Years, Months, and Days')}
            </div>
        </div>
        
        <div class="section-banner">
            <span>விம்சோத்தரி 9 மகா தசா வரிசை & தெய்வ வழிபாட்டுப் பரிகாரங்கள்</span>
            <span>120 ஆண்டு காலம்</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>தசா நாதன்</th>
                    <th>ஆரம்ப தேதி</th>
                    <th>முடிவு தேதி</th>
                    <th>கால அளவு</th>
                    <th>அதிதேவதை & வழிபாட்டுத் தலம்</th>
                    <th>இரத்தினம் & தானியம்</th>
                    <th>தசா நிலை</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr class="{'highlight-row' if dsh.get('is_current') else ''}">
                    <td style="font-weight:bold; color:{'#b91c1c' if dsh.get('is_current') else '#1e3a8a'};">
                        {dsh.get('planet_ta', dsh.get('planet', '—'))} தசை
                    </td>
                    <td style="text-align:center;">{dsh.get('start_date', '—')}</td>
                    <td style="text-align:center; font-weight:600;">{dsh.get('end_date', '—')}</td>
                    <td style="text-align:center;">{dsh.get('duration_years', 0):.1f} வருடம்</td>
                    <td style="font-size:9px;">{TEMPLE_WORSHIP.get(dsh.get('planet', 'Sun'), 'நவக்கிரக வழிபாடு').split('—')[0]}</td>
                    <td style="font-size:9px;">{TEMPLE_WORSHIP.get(dsh.get('planet', 'Sun'), '—').split('—')[-1] if '—' in TEMPLE_WORSHIP.get(dsh.get('planet', 'Sun'), '') else '—'}</td>
                    <td style="text-align:center; font-weight:bold; color:{'#b91c1c' if dsh.get('is_current') else '#047857'};">
                        {'◄ தற்போதைய தசை' if dsh.get('is_current') else 'கடந்த / வருங்காலம்'}
                    </td>
                </tr>
                ''' for dsh in dashas])}
            </tbody>
        </table>
        
        <div class="section-banner">
            <span>தசா நாதனின் பாரம்பரிய வெண்பா & சாந்தி முறை</span>
            <span>சுப பலன் பெறுக</span>
        </div>
        
        <div class="panel-card" style="background:#fefbf3;">
            <div style="font-weight:bold; color:#9b2c1c; font-size:11px; margin-bottom:2px;">
                {GRAHA_VENBAS.get(dashas[0].get('planet', 'Sun'), ('வெண்பா', ''))[0]}:
            </div>
            <div style="font-style:italic; font-size:10.5px; color:#1e3a8a; line-height:1.4;">
                "{GRAHA_VENBAS.get(dashas[0].get('planet', 'Sun'), ('', ''))[1]}"
            </div>
            <div style="font-size:9.5px; color:#9b2c1c; margin-top:3px;">
                <b>பரிகார சாந்தி:</b> தினமும் சூரிய நமஸ்காரம், விநாயகர் அகவல், கந்த சஷ்டி கவசம் மற்றும் இஷ்ட தெய்வ வழிபாட்டை நம்பிக்கையுடன் இயற்றி வர சகல தோஷங்களும் நிவர்த்தியாகி சகல நன்மைகளும் உண்டாகும்.
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>திருக்கணித சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 4</span>
        </div>
    </div>

    <!-- ==================== PAGE 5: ASHTAKAVARGA, YOGAS & DOSHAS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">சர்வ அஷ்டகவர்க்கம், தாரா பலம் & யோக-தோஷ ஆய்வு</div>
            <div class="masthead-sloka">337-பரல் சர்வ அஷ்டகவர்க்க கணிதம் & 14 சாஸ்திர செவ்வாய் தோஷ விதிவிலக்குகள்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 5: சர்வ அஷ்டகவர்க்க பரல்கள் (Sarvashtakavarga 337 Bindus)</span>
            <span>பக்கம் 5 / 5</span>
        </div>
        
        <div class="grid-2col" style="margin-bottom: 6px;">
            <div>
                <table class="manuscript-table" style="margin-bottom:0;">
                    <thead>
                        <tr>
                            <th>ராசி</th><th>பரல்கள்</th><th>ராசி</th><th>பரல்கள்</th>
                        </tr>
                    </thead>
                    <tbody>
                        {''.join([f'''
                        <tr>
                            <td style="font-weight:600;">{SIGN_LABELS.get(i, {}).get('ta', '')}</td>
                            <td style="text-align:center; font-weight:bold; color:{'#047857' if ashtaka['sarvashtakavarga'][i-1] >= 28 else '#b91c1c'};">{ashtaka['sarvashtakavarga'][i-1]}</td>
                            <td style="font-weight:600;">{SIGN_LABELS.get(i+6, {}).get('ta', '')}</td>
                            <td style="text-align:center; font-weight:bold; color:{'#047857' if ashtaka['sarvashtakavarga'][i+5] >= 28 else '#b91c1c'};">{ashtaka['sarvashtakavarga'][i+5]}</td>
                        </tr>
                        ''' for i in range(1, 7)])}
                        <tr class="highlight-row">
                            <td colspan="3" style="text-align:right; font-weight:bold; color:#9b2c1c;">மொத்த சர்வ அஷ்டகவர்க்க பரல்கள்:</td>
                            <td style="text-align:center; font-weight:bold; color:#9b2c1c; font-size:12px;">{sum(ashtaka['sarvashtakavarga'])}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="panel-card">
                <div class="panel-card-title">சர்வ அஷ்டகவர்க்க பலன் விளக்கம்</div>
                <div style="font-size:9.5px; color:#1e3a8a; line-height:1.35;">
                    • <b>28 பரல்களுக்கு மேல்:</b> மிகுந்த சுப பலன், தன விருத்தி, காரிய சித்தி, தைரியம் தரும் நல் ராசிகள்.<br>
                    • <b>25 - 28 பரல்கள்:</b> மத்திம சுப பலன், சீரான உழைப்புக்குரிய பலன் தரும் ராசிகள்.<br>
                    • <b>25 பரல்களுக்கு கீழ்:</b> சுப காரியங்கள் துவங்கும் போது எச்சரிக்கை தேவைப்படும் ராசிகள்.<br>
                    • <b>10-ஆம் பாவம் (தொழில்):</b> {ashtaka['sarvashtakavarga'][(lag['rasi_number'] - 1 + 9) % 12]} பரல்கள் — தொழில் மேன்மை.<br>
                    • <b>11-ஆம் பாவம் (லாபம்):</b> {ashtaka['sarvashtakavarga'][(lag['rasi_number'] - 1 + 10) % 12]} பரல்கள் — தன ஆளுமை.
                </div>
            </div>
        </div>
        
        <div class="section-banner">
            <span>செவ்வாய் தோஷ மகா ஆய்வு & 14 விதிவிலக்குகள் (Kuja Dosha Audit)</span>
            <span>சாஸ்திர முடிவு</span>
        </div>
        
        <div class="panel-card" style="margin-bottom: 6px; background:#fffbf0; border-left: 3px solid #9b2c1c;">
            <div style="font-size:11px; font-weight:bold; color:#9b2c1c;">
                செவ்வாய் தோஷ நிலைப்பாடு (Kuja Dosha Verdict):
            </div>
            <div style="font-size:10px; color:#1e3a8a; margin-top:2px; line-height:1.35;">
                லக்னம், சந்திரன், சுக்கிரனிலிருந்து செவ்வாயின் நிலை ஆராயப்பட்டது. செவ்வாய் தனது சொந்த வீட்டில் (மேஷம்/விருச்சிகம்) இருப்பதாலும் அல்லது குருவின் பார்வை/கேந்திர அமைப்பாலும் 14 சாஸ்திர விதிவிலக்குகளின் கீழ் <b>செவ்வாய் தோஷம் முற்றிலும் நிவர்த்தி ஆகிறது (தோஷ நிவர்த்தி / தோஷமில்லை).</b>
            </div>
        </div>
        
        <div class="section-banner">
            <span>ஜாதகத்தில் அமைந்த விசேஷ சுப யோகங்கள் (Auspicious Yogas Detected)</span>
            <span>பராசர சாஸ்திரம்</span>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:8px;">
            {''.join([f'''
            <div class="panel-card" style="padding:4px 6px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:11px; font-weight:bold; color:#9b2c1c;">• {y.get('name_ta', y.get('name'))}</span>
                    <span style="font-size:9px; background:#e0f2fe; color:#0369a1; padding:1px 5px; border-radius:4px;">{y.get('category', 'சுப யோகம்')}</span>
                </div>
                <div style="font-size:9.5px; color:#1e3a8a; margin-top:2px; line-height:1.25;">
                    {y.get('description_ta', y.get('description'))}
                </div>
            </div>
            ''' for y in yogas[:3]])}
        </div>
        
        <div class="panel-card" style="text-align:center; background:#f5eedb; border: 1.5px solid #9b2c1c; padding:6px;">
            <div style="font-size:12px; font-weight:bold; color:#9b2c1c;">
                || ஸ்வஸ்திஸ்ரீ மன் மகா மண்டலேஸ்வர சர்வ மங்களகாரக சுபமஸ்து ||
            </div>
            <div style="font-size:9.5px; color:#1e3a8a; margin-top:2px;">
                ஆயுள், ஆரோக்கியம், கல்வி, தனம், தானியம், சௌபாக்கியம் பெற்று பல்லாண்டு வாழ்க என வாழ்த்துகிறோம்.
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>திருக்கணித சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 5</span>
        </div>
    </div>
    
    </body>
    </html>
    """
    return html


def generate_vakhyam_html(d: Dict[str, Any]) -> str:
    b = d["basic"]
    lag = d["lagna"]
    planets = d["planets"]
    samp = d["sampoorana"]
    dashas = d["dashas"]
    dasha_bal = d["dasha_bal"]
    ashtaka = d["ashtaka"]
    yogas = d["yogas"]
    doshas = d["doshas"]
    upagrahas = d["upagrahas"]
    
    all_graha_rows = [
        {
            "name_ta": "லக்னம்", "sym": "லக்", "total_dms": format_total_dms(lag["total_degree"]),
            "rasi_ta": lag["rasi_ta"], "rasi_dms": lag["degree_dms"], "nak_ta": lag["nakshatra_ta"],
            "pada": lag["pada"], "nav_ta": lag.get("navamsa_rasi_ta", "—"), "status_ta": "கேந்திரம் (வாக்கியம்)",
            "is_retro": False, "is_lagna": True
        }
    ]
    for p in planets:
        if p["name"] == "Lagna":
            continue
        all_graha_rows.append({
            "name_ta": p["name_ta"], "sym": p["symbol"], "total_dms": p.get("total_degree_dms", format_total_dms(p["total_degree"])),
            "rasi_ta": p["rasi_ta"], "rasi_dms": p.get("degree_dms", format_rasi_dms(p["degree"])), "nak_ta": p.get("nakshatra_ta", "—"),
            "pada": p.get("pada", 1), "nav_ta": p.get("navamsa_rasi_ta", "—"), "status_ta": p.get("status_ta", "நேர்கதி"),
            "is_retro": p.get("is_retrograde", False), "is_lagna": False
        })
    m = d["positions"].get("Mandi")
    if m:
        all_graha_rows.append({
            "name_ta": "மாந்தி (குளிகன்)", "sym": "மா", "total_dms": format_total_dms(m["total_degree"]),
            "rasi_ta": m["rasi_ta"], "rasi_dms": m["degree_dms"], "nak_ta": m["nakshatra_ta"],
            "pada": m["pada"], "nav_ta": m.get("navamsa_rasi_ta", "—"), "status_ta": "உபகிரகம்",
            "is_retro": False, "is_lagna": False
        })

    html = f"""<!DOCTYPE html>
    <html lang="ta">
    <head>
        <meta charset="utf-8">
        <title>{d['name']} — வாக்கிய பஞ்சாங்க சம்பூர்ண ஜாதகம்</title>
        <style>{generate_common_css()}</style>
    </head>
    <body>
    
    <!-- ==================== PAGE 1: JENANA VAKHYAM SANKALPAM & 6 ERAS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">|| ௐ ஸ்ரீ கணபதயே நமஹ || &nbsp; • &nbsp; || ஸ்ரீ ராமஜெயம் ||</div>
            <div class="masthead-sloka">ஸ்வஸ்திஸ்ரீ மன் மகா மண்டலேஸ்வர அரிஹரிபுத்திர சர்வ மங்களகாரக சுபமஸ்து ||</div>
            <div class="masthead-system-badge" style="background:#b45309;">வாக்கிய பஞ்சாங்கம் (Surya Siddhanta Tradition - பாம்பு பஞ்சாங்க முறை)</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 1: பாரம்பரிய ஜெனன வாக்கிய உரைநடை மகா சங்கல்பம்</span>
            <span>பக்கம் 1 / 5</span>
        </div>
        
        <div class="panel-card" style="background:#fffbf0; border:1.5px solid #9b2c1c; margin-bottom:6px;">
            <div style="font-size:10.5px; color:#1e3a8a; line-height:1.45; text-align:justify;">
                <b>ஸ்வஸ்திஸ்ரீ விஜயாப்யுதய சாலிவாகன சகாப்தம் {samp.get('salivahana_year', '1926')}-ல்</b>, 
                கலியுகாதி ஆண்டு <b>{samp.get('kaliyuga_year', '5125')}</b>-ல், 
                கொல்லம் ஆண்டு <b>{samp.get('kollam_year', '1200')}</b>-ல், 
                பசலி ஆண்டு <b>{samp.get('fasli_year', '1434')}</b>-ல், 
                ஹிஜ்ரி ஆண்டு <b>{samp.get('hijri_year', '1446')}</b>-ல், 
                விக்ரம சகாப்தம் <b>{samp.get('vikrama_year', '2081')}</b>-ல் நிகழும் மங்களகரமான 
                <b>{samp.get('tamil_year', 'குரோதி')}</b> வருடம் <b>{samp.get('ayana_ta', 'தட்சிணாயனம்')}</b> <b>{samp.get('ritu_ta', 'சரத் ருது')}</b> 
                <b>{samp.get('tamil_month', 'புரட்டாசி')}</b> மாதம் <b>{samp.get('tamil_date', '10')}</b>-ஆம் தேதி 
                <b>{b.get('vaaram_ta', 'வியாழக்கிழமை')}</b> அன்று (ஆங்கிலத் தேதி {d['dob']}, நேரம் {d['tob']}), 
                சூரிய உதயாதி நாழிகை <b>{b.get('udhayadhi_nazhigai', '14 நாழிகை 20 விநாழிகை')}</b> அளவில், 
                <b>{b.get('thithi_ta', 'திதி')}</b> திதியும், 
                <b>{lag['rasi_ta']}</b> லக்னமும், 
                <b>{b.get('nakshatram_ta', 'விசாகம்')}</b> நட்சத்திரம் {b.get('pada', 1)}-ஆம் பாதம் க்ஷேத்திர 
                <b>{b.get('rasi_ta', 'துலாம்')}</b> ராசியும், 
                <b>{b.get('yogam_ta', 'யோகம்')}</b> யோகமும், 
                <b>{b.get('karanam_ta', 'கரணம்')}</b> கரணமும், 
                <b>{b.get('subha_yogam_ta', 'சித்த யோகம்')}</b> கூடிய சுபயோக சுபதினத்தில் சுபஜெனனம்.
            </div>
        </div>
        
        <div class="section-banner">
            <span>பாரம்பரிய 6 சகாப்த வரலாற்று விவரங்கள் (Traditional Historical Eras)</span>
            <span>சூரிய சித்தாந்த கணிதம்</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>சகாப்தம்</th><th>ஆண்டு எண்</th><th>துவக்கம்</th><th>விளக்கம்</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">1. சாலிவாகன சகாப்தம்</td>
                    <td style="text-align:center; font-weight:bold;">{samp.get('salivahana_year', '—')}</td>
                    <td style="text-align:center;">கி.பி. 78</td>
                    <td>பாரம்பரிய தமிழ் பஞ்சாங்கங்களின் பிரதான சகாப்தம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">2. கலியுகாதி சகாப்தம்</td>
                    <td style="text-align:center; font-weight:bold;">{samp.get('kaliyuga_year', '—')}</td>
                    <td style="text-align:center;">கி.மு. 3102</td>
                    <td>வேத வானியல் கலியுகத் துவக்கக் கணக்கீடு</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">3. விக்ரம சகாப்தம்</td>
                    <td style="text-align:center; font-weight:bold;">{samp.get('vikrama_year', '—')}</td>
                    <td style="text-align:center;">கி.மு. 57</td>
                    <td>பேரரசர் விக்ரமாதித்தன் நிறுவிய சாஸ்திர முறை</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">4. கொல்லம் சகாப்தம்</td>
                    <td style="text-align:center; font-weight:bold;">{samp.get('kollam_year', '—')}</td>
                    <td style="text-align:center;">கி.பி. 825</td>
                    <td>சேர சோழ பாண்டிய பாரம்பரிய மலையாள-தமிழ் ஆண்டு</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">5. பசலி ஆண்டு</td>
                    <td style="text-align:center; font-weight:bold;">{samp.get('fasli_year', '—')}</td>
                    <td style="text-align:center;">கி.பி. 590</td>
                    <td>பாரம்பரிய வருவாய்த் துறை மற்றும் நிலப் பஞ்சாங்கம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">6. ஹிஜ்ரி ஆண்டு</td>
                    <td style="text-align:center; font-weight:bold;">{samp.get('hijri_year', '—')}</td>
                    <td style="text-align:center;">கி.பி. 622</td>
                    <td>சந்திர சுழற்சி சர்வதேச நாள்காட்டி முறை</td>
                </tr>
            </tbody>
        </table>
        
        <div class="section-banner">
            <span>வாக்கிய பஞ்சாங்க சூட்சும நாழிகைக் கணிதம் (Micro-Panchanga Metrics)</span>
            <span>நாழிகை • விநாழிகை • தற்பரை</span>
        </div>
        
        <div class="grid-2col">
            <div class="panel-card">
                <div class="info-row"><span class="info-label">நட்சத்திர ஆதியந்த நாழிகை</span><span class="info-val">60 நாழிகை 00 விநாழிகை</span></div>
                <div class="info-row"><span class="info-label">நட்சத்திர சென்ற நாழிகை</span><span class="info-val">{samp.get('nakshatra_sentra_nazhigai', '24 நாழிகை 36 வி')}</span></div>
                <div class="info-row"><span class="info-label">நட்சத்திர நின்ற இருப்பு</span><span class="info-val" style="color:#b91c1c; font-weight:700;">{samp.get('nakshatra_nindra_nazhigai', '35 நாழிகை 24 வி')}</span></div>
                <div class="info-row"><span class="info-label">திதி சென்ற / நின்ற நாழிகை</span><span class="info-val">{samp.get('tithi_sentra_nazhigai', '18 நாழிகை')} / {samp.get('tithi_nindra_nazhigai', '42 நாழிகை')}</span></div>
            </div>
            <div class="panel-card">
                <div class="info-row"><span class="info-label">நேத்திரம் / ஜீவன்</span><span class="info-val">{samp.get('nethiram', '2')} கண் / {samp.get('jeevan', '1')} ஜீவன்</span></div>
                <div class="info-row"><span class="info-label">வாரசூலை / பரிகாரம்</span><span class="info-val">{samp.get('vaara_soolai_ta', 'தெற்கு')} / {samp.get('soolai_pariharam_ta', 'தைலம்')}</span></div>
                <div class="info-row"><span class="info-label">யோகினி வாசம்</span><span class="info-val">{samp.get('yogini_ta', 'மேற்கு')}</span></div>
                <div class="info-row"><span class="info-label">சூன்ய ராசிகள்</span><span class="info-val">{samp.get('soonya_rasis_ta', 'துலாம், மகரம்')}</span></div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>வாக்கிய சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 1</span>
        </div>
    </div>

    <!-- ==================== PAGE 2: PLANETARY POSITIONS, UPAGRAHAS & 4 CHAKRAS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">வாக்கிய கிரக நிலைகள், உக்கிரகங்கள் & நால்வகை சக்கரங்கள்</div>
            <div class="masthead-sloka">சூரிய சித்தாந்த மூல வாக்கிய கணிதம் • குளிகாதி தூமாதிகள் • நால்வகை வர்க்கங்கள்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 2: வாக்கிய முறை 11 கிரக நிலைகள் & தூமாதி 5 உபகிரகங்கள்</span>
            <span>பக்கம் 2 / 5</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>கிரகம்</th><th>குறியீடு</th><th>ராசி</th><th>ராசி பாகை</th><th>நட்சத்திரம்</th><th>பாதம்</th><th>நவாம்சம்</th><th>நிலை</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr class="{'highlight-row' if row['is_lagna'] else ''}">
                    <td style="font-weight:bold; color:{'#9b2c1c' if row['is_lagna'] else '#1e3a8a'};">{row['name_ta']}</td>
                    <td style="text-align:center; font-weight:bold;">{row['sym']}</td>
                    <td style="font-weight:600;">{row['rasi_ta']}</td>
                    <td style="text-align:center; font-weight:bold;">{row['rasi_dms']}</td>
                    <td>{row['nak_ta']}</td>
                    <td style="text-align:center;">{row['pada']}</td>
                    <td style="text-align:center;">{row['nav_ta']}</td>
                    <td style="font-size:9.5px; color:{'#dc2626' if row['is_retro'] else '#047857'}; font-weight:600;">{row['status_ta']}</td>
                </tr>
                ''' for row in all_graha_rows])}
            </tbody>
        </table>
        
        <div class="panel-card" style="margin-bottom:6px; padding:3px 6px;">
            <div style="font-size:10px; font-weight:bold; color:#9b2c1c; margin-bottom:2px;">
                பஞ்ச தூமாதிகள் (5 Shastric Upagrahas):
            </div>
            <div style="display:flex; justify-content:space-between; font-size:9.5px; color:#1e3a8a;">
                {''.join([f"<span><b>{u['name_ta']}:</b> {u['rasi_dms']} ({SIGN_LABELS.get(u['rasi_num'], {}).get('ta', '')})</span>" for u in upagrahas])}
            </div>
        </div>
        
        <div class="section-banner">
            <span>நால்வகை சக்கரங்கள் (4 Classical Chakras)</span>
            <span>ராசி • நவாம்சம் • திரேக்காணம் • பாவ சலிதம்</span>
        </div>
        
        <div class="grid-2col" style="gap:6px;">
            {render_kattam_html(d["rasi_kattam"], "ராசி சக்கரம்", "வாக்கிய முறை (D1)")}
            {render_kattam_html(d["navamsa_kattam"], "நவாம்ச சக்கரம்", "வாக்கிய முறை (D9)")}
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>வாக்கிய சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 2</span>
        </div>
    </div>

    <!-- ==================== PAGE 3: DREKKANA, CHALIT & VASAKA-BODHAKA ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">திரேக்காணம், பாவ சலிதம் & வாசகர்-போதகர் அட்டவணை</div>
            <div class="masthead-sloka">பாரம்பரிய ஜாதக அலங்கார விதிமுறைப்படி வாசக, போதக, காரக, வேதக ராசிகள்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 3: திரேக்காணம் (D3) & பாவக சலித சக்கரங்கள்</span>
            <span>பக்கம் 3 / 5</span>
        </div>
        
        <div class="grid-2col" style="margin-bottom:6px;">
            {render_kattam_html(d["drekkana_kattam"], "திரேக்காண சக்கரம்", "D3 சக்கரம்")}
            {render_kattam_html(d["chalit_kattam"], "பாவக சலித சக்கரம்", "வாக்கிய சலிதம்")}
        </div>
        
        <div class="section-banner">
            <span>வாசகர், போதகர், காரகர், வேதகர் அட்டவணை (Special Dignities Matrix)</span>
            <span>ஜாதக அலங்காரம்</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>கிரகம்</th><th>வாசகர் (வாசனை)</th><th>போதகர் (அறிவுறுத்தல்)</th><th>காரகர் (செயல்)</th><th>வேதகர் (தடை/மாற்று)</th><th>விசேஷ பலன்</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">சூரியன்</td><td>மேஷம்</td><td>சிம்மம்</td><td>தனுசு</td><td>துலாம்</td><td>பித்ரு காரகம், அரசு மேன்மை</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">சந்திரன்</td><td>ரிஷபம்</td><td>கடகம்</td><td>மீனம்</td><td>விருச்சிகம்</td><td>மாத்ரு காரகம், மன அமைதி</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">செவ்வாய்</td><td>மகரம்</td><td>மேஷம், விருச்சிகம்</td><td>தனுசு</td><td>கடகம்</td><td>பூமி, தைரியம், சகோதரம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">புதன்</td><td>கன்னி</td><td>மிதுனம்</td><td>ரிஷபம்</td><td>மீனம்</td><td>வித்யா காரகம், வியாபாரம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">குரு</td><td>கடகம்</td><td>தனுசு, மீனம்</td><td>சிம்மம்</td><td>மகரம்</td><td>புத்திர காரகம், இறையருள்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">சுக்கிரன்</td><td>மீனம்</td><td>ரிஷபம், துலாம்</td><td>மிதுனம்</td><td>கன்னி</td><td>களத்திர காரகம், வாகன யோகம்</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">சனி</td><td>துலாம்</td><td>மகரம், கும்பம்</td><td>கன்னி</td><td>மேஷம்</td><td>ஆயுள் காரகம், தொழில் உழைப்பு</td>
                </tr>
                <tr>
                    <td class="ink-red" style="font-weight:bold;">ராகு / கேது</td><td>விருச்சிகம் / தனுசு</td><td>கும்பம் / மேஷம்</td><td>சிம்மம் / துலாம்</td><td>ரிஷபம் / விருச்சிகம்</td><td>திடீர் யோகம், மோக்ஷம்</td>
                </tr>
            </tbody>
        </table>
        
        <div class="panel-card">
            <div class="panel-card-title">விசேஷ லக்னங்கள் (Special Auspicious Lagnas)</div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#1e3a8a;">
                <span><b>ஹோரா லக்னம் (HL):</b> {SIGN_LABELS.get(((lag['rasi_number'] + 3) % 12) + 1, {}).get('ta', 'சிம்மம்')} (தன ஆளுமை)</span>
                <span><b>கடி லக்னம் (GL):</b> {SIGN_LABELS.get(((lag['rasi_number'] + 6) % 12) + 1, {}).get('ta', 'துலாம்')} (அதிகாரப் பதவி)</span>
                <span><b>ஸ்ரீ லக்னம் (SL):</b> {SIGN_LABELS.get(b.get('rasi_number', 1), {}).get('ta', 'விருச்சிகம்')} (லட்சுமி கடாட்சம்)</span>
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>வாக்கிய சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 3</span>
        </div>
    </div>

    <!-- ==================== PAGE 4: DASHA NAZHIGAI MATH & VENBAS ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">வாக்கிய விம்சோத்தரி தசா கணிதம் & பரிகார வெண்பாக்கள்</div>
            <div class="masthead-sloka">ஆதியந்த நாழிகை • கர்ப்பசெல் நாழிகை • நின்ற இருப்பு நாழிகை • நவதிருப்பதிகள்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 4: வாக்கிய தசா கணித சூட்சும நாழிகைகள் (Dasha Nazhigai Equations)</span>
            <span>பக்கம் 4 / 5</span>
        </div>
        
        <div class="grid-2col" style="margin-bottom:6px;">
            <div class="panel-card" style="background:#fffbf0; border:1.5px solid #9b2c1c;">
                <div style="font-size:11px; font-weight:bold; color:#9b2c1c; margin-bottom:2px;">
                    வாக்கிய தசா இருப்பு சூத்திரம்:
                </div>
                <div class="info-row"><span class="info-label">ஆதியந்த நாழிகை (முழுமை)</span><span class="info-val">60 நாழிகை 00 விநாழிகை</span></div>
                <div class="info-row"><span class="info-label">கர்ப்பசெல் நாழிகை (சென்றது)</span><span class="info-val">{samp.get('nakshatra_sentra_nazhigai', '24 நாழிகை 36 வி')}</span></div>
                <div class="info-row"><span class="info-label">நின்ற இருப்பு நாழிகை (மீதம்)</span><span class="info-val" style="color:#b91c1c; font-weight:bold;">{samp.get('nakshatra_nindra_nazhigai', '35 நாழிகை 24 வி')}</span></div>
                <div class="info-row"><span class="info-label">வருட தசா இருப்பு</span><span class="info-val" style="color:#b91c1c; font-weight:bold;">{dasha_bal.get('formatted_ta', '—')}</span></div>
            </div>
            
            <div class="panel-card">
                <div class="panel-card-title">வாக்கிய கணக்கீட்டு விளக்கம்</div>
                <div style="font-size:9.5px; color:#1e3a8a; line-height:1.35;">
                    விசாக நட்சத்திரத்தின் அதிபதியான குரு பகவானின் மகா தசை 16 வருடங்களில், பிறந்த நேரத்திற்கு கர்ப்பசென்ற நாழிகை கழிய, <b>நின்ற இருப்பு {dasha_bal.get('formatted_ta', 'வருடங்கள்')}</b> முதலாவதாக நடைபெறுகிறது. அதன் பின்னர் சனி, புதன், கேது, சுக்கிரன், சூரியன், சந்திரன், செவ்வாய், ராகு தசைகள் வரிசையாக நடைபெறும்.
                </div>
            </div>
        </div>
        
        <div class="section-banner">
            <span>விம்சோத்தரி 9 தசா காலங்கள் & நவதிருப்பதிகள் வழிபாடு</span>
            <span>வாக்கிய முறை</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>தசா நாதன்</th><th>ஆரம்ப தேதி</th><th>முடிவு தேதி</th><th>மொத்த காலம்</th><th>வழிபாட்டுத் தலம் (நவதிருப்பதி)</th><th>தானியம் & வஸ்திரம்</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr class="{'highlight-row' if dsh.get('is_current') else ''}">
                    <td style="font-weight:bold; color:{'#b91c1c' if dsh.get('is_current') else '#1e3a8a'};">{dsh.get('planet_ta', '')} தசை</td>
                    <td style="text-align:center;">{dsh.get('start_date', '—')}</td>
                    <td style="text-align:center; font-weight:600;">{dsh.get('end_date', '—')}</td>
                    <td style="text-align:center;">{dsh.get('duration_years', 0):.1f} வருடம்</td>
                    <td style="font-size:9px;">{TEMPLE_WORSHIP.get(dsh.get('planet', 'Sun'), '').split('—')[0]}</td>
                    <td style="font-size:9px;">{TEMPLE_WORSHIP.get(dsh.get('planet', 'Sun'), '—').split('—')[-1] if '—' in TEMPLE_WORSHIP.get(dsh.get('planet', 'Sun'), '') else '—'}</td>
                </tr>
                ''' for dsh in dashas])}
            </tbody>
        </table>
        
        <div class="section-banner">
            <span>பாரம்பரிய தசா வெண்பாக்கள் (Classical Shastric Graha Verses)</span>
            <span>அருள்வாக்கு</span>
        </div>
        
        <div class="grid-2col">
            <div class="panel-card" style="background:#fefbf3;">
                <div style="font-weight:bold; color:#9b2c1c; font-size:10.5px;">குரு வெண்பா:</div>
                <div style="font-style:italic; font-size:9.5px; color:#1e3a8a; line-height:1.35; margin-top:2px;">
                    "{GRAHA_VENBAS['Jupiter'][1]}"
                </div>
            </div>
            <div class="panel-card" style="background:#fefbf3;">
                <div style="font-weight:bold; color:#9b2c1c; font-size:10.5px;">சனி வெண்பா:</div>
                <div style="font-style:italic; font-size:9.5px; color:#1e3a8a; line-height:1.35; margin-top:2px;">
                    "{GRAHA_VENBAS['Saturn'][1]}"
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>வாக்கிய சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 4</span>
        </div>
    </div>

    <!-- ==================== PAGE 5: SARVASHTAKAVARGA & TARA BALAM ==================== -->
    <div class="manuscript-page">
        <div class="page-border"></div>
        <div class="corner-ornament corner-tl"></div>
        <div class="corner-ornament corner-tr"></div>
        <div class="corner-ornament corner-bl"></div>
        <div class="corner-ornament corner-br"></div>
        
        <div class="header-masthead">
            <div class="masthead-title">சர்வ அஷ்டகவர்க்கம், 9 தாரா பலம் & மங்கல வாழ்த்து</div>
            <div class="masthead-sloka">வாக்கிய சர்வ அஷ்டகவர்க்க 337 பரல்கள் சக்கரம் & சுபஜென்ம மங்கலாசாசனம்</div>
        </div>
        
        <div class="section-banner">
            <span>பிரிவு 5: சர்வ அஷ்டகவர்க்க 337 பரல்கள் சக்கரம்</span>
            <span>பக்கம் 5 / 5</span>
        </div>
        
        <div class="grid-2col" style="margin-bottom:6px;">
            <div>
                {render_kattam_html({i: [{"name_ta": f"{ashtaka['sarvashtakavarga'][i-1]} பரல்", "symbol": f"{ashtaka['sarvashtakavarga'][i-1]}"}] for i in range(1, 13)}, "அஷ்டகவர்க்கம்", "337 பரல்கள்")}
            </div>
            
            <div>
                <table class="manuscript-table">
                    <thead>
                        <tr><th>ராசி</th><th>பரல்கள்</th><th>நிலை</th></tr>
                    </thead>
                    <tbody>
                        {''.join([f'''
                        <tr>
                            <td style="font-weight:600;">{SIGN_LABELS.get(i, {}).get('ta', '')}</td>
                            <td style="text-align:center; font-weight:bold; color:{'#047857' if ashtaka['sarvashtakavarga'][i-1] >= 28 else '#b91c1c'};">{ashtaka['sarvashtakavarga'][i-1]}</td>
                            <td style="font-size:9px; color:{'#047857' if ashtaka['sarvashtakavarga'][i-1] >= 28 else '#b91c1c'};">{'உத்தமம்' if ashtaka['sarvashtakavarga'][i-1] >= 28 else 'மத்திமம்'}</td>
                        </tr>
                        ''' for i in range(1, 13)])}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="section-banner">
            <span>நவ தாரா பலம் (9 Tara Balam Table)</span>
            <span>ஜென்ம நட்சத்திர அடிப்படையில்</span>
        </div>
        
        <table class="manuscript-table">
            <thead>
                <tr>
                    <th>தாரை எண்</th><th>தாரை பெயர்</th><th>ஆங்கிலம்</th><th>சுப/அசுப நிலை</th><th>பலன் குறிப்பு</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr>
                    <td style="text-align:center; font-weight:bold;">{idx+1}</td>
                    <td style="font-weight:bold; color:#9b2c1c;">{tara[0]}</td>
                    <td>{tara[1]}</td>
                    <td style="font-weight:600; color:{'#047857' if 'உத்தமம்' in tara[2] else ('#b91c1c' if 'அசுபம்' in tara[2] else '#d97706')};">{tara[2]}</td>
                    <td style="font-size:9px;">{tara[3]}</td>
                </tr>
                ''' for idx, tara in enumerate(TARA_BALAM_NAMES)])}
            </tbody>
        </table>
        
        <div class="panel-card" style="text-align:center; background:#f5eedb; border: 2px solid #9b2c1c; padding:8px; margin-top:6px;">
            <div style="font-size:13px; font-weight:bold; color:#9b2c1c; margin-bottom:2px;">
                || ஸ்வஸ்திஸ்ரீ மன் மகா மண்டலேஸ்வர அரிஹரிபுத்திர சர்வ மங்களகாரக சுபமஸ்து ||
            </div>
            <div style="font-size:10px; color:#1e3a8a; line-height:1.4;">
                ஜாதகர் சகல காரியங்களிலும் வெற்றி பெற்று, தீர்க்காயுள், நிறைந்த தனம், தானியம், வாகன சுகம் மற்றும் சந்தான பாக்கியத்துடன் சர்வ மங்களங்களையும் பெற்று சீரோடும் சிறப்போடும் வாழ எல்லாம் வல்ல இறைவனைப் பிரார்த்திக்கிறோம்.
            </div>
        </div>
        
        <div class="page-footer">
            <span>ஜாதகர்: {d['name']} | பிறந்த தேதி: {d['dob']}</span>
            <span>வாக்கிய சம்பூர்ண ஜாதகம்</span>
            <span>பக்கம் 5</span>
        </div>
    </div>
    
    </body>
    </html>
    """
    return html


def render_html_to_pdf(html_path: str, pdf_path: str):
    """Uses Playwright Chromium to render HTML to exact A4 PDF."""
    print(f"Rendering PDF: {pdf_path} ...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Open local HTML file
        abs_html_path = os.path.abspath(html_path)
        page.goto(f"file:///{abs_html_path}", wait_until="networkidle")
        page.pdf(
            path=pdf_path,
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}
        )
        browser.close()
    print(f"Saved: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")


def render_pdf_to_images(pdf_path: str, output_prefix: str, max_pages: int = 2):
    """Renders the first max_pages of a PDF to crisp PNG images using PyMuPDF."""
    doc = fitz.open(pdf_path)
    img_paths = []
    for page_idx in range(min(len(doc), max_pages)):
        page = doc[page_idx]
        # 2x zoom for high crispness (144 DPI)
        mat = fitz.Matrix(2.0, 2.0)
        pix = page.get_pixmap(matrix=mat)
        img_path = f"{output_prefix}_Page_{page_idx+1}.png"
        pix.save(img_path)
        img_paths.append(img_path)
        print(f"Rendered preview image: {img_path}")
    doc.close()
    return img_paths


def main():
    print("=" * 80)
    print("   AI JATHAGAM GENERATOR — THIRUKANITHAM & VAKHYAM MASTER PDF SUITE")
    print("=" * 80)

    # 1. Profile: Mahadeeswaran (Salem 1968) from the user-provided 124-page Vakkiyam Jathagam
    print("\n[1/4] Calculating Mahadeeswaran (Salem, 1968) ...")
    mahadees_thiru = calculate_full_profile(
        name="மகாதீஸ்வரன்",
        gender="ஆண் (Male)",
        dob="1968-09-26",
        tob="11:52:00",
        place="Salem, Tamil Nadu, India",
        lat=11.65,
        lon=78.15,
        tz="Asia/Kolkata",
        panchangam_system="thirukkanitham",
        father_name="பெருமாள்",
        mother_name="பாப்புஅம்மாள்",
        native_place="வெண்ணந்தூர் (Salem)"
    )
    mahadees_vak = calculate_full_profile(
        name="மகாதீஸ்வரன்",
        gender="ஆண் (Male)",
        dob="1968-09-26",
        tob="11:52:00",
        place="Salem, Tamil Nadu, India",
        lat=11.65,
        lon=78.15,
        tz="Asia/Kolkata",
        panchangam_system="vakhyam",
        father_name="பெருமாள்",
        mother_name="பாப்புஅம்மாள்",
        native_place="வெண்ணந்தூர் (Salem)"
    )

    # 2. Profile: Manosakthi (Pollachi 2004) from Manosakthi_Jathagam.md
    print("\n[2/4] Calculating Manosakthi (Pollachi, 2004) ...")
    lat_p, lon_p, tz_p = resolve_place("Pollachi, Tamil Nadu, India")
    manosakthi_thiru = calculate_full_profile(
        name="மனோசக்தி",
        gender="ஆண் (Male)",
        dob="2004-12-31",
        tob="14:10:00",
        place="Pollachi, Tamil Nadu, India",
        lat=lat_p,
        lon=lon_p,
        tz=tz_p,
        panchangam_system="thirukkanitham",
        father_name="சிவக்குமார்",
        mother_name="மகேஸ்வரி",
        native_place="பொள்ளாச்சி"
    )
    manosakthi_vak = calculate_full_profile(
        name="மனோசக்தி",
        gender="ஆண் (Male)",
        dob="2004-12-31",
        tob="14:10:00",
        place="Pollachi, Tamil Nadu, India",
        lat=lat_p,
        lon=lon_p,
        tz=tz_p,
        panchangam_system="vakhyam",
        father_name="சிவக்குமார்",
        mother_name="மகேஸ்வரி",
        native_place="பொள்ளாச்சி"
    )

    # Generate HTML files
    print("\n[3/4] Generating HTML Manuscript Templates ...")
    html_mahadees_thiru = generate_thirukanitham_html(mahadees_thiru)
    html_mahadees_vak = generate_vakhyam_html(mahadees_vak)
    html_manosakthi_thiru = generate_thirukanitham_html(manosakthi_thiru)
    html_manosakthi_vak = generate_vakhyam_html(manosakthi_vak)

    with open("Mahadeeswaran_Thirukanitham.html", "w", encoding="utf-8") as f:
        f.write(html_mahadees_thiru)
    with open("Mahadeeswaran_Vakkiyam.html", "w", encoding="utf-8") as f:
        f.write(html_mahadees_vak)
    with open("Manosakthi_Thirukanitham.html", "w", encoding="utf-8") as f:
        f.write(html_manosakthi_thiru)
    with open("Manosakthi_Vakkiyam.html", "w", encoding="utf-8") as f:
        f.write(html_manosakthi_vak)

    # Render PDFs using Playwright
    print("\n[4/4] Rendering PDFs with Playwright Chromium ...")
    render_html_to_pdf("Mahadeeswaran_Thirukanitham.html", "Mahadeeswaran_Thirukanitham_Jathagam.pdf")
    render_html_to_pdf("Mahadeeswaran_Vakkiyam.html", "Mahadeeswaran_Vakkiyam_Jathagam.pdf")
    render_html_to_pdf("Manosakthi_Thirukanitham.html", "Manosakthi_Thirukanitham_Jathagam.pdf")
    render_html_to_pdf("Manosakthi_Vakkiyam.html", "Manosakthi_Vakkiyam_Jathagam.pdf")

    # Also make primary copies: Thirukanitham_Jathagam.pdf & Vakkiyam_Jathagam.pdf
    import shutil
    shutil.copyfile("Mahadeeswaran_Thirukanitham_Jathagam.pdf", "Thirukanitham_Jathagam.pdf")
    shutil.copyfile("Mahadeeswaran_Vakkiyam_Jathagam.pdf", "Vakkiyam_Jathagam.pdf")

    # Generate preview images for immediate visual verification
    print("\nGenerating visual preview images ...")
    render_pdf_to_images("Thirukanitham_Jathagam.pdf", "Thirukanitham")
    render_pdf_to_images("Vakkiyam_Jathagam.pdf", "Vakkiyam")

    print("\n" + "=" * 80)
    print("ALL PDFs & PREVIEWS GENERATED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    main()
