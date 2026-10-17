import type { RawSubject } from "../types";
import { topic } from "./build";
import * as G from "./reasoning/vr-generated";
import * as W from "./reasoning/vr-written";

const subject: RawSubject = {
  "logical-sequence-of-words": topic(W.sequenceOfWords, {
    intro: "Arrange words in a natural order: a process, a life cycle, size, rank or time. Find the first and last items first; the middle usually falls into place.",
  }),
  "blood-relation-test": topic(W.bloodRelations, {
    intro: "Blood relation questions describe family links in words. Draw a small family tree as you read, marking gender (+ male, − female) and generation levels.",
    formulas: [
      { h: "Key relations", points: ["Father's or mother's brother: uncle; their sister: aunt", "Brother's or sister's son: nephew; daughter: niece", "Spouse's brother or sister's husband: brother-in-law", "'My (paternal) grandfather's only son' is my father; 'the only daughter of my father' is the speaker herself if the speaker is female", "If gender is not given, the answer may be 'cannot be determined'"] },
      { h: "Method", points: ["Start from the last person named and work backwards", "Keep generations on separate rows of your diagram", "For coded relations (A + B, A × B), decode one symbol at a time"] },
    ],
  }),
  syllogism: topic(W.syllogism, {
    intro: "Assume the statements are true even if they seem odd, and decide which conclusions definitely follow. Venn diagrams are the safest method.",
    formulas: [
      { h: "Rules", points: ["All A are B ⇒ Some A are B, and Some B are A (conversion)", "Some A are B ⇒ Some B are A", "No A is B ⇒ No B is A", "All + All ⇒ All; All + No ⇒ No; Some + All ⇒ Some", "Two 'some' statements or two negative statements give no definite conclusion"] },
      { h: "Either–or case", points: ["If two conclusions are about the same two groups and one says 'some are' while the other says 'no' (or 'all' vs 'some … not'), and neither follows, then 'either I or II' follows"] },
    ],
  }),
  "series-completion": topic(G.seriesCompletion, {
    intro: "Series completion mixes letters, numbers and patterns. Look at each position separately: letters, numbers and their positions in the alphabet.",
    formulas: [{ h: "Tips", points: ["Write letter positions (A = 1 … Z = 26)", "Check alternate terms for two interleaved series", "Number parts often follow squares, cubes or ± 1 patterns"] }],
  }),
  "cube-and-cuboid": topic(G.cubeCuboid, {
    intro: "A cube of side n painted on all faces and cut into unit cubes produces cubes with three, two, one or no painted faces.",
    formulas: [{ h: "Painted cube formulas (side n)", points: ["Total small cubes = n³", "Three faces painted (corners) = 8", "Two faces painted (edges) = 12(n − 2)", "One face painted (face centres) = 6(n − 2)²", "No face painted (core) = (n − 2)³"], example: "n = 4: 8 + 24 + 24 + 8 = 64 = 4³." }],
  }),
  dice: topic(W.dice, {
    intro: "A die has six faces; each face is adjacent to four faces and opposite to one.",
    formulas: [{ h: "Rules", points: ["Standard die: opposite faces add up to 7 (1–6, 2–5, 3–4)", "Two positions with two common faces: the remaining two faces are opposite each other", "Two faces shown together in any position are never opposite", "A face adjacent to four known faces is opposite the remaining one"] }],
  }),
  "venn-diagrams": topic(G.vennDiagrams, {
    intro: "Represent each group as a circle. A circle inside another means 'all of these are those'; overlapping circles mean 'some are'; separate circles mean 'none are'.",
    formulas: [{ h: "Common patterns", points: ["Nested: India ⊃ Tamil Nadu ⊃ Chennai", "Two separate circles inside one: Animals ⊃ Dogs, Cats", "Three overlapping circles: Doctors, Singers, Women", "Three separate circles: unrelated groups"] }],
  }),
  "character-puzzles": topic(G.characterPuzzles, {
    intro: "Character puzzles hide a missing number in a grid or figure. Test simple operations across each row (or column): sum, product, squares, or a mix.",
  }),
  "direction-sense-test": topic(G.directionSense, {
    intro: "Track position on a grid with North up and East right. A right turn moves clockwise (N → E → S → W); a left turn moves anticlockwise.",
    formulas: [{ h: "Tools", points: ["Keep a running (x, y) position: East +x, West −x, North +y, South −y", "Shortest distance from start = √(x² + y²) (Pythagoras)", "Final direction combines the vertical and horizontal parts, e.g. North-East", "In the morning the sun is in the East, so shadows fall to the West (reverse in the evening)"] }],
  }),
  classification: topic(G.classification, {
    intro: "Find the item that does not share the property common to the rest: a letter gap, a number property (prime, square, cube, multiple) or a pattern.",
  }),
  "data-sufficiency": topic(W.dataSufficiency, {
    intro: "You do not need to find the answer — only decide whether the statements give enough information to find it.",
    formulas: [{ h: "Answer choices", points: ["Statement I alone is sufficient", "Statement II alone is sufficient", "Either statement alone is sufficient", "Neither is sufficient, even together", "Both statements together are needed"] }, { h: "Method", points: ["Test I alone, then II alone, then both together", "A statement is sufficient only if it gives exactly one answer"] }],
  }),
  "arithmetic-reasoning": topic(G.arithmeticReasoning, {
    intro: "Arithmetic reasoning turns everyday situations into simple equations: heads and legs, poles and gaps, clock strikes, sharing and change.",
    formulas: [{ h: "Classic results", points: ["n poles in a line have n − 1 gaps", "A clock striking n times has n − 1 intervals", "Heads and legs: assume all are two-legged, then each four-legged animal adds 2 legs"] }],
  }),
  "verification-of-truth": topic(W.verificationOfTruth, {
    intro: "Choose the option that is always true of the given thing — an essential feature, not a common one.",
  }),
  "coding-decoding": topic(G.codingDecoding, {
    intro: "A word is converted into a code by a rule. Compare letters position by position to find the rule, then apply it to the new word.",
    formulas: [{ h: "Common codes", points: ["Shift each letter forward or backward by k places", "Reverse the word", "Opposite letters (A ↔ Z, B ↔ Y: positions add up to 27)", "Letter positions as numbers, or their sum", "Combinations of the above"] }],
  }),
  "seating-arrangement": topic(W.seatingArrangement, {
    intro: "Place people using the definite clues first (ends, middle, opposite seats), then the relative ones. In a circle facing the centre, a person's left is the clockwise direction.",
    formulas: [{ h: "Directions", points: ["Row facing north: left and right are as you see them", "Row facing south: their left is your right", "Circle facing the centre: left = clockwise, right = anticlockwise", "In a circle of 2n seats, opposite seats are n places apart"] }],
  }),
  "ranking-and-order": topic(G.rankingOrder, {
    intro: "Ranking questions count positions in a row or class.",
    formulas: [{ h: "Formulas", points: ["Total = position from left + position from right − 1", "Rank from bottom = total − rank from top + 1", "People between two persons = total − (left position of one) − (right position of the other), when they do not overlap"] }],
  }),
};
export default subject;
