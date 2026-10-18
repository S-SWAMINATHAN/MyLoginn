import type { PracticeReport } from "./report";
import { band } from "./speech";

/** Professional assessment-style PDF for any Practice report. Runs in the browser (jsPDF is loaded on demand). */

export type PdfMeta = { studentName: string; studentEmail?: string; reportNo: string; sessionId: string; date: string; moduleLabel: string; participants?: string[] };

type RGB = [number, number, number];
const NAVY: RGB = [15, 33, 74], ROYAL: RGB = [31, 86, 214], INK: RGB = [38, 49, 67], MUTED: RGB = [100, 116, 139], LINE: RGB = [226, 232, 240];
const scoreColor = (s: number): RGB => (s >= 80 ? [5, 150, 105] : s >= 70 ? [37, 99, 235] : s >= 60 ? [217, 119, 6] : [220, 38, 38]);
const clean = (v: string) => v.replace(/[→➜]/g, "->").replace(/[·•]/g, "|").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, "-").replace(/≈/g, "~").replace(/×/g, "x").replace(/ /g, " ").replace(/[^\x20-\x7E\n]/g, "");

async function logo(): Promise<string | null> {
  try {
    const res = await fetch("/myloginn-logo.png");
    const blob = await res.blob();
    return await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => resolve(null); r.readAsDataURL(blob); });
  } catch {
    return null;
  }
}

export async function downloadReportPdf(report: PracticeReport, meta: PdfMeta) {
  const [{ jsPDF }, logoData] = await Promise.all([import("jspdf"), logo()]);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 16, CW = W - M * 2;
  let y = 0;

  const ensure = (h: number) => { if (y + h > H - 18) { pdf.addPage(); y = 20; } };
  const text = (value: string, opts: { size?: number; bold?: boolean; color?: RGB; x?: number; width?: number; gap?: number } = {}) => {
    const { size = 9.5, bold = false, color = INK, x = M, width = CW, gap = 1.5 } = opts;
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(clean(value), width) as string[];
    const lh = size * 0.45;
    for (const line of lines) { ensure(lh); pdf.text(line, x, y + lh * 0.8); y += lh; }
    y += gap;
  };
  const heading = (value: string) => {
    ensure(14);
    y += 4;
    pdf.setFillColor(...ROYAL);
    pdf.rect(M, y + 0.6, 1.4, 5, "F");
    text(value, { size: 12, bold: true, color: NAVY, x: M + 4, gap: 2.5 });
  };

  // ── Cover band ──
  pdf.setFillColor(...NAVY);
  pdf.rect(0, 0, W, 44, "F");
  if (logoData) { try { pdf.addImage(logoData, "PNG", M, 9, 12, 12); } catch { /* logo optional */ } }
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text("MyLoginn", M + (logoData ? 15 : 0), 17);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.text("AI Career Practice  |  Assessment Report", M + (logoData ? 15 : 0), 22);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(17); pdf.text(clean(report.title), M, 35);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text(clean(`${meta.moduleLabel}  |  ${report.subtitle}`), M, 40.5);
  pdf.setFontSize(8); pdf.text(`Report ID ${meta.reportNo}`, W - M, 17, { align: "right" }); pdf.text(meta.date, W - M, 22, { align: "right" });
  y = 52;

  // ── Candidate + score ──
  pdf.setDrawColor(...LINE); pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(M, y, CW, 34, 2.5, 2.5, "FD");
  const col = M + 5;
  const rows: [string, string][] = [["Student", meta.studentName], ["Session ID", meta.sessionId], ["Date", meta.date], ...(meta.participants?.length ? [["Participants", meta.participants.join(", ")] as [string, string]] : [])];
  rows.slice(0, 4).forEach(([k, v], i) => {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.setTextColor(...MUTED); pdf.text(k.toUpperCase(), col, y + 7 + i * 7);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...INK); pdf.text((pdf.splitTextToSize(clean(v), CW - 80) as string[])[0], col + 26, y + 7 + i * 7);
  });
  const cx = W - M - 22, cy = y + 17, sc: RGB = report.unscored ? MUTED : scoreColor(report.overall);
  pdf.setFillColor(...sc); pdf.circle(cx, cy, 13, "F");
  pdf.setFillColor(255, 255, 255); pdf.circle(cx, cy, 10.5, "F");
  pdf.setTextColor(...sc); pdf.setFont("helvetica", "bold"); pdf.setFontSize(16); pdf.text(report.unscored ? "-" : String(report.overall), cx, cy + 2, { align: "center" });
  if (!report.unscored) { pdf.setFontSize(6.5); pdf.text("/ 100", cx, cy + 6, { align: "center" }); }
  y += 40;
  text(report.unscored ? report.level : `Overall: ${report.overall}/100  -  ${report.level}`, { size: 11, bold: true, color: sc, gap: 3 });

  // ── Dimension chart ──
  if (report.dimensions.length) heading("Score breakdown");
  for (const d of report.dimensions) {
    ensure(7);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...INK); pdf.text(clean(d.label), M, y + 4);
    const bx = M + 50, bw = CW - 70;
    pdf.setFillColor(...LINE); pdf.roundedRect(bx, y + 1.2, bw, 3.4, 1.7, 1.7, "F");
    pdf.setFillColor(...scoreColor(d.score)); pdf.roundedRect(bx, y + 1.2, Math.max(2, (bw * d.score) / 100), 3.4, 1.7, 1.7, "F");
    pdf.setFont("helvetica", "bold"); pdf.text(`${d.score}`, W - M, y + 4, { align: "right" });
    y += 6.5;
  }
  y += 2;

  if (report.stats.length) {
    heading("Session details");
    const cols = 3, cw = CW / cols;
    report.stats.forEach((s, i) => {
      if (i % cols === 0) ensure(12);
      const x = M + (i % cols) * cw;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.setTextColor(...MUTED); pdf.text(clean(s.label).toUpperCase(), x, y + 3);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...INK); pdf.text(clean(s.value).slice(0, 34), x, y + 8);
      if (i % cols === cols - 1 || i === report.stats.length - 1) y += 12;
    });
  }

  heading("Summary");
  text(report.summary, { gap: 2 });

  for (const section of report.sections) {
    heading(section.title);
    if (section.kind === "text") text(section.text);
    else if (section.kind === "list") section.items.forEach((item, i) => text(`${section.tone === "plan" ? `${i + 1}.` : "-"}  ${item}`, { x: M + 2, width: CW - 2, gap: 1.2 }));
    else if (section.kind === "pairs")
      section.pairs.forEach((p) => {
        text(`Said: ${p.said}`, { color: [185, 28, 28], gap: 0.4 });
        text(`Better: ${p.better}`, { color: [4, 120, 87], gap: p.why ? 0.4 : 2 });
        if (p.why) text(`Why: ${p.why}`, { color: MUTED, size: 8.5, gap: 2.5 });
      });
    else if (section.kind === "table") {
      text(section.columns.join("   |   "), { bold: true, size: 8.5, color: MUTED, gap: 1 });
      section.rows.forEach((r) => text(r.join("   |   "), { size: 9, gap: 1 }));
    } else if (section.kind === "qa")
      section.items.forEach((q, i) => {
        ensure(16);
        text(`Q${i + 1}${q.stage ? ` (${q.stage})` : ""}: ${q.q}`, { bold: true, gap: 0.8 });
        if (q.a) text(`Answer: ${q.a}`, { color: MUTED, size: 8.8, gap: 0.8 });
        if (typeof q.score === "number") text(`Score: ${q.score}/100 - ${band(q.score)}`, { size: 8.8, bold: true, color: scoreColor(q.score), gap: 0.8 });
        if (q.feedback) text(`Feedback: ${q.feedback}`, { size: 8.8, gap: 0.8 });
        if (q.better) text(`Stronger answer: ${q.better}`, { size: 8.8, color: [4, 120, 87], gap: 3 });
        else y += 2;
      });
  }

  // ── Footer on every page ──
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(...LINE); pdf.line(M, H - 13, W - M, H - 13);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(...MUTED);
    pdf.text("AI-generated practice assessment. A practice indicator only - not a guarantee of selection or employment.", M, H - 8.5);
    pdf.text(`${meta.reportNo}  |  Page ${p} of ${pages}`, W - M, H - 8.5, { align: "right" });
  }
  pdf.save(`MyLoginn-${clean(report.title).replace(/[^A-Za-z0-9]+/g, "-")}-${meta.reportNo}.pdf`);
}
