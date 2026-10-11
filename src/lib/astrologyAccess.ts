import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { ReportAccess } from "@/lib/astrology/access";

/**
 * Buying an astrology report needs no account. The purchase is tied to a random
 * token kept in an httpOnly cookie on the buyer's browser (and also to the user
 * id when the buyer is signed in).
 */
const BUYER_COOKIE = "astro_buyer";

export type Buyer = { userId: string | null; buyerToken: string | null; isAdmin: boolean };

export async function getBuyer(): Promise<Buyer> {
  const [user, store] = await Promise.all([getCurrentUser(), cookies()]);
  return {
    userId: user?.id ?? null,
    buyerToken: store.get(BUYER_COOKIE)?.value ?? null,
    isAdmin: user?.role === "ADMIN",
  };
}

/** Returns the buyer's token, creating and setting the cookie on first purchase. */
export async function ensureBuyerToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(BUYER_COOKIE)?.value;
  if (existing) return existing;
  const token = crypto.randomUUID();
  store.set(BUYER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10,
  });
  return token;
}

/**
 * True when this buyer has a PAID purchase covering the report. A full horoscope
 * also covers the single-page sheet of the same birth details.
 */
export async function hasAstrologyAccess(buyer: Buyer, access: ReportAccess): Promise<boolean> {
  if (buyer.isAdmin) return true;
  const owners = [
    ...(buyer.userId ? [{ userId: buyer.userId }] : []),
    ...(buyer.buyerToken ? [{ buyerToken: buyer.buyerToken }] : []),
  ];
  if (owners.length === 0) return false;
  const products = access.product === "SINGLE_PAGE" ? ["SINGLE_PAGE", "FULL"] : [access.product];
  const found = await prisma.astrologyPurchase.findFirst({
    where: { OR: owners, reportKey: access.reportKey, product: { in: products }, status: "paid" },
    select: { id: true },
  });
  return !!found;
}
