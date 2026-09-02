/**
 * test_firebase_config_present.js
 *
 * 1v1 only reaches another device if the Firebase config is compiled into the
 * bundle. Vite inlines `import.meta.env.VITE_*` at build time from `.env`, and
 * `.env` is gitignored — so a build on a machine or CI runner without it
 * produces an app that looks complete and cannot match anyone.
 *
 * The failure is silent by design: createTransport() falls back to
 * LocalTransport, the lobby still offers a quick match, the radar spins for
 * twelve seconds, and the player is told "no opponent found". Nothing logs an
 * error, nothing crashes, and the feature is dead. That is exactly the shape of
 * bug this project keeps finding — working-looking code that cannot work — so
 * it gets a gate rather than a note in a README.
 *
 * Checked here:
 *   1. .env.example documents every key firebaseApp.js reads, so a fresh clone
 *      knows what is missing.
 *   2. .env supplies all of them, non-empty.
 *   3. If dist/ exists, the database URL is actually inside it. A stale bundle
 *      built before the config existed would otherwise ship as-is.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

console.log('======================================================');
console.log('🔑 Testing Firebase Config Reaches the Build');
console.log('======================================================\n');

/** The keys firebaseApp.js actually reads, taken from the source, not a list. */
function requiredKeys() {
  const src = fs.readFileSync(path.join(ROOT, 'src/firebase/firebaseApp.js'), 'utf8');
  const keys = [...src.matchAll(/env\.(VITE_FIREBASE_[A-Z_]+)/g)].map((m) => m[1]);
  return [...new Set(keys)];
}

function parseEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const keys = requiredKeys();
assert(keys.length >= 5, 'Could not read the config keys out of firebaseApp.js');
console.log(`▶ firebaseApp.js reads ${keys.length} keys: ${keys.join(', ')}\n`);

// ── 1. The template documents every key ───────────────────────────────────
console.log('▶ 1. .env.example documents every key');
const example = parseEnv(path.join(ROOT, '.env.example'));
assert(example, '.env.example is missing — a fresh clone has no way to know what to set');
for (const k of keys) {
  assert(k in example, `.env.example does not list ${k}, which firebaseApp.js reads`);
}
console.log('  ✅ Every key firebaseApp.js reads is documented');

// ── 2. This machine can actually build a working 1v1 ──────────────────────
console.log('▶ 2. .env supplies every key');
const env = parseEnv(path.join(ROOT, '.env'));
assert(env,
  '.env is missing. Copy .env.example and fill it from the Firebase console. ' +
  'Without it the app builds fine and 1v1 silently cannot match anyone.');
const empty = keys.filter((k) => !env[k]);
assert.deepStrictEqual(empty, [],
  `.env has no value for: ${empty.join(', ')} — 1v1 will fall back to the ` +
  'same-device transport and never reach another phone');
console.log('  ✅ All values present');

// ── 3. A built bundle really carries it ───────────────────────────────────
console.log('▶ 3. dist/, if built, carries the database URL');
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(dist)) {
  console.log('  ⏭  No dist/ yet — nothing built to check');
} else {
  const url = env.VITE_FIREBASE_DATABASE_URL;
  const found = (function search(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (search(p)) return true;
      } else if (/\.(js|html)$/.test(entry.name)) {
        if (fs.readFileSync(p, 'utf8').includes(url)) return true;
      }
    }
    return false;
  })(dist);
  assert(found,
    'The built bundle in dist/ does not contain the Firebase database URL, so ' +
    'that build cannot do 1v1. It was built before .env existed — rebuild it.');
  console.log('  ✅ The database URL is compiled into the bundle');
}

console.log('\n======================================================');
console.log('🎉 Firebase config gate passed — 1v1 can reach the network.');
console.log('======================================================');
