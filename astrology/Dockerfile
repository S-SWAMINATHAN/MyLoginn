# Astrology API (FastAPI) for hosts that run containers (Render, Railway, Fly.io, a VPS).
# Build context is the astrology/ folder:  docker build -t myloginn-astrology astrology
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

# WeasyPrint (print PDFs) needs Pango/HarfBuzz; build-essential covers pyswisseph if no wheel matches.
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libffi-dev shared-mime-info fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt backend/requirements.txt
RUN pip install -r backend/requirements.txt

COPY . .

EXPOSE 8765
# Render/Railway inject $PORT; locally it falls back to 8765.
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8765}"]
