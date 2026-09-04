import {
  GenerateChartRequest,
  ChartResponse,
  PoruthamRequest,
  PoruthamMatchResult,
  NarrationRequest,
  NarrationResult,
  ProfileCreate,
  ProfileResponse,
  PlaceSuggestion,
  BabyNameRequest, // NEW
  BabyNameResult, // NEW
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

  const res = await fetch(
    `${API_V1}/geocode/suggest?q=${encodeURIComponent(trimmed)}`
  );
  const data = await handleResponse<{ results: PlaceSuggestion[] }>(res);
  return data.results;
}

/**
 * NEW: Generate Nakshatra-Pada based baby name suggestions from birth
 * details directly (no full chart generation required).
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