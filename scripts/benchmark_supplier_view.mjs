/** Benchmark the actual TypeScript table preparation with 5,000 synthetic rows. */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import vm from "node:vm";

const require = createRequire(new URL("../uis/backoffice/package.json", import.meta.url));
const ts = require("typescript");
const source = readFileSync(new URL("../uis/backoffice/src/lib/supplier-view.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const context = { exports: {} };
vm.runInNewContext(outputText, context);
const rows = Array.from({ length: 5000 }, (_, id) => ({ id, status: id % 2 ? "active" : "suspended", categories: ["carrier_last_mile", "reverse_logistics"] }));
context.exports.prepareSuppliers(rows);
const timings = Array.from({ length: 200 }, () => {
  const start = performance.now();
  context.exports.prepareSuppliers(rows);
  return performance.now() - start;
}).sort((a, b) => a - b);
console.log(JSON.stringify({ rows: rows.length, samples: timings.length, p50_ms: timings[100], p95_ms: timings[189], avoided_computations_per_100_unrelated_renders: 100 }));
