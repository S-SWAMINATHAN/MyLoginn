"""
backend/app/services/vakkiyam.py — Vakkiyam (வாக்கியம்) engine, MYLoginn Astrology.

Reproduces the "வாக்கிய கிரக ஸ்புடம் (நிராயனம்)" block of Kalai Magal
(கலைமகள்) horoscope reports. Calibrated on 52 Kalai Magal Vakkiyam reports
(42 from Vakkiyam_datas.zip, 9 from docs/vakkiyam/kalai_vakkiyam_v01_v10.json,
1 from the KALAI_ASTRO archive) — see VAKKIYAM_SUMMARY.md for accuracy.

Used by ephemeris.compute_planetary_positions() when
panchangam_system == "vakhyam" (see vakkiyam_for_jd below).

Self-contained: only the Python standard library is used, so it never
touches Swiss Ephemeris / PyJHora and therefore cannot disturb the
Thirukanitham (drik) path.

Classical basis (structure is classical; numeric constants are fitted to
Kalai Magal output, because the Kalai tables themselves are not published):

  * Day count  : Kali ahargana, epoch JD 588465.5 (Kali-yuga day 0,
                 Friday 18 Feb 3102 BCE). Kalai reckons it on IST civil time.
  * Sun        : mean Sun + manda-phala, Aryabhatiya apogee (~78°) and
                 epicycle 13½° (Vakyakarana / Parahita tradition).
  * Moon       : Madhava's Chandra-vakya scheme — anomaly counted from
                 khanda 1,502,008 with anomalistic month 188611/6845 days,
                 manda epicycle 31½°, daily value at 06:00 IST then linear
                 interpolation, plus bhujantara (Sun's equation of centre)
                 and udayantara (obliquity) time corrections.
  * Mars…Saturn: Aryabhatiya four-step manda/sighra procedure
                 (½ manda → ½ sighra → full manda → full sighra) with
                 variable (odd/even quadrant) epicycles.
  * Rahu/Ketu  : mean node, stepped once per IST civil day.
  * Lagna      : ascendant, referred to the Vakkiyam Sun (Kalai's lagna is
                 place dependent, the planets are not).
  * Sunrise    : geometric centre of the Sun at 0° altitude ("பிம்ப மத்தி").
  * Mandi      : lagna at Mandi's rising — fixed ghatikas after sunrise /
                 sunset per weekday (Sun 26 … Sat 2 by day; Sun 10 … Sat 14 by night).

Public API
----------
    compute_vakkiyam(year, month, day, hour, minute, second,
                     lat, lon, tz=5.5) -> dict

    vakkiyam_longitudes(jd_ut) -> dict  (planets only, place independent)
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Dict, Optional

# ---------------------------------------------------------------------------
# Calibrated constants (output of tools/calibrate_vakkiyam.py).
# Do not hand-edit; re-run the calibration with new Kalai reports instead.
# ---------------------------------------------------------------------------
KALI_EPOCH_JD = 588465.5          # Kali day 0 (civil reckoning)
IST = 5.5                         # Kalai counts the Vakkiyam day on IST
T0 = 1872000.0                    # reference Kali day (≈ 2025-01-21)

PARAMS: Dict[str, list] = {
    # Sun: [L0, n(deg/day), apogee, e, e_var]
    "sun": [48.2894766555, 0.9856027841, 78.3329860148, 0.0371637844, -0.0004318077],
    # Moon: [c, n, e, bhujantara k, anomaly offset, udayantara k,
    #        ayanamsa for udayantara, e2 sin2K, e3 cos2K]
    "moon": [13.8723132346, 13.1763501365, 0.0874780307, -0.0192119109,
             -0.2660503327, 0.0339890468, 25.5644984647, -0.0114413542,
             0.0045313864],
    # Planets: [L0, n, apogee, manda_even, manda_odd, sighra_even,
    #           sighra_odd, mean-sun offset, sighra cos term]
    "mars":    [326.1613251372, 0.5240269363, 118.6699722437, 65.4932229501,
            78.8923956988, 239.0844913936, 230.2670135498,
            -0.0262754037, 0.5135330253],
    "mercury": [48.7093059699, 4.0923922289, 209.6425634452, 29.917080217,
               22.5665020791, 138.4675070253, 129.5443730732,
               -0.2906653236, -0.2796804769],
    "jupiter": [32.7818832979, 0.0830900809, 180.2627941669, 30.3235263192,
               36.6527856802, 70.3626173527, 67.1953899887,
               -0.1291611584, -0.246122743],
    "venus":   [46.8701555191, 1.6021324816, 95.9829331576, 11.6506964527,
             11.9969145888, 260.9659091393, 253.6185460888,
             0.1106180576, -3.8969025655],
    "saturn":  [318.8906903494, 0.0334413208, 235.9629869862, 40.7622291254,
              58.4450960209, 39.6870943513, 35.5083173915,
              -0.1203063219, -0.4500941019],
    # Rahu: [longitude at T0, daily motion]
    "rahu": [347.3006107851, -0.0530007259],
    # Lagna: [offset deg, offset rate deg/yr from J2000, RAMC shift deg,
    #         obliquity shift deg]
    "lagna": [-0.1012035649, 0.0006177600, 0.1202266676, -1.2946612072],
}

MOON_EPS = 24.0                    # Indian obliquity used for udayantara
MOON_DAY_SHIFT = 0.25              # Moon day value at 06:00 IST
MADHAVA_KHANDA = 1502008           # Madhava's khanda-dina
ANOMALISTIC_MONTH = 188611 / 6845  # days

# ---------------------------------------------------------------------------
# Names (Tamil)
# ---------------------------------------------------------------------------
RASI_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
           "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"]
RASI_EN = ["Mesha", "Rishabha", "Mithuna", "Kataka", "Simha", "Kanni",
           "Thula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena"]
NAK_TA = ["அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்",
          "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்",
          "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்",
          "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்",
          "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"]
NAK_EN = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
          "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
          "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
          "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
          "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
          "Uttara Bhadrapada", "Revati"]
PLANET_TA = {"sun": "சூரியன்", "moon": "சந்திரன்", "mars": "செவ்வாய்",
             "mercury": "புதன்", "jupiter": "குரு", "venus": "சுக்கிரன்",
             "saturn": "சனி", "rahu": "ராகு", "ketu": "கேது",
             "mandi": "மாந்தி", "lagna": "லக்னம்"}
ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn",
         "rahu", "ketu", "mandi", "lagna"]


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def _sd(x: float) -> float:
    return math.sin(math.radians(x))


def _cd(x: float) -> float:
    return math.cos(math.radians(x))


def _asind(x: float) -> float:
    return math.degrees(math.asin(max(-1.0, min(1.0, x))))


def norm360(x: float) -> float:
    return x % 360.0


def _wrap180(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def julian_day(y: int, m: int, d: int, hour: float = 0.0) -> float:
    """Proleptic-Gregorian JD (for 1582 onward; Kalai uses Gregorian dates)."""
    return date(y, m, d).toordinal() + 1721424.5 + hour / 24.0


def kali_days_from_jd_ut(jd_ut: float) -> float:
    """Kali ahargana (fractional) in Kalai's IST civil reckoning."""
    return jd_ut + IST / 24.0 - KALI_EPOCH_JD


def dms(x: float) -> str:
    x = norm360(x)
    d = int(x)
    m_f = (x - d) * 60
    m = int(m_f)
    s = int(round((m_f - m) * 60))
    if s == 60:
        s, m = 0, m + 1
    if m == 60:
        m, d = 0, d + 1
    return f"{d % 360:03d} {m:02d} {s:02d}"


# ---------------------------------------------------------------------------
# Sun
# ---------------------------------------------------------------------------
def mean_sun(t: float) -> float:
    p = PARAMS["sun"]
    return p[0] + p[1] * (t - T0)


def vakya_sun(t: float) -> float:
    p = PARAMS["sun"]
    M = mean_sun(t)
    s = _sd(M - p[2])
    return norm360(M - _asind((p[3] - p[4] * abs(s)) * s))


def _sun_eq(t: float) -> float:
    """Mean minus true Sun (bhujantara argument)."""
    return _wrap180(mean_sun(t) - vakya_sun(t))


# ---------------------------------------------------------------------------
# Moon (Madhava chandra-vakya scheme)
# ---------------------------------------------------------------------------
def _udayantara(sun_lon: float, ayan: float, eps: float = MOON_EPS) -> float:
    lt = math.radians(sun_lon + ayan)
    a = math.atan2(math.cos(math.radians(eps)) * math.sin(lt), math.cos(lt))
    return _wrap180(math.degrees(lt - a))


def _moon_day_value(A: float) -> float:
    c, n, e, kb, k0, ku, ay, e2, e3 = PARAMS["moon"]
    kap = 360.0 * ((A - MADHAVA_KHANDA) / ANOMALISTIC_MONTH) + k0
    true = (c + n * (A - T0) - _asind(e * _sd(kap))
            + e2 * _sd(2 * kap) + e3 * _cd(2 * kap))
    return true + kb * _sun_eq(A) + ku * _udayantara(vakya_sun(A), ay)


def vakya_moon(t: float) -> float:
    u = t - MOON_DAY_SHIFT
    A = math.floor(u)
    f = u - A
    a = _moon_day_value(A)
    b = _moon_day_value(A + 1)
    return norm360(a + f * _wrap180(b - a))


# ---------------------------------------------------------------------------
# Star planets (Aryabhatiya four-step)
# ---------------------------------------------------------------------------
def _manda(x: float, apo: float, m0: float, m1: float) -> float:
    k = x - apo
    return _asind((m0 + (m1 - m0) * abs(_sd(k))) / 360.0 * _sd(k))


def _sighra(x: float, s_ucca: float, s0: float, s1: float, sc: float) -> float:
    k = s_ucca - x
    r = (s0 + (s1 - s0) * abs(_sd(k)) + sc * _cd(k)) / 360.0
    return math.degrees(math.atan2(r * _sd(k), 1.0 + r * _cd(k)))


def vakya_planet(name: str, t: float) -> float:
    L0, n, apo, m0, m1, s0, s1, dS, sc = PARAMS[name]
    if name in ("mercury", "venus"):
        M = mean_sun(t) + dS          # planet's mean = mean Sun
        S = L0 + n * (t - T0)         # sighrocca = own revolution
    else:
        M = L0 + n * (t - T0)
        S = mean_sun(t) + dS          # sighrocca = mean Sun
    x1 = M - 0.5 * _manda(M, apo, m0, m1)
    x2 = x1 + 0.5 * _sighra(x1, S, s0, s1, sc)
    x3 = M - _manda(x2, apo, m0, m1)
    return norm360(x3 + _sighra(x3, S, s0, s1, sc))


def vakya_rahu(t: float) -> float:
    # Kalai moves Rahu once a day; the step falls between 16:30 and 18:20 IST
    # (LG05 16:30 unchanged, V07 18:20 already stepped) -> 18:00 IST.
    A = math.floor(t + 0.25)
    p = PARAMS["rahu"]
    return norm360(p[0] + p[1] * (A - T0))


def body_longitude(name: str, t: float) -> float:
    if name == "sun":
        return vakya_sun(t)
    if name == "moon":
        return vakya_moon(t)
    if name == "rahu":
        return vakya_rahu(t)
    if name == "ketu":
        return norm360(vakya_rahu(t) + 180.0)
    return vakya_planet(name, t)


def vakkiyam_longitudes(jd_ut: float) -> Dict[str, float]:
    """Nirayana Vakkiyam longitudes (degrees) for Sun..Ketu at jd_ut."""
    t = kali_days_from_jd_ut(jd_ut)
    return {b: body_longitude(b, t) for b in ORDER[:9]}


def is_retrograde(name: str, t: float) -> bool:
    if name in ("sun", "moon", "rahu", "ketu"):
        return False
    d = _wrap180(body_longitude(name, t + 0.5) - body_longitude(name, t - 0.5))
    return d < 0


# ---------------------------------------------------------------------------
# Modern Sun (for sunrise & lagna geometry only)
# ---------------------------------------------------------------------------
def _sun_ra_dec_trop(jd_ut: float):
    n = jd_ut - 2451545.0
    T = n / 36525.0
    L = (280.46646 + 36000.76983 * T) % 360
    g = math.radians((357.52911 + 35999.05029 * T) % 360)
    C = ((1.914602 - 0.004817 * T) * math.sin(g)
         + 0.019993 * math.sin(2 * g) + 0.000289 * math.sin(3 * g))
    omega = math.radians(125.04 - 1934.136 * T)
    lam = L + C - 0.00569 - 0.00478 * math.sin(omega)
    eps = 23.439291 - 0.0130042 * T + 0.00256 * math.cos(omega)
    lr, er = math.radians(lam), math.radians(eps)
    ra = math.degrees(math.atan2(math.cos(er) * math.sin(lr), math.cos(lr))) % 360
    dec = math.asin(math.sin(er) * math.sin(lr))
    return ra, dec, lam % 360, eps


def _gmst(jd_ut: float) -> float:
    T = (jd_ut - 2451545.0) / 36525.0
    return (280.46061837 + 360.98564736629 * (jd_ut - 2451545.0)
            + 0.000387933 * T * T) % 360


def _gast(jd_ut: float) -> float:
    T = (jd_ut - 2451545.0) / 36525.0
    omega = math.radians(125.04452 - 1934.136261 * T)
    Ls = math.radians(280.4665 + 36000.7698 * T)
    dpsi = -17.2 * math.sin(omega) - 1.32 * math.sin(2 * Ls)   # arcsec
    eps = 23.439291 - 0.0130042 * T
    return (_gmst(jd_ut) + dpsi / 3600.0 * math.cos(math.radians(eps))) % 360


def sun_event(y: int, m: int, d: int, lat: float, lon: float, tz: float,
              rise: bool = True, h0: float = 0.0) -> float:
    """Local clock hours of sunrise/sunset (Sun's centre at h0 altitude).
    Kalai uses the geometric centre at 0° (பிம்ப மத்தி)."""
    jd0 = julian_day(y, m, d)
    t = jd0 + (6.0 if rise else 18.0) / 24.0 - tz / 24.0
    for _ in range(10):
        ra, dec, _, _ = _sun_ra_dec_trop(t)
        cosH = ((math.sin(math.radians(h0)) - math.sin(math.radians(lat)) * math.sin(dec))
                / (math.cos(math.radians(lat)) * math.cos(dec)))
        cosH = max(-1.0, min(1.0, cosH))
        H = math.degrees(math.acos(cosH))
        lha = (_gmst(t) + lon - ra + 540.0) % 360.0 - 180.0
        t += ((-H if rise else H) - lha) / 360.98564736629
    return (t + tz / 24.0 - jd0) * 24.0


# ---------------------------------------------------------------------------
# Lagna
# ---------------------------------------------------------------------------
def _asc_tropical(jd_ut: float, lat: float, lon: float,
                  d_ramc: float = 0.0, d_eps: float = 0.0) -> float:
    _, _, _, eps = _sun_ra_dec_trop(jd_ut)
    eps += d_eps
    ramc = math.radians((_gast(jd_ut) + lon + d_ramc) % 360)
    e, f = math.radians(eps), math.radians(lat)
    return math.degrees(math.atan2(math.cos(ramc),
                                   -(math.sin(ramc) * math.cos(e)
                                     + math.tan(f) * math.sin(e)))) % 360


def vakya_lagna(jd_ut: float, lat: float, lon: float) -> float:
    """Ascendant referred to the Vakkiyam Sun (sun-relative ayanamsa)."""
    t = kali_days_from_jd_ut(jd_ut)
    _, _, sun_trop, _ = _sun_ra_dec_trop(jd_ut)
    yrs = (jd_ut - 2451545.0) / 365.25
    c0, c1, d_ramc, d_eps = PARAMS["lagna"]
    return norm360(_asc_tropical(jd_ut, lat, lon, d_ramc, d_eps) - sun_trop
                   + vakya_sun(t) + c0 + c1 * yrs)


# ---------------------------------------------------------------------------
# Mandi (Kerala / Tamil ghatika rule)
# ---------------------------------------------------------------------------
# Mandi rises a fixed number of ghatikas (out of 30) after sunrise (day birth)
# or after sunset (night birth), scaled to the actual day / night length.
# Weekday index: Sunday=0 ... Saturday=6.  (Kalai matches this rule.)
MANDI_DAY_GHATI = {0: 26, 1: 22, 2: 18, 3: 14, 4: 10, 5: 6, 6: 2}
MANDI_NIGHT_GHATI = {0: 10, 1: 6, 2: 2, 3: 26, 4: 22, 5: 18, 6: 14}


def mandi_time(local_dt: datetime, lat: float, lon: float, tz: float):
    """Return (local datetime at which Mandi rises, vara date)."""
    def ev(dd: date, rise: bool) -> datetime:
        h = sun_event(dd.year, dd.month, dd.day, lat, lon, tz, rise)
        return datetime(dd.year, dd.month, dd.day) + timedelta(hours=h)

    d0 = local_dt.date()
    sr = ev(d0, True)
    if local_dt < sr:                  # before sunrise -> previous vara's night
        vara = d0 - timedelta(days=1)
        start, end, night = ev(vara, False), sr, True
    else:
        vara = d0
        ss = ev(d0, False)
        if local_dt < ss:
            start, end, night = sr, ss, False
        else:
            start, end, night = ss, ev(d0 + timedelta(days=1), True), True
    wd = (vara.weekday() + 1) % 7      # python Monday=0 -> Sunday=0
    gh = (MANDI_NIGHT_GHATI if night else MANDI_DAY_GHATI)[wd]
    return start + (end - start) * (gh / 30.0), vara


# ---------------------------------------------------------------------------
# Udayadi nazhikai
# ---------------------------------------------------------------------------
def udayadi_nazhikai(local_dt: datetime, lat: float, lon: float, tz: float):
    """Nazhikai elapsed since sunrise.

    Kalai measures births before sunrise from the *birth date's* sunrise
    clock time moved back 24 h (not the previous day's own sunrise), so the
    same is done here to reproduce its udayadi exactly.
    """
    d0 = local_dt.date()
    h = sun_event(d0.year, d0.month, d0.day, lat, lon, tz, True)
    sr = datetime(d0.year, d0.month, d0.day) + timedelta(hours=h)
    if local_dt < sr:
        sr -= timedelta(days=1)
    secs = (local_dt - sr).total_seconds()
    nazhikai = secs / 1440.0           # 1 nazhikai = 24 minutes
    n = int(nazhikai)
    v_f = (nazhikai - n) * 60
    v = int(v_f)
    tp = int(round((v_f - v) * 60))
    if tp == 60:
        tp, v = 0, v + 1
    if v == 60:
        v, n = 0, n + 1
    return {"nazhikai": n, "vinazhikai": v, "tharparai": tp,
            "sunrise_local": sr.strftime("%Y-%m-%d %H:%M:%S")}


# ---------------------------------------------------------------------------
# Formatting helpers
# ---------------------------------------------------------------------------
def nakshatra_pada(lon: float):
    lon = norm360(lon)
    span = 360.0 / 27
    idx = int(lon // span)
    pada = int((lon - idx * span) // (span / 4)) + 1
    return idx, pada


@dataclass
class BodyPosition:
    key: str
    longitude: float
    retrograde: bool

    def as_dict(self) -> dict:
        nk, pada = nakshatra_pada(self.longitude)
        r = int(self.longitude // 30)
        return {
            "key": self.key,
            "name_ta": PLANET_TA[self.key],
            "longitude": round(self.longitude, 6),
            "dms": dms(self.longitude),
            "rasi_index": r,
            "rasi_ta": RASI_TA[r],
            "rasi_en": RASI_EN[r],
            "degree_in_rasi": round(self.longitude - 30 * r, 6),
            "nakshatra_index": nk,
            "nakshatra_ta": NAK_TA[nk],
            "nakshatra_en": NAK_EN[nk],
            "pada": pada,
            "retrograde": self.retrograde,
        }


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
def compute_vakkiyam(year: int, month: int, day: int, hour: int, minute: int,
                     second: int, lat: float, lon: float,
                     tz: float = 5.5) -> dict:
    """Full Vakkiyam chart (Kalai Magal compatible).

    lat/lon in decimal degrees (north/east positive); tz in hours.
    """
    local_dt = datetime(year, month, day, hour, minute, second)
    jd_ut = julian_day(year, month, day,
                       hour + minute / 60 + second / 3600) - tz / 24.0
    t = kali_days_from_jd_ut(jd_ut)

    bodies = []
    for key in ORDER[:9]:
        lon_b = body_longitude(key, t)
        bodies.append(BodyPosition(key, lon_b, is_retrograde(key, t)))

    # Mandi = lagna at the moment Mandi rises (ghatika rule)
    m_dt, vara = mandi_time(local_dt, lat, lon, tz)
    m_jd = julian_day(m_dt.year, m_dt.month, m_dt.day,
                      m_dt.hour + m_dt.minute / 60 + m_dt.second / 3600
                      + m_dt.microsecond / 3.6e9) - tz / 24.0
    bodies.append(BodyPosition("mandi", vakya_lagna(m_jd, lat, lon), False))
    bodies.append(BodyPosition("lagna", vakya_lagna(jd_ut, lat, lon), False))

    sr = sun_event(year, month, day, lat, lon, tz, True)
    ss = sun_event(year, month, day, lat, lon, tz, False)

    def hhmmss(h: float) -> str:
        s = int(round(h * 3600))
        return f"{s // 3600:02d}:{(s % 3600) // 60:02d}:{s % 60:02d}"

    planets = {b.key: b.as_dict() for b in bodies}
    moon = planets["moon"]
    return {
        "system": "vakkiyam",
        "source": "Kalai Magal compatible Vakkiyam engine",
        "input": {"date": f"{year:04d}-{month:02d}-{day:02d}",
                  "time": f"{hour:02d}:{minute:02d}:{second:02d}",
                  "lat": lat, "lon": lon, "tz": tz},
        "kali_ahargana": round(t, 6),
        "sunrise": hhmmss(sr),
        "sunset": hhmmss(ss),
        "udayadi": udayadi_nazhikai(local_dt, lat, lon, tz),
        "vara_date": vara.isoformat(),
        "mandi_time": m_dt.strftime("%Y-%m-%d %H:%M:%S"),
        "planets": planets,
        "janma_nakshatra": {"index": moon["nakshatra_index"],
                            "ta": moon["nakshatra_ta"],
                            "en": moon["nakshatra_en"],
                            "pada": moon["pada"]},
        "janma_rasi": {"index": moon["rasi_index"], "ta": moon["rasi_ta"],
                       "en": moon["rasi_en"]},
        "lagna": {"index": planets["lagna"]["rasi_index"],
                  "ta": planets["lagna"]["rasi_ta"],
                  "en": planets["lagna"]["rasi_en"]},
    }


# ---------------------------------------------------------------------------
# Entry point used by backend/app/services/ephemeris.py
# ---------------------------------------------------------------------------
_BODY_KEYS = {"Sun": "sun", "Moon": "moon", "Mars": "mars", "Mercury": "mercury",
              "Jupiter": "jupiter", "Venus": "venus", "Saturn": "saturn",
              "Rahu": "rahu"}


def vakkiyam_for_jd(jd_ut: float, lat: float, lon: float,
                    jd_mandi: Optional[float] = None) -> Dict[str, dict]:
    """Vakkiyam positions in the app's planet naming.

    Returns {"Sun": {"lon": deg, "speed": deg/day, "retro": bool}, ... "Rahu",
             "Lagna": {"lon": deg}, "Mandi": {"lon": deg} (if jd_mandi given),
             "ayanamsa": implied Vakkiyam ayanamsa (true tropical Sun − Vakkiyam Sun)}.
    jd_ut is the UT Julian Day (the same jd the app passes to Swiss Ephemeris).
    """
    t = kali_days_from_jd_ut(jd_ut)
    out: Dict[str, dict] = {}
    for app_name, key in _BODY_KEYS.items():
        lon_b = body_longitude(key, t)
        if key == "rahu":
            speed = PARAMS["rahu"][1]
        else:
            speed = _wrap180(body_longitude(key, t + 0.5)
                             - body_longitude(key, t - 0.5))
        out[app_name] = {"lon": lon_b, "speed": speed,
                         "retro": speed < 0 and key not in ("sun", "moon")}
    out["Lagna"] = {"lon": vakya_lagna(jd_ut, lat, lon)}
    if jd_mandi is not None:
        out["Mandi"] = {"lon": vakya_lagna(jd_mandi, lat, lon)}
    _, _, sun_trop, _ = _sun_ra_dec_trop(jd_ut)
    out["ayanamsa"] = norm360(sun_trop - out["Sun"]["lon"])
    return out


if __name__ == "__main__":   # quick manual check: MA01
    import json
    r = compute_vakkiyam(2025, 1, 1, 2, 45, 0, 11.0, 77.0)
    for k in ORDER:
        p = r["planets"][k]
        print(f"{k:8s} {p['dms']}  {p['nakshatra_en']:18s} {p['pada']}"
              f"{'  (R)' if p['retrograde'] else ''}")
    print(json.dumps({k: r[k] for k in ("sunrise", "sunset", "udayadi",
                                         "mandi_time")}, ensure_ascii=False))
