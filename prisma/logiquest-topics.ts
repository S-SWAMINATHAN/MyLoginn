import type { Cat } from "./logiquest-types";

/** The Master Program topic map: category -> level -> topics. `npm run lq:validate` reports any topic with no questions. */
export const TOPICS: Record<Cat, Record<"Beginner" | "Intermediate" | "Advanced" | "Extra", string[]>> = {
  PROBLEM_SOLVING: {
    Beginner: ["Understanding Problems", "Problem Breakdown", "Identify Inputs & Outputs", "Step-by-Step Thinking", "Pattern Recognition", "Logical Thinking", "Decision Making", "Cause & Effect", "Trial and Error", "Basic Algorithmic Thinking"],
    Intermediate: ["Problem Decomposition", "Constraint Analysis", "Finding Multiple Solutions", "Optimization Basics", "Pattern & Sequence Problems", "Classification Problems", "Data Interpretation", "Case-Based Problems", "Real-World Problem Solving", "Debugging & Error Analysis"],
    Advanced: ["Complex Problem Analysis", "Algorithm Selection", "Optimization Problems", "Time & Space Complexity Thinking", "Systematic Troubleshooting", "Multi-Step Problems", "Constraint-Based Problems", "Real-World Engineering Problems", "Case Studies", "Interview-Level Problem Solving"],
    Extra: [],
  },
  LOGIC: {
    Beginner: ["Number Patterns", "Alphabet Patterns", "Odd One Out", "Coding & Decoding", "Analogy", "Classification", "Series Completion", "Direction Sense", "Blood Relations", "Ranking & Ordering"],
    Intermediate: ["Syllogisms", "Seating Arrangement", "Puzzles", "Logical Sequences", "Statement & Conclusion", "Statement & Assumption", "Data Sufficiency", "Venn Diagram Problems", "Clock & Calendar Logic", "Missing Information"],
    Advanced: ["Complex Logical Puzzles", "Multi-Condition Problems", "Advanced Seating Arrangements", "Constraint Puzzles", "Critical Reasoning", "Analytical Reasoning", "Deductive Reasoning", "Inductive Reasoning", "Decision-Making Problems", "Competitive Exam / Interview Logic"],
    Extra: [],
  },
  CODING: {
    Beginner: ["Programming Fundamentals", "Variables & Data Types", "Operators", "Input & Output", "Conditions", "if / else", "Loops", "Nested Loops", "Functions", "Arrays", "Strings"],
    Intermediate: ["Lists", "Sets", "Maps / HashMap", "Dictionaries", "Tuples", "Stack", "Queue", "Searching", "Sorting", "Recursion", "String Manipulation", "Array Problems"],
    Advanced: ["Object-Oriented Programming", "Linked Lists", "Trees", "Graphs", "Hashing", "Two Pointer Technique", "Sliding Window", "Binary Search", "Greedy Algorithms", "Dynamic Programming", "Backtracking", "Algorithm Optimization", "Complexity Analysis"],
    Extra: ["Output prediction", "Debugging", "Interview challenges", "Competitive programming", "Real-world coding problems", "System-level problem solving"],
  },
  MATH: {
    Beginner: ["Number System", "Addition / Subtraction", "Multiplication / Division", "Fractions", "Decimals", "Percentages", "Ratios", "Proportions", "Averages", "HCF & LCM"],
    Intermediate: ["Profit & Loss", "Simple Interest", "Compound Interest", "Time & Work", "Time, Speed & Distance", "Age Problems", "Mixtures & Allegations", "Probability", "Permutations", "Combinations"],
    Advanced: ["Algebra", "Linear Equations", "Quadratic Equations", "Sequences & Series", "Geometry", "Mensuration", "Statistics", "Advanced Probability", "Data Interpretation", "Mathematical Reasoning"],
    Extra: ["Fast calculations", "Number tricks", "Approximation", "Percentage shortcuts", "Multiplication shortcuts", "Mental arithmetic"],
  },
  COMMUNICATION: {
    Beginner: ["Basic English", "Vocabulary", "Grammar Fundamentals", "Sentence Formation", "Tenses", "Pronunciation", "Reading Practice", "Listening Practice", "Basic Conversation"],
    Intermediate: ["Speaking Practice", "Group Discussion", "Storytelling", "Describing Situations", "Asking & Answering Questions", "Professional Vocabulary", "Email Communication", "Workplace Communication", "Presentation Skills"],
    Advanced: ["Business Communication", "Professional Speaking", "Technical Communication", "Interview Communication", "Debate", "Leadership Communication", "Negotiation", "Client Communication", "Public Speaking"],
    Extra: ["Self Introduction", "HR Questions", "Technical Explanation", "Project Explanation", "Strengths & Weaknesses", "Situation-Based Questions", "STAR Method", "Mock Interviews", "English Fluency Practice"],
  },
  KNOWLEDGE: {
    Beginner: ["Current Affairs", "Science & Technology", "Business & Economy", "World Knowledge", "Indian Knowledge", "Geography", "History", "Basic Civics", "Important Organizations", "Important Technologies"],
    Intermediate: ["Computer Fundamentals", "Hardware & Software", "Operating Systems", "Networking Basics", "Internet", "Databases", "Cybersecurity Basics", "Cloud Computing", "Software Development", "AI Fundamentals"],
    Advanced: ["Artificial Intelligence", "Generative AI", "Machine Learning", "Data Science", "Cloud", "DevOps", "Cybersecurity", "Web Development", "Mobile Development", "Automation", "APIs", "Git & GitHub"],
    Extra: ["Resume Building", "LinkedIn", "Job Search", "Interview Preparation", "Workplace Etiquette", "Team Collaboration", "Agile & Scrum", "SDLC", "Career Planning", "Professional Ethics"],
  },
};
