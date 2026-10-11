import { NextResponse } from "next/server";
import { isAstroProduct } from "@/lib/astrology/access";
import { getBuyer, hasAstrologyAccess } from "@/lib/astrologyAccess";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { product?: unknown; reportKey?: unknown } | null;
  if (!body || !isAstroProduct(body.product) || typeof body.reportKey !== "string" || !body.reportKey) {
    return NextResponse.json({ error: "product and reportKey are required" }, { status: 400 });
  }
  const unlocked = await hasAstrologyAccess(await getBuyer(), { product: body.product, reportKey: body.reportKey });
  return NextResponse.json({ unlocked });
}
