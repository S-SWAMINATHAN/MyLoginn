import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sceneSchema = z.object({
  heading: z.string().min(1).max(90),
  caption: z.string().min(1).max(180),
  visual: z.enum(["concept", "flow", "code", "result"]),
  code: z.string().max(240).optional(),
});
const requestSchema = z.object({
  courseId: z.string().min(1),
  topic: z.string().trim().min(2).max(100),
  context: z.string().trim().max(1200).optional().default(""),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [courses, explanations] = await Promise.all([
    prisma.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.visualExplanation.findMany({ include: { course: { select: { title: true } } }, orderBy: { updatedAt: "desc" } }),
  ]);
  return NextResponse.json({ courses, explanations });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { courseId, topic, context } = parsed.data;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true, category: true, level: true } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI generation is not configured. Set OPENROUTER_API_KEY to enable it." }, { status: 503 });

  try {
    const client = new OpenAI({ apiKey, baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1" });
    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 1100,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Create a short beginner-friendly storyboard for a silent educational explainer animation. Return JSON only: {summary:string, scenes:[{heading:string,caption:string,visual:'concept'|'flow'|'code'|'result',code?:string}]}. Make exactly 4 scenes. Keep each caption under 20 words and code under 3 lines. A scene must communicate visually using labels, arrows, and simple shapes; avoid narration and unsupported claims." },
        { role: "user", content: `Course: ${course.title} (${course.category}, ${course.level}). Topic: ${topic}. Additional lesson context: ${context || "Explain the core idea from first principles."}` },
      ],
    });
    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) throw new Error("The AI returned an empty storyboard.");
    const storyboard = z.object({ summary: z.string().min(1).max(300), scenes: z.array(sceneSchema).length(4) }).parse(JSON.parse(rawOutput));
    const explanation = await prisma.visualExplanation.create({ data: { courseId, topic, ...storyboard } });
    return NextResponse.json({ explanation: { ...explanation, course: { title: course.title } } }, { status: 201 });
  } catch (error) {
    console.error("Visual explanation generation failed:", error);
    return NextResponse.json({ error: "Could not create the explanation. Please try again." }, { status: 502 });
  }
}
