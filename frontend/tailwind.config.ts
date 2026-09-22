import type { Config } from "tailwindcss";

/**
 * MyLoginn Astrology — Tailwind v3 config.
 *
 * The blue brand system comes from the reference project's global.css
 * (Tailwind v4 `@theme inline`), re-expressed here for Tailwind v3.4 so no
 * dependency upgrade is needed.
 *
 *  - Surfaces / text tokens flip between light and dark, so they are exposed
 *    as `rgb(var(--x-rgb) / <alpha-value>)`. That keeps opacity modifiers
 *    such as `bg-surface/70` working in both themes.
 *  - The brand / accent / status scales are theme-independent hex values.
 *  - `parchment`, `temple` and the legacy font keys are KEPT: the handwritten
 *    Jathagam (50-page manuscript, single-page sheet, theme panel) still uses
 *    them and must render exactly as before.
 */
const rgbVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── MyLoginn blue system (theme aware) ── */
        background: rgbVar("--background-rgb"),
        foreground: rgbVar("--foreground-rgb"),
        surface: rgbVar("--surface-rgb"),
        "surface-2": rgbVar("--surface-2-rgb"),
        muted: rgbVar("--muted-rgb"),
        line: "var(--line)",
        "border-soft": "var(--border-soft)",

        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#b6d0ff",
          300: "#86b0ff",
          400: "#5590ff",
          500: "#2f6fed",
          600: "#1f56d6",
          700: "#1a44ab",
          800: "#16337e",
          900: "#0b1f4d",
          /* readable brand text on the current surface (600 in light, 300 in dark) */
          fg: rgbVar("--brand-fg-rgb"),
          "fg-strong": rgbVar("--brand-fg-strong-rgb"),
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",

        /* ── Legacy: used ONLY by the handwritten Jathagam ── */
        parchment: {
          50: "#fdfbf7",
          100: "#fbf6ec",
          200: "#f5e8d0",
          300: "#edd5af",
          400: "#e0b87f",
          500: "#d39c56",
          600: "#c0803e",
          700: "#9f6333",
          800: "#804e2e",
          900: "#684028",
        },
        temple: {
          maroon: "#6b1426",
          deepmaroon: "#450a16",
          gold: "#d4af37",
          deepgold: "#aa820a",
          saffron: "#e65c00",
          emerald: "#115e59",
          ink: "#1c1917",
        },
      },
      fontFamily: {
        /* New UI faces: Latin from Inter / Outfit, Tamil from Noto Sans Tamil. */
        sans: ["var(--font-ui)"],
        display: ["var(--font-display)"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
        /* Legacy keys kept for the handwritten Jathagam components. */
        tamil: ["var(--font-tamil)", "Kavivanar", "cursive"],
        script: ["var(--font-script)", "Kavivanar", "cursive"],
        cinzel: ["var(--font-cinzel)", "Caveat", "Kavivanar", "cursive"],
        caveat: ["var(--font-caveat)", "Caveat", "cursive"],
        serif: ["Kavivanar", "Caveat", "cursive", "serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
