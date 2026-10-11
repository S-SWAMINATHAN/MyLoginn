# SUMMARY — Chart centre fix + Vakkiyam analysis (v4.17.0)

## 1. Items 1–11

These are the same eleven items as last time. They were all fixed in **v4.16.0** (remembered language, header spacing, Bhava பாகை · கலை · விகலை columns, overflow-safe tables, horary name, aligned porutham, names auto-letter, Kongu palettes, production build check). If any of them still shows on your PC after installing 4.16 or this 4.17, please send a screenshot of that exact screen.

## 2. Charts: lines crossing the centre — ✅ fixed

In the Tamil and Kerala charts, the middle vertical and horizontal grid lines ran straight through the centre box. Now they stop at its edges, so the centre is one clean box with the title, like your reference book page. This is in the shared chart component, so it applies to **every chart in every feature**: Kanitha (rasi, navamsa, bhava, 16 vargas), KP, 12 Porutham and the single page. North-Indian charts were not affected. The designed PDF's own chart grid already had an empty centre.

## 3. Vakkiyam (item 12) — measured, not yet switched on

I compared your 9 Vakkiyam reports (V01–V07, V09, V10; there was no V08) with the calculations:

| Body | Result against Kalai |
|---|---|
| Sun | ✅ Surya-Siddhanta true Sun: within **2.2′** on 8 reports (one report is 58′ off) |
| Rahu / Ketu | ✅ Surya-Siddhanta node with a small linear correction: within **1.3′** |
| Moon | ⚠️ Best Surya-Siddhanta fit is still up to **12′** off. Kalai uses the traditional **சந்திர வாக்கியங்கள்** (Moon sentences), not a formula. |
| Mars, Mercury, Jupiter, Venus, Saturn | ❌ Off by **several degrees** (Mercury up to 19°). Kalai uses Vakya planetary tables. |

**Why it stays off.** The dasa balance, star pada, navamsa, Shadbala, Ashtakavarga and all the palan depend on the exact Moon and planets. A Moon 12′ off can change the pada and shift the dasa dates by months. So the Vakkiyam button shows a clear explanation instead of a wrong jathagam ("no content conflicts").

**What would let me finish it.** Kalai's Vakkiyam needs the actual Vakya tables. The best source is a printed **வாக்கிய பஞ்சாங்கம்** or a Vakya-ganitham book (for example the 248 சந்திர வாக்கியங்கள் and the planetary vakya tables). With photos or scans of those tables I can implement them and check them against the 9 reports. The measured data and my experiment are saved in `backend/docs/vakkiyam/`, so nothing is lost.

## 4. Palan content (பாவக / மகாதிசை / குரு கோச்சார / சனி கோச்சார / யோக அவயோகங்கள்)

Your photos show Kalai's printed palan: long paragraphs for each bhava, each dasa and bhukti, and each transit. That text is **Kalai's own writing**, so I can't copy it into your website.

The site's palan sections now use the site's own prediction engine, so they are shorter than Kalai's. To reach the same depth, the way forward is **original** palan writing for:
- 12 bhavas × their lord's placement,
- 9 mahadasas × 9 bhuktis,
- Guru and Sani transits through the 12 houses from the Moon,
- the yogas and avayogas.

That is several hundred paragraphs. I can write them in Tamil (and English) as a dedicated phase, chosen by the chart's actual placements. Tell me if you want it, or if you have your own astrologer's texts to use instead.

## 5. Files

| File | Change |
|---|---|
| `frontend/components/HandwrittenChartCanvas.tsx` | Centre box no longer crossed by grid lines |
| `frontend/app/kalai-report/page.tsx` | Vakkiyam status message with the measured findings |
| `backend/docs/vakkiyam/kalai_vakkiyam_v01_v10.json` | **New**: positions from your 9 test reports (test births only) |
| `backend/docs/vakkiyam/ss_model_experiment.py` | **New**: the Surya-Siddhanta model used for the comparison |
| `AGENTS.md` | Changelog 4.17.0 |

**Checks:** frontend type-check **0 errors**; backend tests **59 / 59**.
