import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { CERTIFICATE_LABEL, type CertificateKind } from "../types";

type RGB = [number, number, number];
export type CompetitionCertificateInput = {
  kind: CertificateKind;
  candidateName: string;
  candidateId: string;
  competitionTitle: string;
  competitionDate: Date;
  timezone: string;
  issuedAt: Date;
  code: string;
  rank: number | null;
  verifyUrl: string;
};

const SIGNATORIES = ["Saravanakumar", "Swaminathan S"];
const NAVY: RGB = [15, 30, 76];
const BLUE: RGB = [37, 99, 235];
const SKY: RGB = [224, 236, 255];
const MUTED: RGB = [90, 102, 128];
const AWARD: Record<CertificateKind, { accent: RGB; soft: RGB; title: string; line: string }> = {
  PARTICIPATION: { accent: BLUE, soft: SKY, title: "CERTIFICATE OF PARTICIPATION", line: "has successfully participated in" },
  WINNER: { accent: [191, 140, 30], soft: [253, 243, 214], title: "CERTIFICATE OF ACHIEVEMENT", line: "is awarded First Place — Winner of" },
  RUNNER_UP: { accent: [120, 132, 150], soft: [238, 241, 246], title: "CERTIFICATE OF ACHIEVEMENT", line: "is awarded Second Place — Runner-up of" },
  SECOND_RUNNER_UP: { accent: [176, 104, 52], soft: [250, 236, 224], title: "CERTIFICATE OF ACHIEVEMENT", line: "is awarded Third Place — Second Runner-up of" },
};

async function asset(file: string) {
  try {
    return `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", file))).toString("base64")}`;
  } catch {
    return undefined;
  }
}

/** A4 landscape PDF using the official MyLoginn logo and wordmark from /public (never redrawn). */
export async function competitionCertificatePdf(input: CompetitionCertificateInput): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297, H = 210;
  const a = AWARD[input.kind];
  const [logo, wordmark] = await Promise.all([asset("myloginn-logo.png"), asset("myloginn-wordmark.png")]);

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, W, H, "F");
  // Frame: soft band, then a thin accent rule.
  pdf.setFillColor(...a.soft);
  pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(9, 9, W - 18, H - 18, 3, 3, "F");
  pdf.setDrawColor(...a.accent);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(13, 13, W - 26, H - 26, 2, 2, "S");
  pdf.setLineWidth(0.25);
  pdf.roundedRect(15.5, 15.5, W - 31, H - 31, 1.5, 1.5, "S");
  // Corner accents.
  pdf.setFillColor(...a.accent);
  for (const [x, y] of [[13, 13], [W - 13, 13], [13, H - 13], [W - 13, H - 13]] as const) pdf.circle(x, y, 1.6, "F");

  // Brand
  if (wordmark) pdf.addImage(wordmark, "PNG", W / 2 - 30, 24, 60, 60 / 7.16, undefined, "FAST");
  else if (logo) pdf.addImage(logo, "PNG", W / 2 - 9, 22, 18, 18, undefined, "FAST");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text("MYLOGINN TECH  ·  CODING COMPETITION", W / 2, 41, { align: "center", charSpace: 0.6 });

  pdf.setFont("times", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(...NAVY);
  pdf.text(a.title, W / 2, 58, { align: "center", charSpace: 0.8 });
  pdf.setDrawColor(...a.accent);
  pdf.setLineWidth(0.6);
  pdf.line(W / 2 - 34, 63, W / 2 + 34, 63);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...MUTED);
  pdf.text("This is to certify that", W / 2, 76, { align: "center" });

  pdf.setFont("times", "bolditalic");
  let size = 34;
  pdf.setFontSize(size);
  while (pdf.getTextWidth(input.candidateName) > W - 90 && size > 18) pdf.setFontSize((size -= 1));
  pdf.setTextColor(...NAVY);
  pdf.text(input.candidateName, W / 2, 93, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text(`Candidate ID ${input.candidateId}`, W / 2, 101, { align: "center" });

  pdf.setFontSize(12);
  pdf.setTextColor(60, 70, 95);
  pdf.text(a.line, W / 2, 114, { align: "center" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(...NAVY);
  pdf.text(input.competitionTitle, W / 2, 124, { align: "center", maxWidth: W - 80 });
  const held = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: input.timezone }).format(input.competitionDate);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...MUTED);
  pdf.text(`held online on ${held}, organised by MyLoginn Tech.`, W / 2, 133, { align: "center" });

  // Award badge for the Top 3
  if (input.kind !== "PARTICIPATION" && input.rank) {
    const bx = 48, by = 120;
    pdf.setFillColor(...a.accent);
    pdf.circle(bx, by, 15, "F");
    pdf.setFillColor(255, 255, 255);
    pdf.circle(bx, by, 12, "F");
    pdf.setFillColor(...a.accent);
    pdf.circle(bx, by, 10.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`#${input.rank}`, bx, by + 2, { align: "center" });
    pdf.setFontSize(7);
    pdf.setTextColor(...a.accent);
    pdf.text(CERTIFICATE_LABEL[input.kind].split(" — ")[0].toUpperCase(), bx, by + 21, { align: "center" });
  }

  // Signatories
  const sigY = 168;
  SIGNATORIES.forEach((name, i) => {
    const x = i === 0 ? 95 : W - 95;
    pdf.setDrawColor(170, 178, 196);
    pdf.setLineWidth(0.3);
    pdf.line(x - 28, sigY, x + 28, sigY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...NAVY);
    pdf.text(name, x, sigY + 5.5, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text("Authorized Signatory, MyLoginn Tech", x, sigY + 10, { align: "center" });
  });

  // Verification
  const qrSize = 24, qx = W - 22 - qrSize, qy = H - 22 - qrSize;
  const { modules } = QRCode.create(input.verifyUrl, { errorCorrectionLevel: "M" });
  const cell = qrSize / modules.size;
  pdf.setFillColor(...NAVY);
  for (let r = 0; r < modules.size; r++) for (let c = 0; c < modules.size; c++) if (modules.get(r, c)) pdf.rect(qx + c * cell, qy + r * cell, cell + 0.02, cell + 0.02, "F");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text(`Certificate ID: ${input.code}`, 22, H - 27);
  pdf.text(`Issued: ${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: input.timezone }).format(input.issuedAt)}`, 22, H - 23);
  pdf.text(`Verify: ${input.verifyUrl}`, 22, H - 19);
  if (logo) pdf.addImage(logo, "PNG", qx - 14, qy + qrSize - 10, 10, 10, undefined, "FAST");

  return Buffer.from(pdf.output("arraybuffer"));
}
