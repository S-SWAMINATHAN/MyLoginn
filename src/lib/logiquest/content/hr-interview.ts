import type { RawQ, RawSubject } from "../types";
import { qa, topic } from "./build";

/** Model answer with the interviewer's intent first. Placeholders in [brackets] are for the learner to personalise. */
const hr = (q: string, intent: string, answer: string, tips: string): RawQ =>
  qa(q, `**What they want to know:** ${intent}\n\n**Sample answer:** ${answer}\n\n**Tips:** ${tips}`);

const intro: RawQ[] = [
  hr("Tell me about yourself.", "Whether you can give a clear, relevant summary that connects your background to this role.", "\"I recently completed my B.E. in Computer Science from [college]. During college I built [project], a web app that [what it does], which taught me React and REST APIs. I also completed an internship at [company] where I [achievement]. I enjoy solving problems end to end, and I'm looking for a role where I can grow as a developer — which is why this position interests me.\"", "Use present → past → future. Keep it to 60–90 seconds. Do not repeat your whole résumé or share personal details unrelated to work."),
  hr("Walk me through your résumé.", "Your ability to explain your journey and highlight what matters for the job.", "\"I'll start with my education in [degree], where I focused on [subjects]. My final-year project was [project], where I was responsible for [your part]. Then at [internship] I [result with a number]. Alongside, I earned [certification]. Each step built my skills in [key skill], which this role needs.\"", "Pick 2–3 highlights with results. Be ready to go deeper on anything you mention."),
  hr("Why did you choose your field of study?", "Your motivation and whether your interest is genuine.", "\"I enjoyed maths and logic in school, and when I wrote my first program I liked that I could build something useful from nothing. Engineering gave me a structured way to turn that interest into skills.\"", "Be honest and specific; link it to the kind of work you want to do now."),
  hr("What are your hobbies?", "Whether you are a well-rounded person and how you spend your time.", "\"I play badminton twice a week, which keeps me active and teaches me to stay calm under pressure. I also read about technology and recently started writing short blog posts about what I learn.\"", "Mention genuine hobbies you can talk about; one that shows discipline or learning is a bonus."),
  hr("How would your friends describe you?", "Your self-awareness and interpersonal qualities.", "\"They would say I'm dependable — if I say I'll do something, I do it — and that I'm the person they come to when they're stuck on a problem.\"", "Give two qualities and a short example."),
];

const strengths: RawQ[] = [
  hr("What are your strengths?", "Whether your strengths match the job and whether you can prove them.", "\"My main strength is persistence in problem solving. In my final-year project our model kept overfitting; I spent a week testing different features and regularisation until accuracy on unseen data improved from 71% to 86%.\"", "Choose strengths relevant to the role and back each with an example and, ideally, a number."),
  hr("What is your greatest weakness?", "Self-awareness and willingness to improve.", "\"I used to find it hard to say no, so I took on too many tasks at once. I now list my commitments, estimate effort and discuss priorities with my lead before accepting new work, which has made my delivery more reliable.\"", "Pick a real but non-critical weakness and show the steps you are taking. Avoid clichés like 'I'm a perfectionist'."),
  hr("What is one skill you want to improve?", "Your growth mindset.", "\"Public speaking. I've joined my college's speaking club and I volunteer to present our team's work in reviews to get more practice.\"", "Show concrete action, not just intent."),
  hr("How do you handle criticism?", "Whether you are coachable.", "\"I listen without getting defensive, ask questions to understand the concern, and act on it. When a reviewer said my code was hard to read, I learned clean-code practices and my later pull requests were approved faster.\"", "Give an example where feedback led to improvement."),
  hr("What makes you unique?", "What you would add that other candidates may not.", "\"I combine technical skills with experience explaining things to non-technical people — I tutored school students for two years — so I can communicate clearly with both developers and clients.\"", "Combine two qualities that are rarely seen together."),
];

const goals: RawQ[] = [
  hr("Where do you see yourself in five years?", "Your ambition and whether you are likely to stay and grow.", "\"I see myself as a strong full-stack engineer who owns features end to end and mentors new team members. I'd like to grow within a company like this where I can take on more responsibility over time.\"", "Show ambition that fits the company's growth path; avoid naming a different career."),
  hr("What are your short-term and long-term goals?", "Whether you have a plan.", "\"Short term, I want to master your tech stack and deliver quality work on my team. Long term, I'd like to lead technical projects and make architecture decisions.\"", "Make short-term goals concrete and long-term goals directional."),
  hr("Are you planning higher studies?", "Whether you might leave soon.", "\"Right now my focus is on building practical experience. If I study further in future, it would be part-time and aligned with my work, such as a certification in cloud architecture.\"", "Be honest but reassure them about your commitment."),
  hr("What motivates you?", "What drives your performance.", "\"Seeing something I built being used and solving a real problem. In my internship, knowing that the support team used my dashboard every day pushed me to make it fast and reliable.\"", "Link motivation to the job's real work."),
];

const company: RawQ[] = [
  hr("Why do you want to work for our company?", "Whether you researched the company and genuinely want this job.", "\"I've followed your work on [product/area], and I like that your teams [value or practice you read about]. The role matches my skills in [skills], and the training programme for freshers would help me grow quickly.\"", "Mention one specific fact about the company; avoid generic praise or salary."),
  hr("What do you know about our company?", "Your preparation.", "\"You were founded in [year], you serve [customers/industry], and your main products are [products]. I also read about your recent [news, expansion or project].\"", "Check the company website, recent news and LinkedIn before the interview."),
  hr("Why should we hire you?", "How you match their needs.", "\"You need someone who can [key requirement]. I have done that in [project/internship], I learn new tools quickly, as I showed when I picked up [tool] in two weeks, and I'm keen to contribute from day one.\"", "Match your strengths to the job description point by point."),
  hr("Are you willing to relocate?", "Your flexibility.", "\"Yes. I'm open to relocating for the right opportunity, and I'm comfortable living in a new city.\"", "Be honest; if there are constraints, state them politely."),
  hr("Are you comfortable working in shifts or on weekends when needed?", "Your flexibility for business needs.", "\"Yes, I understand that some projects need occasional extra hours or shifts, and I'm comfortable with that when planned.\"", "Show flexibility while being honest about real constraints."),
];

const behavioural: RawQ[] = [
  hr("Tell me about a time you faced a challenge and how you handled it.", "Your problem-solving approach (answer with the STAR method).", "\"Situation: two weeks before our project demo, our database crashed and we lost a day's data. Task: I had to restore it without missing the deadline. Action: I recovered from the last backup, wrote a script to re-import the missing records from logs, and set up daily automated backups. Result: we presented on time and never lost data again.\"", "Use STAR: Situation, Task, Action, Result. Focus on your own actions."),
  hr("Describe a time you made a mistake.", "Honesty, accountability and learning.", "\"During my internship I deployed a change without testing it on mobile and it broke the layout. I reported it immediately, rolled it back, fixed it, and added a mobile check to my personal release checklist.\"", "Own the mistake, show the fix and the lesson."),
  hr("Give an example of when you showed leadership.", "Initiative and influence, even without a title.", "\"Our project team was missing deadlines. I suggested a short daily stand-up and a shared task board, took responsibility for tracking progress, and we finished the remaining modules a week early.\"", "Leadership can be informal; quantify the outcome."),
  hr("Tell me about a time you worked under pressure.", "How you stay effective under stress.", "\"I had two exams and a hackathon in the same week. I planned my time in blocks, divided hackathon tasks clearly with my team, and we reached the final while I passed both exams.\"", "Show planning and calm, not just long hours."),
  hr("Describe a situation where you had to learn something quickly.", "Learning ability.", "\"My internship project needed Docker, which I had never used. I followed the official tutorial over a weekend, containerised a small app, and on Monday set up our project's development environment.\"", "Show your learning method and the result."),
];

const situational: RawQ[] = [
  hr("What would you do if you disagreed with your manager?", "Maturity and communication.", "\"I would first make sure I understood their reasoning, then share my view privately with data or examples. If they still decided differently, I would support the decision and do my best to make it work.\"", "Show respect for authority and willingness to voice concerns constructively."),
  hr("What would you do if you could not meet a deadline?", "Responsibility and communication.", "\"As soon as I saw the risk, I would inform my lead, explain the reason, and propose options — reducing scope, getting help, or a new date — rather than waiting until the deadline.\"", "Early communication is the key point."),
  hr("How would you handle a conflict with a teammate?", "Collaboration skills.", "\"I would talk to them privately, listen to their side, focus on the problem rather than the person, and look for a solution that works for the project. If we couldn't agree, I would involve our lead.\"", "Avoid blaming; show empathy and focus on outcomes."),
  hr("What would you do if you were given a task you have never done before?", "Initiative and resourcefulness.", "\"I would clarify the expected outcome, research documentation and examples, break the task into small steps, and ask an experienced colleague for guidance where needed — keeping my lead updated on progress.\"", "Show independence and knowing when to ask for help."),
  hr("If you get a better offer after joining, what will you do?", "Loyalty and integrity.", "\"Once I commit to a company, I honour that commitment. I'm choosing this role because of the learning and work, not only the salary.\"", "Be sincere; avoid sounding like you are still shopping around."),
];

const teamwork: RawQ[] = [
  hr("Do you prefer working alone or in a team?", "Whether you can do both.", "\"I'm comfortable with both. I enjoy focused individual work for deep tasks, and I value teamwork for brainstorming, reviews and delivering larger projects.\"", "Show flexibility; give a short example of each."),
  hr("What role do you usually take in a team?", "Self-awareness about your contribution.", "\"I often become the organiser — breaking work into tasks and tracking progress — while also doing my share of the technical work.\"", "Match the role to the job where possible."),
  hr("How do you motivate a team member who is not contributing?", "Leadership and empathy.", "\"I would talk to them privately to understand any problems, offer help, and agree on clear, small tasks with deadlines. Recognising their progress usually builds momentum.\"", "Start with understanding, not blame."),
  hr("Tell me about a successful team project.", "Collaboration and your specific contribution.", "\"In our smart-attendance project, four of us built a face-recognition system. I handled the backend and database. By splitting work clearly and integrating weekly, we finished early and won second prize at the department expo.\"", "Describe the team's result and your part."),
];

const closing: RawQ[] = [
  hr("What are your salary expectations?", "Whether your expectations fit their budget.", "\"As a fresher, I'm focused on learning and growth. I'm sure your offer will be in line with industry standards for this role, and I'm open to discussing it.\" (If pressed, give a researched range.)", "Research typical salaries for the role and city beforehand; give a range rather than a single number."),
  hr("Do you have any questions for us?", "Your genuine interest.", "\"What does a typical first month look like for someone in this role?\" or \"How is success measured for this position in the first year?\"", "Always ask one or two thoughtful questions; avoid asking about leave or salary first."),
  hr("When can you join?", "Your availability.", "\"I can join immediately after my final exams on [date].\" (Or: \"My notice period is 30 days.\")", "Be accurate; do not over-promise."),
  hr("Is there anything else you would like us to know?", "A final chance to make your case.", "\"I'd just like to add that I'm genuinely excited about this role — the work on [area] matches what I want to build my career in, and I'm ready to learn and contribute.\"", "Summarise your fit in one or two sentences."),
];

const subject: RawSubject = {
  "introduction-and-background": topic(intro, { intro: "First impressions matter. Prepare a crisp 60–90 second introduction connecting your background to the role.", title: "Questions & Answers" }),
  "strengths-and-weaknesses": topic(strengths, { intro: "Choose strengths relevant to the job and support them with evidence; present weaknesses honestly along with how you are improving.", title: "Questions & Answers" }),
  "career-goals": topic(goals, { intro: "Show ambition that fits the company's path and reassures the interviewer you plan to grow with them.", title: "Questions & Answers" }),
  "company-and-role": topic(company, { intro: "Research the company and role so you can explain specifically why you want this job and how you fit.", title: "Questions & Answers" }),
  "behavioural-questions": topic(behavioural, { intro: "Behavioural questions ask about past experiences. Answer with the STAR method: Situation, Task, Action, Result.", title: "Questions & Answers" }),
  "situational-questions": topic(situational, { intro: "Situational questions describe a hypothetical scenario. Show judgement, communication and responsibility.", title: "Questions & Answers" }),
  "teamwork-and-leadership": topic(teamwork, { intro: "Employers look for people who collaborate well and show initiative, even without a formal title.", title: "Questions & Answers" }),
  "salary-and-closing": topic(closing, { intro: "End the interview professionally: handle salary carefully, ask good questions and restate your interest.", title: "Questions & Answers" }),
};
export default subject;
