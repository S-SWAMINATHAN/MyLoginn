"use client";

import React, { useState } from "react";
import { ChartResponse } from "@/lib/astrology/types";
import { Loader2, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { captureNode, addCanvasToPdf, safeFileName } from "@/lib/astrology/pdfExport";
import { useJathagamTheme } from "@/lib/astrology/jathagamTheme";
import { requireUnlock } from "@/lib/astrology/paywall";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
}

/**
 * Downloads ONLY the #single-page-report node as a single A4 PDF page.
 *
 * Capture and placement live in lib/pdfExport.ts, shared with
 * HandwrittenPdfButton — see the comment block there for why the old
 * `pdf.addImage(img, "JPEG", 0, 0, 210, 297)` produced a stretched sheet.
 *
 * The page background is taken from the active theme so a dark-ink palette on
 * tinted paper doesn't end up with white gutters around the sheet.
 */
export const SinglePagePdfButton: React.FC<Props> = ({ chart, lang }) => {
  const [generating, setGenerating] = useState(false);
  const { palette } = useJathagamTheme();

  const handleDownload = async () => {
    if (!requireUnlock(() => { void handleDownload(); })) return;
    const el = document.getElementById("single-page-report");
    if (!el) {
      alert(lang === "ta" ? "அறிக்கை கிடைக்கவில்லை." : "Report not found.");
      return;
    }

    try {
      setGenerating(true);
      const canvas = await captureNode(el, { scale: 2, background: "#ffffff" }); // Bug 3
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      addCanvasToPdf(pdf, canvas, { background: "#ffffff" });
      pdf.save(`${safeFileName(chart.name)}_Single_Page_Jathagam_${chart.date_of_birth}.pdf`);
    } catch (e: any) {
      console.error(e);
      // The in-browser image capture can fail on some browsers/hosts (e.g. "Unable to find element in cloned iframe").
      // The browser's own print dialog always works: choose "Save as PDF" there.
      alert(
        lang === "ta"
          ? "தானியங்கி PDF உருவாக்க இயலவில்லை. திறக்கும் அச்சு சாளரத்தில் 'PDF ஆக சேமி' என்பதைத் தேர்ந்தெடுக்கவும்."
          : "Automatic PDF creation is not available here. In the print window that opens, choose \"Save as PDF\"."
      );
      window.print();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="jat-chrome btn-primary text-xs disabled:opacity-60"
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