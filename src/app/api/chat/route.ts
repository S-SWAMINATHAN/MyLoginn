import OpenAI from "openai";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";
import type { Stream } from "openai/streaming";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTACT_EMAIL, CONTACT_PHONES, CONTACT_HOURS, WHATSAPP_PHONE } from "@/lib/contactInfo";

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
async function buildSystemPrompt() {
  const [courses, internships, tutors] = await Promise.all([
    prisma.course.findMany({
      select: { title: true, category: true, level: true, durationWeeks: true, price: true, description: true },
      orderBy: [{ featured: "desc" }, { studentsCount: "desc" }],
    }),
    prisma.internship.findMany({
      where: { applyDeadline: { gte: new Date() } },
      select: { title: true, type: true, paid: true, stipend: true, location: true, durationWeeks: true },
      orderBy: { featured: "desc" },
    }),
    prisma.tutor.findMany({
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

  return `You are the official AI assistant for MyLoginn, an AI-powered learning and digital growth company from India.

What MyLoginn offers:
1. Courses — advanced digital marketing and AI/ML courses (page: /courses)
2. Internships — real-world experience with mentors (page: /internships)
3. Student projects — portfolio-building with mentor feedback (page: /projects)
4. Tutoring — 1:1 mentor sessions and live classes for CBSE/State Board students (page: /tutoring)
5. Services for businesses — AI-driven digital marketing (/services/digital-marketing) and app & web development (/services/app-web-development)

Current course catalog:
${courseList || "- (catalog is being updated — direct the user to /courses)"}

Open internships:
${internshipList || "- (no open positions right now — direct the user to /internships to check back)"}

Tutors:
${tutorList || "- (tutor list is being updated — direct the user to /tutoring)"}

Contact:
- Email: ${CONTACT_EMAIL}
- Phone: ${phoneList} (${CONTACT_HOURS})
- WhatsApp: ${WHATSAPP_PHONE}
- Contact page: /contact
- New users sign up at /signup; existing users log in at /login. Payments are processed securely via Razorpay in INR.

How to behave:
- Answer only questions related to MyLoginn — its courses, internships, projects, tutoring, services, pricing, enrollment, and contact details. For unrelated topics, politely steer the conversation back to MyLoginn.
- Be warm, concise, and helpful. Keep answers short (2-5 sentences) unless the user asks for detail. Plain text only — no markdown headings or tables; simple hyphen lists are fine.
- When a page is relevant, mention its path (e.g. "see /courses") so the user can navigate there.
- Never invent prices, dates, or offerings that are not listed above. If you don't know, say so and share the contact details.`;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
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

  const history = rawMessages.slice(-MAX_TURNS).map((m) => ({ role: m.role, content: m.content }));
  const system = await buildSystemPrompt();
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://myloginn.com",
      "X-Title": "MyLoginn Chat",
    },
  });

  let stream: Stream<ChatCompletionChunk>;
  try {
    stream = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "openai/gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "system" as const, content: system }, ...history],
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("Chat API error:", error.status, error.message);
      const friendly =
        error.status === 401
          ? "The AI assistant's API key is invalid. Please contact us instead."
          : error.code === "insufficient_quota"
            ? "The AI assistant's account has run out of credits. Please contact us instead."
            : "The AI assistant is temporarily unavailable. Please try again in a moment.";
      return NextResponse.json({ error: `${friendly} Email: ${CONTACT_EMAIL}` }, { status: 502 });
    }
    throw error;
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.error(error);
      }
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
