import { NextResponse } from "next/server";
import { comparePracticeSql, executePracticeSql } from "@/lib/freeCoursePracticeDb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { query?: unknown; expectedQuery?: unknown } | null;
  if (typeof body?.query !== "string" || !body.query.trim()) {
    return NextResponse.json({ error: "Enter a SQL query to run." }, { status: 400 });
  }

  try {
    if (typeof body.expectedQuery === "string") {
      const result = await comparePracticeSql(body.query, body.expectedQuery);
      return NextResponse.json(result);
    }
    return NextResponse.json(await executePracticeSql(body.query));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The SQL query could not be run.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
