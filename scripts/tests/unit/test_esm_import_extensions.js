/**
 * test_esm_import_extensions.js
 *
 * Node's ESM resolver does NOT guess file extensions. Any module that a headless
 * test runner reaches must therefore spell its relative imports out in full
 * ('./storage.js', not './storage'). Vite resolves extension-less specifiers for
 * the app bundle, so the rule only binds on the graph the tests actually walk.
 *
 * This gate computes that graph from the files `npm run qa` hands to Node and
 * fails if a relative import in it is missing its extension or names a file that
 * does not exist.
 *
 * ── How imports are found ─────────────────────────────────────────────────
 * With the same parser Vite uses (oxc, via `parseSync`), not a regular
 * expression. The regex this replaced (external audit V11, 2026-09-12; fixed
 * 2026-09-30) had three blind spots:
 *
 *   import './side-effect.js'     no `from`, so never matched — missed
 *   await import('./later.js')    not an import statement — missed
 *   // import x from './old'      a comment — matched, and failed the gate
 *
 * The parser reads code as code, so a comment is not an import and every form
 * that loads a module is one.
 *
 * ── What a pass does NOT say ─────────────────────────────────────────────
 * `import(name)` with a computed name cannot be checked before it runs; those
 * are counted and printed, never silently passed. Package imports ('vite',
 * 'playwright') are Node's own resolution and out of scope. A pass means every
 * relative specifier the parser can read names a file that exists — not that
 * each module will run.
 */

import assert from 'assert';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { dirname, resolve, join, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { parseSync } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const HAS_EXT = /\.(js|jsx|mjs|json|css)$/;
const PARSEABLE = /\.(js|jsx|mjs)$/;
const toPosix = (p) => p.split(sep).join('/');
const rel = (f) => toPosix(relative(ROOT, f));

console.log('======================================================');
console.log('🧪 Testing Node ESM Import Extension Compliance');
console.log('======================================================\n');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// Every file Node executes directly during `npm run qa`: the test folders, plus
// whatever run_all_qa.js hands to `node` from elsewhere (the scan, the l10n engine).
const QA_RUNNER = join(ROOT, 'scripts/tests/run_all_qa.js');
const fromRunner = [...readFileSync(QA_RUNNER, 'utf8').matchAll(/\bnode\s+([^\s'"`]+\.(?:m?js))/g)]
  .map((m) => resolve(ROOT, m[1]));
const entryPoints = [
  ...walk(join(ROOT, 'scripts/tests')).filter((f) => /\.(js|mjs)$/.test(f)),
  ...fromRunner,
];

/** Relative module specifiers a file loads, and the dynamic ones it cannot name. */
function specifiersOf(file, code) {
  const parsed = parseSync(file, code);
  if (parsed.errors.length) return { error: parsed.errors[0].message, specs: [], computed: 0 };
  const specs = [
    ...parsed.module.staticImports.map((i) => i.moduleRequest.value),
    ...parsed.module.staticExports.flatMap((e) => e.entries.map((x) => x.moduleRequest?.value)).filter(Boolean),
  ];
  let computed = 0;
  for (const d of parsed.module.dynamicImports) {
    const arg = code.slice(d.moduleRequest.start, d.moduleRequest.end).trim();
    const literal = arg.match(/^(['"])(.*)\1$/) || arg.match(/^`([^`$]*)`$/);
    if (literal) specs.push(literal[literal.length - 1]);
    else computed++;
  }
  return { error: null, specs: specs.filter((s) => s.startsWith('.')), computed };
}

const visited = new Set();
const violations = [];
const computedSites = [];

function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  if (!existsSync(file)) {
    violations.push(`${rel(file)} is run by the QA pipeline but does not exist`);
    return;
  }
  if (!PARSEABLE.test(file)) return;

  const { error, specs, computed } = specifiersOf(file, readFileSync(file, 'utf8'));
  if (error) {
    // A file the parser cannot read is a file whose imports were not checked.
    violations.push(`${rel(file)} could not be parsed (${error}) — its imports were not checked`);
    return;
  }
  if (computed) computedSites.push(`${rel(file)} (${computed})`);

  for (const spec of specs) {
    const hasExt = HAS_EXT.test(spec);
    const abs = resolve(dirname(file), spec);

    if (!hasExt) {
      violations.push(`${rel(file)} imports '${spec}' (missing extension)`);
    }

    const target = hasExt
      ? abs
      : existsSync(`${abs}.js`) ? `${abs}.js`
      : existsSync(`${abs}.jsx`) ? `${abs}.jsx`
      : null;

    // A spelled-out specifier pointing at nothing used to be skipped in
    // silence, because the recursion guard treated "file missing" the same as
    // "already seen". `run_e2e_tests.js` imported '../src/engine/SudokuEngine.js'
    // — which resolves to scripts/src/, a directory that does not exist — and
    // this gate printed "every test-reachable module resolves under plain Node
    // ESM" while `npm run test:e2e` died with ERR_MODULE_NOT_FOUND. A missing
    // extension and a missing file are the same failure to Node, so they are
    // the same failure here.
    if (!target || !existsSync(target)) {
      violations.push(
        `${rel(file)} imports '${spec}' (resolves to ` +
          `${rel(target || abs)}, which does not exist)`,
      );
      continue;
    }
    visit(target);
  }
}

entryPoints.forEach(visit);

const srcModules = [...visited].filter((f) => toPosix(f).includes('/src/'));
console.log(`▶ Entry points (scripts/tests + run_all_qa targets): ${entryPoints.length}`);
console.log(`▶ Modules parsed: ${visited.size}  (src: ${srcModules.length})`);
if (computedSites.length) {
  console.log(`▶ import() with a computed name — not checkable here: ${computedSites.join(', ')}`);
}

// The walk must have reached something, or a pass means nothing was looked at.
assert.ok(srcModules.length > 0, 'the graph reached no src module — the entry points were not read');

if (violations.length > 0) {
  console.error('\n❌ Relative imports on the test-reachable graph that Node cannot load:');
  violations.forEach((v) => console.error(`   - ${v}`));
  console.error('\n   Add the explicit extension (e.g. "./storage" -> "./storage.js"), or fix the path.');
}

assert.strictEqual(
  violations.length,
  0,
  `${violations.length} module(s) reachable from tests would fail Node ESM resolution`
);
console.log('  ✅ Every relative import on the test-reachable graph names a file that exists, with its extension');

console.log('\n🎉 [PASS] Node ESM Import Extension Compliance 100% Verified!\n');
