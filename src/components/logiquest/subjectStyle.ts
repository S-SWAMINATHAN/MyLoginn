import { Atom, BarChart3, Binary, Boxes, Brain, Bug, Building2, Calculator, CircuitBoard, Code2, Coffee, Cog, Cpu, Database, Dna, FlaskConical, Globe, Hash, HardDrive, Layers, Lightbulb, MessageSquareText, MessagesSquare, Microscope, Monitor, Network, Puzzle, Radio, Shapes, TestTube2, Terminal, Users, Workflow, Zap, type LucideIcon } from "lucide-react";

/** One colour per section, so a learner can tell sections apart at a glance. */
export const GROUP_COLOR: Record<string, string> = {
  aptitude: "#2563eb", verbal: "#0d9488", reasoning: "#7c3aed", programming: "#4f46e5", technical: "#0891b2",
  interview: "#d97706", gk: "#059669", engineering: "#ea580c", medical: "#e11d48", puzzles: "#db2777",
};
export const GROUP_ICON: Record<string, LucideIcon> = {
  aptitude: Calculator, verbal: MessageSquareText, reasoning: Brain, programming: Code2, technical: Cpu,
  interview: Users, gk: Globe, engineering: Cog, medical: Microscope, puzzles: Puzzle,
};
/** A distinct icon for every subject (the section icon is the fallback). */
export const SUBJECT_ICON: Record<string, LucideIcon> = {
  "arithmetic-aptitude": Calculator, "data-interpretation": BarChart3, "verbal-ability": MessageSquareText,
  "logical-reasoning": Lightbulb, "verbal-reasoning": Brain, "non-verbal-reasoning": Shapes,
  "c-programming": Terminal, "cpp-programming": Code2, "csharp-programming": Hash, "java-programming": Coffee, "python-programming": Workflow,
  database: Database, networking: Network, "operating-systems": HardDrive, "computer-fundamentals": Monitor, "data-structures": Binary,
  "software-testing": Bug, "software-engineering": Layers, "digital-electronics": CircuitBoard,
  "hr-interview": Users, "technical-interview": Cpu, "group-discussion": MessagesSquare,
  "general-knowledge": Globe, "general-science": Atom,
  "mechanical-engineering": Cog, "civil-engineering": Building2, "electronics-and-communication": Radio, "electrical-engineering": Zap,
  "chemical-engineering": FlaskConical, "computer-science-engineering": Boxes,
  microbiology: Microscope, biochemistry: TestTube2, biotechnology: Dna, "biochemical-engineering": FlaskConical, puzzles: Puzzle,
};

/** Keys into the site's animated course-icon set (the same icons the course cards use), one per subject. */
export const SUBJECT_ICON_KEY: Record<string, string> = {
  "arithmetic-aptitude": "math", "data-interpretation": "data", "verbal-ability": "comm",
  "logical-reasoning": "ai", "verbal-reasoning": "ai", "non-verbal-reasoning": "ai",
  "c-programming": "c", "cpp-programming": "cpp", "csharp-programming": "software", "java-programming": "java", "python-programming": "python",
  database: "sql", networking: "network", "operating-systems": "linux", "computer-fundamentals": "student", "data-structures": "dsa",
  "software-testing": "testing", "software-engineering": "software", "digital-electronics": "physics",
  "hr-interview": "career", "technical-interview": "leader", "group-discussion": "comm",
  "general-knowledge": "student", "general-science": "chemistry",
  "mechanical-engineering": "physics", "civil-engineering": "business", "electronics-and-communication": "network", "electrical-engineering": "physics",
  "chemical-engineering": "chemistry", "computer-science-engineering": "webdev",
  microbiology: "chemistry", biochemistry: "chemistry", biotechnology: "chemistry", "biochemical-engineering": "chemistry", puzzles: "ai",
};
