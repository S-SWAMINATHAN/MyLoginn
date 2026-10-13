/**
 * Request-driven auto-response for the AI chat, ported from MyBuddy's chat pipeline
 * (https://github.com/S-SWAMINATHAN/MyBuddy): every reply is shaped by what the user just
 * asked — grounded date/time, a strict "answer only what was asked" style, and per-request
 * routing so only the relevant knowledge is handed to the model.
 */

export type ChatTopic = "courses" | "internships" | "tutoring" | "projects" | "services" | "astrology" | "platform" | "contact" | "greeting";

const TOPIC_PATTERNS: Record<Exclude<ChatTopic, "greeting">, RegExp> = {
  courses: /\b(course|courses|class|classes|learn|learning|syllabus|curriculum|fee|fees|price|pricing|cost|enrol|enroll|enrolment|enrollment|certificate|digital marketing|seo|ai|ml|machine learning|python|java|testing|selenium|sql|programming|coding)\b/i,
  internships: /\b(internship|internships|intern|stipend|apply|application|deadline|placement|job|jobs|career)\b/i,
  tutoring: /\b(tutor|tutors|tutoring|tuition|cbse|state board|mentor session|1[: ]?1|one[- ]on[- ]one|live class|school)\b/i,
  projects: /\b(project|projects|portfolio|capstone)\b/i,
  services: /\b(service|services|website|web app|app development|mobile app|development|marketing for|agency|business|quote|proposal|software|automation|testing automation|ai development|chatbot)\b/i,
  astrology: /(astrology|astrologer|horoscope|jathagam|jaathagam|kundali|kundli|rasi|nakshatra|star|porutham|matching|muhurtha|muhurtham|baby names?|name suggestion|kp|kalai|panchang|dosha|dasha|birth chart)/i,
  platform: /(points|reward|rewards|leaderboard|streak|dashboard|certificate|sql|practice|challenge|challenges|free course|free courses|lms|progress|about|company|who are you|location|tamil nadu|chennai|coimbatore|office|founder|team)/i,
  contact: /\b(contact|email|e-mail|phone|call|whatsapp|address|reach|support|hours|timing|timings|login|log in|sign ?up|register|payment|pay|razorpay|refund)\b/i,
};

const GREETING_PATTERN = /^\s*(hi|hello|hey|hii+|good (morning|afternoon|evening)|namaste|vanakkam|thanks|thank you|ok|okay)\b[\s!.?]*$/i;

/** Which knowledge areas the latest request touches. Follow-ups with no keywords inherit the previous request's topics. */
export function detectTopics(userTurns: string[]): Set<ChatTopic> {
  for (let i = userTurns.length - 1; i >= 0; i--) {
    const text = userTurns[i];
    if (GREETING_PATTERN.test(text)) {
      if (i === userTurns.length - 1) return new Set<ChatTopic>(["greeting"]);
      continue;
    }
    const found = new Set<ChatTopic>();
    for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
      if (pattern.test(text)) found.add(topic as ChatTopic);
    }
    if (found.size > 0) return found;
  }
  return new Set<ChatTopic>();
}

/** Always-on grounding: a model can't know "right now" on its own. */
export function currentDateTimeContext(now = new Date()): string {
  const ist = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  }).format(now);
  return `Current date and time (IST): ${ist}.`;
}

/** Strict request-scoped answer style — reply to exactly what was asked, nothing more. */
export const REQUEST_SCOPED_STYLE = `Response rules (apply to every reply):
- Respond only to what the user's latest message actually asks. Do not add unsolicited extras: no extra suggestions, no promotional pitches (one short clarifying question is fine when a business visitor describes a project or need), no recap of things not asked about.
- Match the scope and length of the request: a simple question gets a one- or two-sentence answer; only give detail or lists when the user asks for detail, a list, or a comparison.
- Honor every explicit detail in the request (a specific course, price, duration, location). A stated requirement overrides any default.
- For a greeting or thanks, reply with one short friendly line and nothing else.
- Use the date/time given above for any question about today, deadlines or "now"; never guess it.`;
