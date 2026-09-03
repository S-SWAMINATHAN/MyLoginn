"""
Full Jathagam Calculation for Manosakthi — 2004-12-31, 14:10:00, Pollachi, Tamil Nadu
Outputs all sections including new Shadbala, Gochara, Antardasha, D2/D3, and 17 Yogas.
"""
import json
import math
from datetime import datetime
from backend.app.services.geocode import resolve_place
from backend.app.services.ephemeris import get_julian_day, compute_planetary_positions
from backend.app.services.chart_builder import (
    build_rasi_and_navamsa_kattams, calculate_bhava_predictions,
    compute_hora_chart, compute_drekkana_chart
)
from backend.app.services.dasha_builder import calculate_vimshottari_dasha, calculate_dasha_balance
from backend.app.services.yoga_dosha import detect_yogas, detect_doshas
from backend.app.services.ashtakavarga import calculate_ashtakavarga
from backend.app.services.shadbala import calculate_shadbala
from backend.app.services.gochara import compute_current_transits, analyze_gochara, get_gochara_summary

# ─── Birth Data ───
DOB = "2004-12-31"
TOB = "14:10:00"
PLACE = "Pollachi, Tamil Nadu, India"

lat, lon, tz = resolve_place(PLACE)
jd = get_julian_day(DOB, TOB, tz)

print("=" * 80)
print("   ஜாதக கட்டம் — MANOSAKTHI JATHAGAM")
print(f"   {DOB} | {TOB} IST | {PLACE}")
print(f"   Lat: {lat:.4f} | Lon: {lon:.4f} | TZ: {tz}")
print("=" * 80)

# 1. Planetary Positions & Panchangam
eph = compute_planetary_positions(jd, lat, lon, date_str=DOB, time_str=TOB, timezone_str=tz)
b = eph["basic_details"]
planets = eph["planets"]
pos = eph["positions_by_name"]
lagna = eph["lagna_info"]

print("\n" + "─" * 80)
print("  SECTION 1: BASIC BIRTH DETAILS (பிறப்பு விவரங்கள்)")
print("─" * 80)
print(f"  Lagnam       : {lagna['rasi']} ({lagna['rasi_ta']}) — {lagna['degree_dms']} | Lord: {lagna['lord']} ({lagna['lord_ta']})")
print(f"  Lagna Star   : {lagna['nakshatra']} ({lagna['nakshatra_ta']}) Pada {lagna['pada']} | Lord: {lagna['nakshatra_lord']}")
print(f"  Navamsa Lagna: {lagna['navamsa_rasi']} ({lagna['navamsa_rasi_ta']})")
print(f"  Moon Rasi    : {b['rasi']} ({b['rasi_ta']}) | Lord: {b['rasi_lord']}")
print(f"  Nakshatram   : {b['nakshatram']} ({b['nakshatram_ta']}) Pada {b['pada']} | Lord: {b['nakshatra_lord']}")
print(f"  Ayanamsa     : {b['ayanamsa_dms']} ({b['ayanamsa_value']}°)")

print(f"\n  ── பஞ்சாங்கம் (Panchangam) ──")
print(f"  Thithi       : {b['thithi_ta']} ({b['thithi']})")
print(f"  Vaaram       : {b['vaaram_ta']} ({b['vaaram']}) | Lord: {b['vaaram_lord']}")
print(f"  Yogam        : {b['yogam_ta']} ({b['yogam']})")
print(f"  Karanam      : {b['karanam_ta']} ({b['karanam']})")
print(f"  Subha Yoga   : {b['subha_yogam_ta']} ({b['subha_yogam']}) — {b['subha_yogam_status']}")

print(f"\n  ── Timings ──")
print(f"  Sunrise      : {b['sun_rise']}")
print(f"  Sunset       : {b['sun_set']}")
print(f"  Dinamani     : {b['dinamani']} ({b['dinamani_en']})")
print(f"  Udhayadhi    : {b['udhayadhi_nazhigai']} ({b['udhayadhi_nazhigai_en']})")
print(f"  Rahu Kalam   : {b['rahu_kalam']}")
print(f"  Yamagandam   : {b['yamagandam']}")
print(f"  Kuligai      : {b['kuligai']}")

print(f"\n  ── Nakshatra Attributes ──")
print(f"  Ganam        : {b.get('ganam_ta','')} ({b.get('ganam','')})")
print(f"  Yoni         : {b.get('yoni_ta','')} ({b.get('yoni','')})")
print(f"  Rajju        : {b.get('rajju_ta','')} ({b.get('rajju','')})")
print(f"  Bootham      : {b.get('bootham_ta','')} ({b.get('bootham','')})")
print(f"  Nadi         : {b.get('nadi_ta','')} ({b.get('nadi','')})")

# 2. Planetary Table
print("\n" + "─" * 80)
print("  SECTION 2: PLANETARY POSITIONS (கிரக நிலை)")
print("─" * 80)
print(f"  {'Planet':<10} {'Rasi':<14} {'Degree':<12} {'Nak':<16} {'Pd':>2} {'House':>5} {'Status':<18} {'Navamsa':<12}")
print(f"  {'─'*10} {'─'*14} {'─'*12} {'─'*16} {'─'*2} {'─'*5} {'─'*18} {'─'*12}")
for p in planets:
    print(f"  {p['name']:<10} {p['rasi_ta']:<14} {p['degree_dms']:<12} {p['nakshatra_ta']:<16} {p['pada']:>2} {p['house']:>5} {p['status_ta']:<18} {p.get('navamsa_rasi_ta',''):<12}")
# Mandi
m = pos.get("Mandi")
if m:
    print(f"  {'Mandi':<10} {m['rasi_ta']:<14} {m['degree_dms']:<12} {m['nakshatra_ta']:<16} {m['pada']:>2} {m['house']:>5} {m['status_ta']:<18} {m.get('navamsa_rasi_ta',''):<12}")

# 3. Dasha Balance & Timeline
moon_deg = pos["Moon"]["total_degree"]
dasha_bal = calculate_dasha_balance(moon_deg)
dashas = calculate_vimshottari_dasha(moon_deg, DOB, TOB)

print("\n" + "─" * 80)
print("  SECTION 3: VIMSHOTTARI DASHA (விம்சோத்தரி திசா புக்தி)")
print("─" * 80)
print(f"  Dasha Balance: {dasha_bal['formatted_ta']}")
print(f"                 {dasha_bal['formatted_en']}")
print()
for d in dashas:
    marker = " ◄ CURRENT" if d["is_current"] else ""
    print(f"  {d['planet_ta']:<12} ({d['planet']:<8}) {d['start_date']} → {d['end_date']}  ({d['duration_years']:.2f} yrs){marker}")
    if d["is_current"]:
        for bk in d["bhuktis"]:
            bk_marker = " ◄◄" if bk["is_current"] else ""
            print(f"    ├─ {bk['planet_ta']:<10} {bk['start_date']} → {bk['end_date']}  ({bk['duration_years']:.2f} yrs){bk_marker}")
            if bk["is_current"] and bk.get("antardashas"):
                for ant in bk["antardashas"]:
                    ant_marker = " ◄◄◄" if ant["is_current"] else ""
                    print(f"    │  ├─ {ant['planet_ta']:<10} {ant['start_date']} → {ant['end_date']}  ({ant['duration_years']:.4f} yrs){ant_marker}")

# 4. Yogas
yogas = detect_yogas(lagna["rasi_number"], pos)
print("\n" + "─" * 80)
print(f"  SECTION 4: YOGAS ({len(yogas)} detected)")
print("─" * 80)
for y in yogas:
    status = "✅" if y["present"] else "❌"
    print(f"  {status} {y['name_ta']} ({y['name']})")
    print(f"     {y['category']} | {y['classical_source']}")
    print(f"     {y['description_ta'][:100]}...")
    print()

# 5. Doshas
doshas = detect_doshas(lagna["rasi_number"], pos)
print("─" * 80)
print(f"  SECTION 5: DOSHAS ({len(doshas)} checked)")
print("─" * 80)
for d in doshas:
    status = "⚠️" if d["present"] else "✅"
    sev = f" [{d['severity']}]" if d["present"] else ""
    print(f"  {status} {d['name_ta']} ({d['name']}){sev}")
    print(f"     {d['description_ta'][:100]}")
    print()

# 6. Ashtakavarga
astv = calculate_ashtakavarga(lagna["rasi_number"], pos)
print("─" * 80)
print(f"  SECTION 6: ASHTAKAVARGA (Total: {astv['total_points']} / 337)")
print("─" * 80)
print(f"  Sarvashtakavarga by House (1→12): {astv['sarvashtakavarga_by_house']}")
print(f"  Sarvashtakavarga by Sign  (♈→♓): {astv['sarvashtakavarga']}")
for pn, scores in astv["bhinnashtakavarga"].items():
    print(f"  {pn:>8}: {scores}  (Σ={sum(scores)})")

# 7. Shadbala
print("\n" + "─" * 80)
print("  SECTION 7: SHADBALA (ஷட்பலம் — 6-Fold Planetary Strength)")
print("─" * 80)
birth_hour = 14 + 10/60.0
day_num = int(math.floor(jd + 1.5)) % 7
is_shukla = b.get("paksha_en") == "Shukla Paksha"
shadbala = calculate_shadbala(pos, lagna["rasi_number"], True, is_shukla, b.get("vaaram_lord","Sun"), birth_hour, day_num)

print(f"  {'Planet':<10} {'Sthana':>8} {'Dig':>6} {'Kaala':>8} {'Cheshta':>8} {'Naisarg':>8} {'Drig':>6} {'Total':>8} {'Rupas':>7} {'Status':<16}")
print(f"  {'─'*10} {'─'*8} {'─'*6} {'─'*8} {'─'*8} {'─'*8} {'─'*6} {'─'*8} {'─'*7} {'─'*16}")
for pn in ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"]:
    s = shadbala["planets"][pn]
    print(f"  {s['planet_ta']:<10} {s['sthana_bala']['total']:>8.1f} {s['dig_bala']:>6.1f} {s['kaala_bala']['total']:>8.1f} {s['cheshta_bala']:>8.1f} {s['naisargika_bala']:>8.2f} {s['drig_bala']:>6.1f} {s['total_virupas']:>8.1f} {s['total_rupas']:>7.2f} {s['strength_ta']:<16}")

# 8. Gochara
print("\n" + "─" * 80)
print("  SECTION 8: GOCHARA (கோசாரம் — Current Transit Analysis)")
print("─" * 80)
transit_planets = compute_current_transits(timezone_str=tz)
natal_moon_sign = pos["Moon"]["rasi_number"]
gochara = analyze_gochara(natal_moon_sign, astv.get("bhinnashtakavarga"), transit_planets)
summary = get_gochara_summary(gochara)

print(f"  Overall: {summary['overall_assessment_ta']} ({summary['overall_assessment']})")
print(f"  Benefic: {summary['benefic_transits']} | Challenging: {summary['challenging_transits']} | Vedha: {summary['vedha_cancellations']}")
print()
print(f"  {'Planet':<10} {'Transit':<14} {'House':>5} {'BAV':>4} {'Vedha':<6} {'Effect':<20}")
print(f"  {'─'*10} {'─'*14} {'─'*5} {'─'*4} {'─'*6} {'─'*20}")
for g in gochara:
    vedha = f"⊘ {g['vedha_by'][:3]}" if g['vedha_active'] else "—"
    bav = str(g['bav_score']) if g['bav_score'] is not None else "—"
    print(f"  {g['planet_ta']:<10} {g['transit_rasi_ta']:<14} {g['house_from_moon']:>5} {bav:>4} {vedha:<6} {g['net_effect_ta']:<20}")

# 9. Hora & Drekkana
hora = compute_hora_chart(planets, lagna)
drek = compute_drekkana_chart(planets, lagna)
print("\n" + "─" * 80)
print("  SECTION 9: HORA (D2) & DREKKANA (D3)")
print("─" * 80)
print("  Hora (D2) — Wealth Chart:")
for sign_num in range(1, 13):
    if hora[sign_num]:
        names = ", ".join([p["name_ta"] + f" ({p.get('hora_type_ta','')})" for p in hora[sign_num]])
        from backend.app.services.tamil_labels import SIGN_LABELS
        print(f"    {SIGN_LABELS[sign_num]['ta']}: {names}")
print("\n  Drekkana (D3) — Siblings & Courage Chart:")
for sign_num in range(1, 13):
    if drek[sign_num]:
        names = ", ".join([p["name_ta"] for p in drek[sign_num]])
        print(f"    {SIGN_LABELS[sign_num]['ta']}: {names}")

print("\n" + "=" * 80)
print("  ✅ COMPLETE — All calculations from Swiss Ephemeris DE431/441")
print("=" * 80)
