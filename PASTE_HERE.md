# MYLoginn Astrology 4.25.0 — Kalai Magal parity (Phase 1 + 2a + 2b + 3a + validation + utilities + KP + horary + matching)

Copy with robocopy (copies only, never moves or deletes). Stop `pnpm dev` and `uvicorn` first.

```powershell
Expand-Archive -Path "D:\Main project\MyLoginn_Full_Project_v4.25.0.zip" -DestinationPath "D:\Main project\v4250" -Force
$src = "D:\Main project\v4250\MyLoginn_Full"
$dst = "D:\Main project\Tamil-Jathagam"
robocopy "$src" "$dst" /E /R:3 /W:2 /XD node_modules .next __pycache__

cd $dst
# once, for print-quality PDFs: install GTK for Windows Runtime (see SUMMARY_Phase14_PrintPDF.md), then:
pip install -r backend\requirements.txt
pip install -r backend\requirements.txt   # once: adds pdfplumber, open-tamil
python -m pytest -q backend\tests          # expect: 61 passed
python -m uvicorn backend.app.main:app --reload

# second terminal
cd "D:\Main project\Tamil-Jathagam\frontend"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm dev                                    # http://localhost:3000/kalai-report
```

Not included (your copies stay untouched): `node_modules`, `.next`, `backend\jathagam.db`, `__pycache__`.

Files changed in 4.25.0: see SUMMARY_Phase12_UI_Bugs.md.
