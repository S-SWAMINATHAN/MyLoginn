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
 * 50-page Sampoorana Jathagam manuscript → one A4 PDF, one `.manuscript-page`
 * per PDF page.
 *
 * WHAT WAS WRONG (same two faults as the single-page export):
 *  1. Every page was pasted with `pdf.addImage(img, "JPEG", 0, 0, 210, 297)`,
 *     stretching each captured bitmap onto A4 regardless of its real aspect
 *     ratio — so text, chart boxes and table rules all drifted.
 *  2. The capture itself was html2canvas at scale 1.6. html2canvas 1.4.x has
 *     no CSS Grid implementation and only partial flexbox, and the manuscript
 *     chapters lean heavily on Tailwind `grid`/`flex`/`gap`. Grid children
 *     collapsed into a stack, which is why tables, charts and symbols landed
 *     on top of each other in the download but looked fine on screen.
 *
 * Both are fixed in lib/pdfExport.ts: capture now goes through an SVG
 * <foreignObject> (the browser's own layout engine draws the page, so grid,
 * flex, gap, shadows and oklch() colours all survive), and placement fits each
 * page to A4 preserving aspect ratio. No chapter component was modified.
 *
 * There is also a hidden trap this button must avoid: HandwrittenManuscript
 * injects a <style> block that sets
 *     #manuscript-preview-container .manuscript-page { display: none }
 * when it is rendering the on-screen single-page preview. A hidden node
 * rasterises as a blank page, so we filter those out below and export only
 * the pages that are actually laid out.
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

    // Only pages that are genuinely laid out (see the note above about the
    // preview container's display:none rule).
    const pages = Array.from(
      container.querySelectorAll<HTMLElement>(".manuscript-page")
    ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0);

    if (pages.length === 0) {
      alert(lang === "ta" ? "பக்கங்கள் கிடைக்கவில்லை." : "Pages not found.");
      return;
    }

    try {
      setGenerating(true);
      setProgress(
        lang === "ta" ? "எழுத்துருக்கள் சரிபார்க்கப்படுகின்றன..." : "Preparing fonts..."
      );

      await exportNodesToPdf(
        pages,
        `${safeFileName(chart.name)}_50_Page_Sampoorana_Jathagam_${chart.date_of_birth}.pdf`,
        {
          background: "#fdf6e3",
          pixelRatio: 2,
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
      className="px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all disabled:opacity-60 shadow-lg"
      style={{ background: "#1a0f0a", border: "2px solid rgba(255,215,0,0.7)", color: "#ffd700" }}
      title={
        lang === "ta"
          ? "50-பக்க மகா சம்பூர்ண ஜாதக நூல் PDF"
          : "50-Page Grand Horoscope Manuscript PDF"
      }
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
      <span>
        {generating
          ? progress || (lang === "ta" ? "தயாராகிறது..." : "Generating...")
          : lang === "ta"
          ? "50-பக்க ஜாதக நூல் PDF (மஞ்சள் பத்திரம்)"
          : "50-Page Grand Jathagam PDF"}
      </span>
    </button>
  );
};

export default HandwrittenPdfButton;