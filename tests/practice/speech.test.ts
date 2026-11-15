import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { alignWords, decodeWav, deliveryScore, encodeWav, frameEnergies, transcriptMetrics, voiceActivity, band, SAMPLE_RATE } from "../../src/lib/practice/speech";
import { gdPhase, isRoomCode, normalizeRoomCode } from "../../src/lib/practice/gd/config";
import { INTERVIEW_TYPES, LENGTHS, stagePlan } from "../../src/lib/practice/interview/config";
import { EXERCISES, challengeSeconds, itemById, SCENES, speakingProgressLabels } from "../../src/lib/practice/speaking/content";
import { expandSpeakingConfig, normalizeSpeakingConfig } from "../../src/lib/practice/speaking/engine";
import { expandInterviewState, selectNextInterviewQuestion } from "../../src/lib/practice/interview/engine";
import { Scene } from "../../src/components/practice/Scenes";
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

test("interview plans keep bookends, shuffle stages and fit every length", () => {
  for (const type of INTERVIEW_TYPES) for (const n of [5, ...LENGTHS.map((length) => length.questions)]) {
    const plan = stagePlan(type, n);
    assert.equal(plan.length, n);
    assert.equal(plan[0], "intro");
    assert.equal(plan[n - 1], "closing");
    for (let i = 1; i < plan.length; i++) assert.notEqual(plan[i], plan[i - 1], `${type.id} should not repeat adjacent stages`);
  }
  for (const type of INTERVIEW_TYPES) {
    const plans = Array.from({ length: 20 }, () => stagePlan(type, 12).join(","));
    assert.ok(new Set(plans).size > 1, `${type.id} should vary between interviews`);
  }
});

test("untouched interviews and speaking sessions are expanded without losing existing work", () => {
  const type = INTERVIEW_TYPES.find((entry) => entry.id === "technical")!;
  const state = { plan: stagePlan(type, 5), asked: 1, current: "Tell me about yourself.", askedQuestions: [], memory: "", recent: [], done: false };
  const config = { type: type.id, difficulty: "intermediate", persona: "professional", length: "quick" };
  const expandedState = expandInterviewState(config, state);
  assert.equal(expandedState.plan.length, LENGTHS.find((length) => length.id === "quick")!.questions);
  const inProgress = { ...state, asked: 2 };
  assert.equal(expandInterviewState(config, inProgress), inProgress);
  const missingQuestion = selectNextInterviewQuestion(config, "technical", 3, "", [state.current]);
  assert.ok(missingQuestion.length > 10, "a missing AI follow-up must not end the interview early");
  assert.notEqual(missingQuestion, state.current);
  assert.notEqual(selectNextInterviewQuestion(config, "technical", 3, "Already asked?", ["Already asked?"]), "Already asked?");

  const oldConfig = { kind: "twister", mode: "practice" as const, items: EXERCISES.find((entry) => entry.kind === "twister")!.items.slice(0, 4).map((item) => item.id) };
  const expandedConfig = expandSpeakingConfig(oldConfig);
  assert.equal(expandedConfig.items.length, EXERCISES.find((entry) => entry.kind === "twister")!.perSession);
  assert.deepEqual(expandedConfig.items.slice(0, oldConfig.items.length), oldConfig.items);
  assert.equal(new Set(expandedConfig.items).size, expandedConfig.items.length);
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
      if (item.scene) {
        assert.ok(SCENES[item.scene], `missing scene ${item.scene}`);
        assert.match(renderToStaticMarkup(createElement(Scene, { id: item.scene, title: SCENES[item.scene].title })), /<img/);
      }
      if (["repeat", "twister", "pronounce"].includes(ex.kind)) assert.ok(item.target, `${item.id} needs a target`);
      if (["describe", "story", "comprehension", "listen", "grammar", "fluency"].includes(ex.kind)) assert.ok(item.reference, `${item.id} needs a reference`);
    }
  }
  assert.ok(challengeSeconds("Red lorry, yellow lorry.", 3) > 3);
});

test("speaking topics have larger banks and each session gets a shuffled selection", () => {
  const minimums: Record<string, number> = {
    repeat: 40,
    pronounce: 15,
    describe: 10,
    story: 24,
    listen: 30,
    comprehension: 48,
    grammar: 30,
    fluency: 72,
    twister: 36,
  };

  for (const ex of EXERCISES) {
    assert.ok(ex.items.length >= minimums[ex.kind], `${ex.kind} should have a larger question bank`);
    const sessions = Array.from({ length: 10 }, () => normalizeSpeakingConfig({ kind: ex.kind })!);
    for (const config of sessions) {
      assert.equal(config.items.length, ex.perSession);
      assert.equal(new Set(config.items).size, config.items.length);
      assert.ok(config.items.every((id) => ex.items.some((item) => item.id === id)));
    }
    assert.ok(new Set(sessions.map((config) => config.items.join(","))).size > 1, `${ex.kind} should vary between sessions`);
  }

  const comprehensionItems = EXERCISES.find((ex) => ex.kind === "comprehension")!.items;
  const comprehension = EXERCISES.find((ex) => ex.kind === "comprehension")!;
  const passageSizes = [...new Set(comprehensionItems.map((item) => item.id.split(".")[1]))]
    .map((passageId) => comprehensionItems.filter((item) => item.id.split(".")[1] === passageId).length);
  assert.equal(new Set(passageSizes).size, 1, "comprehension passages use complete, equal-sized question groups");
  const expectedPassages = Math.ceil(comprehension.perSession / passageSizes[0]);
  for (const config of Array.from({ length: 10 }, () => normalizeSpeakingConfig({ kind: "comprehension" })!)) {
    const groups: string[][] = [];
    for (const id of config.items) {
      const passageId = id.split(".")[1];
      let group = groups[groups.length - 1];
      if (!group || group[0].split(".")[1] !== passageId) {
        assert.ok(!groups.some((existing) => existing[0].split(".")[1] === passageId), "passage questions stay contiguous");
        group = [];
        groups.push(group);
      }
      group.push(id);
    }
    assert.equal(groups.length, expectedPassages, "each session includes enough shuffled passages");
    for (const group of groups) {
      const passageId = group[0].split(".")[1];
      const matchingItems = comprehensionItems.filter((item) => item.id.split(".")[1] === passageId);
      assert.deepEqual(group, matchingItems.map((item) => item.id));
    }
  }

  const fluency = EXERCISES.find((ex) => ex.kind === "fluency")!;
  for (const focus of new Set(fluency.items.map((item) => item.focus))) {
    const config = normalizeSpeakingConfig({ kind: "fluency", focus })!;
    assert.equal(config.items.length, fluency.perSession);
    assert.ok(config.items.every((id) => itemById(id)?.focus === focus));
  }
});

test("speaking progress labels show distinct topic text instead of repeated prompt starters", () => {
  const fluency = EXERCISES.find((ex) => ex.kind === "fluency")!;
  const topics = fluency.items.slice(0, 12);
  const labels = speakingProgressLabels(topics);
  assert.equal(new Set(labels).size, labels.length);
  assert.ok(labels.every((label) => !/^Speak for one minute:/i.test(label)));
  const specific = fluency.items.find((item) => /stay healthy/i.test(item.display))!;
  assert.match(speakingProgressLabels([specific])[0], /stay healthy/i);

  const repeated = speakingProgressLabels([{ display: "Speak for one minute: a topic" }, { display: "Speak for one minute: a topic" }]);
  assert.deepEqual(repeated, ["a topic", "a topic (2)"]);
});

test("open-response speaking exercises include a separately measured communication score", () => {
  for (const kind of ["describe", "story", "listen", "comprehension", "grammar", "fluency"]) {
    assert.ok(EXERCISES.find((ex) => ex.kind === kind)!.dims.some((dimension) => dimension.key === "communication"), `${kind} includes communication`);
  }
  for (const kind of ["repeat", "pronounce", "twister"]) {
    assert.ok(!EXERCISES.find((ex) => ex.kind === kind)!.dims.some((dimension) => dimension.key === "communication"), `${kind} stays focused on exact speech`);
  }
});
