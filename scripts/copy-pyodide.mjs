import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const packageDir = dirname(require.resolve("pyodide/package.json"));
const publicDir = join(process.cwd(), "public", "pyodide");
await mkdir(publicDir, { recursive: true });
for (const file of ["pyodide.js", "pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]) {
  await cp(join(packageDir, file), join(publicDir, file));
}
console.log("Copied the local Python runtime to public/pyodide.");
