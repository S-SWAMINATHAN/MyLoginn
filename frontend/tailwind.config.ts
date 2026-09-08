import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // General site paper/background scale (light theme). Not a regional
        // citation — safe to re-theme freely. Renamed in spirit to the new
        // light sapphire-paper look; key name kept as `parchment` to avoid
        // touching every component that already references parchment-*.
        parchment: {
          50: "#fbfdff",
          100: "#f5f9ff",
          200: "#e7eefb",
          300: "#dbe6f9",
          400: "#c3d6f5",
          500: "#a9c2ef",
          600: "#8aabe8",
          700: "#6690db",
          800: "#4a72bd",
          900: "#375795",
        },
        // NEW: primary brand palette, pulled from the MyLoginn Astrology
        // logo (bright sapphire crystal "M" + gold sun/zodiac ring).
        sapphire: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b8ccff",
          300: "#8babf5",
          400: "#4c72d9",
          500: "#2454c7",
          600: "#1e40af",
          700: "#17348f",
          800: "#122868",
          900: "#11162e",
        },
        gold: {
          300: "#f6dd8c",
          400: "#f2c94c",
          500: "#d4af37",
          600: "#aa820a",
          700: "#8a6a08",
        },
        // temple.* is the classically-cited regional chart-style palette
        // (see jathagam-architecture.md §3.7 — Tamil/Kerala/North Indian).
        // Left byte-identical: this governs the printed manuscript and the
        // per-region chart-drawing theme, NOT the general site chrome, so
        // it must never be repainted by a site-wide theme change.
        temple: {
          maroon: "#6b1426",
          deepmaroon: "#450a16",
          gold: "#d4af37",
          deepgold: "#aa820a",
          saffron: "#e65c00",
          emerald: "#115e59",
          ink: "#1c1917"
        }
      },
      fontFamily: {
        tamil: ["var(--font-tamil)", "Noto Sans Tamil", "sans-serif"],
        script: ["var(--font-script)", "Kavivanar", "cursive"],
        cinzel: ["var(--font-cinzel)", "Cinzel", "serif"],
        caveat: ["var(--font-caveat)", "Caveat", "cursive"]
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "ink-settle": {
          "0%": { opacity: "0", filter: "blur(2px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "twinkle": "twinkle 3.2s ease-in-out infinite",
        "ink-settle": "ink-settle 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
