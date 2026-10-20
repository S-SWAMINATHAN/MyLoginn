// Test preload for the competition suites (in addition to tests/setup.cjs).
// Under tsx's CommonJS loader, libphonenumber-js receives its metadata JSON wrapped as { default }, which it rejects.
// Next.js bundles it correctly, so this only unwraps that shape for .json requires inside the test runner.
const Module = require("node:module");
const load = Module._load;
Module._load = function (request, ...rest) {
  const value = load.call(this, request, ...rest);
  if (request.endsWith(".json") && value && typeof value === "object" && Object.keys(value).length === 1 && "default" in value) return value.default;
  return value;
};
