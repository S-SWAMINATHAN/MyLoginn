import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { getRequiredServerEnv } from "@/lib/env";
import { signupSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { name, email, phone, country, password, role } = parsed.data;

    // Check session configuration before inserting the user so a missing secret
    // cannot leave an account that the signup flow cannot log into.
    getRequiredServerEnv("JWT_SECRET");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const palette = ["#6c4dff", "#06b6d4", "#f97316", "#16a34a", "#e11d48"];
    const avatarColor = palette[Math.floor(Math.random() * palette.length)];

    const user = await prisma.user.create({
      data: { name, email, phone, country, passwordHash, role, avatarColor },
    });

    await setSessionCookie({ userId: user.id, role: user.role });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error("Signup request failed:", error);
    return NextResponse.json({ error: "We couldn't create your account. Please try again." }, { status: 500 });
  }
}
