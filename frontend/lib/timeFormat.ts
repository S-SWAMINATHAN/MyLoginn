// frontend/lib/timeFormat.ts
//
// One place that decides how a time of birth is SHOWN.
//
// WHY THIS EXISTS (bug: "I entered 12:58 but the site shows 00:58")
// ----------------------------------------------------------------
// The whole calculation pipeline — TimeInput12h → GenerateChartRequest →
// ephemeris.get_julian_day() — speaks 24-hour "HH:MM:SS", and that is
// correct: 12:58 AM *is* 00:58 in 24-hour time. The bug was never in the
// conversion; it was that the UI then printed that raw 24-hour string back
// to the user, who had typed "12:58 AM". 00:58 and 12:58 AM are the same
// instant, but only one of them is what the person entered.
//
// So: the 24-hour value stays the single source of truth for every
// calculation, and this helper is used for every place a time is DISPLAYED.
// Nothing astrological changes — this is presentation only (AGENTS.md §1).

const TIME_RE = /^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/;

/** "00:58:00" → "12:58:00 AM"; "13:05" → "01:05:00 PM". Idempotent. */
export function formatTime12h(value?: string | null): string {
  if (!value) return "—";
  const v = String(value).trim();
  // Already formatted (this helper can be applied twice safely).
  if (/[AaPp][Mm]\s*$/.test(v)) return v;

  const m = TIME_RE.exec(v);
  if (!m) return v;

  const h24 = parseInt(m[1], 10);
  const mm = m[2];
  const ss = m[3] ?? "00";
  if (Number.isNaN(h24) || h24 > 23) return v;

  const ampm = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  return `${String(h12).padStart(2, "0")}:${mm}:${ss} ${ampm}`;
}

/** "12:58:00 AM" → "00:58:00". Returns the input unchanged if already 24h. */
export function toTime24h(value?: string | null): string {
  if (!value) return "";
  const v = String(value).trim();
  const ampmMatch = /([AaPp])[Mm]\s*$/.exec(v);
  const m = TIME_RE.exec(v);
  if (!m) return v;

  let h = parseInt(m[1], 10);
  const mm = m[2];
  const ss = m[3] ?? "00";

  if (ampmMatch) {
    const isPm = ampmMatch[1].toLowerCase() === "p";
    h = h % 12;
    if (isPm) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${mm}:${ss}`;
}