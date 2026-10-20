import { verifyCertificate } from "@/lib/competition/server/certificates";
import { clientIp, handle, ipHash, json } from "@/lib/competition/server/http";
import { limit } from "@/lib/competition/server/rateLimit";

export const GET = handle(async (request: Request, { params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  await limit(`cc:verify:${clientIp(request)}`, 60, 60);
  const cert = await verifyCertificate(decodeURIComponent(code).toUpperCase(), ipHash(request));
  return cert ? json({ found: true, certificate: cert }) : json({ found: false }, 404);
});
