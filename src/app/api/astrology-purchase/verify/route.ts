import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getBuyer } from "@/lib/astrologyAccess";
import { getRequiredServerEnv } from "@/lib/env";

export async function POST(req: Request) {
  const buyer = await getBuyer();

  const body = (await req.json().catch(() => ({}))) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  const purchase = await prisma.astrologyPurchase.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
  const owns = !!purchase && ((!!buyer.buyerToken && purchase.buyerToken === buyer.buyerToken) || (!!buyer.userId && purchase.userId === buyer.userId));
  if (!purchase || !owns) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const expected = crypto
    .createHmac("sha256", getRequiredServerEnv("RAZORPAY_KEY_SECRET"))
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(razorpay_signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    await prisma.astrologyPurchase.update({ where: { id: purchase.id }, data: { status: "failed" } });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  await prisma.astrologyPurchase.update({
    where: { id: purchase.id },
    data: { status: "paid", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
  });

  return NextResponse.json({ unlocked: true, product: purchase.product, reportKey: purchase.reportKey });
}
