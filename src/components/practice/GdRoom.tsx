"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Crown, Headphones, LogOut, Mic, MicOff, Play, Share2, Users, Volume2, VolumeX, WifiOff, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useMic } from "@/lib/practice/client/useMic";
import { GdMesh, type LinkState } from "@/lib/practice/client/gdMesh";
import { GdSegmenter, type Segment } from "@/lib/practice/client/gdSegmenter";
import { encodeWav } from "@/lib/practice/speech";
import { GD_LIMITS, gdPhase, type GdSync } from "@/lib/practice/gd/config";
import { Card, Chip, MicHelp, Working, fmtClock, postJson } from "./ui";

type Joined = { peerId: string; iceServers: RTCIceServer[] };

export function GdRoom({ code, me }: { code: string; me: { id: string; name: string } }) {
  const router = useRouter();
  const { rec: recRef, ensure: ensureMic, problem: micProblem, getLevel: micLevel } = useMic();
  const [joined, setJoined] = useState<Joined | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [sync, setSync] = useState<GdSync | null>(null);
  const [offline, setOffline] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [deaf, setDeaf] = useState(false);
  const [links, setLinks] = useState<Record<string, LinkState>>({});
  const [clockOffset, setClockOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [evalState, setEvalState] = useState<{ status: string; message?: string } | null>(null);
  const [evalTry, setEvalTry] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploads, setUploads] = useState({ pending: 0, failed: 0 });

  const mesh = useRef<GdMesh | null>(null);
  const segmenter = useRef<GdSegmenter | null>(null);
  const offset = useRef<{ ms: number; rtt: number }>({ ms: 0, rtt: Infinity });
  const after = useRef(0);
  const syncRef = useRef<GdSync | null>(null);
  const seq = useRef(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pendingUploads = useRef(0);
  const tiles = useRef(new Map<string, HTMLElement>());

  const serverNow = now + clockOffset;
  const phase = sync ? gdPhase(sync.room, serverNow) : "LOBBY";
  const people = sync?.participants.filter((p) => !p.left) ?? [];
  const isHost = sync?.me.isHost ?? false;

  // ── segment uploads (sequential, retried once) ──
  const upload = useCallback((s: Segment) => {
    const room = syncRef.current?.room;
    if (!room?.liveAt) return;
    const n = seq.current++;
    const startMs = Math.round(s.startWall + offset.current.ms - room.liveAt);
    const endMs = Math.round(s.endWall + offset.current.ms - room.liveAt);
    pendingUploads.current++;
    setUploads((u) => ({ ...u, pending: u.pending + 1 }));
    queue.current = queue.current.then(async () => {
      const form = new FormData();
      form.set("audio", new Blob([encodeWav(s.pcm)], { type: "audio/wav" }), "segment.wav");
      form.set("seq", String(n));
      form.set("startMs", String(startMs));
      form.set("endMs", String(endMs));
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        const res = await fetch(`/api/gd/rooms/${code}/segments`, { method: "POST", body: form }).catch(() => null);
        ok = Boolean(res && (res.ok || res.status === 409 || res.status === 403));
        if (!ok) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
      pendingUploads.current--;
      setUploads((u) => ({ pending: u.pending - 1, failed: u.failed + (ok ? 0 : 1) }));
    });
  }, [code]);

  // ── join (needs a tap: microphone permission + audio playback on mobile) ──
  const join = async () => {
    if (joining) return;
    setJoining(true);
    setJoinError(null);
    setBlocked(null);
    const rec = await ensureMic();
    if (!rec) { setJoining(false); return; }
    await rec.resume();
    const res = await postJson<Joined>(`/api/gd/rooms/${code}/join`);
    setJoining(false);
    if (!res.ok) { setJoinError(res.error); return; }
    after.current = 0;
    mesh.current?.close();
    mesh.current = new GdMesh({
      myPeer: res.data.peerId,
      stream: rec.mediaStream,
      ice: res.data.iceServers,
      send: async (to, kind, payload) => { await fetch(`/api/gd/rooms/${code}/signal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: res.data.peerId, to, kind, payload }) }); },
      onChange: () => setLinks(mesh.current?.states() ?? {}),
    });
    const seg = new GdSegmenter(upload);
    seg.enabled = false;
    segmenter.current = seg;
    rec.onChunk = (data, rate) => seg.push(data, rate);
    setJoined(res.data);
  };

  // ── sync loop: one request at a time; faster while links are negotiating ──
  useEffect(() => {
    if (!joined) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const t0 = Date.now();
      let delay = 2000;
      try {
        const res = await fetch(`/api/gd/rooms/${code}/sync?peer=${joined.peerId}&after=${after.current}`, { cache: "no-store" });
        const t1 = Date.now();
        if (res.status === 409 || res.status === 403 || res.status === 404 || res.status === 401) {
          const data = await res.json().catch(() => ({}));
          setBlocked(data.error ?? "You are no longer connected to this room.");
          mesh.current?.close();
          return;
        }
        if (!res.ok) throw new Error("sync");
        const data = (await res.json()) as GdSync;
        // Keep the clock offset from the fastest round trip seen (most accurate).
        if (t1 - t0 < offset.current.rtt) { offset.current = { ms: data.serverNow - (t0 + t1) / 2, rtt: t1 - t0 }; setClockOffset(offset.current.ms); }
        for (const s of data.signals) await mesh.current?.handle(s.from, s.kind, s.payload);
        if (data.signals.length) after.current = data.signals[data.signals.length - 1].id;
        syncRef.current = data;
        setSync(data);
        setOffline(false);
        const others = data.participants.filter((p) => p.online && p.peerId !== joined.peerId).map((p) => p.peerId);
        mesh.current?.update(others);
        const negotiating = others.some((p) => mesh.current?.state(p) !== "connected");
        delay = negotiating || data.signals.length ? 800 : 2000;
      } catch {
        setOffline(true);
        delay = 3000;
      }
      if (!stop) timer = setTimeout(tick, delay);
    };
    void tick();
    return () => { stop = true; clearTimeout(timer); };
  }, [code, joined]);

  // Clock for timers.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // Record speech only while the discussion is live and the learner is not muted.
  useEffect(() => {
    const seg = segmenter.current;
    if (!seg) return;
    const on = phase === "LIVE" && !muted;
    if (!on) seg.flush();
    seg.enabled = on;
    recRef.current?.setEnabled(!muted);
  }, [recRef, muted, phase]);

  // When the discussion ends: flush my last segment, wait for uploads, then ask for the evaluation until it is done.
  useEffect(() => {
    if (!joined || (phase !== "EVALUATING" && phase !== "JUDGING")) return;
    let stop = false;
    segmenter.current?.flush();
    const run = async () => {
      await queue.current;
      while (!stop) {
        const res = await postJson<{ status: string; message?: string }>(`/api/gd/rooms/${code}/evaluate`);
        if (stop) return;
        if (res.ok && res.data.status === "DONE") { setEvalState({ status: "DONE" }); router.refresh(); return; }
        if (res.ok && res.data.status === "FAILED") { setEvalState(res.data); return; }
        setEvalState(res.ok ? res.data : { status: "WAITING", message: res.error });
        await new Promise((r) => setTimeout(r, 4000));
      }
    };
    void run();
    return () => { stop = true; };
  }, [code, evalTry, joined, phase, router]);

  // Speaking rings, updated straight in the DOM every frame (no React re-renders).
  useEffect(() => {
    if (!joined) return;
    let raf = 0;
    const loop = () => {
      for (const p of syncRef.current?.participants ?? []) {
        const el = tiles.current.get(p.userId);
        if (!el) continue;
        const level = p.userId === me.id ? (muted ? 0 : micLevel()) : mesh.current?.level(p.peerId) ?? 0;
        const on = level > 0.03;
        el.style.boxShadow = on ? `0 0 0 ${2 + Math.min(6, level * 60)}px rgba(31,86,214,0.45)` : "none";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [joined, me.id, micLevel, muted]);

  useEffect(() => () => { mesh.current?.close(); }, []);

  // Warn before closing the tab mid-discussion.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (phase === "LIVE" || pendingUploads.current > 0) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const act = async (action: string, value?: unknown) => {
    if (busy) return;
    setBusy(action);
    setActionError(null);
    const res = await postJson(`/api/gd/rooms/${code}/control`, { action, value });
    setBusy(null);
    if (!res.ok) setActionError(res.error);
    return res.ok;
  };
  const toggleMute = () => { const next = !muted; setMuted(next); void act("mute", next); };
  const leave = async () => {
    if (!window.confirm(phase === "LIVE" ? "Leave the discussion? Your speech so far will still be evaluated." : "Leave this room?")) return;
    segmenter.current?.flush();
    await queue.current;
    await act("leave");
    mesh.current?.close();
    router.push("/practice/gd");
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };
  const share = async () => {
    const url = `${window.location.origin}/practice/gd/${code}`;
    if (navigator.share) await navigator.share({ title: "Join my group discussion on MyLoginn", text: `Room code ${code}`, url }).catch(() => {});
    else await copy(url);
  };

  const timeLeft = useMemo(() => {
    if (!sync) return 0;
    if (phase === "PREP" && sync.room.liveAt) return sync.room.liveAt - serverNow;
    if (phase === "LIVE" && sync.room.endsAt) return sync.room.endsAt - serverNow;
    return 0;
  }, [phase, serverNow, sync]);

  // ───────────── render ─────────────

  if (!joined) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Headphones className="mx-auto h-10 w-10 text-story-royal" />
        <h2 className="mt-3 text-xl font-bold">Join room {code}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Use headphones to avoid echo. Your browser will ask for microphone access. Only your own voice is recorded for the AI judge, and only during the discussion.</p>
        {micProblem ? <div className="mt-4 text-left"><MicHelp problem={micProblem} /></div> : null}
        {joinError ? <p role="alert" className="mt-4 text-sm text-danger">{joinError}</p> : null}
        <Button size="lg" className="mt-5" onClick={() => void join()} disabled={joining} icon={<Mic className="h-5 w-5" />}>{joining ? "Connecting…" : "Join with microphone"}</Button>
      </Card>
    );
  }

  if (blocked) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <XCircle className="mx-auto h-10 w-10 text-danger" />
        <p className="mt-3 text-sm leading-6">{blocked}</p>
        <div className="mt-4 flex justify-center gap-2"><Button onClick={() => void join()}>Rejoin here</Button><Button variant="secondary" href="/practice/gd">Back</Button></div>
      </Card>
    );
  }

  if (!sync) return <Card className="text-center"><Working label="Connecting to the room…" /></Card>;

  return (
    <div className="space-y-5">
      {offline ? <p role="status" className="flex items-center gap-2 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200"><WifiOff className="h-4 w-4" />Connection lost — reconnecting. Your audio links will recover automatically.</p> : null}
      {actionError ? <p role="alert" className="text-sm text-danger">{actionError}</p> : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><Chip tone="brand">{sync.room.category}</Chip><Chip>{phase === "LOBBY" ? "Waiting room" : phase === "PREP" ? "Preparation" : phase === "LIVE" ? "Live" : phase === "CANCELLED" ? "Cancelled" : "Evaluating"}</Chip></div>
            <h2 className="mt-2 text-xl font-bold leading-snug text-story-navy sm:text-2xl dark:text-foreground">{sync.room.topic}</h2>
          </div>
          {phase === "PREP" || phase === "LIVE" ? (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{phase === "PREP" ? "Discussion starts in" : "Time left"}</p>
              <p className={cn("text-3xl font-bold tabular-nums", phase === "LIVE" && timeLeft < 60_000 ? "text-danger" : "")}>{fmtClock(timeLeft)}</p>
            </div>
          ) : null}
        </div>
        {phase === "LIVE" && timeLeft < 5 * 60_000 && timeLeft > 0 ? <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">{timeLeft < 60_000 ? "Final minute — someone should summarise the discussion." : "Five minutes left. Start moving towards a conclusion."}</p> : null}
      </Card>

      {phase === "LOBBY" ? (
        <Card className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Room code</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-wider">{code}</p>
            <p className="mt-1 text-sm text-muted">{people.length} of {sync.room.maxParticipants} joined · {Math.round(sync.room.discussS / 60)} min discussion{sync.room.prepS ? ` · ${Math.round(sync.room.prepS / 60 * 10) / 10} min preparation` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void copy(code)} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>{copied ? "Copied" : "Copy code"}</Button>
            <Button variant="secondary" onClick={() => void share()} icon={<Share2 className="h-4 w-4" />}>Share link</Button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {people.map((p) => {
          const self = p.userId === me.id;
          const link = self ? "connected" : links[p.peerId] ?? "connecting";
          return (
            <div key={p.userId} className="flex flex-col items-center gap-2 rounded-3xl border border-border-soft bg-surface p-4 text-center">
              <span ref={(el) => { if (el) tiles.current.set(p.userId, el); else tiles.current.delete(p.userId); }} className="rounded-full transition-[box-shadow] duration-100">
                <Avatar name={p.name} avatarColor={p.avatarColor} avatarUrl={p.avatarUrl} size={64} />
              </span>
              <p className="flex max-w-full items-center gap-1 truncate text-sm font-semibold">{sync.room.hostId === p.userId ? <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Host" /> : null}<span className="truncate">{self ? "You" : p.name.split(" ")[0]}</span></p>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                {p.muted ? <MicOff className="h-3.5 w-3.5 text-danger" aria-label="Muted" /> : <Mic className="h-3.5 w-3.5" aria-hidden />}
                {!p.online ? "Offline" : self ? "Connected" : link === "connected" ? "Connected" : link === "failed" ? "Can't connect" : "Connecting…"}
              </p>
            </div>
          );
        })}
        {phase === "LOBBY" ? Array.from({ length: Math.max(0, sync.room.maxParticipants - people.length) }, (_, i) => (
          <div key={`empty-${i}`} className="grid min-h-[9.5rem] place-items-center rounded-3xl border border-dashed border-border-soft text-xs text-muted"><Users className="h-5 w-5" />Waiting</div>
        )) : null}
      </div>

      {phase === "PREP" ? <PrepNotes code={code} /> : null}

      {phase === "EVALUATING" || phase === "JUDGING" ? (
        <Card className="text-center">
          {evalState?.status === "FAILED" ? (
            <>
              <p className="text-sm text-danger">{evalState.message}</p>
              <Button className="mt-3" onClick={() => { setEvalState(null); setEvalTry((n) => n + 1); }}>Retry evaluation</Button>
            </>
          ) : (
            <>
              <Working label={uploads.pending ? `Sending your last ${uploads.pending > 1 ? `${uploads.pending} speech segments` : "speech segment"}…` : "The AI judge is evaluating the complete discussion…"} />
              <p className="mt-2 text-xs text-muted">This usually takes one to three minutes. Stay on this page — your report opens automatically.</p>
            </>
          )}
        </Card>
      ) : null}

      {phase === "CANCELLED" ? <Card className="text-center text-sm">This room was cancelled. <Button variant="ghost" href="/practice/gd">Create or join another</Button></Card> : null}

      {phase !== "EVALUATING" && phase !== "JUDGING" && phase !== "CANCELLED" ? (
        <div className="sticky bottom-20 z-10 flex flex-wrap items-center justify-center gap-2 rounded-full border border-border-soft bg-[var(--glass-nav-bg)] p-2 backdrop-blur-md md:bottom-4">
          <Button variant={muted ? "danger" : "secondary"} onClick={toggleMute} icon={muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}>{muted ? "Unmute" : "Mute"}</Button>
          <Button variant="ghost" onClick={() => { const next = !deaf; setDeaf(next); mesh.current?.setOutputMuted(next); mesh.current?.resumeAudio(); }} icon={deaf ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}>{deaf ? "Sound off" : "Sound on"}</Button>
          {isHost && phase === "LOBBY" ? <Button onClick={() => void act("start")} disabled={busy !== null || people.filter((p) => p.online).length < GD_LIMITS.minParticipants} icon={<Play className="h-4 w-4" />}>Start discussion</Button> : null}
          {isHost && (phase === "PREP" || phase === "LIVE") ? <Button variant="cancel" onClick={() => { if (window.confirm(phase === "PREP" ? "End during preparation? The room will be cancelled." : "End the discussion now and start the AI evaluation?")) void act("end"); }} disabled={busy !== null}>End discussion</Button> : null}
          <Button variant="ghost" onClick={() => void leave()} icon={<LogOut className="h-4 w-4" />}>Leave</Button>
        </div>
      ) : null}
      {!isHost && phase === "LOBBY" ? <p className="text-center text-sm text-muted">Waiting for the host to start. Share the code {code} with your group.</p> : null}
      {uploads.failed ? <p className="text-center text-xs text-amber-700 dark:text-amber-300">{uploads.failed} speech segment{uploads.failed > 1 ? "s" : ""} could not be uploaded because of the connection.</p> : null}
    </div>
  );
}

/** Private preparation notes, kept in this browser only. */
function PrepNotes({ code }: { code: string }) {
  const key = `ml-gd-notes:${code}`;
  const [notes, setNotes] = useState(() => { try { return localStorage.getItem(key) ?? ""; } catch { return ""; } });
  return (
    <Card>
      <p className="text-sm font-semibold">Preparation notes <span className="font-normal text-muted">(only you can see these)</span></p>
      <textarea value={notes} onChange={(e) => { setNotes(e.target.value); try { localStorage.setItem(key, e.target.value); } catch { /* storage blocked */ } }} rows={5} placeholder="Your stand, 2-3 points with examples, a counter-argument, a closing summary…" className="mt-2 w-full rounded-2xl border border-border-soft bg-background px-3.5 py-2.5 text-sm leading-6 outline-none focus:border-story-royal" />
      <p className="mt-2 text-xs leading-5 text-muted">Tip: open with a clear view, support it with a fact or example, invite quieter members in, and offer to summarise near the end.</p>
    </Card>
  );
}
