# Running the Astrology service locally

The Astrology pages in the MyLoginn app call this Python service through `/api/astrology/*`.
It listens on **port 8765** (port 8000 is used by another MyLoginn project).

Requirements: Python 3.11, and Microsoft C++ Build Tools (`pyswisseph` has no Windows wheels and compiles on install).
GTK3 runtime is also needed for the WeasyPrint print PDFs (see README / PASTE_HERE notes in the original project).

```powershell
cd astrology
py -3.11 -m venv .venv
.\.venv\Scripts\pip install -r backend\requirements.txt
.\.venv\Scripts\python -m uvicorn backend.app.main:app --port 8765
```

Check it: http://127.0.0.1:8765/api/health

Next.js reads `ASTROLOGY_API_URL` (default `http://127.0.0.1:8765`). Set `ASTROLOGY_API_SECRET` on both sides to restrict the service to the app.
