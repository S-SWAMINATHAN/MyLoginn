/** Verbal Ability, part 2: completion, ordering, paragraphs, cloze, comprehension, substitutes, idioms, voice, speech, analogies. */
import type { RawItem, RawQ } from "../../types";
import { m, m2, m3, set } from "../build";

export const completingStatements: RawQ[] = [
  m("Complete the sentence: Although he was tired,", ["he kept working until the job was done.", "so he went to bed early.", "because he worked all day.", "therefore he slept."], "'Although' introduces a contrast, so the second part must contrast with being tired; 'so', 'because' and 'therefore' cannot follow 'although'."),
  m("Complete the sentence: Unless you book the tickets today,", ["you may not get a seat.", "you will surely get a seat.", "and you will get a seat.", "because seats are many."], "'Unless' means 'if not': if you do not book today, you may not get a seat."),
  m("Complete the sentence: The more you practise,", ["the better you become.", "you become better.", "better you will become.", "more you become better."], "The correlative structure is 'the more …, the better …'."),
  m2("Complete the sentence: Not only did the company increase salaries,", ["but it also improved working hours.", "and it also improved working hours.", "it also improved working hours.", "but also it improve working hours."], "'Not only …' pairs with 'but (it) also …'."),
  m2("Complete the sentence: Had the team prepared better,", ["they would have won the match.", "they will win the match.", "they win the match.", "they would win the match yesterday."], "'Had … prepared' is a third conditional, completed with 'would have + past participle'."),
  m("Complete the sentence: She was so happy with the result", ["that she called all her friends.", "than she called all her friends.", "so she called all her friends.", "because of calling all her friends."], "'So … that' expresses a result."),
  m2("Complete the sentence: No sooner did the bell ring", ["than the students rushed out.", "when the students rushed out.", "then the students rushed out.", "and the students rushed out."], "'No sooner' is always followed by 'than'."),
  m2("Complete the sentence: In spite of working very hard,", ["he could not finish the project on time.", "he finished the project easily.", "so he finished the project.", "because he finished the project."], "'In spite of' introduces a contrast: hard work, yet failure to finish."),
  m("Complete the sentence: If it rains tomorrow,", ["the picnic will be cancelled.", "the picnic would have been cancelled.", "the picnic was cancelled.", "the picnic had been cancelled."], "First conditional: 'If + present, will + base verb'."),
  m3("Complete the sentence: The report, which was submitted late,", ["was rejected by the committee.", "and was rejected by the committee.", "but was rejected by the committee.", "rejecting by the committee."], "The non-defining clause 'which was submitted late' is extra information; the main verb follows directly."),
];

/** Sentences S1 and S6 are fixed; P, Q, R, S must be ordered. */
const os = (s1: string, mid: Record<"P" | "Q" | "R" | "S", string>, s6: string, right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 2): RawQ =>
  m(`The first and the last sentences are given. Choose the correct order of the middle parts.\nS1: ${s1}\nP: ${mid.P}\nQ: ${mid.Q}\nR: ${mid.R}\nS: ${mid.S}\nS6: ${s6}`, [right, ...wrong], e, { d });
export const orderingOfSentences: RawQ[] = [
  os("Ravi decided to learn programming.", { P: "He enrolled in an online course.", Q: "First, he searched for good beginner courses.", R: "After three months, he built his first website.", S: "He practised every evening after work." }, "Within a year, he got a job as a developer.", "QPSR", ["PQSR", "QSPR", "QPRS"], "He searched for a course (Q), enrolled (P), practised (S), and then built his first website (R)."),
  os("A seed was planted in the garden.", { P: "Soon a small shoot appeared above the soil.", Q: "It was watered every day.", R: "The plant grew taller and produced leaves.", S: "After some days the seed germinated." }, "Finally, the plant bloomed with beautiful flowers.", "QSPR", ["SQPR", "QPSR", "QSRP"], "Watering (Q) leads to germination (S), then a shoot appears (P), and the plant grows (R)."),
  os("The company faced falling sales last year.", { P: "The management studied customer feedback.", Q: "They found that the product was too expensive.", R: "Sales began to rise again.", S: "So they launched a cheaper version." }, "This year the company made a record profit.", "PQSR", ["QPSR", "PSQR", "PQRS"], "Studying feedback (P) revealed the price issue (Q), leading to a cheaper version (S) and rising sales (R)."),
  os("It was a stormy night.", { P: "Suddenly, the lights went out.", Q: "The family was having dinner.", R: "Someone lit a candle.", S: "Everyone sat in darkness for a moment." }, "They finished their dinner by candlelight.", "QPSR", ["PQSR", "QSPR", "QPRS"], "Dinner was in progress (Q), the lights went out (P), darkness (S), then a candle was lit (R)."),
  os("Water is essential for life.", { P: "Yet many people waste it carelessly.", Q: "Without it, no living thing can survive.", R: "Simple steps like fixing leaks can save a lot of water.", S: "We must use it wisely." }, "Every drop we save helps the future.", "QPSR", ["PQSR", "QSPR", "QPRS"], "The importance (Q), the problem (P), the need (S), and the solution (R)."),
];

const pf = (sents: Record<"P" | "Q" | "R" | "S", string>, right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 2): RawQ =>
  m(`Rearrange the sentences to form a coherent paragraph:\nP: ${sents.P}\nQ: ${sents.Q}\nR: ${sents.R}\nS: ${sents.S}`, [right, ...wrong], e, { d });
export const paragraphFormation: RawQ[] = [
  pf({ P: "Then add the vegetables and cook for ten minutes.", Q: "First, heat oil in a pan.", R: "Finally, garnish with coriander and serve hot.", S: "Add mustard seeds and let them splutter." }, "QSPR", ["QPSR", "SQPR", "QSRP"], "A recipe in order: heat oil (Q), add mustard seeds (S), add vegetables (P), garnish (R)."),
  pf({ P: "As a result, many birds lose their nesting sites.", Q: "Forests are being cleared for farms and cities.", R: "Conservation of forests is therefore vital for birds.", S: "Several species have become endangered." }, "QPSR", ["PQSR", "QSPR", "QPRS"], "Cause (Q), consequence (P), further consequence (S), conclusion (R)."),
  pf({ P: "It allows people to work from anywhere.", Q: "The internet has changed the way we work.", R: "However, it also blurs the line between work and home.", S: "Meetings can be held online across continents." }, "QPSR", ["PQSR", "QSPR", "QPRS"], "Topic sentence (Q), first benefit (P), second benefit (S), contrast with 'However' (R)."),
  pf({ P: "She practised for hours every day.", Q: "Meera wanted to become a pianist.", R: "Today she performs in concerts around the world.", S: "Her teachers noticed her dedication and talent." }, "QPSR", ["PQSR", "QSPR", "QRPS"], "Goal (Q), effort (P), recognition (S), success (R)."),
  pf({ P: "This makes them easy to carry and store.", Q: "Laptops are portable computers.", R: "But their batteries need regular charging.", S: "They are light and compact." }, "QSPR", ["QPSR", "SQPR", "QSRP"], "Definition (Q), description (S), consequence 'This makes them…' (P), contrast 'But…' (R)."),
];

export const clozeTest: RawItem[] = [
  set("Read the passage and fill in the numbered blanks.\nA good habit is easier to build when it is small. Instead of promising to exercise for an hour every day, start with ten minutes. The (1) ____ is to make the habit so easy that you cannot say no. Once it becomes part of your routine, you can slowly (2) ____ the time. People often (3) ____ because they set goals that are too big. Progress, (4) ____ small, keeps you motivated.", [
    m("Blank (1)", ["idea", "ideal", "idle", "idol"], "'The idea is to …' — idea means the plan or purpose."),
    m("Blank (2)", ["increase", "decrease", "waste", "forget"], "After the habit is established you can increase the time."),
    m("Blank (3)", ["give up", "give in", "give away", "give off"], "'Give up' means stop trying, which fits people abandoning goals that are too big."),
    m("Blank (4)", ["however", "therefore", "because", "unless"], "'Progress, however small, …' means even if it is small."),
  ]),
  set("Read the passage and fill in the numbered blanks.\nThe printing press, invented in the fifteenth century, (1) ____ the way knowledge spread. Before it, books were copied by hand and were very (2) ____. With printing, books became cheaper and more people learned to (3) ____. Ideas could now travel quickly (4) ____ countries.", [
    m("Blank (1)", ["transformed", "transported", "transferred", "translated"], "The invention transformed (changed completely) how knowledge spread."),
    m("Blank (2)", ["expensive", "cheap", "common", "light"], "Hand-copied books were costly — the contrast with 'cheaper' later confirms it."),
    m("Blank (3)", ["read", "speak", "walk", "sing"], "Cheaper books meant more people learned to read."),
    m("Blank (4)", ["across", "under", "beneath", "inside"], "Ideas travel across countries."),
  ]),
];

export const comprehension: RawItem[] = [
  set(
    "Read the passage and answer the questions.\nCities around the world are planting trees along streets to fight rising temperatures. Trees cool the air in two ways: their leaves give shade, and they release water vapour, which absorbs heat. Studies in several cities found that streets with a full tree canopy can be several degrees cooler in summer than nearby streets without trees. Trees also absorb rainwater, reducing flooding, and they make neighbourhoods more pleasant for walking. However, planting trees is not enough; they must be looked after for many years before they give these benefits. Young trees need regular watering and protection from damage. City planners therefore now include maintenance budgets, not just planting targets, in their green plans.",
    [
      m("According to the passage, how do trees cool the air?", ["By giving shade and releasing water vapour", "By absorbing rainwater only", "By reducing traffic", "By blocking the wind"], "The passage names two ways: shade from leaves and water vapour that absorbs heat."),
      m2("Why do planners now include maintenance budgets?", ["Because young trees need years of care before they give benefits", "Because trees are expensive to buy", "Because planting targets are illegal", "Because older trees cause flooding"], "The passage says planting is not enough; trees must be looked after for many years, so maintenance is budgeted."),
      m("Which of the following is NOT mentioned as a benefit of street trees?", ["Reducing noise from traffic", "Lowering temperatures", "Reducing flooding", "Making walking more pleasant"], "Noise reduction is not mentioned; the other three are."),
      m2("The word 'canopy' in the passage most nearly means", ["a covering formed by leaves and branches", "a type of tree", "a city budget", "a rain shelter made by people"], "A tree canopy is the layer of leaves and branches overhead."),
      m2("What is the main idea of the passage?", ["Street trees help cities stay cooler and healthier, but only with long-term care", "Cities should stop building roads", "Trees are the only way to stop floods", "Water vapour is harmful in summer"], "The passage describes the benefits of street trees and stresses the need to maintain them."),
    ],
  ),
  set(
    "Read the passage and answer the questions.\nWhen Anil started his first job as a software tester, he thought his role was simply to find bugs. Within a few weeks he realised that good testing begins much earlier. By reading the requirements carefully and asking questions in planning meetings, he could point out unclear or conflicting requirements before a single line of code was written. Fixing a misunderstanding at that stage took minutes; fixing the same problem after release could take days and annoy customers. His manager noticed that the team's releases became smoother, and Anil was asked to train new testers in this approach.",
    [
      m("What did Anil first believe his job was?", ["Simply to find bugs", "To write code", "To manage the team", "To train new testers"], "The passage says he 'thought his role was simply to find bugs'."),
      m2("Why is it better to catch problems at the requirements stage?", ["They are much cheaper and faster to fix then", "Customers prefer late fixes", "Testers have nothing else to do", "Code cannot be changed later"], "Fixing at that stage took minutes, versus days after release."),
      m2("What was the result of Anil's approach?", ["The team's releases became smoother", "The team stopped testing", "Customers complained more", "Anil changed his job"], "His manager noticed smoother releases."),
      m("The word 'conflicting' in the passage means", ["contradicting each other", "agreeing completely", "very long", "written clearly"], "Conflicting requirements contradict each other."),
    ],
  ),
];

export const oneWordSubstitutes: RawQ[] = [
  m("One who knows everything:", ["Omniscient", "Omnipotent", "Omnipresent", "Optimist"], "Omniscient = all-knowing. Omnipotent = all-powerful; omnipresent = present everywhere."),
  m("A person who cannot be corrected:", ["Incorrigible", "Invincible", "Infallible", "Inaudible"], "Incorrigible means not able to be corrected or reformed."),
  m("A place where bees are kept:", ["Apiary", "Aviary", "Aquarium", "Arsenal"], "An apiary is where bees are kept; an aviary is for birds."),
  m("Words written on a tomb:", ["Epitaph", "Epigram", "Epilogue", "Epithet"], "An epitaph is an inscription on a tomb."),
  m("A government by the people:", ["Democracy", "Autocracy", "Monarchy", "Bureaucracy"], "Democracy is government by the people."),
  m("One who does not believe in God:", ["Atheist", "Theist", "Agnostic", "Heretic"], "An atheist does not believe in God; an agnostic is unsure."),
  m("A list of books referred to in a work:", ["Bibliography", "Biography", "Catalogue", "Dictionary"], "A bibliography lists the sources used."),
  m("A speech delivered without preparation:", ["Extempore", "Rhetoric", "Monologue", "Soliloquy"], "Extempore means spoken without preparation."),
  m("That which cannot be read:", ["Illegible", "Eligible", "Illicit", "Indelible"], "Illegible handwriting cannot be read."),
  m("Fear of heights:", ["Acrophobia", "Hydrophobia", "Claustrophobia", "Xenophobia"], "Acrophobia is fear of heights; claustrophobia is fear of closed spaces."),
  m2("A person who loves mankind:", ["Philanthropist", "Misanthrope", "Philatelist", "Misogynist"], "A philanthropist promotes the welfare of others; a misanthrope dislikes people."),
  m2("Something that is no longer in use:", ["Obsolete", "Absolute", "Obscure", "Obstinate"], "Obsolete means out of date and no longer used."),
  m2("A remedy for all diseases:", ["Panacea", "Antidote", "Placebo", "Vaccine"], "A panacea is a cure-all."),
  m2("The study of ancient societies through their remains:", ["Archaeology", "Anthropology", "Astrology", "Paleography"], "Archaeology studies past societies through material remains."),
];

export const idioms: RawQ[] = [
  m("Choose the meaning of the idiom: 'To break the ice'", ["To start a conversation in an awkward situation", "To break something cold", "To make someone angry", "To end a friendship"], "To break the ice is to ease initial awkwardness and start talking."),
  m("Choose the meaning of: 'A piece of cake'", ["Something very easy", "A small reward", "A sweet dish", "A difficult task"], "A piece of cake means something very easy to do."),
  m("Choose the meaning of: 'To burn the midnight oil'", ["To work or study late into the night", "To waste money", "To cause a fire", "To travel at night"], "Burning the midnight oil means working late at night."),
  m("Choose the meaning of: 'To hit the nail on the head'", ["To be exactly right", "To make a mistake", "To hurt someone", "To start work"], "To hit the nail on the head is to describe something exactly right."),
  m("Choose the meaning of: 'Once in a blue moon'", ["Very rarely", "Every month", "At night", "Very often"], "Once in a blue moon means very rarely."),
  m("Choose the meaning of: 'To let the cat out of the bag'", ["To reveal a secret", "To free an animal", "To cause confusion", "To lose something"], "Letting the cat out of the bag is revealing a secret by mistake."),
  m("Choose the meaning of: 'To cost an arm and a leg'", ["To be very expensive", "To cause injury", "To be cheap", "To take a long time"], "Something that costs an arm and a leg is very expensive."),
  m2("Choose the meaning of: 'To bite off more than one can chew'", ["To take on more than one can handle", "To eat too much", "To speak rudely", "To be greedy for money"], "It means attempting something too big or difficult."),
  m2("Choose the meaning of: 'To be in hot water'", ["To be in trouble", "To take a bath", "To be angry", "To be busy"], "Being in hot water means being in trouble."),
  m2("Choose the meaning of: 'To see eye to eye'", ["To agree completely", "To look carefully", "To stare at someone", "To meet in person"], "To see eye to eye is to agree."),
  m2("Choose the meaning of: 'A blessing in disguise'", ["Something good that at first seemed bad", "A hidden gift", "A religious ceremony", "A false promise"], "A blessing in disguise is an apparent misfortune that turns out well."),
  m2("Choose the meaning of: 'To call it a day'", ["To stop working for now", "To name a day", "To start a new task", "To make a phone call"], "Calling it a day means stopping work."),
  m3("Choose the meaning of: 'To beat around the bush'", ["To avoid the main point", "To search a forest", "To work very hard", "To defeat an enemy"], "Beating around the bush is avoiding talking about the main issue."),
];

const cv = (active: string, right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 1): RawQ => m(`Choose the correct passive form of:\n${active}`, [right, ...wrong], e, { d });
const ca = (passive: string, right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 2): RawQ => m(`Choose the correct active form of:\n${passive}`, [right, ...wrong], e, { d });
export const changeOfVoice: RawQ[] = [
  cv("She writes a letter.", "A letter is written by her.", ["A letter was written by her.", "A letter is being written by her.", "A letter has been written by her."], "Simple present active → 'is/are + past participle'."),
  cv("The police arrested the thief.", "The thief was arrested by the police.", ["The thief is arrested by the police.", "The thief has been arrested by the police.", "The thief had arrested the police."], "Simple past active → 'was/were + past participle'."),
  cv("They are building a new bridge.", "A new bridge is being built by them.", ["A new bridge is built by them.", "A new bridge was being built by them.", "A new bridge has been built by them."], "Present continuous → 'is/are being + past participle'."),
  cv("He has completed the project.", "The project has been completed by him.", ["The project had been completed by him.", "The project was completed by him.", "The project is completed by him."], "Present perfect → 'has/have been + past participle'."),
  cv("Who wrote this book?", "By whom was this book written?", ["Who was this book written?", "By whom this book was written?", "Whom was this book written by him?"], "A 'who' question becomes 'By whom + was + subject + past participle?'.", 2),
  cv("Open the door.", "Let the door be opened.", ["The door is opened.", "The door should open.", "Let the door opened."], "Imperative sentences use 'Let + object + be + past participle'.", 2),
  cv("The manager will announce the results tomorrow.", "The results will be announced by the manager tomorrow.", ["The results would be announced by the manager tomorrow.", "The results will announced by the manager tomorrow.", "The results are announced by the manager tomorrow."], "Simple future → 'will be + past participle'."),
  cv("People speak English all over the world.", "English is spoken all over the world.", ["English was spoken all over the world.", "English is speaking all over the world.", "English has spoken all over the world."], "When the doer is general ('people'), it is usually dropped in the passive.", 2),
  ca("The match was won by our team.", "Our team won the match.", ["Our team wins the match.", "Our team has won the match.", "Our team had won the match."], "'Was won' (simple past passive) becomes 'won' in the active."),
  ca("The letters are being typed by the clerk.", "The clerk is typing the letters.", ["The clerk typed the letters.", "The clerk types the letters.", "The clerk has typed the letters."], "'Are being typed' (present continuous passive) becomes 'is typing'."),
];

const cs = (direct: string, right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 2): RawQ => m(`Choose the correct indirect (reported) form:\n${direct}`, [right, ...wrong], e, { d });
export const changeOfSpeech: RawQ[] = [
  cs("He said, \"I am busy.\"", "He said that he was busy.", ["He said that I was busy.", "He said that he is busy.", "He told that he was busy."], "Present 'am' becomes past 'was', and 'I' becomes 'he' when the reporting verb is in the past.", 1),
  cs("She said to me, \"Where are you going?\"", "She asked me where I was going.", ["She asked me where was I going.", "She said to me where I am going.", "She asked me where you were going."], "Questions are reported with 'asked', statement word order and a tense shift."),
  cs("The teacher said, \"The earth goes round the sun.\"", "The teacher said that the earth goes round the sun.", ["The teacher said that the earth went round the sun.", "The teacher said the earth had gone round the sun.", "The teacher told that the earth goes round the sun."], "Universal truths keep their present tense in reported speech."),
  cs("He said to me, \"Please help me.\"", "He requested me to help him.", ["He told me to please help him.", "He said me to help him.", "He requested me that I help me."], "A polite request is reported with 'requested + object + to-infinitive'."),
  cs("Ravi said, \"I will come tomorrow.\"", "Ravi said that he would come the next day.", ["Ravi said that he will come tomorrow.", "Ravi said that I would come the next day.", "Ravi said he would come tomorrow."], "'Will' becomes 'would' and 'tomorrow' becomes 'the next day'."),
  cs("She said, \"I have finished my work.\"", "She said that she had finished her work.", ["She said that she has finished her work.", "She said that I had finished my work.", "She said that she finished my work."], "Present perfect becomes past perfect; pronouns change to match the speaker."),
  cs("The captain said to his men, \"Don't move.\"", "The captain ordered his men not to move.", ["The captain told his men don't move.", "The captain ordered his men to not moving.", "The captain said his men not move."], "A negative command is reported with 'ordered/told + object + not to + verb'."),
  cs("He said, \"What a beautiful day it is!\"", "He exclaimed that it was a very beautiful day.", ["He said what a beautiful day it was.", "He exclaimed what a beautiful day is it.", "He asked that it was a beautiful day."], "Exclamations are reported with 'exclaimed that' and a statement form.", 3),
  cs("Mother said to me, \"Did you eat your lunch?\"", "Mother asked me if I had eaten my lunch.", ["Mother asked me did I eat my lunch.", "Mother asked me if I ate my lunch today.", "Mother said to me if I had eaten my lunch."], "Yes/no questions are reported with 'if/whether'; past simple becomes past perfect."),
];

export const verbalAnalogies: RawQ[] = [
  m("BOOK : AUTHOR :: SONG : ?", ["Composer", "Singer", "Listener", "Album"], "An author creates a book; a composer creates a song."),
  m("SURGEON : SCALPEL :: CARPENTER : ?", ["Saw", "Wood", "Furniture", "Table"], "A scalpel is a surgeon's tool; a saw is a carpenter's tool."),
  m("HAPPY : SAD :: EXPAND : ?", ["Contract", "Grow", "Extend", "Widen"], "Happy and sad are antonyms; so are expand and contract."),
  m("CALF : COW :: PUPPY : ?", ["Dog", "Cat", "Kitten", "Lamb"], "A calf is a young cow; a puppy is a young dog."),
  m("PILOT : AEROPLANE :: CAPTAIN : ?", ["Ship", "Team", "Army", "Sea"], "A pilot commands an aeroplane; a captain commands a ship."),
  m("THERMOMETER : TEMPERATURE :: BAROMETER : ?", ["Atmospheric pressure", "Height", "Rainfall", "Humidity"], "A thermometer measures temperature; a barometer measures atmospheric pressure."),
  m2("ARCHIPELAGO : ISLANDS :: CONSTELLATION : ?", ["Stars", "Planets", "Galaxies", "Moons"], "An archipelago is a group of islands; a constellation is a group of stars."),
  m2("FAMINE : FOOD :: DROUGHT : ?", ["Water", "Heat", "Crops", "Desert"], "A famine is a shortage of food; a drought is a shortage of water."),
  m2("SYMPHONY : COMPOSER :: STATUE : ?", ["Sculptor", "Painter", "Architect", "Museum"], "A composer creates a symphony; a sculptor creates a statue."),
  m3("LOQUACIOUS : TALK :: GLUTTONOUS : ?", ["Eat", "Sleep", "Laugh", "Spend"], "A loquacious person talks too much; a gluttonous person eats too much."),
];
