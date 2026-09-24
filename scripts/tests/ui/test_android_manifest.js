import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');

console.log('======================================================');
console.log('📱 Testing Android Manifest, Zero-PII Security & Insets Contracts');
console.log('======================================================\n');

// 1. Android Manifest Dangerous Permissions Scan
console.log('▶ 1. Testing Zero-PII Compliance & Android Manifest Dangerous Permissions...');
const manifestPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
assert(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

const forbiddenPermissions = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'android.permission.READ_CALENDAR',
  'android.permission.READ_CALL_LOG',
  'android.permission.READ_PHONE_STATE',
  'android.permission.SEND_SMS',
  'android.permission.READ_SMS'
];

for (const perm of forbiddenPermissions) {
  assert(!manifestContent.includes(perm), `CRITICAL SECURITY: AndroidManifest must NOT contain dangerous permission [${perm}]`);
}
console.log('  ✅ Zero-PII verified: AndroidManifest contains 0 dangerous privacy permissions');

// 2. Android 15 Edge-to-Edge & System Insets Contract
console.log('\n▶ 2. Testing Android 15 Edge-to-Edge & System Insets Contracts...');
const stylesXmlPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml');
// Comments stripped: the file explains why these attributes are gone, and a
// plain includes() would find the words in the explanation.
const stylesXml = fs.readFileSync(stylesXmlPath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
// One window layout on every version. fitsSystemWindows and
// windowOptOutEdgeToEdgeEnforcement used to be required here; together with the
// inset listener below they reserved the system bars TWICE on Android 15, which
// is the empty band that sat under the banner (SudokuDiary ㊷). The listener is
// the single place that reserves room, so neither attribute may return.
assert(!stylesXml.includes('android:fitsSystemWindows'),
  'styles.xml must NOT set fitsSystemWindows — the inset listener already reserves the bars (㊷)');
assert(!stylesXml.includes('windowOptOutEdgeToEdgeEnforcement'),
  'styles.xml must NOT opt out of edge-to-edge — Android 15 honours it and 16 ignores it, which is two layouts (㊷)');

// A tablet has to be able to rotate; a phone stays upright.
const manifestActivity = manifestContent.replace(/<!--[\s\S]*?-->/g, '');
assert(!/android:screenOrientation="portrait"/.test(manifestActivity),
  'the manifest must not lock every device to portrait — Play reads that as a tablet the app does not support');
assert(/android:minHeight="480dp"/.test(manifestActivity) && /android:minWidth="400dp"/.test(manifestActivity),
  'the smallest window the game is playable in must be declared, or a split-screen half gets a 132dp board (㊷)');

const mainActivityPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'java', 'com', 'powerneja', 'suidoku', 'MainActivity.java');
const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
assert(mainActivity.includes('setOnApplyWindowInsetsListener'), 'MainActivity must bind setOnApplyWindowInsetsListener');
assert(mainActivity.includes('setPadding'), 'MainActivity must physically apply insets padding');

// A foldable crosses the phone/tablet line while the app is running, and this
// activity's configChanges keep it alive through that — onCreate does not run
// again. Deciding the orientation policy only in onCreate leaves a folded-back
// device with free rotation, which is the stamp-sized landscape board the phone
// rule exists to prevent. The decision has to be re-made on a config change.
const javaCode = mainActivity
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*/g, '');
assert(/smallestScreenWidthDp\s*>=\s*600/.test(javaCode),
  'the phone/tablet line must be smallestScreenWidthDp >= 600, the same one sw600dp uses');
/**
 * One method's own body, by matching its braces.
 *
 * Every looser way of cutting this was tried and each one passed with the code
 * deleted: a fixed window of following characters runs into the declaration of
 * applyOrientationPolicy, whose own name then answers the search, and a slice
 * that ends at the next method's name accepts a renamed method because
 * `onConfigurationChangedXX` contains `onConfigurationChanged`. Braces do not
 * have that problem.
 *
 * What this still cannot see is a rewrite that keeps the words: setting
 * largeScreen to a constant leaves every string here in place. That one is
 * only visible on a device, and there is no tablet here to see it on.
 */
function methodBody(code, name) {
  const at = code.indexOf(`void ${name}(`);
  assert(at !== -1, `MainActivity must declare ${name}()`);
  const open = code.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}' && --depth === 0) return code.slice(open, i + 1);
  }
  throw new Error(`${name}() has unbalanced braces`);
}

const policy = methodBody(javaCode, 'applyOrientationPolicy');
assert(policy.includes('SCREEN_ORIENTATION_UNSPECIFIED') && policy.includes('SCREEN_ORIENTATION_PORTRAIT'),
  'the policy must have both branches — a large screen rotates freely, a phone stays upright. ' +
  'One branch for everyone is either a tablet Play reads as unsupported, or a phone laying the ' +
  'board out sideways in a 5-inch-tall window.');
assert(/applyOrientationPolicy\(\s*newConfig\s*\)/.test(methodBody(javaCode, 'onConfigurationChanged')),
  'onConfigurationChanged must re-apply the policy FROM newConfig — a foldable becomes a tablet (and a phone again) without being recreated, and the argument is the one set of values that cannot be stale');
assert(/applyOrientationPolicy\(/.test(methodBody(javaCode, 'onCreate')),
  'onCreate must still set the policy for the size the app launched at');
console.log('  ✅ Android 15 Edge-to-Edge, Camera Notch & Safe Area Inset contracts verified');

console.log('\n🎉 [PASS] Android Native Manifest & Security Contracts 100% Verified!\n');
