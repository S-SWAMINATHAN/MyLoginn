import type { RawSubject } from "../types";
import { topic } from "./build";
import * as A from "./verbal/va1";
import * as B from "./verbal/va2";

const subject: RawSubject = {
  "spotting-errors": topic(A.spottingErrors, {
    intro: "Each sentence is split into parts; at most one part has a grammatical error. Check subject–verb agreement, tenses, prepositions, pronouns and fixed expressions.",
    formulas: [
      { h: "Most common errors", points: ["Each, every, either, neither, everyone, the number of + singular verb", "Collective and uncountable nouns (news, furniture, information, advice) take singular verbs", "'One of those who' takes a plural verb", "Use 'for' with a period and 'since' with a point of time", "Prefer … to; senior/junior/superior/inferior … to", "Hardly/Scarcely … when; No sooner … than", "Indirect questions use statement word order: 'where his phone was'"] },
    ],
  }),
  antonyms: topic(A.antonyms, { intro: "Choose the word most nearly opposite in meaning. Decide the exact meaning of the given word first, then look for its clearest opposite; beware of options that are only partly opposite." }),
  synonyms: topic(A.synonyms, { intro: "Choose the word closest in meaning. Think of a sentence using the word, then try each option in it." }),
  "selecting-words": topic(A.selectingWords, {
    intro: "Fill in the blank with the word that fits both the grammar and the meaning of the sentence.",
    formulas: [{ h: "Commonly confused words", points: ["affect (verb) / effect (noun)", "rise (no object) / raise (needs an object)", "lie (recline) / lay (put down)", "principal (main) / principle (rule)", "stationary (still) / stationery (writing materials)", "postpone (delay) / prepone (bring earlier, Indian usage)"] }],
  }),
  spellings: topic(A.spellings, {
    intro: "Spelling questions test commonly misspelt words.",
    formulas: [{ h: "Rules", points: ["i before e except after c (believe, but receive)", "Double consonants: accommodate, embarrass, occurrence, committee, millennium", "-ance/-ence and -able/-ible endings must be learned word by word"] }],
  }),
  "sentence-formation": topic(A.sentenceFormation, { intro: "Choose the sentence that is grammatically correct. Read each option fully; errors are often small: a preposition, a tense or an article." }),
  "ordering-of-words": topic(A.orderingOfWords, { intro: "Arrange jumbled parts into a sentence. Find the subject and verb first, then attach objects and phrases in natural English order." }),
  "sentence-correction": topic(A.sentenceCorrection, { intro: "Replace the bold part with the correct expression, or choose 'No correction required' if it is already correct." }),
  "sentence-improvement": topic(A.sentenceImprovement, { intro: "Choose the replacement that makes the sentence grammatically correct and natural. If the original is fine, choose 'No correction required'." }),
  "completing-statements": topic(B.completingStatements, {
    intro: "Complete the sentence so that it is logical and grammatical. Linking words decide the answer: although (contrast), unless (if not), so … that (result), no sooner … than.",
  }),
  "ordering-of-sentences": topic(B.orderingOfSentences, { intro: "The first and last sentences are fixed. Order the middle ones using time sequence, cause and effect, and words like 'then', 'so', 'however' and pronouns that refer back." }),
  "paragraph-formation": topic(B.paragraphFormation, { intro: "Find the opening sentence (it introduces the topic and refers to nothing earlier), then follow pronouns, connectors and logical order." }),
  "cloze-test": topic(B.clozeTest, { intro: "A cloze test removes words from a passage. Read the whole passage first, then choose words that fit both grammar and meaning." }),
  comprehension: topic(B.comprehension, {
    intro: "Read the passage carefully and answer from the passage only — not from outside knowledge.",
    formulas: [{ h: "Strategy", points: ["Skim the questions first so you know what to look for", "For main-idea questions, choose the option that covers the whole passage", "For vocabulary questions, use the sentence the word appears in", "'NOT mentioned' questions: check every option against the text"] }],
  }),
  "one-word-substitutes": topic(B.oneWordSubstitutes, { intro: "Replace a phrase with a single word. Learning common roots helps: omni (all), phobia (fear), anthropo (man), philo (love), cide (killing)." }),
  "idioms-and-phrases": topic(B.idioms, { intro: "An idiom's meaning cannot be guessed from its words. Learn them with an example sentence." }),
  "change-of-voice": topic(B.changeOfVoice, {
    intro: "In the passive voice, the object of the active sentence becomes the subject, and the verb takes the form 'be + past participle' in the same tense.",
    formulas: [{ h: "Tense patterns", points: ["Simple present: is/am/are + V3", "Simple past: was/were + V3", "Present/past continuous: is/are/was/were being + V3", "Present/past perfect: has/have/had been + V3", "Future and modals: will/can/must be + V3", "Imperative: Let + object + be + V3"] }],
  }),
  "change-of-speech": topic(B.changeOfSpeech, {
    intro: "Reported (indirect) speech reports what someone said without quoting them. With a past reporting verb, tenses usually move one step back and pronouns and time words change.",
    formulas: [{ h: "Changes", points: ["am/is → was; are → were; will → would; can → could; has/have → had", "Simple past → past perfect", "today → that day; tomorrow → the next day; yesterday → the previous day; here → there; now → then", "Questions: asked + if/whether (yes/no) or the question word, with statement word order", "Commands and requests: told/ordered/requested + object + to-infinitive", "Universal truths keep their present tense"] }],
  }),
  "verbal-analogies": topic(B.verbalAnalogies, { intro: "Identify the relationship in the first pair (creator–creation, tool–user, young–adult, opposite, measure–quantity) and find the option with the same relationship." }),
};
export default subject;
