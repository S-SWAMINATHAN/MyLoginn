/**
 * Requirement checks for lesson code challenges.
 *
 * Checks are derived from the reference solution, so a learner passes by meeting the
 * requirements (right elements, values, keywords) instead of typing the solution verbatim.
 * Pure functions only: the lesson page (client) and the progress API (server) share them.
 */
export type Check = { id: string; label: string; test: (source: string) => boolean };

type Family = "html" | "css" | "sql" | "python" | "php" | "c-like";

const familyOf = (courseSlug: string): Family => {
  if (courseSlug === "html-fundamentals") return "html";
  if (courseSlug === "css-fundamentals") return "css";
  if (courseSlug === "sql-fundamentals" || courseSlug === "mysql-fundamentals") return "sql";
  if (courseSlug === "python-fundamentals") return "python";
  if (courseSlug === "php-fundamentals") return "php";
  return "c-like";
};

const STRING = String.raw`"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|` + "`(?:\\\\.|[^`\\\\])*`";

/** Removes comments so a learner cannot "pass" by leaving requirement text inside the starter comments. */
export function stripComments(courseSlug: string, source: string) {
  const family = familyOf(courseSlug);
  const text = source.replace(/\r\n/g, "\n");
  if (family === "html") return text.replace(/<!--[\s\S]*?-->/g, "");
  if (family === "css") return text.replace(/\/\*[\s\S]*?\*\//g, "");
  const line = family === "python" ? "#[^\\n]*" : family === "sql" ? "--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/" : family === "php" ? "\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
  return text.replace(new RegExp(`(${STRING})|${line}`, "g"), (_match, str: string | undefined) => str ?? "");
}

const escapeRe = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const squash = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
const tight = (value: string) => squash(value).replace(/\s*([>+~,])\s*/g, "$1");
const unique = <T,>(items: T[]) => [...new Set(items)];

const FREE_TEXT_ATTRIBUTES = new Set(["alt", "title", "aria-label", "aria-labelledby", "aria-describedby", "placeholder", "content", "value", "label", "data-title", "srclang", "datetime"]);

function htmlChecks(solution: string): Check[] {
  const checks: Check[] = [];
  const body = solution.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of unique([...body.matchAll(/<([a-z][a-z0-9-]*)/gi)].map((match) => match[1].toLowerCase()))) {
    checks.push({ id: `tag-${tag}`, label: `Use the <${tag}> element`, test: (source) => new RegExp(`<${escapeRe(tag)}[\\s>/]`, "i").test(source) });
  }
  const seen = new Set<string>();
  for (const match of body.matchAll(/\s([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const attr = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? "";
    const key = `${attr}=${value}`;
    if (seen.has(key) || attr === "xmlns") continue;
    seen.add(key);
    if (FREE_TEXT_ATTRIBUTES.has(attr)) {
      checks.push({ id: `attr-${key}`, label: `Add a ${attr} attribute`, test: (source) => new RegExp(`\\s${escapeRe(attr)}\\s*=\\s*["'][^"']+["']`, "i").test(source) });
    } else {
      checks.push({ id: `attr-${key}`, label: `Set ${attr}="${value}"`, test: (source) => new RegExp(`\\s${escapeRe(attr)}\\s*=\\s*["']${escapeRe(value)}["']`, "i").test(source) });
    }
  }
  for (const match of body.matchAll(/<[a-z][^>]*?\s(required|controls|checked|disabled|autoplay|loop|muted|defer|async|open|multiple|selected|readonly)(?=[\s>/])/gi)) {
    const attr = match[1].toLowerCase();
    if (seen.has(attr)) continue;
    seen.add(attr);
    checks.push({ id: `flag-${attr}`, label: `Include the ${attr} attribute`, test: (source) => new RegExp(`<[a-z][^>]*\\s${attr}(?=[\\s>/=])`, "i").test(source) });
  }
  return checks;
}

function cssChecks(solution: string): Check[] {
  const checks: Check[] = [];
  const css = solution.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = unique([...css.matchAll(/(^|\})\s*([^{}@][^{}]*)\{/g)].map((match) => match[2].trim()).filter(Boolean));
  for (const selector of selectors.slice(0, 3)) {
    const parts = selector.split(",").map((part) => part.trim()).filter(Boolean);
    checks.push({ id: `sel-${selector}`, label: `Write a rule for ${parts[0]}`, test: (source) => parts.every((part) => tight(source).includes(tight(part))) });
  }
  const seen = new Set<string>();
  for (const match of css.matchAll(/([a-z-]+|--[a-z0-9-]+)\s*:\s*([^;{}]+?)\s*(?:;|(?=\}))/gi)) {
    const prop = match[1].toLowerCase();
    const value = squash(match[2]);
    if (prop.length < 3 && !prop.startsWith("--")) continue;
    const key = `${prop}:${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const flexible = value.replace(/\s*([,/():])\s*/g, "$1");
    checks.push({ id: `decl-${key}`, label: `Set ${prop}: ${match[2].trim()}`, test: (source) => squash(source).replace(/\s*([,/():])\s*/g, "$1").includes(`${prop}:${flexible}`) });
  }
  return checks;
}

const SQL_KEYWORDS = ["SELECT DISTINCT", "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "JOIN", "UNION", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "COUNT", "SUM", "AVG", "MIN", "MAX", "BETWEEN", "LIKE", "IN", "IS NULL", "IS NOT NULL", "COALESCE", "IFNULL", "CASE", "WITH", "OVER", "PARTITION BY", "EXISTS", "AS", "ASC", "DESC", "AND", "OR", "NOT"];

function sqlChecks(solution: string): Check[] {
  const upper = solution.replace(/--[^\n]*/g, "").toUpperCase();
  const found: string[] = [];
  let remaining = upper;
  for (const keyword of SQL_KEYWORDS) {
    const re = new RegExp(`\\b${keyword.replace(/ /g, "\\s+")}\\b`);
    if (re.test(remaining)) { found.push(keyword); remaining = remaining.replace(new RegExp(`\\b${keyword.replace(/ /g, "\\s+")}\\b`, "g"), " "); }
  }
  return found.filter((keyword) => !["AS", "ASC", "AND", "OR", "NOT", "IN"].includes(keyword) || found.length < 3).slice(0, 7)
    .map((keyword) => ({ id: `sql-${keyword}`, label: `Use ${keyword}`, test: (source: string) => new RegExp(`\\b${keyword.replace(/ /g, "\\s+")}\\b`, "i").test(source) }));
}

const KEYWORDS: Record<Family, string[]> = {
  python: ["def", "class", "lambda", "yield", "return", "import", "from", "with", "try", "except", "finally", "raise", "for", "while", "if", "elif", "else", "break", "continue", "pass", "global", "nonlocal", "assert", "async", "await"],
  php: ["function", "class", "interface", "return", "foreach", "for", "while", "if", "elseif", "else", "switch", "match", "try", "catch", "finally", "throw", "namespace", "use", "static", "abstract", "fn", "echo", "require", "include"],
  "c-like": ["function", "class", "interface", "struct", "enum", "union", "typedef", "record", "return", "for", "while", "do", "if", "else", "switch", "case", "break", "continue", "try", "catch", "finally", "throw", "const", "let", "var", "static", "import", "export", "async", "await", "new", "extends", "implements", "template", "namespace", "using", "sizeof"],
  html: [], css: [], sql: [],
};

function codeChecks(family: Family, solution: string): Check[] {
  const code = stripComments(family === "python" ? "python-fundamentals" : family === "php" ? "php-fundamentals" : "javascript-fundamentals", solution);
  const withoutStrings = code.replace(new RegExp(STRING, "g"), '""');
  const checks: Check[] = [];
  const keywords = unique(KEYWORDS[family].filter((keyword) => new RegExp(`(^|[^\\w$])${keyword}(?![\\w$])`).test(withoutStrings))).slice(0, 4);
  for (const keyword of keywords) checks.push({ id: `kw-${keyword}`, label: `Use ${keyword}`, test: (source) => new RegExp(`(^|[^\\w$])${keyword}(?![\\w$])`).test(source) });
  const methods = unique([...withoutStrings.matchAll(/(?:\.|->|::)([A-Za-z_]\w*)\s*\(/g)].map((match) => match[1])).slice(0, 3);
  for (const method of methods) checks.push({ id: `call-${method}`, label: `Call ${method}()`, test: (source) => new RegExp(`(?:\\.|->|::)${escapeRe(method)}\\s*\\(`).test(source) });
  const functions = unique([...withoutStrings.matchAll(/(?<![.\w$>:])(use[A-Z]\w*|len|range|sorted|sum|map|filter|zip|enumerate|input)\s*(?:\(|<<|\s)/g)].map((match) => match[1])).slice(0, 2);
  for (const fn of functions) if (!keywords.includes(fn)) checks.push({ id: `fn-${fn}`, label: `Use ${fn}`, test: (source) => new RegExp(`(?<![\\w$])${escapeRe(fn)}(?![\\w$])`).test(source) });
  const strings = unique([...code.matchAll(new RegExp(STRING, "g"))].map((match) => match[0].slice(1, -1)).filter((value) => value.length >= 2 && value.length <= 42 && !/[{}%$\\]/.test(value))).slice(0, 4);
  for (const value of strings) checks.push({ id: `str-${value}`, label: `Use the text “${value}”`, test: (source) => source.includes(value) });
  const numbers = unique([...withoutStrings.matchAll(/(?<![\w.])(\d+(?:\.\d+)?)(?![\w.])/g)].map((match) => match[1])).slice(0, 4);
  for (const value of numbers) checks.push({ id: `num-${value}`, label: `Use the value ${value}`, test: (source) => new RegExp(`(?<![\\w.])${escapeRe(value)}(?![\\w])`).test(source) });
  return checks.slice(0, 9);
}

/** Shell or plain-text answers (pip commands, requirements files) must contain each solution line. */
function lineChecks(solution: string): Check[] {
  const norm = (value: string) => value.replace(/\\/g, "/").replace(/\s+/g, " ").trim().toLowerCase();
  return solution.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"))
    .map((line) => ({ id: `line-${line}`, label: `Write: ${line}`, test: (source: string) => source.split("\n").some((candidate) => norm(candidate) === norm(line)) }));
}

export function deriveChecks(courseSlug: string, solution: string, kind?: string): Check[] {
  if (kind === "packages") return lineChecks(solution).slice(0, 8);
  const family = familyOf(courseSlug);
  const checks = family === "html" ? htmlChecks(solution) : family === "css" ? cssChecks(solution) : family === "sql" ? sqlChecks(solution) : codeChecks(family, solution);
  return (checks.length ? checks : lineChecks(solution)).slice(0, 10);
}

export function evaluateChecks(courseSlug: string, checks: Check[], source: string) {
  const cleaned = stripComments(courseSlug, source);
  const results = checks.map((check) => ({ id: check.id, label: check.label, passed: check.test(cleaned) }));
  return { results, passed: results.length > 0 && results.every((result) => result.passed) };
}
