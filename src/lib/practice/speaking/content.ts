/**
 * Speaking Lab content, authored in code like LogiQuest. The server only ever evaluates against these items (looked up
 * by id), never against text sent by the browser.
 */

export type SpeakingKind = "repeat" | "pronounce" | "twister" | "describe" | "story" | "listen" | "comprehension" | "grammar" | "fluency";

export type SpeakingItem = {
  id: string;
  /** Text shown on screen (hidden for listening items until after the attempt). */
  display: string;
  /** Text the AI voice speaks before the attempt, if any. */
  speak?: string;
  /** Exact words the learner must say (repeat, pronunciation, twister) — scored by word alignment. */
  target?: string;
  /** Ground truth the evaluator uses: scene contents, passage, or what a good answer covers. */
  reference?: string;
  /** Scene illustration id (describe/story). */
  scene?: string;
  /** Pronunciation guidance per word. */
  guide?: { word: string; ipa: string; tip: string }[];
  focus?: string;
  seconds: number;
};

export type SpeakingExercise = {
  kind: SpeakingKind;
  title: string;
  short: string;
  desc: string;
  group: "verbal" | "fluency" | "games";
  /** Items per session. */
  perSession: number;
  items: SpeakingItem[];
  /** Report dimensions for this exercise. */
  dims: { key: string; label: string }[];
};

const D = {
  pronunciation: { key: "pronunciation", label: "Pronunciation" },
  accuracy: { key: "accuracy", label: "Word Accuracy" },
  fluency: { key: "fluency", label: "Fluency" },
  clarity: { key: "clarity", label: "Clarity" },
  grammar: { key: "grammar", label: "Grammar" },
  vocabulary: { key: "vocabulary", label: "Vocabulary" },
  structure: { key: "structure", label: "Structure" },
  relevance: { key: "relevance", label: "Relevance" },
  comprehension: { key: "comprehension", label: "Comprehension" },
  observation: { key: "observation", label: "Observation" },
  creativity: { key: "creativity", label: "Creativity" },
  coherence: { key: "coherence", label: "Coherence" },
  speed: { key: "speed", label: "Speed" },
};

// ───────────── scenes (illustrations live in components/practice/Scenes.tsx) ─────────────

export const SCENES: Record<string, { title: string; description: string }> = {
  "office-standup": {
    title: "Morning stand-up",
    description: "An open-plan IT office in the morning. Four colleagues stand around a whiteboard covered with sticky notes arranged in columns (a task board). One woman points at the board and seems to be leading the meeting; a man holds a coffee cup; another person holds a laptop open; a fourth is writing on a notepad. Through a large window behind them there are city buildings and a clear sky. On the right there is a desk with a monitor and a potted plant. A wall clock shows nine o'clock.",
  },
  "railway-platform": {
    title: "Railway platform",
    description: "A busy railway platform. A blue and yellow train has stopped on the left with its doors open. A man with a backpack is running towards the train. A woman with a suitcase is checking her phone near a yellow safety line. A digital board above shows a departure time. A tea stall with a vendor stands on the right, with steam rising from a kettle. An elderly man sits on a bench reading a newspaper. Overhead there is a roof with lights, and it is evening.",
  },
  "park-morning": {
    title: "Park in the morning",
    description: "A green city park in the early morning with the sun rising. A jogger runs along a curved path. A girl is flying a red kite. A man walks a brown dog on a lead. Two elderly women are doing yoga on mats on the grass. There is a small pond with two ducks, tall trees, a bench, and a dustbin. Birds fly in the orange sky.",
  },
  "help-desk": {
    title: "Customer help desk",
    description: "A customer help desk in a bank or office. A young customer stands at the counter looking worried and holding some papers. Behind the counter, a staff member wearing an ID badge and a headset is looking at a computer screen and gesturing calmly as if explaining something. A queue of three people waits behind the customer; one checks a watch impatiently. A token display on the wall shows the number 42. There is a sign that says 'May I help you?' and a water dispenser in the corner.",
  },
};

// ───────────── items ─────────────

const repeat: SpeakingItem[] = [
  "Effective communication is essential in every workplace.",
  "Could you please share the updated report before the meeting?",
  "I have completed the testing and found three critical bugs.",
  "Our team delivered the project two days ahead of schedule.",
  "Thank you for the opportunity to interview for this position.",
  "Please make sure the data is backed up before the deployment.",
  "I would like to learn more about the responsibilities of this role.",
  "The client requested a few changes to the user interface.",
  "Let us schedule a quick call to discuss the requirements.",
  "I am confident that I can contribute to the growth of your company.",
  "We should prioritise the issues that affect the most users.",
  "Could you repeat the last point? I want to make sure I understood it.",
  "Teamwork and clear documentation helped us solve the problem quickly.",
  "I usually start my day by reviewing my tasks and emails.",
  "The developer fixed the defect and the tester verified it.",
].map((s, i) => ({ id: `repeat.${i + 1}`, display: s, speak: s, target: s, seconds: 20 }));

const PRONUNCIATION_SETS: { id: string; title: string; words: [string, string, string][] }[] = [
  { id: "workplace", title: "Workplace words", words: [
    ["Entrepreneur", "ˌɒn.trə.prəˈnɜːr", "Stress the last part: on-truh-pruh-NUR."],
    ["Development", "dɪˈvel.əp.mənt", "Stress VEL: di-VEL-up-ment."],
    ["Communication", "kəˌmjuː.nɪˈkeɪ.ʃən", "Stress KAY: kuh-myoo-ni-KAY-shun."],
    ["Opportunity", "ˌɒp.əˈtjuː.nə.ti", "Stress TYOO: op-er-TYOO-ni-tee."],
    ["Professional", "prəˈfeʃ.ən.əl", "Stress FESH: pruh-FESH-uh-nul."],
    ["Colleague", "ˈkɒl.iːɡ", "Two syllables: KOL-eeg, not ko-LEEG."],
  ] },
  { id: "tech", title: "Technology words", words: [
    ["Technology", "tekˈnɒl.ə.dʒi", "Stress NOL: tek-NOL-uh-jee."],
    ["Algorithm", "ˈæl.ɡə.rɪ.ðəm", "Soft 'th' as in 'this': AL-guh-ri-thum."],
    ["Architecture", "ˈɑː.kɪ.tek.tʃər", "Starts with 'ark': AR-ki-tek-cher."],
    ["Cache", "kæʃ", "One syllable, same as 'cash'."],
    ["Query", "ˈkwɪə.ri", "KWEER-ee, two syllables."],
    ["Variable", "ˈveə.ri.ə.bəl", "VAIR-ee-uh-bul; a 'v' sound, not 'w'."],
  ] },
  { id: "stress", title: "Stress traps", words: [
    ["Environment", "ɪnˈvaɪ.rən.mənt", "Keep the 'n' before 'ment': in-VY-run-ment."],
    ["Determine", "dɪˈtɜː.mɪn", "Ends in '-min', not '-mine'."],
    ["Comfortable", "ˈkʌmf.tə.bəl", "Three syllables: KUMF-tuh-bul."],
    ["Specific", "spəˈsɪf.ɪk", "Starts with 'sp', not 'pacific'."],
    ["Analysis", "əˈnæl.ə.sɪs", "Stress NAL: uh-NAL-uh-sis."],
    ["Pronunciation", "prəˌnʌn.siˈeɪ.ʃən", "Say 'nun', not 'noun': pruh-nun-see-AY-shun."],
  ] },
  { id: "silent", title: "Silent letters", words: [
    ["Receipt", "rɪˈsiːt", "The 'p' is silent: ri-SEET."],
    ["Debt", "det", "The 'b' is silent: DET."],
    ["Island", "ˈaɪ.lənd", "The 's' is silent: EYE-lund."],
    ["Paradigm", "ˈpær.ə.daɪm", "The 'g' is silent: PA-ruh-dime."],
    ["Wednesday", "ˈwenz.deɪ", "Two syllables: WENZ-day."],
    ["Subtle", "ˈsʌt.əl", "The 'b' is silent: SUT-ul."],
  ] },
  { id: "th", title: "TH, V and W sounds", words: [
    ["Three", "θriː", "Tongue between the teeth for 'th' — not 'tree'."],
    ["Thought", "θɔːt", "Unvoiced 'th', then 'awt'."],
    ["Weather", "ˈweð.ər", "Voiced 'th' as in 'this'."],
    ["Thorough", "ˈθʌr.ə", "THUR-uh, the ending is silent."],
    ["Very", "ˈver.i", "Top teeth touch the lower lip for 'v'."],
    ["Well", "wel", "Round the lips for 'w' — no teeth."],
  ] },
];

const pronounce: SpeakingItem[] = PRONUNCIATION_SETS.map((set) => ({
  id: `pronounce.${set.id}`,
  display: set.title,
  target: set.words.map((w) => w[0]).join(" "),
  speak: set.words.map((w) => w[0]).join(". ") + ".",
  guide: set.words.map(([word, ipa, tip]) => ({ word, ipa, tip })),
  seconds: 30,
}));

const TWISTERS: [string, string][] = [
  ["Red lorry, yellow lorry.", "r and l"],
  ["She sells seashells by the seashore.", "s and sh"],
  ["Peter Piper picked a peck of pickled peppers.", "p"],
  ["Unique New York, unique New York.", "n and y"],
  ["Which witch is which?", "w and ch"],
  ["Very well, very well, very well.", "v and w"],
  ["Three thin thinkers thinking thick thoughtful thoughts.", "th"],
  ["Fresh fried fish, fish fresh fried.", "fr and sh"],
  ["Betty Botter bought some butter, but she said the butter's bitter.", "b and t"],
  ["How much wood would a woodchuck chuck if a woodchuck could chuck wood?", "w and ch"],
  ["Six slippery snails slid slowly seaward.", "s and sl"],
  ["Truly rural, truly rural.", "r and l"],
];
const twister: SpeakingItem[] = TWISTERS.map(([t, focus], i) => ({ id: `twister.${i + 1}`, display: t, speak: t, target: t, focus, seconds: 25 }));

const describe: SpeakingItem[] = Object.entries(SCENES).map(([id, s]) => ({ id: `describe.${id}`, display: `Describe this picture in detail: the place, the people, what they are doing and how they might feel.`, scene: id, reference: s.description, seconds: 75 }));

const story: SpeakingItem[] = [
  ...Object.entries(SCENES).map(([id, s]) => ({ id: `story.${id}`, display: "Create a short story based on this picture. Give it a beginning, a problem and an ending.", scene: id, reference: s.description, seconds: 90 })),
  { id: "story.lost-laptop", display: "Tell a story: on the morning of your first day at a new job, you realise you left your laptop in the cab.", reference: "A first-day-at-work problem: a laptop left in a cab; a good story has a clear sequence, a problem, actions taken, and a resolution.", seconds: 90 },
  { id: "story.power-cut", display: "Tell a story: the power goes off five minutes before your online interview.", reference: "Online interview disrupted by a power cut; a good story shows quick thinking (mobile hotspot, informing the recruiter), sequence and outcome.", seconds: 90 },
];

const listen: SpeakingItem[] = [
  "What do you usually do on weekends, and why?",
  "Why do you want to work in the IT industry?",
  "Describe a teacher or mentor who influenced you.",
  "What would you do if you missed an important deadline?",
  "Which technology do you think will change our lives the most in the next ten years?",
  "How do you prepare for an important exam or interview?",
  "Tell me about a time you helped a friend or classmate.",
  "What are the advantages and disadvantages of working from home?",
  "If you could learn any new skill in a month, what would it be?",
  "How do you handle stress when you have a lot of work?",
].map((q, i) => ({ id: `listen.${i + 1}`, display: q, speak: q, reference: `A relevant, complete answer to: ${q}`, seconds: 60 }));

const PASSAGES: { id: string; passage: string; questions: [string, string][] }[] = [
  { id: "townhall", passage: "Good morning, everyone. This is a reminder that our quarterly town hall will take place this Friday at four p.m. in the main conference room on the third floor. Remote employees can join through the video link that will be emailed on Thursday. The leadership team will share the results of the last quarter and announce two new projects. Please submit your questions for the open session by Wednesday evening using the feedback form on the intranet.", questions: [
    ["When and where is the town hall?", "Friday at 4 p.m., main conference room, third floor."],
    ["How can remote employees attend?", "Through a video link emailed on Thursday."],
    ["What should employees do if they have questions, and by when?", "Submit them via the intranet feedback form by Wednesday evening."],
  ] },
  { id: "bug", passage: "Last Monday, users reported that the payment page of our shopping app was freezing. Meera, a junior tester, reproduced the problem on an older Android phone and noticed it happened only when the network was slow. She recorded a video, attached the logs, and raised a high-priority defect. The developers found that a timeout setting was missing. The fix was released on Wednesday, and complaints dropped to zero by the weekend.", questions: [
    ["What problem did users report?", "The payment page of the shopping app was freezing."],
    ["What did Meera discover, and what did she include in her defect?", "It happened only on slow networks (on an older Android phone); she attached a video and logs and raised a high-priority defect."],
    ["What was the cause and the result of the fix?", "A missing timeout setting; fixed on Wednesday and complaints dropped to zero by the weekend."],
  ] },
  { id: "internship", passage: "Rahul joined a six-month internship at a software company in Chennai. In his first month he learned Git, wrote unit tests, and fixed small bugs. His mentor asked him to present a demo every Friday, which made him nervous at first. By the third month he was building a small reporting feature on his own. At the end of the internship, he received a full-time offer because of his consistent progress and clear communication.", questions: [
    ["Where and how long was Rahul's internship?", "Six months at a software company in Chennai."],
    ["What did he do in his first month?", "Learned Git, wrote unit tests and fixed small bugs."],
    ["Why did he get a full-time offer?", "Because of consistent progress and clear communication."],
  ] },
];
const comprehension: SpeakingItem[] = PASSAGES.flatMap((p) =>
  p.questions.map(([q, a], i) => ({ id: `comprehension.${p.id}.${i + 1}`, display: q, speak: i === 0 ? `${p.passage} ... Now, the first question. ${q}` : q, reference: `Passage: ${p.passage}\nExpected answer: ${a}`, seconds: 45 }))
);

const grammar: SpeakingItem[] = [
  ["Describe what you did last weekend.", "simple past tense (went, watched, met)"],
  ["Talk about something you have achieved this year.", "present perfect (I have completed, I have learned)"],
  ["Explain your plans for the next five years.", "future forms (I will, I am going to, I plan to)"],
  ["What would you do if you won a big scholarship?", "second conditional (If I won..., I would...)"],
  ["Describe your daily routine at college or work.", "simple present with third-person -s and articles"],
  ["Compare your hometown with a big city.", "comparatives and superlatives (bigger, more crowded, the best)"],
  ["Explain how a product is made or a process is done, step by step.", "passive voice and sequencing (is made, first, then)"],
  ["Tell me about a mistake you made and what you learned from it.", "past tense, 'learned from', and reflective language"],
  ["Describe where things are in your room or office.", "prepositions of place (on, under, next to, between)"],
  ["Ask me three questions about my job, as if you were interviewing me.", "question formation (What do you..., How long have you...)"],
].map(([q, focus], i) => ({ id: `grammar.${i + 1}`, display: q, speak: q, focus, reference: `Target grammar: ${focus}`, seconds: 60 }));

const FLUENCY_TOPICS: [string, string, number][] = [
  ["one-minute", "Speak for one minute: your favourite technology and why you like it.", 60],
  ["one-minute", "Speak for one minute: the best decision you have made.", 60],
  ["one-minute", "Speak for one minute: a place you would love to visit.", 60],
  ["two-minute", "Speak for two minutes: how social media affects students.", 120],
  ["two-minute", "Speak for two minutes: the skills a fresher needs to get an IT job.", 120],
  ["opinion", "Give your opinion: should coding be compulsory in schools?", 90],
  ["opinion", "Give your opinion: is work from home better than working in an office?", 90],
  ["opinion", "Give your opinion: is AI more helpful or harmful for jobs?", 90],
  ["workplace", "Workplace situation: your manager asks why a task is delayed. Explain politely and propose a plan.", 75],
  ["workplace", "Workplace situation: introduce yourself to your new team on your first day.", 60],
  ["workplace", "Workplace situation: a client is unhappy with a bug in production. Calm them and explain next steps.", 75],
  ["interview", "Interview response: what are your greatest strengths and weaknesses?", 90],
  ["interview", "Interview response: describe a project you are proud of.", 90],
  ["impromptu", "Impromptu: if you could invent one app to solve a problem in your city, what would it be?", 60],
  ["impromptu", "Impromptu: describe the colour blue to someone who has never seen it.", 60],
];
const fluency: SpeakingItem[] = FLUENCY_TOPICS.map(([focus, display, seconds], i) => ({ id: `fluency.${i + 1}`, display, speak: display, focus, reference: `A relevant, well-organised spoken response to: ${display}`, seconds }));

export const EXERCISES: SpeakingExercise[] = [
  { kind: "repeat", title: "Listen & Repeat", short: "Repeat workplace sentences exactly", desc: "The AI speaks a sentence; you repeat it. We check every word, your pronunciation and rhythm.", group: "verbal", perSession: 5, items: repeat, dims: [D.accuracy, D.pronunciation, D.fluency, D.clarity] },
  { kind: "pronounce", title: "Pronunciation Practice", short: "Commonly mispronounced words with IPA", desc: "Read each word aloud, pausing between them. Get a score per word with phonetic guidance.", group: "verbal", perSession: 2, items: pronounce, dims: [D.pronunciation, D.accuracy, D.clarity] },
  { kind: "describe", title: "Image Description", short: "Describe a picture in detail", desc: "Look at a scene and describe it: place, people, actions and feelings.", group: "verbal", perSession: 2, items: describe, dims: [D.observation, D.vocabulary, D.grammar, D.fluency, D.pronunciation, D.structure] },
  { kind: "story", title: "Storytelling", short: "Build a story from a picture or situation", desc: "Create a short story with a beginning, a problem and an ending.", group: "verbal", perSession: 2, items: story, dims: [D.creativity, D.coherence, D.structure, D.vocabulary, D.grammar, D.fluency, D.pronunciation] },
  { kind: "listen", title: "Listen & Answer", short: "Hear a question, answer it aloud", desc: "The question is only spoken, not shown, so you practise listening like a real conversation.", group: "verbal", perSession: 4, items: listen, dims: [D.comprehension, D.relevance, D.grammar, D.fluency, D.pronunciation] },
  { kind: "comprehension", title: "Listen & Comprehend", short: "Short workplace passage + questions", desc: "Listen to a short passage, then answer three spoken questions about it.", group: "verbal", perSession: 3, items: comprehension, dims: [D.comprehension, D.relevance, D.grammar, D.vocabulary, D.fluency] },
  { kind: "grammar", title: "Grammar Speaking", short: "Spoken grammar with corrections", desc: "Answer prompts that need a specific tense or structure. Every slip is corrected with a simple reason.", group: "verbal", perSession: 3, items: grammar, dims: [D.grammar, D.vocabulary, D.fluency, D.relevance] },
  { kind: "fluency", title: "Fluency Training", short: "Timed speaking: pace, pauses, fillers", desc: "Speak on a topic for 1-2 minutes. We measure words per minute, long pauses, filler and repeated words, and vocabulary variety.", group: "fluency", perSession: 2, items: fluency, dims: [D.fluency, D.grammar, D.vocabulary, D.pronunciation, D.structure, D.relevance] },
  { kind: "twister", title: "Tongue Twisters", short: "Fun pronunciation games", desc: "Hear it, then say it. Practice, accuracy, speed and timed challenge modes.", group: "games", perSession: 4, items: twister, dims: [D.accuracy, D.pronunciation, D.clarity, D.speed] },
];

export const exerciseByKind = (kind: string) => EXERCISES.find((e) => e.kind === kind);
export function itemById(id: string) {
  const kind = id.split(".")[0];
  return exerciseByKind(kind)?.items.find((i) => i.id === id) ?? null;
}

export const TWISTER_MODES = [
  { id: "practice", label: "Practice", desc: "Say it once, as many tries as you like.", reps: 1, strict: false, limit: 0 },
  { id: "accuracy", label: "Accuracy", desc: "Slow and precise. Every sound counts.", reps: 1, strict: true, limit: 0 },
  { id: "speed", label: "Speed", desc: "Say it three times as fast as you can while staying accurate.", reps: 3, strict: false, limit: 0 },
  { id: "challenge", label: "Challenge", desc: "Three times within the time limit, at least 80% accuracy to pass.", reps: 3, strict: false, limit: 1 },
] as const;
export type TwisterMode = (typeof TWISTER_MODES)[number]["id"];

/** Seconds allowed in challenge mode: about 3.2 words per second. */
export const challengeSeconds = (target: string, reps: number) => Math.max(4, Math.ceil(((target.split(/\s+/).length * reps) / 3.2) * 10) / 10);

/** Attempts allowed on one item: practice modes are generous, timed challenge is limited. */
export const MAX_ATTEMPTS_PER_ITEM = 6;
