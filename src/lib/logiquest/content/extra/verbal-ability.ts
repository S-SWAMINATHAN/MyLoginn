/** More Verbal Ability questions, in the same formats as verbal/va1.ts and verbal/va2.ts. */
import type { RawQ } from "../../types";
import { m, m2, m3, set } from "../build";
import type { ExtraSubject } from "./merge";

type D = 1 | 2 | 3;
const se = (parts: [string, string, string], err: 0 | 1 | 2 | 3, e: string, d: D = 2): RawQ => ({
  q: "Read the sentence and find the part that contains an error. If there is no error, choose 'No error'.",
  o: [`(A) ${parts[0]}`, `(B) ${parts[1]}`, `(C) ${parts[2]}`, "(D) No error"], a: err, e, d,
});
const ant = (w: string, o: string[], e: string, d: D = 1) => m(`Choose the word opposite in meaning to: ${w}`, o, e, { d });
const syn = (w: string, o: string[], e: string, d: D = 1) => m(`Choose the word nearest in meaning to: ${w}`, o, e, { d });
const sw = (sentence: string, o: string[], e: string, d: D = 1): RawQ => m(`Pick the most appropriate word to fill the blank:\n${sentence}`, o, e, { d });
const ow = (start: string, parts: Record<"P" | "Q" | "R" | "S", string>, right: string, wrong: string[], e: string, d: D = 2): RawQ =>
  m(`Rearrange the parts to form a meaningful sentence:\n${start}\nP: ${parts.P}\nQ: ${parts.Q}\nR: ${parts.R}\nS: ${parts.S}`, [right, ...wrong], e, { d });
const sc = (sentence: string, o: string[], ans: number, e: string, d: D = 2): RawQ => ({ q: `Choose the correct replacement for the part in bold. If no change is needed, choose "No correction required".\n${sentence}`, o: [...o, "No correction required"], a: ans, e, d });
const os = (s1: string, mid: Record<"P" | "Q" | "R" | "S", string>, s6: string, right: string, wrong: string[], e: string, d: D = 2): RawQ =>
  m(`The first and the last sentences are given. Choose the correct order of the middle parts.\nS1: ${s1}\nP: ${mid.P}\nQ: ${mid.Q}\nR: ${mid.R}\nS: ${mid.S}\nS6: ${s6}`, [right, ...wrong], e, { d });
const pf = (sents: Record<"P" | "Q" | "R" | "S", string>, right: string, wrong: string[], e: string, d: D = 2): RawQ =>
  m(`Rearrange the sentences to form a coherent paragraph:\nP: ${sents.P}\nQ: ${sents.Q}\nR: ${sents.R}\nS: ${sents.S}`, [right, ...wrong], e, { d });
const idiom = (phrase: string, o: string[], e: string, d: D = 1) => m(`Choose the meaning of: '${phrase}'`, o, e, { d });
const cv = (active: string, right: string, wrong: string[], e: string, d: D = 1): RawQ => m(`Choose the correct passive form of:\n${active}`, [right, ...wrong], e, { d });
const ca = (passive: string, right: string, wrong: string[], e: string, d: D = 2): RawQ => m(`Choose the correct active form of:\n${passive}`, [right, ...wrong], e, { d });
const cs = (direct: string, right: string, wrong: string[], e: string, d: D = 2): RawQ => m(`Choose the correct indirect (reported) form:\n${direct}`, [right, ...wrong], e, { d });

const extra: ExtraSubject = {
  "spotting-errors": [
    se(["The quality of the mangoes", "were not", "up to the mark."], 1, "The subject is 'quality' (singular): 'The quality … **was** not up to the mark'."),
    se(["He has been ill", "since last Monday", "and is still in hospital."], 3, "The sentence is correct: 'since' marks a point in time with the present perfect.", 1),
    se(["She is", "the most cleverest girl", "in the class."], 1, "'Cleverest' is already superlative; remove 'most': 'the cleverest girl'."),
    se(["I am looking forward", "to meet you", "next week."], 1, "'Look forward to' is followed by a gerund: 'to **meeting** you'."),
    se(["The police", "has arrested", "the culprits."], 1, "'Police' is a plural noun: 'The police **have** arrested the culprits'."),
    se(["He gave me", "an advice", "about my career."], 1, "'Advice' is uncountable; say 'a piece of advice' or just 'advice'."),
    se(["We reached", "the airport", "before the plane landed."], 3, "The sentence is correct.", 1),
    se(["Ten kilometres", "are a long distance", "to walk."], 1, "A quantity treated as one amount takes a singular verb: 'Ten kilometres **is** a long distance'.", 3),
    se(["Scarcely had we left", "the house", "when it started to rain."], 3, "'Scarcely … when' is correct with inversion.", 3),
    se(["My friend and colleague", "have joined", "the new company."], 1, "One person who is both friend and colleague takes a singular verb: '**has** joined'.", 3),
    se(["The boy", "who's bag was stolen", "complained to the teacher."], 1, "The possessive form is 'whose': 'the boy **whose** bag was stolen'."),
    se(["Unless you do not hurry,", "you will miss", "the bus."], 0, "'Unless' already means 'if not': '**Unless you hurry**, …'."),
    se(["He is good", "in mathematics", "and science."], 1, "The correct preposition is 'at': 'good **at** mathematics'."),
    se(["Between you and I,", "this plan", "will not work."], 0, "After a preposition use the object pronoun: 'Between you and **me**'."),
  ],

  antonyms: [
    ant("ANCIENT", ["Modern", "Old", "Antique", "Historic"], "Ancient means very old; modern means recent."),
    ant("GENEROUS", ["Stingy", "Kind", "Liberal", "Charitable"], "Generous means giving freely; stingy means unwilling to give."),
    ant("VICTORY", ["Defeat", "Win", "Triumph", "Success"], "Victory is winning; defeat is losing."),
    ant("ACCEPT", ["Reject", "Receive", "Admit", "Take"], "To accept is to agree to receive; to reject is to refuse."),
    ant("RIGID", ["Flexible", "Stiff", "Firm", "Hard"], "Rigid means unable to bend; flexible bends easily."),
    ant("ASCEND", ["Descend", "Climb", "Rise", "Mount"], "Ascend means go up; descend means go down."),
    m2("Choose the word opposite in meaning to: TRANQUIL", ["Agitated", "Calm", "Peaceful", "Quiet"], "Tranquil means calm; agitated means disturbed."),
    m2("Choose the word opposite in meaning to: LENIENT", ["Strict", "Mild", "Gentle", "Tolerant"], "Lenient means not strict."),
    m2("Choose the word opposite in meaning to: AFFLUENT", ["Poor", "Rich", "Wealthy", "Prosperous"], "Affluent means wealthy."),
    m2("Choose the word opposite in meaning to: VERBOSE", ["Concise", "Wordy", "Talkative", "Lengthy"], "Verbose means using too many words; concise means brief."),
    m3("Choose the word opposite in meaning to: BENEVOLENT", ["Malevolent", "Kind", "Charitable", "Generous"], "Benevolent means well-meaning; malevolent means wishing harm."),
    m3("Choose the word opposite in meaning to: ZENITH", ["Nadir", "Peak", "Summit", "Apex"], "Zenith is the highest point; nadir is the lowest."),
    m3("Choose the word opposite in meaning to: GREGARIOUS", ["Reserved", "Sociable", "Friendly", "Outgoing"], "Gregarious means fond of company; reserved means quiet and private."),
  ],

  synonyms: [
    syn("COURAGE", ["Bravery", "Fear", "Anger", "Wisdom"], "Courage means bravery."),
    syn("RAPID", ["Fast", "Slow", "Steady", "Calm"], "Rapid means happening quickly."),
    syn("GENUINE", ["Authentic", "Fake", "Cheap", "Common"], "Genuine means real or authentic."),
    syn("ASSIST", ["Help", "Hinder", "Ignore", "Order"], "To assist is to help."),
    syn("FRAGILE", ["Delicate", "Strong", "Heavy", "Rough"], "Fragile means easily broken."),
    syn("ANXIOUS", ["Worried", "Calm", "Happy", "Bored"], "Anxious means worried or nervous."),
    m2("Choose the word nearest in meaning to: DILIGENT", ["Industrious", "Lazy", "Careless", "Slow"], "Diligent means hard-working; industrious."),
    m2("Choose the word nearest in meaning to: CONCISE", ["Brief", "Lengthy", "Vague", "Complex"], "Concise means expressed in few words."),
    m2("Choose the word nearest in meaning to: HOSTILE", ["Unfriendly", "Welcoming", "Neutral", "Gentle"], "Hostile means aggressively unfriendly."),
    m2("Choose the word nearest in meaning to: ELOQUENT", ["Articulate", "Silent", "Clumsy", "Rude"], "Eloquent means fluent and persuasive in speaking."),
    m3("Choose the word nearest in meaning to: EPHEMERAL", ["Transient", "Eternal", "Solid", "Ancient"], "Ephemeral means short-lived; transient."),
    m3("Choose the word nearest in meaning to: CAPRICIOUS", ["Unpredictable", "Steady", "Careful", "Generous"], "Capricious means given to sudden changes of mood."),
    m3("Choose the word nearest in meaning to: TACITURN", ["Reserved", "Talkative", "Angry", "Cheerful"], "Taciturn means saying little."),
  ],

  "selecting-words": [
    sw("The teacher asked the students to ____ attention to the lecture.", ["pay", "give off", "make", "take up"], "The fixed expression is 'pay attention'."),
    sw("He was ____ of the theft and released.", ["acquitted", "accused", "convicted", "arrested"], "Acquitted means declared not guilty."),
    sw("The ____ of the school called a meeting of all teachers.", ["principal", "principle", "principally", "prince"], "The principal is the head of a school; a principle is a rule."),
    sw("Please ____ the book on the shelf.", ["lay", "lie", "lain", "lied"], "'Lay' means to put something down and takes an object."),
    sw("The heavy rain ____ the traffic for hours.", ["disrupted", "erupted", "interrupted of", "corrupted"], "Disrupted means disturbed the normal flow."),
    sw("She has a keen ____ for music.", ["ear", "eye", "nose", "hand"], "'A keen ear for music' means good musical perception."),
    sw("His speech was full of ____ ideas that inspired the audience.", ["novel", "stale", "boring", "trivial"], "Novel means new and original."),
    sw("We should not ____ our duties.", ["neglect", "neglecting", "negligent", "negligence"], "A verb is needed after 'should not'."),
    sw("The two brothers are very different ____ each other.", ["from", "than", "with", "by"], "The standard form is 'different from'.", 2),
    sw("The minister ____ the new hospital last week.", ["inaugurated", "initiated into", "invested", "inhabited"], "To inaugurate is to formally open.", 2),
    sw("The committee consists ____ five members.", ["of", "in", "with", "from"], "'Consist of' is the correct phrase.", 2),
    sw("His ____ behaviour annoyed everyone at the party.", ["boorish", "polite", "graceful", "modest"], "Boorish means rough and bad-mannered.", 3),
  ],

  spellings: [
    m("Find the correctly spelt word.", ["Achievement", "Acheivement", "Achievment", "Acheivment"], "Achieve + ment; 'ie' after 'h'."),
    m("Find the correctly spelt word.", ["Committee", "Commitee", "Comittee", "Comitee"], "Committee has double 'm', double 't' and double 'e'."),
    m("Find the correctly spelt word.", ["Government", "Goverment", "Govermant", "Governmant"], "Govern + ment."),
    m("Find the correctly spelt word.", ["Environment", "Enviroment", "Envirnment", "Enviornment"], "Environ + ment."),
    m("Find the correctly spelt word.", ["Privilege", "Priviledge", "Privelege", "Privilage"], "Privilege has no 'd'."),
    m("Find the correctly spelt word.", ["Rhythm", "Rythm", "Rhythem", "Rhytm"], "Rhythm: r-h-y-t-h-m."),
    m("Find the correctly spelt word.", ["Guarantee", "Garantee", "Guarentee", "Gaurantee"], "Guarantee: 'gua' and double 'e'."),
    m("Find the correctly spelt word.", ["Pronunciation", "Pronounciation", "Pronuncation", "Prononciation"], "Pronounce but pronunciation (no 'o' after 'n')."),
    m2("Find the correctly spelt word.", ["Liaison", "Liasion", "Laison", "Liason"], "Liaison has two 'i's around the 'a'."),
    m2("Find the correctly spelt word.", ["Entrepreneur", "Entreprenuer", "Enterpreneur", "Entrepeneur"], "From French: entre-pre-neur."),
    m2("Find the misspelt word.", ["Calender", "Calendar", "Colander", "Calibre"], "The correct spelling is 'calendar'."),
    m2("Find the misspelt word.", ["Recomend", "Recognise", "Receipt", "Reference"], "The correct spelling is 'recommend' (double 'm')."),
    m3("Find the correctly spelt word.", ["Connoisseur", "Conoisseur", "Connoiseur", "Conaisseur"], "Connoisseur: double 'n' and double 's'."),
  ],

  "sentence-formation": [
    m("Which sentence is correct?", ["She has lived here for ten years.", "She is living here since ten years.", "She lives here since ten years.", "She has lived here since ten years."], "'For' with a period of time and the present perfect."),
    m("Which sentence is correct?", ["Neither the teacher nor the students were present.", "Neither the teacher nor the students was present.", "Neither the teacher or the students were present.", "Neither teacher nor the students was present."], "The verb agrees with the nearer subject, 'students'."),
    m("Which sentence is correct?", ["He is one of the best players in the team.", "He is one of the best player in the team.", "He is one of best players in the team.", "He is one the best players in the team."], "'One of the' is followed by a plural noun."),
    m("Which sentence is correct?", ["I have never seen such a beautiful place.", "I have never saw such a beautiful place.", "I never have seen such beautiful place.", "I have never seen such beautiful a place."], "Present perfect uses the past participle 'seen'."),
    m("Which sentence is correct?", ["The information you gave was useful.", "The informations you gave were useful.", "The information you gave were useful.", "An information you gave was useful."], "'Information' is uncountable and singular."),
    m2("Which sentence is correct?", ["He suggested that we take a break.", "He suggested us to take a break.", "He suggested to take us a break.", "He suggested we to take a break."], "'Suggest that + subject + base verb' is the correct pattern."),
    m2("Which sentence is correct?", ["She avoided answering the question.", "She avoided to answer the question.", "She avoided answer the question.", "She avoided for answering the question."], "'Avoid' is followed by a gerund."),
    m2("Which sentence is correct?", ["By the time we arrived, the film had started.", "By the time we arrived, the film has started.", "By the time we arrived, the film started already.", "By the time we had arrived, the film has started."], "The earlier past action uses the past perfect."),
    m2("Which sentence is correct?", ["It is high time we left.", "It is high time we leave.", "It is high time we will leave.", "It is high time we have left."], "'It is high time' is followed by the simple past."),
    m3("Which sentence is correct?", ["Not only the students but also the teacher was late.", "Not only the students but also the teacher were late.", "Not only the students but the teacher also were late.", "Not only students but also teacher was late."], "With 'not only … but also', the verb agrees with the nearer subject, 'the teacher'."),
  ],

  "ordering-of-words": [
    ow("The children", { P: "in the park", Q: "were playing", R: "happily", S: "after school" }, "QRPS", ["RQPS", "QPRS", "PSQR"], "The children **were playing (Q) happily (R) in the park (P) after school (S)**."),
    ow("She", { P: "a letter", Q: "to her grandmother", R: "wrote", S: "last Sunday" }, "RPQS", ["PRQS", "RQPS", "SRPQ"], "She **wrote (R) a letter (P) to her grandmother (Q) last Sunday (S)**."),
    ow("To stay healthy,", { P: "should eat", Q: "and exercise regularly", R: "balanced meals", S: "everyone" }, "SPRQ", ["PSRQ", "SRPQ", "SPQR"], "To stay healthy, **everyone (S) should eat (P) balanced meals (R) and exercise regularly (Q)**."),
    ow("The scientist", { P: "after years", Q: "a new vaccine", R: "developed", S: "of research" }, "RQPS", ["QRPS", "RPSQ", "PSRQ"], "The scientist **developed (R) a new vaccine (Q) after years (P) of research (S)**."),
    ow("When the bell rang,", { P: "the students", Q: "out of", R: "rushed", S: "the classroom" }, "PRQS", ["RPQS", "PQRS", "SPRQ"], "When the bell rang, **the students (P) rushed (R) out of (Q) the classroom (S)**."),
    ow("The company", { P: "its profits", Q: "doubled", R: "within", S: "two years" }, "QPRS", ["PQRS", "QRSP", "RSQP"], "The company **doubled (Q) its profits (P) within (R) two years (S)**."),
    ow("It is important", { P: "before", Q: "to read", R: "signing it", S: "a contract carefully" }, "QSPR", ["SQPR", "QPSR", "PRQS"], "It is important **to read (Q) a contract carefully (S) before (P) signing it (R)**."),
    ow("The tourists", { P: "the ancient temple", Q: "by", R: "were amazed", S: "the beauty of" }, "RQSP", ["RSQP", "QRSP", "PSRQ"], "The tourists **were amazed (R) by (Q) the beauty of (S) the ancient temple (P)**.", 3),
  ],

  "sentence-correction": [
    sc("She **don't like** spicy food.", ["doesn't like", "didn't liked", "not likes"], 0, "Third person singular in the present takes 'doesn't'."),
    sc("I **have seen** him yesterday.", ["saw", "had seen", "have saw"], 0, "With a definite past time ('yesterday'), use the simple past."),
    sc("The boy **who's** father is a doctor is my friend.", ["whose", "who", "whom"], 0, "'Whose' shows possession."),
    sc("He **can able to** solve the problem.", ["is able to", "can be able", "could able to"], 0, "'Can' and 'able to' should not be combined."),
    sc("They **did not went** to school.", ["did not go", "do not went", "not went"], 0, "After 'did', use the base form 'go'."),
    sc("**Each of the players** were given a medal.", ["Each of the players was", "Each players were", "All of the player was"], 0, "'Each' takes a singular verb.", 3),
    sc("I prefer tea **than** coffee.", ["to", "over than", "rather"], 0, "'Prefer X to Y' is the correct pattern."),
    sc("The sun **rises in** the east.", ["rise from", "rose from", "is rising from"], 3, "'The sun rises in the east' is correct as a universal truth.", 1),
    sc("He has **less** friends than his brother.", ["fewer", "lesser", "little"], 0, "Use 'fewer' with countable nouns like friends."),
    sc("**Being very tired**, the work was left unfinished by him.", ["Being very tired, he left the work unfinished", "Since being tired, the work was left", "Very tired, the work was left"], 0, "The participle must refer to the subject ('he').", 3),
  ],

  "sentence-improvement": [
    sc("She **is married with** a doctor.", ["is married to", "is marrying with", "married with"], 0, "'Married to' is the correct preposition."),
    sc("He **laid** on the bed all afternoon.", ["lay", "lied", "layed"], 0, "The past tense of 'lie' (recline) is 'lay'."),
    sc("I will call you **when I will reach** home.", ["when I reach", "when I reached", "when I am reaching"], 0, "In time clauses about the future, use the simple present."),
    sc("The doctor **advised him to take** rest.", ["advised him take", "advise him taking", "advised to him take"], 3, "'Advised him to take rest' is correct.", 1),
    sc("Neither of the answers **are** correct.", ["is", "were", "have been"], 0, "'Neither' is singular."),
    sc("It **is raining since** morning.", ["has been raining since", "rained since", "was raining from"], 0, "Present perfect continuous with 'since'."),
    sc("He is **too weak to walk**.", ["so weak to walk", "very weak to walk", "too much weak to walk"], 3, "'Too … to' is correct here.", 1),
    sc("The film was **so much interesting** that we watched it twice.", ["so interesting", "too interesting", "very much interesting"], 0, "Use 'so + adjective + that'."),
    sc("We **have to reached** the station by six.", ["have to reach", "had to reached", "have reach"], 0, "'Have to' is followed by the base form."),
    sc("**Despite of** being ill, he attended the class.", ["Despite", "Inspite", "Although of"], 0, "'Despite' takes no 'of'; 'in spite of' does."),
    sc("The number of accidents **have increased** this year.", ["has increased", "are increasing", "were increased"], 0, "'The number of …' takes a singular verb.", 2),
  ],

  "completing-statements": [
    m("Complete the sentence: She worked hard so that", ["she could pass the examination.", "she failed the examination.", "the examination was cancelled.", "she did not study."], "'So that' introduces purpose."),
    m("Complete the sentence: As soon as the guests arrived,", ["the party began.", "the party had ended a week ago.", "because the party began.", "although the party began."], "'As soon as' links two events immediately after each other."),
    m("Complete the sentence: If I had more time,", ["I would learn a new language.", "I will learn a new language.", "I learned a new language.", "I had learned a new language."], "Second conditional: if + past, would + base verb."),
    m("Complete the sentence: He is not only intelligent", ["but also hard-working.", "and also hard-working.", "but hard-working also not.", "or hard-working."], "'Not only … but also' is the correlative pair."),
    m2("Complete the sentence: Hardly had the play begun", ["when the lights went out.", "than the lights went out.", "then the lights went out.", "so the lights went out."], "'Hardly … when' is the correct pair."),
    m2("Complete the sentence: The harder he tried,", ["the more mistakes he seemed to make.", "more mistakes he made.", "he made more mistakes.", "the mistakes more he made."], "'The + comparative …, the + comparative' structure."),
    m2("Complete the sentence: Despite the heavy traffic,", ["we reached the airport on time.", "we missed the flight because of traffic.", "so we reached late.", "therefore the traffic was heavy."], "'Despite' introduces a contrast."),
    m2("Complete the sentence: Since the shop was closed,", ["we went to another one.", "we bought everything there.", "although we went in.", "unless it opened."], "'Since' here gives a reason."),
    m("Complete the sentence: Water boils at 100 °C", ["at sea level.", "in all conditions on any mountain.", "when it freezes.", "unless it is heated."], "Boiling point depends on pressure; 100 °C is at sea level."),
    m3("Complete the sentence: Were I in your position,", ["I would accept the offer.", "I will accept the offer.", "I accepted the offer.", "I have accepted the offer."], "Inverted conditional 'Were I …' = 'If I were …'."),
  ],

  "ordering-of-sentences": [
    os("Priya wanted to save money for a laptop.", { P: "She made a monthly budget.", Q: "She cut down on eating out.", R: "Every month, she put the savings in a separate account.", S: "Then she noted where she was overspending." }, "After a year, she bought the laptop.", "PSQR", ["SPQR", "PQSR", "PSRQ"], "She made a budget (P), found overspending (S), cut eating out (Q), and saved the difference (R)."),
    os("The village had no clean drinking water.", { P: "The volunteers raised funds for a water purifier.", Q: "Children often fell ill with stomach infections.", R: "A group of volunteers visited and studied the problem.", S: "Within months, the purifier was installed." }, "Illnesses in the village dropped sharply.", "QRPS", ["RQPS", "QPRS", "QRSP"], "Problem (Q), study (R), fundraising (P), installation (S)."),
    os("Arjun had an important interview on Monday.", { P: "He researched the company thoroughly.", Q: "On Sunday night, he went to bed early.", R: "He also practised answers with a friend.", S: "On Monday morning he reached the office early." }, "He was selected for the job.", "PRQS", ["RPQS", "PQRS", "PRSQ"], "Research (P), practice (R), early sleep (Q), arriving early (S)."),
    os("The company launched a new app.", { P: "Users complained that it was slow.", Q: "Engineers studied the complaints and found the cause.", R: "They released an update with faster loading.", S: "In the first week, downloads were high." }, "Ratings improved after the update.", "SPQR", ["PSQR", "SQPR", "SPRQ"], "Launch success (S), complaints (P), diagnosis (Q), update (R)."),
    os("The monsoon arrived late this year.", { P: "Farmers delayed sowing their crops.", Q: "Water levels in reservoirs fell.", R: "When the rains finally came, sowing began quickly.", S: "The government announced support for affected farmers." }, "Most farmers managed a reasonable harvest.", "QPSR", ["PQSR", "QSPR", "QPRS"], "Low reservoirs (Q), delayed sowing (P), government support (S), rains arrive (R)."),
    os("The library announced a reading challenge for the summer.", { P: "Children signed up in large numbers in the first week.", Q: "Each child had to read ten books in two months.", R: "Those who finished received a certificate.", S: "Parents said their children were reading more than ever." }, "The library plans to repeat the challenge next year.", "QPRS", ["PQRS", "QRPS", "QPSR"], "Rules (Q), sign-ups (P), reward (R), feedback (S)."),
    os("Rohan wanted to start a small bakery.", { P: "He took a short course in baking.", Q: "He rented a small shop near a school.", R: "Within months, students became his regular customers.", S: "Then he saved money for an oven and supplies." }, "Today his bakery is one of the busiest in the area.", "PSQR", ["SPQR", "PQSR", "PSRQ"], "Learn (P), save and equip (S), open the shop (Q), gain customers (R)."),
    os("A storm knocked out power in the town.", { P: "Repair crews worked through the night.", Q: "Many homes were left without electricity.", R: "By morning, power was restored to most areas.", S: "The electricity board sent repair crews immediately." }, "Residents thanked the workers for their quick response.", "QSPR", ["SQPR", "QPSR", "QSRP"], "Effect (Q), response (S), work (P), result (R)."),
    os("The school wanted to reduce plastic waste.", { P: "Students were asked to bring reusable bottles.", Q: "Bins for recycling were placed in every corridor.", R: "At the end of the term, waste had fallen by half.", S: "Teachers explained why plastic harms the environment." }, "The school won an award for its green campaign.", "SPQR", ["PSQR", "SQPR", "SPRQ"], "Awareness (S), action by students (P), infrastructure (Q), result (R)."),
    os("Meena decided to run a marathon.", { P: "She started with short runs of two kilometres.", Q: "Gradually she increased the distance every week.", R: "She also improved her diet and sleep.", S: "Three months later she could run twenty kilometres." }, "She completed the marathon in under five hours.", "PQRS", ["QPRS", "PRQS", "PQSR"], "Start small (P), increase (Q), support habits (R), progress (S)."),
  ],

  "paragraph-formation": [
    pf({ P: "As a result, many birds now visit the area again.", Q: "Ten years ago, the lake was full of garbage.", R: "Volunteers cleaned it and planted trees around it.", S: "The local residents decided to act." }, "QSRP", ["SQRP", "QRSP", "QSPR"], "Past problem (Q), decision (S), action (R), result (P)."),
    pf({ P: "Then, fold the paper in half along the line.", Q: "Start by drawing a straight line across the paper.", R: "Finally, press the fold firmly to make a sharp crease.", S: "Make sure the edges meet exactly before you fold." }, "QSPR", ["QPSR", "SQPR", "QSRP"], "Instructions in order: draw (Q), align edges (S), fold (P), press (R)."),
    pf({ P: "However, it also brought new challenges such as cyberbullying.", Q: "The internet has changed how young people communicate.", R: "They can now talk to friends anywhere instantly.", S: "Schools now teach students how to stay safe online." }, "QRPS", ["QPRS", "RQPS", "QRSP"], "Topic (Q), benefit (R), challenge (P), response (S)."),
    pf({ P: "He named it after the city where he was born.", Q: "In 1990, a young engineer started a small company.", R: "Today the company employs over ten thousand people.", S: "Its first product was a simple calculator." }, "QPSR", ["QSPR", "PQSR", "QPRS"], "Founding (Q), naming (P), first product (S), present day (R)."),
    pf({ P: "The seeds then need regular watering and sunlight.", Q: "Growing vegetables at home is easier than many people think.", R: "Within weeks, small plants begin to appear.", S: "First, choose a sunny spot and prepare the soil." }, "QSPR", ["SQPR", "QPSR", "QSRP"], "Topic (Q), preparation (S), care (P), result (R)."),
    pf({ P: "Next, add sugar and stir until it dissolves.", Q: "To make lemonade, first squeeze the juice of four lemons.", R: "Finally, add ice and serve chilled.", S: "Pour the juice into a jug of cold water." }, "QSPR", ["QPSR", "SQPR", "QSRP"], "Squeeze (Q), add water (S), sweeten (P), serve (R)."),
    pf({ P: "Since then, millions of people have used it to learn new skills.", Q: "A teacher started recording short maths lessons for his cousin.", R: "The videos became so popular that he quit his job to make more.", S: "He uploaded them online so that she could watch at any time." }, "QSRP", ["QRSP", "SQRP", "QSPR"], "Origin (Q), sharing (S), growth (R), impact (P)."),
    pf({ P: "As a result, the company's customers began to trust it again.", Q: "A company's product was found to have a safety defect.", R: "It also explained openly how it would prevent similar problems.", S: "It immediately recalled the product and refunded customers." }, "QSRP", ["QRSP", "SQRP", "QSPR"], "Problem (Q), recall (S), transparency (R), result (P)."),
    pf({ P: "Thus, reading regularly can make us more empathetic.", Q: "Reading fiction lets us see the world through other people's eyes.", R: "Studies suggest this improves our understanding of others' feelings.", S: "We experience their fears, hopes and decisions." }, "QSRP", ["QRSP", "SQRP", "QSPR"], "Claim (Q), elaboration (S), evidence (R), conclusion (P).", 3),
  ],

  "cloze-test": [
    set("Read the passage and fill in the numbered blanks.\nWater is one of our most precious resources, yet much of it is (1) ____ every day. A dripping tap can waste many litres in a week. Simple steps such as fixing leaks and turning off taps while brushing can (2) ____ a big difference. Farmers can use drip irrigation, which (3) ____ water directly to the roots of plants. If everyone makes small changes, we can (4) ____ water for future generations.", [
      m("Blank (1)", ["wasted", "saved", "created", "bought"], "The contrast with 'precious' shows water is wasted."),
      m("Blank (2)", ["make", "do", "take", "give"], "The fixed expression is 'make a difference'."),
      m("Blank (3)", ["delivers", "removes", "blocks", "hides"], "Drip irrigation delivers water to the roots."),
      m("Blank (4)", ["conserve", "consume", "pollute", "waste"], "Conserving water protects it for the future."),
    ]),
    set("Read the passage and fill in the numbered blanks.\nRegular exercise is good for both the body and the mind. It (1) ____ the heart, improves sleep and helps control weight. Exercise also releases chemicals in the brain that make us feel (2) ____. You do not need an expensive gym; a brisk walk of thirty minutes a day is (3) ____ for most people. The key is to be (4) ____ and make exercise a part of your daily routine.", [
      m("Blank (1)", ["strengthens", "weakens", "stops", "slows"], "Exercise strengthens the heart."),
      m("Blank (2)", ["happier", "sadder", "tired", "angry"], "Exercise releases mood-lifting chemicals."),
      m("Blank (3)", ["enough", "useless", "harmful", "dangerous"], "A daily brisk walk is sufficient for most people."),
      m("Blank (4)", ["consistent", "careless", "occasional", "lazy"], "Regularity matters most."),
    ]),
    set("Read the passage and fill in the numbered blanks.\nThe invention of the telephone (1) ____ communication forever. Before it, people sent letters that took days or weeks to (2) ____. With the telephone, they could speak to each other (3) ____, even across long distances. Today, mobile phones have taken this idea (4) ____, letting us talk, write and share pictures from almost anywhere.", [
      m("Blank (1)", ["changed", "charged", "chained", "chose"], "The telephone changed communication."),
      m("Blank (2)", ["arrive", "depart", "write", "open"], "Letters took days to arrive."),
      m("Blank (3)", ["instantly", "slowly", "rarely", "silently"], "The contrast with letters suggests instant speech."),
      m("Blank (4)", ["further", "backward", "lower", "nowhere"], "Mobile phones extended the idea further."),
    ]),
  ],

  comprehension: [
    set(
      "Read the passage and answer the questions.\nHoney bees are vital to agriculture. As they collect nectar, they carry pollen from flower to flower, which allows many crops to produce fruit and seeds. It is estimated that about one-third of the food we eat depends on pollinators such as bees. In recent decades, however, bee populations in many regions have declined. Scientists point to several causes: the loss of wildflower habitats, the use of certain pesticides, diseases and parasites, and changing weather patterns. To help bees, farmers are being encouraged to plant strips of wildflowers, reduce harmful sprays and keep hedgerows. Even city residents can help by growing flowering plants on balconies and in gardens.",
      [
        m("Why are bees important to agriculture, according to the passage?", ["They carry pollen that helps crops produce fruit and seeds", "They eat harmful insects", "They produce fertiliser", "They keep weeds away"], "The passage says bees carry pollen between flowers."),
        m("Which of these is NOT given as a cause of bee decline?", ["Too many beekeepers", "Loss of wildflower habitats", "Use of certain pesticides", "Changing weather patterns"], "The passage does not mention beekeepers as a cause."),
        m2("What can city residents do, according to the passage?", ["Grow flowering plants on balconies and in gardens", "Keep beehives in apartments", "Spray pesticides less on farms", "Plant hedgerows on highways"], "The last sentence describes what residents can do."),
        m2("The word 'vital' in the first sentence most nearly means:", ["Essential", "Dangerous", "Optional", "Small"], "Vital means absolutely necessary."),
      ],
    ),
    set(
      "Read the passage and answer the questions.\nMany people believe that multitasking makes them more productive. Research suggests otherwise. When we switch between tasks, the brain needs time to refocus, and these small delays add up. Studies have found that people who frequently multitask make more errors and take longer to finish work than those who focus on one task at a time. Switching also increases stress, because the mind never fully settles. Experts recommend grouping similar tasks together, turning off unnecessary notifications and setting aside blocks of time for deep work.",
      [
        m("What is the main idea of the passage?", ["Multitasking usually reduces productivity", "Multitasking always saves time", "Notifications are always useful", "Stress improves focus"], "The passage argues that multitasking makes work slower and less accurate."),
        m("According to the passage, why does task switching slow us down?", ["The brain needs time to refocus each time", "Computers become slower", "People forget their passwords", "Tasks become more difficult"], "The second and third sentences explain this."),
        m2("Which advice is given by experts?", ["Group similar tasks and turn off unnecessary notifications", "Do as many tasks as possible at once", "Work only at night", "Avoid deep work"], "The final sentence lists the recommendations."),
        m2("The tone of the passage is best described as:", ["Informative", "Angry", "Humorous", "Sarcastic"], "It presents research findings and advice calmly."),
      ],
    ),
  ],

  "one-word-substitutes": [
    m("One who is all-powerful:", ["Omnipotent", "Omniscient", "Omnipresent", "Omnivorous"], "Omnipotent = having unlimited power."),
    m("A person who walks on foot:", ["Pedestrian", "Pedagogue", "Peddler", "Pilgrim"], "A pedestrian is a walker."),
    m("A place where birds are kept:", ["Aviary", "Apiary", "Aquarium", "Granary"], "An aviary houses birds; an apiary houses bees."),
    m("A person who lives alone and avoids others:", ["Recluse", "Extrovert", "Celebrity", "Tourist"], "A recluse lives in seclusion."),
    m("Fear of closed spaces:", ["Claustrophobia", "Agoraphobia", "Acrophobia", "Hydrophobia"], "Agoraphobia is fear of open or crowded spaces."),
    m("The killing of one's own brother:", ["Fratricide", "Patricide", "Homicide", "Regicide"], "Patricide is killing one's father; regicide a king."),
    m("A word that is opposite in meaning to another:", ["Antonym", "Synonym", "Homonym", "Acronym"], "A synonym has the same meaning."),
    m("Handwriting that cannot be read:", ["Illegible", "Eligible", "Legible", "Invisible"], "Illegible means not readable."),
    m2("A person who collects stamps:", ["Philatelist", "Numismatist", "Philanthropist", "Archivist"], "A numismatist collects coins."),
    m2("A person who is new to a profession:", ["Novice", "Veteran", "Expert", "Master"], "A novice is a beginner."),
    m2("A disease that spreads by contact:", ["Contagious", "Hereditary", "Chronic", "Fatal"], "Contagious diseases spread from person to person."),
    m2("A period of ten years:", ["Decade", "Century", "Millennium", "Score"], "A score is twenty."),
    m3("A person who hates women:", ["Misogynist", "Misanthrope", "Philogynist", "Feminist"], "A misanthrope dislikes humankind in general."),
  ],

  "idioms-and-phrases": [
    idiom("To spill the beans", ["To reveal a secret", "To waste food", "To cook badly", "To work hard"], "It means telling something that was meant to be secret."),
    idiom("Under the weather", ["Feeling unwell", "Outdoors in the rain", "Very happy", "Very busy"], "It means slightly ill."),
    idiom("To keep one's fingers crossed", ["To hope for good luck", "To lie", "To keep quiet", "To be angry"], "People cross fingers wishing for luck."),
    idiom("To turn a blind eye", ["To ignore something deliberately", "To become blind", "To look carefully", "To close one's eyes in sleep"], "It means pretending not to notice."),
    idiom("To be on cloud nine", ["To be extremely happy", "To be confused", "To be flying", "To be worried"], "It describes great happiness."),
    idiom("To pull someone's leg", ["To tease or joke with someone", "To hurt someone", "To help someone walk", "To argue"], "It is playful teasing."),
    m2("Choose the meaning of: 'To get cold feet'", ["To become nervous and back out", "To feel ill", "To walk in snow", "To be brave"], "It means losing courage before something."),
    m2("Choose the meaning of: 'To add fuel to the fire'", ["To make a bad situation worse", "To cook faster", "To solve a problem", "To save energy"], "It means aggravating a conflict."),
    m2("Choose the meaning of: 'To cry over spilt milk'", ["To regret something that cannot be changed", "To clean up a mess", "To waste food", "To feel hungry"], "It warns against useless regret."),
    m2("Choose the meaning of: 'Every cloud has a silver lining'", ["Something good can come from a bad situation", "Clouds bring rain", "Silver is valuable", "Every problem is permanent"], "It encourages optimism."),
    m3("Choose the meaning of: 'To throw in the towel'", ["To give up", "To start a fight", "To clean up", "To win"], "From boxing, where throwing in the towel ends the fight."),
    m3("Choose the meaning of: 'To take the bull by the horns'", ["To face a difficulty directly and boldly", "To run away", "To work on a farm", "To act cruelly"], "It means confronting a problem."),
  ],

  "change-of-voice": [
    cv("The workers are painting the walls.", "The walls are being painted by the workers.", ["The walls were being painted by the workers.", "The walls have been painted by the workers.", "The walls are painted by the workers."], "Present continuous → 'is/are being + past participle'."),
    cv("He has finished the work.", "The work has been finished by him.", ["The work had been finished by him.", "The work was finished by him.", "The work is being finished by him."], "Present perfect → 'has/have been + past participle'."),
    cv("The teacher will check the papers.", "The papers will be checked by the teacher.", ["The papers would be checked by the teacher.", "The papers are checked by the teacher.", "The papers will have checked by the teacher."], "Future → 'will be + past participle'."),
    cv("Who wrote this book?", "By whom was this book written?", ["Who was written this book?", "By whom this book was written?", "Whom was this book written?"], "Questions with 'who' become 'By whom …?'.", 2),
    cv("Close the door.", "Let the door be closed.", ["The door is closed.", "Let the door closed.", "The door should closed."], "Imperatives use 'Let … be + past participle'.", 2),
    cv("She was cooking dinner.", "Dinner was being cooked by her.", ["Dinner is being cooked by her.", "Dinner was cooked by her.", "Dinner had been cooked by her."], "Past continuous → 'was/were being + past participle'."),
    cv("Farmers grow rice in this region.", "Rice is grown in this region.", ["Rice was grown in this region.", "Rice is growing in this region.", "Rice has grown in this region."], "The agent 'people' is usually omitted."),
    ca("The match was won by our team.", "Our team won the match.", ["Our team wins the match.", "Our team has won the match.", "The match won our team."], "Past passive → simple past active."),
    ca("The thief had been caught by the police.", "The police had caught the thief.", ["The police caught the thief.", "The police have caught the thief.", "The thief had caught the police."], "Past perfect passive → past perfect active."),
    ca("A letter is being written by Ravi.", "Ravi is writing a letter.", ["Ravi writes a letter.", "Ravi was writing a letter.", "Ravi has written a letter."], "Present continuous passive → present continuous active."),
  ],

  "change-of-speech": [
    cs("She said, \"I will come tomorrow.\"", "She said that she would come the next day.", ["She said that she will come tomorrow.", "She said that I would come the next day.", "She told that she would come tomorrow."], "'Will' becomes 'would' and 'tomorrow' becomes 'the next day'."),
    cs("He said, \"I have finished my homework.\"", "He said that he had finished his homework.", ["He said that he has finished his homework.", "He said that I had finished my homework.", "He said that he finished his homework now."], "Present perfect becomes past perfect.", 1),
    cs("The teacher said to us, \"Sit down.\"", "The teacher told us to sit down.", ["The teacher said us to sit down.", "The teacher told us that sit down.", "The teacher asked that we sat down."], "Commands are reported with 'told/ordered + to + verb'."),
    cs("She said to him, \"Do you like music?\"", "She asked him if he liked music.", ["She asked him did he like music.", "She said him if he liked music.", "She asked him if he likes music."], "Yes/no questions are reported with 'if' or 'whether'."),
    cs("He said, \"The earth moves round the sun.\"", "He said that the earth moves round the sun.", ["He said that the earth moved round the sun.", "He said that the earth had moved round the sun.", "He told that the earth moves round the sun."], "Universal truths keep the present tense.", 3),
    cs("Ravi said, \"I am reading a book now.\"", "Ravi said that he was reading a book then.", ["Ravi said that he is reading a book now.", "Ravi said that I was reading a book then.", "Ravi said that he had read a book now."], "Present continuous → past continuous; 'now' → 'then'."),
    cs("She said, \"Please help me.\"", "She requested me to help her.", ["She said me to help her.", "She requested that help her.", "She asked to help me."], "Requests use 'requested + object + to + verb'.", 2),
    cs("He said, \"What a beautiful day!\"", "He exclaimed that it was a beautiful day.", ["He said what a beautiful day it is.", "He asked that it was a beautiful day.", "He exclaimed what a beautiful day was."], "Exclamations are reported with 'exclaimed that'.", 3),
    cs("They said, \"We went to Goa last year.\"", "They said that they had gone to Goa the previous year.", ["They said that they went to Goa last year.", "They said that we had gone to Goa the previous year.", "They said that they have gone to Goa last year."], "Simple past → past perfect; 'last year' → 'the previous year'."),
  ],

  "verbal-analogies": [
    m("DOCTOR : HOSPITAL :: TEACHER : ?", ["School", "Book", "Student", "Blackboard"], "A doctor works in a hospital; a teacher works in a school."),
    m("EYE : SEE :: EAR : ?", ["Hear", "Smell", "Touch", "Taste"], "The eye's function is seeing; the ear's is hearing."),
    m("BIRD : NEST :: BEE : ?", ["Hive", "Den", "Burrow", "Stable"], "A bird lives in a nest; a bee lives in a hive."),
    m("WATER : THIRST :: FOOD : ?", ["Hunger", "Taste", "Cook", "Plate"], "Water relieves thirst; food relieves hunger."),
    m("HOT : COLD :: LIGHT : ?", ["Dark", "Bright", "Lamp", "Heavy"], "Hot and cold are opposites; light and dark are opposites."),
    m("PEN : WRITE :: KNIFE : ?", ["Cut", "Cook", "Sharp", "Steel"], "A pen is used to write; a knife is used to cut."),
    m("PAINTER : BRUSH :: WRITER : ?", ["Pen", "Paper", "Book", "Story"], "A painter's tool is a brush; a writer's tool is a pen."),
    m2("SEED : TREE :: EGG : ?", ["Bird", "Shell", "Nest", "Yolk"], "A seed grows into a tree; an egg hatches into a bird."),
    m2("KILOGRAM : WEIGHT :: KILOMETRE : ?", ["Distance", "Speed", "Time", "Area"], "A unit and the quantity it measures."),
    m2("AUTHOR : NOVEL :: ARCHITECT : ?", ["Building", "Brick", "Pen", "Engineer"], "Creator and creation."),
    m3("DROUGHT : RAIN :: FAMINE : ?", ["Food", "Water", "Money", "Heat"], "A drought is a lack of rain; a famine is a lack of food."),
    m3("CACOPHONY : SOUND :: CLUTTER : ?", ["Objects", "Silence", "Order", "Music"], "Cacophony is a jarring mix of sounds; clutter is an untidy mix of objects."),
  ],
};

export default extra;
