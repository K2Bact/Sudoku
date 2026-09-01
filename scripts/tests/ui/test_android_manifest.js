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
const stylesXml = fs.readFileSync(stylesXmlPath, 'utf8');
assert(stylesXml.includes('android:fitsSystemWindows'), 'styles.xml must specify android:fitsSystemWindows');

const mainActivityPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'java', 'com', 'powerneja', 'suidoku', 'MainActivity.java');
const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
assert(mainActivity.includes('setOnApplyWindowInsetsListener'), 'MainActivity must bind setOnApplyWindowInsetsListener');
assert(mainActivity.includes('setPadding'), 'MainActivity must physically apply insets padding');
console.log('  ✅ Android 15 Edge-to-Edge, Camera Notch & Safe Area Inset contracts verified');

console.log('\n🎉 [PASS] Android Native Manifest & Security Contracts 100% Verified!\n');
