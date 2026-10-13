import type { ReactNode } from "react";
import { parseMarkdown, type Block, type Inline } from "@/lib/lms/markdown";

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.t) {
      case "text": return n.v;
      case "bold": return <strong key={i}>{renderInline(n.c)}</strong>;
      case "em": return <em key={i}>{renderInline(n.c)}</em>;
      case "code": return <code key={i} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-brand-700 dark:text-brand-300">{n.v}</code>;
      case "link": return <a key={i} href={n.href} className="font-medium text-brand-600 underline underline-offset-2" {...(n.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{renderInline(n.c)}</a>;
    }
  });
}

function renderBlock(b: Block, i: number): ReactNode {
  switch (b.t) {
    case "h": {
      const cls = b.level === 2 ? "mt-8 text-xl font-bold" : b.level === 3 ? "mt-6 text-lg font-semibold" : "mt-5 text-base font-semibold";
      const Tag = (`h${b.level}`) as "h2" | "h3" | "h4";
      return <Tag key={i} className={`${cls} tracking-tight`}>{renderInline(b.c)}</Tag>;
    }
    case "p": return <p key={i} className="mt-4 leading-7">{renderInline(b.c)}</p>;
    case "ul": return <ul key={i} className="mt-4 list-disc space-y-1.5 pl-6 leading-7">{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
    case "ol": return <ol key={i} className="mt-4 list-decimal space-y-1.5 pl-6 leading-7">{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
    case "quote": return <blockquote key={i} className="mt-4 rounded-r-xl border-l-4 border-brand-300 bg-brand-50/60 px-4 py-3 text-sm leading-6 dark:bg-brand-900/10">{renderInline(b.c)}</blockquote>;
    case "code": return (
      <figure key={i} className="mt-4 overflow-hidden rounded-xl border border-border-soft bg-slate-950 text-slate-100">
        <figcaption className="border-b border-white/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">{b.lang}</figcaption>
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6"><code>{b.v}</code></pre>
      </figure>
    );
    case "table": return (
      <div key={i} className="mt-4 overflow-x-auto rounded-xl border border-border-soft">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-surface"><tr>{b.head.map((c, j) => <th key={j} scope="col" className="px-4 py-2.5 font-semibold">{renderInline(c)}</th>)}</tr></thead>
          <tbody>{b.rows.map((row, r) => <tr key={r} className="border-t border-border-soft">{row.map((c, j) => <td key={j} className="px-4 py-2.5 align-top">{renderInline(c)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    case "hr": return <hr key={i} className="my-8 border-border-soft" />;
  }
}

/** Renders lesson Markdown as React elements (never as raw HTML). */
export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  return <div className={`lms-prose max-w-none text-[15px] ${className}`}>{parseMarkdown(source).map(renderBlock)}</div>;
}
