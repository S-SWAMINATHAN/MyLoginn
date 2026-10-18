"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Captions, CheckCircle2, Mic, PhoneOff, RotateCcw, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { VoicePlayer } from "@/lib/practice/client/voice";
import { useMic, useTicker } from "@/lib/practice/client/useMic";
import type { Recording } from "@/lib/practice/client/recorder";
import { Card, Chip, LevelMeter, MicHelp, Working, fmtClock, postJson, sendForm } from "./ui";

type Phase = "idle" | "speaking" | "ready" | "recording" | "analyzing" | "error" | "finishing";

type TurnResponse = {
  transcript: string;
  evaluation: { overall: number; feedback: string; struggled: boolean; betterAnswer: string };
  reply: string;
  nextQuestion: string | null;
  asked: number;
  total: number;
  done: boolean;
};

export type InterviewRoomProps = {
  sessionId: string;
  title: string;
  persona: { name: string; label: string; voice: string };
  plan: string[];
  asked: number;
  question: string;
  done: boolean;
  coding?: { title: string; statement: string };
  maxAnswerS: number;
};

const SILENCE_FINISH_MS = 5000;

export function InterviewRoom(props: InterviewRoomProps) {
  const router = useRouter();
  const { rec: recRef, ensure: ensureMic, problem: micProblem, lost: micLost, getLevel: micLevel } = useMic();
  const voice = useMemo(() => new VoicePlayer(), []);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [asked, setAsked] = useState(props.asked);
  const [question, setQuestion] = useState(props.question);
  const [done, setDone] = useState(props.done);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<TurnResponse | null>(null);
  const [captions, setCaptions] = useState(true);
  const [coach, setCoach] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [voiceFailed, setVoiceFailed] = useState(false);
  const pending = useRef<Recording | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const total = props.plan.length;

  /** The only way phases change: refuses any transition that does not start from an expected phase. */
  const go = useCallback((from: Phase[], to: Phase) => {
    if (!from.includes(phaseRef.current)) return false;
    phaseRef.current = to;
    setPhase(to);
    return true;
  }, []);

  const elapsed = useTicker(phase === "recording" || phase === "analyzing" || phase === "finishing", 200);

  const startRecording = useCallback(async () => {
    const rec = await ensureMic();
    if (!rec || !go(["ready"], "recording")) return;
    setNotice(null);
    await rec.start();
  }, [go, ensureMic]);

  const speakThenListen = useCallback(async (text: string, autoRecord: boolean) => {
    if (!go(["idle", "analyzing", "ready"], "speaking")) return;
    const result = await voice.speak(text, props.persona.voice);
    setVoiceFailed(result === "failed");
    if (!go(["speaking"], "ready")) return;
    if (autoRecord) void startRecording();
  }, [go, props.persona.voice, startRecording, voice]);

  const finish = useCallback(async () => {
    if (!go(["ready", "error", "analyzing", "idle"], "finishing")) return;
    voice.stop();
    recRef.current?.cancel();
    setError(null);
    const res = await postJson<{ id: string; abandoned?: boolean }>(`/api/practice/sessions/${props.sessionId}/finish`);
    if (res.ok) {
      router.push(res.data.abandoned ? "/practice/interview" : `/practice/reports/${props.sessionId}`);
      return;
    }
    setError(res.error);
    phaseRef.current = "error";
    setPhase("error");
  }, [go, recRef, props.sessionId, router, voice]);

  const submit = useCallback(async () => {
    const recording = pending.current;
    if (!recording || !go(["recording", "error"], "analyzing")) return;
    setError(null);
    const form = new FormData();
    form.set("audio", recording.wav, "answer.wav");
    form.set("index", String(asked - 1));
    const res = await sendForm<TurnResponse>(`/api/practice/sessions/${props.sessionId}/turns`, form);
    if (!res.ok) {
      if (res.noSpeech) {
        pending.current = null;
        setHasPending(false);
        setNotice(res.error);
        go(["analyzing"], "ready");
        return;
      }
      setError(res.error);
      go(["analyzing"], "error");
      return;
    }
    // The complete analysis is back: only now does the interview move on.
    pending.current = null;
    setHasPending(false);
    setLast(res.data);
    if (res.data.done || !res.data.nextQuestion) {
      setDone(true);
      go(["analyzing"], "ready");
      await voice.speak(res.data.reply, props.persona.voice);
      void finish();
      return;
    }
    setAsked(res.data.asked);
    setQuestion(res.data.nextQuestion);
    void speakThenListen(res.data.reply, handsFree);
  }, [asked, finish, go, handsFree, props.persona.voice, props.sessionId, speakThenListen, voice]);

  const stopRecording = useCallback(() => {
    const rec = recRef.current;
    if (!rec || phaseRef.current !== "recording") return;
    const recording = rec.stop();
    if (recording.va.speechMs < 400) {
      // Nothing was heard: stay on the question, no upload.
      phaseRef.current = "ready";
      setPhase("ready");
      setNotice("We didn't hear anything. Check your microphone and answer again.");
      return;
    }
    pending.current = recording;
    setHasPending(true);
    void submit();
  }, [recRef, submit]);

  // Auto-stop at the time limit, and (hands-free only) after a long pause once the learner has spoken.
  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => {
      const rec = recRef.current;
      if (!rec) return;
      if (rec.elapsedMs >= props.maxAnswerS * 1000) stopRecording();
      else if (handsFree && rec.voicedMs > 2500 && rec.silenceMs > SILENCE_FINISH_MS) stopRecording();
    }, 250);
    return () => clearInterval(id);
  }, [handsFree, recRef, phase, props.maxAnswerS, stopRecording]);

  // Leaving mid-answer would lose the recording.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (phaseRef.current === "recording" || phaseRef.current === "analyzing") e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => { window.removeEventListener("beforeunload", warn); voice.stop(); };
  }, [voice]);

  const begin = async () => {
    voice.unlock();
    const rec = await ensureMic();
    if (!rec) return;
    if (done) { void finish(); return; }
    void speakThenListen(question, handsFree);
  };

  const retryLast = () => {
    if (pending.current) void submit();
    else if (phaseRef.current === "error" && done) void finish();
  };
  const reRecord = () => {
    pending.current = null;
    setHasPending(false);
    setError(null);
    go(["error"], "ready");
  };
  const replay = () => {
    if (phaseRef.current === "ready") void speakThenListen(question, false);
  };
  const endEarly = () => {
    if (phaseRef.current === "recording") return;
    if (!window.confirm(asked > 1 ? "End the interview now and get your report for the answers so far?" : "End the interview? You haven't answered any question yet.")) return;
    void finish();
  };

  const remaining = Math.max(0, props.maxAnswerS * 1000 - elapsed);
  const stageIndex = Math.min(asked, total) - 1;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-5">
        <Card className="relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Chip tone="brand">Question {Math.min(asked, total)} / {total}</Chip>
              <Chip>{props.plan[stageIndex]}</Chip>
            </div>
            <div className="flex items-center gap-1">
              <IconToggle on={captions} onClick={() => setCaptions((v) => !v)} label="Captions"><Captions className="h-4 w-4" /></IconToggle>
              <Button variant="cancel" size="sm" onClick={endEarly} disabled={phase === "finishing" || phase === "recording"} icon={<PhoneOff className="h-4 w-4" />}>End</Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <Interviewer name={props.persona.name} speaking={phase === "speaking"} />
            <p className="mt-3 text-sm font-semibold">{props.persona.name} <span className="font-normal text-muted">· {props.persona.label}</span></p>
            <div className="mt-4 min-h-[4.5rem] max-w-2xl">
              {captions || voiceFailed || phase === "idle" ? (
                <p className="text-lg leading-8 text-story-navy sm:text-xl dark:text-foreground">{question}</p>
              ) : (
                <p className="text-sm text-muted">Captions are off. Listen to the question.</p>
              )}
              {voiceFailed ? <p className="mt-2 text-xs text-muted">The voice could not be played, so please read the question.</p> : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 border-t border-border-soft pt-6">
            {micProblem ? <MicHelp problem={micProblem} onRetry={() => void begin()} /> : null}
            {micLost ? <MicHelp problem="no-device" onRetry={() => void ensureMic()} /> : null}

            {phase === "idle" ? (
              <div className="flex flex-col items-center gap-3">
                <Button size="lg" onClick={() => void begin()} icon={<Mic className="h-5 w-5" />}>{asked > 1 ? "Resume interview" : "Start interview"}</Button>
                <p className="max-w-md text-xs leading-5 text-muted">Use headphones for the best result. Your browser will ask for microphone access. Answers are analysed only after you finish speaking.</p>
              </div>
            ) : null}

            {phase === "speaking" ? <p role="status" className="inline-flex items-center gap-2 text-sm font-medium text-story-royal"><Volume2 className="h-4 w-4" />{props.persona.name} is speaking…</p> : null}

            {phase === "ready" && !done ? (
              <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={() => void startRecording()} className="grid h-20 w-20 place-items-center rounded-full bg-story-royal text-white shadow-[var(--shadow-soft)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300" aria-label="Start answering">
                  <Mic className="h-8 w-8" />
                </button>
                <p className="text-sm text-muted">Tap to answer. Take a moment to think first if you need to.</p>
                <button type="button" onClick={replay} className="inline-flex items-center gap-1.5 text-xs font-semibold text-story-royal hover:underline"><RotateCcw className="h-3.5 w-3.5" />Hear the question again</button>
              </div>
            ) : null}

            {phase === "recording" ? (
              <div className="flex w-full flex-col items-center gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-danger"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />Recording · {fmtClock(elapsed)} <span className="font-normal text-muted">({fmtClock(remaining)} left)</span></span>
                <LevelMeter getLevel={micLevel} active />
                <Button variant="danger" size="lg" onClick={stopRecording} icon={<Square className="h-4 w-4 fill-current" />}>Finish answer</Button>
                {handsFree ? <p className="text-xs text-muted">Hands-free: your answer ends after a 5-second pause.</p> : null}
              </div>
            ) : null}

            {phase === "analyzing" ? (
              <div className="flex flex-col items-center gap-2">
                <Working label={elapsed < 2500 ? "Uploading your answer…" : elapsed < 9000 ? "Transcribing and analysing your complete answer…" : "Preparing the next question…"} detail={`${Math.round(elapsed / 1000)}s`} />
                <p className="text-xs text-muted">The interviewer waits until the analysis is finished.</p>
              </div>
            ) : null}

            {phase === "finishing" ? <Working label="Generating your interview report…" detail={`${Math.round(elapsed / 1000)}s`} /> : null}

            {phase === "error" && error ? (
              <div role="alert" className="flex flex-col items-center gap-3 text-center">
                <p className="max-w-md text-sm text-danger">{error}</p>
                <div className="flex gap-2">
                  <Button onClick={retryLast} icon={<RotateCcw className="h-4 w-4" />}>Retry</Button>
                  {hasPending ? <Button variant="secondary" onClick={reRecord}>Record again</Button> : null}
                </div>
              </div>
            ) : null}

            {notice && phase === "ready" ? <p role="status" className="text-sm text-amber-700 dark:text-amber-300">{notice}</p> : null}
          </div>
        </Card>

        {coach && last ? (
          <Card>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Feedback on your last answer</p>
              <Chip tone={last.evaluation.overall >= 75 ? "good" : last.evaluation.overall >= 60 ? "warn" : "bad"}>{last.evaluation.overall}/100</Chip>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted"><span className="font-semibold text-foreground">You said: </span>{last.transcript}</p>
            <p className="mt-3 text-sm leading-6">{last.evaluation.feedback}</p>
            {last.evaluation.betterAnswer ? <p className="mt-3 rounded-2xl bg-story-mist p-3 text-sm leading-6 dark:bg-surface-2"><span className="font-semibold">A stronger answer: </span>{last.evaluation.betterAnswer}</p> : null}
          </Card>
        ) : last && !coach ? (
          <p className="flex items-center gap-2 text-sm text-muted"><CheckCircle2 className="h-4 w-4 text-success" />Answer {asked - 1 || 1} analysed. Detailed feedback is in your report.</p>
        ) : null}
      </div>

      <aside className="space-y-4">
        {props.coding ? (
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Problem</p>
            <p className="mt-1 font-semibold">{props.coding.title}</p>
            <p className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-6 text-muted">{props.coding.statement}</p>
          </Card>
        ) : null}
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Interview plan</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {props.plan.map((s, i) => (
              <li key={i} className={cn("flex items-center gap-2", i < asked - 1 || (done && i <= asked - 1) ? "text-muted line-through decoration-1" : i === asked - 1 ? "font-semibold text-story-royal" : "text-muted")}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-story-mist text-[10px] font-bold dark:bg-surface-2">{i + 1}</span>{s}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="space-y-3 text-sm">
          <Toggle checked={coach} onChange={setCoach} label="Coach mode" hint="Show feedback after every answer (real interviews don't)." />
          <Toggle checked={handsFree} onChange={setHandsFree} label="Hands-free" hint="Start recording after each question and finish after a 5-second pause." />
        </Card>
      </aside>
    </div>
  );
}

function Interviewer({ name, speaking }: { name: string; speaking: boolean }) {
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <span className={cn("absolute inset-0 rounded-full bg-story-royal/15", speaking && "animate-ping [animation-duration:1.6s]")} aria-hidden />
      <span className={cn("relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-story-royal to-story-navy text-3xl font-bold text-white ring-4 transition-[box-shadow] duration-300", speaking ? "ring-story-royal/40" : "ring-transparent")}>{name[0]}</span>
    </div>
  );
}

function IconToggle({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} title={label} onClick={onClick} className={cn("grid h-9 w-9 place-items-center rounded-full transition-colors", on ? "bg-story-royal/10 text-story-royal" : "text-muted hover:bg-story-mist")}>{children}</button>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="font-semibold">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs leading-5 text-muted">{hint}</span> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--story-royal)]" />
    </label>
  );
}
