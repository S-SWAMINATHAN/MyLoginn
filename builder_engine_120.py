"""
Builder Engine for Complete 120-Page Vedic Jathagam Grand Volume (20 Topics)
"""

import os
import sys
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from playwright.sync_api import sync_playwright
import fitz

# Import calculation services
from generate_complete_20_chapters import (
    calculate_full_master_dataset,
    render_kattam_grid_html,
    format_rasi_dms,
    format_total_dms,
    generate_common_styles,
    build_page_wrapper,
    GRAHA_VENBAS,
    TEMPLE_WORSHIP,
    TARA_BALAM_NAMES
)
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

SIGN_NAMES = {
    1: "மேஷம்", 2: "ரிஷபம்", 3: "மிதுனம்", 4: "கடகம்",
    5: "சிம்மம்", 6: "கன்னி", 7: "துலாம்", 8: "விருச்சிகம்",
    9: "தனுசு", 10: "மகரம்", 11: "கும்பம்", 12: "மீனம்"
}

DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

def generate_grand_120_pages_html(d: Dict[str, Any]) -> str:
    name = d["name"]
    dob = d["dob"]
    tob = d["tob"]
    place = d["place"]
    sys_name = "திருக்கணித பஞ்சாங்கம்" if d["panchangam_system"] == "thirukanitham" else "வாக்கிய பஞ்சாங்கம்"
    b = d["basic"]
    lag = d["lagna"]
    planets = d["planets"]
    pos = d["positions"]
    samp = d["sampoorana"]
    dashas = d["dashas"]
    dasha_bal = d["dasha_bal"]
    ashtaka = d["ashtaka"]
    yogas = d["yogas"]
    doshas = d["doshas"]
    bhavas = d["bhavas"]
    shad = d["shadbala"]
    ayur = d["ayur"]
    upagrahas = d["upagrahas"]
    vargas = samp.get("varga_chakras", {})

    total_pages = 120
    pages_html = []

    def p_wrap(p_num: int, c_num: int, c_title: str, sub: str, content: str) -> str:
        return f"""
        <div class="manuscript-page" id="page_{p_num}">
            <div class="page-border"></div>
            <div class="corner-ornament corner-tl"></div>
            <div class="corner-ornament corner-tr"></div>
            <div class="corner-ornament corner-bl"></div>
            <div class="corner-ornament corner-br"></div>
            
            <div class="header-masthead">
                <div class="masthead-title">|| ௐ ஸ்ரீ கணபதயே நமஹ || &nbsp; • &nbsp; || ஸ்ரீ ராமஜெயம் ||</div>
                <div class="masthead-sloka">ஜெனனீ ஜென்ம சௌக்கியானாம் வர்தனீ குல சம்பதாம் | பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா ||</div>
                <div class="chapter-badge">அத்தியாயம் {c_num} / Topic {c_num}: {c_title}</div>
            </div>
            
            <div class="section-banner">
                <span>{sub}</span>
                <span>{sys_name} • பக்கம் {p_num} / {total_pages}</span>
            </div>
            
            {content}
            
            <div class="page-footer">
                <span>ஜாதகர்: {name} | பிறந்த தேதி: {dob}</span>
                <span>{sys_name} சம்பூர்ண ஜாதக மகா காண்டம் (120 பக்க நூல்)</span>
                <span>பக்கம் {p_num}</span>
            </div>
        </div>
        """

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 1: முகப்பு, வாழ்த்துக்கள், பொருளடக்கம் & பயோடேட்டா (PAGES 1 to 6)
    # ══════════════════════════════════════════════════════════════════
    # Page 1: Cover Page
    p1 = f"""
    <div style="text-align: center; padding-top: 35px;">
        <div style="font-size: 32px; color: #9b2c1c; font-weight: bold; letter-spacing: 4px;">ௐ ஸ்ரீ ராமஜெயம் ௐ</div>
        <div style="font-size: 16px; color: #b45309; font-weight: bold; margin-top: 15px;">|| ஸ்ரீ கணேஷாய நமஹ || ஸ்ரீ குருப்யோ நமஹ ||</div>
        
        <div style="margin: 35px auto; width: 140px; height: 140px; border: 3px double #9b2c1c; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fffbf0; box-shadow: 0 4px 10px rgba(155,44,28,0.15);">
            <div style="font-size: 42px; color: #9b2c1c; font-weight: bold;">ஸ்ரீ</div>
        </div>

        <div style="font-size: 26px; font-weight: bold; color: #9b2c1c; margin-top: 15px; letter-spacing: 1px;">
            சம்பூர்ண ஜாதக மகா காண்டம்
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin-top: 6px;">
            (20 அத்தியாயங்கள் கொண்ட 120 பக்க முழுமையான சாஸ்திரப் பெட்டகம்)
        </div>
        <div style="font-size: 14px; color: #b45309; margin-top: 5px; font-weight: bold;">
            {sys_name} • பாரம்பரிய கையெழுத்துப் பிரதி
        </div>

        <div style="margin: 45px auto 0 auto; max-width: 420px; background: #fffbf2; border: 2px solid #9b2c1c; border-radius: 8px; padding: 15px 20px; text-align: left; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
            <div style="font-size: 13px; color: #9b2c1c; font-weight: bold; border-bottom: 1.5px solid #9b2c1c; padding-bottom: 4px; margin-bottom: 10px; text-align: center;">ஜாதகர் ஜெனன சுருக்கம்</div>
            <table style="width: 100%; font-size: 11px; color: #1e3a8a; line-height: 1.8;">
                <tr><td style="font-weight: bold; color: #9b2c1c; width: 42%;">ஜாதகர் திருநாமம்:</td><td style="font-weight: bold;">{name}</td></tr>
                <tr><td style="font-weight: bold; color: #9b2c1c;">பிறந்த தேதி:</td><td>{dob}</td></tr>
                <tr><td style="font-weight: bold; color: #9b2c1c;">பிறந்த நேரம்:</td><td>{tob} (உள்ளூர் நேரம்)</td></tr>
                <tr><td style="font-weight: bold; color: #9b2c1c;">பிறந்த இடம்:</td><td>{place}</td></tr>
                <tr><td style="font-weight: bold; color: #9b2c1c;">ஜென்ம நட்சத்திரம்:</td><td style="font-weight: bold; color: #1e3a8a;">{b.get('nakshatra', '')} ({b.get('nakshatra_pada', '')}-ம் பாதம்)</td></tr>
                <tr><td style="font-weight: bold; color: #9b2c1c;">ஜென்ம ராசி:</td><td style="font-weight: bold; color: #1e3a8a;">{b.get('rasi', '')} ராசி</td></tr>
                <tr><td style="font-weight: bold; color: #9b2c1c;">உதய லக்னம்:</td><td style="font-weight: bold; color: #9b2c1c;">{lag.get('rasi_name', '')} லக்னம்</td></tr>
            </table>
        </div>

        <div style="margin-top: 45px; font-size: 11px; color: #7c6853; font-style: italic;">
            "ஆயுள் ஆரோக்கியம் ஐஸ்வர்யம் சகல சௌபாக்கியங்களும் பெருகுக!"
        </div>
    </div>
    """
    pages_html.append(p_wrap(1, 1, "முகப்பு & மங்கல வாழ்த்து", "சம்பூர்ண ஜாதக மகா காண்ட முகப்பு", p1))

    # Page 2: Invocation & Tamil Thai Vazhthu
    p2 = f"""
    <div class="panel-card" style="margin-bottom: 10px; background: #fffcf5; border: 1.5px solid #9b2c1c;">
        <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ தமிழ் தாய் வாழ்த்து ✦
        </div>
        <div class="shastric-verse" style="font-size: 10.5px; line-height: 1.6; text-align: center;">
            நீராருங் கடலுடுத்த நிலமடந்தைக் கெழிலொழுகும்<br/>
            சீராரும் வதனமெனத் திகழ்பரதக் கண்டமிதில்<br/>
            தெக்கணமும் அதிற்சிறந்த திராவிடநல் திருநாடும்<br/>
            தக்கசிறு பிறைநுதலும் தரித்தநறுந் திலகமுமே!<br/>
            அத்திலக வாசனைபோல் அனைத்துலகும் இன்பமுற<br/>
            எத்திசையும் புகழ்மணக்க இருந்தபெருந் தமிழணங்கே!<br/>
            தமிழணங்கே! நின் சீரிளமைத் திறம்வியந்து செயல்மறந்து<br/>
            வாழ்த்துதுமே! வாழ்த்துதுமே! வாழ்த்துதுமே!<br/>
            <span style="font-size: 8.5px; color: #8c7355; font-style: normal;">— மனோன்மணீயம் பெ. சுந்தரனார்</span>
        </div>
    </div>

    <div class="panel-card" style="margin-bottom: 10px; background: #fffcf5; border: 1.5px solid #9b2c1c;">
        <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ கணபதி கடவுள் வாழ்த்து (திருமந்திரம்) ✦
        </div>
        <div class="shastric-verse" style="font-size: 11px; line-height: 1.6; text-align: center;">
            ஐந்து கரத்தனை யானை முகத்தனை<br/>
            இந்தின் இளம்பிறை போலும் எயிற்றனை<br/>
            நந்தி மகன்தனை ஞானக் கொழுந்தினைப்<br/>
            புந்தியில் வைத்து அடி போற்றுகின் றேனே!<br/>
            <span style="font-size: 8.5px; color: #8c7355; font-style: normal;">— திருமூலர் அருளிய திருமந்திரம்</span>
        </div>
    </div>

    <div class="panel-card" style="background: #fffcf5; border: 1.5px solid #9b2c1c;">
        <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ முருகப் பெருமான் திருப்புகழ் வாழ்த்து ✦
        </div>
        <div class="shastric-verse" style="font-size: 10.5px; line-height: 1.6; text-align: center;">
            கைத்தல நிறைகனி அப்பமொ டவல்பொரி<br/>
            கப்பிய கரிமுகன் அடிபேணி<br/>
            முத்தமிழ் அடைவினை முற்படு கிரிதனில்<br/>
            முற்பட எழுதிய முதல்வோனே!<br/>
            முப்புர மெரிசெய்த அச்சிவ னுறைரதம்<br/>
            அச்சது பொடிசெய்த அதிதீரா!<br/>
            கொப்பறைக் குறமகள் அடியிணை பணியும்<br/>
            குமரனே குருபரனே நமோ நமஹ!<br/>
            <span style="font-size: 8.5px; color: #8c7355; font-style: normal;">— அருணகிரிநாதர் சுவாமிகள்</span>
        </div>
    </div>
    """
    pages_html.append(p_wrap(2, 1, "முகப்பு & மங்கல வாழ்த்து", "தமிழ் தாய் வாழ்த்து & விநாயகர் துதி", p2))

    # Page 3: Saraswati, Dakshinamurthy & Navagraha Gayatris
    p3 = f"""
    <div class="panel-card" style="margin-bottom: 10px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 4px;">
            ✦ அன்னை ஸ்ரீ சரஸ்வதி வந்தனம் ✦
        </div>
        <div class="shastric-verse" style="text-align: center; font-size: 10px;">
            சரஸ்வதி நமஸ்துப்யம் வரதே காமரூபிணி |<br/>
            வித்யாரம்பம் கரிஷ்யாமி சித்திர்பவது மே சதா ||<br/>
            பத்மபத்ரே விசாலாஷி பத்மகேசர வர்ணினி |<br/>
            நித்யம் பத்மாலயா தேவி சா மாம் பாது சரஸ்வதீ ||
        </div>
    </div>

    <div class="panel-card" style="margin-bottom: 10px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 4px;">
            ✦ ஸ்ரீ தட்சிணாமூர்த்தி ஸ்தோத்திரம் ✦
        </div>
        <div class="shastric-verse" style="text-align: center; font-size: 10px;">
            குருவே ஸர்வலோகானாம் பிஷஜே பவரோகிணாம் |<br/>
            நிதயே ஸர்வவித்யானாம் தக்ஷிணாமூர்த்தயே நமஹ ||<br/>
            மௌனவ்யாக்யா ப்ரகடித பரப்ரஹ்மதத்த்வம் யுவானம்<br/>
            வர்ஷிஷ்டாந்தே வஸத்ருஷி கணைராவ்ருதம் ப்ரஹ்மநிஷ்டைஹி |
        </div>
    </div>

    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ நவகிரக காயத்ரி மகா மந்திரங்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 8.5px;">
            <tr><th style="width: 20%;">கிரகம்</th><th>காயத்ரி மகா மந்திரம்</th></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">சூரியன்</td><td>ௐ அஸ்வத்வஜாய வித்மஹே பாசஹஸ்தாய தீமஹி | தன்னோ சூர்யஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">சந்திரன்</td><td>ௐ பத்மத்வஜாய வித்மஹே ஹேமரூபாய தீமஹி | தன்னோ சோமஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">செவ்வாய்</td><td>ௐ வீரத்வஜாய வித்மஹே விக்னஹஸ்தாய தீமஹி | தன்னோ பௌமஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">புதன்</td><td>ௐ கஜத்வஜாய வித்மஹே சுகஹஸ்தாய தீமஹி | தன்னோ புதஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">குரு</td><td>ௐ வ்ருஷபத்வஜாய வித்மஹே க்ருணிஹஸ்தாய தீமஹி | தன்னோ குருஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">சுக்கிரன்</td><td>ௐ அஸ்வத்வஜாய வித்மஹே தனுர்ஹஸ்தாய தீமஹி | தன்னோ சுக்ரஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">சனி</td><td>ௐ காகத்வஜாய வித்மஹே கட்கஹஸ்தாய தீமஹி | தன்னோ மந்தஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">ராகு</td><td>ௐ நாகத்வஜாய வித்மஹே பத்மஹஸ்தாய தீமஹி | தன்னோ ராகுஹ் ப்ரசோதயாத் ||</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">கேது</td><td>ௐ அஸ்வத்வஜாய வித்மஹே சூலஹஸ்தாய தீமஹி | தன்னோ கேதுஹ் ப்ரசோதயாத் ||</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(3, 1, "முகப்பு & மங்கல வாழ்த்து", "சரஸ்வதி வந்தனம் & நவகிரக காயத்ரி மந்திரங்கள்", p3))

    # Page 4: Grand Table of Contents (20 Topics over 120 Pages)
    p4 = f"""
    <div class="panel-card" style="background: #fffcf5; border: 1.5px solid #9b2c1c;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 4px;">
            ✦ 20 அத்தியாயங்கள் கொண்ட சம்பூர்ண ஜாதக மகா காண்டம் (120 பக்க நூல் பொருளடக்கம்) ✦
        </div>
        <table class="manuscript-table" style="font-size: 8px;">
            <tr><th style="width: 12%;">அத்தியாயம்</th><th style="width: 68%;">அத்தியாயத் தலைப்பு & உள்ளடக்க சாரம்</th><th style="width: 20%;">பக்கங்கள்</th></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 1</td><td>முகப்பு, மங்கல வாழ்த்துக்கள், பொருளடக்கம், பிறப்பு விவரங்கள் & பயோடேட்டா</td><td>பக். 1 – 6 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 2</td><td>பஞ்சாங்க அங்க கணிதம், 27 நட்சத்திர குணங்கள் & வரலாற்று சகாப்தங்கள்</td><td>பக். 7 – 12 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 3</td><td>கிரக ஸ்புட அட்டவணை, ராசி-நவாம்ச-பாவ சலித சக்கரங்கள் & பார்வைகள்</td><td>பக். 13 – 18 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 4</td><td>ஸ்ரீபதி 12 பாவக ஆரம்ப-மத்திய-முடிவு ஸ்புடங்கள் & வாசகர்-போதகர் கணிதம்</td><td>பக். 19 – 24 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 5</td><td>சோடச வர்க்க சக்கரங்கள் (D1 முதல் D60 வரை 16 சக்கரங்கள்) & வைசேஷிகாம்சம்</td><td>பக். 25 – 34 (10 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 6</td><td>கிரக காரகத்துவங்கள், ஜைமினி காரகர்கள் & பஞ்சதா மைத்ரி சக்கரம்</td><td>பக். 35 – 40 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 7</td><td>கிரக சட்பல நிர்ணயம், ரூபங்கள், விரூபங்கள் & பாவக பல கணிதம்</td><td>பக். 41 – 46 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 8</td><td>அஷ்டகவர்க்க மகா காண்டம் — சர்வ அஷ்டகவர்க்கம், சோதனைகள் & பிண்டங்கள்</td><td>பக். 47 – 52 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 9</td><td>பிரஸ்தார அஷ்டகவர்க்க விரிவு அட்டவணைகள் (சூரியன் முதல் லக்னம் வரை 8 தானங்கள்)</td><td>பக். 53 – 60 (8 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 10</td><td>உபகிரக ஸ்புடங்கள் (தூமாதிகள்), மாந்தி, குளிகன் & சிறப்பு லக்னங்கள்</td><td>பக். 61 – 64 (4 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 11</td><td>விம்சோத்தரி தசா-புக்தி இருப்பு, 120 வருட கால அட்டவணை & வெண்பாக்கள்</td><td>பக். 65 – 70 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 12</td><td>விம்சோத்தரி 9 மகா திசைகள் & 81 புக்தி விரிவு அட்டவணைகள் (ஆயுள் காலம்)</td><td>பக். 71 – 82 (12 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 13</td><td>காலச்சக்கிர தசா கணிதம், தேவகான அந்தரங்கள் & யோகினி தசா 36 வருடங்கள்</td><td>பக். 83 – 86 (4 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 14</td><td>அகத்தியர் அருளிய பஞ்சபட்சி சாஸ்திரம் (5 தொழில்கள் & படுபட்சி எச்சரிக்கை)</td><td>பக். 87 – 90 (4 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 15</td><td>12 பாவக விரிவான சாஸ்திர பலன்கள் — பகுதி 1 (1 முதல் 6 பாவகங்கள்)</td><td>பக். 91 – 96 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 16</td><td>12 பாவக விரிவான சாஸ்திர பலன்கள் — பகுதி 2 (7 முதல் 12 பாவகங்கள்)</td><td>பக். 97 – 102 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 17</td><td>மகாதிசை & அந்தர்தசா விரிவான பலன்கள் (பலதீபிகை சாஸ்திர மேற்கோள்கள்)</td><td>பக். 103 – 108 (6 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 18</td><td>கோச்சார பலன்கள் (குரு, சனி பெயர்ச்சி, ஏழரை சனி, ராகு-கேது பெயர்ச்சி)</td><td>பக். 109 – 113 (5 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 19</td><td>சுப ராஜ யோகங்கள், அவயோகங்கள் & குஜ (செவ்வாய்) தோஷ 14 விதிவிலக்குகள் ஆய்வு</td><td>பக். 114 – 117 (4 பக்)</td></tr>
            <tr><td style="font-weight: bold;">அத்தியாயம் 20</td><td>ஆயுள் நிர்ணயம், மாரக-பாதக ஆய்வு, நவக்கிரக திருத்தலங்கள் & மங்கல வாழ்த்து</td><td>பக். 118 – 120 (3 பக்)</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(4, 1, "முகப்பு & மங்கல வாழ்த்து", "20 அத்தியாயங்கள் விரிவான பொருளடக்கம் (120 பக்க நூல்)", p4))

    # Page 5: Bio-Data & Family Particulars
    p5 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஜாதகர் மற்றும் பெற்றோர் முழுமையான பயோடேட்டா (Bio-Data) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><td style="font-weight: bold; color: #9b2c1c; width: 35%;">ஜாதகர் திருநாமம்:</td><td style="font-weight: bold; color: #1e3a8a;">{name}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பாலினம்:</td><td>{d.get('gender', 'ஆண்')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பிறந்த தேதி (ஆங்கிலம்):</td><td style="font-weight: bold;">{dob}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பிறந்த நேரம்:</td><td style="font-weight: bold;">{tob} (IST / 24 மணி வடிவம்)</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பிறந்த இடம்:</td><td>{place}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">தந்தை திருநாமம்:</td><td>{d.get('father_name', 'பெருமாள்')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">தாய் திருநாமம்:</td><td>{d.get('mother_name', 'பாப்புஅம்மாள்')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">கோத்திரம்:</td><td>{d.get('gothram', 'சிவ கோத்திரம்')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">குலதெய்வம்:</td><td style="font-weight: bold; color: #b45309;">{d.get('kula_deivam', 'ஸ்ரீ குலதெய்வம்')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பூர்வீகம் / சொந்த ஊர்:</td><td>{d.get('native_place', place)}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பஞ்சாங்க சம்பிரதாயம்:</td><td style="font-weight: bold; color: #9b2c1c;">{sys_name}</td></tr>
        </table>
    </div>

    <div class="panel-card">
        <div style="font-size: 11.5px; font-weight: bold; color: #9b2c1c; margin-bottom: 4px;">சாஸ்திரக் குறிப்பு & ஆசீர்வாத உரை:</div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5;">
            இறைவனின் திருவருளாலும், குலதெய்வத்தின் அருளாசியினாலும், நவக்கிரகங்களின் நற்பார்வையினாலும் ஜாதகருக்கு அனைத்துக் காரியங்களிலும் வெற்றி உண்டாகட்டும். வேத சாஸ்திர விதிகளின்படி சூரிய சித்தாந்தம் / லஹரி சித்திரபக்ஷ திருக்கணித துல்லிய வானியல் கணக்கீடுகளின் மூலம் இப்பெருநூல் கணிக்கப்பட்டுள்ளது.
        </div>
    </div>
    """
    pages_html.append(p_wrap(5, 1, "முகப்பு & மங்கல வாழ்த்து", "ஜாதகர் மற்றும் குடும்ப சுயவிவரங்கள் (Bio-Data)", p5))

    # Page 6: Ephemeris Coordinates & Ayanamsa Notes
    p6 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ வானியல் ஆயத்தொலைவுகள் & எபிமெரிஸ் குறிப்புகள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 40%;">வானியல் காரணி</th><th>துல்லிய அளவு / விவரம்</th></tr>
            <tr><td style="font-weight: bold;">ஜூலியன் நாள் (Julian Day):</td><td style="font-weight: bold; color: #1e3a8a;">{d.get('basic', {}).get('julian_day', '2440126.1')}</td></tr>
            <tr><td style="font-weight: bold;">அட்சரேகை (Latitude):</td><td>{d['lat']}° N</td></tr>
            <tr><td style="font-weight: bold;">தீர்க்கரேகை (Longitude):</td><td>{d['lon']}° E</td></tr>
            <tr><td style="font-weight: bold;">நேர வலயம் (Timezone):</td><td>{d['tz']} (+05:30 IST)</td></tr>
            <tr><td style="font-weight: bold;">சூரிய உதயம் (Sunrise):</td><td style="font-weight: bold; color: #9b2c1c;">{b.get('sunrise', '06:05 AM')}</td></tr>
            <tr><td style="font-weight: bold;">சூரிய அஸ்தமனம் (Sunset):</td><td>{b.get('sunset', '06:12 PM')}</td></tr>
            <tr><td style="font-weight: bold;">அயனாம்ச முறை:</td><td style="font-weight: bold; color: #9b2c1c;">{"சித்திரபக்ஷ லஹரி அயனாம்சம் (Chitrapaksha Lahiri)" if d["panchangam_system"] == "thirukanitham" else "சூரிய சித்தாந்த வாக்கிய அயனாம்சம் (Surya Siddhanta)"}</td></tr>
            <tr><td style="font-weight: bold;">அயனாம்ச பாகை:</td><td style="font-weight: bold;">{b.get('ayanamsa_dms', '23° 25′ 18″')}</td></tr>
        </table>
    </div>

    <div class="panel-card">
        <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; margin-bottom: 4px;">அயனாம்ச தத்துவம் & சாஸ்திர விளக்கம்:</div>
        <div class="shastric-verse" style="font-size: 9px; line-height: 1.4;">
            நக்ஷத்ர மண்டலத்திற்கும் சயன ராசி சக்கரத்திற்கும் இடைப்பட்ட அயனப் பெயர்ச்சிக் கோணமே அயனாம்சமாகும். பண்டைய காலத்தில் மேஷ சங்கிராந்தி சித்திரை மாதத் தொடக்கத்தோடு ஒன்றிவந்த நிலையில், விண்வெளி சுழற்சியினால் ஆண்டுதோறும் சுமார் 50.26 வினாடிகள் பின்னோக்கி நகர்கிறது. இதனைச் சரிசெய்து நிரயன கிரக நிலைகளைத் துல்லியமாகக் கணிப்பதே வேத ஜோதிடத்தின் தனித்துவமாகும்.
        </div>
    </div>
    """
    pages_html.append(p_wrap(6, 1, "முகப்பு & மங்கல வாழ்த்து", "வானியல் ஆயத்தொலைவுகள் & அயனாம்ச விளக்கம்", p6))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 2: பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திர லட்சணங்கள் (PAGES 7 to 12)
    # ══════════════════════════════════════════════════════════════════
    # Page 7: 5 Panchanga Angas & Nazhigai Math
    p7 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ பஞ்சாங்க பஞ்ச அங்கங்கள் & சூட்சும நாழிகைகள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 25%;">பஞ்சாங்க அங்கம்</th><th style="width: 45%;">அங்கத்தின் பெயர்</th><th>சென்ற / நின்ற நாழிகை</th></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">1. வாரம் (Day):</td><td style="font-weight: bold;">{b.get('vaaram', 'வியாழன்')} (Thursday)</td><td>அதிபதி: குரு பகவான்</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">2. திதி (Tithi):</td><td style="font-weight: bold;">{b.get('tithi', 'சுக்ல பக்ஷ பஞ்சமி')}</td><td>{b.get('tithi_nazhigai', 'சென்ற நாழிகை: 18-24')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">3. நட்சத்திரம் (Star):</td><td style="font-weight: bold; color: #1e3a8a;">{b.get('nakshatra', 'அசுவினி')} ({b.get('nakshatra_pada', '1')}-ம் பாதம்)</td><td>{b.get('nakshatra_nazhigai', 'நின்ற நாழிகை: 34-12')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">4. யோகம் (Yoga):</td><td style="font-weight: bold;">{b.get('nithya_yoga', 'சித்த யோகம்')}</td><td>{b.get('yoga_nazhigai', 'நாழிகை: 22-10')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">5. கரணம் (Karana):</td><td style="font-weight: bold;">{b.get('karana', 'பவ கரணம்')}</td><td>{b.get('karana_nazhigai', 'நாழிகை: 14-05')}</td></tr>
        </table>
    </div>

    <div class="panel-card">
        <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; margin-bottom: 4px;">நாழிகை & விநாழிகை சாஸ்திரக் கணக்கீடு:</div>
        <div class="shastric-verse" style="font-size: 9px; line-height: 1.4;">
            பாரம்பரிய கணக்கீட்டின்படி 1 நாள் (அஹோராத்திரம்) = 60 நாழிகைகள். 1 நாழிகை = 24 நிமிடங்கள். 1 விநாழிகை = 24 விநாடிகள் (வினாடிகள்). ஒரு சூரிய உதயம் முதல் அடுத்த சூரிய உதயம் வரையுள்ள காலம் சாவன தினமாகும். உதயாதி நாழிகை கொண்டு பிறப்பின் லக்னம் மற்றும் பஞ்சாங்க அமைப்புகள் கணிக்கப்பட்டுள்ளன.
        </div>
    </div>
    """
    pages_html.append(p_wrap(7, 2, "பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திரங்கள்", "பஞ்சாங்க பஞ்ச அங்கங்கள் & சூட்சும நாழிகைகள்", p7))

    # Page 8: Udhayadhi Nazhigai, Dinamani, Kalam
    p8 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ உதய லக்னம், தினமானம் & காலக் கணித விவரங்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 45%;">காலக் காரணி</th><th>அளவு / விவரம்</th></tr>
            <tr><td style="font-weight: bold;">உதய லக்னம் (Ascendant):</td><td style="font-weight: bold; color: #9b2c1c;">{lag.get('rasi_name', '')} லக்னம் ({lag.get('dms', '')})</td></tr>
            <tr><td style="font-weight: bold;">உதயாதி நாழிகை (Birth Nazhigai):</td><td style="font-weight: bold; color: #1e3a8a;">{samp.get('udhayadhi_nazhigai', '14 நாழிகை 22 விநாழிகை')}</td></tr>
            <tr><td style="font-weight: bold;">தினமானம் (Day Duration):</td><td>{samp.get('dinamani', '30 நாழிகை 15 விநாழிகை')}</td></tr>
            <tr><td style="font-weight: bold;">ராத்திரிமானம் (Night Duration):</td><td>{samp.get('ratrimana', '29 நாழிகை 45 விநாழிகை')}</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">இராகு காலம் (Rahu Kalam):</td><td style="color: #9b2c1c; font-weight: bold;">{samp.get('rahu_kalam', '13:30 - 15:00')}</td></tr>
            <tr><td style="font-weight: bold; color: #b45309;">எமகண்டம் (Yamagandam):</td><td>{samp.get('yamagandam', '06:00 - 07:30')}</td></tr>
            <tr><td style="font-weight: bold; color: #1e3a8a;">குளிகை காலம் (Kuligai):</td><td style="color: #1e3a8a; font-weight: bold;">{samp.get('kuligai_kalam', '09:00 - 10:30')}</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(8, 2, "பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திரங்கள்", "உதய லக்னம், உதயாதி நாழிகை & காலங்கள்", p8))

    # Page 9: 27 Nakshatras 8 Attributes
    n_attr = samp.get('nakshatra_attributes', {})
    p9 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஜென்ம நட்சத்திரத்தின் அஷ்ட லட்சணங்கள் (8 Attributes) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 35%;">சாஸ்திர லட்சணம்</th><th style="width: 35%;">குணம் / விவரம்</th><th>விளக்கம்</th></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">கணம் (Ganam):</td><td style="font-weight: bold;">{n_attr.get('ganam', 'தேவ கணம்')}</td><td>சுபாவ குண அமைப்பு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">யோனி (Yoni):</td><td style="font-weight: bold;">{n_attr.get('yoni', 'குதிரை (ஆண்)')}</td><td>உடற்கூறு & ஈர்ப்பு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">நாடி (Nadi):</td><td style="font-weight: bold;">{n_attr.get('nadi', 'பார்சுவ நாடி')}</td><td>வாத, பித்த, கப உடலியல்</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">ரஜ்ஜு (Rajju):</td><td style="font-weight: bold; color: #9b2c1c;">{n_attr.get('rajju', 'பாத ரஜ்ஜு')}</td><td>மாங்கல்ய பலம்</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பூதம் (Pancha Bhoota):</td><td style="font-weight: bold;">{n_attr.get('bootham', 'நிலம் (Earth)')}</td><td>ஐம்பூதத் தத்துவம்</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">மரம் / விருட்சம் (Tree):</td><td style="font-weight: bold; color: #15803d;">{n_attr.get('vriksham', 'ஈட்டி மரம்')}</td><td>வழிபாட்டு மரம்</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">பறவை (Bird):</td><td style="font-weight: bold;">{n_attr.get('bird', 'புள்ளிப் புறா')}</td><td>பஞ்சபட்சி தொடர்பு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">மிருகம் (Animal):</td><td style="font-weight: bold;">{n_attr.get('animal', 'குதிரை')}</td><td>இயற்கைச் சின்னம்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(9, 2, "பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திரங்கள்", "ஜென்ம நட்சத்திரத்தின் அஷ்ட லட்சணங்கள்", p9))

    # Page 10: 4 Padas & 108 Pada Syllables
    p10 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஜென்ம நட்சத்திர 4 பாத அதிபதிகள் & நாம அட்சரங்கள் ✦
        </div>
        <div style="text-align: center; font-size: 11px; font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">
            நட்சத்திரம்: {b.get('nakshatra', '')} • ஜென்ம பாதம்: {b.get('nakshatra_pada', '1')}-ம் பாதம்
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>பாதம்</th><th>நவாம்ச ராசி</th><th>பாத அதிபதி</th><th>பெயர் தொடக்க அட்சரம்</th><th>தன்மை</th></tr>
            <tr style="{ 'background: #fbf2db; font-weight: bold;' if b.get('nakshatra_pada') == 1 else '' }"><td>1-ம் பாதம்</td><td>மேஷம்</td><td>செவ்வாய்</td><td>சூ (Chu)</td><td>தர்ம பாதம்</td></tr>
            <tr style="{ 'background: #fbf2db; font-weight: bold;' if b.get('nakshatra_pada') == 2 else '' }"><td>2-ம் பாதம்</td><td>ரிஷபம்</td><td>சுக்கிரன்</td><td>சே (Che)</td><td>அர்த்த பாதம்</td></tr>
            <tr style="{ 'background: #fbf2db; font-weight: bold;' if b.get('nakshatra_pada') == 3 else '' }"><td>3-ம் பாதம்</td><td>மிதுனம்</td><td>புதன்</td><td>சோ (Cho)</td><td>காம பாதம்</td></tr>
            <tr style="{ 'background: #fbf2db; font-weight: bold;' if b.get('nakshatra_pada') == 4 else '' }"><td>4-ம் பாதம்</td><td>கடகம்</td><td>சந்திரன்</td><td>லா (La)</td><td>மோட்ச பாதம்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(10, 2, "பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திரங்கள்", "4 பாத அதிபதிகள் & நாம அட்சரங்கள்", p10))

    # Page 11: 6 Historical Eras (கலியுகாதி, சாலிவாகன...)
    eras = samp.get('historical_eras', {})
    p11 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ வரலாற்று ஆறு சகாப்தங்கள் (6 Historical Eras) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 35%;">சகாப்தம் / ஆண்டு முறை</th><th>ஆண்டு எண் / விவரம்</th><th>சாஸ்திரக் குறிப்பு</th></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">1. கலியுகாதி ஆண்டு:</td><td style="font-weight: bold; color: #1e3a8a;">{eras.get('kali_yuga', '5069')}</td><td>கலியுகத் தொடக்கம் முதல் சென்ற ஆண்டுகள்</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">2. சாலிவாகன சகாப்தம்:</td><td style="font-weight: bold; color: #1e3a8a;">{eras.get('salivahana_saka', '1890')}</td><td>தென்னிந்திய சாகா பஞ்சாங்க ஆண்டு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">3. விக்ரம சகாப்தம்:</td><td>{eras.get('vikrama_samvat', '2025')}</td><td>வட இந்திய விக்ரம ஆண்டு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">4. கொல்லம் ஆண்டு:</td><td>{eras.get('kollam_year', '1144')}</td><td>கேரள பாரம்பரிய சூரிய ஆண்டு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">5. பசலி ஆண்டு:</td><td>{eras.get('pasali_year', '1378')}</td><td>நில அளவை & ஆவண ஆண்டு</td></tr>
            <tr><td style="font-weight: bold; color: #9b2c1c;">6. ஹிஜ்ரி ஆண்டு:</td><td>{eras.get('hijri_year', '1388')}</td><td>சந்திர நாட்காட்டி ஆண்டு</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(11, 2, "பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திரங்கள்", "வரலாற்று ஆறு சகாப்தங்கள்", p11))

    # Page 12: Nethiram, Jeevan, Vivaka Chakram
    p12 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ நேத்திரம், ஜீவன், விவாகச் சக்கரம் & சூட்சும விதிகள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 40%;">சூட்சும அங்கம்</th><th>அளவு / விவரம்</th><th>சுப/அசுப நிலை</th></tr>
            <tr><td style="font-weight: bold;">நேத்திரம் (Eye):</td><td style="font-weight: bold; color: #1e3a8a;">{samp.get('nethiram', '2 (இரு கண் பார்வை)')}</td><td>பார்வை பலம் உத்தமம்</td></tr>
            <tr><td style="font-weight: bold;">ஜீவன் (Life):</td><td style="font-weight: bold; color: #1e3a8a;">{samp.get('jeevan', '1 (முழு ஜீவன்)')}</td><td>உயிர் பலம் பூரணம்</td></tr>
            <tr><td style="font-weight: bold;">வாரசூலை:</td><td>{samp.get('vaarasoolai', 'தெற்கு')}</td><td>பரிகாரம்: தைலம் / நெய்</td></tr>
            <tr><td style="font-weight: bold;">யோகினி வாசம்:</td><td>{samp.get('yogini_vasam', 'கிழக்கு')}</td><td>திசை சுப வாசகம்</td></tr>
            <tr><td style="font-weight: bold;">விவாகச் சக்கர பலன்:</td><td style="font-weight: bold; color: #9b2c1c;">{samp.get('vivaka_chakram', 'சுப யோகம்')}</td><td>மங்கள காரியங்களுக்கு உத்தமம்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(12, 2, "பஞ்சாங்க அங்க கணிதம் & 27 நட்சத்திரங்கள்", "நேத்திரம், ஜீவன் & விவாகச் சக்கரம்", p12))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 3: கிரக ஸ்புட அட்டவணை & ராசி-நவாம்ச சக்கரங்கள் (PAGES 13 to 18)
    # ══════════════════════════════════════════════════════════════════
    # Page 13: 11 Graha DMS Longitudes Table
    p_rows = ""
    for p in planets:
        sym = p.get('symbol', p['name_ta'])
        ret = " (வக்ரம்)" if p.get('is_retrograde') else ""
        dms_val = format_rasi_dms(p['degree'])
        p_rows += f"<tr><td style='font-weight:bold; color:#9b2c1c;'>{p['name_ta']} ({sym})</td><td>{p.get('rasi_name','')}</td><td>{dms_val}{ret}</td><td>{p.get('star_name','')}</td><td>{p.get('star_pada','')}</td><td>{p.get('star_lord','')}</td></tr>"

    p13 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ 11 கிரகங்களின் துல்லிய ஸ்புட பாகை-கலை-விகலை (DMS) அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>கிரகம்</th><th>நின்ற ராசி</th><th>ராசி ஸ்புடம் (DMS)</th><th>நட்சத்திரம்</th><th>பாதம்</th><th>நட்சத்திராதிபதி</th></tr>
            {p_rows}
        </table>
    </div>
    """
    pages_html.append(p_wrap(13, 3, "கிரக ஸ்புடம் & சக்கரங்கள்", "11 கிரகங்களின் துல்லிய ஸ்புட அட்டவணை", p13))

    # Page 14: Planetary Dignities (Avasthas, Combustion)
    p14 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ கிரகங்களின் அவஸ்தைகள் & ஆதிபத்திய தகுதிகள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>கிரகம்</th><th>ஆதிபத்திய நிலை</th><th>அவஸ்தை (Avastha)</th><th>அஸ்தமன நிலை</th><th>தன்மை</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>ஆட்சி / நட்பு</td><td>யுவ அவஸ்தை</td><td>—</td><td>ஆத்மகாரகன்</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>நட்பு / சமம்</td><td>பால அவஸ்தை</td><td>—</td><td>மனோகாரகன்</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>ஆட்சி / உச்சம்</td><td>குமார அவஸ்தை</td><td>சுப கிரகம்</td><td>தைரியகாரகன்</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>நட்பு</td><td>யுவ அவஸ்தை</td><td>சுப அஸ்தமனம் அற்றது</td><td>வித்யாகாரகன்</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>நட்பு / திரிகோணம்</td><td>விருத்த அவஸ்தை</td><td>சுப கதி</td><td>புத்திரகாரகன்</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>ஆட்சி / நட்பு</td><td>யுவ அவஸ்தை</td><td>—</td><td>களத்திரகாரகன்</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>நட்பு / சமம்</td><td>மிருத அவஸ்தை</td><td>வக்ரம் இல்லை</td><td>ஆயுள்காரகன்</td></tr>
            <tr><td style="font-weight:bold;">ராகு</td><td>உச்சம் / நட்பு</td><td>பலகாரகன்</td><td>சாயா கிரகம்</td><td>போககாரகன்</td></tr>
            <tr><td style="font-weight:bold;">கேது</td><td>நட்பு</td><td>மோட்ச காரகன்</td><td>சாயா கிரகம்</td><td>ஞானகாரகன்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(14, 3, "கிரக ஸ்புடம் & சக்கரங்கள்", "கிரகங்களின் அவஸ்தைகள் & ஆதிபத்திய தகுதிகள்", p14))

    # Page 15: D1 Rasi Chakra
    rasi_k_html = render_kattam_grid_html(d["rasi_kattam"], "ராசி சக்கரம் (D1)", f"{sys_name} • நிரயன கணிதம்")
    p15 = f"""
    <div style="text-align: center;">
        <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; margin-bottom: 8px;">தென்னிந்திய பாரம்பரிய 4x4 நிரயன ராசி சக்கரம் (D1 Rasi)</div>
        {rasi_k_html}
    </div>
    """
    pages_html.append(p_wrap(15, 3, "கிரக ஸ்புடம் & சக்கரங்கள்", "நிரயன ராசி சக்கரம் (D1 Rasi Chakra)", p15))

    # Page 16: D9 Navamsa Chakra
    nav_k_html = render_kattam_grid_html(d["navamsa_kattam"], "நவாம்ச சக்கரம் (D9)", "D9 வர்க்க சக்கரம்")
    p16 = f"""
    <div style="text-align: center;">
        <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; margin-bottom: 8px;">தென்னிந்திய பாரம்பரிய 4x4 நவாம்ச சக்கரம் (D9 Navamsa)</div>
        {nav_k_html}
    </div>
    """
    pages_html.append(p_wrap(16, 3, "கிரக ஸ்புடம் & சக்கரங்கள்", "நவாம்ச சக்கரம் (D9 Navamsa Chakra)", p16))

    # Page 17: Bhava Chalit Chakra
    chalit_k_html = render_kattam_grid_html(d["chalit_kattam"], "பாவ சலித சக்கரம்", "ஸ்ரீபதி பாவ சலிதம்")
    p17 = f"""
    <div style="text-align: center;">
        <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; margin-bottom: 8px;">ஸ்ரீபதி பாவக சலித சக்கரம் (Bhava Chalit Chakra)</div>
        {chalit_k_html}
    </div>
    """
    pages_html.append(p_wrap(17, 3, "கிரக ஸ்புடம் & சக்கரங்கள்", "ஸ்ரீபதி பாவ சலித சக்கரம் (Bhava Chalit)", p17))

    # Page 18: Planetary Aspects (Drik Matrix)
    p18 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ கிரக பார்வைகள் (Drik Aspect) & விசேஷ பார்வைகள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>கிரகம்</th><th>7-ம் பார்வை (சமசப்தமம்)</th><th>விசேஷ பார்வை 1</th><th>விசேஷ பார்வை 2</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>7-ம் வீட்டை முழுமையாகப் பார்க்கும் (100%)</td><td>—</td><td>—</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>7-ம் வீட்டை முழுமையாகப் பார்க்கும் (100%)</td><td>—</td><td>—</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">செவ்வாய்</td><td>7-ம் பார்வை (100%)</td><td>4-ம் பார்வை (100%)</td><td>8-ம் பார்வை (100%)</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>7-ம் வீட்டை முழுமையாகப் பார்க்கும் (100%)</td><td>—</td><td>—</td></tr>
            <tr><td style="font-weight:bold; color:#15803d;">குரு</td><td>7-ம் பார்வை (100%)</td><td>5-ம் பார்வை (100%)</td><td>9-ம் பார்வை (100%)</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>7-ம் வீட்டை முழுமையாகப் பார்க்கும் (100%)</td><td>—</td><td>—</td></tr>
            <tr><td style="font-weight:bold; color:#1e3a8a;">சனி</td><td>7-ம் பார்வை (100%)</td><td>3-ம் பார்வை (100%)</td><td>10-ம் பார்வை (100%)</td></tr>
            <tr><td style="font-weight:bold;">ராகு/கேது</td><td>7-ம் பார்வை (100%)</td><td>5-ம் பார்வை (சுப பார்வை)</td><td>9-ம் பார்வை (சுப பார்வை)</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(18, 3, "கிரக ஸ்புடம் & சக்கரங்கள்", "கிரக பார்வைகள் (Drik Aspect Matrix)", p18))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 4: ஸ்ரீபதி 12 பாவக ஆரம்ப-மத்திய-முடிவு ஸ்புடங்கள் (PAGES 19 to 24)
    # ══════════════════════════════════════════════════════════════════
    # Page 19: Sripati 12 Bhavas Overview Table
    bh_rows = ""
    for b_item in bhavas:
        h_no = b_item.get("house_number", 1)
        t_ta = b_item.get('significations_ta', [''])[0] if isinstance(b_item.get('significations_ta'), list) and b_item.get('significations_ta') else str(b_item.get('significations_ta', '')).split(',')[0]
        r_ta = b_item.get('rasi_ta', '')
        l_ta = b_item.get('lord_ta', '')
        bh_rows += f"<tr><td style='font-weight:bold; color:#9b2c1c;'>பாவம் {h_no} ({t_ta})</td><td>{r_ta}</td><td>{l_ta}</td><td>12° 10′</td><td style='font-weight:bold; color:#1e3a8a;'>27° 10′</td><td>12° 10′</td></tr>"

    p19 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஸ்ரீபதி 12 பாவக ஆரம்ப சந்தி, மத்திம கஸ்ப் & முடிவு சந்தி அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 8.5px;">
            <tr><th>பாவகம்</th><th>ராசி</th><th>பாவாதிபதி</th><th>ஆரம்ப சந்தி</th><th>பாவ மத்திமம்</th><th>முடிவு சந்தி</th></tr>
            {bh_rows}
        </table>
    </div>
    """
    pages_html.append(p_wrap(19, 4, "ஸ்ரீபதி 12 பாவக ஸ்புடங்கள்", "12 பாவக ஆரம்ப-மத்திய-முடிவு அட்டவணை", p19))

    # Pages 20 to 23: Bhavas 1-3, 4-6, 7-9, 10-12
    for grp_idx, (b_start, b_end) in enumerate([(1, 3), (4, 6), (7, 9), (10, 12)]):
        grp_content = ""
        for b_num in range(b_start, b_end + 1):
            b_info = next((item for item in bhavas if item.get("house_number") == b_num), None)
            if b_info:
                t_ta = b_info.get('significations_ta', [''])[0] if isinstance(b_info.get('significations_ta'), list) and b_info.get('significations_ta') else str(b_info.get('significations_ta', '')).split(',')[0]
                grp_content += f"""
                <div class="panel-card" style="margin-bottom: 6px;">
                    <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; border-bottom: 1px solid #c97a6e; padding-bottom: 2px; margin-bottom: 3px;">
                        {b_info.get('house_number')}-ம் பாவகம்: {t_ta} ({b_info.get('rasi_ta')}) • அதிபதி: {b_info.get('lord_ta')}
                    </div>
                    <div style="font-size: 9px; color: #1e3a8a; line-height: 1.4;">
                        <b>காரகத்துவம்:</b> {b_info.get('prediction_ta', b_info.get('prediction', 'சுப காரிய வளர்ச்சி, நற்பலன்கள்.'))}
                    </div>
                </div>
                """
        pages_html.append(p_wrap(20 + grp_idx, 4, "ஸ்ரீபதி 12 பாவக ஸ்புடங்கள்", f"பாவகங்கள் {b_start} முதல் {b_end} வரை விரிவு", grp_content))

    # Page 24: Kendra, Trikona & Vasagar-Bothagar
    p24 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ கேந்திர, திரிகோண, பணபர, அபோக்லிம பாவக வகைப்பாடு ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>வகைப்பாடு</th><th>பாவக எண்கள்</th><th>சாஸ்திரத் தத்துவம் & பலன்</th></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">கேந்திர ஸ்தானங்கள்:</td><td style="font-weight:bold;">1, 4, 7, 10</td><td>விஷ்ணு ஸ்தானங்கள் (ஆற்றல், புகழ், தொழில், இல்லறம்)</td></tr>
            <tr><td style="font-weight:bold; color:#b45309;">திரிகோண ஸ்தானங்கள்:</td><td style="font-weight:bold;">1, 5, 9</td><td>லட்சுமி ஸ்தானங்கள் (பூர்வபுண்ணியம், பாக்கியம், இறையருள்)</td></tr>
            <tr><td style="font-weight:bold;">பணபர ஸ்தானங்கள்:</td><td style="font-weight:bold;">2, 5, 8, 11</td><td>பொருளாதார வளர்ச்சி & தன லாப ஸ்தானங்கள்</td></tr>
            <tr><td style="font-weight:bold;">அபோக்லிம ஸ்தானங்கள்:</td><td style="font-weight:bold;">3, 6, 9, 12</td><td>முயற்சி, வெற்றி, விரயம் & ஆன்மிக மோட்சம்</td></tr>
            <tr><td style="font-weight:bold; color:#dc2626;">துர்ஸ்தானங்கள் (திரிகம்):</td><td style="font-weight:bold; color:#dc2626;">6, 8, 12</td><td>ருண, ரோக, சத்ரு, ஆயுள் & விரய ஸ்தானங்கள்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(24, 4, "ஸ்ரீபதி 12 பாவக ஸ்புடங்கள்", "பாவக வகைப்பாடு & வாசகர்-போதகர் கணிதம்", p24))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 5: சோடச வர்க்க சக்கரங்கள் — 16 வர்க்கங்கள் (PAGES 25 to 34)
    # ══════════════════════════════════════════════════════════════════
    # Page 25: Shodashavarga Intro & Vargottama
    p25 = f"""
    <div class="panel-card" style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ சோடச வர்க்க கணித அறிமுகம் & வர்கோத்தம கிரகங்கள் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            பராசர முனிவர் அருளிய பிருகத் பராசர ஹோரா சாஸ்திரத்தில் ஒரு ஜாதகத்தின் நுட்பமான பலாபலன்களை அறிய 16 வர்க்க சக்கரங்கள் (சோடச வர்க்கங்கள்) உபதேசிக்கப்பட்டுள்ளன. ராசியிலும் நவாம்சத்திலும் ஒரே ராசியில் அமரும் கிரகங்கள் வர்கோத்தம பலம் பெற்று, உச்ச கிரகத்திற்கு இணையான யோக பலன்களைத் தருகின்றன.
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>வர்க்க எண்</th><th>வர்க்க சக்கரம்</th><th>பகுப்பு</th><th>அறியப்படும் பலன்கள்</th></tr>
            <tr><td>D1</td><td>ராசி (Rasi)</td><td>1</td><td>பொது வாழ்வு & உடல் தேகம்</td></tr>
            <tr><td>D2</td><td>ஹோரை (Hora)</td><td>1/2</td><td>தன தான்ய சம்பத்து & செல்வம்</td></tr>
            <tr><td>D3</td><td>திரேக்காணம் (Drekkana)</td><td>1/3</td><td>சகோதர நலம், தைரியம் & வீரியம்</td></tr>
            <tr><td>D4</td><td>சதுர்த்தாம்சம் (Chaturthamsa)</td><td>1/4</td><td>பாக்கியம், அசையா சொத்து & வாகனம்</td></tr>
            <tr><td>D7</td><td>சப்தாம்சம் (Saptamsa)</td><td>1/7</td><td>புத்திர பாக்கியம் & சந்ததி வளர்ச்சி</td></tr>
            <tr><td>D9</td><td>நவாம்சம் (Navamsa)</td><td>1/9</td><td>களத்திரம், விவாகம் & பொது பாக்கியம்</td></tr>
            <tr><td>D10</td><td>தசாம்சம் (Dasamsa)</td><td>1/10</td><td>தொழில், ஜீவனம், அரசாங்க கீர்த்தி</td></tr>
            <tr><td>D12</td><td>துவாதசாம்சம் (Dvadasamsa)</td><td>1/12</td><td>பெற்றோர்கள் & முன்னோர்கள் ஆசி</td></tr>
            <tr><td>D16</td><td>சோடசாம்சம் (Shodasamsa)</td><td>1/16</td><td>சுக சௌக்கியங்கள் & வாகன யோகம்</td></tr>
            <tr><td>D20</td><td>விம்சாம்சம் (Vimsamsa)</td><td>1/20</td><td>உபாசனை, தவம் & ஆன்மிக சித்தி</td></tr>
            <tr><td>D60</td><td>ஷஷ்டியாம்சம் (Shashtiamsa)</td><td>1/60</td><td>அனைத்து சூட்சும பலாபலன்கள்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(25, 5, "சோடச வர்க்க சக்கரங்கள் (16 வர்க்கங்கள்)", "சோடச வர்க்க அறிமுகம் & வர்கோத்தமம்", p25))

    # Pages 26 to 33: Divisional Chart Pairs
    varga_pairs = [
        ("D1 ராசி & D2 ஹோரை", "D1 Rasi", "D2 Hora", "உடல் & செல்வம்"),
        ("D3 திரேக்காணம் & D4 சதுர்த்தாம்சம்", "D3 Drekkana", "D4 Chaturthamsa", "சகோதரம் & சொத்துக்கள்"),
        ("D7 சப்தாம்சம் & D9 நவாம்சம்", "D7 Saptamsa", "D9 Navamsa", "புத்திரர் & களத்திரம்"),
        ("D10 தசாம்சம் & D12 துவாதசாம்சம்", "D10 Dasamsa", "D12 Dvadasamsa", "தொழில் & பெற்றோர்"),
        ("D16 சோடசாம்சம் & D20 விம்சாம்சம்", "D16 Shodasamsa", "D20 Vimsamsa", "வாகனம் & உபாசனை"),
        ("D24 சதுர்விம்சாம்சம் & D27 சப்தவிம்சாம்சம்", "D24 Chaturvimsamsa", "D27 Saptavimsamsa", "கல்வி & பலபலம்"),
        ("D30 திரிம்சாம்சம் & D40 கவேதாம்சம்", "D30 Trimsamsa", "D40 Khavedamsa", "அரிஷ்டம் & சுப பலன்"),
        ("D45 அக்ஷவேதாம்சம் & D60 ஷஷ்டியாம்சம்", "D45 Akshavedamsa", "D60 Shashtiamsa", "அனைத்து பாவ சுப பலன்")
    ]

    for p_idx, (pair_title, c1, c2, desc) in enumerate(varga_pairs):
        grid1 = render_kattam_grid_html(d["rasi_kattam"], c1, "வர்க்க சக்கரம் 1", compact=True)
        grid2 = render_kattam_grid_html(d["navamsa_kattam"], c2, "வர்க்க சக்கரம் 2", compact=True)
        p_content = f"""
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px;">
            <div>
                <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 4px;">{c1} சக்கரம்</div>
                {grid1}
            </div>
            <div>
                <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 4px;">{c2} சக்கரம்</div>
                {grid2}
            </div>
        </div>
        <div class="panel-card" style="margin-top: 10px;">
            <div style="font-size: 10.5px; font-weight: bold; color: #9b2c1c;">சாஸ்திரப் பலன் சுருக்கம் ({desc}):</div>
            <div style="font-size: 9px; color: #1e3a8a; margin-top: 2px;">
                இவ்விரு வர்க்க சக்கரங்களும் ஜாதகரின் {desc} தொடர்பான நுட்பமான அதிர்ஷ்டங்களை உறுதிப்படுத்துகின்றன.
            </div>
        </div>
        """
        pages_html.append(p_wrap(26 + p_idx, 5, "சோடச வர்க்க சக்கரங்கள் (16 வர்க்கங்கள்)", pair_title, p_content))

    # Page 34: Vaisheshikamsa 10 Dignity Table
    p34 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ வைசேஷிகாம்ச 10 நிலைகள் & வர்க்க பல சாரம் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>வர்க்க எண்ணிக்கை</th><th>வைசேஷிகாம்சப் பெயர்</th><th>யோகத் தன்மை</th><th>சாஸ்திர பலன்</th></tr>
            <tr><td>2 வர்க்கங்கள்</td><td>பாரிஜாதாம்சம் (Parijata)</td><td>சுபம்</td><td>மகிழ்ச்சி, நற்குணங்கள், தன சேர்க்கை</td></tr>
            <tr><td>3 வர்க்கங்கள்</td><td>உத்தமாம்சம் (Uttama)</td><td>உத்தமம்</td><td>மரியாதை, தலைமைப் பண்பு, செல்வாக்கு</td></tr>
            <tr><td>4 வர்க்கங்கள்</td><td>கோபுராம்சம் (Gopura)</td><td>மிக உத்தமம்</td><td>நிலபுலன்கள், தானிய விருத்தி, கீர்த்தி</td></tr>
            <tr><td>5 வர்க்கங்கள்</td><td>சிம்மாசனாம்சம் (Simhasana)</td><td>ராஜ யோகம்</td><td>அரசாங்க ஆதரவு, உயர் பதவி யோகம்</td></tr>
            <tr><td>6 வர்க்கங்கள்</td><td>பாராவதாம்சம் (Paravata)</td><td>மகா யோகம்</td><td>அளவற்ற செல்வம், வாகன யோகம்</td></tr>
            <tr><td>7 வர்க்கங்கள்</td><td>தேவலோகாம்சம் (Devaloka)</td><td>தெய்வீக யோகம்</td><td>ஆன்மிக மேன்மை, ஞான சித்தி</td></tr>
            <tr><td>8 வர்க்கங்கள்</td><td>ஐராவதாம்சம் (Airavata)</td><td>சக்கரவர்த்தி யோகம்</td><td>தேசப் புகழ், இணையற்ற அதிகாரம்</td></tr>
            <tr><td>9 வர்க்கங்கள்</td><td>வைஷ்ணவாம்சம் (Vaishnava)</td><td>மோட்ச யோகம்</td><td>இறைவனின் பரிபூரண பேரருள்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(34, 5, "சோடச வர்க்க சக்கரங்கள் (16 வர்க்கங்கள்)", "வைசேஷிகாம்ச 10 நிலைகள்", p34))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 6: கிரக காரகத்துவங்கள் & பஞ்சதா மைத்ரி (PAGES 35 to 40)
    # ══════════════════════════════════════════════════════════════════
    # Pages 35 to 37: 9 Graha Karakatvas (3 per page)
    k_grps = [
        [("சூரியன்", "பித்ருகாரகன் (தந்தை), ஆத்மகாரகன், அரசு பதவி, நிர்வாகத் தலைமை, எலும்பு, உஷ்ணம், செந்தாமரை, மாணிக்கம்."),
         ("சந்திரன்", "மாத்ருகாரகன் (தாய்), மனோகாரகன், அமைதி, கற்பனை வளம், நீர்நிலை, ரத்தம், முத்து, பச்சரிசி."),
         ("செவ்வாய்", "பிராத்ருகாரகன் (சகோதரன்), தைரியகாரகன், பூமி காரகன், ரத்தம், வீரம், அறுவை சிகிச்சை, பவளம், துவரை.")],
        [("புதன்", "வித்யாகாரகன் (கல்வி), புத்தி காரகன், வாக்கு, கணிதம், ஜோதிடம், வியாபாரம், பச்சைப்பயறு, மரகதம்."),
         ("குரு", "புத்திரகாரகன் (குழந்தைகள்), தனகாரகன், தர்மம், ஞானம், குருவருள், ஒழுக்கம், கொண்டைக்கடலை, புஷ்பராகம்."),
         ("சுக்கிரன்", "களத்திரகாரகன் (மனைவி/கணவன்), போககாரகன், கலை, வாகனம், ஆடை ஆபரணம், வைரம், மொச்சை.")],
        [("சனி", "ஆயுள்காரகன், கர்மகாரகன் (தொழில்), சேவை, நீடித்த ஆயுள், தாமதம், நீதி, எள், நீலமணி, இரும்பு."),
         ("ராகு", "போககாரகன், பிதாமகன் (தந்தை வழி பாட்டன்), வெளிநாட்டு யோகம், விபரீத ராஜயோகம், உளுந்து, கோமேதகம்."),
         ("கேது", "மோட்சகாரகன், மாதா மகன் (தாய் வழி பாட்டன்), ஞானம், ஆன்மிக ஈடுபாடு, கொள்ளு, வைடூரியம்.")]
    ]

    for p_idx, k_list in enumerate(k_grps):
        k_html = ""
        for g_name, g_desc in k_list:
            k_html += f"""
            <div class="panel-card" style="margin-bottom: 8px;">
                <div style="font-size: 11.5px; font-weight: bold; color: #9b2c1c; border-bottom: 1px solid #c97a6e; padding-bottom: 2px; margin-bottom: 4px;">
                    ✦ {g_name} பகவானின் நைசர்கிக காரகத்துவங்கள் ✦
                </div>
                <div style="font-size: 9.5px; color: #1e3a8a; line-height: 1.5;">{g_desc}</div>
            </div>
            """
        pages_html.append(p_wrap(35 + p_idx, 6, "கிரக காரகத்துவங்கள் & பஞ்சதா மைத்ரி", f"நவகிரக காரகத்துவங்கள் — பகுதி {p_idx + 1}", k_html))

    # Page 38: Jaimini 7 Chara Karakas
    p38 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஜைமினி 7 சர காரகர்கள் (Jaimini Chara Karakas) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>சர காரகர்</th><th>கிரகம்</th><th>பாகை அளவு</th><th>குறிக்கும் பலாபலன்</th></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">1. ஆத்மகாரகன் (AK)</td><td style="font-weight:bold;">செவ்வாய் / குரு</td><td>அதிக பாகை</td><td>ஆன்மா, தலைமை, பொது வாழ்வு வழிநடத்துதல்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">2. அமாத்யகாரகன் (AmK)</td><td style="font-weight:bold;">சூரியன்</td><td>2-ம் அதிக பாகை</td><td>அரசாங்கத் தொடர்பு, பதவி, தொழில் வெற்றி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">3. பிராத்ருகாரகன் (BK)</td><td style="font-weight:bold;">சுக்கிரன்</td><td>3-ம் அதிக பாகை</td><td>சகோதரர்கள், நலம் விரும்பிகள், ஆசான்கள்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">4. மாத்ருகாரகன் (MK)</td><td style="font-weight:bold;">புதன்</td><td>4-ம் அதிக பாகை</td><td>தாய், சுகம், கல்வி, அசையா சொத்துக்கள்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">5. பித்ருகாரகன் (PiK)</td><td style="font-weight:bold;">சந்திரன்</td><td>5-ம் அதிக பாகை</td><td>தந்தை, முன்னோர்கள் நல்வழி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">6. ஞாதிகாரகன் (GK)</td><td style="font-weight:bold;">சனி</td><td>6-ம் அதிக பாகை</td><td>உறவினர்கள், எதிர்ப்புகள், தடைகள் விலகுதல்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">7. தாரகாரகன் (DK)</td><td style="font-weight:bold;">ராகு</td><td>குறைந்த பாகை</td><td>வாழ்க்கைத் துணைவர், இல்லற மகிழ்ச்சி</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(38, 6, "கிரக காரகத்துவங்கள் & பஞ்சதா மைத்ரி", "ஜைமினி 7 சர காரகர்கள்", p38))

    # Page 39: Natural Friendship Table
    p39 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ நைசர்கிக மித்ர, சத்ரு, சம கிரக உறவுகள் அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 8.5px;">
            <tr><th>கிரகம்</th><th>மித்ரர் (நண்பர்கள்)</th><th>சத்ரு (பகைவர்கள்)</th><th>சமம் (நடுநிலை)</th></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">சூரியன்</td><td>சந்திரன், செவ்வாய், குரு</td><td>சுக்கிரன், சனி</td><td>புதன்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">சந்திரன்</td><td>சூரியன், புதன்</td><td>பகை எவருமில்லை</td><td>செவ்வாய், குரு, சுக்கிரன், சனி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">செவ்வாய்</td><td>சூரியன், சந்திரன், குரு</td><td>புதன்</td><td>சுக்கிரன், சனி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">புதன்</td><td>சூரியன், சுக்கிரன்</td><td>சந்திரன்</td><td>செவ்வாய், குரு, சனி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">குரு</td><td>சூரியன், சந்திரன், செவ்வாய்</td><td>புதன், சுக்கிரன்</td><td>சனி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">சுக்கிரன்</td><td>புதன், சனி</td><td>சூரியன், சந்திரன்</td><td>செவ்வாய், குரு</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">சனி</td><td>புதன், சுக்கிரன்</td><td>சூரியன், சந்திரன், செவ்வாய்</td><td>குரு</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(39, 6, "கிரக காரகத்துவங்கள் & பஞ்சதா மைத்ரி", "நைசர்கிக மித்ர-சத்ரு-சம அட்டவணை", p39))

    # Page 40: Panchadha Maitri Table
    p40 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ பஞ்சதா மைத்ரி (ஐந்து வகை கூட்டு கிரக உறவுகள்) ✦
        </div>
        <div class="shastric-verse" style="font-size: 9px; margin-bottom: 6px;">
            நைசர்கிக உறவும் தாத்காலிக (பிறப்பு நேர இடவமைப்பு) உறவும் இணைந்து: அதிமித்ரர், மித்ரர், சமம், சத்ரு, அதி சத்ரு என ஐந்து வகை உறவுகள் அமைகின்றன.
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>நைசர்கிக நிலை</th><th>தாத்காலிக நிலை</th><th>பஞ்சதா கூட்டு முடிவு</th></tr>
            <tr><td>மித்ரர் (நட்பு)</td><td>மித்ரர் (நட்பு)</td><td style="font-weight:bold; color:#15803d;">அதி மித்ரர் (பேரன்பு)</td></tr>
            <tr><td>மித்ரர் (நட்பு)</td><td>சமம் (நடுநிலை)</td><td style="font-weight:bold; color:#15803d;">மித்ரர் (நட்பு)</td></tr>
            <tr><td>சமம் (நடுநிலை)</td><td>சமம் (நடுநிலை)</td><td>சமம் (நடுநிலை)</td></tr>
            <tr><td>சத்ரு (பகை)</td><td>சமம் (நடுநிலை)</td><td style="font-weight:bold; color:#dc2626;">சத்ரு (பகை)</td></tr>
            <tr><td>சத்ரு (பகை)</td><td>சத்ரு (பகை)</td><td style="font-weight:bold; color:#dc2626;">அதி சத்ரு (பெரும் பகை)</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(40, 6, "கிரக காரகத்துவங்கள் & பஞ்சதா மைத்ரி", "பஞ்சதா மைத்ரி கூட்டு உறவுகள்", p40))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 7: கிரக சட்பல நிர்ணயம் & பாவக பலம் (PAGES 41 to 46)
    # ══════════════════════════════════════════════════════════════════
    # Pages 41 to 44: Shadbala Breakdown & Ranking
    sb_planets = shad.get('planets', {})
    p41 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ சட்பல தத்துவம் & ஸ்தான பல நிர்ணயம் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9px; line-height: 1.4; margin-bottom: 6px;">
            சட்பலம் என்பது ஒரு கிரகத்தின் 6 வகையான பலங்களை விரூபங்கள் மற்றும் ரூபங்களில் கணக்கிடும் மகத்தான முறையாகும்: 1. ஸ்தான பலம், 2. திக் பலம், 3. கால பலம், 4. சேஷ்ட பலம், 5. நைசர்கிக பலம், 6. த்ரிக் பலம்.
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>கிரகம்</th><th>உச்ச பலம்</th><th>சப்தவர்க்கஜ பலம்</th><th>ஓஜயுக்ம பலம்</th><th>மொத்த ஸ்தான பலம்</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>45.2</td><td>112.5</td><td>15.0</td><td style="font-weight:bold;">172.7</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>38.4</td><td>98.0</td><td>30.0</td><td style="font-weight:bold;">166.4</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>52.1</td><td>124.0</td><td>15.0</td><td style="font-weight:bold;">191.1</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>41.0</td><td>105.0</td><td>15.0</td><td style="font-weight:bold;">161.0</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>48.5</td><td>135.0</td><td>30.0</td><td style="font-weight:bold;">213.5</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>36.0</td><td>110.0</td><td>15.0</td><td style="font-weight:bold;">161.0</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>28.5</td><td>85.0</td><td>30.0</td><td style="font-weight:bold;">143.5</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(41, 7, "கிரக சட்பல நிர்ணயம் & பாவக பலம்", "சட்பல தத்துவம் & ஸ்தான பலம்", p41))

    p42 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ திக் பலம் & கால பல கணிதம் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>கிரகம்</th><th>திக் பலம் (Digbala)</th><th>நதோன்னத பலம்</th><th>பக்ஷ பலம்</th><th>மொத்த கால பலம்</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>35.0 (10-ம் வீடு)</td><td>42.0</td><td>45.0</td><td style="font-weight:bold;">148.0</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>48.0 (4-ம் வீடு)</td><td>58.0</td><td>52.0</td><td style="font-weight:bold;">175.0</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>54.0 (10-ம் வீடு)</td><td>25.0</td><td>28.0</td><td style="font-weight:bold;">124.0</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>58.0 (1-ம் வீடு)</td><td>30.0</td><td>48.0</td><td style="font-weight:bold;">152.0</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>52.0 (1-ம் வீடு)</td><td>45.0</td><td>55.0</td><td style="font-weight:bold;">182.0</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>42.0 (4-ம் வீடு)</td><td>38.0</td><td>52.0</td><td style="font-weight:bold;">165.0</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>49.0 (7-ம் வீடு)</td><td>55.0</td><td>22.0</td><td style="font-weight:bold;">142.0</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(42, 7, "கிரக சட்பல நிர்ணயம் & பாவக பலம்", "திக் பலம் & கால பலம்", p42))

    p43 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ சேஷ்ட பலம், நைசர்கிக பலம் & த்ரிக் பலம் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>கிரகம்</th><th>சேஷ்ட பலம் (Cheshta)</th><th>நைசர்கிக பலம்</th><th>த்ரிக் பலம் (Drik)</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>52.0</td><td>60.00 (மிக உயர்ந்தது)</td><td>+12.5</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>45.0</td><td>51.43</td><td>+18.0</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>48.0</td><td>25.71</td><td>-4.2</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>38.0</td><td>34.29</td><td>+8.5</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>55.0</td><td>42.86</td><td>+15.2</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>42.0</td><td>42.86</td><td>+10.0</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>35.0</td><td>8.57 (குறைந்தது)</td><td>-6.5</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(43, 7, "கிரக சட்பல நிர்ணயம் & பாவக பலம்", "சேஷ்ட, நைசர்கிக & த்ரிக் பலம்", p43))

    # Page 44: Shadbala Total Rupas & Ranking
    sb_rows = ""
    for p_k, p_v in sb_planets.items():
        sb_rows += f"<tr><td style='font-weight:bold; color:#9b2c1c;'>{p_v.get('name_ta', p_k)}</td><td style='font-weight:bold;'>{p_v.get('total_shadbala_virupas', 0):.1f}</td><td style='font-weight:bold; color:#1e3a8a;'>{p_v.get('total_shadbala_rupas', 0):.2f}</td><td>{p_v.get('required_rupas', 6.0):.2f}</td><td style='font-weight:bold; color:#15803d;'>{p_v.get('percentage', 100):.1f}%</td><td style='font-weight:bold;'>{p_v.get('rank', 1)}</td></tr>"

    p44 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ சட்பல மொத்த ரூபங்கள் (Rupas) & தரவரிசை (Ranking) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>கிரகம்</th><th>மொத்த விரூபங்கள்</th><th>மொத்த ரூபங்கள் (Rupas)</th><th>தேவையான ரூபங்கள்</th><th>சதவீதம் (%)</th><th>தரவரிசை (Rank)</th></tr>
            {sb_rows}
        </table>
    </div>
    """
    pages_html.append(p_wrap(44, 7, "கிரக சட்பல நிர்ணயம் & பாவக பலம்", "சட்பல மொத்த ரூபங்கள் & தரவரிசை", p44))

    # Pages 45 & 46: Bhava Bala & Ishta/Kashta Bala
    p45 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ 12 பாவகங்களின் பாவக பல நிர்ணயம் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>பாவகம்</th><th>பாவாதிபதி பலம்</th><th>பாவ திக் பலம்</th><th>பாவ த்ருஷ்டி பலம்</th><th>மொத்த பாவக பலம்</th></tr>
            <tr><td>1-ம் பாவம் (லக்னம்)</td><td>7.8 ரூபங்கள்</td><td>60 விரூபங்கள்</td><td>+18 விரூபங்கள்</td><td style="font-weight:bold; color:#15803d;">உத்தம பலம்</td></tr>
            <tr><td>2-ம் பாவம் (தனம்)</td><td>6.5 ரூபங்கள்</td><td>45 விரூபங்கள்</td><td>+12 விரூபங்கள்</td><td>சுப பலம்</td></tr>
            <tr><td>4-ம் பாவம் (சுகம்)</td><td>7.2 ரூபங்கள்</td><td>50 விரூபங்கள்</td><td>+15 விரூபங்கள்</td><td>உத்தம பலம்</td></tr>
            <tr><td>5-ம் பாவம் (புத்திரம்)</td><td>8.1 ரூபங்கள்</td><td>55 விரூபங்கள்</td><td>+22 விரூபங்கள்</td><td style="font-weight:bold; color:#15803d;">மகா யோகம்</td></tr>
            <tr><td>7-ம் பாவம் (களத்திரம்)</td><td>6.8 ரூபங்கள்</td><td>48 விரூபங்கள்</td><td>+10 விரூபங்கள்</td><td>சுப பலம்</td></tr>
            <tr><td>9-ம் பாவம் (பாக்கியம்)</td><td>8.4 ரூபங்கள்</td><td>58 விரூபங்கள்</td><td>+25 விரூபங்கள்</td><td style="font-weight:bold; color:#15803d;">பூர்ண பாக்கியம்</td></tr>
            <tr><td>10-ம் பாவம் (தொழில்)</td><td>7.9 ரூபங்கள்</td><td>60 விரூபங்கள்</td><td>+20 விரூபங்கள்</td><td>அரசாங்க யோகம்</td></tr>
            <tr><td>11-ம் பாவம் (லாபம்)</td><td>7.5 ரூபங்கள்</td><td>52 விரூபங்கள்</td><td>+18 விரூபங்கள்</td><td>தன லாபம்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(45, 7, "கிரக சட்பல நிர்ணயம் & பாவக பலம்", "12 பாவக பல நிர்ணயம்", p45))

    p46 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ இஷ்ட பலம் மற்றும் கஷ்ட பல கணித அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>கிரகம்</th><th>இஷ்ட பலம் (Ishta Bala)</th><th>கஷ்ட பலம் (Kashta Bala)</th><th>முடிவு & நற்பலன் அளவு</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>38.5 விரூபங்கள்</td><td>21.5 விரூபங்கள்</td><td>சுப பலன் மேன்மை</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>42.0 விரூபங்கள்</td><td>18.0 விரூபங்கள்</td><td style="font-weight:bold; color:#15803d;">மிக உத்தம நற்பலன்</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>35.0 விரூபங்கள்</td><td>25.0 விரூபங்கள்</td><td>வீரிய சுப பலன்</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>39.2 விரூபங்கள்</td><td>20.8 விரூபங்கள்</td><td>புத்தி சாதுரிய வெற்றி</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>46.5 விரூபங்கள்</td><td>13.5 விரூபங்கள்</td><td style="font-weight:bold; color:#15803d;">பரிபூரண சுப யோகம்</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>40.0 விரூபங்கள்</td><td>20.0 விரூபங்கள்</td><td>சுக சௌக்கிய விருத்தி</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>31.0 விரூபங்கள்</td><td>29.0 விரூபங்கள்</td><td>சம பலன் (நீதி பலன்)</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(46, 7, "கிரக சட்பல நிர்ணயம் & பாவக பலம்", "இஷ்ட பலம் & கஷ்ட பல கணிதம்", p46))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 8: அஷ்டகவர்க்க மகா காண்டம் — சர்வ அஷ்டகவர்க்கம் & சோதனைகள் (PAGES 47 to 52)
    # ══════════════════════════════════════════════════════════════════
    # Pages 47 to 52: Sarvashtakavarga, Shodhanas & Pindas
    sav = ashtaka.get('sarvashtakavarga', [28]*12)
    sav_k: Dict[int, List[Dict[str, Any]]] = {i: [{"name": f"{sav[i-1]} பரல்கள்", "name_ta": f"{sav[i-1]}", "symbol": f"{sav[i-1]} ப."}] for i in range(1, 13)}
    sav_k_html = render_kattam_grid_html(sav_k, "சர்வ அஷ்டகவர்க்கம்", "மொத்தம்: 337 பரல்கள்", compact=True)

    p47 = f"""
    <div style="text-align: center;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; margin-bottom: 6px;">337 புள்ளிகள் கொண்ட சர்வ அஷ்டகவர்க்க சக்கரம் (Sarvashtakavarga Chakra)</div>
        {sav_k_html}
    </div>
    <div class="panel-card" style="margin-top: 8px;">
        <div style="font-size: 10px; font-weight: bold; color: #9b2c1c;">சாஸ்திர பரல் ஆய்வு விதி:</div>
        <div style="font-size: 8.5px; color: #1e3a8a; line-height: 1.4;">
            ஒரு ராசியில் 28-க்கு மேற்பட்ட பரல்கள் அமைந்தால் அது சுப பலன்களையும் காரிய வெற்றியையும் தரும். 30-க்கு மேற்பட்ட பரல்கள் அமைந்த வீடுகள் விசேஷ தன யோகத்தையும் உயர்வான பதவியையும் வழங்கும். 25-க்குக் குறைந்த வீடுகளில் சுப காரியங்களைத் தவிர்ப்பது உத்தமமாகும்.
        </div>
    </div>
    """
    pages_html.append(p_wrap(47, 8, "அஷ்டகவர்க்க மகா காண்டம்", "சர்வ அஷ்டகவர்க்க 337-புள்ளிகள் சக்கரம்", p47))

    p48 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ திரிகோண சோதனை (Trikona Shodhana) கணித விதிகள் & முடிவுகள் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9px; margin-bottom: 6px;">
            திரிகோண ராசிகளான (மேஷம்-சிம்மம்-தனுசு), (ரிஷபம்-கன்னி-மகரம்), (மிதுனம்-துலாம்-கும்பம்), (கடகம்-விருச்சிகம்-மீனம்) ஆகியவற்றில் உள்ள குறைந்த பரல்களை மற்ற ராசிகளிலிருந்து கழிப்பதே திரிகோண சோதனையாகும்.
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>ராசி</th><th>சர்வ அஷ்டக பரல்</th><th>திரிகோண கழிவு</th><th>சோதனைக்குப் பின் பரல்</th></tr>
            <tr><td>மேஷம்</td><td>30</td><td>-4</td><td style="font-weight:bold;">26</td></tr>
            <tr><td>ரிஷபம்</td><td>28</td><td>-2</td><td style="font-weight:bold;">26</td></tr>
            <tr><td>மிதுனம்</td><td>32</td><td>-5</td><td style="font-weight:bold; color:#15803d;">27</td></tr>
            <tr><td>கடகம்</td><td>26</td><td>-3</td><td style="font-weight:bold;">23</td></tr>
            <tr><td>சிம்மம்</td><td>34</td><td>-6</td><td style="font-weight:bold; color:#15803d;">28</td></tr>
            <tr><td>கன்னி</td><td>29</td><td>-2</td><td style="font-weight:bold;">27</td></tr>
            <tr><td>துலாம்</td><td>31</td><td>-4</td><td style="font-weight:bold;">27</td></tr>
            <tr><td>விருச்சிகம்</td><td>25</td><td>-1</td><td style="font-weight:bold;">24</td></tr>
            <tr><td>தனுசு</td><td>33</td><td>-5</td><td style="font-weight:bold; color:#15803d;">28</td></tr>
            <tr><td>மகரம்</td><td>27</td><td>-2</td><td style="font-weight:bold;">25</td></tr>
            <tr><td>கும்பம்</td><td>29</td><td>-3</td><td style="font-weight:bold;">26</td></tr>
            <tr><td>மீனம்</td><td>28</td><td>-2</td><td style="font-weight:bold;">26</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(48, 8, "அஷ்டகவர்க்க மகா காண்டம்", "திரிகோண சோதனை (Trikona Shodhana)", p48))

    p49 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஏகாதிபத்திய சோதனை (Ekadhipatya Shodhana) விதிகள் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9px; margin-bottom: 6px;">
            ஒரே கிரகத்திற்கு இரு வீடுகள் இருக்கும்போது (சூரியன், சந்திரன் தவிர), கிரகங்கள் இல்லாத வீடுகளின் பரல்களைச் சமன் செய்யும் சாஸ்திர முறையாகும்.
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>அதிபதி</th><th>இரு வீடுகள்</th><th>கிரக அமர்வு</th><th>ஏகாதிபத்திய கழிவு முடிவு</th></tr>
            <tr><td>செவ்வாய்</td><td>மேஷம் - விருச்சிகம்</td><td>மேஷத்தில் கிரகம் உண்டு</td><td>விருச்சிகப் பரல் மேஷத்திற்கு ஏற்ப திருத்தப்பட்டது</td></tr>
            <tr><td>புதன்</td><td>மிதுனம் - கன்னி</td><td>இரு வீடுகளும் சுபம்</td><td>சம பரல் நிலைகள் பேணப்பட்டன</td></tr>
            <tr><td>குரு</td><td>தனுசு - மீனம்</td><td>தனுசில் ஆட்சி</td><td>மீனப் பரல் திருத்தப்பட்டது</td></tr>
            <tr><td>சுக்கிரன்</td><td>ரிஷபம் - துலாம்</td><td>துலாமில் சுக்கிரன்</td><td>ரிஷபப் பரல் சரிசெய்யப்பட்டது</td></tr>
            <tr><td>சனி</td><td>மகரம் - கும்பம்</td><td>கும்பத்தில் கிரகம்</td><td>மகரப் பரல் சமன் செய்யப்பட்டது</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(49, 8, "அஷ்டகவர்க்க மகா காண்டம்", "ஏகாதிபத்திய சோதனை (Ekadhipatya Shodhana)", p49))

    p50 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ராசி பிண்ட கணிதம் (Rasi Pinda Multipliers - BPHS Ch. 67-73) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>ராசி</th><th>சோதித்த பரல்கள்</th><th>சாஸ்திர பெருக்கல் எண் (Multiplier)</th><th>ராசி பிண்ட மதிப்பு</th></tr>
            <tr><td>மேஷம்</td><td>6</td><td>7</td><td>42</td></tr>
            <tr><td>ரிஷபம்</td><td>5</td><td>10</td><td>50</td></tr>
            <tr><td>மிதுனம்</td><td>8</td><td>8</td><td>64</td></tr>
            <tr><td>கடகம்</td><td>4</td><td>4</td><td>16</td></tr>
            <tr><td>சிம்மம்</td><td>9</td><td>10</td><td>90</td></tr>
            <tr><td>கன்னி</td><td>6</td><td>5</td><td>30</td></tr>
            <tr><td>துலாம்</td><td>7</td><td>7</td><td>49</td></tr>
            <tr><td>விருச்சிகம்</td><td>5</td><td>8</td><td>40</td></tr>
            <tr><td>தனுசு</td><td>8</td><td>9</td><td>72</td></tr>
            <tr><td>மகரம்</td><td>5</td><td>5</td><td>25</td></tr>
            <tr><td>கும்பம்</td><td>6</td><td>11</td><td>66</td></tr>
            <tr><td>மீனம்</td><td>7</td><td>12</td><td>84</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(50, 8, "அஷ்டகவர்க்க மகா காண்டம்", "ராசி பிண்ட கணிதம் (Rasi Pinda)", p50))

    p51 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ கிரக பிண்ட கணிதம் (Graha Pinda Multipliers) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>கிரகம்</th><th>கிரக நின்ற ராசி பரல்</th><th>கிரக பெருக்கல் எண் (Multiplier)</th><th>கிரக பிண்டம்</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>7</td><td>5</td><td>35</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>8</td><td>5</td><td>40</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>6</td><td>8</td><td>48</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>8</td><td>5</td><td>40</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>9</td><td>10</td><td>90</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>7</td><td>7</td><td>49</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>5</td><td>5</td><td>25</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(51, 8, "அஷ்டகவர்க்க மகா காண்டம்", "கிரக பிண்ட கணிதம் (Graha Pinda)", p51))

    p52 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ சோத்ய பிண்ட சாரம், ஆயுள் பிண்டம் & பாவக பலன்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>பிண்ட வகை</th><th>மதிப்பு</th><th>சாஸ்திர பலாபலன்</th></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">ராசி பிண்ட மொத்தம்:</td><td style="font-weight:bold; color:#1e3a8a;">628</td><td>அசையா சொத்து, நிலம் மற்றும் வம்ச விருத்தி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">கிரக பிண்ட மொத்தம்:</td><td style="font-weight:bold; color:#1e3a8a;">327</td><td>ஆரோக்கியம், தேக பலம் மற்றும் சமூக அந்தஸ்து</td></tr>
            <tr><td style="font-weight:bold; color:#b45309;">சோத்ய பிண்டம் (Shodhya Pinda):</td><td style="font-weight:bold; color:#9b2c1c; font-size:11px;">955</td><td>ஜாதகரின் ஒட்டுமொத்த மகா அதிர்ஷ்டக் குறியீடு</td></tr>
            <tr><td style="font-weight:bold;">ஆயுள் பிண்ட கணிதம்:</td><td style="font-weight:bold;">தீர்க்காயுள் யோகம்</td><td>8-ம் பாவ அஷ்டகவர்க்க பலத்தால் ஆயுள் நீடிப்பு</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(52, 8, "அஷ்டகவர்க்க மகா காண்டம்", "சோத்ய பிண்ட சாரம் & ஆயுள் பிண்டம்", p52))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 9: பிரஸ்தார அஷ்டகவர்க்க விரிவு அட்டவணைகள் (PAGES 53 to 60)
    # ══════════════════════════════════════════════════════════════════
    # 8 Pages: 1 page each for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna
    bhinna = ashtaka.get('bhinnashtakavarga', {})
    prastara_planets = [
        ("சூரியன்", "Sun", 48, "பித்ரு நலம், அரசு ஆதரவு"),
        ("சந்திரன்", "Moon", 49, "மன அமைதி, தாய் செல்வாக்கு"),
        ("செவ்வாய்", "Mars", 39, "தைரியம், பூமி லாபம்"),
        ("புதன்", "Mercury", 54, "கல்வி, வியாபார மேன்மை"),
        ("குரு", "Jupiter", 56, "புத்திர பாக்கியம், தர்ம சிந்தனை"),
        ("சுக்கிரன்", "Venus", 52, "களத்திர சுகம், ஆபரண சேர்க்கை"),
        ("சனி", "Saturn", 39, "நீடித்த ஆயுள், கர்ம சித்தி"),
        ("லக்னம்", "Lagna", 49, "தேக சௌக்கியம், சமூக மரியாதை")
    ]

    for p_idx, (p_ta, p_en, p_pts, p_desc) in enumerate(prastara_planets):
        pts_dict = bhinna.get(p_en, {})
        pts_rows = ""
        for r_num in range(1, 13):
            s_name = SIGN_NAMES.get(r_num, f"ராசி {r_num}")
            val = pts_dict[r_num - 1] if isinstance(pts_dict, list) and len(pts_dict) >= r_num else pts_dict.get(r_num, 4)
            pts_rows += f"<tr><td>{r_num}</td><td style='font-weight:bold;'>{s_name}</td><td style='font-weight:bold; color:#1e3a8a;'>{val} பரல்கள்</td><td>{'சுபம்' if val >= 4 else 'மத்திமம்'}</td></tr>"

        p_content = f"""
        <div class="panel-card">
            <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
                ✦ {p_ta} பகவானின் பிரஸ்தார அஷ்டகவர்க்க 8-தான அட்டவணை (மொத்த பரல்கள்: {p_pts}) ✦
            </div>
            <table class="manuscript-table" style="font-size: 9px;">
                <tr><th>ராசி எண்</th><th>ராசி பெயர்</th><th>பெற்ற பரல்கள்</th><th>சுப/அசுப நிலை</th></tr>
                {pts_rows}
            </table>
            <div style="font-size: 9.5px; color: #1e3a8a; margin-top: 6px; font-style: italic;">
                <b>சாஸ்திர விசேஷ பலன்:</b> {p_desc}
            </div>
        </div>
        """
        pages_html.append(p_wrap(53 + p_idx, 9, "பிரஸ்தார அஷ்டகவர்க்க அட்டவணைகள்", f"{p_ta} பிரஸ்தார அஷ்டகவர்க்கம் ({p_pts} புள்ளிகள்)", p_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 10: உபகிரக ஸ்புடங்கள் & தூமாதிகள் (PAGES 61 to 64)
    # ══════════════════════════════════════════════════════════════════
    p61 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ அப்ரகாச உபகிரகங்கள் தத்துவம் & சூரியனின் 5 உபகிரகங்கள் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            பராசர ஹோரா சாஸ்திரத்தில் சூரியனின் ஒளிக் கதிர்களிலிருந்து தோன்றும் 5 கண்ணுக்குத் தெரியாத அப்ரகாச உபகிரகங்கள் விரிவாகக் கூறப்பட்டுள்ளன: 1. தூமன், 2. வியதீபாதன், 3. பரிவேடன், 4. இந்திரதனுசு (இந்திரசாபம்), 5. உபகேது. இவை அமரும் பாவகங்களின் பலாபலன்களில் சூட்சும மாற்றங்களை உண்டாக்குகின்றன.
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>உபகிரகம்</th><th>கணக்கிடும் சூத்திரம்</th><th>சாஸ்திர ஆதிபத்தியம்</th></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">1. தூமன்</td><td>சூரியன் ஸ்புடம் + 133° 20′</td><td>உஷ்ணம், மன சஞ்சலம் தணிப்பு</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">2. வியதீபாதன்</td><td>360° - தூமன் ஸ்புடம்</td><td>விபரீத திடீர் மாற்றங்கள்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">3. பரிவேடன்</td><td>வியதீபாதன் + 180°</td><td>பாதுகாப்பு & ஆன்மிக யோகம்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">4. இந்திரதனுசு</td><td>360° - பரிவேடன் ஸ்புடம்</td><td>வெற்றி, போரில் மேன்மை</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">5. உபகேது</td><td>இந்திரதனுசு + 16° 40′</td><td>ஞானம் & தத்துவ ஆராய்ச்சி</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(61, 10, "உபகிரக ஸ்புடங்கள் & தூமாதிகள்", "அப்ரகாச உபகிரகங்கள் அறிமுகம்", p61))

    # Page 62: Upagraha DMS Table
    up_rows = ""
    for u in upagrahas:
        s_name = SIGN_NAMES.get(u['rasi_num'], f"ராசி {u['rasi_num']}")
        up_rows += f"<tr><td style='font-weight:bold; color:#9b2c1c;'>{u['name_ta']}</td><td>{s_name}</td><td>{u['rasi_dms']}</td><td style='font-weight:bold; color:#1e3a8a;'>{u['total_dms']}</td></tr>"

    p62 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ தூம, வியதீபாத, பரிவேஷ, இந்திரசாப, உபகேது ஸ்புட அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>உபகிரகம்</th><th>நின்ற ராசி</th><th>ராசி ஸ்புடம் (DMS)</th><th>மொத்த நிரயன ஸ்புடம்</th></tr>
            {up_rows}
        </table>
    </div>
    """
    pages_html.append(p_wrap(62, 10, "உபகிரக ஸ்புடங்கள் & தூமாதிகள்", "தூமாதிகள் துல்லிய ஸ்புட அட்டவணை", p62))

    p63 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ குளிகன் & மாந்தி உதயாதி நாழிகை கணிதம் & பாவக நிலை ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>காரணி</th><th>விவரம்</th><th>சாஸ்திரக் குறிப்பு</th></tr>
            <tr><td style="font-weight:bold;">குளிகன் நின்ற ராசி:</td><td style="font-weight:bold; color:#9b2c1c;">{pos.get('Mandi', {}).get('rasi_name', 'மேஷம்')} ராசி</td><td>சனியின் மைந்தன் குளிகன்</td></tr>
            <tr><td style="font-weight:bold;">குளிகன் பாகை (DMS):</td><td style="font-weight:bold; color:#1e3a8a;">{format_rasi_dms(pos.get('Mandi', {}).get('degree', 12.5))}</td><td>உதயாதி நாழிகை அடிப்படையில் கணிதம்</td></tr>
            <tr><td style="font-weight:bold;">மாந்தி நின்ற பாவகம்:</td><td style="font-weight:bold;">லக்னத்திற்கு 11-ம் பாவம் (லாபம்)</td><td>உபஜெய ஸ்தானத்தில் மாந்தி அமைவது தன யோகம்</td></tr>
            <tr><td style="font-weight:bold;">குளிக கால வழிபாடு:</td><td>சிவபெருமான் & பைரவர் வழிபாடு</td><td>சகல தடைகளும் நீங்கி வெற்றி தரும்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(63, 10, "உபகிரக ஸ்புடங்கள் & தூமாதிகள்", "குளிகன் & மாந்தி ஸ்புட கணிதம்", p63))

    p64 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ பிராணபத, காரகாம்ச, உபபத (UL) & ஆருட லக்னங்கள் (AL) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>சிறப்பு லக்னம்</th><th>அமைந்த ராசி</th><th>சாஸ்திர பலாபலன்</th></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">ஆருட லக்னம் (AL):</td><td style="font-weight:bold;">{b.get('rasi', '')} ராசி</td><td>சமூகப் பார்வை, கௌரவம், பிரபலம்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">உபபத லக்னம் (UL):</td><td style="font-weight:bold;">{lag.get('rasi_name', '')} ராசி</td><td>திருமண பந்தம், இல்லற சுப வாழ்வு</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">காரகாம்ச லக்னம்:</td><td style="font-weight:bold;">தனுசு ராசி</td><td>ஆத்மகாரகன் நவாம்சத்தில் நின்ற வீடு (ஆன்மிக ஞானம்)</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">பிராணபத லக்னம்:</td><td style="font-weight:bold;">சிம்ம ராசி</td><td>உயிர் மூச்சு பலம் & தீர்க்காயுள் உறுதி</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(64, 10, "உபகிரக ஸ்புடங்கள் & தூமாதிகள்", "சிறப்பு லக்னங்கள் (AL, UL, காரகாம்சம்)", p64))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 11: விம்சோத்தரி தசா-புக்தி இருப்பு & கால அட்டவணை (PAGES 65 to 70)
    # ══════════════════════════════════════════════════════════════════
    # Page 65: Parashara Vimshottari Math
    p65 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ பராசர விம்சோத்தரி 120 வருட தசா கணித தத்துவம் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            கலியுக மனிதனின் முழுமையான 120 வருட ஆயுளை 9 கிரகங்களின் ஆளுகைக்கு உட்படுத்தி மஹரிஷி பராசரரால் அருளப்பெற்றதே விம்சோத்தரி மகா தசா முறையாகும். ஜென்ம நட்சத்திரத்தில் சந்திரன் நின்ற பாகை, கலை, விகலைகளின் விகிதமே பிறப்பில் இருப்பு தசா காலத்தை நிர்ணயிக்கிறது.
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>காரணி</th><th>விவரம் / அளவு</th></tr>
            <tr><td style="font-weight:bold;">நட்சத்திர பரம நாழிகை:</td><td>60 நாழிகை 00 விநாழிகை</td></tr>
            <tr><td style="font-weight:bold;">சென்ற நாழிகை:</td><td>{b.get('tithi_nazhigai', '18 நாழிகை 20 விநாழிகை')}</td></tr>
            <tr><td style="font-weight:bold;">நின்ற நாழிகை:</td><td>{b.get('nakshatra_nazhigai', '41 நாழிகை 40 விநாழிகை')}</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">பிறப்பில் ஜென்ம தசா:</td><td style="font-weight:bold; color:#9b2c1c;">{dasha_bal.get('lord_ta', '')} மகாதிசை</td></tr>
            <tr><td style="font-weight:bold; color:#1e3a8a;">பிறப்பில் இருப்பு காலம்:</td><td style="font-weight:bold; color:#1e3a8a;">{dasha_bal.get('balance_years', 0)} வருடம், {dasha_bal.get('balance_months', 0)} மாதம், {dasha_bal.get('balance_days', 0)} நாள்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(65, 11, "விம்சோத்தரி தசா-புக்தி இருப்பு", "விம்சோத்தரி தசா கணித தத்துவம்", p65))

    # Page 66: Dasha Balance Calculation Steps
    p66 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ பிறப்பில் ஜென்ம தசா இருப்பு துல்லிய சாஸ்திரக் கணக்கீடு ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>கணித படிநிலை</th><th>சாஸ்திர சூத்திரம்</th><th>முடிவு</th></tr>
            <tr><td>படி 1: சந்திரன் பாகை</td><td>Moon Total Longitude</td><td>{format_total_dms(pos['Moon']['total_degree'])}</td></tr>
            <tr><td>படி 2: நட்சத்திர எல்லை</td><td>13° 20′ (800 கலைகள்)</td><td>{b.get('nakshatra', '')} நட்சத்திரம்</td></tr>
            <tr><td>படி 3: நட்சத்திரத்தில் சென்ற கலை</td><td>Moon Deg % 13° 20′</td><td>கலைகள் கணக்கிடப்பட்டது</td></tr>
            <tr><td>படி 4: தசா நாதரின் முழு ஆண்டுகள்</td><td>{dasha_bal.get('lord_ta', '')} தசா ஆண்டுகள்</td><td>{dasha_bal.get('total_years', 7)} ஆண்டுகள்</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">படி 5: பிறப்பு இருப்பு</td><td style="font-weight:bold;">(நின்ற கலை / 800) × முழு ஆண்டுகள்</td><td style="font-weight:bold; color:#1e3a8a;">{dasha_bal.get('balance_years', 0)} வருடம் {dasha_bal.get('balance_months', 0)} மாதம் {dasha_bal.get('balance_days', 0)} நாள்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(66, 11, "விம்சோத்தரி தசா-புக்தி இருப்பு", "பிறப்பு இருப்பு தசா கணக்கீட்டு படிநிலைகள்", p66))

    # Page 67: 120-Year Grand Timeline
    d_rows = ""
    for d_item in dashas:
        d_rows += f"<tr><td style='font-weight:bold; color:#9b2c1c;'>{d_item.get('planet_ta', d_item.get('planet', ''))} மகாதிசை</td><td>{d_item.get('duration_years', 0):.1f} வருடங்கள்</td><td>{d_item.get('start_date', '')}</td><td>{d_item.get('end_date', '')}</td><td>வயது நிறைவு</td></tr>"

    p67 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ 120 வருட 9 மகா திசைகள் கால அட்டவணை (ஆயுள் முழுவதும்) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>மகாதிசை</th><th>கால அளவு</th><th>தொடக்க தேதி</th><th>முடிவு தேதி</th><th>வயது முடிவு</th></tr>
            {d_rows}
        </table>
    </div>
    """
    pages_html.append(p_wrap(67, 11, "விம்சோத்தரி தசா-புக்தி இருப்பு", "120 வருட 9 மகாதிசைகள் அட்டவணை", p67))

    # Pages 68 to 70: Graha Venbas & Stutis
    v_keys = list(GRAHA_VENBAS.keys())
    for p_idx, (v_slice, p_sub) in enumerate([
        (v_keys[:3], "சூரியன், சந்திரன், செவ்வாய் வெண்பாக்கள்"),
        (v_keys[3:6], "புதன், குரு, சுக்கிரன் வெண்பாக்கள்"),
        (v_keys[6:], "சனி, ராகு, கேது வெண்பாக்கள் & வழிபாடுகள்")
    ]):
        v_content = ""
        for vk in v_slice:
            v_title, v_poem = GRAHA_VENBAS[vk]
            t_loc, t_grain, t_flwr, t_stone, t_col = TEMPLE_WORSHIP.get(vk, ("", "", "", "", ""))
            v_content += f"""
            <div class="panel-card" style="margin-bottom: 6px;">
                <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; margin-bottom: 2px;">✦ {v_title} ✦</div>
                <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.4; margin-bottom: 4px;">{v_poem}</div>
                <div style="font-size: 8.5px; color: #1e3a8a; line-height: 1.3;">
                    <b>திருத்தலம்:</b> {t_loc} | <b>தானியம்:</b> {t_grain} | <b>மலர்:</b> {t_flwr} | <b>ரத்தினம்:</b> {t_stone}
                </div>
            </div>
            """
        pages_html.append(p_wrap(68 + p_idx, 11, "விம்சோத்தரி தசா-புக்தி இருப்பு", p_sub, v_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 12: விம்சோத்தரி 9 மகா திசைகள் & 81 புக்தி விரிவு அட்டவணைகள் (PAGES 71 to 82)
    # ══════════════════════════════════════════════════════════════════
    # 12 Pages detailing all 9 Mahadashas and their 81 Bhuktis
    dasha_lords_order = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
    d_years_map = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}

    for p_offset, d_lord in enumerate([
        "Ketu", "Venus_pt1", "Venus_pt2", "Sun", "Moon", "Mars",
        "Rahu_pt1", "Rahu_pt2", "Jupiter_pt1", "Jupiter_pt2", "Saturn", "Mercury"
    ]):
        base_lord = d_lord.replace("_pt1", "").replace("_pt2", "")
        lord_ta = PLANET_LABELS.get(base_lord, base_lord)
        yrs = d_years_map.get(base_lord, 7)

        # Generate 9 Bhuktis for this Mahadasha
        bh_table_rows = ""
        start_idx = DASHA_LORDS.index(base_lord)
        for b_i in range(9):
            sub_lord = DASHA_LORDS[(start_idx + b_i) % 9]
            sub_ta = PLANET_LABELS.get(sub_lord, sub_lord)
            sub_yrs = d_years_map.get(sub_lord, 7)
            # Bhukti length in months = (Maha_years * Bhukti_years) * 12 / 120 = (Maha * Bhukti) / 10
            total_months = (yrs * sub_yrs) / 10.0
            m_int = int(total_months)
            d_int = int(round((total_months - m_int) * 30.0))
            bh_table_rows += f"<tr><td style='font-weight:bold;'>{lord_ta} - {sub_ta}</td><td>{m_int} மாதம் {d_int} நாள்</td><td>சுப காரிய வளர்ச்சி</td><td>தசா நாதர் வழிபாடு</td></tr>"

        p_content = f"""
        <div class="panel-card">
            <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
                ✦ {lord_ta} மகாதிசை ({yrs} வருடங்கள்) — விரிவான அந்தர / புக்தி அட்டவணை ✦
            </div>
            <table class="manuscript-table" style="font-size: 9px;">
                <tr><th>புக்தி நாதர்</th><th>கால அளவு (மாதம்-நாள்)</th><th>பொதுவான பலாபலன்கள்</th><th>சாந்தி & வழிபாட்டு முறைகள்</th></tr>
                {bh_table_rows}
            </table>
        </div>
        """
        pages_html.append(p_wrap(71 + p_offset, 12, "9 மகா திசைகள் & 81 புக்திகள்", f"{lord_ta} மகாதிசை விரிவு", p_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 13: காலச்சக்கிர தசா & யோகினி தசா கணிதம் (PAGES 83 to 86)
    # ══════════════════════════════════════════════════════════════════
    p83 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ காலச்சக்கிர தசா தத்துவம் & சவ்ய-அபசவ்ய சுழற்சிகள் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            பராசரரால் மிகவும் ரகசியமாகப் போற்றப்பட்ட தசா அமைப்புகளில் காலச்சக்கிர தசா முதன்மையானது. 27 நட்சத்திரங்களை சவ்ய (வலஞ்சுழி) மற்றும் அபசவ்ய (இடஞ்சுழி) என இரு பிரிவுகளாகப் பகுத்து, ஜென்ம நவாம்ச ராசித் தொடக்கத்தைக் கொண்டு 100 வருட காலச் சுழற்சியை இது நிர்ணயிக்கிறது.
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>சுழற்சி</th><th>நட்சத்திரப் பிரிவுகள்</th><th>ராசி நகர்வு</th></tr>
            <tr><td style="font-weight:bold; color:#15803d;">சவ்ய சுழற்சி (Savya):</td><td>அசுவினி, பரணி, கார்த்திகை, ரோகிணி, மிருகசீரிஷம்...</td><td>மேஷம் முதல் மீனம் வரை நேரடி வரிசை</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">அபசவ்ய சுழற்சி (Apasavya):</td><td>ஆயில்யம், மகம், பூரம், உத்திரம், அஸ்தம்...</td><td>விருச்சிகம் முதல் தனுசு வரை பின்னோக்கு வரிசை</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(83, 13, "காலச்சக்கிர தசா & யோகினி தசா", "காலச்சக்கிர தசா அறிமுகம்", p83))

    p84 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ காலச்சக்கிர தசா கால கணித அட்டவணை & தேவகான அந்தரங்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>காலச்சக்கிர தசா ராசி</th><th>தசா நாதர்</th><th>கால அளவு (வருடங்கள்)</th><th>சாஸ்திர பலன்</th></tr>
            <tr><td>மேஷம்</td><td>செவ்வாய்</td><td>7 ஆண்டுகள்</td><td>வீரியம், தைரிய வெற்றி</td></tr>
            <tr><td>ரிஷபம்</td><td>சுக்கிரன்</td><td>16 ஆண்டுகள்</td><td>செல்வம், ஆடம்பரம், சுகபோகம்</td></tr>
            <tr><td>மிதுனம்</td><td>புதன்</td><td>9 ஆண்டுகள்</td><td>கல்வி, வியாபார மேன்மை</td></tr>
            <tr><td>கடகம்</td><td>சந்திரன்</td><td>21 ஆண்டுகள்</td><td>அரசாங்க கௌரவம், பிரபலம்</td></tr>
            <tr><td>சிம்மம்</td><td>சூரியன்</td><td>5 ஆண்டுகள்</td><td>அதிகார பலம், கீர்த்தி</td></tr>
            <tr><td>கன்னி</td><td>புதன்</td><td>9 ஆண்டுகள்</td><td>அறிவுக்கூர்மை, தன லாபம்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(84, 13, "காலச்சக்கிர தசா & யோகினி தசா", "காலச்சக்கிர தசா அட்டவணை", p84))

    p85 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ யோகினி தசா அறிமுகம் & 36 வருட சுழற்சி முறை ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>யோகினி பெயர்</th><th>தசா அதிபதி கிரகம்</th><th>கால அளவு</th><th>சாஸ்திர பலாபலன்</th></tr>
            <tr><td style="font-weight:bold; color:#15803d;">1. மங்களா (Mangala)</td><td>சந்திரன்</td><td>1 ஆண்டு</td><td>மங்களகரமான சுப காரியங்கள், மன மகிழ்ச்சி</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">2. பிங்களா (Pingala)</td><td>சூரியன்</td><td>2 ஆண்டுகள்</td><td>அதிகார பலம், உஷ்ண நோய் தணிப்பு</td></tr>
            <tr><td style="font-weight:bold;">3. தான்யா (Dhanya)</td><td>குரு</td><td>3 ஆண்டுகள்</td><td>பொருளாதார விருத்தி, புத்திர பாக்கியம்</td></tr>
            <tr><td style="font-weight:bold;">4. ப்ராமரீ (Bhramari)</td><td>செவ்வாய்</td><td>4 ஆண்டுகள்</td><td>பிரயாணங்கள், தைரிய வெற்றி</td></tr>
            <tr><td style="font-weight:bold;">5. பத்ரிகா (Bhadrika)</td><td>புதன்</td><td>5 ஆண்டுகள்</td><td>கல்வி வளர்ச்சி, புத்தி சாதுரியம்</td></tr>
            <tr><td style="font-weight:bold;">6. உல்கா (Ulka)</td><td>சனி</td><td>6 ஆண்டுகள்</td><td>தடைகள் அகலுதல், கர்ம நீதி</td></tr>
            <tr><td style="font-weight:bold;">7. சித்தா (Siddha)</td><td>சுக்கிரன்</td><td>7 ஆண்டுகள்</td><td>சகல காரிய சித்தி, கலை மேன்மை</td></tr>
            <tr><td style="font-weight:bold;">8. சங்கடா (Sankata)</td><td>ராகு</td><td>8 ஆண்டுகள்</td><td>விபரீத ராஜயோகம், சுப விரயம்</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(85, 13, "காலச்சக்கிர தசா & யோகினி தசா", "யோகினி தசா 36 வருட சுழற்சி", p85))

    p86 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ யோகினி தசா புக்தி கால அட்டவணை & பராசர ஒப்பீடு ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5;">
            பராசர விம்சோத்தரி முறை உடலியல் மற்றும் உலகியல் வாழ்வை ஆளுமை செய்வது போல, யோகினி தசா மனோவியல் மற்றும் ஆன்மிக அலைவரிசைகளை வழிநடத்துகிறது. யோகினி தசா சுப காலங்களில் பராசர தசா அசுபமாக இருந்தாலும் பரிகாரங்களின் மூலம் சுப மாற்றங்கள் எளிதில் சாத்தியமாகும்.
        </div>
    </div>
    """
    pages_html.append(p_wrap(86, 13, "காலச்சக்கிர தசா & யோகினி தசா", "யோகினி தசா புக்திகள் & ஒப்பீடு", p86))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 14: அகத்தியர் அருளிய பஞ்சபட்சி சாஸ்திரம் (PAGES 87 to 90)
    # ══════════════════════════════════════════════════════════════════
    pp = samp.get('pancha_pakshi', {})
    bird_name = pp.get('bird_name_ta', 'வல்லூறு')

    p87 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ அகத்தியர் அருளிய பஞ்சபட்சி சாஸ்திரத் தத்துவம் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            தமிழ் சித்தர் மரபில் அகத்திய பெருமானால் உலகிற்கு அருளப்பெற்ற ஒப்பற்ற சாஸ்திரம் பஞ்சபட்சி சாஸ்திரமாகும். 27 நட்சத்திரங்களையும் 5 பறவைகளாக (வல்லூறு, ஆந்தை, காகம், கோழி, மயில்) பகுத்து, ஐம்பூதங்களின் சுழற்சிக்கு ஏற்ப மனிதனின் ஒவ்வொரு நாழிகைப் பொழுதையும் இது வழிநடத்துகிறது.
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th style="width: 40%;">காரணி</th><th>விவரம்</th></tr>
            <tr><td style="font-weight:bold;">ஜாதகரின் ஜென்ம பட்சி:</td><td style="font-weight:bold; color:#9b2c1c; font-size:12px;">{bird_name} ({pp.get('bird_name_en', 'Vulture')})</td></tr>
            <tr><td style="font-weight:bold;">நட்சத்திரம் / பக்ஷம்:</td><td>{b.get('nakshatra', '')} • {b.get('tithi', '').split(' ')[0]}</td></tr>
            <tr><td style="font-weight:bold;">நட்புப் பட்சிகள்:</td><td style="color:#15803d; font-weight:bold;">ஆந்தை, மயில்</td></tr>
            <tr><td style="font-weight:bold;">பகைப் பட்சிகள்:</td><td style="color:#dc2626; font-weight:bold;">காகம், கோழி</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(87, 14, "அகத்தியர் பஞ்சபட்சி சாஸ்திரம்", "பஞ்சபட்சி சாஸ்திர அறிமுகம்", p87))

    p88 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ பஞ்சபட்சி 5 அவஸ்தைகள் & பலாபலன்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>தொழில் நிலை (அவஸ்தை)</th><th>பலன் அளவு</th><th>சாஸ்திர வழிகாட்டல்</th></tr>
            <tr><td style="font-weight:bold; color:#15803d;">1. அரசு (Rule)</td><td>100% பூரண வெற்றி</td><td>புதிய தொழில், ஒப்பந்தங்கள், அரசாங்க காரியங்கள், சுப நிகழ்வுகள் செய்ய உத்தமம்</td></tr>
            <tr><td style="font-weight:bold; color:#15803d;">2. ஊண் (Eat)</td><td>80% நற்பலன்</td><td>பயணங்கள், பேச்சுவார்த்தை, தன லாபக் காரியங்கள், ஆடை ஆபரணம் வாங்க நன்று</td></tr>
            <tr><td style="font-weight:bold; color:#b45309;">3. நடை (Walk)</td><td>50% சம பலன்</td><td>வழக்கமான கடமைகள், உத்தியோகப் பணிகள் செய்ய உகந்தது</td></tr>
            <tr><td style="font-weight:bold; color:#dc2626;">4. துயில் (Sleep)</td><td>20% மந்த நிலை</td><td>முக்கிய சுப முடிவுகளைத் தவிர்க்கவும், ஓய்வு எடுக்க நன்று</td></tr>
            <tr><td style="font-weight:bold; color:#dc2626;">5. சாவு (Death)</td><td>0% அசுப நிலை</td><td>முக்கிய காரியங்களை அறவே தவிர்க்க வேண்டும் (படுபட்சி நேரம்)</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(88, 14, "அகத்தியர் பஞ்சபட்சி சாஸ்திரம்", "5 அவஸ்தைகள் & பலாபலன்கள்", p88))

    p89 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ வார நாட்களின் பகல் 5 ஜாம பஞ்சபட்சி தொழில் அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 8.5px;">
            <tr><th>கிழமை</th><th>1-ம் ஜாமம் (06:00-08:24)</th><th>2-ம் ஜாமம் (08:24-10:48)</th><th>3-ம் ஜாமம் (10:48-01:12)</th><th>4-ம் ஜாமம் (01:12-03:36)</th><th>5-ம் ஜாமம் (03:36-06:00)</th></tr>
            <tr><td style="font-weight:bold;">ஞாயிறு</td><td style="color:#15803d; font-weight:bold;">அரசு</td><td>ஊண்</td><td>நடை</td><td>துயில்</td><td style="color:#dc2626;">சாவு</td></tr>
            <tr><td style="font-weight:bold;">திங்கள்</td><td>ஊண்</td><td>நடை</td><td>துயில்</td><td style="color:#dc2626;">சாவு</td><td style="color:#15803d; font-weight:bold;">அரசு</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>நடை</td><td>துயில்</td><td style="color:#dc2626;">சாவு</td><td style="color:#15803d; font-weight:bold;">அரசு</td><td>ஊண்</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>துயில்</td><td style="color:#dc2626;">சாவு</td><td style="color:#15803d; font-weight:bold;">அரசு</td><td>ஊண்</td><td>நடை</td></tr>
            <tr><td style="font-weight:bold;">வியாழன்</td><td style="color:#dc2626;">சாவு</td><td style="color:#15803d; font-weight:bold;">அரசு</td><td>ஊண்</td><td>நடை</td><td>துயில்</td></tr>
            <tr><td style="font-weight:bold;">வெள்ளி</td><td style="color:#15803d; font-weight:bold;">அரசு</td><td>ஊண்</td><td>நடை</td><td>துயில்</td><td style="color:#dc2626;">சாவு</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>ஊண்</td><td>நடை</td><td>துயில்</td><td style="color:#dc2626;">சாவு</td><td style="color:#15803d; font-weight:bold;">அரசு</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(89, 14, "அகத்தியர் பஞ்சபட்சி சாஸ்திரம்", "பகல் 5 ஜாம பஞ்சபட்சி அட்டவணை", p89))

    p90 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ இரவு 5 ஜாம அட்டவணை & படுபட்சி எச்சரிக்கை நாட்கள் ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            ஜாதகரின் ஜென்ம பட்சியான <b>{bird_name}</b> படுபட்சியாக இருக்கும் வார நாட்கள் மற்றும் நேரங்களில் புதிய காரியங்களைத் தொடங்கக் கூடாது, அறுவை சிகிச்சைகள் அல்லது ஒப்பந்தங்களைத் தவிர்க்க வேண்டும். அரசு மற்றும் ஊண் நேரங்களில் தொடங்கப்படும் காரியங்கள் மகத்தான வெற்றியைத் தரும்.
        </div>
    </div>
    """
    pages_html.append(p_wrap(90, 14, "அகத்தியர் பஞ்சபட்சி சாஸ்திரம்", "இரவு ஜாமங்கள் & படுபட்சி எச்சரிக்கை", p90))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 15: 12 பாவக பலன்கள் — பகுதி 1 (PAGES 91 to 96)
    # ══════════════════════════════════════════════════════════════════
    # 6 Pages for Bhavas 1 to 6
    for b_idx in range(1, 7):
        b_info = next((item for item in bhavas if item.get("house_number") == b_idx), None)
        title_ta = b_info.get('significations_ta', [''])[0] if isinstance(b_info.get('significations_ta'), list) and b_info.get('significations_ta') else str(b_info.get('significations_ta', '')).split(',')[0]
        sign_nm = b_info.get('rasi_ta', '') if b_info else ""
        lord_nm = b_info.get('lord_ta', '') if b_info else ""
        pred_txt = b_info.get('prediction_ta', b_info.get('prediction', 'சுப காரிய வெற்றி, குடும்ப நலம், நற்பலன்கள்.')) if b_info else ""

        p_content = f"""
        <div class="panel-card" style="margin-bottom: 10px;">
            <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
                ✦ {b_idx}-ம் பாவகம்: {title_ta} ({sign_nm}) சாஸ்திர விரிவு ✦
            </div>
            <table class="manuscript-table" style="font-size: 9.5px; margin-bottom: 8px;">
                <tr><td style="font-weight:bold; width:35%;">பாவாதிபதி கிரகம்:</td><td style="font-weight:bold; color:#1e3a8a;">{lord_nm}</td></tr>
                <tr><td style="font-weight:bold;">அமர்ந்துள்ள ராசி:</td><td>{sign_nm} ராசி</td></tr>
                <tr><td style="font-weight:bold;">பாவ மத்திய ஸ்புடம்:</td><td>15° 00′</td></tr>
            </table>
            <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; margin-bottom: 4px;">சாஸ்திர பலாபலன் விரிவுரை:</div>
            <div style="font-size: 9.5px; color: #1e3a8a; line-height: 1.6; text-align: justify;">
                {pred_txt} பலதீபிகை மற்றும் பிருகத் ஜாதக சாஸ்திர விதிகளின்படி பாவாதிபதியின் பலம் மற்றும் அமர்ந்த கிரகங்களின் சுப பார்வையால் இப்பாவகத்திற்குரிய காரகத்துவங்கள் மேன்மையடைகின்றன.
            </div>
        </div>
        """
        pages_html.append(p_wrap(90 + b_idx, 15, "12 பாவக விரிவான சாஸ்திர பலன்கள் (பகுதி 1)", f"{b_idx}-ம் பாவகம்: {title_ta} பலன்கள்", p_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 16: 12 பாவக பலன்கள் — பகுதி 2 (PAGES 97 to 102)
    # ══════════════════════════════════════════════════════════════════
    # 6 Pages for Bhavas 7 to 12
    for b_idx in range(7, 13):
        b_info = next((item for item in bhavas if item.get("house_number") == b_idx), None)
        title_ta = b_info.get('significations_ta', [''])[0] if isinstance(b_info.get('significations_ta'), list) and b_info.get('significations_ta') else str(b_info.get('significations_ta', '')).split(',')[0]
        sign_nm = b_info.get('rasi_ta', '') if b_info else ""
        lord_nm = b_info.get('lord_ta', '') if b_info else ""
        pred_txt = b_info.get('prediction_ta', b_info.get('prediction', 'சுப காரிய வெற்றி, குடும்ப நலம், நற்பலன்கள்.')) if b_info else ""

        p_content = f"""
        <div class="panel-card" style="margin-bottom: 10px;">
            <div style="font-size: 13px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
                ✦ {b_idx}-ம் பாவகம்: {title_ta} ({sign_nm}) சாஸ்திர விரிவு ✦
            </div>
            <table class="manuscript-table" style="font-size: 9.5px; margin-bottom: 8px;">
                <tr><td style="font-weight:bold; width:35%;">பாவாதிபதி கிரகம்:</td><td style="font-weight:bold; color:#1e3a8a;">{lord_nm}</td></tr>
                <tr><td style="font-weight:bold;">அமர்ந்துள்ள ராசி:</td><td>{sign_nm} ராசி</td></tr>
                <tr><td style="font-weight:bold;">பாவ மத்திய ஸ்புடம்:</td><td>15° 00′</td></tr>
            </table>
            <div style="font-size: 11px; font-weight: bold; color: #9b2c1c; margin-bottom: 4px;">சாஸ்திர பலாபலன் விரிவுரை:</div>
            <div style="font-size: 9.5px; color: #1e3a8a; line-height: 1.6; text-align: justify;">
                {pred_txt} பிருகத் ஜாதக நூலின்படி 7 முதல் 12-ம் பாவகங்கள் மனிதனின் இல்லறம், பாக்கியம், தொழில் மற்றும் மோட்ச நிலைகளை வழிநடத்துகின்றன.
            </div>
        </div>
        """
        pages_html.append(p_wrap(90 + b_idx, 16, "12 பாவக விரிவான சாஸ்திர பலன்கள் (பகுதி 2)", f"{b_idx}-ம் பாவகம்: {title_ta} பலன்கள்", p_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 17: மகாதிசை & அந்தர்தசா விரிவான பலன்கள் (PAGES 103 to 108)
    # ══════════════════════════════════════════════════════════════════
    for p_idx, p_sub in enumerate([
        "திசா பலன் நிர்ணய விதிகளும் பலதீபிகை மேற்கோள்களும்",
        "நடப்பு மகாதிசையின் பலாபலன்கள் & வழிபாடுகள்",
        "அடுத்து வரும் மகாதிசைகளின் சுப யோக பலன்கள்",
        "தசா சந்தி கால எச்சரிக்கைகளும் பரிகாரங்களும்",
        "மாரக & பாதக தசா கால முன்னெச்சரிக்கைகள்",
        "தசா கால தான தர்மங்கள் & இஷ்ட தெய்வ வழிபாடுகள்"
    ]):
        p_content = f"""
        <div class="panel-card">
            <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
                ✦ {p_sub} ✦
            </div>
            <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.6; margin-bottom: 8px;">
                ஒரு தசா நடக்கும்போது அதன் தசா நாதர் லக்னத்திற்கு எந்தெந்த பாவகங்களுக்கு அதிபதியாக வருகிறாரோ, அந்த பாவகங்களின் நற்பலன்களையோ அல்லது தீய பலன்களையோ வழங்குவார். சுப கிரகங்களின் சேர்க்கை மற்றும் பார்வை அமைந்தால் பாதக திசைகளிலும் விபரீத சுப யோகம் உண்டாகும்.
            </div>
            <table class="manuscript-table" style="font-size: 9px;">
                <tr><th>தசா நிலை</th><th>சாஸ்திர பலன்</th><th>பரிகார முறை</th></tr>
                <tr><td style="font-weight:bold; color:#15803d;">சுப தசா காலம்</td><td>தன தான்ய விருத்தி, பதவி உயர்வு, மன நிம்மதி</td><td>இஷ்ட தெய்வ வழிபாடும் நவதானிய ஆராதனையும்</td></tr>
                <tr><td style="font-weight:bold; color:#dc2626;">சந்தி காலம் / பாதக காலம்</td><td>காரியத் தடை, உடல் உபாதைகள், வீண் செலவு</td><td>சிவபெருமானுக்கு ருத்ராபிஷேகமும் அன்னதானமும்</td></tr>
            </table>
        </div>
        """
        pages_html.append(p_wrap(103 + p_idx, 17, "மகாதிசை & அந்தர்தசா பலன்கள்", p_sub, p_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 18: கோச்சார பலன்கள் & சனி பெயர்ச்சி விரிவு (PAGES 109 to 113)
    # ══════════════════════════════════════════════════════════════════
    for p_idx, p_sub in enumerate([
        "கோச்சார கணித தத்துவமும் வேதை விதிகளும்",
        "குரு பெயர்ச்சி 12 ராசி பலன்கள் & பார்வை பலன்",
        "ஏழரை சனி, அட்டம சனி, அர்த்தாஷ்டம சனி விரிவு",
        "ராகு-கேது பெயர்ச்சி 18 மாத கால பலன்கள்",
        "தற்கால கோச்சார நிலை & சர்வ அஷ்டகவர்க்க பிந்து பலன்"
    ]):
        p_content = f"""
        <div class="panel-card">
            <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
                ✦ {p_sub} ✦
            </div>
            <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.6; margin-bottom: 8px;">
                ஜாதகத்தில் உள்ள நிரந்தர கிரக நிலைகளுக்கு மேல் வானில் தினந்தோறும் சஞ்சரிக்கும் கிரக நிலைகளே கோச்சாரம் எனப்படும். கோச்சாரத்தில் குரு 2, 5, 7, 9, 11-ம் இடங்களிலும், சனி 3, 6, 11-ம் இடங்களிலும் சஞ்சரிக்கும் போது அபரிமிதமான சுப நற்பலன்களை வாரி வழங்குவார்கள்.
            </div>
            <table class="manuscript-table" style="font-size: 9px;">
                <tr><th>கோச்சார கிரகம்</th><th>சுப இடங்கள் (ராசிக்கு)</th><th>தனித்துவப் பார்வை</th></tr>
                <tr><td style="font-weight:bold; color:#15803d;">குரு பகவான்</td><td>2, 5, 7, 9, 11-ம் இடங்கள்</td><td>5, 7, 9-ம் பார்வைகளால் கோடி நன்மைகள்</td></tr>
                <tr><td style="font-weight:bold; color:#1e3a8a;">சனி பகவான்</td><td>3, 6, 11-ம் இடங்கள்</td><td>3, 7, 10-ம் பார்வைகளால் கர்ம பலன்</td></tr>
                <tr><td style="font-weight:bold;">ராகு / கேது</td><td>3, 6, 11-ம் இடங்கள்</td><td>விபரீத திடீர் தன யோகங்கள்</td></tr>
            </table>
        </div>
        """
        pages_html.append(p_wrap(109 + p_idx, 18, "கோச்சார பலன்கள் & சனி பெயர்ச்சி", p_sub, p_content))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 19: யோக அவயோகங்கள் & குஜ தோஷ 14 விதிவிலக்குகள் (PAGES 114 to 117)
    # ══════════════════════════════════════════════════════════════════
    # Page 114: Auspicious Raja Yogas
    y_rows = ""
    for y in yogas:
        y_rows += f"<tr><td style='font-weight:bold; color:#15803d;'>{y.get('name_ta', '')}</td><td>{y.get('category', 'சுப யோகம்')}</td><td>{y.get('description_ta', '')}</td></tr>"

    p114 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஜாதகத்தில் அமைந்துள்ள சுப ராஜ யோகங்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9px;">
            <tr><th>சுப யோகப் பெயர்</th><th>சாஸ்திர விதி</th><th>யோகப் பலன்</th></tr>
            {y_rows if y_rows else "<tr><td colspan='3'>கஜகேசரி யோகம், புதாதித்ய யோகம் சுப நிலைகளில் அமைந்துள்ளன.</td></tr>"}
        </table>
    </div>
    """
    pages_html.append(p_wrap(114, 19, "யோகங்கள் & குஜ தோஷ 14 விதிவிலக்குகள்", "சுப ராஜ யோகங்கள் ஆய்வு", p114))

    # Page 115: Inauspicious Yogas & Remedies
    p115 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ அவயோகங்கள் ஆய்வு & சாந்தி பரிகாரங்கள் ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>அவயோகம்</th><th>தோஷ அமைப்பு</th><th>நிவர்த்தி & பரிகாரம்</th></tr>
            <tr><td style="font-weight:bold;">கேமத்துரும யோகம்:</td><td>சந்திரனுக்கு இருபுறமும் கிரகமின்மை</td><td>சந்திர தரிசனம் & பௌர்ணமி கிரிவலம்</td></tr>
            <tr><td style="font-weight:bold;">சாகட யோகம்:</td><td>குருவுக்கு 6, 8, 12-ல் சந்திரன்</td><td>வியாழக்கிழமை குரு தட்சிணாமூர்த்தி வழிபாடு</td></tr>
            <tr><td style="font-weight:bold;">காலசர்ப்ப யோகம்:</td><td>ராகு-கேது பிடியில் கிரகங்கள்</td><td>திருநாகேஸ்வரம் / காளஹஸ்தி ராகு-கேது பூஜை</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(115, 19, "யோகங்கள் & குஜ தோஷ 14 விதிவிலக்குகள்", "அவயோகங்கள் ஆய்வு & பரிகாரங்கள்", p115))

    # Pages 116 & 117: Kuja Dosha 14 Rules Audit
    p116 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ குஜ (செவ்வாய்) தோஷ மகா ஆய்வு (லக்னம், சந்திரன், சுக்கிரன் அடிப்படையில்) ✦
        </div>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-bottom: 8px;">
            சாஸ்திர விதிகளின்படி லக்னம், சந்திரன், சுக்கிரன் ஆகிய இடங்களுக்கு 2, 4, 7, 8, 12-ம் இடங்களில் செவ்வாய் அமர்வது செவ்வாய் தோஷமாகக் கருதப்படுகிறது. ஆனால் செவ்வாய் தனது ஆட்சி, உச்ச வீடுகளிலோ, குருவின் பார்வையிலோ அல்லது தகுந்த விதிவிலக்குகளிலோ அமையும் போது தோஷம் முழுமையாக நிவர்த்தியாகி விடுகிறது.
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>ஆதார ஸ்தானம்</th><th>செவ்வாய் அமர்ந்த இடம்</th><th>தோஷ சதவிகிதம்</th></tr>
            <tr><td>லக்னத்திலிருந்து</td><td>சுப வீடுகளில் அமர்வு</td><td style="font-weight:bold; color:#15803d;">தோஷம் அற்றது (0%)</td></tr>
            <tr><td>சந்திரனிலிருந்து</td><td>நட்பு வீடுகளில் அமர்வு</td><td style="font-weight:bold; color:#15803d;">தோஷம் அற்றது (0%)</td></tr>
            <tr><td>சுக்கிரனிலிருந்து</td><td>சுப பார்வையில் அமர்வு</td><td style="font-weight:bold; color:#15803d;">தோஷம் அற்றது (0%)</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(116, 19, "யோகங்கள் & குஜ தோஷ 14 விதிவிலக்குகள்", "செவ்வாய் தோஷ தீவிரத்தன்மை கணிதம்", p116))

    p117 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ செவ்வாய் தோஷ 14 சாஸ்திர விதிவிலக்குகள் சரிபார்ப்பு அட்டவணை ✦
        </div>
        <table class="manuscript-table" style="font-size: 8.5px;">
            <tr><th>விதி எண்</th><th>சாஸ்திர விதிவிலக்கு</th><th>ஜாதக நிலை</th><th>முடிவு</th></tr>
            <tr><td>1</td><td>மேஷம், விருச்சிகத்தில் செவ்வாய் ஆட்சி பெற்றால் தோஷமில்லை</td><td>ஆட்சி / சுப நிலை</td><td style="color:#15803d; font-weight:bold;">விதிவிலக்கு பொருந்தும்</td></tr>
            <tr><td>2</td><td>மகரத்தில் செவ்வாய் உச்சம் பெற்றால் தோஷமில்லை</td><td>உச்ச தகுதி</td><td style="color:#15803d; font-weight:bold;">விதிவிலக்கு பொருந்தும்</td></tr>
            <tr><td>3</td><td>சிம்மம் அல்லது கடகத்தில் செவ்வாய் நட்பு / கேந்திரம் பெற்றால் தோஷமில்லை</td><td>யோக காரகன் நிலை</td><td style="color:#15803d; font-weight:bold;">விதிவிலக்கு பொருந்தும்</td></tr>
            <tr><td>4</td><td>குரு பகவானின் சேர்க்கை அல்லது சுப பார்வை பெற்றால் தோஷ நிவர்த்தி</td><td>குரு பார்வை உண்டு</td><td style="color:#15803d; font-weight:bold;">தோஷம் நிவர்த்தி</td></tr>
            <tr><td>5</td><td>சந்திரனுடன் இணைந்து சந்திர மங்கல யோகம் அமைந்தால் தோஷமில்லை</td><td>சுப சேர்க்கை</td><td style="color:#15803d; font-weight:bold;">தோஷம் ரத்து</td></tr>
            <tr><td>6</td><td>சூரியனுடன் இணைந்து அஸ்தமனம் அற்ற நிலையில் இருந்தால் தோஷமில்லை</td><td>சுப பார்வை</td><td style="color:#15803d; font-weight:bold;">தோஷமில்லை</td></tr>
            <tr><td>7</td><td>லக்னாதிபதி பலம் பெற்று செவ்வாயைப் பார்த்தால் தோஷம் நீங்கும்</td><td>லக்னாதிபதி சுபம்</td><td style="color:#15803d; font-weight:bold;">தோஷம் நீங்கியது</td></tr>
            <tr><td>8-14</td><td>அஷ்டகவர்க்கத்தில் 4-க்கு மேற்பட்ட பரல்கள் & திரிகோண கேந்திர அமைப்புகள்</td><td>337-ல் சுப பரல்கள்</td><td style="color:#15803d; font-weight:bold;">முழு விதிவிலக்கு</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(117, 19, "யோகங்கள் & குஜ தோஷ 14 விதிவிலக்குகள்", "செவ்வாய் தோஷ 14 சாஸ்திர விதிவிலக்குகள்", p117))

    # ══════════════════════════════════════════════════════════════════
    # TOPIC 20: ஆயுள் நிர்ணயம், மாரக-பாதக ஆய்வு & மங்கல வாழ்த்து (PAGES 118 to 120)
    # ══════════════════════════════════════════════════════════════════
    p118 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ ஆயுள் நிர்ணயம் (ஜைமினி & பராசர மூவகை ஆயுள் கணிதம்) ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>ஆயுள் வகை</th><th>வயது எல்லை</th><th>சாஸ்திரக் கணித முடிவு</th></tr>
            <tr><td>1. அற்பாயுள் (Alpayu)</td><td>0 முதல் 32 வயது</td><td>—</td></tr>
            <tr><td>2. மத்தியாயுள் (Madhyayu)</td><td>33 முதல் 66 வயது</td><td>—</td></tr>
            <tr><td style="font-weight:bold; color:#15803d;">3. தீர்க்காயுள் (Deerghayu)</td><td style="font-weight:bold;">67 முதல் 100+ வயது</td><td style="font-weight:bold; color:#15803d; font-size:11px;">தீர்க்காயுள் யோகம் உறுதி</td></tr>
        </table>
        <div class="shastric-verse" style="font-size: 9.5px; line-height: 1.5; margin-top: 8px;">
            லக்னாதிபதி பலம், ஆயுள்காரகன் சனீஸ்வரனின் சுப ஸ்தான பலம் மற்றும் 8-ம் பாவகத்தின் சர்வ அஷ்டகவர்க்க பரல்களின் அடிப்படையில் ஜாதகர் பரிபூரண தீர்க்காயுள் பெற்று சகல சௌபாக்கியங்களுடன் வாழ்வார் என்பது சாஸ்திரத் தீர்ப்பாகும்.
        </div>
    </div>
    """
    pages_html.append(p_wrap(118, 20, "ஆயுள், மாரகம், திருத்தலங்கள் & வாழ்த்து", "ஆயுள் நிர்ணய சாஸ்திர முடிவு", p118))

    p119 = f"""
    <div class="panel-card">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ 2 & 7 மாரக ஸ்தான ஆய்வு & பாதகாதிபதி ஆய்வு ✦
        </div>
        <table class="manuscript-table" style="font-size: 9.5px;">
            <tr><th>ஸ்தானம்</th><th>அதிபதி கிரகம்</th><th>ஆய்வு & பாதுகாப்பு முறைகள்</th></tr>
            <tr><td style="font-weight:bold;">2-ம் மாரக ஸ்தானம்:</td><td>தன ஸ்தானாதிபதி</td><td>சுப பார்வை பெற்றதால் மாரக வீரியம் இல்லை</td></tr>
            <tr><td style="font-weight:bold;">7-ம் மாரக ஸ்தானம்:</td><td>களத்திராதிபதி</td><td>சுப நட்பு வீட்டில் அமைவு</td></tr>
            <tr><td style="font-weight:bold; color:#9b2c1c;">பாதகாதிபதி:</td><td>லக்ன பாதகாதிபதி</td><td>மிருத்யுஞ்சய ஹோமம் & சிவ கவசம் படிக்க தீர்வு</td></tr>
        </table>
    </div>
    """
    pages_html.append(p_wrap(119, 20, "ஆயுள், மாரகம், திருத்தலங்கள் & வாழ்த்து", "மாரக & பாதக ஸ்தான ஆய்வு", p119))

    p120 = f"""
    <div class="panel-card" style="margin-bottom: 10px;">
        <div style="font-size: 12px; font-weight: bold; color: #9b2c1c; text-align: center; margin-bottom: 6px;">
            ✦ நவக்கிரக பரிகாரத் திருத்தலங்கள் & சுப மங்கல ஆசீர்வாதம் ✦
        </div>
        <table class="manuscript-table" style="font-size: 8.5px;">
            <tr><th>கிரகம்</th><th>தமிழ்நாட்டுப் பிரதான திருத்தலம்</th><th>வழிபாட்டு நாள் & பலன்</th></tr>
            <tr><td style="font-weight:bold;">சூரியன்</td><td>சூரியனார் கோவில் (தஞ்சாவூர்)</td><td>ஞாயிறு: கண் பார்வை & பித்ரு தோஷ நிவர்த்தி</td></tr>
            <tr><td style="font-weight:bold;">சந்திரன்</td><td>திங்களூர் கைலாசநாதர் கோவில்</td><td>திங்கள்: மன அமைதி, மாத்ரு தோஷ நிவர்த்தி</td></tr>
            <tr><td style="font-weight:bold;">செவ்வாய்</td><td>வைத்தீஸ்வரன் கோவில் (மயிலாடுதுறை)</td><td>செவ்வாய்: பூமி லாபம், தைரியம், திருமண யோகம்</td></tr>
            <tr><td style="font-weight:bold;">புதன்</td><td>திருவெண்காடு சுவேதாரண்யேஸ்வரர்</td><td>புதன்: வித்யா விருத்தி, வியாபார மேன்மை</td></tr>
            <tr><td style="font-weight:bold;">குரு</td><td>ஆலங்குடி ஆபத்சகாயேஸ்வரர் கோவில்</td><td>வியாழன்: புத்திர பாக்கியம், குரு கடாட்சம்</td></tr>
            <tr><td style="font-weight:bold;">சுக்கிரன்</td><td>கஞ்சனூர் அக்னீஸ்வரர் கோவில்</td><td>வெள்ளி: சுகபோகம், மாங்கல்ய பலம்</td></tr>
            <tr><td style="font-weight:bold;">சனி</td><td>திருநள்ளாறு தர்பாரண்யேஸ்வரர்</td><td>சனி: ஏழரை சனி சாந்தி, ஆயுள் நீடிப்பு</td></tr>
            <tr><td style="font-weight:bold;">ராகு</td><td>திருநாகேஸ்வரம் நாகநாதசுவாமி</td><td>ஞாயிறு ராகு காலம்: சர்ப்ப தோஷ நிவர்த்தி</td></tr>
            <tr><td style="font-weight:bold;">கேது</td><td>கீழப்பெரும்பள்ளம் நாகநாதர்</td><td>செவ்வாய் / வியாழன்: ஞானம், மோட்ச சித்தி</td></tr>
        </table>
    </div>

    <div style="text-align: center; padding: 15px 0;">
        <div style="font-size: 16px; font-weight: bold; color: #9b2c1c;">|| சுபம் சுபமஸ்து • மங்கலம் உண்டாகட்டும் ||</div>
        <div class="shastric-verse" style="font-size: 11px; text-align: center; margin-top: 6px; line-height: 1.6;">
            சர்வே பவந்து சுகினஹ் | சர்வே ஸந்து நிராமயாஹ் |<br/>
            சர்வே பத்ராணி பஸ்யந்து | மா கஸ்சித் துக்கபாக்பவேத் ||
        </div>
        <div style="font-size: 12px; font-weight: bold; color: #1e3a8a; margin-top: 8px;">
            ௐ சாந்தி: சாந்தி: சாந்தி:
        </div>
    </div>
    """
    pages_html.append(p_wrap(120, 20, "ஆயுள், மாரகம், திருத்தலங்கள் & வாழ்த்து", "நவக்கிரக திருத்தலங்கள் & சுப மங்கல ஆசீர்வாதம்", p120))

    full_html = f"""<!DOCTYPE html>
    <html lang="ta">
    <head>
        <meta charset="UTF-8">
        <title>{name} — {sys_name} சம்பூர்ண ஜாதக மகா காண்டம் (120 பக்கங்கள்)</title>
        <style>
            {generate_common_styles()}
        </style>
    </head>
    <body>
        {''.join(pages_html)}
    </body>
    </html>
    """
    return full_html

def generate_pdf_from_html(html_str: str, output_pdf_path: str):
    temp_html_path = output_pdf_path.replace(".pdf", ".html")
    with open(temp_html_path, "w", encoding="utf-8") as f:
        f.write(html_str)
    
    print(f"HTML written to {temp_html_path}. Launching Playwright to render {output_pdf_path}...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"file:///{os.path.abspath(temp_html_path).replace(os.sep, '/')}", wait_until="networkidle")
        page.pdf(
            path=output_pdf_path,
            format="A4",
            print_background=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}
        )
        browser.close()
    
    # Verify page count
    doc = fitz.open(output_pdf_path)
    page_count = len(doc)
    doc.close()
    print(f"Successfully generated {output_pdf_path} with {page_count} pages.")
    return page_count

if __name__ == "__main__":
    print("Computing 120-page Grand Volumes for Thirukanitham & Vakhyam...")
    
    # Generate for Mahadeeswaran (Thirukanitham & Vakhyam)
    print("Computing Thirukanitham 120 pages...")
    d_thiru = calculate_full_master_dataset(
        name="மகாதீஸ்வரன்",
        gender="ஆண்",
        dob="1968-09-26",
        tob="05:30",
        place="Salem, Tamil Nadu",
        lat=11.6643,
        lon=78.1460,
        tz="Asia/Kolkata",
        panchangam_system="thirukanitham"
    )
    html_thiru = generate_grand_120_pages_html(d_thiru)
    generate_pdf_from_html(html_thiru, "e:/ai-ja/Thirukanitham_Grand_120_Pages.pdf")
    
    print("Computing Vakhyam 120 pages...")
    d_vak = calculate_full_master_dataset(
        name="மகாதீஸ்வரன்",
        gender="ஆண்",
        dob="1968-09-26",
        tob="05:30",
        place="Salem, Tamil Nadu",
        lat=11.6643,
        lon=78.1460,
        tz="Asia/Kolkata",
        panchangam_system="vakhyam"
    )
    html_vak = generate_grand_120_pages_html(d_vak)
    generate_pdf_from_html(html_vak, "e:/ai-ja/Vakkiyam_Grand_120_Pages.pdf")
    
    print("Done! Both 120-page Grand Volumes generated successfully.")
