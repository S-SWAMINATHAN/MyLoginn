import type { RawQ, RawSubject } from "../types";
import { qa, topic } from "./build";

const gd = (title: string, forP: string[], against: string[], conclusion: string): RawQ =>
  qa(`GD topic: ${title}`, `**Points in favour**\n${forP.map((p) => `• ${p}`).join("\n")}\n\n**Points against / concerns**\n${against.map((p) => `• ${p}`).join("\n")}\n\n**Balanced conclusion:** ${conclusion}`);

const tips: RawQ[] = [
  qa("What do evaluators look for in a group discussion?", "Content (relevant, well-supported points), communication (clarity, fluency), listening (building on others' points), leadership (initiating, steering, summarising), teamwork (respect, inclusiveness) and body language. Quality matters more than how long you speak."),
  qa("How should you start a group discussion?", "Start only if you have a clear opening: define the topic, give context with a fact or example, and outline the main angles. Starting well earns credit; starting badly does not, so do not start just to be first."),
  qa("How do you enter a discussion when others are speaking a lot?", "Wait for a natural pause, acknowledge the previous speaker (\"Building on what Ravi said…\") and add a new point. Speak clearly and confidently rather than loudly."),
  qa("What should you avoid in a GD?", "Interrupting rudely, dominating, shouting, personal attacks, going off-topic, using unverified statistics, and remaining completely silent."),
  qa("How do you summarise a group discussion?", "Restate the topic, cover the main points raised on all sides without adding new arguments, highlight areas of agreement, and give a balanced conclusion in about a minute."),
  qa("What is a case-based or abstract GD?", "In a case-based GD the group analyses a scenario and recommends a solution. An abstract GD uses a word or phrase (e.g. 'Red', 'Zero') that participants interpret creatively, testing lateral thinking."),
];

const tech: RawQ[] = [
  gd("Artificial intelligence: boon or bane?", ["Automates repetitive work and improves productivity", "Advances healthcare diagnosis, drug discovery and education", "Creates new jobs in data, AI engineering and AI governance"], ["Job displacement in routine roles", "Bias, privacy and misinformation risks (deepfakes)", "Concentration of power in a few companies"], "AI is a powerful tool whose impact depends on responsible regulation, reskilling of workers and ethical design."),
  gd("Should social media be regulated?", ["Curbs misinformation, hate speech and online harassment", "Protects children and user privacy", "Makes platforms accountable for harm"], ["Risk to free speech and potential misuse by authorities", "Hard to enforce across borders", "May stifle innovation and small platforms"], "Clear, transparent rules focused on harm and privacy — with independent oversight — balance safety and freedom."),
  gd("Work from home: the future of work?", ["Saves commuting time and cost", "Wider talent pool and better work-life balance", "Lower office costs for companies"], ["Isolation and weaker team bonding", "Harder mentoring for freshers", "Blurred boundaries between work and home"], "A hybrid model that combines flexibility with regular in-person collaboration suits most organisations."),
  gd("Cashless economy in India", ["UPI made payments fast, cheap and traceable", "Reduces corruption and black money", "Improves tax compliance and financial inclusion"], ["Digital literacy and connectivity gaps in rural areas", "Cyber fraud and data security risks", "Exclusion of people who rely on cash"], "Digital payments should grow alongside literacy, security safeguards and continued access to cash."),
  gd("Electric vehicles: are we ready?", ["Lower emissions and fuel imports", "Lower running and maintenance costs", "Government incentives and growing charging networks"], ["High upfront cost and battery replacement", "Charging infrastructure still limited", "Electricity largely from coal; battery recycling issues"], "EV adoption is inevitable but needs charging infrastructure, cleaner power and battery recycling to deliver full benefits."),
];

const social: RawQ[] = [
  gd("Is reservation still relevant?", ["Addresses historical and social disadvantage", "Improves representation in education and jobs", "Constitutional commitment to equality of opportunity"], ["Benefits may concentrate among the better-off within groups", "Concerns about merit", "Need for regular review of who benefits"], "Affirmative action remains relevant but should be reviewed regularly to reach those most in need."),
  gd("Women's safety in public spaces", ["Better lighting, CCTV and safe public transport", "Faster police response and fast-track courts", "Awareness and gender-sensitivity education"], ["Laws exist but enforcement is weak", "Under-reporting due to stigma", "Technology alone cannot change mindsets"], "Safety needs infrastructure, strict enforcement and long-term social change together."),
  gd("Should voting be made compulsory?", ["Higher participation and more representative governments", "Encourages civic awareness", "Reduces the influence of vote banks"], ["Violates freedom of choice", "Hard to enforce for a large population", "Uninformed or random votes may increase"], "Making voting easier and better informed is preferable to compulsion."),
  gd("Plastic ban: practical or not?", ["Reduces pollution of land, rivers and oceans", "Protects wildlife and public health", "Encourages sustainable alternatives"], ["Livelihoods in the plastic industry", "Alternatives can be costlier", "Poor enforcement and lack of waste management"], "A phased ban on single-use plastics with affordable alternatives and better recycling is most practical."),
];

const business: RawQ[] = [
  gd("Startups are the future of the Indian economy", ["Create jobs and innovation", "Solve local problems with technology", "Attract investment and talent"], ["High failure rate", "Funding cycles and valuations can be volatile", "Concentrated in a few metro cities"], "Startups are a key growth engine, but need a stable ecosystem, funding access and reach beyond big cities."),
  gd("Is privatisation good for public sector companies?", ["Improves efficiency and accountability", "Brings investment and technology", "Reduces fiscal burden on government"], ["Job losses and reduced social obligations", "Risk of private monopolies", "Strategic sectors may need public control"], "Selective privatisation with strong regulation can improve efficiency while protecting public interest."),
  gd("Make in India: success or failure?", ["Increased manufacturing investment in electronics and defence", "Production-linked incentive schemes attracted big players", "Builds self-reliance and exports"], ["Manufacturing's share of GDP has grown slowly", "Infrastructure and logistics constraints", "Skill gaps in the workforce"], "The initiative has achieved progress in some sectors; sustained reforms in infrastructure and skills are needed."),
  gd("Gig economy: opportunity or exploitation?", ["Flexible work and income for millions", "Low entry barriers", "Efficient services for customers"], ["Lack of social security and job security", "Algorithmic control and unclear pay", "Long hours without benefits"], "The gig economy is valuable but needs minimum protections such as insurance and fair pay."),
];

const education: RawQ[] = [
  gd("Online education vs classroom learning", ["Accessible anywhere, often cheaper", "Self-paced with recorded content", "Access to top teachers globally"], ["Less interaction and discipline", "Digital divide", "Practical and social skills need in-person settings"], "Blended learning combining online resources with classroom interaction gives the best results."),
  gd("Is a degree necessary for success?", ["Provides structured knowledge and credentials", "Required for many professions", "Builds networks and discipline"], ["Many successful people succeeded through skills alone", "Skills-based hiring is growing", "High cost and outdated curricula"], "Degrees remain valuable, but continuous skill-building matters as much as formal qualifications."),
  gd("Should coding be compulsory in schools?", ["Builds logical thinking and problem solving", "Prepares students for a digital economy", "Encourages creativity"], ["Lack of trained teachers and infrastructure", "Adds to curriculum load", "Not every student will become a programmer"], "Computational thinking for all, with optional advanced coding, is a balanced approach."),
  gd("Campus placements vs entrepreneurship", ["Placements give stability and learning", "Entrepreneurship builds leadership and innovation", "Both develop valuable skills"], ["Placements may limit risk-taking", "Startups carry high financial risk", "Family and social expectations"], "Choice depends on personal goals and risk appetite; working first can be a good foundation for later ventures."),
];

const abstract: RawQ[] = [
  gd("Zero", ["Zero transformed mathematics and computing (binary 0 and 1)", "Represents new beginnings", "'Zero tolerance' to corruption"], ["Zero can also mean emptiness or failure", "Ambition to reach 'zero emissions' is hard", "Starting from zero needs resilience"], "Zero can symbolise both nothing and infinite potential — what matters is what we build from it."),
  gd("The colour red", ["Energy, passion and courage", "Danger signals that keep us safe", "Associated with celebration in Indian culture"], ["Anger and aggression", "Being 'in the red' means loss", "Different meanings across cultures"], "Red shows how one symbol can carry opposite meanings depending on context."),
  gd("A bridge", ["Connects people, places and ideas", "Represents communication and diplomacy", "Engineering progress"], ["Burning bridges damages relationships", "A bridge is only as strong as its weakest part", "Some gaps cannot be bridged quickly"], "Building bridges — between people and ideas — is more valuable than building walls."),
  gd("Silence is golden", ["Listening leads to understanding", "Prevents hasty words", "Calm reflection improves decisions"], ["Silence against injustice is harmful", "Lack of communication hurts teams", "Ideas unspoken have no impact"], "Silence is valuable for listening and reflection, but speaking up when it matters is equally important."),
];

const T = "Topics & Points";
const subject: RawSubject = {
  "gd-tips": topic(tips, { title: "Questions & Answers", intro: "A group discussion assesses how you think, communicate and work with others. Prepare current topics, practise structured speaking and listen actively." }),
  "technology-topics": topic(tech, { title: T, intro: "Technology GD topics with points on both sides. Add recent facts and examples of your own." }),
  "social-topics": topic(social, { title: T, intro: "Social GD topics require balanced, sensitive arguments supported by facts." }),
  "business-and-economy": topic(business, { title: T, intro: "Business and economy topics test awareness of current economic issues." }),
  "education-and-career": topic(education, { title: T, intro: "Education and career topics are common in campus placements." }),
  "abstract-topics": topic(abstract, { title: T, intro: "Abstract topics reward creative, structured interpretation. Explore several meanings and relate them to real life." }),
};
export default subject;
