/**
 * Minimal, safe Markdown parser for lesson content. It produces an AST that React renders as
 * elements, so no HTML is ever injected: raw "<script>" in lesson text is displayed as text.
 *
 * Supported: ## / ### / #### headings, paragraphs, - / * bullet lists, 1. numbered lists, > quotes,
 * ``` fenced code (with optional language), | pipe tables |, --- rules, **bold**, *italic*, `code`,
 * and [text](url) links (http, https, mailto or site-relative only).
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "bold"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] };

export type Block =
  | { t: "h"; level: 2 | 3 | 4; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "ul"; items: Inline[][] }
  | { t: "ol"; items: Inline[][] }
  | { t: "quote"; c: Inline[] }
  | { t: "code"; lang: string; v: string }
  | { t: "table"; head: Inline[][]; rows: Inline[][][] }
  | { t: "hr" };

export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(https?:\/\/|mailto:)/i.test(h)) return h;
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  if (h.startsWith("#")) return h;
  return null;
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";
  const flush = () => { if (buf) { out.push({ t: "text", v: buf }); buf = ""; } };
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\" && i + 1 < src.length && /[\\`*_[\]()#>-]/.test(src[i + 1])) { buf += src[i + 1]; i += 2; continue; }
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i) { flush(); out.push({ t: "code", v: src.slice(i + 1, end) }); i = end + 1; continue; }
    }
    if (ch === "*" && src[i + 1] === "*") {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) { flush(); out.push({ t: "bold", c: parseInline(src.slice(i + 2, end)) }); i = end + 2; continue; }
    }
    if (ch === "*" && src[i + 1] !== "*" && src[i + 1] !== " ") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1 && src[end - 1] !== " ") { flush(); out.push({ t: "em", c: parseInline(src.slice(i + 1, end)) }); i = end + 1; continue; }
    }
    if (ch === "[") {
      const close = src.indexOf("](", i + 1);
      const end = close > 0 ? src.indexOf(")", close + 2) : -1;
      if (close > 0 && end > close) {
        const href = safeHref(src.slice(close + 2, end));
        const label = src.slice(i + 1, close);
        if (href) { flush(); out.push({ t: "link", href, c: parseInline(label) }); i = end + 1; continue; }
      }
    }
    buf += ch;
    i += 1;
  }
  flush();
  return out;
}

const splitRow = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isTableSep = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line) && line.includes("|");

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    const fence = line.match(/^```\s*([\w+#-]*)\s*$/);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1; // closing fence (an unterminated fence runs to the end)
      blocks.push({ t: "code", lang: fence[1] || "text", v: body.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+?)\s*#*\s*$/);
    if (heading) { blocks.push({ t: "h", level: heading[1].length as 2 | 3 | 4, c: parseInline(heading[2]) }); i += 1; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ t: "hr" }); i += 1; continue; }
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line).map(parseInline);
      const rows: Inline[][][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) { rows.push(splitRow(lines[i]).map(parseInline)); i += 1; }
      blocks.push({ t: "table", head, rows });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(parseInline(lines[i].replace(/^\s*[-*]\s+/, ""))); i += 1; }
      blocks.push({ t: "ul", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(parseInline(lines[i].replace(/^\s*\d+[.)]\s+/, ""))); i += 1; }
      blocks.push({ t: "ol", items });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { body.push(lines[i].replace(/^>\s?/, "")); i += 1; }
      blocks.push({ t: "quote", c: parseInline(body.join(" ")) });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,4}\s|>\s?|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i])) { para.push(lines[i].trim()); i += 1; }
    if (para.length) blocks.push({ t: "p", c: parseInline(para.join(" ")) });
    else i += 1; // defensive: never loop forever on an odd line
  }
  return blocks;
}
