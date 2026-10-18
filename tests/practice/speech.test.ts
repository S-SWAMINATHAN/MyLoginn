import { test } from "node:test";
import assert from "node:assert/strict";
import { alignWords, decodeWav, deliveryScore, encodeWav, frameEnergies, transcriptMetrics, voiceActivity, band, SAMPLE_RATE } from "../../src/lib/practice/speech";
import { gdPhase, isRoomCode, normalizeRoomCode } from "../../src/lib/practice/gd/config";
import { INTERVIEW_TYPES, stagePlan } from "../../src/lib/practice/interview/config";
import { EXERCISES, challengeSeconds, itemById, SCENES } from "../../src/lib/practice/speaking/content";
import { weightedScore, readinessLevel } from "../../src/lib/practice/report";

/** Synthetic "speech": 440 Hz bursts separated by silence. */
function pcm(pattern: [number, boolean][]) {
  const total = pattern.reduce((n, [ms]) => n + ms, 0);
  const out = new Int16Array((total * SAMPLE_RATE) / 1000);
  let i = 0;
  for (const [ms, loud] of pattern) {
    const n = (ms * SAMPLE_RATE) / 1000;
    for (let k = 0; k < n; k++, i++) out[i] = loud ? Math.round(Math.sin((i / SAMPLE_RATE) * 2 * Math.PI * 440) * 8000) : Math.round((Math.random() - 0.5) * 60);
  }
  return out;
}

test("WAV encode/decode round-trips 16-bit mono PCM", () => {
  const src = pcm([[200, true], [100, false]]);
  const wav = new Uint8Array(encodeWav(src));
  const back = decodeWav(wav)!;
  assert.equal(back.rate, SAMPLE_RATE);
  assert.deepEqual(Array.from(back.pcm.slice(0, 50)), Array.from(src.slice(0, 50)));
  assert.equal(decodeWav(new Uint8Array(10)), null);
});

test("voice activity measures speech, span and long pauses", () => {
  const va = voiceActivity(frameEnergies(pcm([[500, false], [1500, true], [2000, false], [1000, true], [300, false]])));
  assert.ok(va.speechMs >= 2400 && va.speechMs <= 2800, `speech ${va.speechMs}`);
  assert.equal(va.longPauses, 1);
  assert.ok(va.firstVoiceMs >= 450 && va.firstVoiceMs <= 550);
  assert.ok(va.longestPauseMs >= 1800);
});

test("silence and tiny blips count as no speech (never sent to the AI)", () => {
  assert.equal(voiceActivity(frameEnergies(pcm([[3000, false]]))).speechMs, 0);
  assert.equal(voiceActivity(frameEnergies(pcm([[1000, false], [150, true], [1000, false]]))).speechMs, 0);
});

test("transcript metrics: fillers, repeats, pace", () => {
  const m = transcriptMetrics("Um, I I worked on Selenium, uh, basically for automation.", 6000);
  assert.equal(m.fillers.um, 1);
  assert.equal(m.fillers.uh, 1);
  assert.equal(m.fillers.basically, 1);
  assert.equal(m.repeats, 1);
  assert.equal(m.words, 10);
  assert.equal(m.wpm, 100);
  // "like" as a verb is not a filler unless it is frequent.
  assert.equal(transcriptMetrics("I like testing.", 2000).fillers.like, undefined);
});

test("delivery score is gentle on natural speech and stable", () => {
  const good = transcriptMetrics(Array.from({ length: 130 }, (_, i) => `word${i % 40}`).join(" "), 60_000);
  const va = { durationMs: 60_000, speechMs: 50_000, spanMs: 60_000, firstVoiceMs: 0, longPauses: 1, longestPauseMs: 1600 };
  assert.ok(deliveryScore(good, va) >= 95);
  assert.equal(deliveryScore(good, va), deliveryScore(good, va));
  const slow = transcriptMetrics(Array.from({ length: 50 }, () => "um so").join(" "), 60_000);
  assert.ok(deliveryScore(slow, { ...va, longPauses: 8 }) < 60);
});

test("word alignment finds missing, wrong and extra words", () => {
  const a = alignWords("Red lorry, yellow lorry.", "red lorry lorry");
  assert.deepEqual(a.missing, ["yellow"]);
  assert.equal(a.accuracy, 75);
  assert.deepEqual(a.marks.map((m) => m.status), ["ok", "ok", "missing", "ok"]);
  const b = alignWords("She sells seashells", "she sell seashells");
  assert.deepEqual(b.substituted, [{ expected: "sells", said: "sell" }]);
  assert.equal(alignWords("Effective communication is essential", "um effective communication is essential").accuracy, 100);
});

test("rubric bands and weighted scores", () => {
  assert.equal(band(92), "Excellent");
  assert.equal(band(80), "Very Good");
  assert.equal(band(59), "Significant Improvement Needed");
  assert.equal(weightedScore({ a: 80, b: undefined, c: 60 }, { a: 1, b: 5, c: 1 }), 70);
  assert.match(readinessLevel(82), /Interview Ready with Improvement Areas/);
});

test("interview plans start with intro, end with closing, and fit every length", () => {
  for (const type of INTERVIEW_TYPES) for (const n of [5, 8, 12]) {
    const plan = stagePlan(type, n);
    assert.equal(plan.length, n);
    assert.equal(plan[0], "intro");
    assert.equal(plan[n - 1], "closing");
  }
});

test("room codes normalise and validate", () => {
  assert.equal(normalizeRoomCode("ml-gd-7k29"), "ML-GD-7K29");
  assert.equal(normalizeRoomCode("7k29"), "ML-GD-7K29");
  assert.ok(isRoomCode("ML-GD-7K29"));
  assert.ok(!isRoomCode("ML-GD-7K2"));
  assert.ok(!isRoomCode("ML-GD-0O1I")); // ambiguous characters are never generated
});

test("GD phase is derived from times so every client agrees", () => {
  const liveAt = 1_000_000, endsAt = liveAt + 1_800_000;
  const room = { status: "LIVE", liveAt, endsAt };
  assert.equal(gdPhase(room, liveAt - 1), "PREP");
  assert.equal(gdPhase(room, liveAt + 5), "LIVE");
  assert.equal(gdPhase(room, endsAt), "EVALUATING");
  assert.equal(gdPhase({ status: "LOBBY", liveAt: null, endsAt: null }, 0), "LOBBY");
});

test("speaking content is well-formed", () => {
  const ids = new Set<string>();
  for (const ex of EXERCISES) {
    assert.ok(ex.items.length >= ex.perSession, `${ex.kind} has too few items`);
    for (const item of ex.items) {
      assert.ok(!ids.has(item.id), `duplicate id ${item.id}`);
      ids.add(item.id);
      assert.equal(itemById(item.id), item);
      if (item.scene) assert.ok(SCENES[item.scene], `missing scene ${item.scene}`);
      if (["repeat", "twister", "pronounce"].includes(ex.kind)) assert.ok(item.target, `${item.id} needs a target`);
      if (["describe", "story", "comprehension", "listen", "grammar", "fluency"].includes(ex.kind)) assert.ok(item.reference, `${item.id} needs a reference`);
    }
  }
  assert.ok(challengeSeconds("Red lorry, yellow lorry.", 3) > 3);
});
