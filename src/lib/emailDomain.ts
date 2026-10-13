import { promises as dns } from "node:dns";

const cache = new Map<string, { ok: boolean; at: number }>();
const TTL_MS = 10 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), LOOKUP_TIMEOUT_MS)),
  ]);
}

/**
 * True when the domain can receive mail: it has MX records, or (per RFC 5321) an A/AAAA record to fall back on.
 * Only a definite "this domain does not exist / has no mail records" answer returns false; resolver trouble
 * (timeouts, SERVFAIL, no network) fails open so a DNS hiccup never blocks a real customer.
 */
export async function emailDomainAcceptsMail(domain: string): Promise<boolean> {
  const key = domain.trim().toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(key)) return false;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ok;

  let ok: boolean;
  try {
    const mx = await withTimeout(dns.resolveMx(key));
    ok = mx.length > 0;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      try {
        const [a, aaaa] = await Promise.all([
          withTimeout(dns.resolve4(key)).catch(() => []),
          withTimeout(dns.resolve6(key)).catch(() => []),
        ]);
        ok = a.length + aaaa.length > 0;
      } catch {
        ok = true;
      }
    } else if (code === "ESERVFAIL") {
      // The domain's own DNS is broken or misconfigured (e.g. an unconfigured/parked name): it cannot receive mail.
      ok = false;
    } else {
      return true; // timeout / no network: inconclusive, so do not cache and do not block
    }
  }
  cache.set(key, { ok, at: Date.now() });
  return ok;
}
