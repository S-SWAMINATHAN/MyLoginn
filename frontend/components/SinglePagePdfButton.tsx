"use client";

import React, { useState } from "react";
import { ChartResponse } from "@/lib/types";
import { Loader2, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
}

/**
 * Downloads ONLY the #single-page-report node as a single A4 PDF page.
 * Deliberately separate from <HandwrittenPdfButton>, which walks every
 * `.manuscript-page` inside #handwritten-manuscript and always produces the
 * 50-page book — using that button here was the reason "Single Page" was
 * still producing the full multi-page output.
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

      // @ts-ignore
      if (document.fonts && document.fonts.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#fdf6e3",
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

      const fileName = `${chart.name.replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_")}_Single_Page_Jathagam_${chart.date_of_birth}.pdf`;
      pdf.save(fileName);
    } catch (e: any) {
      console.error(e);
      alert((lang === "ta" ? "PDF உருவாக்குவதில் பிழை: " : "Error generating PDF: ") + (e.message || e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="px-4 py-2 bg-[#1a0f0a] border-2 border-[#ffd700]/70 hover:border-[#ffd700] rounded-xl text-xs font-bold text-[#ffd700] flex items-center gap-2 hover:bg-[#2b170c] transition-all disabled:opacity-60 shadow-lg"
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      <span>
        {generating
          ? lang === "ta" ? "தயாராகிறது..." : "Generating..."
          : lang === "ta" ? "ஒரு பக்க PDF பதிவிறக்கம்" : "Download Single-Page PDF"}
      </span>
    </button>
  );
};