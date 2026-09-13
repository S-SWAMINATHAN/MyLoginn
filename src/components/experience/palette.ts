/**
 * Story-engine color palette (Three.js / Canvas side).
 * Keep in sync with the `--story-*` custom properties in `globals.css` —
 * those drive DOM/CSS, these drive WebGL materials which need numeric hex.
 */
export const PALETTE = {
  navy: 0x0b1f4d,
  royal: 0x1f56d6,
  electric: 0x2f6fed,
  bright: 0x5590ff,
  cyan: 0x22d3ee,
  cyanSoft: 0xb6ecf9,
  white: 0xffffff,
  mist: 0xf4f8ff,
} as const;

export const PALETTE_CSS = {
  navy: "#0b1f4d",
  royal: "#1f56d6",
  electric: "#2f6fed",
  bright: "#5590ff",
  cyan: "#22d3ee",
  cyanSoft: "#b6ecf9",
} as const;
