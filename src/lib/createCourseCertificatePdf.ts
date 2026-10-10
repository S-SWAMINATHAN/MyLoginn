import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import type { jsPDF as JsPDF } from "jspdf";

export type CertificateStyle = "classic-seal" | "navy-ribbon" | "lavender-modern";

export type CourseCertificatePdfInput = {
  learnerName: string;
  courseTitle: string;
  completedAt: Date;
  enrolledAt: Date;
  issuedAt: Date;
  credits: number;
  certificateId: string;
  logoData?: string;
  wordmarkData?: string;
  style: CertificateStyle;
};

type Pdf = JsPDF;
type Content = Omit<CourseCertificatePdfInput, "style">;
type RGB = [number, number, number];

const SIGNATORIES = ["Saravanakumar", "Swaminathan S"];
const ROLE = "Authorized Signatory";

/** Deterministic, UUID-shaped ID so the same learner/course/date always yields the same certificate ID. */
export function createCertificateId(userId: string | number, courseId: string | number, completedAt: Date) {
  const h = createHash("sha256").update(`${userId}:${courseId}:${completedAt.toISOString()}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-9${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const longDate = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dotted = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
function duration(from: Date, to: Date) {
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
  if (days < 14) return plural(days, "Day");
  if (days < 60) return plural(Math.round(days / 7), "Week");
  return plural(Math.round(days / 30), "Month");
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round) as RGB;

function withOpacity(pdf: Pdf, opacity: number, draw: () => void) {
  const GState = (pdf as unknown as { GState: new (o: { opacity: number }) => Parameters<Pdf["setGState"]>[0] }).GState;
  pdf.setGState(new GState({ opacity }));
  draw();
  pdf.setGState(new GState({ opacity: 1 }));
}

type TextOpts = { font: string; style?: string; size: number; color: RGB; align?: "left" | "center" | "right"; maxWidth?: number; minSize?: number; bold?: boolean };
/** Draws text, shrinking the font until it fits maxWidth. `bold` fakes a heavier weight with a hairline stroke. */
function text(pdf: Pdf, value: string, x: number, y: number, { font, style = "normal", size, color, align = "left", maxWidth, minSize = 8, bold }: TextOpts) {
  pdf.setFont(font, style);
  let s = size;
  pdf.setFontSize(s);
  while (maxWidth && pdf.getTextWidth(value) > maxWidth && s > minSize) pdf.setFontSize((s -= 0.5));
  pdf.setTextColor(...color);
  if (bold) {
    pdf.setDrawColor(...color); pdf.setLineWidth(s * 0.012);
    pdf.text(value, x, y, { align, renderingMode: "fillThenStroke" });
  } else pdf.text(value, x, y, { align });
}

function polygon(pdf: Pdf, pts: [number, number][], color: RGB) {
  pdf.setFillColor(...color);
  pdf.lines(pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]), pts[0][0], pts[0][1], [1, 1], "F", true);
}

function star(pdf: Pdf, x: number, y: number, outer: number, color: RGB, points = 5, rotation = -Math.PI / 2, innerRatio = 0.45) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : outer * innerRatio;
    const a = rotation + (Math.PI * i) / points;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  polygon(pdf, pts, color);
}

function gradientCircle(pdf: Pdf, x: number, y: number, r: number, from: RGB, to: RGB, steps = 14) {
  for (let i = 0; i < steps; i++) {
    pdf.setFillColor(...mix(from, to, i / (steps - 1)));
    pdf.circle(x - (i / steps) * r * 0.12, y - (i / steps) * r * 0.12, r * (1 - i / steps), "F");
  }
}

function scallop(pdf: Pdf, x: number, y: number, r: number, lobes: number, lobeR: number, color: RGB) {
  pdf.setFillColor(...color);
  pdf.circle(x, y, r, "F");
  for (let i = 0; i < lobes; i++) {
    const a = (Math.PI * 2 * i) / lobes;
    pdf.circle(x + Math.cos(a) * r, y + Math.sin(a) * r, lobeR, "F");
  }
}

function addWordmark(pdf: Pdf, data: string | undefined, x: number, y: number, width: number) {
  if (!data) return false;
  pdf.addImage(data, "PNG", x, y, width, width / 7.16, undefined, "FAST"); // supplied lockup keeps a 7.16:1 ratio
  return true;
}

function qr(pdf: Pdf, value: string, x: number, y: number, size: number, color: RGB, bg?: RGB) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const n = modules.size;
  const cell = size / n;
  if (bg) { pdf.setFillColor(...bg); pdf.rect(x, y, size, size, "F"); }
  pdf.setFillColor(...color);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (modules.get(r, c)) pdf.rect(x + c * cell, y + r * cell, cell + 0.02, cell + 0.02, "F");
}

/* ───────────── Design 1 · Classic academic seal (ornate lace border, gold verified seal, year ribbon) ───────────── */
function guilloche(pdf: Pdf, W: number, H: number, outer: number, inner: number) {
  const mid = (outer + inner) / 2, amp = (inner - outer) / 2 - 0.5, period = 9, step = 0.6;
  pdf.setDrawColor(214, 206, 186); pdf.setLineWidth(0.16);
  for (const phase of [0, 1 / 3, 2 / 3]) {
    const wave = (t: number) => Math.sin((t / period + phase) * Math.PI * 2) * amp;
    for (const horizontal of [true, false]) {
      const length = (horizontal ? W : H) - 2 * outer;
      for (const side of [0, 1]) {
        const rel: [number, number][] = [];
        for (let t = 0; t < length; t += step) {
          const a = wave(t), b = wave(t + step);
          rel.push(horizontal ? [step, b - a] : [b - a, step]);
        }
        const base = side === 0 ? mid : (horizontal ? H : W) - mid;
        pdf.lines(rel, horizontal ? outer : base + wave(0), horizontal ? base + wave(0) : outer, [1, 1], "S", false);
      }
    }
  }
}

function classicSeal(pdf: Pdf, x: number, y: number, r: number, year: number) {
  const gold: RGB = [201, 154, 46], light: RGB = [244, 213, 120];
  scallop(pdf, x, y, r * 0.88, 28, r * 0.13, gold);
  gradientCircle(pdf, x, y, r * 0.9, [186, 138, 36], light, 16);
  pdf.setDrawColor(255, 244, 205); pdf.setLineWidth(0.35); pdf.circle(x, y, r * 0.74, "S");
  pdf.setLineWidth(0.18); pdf.circle(x, y, r * 0.68, "S");
  text(pdf, "Verified", x, y - 0.4, { font: "EBGaramond", style: "italic", size: r * 0.78, color: [58, 44, 18], align: "center" });
  text(pdf, String(year), x, y + r * 0.42, { font: "EBGaramond", style: "italic", size: r * 0.78, color: [58, 44, 18], align: "center" });
}

function drawClassic(pdf: Pdf, c: Content, W: number, H: number) {
  const slate: RGB = [47, 63, 80], muted: RGB = [88, 98, 112], year = c.completedAt.getUTCFullYear();
  pdf.setFillColor(253, 251, 248); pdf.rect(0, 0, W, H, "F");
  guilloche(pdf, W, H, 8, 21);
  pdf.setDrawColor(205, 195, 170); pdf.setLineWidth(0.3); pdf.rect(8, 8, W - 16, H - 16, "S");
  pdf.setDrawColor(172, 158, 128); pdf.setLineWidth(0.5); pdf.rect(21, 21, W - 42, H - 42, "S");
  pdf.setDrawColor(220, 212, 192); pdf.setLineWidth(0.2); pdf.rect(22.4, 22.4, W - 44.8, H - 44.8, "S");
  if (c.logoData) withOpacity(pdf, 0.05, () => pdf.addImage(c.logoData!, "PNG", W / 2 - 38, 62, 76, 76, undefined, "FAST"));

  // Hanging year ribbon with a swallow-tail.
  polygon(pdf, [[W - 66, 0], [W - 26, 0], [W - 26, 40], [W - 46, 31], [W - 66, 40]], [47, 66, 82]);
  text(pdf, String(year), W - 46, 17, { font: "EBGaramond", size: 20, color: [255, 255, 255], align: "center" });
  classicSeal(pdf, 46, 46, 22, year);

  if (!addWordmark(pdf, c.wordmarkData, W / 2 - 36, 26, 72)) text(pdf, "MYLOGINN LEARNING", W / 2, 33, { font: "helvetica", style: "bold", size: 8, color: slate, align: "center" });
  text(pdf, "Certificate of Completion", W / 2, 75, { font: "EBGaramond", style: "italic", size: 40, color: slate, align: "center", maxWidth: 186 });
  text(pdf, "This certificate is hereby granted to", W / 2, 85.5, { font: "EBGaramond", size: 9.5, color: muted, align: "center" });
  text(pdf, c.learnerName, W / 2, 106, { font: "EBGaramond", style: "italic", size: 34, color: slate, align: "center", maxWidth: 150, minSize: 16 });
  pdf.setDrawColor(205, 172, 98); pdf.setLineWidth(0.3); pdf.line(W / 2 - 52, 112.5, W / 2 + 52, 112.5);
  text(pdf, "For successful completion of the course requirements through the", W / 2, 121, { font: "EBGaramond", size: 9.5, color: muted, align: "center" });
  text(pdf, c.courseTitle, W / 2, 132, { font: "EBGaramond", size: 19, color: [36, 50, 66], align: "center", maxWidth: 190, bold: true, minSize: 12 });
  text(pdf, "demonstrating proficiency across every lesson, hands-on challenge, and practical exercise,", W / 2, 140.5, { font: "EBGaramond", size: 9, color: muted, align: "center" });
  text(pdf, "and fulfilling all course completion criteria.", W / 2, 146.5, { font: "EBGaramond", size: 9, color: muted, align: "center" });

  const details = [`Total Credits Earned: ${plural(c.credits, "Credit")}`, `Course Duration: ${duration(c.enrolledAt, c.completedAt)}`, `Date of Completion: ${longDate(c.completedAt)}`, `Issued on: ${iso(c.issuedAt)}`, `Certificate ID: ${c.certificateId}`];
  details.forEach((line, i) => text(pdf, line, W / 2, 156 + i * 4.6, { font: "EBGaramond", size: i === 4 ? 6 : 6.8, color: muted, align: "center" }));

  text(pdf, "Issued by MyLoginn Learning · Verified certificate", W / 2, 186, { font: "EBGaramond", style: "italic", size: 6.5, color: muted, align: "center" });
  SIGNATORIES.forEach((name, i) => {
    const x = i === 0 ? 64 : W - 64;
    text(pdf, name, x, 167, { font: "Allura", size: 24, color: [26, 34, 48], align: "center", maxWidth: 52, minSize: 14 });
    pdf.setDrawColor(190, 172, 130); pdf.setLineWidth(0.3); pdf.line(x - 29, 171.5, x + 29, 171.5);
    text(pdf, name, x, 177, { font: "EBGaramond", size: 8.5, color: slate, align: "center" });
    text(pdf, ROLE, x, 181.5, { font: "EBGaramond", size: 6.8, color: muted, align: "center" });
  });
}

/* ───────────── Design 2 · Navy verified band (gold seal, QR code, participation layout) ───────────── */
function navySeal(pdf: Pdf, x: number, y: number, r: number, year: number) {
  const navy: RGB = [14, 28, 92];
  scallop(pdf, x, y, r * 0.95, 40, r * 0.05, [199, 150, 40]);
  gradientCircle(pdf, x, y, r, [196, 146, 36], [248, 222, 132], 18);
  pdf.setDrawColor(...navy); pdf.setLineWidth(0.3); pdf.circle(x, y, r * 0.86, "S"); pdf.circle(x, y, r * 0.62, "S");
  for (let i = 0; i < 6; i++) {
    const a = Math.PI + 0.35 + ((Math.PI - 0.7) * i) / 5;
    star(pdf, x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74, r * 0.085, navy);
    star(pdf, x + Math.cos(-a) * r * 0.74, y + Math.sin(-a) * r * 0.74, r * 0.085, navy);
  }
  text(pdf, "Verified", x, y - r * 0.12, { font: "EBGaramond", style: "italic", size: r * 0.52, color: navy, align: "center" });
  text(pdf, "Certificate", x, y + r * 0.2, { font: "EBGaramond", style: "italic", size: r * 0.52, color: navy, align: "center" });
  text(pdf, String(year), x, y + r * 0.44, { font: "EBGaramond", style: "italic", size: r * 0.36, color: navy, align: "center" });
}

function drawNavy(pdf: Pdf, c: Content, W: number, H: number) {
  const navy: RGB = [10, 24, 88], ink: RGB = [38, 38, 48], gray: RGB = [86, 86, 98];
  pdf.setFillColor(244, 245, 251); pdf.rect(0, 0, W, H, "F");
  // Faint diamond lattice, as on the reference paper.
  pdf.setDrawColor(232, 234, 246); pdf.setLineWidth(0.15);
  for (let i = -H; i < W; i += 7) { pdf.line(i, 0, i + H, H); pdf.line(i, H, i + H, 0); }
  pdf.setDrawColor(...navy); pdf.setLineWidth(1.6); pdf.rect(9, 9, W - 18, H - 18, "S");
  const bandX = W - 9 - 38;
  pdf.setFillColor(...navy); pdf.rect(bandX, 9, 38, H - 18, "F");
  navySeal(pdf, bandX + 19, 36, 17.5, c.completedAt.getUTCFullYear());
  const verify = `MyLoginn certificate ${c.certificateId} | ${c.learnerName} | ${c.courseTitle} | ${iso(c.completedAt)}`;
  qr(pdf, verify, bandX + 6.5, H - 9 - 6.5 - 25, 25, [255, 255, 255], navy);

  const left = 25, maxW = bandX - left - 10;
  if (!addWordmark(pdf, c.wordmarkData, left, 22, 46)) text(pdf, "MYLOGINN", left, 28, { font: "Inter", size: 10, color: ink });
  text(pdf, "Certificate of Completion", left, 48, { font: "Inter", size: 30, color: ink, maxWidth: maxW, minSize: 18 });
  text(pdf, "Is hereby presented to", left, 66, { font: "Inter", size: 9, color: ink });
  text(pdf, c.learnerName, left, 90, { font: "EBGaramond", size: 40, color: [30, 30, 36], maxWidth: maxW, minSize: 18 });
  text(pdf, "For successfully completing the course", left, 108, { font: "Inter", size: 9, color: ink });
  text(pdf, `'${c.courseTitle}'`, left, 116, { font: "Inter", size: 12.5, color: ink, maxWidth: maxW, minSize: 8 });

  SIGNATORIES.forEach((name, i) => {
    const x = left + i * 80;
    text(pdf, name, x + 2, 150, { font: "Allura", size: 24, color: [30, 30, 50], maxWidth: 52, minSize: 14 });
    text(pdf, name, x, 163, { font: "Inter", size: 8.5, color: ink, bold: true });
    text(pdf, ROLE, x, 168, { font: "Inter", size: 7.5, color: gray });
  });
  text(pdf, c.certificateId, left, 183, { font: "Inter", size: 5.5, color: gray, maxWidth: 70 });
  text(pdf, "Issued by MyLoginn Learning · Scan the QR code to verify", left, 190, { font: "Inter", size: 6, color: gray });
  text(pdf, iso(c.completedAt), left + 80, 183, { font: "Inter", size: 8, color: gray });
}

/* ───────────── Design 3 · Modern lavender (gradient header, corner bursts, certificate-ID footer) ───────────── */
function burst(pdf: Pdf, x: number, y: number, r: number, color: RGB, rays = 10) {
  for (let i = 0; i < 16; i++) withOpacity(pdf, 0.07, () => { pdf.setFillColor(...color); pdf.circle(x, y, r * (1 - i / 16), "F"); });
  withOpacity(pdf, 0.55, () => { pdf.setFillColor(255, 255, 255); pdf.circle(x, y, r * 0.16, "F"); });
  pdf.setDrawColor(...color); pdf.setLineWidth(0.2);
  withOpacity(pdf, 0.5, () => { for (let i = 0; i < rays; i++) { const a = (Math.PI * 2 * i) / rays; pdf.line(x, y, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); } });
}

function drawLavender(pdf: Pdf, c: Content, W: number, H: number) {
  const purple: RGB = [92, 80, 164], navy: RGB = [36, 32, 92], bg: RGB = [253, 241, 251], text2: RGB = [60, 52, 112];
  pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(...bg); pdf.roundedRect(3, 3, W - 6, H - 6, 4, 4, "F");
  // Top gradient band fading from deep violet to the card colour.
  for (let i = 0; i < 90; i++) {
    pdf.setFillColor(...mix([96, 84, 170], bg, Math.pow(i / 89, 0.7)));
    pdf.rect(3 + i * 2.7, 3, 2.9, 18, "F");
  }
  burst(pdf, 8, 8, 30, purple); burst(pdf, W - 15, 20, 15, purple); burst(pdf, 16, H - 20, 15, purple); burst(pdf, W - 8, H - 8, 28, purple, 8);
  pdf.setDrawColor(...purple); pdf.setLineWidth(0.28);
  for (const y of [22, 25.5, H - 26, H - 22.5]) pdf.line(5, y, W - 5, y);
  for (const x of [11, 15, W - 50, W - 46]) pdf.line(x, 5, x, H - 5);
  pdf.setLineWidth(0.28);
  for (const [x1, y1, x2, y2] of [[5, 38, 38, 5], [5, 42, 42, 5], [W - 5, H - 38, W - 38, H - 5], [W - 5, H - 42, W - 42, H - 5]]) pdf.line(x1, y1, x2, y2);

  text(pdf, "Certificate of Completion", W / 2, 46, { font: "Poppins", size: 28, color: navy, align: "center", maxWidth: 186, minSize: 16 });
  // Gradient "certify" pill with sparkles.
  for (let i = 0; i < 120; i++) { pdf.setFillColor(...mix(bg, [176, 164, 220], Math.sin((i / 119) * Math.PI))); pdf.rect(W / 2 - 66 + i * 1.1, 62, 1.15, 9, "F"); }
  star(pdf, W / 2 - 62, 66.5, 2.2, purple, 4, -Math.PI / 2, 0.25); star(pdf, W / 2 + 62, 66.5, 2.2, purple, 4, -Math.PI / 2, 0.25);
  text(pdf, "This is to certify that", W / 2, 68.6, { font: "Poppins", size: 10, color: text2, align: "center" });
  text(pdf, c.learnerName, W / 2, 93, { font: "PoppinsMedium", size: 30, color: navy, align: "center", maxWidth: 190, minSize: 16 });

  // "Completed the <course>." with the course title in bold.
  const lead = "Completed the ", tail = ".";
  let size = 11;
  pdf.setFontSize(size); pdf.setFont("Poppins", "normal"); const wLead = pdf.getTextWidth(lead);
  pdf.setFont("Poppins", "bold"); let wTitle = pdf.getTextWidth(c.courseTitle);
  while (wLead + wTitle + 2 > 190 && size > 7) { size -= 0.5; pdf.setFontSize(size); pdf.setFont("Poppins", "normal"); wTitle = pdf.getTextWidth(c.courseTitle); }
  pdf.setFontSize(size); pdf.setFont("Poppins", "normal");
  const wl = pdf.getTextWidth(lead), wt = (pdf.setFont("Poppins", "bold"), pdf.getTextWidth(c.courseTitle)), wd = (pdf.setFont("Poppins", "normal"), pdf.getTextWidth(tail));
  let x0 = W / 2 - (wl + wt + wd) / 2;
  text(pdf, lead, x0, 111, { font: "Poppins", size, color: text2 });
  text(pdf, c.courseTitle, (x0 += wl), 111, { font: "Poppins", style: "bold", size, color: navy });
  text(pdf, tail, x0 + wt, 111, { font: "Poppins", size, color: text2 });
  text(pdf, "You have mastered every lesson and challenge in this course.", W / 2, 118, { font: "Poppins", size: 10, color: text2, align: "center" });

  // Badge between the signature blocks.
  const bx = W / 2, by = 147;
  scallop(pdf, bx, by, 12.5, 18, 2.6, navy);
  pdf.setFillColor(...navy); pdf.circle(bx, by, 14, "F");
  pdf.setDrawColor(199, 190, 232); pdf.setLineWidth(0.3); pdf.circle(bx, by, 11.2, "S");
  text(pdf, "MyLoginn", bx, by - 0.4, { font: "PoppinsMedium", size: 6.5, color: [255, 255, 255], align: "center" });
  text(pdf, "Learning", bx, by + 3.2, { font: "Poppins", size: 5, color: [214, 208, 240], align: "center" });

  SIGNATORIES.forEach((name, i) => {
    const x = i === 0 ? 74 : W - 74;
    text(pdf, name, x, 139, { font: "Allura", size: 22, color: navy, align: "center", maxWidth: 52, minSize: 14 });
    text(pdf, name, x, 148, { font: "Poppins", style: "bold", size: 8.5, color: navy, align: "center" });
    pdf.setDrawColor(...navy); pdf.setLineWidth(0.3); pdf.line(x - 22, 150.5, x + 22, 150.5);
    text(pdf, ROLE, x, 155, { font: "Poppins", size: 7.5, color: text2, align: "center" });
  });
  text(pdf, "Issued by MyLoginn Learning · Verified certificate", W / 2, 180, { font: "Poppins", size: 6.5, color: text2, align: "center" });
  text(pdf, `Certificate ID: ${c.certificateId}`, 58, 172, { font: "Poppins", size: 7, color: text2 });
  text(pdf, `Issuing Date: ${dotted(c.issuedAt)}`, W - 58, 172, { font: "Poppins", size: 7, color: text2, align: "right" });
}

async function loadFonts(pdf: Pdf, style: CertificateStyle) {
  const dir = path.join(process.cwd(), "public", "fonts");
  const files: [string, string, string][] = [["Allura-Regular.ttf", "Allura", "normal"]];
  if (style === "classic-seal") files.push(["EBGaramond-Regular.ttf", "EBGaramond", "normal"], ["EBGaramond-Italic.ttf", "EBGaramond", "italic"]);
  else if (style === "navy-ribbon") files.push(["EBGaramond-Regular.ttf", "EBGaramond", "normal"], ["EBGaramond-Italic.ttf", "EBGaramond", "italic"], ["Inter-Regular.ttf", "Inter", "normal"]);
  else files.push(["Poppins-Regular.ttf", "Poppins", "normal"], ["Poppins-SemiBold.ttf", "Poppins", "bold"], ["Poppins-Medium.ttf", "PoppinsMedium", "normal"]);
  const buffers = await Promise.all(files.map(([file]) => readFile(path.join(dir, file))));
  files.forEach(([file, family, fontStyle], i) => {
    pdf.addFileToVFS(`${family}-${fontStyle}-${file}`, buffers[i].toString("base64"));
    pdf.addFont(`${family}-${fontStyle}-${file}`, family, fontStyle);
  });
}

export async function createCourseCertificatePdf({ style, ...content }: CourseCertificatePdfInput) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  await loadFonts(pdf, style);
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
  if (style === "classic-seal") drawClassic(pdf, content, W, H);
  else if (style === "navy-ribbon") drawNavy(pdf, content, W, H);
  else drawLavender(pdf, content, W, H);
  return Buffer.from(pdf.output("arraybuffer"));
}
