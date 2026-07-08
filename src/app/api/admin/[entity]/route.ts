import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminEntities } from "@/lib/adminEntities";

function errorResponse(err: unknown) {
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    const field = issue?.path.join(".") ?? "";
    return NextResponse.json(
      { error: field ? `${field}: ${issue?.message}` : issue?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  console.error("[admin api]", err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

export async function GET(_req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { entity } = await params;
  const def = adminEntities[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });

  const rows = await def.list();
  return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { entity } = await params;
  const def = adminEntities[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  if (!def.create) return NextResponse.json({ error: "Create not supported" }, { status: 405 });

  try {
    const row = await def.create(await req.json());
    return NextResponse.json({ row }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
