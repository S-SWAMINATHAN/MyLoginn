/** Hand-written Verbal Reasoning questions (original content). */
import type { RawItem, RawQ } from "../../types";
import { m, m2, m3, set } from "../build";
import { CONCLUSION } from "./lr-written";

const F = { only1: 0, only2: 1, either: 2, neither: 3, both: 4 } as const;
const syl = (st: string, c1: string, c2: string, ans: keyof typeof F, e: string, d: 1 | 2 | 3 = 2): RawQ => ({ q: `Statements: ${st}\nConclusions:\nI. ${c1}\nII. ${c2}`, o: CONCLUSION, a: F[ans], e, d });
const DS = ["I alone is sufficient, but II alone is not", "II alone is sufficient, but I alone is not", "Either I or II alone is sufficient", "Neither I nor II is sufficient, even together", "Both I and II together are needed"];
const ds = (q: string, i: string, ii: string, ans: number, e: string, d: 1 | 2 | 3 = 2): RawQ => ({ q: `${q}\nI. ${i}\nII. ${ii}`, o: DS, a: ans, e, d });
/** Options are orderings written as digit sequences; the first is correct. */
const seq = (words: string[], right: string, wrong: string[], e: string, d: 1 | 2 | 3 = 1): RawQ =>
  m(`Arrange the words in a meaningful sequence:\n${words.map((w, i) => `${i + 1}. ${w}`).join("  ")}`, [right, ...wrong], e, { d });

// ───────────── Logical Sequence of Words ─────────────
export const sequenceOfWords: RawQ[] = [
  seq(["Key", "Door", "Lock", "Room", "Switch on"], "1, 3, 2, 4, 5", ["5, 1, 2, 4, 3", "4, 2, 1, 5, 3", "1, 2, 3, 5, 4"], "Take the key, open the lock, open the door, enter the room and switch on the light: 1, 3, 2, 4, 5."),
  seq(["Birth", "Death", "Funeral", "Marriage", "Education"], "1, 5, 4, 2, 3", ["1, 3, 4, 5, 2", "2, 3, 4, 5, 1", "1, 4, 5, 3, 2"], "Life events in order: birth, education, marriage, death, funeral."),
  seq(["Word", "Paragraph", "Sentence", "Letter", "Phrase"], "4, 1, 5, 3, 2", ["4, 1, 3, 5, 2", "4, 2, 5, 1, 3", "1, 4, 5, 3, 2"], "From smallest to largest unit: letter, word, phrase, sentence, paragraph."),
  seq(["Police", "Punishment", "Crime", "Judge", "Judgement"], "3, 1, 4, 5, 2", ["1, 2, 4, 3, 5", "3, 1, 2, 4, 5", "5, 4, 3, 2, 1"], "A crime is reported to the police, the case goes before a judge, the judgement is given, then punishment follows."),
  seq(["Rain", "Flood", "Cloud", "Evaporation"], "4, 3, 1, 2", ["3, 4, 1, 2", "4, 1, 3, 2", "1, 3, 4, 2"], "Water evaporates, clouds form, it rains, and heavy rain can cause a flood."),
  seq(["Testing", "Requirement", "Deployment", "Coding", "Design"], "2, 5, 4, 1, 3", ["2, 4, 5, 1, 3", "5, 2, 4, 3, 1", "2, 5, 1, 4, 3"], "Software development order: requirement, design, coding, testing, deployment.", 2),
  seq(["Infant", "Old", "Adult", "Adolescent", "Child"], "1, 5, 4, 3, 2", ["1, 4, 5, 3, 2", "5, 1, 4, 3, 2", "1, 5, 3, 4, 2"], "Stages of life: infant, child, adolescent, adult, old."),
  seq(["Ore", "Metal", "Mining", "Refining"], "3, 1, 4, 2", ["1, 3, 4, 2", "3, 4, 1, 2", "1, 2, 3, 4"], "Mining yields ore, which is refined into metal."),
  seq(["Application", "Interview", "Selection", "Advertisement", "Appointment"], "4, 1, 2, 3, 5", ["1, 4, 2, 3, 5", "4, 2, 1, 3, 5", "4, 1, 3, 2, 5"], "A job is advertised, candidates apply, are interviewed, selected and then appointed."),
  seq(["Kilometre", "Centimetre", "Millimetre", "Metre"], "3, 2, 4, 1", ["2, 3, 4, 1", "3, 4, 2, 1", "1, 4, 2, 3"], "Increasing length: millimetre, centimetre, metre, kilometre."),
  seq(["Sowing", "Harvesting", "Ploughing", "Irrigation", "Selling"], "3, 1, 4, 2, 5", ["1, 3, 4, 2, 5", "3, 4, 1, 2, 5", "3, 1, 2, 4, 5"], "Farming sequence: plough the field, sow seeds, irrigate, harvest, and sell."),
  seq(["Bud", "Fruit", "Flower", "Seed", "Plant"], "4, 5, 1, 3, 2", ["4, 1, 5, 3, 2", "5, 4, 1, 3, 2", "4, 5, 3, 1, 2"], "A seed grows into a plant, which forms a bud, then a flower, then a fruit."),
];

// ───────────── Blood Relation Test ─────────────
export const bloodRelations: RawQ[] = [
  m("Pointing to a photograph, Arun said, \"She is the daughter of my grandfather's only son.\" How is the girl related to Arun?", ["Sister", "Cousin", "Mother", "Aunt"], "Arun's grandfather's only son is Arun's father. The father's daughter is Arun's sister."),
  m("A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", ["Granddaughter", "Daughter", "Grandmother", "Great-granddaughter"], "A is a daughter of C (B's mother), and C is D's child. So A is D's granddaughter."),
  m("Introducing a man, a woman said, \"His wife is the only daughter of my father.\" How is the man related to the woman?", ["Husband", "Brother", "Father", "Brother-in-law"], "The only daughter of her father is the woman herself, so the man's wife is the woman: he is her husband."),
  m2("If P is the brother of Q and Q is the sister of R, how is R related to P?", ["Cannot be determined", "Brother", "Sister", "Cousin"], "P, Q and R are siblings, but R's gender is not given, so R may be P's brother or sister: it cannot be determined.", { a: 0 }),
  m2("Pointing to a man, Neha said, \"His only brother is the father of my daughter's father.\" How is the man related to Neha?", ["Husband's uncle", "Father-in-law", "Grandfather", "Brother-in-law"], "Neha's daughter's father is Neha's husband. His father is Neha's father-in-law, whose only brother is the man. So the man is her husband's uncle."),
  m("A's mother is the sister of B's father. How is A related to B?", ["Cousin", "Brother", "Nephew", "Uncle"], "A's mother and B's father are siblings, so A and B are first cousins."),
  m2("X is the husband of Y. W is the daughter of X. Z is the husband of W. N is the daughter of Z. How is N related to Y?", ["Granddaughter", "Daughter", "Niece", "Sister"], "W is the daughter of X and Y. N is the daughter of W and Z. So N is Y's granddaughter."),
  m("A is the father of B. C is the mother of B. D is the brother of A. How is C related to D?", ["Sister-in-law", "Sister", "Wife", "Mother"], "C is A's wife (both are B's parents) and D is A's brother, so C is D's sister-in-law."),
  m2("M is the son of P. Q is the granddaughter of O, who is the husband of P. How is M related to O?", ["Son", "Grandson", "Brother", "Son-in-law"], "O is P's husband and M is P's son, so M is O's son."),
  m2("Pointing to a woman in a photo, Vikram said, \"Her mother's only son is my father.\" How is the woman related to Vikram?", ["Aunt (father's sister)", "Mother", "Sister", "Grandmother"], "Her mother's only son is her brother, who is Vikram's father. So she is Vikram's father's sister: his aunt."),
  m2("Deepak said, \"That boy playing football is the younger of the two brothers of the daughter of my father's wife.\" How is the boy related to Deepak?", ["Brother", "Cousin", "Son", "Nephew"], "Deepak's father's wife is his mother; her daughter is Deepak's sister. Her two brothers are Deepak and the boy, so the boy is Deepak's brother."),
  m3("If A + B means A is the mother of B, and A × B means A is the brother of B, what does P × Q + R mean?", ["P is the maternal uncle of R", "P is the father of R", "P is the brother of R", "P is the paternal uncle of R"], "P × Q: P is Q's brother. Q + R: Q is R's mother. So P is the brother of R's mother: R's maternal uncle."),
  m2("Rohan's mother is the only daughter of Kamala's father. How is Kamala related to Rohan?", ["Mother", "Aunt", "Grandmother", "Sister"], "The only daughter of Kamala's father is Kamala herself, so Kamala is Rohan's mother."),
  m("If Seema is Rita's sister and Rita is Tanvi's mother, how is Seema related to Tanvi?", ["Aunt", "Mother", "Sister", "Grandmother"], "Seema is the sister of Tanvi's mother, so she is Tanvi's (maternal) aunt."),
];

// ───────────── Syllogism ─────────────
export const syllogism: RawQ[] = [
  syl("All cats are animals. All animals are living beings.", "All cats are living beings.", "Some living beings are cats.", "both", "Cats ⊂ animals ⊂ living beings, so all cats are living beings (I). Converting I gives 'some living beings are cats' (II). Both follow."),
  syl("Some pens are books. All books are tables.", "Some pens are tables.", "All tables are pens.", "only1", "The pens that are books are also tables, so I follows. Nothing says all tables are pens."),
  syl("No flower is a tree. All trees are green.", "No flower is green.", "Some green things are not flowers.", "only2", "All trees are green and no tree is a flower, so those green things (the trees) are not flowers: II follows. Flowers may still be green, so I does not."),
  syl("All doctors are graduates. No graduate is illiterate.", "No doctor is illiterate.", "Some graduates are doctors.", "both", "Doctors ⊂ graduates and graduates are not illiterate, so no doctor is illiterate (I). 'All doctors are graduates' converts to 'some graduates are doctors' (II)."),
  syl("Some boys are students. Some students are players.", "Some boys are players.", "No boy is a player.", "either", "Neither conclusion follows definitely, but they form a complementary pair ('some are' and 'none are' about the same two groups): one of them must be true. So either I or II follows.", 3),
  syl("All mangoes are fruits. Some fruits are sweet.", "Some mangoes are sweet.", "All sweet things are fruits.", "neither", "The sweet fruits may or may not include mangoes, and nothing is said about all sweet things. Neither follows."),
  syl("No car is a bus. No bus is a train.", "No car is a train.", "Some trains are cars.", "either", "Two negative statements give no definite conclusion, but I ('no car is a train') and II ('some trains are cars') form a complementary pair, so either I or II follows.", 3),
  syl("Some phones are laptops. No laptop is a tablet.", "Some phones are not tablets.", "All tablets are phones.", "only1", "The phones that are laptops cannot be tablets, so some phones are not tablets (I). II has no basis."),
  syl("All rivers are lakes. All lakes are ponds.", "All rivers are ponds.", "Some ponds are lakes.", "both", "Rivers ⊂ lakes ⊂ ponds gives I. 'All lakes are ponds' converts to 'some ponds are lakes' (II)."),
  syl("Some teachers are writers. All writers are poets.", "Some teachers are poets.", "Some poets are teachers.", "both", "The teachers who are writers are poets (I). II is the conversion of I."),
  syl("All birds can fly. Some animals are birds.", "Some animals can fly.", "All animals can fly.", "only1", "The animals that are birds can fly (I). That does not extend to all animals."),
  syl("No apple is an orange. Some oranges are bananas.", "Some bananas are not apples.", "Some apples are bananas.", "only1", "The bananas that are oranges cannot be apples, so some bananas are not apples (I). II has no basis.", 3),
  syl("All engineers are problem solvers. Some problem solvers are artists.", "Some engineers are artists.", "Some artists are problem solvers.", "only2", "II is the conversion of the second statement. The artists among problem solvers may or may not be engineers, so I does not follow."),
];

// ───────────── Dice ─────────────
export const dice: RawQ[] = [
  m("On a standard die, the numbers on opposite faces add up to 7. Which number is opposite 2?", ["5", "4", "6", "3"], "Opposite faces sum to 7, so the face opposite 2 is 7 − 2 = 5.", { check: "7-2" }),
  m("On a standard die, which pair of numbers can never appear on adjacent faces?", ["1 and 6", "1 and 2", "2 and 3", "4 and 6"], "On a standard die, 1 is opposite 6 (they add up to 7), so they cannot be adjacent."),
  m2("Two positions of the same die show the faces 1, 2, 3 and 1, 3, 5. Which number is opposite 2?", ["5", "4", "6", "1"], "Faces 1 and 3 appear in both positions. When two faces are common, the remaining faces (2 and 5) are opposite each other."),
  m("How many faces of a cube-shaped die are adjacent to any one face?", ["4", "3", "5", "2"], "Each face touches four others; only the opposite face is not adjacent."),
  m("On a standard die (1 opposite 6, 2 opposite 5, 3 opposite 4), 3 is on top. Which number is at the bottom?", ["4", "6", "1", "5"], "The bottom face is opposite the top face, so it is 4."),
  m2("A die's faces are coloured red, blue, green, yellow, white and black. Two positions show red, blue, green and red, green, yellow. Which colour is opposite blue?", ["Yellow", "White", "Black", "Red"], "Red and green appear in both positions, so the remaining colours blue and yellow are opposite each other."),
  m2("A die shows 4, 5, 6 in one position and 6, 1, 4 in another. Which number is opposite 5?", ["1", "2", "3", "6"], "6 and 4 appear in both positions, so the other two faces, 5 and 1, are opposite."),
  m3("Three positions of a die show (1, 2, 3), (1, 3, 6) and (1, 4, 6). Which number is opposite 3?", ["4", "2", "5", "6"], "From the first two positions (common 1 and 3), 2 is opposite 6. Then 1 is adjacent to 2, 3, 4 and 6, so 1 is opposite 5. The remaining pair, 3 and 4, must be opposite."),
  m("If a die is rolled once, what is the sum of all the numbers on its faces?", ["21", "20", "18", "36"], "1 + 2 + 3 + 4 + 5 + 6 = 21.", { check: "1+2+3+4+5+6" }),
];

// ───────────── Data Sufficiency ─────────────
export const dataSufficiency: RawQ[] = [
  ds("What is Ravi's age?", "Ravi is 3 years older than Mohan.", "Mohan is 20 years old.", 4, "Neither statement alone gives Ravi's age, but together they give 20 + 3 = 23."),
  ds("Is the integer x even?", "x is divisible by 4.", "x + 1 is odd.", 2, "Divisible by 4 ⇒ even (I alone suffices). x + 1 odd ⇒ x even (II alone suffices). Either alone is enough."),
  ds("How many students are there in the class?", "Raj ranks 12th from the top.", "Raj ranks 18th from the bottom.", 4, "Together: 12 + 18 − 1 = 29. Each alone is insufficient."),
  ds("What is the area of a rectangle?", "Its length is 10 cm.", "Its perimeter is 30 cm.", 4, "Together: breadth = 30/2 − 10 = 5, area = 50 sq. cm. Neither alone gives both sides."),
  ds("Is the triangle right-angled?", "Its sides are 5 cm, 12 cm and 13 cm.", "One of its angles is 40°.", 0, "5² + 12² = 13², so I alone shows it is right-angled. II alone leaves the other angles unknown."),
  ds("What is the speed of the train?", "It crosses a pole in 10 seconds.", "The train is 200 m long.", 4, "Speed = 200/10 = 20 m/s, which needs both statements."),
  ds("Who is the tallest among A, B and C?", "A is taller than B.", "C is shorter than B.", 4, "Together: A > B > C, so A is the tallest. Each alone leaves someone uncompared."),
  ds("What is the value of x?", "3x + 2 = 11", "x² = 9", 0, "I gives x = 3. II gives x = 3 or −3, which is not a single value."),
  ds("In which direction is P facing?", "P faces opposite to Q.", "Q faces the direction in which the sun rises.", 4, "Together: Q faces east, so P faces west. Neither alone is enough."),
  ds("Is the number n divisible by 15?", "n is divisible by 5.", "n is divisible by 3.", 4, "Divisibility by both 3 and 5 is needed for 15; each statement alone is insufficient."),
  ds("What is Meena's monthly salary?", "Meena earns twice as much as Seema.", "Seema earns Rs. 5,000 less than Meena.", 4, "Together: M = 2S and S = M − 5000 ⇒ M = 10,000. Each alone has two unknowns."),
  ds("On which day of the week was 15 August of a certain year?", "1 August of that year was a Sunday.", "The year was a leap year.", 0, "15 August is 14 days after 1 August, so it is also a Sunday — I alone suffices. II alone says nothing about weekdays.", 3),
];

// ───────────── Verification of Truth ─────────────
const VT = "Choose the option that is ALWAYS true or always present.";
export const verificationOfTruth: RawQ[] = [
  m(`${VT}\nA newspaper always has:`, ["news", "advertisements", "a crossword", "photographs"], "A newspaper exists to carry news. Adverts, crosswords and photographs are common but not essential."),
  m(`${VT}\nA school always has:`, ["students", "a playground", "a library", "a canteen"], "There is no school without students; the other facilities are optional."),
  m(`${VT}\nA race always has:`, ["competitors", "prize money", "spectators", "a stadium"], "A race cannot happen without people (or teams) competing; the rest are optional."),
  m(`${VT}\nA computer always has:`, ["a processor", "a keyboard", "a monitor", "a mouse"], "Every computer has a processor to execute instructions. Many computers (servers, embedded systems) have no keyboard, monitor or mouse."),
  m(`${VT}\nA meal always involves:`, ["food", "a table", "cutlery", "a restaurant"], "Food is the only essential part of a meal."),
  m(`${VT}\nA circle always has:`, ["a centre", "a drawn diameter", "colour", "shading"], "Every circle has a centre equidistant from its points."),
  m(`${VT}\nA bank account always has:`, ["an account holder", "a cheque book", "a debit card", "a loan"], "An account must belong to someone; the other items are optional."),
  m(`${VT}\nA desert always has:`, ["very low rainfall", "sand dunes", "camels", "an oasis"], "Deserts are defined by low precipitation; many deserts are rocky or icy."),
  m(`${VT}\nA city always has:`, ["inhabitants", "a metro rail", "an airport", "a river"], "A city is a large settlement of people; transport systems and rivers are not essential."),
  m(`${VT}\nAn examination always has:`, ["questions or tasks", "a printed paper", "an invigilator", "a hall"], "An examination tests by questions or tasks; it may be oral or online, without paper, halls or invigilators."),
];

// ───────────── Seating Arrangement ─────────────
export const seatingArrangement: RawItem[] = [
  set("Six friends P, Q, R, S, T and U sit around a circular table facing the centre. Q is to the immediate left of P. S sits opposite P. R sits between Q and S. T is to the immediate left of S. U sits opposite R.", [
    m3("Who sits opposite Q?", ["T", "U", "R", "S"], "Going round to each person's left: P, Q, R, S, T, U. Opposite pairs are P–S, Q–T and R–U. So T sits opposite Q."),
    m3("Who is to the immediate right of P?", ["U", "Q", "T", "R"], "Order to the left: P, Q, R, S, T, U. Q is P's immediate left, so the person on P's other side, U, is P's immediate right."),
    m3("Who sits between T and P?", ["U", "S", "Q", "R"], "Order: P, Q, R, S, T, U (round the table). U is between T and P."),
  ]),
  set("Seven people J, K, L, M, N, O and P sit in a row facing north. M sits in the middle. J is second from the left. K is to the immediate right of M. N is at the right end. L is to the left of J. O sits between K and N.", [
    m3("Who sits third from the left?", ["P", "M", "J", "L"], "From the left: L, J, P, M, K, O, N. M is fourth, J second, K fifth, N seventh, L first (left of J), O sixth (between K and N), leaving P third."),
    m3("Who sits between J and M?", ["P", "L", "K", "O"], "Order: L, J, P, M, K, O, N. P sits between J and M."),
    m3("How many people sit to the right of K?", ["Two", "One", "Three", "Four"], "K is fifth; O and N are to its right: two people."),
  ]),
  set("Five friends A, B, C, D and E sit on a bench facing south. C is in the middle. A is at the extreme right end (from their own point of view). B is to the immediate left of C. E is not next to A.", [
    m3("Who sits at the extreme left end?", ["E", "B", "D", "A"], "Facing south, positions from their left: 1 to 5. C is 3, A is 5 (right end), B is 2 (immediate left of C). D and E fill 1 and 4. E is not next to A (who is at 5), so E is at 1 and D at 4."),
    m3("Who sits next to A?", ["D", "C", "E", "B"], "Order from their left: E, B, C, D, A. A's only neighbour is D."),
  ]),
];
