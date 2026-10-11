import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base
from backend.app.api.charts import router as charts_router
from backend.app.api.profiles import router as profiles_router
from backend.app.api.porutham import router as porutham_router
from backend.app.api.narration import router as narration_router
from backend.app.api.geocode import router as geocode_router
from backend.app.api.baby_names import router as baby_names_router
from backend.app.api.horoscope import router as horoscope_router  # NEW
from backend.app.api.numerology import router as numerology_router  # NEW
from backend.app.api.muhurtha import router as muhurtha_router  # FIX: was never registered -> every /api/muhurtha/* call returned 404 "Not Found"
from backend.app.api.general_names import router as general_names_router  # A-Z name browsing
from backend.app.api.kalai import router as kalai_router  # Kalai Magal parity report (Phase 1)

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-precision Vedic Astrology (Jathagam) calculation and narration engine."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(charts_router, prefix=settings.API_V1_STR)
app.include_router(profiles_router, prefix=settings.API_V1_STR)
app.include_router(porutham_router, prefix=settings.API_V1_STR)
app.include_router(narration_router, prefix=settings.API_V1_STR)
app.include_router(geocode_router, prefix=settings.API_V1_STR)
app.include_router(baby_names_router, prefix=settings.API_V1_STR)
app.include_router(horoscope_router, prefix=settings.API_V1_STR)  # NEW
app.include_router(numerology_router, prefix=settings.API_V1_STR)  # NEW
app.include_router(muhurtha_router, prefix=settings.API_V1_STR)  # FIX: Muhurtha search (general / marriage / travel)
app.include_router(general_names_router, prefix=settings.API_V1_STR)  # General Baby Name Generator (A-Z)
app.include_router(kalai_router, prefix=settings.API_V1_STR)  # Kalai Magal parity report (Phase 1)
from backend.app.api.pdf import router as pdf_router  # WeasyPrint print PDFs
app.include_router(pdf_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def _seed_baby_names() -> None:
    """Creates and seeds the baby_names table from the verified banks.
    Idempotent — existing rows (including anything CSV-imported) are kept."""
    try:
        from backend.app.services.name_db import seed_from_banks
        seed_from_banks()
        try:
            from backend.app.services.kalai_name_import import seed_kalai_names
            seed_kalai_names()
        except Exception as exc:  # never block start-up on the optional Kalai names
            print(f"Kalai names not seeded: {exc}")
    except Exception as exc:  # never block startup on this
        print(f"[baby_names] seeding skipped: {exc}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ephemeris_path": settings.EPHE_PATH
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)