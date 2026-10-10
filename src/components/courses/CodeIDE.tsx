"use client";

import Image from "next/image";
import { Check, CircleDashed, Gift, Lock, LockOpen, Copy, FileCode2, Keyboard, Lightbulb, ListChecks, Moon, Play, RotateCcw, Send, Sun, Terminal, X, BookOpenCheck, Eye } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { deriveChecks, evaluateChecks } from "@/lib/challengeChecks";

type Props = {
  courseSlug: string; courseTitle: string; topicSlug: string; moduleTitle: string; isLastTopicInModule: boolean; nextHref: string;
  starterCode: string; solutionCode: string; expectedOutput: string; canRunPython: boolean; canRunSql: boolean; needsInput: boolean; hints: string[];
  kind?: string; challengeTitle?: string; sampleInput?: string[]; stdinDefault?: string;
};

type PythonRuntime = {
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
  setStdin: (options: { stdin: () => number | null }) => void;
  runPythonAsync: (source: string) => Promise<unknown>;
};

function makeHtmlPreview(source: string) {
  return /<html[\s>]/i.test(source)
    ? source
    : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${source}</body></html>`;
}

function makeCssPreview(source: string) {
  const safeCss = source.replace(/<\/style/gi, "<\\/style");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font:16px system-ui,sans-serif;padding:24px;color:#172033}.course-card{max-width:560px;padding:24px;border:1px solid #cbd5e1;border-radius:16px;background:#fff}.course-card a{color:#2563eb}</style><style>${safeCss}</style></head><body><main class="course-card"><h1>Web Development</h1><p>Practice styling this course card with your CSS.</p><a href="#preview">Explore lessons</a><button type="button">Start learning</button></main></body></html>`;
}

declare global {
  interface Window { loadMyLoginnPython?: (options: { indexURL: string }) => Promise<PythonRuntime> }
}

const extensionFor = (courseSlug: string) => ({
  "python-fundamentals": "py", "java-fundamentals": "java", "javascript-fundamentals": "js", "html-fundamentals": "html", "css-fundamentals": "css",
  "sql-fundamentals": "sql", "mysql-fundamentals": "sql", "c-fundamentals": "c", "cpp-fundamentals": "cpp", "php-fundamentals": "php", "react-fundamentals": "jsx",
} as Record<string, string>)[courseSlug] ?? "txt";

/** Line-numbered, aligned code listing used for the solution and the sample panels. */
function CodeListing({ code, light, accent }: { code: string; light: boolean; accent?: string }) {
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  return <ol className={`overflow-x-auto py-3 font-mono text-[13px] leading-6 ${accent ?? ""}`}>
    {lines.map((line, index) => <li key={index} className="grid min-w-max grid-cols-[2.75rem_1fr] pr-4">
      <span aria-hidden="true" className={`select-none pr-3 text-right ${light ? "text-slate-400" : "text-slate-500"}`}>{index + 1}</span>
      <span className="whitespace-pre">{line || " "}</span>
    </li>)}
  </ol>;
}

export function CodeIDE({ courseSlug, courseTitle, topicSlug, moduleTitle, isLastTopicInModule, nextHref, starterCode, solutionCode, expectedOutput, canRunPython, canRunSql, needsInput, hints, kind, challengeTitle, sampleInput = [], stdinDefault }: Props) {
  const [source, setSource] = useState(starterCode);
  const [stdin, setStdin] = useState(stdinDefault ?? "");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready");
  const [challengePassed, setChallengePassed] = useState(false);
  const [lastRun, setLastRun] = useState<{ source: string; output: string; passed: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<"ide" | "hints" | "solution">("ide");
  const [ideTheme, setIdeTheme] = useState<"dark" | "light">("dark");
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"output" | "expected" | "input">("output");
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [revealedHints, setRevealedHints] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [unlock, setUnlock] = useState<{ loggedIn: boolean; unlocked: boolean; cost: number; points: number; busy: boolean; error: string }>({ loggedIn: true, unlocked: false, cost: 8, points: 0, busy: false, error: "" });
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const runtimeRef = useRef<PythonRuntime | null>(null);
  const runtimePromiseRef = useRef<Promise<PythonRuntime> | null>(null);
  const python = courseSlug === "python-fundamentals";
  const htmlCourse = courseSlug === "html-fundamentals";
  const cssCourse = courseSlug === "css-fundamentals";

  const checks = useMemo(() => deriveChecks(courseSlug, solutionCode, kind), [courseSlug, solutionCode, kind]);
  const evaluation = useMemo(() => evaluateChecks(courseSlug, checks, source), [courseSlug, checks, source]);
  const metCount = evaluation.results.filter((result) => result.passed).length;

  const solutionApi = `/api/courses/${courseSlug}/topics/${topicSlug}/solution`;

  // Learn whether this solution was already unlocked, so it is never charged twice.
  useEffect(() => {
    let cancelled = false;
    fetch(solutionApi).then((response) => response.ok ? response.json() : null).then((data) => {
      if (cancelled || !data) return;
      setUnlock((current) => ({ ...current, loggedIn: data.loggedIn, unlocked: data.unlocked, cost: data.cost, points: data.points }));
    }).catch(() => { /* The lock panel still works; it re-checks on unlock. */ });
    return () => { cancelled = true; };
  }, [solutionApi]);

  async function unlockSolution() {
    setUnlock((current) => ({ ...current, busy: true, error: "" }));
    try {
      const response = await fetch(solutionApi, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setUnlock((current) => ({ ...current, busy: false, error: data.error || "Could not unlock the solution.", points: typeof data.points === "number" ? data.points : current.points }));
        return;
      }
      setUnlock((current) => ({ ...current, busy: false, unlocked: true, points: data.points, cost: data.cost }));
    } catch {
      setUnlock((current) => ({ ...current, busy: false, error: "Could not unlock the solution. Check your connection and try again." }));
    }
  }

  function clearResult(message: string) {
    setChallengePassed(false);
    setLastRun(null);
    setPreviewDocument(null);
    setStatus(message);
    setOutput("");
  }

  function updateSource(nextSource: string, caret?: number) {
    setSource(nextSource);
    clearResult("Code changed · ready to run");
    if (caret !== undefined) requestAnimationFrame(() => editorRef.current?.setSelectionRange(caret, caret));
  }

  function trackCursor(editor: HTMLTextAreaElement) {
    const before = editor.value.slice(0, editor.selectionStart);
    const lineStart = before.lastIndexOf("\n") + 1;
    setCursor({ line: before.split("\n").length, col: before.length - lineStart + 1 });
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = source.slice(start, end);
    const before = source.slice(0, start);
    const after = source.slice(end);
    const insert = (text: string, caretOffset: number) => {
      event.preventDefault();
      updateSource(`${before}${text}${after}`, start + caretOffset);
    };

    if (event.key === "Tab") {
      insert(`  ${selected}`, 2 + selected.length);
      return;
    }
    if (event.key === ">" && htmlCourse && start === end) {
      const openTag = before.match(/<([a-zA-Z][\w:-]*)(?:\s[^<>]*)?$/);
      const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
      if (openTag && !/\/\s*$/.test(before) && !voidTags.has(openTag[1].toLowerCase())) {
        insert(`></${openTag[1]}>`, 1);
        return;
      }
    }
    const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'", "`": "`" };
    if (pairs[event.key]) {
      const close = pairs[event.key];
      if (start === end && after.startsWith(close)) {
        event.preventDefault();
        editor.setSelectionRange(start + 1, start + 1);
      } else insert(`${event.key}${selected}${close}`, 1 + selected.length);
      return;
    }
    if (event.key === "Enter" && start === end) {
      const lineStart = before.lastIndexOf("\n") + 1;
      const indent = before.slice(lineStart).match(/^\s*/)?.[0] ?? "";
      const htmlClose = htmlCourse && after.match(/^<\/([a-zA-Z][\w:-]*)>/);
      if ((before.endsWith("{") && after.startsWith("}")) || htmlClose) {
        insert(`\n${indent}  \n${indent}`, indent.length + 3);
        return;
      }
      if (indent) insert(`\n${indent}`, indent.length + 1);
    }
  }

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("myloginn-ide-theme");
      if (savedTheme === "light" || savedTheme === "dark") setIdeTheme(savedTheme);
    } catch { /* The IDE works without a remembered theme. */ }
  }, []);

  function toggleIdeTheme() {
    const nextTheme = ideTheme === "dark" ? "light" : "dark";
    setIdeTheme(nextTheme);
    try { window.localStorage.setItem("myloginn-ide-theme", nextTheme); } catch { /* optional preference */ }
  }

  async function copySolution() {
    try {
      await navigator.clipboard.writeText(solutionCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* Clipboard access can be blocked; the solution stays selectable. */ }
  }

  async function savePassedChallenge(challengeOutput: string) {
    setStatus("Verifying challenge with your course progress…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    let response: Response;
    try {
      response = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/topics/${encodeURIComponent(topicSlug)}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, output: challengeOutput }),
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) throw new Error("Verification timed out. Your code ran, but progress was not saved. Check your connection and try again.");
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
    const payload = await response.json();
    if (!response.ok) throw new Error(response.status === 422 ? payload.error || "Challenge not passed yet. Check your code and try again." : payload.error || "Challenge verification failed.");
    setStatus(`Challenge passed · +${payload.pointsEarned ?? 0} points`);
    setChallengePassed(true);
    const eventDetail = {
      ...payload,
      topicSlug,
      courseTitle,
      moduleTitle,
      nextHref,
      completionType: payload.progress >= 100 ? "course" : isLastTopicInModule ? "module" : "topic",
    };
    window.dispatchEvent(new CustomEvent("myloginn:topic-completed", { detail: eventDetail }));
    if (payload.completed) window.dispatchEvent(new CustomEvent("myloginn:challenge-celebrated", { detail: eventDetail }));
  }

  async function loadRuntime() {
    if (runtimeRef.current) return runtimeRef.current;
    if (!runtimePromiseRef.current) {
      runtimePromiseRef.current = new Promise<PythonRuntime>((resolve, reject) => {
        const finishLoading = () => {
          if (!window.loadMyLoginnPython) {
            reject(new Error("The local Python runtime did not load."));
            return;
          }
          window.loadMyLoginnPython({ indexURL: "/pyodide/" }).then((runtime) => {
            runtimeRef.current = runtime;
            resolve(runtime);
          }, reject);
        };
        if (window.loadMyLoginnPython) {
          finishLoading();
          return;
        }
        const script = document.createElement("script");
        script.type = "module";
        script.src = "/python-runtime.js";
        script.onload = finishLoading;
        script.onerror = () => reject(new Error("Could not load the local Python runtime."));
        document.head.appendChild(script);
      });
    }
    return runtimePromiseRef.current;
  }

  async function runCode() {
    setConsoleTab("output");
    setOutput("");
    setLastRun(null);
    setPreviewDocument(null);
    if (canRunSql) {
      setStatus("Running query against practice database…");
      try {
        const response = await fetch("/api/courses/sql-practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: source, expectedQuery: solutionCode }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "The SQL query could not be run.");
        setOutput(result.output);
        setLastRun({ source, output: result.output, passed: Boolean(result.passed) });
        setStatus(result.passed ? "Run complete · submit to save progress" : "Query ran · result does not match the challenge yet");
      } catch (error) {
        setOutput(error instanceof Error ? error.message : String(error));
        setStatus("SQL error · edit your query and run again");
      }
      return;
    }
    if (htmlCourse || cssCourse) {
      const passed = evaluation.passed;
      setPreviewDocument(htmlCourse ? makeHtmlPreview(source) : makeCssPreview(source));
      setOutput(passed ? expectedOutput : "Live preview rendered. Keep going until every requirement in the checklist is met.");
      setLastRun({ source, output: expectedOutput, passed });
      setStatus(passed ? "Preview rendered · submit to save progress" : `Preview rendered · ${metCount} of ${checks.length} requirements met`);
      return;
    }
    if (!canRunPython) {
      if (!evaluation.passed) {
        setStatus(`Not quite · ${metCount} of ${checks.length} requirements met`);
        setOutput("Some requirements are still missing. Tick off every item in the checklist, then run again.");
        return;
      }
      setOutput(expectedOutput);
      setLastRun({ source, output: expectedOutput, passed: true });
      setStatus("Run complete · submit to save progress");
      return;
    }
    setStatus("Loading local Python runtime…");
    try {
      const runtime = await loadRuntime();
      let result = "";
      runtime.setStdout({ batched: (line) => { result += `${line}\n`; } });
      runtime.setStderr({ batched: (line) => { result += `${line}\n`; } });
      let inputPosition = 0;
      const input = `${stdin}\n`;
      runtime.setStdin({ stdin: () => inputPosition < input.length ? input.charCodeAt(inputPosition++) : null });
      setStatus("Running locally…");
      await runtime.runPythonAsync(source);
      const actualOutput = result.trimEnd();
      setOutput(actualOutput || "(No output)");
      if (actualOutput === expectedOutput.trim()) {
        setLastRun({ source, output: actualOutput, passed: true });
        setStatus("Run complete · submit to save progress");
      } else {
        setStatus("Output differs · edit and run again");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput(message);
      setStatus("Code error · edit and run again");
    }
  }

  async function submitChallenge() {
    setSubmitted(true);
    if (!lastRun || lastRun.source !== source || !lastRun.passed) {
      setStatus("Run your code before submitting");
      return;
    }
    try {
      await savePassedChallenge(lastRun.output);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(/Challenge not passed/i.test(message) ? "Not quite · try again" : "Could not save progress");
      setOutput(message);
    }
  }

  const hasError = /not quite|differs|does not match|error|could not save/i.test(status);
  const busy = /loading|running|checking|verifying/i.test(status);
  const light = ideTheme === "light";
  const shellTheme = light ? "border-slate-200 bg-slate-50 text-slate-900" : "border-slate-700/80 bg-[#0a0f1c] text-slate-100";
  const barTheme = light ? "border-slate-200 bg-white" : "border-white/10 bg-[#0e1526]";
  const railTheme = light ? "border-slate-200 bg-slate-100" : "border-white/10 bg-[#0c1322]";
  const mutedText = light ? "text-slate-500" : "text-slate-400";
  const editorTheme = light ? "border-slate-200 bg-white text-slate-800" : "border-slate-700 bg-[#070b14] text-cyan-100";
  const cardTheme = light ? "border-slate-200 bg-white" : "border-white/10 bg-[#0e1526]";
  const cardHead = light ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300";
  const ghostButton = light ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100" : "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10";
  const expectedLines = expectedOutput.replace(/\r\n/g, "\n").split("\n");
  const outputLines = output ? output.split("\n") : [];
  const showDiff = python && canRunPython && outputLines.length > 0 && !hasError;
  const editorLines = source.split("\n").length;
  const filename = `${challengeTitle ? challengeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 28) : "solution"}.${extensionFor(courseSlug)}`;
  const language = python ? "Python" : extensionFor(courseSlug).toUpperCase();
  const percent = checks.length ? Math.round((metCount / checks.length) * 100) : 0;
  const ringRadius = 26;
  const ringLength = 2 * Math.PI * ringRadius;
  const outputMatches = outputLines.join("\n").trimEnd() === expectedOutput.trim();
  const statusTone = challengePassed ? "emerald" : hasError ? "rose" : busy ? "amber" : "cyan";
  const statusStyles = {
    emerald: light ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    rose: light ? "border-rose-200 bg-rose-50 text-rose-800" : "border-rose-400/25 bg-rose-400/10 text-rose-200",
    amber: light ? "border-amber-200 bg-amber-50 text-amber-800" : "border-amber-300/25 bg-amber-300/10 text-amber-100",
    cyan: light ? "border-slate-200 bg-slate-100 text-slate-600" : "border-white/10 bg-white/5 text-slate-300",
  }[statusTone];
  const statusDot = { emerald: "bg-emerald-400", rose: "bg-rose-400", amber: "animate-pulse bg-amber-300", cyan: "bg-cyan-400" }[statusTone];

  const railItems = [
    { id: "ide", label: "Code", icon: FileCode2 },
    { id: "hints", label: "Hints", icon: Lightbulb },
    { id: "solution", label: "Solution", icon: BookOpenCheck },
  ] as const;
  const consoleTabs = [
    { id: "output", label: "Output", icon: Terminal },
    { id: "expected", label: "Expected", icon: Check },
    { id: "input", label: "Input", icon: Keyboard },
  ] as const;

  const requirementList = <ul className="space-y-2" aria-label="Challenge requirements">
    {evaluation.results.map((result) => <li key={result.id} className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs leading-5 transition-colors ${result.passed ? light ? "bg-emerald-50" : "bg-emerald-400/10" : light ? "bg-slate-50" : "bg-white/[0.03]"}`}>
      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${result.passed ? "bg-emerald-400 text-slate-950" : light ? "bg-slate-200 text-slate-400" : "bg-slate-700 text-slate-500"}`}>{result.passed ? <Check className="h-3 w-3" aria-hidden="true" /> : <CircleDashed className="h-3 w-3" aria-hidden="true" />}</span>
      <span className={result.passed ? light ? "text-emerald-800" : "text-emerald-200" : mutedText}>{result.label}</span>
    </li>)}
  </ul>;

  const consolePanel = consoleTab === "output"
    ? previewDocument ? <div><div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2"><span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span><span className="flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-slate-500">localhost:3000/preview · {htmlCourse ? "HTML" : "CSS"}</span></div><iframe title={`${htmlCourse ? "HTML" : "CSS"} challenge preview`} sandbox="" srcDoc={previewDocument} className="h-64 w-full bg-white" /></div>
      : showDiff ? <ol className="py-3 font-mono text-[13px] leading-6" aria-live="polite">{outputLines.map((line, index) => { const ok = line === (expectedLines[index] ?? null); return <li key={index} className={`grid grid-cols-[2.75rem_1.25rem_1fr] pr-4 ${ok ? light ? "text-emerald-800" : "text-emerald-200" : light ? "bg-rose-50 text-rose-800" : "bg-rose-500/10 text-rose-200"}`}><span aria-hidden="true" className={`select-none pr-3 text-right ${mutedText}`}>{index + 1}</span><span aria-hidden="true">{!ok && <X className="mt-1 h-3.5 w-3.5" />}</span><span className="whitespace-pre-wrap break-words">{line || " "}</span></li>; })}</ol>
      : <pre className={`min-h-24 overflow-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-6 ${hasError ? light ? "text-rose-900" : "text-rose-100" : challengePassed ? light ? "text-emerald-900" : "text-emerald-100" : mutedText}`} aria-live="polite">{output || (challengePassed ? "Correct output" : "Run your code to see its output here.")}</pre>
    : consoleTab === "expected" ? <div className={light ? "text-emerald-900" : "text-emerald-200"}><CodeListing code={expectedOutput} light={light} /></div>
    : needsInput ? <div className="p-3"><label htmlFor="lesson-stdin" className={`mb-1.5 block text-[11px] ${mutedText}`}>The program reads these lines from input. Edit them to test your own values.</label><textarea id="lesson-stdin" rows={Math.max(stdin.split("\n").length, 2)} value={stdin} onChange={(event) => { setStdin(event.target.value); clearResult("Input changed · ready to run"); }} placeholder="Type the input your program asks for" className={`w-full resize-none rounded-lg border px-3 py-2 font-mono text-xs leading-5 ${editorTheme} ${light ? "placeholder:text-slate-400" : "placeholder:text-slate-500"}`} /></div>
    : sampleInput.length ? <div className={`font-mono ${light ? "text-slate-800" : "text-amber-100"}`}><CodeListing code={sampleInput.join("\n")} light={light} /></div>
    : <p className={`px-4 py-4 text-xs leading-5 ${mutedText}`}>No input needed. Every value is fixed in the task description.</p>;

  return <section className={`mt-5 overflow-hidden rounded-3xl border ${shellTheme} shadow-[0_28px_70px_-36px_rgba(15,23,42,.55)] ring-1 ring-slate-950/5`} aria-label="MyLoginn coding workspace">
    <header className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b px-3 py-3 sm:px-5 ${barTheme}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden gap-1.5 sm:flex" aria-hidden="true"><i className="h-3 w-3 rounded-full bg-rose-400" /><i className="h-3 w-3 rounded-full bg-amber-400" /><i className="h-3 w-3 rounded-full bg-emerald-400" /></span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25"><Terminal className="h-4.5 w-4.5" aria-hidden="true" /></span>
        <div className="min-w-0"><h2 className="truncate text-sm font-bold tracking-wide">MyLoginn Studio</h2><p className={`truncate font-mono text-[11px] ${mutedText}`}>{filename} · {language}</p></div>
      </div>
      <div className={`order-last flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold lg:order-none lg:w-auto lg:max-w-md ${statusStyles}`} role="status" aria-live="polite"><span className={`h-2 w-2 shrink-0 rounded-full ${statusDot}`} /><span className="truncate">{status}</span></div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleIdeTheme} aria-label={`Switch IDE to ${light ? "dark" : "light"} theme`} aria-pressed={light} className={`grid h-9 w-9 place-items-center rounded-full border transition ${ghostButton}`}>{light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</button>
        {activeTab === "ide" && <>
          <button type="button" onClick={() => { setSource(starterCode); setStdin(stdinDefault ?? ""); setSubmitted(false); clearResult("Ready"); }} aria-label="Reset code" className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${ghostButton}`}><RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reset</span></button>
          <button type="button" onClick={runCode} disabled={busy || challengePassed} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-400 px-4 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/25 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"><Play className="h-3.5 w-3.5 fill-current" />Run</button>
          <button type="button" onClick={submitChallenge} disabled={busy || challengePassed} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-3.5 w-3.5" />{challengePassed ? "Complete" : "Submit"}</button>
        </>}
      </div>
    </header>

    <div className="grid lg:grid-cols-[4.25rem_minmax(0,1fr)]">
      <div role="tablist" aria-label="IDE, hints, and solution" aria-orientation="vertical" className={`flex gap-1 border-b p-2 lg:flex-col lg:border-b-0 lg:border-r ${railTheme}`}>
        {railItems.map((tab) => <button key={tab.id} type="button" role="tab" id={`challenge-${tab.id}-tab`} aria-selected={activeTab === tab.id} aria-controls="challenge-tab-panel" onClick={() => setActiveTab(tab.id)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider transition lg:flex-none ${activeTab === tab.id ? "bg-brand-600 text-white shadow-md shadow-brand-600/25" : light ? "text-slate-500 hover:bg-white hover:text-slate-900" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><tab.icon className="h-5 w-5" aria-hidden="true" />{tab.label}</button>)}
      </div>

      <div id="challenge-tab-panel" role="tabpanel" aria-labelledby={`challenge-${activeTab}-tab`} className="min-h-[320px] min-w-0">
        {activeTab === "ide" ? <div className={`grid gap-4 p-3 sm:p-4 ${submitted ? "xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
          <div className="min-w-0 space-y-4">
            <div className={`overflow-hidden rounded-2xl border ${cardTheme}`}>
              <div className={`flex items-center justify-between border-b px-3 py-2 text-[11px] font-semibold ${cardHead}`}><span className="inline-flex items-center gap-2 font-mono"><FileCode2 className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />{filename}</span><span className="uppercase tracking-wider">Editable</span></div>
              <div className={`max-h-[26rem] overflow-auto ${editorTheme} border-0`}>
                <div className="flex min-w-full">
                  <pre aria-hidden="true" className={`sticky left-0 select-none px-3 py-4 text-right font-mono text-sm leading-6 ${light ? "bg-slate-100 text-slate-400" : "bg-[#0b1220] text-slate-600"}`}>{Array.from({ length: Math.max(editorLines, 12) }, (_, index) => index + 1).join("\n")}</pre>
                  <textarea ref={editorRef} id="lesson-code" spellCheck={false} wrap="off" rows={Math.max(editorLines, 12)} value={source} onKeyDown={handleEditorKeyDown} onKeyUp={(event) => trackCursor(event.currentTarget)} onClick={(event) => trackCursor(event.currentTarget)} onChange={(event) => { updateSource(event.target.value); trackCursor(event.target); }} className={`min-w-[40rem] flex-1 resize-none overflow-hidden whitespace-pre bg-transparent px-3 py-4 font-mono text-sm leading-6 outline-none ${light ? "text-slate-800" : "text-cyan-100"}`} aria-label="Edit lesson code" />
                </div>
              </div>
              <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-3 py-1.5 font-mono text-[11px] ${light ? "border-slate-200 bg-slate-100 text-slate-500" : "border-white/10 bg-[#0b1220] text-slate-400"}`}><span>Ln {cursor.line}, Col {cursor.col}</span><span>{editorLines} lines · Spaces: 2 · UTF-8 · {language}</span></div>
            </div>

            <div className={`overflow-hidden rounded-2xl border ${cardTheme}`}>
              <div role="tablist" aria-label="Console" className={`flex items-center gap-1 overflow-x-auto border-b px-2 pt-2 ${cardHead}`}>
                {consoleTabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={consoleTab === tab.id} onClick={() => setConsoleTab(tab.id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition ${consoleTab === tab.id ? "border-cyan-400 text-cyan-500" : "border-transparent hover:text-cyan-400"}`}><tab.icon className="h-3.5 w-3.5" aria-hidden="true" />{tab.label}{tab.id === "input" && needsInput && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-label="Input required" />}</button>)}
                {consoleTab === "output" && showDiff && <span className={`ml-auto shrink-0 pr-2 text-[11px] font-semibold normal-case ${outputMatches ? "text-emerald-400" : "text-rose-400"}`}>{outputMatches ? "Matches expected" : "Differs from expected"}</span>}
                {consoleTab === "expected" && <span className="ml-auto shrink-0 pr-2 font-mono text-[11px] normal-case">{expectedLines.length} {expectedLines.length === 1 ? "line" : "lines"}</span>}
              </div>
              <div className={`min-h-28 ${hasError && consoleTab === "output" ? "border-l-4 border-l-rose-400" : ""}`}>{consolePanel}</div>
              {hasError && <div className="border-t border-inherit p-2"><button type="button" onClick={() => { setStatus("Ready · edit your code and retry"); setOutput(""); }} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${light ? "border-rose-200 text-rose-800 hover:bg-rose-50" : "border-rose-300/20 text-rose-100 hover:bg-rose-400/10"}`}>Retry challenge</button></div>}
            </div>
          </div>

          {submitted && <aside className="min-w-0 space-y-4">
            {challengePassed && <div className={`rounded-2xl border p-4 text-sm leading-6 ${light ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"}`} role="status"><strong>Challenge cleared.</strong> Your answer is correct and your lesson progress has been saved.</div>}
            <div className={`overflow-hidden rounded-2xl border ${cardTheme}`}>
              <div className={`flex items-center gap-4 border-b p-4 ${cardHead}`}>
                <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90" role="img" aria-label={`${percent}% of requirements met`}>
                  <circle cx="32" cy="32" r={ringRadius} fill="none" strokeWidth="6" className={light ? "stroke-slate-200" : "stroke-slate-700"} />
                  <circle cx="32" cy="32" r={ringRadius} fill="none" strokeWidth="6" strokeLinecap="round" stroke="var(--brand-600)" strokeDasharray={ringLength} strokeDashoffset={ringLength * (1 - percent / 100)} className="transition-all duration-700" />
                  <path d="M21.5 33l7.5 7.5L43 25" transform="rotate(90 32 32)" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" stroke={percent === 100 ? "var(--brand-600)" : light ? "#cbd5e1" : "#475569"} className="transition-colors duration-500" />
                </svg>
                <div><p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"><ListChecks className="h-3.5 w-3.5" aria-hidden="true" />Requirements</p><p className="mt-1 text-2xl font-bold tabular-nums">{metCount}<span className={`text-sm font-semibold ${mutedText}`}>/{checks.length} met</span></p></div>
              </div>
              <div className="p-3">{requirementList}</div>
            </div>
            <div className={`rounded-2xl border p-4 text-xs leading-5 ${cardTheme} ${mutedText}`}><p className="mb-1 inline-flex items-center gap-1.5 font-bold uppercase tracking-wider"><Eye className="h-3.5 w-3.5" aria-hidden="true" />How it works</p><p>Edit the code, press <strong>Run</strong> to check it, then <strong>Submit</strong> once everything passes to save progress and unlock the next lesson.</p></div>
          </aside>}
        </div>

        : activeTab === "hints" ? <div className={`mx-auto max-w-3xl p-4 sm:p-6 ${light ? "text-slate-700" : "text-slate-300"}`}>
          <div className="flex items-center justify-between gap-3"><h3 className={`text-sm font-bold ${light ? "text-violet-700" : "text-cyan-200"}`}>Hints for this challenge</h3><span className={`text-xs ${mutedText}`}>{Math.min(revealedHints, hints.length)} of {hints.length} revealed</span></div>
          <ol className="mt-4 space-y-3">{hints.slice(0, revealedHints).map((hint, index) => <li key={hint} className={`flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${cardTheme}`}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{index + 1}</span><span>{hint}</span></li>)}</ol>
          {revealedHints < hints.length && <button type="button" onClick={() => setRevealedHints((count) => count + 1)} className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${ghostButton}`}><Lightbulb className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />Reveal next hint</button>}
        </div>

        : !unlock.unlocked ? <div className={`mx-auto max-w-xl p-4 sm:p-8 ${light ? "text-slate-700" : "text-slate-300"}`}>
          <div className={`rounded-2xl border p-6 text-center sm:p-8 ${cardTheme}`}>
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${light ? "bg-amber-100 text-amber-700" : "bg-amber-400/15 text-amber-300"}`}><Lock className="h-7 w-7" aria-hidden="true" /></span>
            <h3 className={`mt-4 text-lg font-bold ${light ? "text-slate-900" : "text-white"}`}>Solution locked</h3>
            <p className={`mt-2 text-sm leading-6 ${mutedText}`}>Try the challenge and the hints first. If you are still stuck, unlock the reference solution with reward points. You only pay once for this challenge.</p>
            <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${light ? "border-amber-200 bg-amber-50 text-amber-800" : "border-amber-400/25 bg-amber-400/10 text-amber-200"}`}><Gift className="h-4 w-4" aria-hidden="true" />Costs {unlock.cost} reward points{unlock.loggedIn ? ` · You have ${unlock.points}` : ""}</div>
            <div className="mt-5">
              {unlock.loggedIn
                ? <button type="button" onClick={unlockSolution} disabled={unlock.busy || unlock.points < unlock.cost} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"><LockOpen className="h-4 w-4" aria-hidden="true" />{unlock.busy ? "Unlocking…" : `Unlock for ${unlock.cost} points`}</button>
                : <a href="/login" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700">Log in to unlock</a>}
            </div>
            {unlock.loggedIn && unlock.points < unlock.cost && !unlock.busy && <p className={`mt-3 text-xs ${mutedText}`}>You need {unlock.cost - unlock.points} more points. Passing challenges earns 10 points each.</p>}
            {unlock.error && <p role="alert" className="mt-3 text-xs font-semibold text-rose-400">{unlock.error}</p>}
          </div>
        </div>
        : <div className={`grid gap-4 p-3 sm:p-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] ${light ? "text-slate-700" : "text-slate-300"}`}>
          <div className={`min-w-0 overflow-hidden rounded-2xl border ${cardTheme}`}>
            <div className={`flex items-center justify-between gap-3 border-b px-3 py-2 ${cardHead}`}><div className="flex items-center gap-2"><span className="flex gap-1" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span><span className="font-mono text-[11px] font-semibold">solution · {filename}</span></div><button type="button" onClick={copySolution} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${ghostButton}`}>{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy"}</button></div>
            <div className={light ? "text-slate-800" : "text-emerald-200"}><CodeListing code={solutionCode} light={light} /></div>
            <div className={`border-t ${light ? "border-slate-200" : "border-white/10"}`}>
              <p className={`border-b px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${cardHead}`}>Output</p>
              <div className={light ? "text-emerald-900" : "text-emerald-200"}><CodeListing code={expectedOutput} light={light} /></div>
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <div className={`rounded-2xl border p-4 ${cardTheme}`}><h3 className={`text-sm font-bold ${light ? "text-amber-700" : "text-amber-200"}`}>Reference solution</h3><p className={`mt-1 text-xs leading-5 ${mutedText}`}>Try the challenge first, then compare. Any answer that meets every requirement passes, so your code does not have to look identical.</p></div>
            <div className={`rounded-2xl border p-4 ${cardTheme}`}><p className={`mb-3 text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>What the solution does</p><ul className="space-y-1.5">{checks.map((check) => <li key={check.id} className="flex items-start gap-2 text-xs leading-5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" /><span>{check.label}</span></li>)}</ul></div>
          </div>
        </div>}
      </div>
    </div>
    <div className={`flex items-center justify-end gap-1.5 border-t px-4 py-2 opacity-70 ${light ? "border-slate-200" : "border-white/10"}`}><Image src="/myloginn-logo.png" alt="" width={18} height={18} className="h-4 w-4 object-contain" /><span className="text-[10px] font-semibold">MyLoginn IDE</span></div>
  </section>;
}
