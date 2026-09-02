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

const offenders = [];
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  if (/window\.confirm\s*\(/.test(code)) offenders.push(`${rel(f)} -> window.confirm`);
  if (/(^|[^.\w])alert\s*\(/.test(code)) offenders.push(`${rel(f)} -> alert`);
}

console.log(`▶ Inspected ${files.length} source files`);
assert.deepStrictEqual(offenders, [],
  'Native dialogs found:\n  ' + offenders.join('\n  ') +
  '\n\nCapacitor renders these with hardcoded English "OK"/"Cancel" buttons that no ' +
  'locale setting can reach. Use useConfirm() / useNotify() from ' + PROVIDER + ' instead.');
console.log('  ✅ No window.confirm / alert outside ConfirmProvider');

const provider = fs.readFileSync(path.join(ROOT, PROVIDER), 'utf8');
assert(/t\('common\.confirm'\)/.test(provider) && /t\('common\.cancel'\)/.test(provider),
  'ConfirmProvider must label its buttons from the dictionary, not with literals — ' +
  'hardcoding them here would reproduce the exact bug it exists to fix');
console.log('  ✅ The replacement labels its buttons from the app dictionary');

console.log('\n======================================================');
console.log('🎉 Native dialog gate passed — every button speaks the player’s language.');
console.log('======================================================');
