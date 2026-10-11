"use client";

/**
 * Viewer around a generated report (kalai / KP): zoom in / out, page-by-page
 * navigation, single-page or continuous scrolling, and full screen.
 *
 * It only wraps the report — the report DOM is untouched, so the PDF export
 * (which rasterises the `.kalai-page` nodes) still works: the CSS in
 * astrology.css switches zoom / hidden pages / the scroll box off while
 * `html.pdf-export` is set and when printing.
 *
 * Zoom uses CSS `zoom`, i.e. browser-style zoom: text and tables get bigger or
 * smaller and the layout reflows to the width of the viewer, so it stays
 * readable on a phone and never needs sideways scrolling.
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Download,
  Loader2,
  Lock,
  Palette,
  X,
  RotateCcw,
  Rows3,
  Square,
} from "lucide-react";
import { JathagamThemePanel } from "@/components/astrology/JathagamThemePanel";
import { openUnlockModal, usePaywall } from "@/lib/astrology/paywall";

const MIN = 0.5;
const MAX = 2;
const STEP = 0.1;
const clamp = (z: number) => Math.min(MAX, Math.max(MIN, Math.round(z * 100) / 100));

export const ReportViewer: React.FC<{
  lang: "ta" | "en";
  /**
   * Free preview: until the report is paid for, only the first `freePages` pages
   * can be viewed. Leave undefined for reports that are not page-limited
   * (the single-page sheet).
   */
  freePages?: number;
  children: React.ReactNode;
}> = ({ lang, freePages, children }) => {
  const ta = lang === "ta";
  const { unlocked } = usePaywall();
  const limited = freePages !== undefined && !unlocked;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [single, setSingle] = useState(false);
  const [count, setCount] = useState(0);
  const [cur, setCur] = useState(0); // 0-based
  const [design, setDesignState] = useState(false);
  // Opening / closing the design drawer re-flows the report (it makes room for the
  // drawer). Remember where the current page sits so the same spot is restored.
  const anchor = useRef<{ el: HTMLElement; off: number } | null>(null);
  const [typed, setTyped] = useState<string | null>(null);
  // The report renders its own "Download PDF" button (it owns the export code);
  // the toolbar button below drives it, and the original is hidden by CSS.
  const [pdf, setPdf] = useState<{ has: boolean; busy: boolean; label: string }>({ has: false, busy: false, label: "" });

  const [total, setTotal] = useState(0);
  const allPages = useCallback(
    () => Array.from(stageRef.current?.querySelectorAll<HTMLElement>(".kalai-page") ?? []),
    [],
  );
  // pages that may currently be seen (locked ones are hidden by CSS)
  const pages = useCallback(() => allPages().filter((el) => !el.hasAttribute("data-rv-locked")), [allPages]);

  // Track how many pages the report has (it renders after the viewer mounts).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      setTotal(allPages().length);
      const b = stage.querySelector<HTMLButtonElement>("[data-pdf-download]");
      const next = { has: !!b, busy: !!b?.disabled, label: b?.disabled ? (b.textContent ?? "") : "" };
      setPdf((p) => (p.has === next.has && p.busy === next.busy && p.label === next.label ? p : next));
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(stage, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["disabled"] });
    return () => mo.disconnect();
  }, [allPages]);

  // Free preview: lock every page after the first `freePages` until the report is paid for.
  useEffect(() => {
    allPages().forEach((el, i) => {
      if (limited && freePages !== undefined && i >= freePages) el.setAttribute("data-rv-locked", "");
      else el.removeAttribute("data-rv-locked");
    });
    setCount(limited && freePages !== undefined ? Math.min(total, freePages) : total);
  }, [limited, freePages, total, allPages]);

  // Single-page mode: show only the current page.
  useEffect(() => {
    const list = allPages().filter((el) => !el.hasAttribute("data-rv-locked"));
    list.forEach((el, i) => {
      el.style.display = single && i !== cur ? "none" : "";
    });
    return () => list.forEach((el) => (el.style.display = ""));
  }, [single, cur, count, total, limited, allPages]);

  const setDesign = (next: boolean | ((d: boolean) => boolean)) => {
    const stage = stageRef.current;
    const el = pages()[cur];
    if (stage && el) anchor.current = { el, off: el.getBoundingClientRect().top - stage.getBoundingClientRect().top };
    setDesignState(next);
  };
  useLayoutEffect(() => {
    const a = anchor.current;
    const stage = stageRef.current;
    anchor.current = null;
    if (!a || !stage || !a.el.isConnected) return;
    const dy = a.el.getBoundingClientRect().top - stage.getBoundingClientRect().top - a.off;
    stage.scrollTop += dy;
  }, [design]);

  const goto = useCallback(
    (i: number) => {
      const list = pages();
      if (!list.length) return;
      const n = Math.min(Math.max(i, 0), list.length - 1);
      setCur(n);
      const stage = stageRef.current;
      if (!stage) return;
      if (single) stage.scrollTo({ top: 0 });
      else {
        const dy = list[n].getBoundingClientRect().top - stage.getBoundingClientRect().top;
        stage.scrollTo({ top: stage.scrollTop + dy - 8, behavior: "smooth" });
      }
    },
    [pages, single],
  );

  // Continuous mode: follow the scroll position to know the current page.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || single) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const top = stage.getBoundingClientRect().top + stage.clientHeight * 0.3;
        const list = pages();
        let idx = 0;
        for (let i = 0; i < list.length; i++) {
          if (list[i].getBoundingClientRect().bottom > top) {
            idx = i;
            break;
          }
          idx = i;
        }
        setCur(idx);
      });
    };
    stage.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("scroll", onScroll);
    };
  }, [single, pages]);

  // Full screen is a fixed overlay (not the browser's native fullscreen), so the
  // unlock dialog and other page-level popups can still appear on top of it.
  // Opens at 80% so a whole page fits comfortably; closing returns to 100%.
  const toggleFull = () => {
    setZoom(full ? 1 : 0.8);
    setFull(!full);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!full) return;
      if (e.key === "Escape") {
        setFull(false);
        setZoom(1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (single) goto(cur + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (single) goto(cur - 1);
      } else if ((e.key === "+" || e.key === "=") && !e.ctrlKey) setZoom((z) => clamp(z + STEP));
      else if (e.key === "-" && !e.ctrlKey) setZoom((z) => clamp(z - STEP));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [full, single, cur, goto]);

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [full]);

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-foreground transition hover:bg-brand-500/10 hover:text-brand-fg disabled:cursor-not-allowed disabled:opacity-40";
  const sep = <span className="mx-0.5 hidden h-5 w-px bg-border-soft sm:block" aria-hidden />;

  const commitTyped = () => {
    if (typed !== null) {
      const n = parseInt(typed, 10);
      if (!Number.isNaN(n)) goto(n - 1);
    }
    setTyped(null);
  };

  return (
    <div
      ref={rootRef}
      className={
        full
          ? "rv-root fixed inset-0 z-[950] flex flex-col bg-surface-2"
          : "rv-root flex flex-col rounded-3xl border border-border-soft bg-surface-2/60"
      }
    >
      {/* Toolbar */}
      <div className="rv-toolbar no-print sticky top-0 z-40 flex flex-wrap items-center justify-center gap-1 rounded-t-3xl border-b border-border-soft bg-surface/90 px-2 py-1.5 backdrop-blur sm:justify-between sm:px-3">
        {/* Pages */}
        <div className="flex items-center gap-0.5" role="group" aria-label={ta ? "பக்கங்கள்" : "Pages"}>
          <button type="button" className={btn} onClick={() => goto(cur - 1)} disabled={cur <= 0} aria-label={ta ? "முந்தைய பக்கம்" : "Previous page"}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted">
            <input
              inputMode="numeric"
              aria-label={ta ? "பக்க எண்" : "Page number"}
              className="h-8 w-11 rounded-lg border border-line bg-surface text-center text-xs font-semibold tabular-nums text-foreground outline-none focus:border-brand-500"
              value={typed ?? String(count ? cur + 1 : 0)}
              onFocus={(e) => {
                setTyped("");
                e.currentTarget.select();
              }}
              onChange={(e) => setTyped(e.target.value.replace(/\D/g, ""))}
              onBlur={commitTyped}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
            <span className="tabular-nums">/ {count}</span>
            {limited && total > count && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                <Lock className="h-3 w-3" />+{total - count}
              </span>
            )}
          </span>
          <button type="button" className={btn} onClick={() => (limited && total > count && cur >= count - 1 ? openUnlockModal() : goto(cur + 1))} disabled={cur >= count - 1 && !(limited && total > count)} aria-label={ta ? "அடுத்த பக்கம்" : "Next page"}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {sep}

        {/* Zoom */}
        <div className="flex items-center gap-0.5" role="group" aria-label="Zoom">
          <button type="button" className={btn} onClick={() => setZoom((z) => clamp(z - STEP))} disabled={zoom <= MIN} aria-label={ta ? "சிறிதாக்கு" : "Zoom out"}>
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={MIN * 100}
            max={MAX * 100}
            step={5}
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(clamp(Number(e.target.value) / 100))}
            aria-label="Zoom"
            className="hidden h-1.5 w-24 cursor-pointer accent-[var(--brand-500)] md:block"
          />
          <button type="button" className={btn} onClick={() => setZoom((z) => clamp(z + STEP))} disabled={zoom >= MAX} aria-label={ta ? "பெரிதாக்கு" : "Zoom in"}>
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" className={`${btn} w-14 tabular-nums`} onClick={() => setZoom(1)} title={ta ? "100% க்கு மீட்டமை" : "Reset to 100%"}>
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className={btn} onClick={() => setZoom(1)} aria-label={ta ? "அகலத்திற்கு பொருத்து" : "Fit width"} title={ta ? "அகலத்திற்கு பொருத்து" : "Fit width"}>
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {sep}

        {/* View */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={`${btn} ${single ? "bg-brand-500/10 text-brand-fg" : ""}`}
            onClick={() => {
              setSingle((s) => !s);
              stageRef.current?.scrollTo({ top: 0 });
            }}
            aria-pressed={single}
            title={single ? (ta ? "தொடர் பார்வை" : "Continuous view") : (ta ? "ஒரு பக்கம் பார்வை" : "Single-page view")}
          >
            {single ? <Square className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
            <span className="hidden sm:inline">{single ? (ta ? "ஒரு பக்கம்" : "Single page") : (ta ? "தொடர்" : "Scroll")}</span>
          </button>
          {pdf.has && (
            <button
              type="button"
              disabled={pdf.busy}
              onClick={() => stageRef.current?.querySelector<HTMLButtonElement>("[data-pdf-download]")?.click()}
              className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold text-white shadow-soft transition hover:-translate-y-px disabled:opacity-70"
              style={{ background: "var(--brand-600)" }}
              title={ta ? "PDF பதிவிறக்கம்" : "Download PDF"}
            >
              {pdf.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{pdf.busy ? pdf.label : ta ? "PDF பதிவிறக்கம்" : "Download PDF"}</span>
            </button>
          )}
          <button
            type="button"
            className={`${btn} ${design ? "bg-brand-500/10 text-brand-fg" : ""}`}
            onClick={() => setDesign((d) => !d)}
            aria-pressed={design}
            title={ta ? "வண்ணம் · பின்னணி · எழுத்துரு" : "Colour · background · typeface"}
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">{ta ? "வடிவமைப்பு" : "Design"}</span>
          </button>
          <button type="button" className={btn} onClick={toggleFull} aria-pressed={full} title={full ? (ta ? "முழுத்திரை மூடு (Esc)" : "Exit full screen (Esc)") : (ta ? "முழுத்திரை" : "Full screen")}>
            {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{full ? (ta ? "மூடு" : "Exit") : (ta ? "முழுத்திரை" : "Full screen")}</span>
          </button>
        </div>
      </div>

      <div className={`relative min-h-0 ${full ? "flex flex-1 flex-col" : ""}`}>
      {/* Stage: the only scrolling box, so every page is reachable at any zoom */}
      <div
        ref={stageRef}
        className={`rv-stage min-h-0 overflow-auto overscroll-contain p-2 transition-[padding] duration-200 sm:p-4 ${
          design ? "md:pr-[27rem]!" : ""
        } ${full ? "flex-1" : "h-[min(82dvh,1000px)]"}`}
        tabIndex={0}
      >
        <div className="rv-zoom" style={{ zoom }}>
          {children}
        </div>

        {limited && total > count && (!single || cur >= count - 1) && (
          <div className="rv-lock no-print mx-auto my-4 max-w-xl overflow-hidden rounded-3xl border border-amber-400/50 bg-surface p-6 text-center shadow-lg">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: "#f59e0b" }}>
              <Lock className="h-7 w-7" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-foreground">
              {ta ? `${count} பக்கங்கள் இலவச முன்னோட்டம்` : `${count}-page free preview`}
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              {ta
                ? `மீதமுள்ள ${total - count} பக்கங்களைப் பார்க்க, PDF பதிவிறக்க, அச்சிட கட்டணம் செலுத்தி ஜாதகத்தைத் திறக்கவும்.`
                : `Pay once to unlock the remaining ${total - count} pages — preview, download and print.`}
            </p>
            <button
              type="button"
              onClick={openUnlockModal}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              style={{ background: "var(--brand-600)" }}
            >
              <Lock className="h-4 w-4" />
              {ta ? "திறக்க — கட்டணம் செலுத்து" : "Unlock full horoscope"}
            </button>
          </div>
        )}
      </div>

      {/* Design drawer: the same colour / background / typeface controls as the page,
          so they are available in full screen too. Changes apply to the report live. */}
      {design && (
        <aside className="no-print absolute inset-y-0 right-0 z-50 flex w-[min(26rem,100%)] flex-col border-l border-border-soft bg-surface shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-border-soft px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Palette className="h-4 w-4 text-brand-fg" />
              {ta ? "ஜாதக வடிவமைப்பு" : "Jathagam design"}
            </span>
            <button type="button" onClick={() => setDesign(false)} aria-label={ta ? "மூடு" : "Close"} className={btn}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <JathagamThemePanel lang={lang} compact />
          </div>
        </aside>
      )}
      </div>
    </div>
  );
};

export default ReportViewer;
