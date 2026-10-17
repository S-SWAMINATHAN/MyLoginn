import { Fragment } from "react";
import { cn } from "@/lib/cn";

/** Inline formatting: `code`, **bold**, ^superscript^ and _{subscript}. Everything else is plain text (no HTML). */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\^[^^\s]+\^|_\{[^}]+\})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`") && p.length > 1) return <code key={i} className="rounded bg-story-mist px-1.5 py-0.5 font-mono text-[0.9em] text-story-navy dark:text-foreground">{p.slice(1, -1)}</code>;
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("^") && p.endsWith("^") && p.length > 2) return <sup key={i}>{p.slice(1, -1)}</sup>;
        if (p.startsWith("_{") && p.endsWith("}")) return <sub key={i}>{p.slice(2, -1)}</sub>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/**
 * Renders authored question text. Fenced blocks (```) become code listings; other lines keep their line breaks.
 * Content is code-authored, but it is still rendered as text nodes only.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/```[a-z+#]*\n?/);
  return (
    <div className={cn("min-w-0 leading-7", className)}>
      {blocks.map((block, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="my-3 overflow-x-auto rounded-xl border border-border-soft bg-[#0b1220] p-4 font-mono text-[13px] leading-6 text-slate-100">
            <code>{block.replace(/\n$/, "")}</code>
          </pre>
        ) : block.trim() ? (
          <p key={i} className="whitespace-pre-line break-words">
            <Inline text={block.replace(/^\n+|\n+$/g, "")} />
          </p>
        ) : null
      )}
    </div>
  );
}
