from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class BasicBirthDetails(BaseModel):
    # Lagnam Particulars
    lagnam: str
    lagnam_ta: str
    lagnam_degree: float
    lagnam_dms: Optional[str] = None
    lagnam_total_degree: Optional[float] = None
    lagnam_lord: Optional[str] = None
    lagnam_lord_ta: Optional[str] = None
    lagnam_nakshatram: Optional[str] = None
    lagnam_nakshatram_ta: Optional[str] = None
    lagnam_pada: Optional[int] = None
    lagnam_nakshatra_lord: Optional[str] = None
    lagnam_nakshatra_lord_ta: Optional[str] = None
    lagnam_navamsa: Optional[str] = None
    lagnam_navamsa_ta: Optional[str] = None
    lagnam_navamsa_lord: Optional[str] = None
    lagnam_navamsa_lord_ta: Optional[str] = None

    # Rasi & Star Particulars
    rasi: str
    rasi_ta: str
    rasi_lord: Optional[str] = None
    rasi_lord_ta: Optional[str] = None
    nakshatram: str
    nakshatram_ta: str
    pada: int
    nakshatra_lord: Optional[str] = None
    nakshatra_lord_ta: Optional[str] = None
    nakshatra_deity: Optional[str] = None
    nakshatra_elapsed_pct: Optional[float] = None

    # Panchangam 5 Limbs
    thithi: str
    thithi_ta: str
    paksha: str
    paksha_en: Optional[str] = None
    paksha_ta: Optional[str] = None
    thithi_elapsed_pct: Optional[float] = None
    vaaram: str
    vaaram_ta: str
    vaaram_lord: Optional[str] = None
    vaaram_lord_ta: Optional[str] = None
    yogam: str
    yogam_ta: str
    karanam: str
    karanam_ta: str

    # Tamil Panchangam Subha Yoga
    subha_yogam: Optional[str] = None
    subha_yogam_ta: Optional[str] = None
    subha_yogam_desc: Optional[str] = None
    subha_yogam_desc_ta: Optional[str] = None
    subha_yogam_status: Optional[str] = None

    # Nakshatra Attributes
    ganam: Optional[str] = None
    ganam_ta: Optional[str] = None
    yoni: Optional[str] = None
    yoni_ta: Optional[str] = None
    rajju: Optional[str] = None
    rajju_ta: Optional[str] = None
    bootham: Optional[str] = None
    bootham_ta: Optional[str] = None
    nadi: Optional[str] = None
    nadi_ta: Optional[str] = None
    vriksham_ta: Optional[str] = None
    pakshi_ta: Optional[str] = None
    mirugam_ta: Optional[str] = None

    # Ephemeris & Timings
    ayanamsa_name: str = "Lahiri (Chitrapaksha)"
    ayanamsa_value: float
    ayanamsa_dms: Optional[str] = None
    panchangam_system: str = "thirukkanitham"
    sun_rise: Optional[str] = None
    sun_set: Optional[str] = None
    dinamani: Optional[str] = None
    dinamani_en: Optional[str] = None
    ratrimana: Optional[str] = None
    ratrimana_en: Optional[str] = None
    udhayadhi_nazhigai: Optional[str] = None
    udhayadhi_nazhigai_en: Optional[str] = None
    rahu_kalam: Optional[str] = None
    yamagandam: Optional[str] = None
    kuligai: Optional[str] = None
    dasha_balance_ta: Optional[str] = None
    dasha_balance_en: Optional[str] = None

class PlanetPosition(BaseModel):
    name: str
    name_ta: str
    name_sa: str
    symbol: str
    rasi_number: int  # 1 to 12 (Mesha=1 .. Meena=12)
    rasi: str
    rasi_ta: str
    degree: float  # 0 to 30 within the sign
    degree_dms: Optional[str] = None
    total_degree: float  # 0 to 360 absolute longitude
    total_degree_dms: Optional[str] = None
    house: int  # 1 to 12 from Lagna
    lord: Optional[str] = None
    lord_ta: Optional[str] = None
    nakshatra: str
    nakshatra_ta: str
    nakshatra_number: int
    nakshatra_lord: Optional[str] = None
    nakshatra_lord_ta: Optional[str] = None
    pada: int
    navamsa_sign: Optional[int] = None
    navamsa_rasi: Optional[str] = None
    navamsa_rasi_ta: Optional[str] = None
    navamsa_lord: Optional[str] = None
    navamsa_lord_ta: Optional[str] = None
    is_retrograde: bool = False
    speed: float = 0.0
    status: str = "Direct"
    status_ta: Optional[str] = "சமம்"

class BhuktiPeriod(BaseModel):
    planet: str
    planet_ta: str
    start_date: str
    end_date: str
    duration_years: float
    is_current: Optional[bool] = False

class VimshottariDashaPeriod(BaseModel):
    planet: str
    planet_ta: str
    start_date: str
    end_date: str
    duration_years: float
    is_current: bool = False
    bhuktis: List[BhuktiPeriod] = []

class HouseDetail(BaseModel):
    house_number: int
    rasi_number: int
    rasi: str
    rasi_ta: str
    lord: str
    lord_ta: str
    occupants: List[str] = []
    aspecting_planets: List[str] = []
    significations: List[str] = []
    significations_ta: List[str] = []
    prediction: str
    prediction_ta: str

class YogaResult(BaseModel):
    name: str
    name_ta: str
    category: str  # Raja Yoga, Dhana Yoga, Auspicious, etc.
    present: bool
    description: str
    description_ta: str
    classical_source: str
    planets_involved: List[str] = []

class DoshaResult(BaseModel):
    name: str
    name_ta: str
    present: bool
    severity: str  # Low, Moderate, High, Cancelled, None
    description: str
    description_ta: str
    remedies: List[str] = []
    remedies_ta: List[str] = []
    classical_source: str
    cancellation_rules_applied: List[str] = []

class AshtakavargaResult(BaseModel):
    bhinnashtakavarga: Dict[str, List[int]]  # Planet -> [12 scores for Mesha to Meena]
    sarvashtakavarga: List[int]  # 12 scores for signs 1-12
    sarvashtakavarga_by_house: List[int]  # 12 scores from Lagna house 1 to 12
    total_points: int = 337

class KutaDetail(BaseModel):
    name: str
    name_ta: str
    name_sa: str
    obtained_points: float
    max_points: float
    description: str
    description_ta: str
    status: str  # Excellent, Good, Average, Inauspicious

class Porutham10Item(BaseModel):
    key: str
    name: str
    name_ta: str
    is_compatible: bool
    description: str
    description_ta: str

class PoruthamMatchResult(BaseModel):
    boy_details: Dict[str, Any]
    girl_details: Dict[str, Any]
    ashta_koota: Dict[str, Any]  # total_points, max_points (36), kutas list
    tamil_10_porutham: List[Porutham10Item]
    rajju_dosha: bool
    rajju_type: Optional[str] = None
    rajju_type_ta: Optional[str] = None
    vedha_dosha: bool
    score_percentage: float
    verdict: str
    verdict_ta: str
    recommendation: str
    recommendation_ta: str

class BabyNameResult(BaseModel):
    nakshatra: str
    nakshatra_ta: str
    pada: int
    starting_syllables: List[str]
    target_syllable: Optional[str] = None
    gender: Optional[str] = None
    suggestions: List[Dict[str, str]] = []  # [{name, name_ta, meaning, meaning_ta, gender}]

class NarrationResult(BaseModel):
    language: str = "ta"
    summary: str
    current_dasa_reading: str
    yogas_and_doshas_reading: str
    career_and_wealth: str
    marriage_and_family: str
    health_and_longevity: str

# --- NEW: Single-Page Report supporting models ---
# These back the single-page ("Single Page Jathagam") report's genuinely
# new pieces. See backend/app/services/single_page_report.py for the
# citations behind each of these — nothing here duplicates an existing
# calculation; each pulls from existing computed values (dasha, doshas,
# ashtakavarga, nakshatra deity) plus the new Saturn-transit check.

class TransitDoshaResult(BaseModel):
    name: str
    name_ta: str
    present: bool
    phase: Optional[str] = None
    phase_ta: Optional[str] = None
    description: str
    description_ta: str
    classical_source: str

class LifeCategoryScore(BaseModel):
    category: str
    category_ta: str
    icon: str
    score_percentage: float
    rating: str
    rating_ta: str
    houses_considered: List[int]
    summary: str
    summary_ta: str

class RemedyGuide(BaseModel):
    presiding_deity: str
    presiding_deity_ta: str
    favorable_day: str
    favorable_day_ta: str
    lucky_color: str
    lucky_color_ta: str
    lucky_number: int
    simple_rituals: List[str]
    simple_rituals_ta: List[str]
    classical_source: str

class CurrentPeriodSummary(BaseModel):
    mahadasha_lord: str
    mahadasha_lord_ta: str
    bhukti_lord: str
    bhukti_lord_ta: str
    mahadasha_start: str
    mahadasha_end: str
    bhukti_start: str
    bhukti_end: str
    micro_prediction: str
    micro_prediction_ta: str

class SinglePageSummary(BaseModel):
    current_period: Optional[CurrentPeriodSummary] = None
    saturn_transit: Optional[TransitDoshaResult] = None
    life_scorecard: List[LifeCategoryScore] = []
    remedies: Optional[RemedyGuide] = None

class GenerateChartRequest(BaseModel):
    name: Optional[str] = "Jathagar"
    gender: Optional[str] = "male"
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    time_of_birth: str = Field(..., description="HH:MM:SS")
    place: str = Field(..., description="City, State, Country")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    panchangam_system: str = Field("thirukkanitham", description="thirukkanitham or vakhyam")
    chart_style: str = Field("tamil", description="tamil, kerala, or north_indian")
    output_mode: str = Field("full", description="full or single_page")
    parent_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    personal_details: Optional[str] = None
    family_details: Optional[str] = None

class ChartResponse(BaseModel):
    profile_id: Optional[int] = None
    name: str
    gender: Optional[str] = None
    date_of_birth: str
    time_of_birth: str
    place: str
    latitude: float
    longitude: float
    timezone: str
    panchangam_system: str
    chart_style: str
    output_mode: str
    basic_details: BasicBirthDetails
    planets: List[PlanetPosition]
    rasi_kattam: Dict[int, List[Dict[str, Any]]]  # sign_number (1-12) -> list of planets
    navamsa_kattam: Dict[int, List[Dict[str, Any]]]  # sign_number (1-12) -> list of planets
    bhava_predictions: List[HouseDetail]
    vimshottari_dasha: List[VimshottariDashaPeriod]
    yogas: List[YogaResult]
    doshas: List[DoshaResult]
    ashtakavarga: AshtakavargaResult
    baby_names: Optional[BabyNameResult] = None
    narration: Optional[NarrationResult] = None
    single_page_summary: Optional[SinglePageSummary] = None  # NEW
    computed_at: str

class ProfileCreate(BaseModel):
    name: str
    gender: Optional[str] = None
    date_of_birth: str
    time_of_birth: str
    place: str
    parent_name: Optional[str] = None
    personal_details: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    family_details: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    name: str
    gender: Optional[str] = None
    date_of_birth: str
    time_of_birth: str
    place_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    parent_name: Optional[str] = None
    personal_details: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    family_details: Optional[str] = None
    created_at: str

class PoruthamRequest(BaseModel):
    # Option 1: by profile IDs
    profile_id_boy: Optional[int] = None
    profile_id_girl: Optional[int] = None
    # Option 2: direct birth details
    boy_dob: Optional[str] = None
    boy_tob: Optional[str] = None
    boy_place: Optional[str] = None
    girl_dob: Optional[str] = None
    girl_tob: Optional[str] = None
    girl_place: Optional[str] = None
    # Option 3: direct nakshatra & pada
    boy_nakshatra: Optional[str] = None
    boy_pada: Optional[int] = None
    girl_nakshatra: Optional[str] = None
    girl_pada: Optional[int] = None

class NarrationRequest(BaseModel):
    chart_id: Optional[int] = None
    chart_data: Optional[Dict[str, Any]] = None
    language: str = "ta"  # "ta" or "en"

# --- NEW: standalone Baby Name request (independent of full chart generation) ---
# Mirrors the same birth-detail fields as GenerateChartRequest (name/gender
# optional, dob/tob/place required, latitude/longitude/timezone optional —
# populated automatically when the frontend's place-autocomplete suggestion
# is picked, same as the main chart form). No new fields invented beyond
# what's needed to resolve the Moon's Nakshatra/Pada via the existing
# ephemeris pipeline.
class BabyNameRequest(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None  # "male"/"boy" or "female"/"girl" — filters suggestions
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    time_of_birth: str = Field(..., description="HH:MM:SS")
    place: str = Field(..., description="City, State, Country")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None