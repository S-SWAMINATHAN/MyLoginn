// Kalai Magal parity — API client + types (Phase 1).
// Kept in its own file so lib/api.ts and lib/types.ts stay untouched.
import type { GenerateChartRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API_V1 = `${API_BASE_URL}/api`;

export type KalaiSectionStatus = "ok" | "pending" | "error";

export interface KalaiSection {
  no: number;
  key: string;
  title_ta: string;
  title_en: string;
  status: KalaiSectionStatus;
  phase?: string;
}

export interface KalaiGrahaRow {
  planet: string;
  planet_ta: string;
  retrograde: boolean;
  longitude: number;
  longitude_dms: string;
  nakshatra_ta: string;
  pada: number;
  rasi_ta: string;
  rasi_en: string;
  degree_in_sign_dms: string;
  navamsa_ta: string;
}

export interface KalaiBhavaRow {
  house: number;
  name_ta: string;
  name_en: string;
  arambam_dms: string;
  madhyam_dms: string;
  anthyam_dms: string;
}

export interface KalaiPeriod {
  planet: string;
  planet_ta: string;
  start_date: string;
  end_date: string;
  end_date_display: string;
  age_ymd: [number, number, number];
  duration_years: number;
  running_at_birth: boolean;
  is_current: boolean;
}

export interface KalaiBhukti extends KalaiPeriod {
  antardashas: KalaiPeriod[];
}

export interface KalaiDasha extends KalaiPeriod {
  lord_years: number;
  start_date_display: string;
  bhuktis: KalaiBhukti[];
}

export interface KalaiAvPlanet {
  planet: string;
  planet_ta: string;
  bav: number[];
  trikona: number[];
  ekadhi: number[];
  aadhi_paral: number;
  trikona_total: number;
  ekadhi_total: number;
  rasi_gunakaram: number;
  graha_gunakaram: number;
  shuddha_pindam: number;
  guna_samooham: number;
  eka_samooham: number;
}

export interface KalaiReport {
  report_type: "kalai_computation";
  sections: KalaiSection[];
  general: Record<string, string | number | null>;
  graha_spudam: KalaiGrahaRow[];
  rasi_chart: Record<string, string[]>;
  navamsa_chart: Record<string, string[]>;
  bhava_spudam: KalaiBhavaRow[];
  bhava_chart: Record<string, string[]>;
  dasa_balance: {
    lord: string; lord_ta: string; years: number; months: number; days: number;
    formatted_ta: string; formatted_en: string; kalai_ta?: string;
  };
  dashas: KalaiDasha[];
  ashtakavarga: {
    planets: Record<string, KalaiAvPlanet>;
    sarvashtakavarga: number[];
    sarvashtakavarga_total: number;
    contributions: Record<string, number[]>;
    method_note: string;
  };
  numerology: { status: string; data?: Record<string, unknown>; error?: string };
  shadbala?: KalaiShadbala;
  shodasa_varga?: KalaiShodasaVarga;
  planet_details?: KalaiPlanetDetails;
  kalachakra?: KalaiKalachakra;
  panchapakshi?: KalaiPanchapakshi;
  palan_ta?: KalaiPalan;
  palan_en?: KalaiPalan;
  single_page?: {
    bhava_moves: { planet: string; planet_ta: string; bhava_sign: number; bhava_sign_ta: string }[];
    current_dasa_bhukti: { dasa: string; dasa_ta: string; bhukti: string; bhukti_ta: string; end: string } | null;
    date_number: number; destiny_number: number; name_numbers: number[]; name_numbers_verified: boolean;
    star_letters: { letters: string[]; display: string; verified: boolean };
  };
  upagraha?: { status: string; error?: string; rows: { key: string; name_ta: string; longitude: number; dms: string; sign: number; degree_in_sign_dms: string }[] };
  prasthara?: { status: string; error?: string; planets: Record<string, { planet: string; planet_ta: string; signs: number[]; signs_ta: string[];
    rows: { donor: string; donor_ta: string; cells: boolean[]; total: number }[]; column_totals: number[]; total: number }> };
}

export interface PakshiSummary {
  bird: string; bird_ta: string; paksha: "shukla" | "krishna";
  padu_days: string[]; padu_days_ta: string[]; letters: string; colour: string; colour_ta: string;
  direction: string; direction_ta: string; ruling_day: string[]; ruling_day_ta: string[];
  ruling_night: string[]; ruling_night_ta: string[]; friends: string[]; friends_ta: string[];
  enemies: string[]; enemies_ta: string[];
  grid: { day: string; day_ta: string; activities: string[]; activities_ta: string[] }[];
  derived: boolean;
}
export interface PakshiSub { bird: string; bird_ta: string; activity: string; activity_ta: string; start: string; end: string; relation: string; result: string | null; result_ta: string | null }
export interface PakshiPage {
  paksha: "shukla" | "krishna"; weekdays: string[]; weekdays_ta: string[]; part: "day" | "night";
  ruling_bird: string | null; padu: { day: string; bird: string | null }[];
  yamas: { yama: number; start: string; end: string; activity: string; activity_ta: string; subs: PakshiSub[] }[];
}
export interface KalaiPanchapakshi {
  status: string; error?: string; birth_bird: string; birth_bird_ta: string; birth_paksha: string;
  yama_starts: string[]; shukla: PakshiSummary; krishna: PakshiSummary; detailed?: PakshiPage[];
}

export interface KalaiKcBhukti {
  sign: string;
  sign_ta: string;
  lord_ta: string;
  start: string;
  end: string;
  age_ymd: [number, number, number];
}

export interface KalaiKcDasa {
  sign: string;
  sign_ta: string;
  lord_ta: string;
  years: number;
  balance_ymd?: [number, number, number];
  chain?: string;
  start: string;
  end: string;
  bhuktis: KalaiKcBhukti[];
}

export interface KalaiKalachakra {
  status: "ok" | "pending" | "error";
  reason?: string;
  error?: string;
  direction?: "apasavya" | "savya";
  direction_ta?: string;
  nakshatra?: number;
  pada?: number;
  first_sign?: string;
  dashas?: KalaiKcDasa[];
  notes?: string[];
}

export interface KalaiVargaChart {
  title_ta: string;
  title_en: string;
  signs: Record<string, number>;
  lords: Record<string, string>;
}

export interface KalaiShodasaVarga {
  status: "ok" | "error";
  error?: string;
  charts: Record<string, KalaiVargaChart>;
  bala: {
    rows: { varga: string; title_ta: string; title_en: string; values: Record<string, number> }[];
    totals: Record<string, number>;
    totals_rupas: Record<string, number>;
  };
}

export interface KalaiPlanetDetailRow {
  planet: string;
  planet_ta: string;
  bhava: number;
  suyam_bhava_bala_pct: number;
  lord_of: number[];
  status: "kendra" | "trikona" | null;
  dignity: "exalted" | "debilitated" | "own" | "friend" | "neutral" | "enemy";
  conjunct: string[];
  aspected_by: string[];
  retrograde: boolean;
  combust: boolean;
  vargottama: boolean;
  parivartana_with: string | null;
  war: { planets: string[]; winner: string } | null;
  shadbala_rupas: number | null;
  shadbala_class: "poorna" | "mathima" | "adhama" | null;
}

export interface KalaiPlanetDetails {
  status: "ok" | "error";
  error?: string;
  rows: KalaiPlanetDetailRow[];
  wars: { planets: string[]; winner: string }[];
}

export interface KalaiShadbalaPlanet {
  planet: string;
  planet_ta: string;
  sthana: number;
  kala: number;
  dig: number;
  cheshta: number;
  naisargika: number;
  drik: number;
  total_rupas: number;
  total_virupas: number;
  ishta: number;
  kashta: number;
  required_virupas: number;
  percentage: number;
  rank: number;
}

export interface KalaiBhavaBala {
  house: number;
  madhya_sign: number;
  lord: string;
  lord_ta: string;
  drik: number;
  dig: number;
  adhipati: number;
  total_rupas: number;
  total_virupas: number;
  rank: number;
}

export interface KalaiShadbala {
  status: "ok" | "error";
  error?: string;
  planets: Record<string, KalaiShadbalaPlanet>;
  bhavas: KalaiBhavaBala[];
  context: Record<string, string | boolean>;
}

export async function generateKalaiReportApi(data: GenerateChartRequest): Promise<KalaiReport> {
  const res = await fetch(`${API_V1}/kalai/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {
      /* keep status text */
    }
    throw new Error(detail);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Kalai "Utilities" menu (Phase 3c)
// ---------------------------------------------------------------------------
export type TimeCorrection = "none" | "dst" | "dst2" | "war" | "dst_war";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_V1}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export interface TamilCalendarNames {
  months_ta: string[];
  months_en: string[];
  years_ta: string[];
  years_en: string[];
}

export async function getTamilCalendarNames(): Promise<TamilCalendarNames> {
  const res = await fetch(`${API_V1}/kalai/utilities/tamil-calendar-names`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const tamilToEnglishApi = (b: { day: number; month: number; year_index: number; pariviruthi: number }) =>
  postJson<{ date: string; display: string; month_start: string }>("/kalai/utilities/tamil-to-english", b);

export const naligaiToTimeApi = (b: {
  date: string; nazhigai: number; vinazhigai: number; tharparai: number;
  latitude: number; longitude: number; timezone: string; time_correction?: TimeCorrection;
}) => postJson<{ time: string; sunrise: string; sunset: string }>("/kalai/utilities/naligai-to-time", b);

export const tamilDateApi = (b: { date: string; time?: string; latitude: number; longitude: number; timezone: string }) =>
  postJson<{ formatted_ta: string; formatted_en: string; pariviruthi: number }>("/kalai/utilities/tamil-date", b);

/** Pariviruthi (60-year cycle) number → civil years it spans. */
export const pariviruthiLabel = (k: number) => {
  const start = 1867 + 60 * (k - 24);
  return `${k} (${start} Apr – ${start + 60} Mar)`;
};

// ---------------------------------------------------------------------------
// KP system (Phase 4)
// ---------------------------------------------------------------------------
export interface KpLords { sign: string; star: string; sub: string; subsub: string }
export interface KpPlanetRow extends KpLords {
  planet: string; planet_ta: string; longitude: number; dms: string; retrograde: boolean; house: number;
}
export interface KpCuspRow extends KpLords { house: number; roman: string; longitude: number; dms: string }
export interface KpReport {
  status: string;
  general: Record<string, string | number>;
  ayanamsa_dms: string;
  ayanamsa_name: string;
  planets: KpPlanetRow[];
  cusps: KpCuspRow[];
  bhava_significators: { house: number; roman: string; in_star_of_occupants: string[]; occupants: string[]; in_star_of_lord: string[]; lord: string }[];
  planet_significators: { planet: string; planet_ta: string; by_star: number[]; by_sub: number[]; aspected_by: string[] }[];
  bhava_aspects: Record<string, string[]>;
  planet_aspects: Record<string, Record<string, string>>;
  kp_chart: { cusps: { roman: string; sign: number; deg: string }[]; planets: { planet: string; sign: number; deg: string }[] };
  dasa_balance: { lord: string; lord_ta: string; years: number; months: number; days: number; formatted_ta: string; formatted_en: string };
  dashas: KalaiDasha[];
}

export async function generateKpReportApi(data: GenerateChartRequest & { time_correction?: TimeCorrection }): Promise<KpReport> {
  return postJson<KpReport>("/kalai/kp", data);
}

export interface KpHoraryReport extends KpReport {
  horary: { number: number; sub_start_dms: string; sign_lord: string; star_lord: string; sub_lord: string; subsub_lord?: string | null; total_numbers: number; method: string };
}
export const generateKpHoraryApi = (b: {
  number: number; system?: "249" | "2193"; name?: string; date: string; time: string; latitude: number; longitude: number; timezone: string; time_correction?: TimeCorrection;
}) => postJson<KpHoraryReport>("/kalai/kp-horary", b);

// ---------------------------------------------------------------------------
// Marriage matching — 12 poruthams (Phase 5)
// ---------------------------------------------------------------------------
export interface MatchPersonIn {
  name: string; date_of_birth: string; time_of_birth: string; place?: string;
  latitude: number; longitude: number; timezone: string; time_correction?: TimeCorrection;
}
export interface PoruthamRow {
  no: number; key: string; name_ta: string; girl: string; boy: string; points: number; max: number; verdict_ta: string; verified: boolean;
}
export interface MatchPersonOut {
  general: Record<string, string | number | null>;
  nakshatra: number; rasi: number; sevvai: "none" | "parihara" | "dosham"; sevvai_cancellations: string[];
  bhava_moves: { planet: string; planet_ta: string; bhava_sign_ta: string }[];
  current_dasa_bhukti: { dasa_ta: string; bhukti_ta: string; end: string } | null;
  rasi_chart: Record<string, string[]>; navamsa_chart: Record<string, string[]>;
  dasa_balance: { formatted_ta: string; formatted_en: string; kalai_ta?: string };
}
export interface KalaiMatchResult {
  girl: MatchPersonOut; boy: MatchPersonOut;
  poruthams: { rows: PoruthamRow[]; total: number; max: number; percent: number; star_match_ta: string; all_rows_verified: boolean };
  sevvai: { girl: string; boy: string; match: boolean };
  rajju: { exists: boolean; match: boolean };
  dasa_sandhi: { sandhi: boolean; match: boolean; girl?: { dasa_ta: string; end: string }; boy?: { dasa_ta: string; end: string } };
}
export const kalaiMatchingApi = (girl: MatchPersonIn, boy: MatchPersonIn) =>
  postJson<KalaiMatchResult>("/kalai/matching", { girl, boy });

// ---------------------------------------------------------------------------
// Baby names — Kalai report types (Phase 8)
// ---------------------------------------------------------------------------
export type KalaiBabyReportType =
  | "single_star_letter" | "single_numerology_no" | "star_letters" | "numerology_numbers"
  | "single_star_letter_numerology" | "single_numerology_no_star" | "star_numerology";

export interface KalaiBabyResult {
  report_type: KalaiBabyReportType; sex: string; birth_date: string;
  date_number: number; destiny_number: number; allowed_numbers: number[]; allowed_verified: boolean;
  star: number | null; star_letters: { letters: string[]; display: string; verified: boolean } | null;
  first_letter: string | null; numerology_no: number | null; initials: string[];
  letter_table: Record<string, number>;
  names: { name_en: string; name_ta: string; total: number; with_initials: boolean; meaning_en?: string; meaning_ta?: string }[];
  count: number;
}

export const kalaiBabyNamesApi = (b: {
  report_type: KalaiBabyReportType; sex: string; birth_date: string; star?: number | null;
  first_letter?: string | null; numerology_no?: number | null; initials: string[]; religion?: string | null;
}) => postJson<KalaiBabyResult>("/kalai/baby-names", b);

export const kalaiImportNamesApi = (pdf_base64: string) =>
  postJson<{ candidates: number; added: number; rows_in_table: number }>("/kalai/import-names", { pdf_base64 });

export async function getStarLettersApi(star: number): Promise<{ letters: string[]; display: string; verified: boolean }> {
  const res = await fetch(`${API_V1}/kalai/star-letters/${star}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}


// ---------------------------------------------------------------------------
// பலன்கள் — original site text composed for the chart (backend palan/compose.py)
// ---------------------------------------------------------------------------
export interface KalaiPalan {
  bhava: { house: number; title: string; paragraphs: string[] }[];
  dasa: { title: string; paragraphs: string[]; bhuktis: string[] }[];
  gochara: Record<"guru" | "sani", { title: string; paragraphs: string[]; house: number; quality: "good" | "mixed" | "weak" }[]>;
  yoga: { kind: "yoga" | "avayoga"; name: string; text: string }[];
}
