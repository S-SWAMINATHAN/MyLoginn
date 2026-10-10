import { ArrowRight, ArrowDown } from "lucide-react";

type Visual = { caption: string; nodes: { label: string; value: string; detail?: string }[]; summary: string };
type Props = { visual: Visual; courseSlug: string; title: string; code: string; output: string; syntax: string };

const FILE_NAMES: Record<string, string> = {
  "python-fundamentals": "main.py", "java-fundamentals": "Main.java", "javascript-fundamentals": "app.js",
  "html-fundamentals": "index.html", "css-fundamentals": "styles.css", "sql-fundamentals": "query.sql",
  "mysql-fundamentals": "query.sql", "c-fundamentals": "main.c", "cpp-fundamentals": "main.cpp",
  "php-fundamentals": "index.php", "react-fundamentals": "App.jsx",
};
const STAGE_STYLES = [
  { ring: "border-brand-300 dark:border-brand-400/40", dot: "bg-brand-600", text: "text-brand-700 dark:text-brand-200" },
  { ring: "border-cyan-300 dark:border-cyan-400/40", dot: "bg-cyan-600", text: "text-cyan-800 dark:text-cyan-200" },
  { ring: "border-emerald-300 dark:border-emerald-400/40", dot: "bg-emerald-600", text: "text-emerald-800 dark:text-emerald-200" },
];
const MAX_LINES = 12;

// Tiny tokenizer: enough colour to read like an editor without a highlighting dependency.
function highlight(line: string) {
  const pattern = /(\/\/.*|#.*|--.*|<!--.*?-->)|("[^"]*"|'[^']*')|(<\/?[a-zA-Z][\w-]*|\/?>)|\b(def|return|if|elif|else|for|while|in|import|from|class|function|const|let|var|SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|JOIN|ON|GROUP BY|ORDER BY|public|static|void|int|new|print)\b|(\b\d+(?:\.\d+)?\b)/g;
  const parts: { text: string; cls?: string }[] = [];
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: line.slice(last, match.index) });
    const cls = match[1] ? "text-slate-500 italic" : match[2] ? "text-emerald-300" : match[3] ? "text-sky-300" : match[4] ? "text-fuchsia-300" : "text-amber-300";
    parts.push({ text: match[0], cls });
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last) });
  return parts.length ? parts.map((part, i) => <span key={i} className={part.cls}>{part.text}</span>) : " ";
}

// Lessons sometimes show a second file after the markup, introduced by a "/* name.css */" marker.
function splitFiles(code: string, defaultName: string) {
  const parts = code.split(/^\/\*\s*([\w.-]+\.css)\s*\*\/[ \t]*\n?/m);
  const files = [{ name: defaultName, content: parts[0].replace(/\s+$/, "") }];
  for (let i = 1; i < parts.length; i += 2) files.push({ name: parts[i], content: (parts[i + 1] ?? "").replace(/\s+$/, "") });
  return files.filter((file) => file.content);
}

function previewDocument(courseSlug: string, files: { name: string; content: string }[]) {
  const css = files.filter((file) => file.name.endsWith(".css")).map((file) => file.content).join("\n");
  const main = files.find((file) => !file.name.endsWith(".css"))?.content ?? "";
  const isMarkup = /<\w+/.test(main);
  const demo = '<h1 class="welcome">Hello, web!</h1><p>A paragraph of body text.</p><p class="notice">A highlighted notice.</p><div class="row cards"><div class="card">One</div><div class="card">Two</div></div>';
  // A linked stylesheet cannot load inside the sandboxed preview, so its rules are inlined instead.
  const markup = (isMarkup ? main : courseSlug === "css-fundamentals" ? demo : main).replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "");
  const standalone = courseSlug === "css-fundamentals" && !isMarkup ? main : "";
  const base = "body{font-family:system-ui,sans-serif;margin:14px;color:#0f172a}.card{background:#e0e7ff;border-radius:6px;padding:8px}";
  return `<!doctype html><meta charset="utf-8"><style>${base}${css}${standalone}</style>${markup}`;
}

function BrowserPreview({ courseSlug, files, title }: { courseSlug: string; files: { name: string; content: string }[]; title: string }) {
  return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg dark:border-slate-700">
    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
      <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
      <span className="ml-1 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-slate-500">🔒 localhost:3000/index.html</span>
    </div>
    <iframe title={`Rendered result: ${title}`} sandbox="" srcDoc={previewDocument(courseSlug, files)} loading="lazy" className="h-44 w-full bg-white" />
  </div>;
}

function TerminalPreview({ output, isSql }: { output: string; isSql: boolean }) {
  return <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-lg">
    <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-3 py-2">
      <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
      <span className="ml-1 text-[11px] font-medium text-slate-400">{isSql ? "Query result" : "Terminal"}</span>
    </div>
    <div className="max-h-44 overflow-auto p-4 font-mono text-[13px] leading-6">
      <p className="text-slate-500"><span className="text-emerald-400">{isSql ? "sql>" : "$"}</span> {isSql ? "run query" : "run"}</p>
      <pre className="mt-1 whitespace-pre-wrap text-emerald-300">{output}</pre>
      <span aria-hidden="true" className="mt-1 inline-block h-4 w-2 animate-pulse bg-emerald-400/80 align-middle" />
    </div>
  </div>;
}

export function LessonVisualScene({ visual, courseSlug, title, code, output, syntax }: Props) {
  const isWeb = courseSlug === "html-fundamentals" || (courseSlug === "css-fundamentals" && code.trim().length > 0);
  const isSql = courseSlug === "sql-fundamentals" || courseSlug === "mysql-fundamentals";
  const files = splitFiles(code, FILE_NAMES[courseSlug] ?? "example.txt");

  return <figure aria-label={`${visual.caption} visual`} className="overflow-hidden rounded-2xl border border-border-soft bg-gradient-to-br from-brand-50/70 via-background to-cyan-50/60 p-4 dark:from-brand-950/30 dark:to-cyan-950/20 sm:p-6">
    <figcaption className="mb-5 text-center text-xs font-bold uppercase tracking-wider text-muted">{visual.caption}</figcaption>

    <ol className="grid gap-3 sm:grid-cols-3">{visual.nodes.slice(0, 3).map((node, index) => {
      const style = STAGE_STYLES[index] ?? STAGE_STYLES[2];
      return <li key={`${node.label}-${index}`} className={`relative flex gap-3 rounded-2xl border bg-background/80 p-3.5 shadow-sm backdrop-blur ${style.ring}`}>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${style.dot}`}>{index + 1}</span>
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${style.text}`}>{node.label}</p>
          <p className="mt-1 break-words text-sm font-semibold leading-5">{node.value}</p>
          {node.detail && <p className="mt-1 text-xs leading-5 text-muted">{node.detail}</p>}
        </div>
        {index < 2 && <span aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background p-0.5 text-brand-500 shadow sm:block"><ArrowRight className="h-4 w-4" /></span>}
      </li>;
    })}</ol>

    <div className="mt-6 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-lg">
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
          {files.map((f) => <span key={f.name} className="ml-1 rounded-t-md bg-slate-950 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">{f.name}</span>)}
        </div>
        <pre className="max-h-64 overflow-auto py-3 font-mono text-[13px] leading-6 text-slate-100"><code>{files.map((f, fi) => <span key={f.name} className="block">{fi > 0 && <span className="my-2 block border-t border-white/10 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{f.name}</span>}{f.content.split("\n").slice(0, MAX_LINES).map((line, i) => <span key={i} className="flex px-3 hover:bg-white/5"><span aria-hidden="true" className="mr-4 w-5 shrink-0 select-none text-right text-slate-600">{i + 1}</span><span className="whitespace-pre-wrap break-all">{highlight(line)}</span></span>)}</span>)}</code></pre>
        {syntax && <p className="truncate border-t border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-amber-200"><span className="mr-2 font-sans font-bold uppercase tracking-wider text-slate-400">Pattern</span>{syntax}</p>}
      </div>

      <div aria-hidden="true" className="flex items-center justify-center gap-1 text-brand-600 lg:flex-col">
        <span className="rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">{isWeb ? "Render" : "Run"}</span>
        <ArrowRight className="hidden h-6 w-6 animate-pulse lg:block" /><ArrowDown className="h-6 w-6 animate-pulse lg:hidden" />
      </div>

      <div className="min-w-0">{isWeb ? <BrowserPreview courseSlug={courseSlug} files={files} title={title} /> : <TerminalPreview output={output} isSql={isSql} />}</div>
    </div>

    {isWeb && <p className="mt-3 text-center text-xs leading-5 text-muted"><span className="font-semibold text-foreground/80">What you should see:</span> {output}</p>}
    <p className="mt-4 text-center text-sm leading-6 text-muted">{visual.summary}</p>
  </figure>;
}
