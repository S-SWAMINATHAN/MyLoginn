"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window { YT?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer }; onYouTubeIframeAPIReady?: () => void }
}
type YTPlayer = { getCurrentTime: () => number; getDuration: () => number; getPlayerState: () => number; destroy: () => void };

export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) return u.searchParams.get("v") ?? u.pathname.match(/\/embed\/([\w-]{6,})/)?.[1] ?? null;
  } catch { /* not a URL */ }
  return null;
}

let ytReady: Promise<void> | null = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (!ytReady) {
    ytReady = new Promise<void>((resolve) => {
      window.onYouTubeIframeAPIReady = () => resolve();
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }
  return ytReady;
}

/**
 * Plays a lesson video and reports playback to the server every 10 seconds while it is actually
 * playing. The server caps how fast watched time can grow, so opening or scrubbing to the end
 * does not complete the video.
 */
export function VideoTracker({ lessonId, url, initialPercent, minPercent, trackable }: { lessonId: string; url: string; initialPercent: number; minPercent: number; trackable: boolean }) {
  const router = useRouter();
  const [percent, setPercent] = useState(initialPercent);
  const holder = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const yt = youTubeId(url);

  async function report(position: number, duration: number) {
    if (!trackable || !Number.isFinite(duration) || duration < 5) return;
    try {
      const res = await fetch(`/api/lms/lessons/${lessonId}/video`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ positionSeconds: position, durationSeconds: duration }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) { setPercent(json.videoPercent ?? 0); if (json.newlyCompleted) router.refresh(); }
    } catch { /* offline: the next tick retries */ }
  }

  useEffect(() => {
    if (!yt || !holder.current) return;
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    void loadYouTubeApi().then(() => {
      if (cancelled || !holder.current || !window.YT) return;
      const mount = document.createElement("div");
      holder.current.appendChild(mount);
      player = new window.YT.Player(mount, { videoId: yt, width: "100%", height: "100%", playerVars: { rel: 0, modestbranding: 1 } });
      timer = setInterval(() => { if (player && player.getPlayerState() === 1) void report(player.getCurrentTime(), player.getDuration()); }, 10_000);
    });
    return () => { cancelled = true; if (timer) clearInterval(timer); player?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt]);

  useEffect(() => {
    if (yt) return;
    const video = videoRef.current;
    if (!video) return;
    const id = setInterval(() => { if (!video.paused && !video.ended) void report(video.currentTime, video.duration); }, 10_000);
    const onEnd = () => void report(video.duration, video.duration);
    video.addEventListener("ended", onEnd);
    return () => { clearInterval(id); video.removeEventListener("ended", onEnd); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt]);

  return (
    <div>
      {yt
        ? <div ref={holder} className="aspect-video w-full overflow-hidden rounded-2xl bg-black [&_iframe]:h-full [&_iframe]:w-full" />
        : <video ref={videoRef} src={url} controls controlsList="nodownload" className="aspect-video w-full rounded-2xl bg-black" />}
      {trackable && (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          Watched {percent}% · watch at least {minPercent}% of the video to complete this step.
        </p>
      )}
    </div>
  );
}

/** "Mark as read" with a countdown that mirrors the server's minimum reading time. */
export function ReadButton({ lessonId, alreadyRead, waitSeconds }: { lessonId: string; alreadyRead: boolean; waitSeconds: number }) {
  const router = useRouter();
  const [left, setLeft] = useState(alreadyRead ? 0 : waitSeconds);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(alreadyRead);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (done || left <= 0) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [done, left]);

  async function mark() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/lms/lessons/${lessonId}/read`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) { setDone(true); router.refresh(); return; }
      if (json.retryAfterSeconds) setLeft(json.retryAfterSeconds);
      setError(json.error ?? "Could not save.");
    } finally { setBusy(false); }
  }

  if (done) return <p className="text-sm font-semibold text-success">Lesson read ✓</p>;
  return (
    <div>
      <button type="button" onClick={mark} disabled={busy || left > 0} className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {left > 0 ? `Keep reading (${left}s)` : busy ? "Saving…" : "I've read this lesson"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
