// frontend/lib/pdfExport.ts
//
// ONE shared PDF pipeline for both exports (the single-page Jathagam and the
// 50-page manuscript). Read this before touching either button.
//
// ============================================================================
// WHY THE DOWNLOADS DIDN'T MATCH THE SCREEN
// ============================================================================
//
// 1. THE BITMAP WAS STRETCHED ONTO A4.
//    Both buttons ended with
//        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297)
//    which forces whatever was captured into a 210×297 mm box regardless of
//    the captured canvas' real aspect ratio. A page captured at 794×1180 px
//    gets squeezed vertically, one at 794×1050 px gets stretched, and because
//    the distortion is a multiplier the error grows down the page: headings
//    drift onto rules, table rows drift off their lines. Fixed by
//    addCanvasToPdf(), which fits preserving aspect ratio and centres.
//
// 2. THE CAPTURE WAS TOO COARSE AND RAN AGAINST A LIVE, SCROLLING PAGE.
//    scale 1.6 on a 794 px sheet is ~1270 px across an A4 width — under 160
//    dpi, which is why small Tamil glyphs and thin table rules looked mushy.
//    Capture now runs at a device-pixel-ratio-aware scale of 2+ with the
//    scroll offset pinned, so nothing shifts mid-render.
//
// NOTE ON DEPENDENCIES: this file intentionally uses ONLY html2canvas and
// jspdf, both already in package.json. An earlier draft of this pipeline
// imported `html-to-image`, which was never installed — that import alone
// breaks `next build`. Anything added here must already be a dependency.
//
// Nothing astrological is touched in this file — export plumbing only.
// ============================================================================

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const A4_MM = { w: 210, h: 297 };
export const DEFAULT_MARGIN_MM = 4;
export const PAGE_WIDTH_PX = 794; // A4 width @96dpi — what the sheets are built at

export interface CaptureOptions {
  /** Device-pixel multiplier. 2 ≈ 190 dpi on A4; 3 is sharper but much heavier. */
  scale?: number;
  background?: string;
}

/** Waits for webfonts plus one paint, so Tamil faces are measured, not guessed. */
export async function waitForRenderReady(extraMs = 120): Promise<void> {
  try {
    // @ts-ignore — document.fonts is missing from older TS DOM libs
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  } catch {
    /* Font Loading API unavailable — carry on */
  }
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, extraMs)));
}

/**
 * Rasterises a node.
 *
 * html2canvas clones the document into an off-screen iframe and lets the
 * BROWSER lay the clone out, so flexbox, grid and the theme stylesheet all
 * survive — provided the clone is given the node's true box. We pass explicit
 * width/height/windowWidth and pin scrollX/scrollY, which is what stops the
 * off-screen manuscript host (parked at left:-10000px) from being captured at
 * the wrong offset.
 */
export async function captureNode(
  el: HTMLElement,
  opts: CaptureOptions = {}
): Promise<HTMLCanvasElement> {
  const background = opts.background ?? "#fdf6e3";
  const scale = opts.scale ?? Math.min(3, Math.max(2, window.devicePixelRatio || 1));

  await waitForRenderReady();

  const rect = el.getBoundingClientRect();
  const width = Math.ceil(rect.width || el.offsetWidth || PAGE_WIDTH_PX);
  const height = Math.ceil(rect.height || el.offsetHeight);

  return html2canvas(el, {
    scale,
    backgroundColor: background,
    useCORS: true,
    allowTaint: true,
    logging: false,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    removeContainer: true,
    imageTimeout: 15000,
    onclone: (doc: Document) => {
      // The off-screen manuscript host is parked at left:-10000px; inside the
      // clone it must sit at the origin or html2canvas captures blank paper.
      doc.querySelectorAll<HTMLElement>("[data-pdf-host]").forEach((host) => {
        host.style.position = "static";
        host.style.left = "0";
        host.style.top = "0";
        host.style.transform = "none";
      });
      // Anything explicitly marked screen-only never reaches the PDF.
      doc.querySelectorAll<HTMLElement>(".no-pdf").forEach((n) => {
        n.style.display = "none";
      });
    },
  });
}

/**
 * Places a canvas on the current PDF page, fitted to A4 with its aspect ratio
 * preserved and centred. A node more than 15% taller than A4 is sliced into
 * real pages rather than shrunk into unreadability.
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
    scale?: number;
    onProgress?: (done: number, total: number) => void;
  } = {}
): Promise<void> {
  if (!nodes.length) throw new Error("Nothing to export.");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  for (let i = 0; i < nodes.length; i++) {
    options.onProgress?.(i, nodes.length);
    const canvas = await captureNode(nodes[i], {
      scale: options.scale,
      background: options.background,
    });
    if (i > 0) pdf.addPage("a4", "portrait");
    addCanvasToPdf(pdf, canvas, { margin: options.margin, background: options.background });
    // Yield so the browser repaints the progress label and can reclaim memory.
    await new Promise((r) => setTimeout(r, 25));
  }

  options.onProgress?.(nodes.length, nodes.length);
  pdf.save(fileName);
}

/** Filename-safe name that keeps Tamil characters. */
export function safeFileName(name: string): string {
  return (name || "Jathagam").replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "_");
}