"""
Compose the five palan sections for one chart from the original text tables:

  பாவக பலன்கள்        — every house: meaning, lord's placement, lord's dignity,
                         planets in the house, Sarvashtakavarga strength
  மகாதிசை பலன்கள்     — every mahadasa: nature, the lord's house, its lordships,
                         then every bhukti with its dates and the dasa/bhukti relation
  குரு / சனி கோச்சார  — dated transit periods (today → +12 y Jupiter, +30 y Saturn)
                         through the houses from the natal Moon, with Sade Sati marks
  யோக அவயோகங்கள்      — classical yogas and avayogas detected in the chart

All sentences come from palan/bhava_text.py and palan/planet_text.py, written
for this website. Nothing is taken from other software.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict, List, Optional

import swisseph as swe

from backend.app.services.palan.bhava_text import BHAVA, LORD_IN
from backend.app.services.palan.planet_text import DASA_NATURE, GURU_GOCHARA, PLANET_IN, SANI_GOCHARA
from backend.app.services.palan.long_text import GURU_LONG, SANI_LONG, YOGAS

SIGN_LORD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"]
SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]
SIGN_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
PL_TA = {"Sun": "சூரியன்", "Moon": "சந்திரன்", "Mars": "செவ்வாய்", "Mercury": "புதன்", "Jupiter": "குரு", "Venus": "சுக்கிரன்",
         "Saturn": "சனி", "Rahu": "ராகு", "Ketu": "கேது"}
FRIENDS = {"Sun": (["Moon", "Mars", "Jupiter"], ["Venus", "Saturn"]), "Moon": (["Sun", "Mercury"], []),
           "Mars": (["Sun", "Moon", "Jupiter"], ["Mercury"]), "Mercury": (["Sun", "Venus"], ["Moon"]),
           "Jupiter": (["Sun", "Moon", "Mars"], ["Mercury", "Venus"]), "Venus": (["Mercury", "Saturn"], ["Sun", "Moon"]),
           "Saturn": (["Mercury", "Venus"], ["Sun", "Moon", "Mars"]),
           "Rahu": (["Venus", "Saturn", "Mercury"], ["Sun", "Moon", "Mars"]), "Ketu": (["Mars", "Jupiter"], ["Moon", "Venus"])}
BENEFIC = {"Jupiter", "Venus", "Mercury", "Moon"}
DIGNITY = {"exalted": ("உச்சம் பெற்று மிகுந்த பலத்துடன் உள்ளது; இந்த பாவத்தின் நற்பலன்கள் முழுமையாகக் கிடைக்கும்.",
                       "is exalted and very strong; the good results of this house come in full."),
           "own": ("ஆட்சி பெற்று வலுவாக உள்ளது; பலன்கள் நிலையாகவும் சிறப்பாகவும் அமையும்.", "is in its own sign and strong; results are steady and good."),
           "friend": ("நட்பு வீட்டில் உள்ளது; பலன்கள் பெரும்பாலும் சாதகமாக அமையும்.", "is in a friend's sign; results are mostly favourable."),
           "neutral": ("சம வீட்டில் உள்ளது; பலன்கள் முயற்சிக்கேற்ப அமையும்.", "is in a neutral sign; results follow one's effort."),
           "enemy": ("பகை வீட்டில் உள்ளது; பலன்கள் தாமதமாகவோ போராட்டத்திற்குப் பின்னோ கிடைக்கும்.", "is in an enemy's sign; results come late or after struggle."),
           "debilitated": ("நீசம் பெற்றுள்ளது; இந்த பாவ விஷயங்களில் கூடுதல் கவனமும் பரிகாரமும் நலம் தரும்.", "is debilitated; extra care and remedies help in this house's matters.")}


def _t(lang: str, ta: str, en: str) -> str:
    return ta if lang == "ta" else en


def _pl(p: str, lang: str) -> str:
    return PL_TA.get(p, p) if lang == "ta" else p


def _sign_of(chart: Dict[str, List[str]], body: str) -> Optional[int]:
    for s, ps in chart.items():
        if body in ps:
            return int(s)
    return None


# --------------------------------------------------------------------------
def bhava_palan(r: Dict[str, Any], lang: str) -> List[Dict[str, Any]]:
    lagna = _sign_of(r["rasi_chart"], "Lagna") or 1
    rows = {x["planet"]: x for x in (r.get("planet_details") or {}).get("rows", [])}
    house_of = {p: ((_sign_of(r["rasi_chart"], p) or lagna) - lagna) % 12 + 1 for p in PL_TA}
    sav = [0] * 12
    for p, x in (r.get("ashtakavarga") or {}).get("planets", {}).items():
        for i, v in enumerate(x.get("bav", [])):
            sav[i] += v
    out = []
    for h in range(1, 13):
        sign = (lagna - 1 + h - 1) % 12 + 1
        lord = SIGN_LORD[sign - 1]
        p = house_of.get(lord, h)
        name_ta, mean_ta, name_en, mean_en = BHAVA[h]
        paras = [_t(lang, mean_ta, mean_en)]
        lta, len_ = LORD_IN[h][p]
        paras.append(_t(lang, f"இந்த பாவத்தின் அதிபதி {PL_TA[lord]} {p}-ம் பாவத்தில் உள்ளார். {lta}",
                        f"The lord of this house, {lord}, is in house {p}. {len_}"))
        d = rows.get(lord)
        if d and d.get("dignity") in DIGNITY:
            ta, en = DIGNITY[d["dignity"]]
            extra_ta, extra_en = [], []
            if d.get("retrograde"):
                extra_ta.append("வக்கிரமாக இருப்பதால் பலன்கள் சற்று தாமதமாகவோ மீண்டும் முயற்சியிலோ கிடைக்கும்")
                extra_en.append("being retrograde, results may come after delay or repeated effort")
            if d.get("combust"):
                extra_ta.append("அஸ்தங்கமாக இருப்பதால் இதன் பலம் சற்று குறையும்")
                extra_en.append("being combust, its strength is reduced")
            asp = [a for a in d.get("aspected_by", []) if a in PL_TA]
            if asp:
                good = [a for a in asp if a in BENEFIC]
                if good:
                    extra_ta.append(f"{', '.join(PL_TA[a] for a in good)} பார்வையால் சுப பலம் கூடும்")
                    extra_en.append(f"the aspect of {', '.join(good)} adds benefic strength")
            ta_s = ta.rstrip(".") + ("; " + "; ".join(extra_ta) if extra_ta else "") + "."
            en_s = en.rstrip(".") + ("; " + "; ".join(extra_en) if extra_en else "") + "."
            paras.append(_t(lang, f"{PL_TA[lord]} {ta_s}", f"{lord} {en_s}"))
        occ = [q for q, hh in house_of.items() if hh == h]
        for q in occ:
            ta, en = PLANET_IN[q][h]
            paras.append(_t(lang, ta, en))
        if not occ:
            paras.append(_t(lang, "இந்த பாவத்தில் கிரகங்கள் இல்லை; இதன் பலன்கள் பெரும்பாலும் அதிபதியின் நிலையைப் பொறுத்தே அமையும்.",
                            "No planet occupies this house; its results depend mainly on the lord's condition."))
        b = sav[sign - 1]
        if b:
            if b >= 30:
                s_ta, s_en = "மிக வலுவானது; இந்த பாவ விஷயங்கள் சிறப்பாக அமையும்", "very strong; this house's matters flourish"
            elif b >= 28:
                s_ta, s_en = "வலுவானது; நற்பலன்கள் உறுதியாகக் கிடைக்கும்", "strong; good results are assured"
            elif b >= 25:
                s_ta, s_en = "சராசரி பலம்; முயற்சிக்கேற்ப பலன்", "of average strength; results match the effort"
            else:
                s_ta, s_en = "பலம் குறைவு; இந்த விஷயங்களில் கூடுதல் கவனம் நலம்", "weak; extra care in these matters helps"
            paras.append(_t(lang, f"சர்வாஷ்டகவர்க்கத்தில் இந்த ராசிக்கு {b} பரல்கள் — {s_ta}.",
                            f"Sarvashtakavarga gives this sign {b} bindus — {s_en}."))
        out.append({"house": h, "title": _t(lang, f"{h}. {name_ta} — {SIGN_TA[sign - 1]} (அதிபதி {PL_TA[lord]})",
                                            f"{h}. {name_en} — {SIGN_EN[sign - 1]} (lord {lord})"),
                    "paragraphs": paras})
    return out


# --------------------------------------------------------------------------
def _relation(a: str, b: str) -> str:
    f, e = FRIENDS.get(a, ([], []))
    return "friend" if b in f else ("enemy" if b in e else "neutral")


def dasa_palan(r: Dict[str, Any], lang: str) -> List[Dict[str, Any]]:
    lagna = _sign_of(r["rasi_chart"], "Lagna") or 1
    sign_of = {p: _sign_of(r["rasi_chart"], p) for p in PL_TA}
    house_of = {p: ((s or lagna) - lagna) % 12 + 1 for p, s in sign_of.items()}
    lords_of = {p: [h for h in range(1, 13) if SIGN_LORD[(lagna - 1 + h - 1) % 12] == p] for p in PL_TA}
    out = []
    for d in r["dashas"]:
        lord = d["planet"]
        h = house_of.get(lord, 1)
        nat_ta, nat_en = DASA_NATURE[lord]
        pin_ta, pin_en = PLANET_IN[lord][h]
        owned = lords_of.get(lord, [])
        own_ta = ", ".join(f"{n}-ம் பாவம் ({BHAVA[n][0]})" for n in owned)
        own_en = ", ".join(f"house {n} ({BHAVA[n][2]})" for n in owned)
        paras = [_t(lang, nat_ta, nat_en),
                 _t(lang, f"ஜாதகத்தில் {PL_TA[lord]} {h}-ம் பாவத்தில் உள்ளார். {pin_ta}", f"In this chart {lord} is in house {h}. {pin_en}")]
        if owned:
            paras.append(_t(lang, f"{PL_TA[lord]} {own_ta} ஆகியவற்றின் அதிபதி என்பதால், இத்தசையில் இந்த பாவ விஷயங்கள் முன்னிலை பெறும்.",
                            f"As lord of {own_en}, these matters come forward in this dasa."))
        bhuktis = []
        for b in d["bhuktis"]:
            bl = b["planet"]
            rel = _relation(lord, bl)
            dist = ((house_of.get(bl, 1) - h) % 12) + 1
            if dist in (6, 8, 12):
                pos_ta, pos_en = "தசாநாதனுக்கு மறைவு ஸ்தானத்தில் இருப்பதால் சில சவால்கள் வரலாம்; பொறுமை நலம்", "sits in a hidden house from the dasa lord, so some challenges may arise; patience helps"
            elif dist in (1, 4, 7, 10, 5, 9):
                pos_ta, pos_en = "தசாநாதனுக்கு கேந்திர / திரிகோணத்தில் இருப்பதால் முன்னேற்றம் உண்டு", "sits in a kendra or trikona from the dasa lord, bringing progress"
            else:
                pos_ta, pos_en = "தசாநாதனுக்கு சாதாரண நிலையில் உள்ளதால் கலவையான பலன்கள்", "sits in an ordinary position from the dasa lord, giving mixed results"
            rel_ta = {"friend": "நட்பு", "enemy": "பகை", "neutral": "சம"}[rel]
            bh = house_of.get(bl, 1)
            rel_txt_ta = "தசாநாதனின் சொந்த புக்தி" if bl == lord else f"தசாநாதனுடன் {rel_ta} உறவு"
            rel_txt_en = "the dasa lord's own bhukti" if bl == lord else f"{rel} to the dasa lord"
            if bl == lord:
                pos_ta, pos_en = "தசையின் அடிப்படைப் பலன்கள் இப்போது வெளிப்படும்", "shows the basic results of the dasa"
            bhuktis.append(_t(lang,
                f"{PL_TA[bl]} புக்தி (முடிவு {b['end_date_display']}): {rel_txt_ta}; {pos_ta}. "
                f"{PL_TA[bl]} {bh}-ம் பாவத்தில் இருப்பதால் {BHAVA[bh][0]} தொடர்பான விஷயங்கள் இந்தப் புக்தியில் செயல்படும்.",
                f"{bl} bhukti (ends {b['end_date_display']}): {rel_txt_en}; it {pos_en}. "
                f"With {bl} in house {bh}, matters of {BHAVA[bh][2]} are active in this bhukti."))
        out.append({"title": _t(lang, f"{PL_TA[lord]} மகா தசை — {d['start_date_display']} முதல் {d['end_date_display']} வரை",
                                f"{lord} Mahadasa — {d['start_date_display']} to {d['end_date_display']}"),
                    "paragraphs": paras, "bhuktis": bhuktis})
    return out


# --------------------------------------------------------------------------
def _transit_periods(body: int, start: date, years: int) -> List[Dict[str, Any]]:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    out: List[Dict[str, Any]] = []
    d = start
    cur = None
    seg_start = start
    end = start + timedelta(days=int(365.25 * years))
    while d <= end:
        jd = swe.julday(d.year, d.month, d.day, 12.0)
        x = swe.calc_ut(jd, body, swe.FLG_SIDEREAL)[0]
        sign = int(x[0] // 30) + 1
        if cur is None:
            cur = sign
        elif sign != cur:
            out.append({"sign": cur, "from": seg_start, "to": d - timedelta(days=1)})
            cur, seg_start = sign, d
        d += timedelta(days=2)
    out.append({"sign": cur, "from": seg_start, "to": end})
    return out


HOUSE_PLACE_TA = {1: "ஜென்ம", 2: "தன", 3: "சகாய", 4: "சுக", 5: "பூர்வ புண்ணிய", 6: "ருண ரோக சத்ரு", 7: "களத்திர",
                  8: "அஷ்டம", 9: "பாக்கிய", 10: "ஜீவன", 11: "லாப", 12: "விரய"}
HOUSE_PLACE_EN = {1: "the Moon sign", 2: "wealth", 3: "effort", 4: "comfort", 5: "merit", 6: "enemies", 7: "partner",
                  8: "obstacles", 9: "fortune", 10: "profession", 11: "gains", 12: "expenditure"}
ORD_TA = {1: "ஜென்ம ராசியிலேயே", 2: "இரண்டில்", 3: "மூன்றில்", 4: "நான்கில்", 5: "ஐந்தில்", 6: "ஆறில்", 7: "ஏழில்",
          8: "எட்டில்", 9: "ஒன்பதில்", 10: "பத்தில்", 11: "பதினொன்றில்", 12: "பன்னிரண்டில்"}
TRANSIT_DIGNITY = {
    "Jupiter": {4: "exalted", 10: "debilitated", 9: "own", 12: "own", 1: "friend", 5: "friend", 8: "friend",
                3: "enemy", 6: "enemy", 2: "enemy", 7: "enemy", 11: "neutral"},
    "Saturn": {7: "exalted", 1: "debilitated", 10: "own", 11: "own", 2: "friend", 3: "friend", 6: "friend",
               4: "enemy", 5: "enemy", 8: "enemy", 9: "neutral", 12: "neutral"},
}
SIGN_STEM_TA = ["மேஷ", "ரிஷப", "மிதுன", "கடக", "சிம்ம", "கன்னி", "துலா", "விருச்சிக", "தனுசு", "மகர", "கும்ப", "மீன"]
SIGN_DAT_TA = ["மேஷத்திற்கு", "ரிஷபத்திற்கு", "மிதுனத்திற்கு", "கடகத்திற்கு", "சிம்மத்திற்கு", "கன்னிக்கு", "துலாத்திற்கு",
               "விருச்சிகத்திற்கு", "தனுசுக்கு", "மகரத்திற்கு", "கும்பத்திற்கு", "மீனத்திற்கு"]
DIG_WORD = {"exalted": ("உச்சம்", "exalted"), "debilitated": ("நீசம்", "debilitated"), "own": ("ஆட்சி", "in its own sign"),
            "friend": ("நட்பு", "in a friendly sign"), "enemy": ("பகை", "in an enemy sign"), "neutral": ("சமம்", "in a neutral sign")}


def gochara_palan(r: Dict[str, Any], lang: str, today: Optional[date] = None) -> Dict[str, List[Dict[str, Any]]]:
    """Kalai-style paragraphs: one block per transit period —
    "<sign> ராசியில் குரு சஞ்சரிக்கும் காலம் ஆரம்பம்: dd/mm/yyyy முடிவு: dd/mm/yyyy வயது N", then the
    effect paragraph (house from the natal Moon, the planet's dignity, its own ashtakavarga bindus)."""
    moon = _sign_of(r["rasi_chart"], "Moon") or 1
    today = today or date.today()
    try:
        birth = date.fromisoformat(r["dashas"][0]["start_date"])
    except Exception:
        birth = None
    av = (r.get("ashtakavarga") or {}).get("planets", {})
    res: Dict[str, List[Dict[str, Any]]] = {}
    for key, planet, body, years, table, short in (("guru", "Jupiter", swe.JUPITER, 7, GURU_LONG, GURU_GOCHARA),
                                                   ("sani", "Saturn", swe.SATURN, 12, SANI_LONG, SANI_GOCHARA)):
        blocks = []
        for seg in _transit_periods(body, today, years):
            sign = seg["sign"]
            house = (sign - moon) % 12 + 1
            dig = TRANSIT_DIGNITY[planet][sign]
            age = (seg["from"].year - birth.year - ((seg["from"].month, seg["from"].day) < (birth.month, birth.day))) if birth else None
            pl_ta = "குரு" if planet == "Jupiter" else "சனி"
            title = _t(lang,
                       f"{SIGN_STEM_TA[sign - 1]} ராசியில் {pl_ta} சஞ்சரிக்கும் காலம் — ஆரம்பம்: {seg['from'].strftime('%d/%m/%Y')} முடிவு: {seg['to'].strftime('%d/%m/%Y')}" + (f" (வயது {age})" if age is not None else ""),
                       f"{planet} transiting {SIGN_EN[sign - 1]} — from {seg['from'].strftime('%d/%m/%Y')} to {seg['to'].strftime('%d/%m/%Y')}" + (f" (age {age})" if age is not None else ""))
            moon_ta, moon_en = SIGN_TA[moon - 1], SIGN_EN[moon - 1]
            lead = _t(lang,
                      f"ஜென்ம ராசியான {SIGN_DAT_TA[moon - 1]} {ORD_TA[house]} {SIGN_STEM_TA[sign - 1]} ராசியில் {DIG_WORD[dig][0]} பெற்று "
                      f"{HOUSE_PLACE_TA[house]} ஸ்தானத்தில் {pl_ta} சஞ்சரிக்கிறார்.",
                      f"{planet} moves through {SIGN_EN[sign - 1]}, house {house} from the natal Moon sign {moon_en} (the house of {HOUSE_PLACE_EN[house]}), {DIG_WORD[dig][1]}.")
            body_ta, body_en = table[house]
            paras = [lead + " " + _t(lang, body_ta, body_en)]
            bav = (av.get(planet) or {}).get("bav")
            if bav:
                b = bav[sign - 1]
                if b >= 5:
                    s_ta, s_en = "அதிக பரல்கள் இருப்பதால் நற்பலன்கள் கூடுதலாகவும், சிரமங்கள் குறைவாகவும் இருக்கும்", "the high count strengthens the good results and softens the difficulties"
                elif b >= 4:
                    s_ta, s_en = "சராசரி பரல்கள் இருப்பதால் மேற்கூறிய பலன்கள் அப்படியே நடக்கும்", "the average count lets the results above unfold as described"
                else:
                    s_ta, s_en = "பரல்கள் குறைவாக இருப்பதால் நற்பலன்கள் சற்றுக் குறையும்; பரிகாரம் நலம்", "the low count weakens the good results; remedies help"
                paras.append(_t(lang, f"{pl_ta}வின் அஷ்டவர்க்கத்தில் {SIGN_STEM_TA[sign - 1]} ராசிக்கு {b} பரல்கள் உள்ளன; {s_ta}.",
                                f"In {planet}'s own ashtakavarga, {SIGN_EN[sign - 1]} has {b} bindus; {s_en}."))
            if planet == "Saturn" and house in (12, 1, 2):
                phase = {12: ("தொடக்க", "first"), 1: ("நடு", "middle"), 2: ("இறுதி", "last")}[house]
                paras.append(_t(lang, f"இது ஏழரைச் சனியின் {phase[0]}ப் பகுதியாகும்.", f"This is the {phase[1]} phase of Sade Sati."))
            blocks.append({"title": title, "paragraphs": paras, "house": house, "quality": short[house][2]})
        res[key] = blocks
    return res


# --------------------------------------------------------------------------
def yoga_palan(r: Dict[str, Any], lang: str) -> List[Dict[str, str]]:
    lagna = _sign_of(r["rasi_chart"], "Lagna") or 1
    s = {p: _sign_of(r["rasi_chart"], p) for p in PL_TA}
    h = {p: ((v or lagna) - lagna) % 12 + 1 for p, v in s.items()}
    dig = {x["planet"]: x.get("dignity") for x in (r.get("planet_details") or {}).get("rows", [])}
    kendra = {1, 4, 7, 10}
    out: List[Dict[str, str]] = []

    MORE = {
        "கஜகேசரி யோகம்": ("இந்த யோகம் உள்ளவர்கள் பெரியோர்களின் அன்பையும் சமூகத்தில் நீடித்த மதிப்பையும் பெறுவார்கள்; குரு, சந்திரன் தசா புக்திகளில் இதன் பலன் தெளிவாக வெளிப்படும்.",
                          "Natives with this yoga win the affection of elders and lasting respect; its results show clearly in the dasas and bhuktis of Jupiter and the Moon."),
        "புதாதித்ய யோகம்": ("இந்த யோகம் உள்ளவர்கள் கணக்கு, நிர்வாகம், அரசுப் பணி, ஆலோசனைத் துறைகளில் சிறந்து விளங்குவார்கள்; சூரியனிடமிருந்து புதன் அஸ்தங்கமாகாமல் இருந்தால் பலன் முழுமையாகும்.",
                            "Natives with this yoga excel in accounts, administration, government and advisory work; the effect is full when Mercury is not combust."),
        "சந்திர மங்கள யோகம்": ("இந்த யோகம் உள்ளவர்கள் துணிச்சலான முயற்சிகளால் பொருள் சேர்ப்பார்கள்; நிலம், வியாபாரம், தொழிற்சாலை சார்ந்த துறைகளில் லாபம் கிடைக்கும். கோபத்தைக் கட்டுப்படுத்தினால் பலன் கூடும்.",
                               "Natives with this yoga gain through bold enterprise, with profit in land, trade or industry; controlling anger increases the benefit."),
        "விபரீத ராஜ யோகம்": ("இந்த யோகம் உள்ளவர்கள் கடினமான சூழல்களிலிருந்து எதிர்பாராத வகையில் மீண்டு உயர்வார்கள்; சம்பந்தப்பட்ட கிரகங்களின் தசா புக்தியில் இதன் பலன் வெளிப்படும்.",
                              "Natives with this yoga rise unexpectedly out of difficult situations; the result appears in the dasas and bhuktis of the planets involved."),
        "தர்மகர்மாதிபதி யோகம்": ("இந்த யோகம் உள்ளவர்கள் நேர்மையான தொழிலால் உயர் பதவியும் சமூக மதிப்பும் பெறுவார்கள்; அதிர்ஷ்டமும் உழைப்பும் இணைந்து செயல்படும்.",
                                 "Natives with this yoga attain high position and respect through honest work; fortune and effort work together."),
    }

    def add(kind, ta, en, ta_txt, en_txt):
        extra = MORE.get(ta)
        if extra:
            ta_txt, en_txt = ta_txt + " " + extra[0], en_txt + " " + extra[1]
        out.append({"kind": kind, "name": _t(lang, ta, en), "text": _t(lang, ta_txt, en_txt)})

    rel_moon = lambda p: ((s[p] or 1) - (s["Moon"] or 1)) % 12 + 1
    if rel_moon("Jupiter") in kendra:
        add("yoga", "கஜகேசரி யோகம்", "Gaja Kesari Yoga",
            "சந்திரனுக்குக் கேந்திரத்தில் குரு இருப்பதால் கஜகேசரி யோகம்: புகழ், அறிவு, செல்வம், சமூக மதிப்பு; எதிரிகளை வெல்லும் ஆற்றல்.",
            "Jupiter in a kendra from the Moon: fame, wisdom, wealth and social respect; power over rivals.")
    if s["Sun"] == s["Mercury"]:
        add("yoga", "புதாதித்ய யோகம்", "Budha-Aditya Yoga",
            "சூரியனும் புதனும் சேர்ந்திருப்பதால் புதாதித்ய யோகம்: கூர்மையான அறிவு, கல்வி, நிர்வாகத் திறன், பேச்சாற்றல்.",
            "Sun with Mercury: sharp intellect, learning, administrative skill and eloquence.")
    if s["Moon"] == s["Mars"]:
        add("yoga", "சந்திர மங்கள யோகம்", "Chandra-Mangala Yoga",
            "சந்திரனும் செவ்வாயும் சேர்ந்திருப்பதால் சந்திர மங்கள யோகம்: முயற்சியால் செல்வம், வியாபாரத் துணிவு.",
            "Moon with Mars: wealth through enterprise and boldness in business.")
    for p, ta, en, txt_ta, txt_en in (
        ("Mars", "ருசக யோகம்", "Ruchaka Yoga", "செவ்வாய் கேந்திரத்தில் ஆட்சி / உச்சம்: வீரம், தலைமை, நிலம், அதிகாரம்.", "Mars strong in a kendra: valour, leadership, land and authority."),
        ("Mercury", "பத்ர யோகம்", "Bhadra Yoga", "புதன் கேந்திரத்தில் ஆட்சி / உச்சம்: அறிவாற்றல், பேச்சுத் திறன், வியாபார வெற்றி.", "Mercury strong in a kendra: intellect, eloquence and business success."),
        ("Jupiter", "ஹம்ச யோகம்", "Hamsa Yoga", "குரு கேந்திரத்தில் ஆட்சி / உச்சம்: ஞானம், நற்குணம், மதிப்பு, ஆன்மிக உயர்வு.", "Jupiter strong in a kendra: wisdom, virtue, honour and spiritual elevation."),
        ("Venus", "மாளவ்ய யோகம்", "Malavya Yoga", "சுக்கிரன் கேந்திரத்தில் ஆட்சி / உச்சம்: அழகு, கலை, சுகபோகம், வாகன யோகம்.", "Venus strong in a kendra: beauty, arts, comforts and vehicles."),
        ("Saturn", "சச யோகம்", "Shasha Yoga", "சனி கேந்திரத்தில் ஆட்சி / உச்சம்: அதிகாரம், நிர்வாகம், உழைப்பால் உயர்வு, மக்கள் செல்வாக்கு.", "Saturn strong in a kendra: authority, administration, rise through labour and public influence.")):
        if h[p] in kendra and dig.get(p) in ("own", "exalted"):
            add("yoga", ta, en, txt_ta, txt_en)
    lords = {n: SIGN_LORD[(lagna - 1 + n - 1) % 12] for n in range(1, 13)}
    for n in (6, 8, 12):
        if h.get(lords[n]) in (6, 8, 12) and h.get(lords[n]) != n:
            add("yoga", "விபரீத ராஜ யோகம்", "Viparita Raja Yoga",
                f"{n}-ம் அதிபதி மறைவு ஸ்தானத்தில் இருப்பதால் விபரீத ராஜ யோகம்: எதிர்பாராத திருப்பங்களுக்குப் பின் உயர்வு, எதிரிகள் தாமே விலகுவர்.",
                f"The {n}th lord in a hidden house: rise after unexpected turns; enemies fall away.")
            break
    if lords[9] == lords[10] or s[lords[9]] == s[lords[10]] or h[lords[9]] == 10 or h[lords[10]] == 9:
        add("yoga", "தர்மகர்மாதிபதி யோகம்", "Dharma-Karmadhipati Yoga",
            "9-ம் மற்றும் 10-ம் அதிபதிகளின் தொடர்பால் தர்மகர்மாதிபதி யோகம்: நேர்மையான தொழிலில் உயர்வு, அதிர்ஷ்டமும் அதிகாரமும்.",
            "Link between the 9th and 10th lords: rise in an honest career, fortune and authority.")
    # avayogas
    m = s["Moon"] or 1
    neighbours = {(m % 12) + 1, ((m - 2) % 12) + 1}
    others = [p for p in ("Sun", "Mars", "Mercury", "Jupiter", "Venus", "Saturn") if p != "Sun"]
    if not any(s[p] in neighbours | {m} for p in others):
        add("avayoga", "கேமத்ரும யோகம் (அவயோகம்)", "Kemadruma (avayoga)",
            "சந்திரனுக்கு இருபுறமும் கிரகங்கள் இல்லாததால் கேமத்ரும யோகம்: மனச் சஞ்சலம், தனிமை உணர்வு வரலாம்; சந்திர வழிபாடு, பௌர்ணமி விரதம் நலம்.",
            "No planet beside the Moon: restlessness or loneliness may arise; Moon worship and full-moon observances help.")
    if rel_moon("Jupiter") in (6, 8, 12):
        add("avayoga", "சகட யோகம் (அவயோகம்)", "Shakata (avayoga)",
            "சந்திரனுக்கு 6 / 8 / 12-ல் குரு இருப்பதால் சகட யோகம்: வாழ்க்கையில் ஏற்றத்தாழ்வுகள்; குரு வழிபாடு நலம் தரும்.",
            "Jupiter in the 6th/8th/12th from the Moon: ups and downs in life; worship of Guru helps.")
    if s["Jupiter"] in (s["Rahu"], s["Ketu"]):
        add("avayoga", "குரு சண்டாள யோகம் (அவயோகம்)", "Guru-Chandala (avayoga)",
            "குருவுடன் ராகு / கேது சேர்க்கை: பெரியோர் சொல்லைக் கேட்பதும் நேர்மையான வழியும் அவசியம்; குரு வழிபாடு நலம்.",
            "Jupiter with Rahu/Ketu: heeding elders and keeping to honest ways are essential; Guru worship helps.")
    for lum in ("Sun", "Moon"):
        if s[lum] in (s["Rahu"], s["Ketu"]):
            add("avayoga", "கிரகண தோஷம் (அவயோகம்)", "Grahana dosha (avayoga)",
                f"{PL_TA[lum]} ராகு / கேதுவுடன் சேர்ந்திருப்பதால் கிரகண தோஷம்: {'தந்தை, அரசு விஷயங்களில்' if lum == 'Sun' else 'மன அமைதி, தாய் விஷயங்களில்'} கவனம்; சிவ / துர்கை வழிபாடு நலம்.",
                f"{lum} with Rahu/Ketu: care in matters of {'father and authority' if lum == 'Sun' else 'peace of mind and mother'}; worship of Shiva or Durga helps.")
            break
    def addk(key, why_ta, why_en, kind="yoga"):
        n_ta, n_en, e_ta, e_en = YOGAS[key]
        add(kind, n_ta, n_en, f"{why_ta} {n_ta} ஏற்பட்டுள்ளது. {e_ta}", f"{why_en}, forming {n_en}. {e_en}")

    seven = ("Mars", "Mercury", "Jupiter", "Venus", "Saturn")
    from_moon = lambda p: ((s[p] or 1) - (s["Moon"] or 1)) % 12 + 1
    from_sun = lambda p: ((s[p] or 1) - (s["Sun"] or 1)) % 12 + 1
    s2 = [p for p in seven if from_moon(p) == 2]
    s12 = [p for p in seven if from_moon(p) == 12]
    if s2 and s12:
        addk("durudhura", "சந்திரனுக்கு இரண்டிலும் பன்னிரண்டிலும் கிரகங்கள் இருப்பதால்", "Planets occupy both the 2nd and 12th from the Moon")
    elif s2:
        addk("sunapha", "சந்திரனுக்கு இரண்டாம் ராசியில் ராகு கேதுக்களைத் தவிர மற்ற கிரகங்கள் இருப்பதால்", "A planet other than Rahu/Ketu is in the 2nd from the Moon")
    elif s12:
        addk("anapha", "சந்திரனுக்குப் பன்னிரண்டாம் ராசியில் ராகு கேதுக்களைத் தவிர மற்ற கிரகங்கள் இருப்பதால்", "A planet other than Rahu/Ketu is in the 12th from the Moon")
    v2 = [p for p in ("Moon",) + seven if p != "Moon" and from_sun(p) == 2]
    v12 = [p for p in seven if from_sun(p) == 12]
    if v2 and v12:
        addk("ubhayachari", "சூரியனுக்கு இரண்டிலும் பன்னிரண்டிலும் கிரகங்கள் இருப்பதால்", "Planets occupy both the 2nd and 12th from the Sun")
    elif v2:
        addk("vesi", "சூரியனுக்கு இரண்டாம் ராசியில் கிரகம் இருப்பதால்", "A planet is in the 2nd from the Sun")
    elif v12:
        addk("vasi", "சூரியனுக்குப் பன்னிரண்டாம் ராசியில் கிரகம் இருப்பதால்", "A planet is in the 12th from the Sun")
    upa = [p for p in ("Jupiter", "Venus", "Mercury") if from_moon(p) in (3, 6, 10, 11) or h[p] in (3, 6, 10, 11)]
    if len(upa) >= 2:
        addk("vasumathi", "சுப கிரகங்கள் லக்னம் அல்லது சந்திரனுக்கு உபசய ஸ்தானங்களில் (3, 6, 10, 11) இருப்பதால்", "Benefics occupy upachaya houses (3, 6, 10, 11) from the Lagna or Moon")
    if any(h[p] == 10 or from_moon(p) == 10 for p in ("Jupiter", "Venus", "Mercury")):
        addk("amala", "லக்னம் அல்லது சந்திரனுக்குப் பத்தாம் இடத்தில் சுப கிரகம் இருப்பதால்", "A benefic is in the 10th from the Lagna or Moon")
    if sum(1 for p in ("Jupiter", "Venus", "Mercury") if from_moon(p) in (6, 7, 8)) >= 2:
        addk("adhi", "சந்திரனுக்கு 6, 7, 8-ம் இடங்களில் சுப கிரகங்கள் இருப்பதால்", "Benefics occupy the 6th, 7th and 8th from the Moon")
    l9 = lords[9]
    if h.get(l9) in (1, 4, 5, 7, 9, 10) and dig.get(l9) in ("own", "exalted"):
        addk("lakshmi", "ஒன்பதாம் அதிபதி கேந்திர திரிகோணத்தில் ஆட்சி / உச்சம் பெற்றிருப்பதால்", "The 9th lord is strong (own/exalted) in a kendra or trikona")
    if all(h[p] in (1, 2, 4, 5, 7, 9, 10) for p in ("Jupiter", "Venus", "Mercury")) and dig.get("Jupiter") in ("own", "exalted", "friend"):
        addk("saraswati", "குரு, சுக்கிரன், புதன் மூவரும் கேந்திர, திரிகோண, தன ஸ்தானங்களில் இருப்பதால்", "Jupiter, Venus and Mercury are in kendras, trikonas or the 2nd")
    for p in seven + ("Sun", "Moon"):
        if dig.get(p) == "debilitated":
            disp = SIGN_LORD[(s[p] or 1) - 1]
            if h.get(disp) in kendra or from_moon(disp) in kendra:
                addk("neechabhanga", f"நீசம் பெற்ற {PL_TA[p]} நின்ற ராசிநாதன் {PL_TA[disp]} லக்னத்திற்கோ சந்திரனுக்கோ கேந்திரத்தில் இருப்பதால்",
                     f"The dispositor of debilitated {p}, {disp}, is in a kendra from the Lagna or Moon")
                break
    seen = set()
    for a_ in ("Sun", "Moon") + seven:
        for b_ in ("Sun", "Moon") + seven:
            if a_ < b_ and s[a_] and s[b_] and SIGN_LORD[s[a_] - 1] == b_ and SIGN_LORD[s[b_] - 1] == a_ and (a_, b_) not in seen:
                seen.add((a_, b_))
                addk("parivartana", f"{PL_TA[a_]} {PL_TA[b_]} வீட்டிலும், {PL_TA[b_]} {PL_TA[a_]} வீட்டிலும் இருப்பதால் (பாவங்கள் {h[a_]} ↔ {h[b_]})",
                     f"{a_} is in {b_}'s sign and {b_} in {a_}'s (houses {h[a_]} ↔ {h[b_]})")
    if not out:
        add("yoga", "குறிப்பு", "Note", "இந்த ஜாதகத்தில் முக்கிய யோக / அவயோகங்கள் காணப்படவில்லை; பலன்கள் பாவ, தசை நிலையைப் பொறுத்து அமையும்.",
            "No major yoga or avayoga is formed; results follow the houses and dasas.")
    return out


def compose_palan(r: Dict[str, Any], lang: str = "ta", today: Optional[date] = None) -> Dict[str, Any]:
    return {"bhava": bhava_palan(r, lang), "dasa": dasa_palan(r, lang),
            "gochara": gochara_palan(r, lang, today), "yoga": yoga_palan(r, lang)}
