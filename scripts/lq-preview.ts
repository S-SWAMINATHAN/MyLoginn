/** Prints sample questions for review: npx tsx scripts/lq-preview.ts <subject> [topic] [count] */
import { LOADERS } from "../src/lib/logiquest/content";
import { finalizeSubject } from "../src/lib/logiquest/content/build";

(async () => {
  const [subject, topic, count = "3"] = process.argv.slice(2);
  const c = finalizeSubject(subject, (await LOADERS[subject]()).default);
  for (const [slug, t] of Object.entries(c)) {
    if (topic && topic !== slug) continue;
    const qs = t.exercises.flatMap((e) => e.questions);
    console.log(`\n=== ${slug} (${qs.length}) ===`);
    for (const q of qs.slice(0, Number(count))) {
      console.log(`\n${q.n}. ${q.q}${q.passage ? `\n[passage] ${q.passage.slice(0, 120)}` : ""}`);
      q.o.forEach((o, i) => console.log(`   ${i === q.a ? "*" : " "} ${"ABCDEF"[i]}. ${o}`));
      if (q.ans) console.log(`   ANS: ${q.ans.slice(0, 200)}`);
      console.log(`   E: ${q.e.replace(/\n/g, " | ")}`);
    }
  }
})();
