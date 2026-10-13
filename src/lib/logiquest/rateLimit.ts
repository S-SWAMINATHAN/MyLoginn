/**
 * Per-process sliding-window limiter for sandbox "Run" calls (these are not persisted). Submissions are additionally
 * limited from the database. On a multi-instance deployment swap this for a shared store such as Redis.
 */
const hits = new Map<string, number[]>();

export function allow(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}
