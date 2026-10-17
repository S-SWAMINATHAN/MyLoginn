import type { RawSubject } from "../types";
import { topic } from "./build";
import { letterSeries, logicalProblems, numberSeries } from "./reasoning/lr-generated";
import * as W from "./reasoning/lr-written";

const FIVE_WAY = "Each question has a statement followed by two items (I and II). Decide which of them is valid and choose from: only I, only II, either I or II, neither I nor II, or both I and II.";

const subject: RawSubject = {
  "number-series": topic(numberSeries, {
    intro: "In a number series each term follows a rule. Find the rule from the first few terms, check it against the rest, then apply it.",
    formulas: [
      { h: "Common patterns", points: ["Addition or subtraction of a constant (arithmetic series)", "Multiplication by a constant (geometric series)", "Differences that themselves grow by a constant", "Squares, cubes, n(n + 1), n² ± 1", "Prime numbers", "Two interleaved series (look at alternate terms)", "Mixed operations such as ×1 + 1, ×2 + 2, ×3 + 3"] },
      { h: "Method", points: ["Write the differences between consecutive terms", "If the differences are not constant, write the differences of differences", "If the terms grow very fast, try ratios", "For 'find the wrong number', the rule fits every term except one"], example: "2, 6, 12, 20, 30, ? — differences 4, 6, 8, 10 grow by 2, so the next difference is 12 and the answer is 42 (also n(n + 1))." },
    ],
  }),
  "letter-and-symbol-series": topic(letterSeries, {
    intro: "Letter series move through the alphabet by a rule. Convert letters to their positions (A = 1 … Z = 26) to see the rule clearly.",
    formulas: [
      { h: "Useful facts", points: ["Positions: A 1, E 5, J 10, O 15, T 20, Y 25 (remember EJOTY)", "Opposite letters add to 27: A–Z, B–Y, C–X, … M–N", "The alphabet wraps around: after Z comes A"] },
      { h: "Patterns", points: ["Constant skips (+2, +3, …)", "Growing skips (+1, +2, +3, …)", "Two alternating series", "Letter–number pairs that change together", "Groups of letters that continue one long series"] },
    ],
  }),
  "verbal-classification": topic(W.verbalClassification, {
    intro: "Four or five words are given; all but one share a property. Identify the shared property — category, function, material or meaning — and pick the word that lacks it.",
    formulas: [{ h: "Tips", points: ["Look for the most specific common category, not just 'things'", "Check function (what it is used for) and composition (what it is made of)", "If two answers seem possible, choose the one that differs on the clearest, most specific property"] }],
  }),
  "essential-part": topic(W.essentialPart, {
    intro: "Choose the item without which the thing in capitals cannot exist. Optional or common features are not essential.",
    formulas: [{ h: "Test each option", points: ["Ask: could the thing still exist without this option? If yes, it is not essential", "Beware of options that are typical but not necessary (a desert without camels is still a desert)"] }],
  }),
  analogies: topic(W.analogies, {
    intro: "An analogy compares two pairs with the same relationship: A is to B as C is to D. Put the first relationship into a short sentence, then test it on each option.",
    formulas: [{ h: "Common relationships", points: ["Part to whole (page : book)", "Tool to user (needle : tailor)", "Instrument to what it measures (thermometer : temperature)", "Degree or intensity (plummet : fall)", "Opposites and synonyms", "Number relations (square, cube, multiple)"] }],
  }),
  "artificial-language": topic(W.artificialLanguage, {
    intro: "Words of an invented language are given with their meanings. Compare the phrases: a word that appears in two phrases stands for the meaning they share.",
    formulas: [{ h: "Method", points: ["Find the word common to two phrases and match it to the common meaning", "Remove decoded words to reveal the rest", "Word order may differ from English; rely on common words, not position"] }],
  }),
  "matching-definitions": topic(W.matchingDefinitions, {
    intro: "A definition is given; choose the situation that fits every part of it. Read for key conditions (who, why, what) and reject options that miss any of them.",
  }),
  "making-judgments": topic(W.makingJudgments, {
    intro: "Choose the most reasonable judgement from a short situation. Prefer conclusions that are supported by the facts given, practical and not extreme.",
    formulas: [{ h: "Avoid", points: ["Absolute words (always, never, all) unless the facts justify them", "Conclusions that bring in information not given", "Drastic actions when a simpler first step exists"] }],
  }),
  "verbal-reasoning": topic(W.verbalReasoning, {
    intro: "Three statements are given. Assuming the first two are true, decide whether the third is true, false or uncertain (cannot be determined).",
    formulas: [{ h: "Method", points: ["Draw an order line for comparisons (taller, older, costs more)", "Use simple Venn diagrams for 'all', 'some' and 'no' statements", "Answer 'uncertain' when the first two statements do not connect the items in the third"] }],
  }),
  "logical-problems": topic(logicalProblems, {
    intro: "Each problem gives comparisons between people or things. Arrange them in order; the third statement is true if the order forces it, false if the order contradicts it, and uncertain otherwise.",
    formulas: [{ h: "Method", points: ["Rewrite every statement in one direction (for example, 'taller than')", "Join statements that share an item into a chain: A > B and B > C give A > B > C", "If two items are only compared with a third item, their own order is uncertain"] }],
  }),
  "logical-games": topic(W.logicalGames, {
    intro: "Logical games describe a few people or objects with conditions about their positions or attributes. Build a table or a diagram and fill in the certain facts first.",
    formulas: [{ h: "Method", points: ["Start with fixed facts (ends, exact positions, direct assignments)", "Use negative conditions ('is not') to eliminate options", "When two cases remain, test each against every condition"] }],
  }),
  "analyzing-arguments": topic(W.analyzingArguments, {
    intro: "An argument has a conclusion and the premises offered for it. To weaken it, find an alternative explanation or a gap; to strengthen it, close that gap.",
    formulas: [{ h: "Common flaws", points: ["Correlation treated as causation", "Unrepresentative or biased samples", "Ignoring alternative explanations", "Generalising from a few cases"] }],
  }),
  "statement-and-assumption": topic(W.statementAssumption, {
    intro: `${FIVE_WAY} An assumption is something the speaker takes for granted — something that must be true for the statement to make sense.`,
    formulas: [{ h: "Tests", points: ["Negate the assumption: if the statement then becomes pointless, the assumption is implicit", "Advertisements assume people want the benefit and notice adverts", "Extreme assumptions (all, never, only) are rarely implicit"] }],
  }),
  "course-of-action": topic(W.courseOfAction, {
    intro: `${FIVE_WAY} A course of action follows if it is practical, reduces or solves the problem, and is not an over-reaction.`,
    formulas: [{ h: "Tests", points: ["Does it address the stated problem directly?", "Is it practical and proportionate?", "Avoid extreme steps such as closing, banning everything or moving people away"] }],
  }),
  "statement-and-conclusion": topic(W.statementConclusion, {
    intro: `${FIVE_WAY} A conclusion follows only if it is definitely implied by the statement, without outside knowledge.`,
    formulas: [{ h: "Tests", points: ["'Some' never implies 'all'", "Forecasts and plans do not imply certainty", "A conclusion that only restates the statement does follow"] }],
  }),
  "theme-detection": topic(W.themeDetection, {
    intro: "Find the central idea of a short passage. The theme covers the whole passage, not just one detail, and does not add claims the passage does not make.",
  }),
  "cause-and-effect": topic(W.causeAndEffect, {
    intro: "Two events are given. Decide whether one causes the other, whether both are independent causes, effects of independent causes, or effects of a common cause.",
    formulas: [{ h: "Method", points: ["Check time order: a cause comes before its effect", "Ask whether one event could reasonably bring about the other", "If both look like results of a third situation (heat wave, budget cut), choose 'common cause'", "If they are unrelated, choose 'effects of independent causes'"] }],
  }),
  "statement-and-argument": topic(W.statementArgument, {
    intro: `${FIVE_WAY} A strong argument is directly related to the question and important; a weak one is trivial, exaggerated or based on irrelevant points.`,
    formulas: [{ h: "Tests", points: ["Is the argument relevant to the specific question?", "Is it backed by a real reason or consequence?", "Arguments with sweeping words (everyone, nobody) or personal preferences are usually weak"] }],
  }),
  "logical-deduction": topic(W.logicalDeduction, {
    intro: "Deduction draws conclusions that must be true if the premises are true.",
    formulas: [{ h: "Valid forms", points: ["If P then Q; P ⇒ Q (modus ponens)", "If P then Q; not Q ⇒ not P (modus tollens)", "P or Q; not P ⇒ Q (disjunctive syllogism)", "If P then Q, if Q then R ⇒ if P then R (chain)"] }, { h: "Fallacies", points: ["If P then Q; Q ⇒ P is invalid (affirming the consequent)", "If P then Q; not P ⇒ not Q is invalid (denying the antecedent)"] }],
  }),
};
export default subject;
