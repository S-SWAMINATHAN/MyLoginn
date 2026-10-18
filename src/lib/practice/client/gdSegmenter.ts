"use client";

import { SAMPLE_RATE } from "../speech";
import { GD_SEGMENT_GAP_MS, GD_SEGMENT_MAX_MS } from "../gd/config";

/**
 * Cuts the learner's own microphone into speech segments for the group-discussion judge: streaming downsample to
 * 16 kHz, 30 ms frames, a noise floor that adapts to the room, 300 ms of pre-roll so first syllables are kept, and a
 * segment ends after 1.2 s of silence (or at 40 s, so long turns are split). Only the speaker's own voice is recorded:
 * peers' audio arrives over WebRTC and never reaches this microphone stream (echo cancellation removes speaker bleed).
 */

const FRAME = (SAMPLE_RATE * 30) / 1000;
const PREROLL_FRAMES = 10;
const MIN_SPEECH_MS = 450;

export type Segment = { pcm: Int16Array; startWall: number; endWall: number; voicedMs: number };

export class GdSegmenter {
  private carry = 0;
  private acc = 0;
  private accN = 0;
  private frame: number[] = [];
  private preroll: Int16Array[] = [];
  private current: Int16Array[] | null = null;
  private startWall = 0;
  private lastVoiceWall = 0;
  private voicedMs = 0;
  private floor = 0.01;
  enabled = true;

  constructor(private onSegment: (s: Segment) => void) {}

  /** Feed raw chunks at the device rate. */
  push(data: Float32Array, rate: number) {
    const step = rate / SAMPLE_RATE;
    for (let i = 0; i < data.length; i++) {
      this.acc += data[i];
      this.accN++;
      this.carry += 1;
      if (this.carry >= step) {
        this.carry -= step;
        this.frame.push(this.acc / this.accN);
        this.acc = 0;
        this.accN = 0;
        if (this.frame.length >= FRAME) this.onFrame(this.frame.splice(0, FRAME));
      }
    }
  }

  private onFrame(samples: number[]) {
    const pcm = new Int16Array(samples.length);
    let sum = 0;
    for (let i = 0; i < samples.length; i++) { const v = Math.max(-1, Math.min(1, samples[i])); pcm[i] = Math.round(v * 32767); sum += v * v; }
    const rms = Math.sqrt(sum / samples.length);
    const now = Date.now();
    // Slowly track the quiet level of the room; speech must be clearly above it.
    if (rms < this.floor * 2) this.floor = this.floor * 0.995 + rms * 0.005;
    const voiced = this.enabled && rms > Math.max(0.015, this.floor * 3.5);

    if (!this.current) {
      this.preroll.push(pcm);
      if (this.preroll.length > PREROLL_FRAMES) this.preroll.shift();
      if (voiced) {
        this.current = [...this.preroll];
        this.preroll = [];
        this.startWall = now - PREROLL_FRAMES * 30;
        this.lastVoiceWall = now;
        this.voicedMs = 30;
      }
      return;
    }
    this.current.push(pcm);
    if (voiced) { this.lastVoiceWall = now; this.voicedMs += 30; }
    if (now - this.lastVoiceWall > GD_SEGMENT_GAP_MS || now - this.startWall > GD_SEGMENT_MAX_MS || !this.enabled) this.close(now);
  }

  private close(now: number) {
    const parts = this.current;
    this.current = null;
    if (!parts || this.voicedMs < MIN_SPEECH_MS) return;
    // Trim the trailing silence (keep 300 ms).
    const keep = Math.max(1, parts.length - Math.max(0, Math.floor((now - this.lastVoiceWall) / 30) - 10));
    const kept = parts.slice(0, keep);
    const pcm = new Int16Array(kept.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of kept) { pcm.set(p, o); o += p.length; }
    this.onSegment({ pcm, startWall: this.startWall, endWall: this.startWall + kept.length * 30, voicedMs: this.voicedMs });
  }

  /** Ends any open segment now (mute, leave, discussion end). */
  flush() {
    if (this.current) this.close(Date.now());
  }
}
