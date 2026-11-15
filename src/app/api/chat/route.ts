import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { CONTACT_EMAIL, CONTACT_PHONES, CONTACT_HOURS, WHATSAPP_PHONE } from "@/lib/contactInfo";
import { HIDE_TUTORING } from "@/lib/hiddenSections";
import { formatDuration } from "@/lib/postings";
import { REQUEST_SCOPED_STYLE, currentDateTimeContext, detectTopics, type ChatTopic } from "@/lib/chatIntent";

export const runtime = "nodejs";

const MAX_TURNS = 20;
const MAX_MESSAGE_CHARS = 2000;

type ChatTurn = { role: "user" | "assistant"; content: string };

function rowsOrEmpty<T>(result: PromiseSettledResult<T[]>, source: string): T[] {
  if (result.status === "fulfilled") return result.value;
  console.error(`Chat live ${source} lookup failed; continuing without live ${source} data.`);
  return [];
}

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

async function* openAITextDeltas(
  apiKey: string,
  instructions: string,
  history: ChatTurn[],
  signal: AbortSignal
): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey });
  const stream = await client.responses.create({
    model: process.env.OPENAI_CHAT_MODEL || "gpt-6-luna",
    instructions,
    input: history.map(({ role, content }) => ({ role, content })),
    max_output_tokens: 1024,
    store: false,
    stream: true,
  }, { signal });

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") yield event.delta;
    if (event.type === "response.failed") throw new Error(event.response.error?.message || "OpenAI response failed");
    if (event.type === "error") throw new Error(event.message || "OpenAI response failed");
  }
}

async function* anthropicTextDeltas(
  token: string,
  instructions: string,
  history: ChatTurn[],
  signal: AbortSignal
): AsyncGenerator<string> {
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/+$/, "");
  const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/messages` : `${baseUrl}/v1/messages`;
  const response = await fetch(endpoint, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "anthropic-version": "2023-06-01",
      "x-api-key": token,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_CHAT_MODEL || "claude-haiku-4-5-20251001",
      system: instructions,
      messages: history.map(({ role, content }) => ({ role, content })),
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Anthropic-compatible provider returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  if (!response.body) throw new Error("Anthropic-compatible provider returned no stream");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = done ? "" : events.pop() ?? "";
      for (const event of events) {
        const data = event.split(/\r?\n/).find((line) => line.startsWith("data:"))?.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const item = JSON.parse(data) as { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } };
          if (item.type === "content_block_delta" && item.delta?.type === "text_delta" && item.delta.text) yield item.delta.text;
          if (item.type === "error") throw new Error(item.error?.message || "Anthropic-compatible stream failed");
        } catch (error) {
          if (error instanceof SyntaxError) continue;
          throw error;
        }
      }
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Company knowledge is pulled live from the DB so the agent never answers from stale hardcoded data. */
async function buildSystemPrompt(topics: Set<ChatTopic>) {
  // Auto-route by request: an unrecognised request gets everything, a recognised one only what it needs.
  const all = topics.size === 0;
  const wants = (t: ChatTopic) => !(HIDE_TUTORING && t === "tutoring") && (all || topics.has(t));
  const noRows = Promise.resolve([] as never[]);
  const [coursesResult, internshipsResult, tutorsResult] = await Promise.allSettled([
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
  const courses = rowsOrEmpty(coursesResult, "course");
  const internships = rowsOrEmpty(internshipsResult, "internship");
  const tutors = rowsOrEmpty(tutorsResult, "tutor");

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
  const topics = detectTopics(history.filter((m) => m.role === "user").map((m) => m.content));

  const system = await buildSystemPrompt(topics);
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicToken = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!openAiKey && !anthropicToken) {
    return NextResponse.json({ error: "Configure OPENAI_API_KEY or ANTHROPIC_AUTH_TOKEN in the server environment." }, { status: 503 });
  }

  const abortController = new AbortController();
  req.signal.addEventListener("abort", () => abortController.abort(), { once: true });

  const providers: { name: string; start: () => AsyncGenerator<string> }[] = [];
  if (openAiKey) providers.push({ name: "OpenAI", start: () => openAITextDeltas(openAiKey, system, history, abortController.signal) });
  if (anthropicToken) providers.push({ name: "Anthropic-compatible", start: () => anthropicTextDeltas(anthropicToken, system, history, abortController.signal) });

  let selected: AsyncIterator<string> | undefined;
  let firstDelta: IteratorResult<string> | undefined;
  const failures: string[] = [];
  for (const provider of providers) {
    const iterator = provider.start()[Symbol.asyncIterator]();
    try {
      const first = await iterator.next();
      if (first.done) throw new Error("Provider returned an empty reply");
      selected = iterator;
      firstDelta = first;
      break;
    } catch (error) {
      if (abortController.signal.aborted) break;
      const detail = error instanceof Error ? error.message : "Unknown provider error";
      failures.push(`${provider.name}: ${detail}`);
      console.error(`${provider.name} chat failed; trying the next configured provider.`, error);
      await iterator.return?.(undefined);
    }
  }

  if (!selected || !firstDelta || abortController.signal.aborted) {
    const message = failures.some((failure) => /401|403|auth|api.?key|token/i.test(failure))
      ? "The configured AI provider credentials were rejected. Replace the server-side key or token."
      : failures.some((failure) => /429|quota|usage limit/i.test(failure))
        ? "The configured AI providers are busy or have reached their usage limits. Please try again later."
        : "The chat assistant could not connect. Check the server-side AI provider configuration and try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const bodyStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(firstDelta.value));
      void pump();

      async function pump() {
      try {
        while (true) {
          const next = await selected!.next();
          if (next.done) break;
          controller.enqueue(encoder.encode(next.value));
        }
        controller.close();
      } catch (error) {
        if (!abortController.signal.aborted) console.error("OpenAI chat stream failed", error);
        controller.error(error);
      }
      }
    },
    async cancel() {
      abortController.abort();
      await selected?.return?.();
    },
  });

  return new Response(bodyStream, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
