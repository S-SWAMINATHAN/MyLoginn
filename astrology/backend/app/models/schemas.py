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
    severity_ta: Optional[str] = None
    severity_score: Optional[int] = None
    mars_from_lagna: Optional[int] = None
    mars_from_moon: Optional[int] = None
    mars_from_venus: Optional[int] = None
    description: str
    description_ta: str
    remedies: List[str] = []
    remedies_ta: List[str] = []
    classical_source: str
    cancellation_rules_applied: List[str] = []
    cancellation_rules_audit: Optional[List[Dict[str, Any]]] = None

class AshtakavargaResult(BaseModel):
    bhinnashtakavarga: Dict[str, List[int]]  # Planet -> [12 scores for Mesha to Meena]
    sarvashtakavarga: List[int]  # 12 scores for signs 1-12
    sarvashtakavarga_by_house: List[int]  # 12 scores from Lagna house 1 to 12
    total_points: int = 337
    trikona_shodhana: Optional[Dict[str, List[int]]] = None
    ekadhipatya_shodhana: Optional[Dict[str, List[int]]] = None
    pindas: Optional[Dict[str, Dict[str, int]]] = None
    sarva_trikona: Optional[List[int]] = None
    sarva_ekadhipatya: Optional[List[int]] = None
    total_shodhya_pinda: Optional[int] = None

class SthanaBalaSub(BaseModel):
    uchcha_bala: float = 0.0
    saptavargaja_bala: float = 0.0
    ojhayugma_bala: float = 0.0
    kendradi_bala: float = 0.0
    drekkana_bala: float = 0.0
    total: float = 0.0

class KaalaBalaSub(BaseModel):
    tribhaga_bala: float = 0.0
    abda_bala: float = 0.0
    masa_bala: float = 0.0
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
    # Kalai Magal parity (Phase 2)
    ishta_phala: Optional[float] = None
    kashta_phala: Optional[float] = None
    percentage: Optional[float] = None
    rank: Optional[int] = None

class ShadbalaResult(BaseModel):
    planets: Dict[str, PlanetShadbala]
    classical_source: str = "Brihat Parashara Hora Shastra Ch. 27–29"
    # Kalai Magal parity (Phase 2)
    bhavas: List[Dict[str, Any]] = []
    context: Dict[str, Any] = {}

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

class SthanaBalaSub(BaseModel):
    uchcha_bala: float = 0.0
    saptavargaja_bala: float = 0.0
    ojhayugma_bala: float = 0.0
    kendradi_bala: float = 0.0
    drekkana_bala: float = 0.0
    total: float = 0.0

class KaalaBalaSub(BaseModel):
    tribhaga_bala: float = 0.0
    abda_bala: float = 0.0
    masa_bala: float = 0.0
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
    # Kalai Magal parity (Phase 2)
    ishta_phala: Optional[float] = None
    kashta_phala: Optional[float] = None
    percentage: Optional[float] = None
    rank: Optional[int] = None

class ShadbalaResult(BaseModel):
    planets: Dict[str, PlanetShadbala]
    classical_source: str = "Brihat Parashara Hora Shastra Ch. 27–29"
    # Kalai Magal parity (Phase 2)
    bhavas: List[Dict[str, Any]] = []
    context: Dict[str, Any] = {}

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

class BabyNamePadaGroup(BaseModel):
    """Names for one of the Nakshatra's four pada syllables."""
    pada: int
    syllable: str
    syllable_ta: str
    is_birth_pada: bool = False
    count: int = 0
    names: List[Dict[str, Any]] = []


class BabyNameResult(BaseModel):
    nakshatra: str
    nakshatra_ta: str
    pada: int
    starting_syllables: List[str]
    starting_syllables_ta: List[str] = []
    target_syllable: Optional[str] = None
    target_syllable_ta: Optional[str] = None
    gender: Optional[str] = None
    religion: Optional[str] = None
    total_count: int = 0
    # How many rows the table actually holds for these syllables/filters, and
    # what was asked for — so the UI can say "26 of 26 available" instead of
    # implying the limit was met.
    available_count: Optional[int] = None
    requested_limit: Optional[int] = None
    pada_groups: List[BabyNamePadaGroup] = []
    suggestions: List[Dict[str, Any]] = []  # [{name, name_ta, meaning, meaning_ta, gender, numerology_*}]
    # NEW: baby-level numerology numbers, derived from date_of_birth only.
    numerology_birth_number: Optional[int] = None
    numerology_destiny_number: Optional[int] = None

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
    # NEW: precise (day-level) sign-ingress dates from the Saturn transit scan.
    period_start_date: Optional[str] = None       # Ezharai: 12th-sign entry. Ashtama: entry.
    leg_peak_start_date: Optional[str] = None      # Ezharai only: entry into Moon's own sign.
    leg_setting_start_date: Optional[str] = None   # Ezharai only: entry into 2nd-from-Moon sign.
    period_end_date: Optional[str] = None          # Ezharai: 2nd-sign exit. Ashtama: exit.
    is_upcoming: bool = False                      # True if dates describe a future, not-yet-started period.

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

class ParentsBioData(BaseModel):
    father_name: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_name: Optional[str] = None
    mother_occupation: Optional[str] = None
    gothram: Optional[str] = None
    kula_deivam: Optional[str] = None
    kula_deivam_place: Optional[str] = None
    native_place: Optional[str] = None
    caste_subcaste: Optional[str] = None
    siblings: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[str] = None
    height: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    email: Optional[str] = None
    residence_address: Optional[str] = None

class GenerateChartRequest(BaseModel):
    # Kalai Magal "Time Correction": none | dst | war (adds +1 h to the zone)
    time_correction: Optional[str] = None
    name: Optional[str] = "Jathagar"
    # Latin/English spelling of `name`, sent by the frontend when the user
    # accepted a Tamil transliteration suggestion for a Thanglish name. It is
    # echoed back untouched so the UI can show the name in whichever language
    # the reader has selected. Nothing is calculated from either field.
    name_en: Optional[str] = None
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
    # Extended Parents & Bio-Data fields
    father_name: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_name: Optional[str] = None
    mother_occupation: Optional[str] = None
    gothram: Optional[str] = None
    kula_deivam: Optional[str] = None
    kula_deivam_place: Optional[str] = None
    native_place: Optional[str] = None
    caste_subcaste: Optional[str] = None
    siblings: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[str] = None
    height: Optional[str] = None
    alternate_phone: Optional[str] = None
    residence_address: Optional[str] = None
    bio_data: Optional[ParentsBioData] = None

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
    name_en: Optional[str] = None  # see GenerateChartRequest.name_en
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
    vakhyam_details: Optional[Dict[str, Any]] = None
    bio_data: Optional[ParentsBioData] = None
    single_page_summary: Optional[SinglePageSummary] = None
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
    # "hindu" | "christian" | "muslim". Omitted / None means every religion.
    # Coverage is uneven by design — see backend/app/services/baby_name_bank.py.
    religion: Optional[str] = None
    # How many rows to fetch. Returns min(limit, matching rows) — it cannot
    # create rows that are not in the table.
    limit: Optional[int] = 150
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    time_of_birth: str = Field(..., description="HH:MM:SS")
    place: str = Field(..., description="City, State, Country")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None


# --- NEW: Chaldean Numerology models -----------------------------------------
# Numerology is a SEPARATE tradition from the Vedic astrology used elsewhere in
# this app. See backend/app/services/numerology.py for the full system-boundary
# rationale, confidence levels per component, and citations. Fields are kept
# under explicit numerology_* / dedicated models so the two systems are never
# visually or structurally merged (AGENTS.md 1.7).

class ChaldeanLetterValue(BaseModel):
    letter: str
    value: int

class NumerologyPersonalitySection(BaseModel):
    key: str                   # core | path | expression
    title: str
    title_ta: str
    source_label: str          # which input drives this section
    source_label_ta: str
    text: str
    text_ta: str

class NumerologyNumberAttributes(BaseModel):
    number: int
    planet: str
    planet_ta: str
    traits: str
    traits_ta: str
    lucky_numbers: List[int] = []
    lucky_colors: List[str] = []
    lucky_colors_ta: List[str] = []
    lucky_days: List[str] = []
    lucky_days_ta: List[str] = []

class NumerologyMasterNumber(BaseModel):
    number: int
    title: str
    title_ta: str
    text: str
    text_ta: str

class NumerologyProfile(BaseModel):
    name: str
    name_number: int                      # Namank
    name_compound_total: int              # raw pre-reduction total
    name_number_breakdown: List[ChaldeanLetterValue] = []
    birth_number: int                     # Moolank
    destiny_number: int                   # Bhagyank
    birth_number_planet: str = ""
    birth_number_planet_ta: str = ""
    name_number_planet: str = ""
    name_number_planet_ta: str = ""
    relation_with_birth_number: str       # Friendly | Neutral | Enemy
    relation_with_birth_number_ta: str
    relation_with_destiny_number: str
    relation_with_destiny_number_ta: str
    is_favorable: bool
    alignment_status: str                 # Favourable | Partially Aligned | Needs Better Alignment
    alignment_status_ta: str
    headline: str
    headline_ta: str
    analysis: str
    analysis_ta: str
    name_number_attributes: Optional[NumerologyNumberAttributes] = None
    birth_number_attributes: Optional[NumerologyNumberAttributes] = None
    destiny_number_attributes: Optional[NumerologyNumberAttributes] = None
    master_numbers_present: List[NumerologyMasterNumber] = []
    personality_sections: List[NumerologyPersonalitySection] = []
    personality: str
    personality_ta: str
    classical_source: str
    disclaimer: str
    disclaimer_ta: str

class NumerologyCheckRequest(BaseModel):
    name: str = Field(..., description="Candidate name, Latin/English spelling")
    date_of_birth: str = Field(..., description="YYYY-MM-DD")


    # ============================================================================
# PASTE THIS WHOLE BLOCK AT THE END OF backend/app/models/schemas.py
# ============================================================================
# The Muhurtha models are the request/response contract for
# POST /api/muhurtha/search (backend/app/api/muhurtha.py →
# backend/app/services/muhurtha.py).
#
# If your schemas.py already contains Muhurtha* models, DELETE the old ones
# and use these — the old ones were the pre-reintegration stubs
# (event_type "griha_pravesam", a flat `date_of_birth`/`person_place`, a
# `results[]` response) which no longer match either the service or the
# frontend. That mismatch is the same one that existed in
# frontend/lib/types.ts and is fixed in this delivery.
#
# The only new fields versus the previously-working shape are the resolved
# location fields (`latitude`/`longitude`/`timezone` for the event, and
# `person_a_*`/`person_b_*` equivalents), which mirror GenerateChartRequest
# so the Muhurtha page can use the very same LocationPicker component as the
# Jathagam intake form. No astrological rule or output field was invented.
#
# Requires (already imported at the top of schemas.py):
#   from typing import List, Dict, Optional, Any
#   from pydantic import BaseModel, Field
# ============================================================================


class MuhurthaRequest(BaseModel):
    event_type: str = Field("general", description="general | marriage | travel")
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: str = Field(..., description="YYYY-MM-DD (max 60 days after start_date)")

    # Event location — latitude/longitude/timezone are supplied by the
    # frontend LocationPicker after it resolves the place; the backend only
    # geocodes by name when they are absent.
    place: str = Field(..., description="City, State, Country")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None

    # Person A — optional; enables personalised Tara Bala / Chandra Bala.
    person_a_dob: Optional[str] = None            # YYYY-MM-DD
    person_a_tob: Optional[str] = None            # HH:MM or HH:MM:SS (24h)
    person_a_place: Optional[str] = None
    person_a_latitude: Optional[float] = None
    person_a_longitude: Optional[float] = None
    person_a_timezone: Optional[str] = None

    # Person B — marriage only.
    person_b_dob: Optional[str] = None
    person_b_tob: Optional[str] = None
    person_b_place: Optional[str] = None
    person_b_latitude: Optional[float] = None
    person_b_longitude: Optional[float] = None
    person_b_timezone: Optional[str] = None

    # Travel only — Dishashool direction check.
    travel_direction: Optional[str] = Field(None, description="N | S | E | W")


class MuhurthaDayResult(BaseModel):
    date: str
    vaaram: str
    vaaram_ta: str
    tithi: str
    tithi_ta: str
    karanam: str
    karanam_ta: str
    nakshatra: str
    nakshatra_ta: str
    subha_yogam_status: Optional[str] = None
    rahu_kalam: Optional[str] = None
    yamagandam: Optional[str] = None
    kuligai: Optional[str] = None

    is_universally_clean: bool
    universal_flags: List[str] = []
    universal_flags_ta: List[str] = []

    event_specific_ok: Optional[bool] = None
    event_specific_flags: List[str] = []
    event_specific_flags_ta: List[str] = []

    tara_bala_a: Optional[str] = None
    tara_bala_a_ta: Optional[str] = None
    tara_bala_a_favorable: Optional[bool] = None
    tara_bala_b: Optional[str] = None
    tara_bala_b_ta: Optional[str] = None
    tara_bala_b_favorable: Optional[bool] = None
    chandra_bala_a_favorable: Optional[bool] = None
    chandra_bala_b_favorable: Optional[bool] = None

    dishashool_direction: Optional[str] = None
    dishashool_conflict: Optional[bool] = None

    overall_rating: str          # Excellent | Good | Avoid
    overall_rating_ta: str
    classical_source: str


class MuhurthaSearchResponse(BaseModel):
    event_type: str
    start_date: str
    end_date: str
    place: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    travel_direction: Optional[str] = None
    person_a_location_assumed: bool = False
    person_b_location_assumed: bool = False
    days: List[MuhurthaDayResult] = []
    best_days: List[str] = []
    classical_sources: List[str] = []