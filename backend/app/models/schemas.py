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

    # Sampoorana Jathagam Shastric Fields
    tamil_year: Optional[str] = None
    tamil_month: Optional[str] = None
    tamil_month_en: Optional[str] = None
    tamil_date: Optional[int] = None
    salivahana_year: Optional[int] = None
    kaliyuga_year: Optional[int] = None
    kollam_year: Optional[int] = None
    fasli_year: Optional[int] = None
    hijri_year: Optional[int] = None
    ayana: Optional[str] = None
    ayana_ta: Optional[str] = None
    ritu: Optional[str] = None
    ritu_ta: Optional[str] = None
    tatparai: Optional[int] = None
    nethiram: Optional[str] = None
    jeevan: Optional[str] = None
    vaara_soolai_ta: Optional[str] = None
    soolai_pariharam_ta: Optional[str] = None
    yogini_ta: Optional[str] = None
    soonya_rasis_ta: Optional[str] = None
    pancha_pakshi_ta: Optional[str] = None
    friendly_birds_ta: Optional[str] = None
    enemy_birds_ta: Optional[str] = None
    padupakshi_days_ta: Optional[str] = None
    vainasika_star_ta: Optional[str] = None
    yogi_graha_ta: Optional[str] = None
    avayogi_graha_ta: Optional[str] = None
    lagna_subar_ta: Optional[str] = None
    lagna_pabar_ta: Optional[str] = None
    birth_number: Optional[int] = None
    destiny_number: Optional[int] = None
    lucky_numbers: Optional[List[int]] = None
    lucky_colors_ta: Optional[str] = None
    lucky_stones_ta: Optional[str] = None
    lucky_deity_ta: Optional[str] = None
    paramanazhigai: Optional[str] = None
    sentra_nazhigai: Optional[str] = None
    nindra_nazhigai: Optional[str] = None

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

class AntardashaPeriod(BaseModel):
    planet: str
    planet_ta: str
    start_date: str
    end_date: str
    duration_years: float
    is_current: Optional[bool] = False

class BhuktiPeriod(BaseModel):
    planet: str
    planet_ta: str
    start_date: str
    end_date: str
    duration_years: float
    is_current: Optional[bool] = False
    antardashas: List[AntardashaPeriod] = []

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

class SthanaBalaSub(BaseModel):
    uchcha_bala: float = 0.0
    saptavargaja_bala: float = 0.0
    ojhayugma_bala: float = 0.0
    kendradi_bala: float = 0.0
    drekkana_bala: float = 0.0
    total: float = 0.0

class KaalaBalaSub(BaseModel):
    nathonnatha_bala: float = 0.0
    paksha_bala: float = 0.0
    vara_bala: float = 0.0
    hora_bala: float = 0.0
    ayana_bala: float = 0.0
    total: float = 0.0

class PlanetShadbala(BaseModel):
    planet: str
    planet_ta: str
    sthana_bala: SthanaBalaSub
    dig_bala: float = 0.0
    kaala_bala: KaalaBalaSub
    cheshta_bala: float = 0.0
    naisargika_bala: float = 0.0
    drig_bala: float = 0.0
    total_virupas: float = 0.0
    total_rupas: float = 0.0
    minimum_required_rupas: float = 5.0
    strength: str = "Average"
    strength_ta: str = "சராசரி"

class ShadbalaResult(BaseModel):
    planets: Dict[str, PlanetShadbala]
    classical_source: str = "Brihat Parashara Hora Shastra Ch. 27–29"

class GocharaTransitResult(BaseModel):
    planet: str
    planet_ta: str
    transit_sign: int
    transit_rasi: str
    transit_rasi_ta: str
    house_from_moon: int
    degree: float
    degree_dms: Optional[str] = None
    is_retrograde: bool = False
    classical_effect: str
    classical_effect_ta: str
    is_classically_benefic: bool = False
    vedha_active: bool = False
    vedha_by: Optional[str] = None
    vedha_by_ta: Optional[str] = None
    bav_score: Optional[int] = None
    bav_quality: Optional[str] = None
    bav_quality_ta: Optional[str] = None
    net_effect: str
    net_effect_ta: str
    net_benefic: bool = False

class GocharaResult(BaseModel):
    transits: List[GocharaTransitResult] = []
    summary: Dict[str, Any] = {}
    transit_date: Optional[str] = None
    classical_source: str = "BPHS Ch. 65, Phaladeepika Ch. 26"

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

class AyurdayaResult(BaseModel):
    ayush_category: str  # Deergha, Madhya, Alpa
    ayush_category_label: str
    ayush_category_ta: str
    ayush_years_range: str
    description: str
    description_ta: str
    three_pairs: Dict[str, str] = {}
    eighth_house_sign: str
    eighth_house_sign_ta: str
    eighth_house_lord: str
    eighth_house_lord_ta: str
    eighth_house_occupants: List[str] = []
    eighth_house_analysis: str
    eighth_house_analysis_ta: str
    ayushkaraka_saturn_house: int
    ayushkaraka_saturn_dignity: str
    ayushkaraka_saturn_analysis: str
    ayushkaraka_saturn_analysis_ta: str
    maraka_lords: List[str] = []
    maraka_lords_ta: List[str] = []
    maraka_analysis: str
    maraka_analysis_ta: str
    badhaka_house: int
    badhaka_lord: str
    badhaka_lord_ta: str
    badhaka_analysis: str
    badhaka_analysis_ta: str
    ashtakavarga_ayush_points: int = 0
    remedies: List[str] = []
    remedies_ta: List[str] = []
    classical_source: str = "Brihat Parashara Hora Shastra Ch. 44–45, Phaladeepika Ch. 13"

class RasiNakshatraPredictionResult(BaseModel):
    rasi_number: int
    rasi_name: str
    rasi_name_ta: str
    rasi_prediction: str
    rasi_prediction_ta: str
    rasi_element_ta: str
    rasi_mobility_ta: str
    rasi_ruling_planet_ta: str
    rasi_strengths_ta: str
    rasi_challenges_ta: str
    rasi_career_ta: str
    rasi_wealth_ta: str
    rasi_health_ta: str

    nakshatra_number: int
    nakshatra_name: str
    nakshatra_name_ta: str
    nakshatra_deity: str
    nakshatra_deity_ta: str
    nakshatra_traits_ta: str
    nakshatra_career_ta: str
    nakshatra_temple_ta: str

    pada: int
    pada_prediction_ta: str

    lagna_number: int
    lagna_name: str
    lagna_name_ta: str
    lagna_prediction_ta: str

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
    hora_kattam: Optional[Dict[int, List[Dict[str, Any]]]] = None  # D2 chart
    drekkana_kattam: Optional[Dict[int, List[Dict[str, Any]]]] = None  # D3 chart
    bhava_predictions: List[HouseDetail]
    vimshottari_dasha: List[VimshottariDashaPeriod]
    yogas: List[YogaResult]
    doshas: List[DoshaResult]
    ashtakavarga: AshtakavargaResult
    shadbala: Optional[ShadbalaResult] = None
    gochara: Optional[GocharaResult] = None
    ayurdaya: Optional[AyurdayaResult] = None
    rasi_nakshatra_predictions: Optional[RasiNakshatraPredictionResult] = None
    baby_names: Optional[BabyNameResult] = None
    narration: Optional[NarrationResult] = None
    bhava_sphutam: Optional[List[Dict[str, Any]]] = None
    varga_chakras: Optional[Dict[str, Dict[int, List[Dict[str, Any]]]]] = None
    sampoorana: Optional[Dict[str, Any]] = None
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

# ─── Star Match Finder (MATCH feature): Boy/Girl Nakshatra → All compatible Rasi/Nakshatra ratings ───
class StarMatchFinderRequest(BaseModel):
    input_nakshatra: str = Field(..., description="Nakshatra name English (e.g. Pushya) or Tamil (பூசம்)")
    input_pada: int = Field(1, ge=1, le=4, description="Pada 1 to 4")
    input_gender: str = Field("boy", description="Input side: boy or girl — determines which side is fixed")
    filter_rasi: Optional[int] = Field(None, ge=1, le=12, description="Optional filter: only return targets of this Rasi (1=Mesha .. 12=Meena)")
    sort_by: Optional[str] = Field("score", description="Sort: score | ashta | tamil")

class StarMatchItem(BaseModel):
    target_nakshatra: str
    target_nakshatra_ta: str
    target_nakshatra_number: int
    target_pada: int
    target_rasi_number: int
    target_rasi: str
    target_rasi_ta: str
    target_rasi_lord: str
    target_rasi_lord_ta: str
    target_rasi_element: Optional[str] = None
    target_rasi_element_ta: Optional[str] = None
    ashta_koota_total: float
    ashta_koota_max: float = 36.0
    tamil_compatible_count: int
    tamil_total: int = 10
    score_percentage: float
    rajju_dosha: bool
    rajju_type: Optional[str] = None
    rajju_type_ta: Optional[str] = None
    vedha_dosha: bool
    verdict: str
    verdict_ta: str
    like_rate: int = Field(..., ge=1, le=5, description="1-5 star like rate")
    like_rate_label: str
    like_rate_label_ta: str
    tamil_10_porutham: Optional[List[Dict[str, Any]]] = None
    ashta_koota: Optional[Dict[str, Any]] = None

class StarMatchFinderResponse(BaseModel):
    input_details: Dict[str, Any]
    input_rasi_number: int
    input_nakshatra_number: int
    matches: List[StarMatchItem]
    rasi_summary: List[Dict[str, Any]]
    summary: Dict[str, Any]

class NarrationRequest(BaseModel):
    chart_id: Optional[int] = None
    chart_data: Optional[Dict[str, Any]] = None
    language: str = "ta"  # "ta" or "en"
