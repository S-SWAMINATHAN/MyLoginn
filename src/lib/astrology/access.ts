/**
 * Astrology pay-to-unlock rules, shared by the browser (price display, report
 * keys) and the server (price, report keys, PDF gating). Keep this file free of
 * browser-only and server-only imports.
 *
 * One payment unlocks printing / downloading for ONE report, forever, for the buyer
 * (their browser, or their account if signed in). A report is identified by its product plus a key built from
 * the birth details (or both partners' details for matching).
 */

export type AstroProduct = "SINGLE_PAGE" | "FULL" | "MATCHING";

export const ASTRO_PRODUCTS: Record<AstroProduct, { label: string; labelTa: string; baseRupees: number }> = {
  SINGLE_PAGE: { label: "Single-page horoscope", labelTa: "ஒரு பக்க ஜாதகம்", baseRupees: 20 },
  FULL: { label: "Full horoscope", labelTa: "முழு ஜாதகம்", baseRupees: 499 },
  MATCHING: { label: "Horoscope matching", labelTa: "ஜாதகப் பொருத்தம்", baseRupees: 299 },
};

export function isAstroProduct(value: unknown): value is AstroProduct {
  return typeof value === "string" && value in ASTRO_PRODUCTS;
}

/** Price in paise (Razorpay's unit). */
export function priceInPaise(product: AstroProduct): number {
  return ASTRO_PRODUCTS[product].baseRupees * 100;
}

export type ReportAccess = { product: AstroProduct; reportKey: string };

type Dict = Record<string, unknown>;

const isDict = (v: unknown): v is Dict => typeof v === "object" && v !== null && !Array.isArray(v);
const clean = (v: unknown) => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const hhmm = (v: unknown) => clean(v).split(":").slice(0, 2).join(":");
const coord = (v: unknown) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

/** Birth identity only — name, language, theme and layout changes must not need a second payment. */
export function birthKey(birth: object): string {
  const b = birth as Dict;
  const where = coord(b.latitude) && coord(b.longitude) ? `${coord(b.latitude)},${coord(b.longitude)}` : clean(b.place);
  return ["birth", clean(b.date_of_birth), hhmm(b.time_of_birth), where].join("|");
}

export function poruthamKey(girl: object, boy: object): string {
  return ["match", birthKey(girl), birthKey(boy)].join("|");
}

/** Baby-name and horary sheets have no birth details; they are keyed by their form values. */
export function formKey(kind: string, formValues: object): string {
  const form = formValues as Dict;
  const stable = Object.keys(form)
    .sort()
    .map((k) => `${k}=${clean(form[k])}`)
    .join("&");
  return `${kind}|${stable}`;
}

/**
 * Which product and report a `/pdf/<path>` request is for. `null` means the
 * path is not a known report endpoint (the server then refuses it).
 */
export function pdfRequestAccess(path: string, body: unknown): ReportAccess | null {
  if (!isDict(body)) return null;
  switch (path) {
    case "kanitha":
      if (!isDict(body.birth)) return null;
      return { product: body.mode === "single" ? "SINGLE_PAGE" : "FULL", reportKey: birthKey(body.birth) };
    case "kp":
      if (!isDict(body.birth)) return null;
      return { product: "FULL", reportKey: `kp|${birthKey(body.birth)}` };
    case "porutham":
      if (!isDict(body.girl) || !isDict(body.boy)) return null;
      return { product: "MATCHING", reportKey: poruthamKey(body.girl, body.boy) };
    case "baby-names":
      if (!isDict(body.form)) return null;
      return { product: "SINGLE_PAGE", reportKey: formKey("baby", body.form) };
    case "kp-horary":
      if (!isDict(body.form)) return null;
      return { product: "SINGLE_PAGE", reportKey: formKey("horary", body.form) };
    default:
      return null;
  }
}
