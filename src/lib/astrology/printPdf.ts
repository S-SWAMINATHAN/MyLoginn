"use client";

import { ASTRO_API } from "@/lib/astrology/routes";
import { requireUnlock } from "@/lib/astrology/paywall";

/** Print-quality PDF from the backend (WeasyPrint, A4, ivory paper, page numbers). */
export async function downloadPrintPdf(path: string, body: unknown, filename: string, setBusy: (b: boolean) => void, setErr: (s: string | null) => void) {
  if (!requireUnlock()) return;
  setBusy(true);
  setErr(null);
  try {
    const res = await fetch(`${ASTRO_API}/pdf/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = typeof j.detail === "string" ? j.detail : msg; } catch { /* not JSON */ }
      throw new Error(msg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) {
    setErr(e instanceof Error ? e.message : String(e));
  } finally {
    setBusy(false);
  }
}
