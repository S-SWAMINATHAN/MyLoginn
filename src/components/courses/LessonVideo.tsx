"use client";

import Image from "next/image";
import { Captions, Gauge, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Step = { code: string; explanation: string };
export type LessonVideoData = {
  courseTitle: string;
  title: string;
  lessonNumber: number;
  lessonCount: number;
  plain: { simple: string; analogy: string };
  visualNodes: { label: string; value: string; detail?: string }[];
  visualSummary: string;
  steps: Step[];
  output: string;
  takeaways: string[];
  mistake: string;
};

type SceneId = "intro" | "define" | "flow" | "code" | "output" | "recap" | "mistake" | "outro";
type Beat = { scene: SceneId; index: number; count: number; text: string; dur: number; start: number };

const SCENE_LABEL: Record<SceneId, string> = {
  intro: "Intro", define: "The idea", flow: "How it flows", code: "In code", output: "The result", recap: "Remember", mistake: "Watch out", outro: "Your turn",
};
const SCENE_ORDER: SceneId[] = ["intro", "define", "flow", "code", "output", "recap", "mistake", "outro"];
const NODE_HUES = ["var(--brand-600)", "var(--brand-600)", "var(--brand-600)"];

const VOICE_ID = "en-US-AriaNeural";
const voiceUrl = (text: string) => `/api/tts?v=${VOICE_ID}&t=${encodeURIComponent(text)}`;

// Fallback only: prefer the browser's neural/"natural" voices (they sound human) over the default robotic one.
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((voice) => /^en/i.test(voice.lang));
  const rank = (voice: SpeechSynthesisVoice) => (/natural|neural/i.test(voice.name) ? 100 : 0) + (/online/i.test(voice.name) ? 20 : 0)
    + (/aria|jenny|guy|sonia|ryan|libby/i.test(voice.name) ? 15 : 0) + (/google/i.test(voice.name) ? 10 : 0) + (/samantha|karen|daniel|serena/i.test(voice.name) ? 8 : 0)
    + (/en-(US|GB|IN)/i.test(voice.lang) ? 3 : 0) - (/espeak|compact/i.test(voice.name) ? 50 : 0);
  return voices.sort((a, b) => rank(b) - rank(a))[0] ?? null;
}
const SPEEDS = [1, 1.5, 2];

// Beat length follows reading/speaking pace so captions and narration stay in step.
const beatMs = (text: string, min = 2400) => Math.max(min, Math.round(text.length * 62) + 700);
const clean = (text: string) => text.replace(/\s+/g, " ").trim();

function buildBeats(data: LessonVideoData): Beat[] {
  const raw: { scene: SceneId; text: string }[] = [];
  raw.push({ scene: "intro", text: `Welcome to ${data.title}, part of ${data.courseTitle}.` });
  if (data.plain.simple) raw.push({ scene: "define", text: clean(data.plain.simple) });
  if (data.plain.analogy) raw.push({ scene: "define", text: clean(data.plain.analogy) });
  data.visualNodes.slice(0, 3).forEach((node) => raw.push({ scene: "flow", text: clean(node.detail || node.value) }));
  if (data.visualNodes.length && data.visualSummary) raw.push({ scene: "flow", text: clean(data.visualSummary) });
  const steps = data.steps.filter((step) => step.code.trim()).slice(0, 12);
  if (steps.length) {
    raw.push({ scene: "code", text: "Let us read the code one line at a time." });
    steps.forEach((step) => raw.push({ scene: "code", text: clean(step.explanation) || clean(step.code) }));
  }
  if (data.output.trim()) raw.push({ scene: "output", text: "Now we run it, and this is what appears." });
  data.takeaways.slice(0, 4).forEach((point) => raw.push({ scene: "recap", text: clean(point) }));
  if (data.mistake) raw.push({ scene: "mistake", text: clean(data.mistake) });
  raw.push({ scene: "outro", text: `That is ${data.title}. Try the practice and the challenge below to lock it in.` });

  const counts = new Map<SceneId, number>();
  raw.forEach((beat) => counts.set(beat.scene, (counts.get(beat.scene) ?? 0) + 1));
  const seen = new Map<SceneId, number>();
  let start = 0;
  return raw.map((beat) => {
    const index = seen.get(beat.scene) ?? 0;
    seen.set(beat.scene, index + 1);
    const dur = beatMs(beat.text, beat.scene === "intro" ? 3200 : 2400);
    const built = { ...beat, index, count: counts.get(beat.scene) ?? 1, dur, start };
    start += dur;
    return built;
  });
}

const typed = (text: string, local: number, dur: number) => text.slice(0, Math.ceil(text.length * Math.min(1, local / Math.max(1, dur * 0.65))));

function Stage({ beat, local, data, beats }: { beat: Beat; local: number; data: LessonVideoData; beats: Beat[] }) {
  const steps = data.steps.filter((step) => step.code.trim()).slice(0, 12);
  const kicker = <p className="lv-label text-brand-600">{SCENE_LABEL[beat.scene]}</p>;

  if (beat.scene === "intro") return <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="wt-pop"><Image src="/myloginn-logo.png" alt="" width={56} height={56} className="mx-auto h-14 w-14 object-contain drop-shadow-[0_0_18px_#22d3ee]" /></div>
    <p className="wt-pop mt-4 text-[11px] font-semibold uppercase tracking-[.14em] text-brand-600" style={{ animationDelay: "200ms" }}>{data.courseTitle} · Lesson {data.lessonNumber} of {data.lessonCount}</p>
    <h3 className="wt-pop mt-3 max-w-2xl text-3xl font-bold tracking-tight text-brand-700 sm:text-5xl" style={{ animationDelay: "400ms" }}>{data.title}</h3>
  </div>;

  if (beat.scene === "define") return <div className="flex h-full flex-col justify-center gap-4">
    {kicker}
    {beats.filter((b) => b.scene === "define" && b.index <= beat.index).map((b) => b.index === 0
      ? <p key={b.index} className="text-xl font-bold leading-8 text-slate-900 sm:text-3xl sm:leading-10">{b.index === beat.index ? typed(b.text, local, b.dur) : b.text}</p>
      : <div key={b.index} className="wt-pop rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900 sm:text-lg sm:leading-8">💡 {typed(b.text, local, b.dur)}</div>)}
  </div>;

  if (beat.scene === "flow") {
    const nodes = data.visualNodes.slice(0, 3);
    const lit = beat.index >= nodes.length ? nodes.length : beat.index + 1;
    return <div className="flex h-full flex-col justify-center gap-4">
      {kicker}
      <ol className="grid gap-3 sm:grid-cols-3">{nodes.map((node, i) => {
        const on = i < lit; const now = i === beat.index;
        return <li key={`${node.label}-${i}`} className={`rounded-2xl border p-3.5 transition-all duration-500 ${on ? "opacity-100" : "opacity-25"} ${now ? "wt-pop" : ""}`} style={{ borderColor: on ? "var(--brand-600)" : "var(--brand-100)", background: now ? "var(--brand-50)" : "#ffffff", boxShadow: now ? "0 10px 24px -12px var(--brand-600)" : "none" }}>
          <span className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white" style={{ background: NODE_HUES[i] }}>{i + 1}</span>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: NODE_HUES[i] }}>{node.label}</p>
          <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-900 sm:text-base">{node.value}</p>
          {on && node.detail && <p className="mt-1.5 text-xs leading-5 text-slate-600">{node.detail}</p>}
        </li>;
      })}</ol>
      <div className="flex items-center gap-2" aria-hidden="true">{nodes.map((_, i) => <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100"><span className="block h-full rounded-full bg-brand-600 transition-all duration-700" style={{ width: i < lit ? "100%" : "0%" }} /></span>)}</div>
      {(() => {
        const node = nodes[beat.index];
        const summary = !node;
        return <div key={beat.index} className="wt-pop lv-panel flex gap-4 p-4 sm:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-xl font-bold text-white">{summary ? "★" : beat.index + 1}</span>
          <div className="min-w-0">
            <p className="lv-label">{summary ? "Putting it together" : node.label}</p>
            <p className="mt-1 break-words text-xl font-semibold leading-7 text-slate-900 sm:text-3xl sm:leading-9">{summary ? data.title : typed(node.value, local, beat.dur * 0.5)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-lg sm:leading-8">{summary ? data.visualSummary : typed(node.detail ?? "", Math.max(0, local - beat.dur * 0.2), beat.dur * 0.7)}</p>
            {summary && <ul className="mt-3 flex flex-wrap gap-2">{nodes.map((n, i) => <li key={i} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{i + 1}. {n.label}: {n.value}</li>)}</ul>}
          </div>
        </div>;
      })()}
    </div>;
  }

  if (beat.scene === "code") {
    const active = beat.index - 1; // beat 0 is the "read it line by line" intro
    return <div className="grid h-full min-h-0 gap-3 sm:grid-cols-[1.15fr_1fr]">
      <div className="lv-panel min-h-0 overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-slate-200 px-3 py-2"><i className="h-2 w-2 rounded-full bg-rose-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-brand-400" /><span className="ml-2 font-mono text-[10px] text-slate-500">{data.title}</span></div>
        <ol className="space-y-0.5 overflow-hidden p-2 font-mono text-xs leading-6 sm:text-sm">{steps.map((step, i) => {
          const shown = i < active ? step.code : i === active ? typed(step.code, local, beat.dur * 0.8) : "";
          return <li key={i} className={`flex gap-2 rounded-md px-2 ${i === active ? "lv-line-active text-slate-900" : "text-slate-400"}`}><span className="w-4 shrink-0 text-right text-slate-300">{i + 1}</span><code className="min-w-0 whitespace-pre-wrap break-words">{shown || " "}{i === active && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-brand-600 align-middle" />}</code></li>;
        })}</ol>
      </div>
      <div className="flex items-center">{active >= 0 ? <div key={active} className="wt-pop lv-panel w-full border-brand-300 p-4"><p className="lv-label text-brand-600">Line {active + 1}</p><code className="mt-1 block break-words font-mono text-xs font-semibold text-brand-700 sm:text-sm">{steps[active].code.trim()}</code><p className="mt-3 text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">{steps[active].explanation}</p></div> : <p className="wt-pop text-lg font-bold text-slate-900 sm:text-2xl">Read it one line at a time ↓</p>}</div>
    </div>;
  }

  if (beat.scene === "output") {
    const lines = data.output.split("\n").slice(0, 8);
    const visible = Math.min(lines.length, Math.ceil((local / (beat.dur * 0.75)) * lines.length));
    return <div className="flex h-full flex-col justify-center gap-3">
      {kicker}
      <div className="lv-panel overflow-hidden"><div className="flex items-center gap-1.5 border-b border-slate-200 px-3 py-2"><i className="h-2 w-2 rounded-full bg-rose-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-brand-400" /><span className="ml-2 text-[10px] text-slate-500">Output</span></div>
        <pre className="min-h-24 whitespace-pre-wrap p-4 font-mono text-sm leading-7 text-brand-600 sm:text-lg"><span className="text-slate-400">$ run{"\n"}</span>{lines.slice(0, visible).join("\n")}<span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-brand-600 align-middle" /></pre></div>
    </div>;
  }

  if (beat.scene === "recap") {
    const points = beats.filter((b) => b.scene === "recap" && b.index <= beat.index);
    return <div className="flex h-full flex-col justify-center gap-3">
      {kicker}
      {points.map((b) => <div key={b.index} className={`flex gap-3 rounded-2xl border border-brand-300 bg-brand-50 p-3.5 ${b.index === beat.index ? "wt-pop" : ""}`}><span className="font-bold text-brand-600">✓</span><p className="text-sm leading-6 text-slate-800 sm:text-lg sm:leading-7">{b.text}</p></div>)}
    </div>;
  }

  if (beat.scene === "mistake") return <div className="flex h-full flex-col justify-center gap-3">
    <p className="lv-label text-amber-600">Common mistake</p>
    <div className="wt-pop rounded-2xl border border-amber-300 bg-amber-50 p-5 text-base leading-7 text-amber-900 sm:text-xl sm:leading-9">⚠️ {typed(data.mistake, local, beat.dur)}</div>
  </div>;

  return <div className="flex h-full flex-col items-center justify-center text-center">
    <p className="wt-pop text-4xl">🚀</p>
    <h3 className="wt-pop mt-3 text-2xl font-bold text-slate-900 sm:text-4xl" style={{ animationDelay: "150ms" }}>Your turn!</h3>
    <p className="wt-pop mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base" style={{ animationDelay: "300ms" }}>Scroll down to practise {data.title} and pass the code challenge.</p>
  </div>;
}

export function LessonVideo({ data }: { data: LessonVideoData }) {
  const beats = useMemo(() => buildBeats(data), [data]);
  const total = beats.length ? beats[beats.length - 1].start + beats[beats.length - 1].dur : 0;
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [narrate, setNarrate] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLElement | null>(null);
  const lastFrame = useRef(0);
  const timeRef = useRef(0);
  const voice = useRef<HTMLAudioElement | null>(null);
  const voiceBusy = useRef(false);
  const spokenBeat = useRef(-1);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const beatIndex = Math.max(0, beats.findIndex((beat) => time < beat.start + beat.dur));
  const beat = beats[beatIndex] ?? beats[beats.length - 1];
  const local = beat ? Math.min(beat.dur, time - beat.start) : 0;
  const finished = time >= total;

  useEffect(() => {
    if (!playing) return;
    lastFrame.current = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const delta = now - lastFrame.current;
      lastFrame.current = now;
      let next = Math.min(total, timeRef.current + delta * speed);
      // Let the voice finish its sentence before the video moves on to the next beat.
      const current = beats.find((item) => timeRef.current < item.start + item.dur);
      if (current && voiceBusy.current && next >= current.start + current.dur) next = current.start + current.dur - 1;
      timeRef.current = next;
      setTime(next);
      if (next >= total) { setPlaying(false); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, total, beats]);

  // Voice-over: a neural voice served by /api/tts. The browser voice is only a fallback if that fails.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = (voice.current ??= new Audio());
    if (!playing || !narrate || !beat) {
      audio.pause();
      voiceBusy.current = false;
      window.speechSynthesis?.cancel();
      return;
    }
    if (spokenBeat.current === beatIndex && audio.src && !audio.ended) { voiceBusy.current = true; void audio.play().catch(() => { voiceBusy.current = false; }); return; }
    spokenBeat.current = beatIndex;
    voiceBusy.current = true;
    audio.onended = () => { voiceBusy.current = false; };
    audio.onerror = () => {
      voiceBusy.current = false;
      if (!("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(beat.text);
      const fallback = pickVoice();
      if (fallback) { utterance.voice = fallback; utterance.lang = fallback.lang; }
      // Keep the beat open until the fallback voice finishes too, so the sentence is not cut off.
      voiceBusy.current = true;
      const release = () => { voiceBusy.current = false; };
      utterance.onend = release;
      utterance.onerror = release;
      window.speechSynthesis.speak(utterance);
    };
    audio.src = voiceUrl(beat.text);
    audio.playbackRate = speed;
    void audio.play().catch(() => { voiceBusy.current = false; });
    const upcoming = beats[beatIndex + 1];
    if (upcoming) void fetch(voiceUrl(upcoming.text)).catch(() => undefined); // warm the cache for the next line
  }, [beatIndex, playing, narrate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (voice.current) voice.current.playbackRate = speed; }, [speed]);
  useEffect(() => () => { voice.current?.pause(); window.speechSynthesis?.cancel(); }, []);

  if (!beat) return null;

  function toggle() {
    setStarted(true);
    if (finished) setTime(0);
    setPlaying((current) => !current || finished);
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen?.().catch(() => undefined);
  }
  const icon = "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-brand-500 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";
  const sceneIds = SCENE_ORDER.filter((id) => beats.some((b) => b.scene === id));

  return <section ref={frameRef} className={`overflow-hidden border border-brand-200 bg-white text-slate-900 ${fullscreen ? "flex h-screen flex-col rounded-none" : "mt-8 rounded-3xl shadow-sm"}`} aria-label={`Animated video lesson: ${data.title}`}>
    <div className={`lv-stage relative overflow-hidden ${fullscreen ? "min-h-0 flex-1" : "min-h-[400px] sm:min-h-[440px]"}`}>
      <div aria-hidden="true" className="lv-grid pointer-events-none absolute inset-0" />
      <div className="absolute left-4 top-3 z-10 flex items-center gap-2"><span className="rounded-full border border-brand-200 bg-brand-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Video lesson</span><span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:inline">{SCENE_LABEL[beat.scene]}</span></div>
      <div className="pointer-events-none absolute right-4 top-3 z-10 flex items-center gap-1.5 opacity-60"><Image src="/myloginn-logo.png" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" /><span className="text-[10px] font-semibold">MyLoginn Learning</span></div>

      <div key={`${beat.scene}-${beat.index}`} className={`relative h-full px-5 pb-6 pt-14 sm:px-10 ${fullscreen ? "overflow-y-auto sm:px-16" : "min-h-[400px] sm:min-h-[440px]"}`} style={fullscreen ? { zoom: 1.3 } : undefined}>
        <Stage beat={beat} local={local} data={data} beats={beats} />
      </div>

      {!started && <button type="button" onClick={toggle} aria-label="Play video lesson" className="absolute inset-0 z-20 grid place-items-center bg-white/55 backdrop-blur-[3px] transition hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500">
        <span className="grid place-items-center gap-3 text-center"><span className="lv-play grid h-20 w-20 place-items-center rounded-full bg-brand-600 shadow-[0_14px_30px_-10px_var(--brand-600)]"><Play className="h-9 w-9 translate-x-0.5 fill-white text-white" /></span><span className="text-base font-semibold text-slate-900">Watch: {data.title}</span><span className="text-xs text-slate-600">{Math.max(1, Math.round(total / 60000))} min · animated · human-style voice-over &amp; captions</span></span>
      </button>}
    </div>

    {captions && started && <p aria-live="off" className="border-t border-brand-100 bg-brand-50 px-4 py-2.5 text-center text-sm leading-6 text-slate-800">{beat.text}</p>}

    <div className="border-t border-slate-200 px-3 py-3 sm:px-4">
      <div className="relative flex h-5 items-center">
        <div className="pointer-events-none absolute inset-x-0 flex h-1.5 gap-0.5 overflow-hidden rounded-full">{sceneIds.map((id) => {
          const group = beats.filter((b) => b.scene === id);
          const width = group.reduce((sum, b) => sum + b.dur, 0) / total * 100;
          const fill = Math.max(0, Math.min(1, (time - group[0].start) / (width / 100 * total)));
          return <div key={id} className="h-full overflow-hidden bg-slate-200" style={{ width: `${width}%` }}><div className="h-full bg-brand-600" style={{ width: `${fill * 100}%` }} /></div>;
        })}</div>
        <input type="range" min={0} max={total} step={50} value={time} onChange={(event) => { setStarted(true); setTime(Number(event.target.value)); }} aria-label="Video position" className="relative h-5 w-full cursor-pointer opacity-0" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : finished ? "Replay video" : "Play video"} className={`${icon} bg-brand-50`}>{playing ? <Pause className="h-4 w-4" /> : finished ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
        <span className="text-xs font-medium tabular-nums text-slate-500">{Math.floor(time / 60000)}:{String(Math.floor(time / 1000) % 60).padStart(2, "0")} / {Math.floor(total / 60000)}:{String(Math.floor(total / 1000) % 60).padStart(2, "0")}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <button type="button" onClick={() => setSpeed((current) => SPEEDS[(SPEEDS.indexOf(current) + 1) % SPEEDS.length])} aria-label={`Playback speed ${speed}x`} className={`${icon} w-auto gap-1 px-2 text-[11px] font-bold`}><Gauge className="h-3.5 w-3.5" />{speed}x</button>
          <button type="button" onClick={() => setCaptions((current) => !current)} aria-pressed={captions} aria-label="Toggle captions" className={`${icon} ${captions ? "border-brand-500 text-brand-700" : ""}`}><Captions className="h-4 w-4" /></button>
          <button type="button" onClick={() => setNarrate((current) => !current)} aria-pressed={narrate} aria-label="Toggle narration" className={`${icon} ${narrate ? "border-brand-500 text-brand-700" : ""}`}>{narrate ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"} title={fullscreen ? "Exit full screen" : "Full screen"} className={icon}>{fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}</button>
        </span>
      </div>
    </div>
  </section>;
}
