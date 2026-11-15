import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allow } from "@/lib/logiquest/rateLimit";

const clean = (value: unknown, max: number) => typeof value === "string"
  ? value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max)
  : "";

export async function GET(request: Request) {
  const featuredOnly = new URL(request.url).searchParams.get("featured") === "1";
  const reviews = await prisma.customerReview.findMany({
    where: { status: "APPROVED", published: true, ...(featuredOnly ? { featured: true } : {}) },
    orderBy: [{ sortOrder: "asc" }, { submittedAt: "desc" }],
    select: { id: true, name: true, company: true, rating: true, content: true, submittedAt: true },
    ...(featuredOnly ? { take: 6 } : {}),
  });
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(`review:${ip}`, 3, 60 * 60 * 1000)) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (clean(body?.website, 200)) return NextResponse.json({ ok: true }, { status: 202 });
  const name = clean(body?.name, 100);
  const email = clean(body?.email, 254).toLowerCase();
  const company = clean(body?.company, 120);
  const content = clean(body?.content, 2000);
  const rating = Number(body?.rating);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || content.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Check your name, email, rating and review (at least 10 characters)." }, { status: 400 });
  }
  await prisma.customerReview.create({ data: { name, email, company: company || null, content, rating } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
