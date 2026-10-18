"use client";

import { SAMPLE_RATE, encodeWav, frameEnergies, voiceActivity, type VoiceActivity } from "../speech";

/**
 * Microphone capture to 16 kHz mono WAV. Audio is taken at the device's native rate (Firefox refuses to connect a
 * microphone to an AudioContext with a different rate) and downsampled here. The same voice-activity measure the server
 * uses runs on the result, so an empty recording is caught before it is uploaded.
 */

export type MicProblem = "denied" | "no-device" | "busy" | "insecure" | "unsupported" | "unknown";

export class MicError extends Error {
  constructor(public problem: MicProblem) {
    super(problem);
  }
}

export const MIC_HELP: Record<MicProblem, string> = {
  denied: "Microphone access is blocked. Click the lock or camera icon in the address bar, allow the microphone for this site, then reload the page.",
  "no-device": "No microphone was found. Connect a headset or microphone and try again.",
  busy: "Your microphone is being used by another app (for example a video call). Close it and try again.",
  insecure: "The microphone only works on a secure (https) connection.",
  unsupported: "This browser cannot record audio. Please use a recent Chrome, Edge, Safari or Firefox.",
  unknown: "The microphone could not be started. Please check your device and try again.",
};

export type Recording = { wav: Blob; va: VoiceActivity; durationMs: number };

const WORKLET = `class Tap extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor("ml-tap",Tap)`;

function downsample(chunks: Float32Array[], fromRate: number): Int16Array {
  const length = chunks.reduce((n, c) => n + c.length, 0);
  const input = new Float32Array(length);
  let o = 0;
  for (const c of chunks) { input.set(c, o); o += c.length; }
  const ratio = fromRate / SAMPLE_RATE;
  const out = new Int16Array(Math.floor(length / ratio));
  for (let i = 0; i < out.length; i++) {
    // Average the source samples that fall in this output sample (a simple low-pass that avoids aliasing hiss).
    const start = Math.floor(i * ratio), end = Math.min(length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    const v = end > start ? sum / (end - start) : input[start] ?? 0;
    out[i] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  }
  return out;
}

export class Recorder {
  private chunks: Float32Array[] = [];
  private recording = false;
  private node: AudioWorkletNode | ScriptProcessorNode | null = null;
  /** RMS of the latest chunk (0..1), for the level meter. */
  level = 0;
  /** Milliseconds of loud audio since start(), for "we can hear you". */
  voicedMs = 0;
  private lastVoiceAt = 0;
  private startedAt = 0;
  /** Every captured chunk at the device rate, recording or not (group discussion segmentation). */
  onChunk: ((data: Float32Array, rate: number) => void) | null = null;

  private constructor(private stream: MediaStream, private ctx: AudioContext, public onEnded?: () => void) {}

  /** Asks for the microphone (must be called from a click so iOS allows audio). */
  static async open(onEnded?: () => void): Promise<Recorder> {
    if (typeof window !== "undefined" && !window.isSecureContext) throw new MicError("insecure");
    if (!navigator.mediaDevices?.getUserMedia) throw new MicError("unsupported");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    } catch (e) {
      const name = (e as DOMException)?.name;
      throw new MicError(name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "NotFoundError" || name === "OverconstrainedError" ? "no-device" : name === "NotReadableError" || name === "AbortError" ? "busy" : "unknown");
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const rec = new Recorder(stream, ctx, onEnded);
    await rec.wire();
    stream.getAudioTracks().forEach((t) => t.addEventListener("ended", () => rec.onEnded?.()));
    return rec;
  }

  private async wire() {
    const source = this.ctx.createMediaStreamSource(this.stream);
    const take = (data: Float32Array) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      this.level = Math.sqrt(sum / data.length);
      this.onChunk?.(data, this.ctx.sampleRate);
      if (!this.recording) return;
      this.chunks.push(data);
      const now = performance.now();
      if (this.level > 0.02) { this.voicedMs += (data.length / this.ctx.sampleRate) * 1000; this.lastVoiceAt = now; }
    };
    try {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
      await this.ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(this.ctx, "ml-tap");
      node.port.onmessage = (e) => take(e.data as Float32Array);
      source.connect(node);
      this.node = node;
    } catch {
      // Older Safari: ScriptProcessor fallback.
      const node = this.ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = (e) => take(new Float32Array(e.inputBuffer.getChannelData(0)));
      source.connect(node);
      node.connect(this.ctx.destination);
      this.node = node;
    }
  }

  get isRecording() {
    return this.recording;
  }
  get elapsedMs() {
    return this.recording ? performance.now() - this.startedAt : 0;
  }
  /** Silence since the learner last spoke (0 until they have spoken). */
  get silenceMs() {
    return this.lastVoiceAt ? performance.now() - this.lastVoiceAt : 0;
  }

  /** Makes sure audio keeps flowing (contexts start suspended on some browsers until a tap). */
  async resume() {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  async start() {
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.chunks = [];
    this.voicedMs = 0;
    this.lastVoiceAt = 0;
    this.startedAt = performance.now();
    this.recording = true;
  }

  /** Discards the current take. */
  cancel() {
    this.recording = false;
    this.chunks = [];
  }

  stop(): Recording {
    this.recording = false;
    const pcm = downsample(this.chunks, this.ctx.sampleRate);
    this.chunks = [];
    const va = voiceActivity(frameEnergies(pcm, SAMPLE_RATE));
    return { wav: new Blob([encodeWav(pcm)], { type: "audio/wav" }), va, durationMs: Math.round((pcm.length / SAMPLE_RATE) * 1000) };
  }

  /** The live stream, for group discussion peers. */
  get mediaStream() {
    return this.stream;
  }

  setEnabled(enabled: boolean) {
    this.stream.getAudioTracks().forEach((t) => (t.enabled = enabled));
  }

  close() {
    this.recording = false;
    try { this.node?.disconnect(); } catch { /* already gone */ }
    this.stream.getTracks().forEach((t) => t.stop());
    void this.ctx.close().catch(() => {});
  }
}

/** Current microphone permission without prompting, where the browser supports asking. */
export async function micPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
}
