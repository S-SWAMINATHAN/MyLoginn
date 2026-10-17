"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, CheckCircle2, Eye, EyeOff, Flag, Loader2, MessageSquare, NotebookPen, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { LEVEL_LABEL, REPORT_REASONS } from "@/lib/logiquest/constants";
import type { Question } from "@/lib/logiquest/types";
import { FigTile } from "./Figure";
import { MediaView } from "./MediaView";
import { RichText } from "./RichText";

export const LETTERS = "ABCDEFGH";
const EASE = [0.22, 1, 0.36, 1] as const;

export type CardState = { answered?: boolean; correct?: boolean; saved?: boolean; comments?: number };

const toolBtn = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-story-mist hover:text-story-royal focus-visible:outline focus-visible:outline-2 focus-visible:outline-story-royal";

/**
 * One practice question, IndiaBix style: pick an option to check it instantly, or press View Answer.
 * For logged-in learners the first answer is recorded (and graded again) on the server.
 */
export function QuestionCard({ q, loggedIn, state = {}, showContext = true, discussLink = true }: { q: Question; loggedIn: boolean; state?: CardState; showContext?: boolean; discussLink?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const [saved, setSaved] = useState(Boolean(state.saved));
  const [panel, setPanel] = useState<"none" | "work" | "report">("none");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const figOptions = q.media?.type === "figs" ? q.media.options : undefined;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setRevealed(true);
    if (loggedIn && !peeked && !state.answered) {
      fetch("/api/logiquest/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qid: q.id, selected: i }) })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (j?.xpAwarded) setXp(j.xpAwarded + (j.streakBonus ?? 0)); })
        .catch(() => {});
    }
  }

  async function toggleSave() {
    if (!loggedIn) { setMsg("Log in to bookmark questions."); return; }
    const next = !saved;
    setSaved(next);
    const r = await fetch("/api/logiquest/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qid: q.id, save: next }) }).catch(() => null);
    if (!r?.ok) setSaved(!next);
  }

  return (
    <article id={`q-${q.id}`} className="scroll-mt-32 rounded-2xl border border-border-soft bg-surface p-4 sm:p-6">
      {showContext && q.passage ? (
        <div className="mb-4 rounded-xl bg-story-mist p-4 text-sm">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Read the following and answer the questions</p>
          <RichText text={q.passage} />
        </div>
      ) : null}
      {showContext && q.media && q.media.type !== "figs" && !(q.passage && q.media.type === "clock") ? <MediaView media={q.media} /> : null}

      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0 text-base font-bold text-story-royal">{q.n}.</span>
        <div className="min-w-0 flex-1">
          <RichText text={q.q} className="text-[15px] font-medium text-story-navy sm:text-base dark:text-foreground" />
          {q.media?.type === "figs" ? <MediaView media={q.media} /> : null}

          {q.kind === "mcq" ? (
            figOptions ? (
              <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-label="Answer figures">
                {figOptions.map((f, i) => {
                  const isRight = revealed && i === q.a;
                  const isWrong = selected === i && i !== q.a;
                  return (
                    <button key={i} type="button" onClick={() => choose(i)} aria-label={`Option ${LETTERS[i]}`} className={cn("rounded-xl border-2 p-1 transition-colors", isRight ? "border-emerald-500 bg-emerald-500/10" : isWrong ? "border-rose-500 bg-rose-500/10" : "border-transparent hover:border-story-royal/40")}>
                      <FigTile fig={f} label={LETTERS[i]} size={76} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.o.map((opt, i) => {
                  const isRight = revealed && i === q.a;
                  const isWrong = selected === i && i !== q.a;
                  return (
                    <li key={i} className={q.o.some((o) => o.length > 42 || o.includes("\n")) ? "sm:col-span-2" : ""}>
                      <motion.button
                        type="button"
                        onClick={() => choose(i)}
                        animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={{ duration: 0.35 }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                          isRight ? "border-emerald-500 bg-emerald-500/10" : isWrong ? "border-rose-500 bg-rose-500/10" : "border-border-soft hover:border-story-royal/50 hover:bg-story-mist/60",
                          selected !== null && !isRight && !isWrong && "opacity-70"
                        )}
                      >
                        <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold", isRight ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "bg-story-mist text-story-royal")}>{LETTERS[i]}</span>
                        <span className="min-w-0 flex-1 pt-0.5"><RichText text={opt} className="leading-6" /></span>
                        {isRight ? <CheckCircle2 aria-label="Correct answer" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : isWrong ? <XCircle aria-label="Your answer" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /> : null}
                      </motion.button>
                    </li>
                  );
                })}
              </ol>
            )
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-1">
            <button type="button" className={toolBtn} onClick={() => { if (!revealed && selected === null) setPeeked(true); setRevealed((v) => !v); }} aria-expanded={revealed}>
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{revealed ? "Hide Answer" : "View Answer"}
            </button>
            {discussLink ? (
              <Link href={`/logiquest/q/${q.id}`} className={toolBtn}><MessageSquare className="h-3.5 w-3.5" />Discuss{state.comments ? ` (${state.comments})` : ""}</Link>
            ) : null}
            <button type="button" className={toolBtn} onClick={() => setPanel((p) => (p === "work" ? "none" : "work"))} aria-expanded={panel === "work"}><NotebookPen className="h-3.5 w-3.5" />Workspace</button>
            <button type="button" className={toolBtn} onClick={() => setPanel((p) => (p === "report" ? "none" : "report"))} aria-expanded={panel === "report"}><Flag className="h-3.5 w-3.5" />Report</button>
            <button type="button" className={toolBtn} onClick={toggleSave} aria-pressed={saved}>
              {saved ? <BookmarkCheck className="h-3.5 w-3.5 text-story-royal" /> : <Bookmark className="h-3.5 w-3.5" />}{saved ? "Saved" : "Save"}
            </button>
            <span className="ml-auto flex items-center gap-2 text-[11px] font-semibold text-muted">
              {state.answered ? <span className={state.correct ? "text-emerald-600" : "text-amber-600"}>{state.correct ? "✓ Solved" : "Attempted"}</span> : null}
              {LEVEL_LABEL[q.d]}
            </span>
          </div>
          {msg ? <p className="mt-2 text-xs text-muted">{msg} <Link href={`/login?next=${encodeURIComponent(typeof window === "undefined" ? "/logiquest" : window.location.pathname + window.location.search)}`} className="font-semibold text-story-royal">Log in</Link></p> : null}

          <AnimatePresence initial={false}>
            {revealed ? (
              <motion.div key="ans" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                <div className="mt-3 rounded-xl border border-border-soft bg-story-mist/70 p-4 text-sm">
                  {q.kind === "mcq" ? (
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">
                      Answer: Option {LETTERS[q.a]}
                      {selected !== null ? <span className={cn("ml-2 font-semibold", selected === q.a ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600")}>{selected === q.a ? "· Correct!" : `· You chose ${LETTERS[selected]}`}</span> : null}
                      {xp ? <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"><Zap className="h-3 w-3" />+{xp} XP</span> : null}
                    </p>
                  ) : (
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">Answer</p>
                  )}
                  {q.ans ? <RichText text={q.ans} className="mt-2" /> : null}
                  {q.e ? (
                    <>
                      <p className="mt-3 font-bold">Explanation:</p>
                      <RichText text={q.e} className="mt-1" />
                    </>
                  ) : q.kind === "mcq" ? <p className="mt-2 text-muted">No explanation is needed for this question.</p> : null}
                  {peeked && selected === null && loggedIn && !state.answered ? <p className="mt-3 text-xs text-muted">You viewed the answer first, so this question will not earn XP.</p> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {panel === "work" ? (
            <div className="mt-3">
              <label htmlFor={`ws-${q.id}`} className="text-xs font-bold uppercase tracking-wider text-muted">Workspace</label>
              <textarea id={`ws-${q.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Rough work. Nothing here is saved." className="mt-1 w-full rounded-xl border border-border-soft bg-background p-3 font-mono text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-story-royal" />
            </div>
          ) : null}
          {panel === "report" ? <ReportForm qid={q.id} onDone={() => setPanel("none")} /> : null}
        </div>
      </div>
    </article>
  );
}

function ReportForm({ qid, onDone }: { qid: string; onDone: () => void }) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].id);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/logiquest/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qid, reason, details }) }).catch(() => null);
    if (r?.ok) { setState("done"); setTimeout(onDone, 1800); }
    else { setState("error"); setError((await r?.json().catch(() => null))?.error ?? "Could not send the report."); }
  }

  if (state === "done") return <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Thanks! Our team will review this question.</p>;
  return (
    <form onSubmit={submit} className="mt-3 rounded-xl border border-border-soft p-4 text-sm">
      <fieldset>
        <legend className="mb-2 font-semibold">What is wrong with this question?</legend>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {REPORT_REASONS.map((r) => (
            <label key={r.id} className="flex items-center gap-2">
              <input type="radio" name={`reason-${qid}`} value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="accent-[var(--story-royal)]" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} maxLength={1000} placeholder="Details (optional)" className="mt-3 w-full rounded-lg border border-border-soft bg-background p-2.5" aria-label="Report details" />
      {state === "error" ? <p role="alert" className="mt-2 text-rose-600">{error}</p> : null}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-full px-4 py-1.5 font-semibold text-muted hover:text-story-royal">Cancel</button>
        <button disabled={state === "busy"} className="inline-flex items-center gap-1.5 rounded-full bg-story-royal px-4 py-1.5 font-semibold text-white disabled:opacity-60">{state === "busy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}Send report</button>
      </div>
    </form>
  );
}
