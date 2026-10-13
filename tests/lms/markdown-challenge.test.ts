import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInline, parseMarkdown, safeHref } from "../../src/lib/lms/markdown";
import { evaluateChallenge, normalizeOutput, publicTests } from "../../src/lib/lms/challenge";

test("markdown: blocks", () => {
  const blocks = parseMarkdown("## Title\n\nHello **world** and `code`.\n\n- a\n- b\n\n1. one\n2. two\n\n```python\nprint(1)\n```\n\n> note\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n---");
  assert.deepEqual(blocks.map((b) => b.t), ["h", "p", "ul", "ol", "code", "quote", "table", "hr"]);
  const code = blocks[4] as { lang: string; v: string };
  assert.equal(code.lang, "python");
  assert.equal(code.v, "print(1)");
});

test("markdown: raw HTML stays text, dangerous links are dropped", () => {
  const inline = parseInline("<script>alert(1)</script> [x](javascript:alert(1)) [ok](https://example.com)");
  assert.equal(inline.some((n) => n.t === "link" && n.href.startsWith("javascript")), false);
  assert.equal(inline.some((n) => n.t === "link" && n.href === "https://example.com"), true);
  assert.equal((inline[0] as { v: string }).v.includes("<script>"), true); // displayed, never executed
  assert.equal(safeHref("//evil.com"), null);
  assert.equal(safeHref("data:text/html,x"), null);
  assert.equal(safeHref("/courses/x"), "/courses/x");
});

test("markdown: unterminated fence and odd input terminate", () => {
  assert.equal(parseMarkdown("```js\nlet a = 1").length, 1);
  assert.ok(parseMarkdown("|\n|||\n>\n#\n").length >= 0);
});

test("challenge: visible tests need matching reported output; hidden tests are never exposed", () => {
  const tests = [
    { input: "2", expected: "4", hidden: false },
    { input: "5", expected: "25", hidden: true },
  ];
  assert.deepEqual(publicTests(tests), [{ index: 0, input: "2", expected: "4" }]);
  assert.equal(JSON.stringify(publicTests(tests)).includes("25"), false);
  const pass = evaluateChallenge(tests, [], "print(2*2)", [{ index: 0, output: "4\n" }]);
  assert.equal(pass.passed, true);
  assert.equal(pass.hiddenTestsEvaluated, false);
  assert.equal(evaluateChallenge(tests, [], "x", [{ index: 0, output: "5" }]).passed, false);
  assert.equal(evaluateChallenge(tests, [], "x", []).passed, false);
});

test("challenge: requirement checks gate the verdict; bad regex fails closed", () => {
  const tests = [{ input: "", expected: "ok", hidden: false }];
  const checks = [{ label: "Use a for loop", pattern: "\\bfor\\b" }];
  assert.equal(evaluateChallenge(tests, checks, "print('ok')", [{ index: 0, output: "ok" }]).passed, false);
  assert.equal(evaluateChallenge(tests, checks, "for i in x: print('ok')", [{ index: 0, output: "ok" }]).passed, true);
  assert.equal(evaluateChallenge(tests, [{ label: "bad", pattern: "(" }], "x", [{ index: 0, output: "ok" }]).passed, false);
  assert.equal(normalizeOutput("a  \r\nb\n\n"), "a\nb");
});
