"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Flag, Mic, RotateCcw, Square, Timer, Trophy, Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { VoicePlayer } from "@/lib/practice/client/voice";
import { useMic, useTicker } from "@/lib/practice/client/useMic";
import type { Recording } from "@/lib/practice/client/recorder";
import type { Alignment } from "@/lib/practice/speech";
import { Scene } from "./Scenes";
import { Card, Chip, LevelMeter, MicHelp, ScoreRing, Working, fmtClock, postJson, sendForm } from "./ui";

export type ClientItem = {
  id: string;
  display: string;
  speak?: string;
  target?: string;
  scene?: string;
  sceneTitle?: string;
  guide?: { word: string; ipa: string; tip: string }[];
  focus?: string;
  seconds: number;
  /** Listening items: the text is revealed only after the attempt. */
  hidden?: boolean;
  /** Challenge mode time limit (seconds). */
  limit?: number;
};

type Evaluation = {
  scores: Record<string, number>;
  overall: number;
  feedback: string;
  corrections: { said: string; better: string; why?: string }[];
  words: { word: string; score: number; issue: string }[];
  tips: string[];
  better: string;
  alignment?: Alignment;
  challenge?: { limit: number; taken: number; passed: boolean };
};
type TurnResponse = { transcript: string; evaluation: Evaluation; metrics: Record<string, number>; state: { cursor: number; attempts: number; n: number } };

type Phase = "idle" | "speaking" | "ready" | "recording" | "analyzing" | "result" | "error" | "finishing";

const VOICES = [
  { id: "en-US-AvaMultilingualNeural", label: "US" },
  { id: "en-GB-SoniaNeural", label: "UK" },
  { id: "en-IN-NeerjaNeural", label: "Indian" },
];
/** Exercises whose prompt is spoken automatically when the item opens. */
const AUTO_SPEAK = new Set(["repeat", "twister", "listen", "comprehension"]);

export type SpeakingRoomProps = {
  sessionId: string;
  kind: string;
  title: string;
  reps: number;
  dims: { key: string; label: string }[];
  items: ClientItem[];
  state: { cursor: number; attempts: number; n: number };
  maxAttempts: number;
};

export function SpeakingRoom(props: SpeakingRoomProps) {
  const router = useRouter();
  const { rec: recRef, ensure: ensureMic, problem: micProblem, lost: micLost, getLevel: micLevel } = useMic();
  const player = useMemo(() => new VoicePlayer(), []);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [pos, setPos] = useState(props.state.cursor);
  const [attempts, setAttempts] = useState(props.state.attempts);
  const [n, setN] = useState(props.state.n);
  const [result, setResult] = useState<TurnResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pending = useRef<Recording | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const item = props.items[pos];
  const isLast = pos >= props.items.length - 1;

  const go = useCallback((from: Phase[], to: Phase) => {
    if (!from.includes(phaseRef.current)) return false;
    phaseRef.current = to;
    setPhase(to);
    return true;
  }, []);
  const ticking = useTicker(phase === "recording" || phase === "analyzing" || phase === "finishing", 100);

  const speakPrompt = useCallback(async (text?: string) => {
    if (!text || !go(["idle", "ready", "result"], "speaking")) return;
    await player.speak(text, voice);
    go(["speaking"], "ready");
  }, [go, player, voice]);

  const open = useCallback((index: number) => {
    setPos(index);
    setResult(null);
    setNotice(null);
    phaseRef.current = "ready";
    setPhase("ready");
    const next = props.items[index];
    if (next && AUTO_SPEAK.has(props.kind)) void speakPrompt(next.speak);
  }, [props.items, props.kind, speakPrompt]);

  const begin = async () => {
    player.unlock();
    if (!(await ensureMic())) return;
    if (attempts > 0) {
      // Resuming an item that already has an attempt: offer retry / next instead of replaying.
      phaseRef.current = "result";
      setPhase("result");
      return;
    }
    open(pos);
  };

  const startRecording = async () => {
    const rec = await ensureMic();
    if (!rec || !go(["ready", "result"], "recording")) return;
    player.stop();
    setNotice(null);
    setError(null);
    await rec.start();
  };

  const submit = useCallback(async (attemptPos: number) => {
    const recording = pending.current;
    if (!recording || !go(["recording", "error"], "analyzing")) return;
    setError(null);
    const form = new FormData();
    form.set("audio", recording.wav, "attempt.wav");
    form.set("index", String(n));
    form.set("pos", String(attemptPos));
    const res = await sendForm<TurnResponse>(`/api/practice/sessions/${props.sessionId}/turns`, form);
    if (!res.ok) {
      if (res.noSpeech) { pending.current = null; setHasPending(false); setNotice(res.error); go(["analyzing"], "ready"); return; }
      setError(res.error);
      go(["analyzing"], "error");
      return;
    }
    pending.current = null;
    setHasPending(false);
    setResult(res.data);
    setN(res.data.state.n);
    setAttempts(res.data.state.attempts);
    go(["analyzing"], "result");
  }, [go, n, props.sessionId]);

  /** Position the current take belongs to: a new item after "Next", otherwise a retry of this one. */
  const attemptPos = useRef(pos);
  const stopRecording = useCallback(() => {
    const rec = recRef.current;
    if (!rec || phaseRef.current !== "recording") return;
    const recording = rec.stop();
    if (recording.va.speechMs < 400) {
      phaseRef.current = "ready";
      setPhase("ready");
      setNotice("We didn't hear anything. Check your microphone and try again.");
      return;
    }
    pending.current = recording;
    setHasPending(true);
    void submit(attemptPos.current);
  }, [recRef, submit]);

  useEffect(() => {
    if (phase !== "recording" || !item) return;
    const cap = Math.min(120, item.seconds + 15) * 1000;
    const id = setInterval(() => { if ((recRef.current?.elapsedMs ?? 0) >= cap) stopRecording(); }, 200);
    return () => clearInterval(id);
  }, [item, recRef, phase, stopRecording]);

  useEffect(() => () => player.stop(), [player]);

  const record = () => { attemptPos.current = pos; void startRecording(); };
  const next = () => { if (!isLast) { setAttempts(0); open(pos + 1); } };
  const finish = async () => {
    if (!go(["result", "ready", "error"], "finishing")) return;
    player.stop();
    const res = await postJson<{ id: string; abandoned?: boolean }>(`/api/practice/sessions/${props.sessionId}/finish`);
    if (res.ok) { router.push(res.data.abandoned ? "/practice/speaking" : `/practice/reports/${props.sessionId}`); return; }
    setError(res.error);
    phaseRef.current = "error";
    setPhase("error");
  };

  if (!item) return null;
  const showText = !item.hidden || phase === "result";
  const seconds = ticking / 1000;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_19rem]">
      <div className="min-w-0 space-y-5">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="brand">Item {pos + 1} / {props.items.length}</Chip>
              {attempts ? <Chip>Attempt {attempts} / {props.maxAttempts}</Chip> : null}
              {item.focus ? <Chip>Focus: {item.focus}</Chip> : null}
              {item.limit ? <Chip tone="warn"><Timer className="h-3 w-3" />{item.limit}s limit</Chip> : null}
            </div>
            <div role="group" aria-label="Voice accent" className="flex items-center gap-1 text-xs">
              {VOICES.map((v) => <button key={v.id} type="button" aria-pressed={voice === v.id} onClick={() => setVoice(v.id)} className={cn("rounded-full px-2.5 py-1 font-semibold", voice === v.id ? "bg-story-royal/10 text-story-royal" : "text-muted hover:bg-story-mist")}>{v.label}</button>)}
            </div>
          </div>

          {item.scene ? <div className="mt-4 overflow-hidden rounded-2xl border border-border-soft"><Scene id={item.scene} title={item.sceneTitle ?? "Picture"} className="h-auto w-full" /></div> : null}

          <div className="mt-5">
            {showText ? (
              <p className={cn("leading-8 text-story-navy dark:text-foreground", item.target ? "text-xl font-semibold sm:text-2xl" : "text-lg")}>{props.reps > 1 ? `${item.display}  ×${props.reps}` : item.display}</p>
            ) : (
              <p className="flex items-center gap-2 text-base text-muted"><Eye className="h-4 w-4" />Listen carefully — the question appears after you answer.</p>
            )}
            {item.guide ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.guide.map((g) => {
                  const scored = result?.evaluation.words.find((w) => w.word.toLowerCase() === g.word.toLowerCase());
                  return (
                    <li key={g.word} className="rounded-2xl border border-border-soft p-3">
                      <div className="flex items-center justify-between gap-2">
                        <button type="button" onClick={() => void speakPrompt(g.word)} className="inline-flex items-center gap-1.5 font-semibold hover:text-story-royal"><Volume2 className="h-3.5 w-3.5" />{g.word}</button>
                        {scored ? <Chip tone={scored.score >= 85 ? "good" : scored.score >= 65 ? "warn" : "bad"}>{scored.score}%</Chip> : null}
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted">/{g.ipa}/</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{scored?.issue && scored.score < 85 ? scored.issue : g.tip}</p>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 border-t border-border-soft pt-6">
            {micProblem ? <MicHelp problem={micProblem} onRetry={() => void begin()} /> : null}
            {micLost ? <MicHelp problem="no-device" onRetry={() => void ensureMic()} /> : null}

            {phase === "idle" ? <Button size="lg" onClick={() => void begin()} icon={<Mic className="h-5 w-5" />}>{n ? "Resume practice" : "Start"}</Button> : null}
            {phase === "speaking" ? <p role="status" className="inline-flex items-center gap-2 text-sm font-medium text-story-royal"><Volume2 className="h-4 w-4" />Listen…</p> : null}

            {phase === "ready" ? (
              <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={record} aria-label="Start recording" className="grid h-20 w-20 place-items-center rounded-full bg-story-royal text-white shadow-[var(--shadow-soft)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"><Mic className="h-8 w-8" /></button>
                <p className="text-sm text-muted">{item.target ? "Tap and say it." : `Tap and speak for about ${item.seconds >= 60 ? `${Math.round(item.seconds / 60 * 10) / 10} min` : `${item.seconds} s`}.`}</p>
                {item.speak ? <button type="button" onClick={() => void speakPrompt(item.speak)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-story-royal hover:underline"><RotateCcw className="h-3.5 w-3.5" />{AUTO_SPEAK.has(props.kind) ? "Listen again" : "Hear it"}</button> : null}
              </div>
            ) : null}

            {phase === "recording" ? (
              <div className="flex w-full flex-col items-center gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-danger"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />Recording · {fmtClock(ticking)}</span>
                {item.limit ? <span className={cn("text-sm font-semibold tabular-nums", seconds > item.limit ? "text-danger" : "text-muted")}>{seconds.toFixed(1)}s / {item.limit}s</span> : null}
                {!item.target ? <span className="h-1.5 w-56 overflow-hidden rounded-full bg-story-mist dark:bg-surface-2"><span className="block h-full bg-story-royal transition-[width]" style={{ width: `${Math.min(100, (seconds / item.seconds) * 100)}%` }} /></span> : null}
                <LevelMeter getLevel={micLevel} active />
                <Button variant="danger" size="lg" onClick={stopRecording} icon={<Square className="h-4 w-4 fill-current" />}>Done</Button>
              </div>
            ) : null}

            {phase === "analyzing" ? <Working label="Analysing your complete recording…" detail={`${Math.round(ticking / 1000)}s`} /> : null}
            {phase === "finishing" ? <Working label="Building your report…" detail={`${Math.round(ticking / 1000)}s`} /> : null}

            {phase === "error" ? (
              <div role="alert" className="flex flex-col items-center gap-3 text-center">
                <p className="max-w-md text-sm text-danger">{error}</p>
                <div className="flex gap-2">
                  {hasPending ? <Button onClick={() => void submit(attemptPos.current)} icon={<RotateCcw className="h-4 w-4" />}>Retry</Button> : <Button onClick={() => void finish()}>Retry report</Button>}
                  {hasPending ? <Button variant="secondary" onClick={() => { pending.current = null; setHasPending(false); go(["error"], "ready"); }}>Record again</Button> : null}
                </div>
              </div>
            ) : null}
            {notice && phase === "ready" ? <p role="status" className="text-sm text-amber-700 dark:text-amber-300">{notice}</p> : null}

            {phase === "result" ? (
              <div className="flex flex-wrap justify-center gap-2">
                {attempts < props.maxAttempts ? <Button variant="secondary" onClick={record} icon={<RotateCcw className="h-4 w-4" />}>Try again</Button> : null}
                {!isLast ? <Button onClick={next} icon={<ArrowRight className="h-4 w-4" />}>Next</Button> : null}
                <Button variant={isLast ? "primary" : "ghost"} onClick={() => void finish()} icon={<Flag className="h-4 w-4" />}>Finish & get report</Button>
              </div>
            ) : null}
          </div>
        </Card>

        {phase === "result" && result ? <AttemptResult result={result} dims={props.dims} /> : null}
      </div>

      <aside className="space-y-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Progress</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {props.items.map((it, i) => (
              <li key={it.id} className={cn("flex items-center gap-2", i === pos ? "font-semibold text-story-royal" : i < pos ? "text-muted line-through decoration-1" : "text-muted")}>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-story-mist text-[10px] font-bold dark:bg-surface-2">{i + 1}</span>
                <span className="truncate">{it.hidden && i >= pos ? "Listening item" : it.target ? it.display : it.display.slice(0, 48)}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="text-xs leading-5 text-muted">Scores follow one rubric: 90+ Excellent · 80-89 Very good · 70-79 Good · 60-69 Needs improvement. Retries never lower your report score — the best attempt per item counts.</Card>
      </aside>
    </div>
  );
}

function AttemptResult({ result, dims }: { result: TurnResponse; dims: { key: string; label: string }[] }) {
  const e = result.evaluation;
  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center gap-6">
        <ScoreRing score={e.overall} size={96} />
        <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {dims.filter((d) => typeof e.scores[d.key] === "number").map((d) => <li key={d.key} className="flex justify-between gap-2"><span className="text-muted">{d.label}</span><span className="font-semibold tabular-nums">{e.scores[d.key]}</span></li>)}
          {result.metrics.wpm ? <li className="flex justify-between gap-2"><span className="text-muted">Pace</span><span className="font-semibold tabular-nums">{result.metrics.wpm} wpm</span></li> : null}
          {typeof result.metrics.fillerCount === "number" && !e.alignment ? <li className="flex justify-between gap-2"><span className="text-muted">Fillers</span><span className="font-semibold tabular-nums">{result.metrics.fillerCount}</span></li> : null}
          {typeof result.metrics.longPauses === "number" && !e.alignment ? <li className="flex justify-between gap-2"><span className="text-muted">Long pauses</span><span className="font-semibold tabular-nums">{result.metrics.longPauses}</span></li> : null}
        </ul>
      </div>

      {e.challenge ? (
        <p className={cn("flex items-center gap-2 rounded-2xl p-3 text-sm font-semibold", e.challenge.passed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300")}>
          <Trophy className="h-4 w-4" />{e.challenge.passed ? "Challenge passed" : "Not yet"} — {e.challenge.taken}s of {e.challenge.limit}s, {e.scores.accuracy}% accuracy (80% needed).
        </p>
      ) : null}

      {e.alignment ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Word check</p>
          <p className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 text-base leading-8">
            {e.alignment.marks.map((m, i) => (
              <span key={i} title={m.status === "wrong" ? `You said "${m.said}"` : m.status === "missing" ? "Missed" : undefined} className={cn("rounded px-1", m.status === "ok" ? "text-emerald-700 dark:text-emerald-300" : m.status === "missing" ? "bg-danger/10 text-danger line-through" : "bg-amber-500/15 text-amber-800 underline decoration-wavy dark:text-amber-200")}>{m.word}</span>
            ))}
          </p>
          {e.alignment.missing.length ? <p className="mt-1 text-sm text-danger">You missed: {e.alignment.missing.map((w) => `"${w}"`).join(", ")}</p> : null}
        </div>
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">What we heard</p>
        <p className="mt-1 text-sm leading-6">{result.transcript}</p>
      </div>
      <p className="text-sm leading-6">{e.feedback}</p>

      {e.words.filter((w) => w.score < 85).length ? (
        <ul className="flex flex-wrap gap-2">
          {e.words.filter((w) => w.score < 85).map((w) => <li key={w.word} className="rounded-2xl border border-border-soft px-3 py-2 text-sm"><span className="font-semibold">{w.word}</span> <span className="text-muted">· {w.score}%</span>{w.issue ? <span className="block text-xs text-muted">{w.issue}</span> : null}</li>)}
        </ul>
      ) : null}

      {e.corrections.length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Corrections</p>
          {e.corrections.map((c, i) => (
            <div key={i} className="rounded-2xl bg-story-mist p-3 text-sm leading-6 dark:bg-surface-2">
              <p><span className="font-semibold text-danger">You said: </span>{c.said}</p>
              <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">Better: </span>{c.better}</p>
              {c.why ? <p className="text-xs text-muted">{c.why}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
      {e.tips.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{e.tips.map((t) => <li key={t}>{t}</li>)}</ul> : null}
      {e.better ? <p className="rounded-2xl border border-story-royal/20 bg-story-royal/5 p-3 text-sm leading-6"><span className="font-semibold">Improved version: </span>{e.better}</p> : null}
    </Card>
  );
}
