"use client";

// Print-quality PDF (WeasyPrint) with PREVIEW before download.
// Sends the current colour / Tamil-style panel choice (palette + typeface) with
// the request, so the printed PDF uses exactly the colours and font on screen.
import React, { useEffect, useRef, useState } from "react";
import { useJathagamTheme } from "@/lib/astrology/jathagamTheme";
import { JathagamThemePanel } from "@/components/astrology/JathagamThemePanel";
import { Eye, Loader2, Printer } from "lucide-react";
import { ASTRO_API } from "@/lib/astrology/routes";
import { requireUnlock } from "@/lib/astrology/paywall";
import { birthForLang } from "@/lib/astrology/taText";
import type { PaperSize } from "@/lib/astrology/pdfExport";

type Lang = "ta" | "en";
const API_BASE = ASTRO_API;

export function PrintPdfControls({ path, body, filename, lang, ready, paper, onPaper }: {
  path: "kanitha" | "kp" | "kp-horary" | "porutham" | "baby-names";
  body: Record<string, unknown>;
  filename: string;
  lang: Lang;
  ready: boolean;
  /** Full / custom Kanitha and KP: A4 or A5 sheet (shared with the normal PDF button). */
  paper?: PaperSize;
  onPaper?: (p: PaperSize) => void;
}) {
  const { palette, font } = useJathagamTheme();
  const ta = lang === "ta";
  const [god, setGod] = useState<"ganesha" | "murugan" | "om">("ganesha");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  // True when the server has no PDF engine (e.g. Vercel) and returned the print-ready page: the browser prints it to PDF.
  const [printable, setPrintable] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    if (url && !busy) void preview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette.id, palette.paper, font.id, god, paper, JSON.stringify(body)]);

  const preview = async () => {
    if (!requireUnlock()) return;
    setBusy(true); setErr(null);
    try {
      const theme = {
        ink: palette.ink, inkSoft: palette.inkSoft, accent: palette.accent, accentDeep: palette.accentDeep,
        gold: palette.gold, paper: palette.paper, paperCard: palette.paperCard, fontId: font.id,
      };
      const init: RequestInit = {
        method: "POST", headers: { "Content-Type": "application/json" },
        // Tamil page: parents' / family names in Tamil, so the PDF has no English words
        body: JSON.stringify({
          ...body,
          ...(body.birth ? { birth: birthForLang(body.birth as Record<string, unknown>, lang) } : {}),
          ...(paper ? { page_size: paper } : {}),
          language: lang, god_image: god, theme,
        }),
      };
      let res = await fetch(`${API_BASE}/pdf/${path}`, init);
      let asPage = false;
      if (res.status === 503) { // no PDF engine on the server: ask for the print-ready page instead
        res = await fetch(`${API_BASE}/pdf/${path}?format=html`, init);
        asPage = true;
      }
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); msg = typeof j.detail === "string" ? j.detail : msg; } catch { /* not JSON */ }
        throw new Error(msg);
      }
      let blob = await res.blob();
      if (asPage) {
        // blob: documents have no base URL, so point relative asset links (/astrology/pdf/...) at this site.
        const page = (await blob.text()).replace(/<head>/i, `<head><base href="${window.location.origin}/">`);
        blob = new Blob([page], { type: "text/html;charset=utf-8" });
      }
      if (url) URL.revokeObjectURL(url);
      setPrintable(asPage);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!url || !requireUnlock()) return;
    if (printable) { // choose "Save as PDF" in the print dialog
      frameRef.current?.contentWindow?.focus();
      frameRef.current?.contentWindow?.print();
      return;
    }
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div className="jat-chrome no-print story-panel space-y-4 rounded-3xl p-5 sm:p-6">
      <JathagamThemePanel lang={lang} />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-border-soft bg-surface-2/40 px-3 py-2.5 sm:px-4">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: "var(--brand-600)" }}>
            <Printer className="h-4 w-4" />
          </span>
          <span className="whitespace-nowrap">{ta ? "அச்சு PDF" : "Print PDF"}</span>
        </span>

        {paper && onPaper && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs font-semibold text-muted">{ta ? "தாள்" : "Paper"}</span>
            <div role="radiogroup" className="flex rounded-xl bg-surface-2 p-0.5">
              {(["A4", "A5"] as PaperSize[]).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={paper === v} onClick={() => onPaper(v)}
                  title={v === "A4" ? "210 × 297 mm" : "148 × 210 mm"}
                  className={`rounded-[10px] px-3.5 py-1.5 text-xs font-bold transition-all ${paper === v ? "bg-brand-600 text-white shadow-sm" : "text-muted hover:text-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs font-semibold text-muted">{ta ? "முகப்பு" : "Cover"}</span>
          <div role="radiogroup" className="flex gap-1.5">
            {([
              { v: "ganesha" as const, ta: "விநாயகர்", en: "Ganesha" },
              { v: "murugan" as const, ta: "முருகன்", en: "Murugan" },
              { v: "om" as const, ta: "ஓம்", en: "Om" },
            ]).map((o) => {
              const on = god === o.v;
              return (
                <button key={o.v} type="button" role="radio" aria-checked={on} onClick={() => setGod(o.v)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border py-1 pl-1.5 pr-2.5 text-xs font-semibold transition-all ${on ? "border-brand-500 bg-brand-500/10 text-brand-fg ring-1 ring-brand-500/30" : "border-line bg-surface text-foreground hover:border-brand-400"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/astrology/deity/${o.v}.png`} alt="" className="h-6 w-6 object-contain" />
                  {ta ? o.ta : o.en}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" disabled={!ready || busy} onClick={preview}
          className="ml-auto inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--brand-600)" }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          {busy ? (ta ? "தயாராகிறது…" : "Preparing…") : (ta ? "அச்சு PDF முன்னோட்டம்" : "Preview print PDF")}
        </button>
      </div>
      {err && <p className="text-center text-sm text-red-500">{err}</p>}

      {url && (
        <div className="space-y-2" role="region" aria-label="PDF preview">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-line bg-surface px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              {lang === "ta"
                ? "முன்னோட்டம் — மேலே வண்ணம் / எழுத்துருவை மாற்றினால் தானாகப் புதுப்பிக்கப்படும்"
                : "Preview — changing the colour / typeface above refreshes it automatically"}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={download} className="rounded-xl brand-gradient-bg px-5 py-2 text-sm font-semibold text-white">
                {printable ? (lang === "ta" ? "அச்சிடு / PDF சேமி" : "Print / Save as PDF") : (lang === "ta" ? "பதிவிறக்கு" : "Download")}
              </button>
              <button type="button" onClick={() => setUrl(null)} className="rounded-xl border border-line bg-surface px-5 py-2 text-sm font-semibold text-foreground">
                {lang === "ta" ? "மூடு" : "Close"}
              </button>
            </div>
          </div>
          <iframe ref={frameRef} title="PDF preview" src={url} className="h-[80vh] w-full rounded-b-2xl border border-line bg-white" />
        </div>
      )}
    </div>
  );
}

export default PrintPdfControls;
