export type CourseMaterialLesson = {
  title: string;
  definition: string;
  overview: string;
  explanation: string;
  takeaways: string[];
  exampleTitle: string;
  code: string;
  output: string;
  challenge?: string;
};

export type CourseMaterial = {
  courseTitle: string;
  description: string;
  modules: { title: string; lessons: CourseMaterialLesson[] }[];
};

function cleanPdfText(value: string) {
  return value.replace(/[→➜]/g, "->").replace(/[·•]/g, " | ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/ /g, " ");
}

/** One PDF with the whole course: a contents page, then every module and lesson with its example and takeaways. */
export async function downloadCourseMaterialPdf(material: CourseMaterial, logoData?: string) {
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

  const writeParagraph = (text: string, options: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number; indent?: number } = {}) => {
    const { size = 10, bold = false, color = [38, 49, 67], gap = 2, indent = 0 } = options;
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(cleanPdfText(text), contentWidth - indent);
    const lineHeight = size * 0.48;
    nextPageIfNeeded(lines.length * lineHeight + gap);
    pdf.text(lines, margin + indent, y);
    y += lines.length * lineHeight + gap;
  };

  const writeCode = (code: string) => {
    pdf.setFont("courier", "normal");
    pdf.setFontSize(8.5);
    const wrapped = cleanPdfText(code).split("\n").flatMap((line) => pdf.splitTextToSize(line || " ", contentWidth - 10));
    const lineHeight = 4.5;
    const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 10) / lineHeight);
    for (let offset = 0; offset < wrapped.length; offset += maxLinesPerPage) {
      const pageLines = wrapped.slice(offset, offset + maxLinesPerPage);
      const boxHeight = pageLines.length * lineHeight + 8;
      nextPageIfNeeded(boxHeight + 6);
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "F");
      pdf.setTextColor(226, 232, 240);
      pdf.text(pageLines, margin + 5, y + 6);
      y += boxHeight + 6;
    }
  };

  // Cover
  if (logoData) {
    pdf.addImage(logoData, "PNG", (pageWidth - 24) / 2, y + 20, 24, 24);
    y += 52;
  } else {
    y += 30;
  }
  writeParagraph("MyLoginn Learning", { size: 11, bold: true, color: [37, 87, 189], gap: 6 });
  writeParagraph(material.courseTitle, { size: 26, bold: true, color: [15, 23, 42], gap: 4 });
  writeParagraph("Complete course study material", { size: 12, color: [100, 116, 139], gap: 8 });
  writeParagraph(material.description, { gap: 8 });
  const lessonTotal = material.modules.reduce((count, module) => count + module.lessons.length, 0);
  writeParagraph(`${material.modules.length} modules | ${lessonTotal} lessons`, { bold: true, color: [37, 87, 189] });

  // Contents
  pdf.addPage();
  y = margin;
  writeParagraph("Contents", { size: 18, bold: true, color: [15, 23, 42], gap: 5 });
  let number = 0;
  material.modules.forEach((module, moduleIndex) => {
    writeParagraph(`Module ${moduleIndex + 1}: ${module.title}`, { size: 11, bold: true, color: [31, 78, 158], gap: 1.5 });
    for (const lesson of module.lessons) writeParagraph(`${++number}. ${lesson.title}`, { size: 9, indent: 5, gap: 1 });
    y += 2;
  });

  // Lessons
  number = 0;
  material.modules.forEach((module, moduleIndex) => {
    pdf.addPage();
    y = margin;
    writeParagraph(`MODULE ${moduleIndex + 1}`, { size: 9, bold: true, color: [37, 87, 189], gap: 1 });
    writeParagraph(module.title, { size: 20, bold: true, color: [15, 23, 42], gap: 6 });
    for (const lesson of module.lessons) {
      nextPageIfNeeded(40);
      y += 3;
      pdf.setDrawColor(191, 219, 254);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;
      writeParagraph(`${++number}. ${lesson.title}`, { size: 14, bold: true, color: [31, 78, 158], gap: 2 });
      writeParagraph(lesson.definition, { bold: true });
      writeParagraph(lesson.overview);
      writeParagraph(lesson.explanation);
      writeParagraph(lesson.exampleTitle, { size: 11, bold: true, color: [15, 23, 42], gap: 2 });
      writeCode(lesson.code);
      writeParagraph(`Expected result: ${lesson.output}`, { color: [22, 101, 52] });
      if (lesson.takeaways.length) {
        writeParagraph("Key takeaways", { size: 10.5, bold: true, color: [15, 23, 42], gap: 1.5 });
        for (const takeaway of lesson.takeaways) writeParagraph(`- ${takeaway}`, { indent: 3, gap: 1 });
      }
      if (lesson.challenge) writeParagraph(`Practice: ${lesson.challenge}`, { color: [100, 116, 139] });
    }
  });

  // Footer on every page
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(cleanPdfText(`MyLoginn Learning | ${material.courseTitle} | For personal learning`), margin, pageHeight - 8);
    pdf.text(`${page} / ${pages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  const fileSlug = material.courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  pdf.save(`${fileSlug}-course-materials.pdf`);
}
