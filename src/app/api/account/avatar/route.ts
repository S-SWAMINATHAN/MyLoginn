import { randomUUID } from "crypto";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "You must be logged in" }, { status: 401 });

  const formData = await req.formData();
  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[photo.type];
  if (!extension) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WEBP image" }, { status: 400 });
  }
  if (photo.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 4MB" }, { status: 400 });
  }

  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await photo.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const previousUrl = user.avatarUrl;
  const avatarUrl = `/uploads/avatars/${filename}`;
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

  if (previousUrl?.startsWith("/uploads/avatars/")) {
    await unlink(path.join(process.cwd(), "public", previousUrl)).catch(() => {});
  }

  return NextResponse.json({ avatarUrl });
}
