"use client";

import React, { createContext, useContext } from "react";
import {
  ChartStyle,
  NORTH_INDIAN_HOUSES,
  signForNorthIndianHouse,
} from "@/lib/astrology/chartLayouts";

/**
 * One chart-style switch for every small chart in the handwritten Jathagam.
 *
 * WHY THIS EXISTS
 * ---------------
 * Picking Kerala or North Indian used to change only the large live chart.
 * Four other renderers — the 50-page manuscript's varga pages (14 charts),
 * the Thirukanitham card, the Vakhyam card, and the single-page sheet — each
 * drew their own hard-coded South Indian grid and never looked at
 * `chart_style`. And because the PDF and Print capture that same DOM, both
 * outputs inherited the wrong chart.
 *
 * Setting the style once in a context at the top of each of those surfaces
 * means every chart inside follows it, including charts added later.
 *
 * ON KERALA
 * ---------
 * Kerala uses the SAME fixed-sign square grid as Tamil Nadu — that is the
 * actual tradition, not a simplification here. Only North Indian changes the
 * geometry (a house-based diamond with the Lagna fixed at the top). So Kerala
 * is distinguished by its palette and label, not by a different shape.
 */

type Style = ChartStyle;

const ChartStyleContext = createContext<Style>("tamil");

export const ChartStyleProvider: React.FC<{ style?: string | null; children: React.ReactNode }> = ({
  style,
  children,
}) => (
  <ChartStyleContext.Provider value={normaliseStyle(style)}>{children}</ChartStyleContext.Provider>
);

export const useChartStyle = (): Style => useContext(ChartStyleContext);

export function normaliseStyle(style?: string | null): Style {
  return style === "kerala" || style === "north_indian" ? style : "tamil";
}

export type MiniPlanet = { name: string; symbol: string };

/**
 * The sign the Lagna sits in, read from the chart's own data.
 *
 * A North Indian chart is laid out FROM its Lagna, so each chart must use its
 * own — the Navamsa uses the Navamsa Lagna, a D10 its D10 Lagna. Using the
 * birth-chart Lagna for every chart would silently rotate all the others.
 */
export function resolveLagnaSign(
  planetsBySign: Record<number, MiniPlanet[] | undefined>,
  explicit?: number
): number {
  if (explicit && explicit >= 1 && explicit <= 12) return explicit;
  for (let s = 1; s <= 12; s++) {
    const list = planetsBySign[s] || [];
    if (
      list.some(
        (p) =>
          p.symbol === "லக்" ||
          /lagna|ascendant/i.test(p.name || "") ||
          (p.name || "").includes("லக்னம்")
      )
    ) {
      return s;
    }
  }
  return 1;
}

export const STYLE_LABEL: Record<Style, { en: string; ta: string }> = {
  tamil: { en: "Tamil (South Indian)", ta: "தமிழ் முறை" },
  kerala: { en: "Kerala", ta: "கேரள முறை" },
  north_indian: { en: "North Indian", ta: "வட இந்திய முறை" },
};

/**
 * Compact North Indian diamond. Fills its container (SVG viewBox), so it
 * drops into the same slot a South Indian grid occupied.
 */
export const NorthMiniChart: React.FC<{
  planetsBySign: Record<number, MiniPlanet[] | undefined>;
  lagnaSign?: number;
  centreTitle?: string;
  height?: number;
}> = ({ planetsBySign, lagnaSign, centreTitle, height = 155 }) => {
  const lagna = resolveLagnaSign(planetsBySign, lagnaSign);

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height, display: "block" }}
      role="img"
      aria-label="North Indian chart"
    >
      <rect x="1" y="1" width="398" height="398" style={{ fill: "#ffffff", stroke: "var(--jat-gold-deep, #8b5a2b)" }} strokeWidth="3" />
      {NORTH_INDIAN_HOUSES.map((h) => {
        const sign = signForNorthIndianHouse(lagna, h.house);
        const list = (planetsBySign[sign] || []).filter((p) => p.symbol !== "லக்");
        const isLagna = h.house === 1;
        return (
          <g key={h.house}>
            <polygon
              points={h.points}
              style={{
                fill: isLagna ? "var(--jat-accent-10, rgba(142,43,28,0.08))" : "transparent",
                stroke: "var(--jat-gold, #aa820a)",
              }}
              strokeWidth="1.6"
            />
            {/* Sign number — North Indian charts label each house with the
                sign that occupies it, since the signs rotate with the Lagna. */}
            <text
              x={h.labelX}
              y={h.labelY - 16}
              textAnchor="middle"
              fontSize="15"
              style={{ fill: "var(--jat-accent, #8e2b1c)" }}
              fontWeight={700}
            >
              {sign}
            </text>
            {list.slice(0, 4).map((p, i) => (
              <text
                key={`${h.house}-${i}`}
                x={h.labelX}
                y={h.labelY + 4 + i * 17}
                textAnchor="middle"
                fontSize="15"
                style={{ fill: "var(--jat-ink, #3a1a0f)" }}
                fontWeight={600}
              >
                {p.symbol || p.name.slice(0, 2)}
              </text>
            ))}
            {list.length > 4 && (
              <text x={h.labelX} y={h.labelY + 4 + 4 * 17} textAnchor="middle" fontSize="12" style={{ fill: "var(--jat-ink-soft, #6f6049)" }}>
                +{list.length - 4}
              </text>
            )}
          </g>
        );
      })}
      {centreTitle && (
        <text x="200" y="205" textAnchor="middle" fontSize="14" style={{ fill: "var(--jat-accent, #8e2b1c)" }} fontWeight={700}>
          {centreTitle}
        </text>
      )}
    </svg>
  );
};
