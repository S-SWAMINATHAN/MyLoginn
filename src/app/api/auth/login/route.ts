import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { recordDailyActivity } from "@/lib/streak";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie({ userId: user.id, role: user.role });
    try {
      await recordDailyActivity(user.id);
    } catch (error) {
      // Activity tracking is ancillary and must not prevent a valid login.
      console.error("Could not record login activity:", error);
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof Error && (/P1001/.test(error.message) || /Can't reach database server/i.test(error.message))) {
      console.warn("Login unavailable because the database cannot be reached.");
      return NextResponse.json(
        { error: "Sign in is temporarily unavailable because the database connection is offline." },
        { status: 503 }
      );
    }
    console.error("Login request failed:", error);
    return NextResponse.json({ error: "We couldn't log you in right now. Please try again." }, { status: 500 });
  }
}
