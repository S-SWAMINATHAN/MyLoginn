// Types mirroring backend/app/models/schemas.py

export interface BasicBirthDetails {
  lagnam: string;
  lagnam_ta: string;
  lagnam_degree: number;
  rasi: string;
  rasi_ta: string;
  nakshatram: string;
  nakshatram_ta: string;
  pada: number;
  thithi: string;
  thithi_ta: string;
  paksha: string;
  vaaram: string;
  vaaram_ta: string;
  yogam: string;
  yogam_ta: string;
  karanam: string;
  karanam_ta: string;
  ayanamsa_name: string;
  ayanamsa_value: number;
  panchangam_system: string;
  sun_rise?: string | null;
  sun_set?: string | null;
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
  total_degree: number;
  house: number;
  nakshatra: string;
  nakshatra_ta: string;
  nakshatra_number: number;
  pada: number;
  is_retrograde: boolean;
  speed: number;
  status: string;
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
  bhava_predictions: HouseDetail[];
  vimshottari_dasha: VimshottariDashaPeriod[];
  yogas: YogaResult[];
  doshas: DoshaResult[];
  ashtakavarga: AshtakavargaResult;
  baby_names?: BabyNameResult | null;
  narration?: NarrationResult | null;
  computed_at: string;
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

export interface NarrationRequest {
  chart_id?: number;
  chart_data?: Record<string, any>;
  language?: string; // "ta" or "en"
}

// NEW: shape returned by GET /api/geocode/suggest, used by the place-of-birth
// autocomplete in BirthDetailsForm.tsx. Does not affect any existing type.
export interface PlaceSuggestion {
  display_name: string;
  lat: number;
  lon: number;
  timezone: string;
}