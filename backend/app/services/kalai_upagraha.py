"""
Upagraha spudam (உப கிரக ஸ்புடம்) — Kalai Magal parity (Phase 6).

Sun-based (aprakasha) points, BPHS 3.61-65:
    Dhuma = Sun + 133°20'; Vyatipata = 360° − Dhuma; Parivesha = Vyatipata + 180°;
    Indrachapa = 360° − Parivesha; Upaketu (Dhumaketu) = Indrachapa + 16°40'.
Time-based points = Lagna at a fixed number of ghatis after sunrise (day birth)
or sunset (night birth), scaled to the real day/night length — the same method
Kalai uses for Mandi (see ephemeris.py). With the Mandi day table
G = [26, 22, 18, 14, 10, 6, 2] (Sun..Sat) and night table [10, 6, 2, 26, 22, 18, 14]:
    Gulika = Mandi (Kalai prints the same value)  offset 0
    Kala = G[weekday − 1]   Mrityu = G[weekday − 3]
    Ardhaprahara = G[weekday + 3]   Yamaghantaka = G[weekday + 2]
Offsets decoded from T04 (all five solve to whole ghatis: 14, 18, 26, 2, 6).
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

import swisseph as swe

from backend.app.services.ephemeris import get_tz

DAY_G = [26, 22, 18, 14, 10, 6, 2]
NIGHT_G = [10, 6, 2, 26, 22, 18, 14]
OFFSETS = {"gulika": 0, "kala": -1, "mrityu": -3, "ardhaprahara": 3, "yamaghantaka": 2}
NAMES_TA = {"gulika": "குளிகன்", "yamaghantaka": "யமகண்டன்", "ardhaprahara": "அர்த்தப் பிரகரணம்",
            "kala": "காலன்", "mrityu": "மிருத்யு", "dhuma": "தூமன்", "vyatipata": "வியதி பாதன்",
            "parivesha": "பரிவேடம்", "indrachapa": "இந்திர தனுசு", "upaketu": "தூம கேது"}
ORDER = ["gulika", "yamaghantaka", "ardhaprahara", "kala", "mrityu", "dhuma", "vyatipata", "parivesha", "indrachapa", "upaketu"]
RS = swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION


def _dms(x: float) -> str:
    s = int(round((x % 360.0) * 3600)) % (360 * 3600)
    return f"{s // 3600:03d} {s % 3600 // 60:02d} {s % 60:02d}"


def compute_upagrahas(jd_ut: float, lat: float, lon: float, date_str: str, tz: str, sun_sidereal: float) -> Dict[str, Any]:
    y, m, d = [int(v) for v in date_str.split("-")]
    off = get_tz(tz).utcoffset(datetime(y, m, d, 12)).total_seconds() / 86400.0
    mid = swe.julday(y, m, d, 0.0) - off
    geo = (lon, lat, 0.0)
    rise = swe.rise_trans(mid, swe.SUN, swe.CALC_RISE | RS, geo, 0, 0, swe.FLG_SWIEPH)[1][0]
    sset = swe.rise_trans(mid, swe.SUN, swe.CALC_SET | RS, geo, 0, 0, swe.FLG_SWIEPH)[1][0]
    wd = (datetime(y, m, d).weekday() + 1) % 7
    # Kalai uses the BIRTH-DATE sunrise/sunset shifted by one day for the
    # neighbouring night (not the true previous sunset / next sunrise) — this
    # makes T02, T03 and T06 exact.
    if jd_ut < rise:  # before sunrise: night of the previous weekday
        start, length, table, wd = sset - 1.0, rise - (sset - 1.0), NIGHT_G, (wd - 1) % 7
    elif jd_ut < sset:
        start, length, table = rise, sset - rise, DAY_G
    else:
        start, length, table = sset, (rise + 1.0) - sset, NIGHT_G
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    out: Dict[str, float] = {}
    for k, o in OFFSETS.items():
        g = table[(wd + o) % 7]
        t = start + length * g / 30.0
        out[k] = swe.houses_ex(t, lat, lon, b"P", swe.FLG_SIDEREAL)[1][0] % 360.0
    dh = (sun_sidereal + 133.0 + 20.0 / 60.0) % 360.0
    vy = (360.0 - dh) % 360.0
    pa = (vy + 180.0) % 360.0
    ic = (360.0 - pa) % 360.0
    out.update({"dhuma": dh, "vyatipata": vy, "parivesha": pa, "indrachapa": ic,
                "upaketu": (ic + 16.0 + 40.0 / 60.0) % 360.0})
    rows = [{"key": k, "name_ta": NAMES_TA[k], "longitude": round(out[k], 6), "dms": _dms(out[k]),
             "sign": int(out[k] // 30) + 1, "degree_in_sign_dms": _dms(out[k] % 30.0)} for k in ORDER]
    return {"status": "ok", "rows": rows}
