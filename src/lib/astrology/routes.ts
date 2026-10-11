/** Mount point of the Astrology service inside the MyLoginn app. */
export const ASTRO_BASE = "/services/astrology";

/**
 * Same-origin proxy to the Python astrology service (see
 * src/app/api/astrology/[...path]/route.ts). `${ASTRO_API}/charts/x` reaches
 * the backend's `/api/charts/x`. The browser never talks to the service
 * directly, so the print/PDF endpoints can be gated by payment on the server.
 */
export const ASTRO_API = "/api/astrology";

/** Pay-to-unlock endpoints (status / create-order / verify). */
export const ASTRO_PURCHASE_API = "/api/astrology-purchase";
