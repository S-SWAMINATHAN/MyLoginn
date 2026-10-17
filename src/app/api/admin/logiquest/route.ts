import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuestion, invalidateHidden } from "@/lib/logiquest/bank";
import { err, readBody } from "@/lib/logiquest/http";

type Body = { action?: string; id?: string; qid?: string; note?: string };

/**
 * Admin moderation for LogiQuest:
 *  resolve / dismiss / reopen  a report (id)
 *  hide / unhide               a question (qid) - hidden questions disappear from practice and tests
 *  hideComment / showComment   a discussion message (id)
 */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return err("Not allowed.", 403);
  const body = await readBody<Body>(request, 2000);
  if (!body?.action) return err("Invalid request.", 400);

  switch (body.action) {
    case "resolve":
    case "dismiss":
    case "reopen": {
      if (!body.id) return err("Missing report id.", 400);
      const status = body.action === "resolve" ? "RESOLVED" : body.action === "dismiss" ? "DISMISSED" : "OPEN";
      await prisma.lqReport.update({ where: { id: body.id }, data: { status } });
      break;
    }
    case "hide": {
      if (!body.qid || !(await getQuestion(body.qid, true))) return err("Question not found.", 404);
      await prisma.lqHidden.upsert({ where: { qid: body.qid }, create: { qid: body.qid, note: body.note?.slice(0, 500) }, update: { note: body.note?.slice(0, 500) } });
      invalidateHidden();
      break;
    }
    case "unhide": {
      if (!body.qid) return err("Missing question id.", 400);
      await prisma.lqHidden.deleteMany({ where: { qid: body.qid } });
      invalidateHidden();
      break;
    }
    case "hideComment":
    case "showComment": {
      if (!body.id) return err("Missing comment id.", 400);
      await prisma.lqComment.update({ where: { id: body.id }, data: { hidden: body.action === "hideComment" } });
      break;
    }
    default:
      return err("Unknown action.", 400);
  }
  return NextResponse.json({ ok: true });
}
