import { prisma } from "@/lib/prisma";
import { DEFAULT_REWARDS, resolveRewards, type RewardConfig } from "./rewards";

const TTL_MS = 30_000;
const cache = new Map<string, { at: number; value: unknown }>();

async function readSetting(key: string): Promise<unknown> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  let value: unknown = null;
  try {
    value = (await prisma.lmsSetting.findUnique({ where: { key } }))?.value ?? null;
  } catch (error) {
    // Settings are tunables: if the table is unreachable fall back to defaults rather than failing learners.
    console.error("lms settings: read failed", error);
  }
  cache.set(key, { at: Date.now(), value });
  return value;
}

export async function writeSetting(key: string, value: unknown) {
  await prisma.lmsSetting.upsert({ where: { key }, update: { value: value as never }, create: { key, value: value as never } });
  cache.delete(key);
}

export async function getRewardConfig(): Promise<RewardConfig> {
  return resolveRewards(await readSetting("rewards"));
}

export type AiLimits = { perMinute: number; perDay: number; maxQuestionChars: number };
export const DEFAULT_AI_LIMITS: AiLimits = { perMinute: 6, perDay: 60, maxQuestionChars: 1500 };

export function resolveAiLimits(stored: unknown): AiLimits {
  const s = (stored && typeof stored === "object" ? stored : {}) as Record<string, unknown>;
  const pick = (v: unknown, fallback: number, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= max ? v : fallback);
  return {
    perMinute: pick(s.perMinute, DEFAULT_AI_LIMITS.perMinute, 120),
    perDay: pick(s.perDay, DEFAULT_AI_LIMITS.perDay, 5000),
    maxQuestionChars: pick(s.maxQuestionChars, DEFAULT_AI_LIMITS.maxQuestionChars, 8000),
  };
}

export async function getAiLimits(): Promise<AiLimits> {
  return resolveAiLimits(await readSetting("ai"));
}

export { DEFAULT_REWARDS };
