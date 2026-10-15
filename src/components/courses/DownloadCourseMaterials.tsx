"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { downloadCourseMaterialPdf, type CourseMaterial } from "@/lib/createCourseMaterialPdf";

/** Enrolled learners download the whole course (every module and lesson) as one PDF study guide. */
export function DownloadCourseMaterials({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(slug)}/materials`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The course materials could not be prepared.");
      let logoData = "";
      try {
        const logo = await fetch("/myloginn-logo.png");
        if (logo.ok) {
          const bytes = new Uint8Array(await logo.arrayBuffer());
          let binary = "";
          for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
          logoData = `data:image/png;base64,${btoa(binary)}`;
        }
      } catch {
        // The PDF is still useful without the logo.
      }
      await downloadCourseMaterialPdf(payload as CourseMaterial, logoData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The course materials could not be prepared.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={download} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-100 disabled:cursor-wait disabled:opacity-60">
        <FileDown className="h-4 w-4" aria-hidden="true" />{busy ? "Preparing course PDF…" : "Download course materials (PDF)"}
      </button>
      {error && <p role="alert" className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
