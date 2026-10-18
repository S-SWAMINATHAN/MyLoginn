"use client";

/**
 * Peer-to-peer audio mesh for a group discussion (2-6 people: each browser sends its voice directly to every other).
 * Signalling goes through MyLoginn's own API (an offer/answer mailbox), so there is no third-party service.
 *  - The peer with the lower id always makes the offer, so two browsers never offer to each other at once.
 *  - ICE candidates are gathered before sending, so each connection needs exactly one offer and one answer.
 *  - Every connection attempt has a generation id; answers for an older attempt are ignored.
 *  - A watchdog rebuilds links that fail or never connect (network switch, sleeping laptop).
 */

export type MeshSend = (to: string, kind: "offer" | "answer" | "bye", payload: unknown) => Promise<void>;
export type LinkState = "connecting" | "connected" | "failed";

type Link = { pc: RTCPeerConnection; gen: string; audio: HTMLAudioElement; analyser: AnalyserNode | null; startedAt: number; initiator: boolean };

const CONNECT_TIMEOUT_MS = 15_000;

async function gathered(pc: RTCPeerConnection, ms = 2500) {
  if (pc.iceGatheringState === "complete") return;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    const check = () => { if (pc.iceGatheringState === "complete") { clearTimeout(timer); pc.removeEventListener("icegatheringstatechange", check); resolve(); } };
    pc.addEventListener("icegatheringstatechange", check);
  });
}

export class GdMesh {
  private links = new Map<string, Link>();
  private ctx: AudioContext | null = null;
  private closed = false;
  private outputMuted = false;

  constructor(private opts: { myPeer: string; stream: MediaStream; ice: RTCIceServer[]; send: MeshSend; onChange: () => void }) {}

  private audioCtx() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  private create(peer: string, initiator: boolean, gen = Math.random().toString(36).slice(2, 10)): Link {
    this.drop(peer, false);
    const pc = new RTCPeerConnection({ iceServers: this.opts.ice, bundlePolicy: "max-bundle" });
    for (const track of this.opts.stream.getAudioTracks()) pc.addTrack(track, this.opts.stream);
    const audio = new Audio();
    audio.autoplay = true;
    audio.muted = this.outputMuted;
    const link: Link = { pc, gen, audio, analyser: null, startedAt: Date.now(), initiator };
    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      audio.srcObject = stream;
      void audio.play().catch(() => {});
      try {
        const ctx = this.audioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        link.analyser = analyser;
      } catch {
        /* the speaking indicator is optional */
      }
    };
    pc.onconnectionstatechange = () => this.opts.onChange();
    this.links.set(peer, link);
    this.opts.onChange();
    return link;
  }

  private async offer(peer: string) {
    const link = this.create(peer, true);
    try {
      await link.pc.setLocalDescription(await link.pc.createOffer());
      await gathered(link.pc);
      if (this.links.get(peer) !== link || this.closed) return;
      await this.opts.send(peer, "offer", { gen: link.gen, sdp: link.pc.localDescription });
    } catch {
      link.startedAt = 0; // let the watchdog retry
    }
  }

  /** Reconciles links with the peers currently online in the room. */
  update(peers: string[]) {
    if (this.closed) return;
    const want = new Set(peers.filter((p) => p !== this.opts.myPeer));
    for (const peer of [...this.links.keys()]) if (!want.has(peer)) this.drop(peer, false);
    for (const peer of want) if (!this.links.has(peer) && this.opts.myPeer < peer) void this.offer(peer);
    this.watchdog();
  }

  private watchdog() {
    const now = Date.now();
    for (const [peer, link] of this.links) {
      const s = link.pc.connectionState;
      const stuck = s !== "connected" && now - link.startedAt > CONNECT_TIMEOUT_MS;
      if ((s === "failed" || stuck) && link.initiator) void this.offer(peer);
    }
  }

  async handle(from: string, kind: string, payload: unknown) {
    if (this.closed) return;
    const p = payload as { gen?: string; sdp?: RTCSessionDescriptionInit } | null;
    if (kind === "bye") { this.drop(from, false); return; }
    if (!p?.sdp || !p.gen) return;
    if (kind === "offer") {
      const link = this.create(from, false, p.gen);
      try {
        await link.pc.setRemoteDescription(p.sdp);
        await link.pc.setLocalDescription(await link.pc.createAnswer());
        await gathered(link.pc);
        if (this.links.get(from) !== link) return;
        await this.opts.send(from, "answer", { gen: link.gen, sdp: link.pc.localDescription });
      } catch {
        this.drop(from, false);
      }
    } else if (kind === "answer") {
      const link = this.links.get(from);
      if (!link || link.gen !== p.gen || link.pc.signalingState !== "have-local-offer") return;
      await link.pc.setRemoteDescription(p.sdp).catch(() => {});
    }
  }

  state(peer: string): LinkState {
    const s = this.links.get(peer)?.pc.connectionState;
    return s === "connected" ? "connected" : s === "failed" ? "failed" : "connecting";
  }

  states(): Record<string, LinkState> {
    return Object.fromEntries([...this.links.keys()].map((p) => [p, this.state(p)]));
  }

  /** Remote voice level 0..1 for the speaking indicator. */
  level(peer: string) {
    const a = this.links.get(peer)?.analyser;
    if (!a) return 0;
    const buf = new Uint8Array(a.fftSize);
    a.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) { const x = (v - 128) / 128; sum += x * x; }
    return Math.sqrt(sum / buf.length);
  }

  /** Mutes/unmutes what you hear (not your microphone). */
  setOutputMuted(muted: boolean) {
    this.outputMuted = muted;
    for (const l of this.links.values()) l.audio.muted = muted;
  }

  /** Needed on mobile after the first tap: resumes analysers and remote playback. */
  resumeAudio() {
    void this.ctx?.resume().catch(() => {});
    for (const l of this.links.values()) void l.audio.play().catch(() => {});
  }

  private drop(peer: string, notify: boolean) {
    const link = this.links.get(peer);
    if (!link) return;
    this.links.delete(peer);
    link.pc.ontrack = null;
    link.pc.onconnectionstatechange = null;
    link.pc.close();
    link.audio.srcObject = null;
    if (notify) void this.opts.send(peer, "bye", null).catch(() => {});
    this.opts.onChange();
  }

  close() {
    this.closed = true;
    for (const peer of [...this.links.keys()]) this.drop(peer, true);
    void this.ctx?.close().catch(() => {});
  }
}
