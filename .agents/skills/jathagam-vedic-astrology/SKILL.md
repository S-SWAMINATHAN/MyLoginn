---
name: jathagam-vedic-astrology
description: Domain knowledge, non-hallucination rules, PyJHora/Swiss Ephemeris mappings, Tamil terminology labels, and validation checklists for Vedic astrology (Jathagam) computations. Triggers whenever implementing or modifying chart computation, dasha/bhukti logic, yoga/dosha detection, ashtakavarga, porutham matching, panchangam system selection (Thirukanitham/Vakhyam), regional chart styles (Tamil/Kerala/North Indian), or LLM narration prompts.
---

# Jathagam Vedic Astrology Skill Guide

This skill governs all Vedic astrology calculations, data representations, UI rendering, and LLM narrations in this repository.

---

## 1. Non-Hallucination Rules (Mandatory)

1. **Never invent, guess, or approximate** planetary positions, house placements, nakshatra boundaries, dasha/bhukti dates, yoga/dosha presence, ashtakavarga points, or porutham scores. Every such value **must** come from a call into the ephemeris/PyJHora computation layer — never written directly as text, never "filled in" to make a demo look complete.
2. **If a required astrological rule isn't implemented yet, say so explicitly and stop.** Do not silently fabricate a plausible-looking placeholder value to make a PR/feature look finished.
3. **LLM narration must only describe values it was given in its prompt context.** It must never state a planetary position, date, house, or numeric fact that isn't present in the input chart JSON. If the narration output contains a number not traceable to the input, that's a bug in the prompt, not acceptable behavior.
4. **Cite the source of every calculation rule.** New astrological logic must reference a named classical text, a specific PyJHora module/function, or another verifiable reference implementation in a code comment before merging — "this is roughly how I remember dosha rules working" is not sufficient.
5. **Validate before calling it done.** Any chart-computation feature must be checked against the manual accuracy-validation charts (see `jathagam-architecture.md` §8 MVP Scope & Key Risks — 3–5 known charts cross-checked against Prokerala's free output) before being considered complete.
6. **When uncertain which panchangam system applies** (Thirukanitham vs. Vakhyam) to a specific calculation, default to Thirukanitham and **flag the ambiguity** in the PR description — never silently pick one and move on.
7. **Never mix regional chart-style conventions.** If a calculation is genuinely different between Tamil, Kerala, and North Indian traditions (not just layout), implement it as an explicit branch with a comment — don't quietly apply one region's rule everywhere.
8. **No unrequested scope creep from the agent itself** — e.g. don't add a new "feature" (a new yoga, a new UI flag) that wasn't asked for, since an untested addition in this domain is worse than no addition.

---

## 2. PyJHora / Ephemeris Feature Module Map

| Jathagam section | Calculation Module / Engine |
|---|---|
| Rasi Kattam / Navamsam Kattam / D2–D60 | `pyswisseph` (Lahiri Ayanamsha) / `horoscope/chart/charts.py` |
| Bhava predictions & House Lords | Equal House / Sripati cusps & `horoscope/chart/house.py` |
| Dasa & Bhukti | Vimshottari Dasha module (exact Moon longitude balance at birth) |
| Yogas (Gaja Kesari, Raja Yoga, Pancha Mahapurusha, etc.) | Classical rules (BPHS, Phaladeepika) / `horoscope/chart/raja_yoga.py` |
| Doshas (Sevvai/Manglik, Kala Sarpa, Pitru, Guru Chandala, Ganda Moola) | Classical rules & exceptions / `horoscope/chart/dosha.py` |
| Ashtakavarga (Bhinnashtakavarga & Sarvashtakavarga) | Classical BPHS bindu matrix / Ashtakavarga module |
| Porutham (Ashta Koota 36-pt + Tamil 10-Porutham) | `horoscope/match/compatibility.py` |
| Baby name suggestions | Canonical lookup table (Nakshatra/pada → starting syllable), not an LLM guess |
| Chart style (Tamil/Kerala/North Indian) | Rendering-layer concern only — same underlying chart data |

---

## 3. Standard Tamil / Sanskrit / English Terminology Table

### 3.1 Planets (நவக்கிரகங்கள் / Navagrahas)
| English | Sanskrit | Tamil | Key Symbol |
|---|---|---|---|
| Sun | Surya | சூரியன் (ஞாயிறு) | Su / சூ |
| Moon | Chandra | சந்திரன் (திங்கள்) | Mo / சந் |
| Mars | Mangala / Kuja | செவ்வாய் | Ma / செவ் |
| Mercury | Budha | புதன் | Me / புத |
| Jupiter | Guru / Brihaspati | குரு (வியாழன்) | Ju / குரு |
| Venus | Shukra | சுக்கிரன் (வெள்ளி) | Ve / சுக் |
| Saturn | Shani | சனி | Sa / சனி |
| Rahu | Rahu | ராகு | Ra / ராகு |
| Ketu | Ketu | கேது | Ke / கேது |
| Ascendant | Lagna | லக்னம் | La / லக் |

### 3.2 Signs (ராசிகள் / 12 Rasis)
| # | English | Sanskrit | Tamil | Lord (அதிபதி) |
|---|---|---|---|---|
| 1 | Aries | Mesha | மேஷம் | Mars (செவ்வாய்) |
| 2 | Taurus | Vrishabha | ரிஷபம் | Venus (சுக்கிரன்) |
| 3 | Gemini | Mithuna | மிதுனம் | Mercury (புதன்) |
| 4 | Cancer | Karka / Karkataka | கடகம் | Moon (சந்திரன்) |
| 5 | Leo | Simha | சிம்மம் | Sun (சூரியன்) |
| 6 | Virgo | Kanya | கன்னி | Mercury (புதன்) |
| 7 | Libra | Tula | துலாம் | Venus (சுக்கிரன்) |
| 8 | Scorpio | Vrischika | விருச்சிகம் | Mars (செவ்வாய்) |
| 9 | Sagittarius | Dhanus | தனுசு | Jupiter (குரு) |
| 10 | Capricorn | Makara | மகரம் | Saturn (சனி) |
| 11 | Aquarius | Kumbha | கும்பம் | Saturn (சனி) |
| 12 | Pisces | Meena | மீனம் | Jupiter (குரு) |

### 3.3 27 Nakshatras (நட்சத்திரங்கள்)
1. அசுவினி (Ashwini) - Ketu
2. பரணி (Bharani) - Venus
3. கார்த்திகை (Krittika) - Sun
4. ரோகிணி (Rohini) - Moon
5. மிருகசீரிஷம் (Mrigashirsha) - Mars
6. திருவாதிரை (Ardra) - Rahu
7. புனர்பூசம் (Punarvasu) - Jupiter
8. பூசம் (Pushya) - Saturn
9. ஆயில்யம் (Ashlesha) - Mercury
10. மகம் (Magha) - Ketu
11. பூரம் (Purva Phalguni) - Venus
12. உத்திரம் (Uttara Phalguni) - Sun
13. அஸ்தம் (Hasta) - Moon
14. சித்திரை (Chitra) - Mars
15. சுவாதி (Swati) - Rahu
16. விசாகம் (Vishakha) - Jupiter
17. அனுஷம் (Anuradha) - Saturn
18. கேட்டை (Jyeshtha) - Mercury
19. மூலம் (Moola) - Ketu
20. பூராடம் (Purva Ashadha) - Venus
21. உத்திராடம் (Uttara Ashadha) - Sun
22. திருவோணம் (Shravana) - Moon
23. அவிட்டம் (Dhanishta) - Mars
24. சதயம் (Shatabhisha) - Rahu
25. பூரட்டாதி (Purva Bhadrapada) - Jupiter
26. உத்திரட்டாதி (Uttara Bhadrapada) - Saturn
27. ரேவதி (Revati) - Mercury

---

## 4. Chart Style Separation Rule

**Chart style (Tamil / Kerala / North Indian) is strictly a rendering-layer concern.**
- **Tamil / South Indian style**: 12 fixed square boxes clockwise starting with Pisces at top-left-inner, Aries at top-middle-left, etc.
- **Kerala style**: 12 fixed square boxes clockwise with distinct outer border accents.
- **North Indian style**: Diamond/triangular layout with the 1st House (Lagna) always at the top center diamond, counting houses anti-clockwise.
- Under NO circumstances should switching the chart style change or fork planetary longitudes, house calculations, or astrological results.

---

## 5. "Before You Mark This Done" Checklist

- [ ] Every calculation cites a named classical source (BPHS, Phaladeepika, Jataka Parijata) or verified astronomical routine.
- [ ] Output validated against reference birth charts (e.g. Coimbatore 1996-08-15 07:00:00).
- [ ] Any panchangam ambiguity (Thirukanitham vs. Vakhyam) is explicitly flagged.
- [ ] LLM narration contains zero numbers or planetary claims not present in input context.
- [ ] TypeScript types and backend Pydantic schemas are 100% in sync.
