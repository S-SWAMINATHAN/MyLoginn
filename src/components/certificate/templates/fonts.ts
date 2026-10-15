import { Alex_Brush, Allura, Archivo, Great_Vibes, Herr_Von_Muellerhoff, Libre_Baskerville, Montserrat, Pinyon_Script, Playfair_Display, Poppins } from "next/font/google";

// Self-hosted by next/font, so the files are same-origin and html-to-image can inline them into exports.
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], display: "block" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "block" });
const montserrat = Montserrat({ subsets: ["latin"], display: "block" });
const baskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], display: "block" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], display: "block" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "block" });
const alexBrush = Alex_Brush({ subsets: ["latin"], weight: "400", display: "block" });
const allura = Allura({ subsets: ["latin"], weight: "400", display: "block" });
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", display: "block" });
const signature = Herr_Von_Muellerhoff({ subsets: ["latin"], weight: "400", display: "block" });

/** Font-family strings for inline styles. */
export const fonts = {
  poppins: poppins.style.fontFamily,
  playfair: playfair.style.fontFamily,
  montserrat: montserrat.style.fontFamily,
  baskerville: baskerville.style.fontFamily,
  archivo: archivo.style.fontFamily,
  greatVibes: greatVibes.style.fontFamily,
  alexBrush: alexBrush.style.fontFamily,
  allura: allura.style.fontFamily,
  pinyon: pinyon.style.fontFamily,
  signature: signature.style.fontFamily,
} as const;
