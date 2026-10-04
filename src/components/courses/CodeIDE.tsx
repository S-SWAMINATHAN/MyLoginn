"use client";

import Image from "next/image";
import { Play, RotateCcw, Terminal } from "lucide-react";
import { useRef, useState } from "react";

type Props = { courseSlug: string; courseTitle: string; topicSlug: string; moduleTitle: string; isLastTopicInModule: boolean; nextHref: string; starterCode: string; solutionCode: string; expectedOutput: string; canRunPython: boolean; needsInput: boolean; hints: string[] };
type PythonRuntime = {
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
  setStdin: (options: { stdin: () => number | null }) => void;
  runPythonAsync: (source: string) => Promise<unknown>;
};

declare global {
  interface Window { loadMyLoginnPython?: (options: { indexURL: string }) => Promise<PythonRuntime> }
}

export function CodeIDE({ courseSlug, courseTitle, topicSlug, moduleTitle, isLastTopicInModule, nextHref, starterCode, solutionCode, expectedOutput, canRunPython, needsInput, hints }: Props) {
  const [source, setSource] = useState(starterCode);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready");
  const [challengePassed, setChallengePassed] = useState(false);
  const [activeTab, setActiveTab] = useState<"ide" | "hints" | "solution">("ide");
  const runtimeRef = useRef<PythonRuntime | null>(null);
  const runtimePromiseRef = useRef<Promise<PythonRuntime> | null>(null);
  const python = courseSlug === "python-fundamentals";

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
    if (!python) {
      if (source.replace(/\r\n/g, "\n").trim() !== solutionCode.replace(/\r\n/g, "\n").trim()) {
        setStatus("Not quite · try again");
        setOutput("Your code does not match the expected solution yet. Edit it and submit again. The worked example is above.");
        return;
      }
      setOutput(expectedOutput);
      setStatus("Checking challenge…");
      try { await savePassedChallenge(expectedOutput); }
      catch (error) { const message = error instanceof Error ? error.message : String(error); setStatus(/Challenge not passed/i.test(message) ? "Not quite · try again" : "Could not save progress"); setOutput(message); }
      return;
    }
    setOutput("");
    if (!canRunPython) {
      if (source.replace(/\r\n/g, "\n").trim() !== solutionCode.replace(/\r\n/g, "\n").trim()) {
        setStatus("Not quite · try again");
        setOutput("Your code does not match the expected solution yet. Edit it and submit again.");
        return;
      }
      setOutput(expectedOutput);
      setStatus("Checking challenge…");
      try { await savePassedChallenge(expectedOutput); }
      catch (error) { const message = error instanceof Error ? error.message : String(error); setStatus(/Challenge not passed/i.test(message) ? "Not quite · try again" : "Could not save progress"); setOutput(message); }
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
      if (actualOutput === expectedOutput.trim()) await savePassedChallenge(actualOutput);
      else setStatus("Output differs · edit and retry");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput(message);
      setStatus(/Challenge not passed/i.test(message) ? "Not quite · try again" : "Code error · edit and retry");
    }
  }

  const hasError = /not quite|differs|error|could not save/i.test(status);
  const busy = /loading|running|checking|verifying/i.test(status);

  return <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-700 bg-[#101827] text-slate-100 shadow-[0_24px_64px_-36px_rgba(15,23,42,.75)] ring-1 ring-slate-950/5" aria-label="MyLoginn coding workspace">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#17243a] via-[#17243a] to-[#20244a] px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-300/20"><Terminal className="h-5 w-5 text-cyan-300"/></span><div><h2 className="text-sm font-bold tracking-wide">MyLoginn practice IDE</h2><p className="text-xs text-slate-400">{python && canRunPython ? "Run Python in your browser, then submit your result" : "Submit your solution to check it against this lesson"}</p></div></div>
      {activeTab === "ide" && <div className="flex gap-2"><button type="button" onClick={() => { setSource(starterCode); setStdin(""); setOutput(""); setStatus("Ready"); setChallengePassed(false); }} className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/60 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"><RotateCcw className="h-3.5 w-3.5"/>Reset</button><button type="button" onClick={runCode} disabled={busy || challengePassed} className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm shadow-cyan-950/25 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"><Play className="h-3.5 w-3.5"/>{challengePassed ? "Challenge complete" : python && canRunPython ? "Run & submit" : "Submit solution"}</button></div>}
    </div>
    <div role="tablist" aria-label="IDE, hints, and solution" className="flex gap-1 border-b border-white/10 bg-slate-950/25 px-3 pt-2 sm:px-4">{([{ id: "ide", label: "Editor" }, { id: "hints", label: "Hints" }, { id: "solution", label: "Solution" }] as const).map((tab) => <button key={tab.id} type="button" role="tab" id={`challenge-${tab.id}-tab`} aria-selected={activeTab === tab.id} aria-controls="challenge-tab-panel" onClick={() => setActiveTab(tab.id)} className={`min-w-20 rounded-t-lg px-5 py-2.5 text-xs font-bold transition ${activeTab === tab.id ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{tab.label}</button>)}</div>
    <div id="challenge-tab-panel" role="tabpanel" aria-labelledby={`challenge-${activeTab}-tab`} className="min-h-[300px]">
    {activeTab === "ide" ? <div className="grid lg:grid-cols-2">
      <div className="min-w-0 border-b border-white/10 p-3 lg:border-b-0 lg:border-r sm:p-4"><label htmlFor="lesson-code" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Editable code · {python ? "Python" : courseSlug.replace("-fundamentals", "")}</label><textarea id="lesson-code" spellCheck={false} value={source} onChange={(event) => { setSource(event.target.value); setChallengePassed(false); setStatus("Code changed · ready to submit"); setOutput(""); }} className="min-h-64 w-full resize-y rounded-xl border border-slate-700 bg-[#080d18] p-4 font-mono text-sm leading-6 text-cyan-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15" aria-label="Edit lesson code" /></div>
      <div className="min-w-0 p-3 sm:p-4">
        {needsInput && <><label htmlFor="lesson-stdin" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Program input</label><input id="lesson-stdin" value={stdin} onChange={(event) => { setStdin(event.target.value); setChallengePassed(false); setOutput(""); setStatus("Input changed · ready to submit"); }} placeholder="Type the input your program asks for" className="mb-3 w-full rounded-lg border border-white/10 bg-[#080d18] px-3 py-2 font-mono text-xs text-white placeholder:text-slate-500"/> </>}
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${challengePassed ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : hasError ? "border-rose-400/25 bg-rose-400/10 text-rose-200" : busy ? "border-amber-300/20 bg-amber-300/10 text-amber-100" : "border-slate-700 bg-slate-900/70 text-slate-300"}`}><span className={`h-2 w-2 rounded-full ${challengePassed ? "bg-emerald-400" : hasError ? "bg-rose-400" : busy ? "animate-pulse bg-amber-300" : "bg-cyan-300"}`}/>{status}</div>
        {challengePassed && <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-100" role="status"><strong>Challenge cleared.</strong> Your answer is correct and your lesson progress has been saved.</div>}
        <pre className={`mt-2 min-h-36 overflow-auto whitespace-pre-wrap rounded-xl border p-4 font-mono text-sm leading-6 ${hasError ? "border-rose-300/15 bg-rose-950/30 text-rose-100" : challengePassed ? "border-emerald-300/15 bg-emerald-950/25 text-emerald-100" : "border-slate-700 bg-[#080d18] text-cyan-100"}`} aria-live="polite">{output || (challengePassed ? "Correct output" : "Submit your code to see the result and challenge feedback.")}</pre>
        {hasError && <button type="button" onClick={() => { setStatus("Ready · edit your code and retry"); setOutput(""); }} className="mt-3 rounded-lg border border-rose-300/20 px-3 py-2 text-xs font-bold text-rose-100 transition hover:bg-rose-400/10">Retry challenge</button>}
      </div>
    </div> : activeTab === "hints" ? <div className="p-5 sm:p-6"><h3 className="text-sm font-bold text-cyan-200">Hints for this challenge</h3><ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-300">{hints.map((hint) => <li key={hint}>{hint}</li>)}</ol></div> : <div className="p-5 sm:p-6"><h3 className="text-sm font-bold text-amber-200">Challenge solution</h3><p className="mt-1 text-xs text-slate-400">Try the challenge first, then compare your code.</p><pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#080d18] p-4 font-mono text-sm leading-6 text-emerald-200"><code>{solutionCode}</code></pre></div>}
    </div>
    <div className="flex items-center justify-end gap-1.5 border-t border-white/10 px-4 py-2 opacity-70"><Image src="/myloginn-logo.png" alt="" width={18} height={18} className="h-4 w-4 object-contain"/><span className="text-[10px] font-semibold">MyLoginn IDE</span></div>
  </section>;
}
