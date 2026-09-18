// frontend/lib/pdfExport.ts
//
// ONE shared PDF pipeline for both exports (single-page Jathagam and the
// 50-page manuscript). Read this before touching either button.
//
// ============================================================================
// WHY THE PDFs WERE MISALIGNED — two separate causes, both fixed here
// ============================================================================
//
// CAUSE 1 — the bitmap was stretched onto A4.
//   Both buttons ended with:
//       pdf.addImage(imgData, "JPEG", 0, 0, 210, 297)
//   which forces whatever was captured into a 210×297 mm box regardless of
//   the captured canvas' real aspect ratio. A page that is 794×1180 px gets
//   squeezed vertically; one that is 794×1050 px gets stretched. Because the
//   distortion is a multiplier, the error grows down the page — headings
//   drift onto borders, table rules drift off their rows. Fixed by
//   addCanvasToPdf() below, which fits preserving aspect ratio.
//
// CAUSE 2 — html2canvas does not implement CSS Grid.
//   This is the big one, and it is why the previous fix only got halfway.
//   html2canvas 1.4.x has NO CSS Grid implementation: it lays grid children
//   out as ordinary static blocks. Every `display:grid` container in the
//   report (the two identity cards, the 4 mini-facts, the Rasi/Navamsa row,
//   the scorecard, and the 4×4 chart itself) therefore collapsed into a
//   stack in the PDF, which is exactly the "everything overlaps" result.
//   Flexbox support is partial and `gap` is ignored, so flex rows drifted too.
//
//   Two independent defences are applied:
//     a) captureNode() below rasterises with html-to-image, which renders via
//        an SVG <foreignObject> — i.e. the BROWSER's own layout engine draws
//        the page. Grid, flex, gap, shadows and oklch() colours all come out
//        exactly as on screen. html2canvas is kept only as a fallback.
//     b) SinglePageReport.tsx was additionally rewritten to use table/block
//        layout with no grid and no flex, so even the fallback path is
//        correct. The 50-page manuscript chapters are untouched and rely on
//        (a) — which is why (a) had to exist rather than just rewriting the
//        one sheet.
//
// DEPENDENCY: npm i html-to-image
//   (html2canvas and jspdf you already have.)
//
// Nothing astrological is touched anywhere in this file — export plumbing only.
// ============================================================================

import jsPDF from "jspdf";
import html2canvas from "html2canvas";


export const A4_MM = { w: 210, h: 297 };
export const DEFAULT_MARGIN_MM = 5;
export const PAGE_WIDTH_PX = 794; // A4 width @ 96dpi — what the sheets are built at

export interface CaptureOptions {
  /** Device-pixel multiplier. 2 is crisp; 3 is sharper but much heavier. */
  pixelRatio?: number;
  background?: string;
}

/** Waits for webfonts + one paint so Kavivanar is measured, not a fallback face. */
export async function waitForRenderReady(extraMs = 120): Promise<void> {
  try {
    // @ts-ignore — document.fonts is missing from older TS DOM libs
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  } catch {
    /* fonts API unavailable — continue */
  }
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, extraMs)));
}

/* --------------------------------------------------------------------------
 * html2canvas fallback helpers — only used if foreignObject capture fails.
 * They inline resolved colours because html2canvas 1.4.x cannot parse the
 * oklch() values Tailwind v4 emits.
 * ------------------------------------------------------------------------ */

let _probeCtx: CanvasRenderingContext2D | null = null;
function normalizeColor(value: string): string {
  const v = (value || "").trim();
  if (!v || v === "none" || v === "transparent" || v === "currentcolor") return v;
  if (/^(#|rgb\(|rgba\()/i.test(v)) return v;
  if (!_probeCtx) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    _probeCtx = c.getContext("2d");
  }
  if (!_probeCtx) return v;
  try {
    _probeCtx.fillStyle = "#000000";
    _probeCtx.fillStyle = v;
    return _probeCtx.fillStyle as string;
  } catch {
    return v;
  }
}

const COLOR_PROPS = [
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "fill",
  "stroke",
];
const TEXT_PROPS = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
];
const MODERN_COLOR_FN = /(oklch|oklab|lch\(|lab\(|color-mix|color\()/i;

function inlineComputedStyles(source: HTMLElement, clone: HTMLElement) {
  const src: Element[] = [source, ...Array.from(source.querySelectorAll("*"))];
  const dst: Element[] = [clone, ...Array.from(clone.querySelectorAll("*"))];
  const len = Math.min(src.length, dst.length);
  for (let i = 0; i < len; i++) {
    const cs = window.getComputedStyle(src[i]);
    const style = (dst[i] as HTMLElement).style;
    if (!style || typeof style.setProperty !== "function") continue;
    for (const p of COLOR_PROPS) {
      const raw = cs.getPropertyValue(p);
      if (raw) style.setProperty(p, normalizeColor(raw));
    }
    for (const p of TEXT_PROPS) {
      const raw = cs.getPropertyValue(p);
      if (raw) style.setProperty(p, raw);
    }
    const bg = cs.getPropertyValue("background-image");
    if (bg && bg !== "none" && MODERN_COLOR_FN.test(bg)) style.setProperty("background-image", "none");
    const shadow = cs.getPropertyValue("box-shadow");
    if (shadow && shadow !== "none" && MODERN_COLOR_FN.test(shadow)) style.setProperty("box-shadow", "none");
    style.setProperty("backdrop-filter", "none");
    style.setProperty("-webkit-backdrop-filter", "none");
  }
}

async function html2canvasFallback(el: HTMLElement, opts: CaptureOptions): Promise<HTMLCanvasElement> {
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.top = "0";
  holder.style.left = "-100000px";
  holder.style.width = `${el.offsetWidth}px`;
  holder.style.background = opts.background || "#fdf6e3";
  holder.style.zIndex = "-1";
  holder.style.pointerEvents = "none";

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.boxShadow = "none";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    inlineComputedStyles(el, clone);
    await waitForRenderReady();
    const height = Math.ceil(clone.getBoundingClientRect().height);
    return await html2canvas(clone, {
      scale: opts.pixelRatio ?? 2,
      backgroundColor: opts.background || "#fdf6e3",
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: el.offsetWidth,
      height,
      windowWidth: el.offsetWidth,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      removeContainer: true,
    });
  } finally {
    document.body.removeChild(holder);
  }
}

/**
 * Rasterises a DOM node. Primary path is html-to-image's foreignObject
 * renderer (the browser draws it, so grid/flex/gap/oklch are all honoured);
 * html2canvas is the fallback if that path throws (e.g. a tainted canvas
 * from a cross-origin image with no CORS header).
 */
export async function captureNode(
  el: HTMLElement,
  opts: CaptureOptions = {}
): Promise<HTMLCanvasElement> {
  const pixelRatio = opts.pixelRatio ?? 2;
  const background = opts.background ?? "#fdf6e3";

  await waitForRenderReady();

  const width = el.offsetWidth;
  const height = Math.ceil(el.getBoundingClientRect().height);

  try {
    const canvas = await foreignObjectToCanvas(el, {
      pixelRatio,
      backgroundColor: background,
      cacheBust: true,
      width,
      height,
      // Neutralise any transform/scroll the node inherits from its page
      // position — the clone must be laid out at its natural size.
      style: {
        margin: "0",
        transform: "none",
        transformOrigin: "top left",
        boxShadow: "none",
      },
    });
    // A zero-sized canvas means the foreignObject silently failed; fall back.
    if (!canvas || !canvas.width || !canvas.height) throw new Error("empty canvas");
    return canvas;
  } catch (err) {
    console.warn("[pdfExport] foreignObject capture failed, falling back to html2canvas:", err);
    return html2canvasFallback(el, { pixelRatio, background });
  }
}

/**
 * Places a canvas on the current PDF page, fitted to A4 with its aspect
 * ratio preserved and centred. If the node is much taller than A4 it is
 * sliced into real pages rather than shrunk into unreadability.
 */
export function addCanvasToPdf(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  opts: { margin?: number; background?: string } = {}
): void {
  const margin = opts.margin ?? DEFAULT_MARGIN_MM;
  const usableW = A4_MM.w - margin * 2;
  const usableH = A4_MM.h - margin * 2;
  const ratio = canvas.height / canvas.width;
  const a4Ratio = usableH / usableW;

  if (ratio <= a4Ratio * 1.15) {
    let w = usableW;
    let h = w * ratio;
    if (h > usableH) {
      h = usableH;
      w = h / ratio;
    }
    const x = (A4_MM.w - w) / 2;
    const y = (A4_MM.h - h) / 2;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", x, y, w, h, undefined, "FAST");
    return;
  }

  const sliceHeightPx = Math.floor(canvas.width * a4Ratio);
  let offset = 0;
  let page = 0;
  while (offset < canvas.height) {
    const thisSlice = Math.min(sliceHeightPx, canvas.height - offset);
    const part = document.createElement("canvas");
    part.width = canvas.width;
    part.height = thisSlice;
    const ctx = part.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = opts.background ?? "#fdf6e3";
    ctx.fillRect(0, 0, part.width, part.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, thisSlice, 0, 0, canvas.width, thisSlice);

    if (page > 0) pdf.addPage("a4", "portrait");
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

/** Captures one node per PDF page and saves the file. */
export async function exportNodesToPdf(
  nodes: HTMLElement[],
  fileName: string,
  options: {
    margin?: number;
    background?: string;
    pixelRatio?: number;
    onProgress?: (done: number, total: number) => void;
  } = {}
): Promise<void> {
  if (!nodes.length) throw new Error("Nothing to export.");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  for (let i = 0; i < nodes.length; i++) {
    options.onProgress?.(i, nodes.length);
    const canvas = await captureNode(nodes[i], {
      pixelRatio: options.pixelRatio,
      background: options.background,
    });
    if (i > 0) pdf.addPage("a4", "portrait");
    addCanvasToPdf(pdf, canvas, { margin: options.margin, background: options.background });
    // Yield so the browser can repaint the progress label and free memory.
    await new Promise((r) => setTimeout(r, 30));
  }

  options.onProgress?.(nodes.length, nodes.length);
  pdf.save(fileName);
}

/** Filename-safe name that keeps Tamil characters. */
export function safeFileName(name: string): string {
  return (name || "Jathagam").replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_");
}