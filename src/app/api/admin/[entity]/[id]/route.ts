import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminEntities } from "@/lib/adminEntities";

type Params = { params: Promise<{ entity: string; id: string }> };

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

export async function PATCH(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { entity, id } = await params;
  const def = adminEntities[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  if (!def.update) return NextResponse.json({ error: "Update not supported" }, { status: 405 });

  try {
    const row = await def.update(id, await req.json());
    return NextResponse.json({ row });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { entity, id } = await params;
  const def = adminEntities[entity];
  if (!def) return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  if (!def.remove) return NextResponse.json({ error: "Delete not supported" }, { status: 405 });

  try {
    await def.remove(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
