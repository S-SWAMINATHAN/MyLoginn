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
          ink: "#1c1917"
        }
      },
      fontFamily: {
        tamil: ["var(--font-tamil)", "Kavivanar", "cursive"],
        script: ["var(--font-script)", "Kavivanar", "cursive"],
        cinzel: ["var(--font-cinzel)", "Caveat", "Kavivanar", "cursive"],
        caveat: ["var(--font-caveat)", "Caveat", "cursive"],
        mono: ["Caveat", "Kavivanar", "cursive"],
        sans: ["Kavivanar", "Caveat", "cursive", "sans-serif"],
        serif: ["Kavivanar", "Caveat", "cursive", "serif"],
      }
    },
  },
  plugins: [],
};
export default config;
