import sys
sys.path.insert(0, r'E:\ai-ja')
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.porutham import compute_porutham_match

lat_girl, lon_girl = 10.5846, 77.2389  # Udumalaipettai
lat_boy, lon_boy = 10.4504, 77.5197  # Palani

jd_girl = get_julian_day('2002-08-26','05:00:00','Asia/Kolkata')
jd_boy  = get_julian_day('2003-04-30','13:00:00','Asia/Kolkata')
print('JD Girl:', jd_girl)
print('JD Boy:', jd_boy)

chart_girl = compute_planetary_positions(jd_girl, lat_girl, lon_girl, 'thirukkanitham','2002-08-26','05:00:00','Asia/Kolkata')
chart_boy  = compute_planetary_positions(jd_boy, lat_boy, lon_boy, 'thirukkanitham','2003-04-30','13:00:00','Asia/Kolkata')

def print_chart(chart, name):
    bd = chart['basic_details']
    print(f"=== {name} ===")
    print(f"Lagnam: {bd['lagnam']} ({bd['lagnam_ta']}) degree {bd['lagnam_dms']} Lord {bd['lagnam_lord']} Nak {bd['lagnam_nakshatram']} {bd['lagnam_nakshatram_ta']} pada {bd['lagnam_pada']} Navamsa {bd['lagnam_navamsa']}")
    print(f"Rasi: {bd['rasi']} ({bd['rasi_ta']}) Lord {bd['rasi_lord']}")
    print(f"Nakshatram: {bd['nakshatram']} ({bd['nakshatram_ta']}) pada {bd['pada']} Lord {bd['nakshatra_lord']} Ganam {bd['ganam']} Yoni {bd['yoni']} Rajju {bd['rajju']} Nadi {bd['nadi']}")
    print(f"Thithi: {bd['thithi_ta']} ({bd['thithi']}) elapsed {bd['thithi_elapsed_pct']}%")
    print(f"Vaaram: {bd['vaaram_ta']} ({bd['vaaram']}) Lord {bd['vaaram_lord']}")
    print(f"Yogam: {bd['yogam_ta']} ({bd['yogam']})")
    print(f"Karanam: {bd['karanam_ta']} ({bd['karanam']})")
    print(f"Subha Yogam: {bd['subha_yogam_ta']} ({bd['subha_yogam']}) status {bd['subha_yogam_status']}")
    print(f"Ayanamsa: {bd['ayanamsa_value']} {bd['ayanamsa_dms']}")
    print(f"Sunrise: {bd['sun_rise']} Sunset: {bd['sun_set']} Dinamani: {bd['dinamani']} Udhayadhi: {bd['udhayadhi_nazhigai']}")
    print(f"Rahu Kalam: {bd['rahu_kalam']} Yamagandam: {bd['yamagandam']} Kuligai: {bd['kuligai']}")
    print('Planets:')
    for p in chart['planets']:
        print(f"  {p['name']:8s} {p['rasi_ta']:10s} ({p['rasi']:12s}) {p['degree_dms']:12s} House {p['house']} Nak {p['nakshatra_ta']:10s} pada {p['pada']} Status {p['status_ta']} ({p['status']}) Retro {p['is_retrograde']}")
    print()

print_chart(chart_girl, 'Girl Sharmela 26-08-2002 05:00 Udumalaipettai')
print_chart(chart_boy, 'Boy Sureshkumar 30-04-2003 13:00 Palani')

girl_moon = next(p for p in chart_girl['planets'] if p['name']=='Moon')
boy_moon  = next(p for p in chart_boy['planets'] if p['name']=='Moon')
print('Girl Moon Rasi num', girl_moon['rasi_number'], girl_moon['nakshatra'], girl_moon['nakshatra_number'], 'pada', girl_moon['pada'])
print('Boy  Moon Rasi num', boy_moon['rasi_number'], boy_moon['nakshatra'], boy_moon['nakshatra_number'], 'pada', boy_moon['pada'])

result = compute_porutham_match(boy_moon['rasi_number'], boy_moon['nakshatra_number'], boy_moon['pada'], girl_moon['rasi_number'], girl_moon['nakshatra_number'], girl_moon['pada'])
import json
print(json.dumps(result, indent=2, ensure_ascii=False))
