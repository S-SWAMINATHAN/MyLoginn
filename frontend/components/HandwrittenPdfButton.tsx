"use client";

import React, { useState } from "react";
import { ChartResponse } from "@/lib/types";
import { Loader2, PenLine } from "lucide-react";
import { exportNodesToPdf, safeFileName } from "@/lib/pdfExport";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
}

/**
 * 50-page Sampoorana Jathagam manuscript → one A4 PDF.
 *
 * TWO CHANGES
 * -----------
 * 1. TABLE OF CONTENTS AS PAGE 2. The contents list only ever existed as an
 *    on-screen pop-over in app/page.tsx, so the downloaded book had none. The
 *    printed version (components/manuscript/ManuscriptTocPage.tsx) is rendered
 *    off-screen as #manuscript-toc-page and spliced in here, directly after
 *    the cover — giving cover → contents → pages 1..50 of the manuscript.
 *
 * 2. ALIGNMENT. Capture and placement moved to lib/pdfExport.ts, which fits
 *    each page to A4 preserving its aspect ratio instead of stretching it onto
 *    210×297 mm, and captures at 2× rather than 1.6×. See the comment block at
 *    the top of that file.
 *
 * One trap this button must avoid: HandwrittenManuscript injects a <style>
 * that hides all but one `.manuscript-page` when it renders the on-screen
 * single-page preview. A hidden node rasterises as a blank sheet, so only
 * pages with a real layout box are collected below.
 */
export const HandwrittenPdfButton: React.FC<Props> = ({ chart, lang }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  const handleDownload = async () => {
    const container = document.getElementById("handwritten-manuscript");
    if (!container) {
      alert(
        lang === "ta"
          ? "ஓலைச்சுவடி கிடைக்கவில்லை. பக்கத்தை புதுப்பிக்கவும்."
          : "Manuscript not found. Please refresh."
      );
      return;
    }

    const pages = Array.from(
      container.querySelectorAll<HTMLElement>(".manuscript-page")
    ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0);

    if (pages.length === 0) {
      alert(lang === "ta" ? "பக்கங்கள் கிடைக்கவில்லை." : "Pages not found.");
      return;
    }

    // Cover, then contents, then the rest of the manuscript.
    const toc = document.getElementById("manuscript-toc-page");
    const nodes: HTMLElement[] = toc ? [pages[0], toc, ...pages.slice(1)] : pages;

    try {
      setGenerating(true);
      setProgress(
        lang === "ta" ? "எழுத்துருக்கள் சரிபார்க்கப்படுகின்றன..." : "Preparing fonts..."
      );

      await exportNodesToPdf(
        nodes,
        `${safeFileName(chart.name)}_50_Page_Sampoorana_Jathagam_${chart.date_of_birth}.pdf`,
        {
          background: "#ffffff", // Bug 3: white PDF pages
          scale: 2,
          onProgress: (done, total) => {
            setProgress(
              lang === "ta"
                ? `பக்கம் ${Math.min(done + 1, total)} / ${total} தயாராகிறது...`
                : `Rendering page ${Math.min(done + 1, total)} of ${total}...`
            );
          },
        }
      );
    } catch (e: any) {
      console.error(e);
      alert(
        (lang === "ta" ? "PDF உருவாக்குவதில் பிழை: " : "Error generating PDF: ") +
          (e?.message || String(e))
      );
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="jat-chrome btn-primary text-xs disabled:opacity-60"
      title={
        lang === "ta"
          ? "56-பக்க மகா சம்பூர்ண ஜாதக நூல் PDF (பொருளடக்கத்துடன்)"
          : "56-Page Grand Horoscope Manuscript PDF (with contents page)"
      }
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
      <span>
        {generating
          ? progress || (lang === "ta" ? "தயாராகிறது..." : "Generating...")
          : lang === "ta"
          ? "56-பக்க ஜாதக நூல் PDF (மஞ்சள் பத்திரம்)"
          : "56-Page Grand Jathagam PDF"}
      </span>
    </button>
  );
};

export default HandwrittenPdfButton;