"use client";

import { useRef, useState } from "react";
import { CircleCheck, FileImage, FileText, LoaderCircle, TriangleAlert } from "lucide-react";
import type { CertificateData, ExportFormat, TemplateId } from "@/types/certificate";
import { exportCertificate } from "@/lib/certificate/export";
import { getTemplate } from "./templates";
import { ScaledCertificate } from "./ScaledCertificate";

/**
 * Full-size preview of the chosen template plus the download engine. The preview's inner page is
 * laid out at true A4 size (1123 × 794 CSS px) and only visually scaled, so the export captures the
 * same layout pixel for pixel, at 300 DPI.
 */
export function CertificateRenderer({ data, templateId }: { data: CertificateData; templateId: TemplateId }) {
  const page = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const Template = getTemplate(templateId).component;

  async function download(format: ExportFormat) {
    if (!page.current || busy) return;
    setBusy(format); setStatus(null);
    try {
      await exportCertificate(page.current, data, format);
      setStatus({ ok: true, text: format === "pdf" ? "PDF downloaded (A4 landscape, 300 DPI)." : "PNG downloaded (3508 × 2480 px)." });
    } catch (error) {
      console.error("[certificate] export failed", error);
      setStatus({ ok: false, text: "The download could not be created. Please try again, or use a different browser." });
    } finally {
      setBusy(null);
    }
  }

  const button = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60";
  return (
    <div>
      <div className="overflow-hidden rounded-2xl shadow-2xl shadow-story-navy/20 ring-1 ring-black/5">
        <ScaledCertificate pageRef={page}><Template data={data} /></ScaledCertificate>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">A4 landscape · 297 × 210 mm · print-ready 300 DPI</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => download("pdf")} disabled={busy !== null} className={`${button} bg-story-royal text-white hover:opacity-90`}>
            {busy === "pdf" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />}
            {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button type="button" onClick={() => download("png")} disabled={busy !== null} className={`${button} border border-border-soft bg-surface text-story-navy hover:bg-story-mist`}>
            {busy === "png" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <FileImage className="h-4 w-4" aria-hidden />}
            {busy === "png" ? "Preparing PNG…" : "Download PNG"}
          </button>
        </div>
      </div>
      <div aria-live="polite" className="min-h-6">
        {status && (
          <p className={`mt-3 flex items-center gap-1.5 text-sm ${status.ok ? "text-success" : "text-danger"}`}>
            {status.ok ? <CircleCheck className="h-4 w-4" aria-hidden /> : <TriangleAlert className="h-4 w-4" aria-hidden />}{status.text}
          </p>
        )}
      </div>
    </div>
  );
}
