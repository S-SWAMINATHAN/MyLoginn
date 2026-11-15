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

const PROGRESS_PREFIX = /^(?:speak for (?:one minute|two minutes)|give your opinion|workplace situation|interview response|impromptu):\s*/i;

/** Removes repeated exercise instructions so each progress entry shows its actual topic. */
export function speakingProgressLabels(items: readonly Pick<SpeakingItem, "display">[]) {
  const used = new Set<string>();
  return items.map((item) => {
    const text = item.display.replace(PROGRESS_PREFIX, "").trim() || item.display.trim();
    const base = text.length > 48 ? `${text.slice(0, 47).trimEnd()}…` : text;
    let label = base;
    let suffix = 2;
    while (used.has(label)) {
      const ending = ` (${suffix++})`;
      label = `${base.slice(0, Math.max(1, 48 - ending.length)).trimEnd()}${ending}`;
    }
    used.add(label);
    return label;
  });
}

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
  communication: { key: "communication", label: "Communication" },
  speed: { key: "speed", label: "Speed" },
};

// ───────────── photo scenes (assets live in public/speaking/scenes and public/hero) ─────────────

export const SCENES: Record<string, { title: string; description: string }> = {
  "office-standup": {
    title: "Team project meeting",
    description: "A group of coworkers sit around a table with laptops and notebooks, discussing a project. Several people are looking toward the person speaking, and one colleague is taking notes.",
  },
  "railway-platform": {
    title: "City skyline",
    description: "A high-angle view across a dense city centre. Tall office buildings fill the scene, with streets and small vehicles visible between them.",
  },
  "park-morning": {
    title: "Quiet beach at sunrise",
    description: "A quiet sandy beach at sunrise. Gentle waves meet the shore, with open water stretching toward the horizon and soft clouds above.",
  },
  "help-desk": {
    title: "Paying at a shop",
    description: "A shop employee stands behind a checkout counter while a customer pays with a phone. A payment terminal is on the counter, and shelves of products are visible behind the employee.",
  },
  "library-study": {
    title: "Study desk",
    description: "A wooden desk holds several stacks of books. Small wooden letter blocks spelling STUDY sit in the centre, with more books softly out of focus behind them.",
  },
  "market-morning": {
    title: "Fresh produce display",
    description: "A close view of a produce display filled edge to edge with colourful fruit and vegetables. Tomatoes, carrots, bananas, leafy greens and other produce are arranged in rows.",
  },
  "classroom-project": {
    title: "Classroom lesson",
    description: "A teacher stands in front of a blackboard covered with classwork and a geometry diagram. Students sit at desks facing the teacher, and one student has raised a hand.",
  },
  "bus-stop-rain": {
    title: "Planning together",
    description: "Several people work together around a table with open laptops. One person types while others look at their screens and discuss the work.",
  },
  "science-fair": {
    title: "Coffee break",
    description: "Three people hold drinks over a table: two cups of coffee with latte art and one glass of iced coffee. Their hands meet near the centre as if they are sharing a break.",
  },
  "beach-cleanup": {
    title: "Community donation drive",
    description: "Three volunteers stand behind cardboard boxes of donated supplies. They are wearing T-shirts marked VOLUNTEER, and one person is sorting items into a box.",
  },
  "clinic-interior": {
    title: "Modern clinic",
    description: "A bright, tidy dental clinic with a treatment chair, overhead examination light, monitor, clean counters and medical equipment.",
  },
  "dining-room": {
    title: "Restaurant dining room",
    description: "A modern restaurant dining room with neatly arranged tables, upholstered chairs, pendant lights and large windows.",
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
  "Please let me know if you need any help with the presentation.",
  "I will send the meeting notes to everyone this afternoon.",
  "We need to test the application on different screen sizes.",
  "The support team resolved the issue before the customer called again.",
  "Could you explain how this feature will help our users?",
  "I learned a lot from working with an experienced project team.",
  "The server was unavailable for a few minutes during maintenance.",
  "Let us review the feedback and agree on the next steps.",
  "I appreciate your patience while we investigate the problem.",
  "My strongest skill is finding practical solutions to complex problems.",
  "The design team will present the updated screens after lunch.",
  "Please save your work before installing the latest update.",
  "We can divide the assignment into smaller tasks and review them tomorrow.",
  "The new student asked thoughtful questions during the workshop.",
  "I checked the measurements twice before sending the final file.",
  "Our service is available to customers throughout the weekend.",
  "The first version was simple, but it helped us test the main idea.",
  "Let us compare both options before we make a final decision.",
  "The meeting has been moved to the smaller room on the second floor.",
  "She explained the problem clearly and suggested a useful solution.",
  "We should give every team member a chance to share their opinion.",
  "The package arrived safely because it was packed with care.",
  "I will practise my presentation once more before the interview.",
  "The team celebrated after completing the project on time.",
  "Could you check whether the attachment is included in the email?",
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
  { id: "vowels", title: "Clear vowel sounds", words: [
    ["Ship", "ʃɪp", "Use the short vowel in 'sit', not the long vowel in 'sheep'."],
    ["Sheep", "ʃiːp", "Hold the long 'ee' sound."],
    ["Full", "fʊl", "Use the short 'oo' sound, not the vowel in 'fool'."],
    ["Fool", "fuːl", "Hold the long 'oo' sound."],
    ["Bed", "bed", "Keep the vowel short and open."],
    ["Bad", "bæd", "Open your mouth wider for the 'a' sound."],
  ] },
  { id: "endings", title: "Word endings", words: [
    ["Asked", "ɑːskt", "Finish the final 't' clearly."],
    ["Worked", "wɜːrkt", "Keep the final consonants; do not add a vowel."],
    ["World", "wɜːrld", "Say the final 'ld' cluster clearly."],
    ["Months", "mʌnθs", "Finish with both the 'th' and 's' sounds."],
    ["Texts", "teksts", "Keep the final consonants together without adding a syllable."],
    ["Helped", "helpt", "Finish with a clear 't' sound."],
  ] },
  { id: "syllables", title: "Syllable practice", words: [
    ["Particularly", "pəˈtɪk.jə.lə.li", "Break it into parts: puh-TIK-yuh-luh-lee."],
    ["February", "ˈfeb.ruː.er.i", "Keep the first 'r' sound in the middle."],
    ["Literature", "ˈlɪt.rə.tʃər", "Use three clear syllables: LIT-ruh-cher."],
    ["Statistics", "stəˈtɪs.tɪks", "Stress the second syllable: stuh-TIS-tiks."],
    ["Electricity", "ɪˌlekˈtrɪs.ə.ti", "Stress TRIS and keep the final syllables light."],
    ["Responsibility", "rɪˌspɒn.səˈbɪl.ə.ti", "Stress BIL and pronounce each syllable."],
  ] },
  { id: "common", title: "Everyday tricky words", words: [
    ["Schedule", "ˈʃed.juːl", "A common British pronunciation is SHED-yool; the US version is also accepted."],
    ["Library", "ˈlaɪ.brər.i", "Say three syllables: LIE-brer-ee."],
    ["Clothes", "kləʊðz", "Pronounce the final voiced 'th' and 'z' smoothly."],
    ["Jewellery", "ˈdʒuː.əl.ri", "Keep it to three syllables: JOO-ul-ree."],
    ["Recipe", "ˈres.ə.pi", "Stress the first syllable: RES-uh-pee."],
    ["Height", "haɪt", "It rhymes with 'might'; do not add a 'g' sound."],
  ] },
  { id: "work-words", title: "Clear workplace speech", words: [
    ["Available", "əˈveɪ.lə.bəl", "Stress VAIL and keep the final syllables light."],
    ["Colleagues", "ˈkɒl.iːɡz", "Use two syllables and finish with a clear 'z'."],
    ["Project", "ˈprɒdʒ.ekt", "Stress the first syllable when it is a noun."],
    ["Deadline", "ˈded.laɪn", "Keep both syllables clear: DED-line."],
    ["Feedback", "ˈfiːd.bæk", "Stress FEED and say the final 'k'."],
    ["Successful", "səkˈses.fəl", "Stress the second syllable: suk-SESS-ful."],
  ] },
  { id: "consonant-clusters", title: "Consonant clusters", words: [
    ["Strength", "streŋθ", "Begin with a clear 'str' blend and finish with 'ngth'."],
    ["Script", "skrɪpt", "Keep the opening 'scr' together and pronounce the final 'pt'."],
    ["Spring", "sprɪŋ", "Start with 'spr' without adding a vowel."],
    ["Asked", "ɑːskt", "Link the final consonants smoothly; do not add another syllable."],
    ["Twelfth", "twelfθ", "Say the 'lfth' ending clearly and at a comfortable pace."],
    ["Texts", "teksts", "Finish the consonant group without adding a vowel."],
  ] },
  { id: "sibilants", title: "S and SH sounds", words: [
    ["Sip", "sɪp", "Keep the air stream narrow for a clear 's'."],
    ["Ship", "ʃɪp", "Round your lips slightly for the 'sh' sound."],
    ["Seat", "siːt", "Start with 's', then hold the long vowel."],
    ["Sheet", "ʃiːt", "Start with 'sh'; keep it distinct from 'seat'."],
    ["Price", "praɪs", "Finish with a crisp unvoiced 's'."],
    ["Prize", "praɪz", "Finish with a voiced 'z' sound."],
  ] },
  { id: "r-l", title: "R and L sounds", words: [
    ["Road", "rəʊd", "Curl the tongue slightly back for the initial 'r'."],
    ["Load", "ləʊd", "Touch the tongue tip behind the upper teeth for 'l'."],
    ["Glass", "ɡlɑːs", "Keep the 'g' and 'l' distinct at the start."],
    ["Grass", "ɡrɑːs", "Use an 'r' sound after the initial 'g'."],
    ["Collect", "kəˈlekt", "Touch the tongue tip clearly for both 'l' sounds."],
    ["Correct", "kəˈrekt", "Make the middle 'r' sound clear."],
  ] },
  { id: "word-stress", title: "Stress in longer words", words: [
    ["Education", "ˌedʒ.uˈkeɪ.ʃən", "Stress KAY: ed-yoo-KAY-shun."],
    ["Photograph", "ˈfəʊ.tə.ɡrɑːf", "Stress the first syllable: FOH-tuh-graf."],
    ["Photographer", "fəˈtɒɡ.rə.fər", "Stress TOG in this related word."],
    ["Economic", "ˌiː.kəˈnɒm.ɪk", "Stress NOM: ee-kuh-NOM-ik."],
    ["Electric", "ɪˈlek.trɪk", "Stress the second syllable: ih-LEK-trik."],
    ["Celebration", "ˌsel.əˈbreɪ.ʃən", "Stress BRAY and keep the other syllables light."],
  ] },
  { id: "final-sounds", title: "Final voiced sounds", words: [
    ["Leave", "liːv", "Finish with a voiced 'v', not an 'f'."],
    ["Leaf", "liːf", "Finish with an unvoiced 'f'."],
    ["Bag", "bæɡ", "Keep the final 'g' voiced."],
    ["Back", "bæk", "Finish with an unvoiced 'k'."],
    ["Rise", "raɪz", "Use a voiced 'z' at the end."],
    ["Rice", "raɪs", "Use an unvoiced 's' at the end."],
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
  ["A proper copper coffee pot.", "p and k"],
  ["Lesser leather never weathered wetter weather better.", "l and th"],
  ["Six sleek swans swam swiftly southwards.", "s and sw"],
  ["Greek grapes, Greek grapes, Greek grapes.", "gr and g"],
  ["A big black bug bit a big black bear.", "b"],
  ["Crisp crusts crackle and crunch.", "cr and k"],
  ["Near an ear, a nearer ear, a nearly eerie ear.", "n and r"],
  ["Eleven benevolent elephants.", "l and v"],
  ["I scream, you scream, we all scream for ice cream.", "s and cr"],
  ["Lesser leather never weathered wetter weather.", "l and th"],
  ["Which wristwatches are Swiss wristwatches?", "w and sw"],
  ["Four fine fresh fish for you.", "f and fr"],
  ["Bright blue butterflies flutter by the flowers.", "bl and fl"],
  ["Round and round the rugged rocks the ragged rascal ran.", "r"],
  ["Cooks cook cupcakes quickly.", "k and kw"],
  ["The great Greek grape growers grow great Greek grapes.", "gr"],
  ["Thin sticks, thick bricks.", "th"],
  ["Can you can a can as a canner can can a can?", "k"],
  ["A loyal warrior will rarely worry why we rule.", "w and r"],
  ["Four furious friends fought for the phone.", "f and fr"],
  ["Freshly fried flying fish.", "fr and fl"],
  ["Tricky trainers train twelve talented trainees.", "tr"],
  ["Six short slow sleds slide south.", "s and sl"],
  ["Black background, brown background.", "b and br"],
];
const twister: SpeakingItem[] = TWISTERS.map(([t, focus], i) => ({ id: `twister.${i + 1}`, display: t, speak: t, target: t, focus, seconds: 25 }));

const describe: SpeakingItem[] = Object.entries(SCENES).map(([id, s]) => ({ id: `describe.${id}`, display: `Describe this picture in detail: the place, the people, what they are doing and how they might feel.`, scene: id, reference: s.description, seconds: 75 }));

const story: SpeakingItem[] = [
  ...Object.entries(SCENES).map(([id, s]) => ({ id: `story.${id}`, display: "Create a short story based on this picture. Give it a beginning, a problem and an ending.", scene: id, reference: s.description, seconds: 90 })),
  { id: "story.lost-laptop", display: "Tell a story: on the morning of your first day at a new job, you realise you left your laptop in the cab.", reference: "A first-day-at-work problem: a laptop left in a cab; a good story has a clear sequence, a problem, actions taken, and a resolution.", seconds: 90 },
  { id: "story.power-cut", display: "Tell a story: the power goes off five minutes before your online interview.", reference: "Online interview disrupted by a power cut; a good story shows quick thinking (mobile hotspot, informing the recruiter), sequence and outcome.", seconds: 90 },
  { id: "story.lost-wallet", display: "Tell a story: you find a wallet on your way to class and decide what to do.", reference: "Finding a lost wallet before class; a good story includes the discovery, a responsible attempt to find its owner, and a clear outcome.", seconds: 90 },
  { id: "story.community-garden", display: "Tell a story: your neighbours turn an empty plot into a small community garden.", reference: "Neighbours working together on a garden; a good story includes a shared challenge, cooperation, and the result.", seconds: 90 },
  { id: "story.first-presentation", display: "Tell a story: you are nervous before your first presentation, but something changes your mind.", reference: "A first presentation, initial nervousness, an event that builds confidence, and a satisfying ending.", seconds: 90 },
  { id: "story.missed-bus", display: "Tell a story: a missed bus leads you to an unexpected opportunity.", reference: "A missed bus causes a change of plans and leads to a meaningful new opportunity; include a clear sequence and resolution.", seconds: 90 },
  { id: "story.team-outage", display: "Tell a story: your team works together to restore an important service before morning.", reference: "A team responds to an outage, communicates and divides work, restores the service, and reflects on the result.", seconds: 90 },
  { id: "story.returned-phone", display: "Tell a story: you find a phone on a train and try to return it to its owner.", reference: "Finding a phone on a train, taking sensible steps to identify the owner, and returning it safely.", seconds: 90 },
  { id: "story.school-festival", display: "Tell a story: rain threatens your school festival, and the students find a solution.", reference: "A school festival is disrupted by rain; students cooperate, adapt the plan, and make the event successful.", seconds: 90 },
  { id: "story.new-neighbour", display: "Tell a story: a new neighbour arrives and your family helps them feel at home.", reference: "A new neighbour arrives, receives a thoughtful welcome, and begins to feel part of the community.", seconds: 90 },
  { id: "story.final-match", display: "Tell a story: your team is behind in the final match but does not give up.", reference: "A team faces a difficult score, supports one another, changes its approach, and reaches a meaningful ending.", seconds: 90 },
  { id: "story.damaged-book", display: "Tell a story: you accidentally damage a borrowed book just before it is due.", reference: "A borrowed book is damaged accidentally; the narrator takes responsibility, speaks honestly, and resolves the issue.", seconds: 90 },
  { id: "story.first-customer", display: "Tell a story: your first customer gives unexpected feedback on something you created.", reference: "A first customer offers unexpected feedback; the creator listens, responds constructively, and learns from it.", seconds: 90 },
  { id: "story.early-train", display: "Tell a story: an early train journey brings you together with someone who needs help.", reference: "A journey begins early, the narrator notices someone needing help, offers appropriate support, and describes the outcome.", seconds: 90 },
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
  "What is one small change that would make your neighbourhood better?",
  "How do you decide which task to do first when you are busy?",
  "What did you enjoy learning recently, and how did you learn it?",
  "Describe a time you had to adapt to an unexpected change.",
  "What qualities make someone a good teammate?",
  "How would you explain your favourite hobby to a beginner?",
  "What is one goal you hope to achieve this year?",
  "How do you make sure you understand instructions correctly?",
  "Should students do group projects? Why or why not?",
  "What is a useful lesson you learned from a mistake?",
  "What would you do to make a new student feel welcome?",
  "Which daily habit has helped you the most, and why?",
  "Describe a place where you can concentrate well.",
  "How can people reduce waste in their everyday lives?",
  "Tell me about a time you had to explain something difficult simply.",
  "What would you do if you disagreed with a teammate?",
  "Which festival or celebration do you enjoy, and how do you celebrate it?",
  "How do you decide whether information online is trustworthy?",
  "Would you rather work alone or with a team on a new project? Explain.",
  "What is something you would like to improve in your community?",
].map((q, i) => ({ id: `listen.${i + 1}`, display: q, speak: q, reference: `A relevant, complete answer to: ${q}`, seconds: 60 }));

const PASSAGES: { id: string; passage: string; questions: [string, string][] }[] = [
  { id: "townhall", passage: "Good morning, everyone. This is a reminder that our quarterly town hall will take place this Friday at four p.m. in the main conference room on the third floor. Remote employees can join through the video link that will be emailed on Thursday. The leadership team will share the results of the last quarter and announce two new projects. Please submit your questions for the open session by Wednesday evening using the feedback form on the intranet.", questions: [
    ["When and where is the town hall?", "Friday at 4 p.m., main conference room, third floor."],
    ["How can remote employees attend?", "Through a video link emailed on Thursday."],
    ["What should employees do if they have questions, and by when?", "Submit them via the intranet feedback form by Wednesday evening."],
    ["What will the leadership team share and announce?", "The results of the last quarter and two new projects."],
  ] },
  { id: "bug", passage: "Last Monday, users reported that the payment page of our shopping app was freezing. Meera, a junior tester, reproduced the problem on an older Android phone and noticed it happened only when the network was slow. She recorded a video, attached the logs, and raised a high-priority defect. The developers found that a timeout setting was missing. The fix was released on Wednesday, and complaints dropped to zero by the weekend.", questions: [
    ["What problem did users report?", "The payment page of the shopping app was freezing."],
    ["What did Meera discover, and what did she include in her defect?", "It happened only on slow networks (on an older Android phone); she attached a video and logs and raised a high-priority defect."],
    ["What was the cause and the result of the fix?", "A missing timeout setting; fixed on Wednesday and complaints dropped to zero by the weekend."],
    ["How did Meera help the developers investigate?", "She reproduced the issue on an older Android phone, recorded it, and attached the logs."],
  ] },
  { id: "internship", passage: "Rahul joined a six-month internship at a software company in Chennai. In his first month he learned Git, wrote unit tests, and fixed small bugs. His mentor asked him to present a demo every Friday, which made him nervous at first. By the third month he was building a small reporting feature on his own. At the end of the internship, he received a full-time offer because of his consistent progress and clear communication.", questions: [
    ["Where and how long was Rahul's internship?", "Six months at a software company in Chennai."],
    ["What did he do in his first month?", "Learned Git, wrote unit tests and fixed small bugs."],
    ["Why did he get a full-time offer?", "Because of consistent progress and clear communication."],
    ["What made Rahul nervous at first?", "Presenting a demo to his mentor every Friday."],
  ] },
  { id: "library", passage: "The town library will extend its opening hours during the exam period. From Monday, students may study until nine p.m. on weekdays, but the library will still close at six p.m. on Sundays. The second-floor reading room is reserved for quiet study. Visitors can borrow up to four books for three weeks, and they should return them at the front desk.", questions: [
    ["Why are the library hours changing?", "To give students more time to study during the exam period."],
    ["When does the library close on weekdays and Sundays?", "At nine p.m. on weekdays and six p.m. on Sundays."],
    ["How many books may visitors borrow, and for how long?", "Up to four books for three weeks."],
    ["Which room is reserved for quiet study?", "The second-floor reading room."],
  ] },
  { id: "delivery", passage: "A delivery company is testing electric bicycles in the city centre. Each rider carries a small battery that can be swapped at charging stations. The bicycles are intended for short deliveries where cars are often delayed by traffic. The trial will last two months, and the company will compare delivery times and customer feedback before deciding whether to expand it.", questions: [
    ["What is the company testing?", "Electric bicycles for city-centre deliveries."],
    ["Why are bicycles being used for short deliveries?", "Cars are often delayed by traffic."],
    ["What will the company review before expanding the trial?", "Delivery times and customer feedback after the two-month trial."],
    ["How can riders recharge during the trial?", "By swapping their batteries at charging stations."],
  ] },
  { id: "training", passage: "Asha's team introduced a weekly learning hour every Wednesday afternoon. Team members can use the time to practise a new tool, watch a short lesson, or ask a colleague for help. They share one useful takeaway at the end of the month. After three months, the manager noticed that more employees were volunteering to demonstrate their work.", questions: [
    ["When does the team hold its learning hour?", "Every Wednesday afternoon."],
    ["What can team members do during the hour?", "Practise a tool, watch a lesson, or ask a colleague for help."],
    ["What change did the manager notice after three months?", "More employees volunteered to demonstrate their work."],
    ["What do team members share at the end of each month?", "One useful takeaway from their learning hour."],
  ] },
  { id: "weather", passage: "Heavy rain is expected in the district on Thursday evening. The local council has asked residents to avoid driving through flooded streets and to keep emergency phone numbers nearby. Buses may use alternate roads after five p.m. The community centre will remain open until midnight for anyone who needs a safe place to wait.", questions: [
    ["When is heavy rain expected?", "On Thursday evening."],
    ["What should residents avoid doing?", "Driving through flooded streets."],
    ["How late will the community centre stay open?", "Until midnight."],
    ["Why might buses take alternate roads?", "Some streets may be flooded after five p.m."],
  ] },
  { id: "meeting", passage: "The product team moved its planning meeting from Tuesday to Thursday because two designers are attending a workshop. Everyone should review the draft schedule before the meeting and add comments by Wednesday afternoon. The meeting will begin at ten a.m. and finish within an hour. A recording will be shared with colleagues who cannot attend.", questions: [
    ["Why was the planning meeting moved?", "Two designers are attending a workshop."],
    ["What should team members do before the meeting?", "Review the draft schedule and add comments by Wednesday afternoon."],
    ["How will colleagues who cannot attend catch up?", "They can watch the shared recording."],
    ["How long will the meeting last?", "It will finish within an hour."],
  ] },
  { id: "campus", passage: "The college photography club will hold a free workshop in the arts building this Saturday. Participants should bring a phone or camera, but the club will provide tripods. The workshop begins at eleven a.m. and includes a short walk around campus. Students must register online by Friday because places are limited to twenty.", questions: [
    ["When and where will the workshop take place?", "This Saturday in the arts building."],
    ["What should participants bring?", "A phone or camera; tripods will be provided."],
    ["What will participants do after the introduction?", "Take a short walk around campus."],
    ["Why should students register by Friday?", "Places are limited to twenty."],
  ] },
  { id: "clinic", passage: "The neighbourhood clinic will begin offering evening appointments from next month. Patients can book a time by phone or through the clinic website. Anyone with a fever should wear a mask in the waiting room. The clinic will keep its usual opening hours on Saturdays, but it will be closed on public holidays.", questions: [
    ["What new service will the clinic offer next month?", "Evening appointments."],
    ["How can patients book an appointment?", "By phone or through the clinic website."],
    ["What should a patient with a fever do in the waiting room?", "Wear a mask."],
    ["When will the clinic be closed?", "On public holidays."],
  ] },
  { id: "museum", passage: "The city museum has opened a new exhibition about local history. It is on the ground floor and is free for school groups on weekday mornings. Visitors may take photographs without flash, but food and drinks are not allowed in the galleries. A guide gives a short tour at two p.m. every day except Monday.", questions: [
    ["What is the new exhibition about?", "Local history."],
    ["Where is the exhibition located?", "On the ground floor."],
    ["What kind of photography is allowed?", "Photographs without flash."],
    ["When can visitors join the guided tour?", "At two p.m. every day except Monday."],
  ] },
  { id: "savings", passage: "A student savings group meets on the first Friday of each month in the community hall. Members share simple ways to plan a budget and avoid unnecessary spending. The next meeting will include a guest who works as a bank adviser. Students can attend for free, but they should bring a notebook and arrive ten minutes early to sign in.", questions: [
    ["How often does the savings group meet?", "On the first Friday of each month."],
    ["Where does it meet?", "In the community hall."],
    ["Who will speak at the next meeting?", "A bank adviser."],
    ["What should students bring, and when should they arrive?", "A notebook, and they should arrive ten minutes early."],
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
  ["Describe a book or film you have read or watched recently.", "present perfect with a time reference and past-tense details"],
  ["Explain what you will do if your train is delayed tomorrow.", "first conditional (If the train is delayed, I will...)"],
  ["Talk about two things you were doing at this time yesterday.", "past continuous (I was studying, I was travelling)"],
  ["Describe a rule students should follow in a science laboratory.", "modal verbs for obligation and prohibition (must, should, must not)"],
  ["Tell me how to get from your home to the nearest bus stop.", "imperatives and prepositions of direction (turn, cross, next to)"],
  ["What is the most useful subject you studied, and why?", "superlatives and reasons (the most useful, because)"],
  ["Describe a meal you can prepare, step by step.", "sequencing words and present simple (first, next, finally)"],
  ["Talk about something you used to do as a child.", "used to + base verb for past habits"],
  ["Give advice to a friend who is nervous about an interview.", "modal verbs for advice (should, could, might)"],
  ["Explain the difference between learning online and learning in a classroom.", "comparatives and contrast words (whereas, while)"],
  ["Describe what is happening in your classroom or workplace right now.", "present continuous (is working, are discussing)"],
  ["Tell me about a place you have visited and when you went there.", "present perfect experience followed by simple past details"],
  ["Explain what your teacher said about the next assignment.", "reported speech (said that, told us to)"],
  ["Describe a person who has taught you an important skill.", "relative clauses (who, that) and past-tense examples"],
  ["How much time do you spend studying each day, and what helps you focus?", "countable and uncountable nouns with quantifiers"],
  ["What must a visitor do when entering your school or office?", "modal verbs for rules (must, have to, may not)"],
  ["Describe a challenge you faced although you had prepared carefully.", "contrast clauses with although, but, and however"],
  ["What do you enjoy doing after you finish your work?", "gerunds and infinitives (enjoy doing, decide to do)"],
  ["Ask a colleague politely to explain a task again.", "polite requests and indirect questions"],
  ["Describe how you would improve a place you visit often.", "conditionals, modals, and future forms"],
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
  ["one-minute", "Speak for one minute: a skill you learned outside the classroom.", 60],
  ["one-minute", "Speak for one minute: how you like to spend a rainy day.", 60],
  ["two-minute", "Speak for two minutes: why teamwork matters in a project.", 120],
  ["two-minute", "Speak for two minutes: ways technology can improve public services.", 120],
  ["opinion", "Give your opinion: should public transport be free for students?", 90],
  ["opinion", "Give your opinion: is it better to specialise or learn many skills?", 90],
  ["opinion", "Give your opinion: should people have a four-day work week?", 90],
  ["workplace", "Workplace situation: you found an error in a report just before it is sent. Explain what you will do.", 75],
  ["workplace", "Workplace situation: ask a teammate for an update without sounding impatient.", 60],
  ["workplace", "Workplace situation: explain a technical problem to a customer who is not a developer.", 75],
  ["interview", "Interview response: tell me about a time you worked through a difficult problem.", 90],
  ["interview", "Interview response: why are you interested in this role?", 90],
  ["interview", "Interview response: how do you respond to feedback?", 90],
  ["impromptu", "Impromptu: what would you teach a visitor about your hometown?", 60],
  ["impromptu", "Impromptu: describe a useful invention that does not use electricity.", 60],
  ["impromptu", "Impromptu: if you had an extra hour every day, how would you use it?", 60],
  ["one-minute", "Speak for one minute: a local place that visitors should see.", 60],
  ["one-minute", "Speak for one minute: something you do to stay healthy.", 60],
  ["one-minute", "Speak for one minute: a useful lesson you learned from a friend.", 60],
  ["two-minute", "Speak for two minutes: how students can manage their time well.", 120],
  ["two-minute", "Speak for two minutes: the benefits and challenges of learning online.", 120],
  ["two-minute", "Speak for two minutes: how a community can prepare for heavy rain.", 120],
  ["two-minute", "Speak for two minutes: why clear communication prevents mistakes.", 120],
  ["opinion", "Give your opinion: should students have a part-time job while studying?", 90],
  ["opinion", "Give your opinion: are examinations the best way to measure learning?", 90],
  ["workplace", "Workplace situation: explain that you need more time and give a realistic new deadline.", 75],
  ["workplace", "Workplace situation: welcome a new colleague and help them get started.", 60],
  ["interview", "Interview response: describe a time you learned something quickly.", 90],
  ["interview", "Interview response: what do you do when you do not know an answer?", 90],
  ["interview", "Interview response: how would your classmates describe your teamwork?", 90],
  ["impromptu", "Impromptu: choose one object on your desk and explain three uses for it.", 60],
  ["impromptu", "Impromptu: describe a simple way to make a busy morning easier.", 60],
  ["impromptu", "Impromptu: what would you put in a time capsule for future students?", 60],
  ["one-minute", "Speak for one minute: a small change that made your daily routine better.", 60],
  ["one-minute", "Speak for one minute: a person who has taught you something useful.", 60],
  ["one-minute", "Speak for one minute: how you prepare for an important day.", 60],
  ["one-minute", "Speak for one minute: a place in your neighbourhood where people meet.", 60],
  ["two-minute", "Speak for two minutes: how students can use technology responsibly.", 120],
  ["two-minute", "Speak for two minutes: the qualities of a good team leader.", 120],
  ["two-minute", "Speak for two minutes: how public spaces can be made safer and cleaner.", 120],
  ["two-minute", "Speak for two minutes: a skill you want to develop and how you will practise it.", 120],
  ["opinion", "Give your opinion: should college students complete an internship before graduating?", 90],
  ["opinion", "Give your opinion: is reading news every day useful for young people?", 90],
  ["opinion", "Give your opinion: should workplaces offer flexible working hours?", 90],
  ["opinion", "Give your opinion: do group projects help students learn better?", 90],
  ["workplace", "Workplace situation: explain a complex update to a teammate who has just joined the project.", 75],
  ["workplace", "Workplace situation: you notice a colleague has misunderstood a requirement. Clarify it respectfully.", 75],
  ["workplace", "Workplace situation: ask your manager which task should take priority when two deadlines conflict.", 75],
  ["workplace", "Workplace situation: summarise a meeting and confirm who will handle each action.", 75],
  ["interview", "Interview response: tell me about a time you helped someone else succeed.", 90],
  ["interview", "Interview response: describe a goal you set and how you measured your progress.", 90],
  ["interview", "Interview response: what is one skill you are improving, and what steps are you taking?", 90],
  ["interview", "Interview response: tell me about a time you had to adapt to a change.", 90],
  ["impromptu", "Impromptu: if you could improve one service in your town, what would you change?", 60],
  ["impromptu", "Impromptu: explain how to make a useful gift with a very small budget.", 60],
  ["impromptu", "Impromptu: what would you include in a welcome guide for a new student?", 60],
  ["impromptu", "Impromptu: describe a simple invention that could save people time.", 60],
];
const fluency: SpeakingItem[] = FLUENCY_TOPICS.map(([focus, display, seconds], i) => ({ id: `fluency.${i + 1}`, display, speak: display, focus, reference: `A relevant, well-organised spoken response to: ${display}`, seconds }));

export const EXERCISES: SpeakingExercise[] = [
  { kind: "repeat", title: "Listen & Repeat", short: "Repeat workplace sentences exactly", desc: "The AI speaks a sentence; you repeat it. We check every word, your pronunciation and rhythm.", group: "verbal", perSession: 20, items: repeat, dims: [D.accuracy, D.pronunciation, D.fluency, D.clarity] },
  { kind: "pronounce", title: "Pronunciation Practice", short: "Commonly mispronounced words with IPA", desc: "Read each word aloud, pausing between them. Get a score per word with phonetic guidance.", group: "verbal", perSession: 10, items: pronounce, dims: [D.pronunciation, D.accuracy, D.clarity] },
  { kind: "describe", title: "Image Description", short: "Describe a picture in detail", desc: "Look at a real photo and describe the scene, people and details.", group: "verbal", perSession: 10, items: describe, dims: [D.observation, D.vocabulary, D.grammar, D.fluency, D.pronunciation, D.structure, D.communication] },
  { kind: "story", title: "Storytelling", short: "Build a story from a picture or situation", desc: "Create a short story with a beginning, a problem and an ending.", group: "verbal", perSession: 20, items: story, dims: [D.creativity, D.coherence, D.structure, D.vocabulary, D.grammar, D.fluency, D.pronunciation, D.communication] },
  { kind: "listen", title: "Listen & Answer", short: "Hear a question, answer it aloud", desc: "The question is only spoken, not shown, so you practise listening like a real conversation.", group: "verbal", perSession: 20, items: listen, dims: [D.comprehension, D.relevance, D.grammar, D.fluency, D.pronunciation, D.communication] },
  { kind: "comprehension", title: "Listen & Comprehend", short: "Short passages + questions", desc: "Listen to five short passages and answer four spoken questions about each one.", group: "verbal", perSession: 20, items: comprehension, dims: [D.comprehension, D.relevance, D.grammar, D.vocabulary, D.fluency, D.communication] },
  { kind: "grammar", title: "Grammar Speaking", short: "Spoken grammar with corrections", desc: "Answer prompts that need a specific tense or structure. Every slip is corrected with a simple reason.", group: "verbal", perSession: 20, items: grammar, dims: [D.grammar, D.vocabulary, D.fluency, D.relevance, D.communication] },
  { kind: "fluency", title: "Fluency Training", short: "Timed speaking: pace, pauses, fillers", desc: "Speak on a topic for 1-2 minutes. We measure words per minute, long pauses, filler and repeated words, and vocabulary variety.", group: "fluency", perSession: 12, items: fluency, dims: [D.fluency, D.grammar, D.vocabulary, D.pronunciation, D.structure, D.relevance, D.communication] },
  { kind: "twister", title: "Tongue Twisters", short: "Fun pronunciation games", desc: "Hear it, then say it. Practice, accuracy, speed and timed challenge modes.", group: "games", perSession: 20, items: twister, dims: [D.accuracy, D.pronunciation, D.clarity, D.speed] },
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
