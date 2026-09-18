"use client";

import React, { useState } from "react";
import { ChartResponse } from "@/lib/types";
import { Loader2, FileDown } from "lucide-react";
import { captureNode, addCanvasToPdf, safeFileName } from "@/lib/pdfExport";
import jsPDF from "jspdf";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
}

/**
 * Downloads ONLY the #single-page-report node as a single A4 PDF page.
 *
 * All the capture/placement logic now lives in lib/pdfExport.ts, shared with
 * HandwrittenPdfButton — see the long comment at the top of that file for why
 * the old `pdf.addImage(img, "JPEG", 0, 0, 210, 297)` and html2canvas' missing
 * CSS Grid support were producing the misaligned output.
 *
 * Still deliberately separate from <HandwrittenPdfButton>: that one walks every
 * `.manuscript-page` and always produces the 50-page book.
 */
export const SinglePagePdfButton: React.FC<Props> = ({ chart, lang }) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    const el = document.getElementById("single-page-report");
    if (!el) {
      alert(lang === "ta" ? "அறிக்கை கிடைக்கவில்லை." : "Report not found.");
      return;
    }

    try {
      setGenerating(true);
      const canvas = await captureNode(el, { pixelRatio: 2, background: "#fdf6e3" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      addCanvasToPdf(pdf, canvas, { background: "#fdf6e3" });
      pdf.save(`${safeFileName(chart.name)}_Single_Page_Jathagam_${chart.date_of_birth}.pdf`);
    } catch (e: any) {
      console.error(e);
      alert(
        (lang === "ta" ? "PDF உருவாக்குவதில் பிழை: " : "Error generating PDF: ") +
          (e?.message || String(e))
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all disabled:opacity-60 shadow-lg"
      style={{ background: "#1a0f0a", border: "2px solid rgba(255,215,0,0.7)", color: "#ffd700" }}
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      <span>
        {generating
          ? lang === "ta"
            ? "தயாராகிறது..."
            : "Generating..."
          : lang === "ta"
          ? "ஒரு பக்க PDF பதிவிறக்கம்"
          : "Download Single-Page PDF"}
      </span>
    </button>
  );
};

export default SinglePagePdfButton;