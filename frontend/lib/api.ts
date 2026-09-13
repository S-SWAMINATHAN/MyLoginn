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
  MuhurthaRequest, // NEW
  MuhurthaSearchResponse, // NEW
  RasiHoroscopeResult, // NEW
  RasiLoveHoroscopeResult, // NEW
} from "./types";

// Base URL of the FastAPI backend.
// Override via NEXT_PUBLIC_API_BASE_URL in a .env.local file if the backend
// runs somewhere other than the default local dev address.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

/**
 * Generate a full Vedic Jathagam chart from birth details.
 * POST /api/charts/generate
 */
export async function generateChartApi(
  data: GenerateChartRequest
): Promise<ChartResponse> {
  const res = await fetch(`${API_V1}/charts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ChartResponse>(res);
}

/**
 * Fetch a previously generated chart by ID.
 * GET /api/charts/{chart_id}
 */
export async function getChartApi(chartId: number): Promise<ChartResponse> {
  const res = await fetch(`${API_V1}/charts/${chartId}`);
  return handleResponse<ChartResponse>(res);
}

/**
 * Run a Porutham (compatibility) match.
 * POST /api/porutham
 */
export async function generatePoruthamApi(
  data: PoruthamRequest
): Promise<PoruthamMatchResult> {
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
 * Star Match Finder — MATCH feature
 * For a given Boy (or Girl) Nakshatra/Pada, get LIKE-RATE for all target Rasi/Nakshatra combos (108 pada-level)
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
 * GET variant for quick browser testing
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
export async function generateNarrationApi(
  data: NarrationRequest
): Promise<NarrationResult> {
  const res = await fetch(`${API_V1}/narration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NarrationResult>(res);
}

/**
 * Create a saved profile.
 * POST /api/profiles
 */
export async function createProfileApi(
  data: ProfileCreate
): Promise<ProfileResponse> {
  const res = await fetch(`${API_V1}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ProfileResponse>(res);
}

/**
 * List saved profiles.
 * GET /api/profiles
 */
export async function listProfilesApi(
  skip = 0,
  limit = 100
): Promise<ProfileResponse[]> {
  const res = await fetch(`${API_V1}/profiles?skip=${skip}&limit=${limit}`);
  return handleResponse<ProfileResponse[]>(res);
}

/**
 * Fetch a single saved profile.
 * GET /api/profiles/{profile_id}
 */
export async function getProfileApi(
  profileId: number
): Promise<ProfileResponse> {
  const res = await fetch(`${API_V1}/profiles/${profileId}`);
  return handleResponse<ProfileResponse>(res);
}

/**
 * Fetch the most recent computed chart for a saved profile.
 * GET /api/profiles/{profile_id}/chart
 */
export async function getProfileChartApi(
  profileId: number
): Promise<ChartResponse> {
  const res = await fetch(`${API_V1}/profiles/${profileId}/chart`);
  return handleResponse<ChartResponse>(res);
}

/**
 * Get place-of-birth autocomplete suggestions.
 * GET /api/geocode/suggest?q=...
 * Returns [] for queries under 2 characters without hitting the network.
 */
export async function suggestPlacesApi(
  query: string
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 1. Try Backend Proxy with Caching & Local Matches
  try {
    const res = await fetch(
      `${API_V1}/geocode/suggest?q=${encodeURIComponent(trimmed)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    // backend unreachable or blocked, fall through to client-side free API
  }

  // 2. Client-side fallback to Free Open-Meteo Geocoding API
  try {
    const omRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`
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
    // ignore
  }

  // 3. Fallback to OpenStreetMap Nominatim for Tamil or regional queries
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=8&addressdetails=1`
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
    // ignore
  }

  return [];
}

/**
 * Direct geocoding resolver for any place name.
 * Resolves any custom typed place using dynamic geocoding API.
 */
export async function directGeocodeApi(
  placeName: string
): Promise<PlaceSuggestion | null> {
  const suggestions = await suggestPlacesApi(placeName);
  if (suggestions && suggestions.length > 0) {
    return suggestions[0];
  }
  return null;
}

/**
 * Get pre-grouped locations for the location picker dropdown:
 * GET /api/geocode/grouped
 */
export async function getGroupedLocationsApi(): Promise<import("./types").GroupedLocations> {
  const res = await fetch(`${API_V1}/geocode/grouped`);
  return handleResponse<import("./types").GroupedLocations>(res);
}

/**
 * Generate Nakshatra-Pada based baby name suggestions from birth details directly.
 * POST /api/baby-names/generate
 */
export async function generateBabyNamesApi(
  data: BabyNameRequest
): Promise<BabyNameResult> {
  const res = await fetch(`${API_V1}/baby-names/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<BabyNameResult>(res);
}

/**
 * Find auspicious dates (Muhurtha) for Marriage or Travel within a date
 * range — universal screening (Rikta Tithi, Bhadra Karana, Marana Yoga,
 * Tara Bala, Chandra Bala) plus event-specific rules (Vivaha-auspicious
 * Nakshatra for marriage, Dishashool for travel). See
 * backend/app/services/muhurtha.py for citations.
 * POST /api/muhurtha/search
 */
export async function searchMuhurthaApi(
  data: MuhurthaRequest
): Promise<MuhurthaSearchResponse> {
  const res = await fetch(`${API_V1}/muhurtha/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MuhurthaSearchResponse>(res);
}

/**
 * NEW: Daily/Weekly/Monthly/Yearly Rasi (Gochara transit) horoscope.
 * GET /api/horoscope/{period}/{rasi_number}
 */
export async function getRasiHoroscopeApi(
  period: "daily" | "weekly" | "monthly" | "yearly",
  rasiNumber: number
): Promise<RasiHoroscopeResult> {
  const res = await fetch(`${API_V1}/horoscope/${period}/${rasiNumber}`);
  return handleResponse<RasiHoroscopeResult>(res);
}

/**
 * NEW: Rasi-to-Rasi Love Horoscope (lightweight, Rasi-only compatibility —
 * see rasi_love_horoscope.py for how this differs from the full Porutham page).
 * GET /api/horoscope/love/{rasi1}/{rasi2}
 */
export async function getRasiLoveHoroscopeApi(
  rasi1: number,
  rasi2: number
): Promise<RasiLoveHoroscopeResult> {
  const res = await fetch(`${API_V1}/horoscope/love/${rasi1}/${rasi2}`);
  return handleResponse<RasiLoveHoroscopeResult>(res);
}