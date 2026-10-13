// node test.js  - exercises the real handler, worker and Pyodide (no HTTP server needed).
process.env.EXEC_TOKEN = "test-secret-token";
const handler = require("./api/v2/execute");

function call(body, token = process.env.EXEC_TOKEN, method = "POST") {
  return new Promise((resolve) => {
    const res = { headers: {}, setHeader() {}, status(c) { this.code = c; return this; }, json(o) { resolve({ status: this.code, body: o }); } };
    handler({ method, headers: { authorization: token }, body }, res);
  });
}
const prog = (language, content) => ({ language, files: [{ content }] });
let failed = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + detail}`); if (!ok) failed++; };

(async () => {
  let r = await call(prog("python", "print(1)"), "wrong");
  check("wrong token -> 401", r.status === 401);
  r = await call(prog("python", "print(1)"), "");
  check("no token -> 401", r.status === 401);
  r = await call(prog("java", "class A{}"));
  check("unsupported language -> 400", r.status === 400);

  const py = prog("python", "a, b = map(int, input().split())\nprint(a + b)");
  let t = Date.now();
  r = await call({ ...py, stdins: ["2 3\n", "10 20\n", "-5 5\n"] });
  const outs = r.body.runs?.map((x) => x.stdout.trim()).join(",");
  check(`python batch of 3 -> 5,30,0 (${Date.now() - t} ms)`, outs === "5,30,0", JSON.stringify(r.body).slice(0, 200));

  r = await call({ ...prog("python", "print(1/0)"), stdin: "" });
  check("python runtime error -> code 1 + traceback", r.body.run.code === 1 && /ZeroDivisionError/.test(r.body.run.stderr), JSON.stringify(r.body));

  r = await call({ ...prog("python", "x = input()\nprint(x[::-1])"), stdins: ["abc\n", "\n"] });
  check("python empty trailing line handled", r.body.runs[0].stdout.trim() === "cba" && r.body.runs[1].code === 0, JSON.stringify(r.body));

  r = await call({ ...prog("python", "s = input()\nprint(len(s))"), stdins: ["x".repeat(60000) + "\n", "x".repeat(300000) + "\n"] });
  check("python reads very long lines intact", r.body.runs.map((x) => x.stdout.trim()).join(",") === "60000,300000", JSON.stringify(r.body).slice(0, 200));

  t = Date.now();
  r = await call({ ...prog("python", "while True: pass"), stdins: ["1\n", "2\n"] });
  const killed = r.body.runs[0].signal === "SIGKILL" && r.body.runs[1].signal === "SKIPPED";
  check(`python infinite loop killed (${Date.now() - t} ms), later cases skipped`, killed && Date.now() - t < 15000, JSON.stringify(r.body));

  const js = prog("javascript", 'const [a, b] = require("fs").readFileSync(0, "utf8").trim().split(" ").map(Number);\nconsole.log(a + b);');
  r = await call({ ...js, stdins: ["2 3\n", "7 8\n"] });
  check("javascript batch -> 5,15", r.body.runs.map((x) => x.stdout.trim()).join(",") === "5,15", JSON.stringify(r.body));

  t = Date.now();
  r = await call({ ...prog("javascript", "while(true){}"), stdins: ["x"] });
  check(`javascript infinite loop stopped (${Date.now() - t} ms)`, r.body.runs[0].code !== 0 && Date.now() - t < 8000, JSON.stringify(r.body));

  r = await call({ ...prog("javascript", 'require("child_process").execSync("echo hi")'), stdins: [""] });
  check("javascript cannot require child_process", r.body.runs[0].code === 1 && /not available/.test(r.body.runs[0].stderr), JSON.stringify(r.body));

  // Sandbox-escape attempt: reach the real process object and read the token. The worker's env is empty.
  r = await call({ ...prog("javascript", 'const p = this.constructor.constructor("return process")(); console.log("TOKEN=" + (p.env && p.env.EXEC_TOKEN));'), stdins: [""] });
  check("escape attempt cannot read EXEC_TOKEN", !/test-secret-token/.test(JSON.stringify(r.body)), JSON.stringify(r.body));

  console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
})();
