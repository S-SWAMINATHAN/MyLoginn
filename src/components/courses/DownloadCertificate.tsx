"use client";

import { useState, type FormEvent } from "react";
import { Download } from "lucide-react";
import type { CertificateStyle } from "@/lib/createCourseCertificatePdf";

export function DownloadCertificate({ courseSlug, courseTitle }: { courseSlug: string; courseTitle: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [style, setStyle] = useState<CertificateStyle>("classic-seal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/certificate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, style }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Could not create your certificate.");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filename = disposition?.match(/filename="([^"]+)"/)?.[1] || `${courseTitle}_${firstName}_${lastName}.pdf`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create your certificate.");
    } finally { setBusy(false); }
  }

  return <form onSubmit={download} className="mt-4 border-t border-border-soft pt-4" aria-label={`Download ${courseTitle} certificate`}>
    <label className="mb-3 block text-xs font-semibold">Choose a certificate style
      <select value={style} onChange={(event) => setStyle(event.target.value as CertificateStyle)} className="mt-1.5 block w-full rounded-lg border border-border-soft bg-surface px-3 py-2.5 text-sm font-medium outline-none focus:border-brand-500">
        <option value="classic-seal">Classic verified seal</option>
        <option value="navy-ribbon">Navy band with QR code</option>
        <option value="lavender-modern">Modern lavender</option>
      </select>
    </label>
    <p className="mb-2 text-xs font-semibold">Certificate name</p>
    <div className="flex flex-wrap gap-2">
      <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required maxLength={60} autoComplete="given-name" placeholder="First name" aria-label="Certificate first name" className="min-w-0 flex-1 rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500" />
      <input value={lastName} onChange={(event) => setLastName(event.target.value)} required maxLength={60} autoComplete="family-name" placeholder="Last name" aria-label="Certificate last name" className="min-w-0 flex-1 rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500" />
      <button type="submit" disabled={busy || !firstName.trim() || !lastName.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />{busy ? "Preparing…" : "Download PDF"}</button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
  </form>;
}
