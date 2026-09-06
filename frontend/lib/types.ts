// Types mirroring backend/app/models/schemas.py

export interface BasicBirthDetails {
  lagnam: string;
  lagnam_ta: string;
  lagnam_degree: number;
  lagnam_dms?: string | null;
  lagnam_total_degree?: number | null;
  lagnam_lord?: string | null;
  lagnam_lord_ta?: string | null;
  lagnam_nakshatram?: string | null;
  lagnam_nakshatram_ta?: string | null;
  lagnam_pada?: number | null;
  lagnam_nakshatra_lord?: string | null;
  lagnam_nakshatra_lord_ta?: string | null;
  lagnam_navamsa?: string | null;
  lagnam_navamsa_ta?: string | null;
  lagnam_navamsa_lord?: string | null;
  lagnam_navamsa_lord_ta?: string | null;
  rasi: string;
  rasi_ta: string;
  rasi_lord?: string | null;
  rasi_lord_ta?: string | null;
  nakshatram: string;
  nakshatram_ta: string;
  pada: number;
  nakshatra_lord?: string | null;
  nakshatra_lord_ta?: string | null;
  nakshatra_deity?: string | null;
  nakshatra_elapsed_pct?: number | null;
  thithi: string;
  thithi_ta: string;
  paksha: string;
  paksha_en?: string | null;
  paksha_ta?: string | null;
  thithi_elapsed_pct?: number | null;
  vaaram: string;
  vaaram_ta: string;
  vaaram_lord?: string | null;
  vaaram_lord_ta?: string | null;
  yogam: string;
  yogam_ta: string;
  karanam: string;
  karanam_ta: string;
  subha_yogam?: string | null;
  subha_yogam_ta?: string | null;
  subha_yogam_desc?: string | null;
  subha_yogam_desc_ta?: string | null;
  subha_yogam_status?: string | null;
  ganam?: string | null;
  ganam_ta?: string | null;
  yoni?: string | null;
  yoni_ta?: string | null;
  rajju?: string | null;
  rajju_ta?: string | null;
  bootham?: string | null;
  bootham_ta?: string | null;
  nadi?: string | null;
  nadi_ta?: string | null;
  vriksham_ta?: string | null;
  pakshi_ta?: string | null;
  mirugam_ta?: string | null;
  ayanamsa_name: string;
  ayanamsa_value: number;
  ayanamsa_dms?: string | null;
  panchangam_system: string;
  sun_rise?: string | null;
  sun_set?: string | null;
  dinamani?: string | null;
  dinamani_en?: string | null;
  ratrimana?: string | null;
  ratrimana_en?: string | null;
  udhayadhi_nazhigai?: string | null;
  udhayadhi_nazhigai_en?: string | null;
  rahu_kalam?: string | null;
  yamagandam?: string | null;
  kuligai?: string | null;
  dasha_balance_ta?: string | null;
  dasha_balance_en?: string | null;
  [key: string]: any;
}

export interface PlanetPosition {
  name: string;
  name_ta: string;
  name_sa: string;
  symbol: string;
  rasi_number: number;
  rasi: string;
  rasi_ta: string;
  degree: number;
  degree_dms?: string | null;
  total_degree: number;
  total_degree_dms?: string | null;
  house: number;
  lord?: string | null;
  lord_ta?: string | null;
  nakshatra: string;
  nakshatra_ta: string;
  nakshatra_number: number;
  nakshatra_lord?: string | null;
  nakshatra_lord_ta?: string | null;
  pada: number;
  navamsa_sign?: number | null;
  navamsa_rasi?: string | null;
  navamsa_rasi_ta?: string | null;
  navamsa_lord?: string | null;
  navamsa_lord_ta?: string | null;
  is_retrograde: boolean;
  speed: number;
  status: string;
  status_ta?: string | null;
  [key: string]: any;
}

// Used for Rasi/Navamsa kattam cell entries (rasi_kattam / navamsa_kattam values)
export interface KattamPlanet {
  name: string;
  name_ta: string;
  symbol: string;
  is_retrograde?: boolean;
  is_lagna?: boolean;
  degree?: number;
  status?: string;
  [key: string]: any;
}

export interface BhuktiPeriod {
  planet: string;
  planet_ta: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current?: boolean;
  antardashas?: any[];
}

export interface VimshottariDashaPeriod {
  planet: string;
  planet_ta: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  bhuktis: BhuktiPeriod[];
}

export interface HouseDetail {
  house_number: number;
  rasi_number: number;
  rasi: string;
  rasi_ta: string;
  lord: string;
  lord_ta: string;
  occupants: string[];
  aspecting_planets: string[];
  significations: string[];
  significations_ta: string[];
  prediction: string;
  prediction_ta: string;
}

export interface YogaResult {
  name: string;
  name_ta: string;
  category: string;
  present: boolean;
  description: string;
  description_ta: string;
  classical_source: string;
  planets_involved: string[];
}

export interface DoshaResult {
  name: string;
  name_ta: string;
  present: boolean;
  severity: string;
  description: string;
  description_ta: string;
  remedies: string[];
  remedies_ta: string[];
  classical_source: string;
  cancellation_rules_applied: string[];
}

export interface AshtakavargaResult {
  bhinnashtakavarga: Record<string, number[]>;
  sarvashtakavarga: number[];
  sarvashtakavarga_by_house: number[];
  total_points: number;
}

export interface KutaDetail {
  name: string;
  name_ta: string;
  name_sa: string;
  obtained_points: number;
  max_points: number;
  description: string;
  description_ta: string;
  status: string;
}

export interface Porutham10Item {
  key: string;
  name: string;
  name_ta: string;
  is_compatible: boolean;
  description: string;
  description_ta: string;
}

export interface PoruthamMatchResult {
  boy_details: Record<string, any>;
  girl_details: Record<string, any>;
  ashta_koota: Record<string, any>;
  tamil_10_porutham: Porutham10Item[];
  rajju_dosha: boolean;
  rajju_type?: string | null;
  rajju_type_ta?: string | null;
  vedha_dosha: boolean;
  score_percentage: number;
  verdict: string;
  verdict_ta: string;
  recommendation: string;
  recommendation_ta: string;
}

export interface BabyNameSuggestionItem {
  name: string;
  name_ta: string;
  meaning: string;
  meaning_ta: string;
  gender: string;
}

export interface BabyNameResult {
  nakshatra: string;
  nakshatra_ta: string;
  pada: number;
  starting_syllables: string[];
  target_syllable?: string | null;
  gender?: string | null;
  suggestions: BabyNameSuggestionItem[];
}

export interface NarrationResult {
  language: string;
  summary: string;
  current_dasa_reading: string;
  yogas_and_doshas_reading: string;
  career_and_wealth: string;
  marriage_and_family: string;
  health_and_longevity: string;
}

// --- Single-Page Report supporting types ---
// Mirror backend/app/models/schemas.py's TransitDoshaResult / LifeCategoryScore /
// RemedyGuide / CurrentPeriodSummary / SinglePageSummary. See
// backend/app/services/single_page_report.py for what's genuinely new vs.
// reused from existing calculations.

export interface TransitDoshaResult {
  name: string;
  name_ta: string;
  present: boolean;
  phase?: string | null;
  phase_ta?: string | null;
  description: string;
  description_ta: string;
  classical_source: string;
  period_start_date?: string | null;
  leg_peak_start_date?: string | null;
  leg_setting_start_date?: string | null;
  period_end_date?: string | null;
  is_upcoming?: boolean;
}

export interface LifeCategoryScore {
  category: string;
  category_ta: string;
  icon: string;
  score_percentage: number;
  rating: string;
  rating_ta: string;
  houses_considered: number[];
  summary: string;
  summary_ta: string;
}

export interface RemedyGuide {
  presiding_deity: string;
  presiding_deity_ta: string;
  favorable_day: string;
  favorable_day_ta: string;
  lucky_color: string;
  lucky_color_ta: string;
  lucky_number: number;
  simple_rituals: string[];
  simple_rituals_ta: string[];
  classical_source: string;
}

export interface CurrentPeriodSummary {
  mahadasha_lord: string;
  mahadasha_lord_ta: string;
  bhukti_lord: string;
  bhukti_lord_ta: string;
  mahadasha_start: string;
  mahadasha_end: string;
  bhukti_start: string;
  bhukti_end: string;
  micro_prediction: string;
  micro_prediction_ta: string;
}

export interface SinglePageSummary {
  current_period?: CurrentPeriodSummary | null;
  saturn_transit?: TransitDoshaResult | null;
  life_scorecard: LifeCategoryScore[];
  remedies?: RemedyGuide | null;
}

// --- Muhurtha (auspicious date/time) finder types ---
// Mirrors backend/app/models/schemas.py's Muhurtha* models. See
// backend/app/services/muhurtha_finder.py for scope/citations.

export type MuhurthaEventType = "marriage" | "griha_pravesam" | "general";

export interface MuhurthaCheckItem {
  rule: string;
  rule_ta: string;
  passed: boolean;
  detail: string;
  detail_ta: string;
}

export interface MuhurthaDayResult {
  date: string;
  weekday: string;
  weekday_ta: string;
  tithi: string;
  tithi_ta: string;
  nakshatra: string;
  nakshatra_ta: string;
  yogam_ta: string;
  karanam: string;
  karanam_ta: string;
  chandrabalam_ok: boolean;
  chandrabalam_house: number;
  tarabalam_ok: boolean;
  tarabalam_name: string;
  tarabalam_name_ta: string;
  rahu_kalam: string;
  yamagandam: string;
  kuligai: string;
  checks: MuhurthaCheckItem[];
  overall_suitable: boolean;
  suitability_score: number;
}

export interface MuhurthaRequest {
  event_type: MuhurthaEventType;
  start_date: string;
  end_date: string;
  place: string;
  date_of_birth: string;
  time_of_birth: string;
  person_place?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}

export interface MuhurthaResponse {
  event_type: string;
  start_date: string;
  end_date: string;
  place: string;
  results: MuhurthaDayResult[];
  best_dates: string[];
  disclaimer: string;
  disclaimer_ta: string;
}

// --- NEW: Rasi Horoscope (Daily/Weekly/Monthly/Yearly Gochara) + Rasi Love
// Horoscope. Mirror the plain dicts returned by backend/app/api/horoscope.py
// (not validated against a Pydantic response_model server-side, so these
// interfaces are the actual contract). `[key: string]: any` follows this
// file's existing convention for backend dicts with more fields than the
// UI currently consumes.

export interface RasiHoroscopeKeyTransit {
  planet: string;
  planet_ta: string;
  transit_rasi?: string;
  transit_rasi_ta: string;
  house_from_moon: number;
  net_effect: string;
  net_effect_ta: string;
  [key: string]: any;
}

export interface RasiHoroscopeResult {
  rasi_number: number;
  rasi: string;
  rasi_ta: string;
  period: string;
  period_label: string;
  period_label_ta: string;
  reference_date: string;
  overall_assessment: string;
  overall_assessment_ta: string;
  benefic_transits: number;
  challenging_transits: number;
  vedha_cancellations: number;
  key_transits: RasiHoroscopeKeyTransit[];
  narration: string;
  narration_ta: string;
  classical_source: string;
}

export interface RasiLoveHoroscopeResult {
  rasi1_number: number;
  rasi1: string;
  rasi1_ta: string;
  rasi2_number: number;
  rasi2: string;
  rasi2_ta: string;
  rasi_porutham: boolean;
  rasi_porutham_desc: string;
  rasi_porutham_desc_ta: string;
  rasiyadhipathi_porutham: boolean;
  rasiyadhipathi_relation: string;
  rasiyadhipathi_relation_ta: string;
  compatibility_score: number; // 0, 1, or 2
  compatibility_label: string;
  compatibility_label_ta: string;
  narration: string;
  narration_ta: string;
  classical_source: string;
  note: string;
  note_ta: string;
}

export interface GenerateChartRequest {
  name?: string;
  gender?: string;
  date_of_birth: string; // YYYY-MM-DD
  time_of_birth: string; // HH:MM:SS
  place: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  panchangam_system?: string; // thirukkanitham or vakhyam
  chart_style?: string; // tamil, kerala, or north_indian
  output_mode?: string; // full or single_page
  parent_name?: string;
  phone?: string;
  email?: string;
  personal_details?: string;
  family_details?: string;
}

export interface AyurdayaResult {
  ayush_category: string; // Deergha, Madhya, Alpa
  ayush_category_label: string;
  ayush_category_ta: string;
  ayush_years_range: string;
  description: string;
  description_ta: string;
  three_pairs?: Record<string, string>;
  eighth_house_sign: string;
  eighth_house_sign_ta: string;
  eighth_house_lord: string;
  eighth_house_lord_ta: string;
  eighth_house_occupants?: string[];
  eighth_house_analysis: string;
  eighth_house_analysis_ta: string;
  ayushkaraka_saturn_house: number;
  ayushkaraka_saturn_dignity: string;
  ayushkaraka_saturn_analysis: string;
  ayushkaraka_saturn_analysis_ta: string;
  maraka_lords?: string[];
  maraka_lords_ta?: string[];
  maraka_analysis: string;
  maraka_analysis_ta: string;
  badhaka_house: number;
  badhaka_lord: string;
  badhaka_lord_ta: string;
  badhaka_analysis: string;
  badhaka_analysis_ta: string;
  ashtakavarga_ayush_points: number;
  remedies: string[];
  remedies_ta: string[];
  classical_source: string;
}

export interface RasiNakshatraPredictionResult {
  rasi_number: number;
  rasi_name: string;
  rasi_name_ta: string;
  rasi_prediction: string;
  rasi_prediction_ta: string;
  rasi_element_ta: string;
  rasi_mobility_ta: string;
  rasi_ruling_planet_ta: string;
  rasi_strengths_ta: string;
  rasi_challenges_ta: string;
  rasi_career_ta: string;
  rasi_wealth_ta: string;
  rasi_health_ta: string;

  nakshatra_number: number;
  nakshatra_name: string;
  nakshatra_name_ta: string;
  nakshatra_deity: string;
  nakshatra_deity_ta: string;
  nakshatra_traits_ta: string;
  nakshatra_career_ta: string;
  nakshatra_temple_ta: string;

  pada: number;
  pada_prediction_ta: string;

  lagna_number: number;
  lagna_name: string;
  lagna_name_ta: string;
  lagna_prediction_ta: string;
}

export interface ChartResponse {
  profile_id?: number | null;
  name: string;
  gender?: string | null;
  date_of_birth: string;
  time_of_birth: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  panchangam_system: string;
  chart_style: string;
  output_mode: string;
  basic_details: BasicBirthDetails;
  planets: PlanetPosition[];
  rasi_kattam: Record<number, KattamPlanet[]>;
  navamsa_kattam: Record<number, KattamPlanet[]>;
  hora_kattam?: Record<number, KattamPlanet[]> | null;
  drekkana_kattam?: Record<number, KattamPlanet[]> | null;
  bhava_predictions: HouseDetail[];
  vimshottari_dasha: VimshottariDashaPeriod[];
  yogas: YogaResult[];
  doshas: DoshaResult[];
  ashtakavarga: AshtakavargaResult;
  shadbala?: any | null;
  gochara?: any | null;
  ayurdaya?: AyurdayaResult | null;
  rasi_nakshatra_predictions?: RasiNakshatraPredictionResult | null;
  baby_names?: BabyNameResult | null;
  narration?: NarrationResult | null;
  sampoorana?: any | null;
  bhava_sphutam?: any[] | null;
  varga_chakras?: Record<string, Record<number, string[]>> | null;
  single_page_summary?: any | null;
  computed_at: string;
  [key: string]: any;
}

export interface ProfileCreate {
  name: string;
  gender?: string;
  date_of_birth: string;
  time_of_birth: string;
  place: string;
  parent_name?: string;
  personal_details?: string;
  phone?: string;
  email?: string;
  family_details?: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  gender?: string | null;
  date_of_birth: string;
  time_of_birth: string;
  place_name: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  parent_name?: string | null;
  personal_details?: string | null;
  phone?: string | null;
  email?: string | null;
  family_details?: string | null;
  created_at: string;
}

export interface PoruthamRequest {
  profile_id_boy?: number;
  profile_id_girl?: number;
  boy_dob?: string;
  boy_tob?: string;
  boy_place?: string;
  girl_dob?: string;
  girl_tob?: string;
  girl_place?: string;
  boy_nakshatra?: string;
  boy_pada?: number;
  girl_nakshatra?: string;
  girl_pada?: number;
}

// ─── NEW: Star Match Finder (MATCH feature) ───
export interface StarMatchFinderRequest {
  input_nakshatra: string;
  input_pada: number; // 1-4
  input_gender?: string; // boy | girl
  filter_rasi?: number | null; // 1-12
  sort_by?: string; // score | ashta | tamil
}

export interface StarMatchItem {
  target_nakshatra: string;
  target_nakshatra_ta: string;
  target_nakshatra_number: number;
  target_pada: number;
  target_rasi_number: number;
  target_rasi: string;
  target_rasi_ta: string;
  target_rasi_lord: string;
  target_rasi_lord_ta: string;
  target_rasi_element?: string | null;
  target_rasi_element_ta?: string | null;
  ashta_koota_total: number;
  ashta_koota_max: number;
  tamil_compatible_count: number;
  tamil_total: number;
  score_percentage: number;
  rajju_dosha: boolean;
  rajju_type?: string | null;
  rajju_type_ta?: string | null;
  vedha_dosha: boolean;
  verdict: string;
  verdict_ta: string;
  like_rate: number; // 1-5
  like_rate_label: string;
  like_rate_label_ta: string;
  tamil_10_porutham?: Porutham10Item[];
  ashta_koota?: Record<string, any>;
}

export interface StarMatchFinderResponse {
  input_details: Record<string, any>;
  input_rasi_number: number;
  input_nakshatra_number: number;
  matches: StarMatchItem[];
  rasi_summary: Record<string, any>[];
  summary: Record<string, any>;
}

export interface NarrationRequest {
  chart_id?: number;
  chart_data?: Record<string, any>;
  language?: string; // "ta" or "en"
}

// Shape returned by GET /api/geocode/suggest, used by the place-of-birth
// autocomplete in BirthDetailsForm.tsx.
export interface PlaceSuggestion {
  display_name: string;
  display_name_ta?: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface LocationItem {
  key: string;
  name: string;
  name_ta: string;
  display_name: string;
  display_name_ta: string;
  lat: number;
  lon: number;
  timezone: string;
  state?: string;
  country: string;
}

export interface GroupedLocations {
  tamil_nadu: LocationItem[];
  india: LocationItem[];
  global: LocationItem[];
}

// Request shape for the standalone Baby Name page (POST /api/baby-names/generate).
export interface BabyNameRequest {
  name?: string;
  gender?: string;
  date_of_birth: string; // YYYY-MM-DD
  time_of_birth: string; // HH:MM:SS
  place: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}