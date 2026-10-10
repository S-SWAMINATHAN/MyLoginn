import { readFile } from "node:fs/promises";
import path from "node:path";
import type { jsPDF as JsPDF } from "jspdf";

export type CertificateStyle = "classic-seal" | "navy-ribbon" | "lavender-modern";

export type CourseCertificatePdfInput = {
  learnerName: string;
  courseTitle: string;
  completedAt: Date;
  logoData?: string;
  wordmarkData?: string;
  style: CertificateStyle;
};

type Pdf = JsPDF;
type CertificateContent = Omit<CourseCertificatePdfInput, "style">;
type RGB = [number, number, number];

const ink: RGB = [26, 44, 67];
const muted: RGB = [83, 98, 119];
const gold: RGB = [196, 151, 57];
const navy: RGB = [19, 39, 65];
const purple: RGB = [99, 83, 151];
const completionDate = (date: Date) => date.toLocaleDateString("en-IN", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

function fitText(pdf: Pdf, value: string, x: number, y: number, maxWidth: number, size: number, font = "helvetica", style = "bold", align: "left" | "center" = "center") {
  pdf.setFont(font, style);
  let fontSize = size;
  pdf.setFontSize(fontSize);
  while (pdf.getTextWidth(value) > maxWidth && fontSize > 13) {
    fontSize -= 1;
    pdf.setFontSize(fontSize);
  }
  pdf.text(value, x, y, { align, maxWidth });
}

function addLogo(pdf: Pdf, data: string | undefined, x: number, y: number, size: number) {
  if (data) pdf.addImage(data, "PNG", x, y, size, size, undefined, "FAST");
}

function addWordmark(pdf: Pdf, data: string | undefined, x: number, y: number, width: number) {
  if (!data) return false;
  // The supplied lockup is a very wide transparent PNG; preserve its native ratio.
  pdf.addImage(data, "PNG", x, y, width, width / 7.16, undefined, "FAST");
  return true;
}

function addStar(pdf: Pdf, x: number, y: number, radius: number, color: RGB) {
  pdf.setFillColor(...color);
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * i) / 4;
    const inner = radius * 0.36;
    const outer = radius;
    const next = (Math.PI * (i + 1)) / 4;
    const pts = [
      [x + Math.cos(angle) * outer, y + Math.sin(angle) * outer],
      [x + Math.cos(angle + Math.PI / 8) * inner, y + Math.sin(angle + Math.PI / 8) * inner],
      [x + Math.cos(next) * outer, y + Math.sin(next) * outer],
    ];
    pdf.triangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1], "F");
  }
}

function addSeal(pdf: Pdf, x: number, y: number, radius: number, accent: RGB, year: number, label = "VERIFIED") {
  // Gold verification rosette: scalloped petals, engraved rings, and a clean center.
  pdf.setFillColor(...accent);
  pdf.circle(x, y, radius * 0.78, "F");
  for (let i = 0; i < 32; i++) {
    const angle = (Math.PI * 2 * i) / 32;
    pdf.circle(x + Math.cos(angle) * radius * 0.78, y + Math.sin(angle) * radius * 0.78, radius * 0.20, "F");
  }
  pdf.setFillColor(255, 255, 255);
  pdf.circle(x, y, radius * 0.66, "F");
  pdf.setDrawColor(...accent); pdf.setLineWidth(0.8); pdf.circle(x, y, radius * 0.66, "S");
  pdf.setLineWidth(0.5); pdf.circle(x, y, radius * 0.57, "S");
  pdf.setDrawColor(...accent); pdf.setLineWidth(0.25);
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const inner = radius * 0.59;
    const outer = radius * 0.64;
    pdf.line(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner, x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
  }
  pdf.setTextColor(...ink); pdf.setFont("helvetica", "bold"); pdf.setFontSize(Math.max(7.5, radius * 0.47));
  pdf.text(label, x, y - 1, { align: "center" });
  pdf.setFont("Cormorant", "italic"); pdf.setFontSize(Math.max(8.5, radius * 0.48));
  pdf.text(String(year), x, y + radius * 0.31, { align: "center" });
}

function drawNavyRibbonMedal(pdf: Pdf, x: number, y: number, radius: number) {
  const medalGold: RGB = [235, 187, 65];
  // Scalloped gold edge and inset rings, matching the ribbon-medal reference.
  pdf.setFillColor(...medalGold); pdf.circle(x, y, radius * 0.80, "F");
  for (let i = 0; i < 36; i++) {
    const angle = (Math.PI * 2 * i) / 36;
    pdf.circle(x + Math.cos(angle) * radius * 0.79, y + Math.sin(angle) * radius * 0.79, radius * 0.18, "F");
  }
  pdf.setFillColor(...navy); pdf.circle(x, y, radius * 0.66, "F");
  pdf.setDrawColor(255, 255, 255); pdf.setLineWidth(0.55); pdf.circle(x, y, radius * 0.59, "S");
  pdf.setDrawColor(...medalGold); pdf.setLineWidth(0.8); pdf.circle(x, y, radius * 0.72, "S");
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    pdf.setFillColor(...medalGold);
    pdf.circle(x + Math.cos(angle) * radius * 0.49, y + Math.sin(angle) * radius * 0.49, radius * 0.035, "F");
  }
  addStar(pdf, x, y, radius * 0.28, medalGold);
  pdf.setFillColor(...navy); pdf.circle(x, y, radius * 0.13, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(radius * 0.17);
  pdf.text("ML", x, y + radius * 0.055, { align: "center" });
}

function drawLavenderRosette(pdf: Pdf, x: number, y: number, radius: number) {
  const lilac: RGB = [183, 170, 218];
  pdf.setFillColor(...lilac); pdf.circle(x, y, radius * 0.72, "F");
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24;
    pdf.circle(x + Math.cos(angle) * radius * 0.73, y + Math.sin(angle) * radius * 0.73, radius * 0.20, "F");
  }
  pdf.setFillColor(255, 255, 255); pdf.circle(x, y, radius * 0.62, "F");
  pdf.setDrawColor(...lilac); pdf.setLineWidth(0.7); pdf.circle(x, y, radius * 0.55, "S");
  pdf.setFillColor(77, 68, 119); pdf.circle(x, y, radius * 0.46, "F");
  addStar(pdf, x, y, radius * 0.28, [255, 255, 255]);
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(Math.max(4, radius * 0.23));
  pdf.text("ML", x, y + radius * 0.075, { align: "center" });
}

function drawClassicSeal(pdf: Pdf, { learnerName, courseTitle, completedAt, logoData, wordmarkData }: CertificateContent, width: number, height: number) {
  pdf.setFillColor(252, 250, 245); pdf.rect(0, 0, width, height, "F");
  // Guilloche-inspired lace edge with nested rules, small repeats, and corner cartouches.
  pdf.setDrawColor(204, 191, 163); pdf.setLineWidth(0.45); pdf.rect(5, 5, width - 10, height - 10, "S");
  pdf.setDrawColor(148, 126, 89); pdf.setLineWidth(0.35); pdf.rect(13, 13, width - 26, height - 26, "S");
  pdf.setDrawColor(221, 211, 190); pdf.setLineWidth(0.2); pdf.rect(15, 15, width - 30, height - 30, "S");
  pdf.setDrawColor(214, 201, 174); pdf.setLineWidth(0.22);
  for (let x = 16; x < width - 16; x += 3.2) {
    pdf.circle(x, 9, 1.05, "S"); pdf.circle(x, height - 9, 1.05, "S");
  }
  for (let y = 16; y < height - 16; y += 3.2) {
    pdf.circle(9, y, 1.05, "S"); pdf.circle(width - 9, y, 1.05, "S");
  }
  pdf.setFillColor(...gold);
  for (const [x, y] of [[19, 19], [width - 19, 19], [19, height - 19], [width - 19, height - 19]]) {
    pdf.triangle(x, y - 2.5, x + 2.5, y, x, y + 2.5, "F");
    pdf.triangle(x, y - 2.5, x - 2.5, y, x, y + 2.5, "F");
  }
  // Year tab matching the hanging ribbon in the reference.
  pdf.setFillColor(...navy); pdf.rect(width - 42, 0, 20, 25, "F");
  pdf.triangle(width - 42, 24, width - 22, 24, width - 32, 32, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("Cormorant", "italic"); pdf.setFontSize(12);
  pdf.text(String(completedAt.getUTCFullYear()), width - 32, 12.5, { align: "center" });
  if (!addWordmark(pdf, wordmarkData, width / 2 - 31, 19, 62)) {
    addLogo(pdf, logoData, width / 2 - 7.5, 15, 15);
    pdf.setTextColor(...ink); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7); pdf.text("MYLOGINN LEARNING", width / 2, 34, { align: "center" });
  }
  addSeal(pdf, 40, 49, 13, gold, completedAt.getUTCFullYear());

  pdf.setTextColor(44, 61, 78); pdf.setFont("Cormorant", "italic"); pdf.setFontSize(37);
  pdf.text("Certificate of Completion", width / 2, 61, { align: "center" });
  pdf.setTextColor(...muted); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(14);
  pdf.text("This certificate is proudly presented to", width / 2, 75, { align: "center" });
  fitText(pdf, learnerName, width / 2, 95, width - 75, 35, "Allura", "normal");
  pdf.setDrawColor(...gold); pdf.setLineWidth(0.65); pdf.line(width / 2 - 42, 100, width / 2 + 42, 100);
  pdf.setTextColor(...muted); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(14);
  pdf.text("for successfully completing the course", width / 2, 113, { align: "center" });
  fitText(pdf, courseTitle, width / 2, 130, width - 65, 26, "Cormorant", "italic");
  pdf.setTextColor(...muted); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(13);
  pdf.text(`Course completion date: ${completionDate(completedAt)}`, width / 2, 145, { align: "center" });

  for (const [index, name] of ["Saravanakumar", "Swaminathan S"].entries()) {
    const x = index === 0 ? 45 : width - 45;
    pdf.setDrawColor(165, 150, 121); pdf.setLineWidth(0.35); pdf.line(x - 28, 174, x + 28, 174);
    pdf.setTextColor(...ink); pdf.setFont("Allura", "normal"); pdf.setFontSize(21); pdf.text(name, x, 170, { align: "center" });
    pdf.setTextColor(...muted); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(10.5); pdf.text("Authorized Signatory", x, 181, { align: "center" });
  }
}

function drawNavyRibbon(pdf: Pdf, { learnerName, courseTitle, completedAt, logoData, wordmarkData }: CertificateContent, width: number, height: number) {
  pdf.setFillColor(250, 250, 252); pdf.rect(0, 0, width, height, "F");
  pdf.setDrawColor(19, 39, 72); pdf.setLineWidth(2); pdf.rect(7, 7, width - 14, height - 14, "S");
  const ribbonX = width - 49;
  pdf.setFillColor(...navy); pdf.rect(ribbonX, 7, 42, height - 14, "F");
  pdf.setFillColor(...gold); pdf.rect(ribbonX - 2, 7, 2, height - 14, "F");
  pdf.setDrawColor(45, 67, 112); pdf.setLineWidth(0.28);
  for (let y = 14; y < height - 18; y += 8) pdf.line(ribbonX + 4, y, width - 10, y + 4);
  if (!addWordmark(pdf, wordmarkData, 24, 19, 60)) {
    addLogo(pdf, logoData, 24, 17, 15);
    pdf.setTextColor(...ink); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text("MYLOGINN", 43, 24);
    pdf.setTextColor(...muted); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.text("LEARNING PLATFORM", 43, 30);
  }
  pdf.setTextColor(...ink); pdf.setFont("helvetica", "bold"); pdf.setFontSize(30); pdf.text("Course Completion", 25, 59);
  pdf.setTextColor(...muted); pdf.setFont("helvetica", "normal"); pdf.setFontSize(14); pdf.text("This certificate is presented to", 25, 78);
  fitText(pdf, learnerName, 25, 103, 190, 36, "Cormorant", "italic", "left");
  pdf.setDrawColor(44, 91, 164); pdf.setLineWidth(1.15); pdf.line(25, 109, 67, 109);
  pdf.setTextColor(...muted); pdf.setFont("helvetica", "normal"); pdf.setFontSize(14); pdf.text("for successfully completing", 25, 124);
  fitText(pdf, courseTitle, 25, 143, 190, 27, "helvetica", "bold", "left");
  pdf.setDrawColor(208, 217, 230); pdf.setLineWidth(0.45); pdf.line(25, 153, ribbonX - 9, 153);
  pdf.setTextColor(...muted); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10.5); pdf.text("COMPLETED ON", 25, 164);
  pdf.setTextColor(...ink); pdf.setFont("helvetica", "normal"); pdf.setFontSize(14); pdf.text(completionDate(completedAt), 25, 175);

  // Ribbon tails sit behind the medal, with the year centered below it.
  pdf.setFillColor(206, 151, 45);
  pdf.triangle(width - 42, 60, width - 29, 60, width - 39, 83, "F");
  pdf.triangle(width - 27, 60, width - 14, 60, width - 17, 83, "F");
  drawNavyRibbonMedal(pdf, width - 28, 41, 20);
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(String(completedAt.getUTCFullYear()), width - 28, 94, { align: "center" });
  for (const [index, name] of ["Saravanakumar", "Swaminathan S"].entries()) {
    const x = 62 + index * 103;
    pdf.setDrawColor(142, 153, 169); pdf.setLineWidth(0.35); pdf.line(x - 29, 186, x + 29, 186);
    pdf.setTextColor(...ink); pdf.setFont("Allura", "normal"); pdf.setFontSize(20); pdf.text(name, x, 182, { align: "center" });
    pdf.setTextColor(...muted); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text("Authorized Signatory", x, 193, { align: "center" });
  }
}

function drawLavenderModern(pdf: Pdf, { learnerName, courseTitle, completedAt, logoData, wordmarkData }: CertificateContent, width: number, height: number) {
  pdf.setFillColor(239, 244, 253); pdf.rect(0, 0, width, height, "F");
  pdf.setFillColor(255, 251, 255); pdf.roundedRect(8, 8, width - 16, height - 16, 3, 3, "F");
  pdf.setDrawColor(...purple); pdf.setLineWidth(0.65); pdf.rect(13, 13, width - 26, height - 26, "S");
  pdf.setFillColor(124, 109, 176); pdf.rect(13, 13, width - 26, 25, "F");
  pdf.setDrawColor(213, 203, 231); pdf.setLineWidth(0.4);
  pdf.line(21, 17, 21, 39); pdf.line(25, 17, 25, 39); pdf.line(width - 21, 17, width - 21, 39); pdf.line(width - 25, 17, width - 25, 39);
  if (wordmarkData) {
    pdf.setFillColor(255, 255, 255); pdf.roundedRect(26, 18, 66, 10, 1.6, 1.6, "F");
    addWordmark(pdf, wordmarkData, 28, 19, 62);
  } else {
    addLogo(pdf, logoData, 29, 17, 15);
    pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.text("MYLOGINN", 48, 24);
    pdf.setTextColor(235, 231, 247); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.text("LEARNING PLATFORM", 48, 30);
  }
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.text("LEARNING ACHIEVEMENT", width - 27, 27, { align: "right" });
  // Fine corner rays echo the reference's diagonal light ornaments.
  pdf.setDrawColor(199, 190, 224); pdf.setLineWidth(0.45);
  for (let i = 0; i < 6; i++) {
    pdf.line(13, 48 + i * 2, 23 + i * 2, 38);
    pdf.line(width - 13, height - 48 - i * 2, width - 23 - i * 2, height - 38);
  }
  pdf.setTextColor(55, 52, 96); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(35);
  pdf.text("Certificate of Completion", width / 2, 66, { align: "center" });
  pdf.setDrawColor(203, 190, 228); pdf.setLineWidth(0.55); pdf.line(68, 77, width - 68, 77);
  pdf.setTextColor(98, 91, 133); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(14); pdf.text("This is to certify that", width / 2, 91, { align: "center" });
  fitText(pdf, learnerName, width / 2, 112, width - 65, 36, "Cormorant", "italic");
  pdf.setTextColor(80, 77, 119); pdf.setFont("helvetica", "normal"); pdf.setFontSize(14); pdf.text("completed the course", width / 2, 126, { align: "center" });
  fitText(pdf, courseTitle, width / 2, 144, width - 60, 27, "helvetica", "bold");
  pdf.setTextColor(98, 91, 133); pdf.setFont("Cormorant", "normal"); pdf.setFontSize(14);
  pdf.text(`Completion date: ${completionDate(completedAt)}`, width / 2, 158, { align: "center" });
  // Small centered rosette separates the signature blocks, like the reference.
  const sealX = width / 2; const sealY = 174;
  drawLavenderRosette(pdf, sealX, sealY, 13);
  for (const [index, name] of ["Saravanakumar", "Swaminathan S"].entries()) {
    const x = index === 0 ? 70 : width - 70;
    pdf.setDrawColor(167, 157, 197); pdf.setLineWidth(0.35); pdf.line(x - 31, 181, x + 31, 181);
    pdf.setTextColor(52, 52, 103); pdf.setFont("Allura", "normal"); pdf.setFontSize(20); pdf.text(name, x, 180, { align: "center" });
    pdf.setTextColor(98, 91, 133); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text("Authorized Signatory", x, 190, { align: "center" });
  }
  pdf.setTextColor(136, 127, 166); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text(String(completedAt.getUTCFullYear()), width / 2, 193, { align: "center" });
}

export async function createCourseCertificatePdf({ style, ...content }: CourseCertificatePdfInput) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const fontDir = path.join(process.cwd(), "public", "fonts");
  const [cormorant, allura] = await Promise.all([
    readFile(path.join(fontDir, "CormorantGaramond-Italic.ttf")),
    readFile(path.join(fontDir, "Allura-Regular.ttf")),
  ]);
  pdf.addFileToVFS("CormorantGaramond-Italic.ttf", cormorant.toString("base64"));
  pdf.addFont("CormorantGaramond-Italic.ttf", "Cormorant", "italic");
  // Italic face is used as the fine display serif for headings and names.
  pdf.addFileToVFS("CormorantGaramond-Italic.ttf", cormorant.toString("base64"));
  pdf.addFont("CormorantGaramond-Italic.ttf", "Cormorant", "normal");
  pdf.addFileToVFS("Allura-Regular.ttf", allura.toString("base64"));
  pdf.addFont("Allura-Regular.ttf", "Allura", "normal");
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  if (style === "classic-seal") drawClassicSeal(pdf, content, width, height);
  else if (style === "navy-ribbon") drawNavyRibbon(pdf, content, width, height);
  else drawLavenderModern(pdf, content, width, height);
  return Buffer.from(pdf.output("arraybuffer"));
}
