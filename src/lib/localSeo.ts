/**
 * Central store of local search terms. These go only into non-visible metadata
 * (meta keywords, structured data, search-result descriptions), never into hidden
 * on-page text. Visible pages stay national/international.
 */
export const localAreas = {
  state: "Tamil Nadu",
  cities: ["Coimbatore", "Pollachi", "Udumalpet", "Erode"],
} as const;

/** e.g. localKeywords(["web development company", "digital marketing"]) */
export function localKeywords(services: string[]): string[] {
  const places = [...localAreas.cities, localAreas.state];
  return services.flatMap((service) => places.map((place) => `${service} ${place}`));
}

/** Wider regional terms (meta keywords only). Served remotely; no state pages exist. */
export const regionalAreas = ["Bangalore", "Bengaluru", "Karnataka", "Kochi", "Kerala", "Hyderabad", "Telangana", "Chennai", "Mumbai", "Pune"] as const;

export function regionalKeywords(services: string[]): string[] {
  return services.flatMap((service) => regionalAreas.map((place) => `${service} ${place}`));
}
