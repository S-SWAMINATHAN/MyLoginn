"use client";

import React from "react";
import { useChartStyle, NorthMiniChart, STYLE_LABEL } from "./StyledMiniChart";

interface PageWrapperProps {
  pageNumber: number;
  chapterTitleTa: string;
  chapterTitleEn: string;
  pageTitleTa: string;
  pageTitleEn: string;
  children: React.ReactNode;
  lang?: "ta" | "en";
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  pageNumber,
  chapterTitleTa,
  chapterTitleEn,
  pageTitleTa,
  pageTitleEn,
  children,
  lang = "ta",
}) => {
  return (
    <div className="manuscript-page" data-page={pageNumber}>
      {/* Palm leaf aging stains */}
      <div className="palm-stain" style={{ width: 160, height: 160, top: 40, right: 30 }} />
      <div className="palm-stain" style={{ width: 140, height: 140, bottom: 50, left: 25 }} />

      <div
        className="manuscript-inner flex flex-col justify-between h-full"
        style={{ minHeight: "1123px", maxHeight: "1123px", boxSizing: "border-box" }}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between border-b border-[#aa820a]/40 pb-1.5 mb-2">
            <div className="flex items-center gap-2 text-[#6b1426] text-xs font-bold font-cinzel">
              <span className="text-[#b03726] text-sm">ௐ</span>
              <span>॥ ஸ்ரீ ராமஜெயம் ॥</span>
            </div>
            <div className="text-[10px] tracking-wider text-[#6b1426]/90 font-semibold font-cinzel">
              {lang === "ta" ? chapterTitleTa : chapterTitleEn}
            </div>
            <div className="text-[10px] text-[#8e2b1c] font-bold border border-[#aa820a]/40 bg-[#fffaf0] px-2 py-0.5 rounded-full font-cinzel">
              {lang === "ta" ? `பக்கம் ${pageNumber} / 50` : `Page ${pageNumber} of 50`}
            </div>
          </div>

          {/* Page Title Plaque */}
          <div className="text-center mb-2.5">
            <h2
              className="text-[17px] font-bold text-[#8e2b1c] leading-tight tracking-wide"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              {lang === "ta" ? pageTitleTa : pageTitleEn}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#aa820a] text-[10px] mt-0.5">
              <span>❧</span>
              <span className="h-px w-10 bg-[#aa820a]/40" />
              <span className="text-[#6b1426] font-cinzel text-[9px] uppercase tracking-widest">
                {lang === "ta" ? "ஸ்ரீ வேத சம்பூர்ண ஜாதக பிரபந்தம்" : "Sri Veda Sampoorana Horoscope Treatise"}
              </span>
              <span className="h-px w-10 bg-[#aa820a]/40" />
              <span>❧</span>
            </div>
          </div>
        </div>

        {/* Page Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col justify-start text-[#2b2117]">
          {children}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-[#aa820a]/30 pt-1.5 mt-2 flex items-center justify-between text-[9px] text-[#6f6049] font-cinzel">
          <div className="flex items-center gap-1.5">
            <span className="text-[#aa820a]">✦</span>
            <span>வாழ்க வளமுடன் • சுபமஸ்து • நலம் பெருகுக</span>
          </div>
          <div className="font-mono text-[#8e2b1c] font-bold">
            {lang === "ta" ? `— பக்கம் ${pageNumber} / 50 —` : `— Page ${pageNumber} / 50 —`}
          </div>
          <div className="flex items-center gap-1.5">
            <span>MYLoginn Shastric Astrology</span>
            <span className="text-[#aa820a]">✦</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// South Indian 12-box Kattam renderer for divisional & birth charts
export const MiniSouthIndianChart: React.FC<{
  title: string;
  titleTa: string;
  subTitleTa?: string;
  planetsBySign: Record<number, Array<{ name: string; symbol: string }>>;
  highlightLagnaSign?: number;
}> = ({ title, titleTa, subTitleTa, planetsBySign, highlightLagnaSign }) => {
  // Follows the chart style chosen on the form (see StyledMiniChart.tsx).
  // Every one of the 14 varga charts goes through here, so this single branch
  // is what makes the whole manuscript — and therefore its PDF and print —
  // honour Kerala / North Indian.
  const chartStyle = useChartStyle();

  // Standard South Indian 4x4 clockwise grid (signs 1-12)
  // Row 0: 12 (Pisces), 1 (Aries), 2 (Taurus), 3 (Gemini)
  // Row 1: 11 (Aquarius), [CENTER 2x2], 4 (Cancer)
  // Row 2: 10 (Capricorn), [CENTER 2x2], 5 (Leo)
  // Row 3: 9 (Sagittarius), 8 (Scorpio), 7 (Libra), 6 (Virgo)

  const getSignContent = (signNum: number) => {
    const list = planetsBySign[signNum] || [];
    const isLagna = highlightLagnaSign === signNum;
    return (
      <div className="h-full w-full flex flex-col justify-start items-center p-0.5 text-[9px] leading-tight overflow-hidden">
        {isLagna && (
          <span className="bg-[#8e2b1c] text-white text-[7px] font-bold px-1 rounded-sm leading-none mb-0.5">
            லக்னம்
          </span>
        )}
        <div className="flex flex-wrap gap-0.5 justify-center items-center font-bold text-[#3a1a0f]">
          {list.map((p, idx) => (
            <span
              key={idx}
              className={`px-0.5 rounded ${
                p.symbol === "லக்"
                  ? "bg-[#8e2b1c] text-[#ffd700]"
                  : "bg-[#fffaf0] border border-[#aa820a]/30 text-[#6b1426]"
              }`}
            >
              {p.symbol || p.name.slice(0, 2)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-[#8b5a2b] bg-[#fffaf0]/95 rounded-lg p-1.5 shadow-sm">
      <div className="text-center font-bold text-[#6b1426] text-[11px] mb-1 leading-none">
        {titleTa} <span className="text-[9px] text-[#aa820a] font-normal">({title})</span>
      </div>
      {subTitleTa && (
        <div className="text-center text-[8px] text-[#6f6049] mb-1 italic leading-none">
          {subTitleTa}
        </div>
      )}
      {chartStyle === "north_indian" ? (
        <NorthMiniChart
          planetsBySign={planetsBySign}
          lagnaSign={highlightLagnaSign}
          centreTitle={titleTa}
          height={155}
        />
      ) : (
      <div className="grid grid-cols-4 grid-rows-4 border border-[#8b5a2b] w-full h-[155px] text-center bg-[#fff8ee]">
        {/* Row 0 */}
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(12)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(1)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(2)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(3)}</div>

        {/* Row 1 */}
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(11)}</div>
        <div className="col-span-2 row-span-2 border border-[#8b5a2b] bg-[#fdf6e3] flex flex-col items-center justify-center p-1">
          <span className="text-[10px] font-bold text-[#8e2b1c] leading-tight font-cinzel">
            {titleTa}
          </span>
          <span className="text-[7px] text-[#aa820a] tracking-widest mt-0.5 font-cinzel">
            ॥ சுபம் ॥
          </span>
        </div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(4)}</div>

        {/* Row 2 */}
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(10)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(5)}</div>

        {/* Row 3 */}
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(9)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(8)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(7)}</div>
        <div className="border border-[#aa820a]/50 p-0.5">{getSignContent(6)}</div>
      </div>
      )}
      {chartStyle !== "tamil" && (
        <div className="text-center text-[8px] text-[#6f6049] mt-1 leading-none">
          {STYLE_LABEL[chartStyle].ta} · {STYLE_LABEL[chartStyle].en}
        </div>
      )}
    </div>
  );
};
