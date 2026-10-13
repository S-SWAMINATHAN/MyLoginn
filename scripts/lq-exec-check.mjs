// Verifies the code-execution server end to end: each LogiQuest language must compile/run a program that reads
// "2 3" from stdin and prints 5, and a request without the token must be rejected.
//
//   LQ_EXEC_URL=https://exec.myloginn.com LQ_EXEC_TOKEN=... node scripts/lq-exec-check.mjs [language ...]
const base = (process.env.LQ_EXEC_URL ?? "").replace(/\/$/, "");
const token = process.env.LQ_EXEC_TOKEN;
if (!base) { console.error("Set LQ_EXEC_URL."); process.exit(2); }

const PROGRAMS = {
  python: ["python", "main.py", "a, b = map(int, input().split())\nprint(a + b)\n"],
  javascript: ["javascript", "main.js", 'const [a, b] = require("fs").readFileSync(0, "utf8").trim().split(" ").map(Number);\nconsole.log(a + b);\n'],
  java: ["java", "Main.java", "import java.util.*;\npublic class Main { public static void main(String[] x) { Scanner s = new Scanner(System.in); System.out.println(s.nextInt() + s.nextInt()); } }\n"],
  c: ["c", "main.c", '#include <stdio.h>\nint main(void) { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a + b); return 0; }\n'],
  cpp: ["c++", "main.cpp", "#include <iostream>\nint main() { int a, b; std::cin >> a >> b; std::cout << a + b << std::endl; }\n"],
  csharp: ["csharp", "Main.cs", "using System;\nclass P { static void Main() { var t = Console.ReadLine().Split(' '); Console.WriteLine(int.Parse(t[0]) + int.Parse(t[1])); } }\n"],
  go: ["go", "main.go", 'package main\nimport "fmt"\nfunc main() { var a, b int; fmt.Scan(&a, &b); fmt.Println(a + b) }\n'],
  php: ["php", "main.php", '<?php\nfscanf(STDIN, "%d %d", $a, $b);\necho $a + $b, "\\n";\n'],
  kotlin: ["kotlin", "Main.kt", 'fun main() { val (a, b) = readLine()!!.split(" ").map { it.toInt() }; println(a + b) }\n'],
};

async function execute(language, file, content, auth) {
  const res = await fetch(`${base}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth && token ? { Authorization: token } : {}) },
    body: JSON.stringify({ language, version: "*", files: [{ name: file, content }], stdin: "2 3\n", run_timeout: 3000, compile_timeout: 10000 }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

let failed = 0;
const wanted = process.argv.slice(2);

const anon = await execute("python", "main.py", "print(1)", false).catch((e) => ({ status: 0, error: String(e) }));
if (token) {
  if (anon.status === 401) console.log("PASS  request without token is rejected (401)");
  else { failed++; console.log(`FAIL  request without token returned ${anon.status || anon.error} (expected 401) - server is NOT protected`); }
}

for (const [id, [language, file, code]] of Object.entries(PROGRAMS)) {
  if (wanted.length && !wanted.includes(id)) continue;
  const started = Date.now();
  try {
    const { status, body } = await execute(language, file, code, true);
    const out = body?.run?.stdout?.trim();
    if (status === 200 && out === "5") console.log(`PASS  ${id.padEnd(10)} ${Date.now() - started} ms`);
    else { failed++; console.log(`FAIL  ${id.padEnd(10)} status=${status} stdout=${JSON.stringify(out)} stderr=${JSON.stringify((body?.compile?.stderr || body?.run?.stderr || body?.message || "").slice(0, 160))}`); }
  } catch (e) { failed++; console.log(`FAIL  ${id.padEnd(10)} ${e instanceof Error ? e.message : e}`); }
}

// Safety: an infinite loop must be killed by the sandbox, not hang the server.
if (!wanted.length || wanted.includes("python")) {
  const t = Date.now();
  const { body } = await execute("python", "main.py", "while True: pass", true).catch(() => ({ body: null }));
  const killed = body?.run?.signal === "SIGKILL" && Date.now() - t < 8000;
  console.log(`${killed ? "PASS" : "FAIL"}  infinite loop is killed by the time limit`);
  if (!killed) failed++;
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
