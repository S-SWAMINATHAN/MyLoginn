from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class BasicBirthDetails(BaseModel):
    lagnam: str
    lagnam_ta: str
    lagnam_degree: float
    rasi: str
    rasi_ta: str
    nakshatram: str
    nakshatram_ta: str
    pada: int
    thithi: str
    thithi_ta: str
    paksha: str
    vaaram: str
    vaaram_ta: str
    yogam: str
    yogam_ta: str
    karanam: str
    karanam_ta: str
    ayanamsa_name: str = "Lahiri (Chitrapaksha)"
    ayanamsa_value: float
    panchangam_system: str = "thirukkanitham"
    sun_rise: Optional[str] = None
    sun_set: Optional[str] = None

class PlanetPosition(BaseModel):
    name: str
    name_ta: str
    name_sa: str
    symbol: str
    rasi_number: int  # 1 to 12 (Mesha=1 .. Meena=12)
    rasi: str
    rasi_ta: str
    degree: float  # 0 to 30 within the sign
    total_degree: float  # 0 to 360 absolute longitude
    house: int  # 1 to 12 from Lagna
    nakshatra: str
    nakshatra_ta: str
    nakshatra_number: int
    pada: int
    is_retrograde: bool = False
    speed: float = 0.0
    status: str = "Direct"  # Direct, Retrograde, Exalted, Debilitated, Own House

class BhuktiPeriod(BaseModel):
    planet: str
    planet_ta: str
    start_date: str
    end_date: str
    duration_years: float

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
