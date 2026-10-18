/** More Logical Reasoning questions, in the same formats as reasoning/lr-written.ts. */
import type { RawQ } from "../../types";
import { m, m2, m3, set } from "../build";
import { ACTION, ARGUMENT, ASSUMPTION, CAUSE, CONCLUSION } from "../reasoning/lr-written";
import type { ExtraSubject } from "./merge";

type D = 1 | 2 | 3;
const F = { only1: 0, only2: 1, either: 2, neither: 3, both: 4 } as const;
type Five = keyof typeof F;
const five = (opts: string[]) => (q: string, ans: Five, e: string, d: D = 2): RawQ => ({ q, o: opts, a: F[ans], e, d });
const assume = five(ASSUMPTION), conclude = five(CONCLUSION), act = five(ACTION), argue = five(ARGUMENT);
const cause = (i: string, ii: string, ans: number, e: string, d: D = 2): RawQ => ({ q: `I. ${i}\nII. ${ii}`, o: CAUSE, a: ans, e, d });
const odd = (o: string[], a: number, e: string, d: D = 1) => m("Choose the word which is different from the rest.", o, e, { a, d });
const ESS = "Choose the word that names a necessary part of the word in capitals.";
const ess = (w: string, o: string[], e: string, d: D = 1) => m(`${ESS}\n${w}`, o, e, { d });
const TFU = ["true", "false", "uncertain"];
const vr = (s: string, ans: 0 | 1 | 2, e: string, d: D = 1): RawQ => ({ q: `${s}\nIf the first two statements are true, the third statement is`, o: TFU, a: ans, e, d });

const extra: ExtraSubject = {
  "verbal-classification": [
    odd(["Carrot", "Potato", "Radish", "Tomato"], 3, "Carrot, potato and radish grow underground; the tomato grows above ground (and is botanically a fruit)."),
    odd(["Eagle", "Sparrow", "Penguin", "Pigeon"], 2, "Eagle, sparrow and pigeon can fly; the penguin cannot."),
    odd(["Square", "Circle", "Rectangle", "Triangle"], 1, "Square, rectangle and triangle are polygons with straight sides; a circle has none."),
    odd(["Mumbai", "Paris", "Tokyo", "Delhi"], 0, "Paris, Tokyo and Delhi are national capitals; Mumbai is not.", 2),
    odd(["Rupee", "Dollar", "Yen", "Kilogram"], 3, "Rupee, dollar and yen are currencies; kilogram is a unit of mass."),
    odd(["Wheat", "Rice", "Maize", "Mustard"], 3, "Wheat, rice and maize are cereals; mustard is an oilseed.", 2),
    odd(["Violin", "Flute", "Trumpet", "Clarinet"], 0, "Flute, trumpet and clarinet are wind instruments; the violin is a string instrument."),
    odd(["Hockey", "Football", "Chess", "Basketball"], 2, "Hockey, football and basketball are outdoor/field team sports; chess is a board game played by two players."),
    odd(["Saturn", "Jupiter", "Sun", "Mars"], 2, "Saturn, Jupiter and Mars are planets; the Sun is a star."),
    odd(["Kidney", "Liver", "Heart", "Femur"], 3, "Kidney, liver and heart are organs; the femur is a bone.", 2),
    odd(["Cheetah", "Tiger", "Leopard", "Wolf"], 3, "Cheetah, tiger and leopard belong to the cat family; the wolf belongs to the dog family.", 2),
    odd(["Inch", "Foot", "Yard", "Litre"], 3, "Inch, foot and yard measure length; litre measures volume."),
  ],

  "essential-part": [
    ess("LIBRARY", ["books", "computers", "librarian's desk", "air conditioner"], "A library is a collection of books (or documents); the other items are optional."),
    ess("BICYCLE", ["wheels", "bell", "basket", "gears"], "A bicycle cannot work without wheels; bells, baskets and gears are optional."),
    ess("SCHOOL", ["students", "uniform", "playground", "canteen"], "A school exists to teach students; the rest are common but not essential."),
    ess("DIALOGUE", ["words", "telephone", "agreement", "audience"], "A dialogue is a conversation, which needs words; it need not reach agreement or have an audience."),
    ess("SHOE", ["sole", "laces", "heel", "leather"], "Every shoe has a sole; many shoes have no laces, heels or leather.", 2),
    ess("CONTEST", ["opponent", "prize", "referee", "audience"], "A contest requires someone to compete against; prizes, referees and audiences are optional.", 2),
    ess("SONG", ["melody", "guitar", "chorus", "stage"], "A song needs a melody; instruments, a chorus or a stage are not essential.", 2),
    ess("FOREST", ["trees", "tigers", "rivers", "hunters"], "A forest is a large area covered with trees.", 1),
    ess("JOURNEY", ["travel", "car", "suitcase", "map"], "A journey is the act of travelling; vehicles, luggage and maps are optional."),
    ess("CHAIR", ["seat", "cushion", "armrest", "wheels"], "A chair must have a seat; cushions, armrests and wheels are optional."),
    m3(`${ESS}\nGOVERNMENT`, ["authority", "parliament", "president", "elections"], "Every government exercises authority; not all have a parliament, a president or elections."),
  ],

  analogies: [
    m("PEN is to INK as CAR is to", ["fuel", "road", "driver", "wheel"], "A pen runs on ink; a car runs on fuel."),
    m("TEACHER is to STUDENT as DOCTOR is to", ["patient", "hospital", "nurse", "medicine"], "A teacher serves students; a doctor serves patients."),
    m("FISH is to SCHOOL as WOLF is to", ["pack", "herd", "flock", "den"], "A group of fish is a school; a group of wolves is a pack."),
    m("SCALE is to WEIGHT as CLOCK is to", ["time", "hour", "wall", "alarm"], "A scale measures weight; a clock measures time."),
    m("GLOVE is to HAND as SOCK is to", ["foot", "shoe", "leg", "wool"], "A glove covers the hand; a sock covers the foot."),
    m("BAKER is to BREAD as POTTER is to", ["pot", "clay", "wheel", "kiln"], "A baker makes bread; a potter makes pots."),
    m2("LETHARGIC is to ENERGY as IGNORANT is to", ["knowledge", "school", "stupid", "teacher"], "A lethargic person lacks energy; an ignorant person lacks knowledge."),
    m2("MINUTE is to HOUR as CENTIMETRE is to", ["metre", "kilometre", "millimetre", "length"], "100 centimetres make a metre, as 60 minutes make an hour (part to whole)."),
    m2("CHAPTER is to BOOK as SCENE is to", ["play", "actor", "stage", "audience"], "A chapter is part of a book; a scene is part of a play."),
    m2("DRIZZLE is to DOWNPOUR as BREEZE is to", ["gale", "wind", "rain", "calm"], "Drizzle is light rain and a downpour heavy rain; a breeze is a light wind and a gale a strong one."),
    m3("PARCHED is to WATER as STARVED is to", ["food", "thirst", "desert", "hunger"], "Parched means lacking water; starved means lacking food."),
  ],

  "artificial-language": [
    m2("In a code, 'lo mi' means 'green leaf' and 'mi ka' means 'leaf fall'. Which word means 'green'?", ["lo", "mi", "ka", "Cannot be determined"], "mi = leaf (common to both), so lo = green.", { a: 0 }),
    m2("'tara nul' means 'fresh milk', 'nul seko' means 'milk shop' and 'seko pim' means 'shop open'. What is the code for 'open'?", ["pim", "seko", "nul", "tara"], "nul = milk, seko = shop, so pim = open."),
    m2("'fen dor' means 'hot tea', 'dor mak' means 'tea cup' and 'mak lis' means 'cup holder'. What is 'hot holder'?", ["fen lis", "dor lis", "fen mak", "lis dor"], "dor = tea and mak = cup, so fen = hot and lis = holder."),
    m2("'gari bon' means 'river bank', 'bon tul' means 'bank account' and 'tul pesa' means 'account number'. Which word means 'river'?", ["gari", "bon", "tul", "pesa"], "bon = bank (common to the first two), so gari = river."),
    m2("'ari som' means 'big house', 'som veli' means 'house key' and 'veli tor' means 'key ring'. What does 'tor' mean?", ["ring", "key", "house", "big"], "som = house and veli = key, so tor = ring."),
    m3("In a code, 'ko pa ri' means 'cats drink milk', 'ri lo ko' means 'milk and cats' and 'pa nu' means 'drink water'. What is the code for 'and'?", ["lo", "ko", "ri", "nu"], "'ko ri' = 'cats milk' (common to sentences 1 and 2). From 1, pa = drink (confirmed by 3). In sentence 2 the remaining word lo = and."),
    m3("'sel ka tu' means 'sun is bright', 'tu mon sel' means 'bright and sun' and 'ka dri' means 'is hot'. Which word means 'hot'?", ["dri", "ka", "tu", "sel"], "'sel tu' = 'sun bright', so ka = is. From 'ka dri', dri = hot."),
    m2("'pino ra' means 'blue pen', 'ra veta' means 'pen stand' and 'veta loki' means 'stand light'. What is 'blue light'?", ["pino loki", "ra loki", "pino veta", "loki ra"], "ra = pen and veta = stand, so pino = blue and loki = light."),
  ],

  "matching-definitions": [
    m2("IMPULSE BUYING is purchasing something on the spur of the moment without planning. Which is an example of impulse buying?", ["Seeing a sale banner, Anil buys an expensive watch he had not planned to buy.", "Rita buys groceries from her weekly shopping list.", "Sam compares prices online for a month before buying a laptop.", "Lata saves for a year to buy a scooter."], "Only Anil buys without planning, triggered by the moment."),
    m2("ALTRUISM is unselfish concern for the welfare of others. Which situation best shows altruism?", ["A passer-by stops to help an injured stranger and waits until the ambulance arrives.", "A salesman helps a customer to earn a commission.", "A student helps a friend in exchange for notes.", "A company donates only to gain tax benefits."], "The passer-by helps with no expected reward."),
    m2("A CONFLICT OF INTEREST arises when a person's personal interest could influence their professional decisions. Which is a conflict of interest?", ["A judge hears a case in which her brother's company is a party.", "A teacher marks papers using a fixed key.", "A manager hires the best-qualified candidate.", "An auditor checks accounts of an unrelated firm."], "The judge's family interest could affect her decision."),
    m2("DELEGATION is assigning responsibility for a task to someone else while remaining accountable. Which is an example of delegation?", ["A project manager asks a team member to prepare the report and reviews it before submission.", "A manager does all the work himself.", "An employee resigns from a project.", "A manager ignores an unfinished task."], "The manager hands over the task but keeps accountability."),
    m2("PLAGIARISM is presenting someone else's work or ideas as one's own without giving credit. Which situation is NOT plagiarism?", ["A researcher quotes another study and cites it properly.", "A student submits a friend's essay under his own name.", "A blogger copies an article without credit.", "A designer passes off someone else's logo as original."], "Proper citation gives credit, so it is not plagiarism."),
    m2("PREVENTIVE MAINTENANCE is servicing equipment on a schedule before it breaks down. Which is an example?", ["A factory oils and inspects its machines every Saturday.", "A technician repairs a machine after it stops working.", "A company buys a new machine when the old one fails.", "A worker reports a broken machine."], "Scheduled servicing before failure is preventive."),
    m3("NEGLIGENCE is failure to take reasonable care, resulting in harm to someone. Which is the clearest example?", ["A shopkeeper leaves a wet floor unmarked, and a customer slips and is hurt.", "A customer trips over her own shoelace in a shop.", "A shop closes early on a holiday.", "A shopkeeper refuses to give a discount."], "The shopkeeper failed to take reasonable care, causing harm."),
    m2("A HYPOTHESIS is a proposed explanation that can be tested. Which is a hypothesis?", ["Plants grow faster when given more sunlight.", "Plants are beautiful.", "I like plants.", "Plants are sold in markets."], "It can be tested by an experiment."),
  ],

  "making-judgments": [
    m2("A student consistently scores well in class tests but poorly in final exams. What is the most reasonable first step for the teacher?", ["Talk to the student to understand whether exam stress or time management is the issue.", "Fail the student in the next test.", "Assume the student cheats in class tests.", "Ignore the problem."], "Understanding the cause comes before any action."),
    m2("A restaurant receives many online complaints about slow service on weekends only. What should the manager do?", ["Add staff or improve the process during weekend peak hours.", "Close the restaurant on weekends.", "Delete the negative reviews.", "Increase prices on weekdays."], "The problem is specific to weekend demand."),
    m2("A new medicine reduces symptoms in 70% of patients in a large trial with few side effects. What is a reasonable judgement?", ["It is likely to help many patients but will not work for everyone.", "It cures all patients.", "It is useless because it fails for 30%.", "It should be banned."], "A 70% response is a useful but not universal effect."),
    m2("An employee is late three times in a month after being punctual for two years. What is the most sensible response?", ["Ask the employee privately whether there is a problem.", "Dismiss the employee immediately.", "Announce the lateness to the whole office.", "Ignore it forever."], "A long good record suggests a temporary issue worth discussing."),
    m2("A city's air pollution rises sharply every winter. Which conclusion is most reasonable?", ["Winter conditions such as cold, still air and crop or fuel burning may trap and add pollutants.", "People drive only in winter.", "Pollution is impossible to reduce.", "Factories open only in winter."], "Seasonal weather and burning practices explain seasonal pollution."),
    m2("Sales of umbrellas in a shop rose in July. What is the most likely reason?", ["The monsoon season brought rain.", "The shop changed its owner.", "Umbrellas became fashionable for one month only.", "People bought umbrellas as gifts."], "July is monsoon season in much of India."),
    m3("A survey of 50 people at a gym shows that 90% exercise daily. Which judgement is most appropriate?", ["The result probably overstates how often the general public exercises.", "90% of all people exercise daily.", "Gyms are unnecessary.", "Nobody exercises outside gyms."], "A gym sample is biased towards people who exercise."),
    m2("A website loads slowly only for users in one country. What is the most likely cause?", ["A network or server issue affecting that region.", "The website's content is boring.", "Users in that country have older eyes.", "The website is closed."], "A region-specific problem suggests regional infrastructure."),
  ],

  "verbal-reasoning": [
    vr("All doctors in the hospital are graduates. Asha is a doctor in the hospital. Asha is a graduate.", 0, "Asha belongs to a group whose members are all graduates: **true**."),
    vr("Box A is heavier than box B. Box C is heavier than box A. Box B is heavier than box C.", 1, "C > A > B, so B cannot be heavier than C: **false**."),
    vr("Some students in the class play chess. Ravi is a student in the class. Ravi plays chess.", 2, "Only some students play chess, so we cannot tell about Ravi: **uncertain**."),
    vr("The red car is faster than the blue car. The green car is slower than the blue car. The red car is faster than the green car.", 0, "Red > Blue > Green: **true**."),
    vr("All roses in the garden are red. No red flowers in the garden are wilted. Some roses in the garden are wilted.", 1, "Roses are red, and no red flower is wilted, so no rose is wilted: **false**.", 2),
    vr("Tara is older than Meena. Sita is older than Meena. Tara is older than Sita.", 2, "Both are older than Meena, but their order relative to each other is unknown: **uncertain**.", 2),
    vr("Every member of the club owns a bicycle. Kiran does not own a bicycle. Kiran is a member of the club.", 1, "All members own bicycles; Kiran does not, so Kiran is not a member: **false**.", 2),
    vr("The museum opens before the library. The bank opens after the library. The museum opens before the bank.", 0, "Museum < Library < Bank in opening time: **true**."),
    vr("Pencils cost less than pens. Pens cost less than notebooks. Notebooks cost less than pencils.", 1, "Pencils < Pens < Notebooks, so notebooks cannot cost less than pencils: **false**."),
  ],

  "logical-games": [
    set("Five students — A, B, C, D and E — stand in a queue. B is first. E is immediately behind A. C is last. D is not second.", [
      m3("Who is second in the queue?", ["A", "D", "E", "C"], "B is 1st and C is 5th. D is not 2nd, so 2nd is A or E. E is immediately behind A, so A must be 2nd and E 3rd, leaving D 4th. Order: B, A, E, D, C."),
      m3("Who stands immediately in front of C?", ["D", "E", "A", "B"], "Order: B, A, E, D, C. D is in front of C."),
      m3("How many students are between B and D?", ["Two", "One", "Three", "None"], "B is 1st and D is 4th: A and E are between them."),
    ]),
    set("Four friends — Ajay, Bina, Chetan and Divya — each own one pet: a dog, a cat, a parrot and a fish. Ajay does not own a dog or a cat. Bina owns the parrot. Divya does not own the cat.", [
      m3("Which pet does Ajay own?", ["Fish", "Dog", "Cat", "Parrot"], "Bina has the parrot. Ajay owns neither dog nor cat, so Ajay owns the fish."),
      m3("Which pet does Divya own?", ["Dog", "Cat", "Fish", "Parrot"], "Remaining pets are dog and cat for Chetan and Divya. Divya does not own the cat, so Divya owns the dog and Chetan the cat."),
      m3("Who owns the cat?", ["Chetan", "Divya", "Ajay", "Bina"], "From the deductions, Chetan owns the cat."),
    ]),
    set("Six floors of a building (1 at the bottom, 6 at the top) are occupied by P, Q, R, S, T and U, one each. Q lives on floor 1. T lives directly above R. S lives on the top floor. U lives below R but above Q. P lives on floor 5.", [
      m3("Who lives on floor 4?", ["T", "R", "U", "P"], "Q = 1, P = 5, S = 6. U is above Q and below R, and T is directly above R. With floors 2, 3, 4 left: U = 2, R = 3, T = 4."),
      m3("Who lives directly below P?", ["T", "R", "S", "U"], "P is on floor 5 and T is on floor 4."),
      m3("On which floor does U live?", ["2", "3", "4", "1"], "U is on floor 2."),
    ]),
  ],

  "analyzing-arguments": [
    m3("'Students who use our coaching app score 20% higher, so the app improves scores.' Which statement most weakens this?", ["Students who choose the app are already the most motivated in their classes.", "The app has a good design.", "The app is free for the first month.", "Many apps exist."], "Self-selection by motivated students could explain the higher scores."),
    m3("A town banned plastic bags and littering fell by 30% next year. Which statement most strengthens the claim that the ban reduced littering?", ["Plastic bags made up most of the litter collected before the ban.", "The town also hired more street cleaners.", "Other towns did not ban plastic bags.", "Plastic bags are cheap."], "If bags were the main litter, removing them explains the drop."),
    m3("'Our new advertisement increased sales because sales rose after it was released.' This argument assumes that", ["no other factor, such as a festival season, caused the rise", "advertisements are always expensive", "sales never fall", "customers dislike advertisements"], "It ignores alternative causes."),
    m3("A manager argues: 'Remote work lowers productivity, since two employees performed worse after working from home.' The main flaw is that", ["the sample is too small to support a general conclusion", "remote work is popular", "the manager is experienced", "productivity cannot be measured"], "Two cases cannot justify a general claim."),
    m3("'Cities with more hospitals have more deaths, so hospitals cause deaths.' Which best explains the flaw?", ["Larger populations have both more hospitals and more deaths.", "Hospitals are expensive.", "Doctors work long hours.", "Some hospitals are private."], "A common cause — population size — explains both."),
    m3("A company says its battery lasts '2 days'. Which question is most important in evaluating this claim?", ["Under what usage conditions was the battery tested?", "What colour is the battery?", "Who designed the logo?", "How many offices does the company have?"], "Battery life depends heavily on usage."),
    m2("'Every swan I have seen is white, so all swans are white.' This argument is an example of", ["generalising from limited observation", "a valid deduction", "a mathematical proof", "an appeal to authority"], "Black swans exist; observation cannot prove a universal claim."),
    m3("Which of the following, if true, best supports the claim that reading to children improves their vocabulary?", ["A controlled study found children randomly assigned to daily reading learned more words than a similar group without it.", "Many parents enjoy reading.", "Books are cheaper online.", "Some children prefer cartoons."], "A randomised comparison supports a causal link."),
  ],

  "statement-and-assumption": [
    assume("Statement: \"Wear a helmet; it can save your life.\" — a road safety poster\nAssumptions:\nI. Helmets reduce the risk of serious injury.\nII. People care about their safety.", "both", "The advice assumes helmets work (I) and that people will respond to a safety message (II)."),
    assume("Statement: The government has decided to increase the number of seats in medical colleges.\nAssumptions:\nI. There is a need for more doctors.\nII. Enough students will apply for the new seats.", "both", "The decision assumes a shortage of doctors (I) and that the seats will be filled (II)."),
    assume("Statement: \"Book your tickets early to avoid disappointment.\"\nAssumptions:\nI. Tickets may sell out.\nII. All tickets are expensive.", "only1", "The advice assumes limited availability (I); price is not implied (II)."),
    assume("Statement: The school will hold extra classes for students who failed the test.\nAssumptions:\nI. Extra classes can help these students improve.\nII. All students will attend the extra classes.", "only1", "The plan assumes the classes are useful (I); it does not assume every student will attend (II)."),
    assume("Statement: \"Use the stairs; the lift is under repair.\" — a notice in an office\nAssumptions:\nI. People can use the stairs.\nII. The lift will never be repaired.", "only1", "The notice assumes the stairs are usable (I); 'under repair' implies it will be fixed, so II is not assumed."),
    assume("Statement: The company has advertised for software engineers with five years of experience.\nAssumptions:\nI. Experienced engineers will apply.\nII. Freshers are not capable of learning.", "only1", "Advertising assumes suitable people will respond (I); it says nothing about freshers' abilities (II)."),
    assume("Statement: A city plans to introduce electric buses to reduce air pollution.\nAssumptions:\nI. Buses contribute to air pollution in the city.\nII. Electric buses produce less local pollution than diesel buses.", "both", "The plan makes sense only if buses add to pollution (I) and electric buses pollute less (II)."),
    assume("Statement: \"Please keep your belongings safe.\" — an announcement at a railway station\nAssumptions:\nI. There may be thieves at the station.\nII. Passengers carry belongings.", "both", "The warning assumes a risk of theft (I) and that passengers have belongings (II)."),
  ],

  "course-of-action": [
    act("Statement: Many students in a school are falling sick after eating in the canteen.\nCourses of action:\nI. The canteen's food hygiene should be inspected immediately.\nII. The school should be closed permanently.", "only1", "Inspection addresses the problem; closing the school permanently is an over-reaction."),
    act("Statement: A major road is badly damaged after heavy rains.\nCourses of action:\nI. The authorities should repair the road as soon as possible.\nII. Traffic should be diverted to other roads until repairs are done.", "both", "Both are practical steps that address the problem."),
    act("Statement: The number of road accidents at a particular junction has increased.\nCourses of action:\nI. Traffic signals and speed breakers should be installed at the junction.\nII. All vehicles should be banned from the city.", "only1", "Signals address the junction; banning all vehicles is impractical."),
    act("Statement: A popular website crashed during a big sale due to heavy traffic.\nCourses of action:\nI. The company should increase its server capacity for future sales.\nII. The company should stop holding sales.", "only1", "Scaling capacity solves the problem; stopping sales is an over-reaction."),
    act("Statement: Several employees have complained about harassment by a supervisor.\nCourses of action:\nI. The company should conduct an impartial inquiry.\nII. The employees who complained should be transferred immediately.", "only1", "An inquiry addresses the complaint; transferring the complainants punishes the victims."),
    act("Statement: The water level in the city's reservoirs is unusually low before summer.\nCourses of action:\nI. Citizens should be urged to conserve water.\nII. Water supply could be rationed if needed.", "both", "Conservation and contingency rationing are both sensible responses."),
    act("Statement: A student repeatedly fails to submit homework on time.\nCourses of action:\nI. The teacher should talk to the student to understand the reason.\nII. The student should be expelled from school.", "only1", "Understanding the cause is proportionate; expulsion is excessive."),
    act("Statement: Fake news about a disease is spreading on social media.\nCourses of action:\nI. Health authorities should publish accurate information widely.\nII. All social media platforms should be shut down.", "only1", "Correct information addresses the problem; shutting down platforms is extreme."),
  ],

  "statement-and-conclusion": [
    conclude("Statement: All the students who scored above 90% were given scholarships. Rahul did not get a scholarship.\nConclusions:\nI. Rahul did not score above 90%.\nII. Rahul is not a good student.", "only1", "If above 90% ⇒ scholarship, no scholarship ⇒ not above 90% (I). Being a 'good student' is not defined (II)."),
    conclude("Statement: Some of the shops in the market are closed on Sundays.\nConclusions:\nI. All shops in the market are closed on Sundays.\nII. Some shops in the market are open on Sundays.", "neither", "'Some are closed' does not imply all are closed (I) and does not guarantee that any are open (II)."),
    conclude("Statement: The train is late because of heavy fog.\nConclusions:\nI. Fog affects train schedules.\nII. All trains are late today.", "only1", "The statement shows fog delayed this train (I); it says nothing about all trains (II)."),
    conclude("Statement: Regular exercise reduces the risk of heart disease.\nConclusions:\nI. People who exercise regularly will never get heart disease.\nII. Exercise is beneficial for heart health.", "only2", "Reducing risk does not eliminate it (I), but it does show a benefit (II)."),
    conclude("Statement: The government has made it compulsory for all new buildings to have rainwater harvesting systems.\nConclusions:\nI. The government wants to conserve water.\nII. Old buildings already have rainwater harvesting systems.", "only1", "The rule implies a water-conservation aim (I); nothing is said about old buildings (II)."),
    conclude("Statement: Only those with a valid ticket are allowed inside the stadium. Meera is inside the stadium.\nConclusions:\nI. Meera has a valid ticket.\nII. Meera bought her ticket online.", "only1", "Being inside implies a valid ticket (I); how she bought it is unknown (II)."),
    conclude("Statement: Prices of petrol have increased for the third time this month.\nConclusions:\nI. Petrol prices have changed several times this month.\nII. Petrol prices will rise again next month.", "only1", "Three increases confirm several changes (I); future prices cannot be inferred (II)."),
    conclude("Statement: Every employee of the firm must attend the safety training. Arun is an employee of the firm.\nConclusions:\nI. Arun must attend the safety training.\nII. The training is about fire safety.", "only1", "Arun must attend (I); the topic of training is not specified (II)."),
  ],

  "theme-detection": [
    m2("Choose the main theme.\n\"Learning a musical instrument trains more than the fingers. It improves memory, patience and the ability to focus for long periods. Children who learn music often carry these habits into their studies.\"", ["Learning music develops mental skills that help in other areas", "Music lessons are expensive", "Only children should learn music", "Musical instruments are hard to make"], "The passage focuses on wider mental benefits of learning music."),
    m2("Choose the main theme.\n\"Many accidents happen within a few kilometres of home, where drivers feel confident and relax their attention. Familiar roads can make us careless, which is exactly when danger appears.\"", ["Familiarity can make drivers careless and increase risk", "Long journeys are always safe", "Roads near homes are badly built", "Driving should be banned near homes"], "The theme is overconfidence on familiar roads."),
    m2("Choose the main theme.\n\"A good leader listens more than they speak. By understanding the team's concerns, a leader can make better decisions and earn trust that no order can command.\"", ["Listening is central to effective leadership", "Leaders should never speak", "Teams do not need leaders", "Orders are always obeyed"], "The passage highlights listening as the key leadership quality."),
    m2("Choose the main theme.\n\"Food waste is not just a moral issue; it also wastes the water, energy and labour used to grow and transport food. Reducing waste at home and in shops saves resources across the whole chain.\"", ["Reducing food waste conserves many resources besides food", "Food is too expensive", "Shops should close early", "Farmers waste most water"], "The passage links food waste to wasted resources."),
    m2("Choose the main theme.\n\"Sleep is often the first thing people give up when busy. Yet lack of sleep slows thinking, weakens immunity and increases mistakes, making people less productive, not more.\"", ["Giving up sleep to be productive is counter-productive", "Busy people sleep more", "Sleep causes illness", "Productivity does not depend on health"], "Cutting sleep harms the productivity it is meant to increase."),
    m3("Choose the main theme.\n\"Technology can widen inequality if only some people can afford devices and internet access. Public libraries, community centres and affordable data plans help ensure that the benefits of the digital age reach everyone.\"", ["Equal access to technology is needed to prevent widening inequality", "Libraries are no longer needed", "Technology always reduces inequality", "Data plans are too cheap"], "The passage argues for inclusive access to technology."),
    m2("Choose the main theme.\n\"Traditional crafts preserve skills passed down over generations. When young people move away and buyers prefer cheap factory goods, these crafts and the knowledge behind them risk being lost.\"", ["Traditional crafts are at risk of disappearing and need support", "Factory goods are better quality", "Young people dislike crafts", "Crafts are only for tourists"], "The passage is about the threat to traditional crafts."),
  ],

  "cause-and-effect": [
    cause("The factory released untreated waste into the river.", "Large numbers of fish were found dead downstream.", 0, "Untreated waste pollutes water and kills fish; I causes II."),
    cause("The central bank increased interest rates.", "Inflation had risen above the target level for several months.", 1, "Rising inflation (II) prompts the central bank to raise rates (I)."),
    cause("Sales of air conditioners rose sharply this month.", "Sales of cold drinks also increased this month.", 4, "Both are likely effects of a common cause, such as a heatwave."),
    cause("The school introduced a free lunch programme.", "Attendance in the school improved.", 0, "Free meals encourage children to attend; I causes II."),
    cause("The airline cancelled several flights.", "A cyclone was forecast to hit the coastal city.", 1, "The forecast cyclone (II) led to flight cancellations (I)."),
    cause("The price of onions has gone up.", "The price of gold has gone up.", 3, "These are independent effects of unrelated causes (crop supply and global markets).", 3),
    cause("Many employees of the company resigned this year.", "The company cut salaries and benefits last year.", 1, "Salary cuts (II) are a likely cause of resignations (I)."),
    cause("The government reduced tax on electric vehicles.", "The government increased funding for public charging stations.", 4, "Both are effects of a common cause: a policy to promote electric vehicles.", 3),
  ],

  "statement-and-argument": [
    argue("Should mobile phones be allowed in schools?\nArguments:\nI. Yes. They can be useful for emergencies and learning apps.\nII. No. Everyone uses phones.", "only1", "I gives a relevant benefit; II is irrelevant to whether schools should allow them."),
    argue("Should the use of plastic bottles be reduced?\nArguments:\nI. Yes. They cause long-lasting pollution in land and oceans.\nII. No. Plastic bottles are available in many colours.", "only1", "I is a strong environmental reason; II is trivial."),
    argue("Should public transport be made free?\nArguments:\nI. Yes. It would reduce traffic and pollution by encouraging people to leave cars at home.\nII. No. It would place a heavy financial burden on the government.", "both", "Both are relevant and important considerations."),
    argue("Should all students learn a second language?\nArguments:\nI. Yes. It improves communication and career opportunities.\nII. No. Some students find languages boring.", "only1", "I is a substantial benefit; II is a weak personal preference."),
    argue("Should working hours be reduced to 35 hours a week?\nArguments:\nI. Yes. Shorter hours can improve health and productivity.\nII. No. All companies would immediately shut down.", "only1", "I is a reasonable argument; II is an exaggeration."),
    argue("Should cities build more cycling lanes?\nArguments:\nI. Yes. They make cycling safer and reduce pollution.\nII. No. Cycling lanes would take away road space, increasing congestion for other vehicles.", "both", "Both raise relevant and important consequences."),
    argue("Should junk food advertisements be banned during children's TV programmes?\nArguments:\nI. Yes. They influence children to choose unhealthy food.\nII. No. Advertisements are colourful.", "only1", "I addresses health impact; II is irrelevant."),
    argue("Should voting be made compulsory?\nArguments:\nI. Yes. It would increase participation in democracy.\nII. No. Forcing people to vote may lead to careless choices.", "both", "Both arguments are relevant and significant."),
  ],

  "logical-deduction": [
    m2("All mammals breathe air. Whales are mammals. Which conclusion follows?", ["Whales breathe air.", "All animals that breathe air are whales.", "Whales live on land.", "Some mammals do not breathe air."], "A valid syllogism: whales are mammals, and all mammals breathe air."),
    m2("If the alarm rings, everyone leaves the building. Everyone left the building. Which is correct?", ["We cannot conclude that the alarm rang.", "The alarm definitely rang.", "The alarm did not ring.", "Nobody heard the alarm."], "People could leave for other reasons; affirming the consequent is a fallacy."),
    m2("Some engineers are artists. All artists are creative. Which conclusion follows?", ["Some engineers are creative.", "All engineers are creative.", "No engineer is creative.", "All creative people are engineers."], "The engineers who are artists must be creative."),
    m2("If Riya studies, she passes. If she passes, she gets a gift. Riya studied. What follows?", ["Riya gets a gift.", "Riya fails.", "Riya does not get a gift.", "Riya did not study."], "Chaining the conditionals: studies ⇒ passes ⇒ gift."),
    m2("Either Sam is in Delhi or he is in Mumbai. He is not in Delhi. Therefore,", ["he is in Mumbai", "he is in Delhi", "he is in neither city", "nothing can be concluded"], "With 'A or B' and not A, B must follow (disjunctive syllogism)."),
    m2("No cats are dogs. Some pets are cats. Which conclusion follows?", ["Some pets are not dogs.", "No pets are dogs.", "All pets are cats.", "Some dogs are cats."], "The pets that are cats cannot be dogs."),
    m2("If it is a holiday, the bank is closed. The bank is open. Therefore,", ["it is not a holiday", "it is a holiday", "the bank is always open", "no conclusion is possible"], "Modus tollens: not closed ⇒ not a holiday."),
    m3("All A are B. No B are C. Which statement must be true?", ["No A are C.", "All C are A.", "Some A are C.", "All B are A."], "Every A is a B, and no B is a C, so no A is a C."),
  ],
};

export default extra;
