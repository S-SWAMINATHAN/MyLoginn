import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tutoringBookingSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to book a class" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = tutoringBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const booking = await prisma.tutoringBooking.create({
    data: { userId: user.id, ...parsed.data },
  });

  return NextResponse.json({ booking });
}
