"use client";

import { useState } from "react";
import { Download, FileDown } from "lucide-react";
import type { TutorialLesson } from "@/lib/freeCourseTutorial";
import { downloadLessonPdf } from "@/lib/createLessonPdf";

type Props = { courseTitle: string; title: string; lesson: TutorialLesson };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function section(heading: string, body: string) {
  return `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p></section>`;
}

export function DownloadLessonMaterial({ courseTitle, title, lesson }: Props) {
  const isPythonInstallation = courseTitle.toLowerCase().includes("python") && title.trim().toLowerCase() === "python installation";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    try {
      let logo = "";
      try {
        const response = await fetch("/myloginn-logo.png");
        if (response.ok) {
          const bytes = new Uint8Array(await response.arrayBuffer());
          let binary = "";
          for (let offset = 0; offset < bytes.length; offset += 0x8000) {
            binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
          }
          logo = `data:image/png;base64,${btoa(binary)}`;
        }
      } catch {
        // The lesson content remains downloadable if the logo asset is unavailable.
      }

      const visualSteps = lesson.steps.map((step, index) => `<li><strong>Step ${index + 1}</strong><pre><code>${escapeHtml(step.code)}</code></pre><p>${escapeHtml(step.explanation)}</p></li>`).join("");
      const takeaways = lesson.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      const keyPoints = lesson.keyPoints.map((item) => `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.detail)}</li>`).join("");
      const quizQuestions = lesson.quiz.map((question, questionIndex) => {
        const quizOptions = question.options.map((option, optionIndex) => `<li><strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${escapeHtml(option.text)}</li>`).join("");
        const answerIndex = question.options.findIndex((option) => option.id === question.answer);
        return `<section><h3>Question ${questionIndex + 1}: ${escapeHtml(question.question)}</h3><ul>${quizOptions}</ul><p><strong>Answer: ${String.fromCharCode(65 + answerIndex)}.</strong> ${escapeHtml(question.explanation)}</p></section>`;
      }).join("");
      const articleSections = lesson.articleSections.map((item) => `<section><h2>${escapeHtml(item.title)}</h2>${item.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${item.bullets ? `<ul>${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}${item.code ? `<pre><code>${escapeHtml(item.code)}</code></pre>` : ""}${item.links ? `<ul>${item.links.map((link) => `<li><a href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a> — ${escapeHtml(link.detail)}</li>`).join("")}</ul>` : ""}</section>`).join("");
      const visualChart = `<section><h2>${escapeHtml(lesson.visual.caption)}</h2><ol>${lesson.visual.nodes.map((node) => `<li><strong>${escapeHtml(node.label)}: ${escapeHtml(node.value)}</strong>${node.detail ? `<p>${escapeHtml(node.detail)}</p>` : ""}</li>`).join("")}</ol><p>${escapeHtml(lesson.visual.summary)}</p></section>`;
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)} | MyLoginn Learning</title><style>
        :root{font-family:Arial,sans-serif;color:#1e293b;background:#f8fafc}body{max-width:850px;margin:0 auto;padding:42px 24px;line-height:1.65;background:#fff;position:relative}body:before{content:"";position:fixed;inset:0;background-image:url('${logo}');background-repeat:no-repeat;background-position:center;background-size:min(55vw,430px);opacity:.045;pointer-events:none;z-index:0}body>*{position:relative}header{border-bottom:2px solid #dbeafe;padding-bottom:20px;margin-bottom:26px}.brand{display:flex;align-items:center;gap:12px;color:#2457bd;font-weight:700}.brand img{width:46px;height:46px;object-fit:contain}h1{font-size:30px;line-height:1.2;margin:24px 0 8px}h2{font-size:19px;color:#2457bd;margin:28px 0 8px}p{margin:8px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0f172a;color:#e2e8f0;padding:16px;border-radius:10px}code{font-family:Consolas,monospace}.output{background:#effdf5;color:#166534;padding:14px;border-radius:10px;white-space:pre-wrap}.step{border-left:3px solid #60a5fa;padding-left:16px;margin:18px 0}footer{border-top:1px solid #cbd5e1;margin-top:38px;padding-top:14px;color:#64748b;font-size:12px}@media print{body{padding:10mm;background:#fff}body:before{position:fixed;print-color-adjust:exact;-webkit-print-color-adjust:exact}a{color:inherit}}
        </style></head><body><header><div class="brand">${logo ? `<img src="${logo}" alt="">` : ""}<span>MyLoginn Learning</span></div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(courseTitle)} · Free course lesson notes</p></header>
        ${articleSections || `${section("Lesson overview", lesson.overview)}${section("Definition", lesson.definition)}<section><h2>Key features and ideas</h2><ul>${keyPoints}</ul></section>`}${visualChart}${section("Key words", lesson.keywords.join(" · "))}${section("How it works", lesson.explanation)}${section("Why it matters", lesson.realWorld)}
        ${isPythonInstallation ? "" : `<section><h2>${escapeHtml(lesson.exampleTitle)}</h2><p>${escapeHtml(lesson.exampleIntroduction)}</p><pre><code>${escapeHtml(lesson.code)}</code></pre><h3>Expected output</h3><div class="output">${escapeHtml(lesson.output)}</div></section>
        <section><h2>Step-by-step code walkthrough</h2><ol>${visualSteps}</ol></section>`}
        <section><h2>Lesson quiz</h2>${quizQuestions}</section>
        ${section("Common mistake", lesson.mistake)}${section("Best practice", lesson.bestPractice)}${isPythonInstallation ? section("Practice", lesson.practice) : lesson.requiresCodeChallenge ? `${section("Practice", lesson.practice)}${section("Code challenge", lesson.challenge)}` : ""}
        <section><h2>Key takeaways</h2><ul>${takeaways}</ul></section><footer>MyLoginn Learning · Free study material · For personal learning</footer></body></html>`;
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-myloginn-lesson.html`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("The lesson document could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    setBusy(true);
    setError("");
    try {
      let logoData = "";
      const response = await fetch("/myloginn-logo.png");
      if (response.ok) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = "";
        for (let offset = 0; offset < bytes.length; offset += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
        }
        logoData = `data:image/png;base64,${btoa(binary)}`;
      }
      await downloadLessonPdf({ courseTitle, title, lesson, logoData });
    } catch {
      setError("The PDF could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex flex-col items-stretch gap-1.5 sm:items-start">
    <div className="grid gap-2 min-[480px]:grid-cols-2 sm:flex sm:flex-wrap [&>button]:justify-center">
      <button type="button" onClick={downloadPdf} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-100 disabled:cursor-wait disabled:opacity-60">
        <FileDown className="h-4 w-4" aria-hidden="true" />{busy ? "Preparing PDF…" : "Download PDF"}
      </button>
      <button type="button" onClick={download} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-wait disabled:opacity-60">
        <Download className="h-4 w-4 text-brand-600" aria-hidden="true" />{busy ? "Preparing notes…" : "Download HTML notes"}
      </button>
    </div>
    <p className="text-xs text-muted">PDF and HTML lesson notes include a MyLoginn logo watermark.</p>
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
  </div>;
}
