"use client";

import React from "react";
import { MANUSCRIPT_CHAPTERS, MANUSCRIPT_PAGES } from "@/lib/astrology/manuscriptIndex";

interface Props {
  lang: "ta" | "en";
}

/**
 * The printed பொருளடக்கம் / Table of Contents.
 *
 * The on-screen "Index of Contents" panel in app/page.tsx is a pop-over with
 * its own scrolling layout; it was never part of the manuscript DOM, which is
 * why the downloaded 50-page book had no contents page. This component is the
 * print counterpart: one A4 sheet, same palm-leaf frame as every other page,
 * rendered off-screen and inserted by HandwrittenPdfButton as PAGE 2 of the
 * PDF — directly after the cover.
 *
 * It is deliberately NOT given the `.manuscript-page` class. The exporter
 * collects pages by that class, and this sheet is positioned explicitly rather
 * than picked up in sequence, so an unmarked node cannot be double-counted or
 * land in the wrong place.
 *
 * Page numbers shown here are the manuscript's own 1–50 numbering. The TOC
 * sheet itself is unnumbered, exactly like a printed book's contents page.
 */
export const ManuscriptTocPage: React.FC<Props> = ({ lang }) => {
  // Two balanced columns of chapters (7 + 7).
  const left = MANUSCRIPT_CHAPTERS.slice(0, 7);
  const right = MANUSCRIPT_CHAPTERS.slice(7);

  const renderChapter = (ch: (typeof MANUSCRIPT_CHAPTERS)[number]) => {
    const pages = MANUSCRIPT_PAGES.filter((p) => p.page >= ch.startPage && p.page <= ch.endPage);
    return (
      <div
        key={ch.ch}
        style={{
          border: "1px solid rgba(170,130,10,0.35)",
          borderRadius: "8px",
          background: "#ffffff", // Bug 3
          padding: "5px 7px",
          marginBottom: "6px",
          breakInside: "avoid",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "6px",
            borderBottom: "1px solid rgba(170,130,10,0.25)",
            paddingBottom: "2px",
            marginBottom: "3px",
          }}
        >
          <span
            className="text-[#8e2b1c]"
            style={{ fontSize: "11px", lineHeight: "16px", fontWeight: 700 }}
          >
            {lang === "ta" ? `அத்தியாயம் ${ch.ch}` : `Chapter ${ch.ch}`} ·{" "}
            {lang === "ta" ? ch.titleTa : ch.titleEn}
          </span>
          <span
            className="text-[#6b1426]"
            style={{ fontSize: "9.5px", lineHeight: "14px", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            {lang === "ta" ? "பக்." : "pp."} {ch.startPage}–{ch.endPage}
          </span>
        </div>

        {pages.map((pg) => (
          <div
            key={pg.page}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              fontSize: "9.5px",
              lineHeight: "15px",
            }}
          >
            <span className="text-[#6f6049]" style={{ width: "20px", flexShrink: 0 }}>
              {pg.page}.
            </span>
            <span
              className="text-[#2b2117]"
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {lang === "ta" ? pg.titleTa : pg.titleEn}
            </span>
            <span
              className="text-[#aa820a]"
              style={{ flex: "1 1 auto", borderBottom: "1px dotted rgba(170,130,10,0.5)" }}
            />
            <span
              className="text-[#8e2b1c]"
              style={{ fontWeight: 700, flexShrink: 0, width: "18px", textAlign: "right" }}
            >
              {pg.page}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      id="manuscript-toc-page"
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        background: "#ffffff", // Bug 3: white contents page
        padding: "30px 34px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          border: "2px solid rgba(170,130,10,0.55)",
          borderRadius: "6px",
          padding: "16px 18px",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "2px solid rgba(170,130,10,0.4)",
            paddingBottom: "8px",
            marginBottom: "10px",
          }}
        >
          <div className="text-[#b03726]" style={{ fontSize: "13px", lineHeight: "20px", fontWeight: 700 }}>
            ௐ ॥ ஸ்ரீ ராமஜெயம் ॥
          </div>
          <div className="text-[#8e2b1c]" style={{ fontSize: "21px", lineHeight: "32px", fontWeight: 700 }}>
            {lang === "ta" ? "பொருளடக்கம்" : "Table of Contents"}
          </div>
          <div className="text-[#6f6049]" style={{ fontSize: "10px", lineHeight: "16px" }}>
            {lang === "ta"
              ? "50-பக்க சம்பூர்ண ஜாதக மகா காண்டம் · 14 அத்தியாயங்கள்"
              : "50-Page Sampoorana Jathagam · 14 Chapters"}
          </div>
        </div>

        {/* Two columns */}
        <div style={{ display: "flex", gap: "12px", flex: "1 1 auto", minHeight: 0 }}>
          <div style={{ width: "50%" }}>{left.map(renderChapter)}</div>
          <div style={{ width: "50%" }}>{right.map(renderChapter)}</div>
        </div>

        <div
          className="text-[#6f6049]"
          style={{
            borderTop: "1px solid rgba(170,130,10,0.3)",
            paddingTop: "6px",
            marginTop: "6px",
            textAlign: "center",
            fontSize: "9px",
            lineHeight: "14px",
          }}
        >
          {lang === "ta"
            ? "— பொருளடக்கம் / Table of Contents —"
            : "— Table of Contents —"}
        </div>
      </div>
    </div>
  );
};

export default ManuscriptTocPage;