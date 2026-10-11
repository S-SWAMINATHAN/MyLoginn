import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BASE_DIR.parent
EPHE_DIR = os.getenv("SE_EPHE_PATH", str(WORKSPACE_DIR / "ephe"))

# Kalai Magal parity: Kalai ships swedll32.dll WITHOUT .se1 data files, so it
# computes with the built-in Moshier ephemeris. Every parity rule (Delta-T,
# KP offset, dasa dates) was calibrated on Moshier; with the .se1 files the Moon
# moves by up to ~1" and boundary dates can flip by a day. "moshier" (default)
# hides the data files from Swiss Ephemeris; set KALAI_EPHEMERIS=files to use them.
KALAI_EPHEMERIS = os.getenv("KALAI_EPHEMERIS", "moshier").lower()
_MOSHIER_DIR = str(BASE_DIR / ".moshier_only")  # deliberately empty directory

class Settings:
    PROJECT_NAME: str = "AI Jathagam Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/jathagam.db")
    EPHE_PATH: str = _MOSHIER_DIR if KALAI_EPHEMERIS == "moshier" else EPHE_DIR
    DATA_EPHE_PATH: str = EPHE_DIR
    KALAI_EPHEMERIS: str = KALAI_EPHEMERIS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "*"]
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

settings = Settings()
os.makedirs(_MOSHIER_DIR, exist_ok=True)
