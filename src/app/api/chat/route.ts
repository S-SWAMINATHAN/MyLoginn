import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTACT_EMAIL, CONTACT_PHONES, CONTACT_HOURS, WHATSAPP_PHONE } from "@/lib/contactInfo";
import { MyBuddyError, isMyBuddyConfigured, streamMyBuddyReply } from "@/lib/mybuddy";
import { GeminiError, isGeminiConfigured, streamGeminiReply } from "@/lib/gemini";
import { isOpenAIConfigured, OpenAIChatError, streamOpenAIReply } from "@/lib/openai";
import { GroqChatError, isGroqConfigured, streamGroqReply } from "@/lib/groq";
import { HIDE_TUTORING } from "@/lib/hiddenSections";
import { formatDuration } from "@/lib/postings";
import { REQUEST_SCOPED_STYLE, currentDateTimeContext, detectTopics, type ChatTopic } from "@/lib/chatIntent";

export const runtime = "nodejs";

const MAX_TURNS = 20;
const MAX_MESSAGE_CHARS = 2000;

type ChatTurn = { role: "user" | "assistant"; content: string };

function isChatTurn(value: unknown): value is ChatTurn {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "assistant") &&
    typeof v.content === "string" &&
    v.content.length > 0 &&
    v.content.length <= MAX_MESSAGE_CHARS
  );
}

/** Company knowledge is pulled live from the DB so the agent never answers from stale hardcoded data. */
async function buildSystemPrompt(topics: Set<ChatTopic>) {
  // Auto-route by request: an unrecognised request gets everything, a recognised one only what it needs.
  const all = topics.size === 0;
  const wants = (t: ChatTopic) => !(HIDE_TUTORING && t === "tutoring") && (all || topics.has(t));
  const noRows = Promise.resolve([] as never[]);
  const [courses, internships, tutors] = await Promise.all([
    !wants("courses") ? noRows : prisma.course.findMany({
      where: { status: "published" },
      select: { title: true, category: true, level: true, durationWeeks: true, price: true, description: true },
      orderBy: [{ featured: "desc" }, { studentsCount: "desc" }],
    }),
    !wants("internships") ? noRows : prisma.internship.findMany({
      where: { status: "open" },
      select: { title: true, type: true, paid: true, stipend: true, location: true, durationWeeks: true, durationUnit: true },
      orderBy: { featured: "desc" },
    }),
    !wants("tutoring") ? noRows : prisma.tutor.findMany({
      select: { name: true, subject: true, boards: true, experienceYears: true },
    }),
  ]);

  const courseList = courses
    .map((c) => `- ${c.title} (${c.category}, ${c.level}, ${c.durationWeeks} weeks, ₹${c.price}): ${c.description}`)
    .join("\n");
  const internshipList = internships
    .map(
      (i) =>
        `- ${i.title} (${[i.type, i.location, formatDuration(i.durationWeeks, i.durationUnit)].filter(Boolean).join(", ")}, ${
          i.paid ? `paid${i.stipend ? ` — stipend ₹${i.stipend}/mo` : ""}` : "unpaid"
        })`
    )
    .join("\n");
  const tutorList = tutors
    .map((t) => `- ${t.name} — ${t.subject} (${t.boards}, ${t.experienceYears}+ yrs experience)`)
    .join("\n");
  const phoneList = CONTACT_PHONES.map((p) => p.display).join(", ");

  const sections: string[] = [];
  if (wants("courses"))
    sections.push(`Current course catalog:\n${courseList || "- (catalog is being updated — direct the user to /courses)"}`);
  if (wants("internships"))
    sections.push(
      `Open internships:\n${internshipList || "- (no open positions right now — direct the user to /internships to check back)"}`
    );
  if (wants("tutoring"))
    sections.push(`Tutors:\n${tutorList || "- (tutor list is being updated — direct the user to /tutoring)"}`);
  // Core focus: business services are always in the prompt, whatever the topic.
  sections.push(`Business services (MyLoginn's main offering; India-based team serving businesses across India, Coimbatore, Tamil Nadu and internationally, working remotely):
1. Software, web & app development (/services/app-web-development): business websites and landing pages; web applications, dashboards and internal tools; Android, iOS and cross-platform apps; desktop applications and custom business software (billing, inventory, management systems); UI/UX implementation; backend, APIs and integrations; database design and authentication; cloud deployment; testing, maintenance and performance. Can also work on an existing product. Technology stack is chosen per project; scope and deliverables are agreed before work begins.
2. Digital marketing & SEO (/services/digital-marketing): search and content strategy (SEO), social media on Instagram, Facebook, YouTube and LinkedIn, paid campaign planning and setup for Google Ads and Meta Ads (ad spend and account access agreed separately), lead-generation paths, analytics and performance review. Never guarantee leads, rankings or return on ad spend.
3. AI development (/services/ai-development): generative AI features, chatbots and support assistants that answer from your own documents (RAG), AI agents and workflow automation, integration into existing software/CRM/ERP. NDA available before discussing an idea; ownership is set out in the project agreement.
4. Software testing & automation (/services/testing-automation): manual functional and regression testing, API testing, Playwright browser automation, CI/CD integration; can test applications MyLoginn did not build.
- Pricing is quoted per project after understanding requirements; never state a price or timeline for these services. To get a quote or proposal, use the enquiry form on the relevant service page or contact the team (/contact). Tamil Nadu businesses: /locations/tamil-nadu`);
  if (wants("projects"))
    sections.push(`Projects:
- /projects shows client websites and products MyLoginn has built and launched (each has its own page, e.g. /projects/<name>), plus any learner projects from MyLoginn Learn. Logged-in learners track their assigned projects, mentor feedback and progress in /dashboard.`);
  if (wants("astrology"))
    sections.push(`Astrology services (Tamil/English, no account needed to buy; pay securely via Razorpay):
- Overview and Kanitha Jathagam (computed horoscope report): /services/astrology
- Horoscope: /services/astrology/horoscope; KP report: /services/astrology/kp-report; Kalai report: /services/astrology/kalai-report
- Horoscope matching: /services/astrology/porutham, /services/astrology/kalai-matching, /services/astrology/match-finder, /services/astrology/star-match
- Auspicious timing: /services/astrology/muhurtha
- Baby names by star: /services/astrology/baby-names and /services/astrology/kalai-baby-names; other tools: /services/astrology/kalai-utilities
- Printable/downloadable report unlock prices (base): single-page horoscope Rs 20, full horoscope Rs 499, horoscope matching Rs 299. Final price is shown at checkout.
- Do not give astrological predictions yourself; send the user to the right tool page.`);
  if (wants("platform"))
    sections.push(`Learning platform features:
- Sign up at /signup, log in at /login; students get a personal /dashboard and /profile.
- Course learning pages include lessons, practice challenges, SQL practice, progress tracking and downloadable certificates.
- Students earn reward points and daily login streaks; ranks are shown on /leaderboard.
- Company information: /about. Policies: /privacy and /terms.`);
  if (wants("contact") || sections.length === 0)
    sections.push(`Contact:
- Email: ${CONTACT_EMAIL}
- Phone: ${phoneList} (${CONTACT_HOURS})
- WhatsApp: ${WHATSAPP_PHONE}
- Contact page: /contact
- New users sign up at /signup; existing users log in at /login. Payments are processed securely via Razorpay in INR.`);

  return `${currentDateTimeContext()}

You are the official AI assistant for MyLoginn (MyLoginn Tech), a technology company from India that builds digital products, software, AI solutions and digital growth systems for businesses.

What MyLoginn offers:
1. Five core services for businesses (overview: /services) — Web Development and App Development (/services/app-web-development), Desktop Applications and custom business software (/services/app-web-development), AI Agents and automation (/services/ai-development), and Digital Marketing (/services/digital-marketing). To start a project, point people to /contact.
2. Client work — websites and products MyLoginn has built (page: /projects)
3. MyLoginn Learn — a separate learning platform with technology courses (/courses) and internships (/internships)

Lead with the business services unless the user asks about learning.

${sections.join("\n\n")}

How to behave:
- Answer only questions related to MyLoginn — its services, projects, pricing, contact details, and MyLoginn Learn (courses, internships, enrollment). For unrelated topics, politely steer the conversation back to MyLoginn.
- Be warm, concise, and helpful. Keep answers short (2-5 sentences) unless the user asks for detail. Plain text only — no markdown headings or tables; simple hyphen lists are fine.
- When a page is relevant, mention its path (e.g. "see /courses") so the user can navigate there.
- MyLoginn does not offer tutoring or school-subject classes; say so if asked and point to /courses.
- Never invent prices, dates, or offerings that are not listed above. If you don't know, say so and share the contact details.

${REQUEST_SCOPED_STYLE}`;
}

export async function POST(req: Request) {
  const useGemini = isGeminiConfigured();
  const useGroq = isGroqConfigured();
  const useOpenAI = isOpenAIConfigured();
  const useMyBuddy = isMyBuddyConfigured();
  if (!useGemini && !useGroq && !useOpenAI && !useMyBuddy) {
    return NextResponse.json(
      { error: `The AI assistant isn't configured yet. Please reach us at ${CONTACT_EMAIL}.` },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0 || !rawMessages.every(isChatTurn)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }
  if (rawMessages[rawMessages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
  }

  const history = rawMessages.slice(-MAX_TURNS);
  const latest = history[history.length - 1];
  const earlier = history.slice(0, -1);
  const topics = detectTopics(history.filter((m) => m.role === "user").map((m) => m.content));

  const system = await buildSystemPrompt(topics);

  // Providers are tried in this order on every request; quota errors naturally fail over without
  // relying on process-local state or assuming all providers reset on the same monthly schedule.
  const providers: {
    name: string;
    start: () => Promise<{ stream: ReadableStream<Uint8Array> }>;
  }[] = [];
  if (useGemini) providers.push({ name: "Gemini", start: () => streamGeminiReply(system, history, req.signal) });
  if (useGroq) providers.push({ name: "Groq", start: () => streamGroqReply(system, history, req.signal) });
  if (useOpenAI) providers.push({ name: "OpenAI", start: () => streamOpenAIReply(system, history, req.signal) });

  let myBuddySystem = system;
  // Each MyBuddy request runs in a fresh conversation, so earlier turns ride along in the instructions.
  if (useMyBuddy && earlier.length > 0) {
    const transcript = earlier.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
    myBuddySystem += `\n\nConversation so far (for context only):\n${transcript}`;
  }
  if (useMyBuddy) {
    providers.push({
      name: "MyBuddy",
      start: async () => {
        const { stream } = await streamMyBuddyReply(myBuddySystem, latest.content, req.signal);
        return { stream };
      },
    });
  }

  for (const provider of providers) {
    try {
      const { stream } = await provider.start();
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (req.signal.aborted) throw error;
      const kind =
        error instanceof GeminiError ||
        error instanceof GroqChatError ||
        error instanceof OpenAIChatError ||
        error instanceof MyBuddyError
          ? error.kind
          : "unavailable";
      console.error(`${provider.name} chat error:`, kind);
    }
  }

  return NextResponse.json(
    { error: `All configured AI providers are currently unavailable or have reached their limits. Please try again later. Email: ${CONTACT_EMAIL}` },
    { status: 502 }
  );
}
