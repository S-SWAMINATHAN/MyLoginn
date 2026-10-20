import { z } from "zod";
import { hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { ApiError, assertSameOrigin, clientIp, handle, json, readJson } from "@/lib/competition/server/http";
import { limit } from "@/lib/competition/server/rateLimit";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validation";

const schema = z.object({ email: emailSchema, password: z.string().min(1).max(200) });
/** Compared against when the account does not exist, so both paths cost one bcrypt check. */
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(crypto.randomUUID()));

/** Same accounts and session cookie as the main site login, with per-network and per-account rate limits. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const parsed = schema.safeParse(await readJson(request, 2_000));
  if (!parsed.success) throw new ApiError(400, "Enter your email and password.");
  const { email, password } = parsed.data;
  await limit(`cc:login:ip:${clientIp(request)}`, 30, 600, "Too many login attempts from this network. Try again in a few minutes.");
  await limit(`cc:login:acct:${email}`, 8, 600, "Too many attempts for this account. Wait 10 minutes or reset your password.");
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !ok) throw new ApiError(401, "Invalid email or password.");
  await setSessionCookie({ userId: user.id, role: user.role });
  return json({ ok: true, role: user.role });
});
