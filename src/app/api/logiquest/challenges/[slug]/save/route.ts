import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { err, loadChallengeForUser, readBody } from "@/lib/logiquest/api";
import { LANGUAGES, MAX_SOURCE_BYTES } from "@/lib/logiquest/constants";

type Body = { type?: string; language?: string; source?: string; body?: string; kind?: string };
const KINDS = ["SAVED", "REVIEW_LATER", "DIFFICULT"];

/** Per-learner private data for one challenge: code draft (autosave), private note, bookmarks. */
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadChallengeForUser(slug);
  if ("error" in loaded) return loaded.error;
  const { user, challenge } = loaded;
  const body = await readBody<Body>(request);
  if (!body) return err("Invalid request.", 400);

  if (body.type === "draft") {
    if (typeof body.language !== "string" || !LANGUAGES[body.language] || !challenge.languages.includes(body.language) || typeof body.source !== "string" || Buffer.byteLength(body.source) > MAX_SOURCE_BYTES) return err("Invalid draft.", 400);
    await prisma.lqDraft.upsert({
      where: { userId_challengeId_language: { userId: user.id, challengeId: challenge.id, language: body.language } },
      create: { userId: user.id, challengeId: challenge.id, language: body.language, source: body.source },
      update: { source: body.source },
    });
    return NextResponse.json({ ok: true });
  }
  if (body.type === "note") {
    if (typeof body.body !== "string" || body.body.length > 5000) return err("Notes can be up to 5,000 characters.", 400);
    if (!body.body.trim()) await prisma.lqNote.deleteMany({ where: { userId: user.id, challengeId: challenge.id } });
    else await prisma.lqNote.upsert({ where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } }, create: { userId: user.id, challengeId: challenge.id, body: body.body }, update: { body: body.body } });
    return NextResponse.json({ ok: true });
  }
  if (body.type === "bookmark") {
    const kind = body.kind ?? "SAVED";
    if (!KINDS.includes(kind)) return err("Invalid bookmark.", 400);
    const where = { userId_challengeId_kind: { userId: user.id, challengeId: challenge.id, kind } };
    const existing = await prisma.lqBookmark.findUnique({ where });
    if (existing) await prisma.lqBookmark.delete({ where });
    else await prisma.lqBookmark.create({ data: { userId: user.id, challengeId: challenge.id, kind } });
    return NextResponse.json({ bookmarked: !existing });
  }
  return err("Invalid request.", 400);
}
