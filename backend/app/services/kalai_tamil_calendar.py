"""
Tamil solar calendar + Kalai Magal utilities (Phase 3c).

• Tamil months (horoscope Tamil date AND the Tamil→English utility) follow a
  Surya-Siddhanta TRUE Sun: mean Sun from the Kali epoch with a 365.258756-day
  year, manda correction with a 13°40′ epicycle and apogee 78.4°, epoch shift −0.34 d.
  Month n starts when that Sun enters sign n; the day is day 1 when this happens
  before 18:30 IST, otherwise the next day. Fitted on 84 Kalai dates (95
  customer reports, 10 test reports, matching printouts, converter screenshots):
  83/84 exact; the one miss (a 1991 Purattasi start) is a single day.
• A birth before sunrise belongs to the previous Tamil day (as Kalai prints).
• 60-year cycle: 1987-04 = Prabhava (1). Kalai "Pariviruthi" k starts in
  April of 1867 + 60·(k − 24)  (screenshots: 24 = 1867–1927, 42 = 2947–3007).
• Udhayathi Nazhigai → Standard Time: time = sunrise + nazhigai·24 min +
  vinazhigai·24 s + tharparai·0.4 s (sunrise = disc centre, no refraction).

Verified: Kalai "Tamil to English" screenshots (1 Chithirai Sobhakrit/24 =
13-04-1903, 1 Chithirai Sobhakrit/42 = 30-04-2983, 6 Aippasi Krodhana/42 =
08-11-3005) and the Tamil dates printed on REF-001 and T001–T08.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any, Dict, Optional

import swisseph as swe

from backend.app.services.ephemeris import get_tz

MONTHS_TA = ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
             "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"]
MONTHS_EN = ["Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi",
             "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"]
YEARS_TA = ["பிரபவ", "விபவ", "சுக்கில", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ",
            "யுவ", "தாது", "ஈஸ்வர", "வெகுதாணிய", "பிரமாதி", "விக்கிரம", "விசு", "சித்திரபானு",
            "சுபானு", "தாரண", "பார்திப", "விய", "சர்வசித்து", "சர்வதாரி", "விரோதி", "விக்ருதி",
            "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துன்முகி", "ஹேவிளம்பி", "விளம்பி",
            "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாசுவ", "பராபவ",
            "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதிகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த",
            "ராட்சச", "நள", "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி",
            "ருத்ரோத்காரி", "ரக்தாட்சி", "குரோதன", "அட்சய"]
YEARS_EN = ["Prabhava", "Vibhava", "Sukla", "Pramodhootha", "Prajorpathi", "Aangirasa", "Srimukha", "Bhava",
            "Yuva", "Dhaatu", "Eswara", "Vehudhanya", "Pramathi", "Vikrama", "Vishu", "Chitrabhanu",
            "Subhanu", "Dharana", "Parthiba", "Viya", "Sarvajith", "Sarvadhari", "Virodhi", "Vikruthi",
            "Kara", "Nandhana", "Vijaya", "Jaya", "Manmatha", "Dhunmuki", "Hevilambi", "Vilambi",
            "Vikari", "Sarvari", "Plava", "Subakrith", "Sobakrith", "Krodhi", "Visuvaavasu", "Parabhava",
            "Plavanga", "Keelaka", "Saumya", "Sadharana", "Virodhakrithu", "Paridhabi", "Pramadhisa", "Aanandha",
            "Rakshasa", "Nala", "Pingala", "Kalayukthi", "Siddharthi", "Raudhri", "Dhunmathi", "Dhundubhi",
            "Rudhrodhgaari", "Raktakshi", "Krodhana", "Akshaya"]

RS = swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION


def _utc_offset_days(tz: str, d: date) -> float:
    z = get_tz(tz)
    return z.utcoffset(datetime(d.year, d.month, d.day, 12)).total_seconds() / 86400.0


def _jd_local_midnight(d: date, tz: str) -> float:
    return swe.julday(d.year, d.month, d.day, 0.0) - _utc_offset_days(tz, d)


def _sun_event(d: date, lat: float, lon: float, tz: str, which: int) -> float:
    return swe.rise_trans(_jd_local_midnight(d, tz), swe.SUN, which | RS, (lon, lat, 0.0), 0.0, 0.0, swe.FLG_SWIEPH)[1][0]


def _sun_sid(jd: float) -> float:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    try:
        return swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL)[0][0] % 360.0
    except swe.Error:  # outside the installed ephemeris files
        return swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL | swe.FLG_MOSEPH)[0][0] % 360.0


def _ingress(sign: int, jd_near: float) -> float:
    """JD (UT) of the Sun's sidereal entry into `sign` (0=Mesha), nearest after jd_near-40d."""
    target = sign * 30.0
    jd = jd_near - 40.0
    step = 1.0
    while ((_sun_sid(jd) - target) % 360.0) < 300.0:  # move until just before target
        jd += step
    while ((_sun_sid(jd) - target) % 360.0) > 300.0:
        jd += step
    lo, hi = jd - step, jd
    for _ in range(50):
        mid = (lo + hi) / 2
        if ((_sun_sid(mid) - target) % 360.0) > 300.0:
            lo = mid
        else:
            hi = mid
    return hi


def _local_date(jd_ut: float, tz: str) -> date:
    y, m, d, h = swe.revjul(jd_ut)
    dt = datetime(y, m, d) + timedelta(hours=h)
    off = get_tz(tz).utcoffset(dt)
    return (dt + off).date()


def month_start(sign: int, jd_near: float, lat: float, lon: float, tz: str) -> date:
    ing = _ingress(sign, jd_near)
    d = _local_date(ing, tz)
    sunset = _sun_event(d, lat, lon, tz, swe.CALC_SET)
    return d if ing < sunset else d + timedelta(days=1)


import math as _math

SS_TRUE_APOGEE = 78.4
SS_TRUE_EPICYCLE = 13.67   # 13°40′, the Surya-Siddhanta solar epicycle
SS_TRUE_SHIFT = -0.34


def _ss_true_sun(jd: float) -> float:
    L = ((jd - KALI_EPOCH_JD - SS_TRUE_SHIFT) / SS_YEAR * 360.0) % 360.0
    M = _math.radians(L - SS_TRUE_APOGEE)
    return (L - _math.degrees(_math.asin(SS_TRUE_EPICYCLE / 360.0 * _math.sin(M)))) % 360.0


def ss_month_start(month_idx: int, near_jd: float) -> date:
    """Civil date of day 1 of Tamil month `month_idx` (0 = Chithirai) nearest before near_jd+5."""
    t = month_idx * 30.0
    j = near_jd - 45.0
    while ((_ss_true_sun(j) - t) % 360.0) < 300.0:
        j += 1.0
    while ((_ss_true_sun(j) - t) % 360.0) > 300.0:
        j += 1.0
    lo, hi = j - 1.0, j
    for _ in range(45):
        mid = (lo + hi) / 2
        if ((_ss_true_sun(mid) - t) % 360.0) > 300.0:
            lo = mid
        else:
            hi = mid
    y, m, d, h = swe.revjul(hi + 5.5 / 24.0)
    local = date(y, m, d)
    return local if h < 18.5 else local + timedelta(days=1)


def tamil_date(civil: date, time_hhmmss: Optional[str], lat: float, lon: float, tz: str) -> Dict[str, Any]:
    d = civil
    if time_hhmmss:
        h, m, *s = [int(x) for x in time_hhmmss.split(":")]
        t_local = swe.julday(d.year, d.month, d.day, h + m / 60 + (s[0] if s else 0) / 3600) - _utc_offset_days(tz, d)
        if t_local < _sun_event(d, lat, lon, tz, swe.CALC_RISE):
            d = d - timedelta(days=1)
    jd = swe.julday(d.year, d.month, d.day, 12.0)
    sign = int(_ss_true_sun(jd) // 30)
    start = ss_month_start(sign, jd)
    if start > d:
        sign = (sign - 1) % 12
        start = ss_month_start(sign, jd - 25)
    day = (d - start).days + 1
    chithirai = ss_month_start(0, jd - sign * 30.4)
    if chithirai > d:
        chithirai = ss_month_start(0, jd - 365)
    idx = (chithirai.year - 1987) % 60
    return {"tamil_day_date": d.isoformat(), "day": day, "month": sign + 1,
            "month_ta": MONTHS_TA[sign], "month_en": MONTHS_EN[sign],
            "year_index": idx + 1, "year_ta": YEARS_TA[idx], "year_en": YEARS_EN[idx],
            "pariviruthi": 24 + (chithirai.year - 1867) // 60,
            "formatted_ta": f"{YEARS_TA[idx]} {MONTHS_TA[sign]} {day}",
            "formatted_en": f"{YEARS_EN[idx]} {MONTHS_EN[sign]} {day}"}


# Kalai "Tamil to English Date" utility: Surya-Siddhanta mean arithmetic.
# Mesha sankranti = Kali epoch + n·365.258756 d − 2.5 d, months by the
# Surya-Siddhanta true-sun month lengths. Reproduces all 3 Kalai screenshot
# conversions (1903, 2983, 3005) and 1 Chithirai 2026 = 14-04-2026. Offset
# 2.5 d fitted inside the valid window 2.3–2.7 d [derived from 3 screenshots].
SS_YEAR = 365.258756
KALI_EPOCH_JD = 588465.5
SS_OFFSET_DAYS = 2.5
SS_MONTH_DAYS = [30.9313, 31.4023, 31.5244, 31.4602, 31.0017, 30.4561,
                 29.8914, 29.4468, 29.3137, 29.4755, 29.8155, 30.3441]


def _ss_month_start(year: int, month_idx: int, tz: str) -> date:
    jd = KALI_EPOCH_JD + (year + 3101) * SS_YEAR - SS_OFFSET_DAYS + sum(SS_MONTH_DAYS[:month_idx])
    off = get_tz(tz).utcoffset(datetime(2000, 1, 1)).total_seconds() / 86400.0
    y, m, d, h = swe.revjul(jd + off)
    local = date(y, m, d)
    return local if h < 18.5 else local + timedelta(days=1)  # after ~sunset -> next day


def tamil_to_english(day: int, month: int, year_index: int, pariviruthi: int,
                     lat: float = 11.0, lon: float = 77.0, tz: str = "UTC+05:30") -> Dict[str, Any]:
    """month 1..12 (Chithirai=1), year_index 1..60 (Prabhava=1), Kalai pariviruthi number."""
    tamil_year = 1867 + 60 * (pariviruthi - 24) + (year_index - 1)
    y = tamil_year + (1 if month >= 10 else 0)
    approx = swe.julday(y, [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3][month - 1], 20, 12.0)
    start = ss_month_start(month - 1, approx)
    d = start + timedelta(days=day - 1)
    return {"date": d.isoformat(), "display": d.strftime("%d-%m-%Y"), "month_start": start.isoformat(),
            "tamil_year_start": tamil_year, "year_ta": YEARS_TA[year_index - 1], "month_ta": MONTHS_TA[month - 1]}


def naligai_to_time(civil: date, nazhigai: int, vinazhigai: int, tharparai: int,
                    lat: float, lon: float, tz: str) -> Dict[str, Any]:
    rise = _sun_event(civil, lat, lon, tz, swe.CALC_RISE)
    sset = _sun_event(civil, lat, lon, tz, swe.CALC_SET)
    jd = rise + (nazhigai * 1440.0 + vinazhigai * 24.0 + tharparai * 0.4) / 86400.0

    def fmt(j: float) -> str:
        y, m, d, h = swe.revjul(j)
        dt = datetime(y, m, d) + timedelta(hours=h) + get_tz(tz).utcoffset(datetime(y, m, d))
        dt = (dt + timedelta(seconds=0.5)).replace(microsecond=0)
        return dt.strftime("%d-%m-%Y %I:%M:%S %p")

    return {"time": fmt(jd), "sunrise": fmt(rise), "sunset": fmt(sset)}
