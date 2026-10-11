"""
calibrate_vakkiyam.py — rebuild / verify Vakkiyam constants from Kalai Magal PDFs.

Dev-only tool (needs numpy + scipy and poppler's `pdftotext`).
The runtime engine (backend/app/services/vakkiyam.py) needs none of these.

Usage
-----
  # 1. parse every Kalai PDF in a folder into kalai_vakkiyam.json
  python backend/tools/calibrate_vakkiyam.py parse  "path/to/Vakkiyam datas"  backend/tests/data/kalai_vakkiyam_all.json

  # 2. refit constants (prints a PARAMS block to paste into vakkiyam.py)
  python backend/tools/calibrate_vakkiyam.py fit    backend/tests/data/kalai_vakkiyam_all.json

  # 3. accuracy report against Kalai (markdown table)
  python backend/tools/calibrate_vakkiyam.py report backend/tests/data/kalai_vakkiyam_all.json

Report naming: any file name works, but the body of the PDF must be a Kalai
"ஒரு பக்க ஜாதகம்" with Calculation = வாக்கியம். Duplicate reports (same date,
time and place) are skipped automatically.
"""
from __future__ import annotations

import glob
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "app", "services"))
import vakkiyam as V  # noqa: E402

BODIES = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn",
          "rahu", "ketu", "mandi", "lagna"]


# ---------------------------------------------------------------------------
# 1. Parse
# ---------------------------------------------------------------------------
def _to_24h(hms: str, ap: str):
    h, m, s = map(int, hms.split(":"))
    if ap == "PM" and h != 12:
        h += 12
    if ap == "AM" and h == 12:
        h = 0
    return h, m, s


def parse_report(text: str, code: str) -> dict:
    r = {"code": code}
    m = re.search(r":\s*(\d\d)-(\d\d)-(\d{4})\s", text)
    r["date"] = f"{m[3]}-{m[2]}-{m[1]}"
    m = re.search(r":(\d\d:\d\d:\d\d) ([AP]M) \(GMT", text)
    r["time"] = "%02d:%02d:%02d" % _to_24h(m[1], m[2])
    m = re.search(r"(\d\d):(\d\d) ([NS]) / (\d{3}):(\d\d) ([EW])", text)
    lat = int(m[1]) + int(m[2]) / 60
    lon = int(m[4]) + int(m[5]) / 60
    r["lat"] = -lat if m[3] == "S" else lat
    r["lon"] = -lon if m[6] == "W" else lon
    m = re.search(r"([+-]?\d\d)\.(\d\d)([EW]) Indian|(\d\d)\.(\d\d)([EW])\s", text)
    r["tz"] = 5.5
    times = re.findall(r":\s*(\d\d:\d\d:\d\d) ([AP]M) \(", text)
    r["sunrise"] = "%02d:%02d:%02d" % _to_24h(*times[1])
    r["sunset"] = "%02d:%02d:%02d" % _to_24h(*times[2])

    lines = text.split("\n")
    head = [k for k, l in enumerate(lines) if "è¤óèñ¢" in l and "ð£îñ¢" in l]
    if not head:
        raise ValueError("planet table not found (is this a Vakkiyam single-page report?)")
    i = head[0]
    left, right = [], []
    for line in lines[i + 1:i + 7]:
        ms = list(re.finditer(r"(\(õ\))?\s*(\d{1,3}) (\d\d) (\d\d)(?=\s)", line + " "))
        if ms:
            left.append(ms[0])
        if len(ms) > 1:
            right.append(ms[1])
    names = list(zip(["sun", "moon", "mars", "mercury", "jupiter", "venus"], left)) + \
        list(zip(["saturn", "rahu", "ketu", "mandi", "lagna"], right))
    for n, mm in names:
        r[n] = int(mm[2]) + int(mm[3]) / 60 + int(mm[4]) / 3600
        r[n + "_dms"] = f"{int(mm[2]):03d} {mm[3]} {mm[4]}"
        r[n + "_retro"] = mm[1] is not None
    return r


def cmd_parse(folder: str, out: str):
    rows, seen = [], set()
    for pdf in sorted(glob.glob(os.path.join(folder, "*.pdf"))):
        code = os.path.splitext(os.path.basename(pdf))[0]
        text = subprocess.run(["pdftotext", "-layout", pdf, "-"],
                              capture_output=True, text=True, check=True).stdout
        try:
            r = parse_report(text, code)
        except Exception as exc:  # noqa: BLE001
            print(f"skip {code}: {exc}")
            continue
        key = (r["date"], r["time"], round(r["lat"], 3), round(r["lon"], 3))
        if key in seen:
            print(f"skip {code}: duplicate of an earlier report {key}")
            continue
        seen.add(key)
        rows.append(r)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, indent=1, ensure_ascii=False)
    print(f"{len(rows)} reports -> {out}")


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def _jd(r):
    y, mo, d = map(int, r["date"].split("-"))
    h, mi, s = map(int, r["time"].split(":"))
    return V.julian_day(y, mo, d, h + mi / 60 + s / 3600) - r.get("tz", 5.5) / 24


def _calc(r):
    y, mo, d = map(int, r["date"].split("-"))
    h, mi, s = map(int, r["time"].split(":"))
    return V.compute_vakkiyam(y, mo, d, h, mi, s, r["lat"], r["lon"], r.get("tz", 5.5))


def _res(a, b):
    return ((a - b + 180) % 360 - 180) * 60.0   # arc-minutes


# ---------------------------------------------------------------------------
# 2. Fit
# ---------------------------------------------------------------------------
def cmd_fit(path: str):
    import numpy as np
    from scipy.optimize import least_squares

    rows = json.load(open(path, encoding="utf-8"))
    T = [V.kali_days_from_jd_ut(_jd(r)) for r in rows]

    def fit(key, fn, p0):
        y = [r[key] for r in rows]

        def res(p):
            V.PARAMS[key] = list(p)
            return np.array([_res(fn(t), yy) for t, yy in zip(T, y)])
        sol = least_squares(res, p0)
        V.PARAMS[key] = [float(x) for x in sol.x]
        rr = res(sol.x)
        print(f"{key:8s} rms {np.sqrt(np.mean(rr ** 2)):6.2f}'  max {np.abs(rr).max():6.2f}'")

    # Sun first: every other body depends on it
    fit("sun", V.vakya_sun, V.PARAMS["sun"])
    fit("moon", V.vakya_moon, V.PARAMS["moon"])
    for pl in ("mars", "mercury", "jupiter", "venus", "saturn"):
        fit(pl, lambda t, pl=pl: V.vakya_planet(pl, t), V.PARAMS[pl])
    fit("rahu", V.vakya_rahu, V.PARAMS["rahu"])

    # Lagna (place dependent)
    placed = [r for r in rows if r.get("lat") is not None]

    def res_l(p):
        V.PARAMS["lagna"] = list(p)
        return np.array([_res(V.vakya_lagna(_jd(r), r["lat"], r["lon"]), r["lagna"])
                         for r in placed])
    sol = least_squares(res_l, V.PARAMS["lagna"])
    V.PARAMS["lagna"] = [float(x) for x in sol.x]
    rr = res_l(sol.x)
    print(f"lagna    rms {np.sqrt(np.mean(rr ** 2)):6.2f}'  max {np.abs(rr).max():6.2f}'")

    rr = np.array([_res(_calc(r)["planets"]["mandi"]["longitude"], r["mandi"]) for r in placed])
    print(f"mandi    rms {np.sqrt(np.mean(rr ** 2)):6.2f}'  max {np.abs(rr).max():6.2f}'  (follows lagna)")

    print("\nPARAMS = {")
    for k, v in V.PARAMS.items():
        print(f'    "{k}": [{", ".join(repr(round(float(x), 10)) for x in v)}],')
    print("}")


# ---------------------------------------------------------------------------
# 3. Report
# ---------------------------------------------------------------------------
def cmd_report(path: str, out: str | None = None):
    rows = json.load(open(path, encoding="utf-8"))
    lines = ["| Code | Date | Time | Place | " + " | ".join(b.capitalize() for b in BODIES)
             + " | Nakshatra+pada | Rasi | Lagna rasi |",
             "|" + "---|" * (len(BODIES) + 7)]
    agg = {b: [] for b in BODIES}
    nak_ok = rasi_ok = lag_ok = lag_n = 0
    for r in rows:
        placed = r.get("lat") is not None
        rr = r if placed else dict(r, lat=11.0, lon=77.0)   # planets do not depend on place
        c = _calc(rr)["planets"]
        cells = []
        for b in BODIES:
            if b not in r or (b in ("lagna", "mandi") and not placed):
                cells.append("—")
                continue
            d = _res(c[b]["longitude"], r[b])
            agg[b].append(d)
            cells.append(f"{d:+.1f}")
        kn, kp = V.nakshatra_pada(r["moon"])
        same_n = (kn, kp) == (c["moon"]["nakshatra_index"], c["moon"]["pada"])
        same_r = int(r["moon"] // 30) == c["moon"]["rasi_index"]
        nak_ok += same_n
        rasi_ok += same_r
        if placed:
            lag_n += 1
            same_l = int(r["lagna"] // 30) == c["lagna"]["rasi_index"]
            lag_ok += same_l
            lag_txt = "✔" if same_l else "✘"
        else:
            lag_txt = "—"
        place = f"{r['lat']:.2f},{r['lon']:.2f}" if placed else "—"
        lines.append(f"| {r['code']} | {r['date']} | {r['time']} | {place} | " + " | ".join(cells)
                     + f" | {'✔' if same_n else '✘'} | {'✔' if same_r else '✘'} | {lag_txt} |")
    n = len(rows)
    lines += ["", "| Body | Reports | RMS (′) | Max \\|err\\| (′) |", "|---|---|---|---|"]
    for b in BODIES:
        v = agg[b]
        if not v:
            continue
        rms = (sum(x * x for x in v) / len(v)) ** 0.5
        lines.append(f"| {b.capitalize()} | {len(v)} | {rms:.2f} | {max(abs(x) for x in v):.2f} |")
    lines += ["", f"Nakshatra+pada match {nak_ok}/{n}, Moon rasi match {rasi_ok}/{n}, "
                  f"Lagna rasi match {lag_ok}/{lag_n}"]
    txt = "\n".join(lines)
    if out:
        open(out, "w", encoding="utf-8").write(txt + "\n")
    print(txt)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "parse":
        cmd_parse(sys.argv[2], sys.argv[3])
    elif cmd == "fit":
        cmd_fit(sys.argv[2])
    elif cmd == "report":
        cmd_report(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
    else:
        print(__doc__)
