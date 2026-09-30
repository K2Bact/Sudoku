/**
 * test_no_native_dialogs.js
 *
 * window.confirm() and window.alert() are drawn by Capacitor as native Android
 * dialogs whose buttons are the literal strings "OK" and "Cancel", hardcoded in
 * BridgeWebChromeClient.java:
 *
 *     .setPositiveButton("OK",  ...)
 *     .setNegativeButton("Cancel", ...)
 *
 * No app-side locale setting reaches them. For as long as this app has shipped,
 * a Korean player leaving a game read a Korean question under two English
 * buttons — and so did players in the other twelve languages. The message was
 * translated; the only two words they had to act on were not.
 *
 * The replacement is ConfirmProvider: the app's own modal, the app's own
 * dictionary, a Promise instead of a blocking return. This gate keeps the
 * native ones from creeping back, because they are the natural thing to reach
 * for and they look completely correct in a desktop browser — which is where
 * every one of them was written.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSync } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PROVIDER = 'src/components/common/ConfirmProvider.jsx';

console.log('======================================================');
console.log('🗣️  Testing No Native Dialogs (localised buttons only)');
console.log('======================================================\n');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const files = walk(path.join(ROOT, 'src')).filter((f) => rel(f) !== PROVIDER);

// All three native dialogs, however they are reached. This used to be two
// regexes — window.confirm and a bare alert — so window.alert(), a bare confirm()
// and prompt() in any form all passed (external audit V11, 2026-09-12; fixed
// 2026-09-30). Calls are read from the parsed code, so comments and strings are
// not calls.
const NATIVE = new Set(['alert', 'confirm', 'prompt']);
const GLOBAL_OBJECTS = new Set(['window', 'globalThis', 'self']);

/** Every call expression in a parsed program. */
function calls(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { node.forEach((n) => calls(n, out)); return out; }
  if (node.type === 'CallExpression') out.push(node);
  for (const v of Object.values(node)) if (v && typeof v === 'object') calls(v, out);
  return out;
}

/**
 * Whether the file binds this name itself — `const confirm = useConfirm()` is the
 * pattern the app uses, and a call to that is the app's own modal. The check is
 * per file, not per scope: a file that binds `confirm` in one function and calls
 * the global in another would pass. None does today; the limit is written here
 * so a pass is not read as more than it is.
 */
function bindsName(code, name) {
  return new RegExp(`\\b(?:const|let|var|function)\\s+${name}\\b|[{,(]\\s*${name}\\s*[,}):=]`).test(code);
}

const offenders = [];
let parsedCalls = 0;
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  const parsed = parseSync(f, code);
  assert.strictEqual(parsed.errors.length, 0, `${rel(f)} could not be parsed, so its calls were not checked: ${parsed.errors[0]?.message}`);
  for (const call of calls(parsed.program)) {
    parsedCalls++;
    const c = call.callee;
    if (c.type === 'Identifier' && NATIVE.has(c.name) && !bindsName(code, c.name)) {
      offenders.push(`${rel(f)} -> ${c.name}`);
    } else if (c.type === 'MemberExpression' && !c.computed && c.object.type === 'Identifier'
      && GLOBAL_OBJECTS.has(c.object.name) && NATIVE.has(c.property.name)) {
      offenders.push(`${rel(f)} -> ${c.object.name}.${c.property.name}`);
    }
  }
}

console.log(`▶ Inspected ${files.length} source files, ${parsedCalls} calls`);
assert(parsedCalls > 100, `only ${parsedCalls} calls found in ${files.length} files — the parse did not reach the code`);
assert.deepStrictEqual(offenders, [],
  'Native dialogs found:\n  ' + offenders.join('\n  ') +
  '\n\nCapacitor renders these with hardcoded English "OK"/"Cancel" buttons that no ' +
  'locale setting can reach. Use useConfirm() / useNotify() from ' + PROVIDER + ' instead.');
console.log('  ✅ No alert / confirm / prompt (bare, or on window / globalThis / self) outside ConfirmProvider');

const provider = fs.readFileSync(path.join(ROOT, PROVIDER), 'utf8');
assert(/t\('common\.confirm'\)/.test(provider) && /t\('common\.cancel'\)/.test(provider),
  'ConfirmProvider must label its buttons from the dictionary, not with literals — ' +
  'hardcoding them here would reproduce the exact bug it exists to fix');
console.log('  ✅ The replacement labels its buttons from the app dictionary');

console.log('\n======================================================');
console.log('🎉 Native dialog gate passed — no native alert/confirm/prompt, so none of their English buttons.');
console.log('======================================================');
