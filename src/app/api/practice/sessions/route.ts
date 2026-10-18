import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, readBody } from "@/lib/logiquest/http";
import { isAiConfigured } from "@/lib/practice/ai";
import { canStartSession, toJson } from "@/lib/practice/sessions";
import { typeById } from "@/lib/practice/interview/config";
import { normalizeConfig, startState } from "@/lib/practice/interview/engine";
import { normalizeSpeakingConfig, speakingTitle, type SpeakingState } from "@/lib/practice/speaking/engine";

/** Starts an interview or a speaking-lab session. The first question is ready immediately (no AI wait). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in to start practising.", 401);
  if (!isAiConfigured()) return err("AI practice is not available right now. Please try again later.", 503);
  const body = await readBody<{ module?: unknown; config?: unknown }>(request, 12_000);
  const input = body?.config && typeof body.config === "object" ? (body.config as Record<string, unknown>) : null;
  if (!input) return err("Invalid request.", 400);
  if (!(await canStartSession(user.id))) return err("You have reached today's practice limit. Please continue tomorrow.", 429);

  if (body?.module === "INTERVIEW") {
    const config = normalizeConfig(input);
    if (!config) return err("Please choose an interview type.", 400);
    const state = startState(config, user.name);
    const session = await prisma.practiceSession.create({
      data: { userId: user.id, module: "INTERVIEW", mode: config.type, title: typeById(config.type)!.label, config: toJson(config), state: toJson(state) },
      select: { id: true },
    });
    return NextResponse.json({ id: session.id });
  }

  if (body?.module === "SPEAKING") {
    const config = normalizeSpeakingConfig(input);
    if (!config) return err("Please choose an exercise.", 400);
    const state: SpeakingState = { cursor: 0, attempts: 0, n: 0 };
    const session = await prisma.practiceSession.create({
      data: { userId: user.id, module: "SPEAKING", mode: config.kind, title: speakingTitle(config), config: toJson(config), state: toJson(state) },
      select: { id: true },
    });
    return NextResponse.json({ id: session.id });
  }

  return err("Unknown practice module.", 400);
}
