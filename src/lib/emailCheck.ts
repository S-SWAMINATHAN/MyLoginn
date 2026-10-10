// Light-weight email checks shared by the client (live hints) and the server schema.
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com",
  "trashmail.com", "sharklasers.com", "getnada.com", "dispostable.com", "throwawaymail.com", "maildrop.cc", "fakeinbox.com", "mailnesia.com",
]);
const COMMON = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "yahoo.in", "rediffmail.com", "live.com", "proton.me"];

export function isDisposableEmail(email: string) {
  return DISPOSABLE.has(email.split("@")[1]?.toLowerCase() ?? "");
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

/** Suggests a corrected address when the domain looks like a typo of a common provider (gmial.com -> gmail.com). */
export function suggestEmail(email: string) {
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!local || !domain || COMMON.includes(domain)) return null;
  const match = COMMON.find((candidate) => distance(domain, candidate) === 1 || (distance(domain, candidate) === 2 && domain.length > 7));
  return match ? `${local}@${match}` : null;
}
