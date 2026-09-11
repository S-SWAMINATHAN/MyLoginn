"use client";

import React, { useState } from "react";
import { ChartResponse } from "@/lib/types";
import { Loader2, PenLine, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
}

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

    const pages = container.querySelectorAll<HTMLElement>(".manuscript-page");
    if (!pages || pages.length === 0) {
      alert(lang === "ta" ? "பக்கங்கள் கிடைக்கவில்லை." : "Pages not found.");
      return;
    }

    try {
      setGenerating(true);
      setProgress(lang === "ta" ? "எழுத்துருக்கள் சரிபார்க்கப்படுகின்றன..." : "Preparing fonts...");

      // Wait for fonts
      // @ts-ignore
      if (document.fonts && document.fonts.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 400));

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        const pageEl = pages[i];
        setProgress(
          lang === "ta"
            ? `பக்கம் ${i + 1} / ${totalPages} தயாராகிறது...`
            : `Rendering page ${i + 1} of ${totalPages}...`
        );

        const canvas = await html2canvas(pageEl, {
          scale: 1.6,
          backgroundColor: "#fdf6e3",
          useCORS: true,
          allowTaint: true,
          logging: false,
          windowWidth: 794,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.90);

        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }

        // Full A4 page coverage: 210mm x 297mm
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

        // Small yield to allow UI repaint and garbage collection
        await new Promise((r) => setTimeout(r, 40));
      }

      setProgress(lang === "ta" ? "PDF கோப்பு சேமிக்கப்படுகிறது..." : "Saving PDF file...");
      const fileName = `${chart.name.replace(
        /[^a-zA-Z0-9\u0B80-\u0BFF]/g,
        "_"
      )}_50_Page_Sampoorana_Jathagam_${chart.date_of_birth}.pdf`;
      pdf.save(fileName);
    } catch (e: any) {
      console.error(e);
      alert(
        (lang === "ta" ? "PDF உருவாக்குவதில் பிழை: " : "Error generating PDF: ") +
          (e.message || e)
      );
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={generating}
        className="px-4 py-2 bg-[#1a0f0a] border-2 border-[#ffd700]/70 hover:border-[#ffd700] rounded-xl text-xs font-bold text-[#ffd700] flex items-center gap-2 hover:bg-[#2b170c] transition-all disabled:opacity-60 shadow-lg"
        title={lang === "ta" ? "50-பக்க மகா சம்பூர்ண ஜாதக நூல் PDF" : "50-Page Grand Horoscope Manuscript PDF"}
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#ffd700]" />
        ) : (
          <PenLine className="w-4 h-4 text-[#ffd700]" />
        )}
        <span>
          {generating
            ? progress || (lang === "ta" ? "தயாராகிறது..." : "Generating...")
            : lang === "ta"
            ? "50-பக்க ஜாதக நூல் PDF (மஞ்சள் பத்திரம்)"
            : "50-Page Grand Jathagam PDF"}
        </span>
      </button>
    </div>
  );
};

