# SUMMARY — Palan as paragraphs, in the reference order (v4.19.0)

## 1. No more tables in the palan

**குரு கோச்சார பலன்கள் and சனி கோச்சார பலன்கள்** are now paragraphs, laid out like your reference reports. Each transit period has a heading line, then the paragraphs:

> **கடக ராசியில் குரு சஞ்சரிக்கும் காலம் — ஆரம்பம்: 02/06/2026 முடிவு: 31/10/2026 (வயது 21)**
> ஜென்ம ராசியான மிதுனத்திற்கு இரண்டில் கடக ராசியில் உச்சம் பெற்று தன ஸ்தானத்தில் குரு சஞ்சரிக்கிறார். இரண்டாம் இடத்தில் குரு சஞ்சரிப்பது … (a long paragraph on money, family, speech, studies and work)
> குருவின் அஷ்டவர்க்கத்தில் கடக ராசிக்கு 6 பரல்கள் உள்ளன; …

Each paragraph covers:
- the house from the natal Moon,
- the planet's dignity in that sign (உச்சம் / ஆட்சி / நட்பு / சமம் / பகை / நீசம்),
- the house name (தன, லாப, அஷ்டம …),
- detailed effects on career, money, family, health, with remedies,
- the planet's own ashtakavarga bindus for that sign,
- for Saturn, the ஏழரைச் சனி phase.

Jupiter is covered for the next 7 years and Saturn for the next 12 years, including retrograde re-entries.

**யோக அவயோகங்கள்** are also paragraphs, in the same "reason → ஏற்பட்டுள்ளது. இந்த யோகம் உள்ளவர்கள் …" form. 13 more yogas are now detected:
- சுனபா, அநபா, துருதுரா, வேசி, வாசி, உபயசரி
- வசுமதி, அமல, அதி, லக்ஷ்மி, சரஸ்வதி
- நீச பங்க ராஜ யோகம், பரிவர்த்தனை

The existing yogas have longer texts. Bhava and mahadasa palan stay paragraphs as before.

All texts are **original writing for your website**, based on classical rules (Phaladeepika, BPHS, Saravali). They are not copied from Kalai.

## 2. Same order as the reference

The designed PDF now follows the reference contents order exactly:

1. பொது விவரங்கள்
2. கிரக ஸ்புடம்
3. பாவ ஸ்புடம்
4. தசா புக்தி
5. அந்தரம்
6. அஷ்ட வர்க்கம்
7. பிரஸ்தார்
8. சட்பலம்
9. சோடச வர்க்கம்
10. கிரகங்களின் விவர அட்டவணை
11. நியுமராலஜி
12. உப கிரக ஸ்புடம்
13. காலச்சக்கிர தசை
14. பஞ்சபட்சி
15. பாவக பலன்கள்
16. மகாதிசை பலன்கள்
17. குரு கோச்சார பலன்கள்
18. சனி கோச்சார பலன்கள்
19. யோக அவயோகங்கள்

The website report already used this order.

**Checks:**
- Sample Tamil designed PDF: 59 pages, no near-empty pages, contents page checked for the order. The palan alone is about 19 full pages.
- Backend tests **60 / 60**; frontend type-check **0 errors**.

## Files

| File | Change |
|---|---|
| `backend/app/services/palan/long_text.py` | **New**: 24 long transit texts, 13 yoga texts |
| `backend/app/services/palan/compose.py` | Transit paragraphs, more yogas, Tamil sign forms |
| `backend/app/services/pdf/builders.py`, `schemas.py`, `render.py` | Reference order; palan as paragraphs |
| `frontend/components/kalai/KalaiReport.tsx`, `frontend/lib/kalaiApi.ts` | Transit palan as paragraphs on screen |
| `AGENTS.md` | Changelog 4.19.0 |
