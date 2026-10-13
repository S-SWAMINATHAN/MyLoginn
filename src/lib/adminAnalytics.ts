import { shiftDayKey, toDayKey } from "./streak";

/** Day keys (Asia/Kolkata, "YYYY-MM-DD") for the last `days` days, oldest first, ending today. */
export function dayKeys(days: number): string[] {
  const today = toDayKey();
  return Array.from({ length: days }, (_, i) => shiftDayKey(today, -(days - 1 - i)));
}

/** UTC instant of 00:00 IST on a day key. */
export function startOfDayIst(key: string): Date {
  return new Date(`${key}T00:00:00+05:30`);
}

/** Counts dates per day key. */
export function bucketCount(dates: Date[], keys: string[]): number[] {
  const map = new Map(keys.map((k) => [k, 0]));
  for (const d of dates) {
    const k = toDayKey(d);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return keys.map((k) => map.get(k) ?? 0);
}

/** Sums values per day key. */
export function bucketSum(items: { date: Date; value: number }[], keys: string[]): number[] {
  const map = new Map(keys.map((k) => [k, 0]));
  for (const { date, value } of items) {
    const k = toDayKey(date);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + value);
  }
  return keys.map((k) => map.get(k) ?? 0);
}

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Percentage change from previous to current, or null when there is no baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
