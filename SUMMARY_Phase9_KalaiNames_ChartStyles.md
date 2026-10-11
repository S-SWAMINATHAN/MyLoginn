# SUMMARY — Kalai names in the name bank + chart styles (v4.6.0)

## 1. Kalai names are now in your name bank

| Item | Result |
|---|---|
| Names taken from your Kalai printouts (BN1–BN4, baby_names.pdf) | **2,738** (2,608 boy, 130 girl), with Tamil spelling |
| Loaded automatically | at backend start-up (safe to repeat; nothing is duplicated) |
| Your existing names | untouched (the 1,052 bank names stay; Kalai names are tagged `source = 'kalai'`) |
| Test (BN3 settings: Uttarattathi, 09-06-2026, initial S) | the list begins S.CHAKRADEVA 33, S.CHAKRAPANI 32, CHAKRAVARTHI 33, CHAMPAK 24, S.CHANDAK 24 — **the same order as Kalai's printout** |

**Adding more Kalai names.** On **பெயர் (கலைமகள்)**, press **"கலைமகள் பெயர் PDF சேர் / Add names from a Kalai PDF"** and choose any Kalai baby-name printout. Its names are added, and duplicates are skipped.

To collect Kalai's full name list quickly:
- Print **"Numerology Numbers Only"** for a few different birth dates, for both Male and Female. Each gives 40–50 pages of names.
- Print **"Star Letters Only"** for each of the 27 stars.
- Upload each PDF with the button.

How the names were taken: I read them from **your printouts**. Kalai's `Master.mdb` is encrypted, and I did not decrypt or open it. Kalai's printouts carry no name meanings, so those names have none.

## 2. Tamil text repair

Kalai's TAB font writes ர் and ரி as special symbols. The importer now repairs them: for example சக்கரவா¢த்தி → **சக்கரவர்த்தி** and அமி£¢தம் → **அமிர்தம்**.

## 3. Chart styles (Kalai Ini setting "Chart Style")

On `/kalai-report` there is a new selector: **தென்னிந்திய (South) · வட இந்திய (North) · கிழக்கு (East)**. It changes every chart in the report: rasi, navamsa, bhava, the 16 varga charts and the ashtakavarga charts.

- **North:** fixed houses, with the lagna at the top diamond.
- **East:** fixed signs, with Mesham at the top centre going anticlockwise.

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_name_import.py` | **New** |
| `backend/app/data/kalai_names.json` | **New** (2,738 names) |
| `backend/app/main.py` | Modified (seeds Kalai names at start-up) |
| `backend/app/api/kalai.py` | Modified (`/import-names`, `/name-bank-stats`) |
| `backend/requirements.txt` | Modified (pdfplumber, open-tamil) |
| `backend/tests/test_kalai_parity.py` | Modified (+1 test, 56 total) |
| `frontend/components/kalai/KalaiReport.tsx` | Modified (chart styles) |
| `frontend/app/kalai-baby-names/page.tsx` | Modified (import button) |
| `frontend/lib/kalaiApi.ts` | Modified |
| `AGENTS.md` | Modified |

**Install note:** after copying, run `pip install -r backend\requirements.txt` once (it adds pdfplumber and open-tamil for the PDF import).
