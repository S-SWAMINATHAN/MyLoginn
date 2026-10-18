"use client";

import { encodeWav } from "../speech";

/**
 * Plays the AI's lines with the natural neural voices served by /api/tts (the same voices as the course videos).
 * Long text is split at sentence boundaries and the next part is fetched while the current one plays, so there are no
 * gaps. If the voice service fails the caption stays on screen instead of falling back to a robotic browser voice.
 * Only one line ever plays at a time: a new speak() or stop() cancels the previous one.
 */

const MAX_CHUNK = 600;

function chunks(text: string) {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > MAX_CHUNK && cur) { out.push(cur.trim()); cur = ""; }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.flatMap((c) => (c.length > 690 ? c.match(/.{1,690}(\s|$)/g) ?? [c] : [c]));
}

export type SpeakResult = "done" | "failed" | "stopped";

export class VoicePlayer {
  private audio: HTMLAudioElement | null = null;
  private token = 0;
  private urls: string[] = [];
  speaking = false;

  private el() {
    return (this.audio ??= new Audio());
  }

  /** Call from a click: lets mobile Safari/Chrome play audio later without another tap. */
  unlock() {
    const a = this.el();
    const silent = URL.createObjectURL(new Blob([encodeWav(new Int16Array(800))], { type: "audio/wav" }));
    a.src = silent;
    void a.play().catch(() => {}).finally(() => URL.revokeObjectURL(silent));
  }

  private async fetchChunk(text: string, voice: string) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`/api/tts?v=${encodeURIComponent(voice)}&t=${encodeURIComponent(text)}`);
        if (res.ok) {
          const url = URL.createObjectURL(await res.blob());
          this.urls.push(url);
          return url;
        }
      } catch {
        /* retry once */
      }
    }
    return null;
  }

  async speak(text: string, voice: string, rate = 1): Promise<SpeakResult> {
    this.stop();
    const token = ++this.token;
    const parts = chunks(text);
    if (!parts.length) return "done";
    this.speaking = true;
    const a = this.el();
    let next = this.fetchChunk(parts[0], voice);
    try {
      for (let i = 0; i < parts.length; i++) {
        const url = await next;
        if (token !== this.token) return "stopped";
        if (!url) return "failed";
        if (i + 1 < parts.length) next = this.fetchChunk(parts[i + 1], voice);
        a.src = url;
        a.playbackRate = rate;
        const ended = await new Promise<SpeakResult>((resolve) => {
          const cleanup = () => { a.onended = null; a.onerror = null; a.onpause = null; };
          a.onended = () => { cleanup(); resolve("done"); };
          a.onerror = () => { cleanup(); resolve("failed"); };
          a.onpause = () => { if (token !== this.token) { cleanup(); resolve("stopped"); } };
          a.play().catch(() => { cleanup(); resolve("failed"); });
        });
        if (ended !== "done") return ended;
      }
      return "done";
    } finally {
      if (token === this.token) this.speaking = false;
    }
  }

  stop() {
    this.token++;
    this.speaking = false;
    if (this.audio) { this.audio.pause(); this.audio.removeAttribute("src"); }
    for (const u of this.urls.splice(0)) URL.revokeObjectURL(u);
  }
}
