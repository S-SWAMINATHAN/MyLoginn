"use client";

// Print-quality PDF (WeasyPrint) with PREVIEW before download.
// Sends the current colour / Tamil-style panel choice (palette + typeface) with
// the request, so the printed PDF uses exactly the colours and font on screen.
import React, { useEffect, useState } from "react";
import { useJathagamTheme } from "@/lib/jathagamTheme";
import { JathagamThemePanel } from "@/components/JathagamThemePanel";
import { PaperPicker } from "@/components/kalai/ReportOptions";
import { birthForLang } from "@/lib/taText";
import type { PaperSize } from "@/lib/pdfExport";

type Lang = "ta" | "en";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

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
  const [god, setGod] = useState<"ganesha" | "murugan" | "om">("ganesha");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    if (url && !busy) void preview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette.id, palette.paper, font.id, god, paper, JSON.stringify(body)]);

  const preview = async () => {
    setBusy(true); setErr(null);
    try {
      const theme = {
        ink: palette.ink, inkSoft: palette.inkSoft, accent: palette.accent, accentDeep: palette.accentDeep,
        gold: palette.gold, paper: palette.paper, paperCard: palette.paperCard, fontId: font.id,
      };
      const res = await fetch(`${API_BASE}/api/pdf/${path}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        // Tamil page: parents' / family names in Tamil, so the PDF has no English words
        body: JSON.stringify({
          ...body,
          ...(body.birth ? { birth: birthForLang(body.birth as Record<string, unknown>, lang) } : {}),
          ...(paper ? { page_size: paper } : {}),
          language: lang, god_image: god, theme,
        }),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); msg = typeof j.detail === "string" ? j.detail : msg; } catch { /* not JSON */ }
        throw new Error(msg);
      }
      const blob = await res.blob();
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div className="jat-chrome no-print story-panel space-y-4 rounded-3xl p-5 sm:p-6">
      <JathagamThemePanel lang={lang} />
      {paper && onPaper && <PaperPicker value={paper} onChange={onPaper} lang={lang} />}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <label className="flex items-center gap-2 text-sm text-foreground">{lang === "ta" ? "முகப்புப் படம்" : "Cover picture"}
          <select className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground" value={god}
            onChange={(e) => setGod(e.target.value as "ganesha" | "murugan" | "om")}>
            <option value="ganesha">{lang === "ta" ? "விநாயகர்" : "Ganesha"}</option>
            <option value="murugan">{lang === "ta" ? "முருகன்" : "Murugan"}</option>
            <option value="om">{lang === "ta" ? "ஓம்" : "Om"}</option>
          </select>
        </label>
        <button type="button" disabled={!ready || busy} onClick={preview}
          className="rounded-xl brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-50">
          {busy ? "…" : (lang === "ta" ? "அச்சு PDF முன்னோட்டம்" : "Preview print PDF")}
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
                {lang === "ta" ? "பதிவிறக்கு" : "Download"}
              </button>
              <button type="button" onClick={() => setUrl(null)} className="rounded-xl border border-line bg-surface px-5 py-2 text-sm font-semibold text-foreground">
                {lang === "ta" ? "மூடு" : "Close"}
              </button>
            </div>
          </div>
          <iframe title="PDF preview" src={url} className="h-[80vh] w-full rounded-b-2xl border border-line bg-white" />
        </div>
      )}
    </div>
  );
}

export default PrintPdfControls;
