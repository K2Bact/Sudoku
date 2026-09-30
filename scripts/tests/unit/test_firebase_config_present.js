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
 * Checked here (step 0-5):
 *   1. .env.example documents every key firebaseApp.js reads, so a fresh clone
 *      knows what is missing.
 *   2. The production build will get all of them, non-empty — asked of Vite
 *      itself: vite.config's envDir and envPrefix, then loadEnv, which merges
 *      .env, .env.local, .env.production(.local) and the process environment in
 *      Vite's order. This used to parse .env alone, so a value set only in
 *      .env.production.local failed the gate, and a blank one there that
 *      overrode .env passed it (external audit V11, 2026-09-12; fixed 09-30).
 *
 * Checked with --built (step 3-0b, right after this run's build):
 *   3. The database URL is inside dist/. This used to run at 0-5, against
 *      whatever dist/ the PREVIOUS build left — a check of a bundle this run was
 *      about to replace.
 *
 * What a pass does NOT say: that Firebase answers, that sign-in works, or that
 * the database rules let a match through. A URL in the bundle proves the app
 * knows where to go. Going there is gate 3-14 (the lobby says when it cannot
 * connect) and a phone.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfigFromFile, loadEnv } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BUILT = process.argv.includes('--built');
const MODE = 'production'; // what `vite build` uses

console.log('======================================================');
console.log(`🔑 Testing Firebase Config ${BUILT ? 'Is Inside The Bundle' : 'Reaches the Build'}`);
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

/** Where the build looks for env files, and which names it lets through. */
async function viteEnvSettings() {
  const loaded = await loadConfigFromFile({ command: 'build', mode: MODE }, undefined, ROOT, 'silent');
  const config = loaded?.config ?? {};
  return {
    envDir: path.resolve(ROOT, config.envDir ?? '.'),
    prefix: config.envPrefix ?? 'VITE_'
  };
}

const keys = requiredKeys();
assert(keys.length >= 5, 'Could not read the config keys out of firebaseApp.js');
console.log(`▶ firebaseApp.js reads ${keys.length} keys: ${keys.join(', ')}\n`);

const { envDir, prefix } = await viteEnvSettings();

if (!BUILT) {
  // ── 1. The template documents every key ─────────────────────────────────
  console.log('▶ 1. .env.example documents every key');
  const example = parseEnv(path.join(ROOT, '.env.example'));
  assert(example, '.env.example is missing — a fresh clone has no way to know what to set');
  for (const k of keys) {
    assert(k in example, `.env.example does not list ${k}, which firebaseApp.js reads`);
  }
  console.log('  ✅ Every key firebaseApp.js reads is documented');

  // ── 2. This machine can actually build a working 1v1 ────────────────────
  console.log(`▶ 2. the ${MODE} build gets every key (envDir ${path.relative(ROOT, envDir) || '.'}, prefix ${JSON.stringify(prefix)})`);
  const env = loadEnv(MODE, envDir, prefix);
  const empty = keys.filter((k) => !env[k] || !String(env[k]).trim());
  assert.deepStrictEqual(empty, [],
    `the ${MODE} build gets no value for: ${empty.join(', ')} — copy .env.example to ` +
    '.env and fill it from the Firebase console. Without it the app builds fine and ' +
    '1v1 falls back to the same-device transport and never reaches another phone');
  console.log('  ✅ All values present');
  console.log('▶ 3. the bundle — checked after this run builds it (step 3-0b, --built)');
} else {
  // ── 3. A bundle built just now really carries it ────────────────────────
  // The value is looked up with no prefix filter: the question is whether the
  // URL the developer set made it in, not whether it passed the filter. If the
  // prefix kept it out, the bundle is exactly where that shows.
  console.log('▶ 3. dist/ just built carries the database URL');
  const url = loadEnv(MODE, envDir, '').VITE_FIREBASE_DATABASE_URL;
  assert(url && url.trim(), 'no VITE_FIREBASE_DATABASE_URL is set at all — step 0-5 says where to put it');
  const dist = path.join(ROOT, 'dist');
  assert(fs.existsSync(dist), 'dist/ does not exist — --built runs right after `npm run build`, which did not produce it');
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
    'that build cannot do 1v1. The build did not get the config — check .env and ' +
    "vite.config's envDir / envPrefix.");
  console.log('  ✅ The database URL is compiled into the bundle');
}

console.log('\n======================================================');
console.log(`🎉 Firebase config gate passed — the config ${BUILT ? 'is compiled into the bundle' : 'reaches the build'}.`);
console.log('======================================================');
