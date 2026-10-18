/** More Verbal Reasoning questions, in the same formats as reasoning/vr-written.ts. */
import type { RawQ } from "../../types";
import { m, m2, m3, set } from "../build";
import { CONCLUSION } from "../reasoning/lr-written";
import type { ExtraSubject } from "./merge";

type D = 1 | 2 | 3;
const F = { only1: 0, only2: 1, either: 2, neither: 3, both: 4 } as const;
const syl = (st: string, c1: string, c2: string, ans: keyof typeof F, e: string, d: D = 2): RawQ => ({ q: `Statements: ${st}\nConclusions:\nI. ${c1}\nII. ${c2}`, o: CONCLUSION, a: F[ans], e, d });
const DS = ["I alone is sufficient, but II alone is not", "II alone is sufficient, but I alone is not", "Either I or II alone is sufficient", "Neither I nor II is sufficient, even together", "Both I and II together are needed"];
const ds = (q: string, i: string, ii: string, ans: number, e: string, d: D = 2): RawQ => ({ q: `${q}\nI. ${i}\nII. ${ii}`, o: DS, a: ans, e, d });
const seq = (words: string[], right: string, wrong: string[], e: string, d: D = 1): RawQ =>
  m(`Arrange the words in a meaningful sequence:\n${words.map((w, i) => `${i + 1}. ${w}`).join("  ")}`, [right, ...wrong], e, { d });
const VT = "Choose the option that is ALWAYS true or always present.";

const extra: ExtraSubject = {
  "logical-sequence-of-words": [
    seq(["Seed", "Plant", "Flower", "Fruit", "Tree"], "1, 2, 5, 3, 4", ["1, 2, 3, 5, 4", "2, 1, 5, 3, 4", "1, 5, 2, 3, 4"], "A seed grows into a plant, then a tree, which flowers and then bears fruit."),
    seq(["Child", "Infant", "Adult", "Teenager", "Old"], "2, 1, 4, 3, 5", ["1, 2, 4, 3, 5", "2, 1, 3, 4, 5", "2, 4, 1, 3, 5"], "Stages of life: infant, child, teenager, adult, old."),
    seq(["Cut", "Wash", "Cook", "Buy", "Eat"], "4, 2, 1, 3, 5", ["4, 1, 2, 3, 5", "2, 4, 1, 3, 5", "4, 2, 3, 1, 5"], "Buy vegetables, wash, cut, cook and eat."),
    seq(["Month", "Day", "Year", "Week", "Hour"], "5, 2, 4, 1, 3", ["2, 5, 4, 1, 3", "5, 4, 2, 1, 3", "5, 2, 1, 4, 3"], "From smallest to largest: hour, day, week, month, year."),
    seq(["Country", "State", "District", "Village", "World"], "4, 3, 2, 1, 5", ["4, 2, 3, 1, 5", "3, 4, 2, 1, 5", "4, 3, 1, 2, 5"], "From smallest to largest: village, district, state, country, world."),
    seq(["Application", "Interview", "Advertisement", "Selection", "Joining"], "3, 1, 2, 4, 5", ["1, 3, 2, 4, 5", "3, 2, 1, 4, 5", "3, 1, 4, 2, 5"], "A job is advertised, people apply, are interviewed, selected and then join."),
    seq(["Milk", "Butter", "Cow", "Ghee", "Cream"], "3, 1, 5, 2, 4", ["3, 1, 2, 5, 4", "1, 3, 5, 2, 4", "3, 5, 1, 2, 4"], "A cow gives milk; cream is separated, churned into butter, which is heated to make ghee.", 2),
    seq(["Doctor", "Fever", "Recovery", "Medicine", "Diagnosis"], "2, 1, 5, 4, 3", ["1, 2, 5, 4, 3", "2, 5, 1, 4, 3", "2, 1, 4, 5, 3"], "Fever, visit doctor, diagnosis, medicine, recovery."),
  ],

  "blood-relation-test": [
    m("A is the father of B. B is the sister of C. How is A related to C?", ["Father", "Uncle", "Brother", "Grandfather"], "B and C are siblings, so their father A is C's father too."),
    m("Pointing to a woman, Ravi said, \"She is the only daughter of my mother.\" How is the woman related to Ravi?", ["Sister", "Mother", "Cousin", "Aunt"], "The only daughter of Ravi's mother (Ravi being male) is his sister."),
    m("X is the son of Y. Y is the daughter of Z. How is Z related to X?", ["Grandparent", "Parent", "Uncle", "Brother"], "Z is Y's parent and Y is X's mother, so Z is X's grandparent."),
    m2("P is the mother of Q. Q is the brother of R. S is the father of P. How is S related to R?", ["Grandfather", "Father", "Uncle", "Brother"], "P is the mother of Q and R; S is P's father, so S is R's grandfather."),
    m2("Pointing to a boy, Meena said, \"He is the son of my father's only son.\" How is the boy related to Meena?", ["Nephew", "Brother", "Son", "Cousin"], "Meena's father's only son is her brother; his son is her nephew."),
    m2("If A + B means A is the father of B, and A − B means A is the sister of B, what does P + Q − R mean?", ["P is the father of R", "P is the brother of R", "P is the uncle of R", "P is the sister of R"], "P is Q's father and Q is R's sister, so P is also R's father."),
    m2("Introducing a girl, Arjun said, \"Her mother is the only daughter of my mother-in-law.\" How is Arjun related to the girl?", ["Father", "Uncle", "Brother", "Grandfather"], "The only daughter of Arjun's mother-in-law is his wife, who is the girl's mother. So Arjun is her father."),
    m3("A's brother B is the son of C. D is C's father. E is D's wife. How is A related to E?", ["Grandchild", "Child", "Sister", "Niece"], "A and B are children of C; D and E are C's parents. So A is E's grandchild (gender of A is not given)."),
  ],

  syllogism: [
    syl("All pens are tools. Some tools are expensive.", "Some pens are expensive.", "All tools are pens.", "neither", "The expensive tools may not be pens (I does not follow), and not all tools need be pens (II does not follow)."),
    syl("All dogs are mammals. No mammal is a fish.", "No dog is a fish.", "Some mammals are dogs.", "both", "Dogs ⊂ mammals, and mammals and fish do not overlap, so no dog is a fish (I). 'All dogs are mammals' implies some mammals are dogs (II)."),
    syl("Some books are novels. Some novels are films.", "Some books are films.", "No book is a film.", "either", "Neither follows definitely, but I and II form a complementary pair (some / no), so either I or II is true."),
    syl("All teachers are educated. Some educated people are rich.", "Some teachers are rich.", "Some rich people are educated.", "only2", "The rich educated people may not be teachers (I fails). 'Some educated are rich' converts to 'some rich are educated' (II)."),
    syl("No chair is a table. All tables are wooden.", "No chair is wooden.", "Some wooden things are tables.", "only2", "Chairs may still be wooden (I fails). 'All tables are wooden' implies some wooden things are tables (II)."),
    syl("All roses are flowers. All flowers are plants.", "All roses are plants.", "All plants are roses.", "only1", "Roses ⊂ flowers ⊂ plants, so I follows. The reverse does not."),
    syl("Some cars are red. All red things are bright.", "Some cars are bright.", "All bright things are cars.", "only1", "The red cars are bright, so I follows. II does not."),
    syl("All students are players. No player is lazy.", "No student is lazy.", "Some players are students.", "both", "Students ⊂ players, none lazy, so I follows. II follows by conversion of the first statement."),
  ],

  dice: [
    m("On a standard die, which number is opposite 4?", ["3", "2", "5", "1"], "Opposite faces add up to 7: 7 − 4 = 3.", { check: "7-4" }),
    m("On a standard die, which number is opposite 6?", ["1", "2", "3", "5"], "7 − 6 = 1.", { check: "7-6" }),
    m("How many faces does a cube-shaped die have?", ["6", "4", "8", "12"], "A cube has six square faces."),
    m("How many edges does a cube have?", ["12", "6", "8", "10"], "Four edges on top, four on the bottom and four vertical."),
    m("How many corners (vertices) does a cube have?", ["8", "6", "12", "4"], "Four on top and four on the bottom."),
    m2("Two positions of a die show 3, 4, 5 and 3, 1, 4 around the common faces. Which number is opposite 5?", ["1", "3", "4", "6"], "Faces 3 and 4 are common to both views, so the remaining faces 5 and 1 are opposite each other."),
    m2("A die shows 1 on top with 2 in front and 3 on the right. On a standard die, what is on the bottom?", ["6", "5", "4", "2"], "The bottom is opposite the top: 7 − 1 = 6."),
    m2("On a standard die, the sum of the numbers on the four faces adjacent to 1 is:", ["14", "20", "12", "15"], "Adjacent to 1 are all faces except 1 and 6: 2 + 3 + 4 + 5 = 14.", { check: "2+3+4+5" }),
    m3("A cube painted red on all faces is cut into 27 equal smaller cubes. How many small cubes have exactly two red faces?", ["12", "8", "6", "1"], "Cubes with two painted faces lie on the edges, one per edge (excluding corners): 12 edges × 1 = 12.", { check: "12*(3-2)" }),
  ],

  "data-sufficiency": [
    ds("What is the value of x?", "2x + 3 = 11.", "x is a positive integer.", 0, "I gives x = 4. II alone does not fix x."),
    ds("Is Meena taller than Sita?", "Meena is taller than Rita.", "Rita is taller than Sita.", 4, "Together: Meena > Rita > Sita, so yes. Neither alone is enough."),
    ds("What is the area of the rectangle?", "Its length is 8 cm.", "Its perimeter is 26 cm.", 4, "With length 8 and perimeter 26, breadth = 5, area = 40 cm². Neither alone is enough."),
    ds("On which day of the week was Ravi born?", "Ravi's birthday this year falls on a Monday.", "Ravi was born on 12 March 2004.", 1, "From the date alone, the weekday can be calculated (it was a Friday). Statement I does not fix his birth weekday."),
    ds("What is the speed of the train?", "It covers 240 km in 4 hours.", "It is faster than a car moving at 50 km/h.", 0, "I gives 60 km/h. II gives only a lower bound."),
    ds("How many sons does Mr Kumar have?", "Mr Kumar has four children.", "Two of Mr Kumar's children are daughters.", 4, "Together: 4 − 2 = 2 sons."),
    ds("Is the number n divisible by 15?", "n is divisible by 3.", "n is divisible by 5.", 4, "Divisible by both 3 and 5 means divisible by 15; neither alone suffices."),
    ds("What is the price of one pen?", "Three pens and two pencils cost ₹50.", "Two pens and three pencils cost ₹45.", 4, "Solving together: 3p + 2q = 50 and 2p + 3q = 45 give p = 12 and q = 7."),
    ds("In which direction is the school from the house?", "The school is 2 km north of the market.", "The house is 2 km south of the market.", 4, "Together the school is 4 km north of the house."),
  ],

  "verification-of-truth": [
    m(`${VT}\nA book always has:`, ["pages", "pictures", "a hard cover", "an index"], "Every book has pages; the rest are optional."),
    m(`${VT}\nA hospital always has:`, ["doctors", "a lift", "a garden", "a canteen"], "A hospital cannot function without doctors."),
    m(`${VT}\nA game always has:`, ["rules", "a referee", "spectators", "a trophy"], "Every game is played according to rules."),
    m(`${VT}\nA river always has:`, ["water", "fish", "bridges", "boats"], "A river is a flow of water; the others are optional."),
    m(`${VT}\nA bank always has:`, ["money transactions", "an ATM", "a locker facility", "a security guard"], "Banking is about handling money; facilities vary."),
    m(`${VT}\nA song always has:`, ["a tune (melody)", "a guitar", "a chorus", "a video"], "A song needs a melody; instruments and videos are optional."),
    m(`${VT}\nA meeting always has:`, ["participants", "a projector", "refreshments", "a microphone"], "A meeting needs people to meet."),
    m(`${VT}\nA shop always has:`, ["goods or services for sale", "air conditioning", "a parking area", "a website"], "A shop exists to sell something."),
    m2(`${VT}\nAn examination always has:`, ["questions", "a hall", "an invigilator", "a timetable printed in colour"], "Online or oral exams may lack halls or invigilators, but every exam has questions."),
  ],

  "seating-arrangement": [
    set("Five friends — A, B, C, D and E — sit in a row facing north. A sits at the left end. C sits in the middle. B sits to the immediate right of C. E is not next to A.", [
      m3("Who sits second from the left?", ["D", "E", "B", "C"], "A is 1st, C is 3rd and B is 4th. E is not next to A, so E is 5th and D is 2nd. Order: A, D, C, B, E."),
      m3("Who sits at the right end?", ["E", "B", "D", "C"], "Order: A, D, C, B, E."),
      m3("Who sits between C and E?", ["B", "D", "A", "No one"], "Order: A, D, C, B, E. B sits between C and E."),
    ]),
    set("Six people — K, L, M, N, O and P — sit around a circular table facing the centre. K sits opposite N. L is to the immediate left of K. O sits opposite L. M sits between L and N.", [
      m3("Who sits opposite M?", ["P", "O", "K", "L"], "Going round to each person's left from K: K, L, M, N, O, P. Opposite pairs are K–N, L–O and M–P. So P sits opposite M."),
      m3("Who is to the immediate right of K?", ["P", "L", "O", "M"], "L is K's immediate left, so the person on K's other side, P, is K's immediate right."),
      m3("Who sits between N and P?", ["O", "M", "K", "L"], "Order: K, L, M, N, O, P (round the table). O sits between N and P."),
    ]),
    set("Seven students — P, Q, R, S, T, U and V — sit in a row facing south. S sits in the middle. P is at the extreme left end (from the students' own point of view). R sits third to the right of S. Q sits to the immediate left of S. T is not next to P.", [
      m3("Who sits at the extreme right end?", ["R", "T", "U", "V"], "Positions from the students' left: 1 to 7. P = 1, S = 4, Q = 3, R = 7 (third to the right of S). T is not next to P, so T is 5 or 6; U and V fill 2 and the other seat. R is at the right end."),
      m3("Who sits to the immediate right of Q?", ["S", "P", "R", "T"], "Q is at 3 and S at 4, so S is immediately to Q's right."),
    ]),
  ],
};

export default extra;
