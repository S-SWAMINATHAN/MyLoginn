/** Verbal Ability, part 1: errors, vocabulary, spellings, sentence formation, ordering, correction, improvement. */
import type { RawQ } from "../../types";
import { m, m2, m3 } from "../build";

/** Spotting errors: three parts plus "No error"; `err` is the part index (0–2) or 3 for no error. */
const se = (parts: [string, string, string], err: 0 | 1 | 2 | 3, e: string, d: 1 | 2 | 3 = 2): RawQ => ({
  q: "Read the sentence and find the part that contains an error. If there is no error, choose 'No error'.",
  o: [`(A) ${parts[0]}`, `(B) ${parts[1]}`, `(C) ${parts[2]}`, "(D) No error"], a: err, e, d,
});

export const spottingErrors: RawQ[] = [
  se(["Each of the students", "have submitted", "their assignment on time."], 1, "'Each' is singular, so the verb must be singular: 'Each of the students **has** submitted …'."),
  se(["She is one of those girls", "who has always", "topped the class."], 1, "The relative pronoun 'who' refers to 'girls' (plural), so the verb should be plural: '… who **have** always topped the class'.", 3),
  se(["The news are", "too good", "to be true."], 0, "'News' is an uncountable noun that takes a singular verb: 'The news **is** too good to be true'."),
  se(["Neither the manager", "nor his assistants", "was present at the meeting."], 2, "With 'neither … nor', the verb agrees with the nearer subject, 'assistants' (plural): '**were** present'."),
  se(["I have been living", "in this city", "since five years."], 2, "'Since' is used with a point of time; for a period use 'for': '… **for** five years'."),
  se(["He did not", "know where", "was his phone."], 2, "In an indirect question the word order is subject + verb: '… where **his phone was**'."),
  se(["The furniture", "in the new office", "are very modern."], 2, "'Furniture' is uncountable and takes a singular verb: 'is very modern'."),
  se(["Hardly had I reached", "the station", "than the train left."], 2, "'Hardly' is followed by 'when', not 'than': 'Hardly had I reached the station **when** the train left'.", 3),
  se(["She prefers coffee", "than tea", "in the morning."], 1, "'Prefer' takes 'to', not 'than': 'She prefers coffee **to** tea'."),
  se(["The team", "has won", "the championship."], 3, "The sentence is correct: 'team' as a single unit takes a singular verb.", 1),
  se(["One should", "do his duty", "sincerely."], 1, "'One' should be followed by 'one's': 'One should do **one's** duty sincerely'."),
  se(["If I was you,", "I would accept", "the offer."], 0, "Imaginary conditions use the subjunctive 'were': '**If I were you**, …'."),
  se(["The number of candidates", "who applied", "were very large."], 2, "The subject is 'the number', which is singular: '… **was** very large'."),
  se(["Despite of the rain,", "the match", "continued."], 0, "'Despite' is not followed by 'of': '**Despite the rain**' (or 'In spite of the rain')."),
  se(["He is senior", "than me", "by two years."], 1, "'Senior' takes 'to', not 'than': 'He is senior **to** me by two years'."),
  se(["Every one of the boys", "were given", "a prize."], 1, "'Every one' is singular: '… **was** given a prize'."),
];

export const antonyms: RawQ[] = [
  m("Choose the word opposite in meaning to: ENORMOUS", ["Tiny", "Soft", "Average", "Weak"], "Enormous means very large; its opposite is tiny."),
  m("Choose the word opposite in meaning to: COMMISSIONED", ["Terminated", "Started", "Launched", "Appointed"], "Commissioned means officially brought into service or appointed; terminated (officially ended) is the opposite. Started, launched and appointed are close to its meaning.", { d: 2 }),
  m("Choose the word opposite in meaning to: ARTIFICIAL", ["Natural", "Red", "Solid", "Truthful"], "Artificial means man-made; the opposite is natural."),
  m("Choose the word opposite in meaning to: EXPAND", ["Contract", "Convert", "Condense", "Congest"], "Expand means to grow larger; contract means to become smaller. (Condense is close but refers to making denser or shorter.)", { d: 2 }),
  m("Choose the word opposite in meaning to: ABUNDANCE", ["Scarcity", "Plenty", "Excess", "Wealth"], "Abundance is a large quantity; scarcity is a shortage."),
  m("Choose the word opposite in meaning to: OPTIMISTIC", ["Pessimistic", "Hopeful", "Cheerful", "Realistic"], "Optimistic means expecting the best; pessimistic means expecting the worst."),
  m("Choose the word opposite in meaning to: TRANSPARENT", ["Opaque", "Clear", "Glassy", "Bright"], "Transparent lets light through; opaque does not."),
  m2("Choose the word opposite in meaning to: FRUGAL", ["Extravagant", "Thrifty", "Careful", "Simple"], "Frugal means economical; extravagant means spending wastefully."),
  m2("Choose the word opposite in meaning to: CANDID", ["Evasive", "Frank", "Honest", "Direct"], "Candid means frank and open; evasive means avoiding direct answers."),
  m2("Choose the word opposite in meaning to: OBSCURE", ["Famous", "Hidden", "Vague", "Dark"], "Obscure (of a person) means not well known; the opposite is famous."),
  m2("Choose the word opposite in meaning to: DILIGENT", ["Lazy", "Careful", "Hard-working", "Intelligent"], "Diligent means hard-working; lazy is the opposite."),
  m3("Choose the word opposite in meaning to: EPHEMERAL", ["Permanent", "Brief", "Fragile", "Quick"], "Ephemeral means lasting a very short time; permanent means lasting for ever."),
  m3("Choose the word opposite in meaning to: AMELIORATE", ["Worsen", "Improve", "Ease", "Heal"], "Ameliorate means to make better; worsen is the opposite."),
  m2("Choose the word opposite in meaning to: HUMBLE", ["Arrogant", "Modest", "Polite", "Shy"], "Humble means modest; arrogant means having an exaggerated sense of one's importance."),
];

export const synonyms: RawQ[] = [
  m("Choose the word nearest in meaning to: BRIEF", ["Short", "Limited", "Small", "Little"], "Brief means of short duration or length."),
  m("Choose the word nearest in meaning to: CANDID", ["Frank", "Bright", "Shrewd", "Sweet"], "Candid means frank and honest."),
  m("Choose the word nearest in meaning to: ABANDON", ["Desert", "Keep", "Cherish", "Adopt"], "To abandon is to leave behind or desert."),
  m("Choose the word nearest in meaning to: VIVID", ["Bright", "Dull", "Pale", "Faint"], "Vivid means intensely bright or clear."),
  m("Choose the word nearest in meaning to: ADVERSITY", ["Hardship", "Fortune", "Comfort", "Success"], "Adversity means difficulty or misfortune."),
  m2("Choose the word nearest in meaning to: METICULOUS", ["Careful", "Careless", "Hasty", "Clumsy"], "Meticulous means showing great attention to detail."),
  m2("Choose the word nearest in meaning to: PRUDENT", ["Wise", "Rash", "Wasteful", "Proud"], "Prudent means acting with care and good judgement."),
  m2("Choose the word nearest in meaning to: OBSOLETE", ["Outdated", "Modern", "Rare", "Useful"], "Obsolete means no longer in use; outdated."),
  m2("Choose the word nearest in meaning to: LUCID", ["Clear", "Confused", "Lucky", "Dark"], "Lucid means expressed clearly and easy to understand."),
  m2("Choose the word nearest in meaning to: INNATE", ["Inborn", "Learned", "Acquired", "External"], "Innate means present from birth; inborn."),
  m3("Choose the word nearest in meaning to: UBIQUITOUS", ["Everywhere", "Unique", "Rare", "Hidden"], "Ubiquitous means present or found everywhere."),
  m3("Choose the word nearest in meaning to: PRAGMATIC", ["Practical", "Idealistic", "Dramatic", "Theoretical"], "Pragmatic means dealing with things sensibly and realistically."),
  m2("Choose the word nearest in meaning to: AUGMENT", ["Increase", "Reduce", "Argue", "Divide"], "Augment means to make greater; increase."),
  m3("Choose the word nearest in meaning to: SAGACIOUS", ["Wise", "Foolish", "Talkative", "Sad"], "Sagacious means having keen judgement; wise."),
];

const sw = (sentence: string, o: string[], e: string, d: 1 | 2 | 3 = 1): RawQ => m(`Pick the most appropriate word to fill the blank:\n${sentence}`, o, e, { d });
export const selectingWords: RawQ[] = [
  sw("She was so ____ that she finished the whole project in one night.", ["determined", "lazy", "confused", "careless"], "Finishing a whole project overnight requires determination."),
  sw("The doctor advised him to ____ from smoking.", ["abstain", "refrain off", "avoid of", "stop of"], "'Abstain from' is the correct verb + preposition combination."),
  sw("The meeting was ____ because the chief guest fell ill.", ["postponed", "preponed", "proceeded", "promoted"], "An event delayed to a later date is postponed."),
  sw("His explanation was so ____ that everyone understood it at once.", ["lucid", "vague", "obscure", "lengthy"], "Lucid means clear and easy to understand."),
  sw("The new policy had an adverse ____ on small businesses.", ["effect", "affect", "affection", "effort"], "'Effect' is the noun meaning result; 'affect' is usually a verb."),
  sw("We must ____ our resources carefully during the drought.", ["conserve", "converse", "consume", "conceive"], "To conserve is to protect from waste."),
  sw("The company's profits ____ by 20% last year.", ["rose", "raised", "arose", "risen"], "'Rise' (intransitive) is the right verb: profits rose. 'Raise' needs an object."),
  sw("She is ____ to criticism and takes it in her stride.", ["accustomed", "accustom", "custom", "accusing"], "'Accustomed to' means used to."),
  sw("The judge was known for being ____ — he never favoured either side.", ["impartial", "partial", "biased", "careless"], "Impartial means fair and not favouring any side.", 2),
  sw("Please ____ the form and submit it before Friday.", ["fill in", "fill up of", "fill with", "fill at"], "'Fill in (a form)' is the standard phrasal verb."),
  sw("The thief was caught ____.", ["red-handed", "red-faced", "redly", "red-hot"], "'Caught red-handed' means caught in the act.", 2),
  sw("Neither of the two answers ____ correct.", ["is", "are", "were", "have been"], "'Neither' is singular and takes 'is'.", 2),
];

export const spellings: RawQ[] = [
  m("Find the correctly spelt word.", ["Accommodation", "Acommodation", "Accomodation", "Acomodation"], "Accommodation has double 'c' and double 'm'."),
  m("Find the correctly spelt word.", ["Necessary", "Neccessary", "Necesary", "Neccesary"], "Necessary: one 'c', double 's'."),
  m("Find the correctly spelt word.", ["Embarrass", "Embarass", "Embaras", "Emmbarrass"], "Embarrass has double 'r' and double 's'."),
  m("Find the correctly spelt word.", ["Definitely", "Definately", "Defenitely", "Definitly"], "Definitely comes from 'definite' + 'ly'."),
  m("Find the correctly spelt word.", ["Occurrence", "Occurence", "Ocurrence", "Occurrance"], "Occurrence: double 'c', double 'r', ends in '-ence'."),
  m("Find the correctly spelt word.", ["Separate", "Seperate", "Separete", "Seprate"], "Separate has 'a' after 'p' (sep-A-rate)."),
  m("Find the correctly spelt word.", ["Millennium", "Millenium", "Milennium", "Milenium"], "Millennium has double 'l' and double 'n'."),
  m("Find the correctly spelt word.", ["Maintenance", "Maintainance", "Maintenence", "Mantainance"], "Maintenance — note 'ten', not 'tain'."),
  m2("Find the correctly spelt word.", ["Conscientious", "Concientious", "Conscientous", "Consciencious"], "Conscientious: con-sci-en-tious."),
  m2("Find the correctly spelt word.", ["Questionnaire", "Questionaire", "Questionnair", "Questionnare"], "Questionnaire has double 'n' and ends in '-aire'."),
  m2("Find the correctly spelt word.", ["Bureaucracy", "Beaurocracy", "Bureacracy", "Bureaucrasy"], "Bureaucracy: bureau + cracy."),
  m2("Find the misspelt word.", ["Recieve", "Believe", "Achieve", "Deceive"], "'I before e except after c': the correct spelling is 'receive'."),
];

export const sentenceFormation: RawQ[] = [
  m("Which of the following sentences is grammatically correct?", ["He has been working here since 2019.", "He is working here since 2019.", "He has been working here from 2019.", "He works here since 2019."], "A period starting at a point in the past and continuing now takes the present perfect continuous with 'since'."),
  m("Which sentence is correct?", ["The scissors are on the table.", "The scissors is on the table.", "The scissor are on the table.", "A scissors is on the table."], "'Scissors' is a plural noun and takes a plural verb."),
  m("Which sentence is correct?", ["I look forward to meeting you.", "I look forward to meet you.", "I am looking forward to meet you.", "I look forward meeting you."], "In 'look forward to', 'to' is a preposition, so it is followed by the -ing form."),
  m("Which sentence is correct?", ["She is better than any other student in the class.", "She is better than any student in the class.", "She is best than any other student in the class.", "She is more better than any other student in the class."], "When comparing a person with others in the same group, use 'any other'."),
  m2("Which sentence is correct?", ["Had I known, I would have helped you.", "If I would have known, I would have helped you.", "Had I knew, I would have helped you.", "If I knew, I would have helped you."], "Third conditional: 'Had I known (= If I had known), I would have helped'."),
  m2("Which sentence is correct?", ["The data shows a clear trend.", "The datas show a clear trend.", "The data showing a clear trend.", "The data shown a clear trend."], "'Data' is commonly used as an uncountable noun with a singular verb in modern usage; 'datas' is never correct."),
  m2("Which sentence is correct?", ["No sooner had he left than it started raining.", "No sooner had he left when it started raining.", "No sooner he had left than it started raining.", "No sooner did he left than it started raining."], "'No sooner' takes inverted word order and is followed by 'than'."),
  m("Which sentence is correct?", ["Each boy and each girl was given a book.", "Each boy and each girl were given a book.", "Each boys and girls was given a book.", "Each of boy and girl were given a book."], "When two singular subjects are each preceded by 'each', the verb is singular."),
  m2("Which sentence is correct?", ["He insisted on paying the bill.", "He insisted to pay the bill.", "He insisted for paying the bill.", "He insisted in paying the bill."], "'Insist' takes the preposition 'on' followed by the -ing form."),
  m2("Which sentence is correct?", ["Neither of them has finished the work.", "Neither of them have finished the work.", "Neither of them are finished the work.", "Neither of them had finish the work."], "'Neither of' takes a singular verb in formal English."),
];

/** Jumbled parts P, Q, R, S → correct order. */
const ow = (start: string, parts: Record<"P" | "Q" | "R" | "S", string>, right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 2): RawQ =>
  m(`Rearrange the parts to form a meaningful sentence:\n${start}\nP: ${parts.P}\nQ: ${parts.Q}\nR: ${parts.R}\nS: ${parts.S}`, [right, ...wrong], e, { d });
export const orderingOfWords: RawQ[] = [
  ow("The manager", { P: "the new project", Q: "to the team", R: "explained", S: "in detail" }, "RPQS", ["PRQS", "RQPS", "QRPS"], "The manager **explained (R) the new project (P) to the team (Q) in detail (S)**."),
  ow("Many students", { P: "the examination", Q: "for", R: "hard", S: "worked" }, "SRQP", ["RSQP", "SQRP", "SRPQ"], "Many students **worked (S) hard (R) for (Q) the examination (P)**."),
  ow("If you", { P: "you will", Q: "regularly", R: "practise", S: "surely improve" }, "RQPS", ["QRPS", "RPQS", "PSRQ"], "If you **practise (R) regularly (Q), you will (P) surely improve (S)**."),
  ow("The old man", { P: "a stick", Q: "walked slowly", R: "with the help of", S: "to the market" }, "QSRP", ["QRPS", "SQRP", "RPQS"], "The old man **walked slowly (Q) to the market (S) with the help of (R) a stick (P)**."),
  ow("Before leaving", { P: "she checked", Q: "were locked", R: "that all the doors", S: "the house" }, "SPRQ", ["PSRQ", "SRPQ", "PRSQ"], "Before leaving **the house (S), she checked (P) that all the doors (R) were locked (Q)**."),
  ow("The government", { P: "to reduce", Q: "has launched", R: "a scheme", S: "air pollution" }, "QRPS", ["RQPS", "QPRS", "PSQR"], "The government **has launched (Q) a scheme (R) to reduce (P) air pollution (S)**."),
  ow("Although it was", { P: "they continued", Q: "raining heavily", R: "the match", S: "to play" }, "QPSR", ["PQSR", "QSPR", "QPRS"], "Although it was **raining heavily (Q), they continued (P) to play (S) the match (R)**."),
  ow("The software", { P: "was released", Q: "after", R: "several bugs", S: "fixing" }, "PQSR", ["QSRP", "PSQR", "PQRS"], "The software **was released (P) after (Q) fixing (S) several bugs (R)**."),
];

/** Correct the bold part; last option is always "No correction required". */
const sc = (sentence: string, o: string[], ans: number, e: string, d: 1 | 2 | 3 = 2): RawQ => ({ q: `Choose the correct replacement for the part in bold. If no change is needed, choose "No correction required".\n${sentence}`, o: [...o, "No correction required"], a: ans, e, d });
export const sentenceCorrection: RawQ[] = [
  sc("He **did not knew** the answer.", ["did not know", "do not knew", "had not knew"], 0, "After the auxiliary 'did', the base form of the verb is used: 'did not know'."),
  sc("She **is working** in this company for ten years.", ["has been working", "was working", "had worked"], 0, "An action continuing from the past to now uses the present perfect continuous with 'for'."),
  sc("The children **was playing** in the garden.", ["were playing", "is playing", "has playing"], 0, "'Children' is plural: 'were playing'."),
  sc("We **discussed about** the problem for an hour.", ["discussed", "discussed on", "discussed over"], 0, "'Discuss' is transitive; it takes a direct object without 'about'."),
  sc("He **returned back** from Delhi yesterday.", ["returned", "came back again", "returned again back"], 0, "'Return' already means 'come back', so 'back' is redundant."),
  sc("Please **reply to** my email as soon as possible.", ["reply", "reply back to", "replies to"], 3, "'Reply to my email' is correct; no change is needed.", 1),
  sc("I **am knowing** her for a long time.", ["have known", "knew", "am known"], 0, "'Know' is a stative verb, not used in continuous tenses: 'I have known her for a long time'."),
  sc("**Being a rainy day**, we stayed indoors.", ["It being a rainy day", "Since being a rainy day", "Because being rainy day"], 0, "The participle must have a subject: 'It being a rainy day' (or 'As it was a rainy day')."),
  sc("The committee **have** taken its decision.", ["has", "are", "were"], 0, "Since the committee acts as a single unit ('its decision'), the verb is singular: 'has'."),
  sc("He is **more taller** than his brother.", ["taller", "most tallest", "more tall"], 0, "'Taller' is already comparative; 'more' is redundant."),
  sc("I **wish I was** there to help you.", ["wish I were", "wish I am", "wish I will be"], 0, "After 'wish' for an unreal present situation, use 'were'.", 3),
  sc("The price of vegetables **have gone up**.", ["has gone up", "are gone up", "were gone up"], 0, "The subject is 'price' (singular): 'has gone up'."),
];

export const sentenceImprovement: RawQ[] = [
  sc("He **has went** to the market.", ["has gone", "had went", "is went"], 0, "The past participle of 'go' is 'gone'."),
  sc("She **told that** she would come.", ["said that", "told to me that", "spoke that"], 0, "'Told' needs an object (told me that); without one, use 'said that'."),
  sc("We **have been knowing** him for years.", ["have known", "knew", "know"], 0, "'Know' is not used in the continuous form: 'have known'."),
  sc("**Hardly I had** reached home when it began to rain.", ["Hardly had I", "Hardly I have", "Hard had I"], 0, "With 'hardly' at the start, invert the subject and auxiliary: 'Hardly had I reached …'.", 3),
  sc("The book is **lying on** the table since morning.", ["has been lying on", "was lying in", "lay on"], 0, "With 'since morning', use the present perfect continuous: 'has been lying'."),
  sc("He walked **as fast as he can**.", ["as fast as he could", "as faster as he can", "so fast as he can"], 0, "The verb in the comparison should match the past tense of 'walked': 'could'."),
  sc("I **prefer to read** than to watch television.", ["prefer reading to watching", "prefer read than watch", "prefer to reading than watching"], 0, "Use 'prefer + -ing … to + -ing' (or 'would rather read than watch')."),
  sc("The teacher **gave us** a lot of homework.", ["gave to us", "given us", "has give us"], 3, "'The teacher gave us a lot of homework' is correct.", 1),
  sc("Unless you **do not work** hard, you will fail.", ["work", "will not work", "did not work"], 0, "'Unless' already means 'if not'; adding 'not' makes it a double negative."),
  sc("He **is suffering from fever** since Monday.", ["has been suffering from fever", "suffered with fever", "is suffering by fever"], 0, "A state continuing since Monday takes the present perfect continuous."),
];
