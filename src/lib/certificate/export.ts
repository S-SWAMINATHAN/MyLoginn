import { A4_LANDSCAPE_MM, CERT_HEIGHT_PX, CERT_WIDTH_PX, ISSUER, PRINT_PIXEL_RATIO } from "./config";
import type { CertificateData, ExportFormat } from "@/types/certificate";

/**
 * Rasterises a certificate page at 300 DPI (3508 × 2480 px).
 *
 * Primary path is html-to-image (SVG foreignObject): the browser itself lays out and shapes the text,
 * so webfonts, kerning and script ligatures match the on-screen preview exactly. html2canvas
 * re-implements text layout and shifts glyphs (see src/lib/astrology/pdfExport.ts), so it is only a
 * fallback for browsers where the foreignObject capture throws.
 */
async function capture(node: HTMLElement): Promise<HTMLCanvasElement> {
  await document.fonts?.ready;
  const options = { width: CERT_WIDTH_PX, height: CERT_HEIGHT_PX, pixelRatio: PRINT_PIXEL_RATIO, cacheBust: true, backgroundColor: "#ffffff" };
  try {
    const { toCanvas } = await import("html-to-image");
    // Safari decodes images inside a foreignObject lazily: the first pass can miss fonts/images, the second is complete.
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await toCanvas(node, options);
    const canvas = await toCanvas(node, options);
    if (!canvas.width || !canvas.height) throw new Error("empty capture");
    return canvas;
  } catch (error) {
    console.warn("[certificate] foreignObject capture failed, falling back to html2canvas", error);
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(node, { scale: PRINT_PIXEL_RATIO, width: CERT_WIDTH_PX, height: CERT_HEIGHT_PX, backgroundColor: "#ffffff", useCORS: true, logging: false });
  }
}

const safe = (value: string) => value.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60) || "Certificate";

export function certificateFilename(data: CertificateData, format: ExportFormat) {
  return `MyLoginn_Certificate_${safe(data.courseTitle)}_${safe(data.candidateName)}.${format}`;
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Exports the rendered certificate page as a print-ready A4 landscape PDF or a 300 DPI PNG. */
export async function exportCertificate(node: HTMLElement, data: CertificateData, format: ExportFormat) {
  const canvas = await capture(node);
  const filename = certificateFilename(data, format);

  if (format === "png") {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not encode the PNG.");
    save(blob, filename);
    return;
  }

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  pdf.setProperties({
    title: `${data.courseTitle} · Certificate of Completion`,
    subject: `Awarded to ${data.candidateName}`,
    author: ISSUER,
    creator: ISSUER,
    keywords: `certificate, ${data.credentialId}`,
  });
  // High-quality JPEG keeps a full-bleed 300 DPI page around 1–2 MB; PNG-in-PDF would be several times larger with no visible gain.
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, A4_LANDSCAPE_MM.w, A4_LANDSCAPE_MM.h, undefined, "NONE");
  save(pdf.output("blob"), filename);
}
