import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
const types: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/png": { ext: ".png", magic: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/jpeg": { ext: ".jpg", magic: (b) => b.length > 3 && b[0] === 255 && b[1] === 216 && b[2] === 255 },
  "image/webp": { ext: ".webp", magic: (b) => b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
};
export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Choose an image under 4MB." }, { status: 400 });
  const type = types[file.type]; const data = Buffer.from(await file.arrayBuffer());
  if (!type || !type.magic(data)) return NextResponse.json({ error: "Use a valid JPG, PNG, or WEBP image." }, { status: 400 });
  const filename = `${randomUUID()}${type.ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "team");
  await mkdir(dir, { recursive: true }); await writeFile(path.join(dir, filename), data, { flag: "wx" });
  return NextResponse.json({ imageUrl: `/uploads/team/${filename}` });
}
