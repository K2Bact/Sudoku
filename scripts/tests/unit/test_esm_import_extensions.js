/**
 * test_esm_import_extensions.js
 *
 * Node's ESM resolver does NOT guess file extensions. Any module that a headless
 * test runner reaches must therefore spell its relative imports out in full
 * ('./storage.js', not './storage'). Vite resolves extension-less specifiers for
 * the app bundle, so the rule only binds on the graph the tests actually walk.
 *
 * This gate computes that graph from the real test entry points and fails if any
 * module inside it would break under plain Node.
 */

import assert from 'assert';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { dirname, resolve, join, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const IMPORT_RE = /(?:import|export)[\s\S]*?from\s+['"](\.[^'"]+)['"]/g;
const HAS_EXT = /\.(js|jsx|mjs|json|css)$/;
const toPosix = (p) => p.split(sep).join('/');

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

// Every file Node executes directly during `npm run qa`
const entryPoints = [
  ...walk(join(ROOT, 'scripts/tests/unit')),
  ...walk(join(ROOT, 'scripts/tests/ui')),
].filter((f) => f.endsWith('.js'));

const visited = new Set();
const violations = [];

function visit(file) {
  if (visited.has(file) || !existsSync(file)) return;
  visited.add(file);

  for (const match of readFileSync(file, 'utf8').matchAll(IMPORT_RE)) {
    const spec = match[1];
    const hasExt = HAS_EXT.test(spec);
    const abs = resolve(dirname(file), spec);

    if (!hasExt) {
      violations.push(`${toPosix(relative(ROOT, file))} imports '${spec}' (missing extension)`);
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
        `${toPosix(relative(ROOT, file))} imports '${spec}' (resolves to ` +
          `${toPosix(relative(ROOT, target || abs))}, which does not exist)`,
      );
      continue;
    }
    visit(target);
  }
}

entryPoints.forEach(visit);

const srcModules = [...visited].filter((f) => toPosix(f).includes('/src/'));
console.log(`▶ Test entry points: ${entryPoints.length}`);
console.log(`▶ src modules reachable from tests: ${srcModules.length}`);

if (violations.length > 0) {
  console.error('\n❌ Extension-less relative imports on the test-reachable graph:');
  violations.forEach((v) => console.error(`   - ${v}`));
  console.error('\n   Add the explicit extension (e.g. "./storage" -> "./storage.js").');
}

assert.strictEqual(
  violations.length,
  0,
  `${violations.length} module(s) reachable from tests would fail Node ESM resolution`
);
console.log('  ✅ Every test-reachable module resolves under plain Node ESM');

console.log('\n🎉 [PASS] Node ESM Import Extension Compliance 100% Verified!\n');
