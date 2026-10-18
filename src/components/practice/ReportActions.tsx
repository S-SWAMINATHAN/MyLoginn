"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PracticeReport } from "@/lib/practice/report";
import type { PdfMeta } from "@/lib/practice/reportPdf";

export function ReportActions({ report, meta, canDelete }: { report: PracticeReport; meta: PdfMeta; canDelete: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"pdf" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    if (busy) return;
    setBusy("pdf");
    setError(null);
    try {
      const { downloadReportPdf } = await import("@/lib/practice/reportPdf");
      await downloadReportPdf(report, meta);
    } catch {
      setError("The PDF could not be created. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (busy || !window.confirm("Delete this report permanently?")) return;
    setBusy("delete");
    const res = await fetch(`/api/practice/sessions/${meta.sessionId}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) { router.push("/practice/reports"); router.refresh(); return; }
    setError("The report could not be deleted. Please try again.");
    setBusy(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => void download()} disabled={busy !== null} icon={<Download className="h-4 w-4" />}>{busy === "pdf" ? "Preparing PDF…" : "Download PDF"}</Button>
      {canDelete ? <Button variant="cancel" onClick={() => void remove()} disabled={busy !== null} icon={<Trash2 className="h-4 w-4" />}>Delete</Button> : null}
      {error ? <p role="alert" className="w-full text-sm text-danger">{error}</p> : null}
    </div>
  );
}
