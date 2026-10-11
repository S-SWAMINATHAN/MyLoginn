# SUMMARY — Shodasa varga charts (v4.22.0)

| Issue | Fix |
|---|---|
| சோடச வர்க்கம் charts small, 3 per row, text overlapping | The 16 varga charts are now **two per row at full size (8 cm)**, the same size as the Rasi / Navamsam charts. They use as many pages as needed: 4 charts per page, about 4 pages in all. A crowded house makes its row taller instead of overlapping, the centre shows the varga name, and no chart is split across pages. |

Other charts:
- Rasi, Navamsam and Bhava charts are now 8 cm with a 16 pt gap below each.
- The ashtakavarga charts (small, 3 per row) and everything from 4.21 are unchanged.

**Checks:** sample designed PDF regenerated (55 pages, 0 near-empty pages). The varga pages were inspected visually: 2 charts per row, no overlaps. Backend tests **60 / 60**.

**This zip is the complete project.** It includes every earlier fix (4.13 to 4.21), so installing it alone brings everything up to date.

**Files:** `backend/app/services/pdf/builders.py`, `backend/app/services/pdf/render.py`, `AGENTS.md`.
