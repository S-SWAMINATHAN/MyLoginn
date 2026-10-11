import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTACT_EMAIL, CONTACT_PHONES, CONTACT_HOURS, WHATSAPP_PHONE } from "@/lib/contactInfo";
import { MyBuddyError, isMyBuddyConfigured, streamMyBuddyReply } from "@/lib/mybuddy";
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
  const wants = (t: ChatTopic) => all || topics.has(t);
  const noRows = Promise.resolve([] as never[]);
  const [courses, internships, tutors] = await Promise.all([
    !wants("courses") ? noRows : prisma.course.findMany({
      select: { title: true, category: true, level: true, durationWeeks: true, price: true, description: true },
      orderBy: [{ featured: "desc" }, { studentsCount: "desc" }],
    }),
    !wants("internships") ? noRows : prisma.internship.findMany({
      where: { applyDeadline: { gte: new Date() } },
      select: { title: true, type: true, paid: true, stipend: true, location: true, durationWeeks: true },
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
        `- ${i.title} (${i.type}, ${i.location}, ${i.durationWeeks} weeks, ${
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
  if (wants("contact") || sections.length === 0)
    sections.push(`Contact:
- Email: ${CONTACT_EMAIL}
- Phone: ${phoneList} (${CONTACT_HOURS})
- WhatsApp: ${WHATSAPP_PHONE}
- Contact page: /contact
- New users sign up at /signup; existing users log in at /login. Payments are processed securely via Razorpay in INR.`);

  return `${currentDateTimeContext()}

You are the official AI assistant for MyLoginn, an AI-powered learning and digital growth company from India.

What MyLoginn offers:
1. Courses — advanced digital marketing and AI/ML courses (page: /courses)
2. Internships — real-world experience with mentors (page: /internships)
3. Student projects — portfolio-building with mentor feedback (page: /projects)
4. Tutoring — 1:1 mentor sessions and live classes for CBSE/State Board students (page: /tutoring)
5. Services for businesses — AI-driven digital marketing (/services/digital-marketing) and app & web development (/services/app-web-development)

${sections.join("\n\n")}

How to behave:
- Answer only questions related to MyLoginn — its courses, internships, projects, tutoring, services, pricing, enrollment, and contact details. For unrelated topics, politely steer the conversation back to MyLoginn.
- Be warm, concise, and helpful. Keep answers short (2-5 sentences) unless the user asks for detail. Plain text only — no markdown headings or tables; simple hyphen lists are fine.
- When a page is relevant, mention its path (e.g. "see /courses") so the user can navigate there.
- Never invent prices, dates, or offerings that are not listed above. If you don't know, say so and share the contact details.

${REQUEST_SCOPED_STYLE}`;
}

export async function POST(req: Request) {
  if (!isMyBuddyConfigured()) {
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

  // Each request runs in a fresh MyBuddy conversation, so earlier turns ride along in the instructions.
  let system = await buildSystemPrompt(topics);
  if (earlier.length > 0) {
    const transcript = earlier.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
    system += `\n\nConversation so far (for context only):\n${transcript}`;
  }

  try {
    const { stream } = await streamMyBuddyReply(system, latest.content, req.signal);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("MyBuddy error:", error);
    const friendly =
      error instanceof MyBuddyError && error.kind === "auth"
        ? "The AI assistant's login is invalid. Please contact us instead."
        : "The AI assistant is temporarily unavailable. Please try again in a moment.";
    return NextResponse.json({ error: `${friendly} Email: ${CONTACT_EMAIL}` }, { status: 502 });
  }
}
