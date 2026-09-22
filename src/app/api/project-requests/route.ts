import { NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { projectRequestSchema } from "@/lib/validation";

const serviceCodes = { web: "WEB", mobile: "APP", software: "SW", marketing: "DM" } as const;
const rateLimit = new Map<string, { count: number; reset: number }>();
const allowedTypes = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg", "image/webp"]);

export const runtime = "nodejs";

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.reset < now) {
    rateLimit.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(forwarded)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    const formData = contentType.includes("multipart/form-data") ? await req.formData() : null;
    const rawData = formData ? formData.get("data") : await req.json();
    const parsed = projectRequestSchema.safeParse(typeof rawData === "string" ? JSON.parse(rawData) : rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    const data = parsed.data;
    const attachments = formData ? formData.getAll("attachments").filter((item): item is File => item instanceof File && item.size > 0) : [];
    if (attachments.length > 4 || attachments.some((file) => file.size > 5 * 1024 * 1024 || !allowedTypes.has(file.type))) {
      return NextResponse.json({ error: "Attach up to four PDF, Word, PNG, JPG, or WebP files (5 MB each)." }, { status: 400 });
    }
    const recent = await prisma.projectRequest.findFirst({
      where: { email: data.email, service: data.service, createdAt: { gte: new Date(Date.now() - 10 * 60_000) } },
      orderBy: { createdAt: "desc" },
    });
    if (recent) return NextResponse.json({ requestId: recent.requestId, duplicate: true });

    const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const requestId = `ML-${serviceCodes[data.service]}-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const savedAttachments = await Promise.all(attachments.map(async (file) => {
      const extension = path.extname(file.name).toLowerCase();
      const safeName = `${crypto.randomUUID()}${extension}`;
      const relativePath = `/uploads/project-requests/${safeName}`;
      const target = path.join(process.cwd(), "public", relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, Buffer.from(await file.arrayBuffer()));
      return { name: file.name, url: relativePath, type: file.type, size: file.size };
    }));
    const request = await prisma.projectRequest.create({
      data: {
        requestId,
        service: data.service,
        name: data.name,
        company: data.company || null,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        preferredContact: data.preferredContact || null,
        projectName: data.projectName || null,
        industry: data.industry || null,
        currentUrl: data.currentUrl || null,
        description: data.description,
        objective: data.objective || null,
        targetAudience: data.targetAudience || null,
        projectType: data.projectType || null,
        platform: data.platform || null,
        requirements: { selected: data.requirements, additionalNotes: data.additionalNotes || null, attachments: savedAttachments },
        budget: data.budget || null,
        timeline: data.timeline || null,
      },
      select: { requestId: true, service: true, createdAt: true },
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("[project request]", error);
    return NextResponse.json({ error: "We could not submit your request. Please try again." }, { status: 500 });
  }
}
