/**
 * Browser runtimes for the MyLoginn IDE beyond Python and JavaScript: TypeScript (official compiler), Ruby (ruby.wasm),
 * PHP (php-wasm) and Lua (fengari). Each runs in a dedicated Web Worker and loads its runtime from jsDelivr the first
 * time it is used (Ruby is ~35 MB, PHP ~12 MB, TypeScript ~9 MB; browsers cache them). Scripts are fetched and
 * evaluated rather than importScripts()'d so load errors are reported, and DOM globals some runtimes touch are shimmed.
 * Protocol: post { id, code, input } (code null = warm-up) and receive { id, output, error }.
 */

const LUA = `
local __n = select('#', ...)
local __input, __code = select(__n - 1, ...)
io = io or {}
local __pos, __out = 1, {}
local function __w(s) __out[#__out + 1] = s end
io.write = function(...) for i = 1, select('#', ...) do __w(tostring((select(i, ...)))) end return io end
print = function(...) local t = {} for i = 1, select('#', ...) do t[i] = tostring((select(i, ...))) end __w(table.concat(t, "\\t") .. "\\n") end
local function readline(keep)
  if __pos > #__input then return nil end
  local e = __input:find("\\n", __pos, true)
  local line
  if e then line = __input:sub(__pos, keep and e or e - 1); __pos = e + 1 else line = __input:sub(__pos); __pos = #__input + 1 end
  return line
end
io.read = function(...)
  local fmts = { ... }
  if #fmts == 0 then fmts = { "l" } end
  local res = {}
  for i, f in ipairs(fmts) do
    if type(f) == "number" then
      local s = __input:sub(__pos, __pos + f - 1); __pos = __pos + f; res[i] = s ~= "" and s or nil
    else
      local c = f:gsub("^%*", ""):sub(1, 1)
      if c == "n" then
        local _, e, num = __input:find("^%s*([-+]?[%d%.]+[eE]?[-+]?%d*)", __pos)
        if num then __pos = e + 1; res[i] = tonumber(num) else res[i] = nil end
      elseif c == "a" then res[i] = __input:sub(__pos); __pos = #__input + 1
      elseif c == "L" then res[i] = readline(true)
      else res[i] = readline(false) end
    end
  end
  return table.unpack(res, 1, #fmts)
end
io.lines = function() return function() return readline(false) end end
io.stdin = { read = function(_, ...) return io.read(...) end, lines = function() return io.lines() end }
io.stdout = { write = function(self, ...) io.write(...) return self end }
local fn, err = load(__code, "=solution")
if not fn then return table.concat(__out) .. "\\0" .. tostring(err) end
local ok, e = pcall(fn)
return table.concat(__out) .. "\\0" .. ((not ok) and tostring(e) or "")
`;

/** Worker sources for runtimes loaded on demand from jsDelivr (pinned versions). Tested in Chromium. */
export const RUNTIME_WORKERS: Record<"typescript" | "ruby" | "php" | "lua", { type: "classic" | "module"; src: string }> = {
  lua: { type: "classic", src: `
    const loaded = fetch("https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js").then((r) => r.text()).then((t) => { self.window = self; (0, eval)(t); });
    const PRELUDE = ${JSON.stringify(LUA)};
    self.onmessage = async (e) => {
      const { id, code, input } = e.data;
      try { await loaded; } catch (err) { self.postMessage({ id, output: "", error: "Lua runtime could not load: " + err }); return; }
      if (code === null) { self.postMessage({ id, output: "", error: null }); return; }
      try {
        const r = String(fengari.load(PRELUDE)(input, code));
        const k = r.indexOf("\\0");
        self.postMessage({ id, output: r.slice(0, k), error: r.slice(k + 1) || null });
      } catch (err) { self.postMessage({ id, output: "", error: String(err) }); }
    };` },
  typescript: { type: "classic", src: `
    const ready = fetch("https://cdn.jsdelivr.net/npm/typescript@5.9.3/lib/typescript.js").then((r) => r.text()).then((t) => { (0, eval)(t); return self.ts; });
    self.onmessage = async (e) => {
      const { id, code, input } = e.data;
      let s; try { s = await ready; } catch (err) { self.postMessage({ id, output: "", error: "TypeScript runtime could not load: " + err }); return; }
      if (code === null) { self.postMessage({ id, output: "", error: null }); return; }
      const lines = input.split("\\n"); let i = 0; let out = "";
      const w = (...a) => { out += a.map((x) => typeof x === "string" ? x : JSON.stringify(x)).join(" ") + "\\n"; };
      self.console = { log: w, error: w, warn: w, info: w }; self.readLine = () => (i < lines.length ? lines[i++] : null);
      try { const js = s.transpileModule(code, { compilerOptions: { target: s.ScriptTarget.ES2022, module: s.ModuleKind.None, strict: false } }).outputText; (0, eval)(js); self.postMessage({ id, output: out, error: null }); }
      catch (err) { self.postMessage({ id, output: out, error: String(err && err.message || err) }); }
    };` },
  ruby: { type: "classic", src: `
    const ready = (async () => {
      (0, eval)(await (await fetch("https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.10.1/dist/browser.umd.js")).text());
      const { DefaultRubyVM } = self["ruby-wasm-wasi"];
      const mod = await WebAssembly.compileStreaming(fetch("https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.10.1/dist/ruby+stdlib.wasm"));
      const { vm } = await DefaultRubyVM(mod, { consolePrint: false });
      vm.eval('require "stringio"');
      return vm;
    })();
    const cp = (s) => "[" + Array.from(s, (c) => c.codePointAt(0)).join(",") + "].pack('U*')";
    self.onmessage = async (e) => {
      const { id, code, input } = e.data;
      let vm; try { vm = await ready; } catch (err) { self.postMessage({ id, output: "", error: "Ruby runtime could not load: " + err }); return; }
      if (code === null) { self.postMessage({ id, output: "", error: null }); return; }
      const wrapper = \`
        __lq_code = \${cp(code)}
        __lq_in = StringIO.new(\${cp(input)})
        __lq_out = StringIO.new
        __lq_err = nil
        __lq_stdin, __lq_stdout = $stdin, $stdout
        $stdin, $stdout = __lq_in, __lq_out
        Object.send(:remove_const, :STDIN); Object.const_set(:STDIN, __lq_in)
        begin
          Object.new.instance_eval { eval(__lq_code, binding, "solution.rb") }
        rescue SystemExit
        rescue Exception => ex
          __lq_err = "#{ex.class}: #{ex.message}"
        ensure
          $stdin, $stdout = __lq_stdin, __lq_stdout
          Object.send(:remove_const, :STDIN); Object.const_set(:STDIN, __lq_stdin)
        end
        __lq_out.string + "\\\\0" + __lq_err.to_s
      \`;
      try {
        const r = vm.eval(wrapper).toString();
        const k = r.indexOf("\\0");
        self.postMessage({ id, output: r.slice(0, k), error: r.slice(k + 1) || null });
      } catch (err) { self.postMessage({ id, output: "", error: String(err && err.message || err) }); }
    };` },
  php: { type: "module", src: `
    let out = "", err = "";
    self.window = self;
    self.document = { getElementById: () => null, querySelector: () => null, addEventListener() {}, removeEventListener() {}, body: null };
    const ready = (async () => {
      const { PhpWeb } = await import("https://cdn.jsdelivr.net/npm/php-wasm@0.2.0/PhpWeb.mjs");
      const php = new PhpWeb({ version: "8.3", persist: false });
      php.addEventListener("output", (ev) => { out += ev.detail.join(""); });
      php.addEventListener("error", (ev) => { err += ev.detail.join(""); });
      await php.binary;
      return php;
    })();
    const b64 = (s) => { const u = new TextEncoder().encode(s); let t = ""; for (const c of u) t += String.fromCharCode(c); return btoa(t); };
    self.onmessage = async (e) => {
      const { id, code, input } = e.data;
      let php; try { php = await ready; } catch (x) { self.postMessage({ id, output: "", error: "PHP runtime could not load: " + x }); return; }
      if (code === null) { self.postMessage({ id, output: "", error: null }); return; }
      await php.refresh();
      out = ""; err = "";
      const mod = await php.binary;
      mod.inputDataQueue = [...input.split("\\n"), null];
      mod.triggerStdin = () => { mod.awaitingInput && mod.awaitingInput(null); };
      const src = "<?php $__lq_in = fopen('php://memory', 'r+'); fwrite($__lq_in, base64_decode('" + b64(input) + "')); rewind($__lq_in);" +
        "if (!defined('STDIN')) define('STDIN', $__lq_in);" +
        "if (!function_exists('readline')) { function readline($p = null) { $l = fgets(STDIN); return $l === false ? false : rtrim($l, chr(13) . chr(10)); } }" +
        "eval('?>' . base64_decode('" + b64(code) + "'));";
      try { await php.run(src); } catch (x) { err += String(x); }
      self.postMessage({ id, output: out, error: err.trim() || null });
    };` },
};
