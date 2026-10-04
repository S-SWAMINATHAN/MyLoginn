"use client";

import Image from "next/image";
import { Moon, Play, RotateCcw, Sun, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = { courseSlug: string; courseTitle: string; topicSlug: string; moduleTitle: string; isLastTopicInModule: boolean; nextHref: string; starterCode: string; solutionCode: string; expectedOutput: string; canRunPython: boolean; canRunSql: boolean; needsInput: boolean; hints: string[] };
function withoutChallengeStarter(source: string, starterCode: string) {
  const normalizedSource = source.replace(/\r\n/g, "\n").trim();
  const normalizedStarter = starterCode.replace(/\r\n/g, "\n").trim();
  return normalizedStarter && normalizedSource.startsWith(normalizedStarter)
    ? normalizedSource.slice(normalizedStarter.length).trim()
    : normalizedSource;
}

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

export function CodeIDE({ courseSlug, courseTitle, topicSlug, moduleTitle, isLastTopicInModule, nextHref, starterCode, solutionCode, expectedOutput, canRunPython, canRunSql, needsInput, hints }: Props) {
  const [source, setSource] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready");
  const [challengePassed, setChallengePassed] = useState(false);
  const [lastRun, setLastRun] = useState<{ source: string; output: string; passed: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<"ide" | "hints" | "solution">("ide");
  const [ideTheme, setIdeTheme] = useState<"dark" | "light">("dark");
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const runtimeRef = useRef<PythonRuntime | null>(null);
  const runtimePromiseRef = useRef<Promise<PythonRuntime> | null>(null);
  const python = courseSlug === "python-fundamentals";
  const htmlCourse = courseSlug === "html-fundamentals";
  const cssCourse = courseSlug === "css-fundamentals";

  function updateSource(nextSource: string, caret?: number) {
    setSource(nextSource);
    setChallengePassed(false);
    setLastRun(null);
    setPreviewDocument(null);
    setStatus("Code changed · ready to run");
    setOutput("");
    if (caret !== undefined) requestAnimationFrame(() => editorRef.current?.setSelectionRange(caret, caret));
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
    const savedTheme = window.localStorage.getItem("myloginn-ide-theme");
    if (savedTheme === "light" || savedTheme === "dark") setIdeTheme(savedTheme);
  }, []);

  function toggleIdeTheme() {
    const nextTheme = ideTheme === "dark" ? "light" : "dark";
    setIdeTheme(nextTheme);
    window.localStorage.setItem("myloginn-ide-theme", nextTheme);
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
      const answer = withoutChallengeStarter(source, starterCode);
      const passed = answer === solutionCode.replace(/\r\n/g, "\n").trim();
      setPreviewDocument(htmlCourse ? makeHtmlPreview(answer) : makeCssPreview(answer));
      setOutput(passed ? expectedOutput : "Live preview rendered. Keep editing until your solution meets the challenge requirements.");
      setLastRun({ source, output: expectedOutput, passed });
      setStatus(passed ? "Preview rendered · submit to save progress" : "Preview rendered · challenge not complete yet");
      return;
    }
    if (!canRunPython) {
      if (withoutChallengeStarter(source, starterCode) !== solutionCode.replace(/\r\n/g, "\n").trim()) {
        setStatus("Not quite ? try again");
        setOutput("Your code does not match the expected solution yet. Edit it and run again. The worked example is above.");
        return;
      }
      setOutput(expectedOutput);
      setLastRun({ source, output: expectedOutput, passed: true });
      setStatus("Run complete ? submit to save progress");
      return;
    }
    setStatus("Loading local Python runtime?");
    try {
      const runtime = await loadRuntime();
      let result = "";
      runtime.setStdout({ batched: (line) => { result += `${line}\n`; } });
      runtime.setStderr({ batched: (line) => { result += `${line}\n`; } });
      let inputPosition = 0;
      const input = `${stdin}\n`;
      runtime.setStdin({ stdin: () => inputPosition < input.length ? input.charCodeAt(inputPosition++) : null });
      setStatus("Running locally?");
      await runtime.runPythonAsync(source);
      const actualOutput = result.trimEnd();
      setOutput(actualOutput || "(No output)");
      if (actualOutput === expectedOutput.trim()) {
        setLastRun({ source, output: actualOutput, passed: true });
        setStatus("Run complete ? submit to save progress");
      } else {
        setStatus("Output differs ? edit and run again");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput(message);
      setStatus("Code error ? edit and run again");
    }
  }

  async function submitChallenge() {
    if (!lastRun || lastRun.source !== source || !lastRun.passed) {
      setStatus("Run your code before submitting");
      return;
    }
    try {
      await savePassedChallenge(lastRun.output);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(/Challenge not passed/i.test(message) ? "Not quite ? try again" : "Could not save progress");
      setOutput(message);
    }
  }

  const hasError = /not quite|differs|does not match|error|could not save/i.test(status);
  const busy = /loading|running|checking|verifying/i.test(status);
  const light = ideTheme === "light";
  const shellTheme = light ? "border-slate-200 bg-white text-slate-900" : "border-slate-700 bg-[#101827] text-slate-100";
  const headerTheme = light ? "border-slate-200 bg-gradient-to-r from-white via-slate-50 to-indigo-50" : "border-white/10 bg-gradient-to-r from-[#17243a] via-[#17243a] to-[#20244a]";
  const mutedText = light ? "text-slate-500" : "text-slate-400";
  const editorTheme = light ? "border-slate-200 bg-slate-50 text-slate-800" : "border-slate-700 bg-[#080d18] text-cyan-100";

  return <section className={`mt-8 overflow-hidden rounded-[1.75rem] border ${shellTheme} shadow-[0_24px_64px_-36px_rgba(15,23,42,.45)] ring-1 ring-slate-950/5`} aria-label="MyLoginn coding workspace">
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6 ${headerTheme}`}>
      <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${light ? "bg-cyan-100 ring-cyan-200" : "bg-cyan-400/10 ring-cyan-300/20"}`}><Terminal className="h-5 w-5 text-cyan-500"/></span><div><h2 className="text-sm font-bold tracking-wide">MyLoginn practice IDE</h2><p className={`text-xs ${mutedText}`}>{python && canRunPython ? "Run Python, then submit to save your progress" : canRunSql ? "Run SQL on sample database rows, then submit to save progress" : htmlCourse || cssCourse ? "Run to see a live browser preview; submit saves progress" : "Run checks the challenge answer; submit saves your progress"}</p></div></div>
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={toggleIdeTheme} aria-label={`Switch IDE to ${light ? "dark" : "light"} theme`} aria-pressed={light} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${light ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100" : "border-slate-500/60 bg-slate-900/50 text-slate-200 hover:border-slate-400 hover:bg-slate-800"}`}>{light ? <Moon className="h-3.5 w-3.5"/> : <Sun className="h-3.5 w-3.5"/>}{light ? "Dark" : "Light"}</button>
      {activeTab === "ide" && <><button type="button" onClick={() => { setSource(starterCode); setStdin(""); setOutput(""); setStatus("Ready"); setChallengePassed(false); setLastRun(null); setPreviewDocument(null); }} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${light ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100" : "border-slate-500/60 bg-slate-900/50 text-slate-200 hover:border-slate-400 hover:bg-slate-800"}`}><RotateCcw className="h-3.5 w-3.5"/>Reset</button><button type="button" onClick={runCode} disabled={busy || challengePassed} className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${light ? "border-cyan-300 bg-white text-slate-800 hover:bg-cyan-50" : "border-cyan-300/40 bg-slate-900/50 text-cyan-100 hover:bg-slate-800"}`}><Play className="h-3.5 w-3.5"/>Run</button><button type="button" onClick={submitChallenge} disabled={busy || challengePassed} className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm shadow-cyan-950/25 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{challengePassed ? "Challenge complete" : "Submit solution"}</button></>}
      </div>
    </div>
    <div role="tablist" aria-label="IDE, hints, and solution" className={`flex gap-1 border-b px-3 pt-2 sm:px-4 ${light ? "border-slate-200 bg-slate-100" : "border-white/10 bg-slate-950/25"}`}>{([{ id: "ide", label: "Editor" }, { id: "hints", label: "Hints" }, { id: "solution", label: "Solution" }] as const).map((tab) => <button key={tab.id} type="button" role="tab" id={`challenge-${tab.id}-tab`} aria-selected={activeTab === tab.id} aria-controls="challenge-tab-panel" onClick={() => setActiveTab(tab.id)} className={`min-w-20 rounded-t-lg px-5 py-2.5 text-xs font-bold transition ${activeTab === tab.id ? "bg-cyan-300 text-slate-950" : light ? "text-slate-500 hover:bg-white hover:text-slate-900" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{tab.label}</button>)}</div>
    <div id="challenge-tab-panel" role="tabpanel" aria-labelledby={`challenge-${activeTab}-tab`} className="min-h-[300px]">
    {activeTab === "ide" ? <div className="grid lg:grid-cols-2">
      <div className={`min-w-0 border-b p-3 lg:border-b-0 lg:border-r sm:p-4 ${light ? "border-slate-200" : "border-white/10"}`}><label htmlFor="lesson-code" className={`mb-2 block text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Editable code · {python ? "Python" : courseSlug.replace("-fundamentals", "")}</label><textarea id="lesson-code" spellCheck={false} value={source} onChange={(event) => { setSource(event.target.value); setChallengePassed(false); setLastRun(null); setStatus("Code changed · ready to submit"); setOutput(""); }} className={`min-h-64 w-full resize-y rounded-xl border p-4 font-mono text-sm leading-6 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/20 ${editorTheme}`} aria-label="Edit lesson code" /></div>
      <div className="min-w-0 p-3 sm:p-4">
        {needsInput && <><label htmlFor="lesson-stdin" className={`mb-2 block text-[10px] font-bold uppercase tracking-wider ${mutedText}`}>Program input</label><input id="lesson-stdin" value={stdin} onChange={(event) => { setStdin(event.target.value); setChallengePassed(false); setLastRun(null); setOutput(""); setStatus("Input changed · ready to submit"); }} placeholder="Type the input your program asks for" className={`mb-3 w-full rounded-lg border px-3 py-2 font-mono text-xs ${editorTheme} ${light ? "placeholder:text-slate-400" : "placeholder:text-slate-500"}`}/> </>}
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${challengePassed ? light ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : hasError ? light ? "border-rose-200 bg-rose-50 text-rose-800" : "border-rose-400/25 bg-rose-400/10 text-rose-200" : busy ? light ? "border-amber-200 bg-amber-50 text-amber-800" : "border-amber-300/20 bg-amber-300/10 text-amber-100" : light ? "border-slate-200 bg-slate-50 text-slate-600" : "border-slate-700 bg-slate-900/70 text-slate-300"}`}><span className={`h-2 w-2 rounded-full ${challengePassed ? "bg-emerald-400" : hasError ? "bg-rose-400" : busy ? "animate-pulse bg-amber-300" : "bg-cyan-400"}`}/>{status}</div>
        {challengePassed && <div className={`mt-3 rounded-xl border p-3 text-sm leading-6 ${light ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"}`} role="status"><strong>Challenge cleared.</strong> Your answer is correct and your lesson progress has been saved.</div>}
        {previewDocument ? <div className={`mt-2 overflow-hidden rounded-xl border ${light ? "border-slate-200 bg-white" : "border-slate-700 bg-white"}`}><div className={`border-b px-3 py-2 text-xs font-semibold ${light ? "border-slate-200 bg-slate-50 text-slate-600" : "border-slate-200 bg-slate-100 text-slate-700"}`}>{htmlCourse ? "HTML browser preview" : "CSS browser preview"}</div><iframe title={`${htmlCourse ? "HTML" : "CSS"} challenge preview`} sandbox="" srcDoc={previewDocument} className="h-64 w-full bg-white" /></div> : <pre className={`mt-2 min-h-36 overflow-auto whitespace-pre-wrap rounded-xl border p-4 font-mono text-sm leading-6 ${hasError ? light ? "border-rose-200 bg-rose-50 text-rose-900" : "border-rose-300/15 bg-rose-950/30 text-rose-100" : challengePassed ? light ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-emerald-300/15 bg-emerald-950/25 text-emerald-100" : editorTheme}`} aria-live="polite">{output || (challengePassed ? "Correct output" : "Submit your code to see the result and challenge feedback.")}</pre>}
        {hasError && <button type="button" onClick={() => { setStatus("Ready · edit your code and retry"); setOutput(""); }} className={`mt-3 rounded-lg border px-3 py-2 text-xs font-bold transition ${light ? "border-rose-200 text-rose-800 hover:bg-rose-50" : "border-rose-300/20 text-rose-100 hover:bg-rose-400/10"}`}>Retry challenge</button>}
      </div>
    </div> : activeTab === "hints" ? <div className={`p-5 sm:p-6 ${light ? "text-slate-700" : "text-slate-300"}`}><h3 className={`text-sm font-bold ${light ? "text-cyan-700" : "text-cyan-200"}`}>Hints for this challenge</h3><ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6">{hints.map((hint) => <li key={hint}>{hint}</li>)}</ol></div> : <div className={`p-5 sm:p-6 ${light ? "text-slate-700" : "text-slate-300"}`}><h3 className={`text-sm font-bold ${light ? "text-amber-700" : "text-amber-200"}`}>Challenge solution</h3><p className={`mt-1 text-xs ${mutedText}`}>Try the challenge first, then compare your code.</p><pre className={`mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border p-4 font-mono text-sm leading-6 ${light ? "border-slate-200 bg-slate-50 text-emerald-800" : "border-white/10 bg-[#080d18] text-emerald-200"}`}><code>{solutionCode}</code></pre></div>}
    </div>
    <div className={`flex items-center justify-end gap-1.5 border-t px-4 py-2 opacity-70 ${light ? "border-slate-200" : "border-white/10"}`}><Image src="/myloginn-logo.png" alt="" width={18} height={18} className="h-4 w-4 object-contain"/><span className="text-[10px] font-semibold">MyLoginn IDE</span></div>
  </section>;
}
