import type { Signatory } from "@/types/certificate";

/** Design canvas: A4 landscape at 96 CSS px per inch (297 × 210 mm). Every template is laid out at exactly this size. */
export const CERT_WIDTH_PX = 1123;
export const CERT_HEIGHT_PX = 794;
export const A4_LANDSCAPE_MM = { w: 297, h: 210 } as const;
/** 300 DPI A4 landscape = 3508 × 2480 px, so the capture pixel ratio is 3508 / 1123. */
export const PRINT_PIXEL_RATIO = 3508 / CERT_WIDTH_PX;

/** Printed on every certificate: left, then right. */
export const SIGNATORIES: readonly [Signatory, Signatory] = [
  { name: "Saravanakumar", title: "Co-Founder / Director" },
  { name: "Swaminathan S" },
];

export const ISSUER = "MyLoginn Learning";

/** "October 15, 2026". UTC, so the date matches the server-rendered PDF certificates. */
export function formatCertificateDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Official-name rules. Latin script only, because every certificate typeface covers Latin only and a
 * fallback font would break the design. Allows initials ("Swaminathan S."), hyphens and apostrophes.
 */
export const NAME_MIN = 2;
export const NAME_MAX = 60;
const NAME_PATTERN = /^[\p{Script=Latin}][\p{Script=Latin}\p{M}.'’-]*(?: [\p{Script=Latin}\p{M}.'’-]+)*$/u;

export function normalizeOfficialName(raw: string) {
  return raw.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** Returns an error message, or null when the (already normalized) name is acceptable. */
export function validateOfficialName(name: string): string | null {
  if (name.length < NAME_MIN) return "Enter your full name as it appears on your official ID.";
  if (name.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
  if (!NAME_PATTERN.test(name)) return "Use English letters, spaces, dots, apostrophes or hyphens only.";
  if (!/\p{L}.*\p{L}/u.test(name)) return "Enter your full name, not just an initial.";
  return null;
}
