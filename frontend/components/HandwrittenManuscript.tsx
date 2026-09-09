"use client";

import React from "react";
import { ChartResponse } from "@/lib/types";
import { Chapter1Invocations } from "./manuscript/Chapter1Invocations";
import { Chapter2Panchangam } from "./manuscript/Chapter2Panchangam";
import { Chapter3GrahaSphutam } from "./manuscript/Chapter3GrahaSphutam";
import { Chapter4VargaChakras } from "./manuscript/Chapter4VargaChakras";
import { Chapter5Shadbala } from "./manuscript/Chapter5Shadbala";
import { Chapter6Ashtakavarga } from "./manuscript/Chapter6Ashtakavarga";
import { Chapter7KujaDosha } from "./manuscript/Chapter7KujaDosha";
import { Chapter8YogasDoshas } from "./manuscript/Chapter8YogasDoshas";
import { Chapter9Ayurdaya } from "./manuscript/Chapter9Ayurdaya";
import { Chapter10DashaTimeline } from "./manuscript/Chapter10DashaTimeline";
import { Chapter11BhavaPredictions } from "./manuscript/Chapter11BhavaPredictions";
import { Chapter12GocharaMatching } from "./manuscript/Chapter12GocharaMatching";
import { Chapter13PanchaPakshiNama } from "./manuscript/Chapter13PanchaPakshiNama";
import { Chapter14RemediesMangalam } from "./manuscript/Chapter14RemediesMangalam";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
  activePage?: number;
}

export const HandwrittenManuscript: React.FC<Props> = ({ chart, lang, activePage }) => {
  return (
    <div
      id={activePage ? "manuscript-preview-container" : undefined}
      className="manuscript-container flex flex-col items-center gap-8 py-2"
      style={{ width: "794px" }}
    >
      {/* 
        If activePage is set (for on-screen paginated preview),
        we apply a style tag that hides other pages in this container instance.
        This keeps the DOM structure identical while showing only the desired page.
      */}
      {activePage && (
        <style dangerouslySetInnerHTML={{
          __html: `
            #manuscript-preview-container .manuscript-page { display: none !important; }
            #manuscript-preview-container .manuscript-page[data-page="${activePage}"] { display: block !important; }
          `
        }} />
      )}

      {/* Part 1: Invocations & Preamble (Pages 1-4) */}
      <Chapter1Invocations chart={chart} lang={lang} />

      {/* Part 2: Panchangam Computations (Pages 5-7) */}
      <Chapter2Panchangam chart={chart} lang={lang} />

      {/* Part 3: Planetary Longitudes & Aspects (Pages 8-10) */}
      <Chapter3GrahaSphutam chart={chart} lang={lang} />

      {/* Part 4: Core & Divisional Charts D1-D60 (Pages 11-17) */}
      <Chapter4VargaChakras chart={chart} lang={lang} />

      {/* Part 5: Shadbala & Bhava Strengths (Pages 18-20) */}
      <Chapter5Shadbala chart={chart} lang={lang} />

      {/* Part 6: Ashtakavarga Master Computations (Pages 21-27) */}
      <Chapter6Ashtakavarga chart={chart} lang={lang} />

      {/* Part 7: Kuja Dosha Special Treatise (Pages 28-30) */}
      <Chapter7KujaDosha chart={chart} lang={lang} />

      {/* Part 8: Auspicious Yogas & Doshas (Pages 31-34) */}
      <Chapter8YogasDoshas chart={chart} lang={lang} />

      {/* Part 9: Ayurdaya & Longevity Determination (Pages 35-37) */}
      <Chapter9Ayurdaya chart={chart} lang={lang} />

      {/* Part 10: Vimshottari Dasha Master Timeline (Pages 38-42) */}
      <Chapter10DashaTimeline chart={chart} lang={lang} />

      {/* Part 11: 12 Houses Shastric Readings (Pages 43-46) */}
      <Chapter11BhavaPredictions chart={chart} lang={lang} />

      {/* Part 12: Transit & Compatibility (Pages 47-48) */}
      <Chapter12GocharaMatching chart={chart} lang={lang} />

      {/* Part 13: Bird Sastra & Numerology (Page 49) */}
      <Chapter13PanchaPakshiNama chart={chart} lang={lang} />

      {/* Part 14: Sacred Remedies & Auspicious Conclusion (Page 50) */}
      <Chapter14RemediesMangalam chart={chart} lang={lang} />
    </div>
  );
};
