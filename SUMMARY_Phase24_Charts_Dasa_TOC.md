# SUMMARY — Charts, dasa spacing and contents page (v4.21.0)

| Issue | Fix |
|---|---|
| Square charts too small when a house has many planets; neighbouring charts overlapping | The chart now **grows with its content**: a crowded house makes its row taller instead of spilling out. Houses with 4 or more planets use slightly smaller text. The centre box shows only a short note (for example "மொத்தம் 48" in the ashtakavarga charts); the chart's title is printed above it, so long titles no longer push into the next chart. Small charts (ashtakavarga, 16 vargas) sit **3 per row** with clear gaps. North-Indian charts use smaller text in crowded houses. |
| Vimshottari dasa / antharam tables congested, with empty space at the bottom of each page | The cards now flow down **three columns, like a newspaper**, so every page fills to the bottom. There is **12 pt of space between cards** and more padding in each row. Cards are still never split across pages. |
| Contents page longer than the reference | The contents now list **exactly the reference's 20 main sections**, from பொது விவரங்கள் to யோக அவயோகங்கள், each with its page number. Sub-tables (each planet's prasthara, each Kalachakra dasa, and so on), the opening prayer pages and the closing page are no longer listed separately. |

**Checks:**
- Sample designed PDF regenerated: **53 pages** (was 56). Contents page has **20 entries**, there are **0 near-empty pages**, and no charts overlap.
- Backend tests **60 / 60**.

**Files:** `backend/app/services/pdf/render.py` (chart CSS, dasa column flow, contents), `backend/app/services/pdf/builders.py` (ashtakavarga / sarvashtakavarga headings), `AGENTS.md`.
