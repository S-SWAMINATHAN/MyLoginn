import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";
import { ASTRO_PRODUCTS, isAstroProduct, priceInPaise } from "@/lib/astrology/access";
import { ensureBuyerToken, getBuyer, hasAstrologyAccess } from "@/lib/astrologyAccess";

export async function POST(req: Request) {
  const user = await getCurrentUser(); // optional: no login is needed to buy

  const body = (await req.json().catch(() => null)) as { product?: unknown; reportKey?: unknown } | null;
  if (!body || !isAstroProduct(body.product) || typeof body.reportKey !== "string" || !body.reportKey) {
    return NextResponse.json({ error: "product and reportKey are required" }, { status: 400 });
  }
  const { product, reportKey } = body;

  if (await hasAstrologyAccess(await getBuyer(), { product, reportKey })) {
    return NextResponse.json({ error: "This report is already unlocked" }, { status: 409 });
  }

  const buyerToken = await ensureBuyerToken();

  // The price always comes from the server, never from the client.
  const amount = priceInPaise(product);
  const order = await getRazorpayClient().orders.create({
    amount,
    currency: "INR",
    receipt: `astro_${Date.now()}`,
    notes: { product, ...(user ? { userId: user.id } : {}) },
  });

  await prisma.astrologyPurchase.create({
    data: {
      userId: user?.id ?? null,
      buyerToken,
      product,
      reportKey,
      razorpayOrderId: order.id,
      amount,
      status: "created",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    description: ASTRO_PRODUCTS[product].label,
  });
}
