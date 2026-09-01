import sys
import codecs
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

import swisseph as swe
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.geocode import resolve_place

cases = [
    ('1950-01-26', '09:00:00', 'New Delhi, Delhi, India', '1950 Republic Day'),
    ('1985-05-12', '10:30:00', 'Chennai, Tamil Nadu, India', '1985 Chennai'),
    ('1996-08-15', '07:00:00', 'Coimbatore, Tamil Nadu, India', '1996 Coimbatore'),
    ('2004-12-31', '14:10:00', 'Pollachi, Tamil Nadu, India', '2004 Manosakthi'),
    ('2015-06-20', '18:45:00', 'Madurai, Tamil Nadu, India', '2015 Madurai'),
    ('2024-01-01', '06:00:00', 'Tiruchirappalli, Tamil Nadu, India', '2024 Trichy'),
    ('2026-09-01', '12:00:00', 'Coimbatore, Tamil Nadu, India', '2026 Today')
]

print("=" * 80)
print("  MULTI-YEAR PRECISION EPHEMERIS & PANCHANGAM VERIFICATION REPORT")
print("=" * 80)

for d, t, p, desc in cases:
    lat, lon, tz = resolve_place(p)
    jd = get_julian_day(d, t, tz)
    eph = compute_planetary_positions(
        jd, lat, lon,
        date_str=d,
        time_str=t,
        timezone_str=tz
    )
    b = eph['basic_details']
    lagna = eph['lagna_info']
    print(f"\n[{desc}] - {d} {t} | {p}")
    print(f"  • லக்னம் (Lagna):      {lagna['rasi_ta']} ({lagna['rasi']}) {lagna['degree_dms']} | அதிபதி: {lagna['lord_ta']} | நவாம்சம்: {lagna['navamsa_rasi_ta']}")
    print(f"    நட்சத்திரம்:          {lagna['nakshatra_ta']} ({lagna['nakshatra']}) பாதம் {lagna['pada']} | நட்சத்திராதிபதி: {lagna['nakshatra_lord_ta']}")
    print(f"  • ராசி (Moon Sign):    {b['rasi_ta']} ({b['rasi']}) | அதிபதி: {b['rasi_lord_ta']}")
    print(f"  • நட்சத்திரம் (Star):   {b['nakshatram_ta']} ({b['nakshatram']}) பாதம் {b['pada']} | அதிபதி: {b['nakshatra_lord_ta']}")
    print(f"  • 5-பஞ்சாங்க அங்கங்கள்:  திதி: {b['thithi_ta']} | வாரம்: {b['vaaram_ta']} (அதிபதி: {b['vaaram_lord_ta']})")
    print(f"                         யோகம்: {b['yogam_ta']} ({b['yogam']}) | கரணம்: {b['karanam_ta']}")
    print(f"  • பஞ்சாங்க சுப யோகம்:  {b['subha_yogam_ta']} ({b['subha_yogam']}) — {b['subha_yogam_desc_ta']}")
    print(f"  • நட்சத்திரக் கூறுகள்:  கணம்: {b['ganam_ta']} | யோனி: {b['yoni_ta']} | ரஜ்ஜு: {b['rajju_ta']} | நாடி: {b['nadi_ta']}")
    print(f"                         மரம்: {b['vriksham_ta']} | பறவை: {b['pakshi_ta']} | மிருகம்: {b['mirugam_ta']}")
    print(f"  • வானியல் நேரங்கள்:    சூரிய உதயம்: {b['sun_rise']} | சூரிய அஸ்தமனம்: {b['sun_set']} | பகல்: {b['dinamani']}")
    print(f"                         உதயாதி நாழிகை: {b['udhayadhi_nazhigai']} | ராகு காலம்: {b['rahu_kalam']}")
    print(f"  • சுவிஸ் அயனாம்சம்:    {b['ayanamsa_name']} {b['ayanamsa_dms']} ({b['ayanamsa_value']}°)")
