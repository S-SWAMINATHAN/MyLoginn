# SUMMARY — Palan, all five sections (v4.18.0)

**Original palan writing for your website**, in Tamil and English, chosen by each chart's actual positions. It is new text based on classical principles (Brihat Parashara Hora Shastra), not copied from any software, so you own it.

## What each section now contains

| Section | Content for every chart |
|---|---|
| **16. பாவக பலன்கள்** | For each of the 12 houses: what the house governs; where its lord sits (one of **144** written lord-in-house texts); the lord's strength (உச்சம் / ஆட்சி / நட்பு / சமம் / பகை / நீசம், வக்கிரம், அஸ்தங்கம், benefic aspects); every planet sitting in the house (one of **108** planet-in-house texts); and the house's Sarvashtakavarga strength in bindus. |
| **17. மகாதிசை பலன்கள்** | For each of the 9 mahadasas: the planet's general dasa nature, its house in this chart, the houses it rules, then **every bhukti** with its end date. Each bhukti covers its relation to the dasa lord (நட்பு / பகை / சம) and its position from it (kendra/trikona, or 6/8/12), plus the house matters it activates. |
| **18. குரு கோச்சார பலன்கள்** | **Dated periods for the next 12 years**: from–to dates, sign, house from the natal Moon, ✔ / ◐ / ✕ quality and the effect for that house. |
| **19. சனி கோச்சார பலன்கள்** | **Dated periods for the next 30 years**, including ஏழரைச் சனி (12th, 1st and 2nd from the Moon), அர்த்தாஷ்டமம் and அஷ்டமச் சனி. |
| **20. யோக அவயோகங்கள்** | Yogas found in the chart: கஜகேசரி, புதாதித்ய, சந்திர மங்கள, ருசக / பத்ர / ஹம்ச / மாளவ்ய / சச, விபரீத ராஜ, தர்மகர்மாதிபதி. Avayogas: கேமத்ரும, சகட, குரு சண்டாள, கிரகண தோஷம். Each comes with its effects and a simple remedy where relevant. |

**Size.** The sample Tamil designed PDF grew from 44 to **57 pages**; the palan alone fills about 12 dense pages. Pages are full, with no near-empty pages.

**Where it appears.** On screen in the Kanitha report (sections 16–20) and in the designed PDF, in Tamil or English following the page language. It no longer depends on the old chart engine.

## Checks

- Backend tests **60 / 60**, including a new test that all five sections are complete in Tamil and English (12 houses; 9 dasas, each full dasa with 9 bhuktis; Guru and Sani periods; yogas).
- Frontend type-check **0 errors**.
- Tamil and English designed PDFs generated and inspected.

## Can be extended

- More yogas (e.g. Neecha-bhanga, Parivartana, Lakshmi, Saraswati).
- Longer texts for any combination.
- Using your astrologer's preferred wording for particular combinations.

The texts are plain tables in `backend/app/services/palan/`, so they can be edited directly.

## Files

| File | Change |
|---|---|
| `backend/app/services/palan/bhava_text.py` | **New**: 12 house meanings, 144 lord-in-house texts |
| `backend/app/services/palan/planet_text.py` | **New**: 108 planet-in-house texts, 9 dasa natures, 24 transit texts |
| `backend/app/services/palan/compose.py` | **New**: builds the five sections for a chart |
| `backend/app/services/kalai_report.py` | Adds `palan_ta` / `palan_en` |
| `backend/app/services/pdf/builders.py`, `render.py` | Designed PDF uses the new palan |
| `frontend/components/kalai/KalaiReport.tsx`, `frontend/lib/kalaiApi.ts` | Sections 16–20 show the new palan |
| `backend/tests/test_kalai_parity.py` | +1 test |
| `AGENTS.md` | Changelog 4.18.0 |
