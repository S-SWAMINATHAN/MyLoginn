import sys
sys.path.insert(0, 'E:/ai-ja')
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.porutham import compute_porutham_match
import json

lat = 8.4941
lon = 78.1152

jd_girl = get_julian_day('2004-11-25','03:55:00','Asia/Kolkata')
jd_boy = get_julian_day('2003-07-31','02:00:00','Asia/Kolkata')
print('JD Girl', jd_girl)
print('JD Boy', jd_boy)

chart_girl = compute_planetary_positions(jd_girl, lat, lon, 'thirukkanitham','2004-11-25','03:55:00','Asia/Kolkata')
chart_boy = compute_planetary_positions(jd_boy, lat, lon, 'thirukkanitham','2003-07-31','02:00:00','Asia/Kolkata')

def print_chart(chart, name):
    bd = chart['basic_details']
    print(f"=== {name} ===")
    print(f"Lagnam: {bd['lagnam']} ({bd['lagnam_ta']}) deg {bd['lagnam_dms']} Lord {bd['lagnam_lord']} Nak {bd['lagnam_nakshatram']} {bd['lagnam_nakshatram_ta']} pada {bd['lagnam_pada']} Navamsa {bd['lagnam_navamsa']}")
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

print_chart(chart_girl, 'Girl Praveena 25-11-2004 03:55 Tiruchendur')
print_chart(chart_boy, 'Boy Arumuganainar 31-07-2003 02:00 Tiruchendur')

girl_moon = next(p for p in chart_girl['planets'] if p['name']=='Moon')
boy_moon = next(p for p in chart_boy['planets'] if p['name']=='Moon')
print('Girl Moon', girl_moon['rasi_number'], girl_moon['rasi'], girl_moon['nakshatra'], girl_moon['nakshatra_number'], 'pada', girl_moon['pada'])
print('Boy Moon', boy_moon['rasi_number'], boy_moon['rasi'], boy_moon['nakshatra'], boy_moon['nakshatra_number'], 'pada', boy_moon['pada'])

result = compute_porutham_match(boy_moon['rasi_number'], boy_moon['nakshatra_number'], boy_moon['pada'], girl_moon['rasi_number'], girl_moon['nakshatra_number'], girl_moon['pada'])
print(json.dumps(result, indent=2, ensure_ascii=False))

# Also dosha
from backend.app.services.yoga_dosha import detect_doshas
for name, chart in [('Girl Praveena', chart_girl), ('Boy Arumuganainar', chart_boy)]:
    print(f"\n===== Doshas for {name} =====")
    lagna_num = chart['positions_by_name']['Lagna']['rasi_number']
    doshas = detect_doshas(lagna_num, chart['positions_by_name'])
    print(json.dumps(doshas, indent=2, ensure_ascii=False))
