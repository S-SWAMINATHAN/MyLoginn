// frontend/lib/pdfExport.ts
//
// ONE shared PDF pipeline for both exports (the single-page Jathagam and the
// 50-page manuscript). Read this before touching either button.
//
// ============================================================================
// WHY DOWNLOADS LOOKED "GARBLED, DARK, MISALIGNED" — THE REAL ROOT CAUSE
// ============================================================================
//
// The previous version of this file captured every page with html2canvas.
// html2canvas does NOT use the browser's text-shaping engine — it reimplements
// text layout itself, measuring and placing each character run on its own.
// For Latin text this mostly works. For Tamil, which is a complex script built
// from base consonants plus combining vowel signs that must be shaped as a
// single glyph cluster (கு is க + a combining ா-family vowel sign, குரு is two
// such clusters), html2canvas's per-run measurement does not reshape the
// cluster correctly. The visible result is exactly what was reported: glyphs
// drawn overlapping (reads as a dark, illegible blob), vowel signs detached or
// reordered, and — because each mis-measured run still consumes its "expected"
// advance width — later content in the same cell or line lands in the wrong
// place, which is the "everything not aligned" symptom on top of the "not
// clear" one. This is a long-standing, widely-reported html2canvas limitation
// for Indic and other complex scripts, not a bug in this app's Tamil data or
// layout — the same DOM renders correctly on screen because the browser's own
// text engine draws it there.
//
// THE FIX: capture through an SVG <foreignObject> instead (via the
// `html-to-image` package). A foreignObject embeds real HTML inside an SVG,
// and the BROWSER — not a reimplementation — lays out and shapes that HTML,
// including every Tamil glyph cluster, exactly as it does on screen. The
// browser then rasterises the whole SVG (including the shaped text) into a
// bitmap that we draw to a canvas. This is the standard, correct way to
// rasterise complex-script HTML for export; html2canvas is kept ONLY as an
// automatic fallback for the rare case a foreignObject capture throws (e.g. a
// tainted canvas from a genuinely uncooperative cross-origin resource).
//
// package.json now lists html-to-image as a dependency — run `npm install`
// (or `npm install html-to-image` if you're patching an existing checkout)
// before building. This was checked in this delivery: html-to-image was
// installed and the frontend was type-checked and built successfully.
//
// SEPARATELY, both exporters still fit each captured page to A4 preserving
// its real aspect ratio (addCanvasToPdf, below) rather than stretching it onto
// a fixed 210x297mm box — that was the alignment bug from an earlier round and
// remains fixed; it is independent of the text-rendering fix above.
//
// Nothing astrological is touched in this file — export plumbing only.
// ============================================================================

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toCanvas as foreignObjectToCanvas } from "html-to-image";

export const A4_MM = { w: 210, h: 297 };
export const A5_MM = { w: 148, h: 210 };
/** Paper of the exported PDF. A5 has the same 1 : √2 shape as A4, so every
 *  captured page keeps exactly the same layout, only the sheet is smaller. */
export type PaperSize = "A4" | "A5";
const paperMm = (p?: PaperSize) => (p === "A5" ? A5_MM : A4_MM);
export const DEFAULT_MARGIN_MM = 4;
export const PAGE_WIDTH_PX = 794; // A4 width @96dpi — what the sheets are built at

export interface CaptureOptions {
  /** Output pixel ratio. 2 ≈ 190 dpi on A4; 3 is sharper but much heavier. */
  scale?: number;
  background?: string;
}

/** Waits for webfonts plus one paint, so Tamil faces are measured, not guessed. */
export async function waitForRenderReady(extraMs = 150): Promise<void> {
  try {
    // @ts-ignore — document.fonts is missing from older TS DOM libs
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  } catch {
    /* Font Loading API unavailable — carry on */
  }
  // Chapter 15 (Kalai tables) loads its data after the chart; wait up to 25 s
  // so a PDF never captures the "Computing…" placeholder.
  const t0 = Date.now();
  while (document.querySelector('[data-kalai-loaded="0"]') && Date.now() - t0 < 25000) {
    await new Promise((r) => setTimeout(r, 250));
  }
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, extraMs)));
}

/**
 * Primary capture path: renders the node through an SVG <foreignObject>, so
 * the BROWSER shapes every glyph (correct Tamil rendering — see the note at
 * the top of this file). html-to-image handles cloning the node, inlining
 * computed styles/fonts, and serialising it into the foreignObject for us.
 */
async function captureViaForeignObject(
  el: HTMLElement,
  opts: { pixelRatio: number; background: string; width: number; height: number }
): Promise<HTMLCanvasElement> {
  const canvas = await foreignObjectToCanvas(el, {
    pixelRatio: opts.pixelRatio,
    backgroundColor: opts.background,
    width: opts.width,
    height: opts.height,
    cacheBust: true,
    // The node may be sitting inside a fixed, off-screen host (see the
    // data-pdf-host handling in the manuscript page); the clone must be laid
    // out at its natural size with no leftover transform/offset.
    style: {
      margin: "0",
      transform: "none",
      transformOrigin: "top left",
      boxShadow: "none",
    },
  });
  if (!canvas || !canvas.width || !canvas.height) {
    throw new Error("foreignObject capture produced an empty canvas");
  }
  return canvas;
}

/**
 * Fallback capture path: html2canvas. Used only if the foreignObject path
 * throws. Known to mis-render complex Tamil glyph clusters (see the note at
 * the top of this file) — this exists purely so a download never fails
 * outright, not because its output is considered correct.
 */
async function captureViaHtml2Canvas(
  el: HTMLElement,
  opts: { scale: number; background: string; width: number; height: number }
): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: opts.scale,
    backgroundColor: opts.background,
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: opts.width,
    height: opts.height,
    windowWidth: opts.width,
    windowHeight: opts.height,
    scrollX: 0,
    scrollY: 0,
    removeContainer: true,
    imageTimeout: 15000,
    onclone: (doc: Document) => {
      doc.querySelectorAll<HTMLElement>("[data-pdf-host]").forEach((host) => {
        host.style.position = "static";
        host.style.left = "0";
        host.style.top = "0";
        host.style.transform = "none";
      });
      doc.querySelectorAll<HTMLElement>(".no-pdf").forEach((n) => {
        n.style.display = "none";
      });
    },
  });
}

/**
 * Rasterises a node for PDF export. Tries the foreignObject path first
 * (correct Tamil text shaping); falls back to html2canvas only if that path
 * throws, and logs a warning so a real regression doesn't go unnoticed.
 */
export async function captureNode(
  el: HTMLElement,
  opts: CaptureOptions = {}
): Promise<HTMLCanvasElement> {
  const background = opts.background ?? "#ffffff"; // Bug 3: white
  const pixelRatio = opts.scale ?? Math.min(3, Math.max(2, window.devicePixelRatio || 1));

  await waitForRenderReady();

  const rect = el.getBoundingClientRect();
  const width = Math.ceil(rect.width || el.offsetWidth || PAGE_WIDTH_PX);
  const height = Math.ceil(rect.height || el.offsetHeight);

  try {
    return await captureViaForeignObject(el, { pixelRatio, background, width, height });
  } catch (err) {
    console.warn(
      "[pdfExport] foreignObject capture failed, falling back to html2canvas " +
        "(Tamil text may render incorrectly in this fallback path):",
      err
    );
    return captureViaHtml2Canvas(el, { scale: pixelRatio, background, width, height });
  }
}

/**
 * Places a canvas on the current PDF page, fitted to A4 with its aspect ratio
 * preserved and centred. A node more than 15% taller than A4 is sliced into
 * real pages rather than shrunk into unreadability.
 */
export function addCanvasToPdf(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  opts: { margin?: number; background?: string; keep?: Array<[number, number]>; fitOnePage?: boolean; paper?: PaperSize } = {}
): void {
  const sheet = paperMm(opts.paper);
  const fmt = opts.paper === "A5" ? "a5" : "a4";
  // margins scale with the sheet so A5 keeps the same proportions as A4
  const margin = (opts.margin ?? DEFAULT_MARGIN_MM) * (sheet.w / A4_MM.w);
  const usableW = sheet.w - margin * 2;
  const usableH = sheet.h - margin * 2;
  const ratio = canvas.height / canvas.width;
  const a4Ratio = usableH / usableW;
  // Coloured background (turmeric): paint the whole sheet, margins included,
  // so the page is one colour edge to edge. White needs nothing.
  const paintSheet = () => {
    const bg = (opts.background || "#ffffff").toLowerCase();
    if (bg === "#ffffff" || bg === "#fff" || bg === "white") return;
    pdf.setFillColor(bg);
    pdf.rect(0, 0, sheet.w, sheet.h, "F");
  };

  // The single-page jathagam (and any sheet marked .single-sheet) always prints on ONE page.
  if (ratio <= a4Ratio * 1.15 || opts.fitOnePage) {
    let w = usableW;
    let h = w * ratio;
    if (h > usableH) {
      h = usableH;
      w = h / ratio;
    }
    const x = (sheet.w - w) / 2;
    const y = (sheet.h - h) / 2;
    paintSheet();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", x, y, w, h, undefined, "FAST");
    return;
  }

  const sliceHeightPx = Math.floor(canvas.width * a4Ratio);
  let offset = 0;
  let page = 0;
  while (offset < canvas.height) {
    let thisSlice = Math.min(sliceHeightPx, canvas.height - offset);
    // Move the cut up so it never falls inside a chart, table row or card
    // (a block taller than one page is still split, there is no other way).
    if (offset + thisSlice < canvas.height && opts.keep) {
      const cut = offset + thisSlice;
      let best = cut;
      for (const [top, bottom] of opts.keep) {
        if (top < best && bottom > best && bottom - top < sliceHeightPx && top > offset + sliceHeightPx * 0.2) best = top;
      }
      thisSlice = Math.max(1, best - offset);
    }
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = thisSlice;
    const ctx = part.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = opts.background ?? "#ffffff"; // Bug 3: white
    ctx.fillRect(0, 0, part.width, part.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, thisSlice, 0, 0, canvas.width, thisSlice);

    if (page > 0) pdf.addPage(fmt, "portrait");
    paintSheet();
    pdf.addImage(
      part.toDataURL("image/jpeg", 0.95),
      "JPEG",
      margin,
      margin,
      usableW,
      usableW * (thisSlice / canvas.width),
      undefined,
      "FAST"
    );
    offset += thisSlice;
    page += 1;
  }
}

/**
 * The page background chosen in the colour panel (white / turmeric), read from
 * the --jat-page-bg variable the theme sets on the document island; white when
 * the panel is on "palette default" (the earlier behaviour).
 */
export function pageBackgroundOf(node: HTMLElement): string {
  try {
    const v = getComputedStyle(node).getPropertyValue("--jat-page-bg").trim();
    return v || "#ffffff";
  } catch {
    return "#ffffff";
  }
}

/** Captures one node per PDF page and saves the file. */
export async function exportNodesToPdf(
  nodes: HTMLElement[],
  fileName: string,
  options: {
    margin?: number;
    background?: string;
    scale?: number;
    /** A4 (default) or A5 sheet. */
    paper?: PaperSize;
    onProgress?: (done: number, total: number) => void;
  } = {}
): Promise<void> {
  if (!nodes.length) throw new Error("Nothing to export.");

  const fmt = options.paper === "A5" ? "a5" : "a4";
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: fmt, compress: true });

  // Phones / tablets: a page narrower than A4 is laid out at A4 width while it is
  // captured, and the table scroll strips are switched off (html.pdf-export), so
  // a PDF made on a phone has the same full-width pages and every table column
  // as one made on a computer. Desktop pages (already wider) are not touched.
  const root = document.documentElement;
  root.classList.add("pdf-export");
  const widened: Array<[HTMLElement, string, string]> = [];
  for (const n of nodes) {
    if (n.getBoundingClientRect().width < PAGE_WIDTH_PX) {
      widened.push([n, n.style.width, n.style.maxWidth]);
      n.style.width = `${PAGE_WIDTH_PX}px`;
      n.style.maxWidth = "none";
    }
  }
  try {
  for (let i = 0; i < nodes.length; i++) {
    options.onProgress?.(i, nodes.length);
    const node = nodes[i];
    const background = options.background ?? pageBackgroundOf(node);
    const canvas = await captureNode(node, {
      scale: options.scale,
      background,
    });
    // blocks that must stay whole, in canvas pixels
    const nodeTop = node.getBoundingClientRect().top;
    const k = canvas.height / Math.max(1, node.scrollHeight || node.getBoundingClientRect().height);
    const keep: Array<[number, number]> = [];
    node.querySelectorAll<HTMLElement>(".kalai-chart, canvas, svg, tr, .pdf-keep, .break-inside-avoid, h2, h3").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0) keep.push([(r.top - nodeTop) * k, (r.bottom - nodeTop) * k]);
    });
    if (i > 0) pdf.addPage(fmt, "portrait");
    const fitOnePage = !!node.querySelector(".single-sheet") || node.classList.contains("single-sheet");
    addCanvasToPdf(pdf, canvas, { margin: options.margin, background, keep, fitOnePage, paper: options.paper });
    // Yield so the browser repaints the progress label and can reclaim memory.
    await new Promise((r) => setTimeout(r, 25));
  }

  } finally {
    for (const [n, w, mw] of widened) {
      n.style.width = w;
      n.style.maxWidth = mw;
    }
    root.classList.remove("pdf-export");
  }

  options.onProgress?.(nodes.length, nodes.length);
  pdf.save(fileName);
}

/** Filename-safe name that keeps Tamil characters. */
export function safeFileName(name: string): string {
  return (name || "Jathagam").replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_");
}