import type { TutorialLesson } from "@/lib/freeCourseTutorial";

type LessonPdfInput = { courseTitle: string; title: string; lesson: TutorialLesson; logoData?: string };

function cleanPdfText(value: string) {
  return value.replace(/[→➜]/g, "->").replace(/[·•]/g, " | ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\u00a0/g, " ");
}

export async function downloadLessonPdf({ courseTitle, title, lesson, logoData }: LessonPdfInput) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const nextPageIfNeeded = (height: number) => {
    if (y + height <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  };

  const writeParagraph = (text: string, options: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {}) => {
    const { size = 10, bold = false, color = [38, 49, 67], gap = 2 } = options;
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(cleanPdfText(text), contentWidth);
    const lineHeight = size * 0.48;
    nextPageIfNeeded(lines.length * lineHeight + gap);
    pdf.text(lines, margin, y);
    y += lines.length * lineHeight + gap;
  };

  const writeHeading = (text: string) => {
    y += 3;
    writeParagraph(text, { size: 14, bold: true, color: [31, 78, 158], gap: 2 });
  };

  const writeCode = (code: string) => {
    const lines = cleanPdfText(code).split("\n");
    pdf.setFont("courier", "normal");
    pdf.setFontSize(8.5);
    const wrapped = lines.flatMap((line) => pdf.splitTextToSize(line || " ", contentWidth - 10));
    const lineHeight = 4.5;
    const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 10) / lineHeight);
    for (let offset = 0; offset < wrapped.length; offset += maxLinesPerPage) {
      const pageLines = wrapped.slice(offset, offset + maxLinesPerPage);
      const boxHeight = pageLines.length * lineHeight + 8;
      // jsPDF text y-coordinates are baselines. Leave enough space after the
      // code box for the next paragraph's glyphs to sit fully below its border.
      nextPageIfNeeded(boxHeight + 6);
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "F");
      pdf.setTextColor(226, 232, 240);
      pdf.text(pageLines, margin + 5, y + 6);
      y += boxHeight + 6;
    }
  };

  if (logoData) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    const brandNameWidth = pdf.getTextWidth("MyLoginn Learning");
    const brandWidth = 12 + 4 + brandNameWidth;
    const brandX = (pageWidth - brandWidth) / 2;
    pdf.addImage(logoData, "PNG", brandX, y, 12, 12);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(37, 87, 189);
    pdf.text("MyLoginn Learning", brandX + 16, y + 8);
    y += 18;
  } else {
    writeParagraph("MyLoginn Learning", { size: 10, bold: true, color: [37, 87, 189], gap: 5 });
  }

  writeParagraph(title, { size: 23, bold: true, color: [15, 23, 42], gap: 1 });
  writeParagraph(`${courseTitle} | Lesson notes`, { size: 9, color: [100, 116, 139], gap: 5 });
  writeHeading("Lesson overview");
  writeParagraph(lesson.overview);
  writeHeading("Clear definition");
  writeParagraph(lesson.definition, { size: 11, bold: true });

  if (lesson.articleSections.length) {
    for (const section of lesson.articleSections) {
      writeHeading(section.title);
      for (const paragraph of section.paragraphs) writeParagraph(paragraph);
      if (section.bullets) for (const bullet of section.bullets) writeParagraph(`- ${bullet}`);
      if (section.code) writeCode(section.code);
      if (section.links) for (const link of section.links) {
        writeParagraph(link.label, { bold: true, color: [37, 87, 189] });
        writeParagraph(link.detail);
        writeParagraph(link.href, { size: 8, color: [71, 85, 105] });
      }
    }
  } else {
    writeHeading("Key ideas");
    for (const point of lesson.keyPoints) {
      writeParagraph(point.title, { bold: true });
      writeParagraph(point.detail);
    }
  }

  writeHeading(lesson.visual.caption);
  for (const node of lesson.visual.nodes) {
    const detailLines = node.detail ? pdf.splitTextToSize(cleanPdfText(node.detail), contentWidth - 10) : [];
    const valueLines = pdf.splitTextToSize(cleanPdfText(node.value), contentWidth - 10);
    const boxHeight = 13 + (valueLines.length + detailLines.length) * 4.7;
    nextPageIfNeeded(boxHeight + 3);
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(191, 219, 254);
    pdf.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(37, 87, 189);
    pdf.text(cleanPdfText(node.label), margin + 5, y + 5);
    pdf.setFontSize(10);
    pdf.setTextColor(30, 41, 59);
    pdf.text(valueLines, margin + 5, y + 10);
    if (detailLines.length) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(detailLines, margin + 5, y + 10 + valueLines.length * 4.7);
    }
    y += boxHeight + 3;
  }
  writeParagraph(lesson.visual.summary);
  writeHeading("How it works");
  writeParagraph(lesson.explanation);
  writeHeading("Why it matters");
  writeParagraph(lesson.realWorld);

  if (!title.toLowerCase().includes("installation")) {
    writeHeading(lesson.exampleTitle);
    writeParagraph(lesson.exampleIntroduction);
    writeCode(lesson.code);
    writeParagraph(`Expected result: ${lesson.output}`, { color: [22, 101, 52] });
    writeHeading("Step-by-step walkthrough");
    for (const [index, step] of lesson.steps.entries()) {
      writeCode(step.code);
      writeParagraph(`Step ${index + 1}: ${step.explanation}`);
    }
  }

  writeHeading("Knowledge check");
  for (const [questionIndex, question] of lesson.quiz.entries()) {
    writeParagraph(`${questionIndex + 1}. ${question.question}`, { bold: true });
    question.options.forEach((option, optionIndex) => writeParagraph(`${String.fromCharCode(65 + optionIndex)}. ${option.text}`));
    const answerIndex = question.options.findIndex((option) => option.id === question.answer);
    writeParagraph(`Answer: ${String.fromCharCode(65 + answerIndex)}. ${question.explanation}`, { color: [22, 101, 52] });
  }
  writeHeading("Best practice");
  writeParagraph(lesson.bestPractice);
  writeHeading("Key takeaways");
  for (const item of lesson.takeaways) writeParagraph(`- ${item}`);

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    if (logoData) {
      pdf.setGState(pdf.GState({ opacity: 0.065 }));
      pdf.addImage(logoData, "PNG", pageWidth / 2 - 42, pageHeight / 2 - 42, 84, 84);
      pdf.setGState(pdf.GState({ opacity: 1 }));
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`MyLoginn Learning  |  ${page} / ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-myloginn-lesson.pdf`;
  pdf.save(filename);
}
