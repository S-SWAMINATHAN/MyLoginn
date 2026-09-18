import {
  GenerateChartRequest,
  ChartResponse,
  PoruthamRequest,
  PoruthamMatchResult,
  StarMatchFinderRequest,
  StarMatchFinderResponse,
  NarrationRequest,
  NarrationResult,
  ProfileCreate,
  ProfileResponse,
  PlaceSuggestion,
  BabyNameRequest,
  BabyNameResult,
  MuhurthaRequest,
  MuhurthaSearchResponse,
  RasiHoroscopeResult,
  RasiLoveHoroscopeResult,
  NumerologyCheckRequest,
  NumerologyProfile,
  NumerologyReference,
  GroupedLocations,
} from "./types";
import { formatTime12h } from "./timeFormat";

// Base URL of the FastAPI backend.
// Override via NEXT_PUBLIC_API_BASE_URL in a .env.local file if the backend
// runs somewhere other than the default local dev address.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const API_V1 = `${API_BASE_URL}/api`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const errBody = await res.json();
      detail = errBody.detail || detail;
    } catch {
      // response body wasn't JSON; keep default message
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

/* ---------------------------------------------------------------------------
 * Chart post-processing — the single place that decides how a birth time is
 * DISPLAYED across the whole site.
 *
 * The bug: someone enters 12:58 AM, and every screen then prints "00:58:00".
 * Both are the same instant (12:58 AM *is* 00:58 in 24-hour time), so the
 * conversion was never wrong — but the site was echoing back the internal
 * 24-hour value instead of what the person typed.
 *
 * Fixing it here, at the API boundary, fixes it everywhere at once: the
 * single-page sheet, all 50 manuscript chapters, and every other component
 * that renders `chart.time_of_birth`. The raw 24-hour value is preserved as
 * `time_of_birth_24h`.
 *
 * IMPORTANT: if you ever re-post a chart's own values back to the backend
 * (regeneration, save-as-profile), use `time_of_birth_24h`, never the
 * display string. Every computed value inside `chart` was already produced by
 * the backend from the 24-hour time, so nothing recalculates from this field.
 * ------------------------------------------------------------------------- */
function decorateChart(chart: ChartResponse): ChartResponse {
  if (!chart || typeof chart !== "object") return chart;
  const raw = (chart as any).time_of_birth_24h || chart.time_of_birth;
  return {
    ...chart,
    time_of_birth_24h: raw,
    time_of_birth: formatTime12h(raw),
  } as ChartResponse;
}

/**
 * Generate a full Vedic Jathagam chart from birth details.
 * POST /api/charts/generate
 */
export async function generateChartApi(data: GenerateChartRequest): Promise<ChartResponse> {
  const res = await fetch(`${API_V1}/charts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return decorateChart(await handleResponse<ChartResponse>(res));
}

/**
 * Fetch a previously generated chart by ID.
 * GET /api/charts/{chart_id}
 */
export async function getChartApi(chartId: number): Promise<ChartResponse> {
  const res = await fetch(`${API_V1}/charts/${chartId}`);
  return decorateChart(await handleResponse<ChartResponse>(res));
}

/**
 * Run a Porutham (compatibility) match.
 * POST /api/porutham
 */
export async function generatePoruthamApi(data: PoruthamRequest): Promise<PoruthamMatchResult> {
  const res = await fetch(`${API_V1}/porutham`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PoruthamMatchResult>(res);
}

// Alias for backwards compatibility — porutham/page.tsx imports matchPoruthamApi
export const matchPoruthamApi = generatePoruthamApi;

/**
 * Star Match Finder — MATCH feature.
 * POST /api/porutham/star-matches
 */
export async function findStarMatchesApi(
  data: StarMatchFinderRequest
): Promise<StarMatchFinderResponse> {
  const res = await fetch(`${API_V1}/porutham/star-matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<StarMatchFinderResponse>(res);
}

/**
 * GET variant for quick browser testing.
 * GET /api/porutham/star-matches?nakshatra=Pushya&pada=2&gender=boy
 */
export async function findStarMatchesGetApi(
  nakshatra: string,
  pada: number,
  gender: string = "boy",
  filterRasi?: number,
  sortBy: string = "score"
): Promise<StarMatchFinderResponse> {
  const params = new URLSearchParams({
    nakshatra,
    pada: String(pada),
    gender,
    sort_by: sortBy,
  });
  if (filterRasi) params.set("filter_rasi", String(filterRasi));
  const res = await fetch(`${API_V1}/porutham/star-matches?${params.toString()}`);
  return handleResponse<StarMatchFinderResponse>(res);
}

/**
 * Generate/re-generate AI narration for a chart.
 * POST /api/narration
 */
export async function generateNarrationApi(data: NarrationRequest): Promise<NarrationResult> {
  const res = await fetch(`${API_V1}/narration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NarrationResult>(res);
}

/** Create a saved profile. POST /api/profiles */
export async function createProfileApi(data: ProfileCreate): Promise<ProfileResponse> {
  const res = await fetch(`${API_V1}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ProfileResponse>(res);
}

/** List saved profiles. GET /api/profiles */
export async function listProfilesApi(skip = 0, limit = 100): Promise<ProfileResponse[]> {
  const res = await fetch(`${API_V1}/profiles?skip=${skip}&limit=${limit}`);
  return handleResponse<ProfileResponse[]>(res);
}

/** Fetch a single saved profile. GET /api/profiles/{profile_id} */
export async function getProfileApi(profileId: number): Promise<ProfileResponse> {
  const res = await fetch(`${API_V1}/profiles/${profileId}`);
  return handleResponse<ProfileResponse>(res);
}

/** Most recent computed chart for a saved profile. GET /api/profiles/{id}/chart */
export async function getProfileChartApi(profileId: number): Promise<ChartResponse> {
  const res = await fetch(`${API_V1}/profiles/${profileId}/chart`);
  return decorateChart(await handleResponse<ChartResponse>(res));
}

/**
 * Place autocomplete. GET /api/geocode/suggest?q=...
 * Returns [] for queries under 2 characters without hitting the network.
 */
export async function suggestPlacesApi(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 1. Backend proxy with caching & local matches
  try {
    const res = await fetch(`${API_V1}/geocode/suggest?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) return data.results;
    }
  } catch {
    // backend unreachable — fall through to the client-side free APIs
  }

  // 2. Open-Meteo geocoding
  try {
    const omRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        trimmed
      )}&count=10&language=en&format=json`
    );
    if (omRes.ok) {
      const omData = await omRes.json();
      if (omData.results && omData.results.length > 0) {
        return omData.results.map((r: any) => {
          const parts = [r.name];
          if (r.admin2) parts.push(r.admin2);
          if (r.admin1 && r.admin1 !== r.name) parts.push(r.admin1);
          if (r.country) parts.push(r.country);
          return {
            display_name: parts.join(", "),
            display_name_ta: r.name,
            lat: r.latitude,
            lon: r.longitude,
            timezone: r.timezone || "Asia/Kolkata",
          };
        });
      }
    }
  } catch {
    /* ignore */
  }

  // 3. Nominatim for Tamil / regional queries
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        trimmed
      )}&format=json&limit=8&addressdetails=1`
    );
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (nomData && nomData.length > 0) {
        return nomData.map((item: any) => ({
          display_name: item.display_name,
          display_name_ta: trimmed,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          timezone: "Asia/Kolkata",
        }));
      }
    }
  } catch {
    /* ignore */
  }

  return [];
}

/** Resolves any typed place name to its best geocoding match. */
export async function directGeocodeApi(placeName: string): Promise<PlaceSuggestion | null> {
  const suggestions = await suggestPlacesApi(placeName);
  return suggestions && suggestions.length > 0 ? suggestions[0] : null;
}

/** Pre-grouped locations for the picker dropdown. GET /api/geocode/grouped */
export async function getGroupedLocationsApi(): Promise<GroupedLocations> {
  const res = await fetch(`${API_V1}/geocode/grouped`);
  return handleResponse<GroupedLocations>(res);
}

/** Nakshatra-Pada baby name suggestions. POST /api/baby-names/generate */
export async function generateBabyNamesApi(data: BabyNameRequest): Promise<BabyNameResult> {
  const res = await fetch(`${API_V1}/baby-names/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<BabyNameResult>(res);
}

/** Standalone Chaldean numerology check. POST /api/numerology/check */
export async function checkNumerologyApi(data: NumerologyCheckRequest): Promise<NumerologyProfile> {
  const res = await fetch(`${API_V1}/numerology/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NumerologyProfile>(res);
}

/**
 * Muhurtha date-range search.
 * POST /api/muhurtha/search
 *
 * FIXED: this used to be `findMuhurthaApi` posting to `/api/muhurtha/find`
 * with a `MuhurthaResponse` type — an endpoint the backend does not expose
 * (the router is `/muhurtha/search`) and a type that no longer exists. The
 * Muhurtha page imports `searchMuhurthaApi`, so the page could not even
 * compile against the old file.
 */
export async function searchMuhurthaApi(data: MuhurthaRequest): Promise<MuhurthaSearchResponse> {
  const res = await fetch(`${API_V1}/muhurtha/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MuhurthaSearchResponse>(res);
}

/** @deprecated Old name kept so any stale import keeps compiling. */
export const findMuhurthaApi = searchMuhurthaApi;

/** Daily/Weekly/Monthly/Yearly Rasi transit horoscope. */
export async function getRasiHoroscopeApi(
  period: "daily" | "weekly" | "monthly" | "yearly",
  rasiNumber: number
): Promise<RasiHoroscopeResult> {
  const res = await fetch(`${API_V1}/horoscope/${period}/${rasiNumber}`);
  return handleResponse<RasiHoroscopeResult>(res);
}

/** Rasi-to-Rasi love horoscope. GET /api/horoscope/love/{rasi1}/{rasi2} */
export async function getRasiLoveHoroscopeApi(
  rasi1: number,
  rasi2: number
): Promise<RasiLoveHoroscopeResult> {
  const res = await fetch(`${API_V1}/horoscope/love/${rasi1}/${rasi2}`);
  return handleResponse<RasiLoveHoroscopeResult>(res);
}

/** Static numerology reference tables. GET /api/numerology/reference */
export async function getNumerologyReferenceApi(): Promise<NumerologyReference> {
  const res = await fetch(`${API_V1}/numerology/reference`);
  return handleResponse<NumerologyReference>(res);
}