import { CheckCircle2, AlertTriangle, ListChecks } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PracticeReport, ReportSection } from "@/lib/practice/report";
import { band, bandColor } from "@/lib/practice/speech";
import { Card, DimensionBars, ScoreRing } from "./ui";

export function ReportView({ report }: { report: PracticeReport }) {
  return (
    <div className="space-y-5">
      <Card className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        {report.unscored ? <span className="grid h-[132px] w-[132px] place-items-center rounded-full border-[9px] border-border-soft text-3xl font-bold text-muted" aria-label="Not scored">—</span> : <ScoreRing score={report.overall} size={132} label="Overall score" />}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Overall</p>
          <p className="mt-1 text-xl font-bold" style={{ color: report.unscored ? undefined : bandColor(report.overall) }}>{report.level}</p>
          <p className="mt-3 text-sm leading-7">{report.summary}</p>
          {!report.aiSummary && !report.unscored && report.module !== "GD" ? <p className="mt-2 text-xs text-muted">The AI summary was unavailable, so this report was assembled from your per-answer results.</p> : null}
        </div>
      </Card>

      <div className={report.dimensions.length ? "grid gap-5 lg:grid-cols-[1fr_20rem]" : "grid gap-5"}>
        {report.dimensions.length ? (
          <Card>
            <p className="mb-4 text-sm font-semibold">Score breakdown</p>
            <DimensionBars dims={report.dimensions} />
          </Card>
        ) : null}
        <Card>
          <dl className="grid grid-cols-2 gap-4">
            {report.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{s.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {report.sections.map((s, i) => <Section key={i} section={s} />)}
    </div>
  );
}

function Section({ section }: { section: ReportSection }) {
  return (
    <Card>
      <h2 className="text-base font-bold text-story-navy dark:text-foreground">{section.title}</h2>
      <div className="mt-3">
        {section.kind === "text" ? <p className="text-sm leading-7">{section.text}</p> : null}
        {section.kind === "list" ? (
          <ul className="space-y-2">
            {section.items.map((item, i) => {
              const Icon = section.tone === "good" ? CheckCircle2 : section.tone === "warn" ? AlertTriangle : ListChecks;
              return (
                <li key={i} className="flex gap-2.5 text-sm leading-6">
                  {section.tone === "plan" ? <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-story-royal/10 text-[11px] font-bold text-story-royal">{i + 1}</span> : <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", section.tone === "good" ? "text-success" : section.tone === "warn" ? "text-warning" : "text-story-royal")} />}
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
        {section.kind === "pairs" ? (
          <div className="grid gap-2 md:grid-cols-2">
            {section.pairs.map((p, i) => (
              <div key={i} className="rounded-2xl bg-story-mist p-3 text-sm leading-6 dark:bg-surface-2">
                <p><span className="font-semibold text-danger">You said: </span>{p.said}</p>
                <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">Better: </span>{p.better}</p>
                {p.why ? <p className="mt-1 text-xs text-muted">{p.why}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {section.kind === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-xs uppercase tracking-wider text-muted">{section.columns.map((c) => <th key={c} className="pb-2 pr-4 font-semibold">{c}</th>)}</tr></thead>
              <tbody>{section.rows.map((r, i) => <tr key={i} className="border-t border-border-soft">{r.map((c, j) => <td key={j} className="py-2 pr-4">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : null}
        {section.kind === "qa" ? (
          <ol className="space-y-3">
            {section.items.map((q, i) => (
              <li key={i} className="rounded-2xl border border-border-soft p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-semibold leading-6">{i + 1}. {q.q}</p>
                  {typeof q.score === "number" ? <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ color: bandColor(q.score), background: `${bandColor(q.score)}1a` }}>{q.score} · {band(q.score)}</span> : null}
                </div>
                {q.stage ? <p className="mt-0.5 text-xs text-muted">{q.stage}</p> : null}
                {q.a ? <p className="mt-2 text-sm leading-6 text-muted">{q.a}</p> : null}
                {q.feedback ? <p className="mt-2 text-sm leading-6">{q.feedback}</p> : null}
                {q.better ? <p className="mt-2 rounded-xl bg-emerald-500/5 p-3 text-sm leading-6"><span className="font-semibold text-emerald-700 dark:text-emerald-300">Stronger answer: </span>{q.better}</p> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </Card>
  );
}
