/**
 * test_privacy_claims.js
 *
 * The app must not tell the player something about its own behaviour that the
 * code contradicts.
 *
 * The settings footer shipped `Pure Offline & Zero-PII Protected.` while 1v1
 * battles talk to Firebase Realtime Database, cloud backup writes a Play Games
 * snapshot tied to the player's Google account, and anonymous auth mints a UID.
 * The same `Zero-PII` claim sat in the privacy policy of all thirteen
 * languages. None of it was a lie when it was written — the app really was
 * offline once. The claim simply stayed put while the behaviour moved, because
 * a slogan in a footer has nothing tying it to the code it describes.
 *
 * That is the failure this gate exists for. A privacy claim is the one kind of
 * text where being out of date is a policy problem and not a typo: Play's Data
 * Safety declaration has to match what the app does, and a marketing absolute
 * in the UI is what contradicts it.
 *
 *   Case 1  no absolute claim survives in shipped text, in-app or hosted
 *   Case 1b the policy does not claim the data stays on the device
 *   Case 2  the copyright line is a copyright line, carrying no claim at all
 *   Case 3  every language discloses the same four sections — none half-edited
 *   Case 4  the hosted policy names the services the app actually sends to
 *   Case 4c every flow the code performs is described, in-app and hosted
 *   Case 5  the achievement count on screen equals the count in the code
 *   Case 6  the hosted policy is byte-equal to the local file it is edited from
 *   Case 7  the version in settings is the version build.gradle actually ships
 *
 * Case 2 is the structural half. The footer rotted because it was a place a
 * claim could live where nothing would ever check it; forbidding claims there
 * outright is what stops the next one, not banning today's exact wording.
 *
 * Case 1b is Case 1 admitting its own weakness. Case 1 is a list of phrases
 * someone already thought of, and the Korean policy walked past it saying the
 * records are kept 로컬 저장소에만 — only in local storage. They are not: the
 * manifest sets android:allowBackup="true" with no extraction rules, so Android
 * copies the app data directory, WebView localStorage included, to the player's
 * Drive and restores it on reinstall. A player who deleted the app and
 * reinstalled it from Play still had the hint balance from before, which is how
 * this was noticed at all. Case 1b looks for the contradiction rather than the
 * wording, since the document already names where the data goes.
 *
 * Case 4 is the other direction. `docs/privacy.html` had no 1v1 section at all
 * in its English half — four headings that went from local storage straight to
 * advertising while the app talked to Firebase throughout. Deleting a false
 * claim and disclosing nothing leaves the same impression it did.
 *
 * NOTE ON THIS FILE'S OWN TEXT: the banned phrases are written above and in
 * BANNED below. Twice before, a gate here failed on the sentence explaining
 * what it forbids. Comments are stripped from every scanned .js file, and this
 * gate reads only `src/` and `docs/privacy.html` — never `scripts/` — so its
 * own prose cannot accuse it.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'src');
const LOCALES = path.join(SRC, 'i18n/locales');
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

console.log('======================================================');
console.log('🔐 Testing Privacy Claims Match Actual Behaviour');
console.log('======================================================\n');

/**
 * Remove `//` and block comments without touching quotes inside strings.
 *
 * A plain regex eats the `//` in `https://` and then treats the rest of the URL
 * as a comment, so the scanner walks the source instead: inside a string it
 * copies through to the closing quote, outside one it drops comments.
 */
function stripComments(src) {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      out += ch;
      i++;
      while (i < src.length) {
        if (src[i] === '\\') { out += src[i] + (src[i + 1] || ''); i += 2; continue; }
        out += src[i];
        if (src[i] === quote) break;
        i++;
      }
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      // Keep the newlines the comment spanned. Collapsing them shifts every
      // line number after a file header, and a gate that reports the wrong line
      // sends the reader to innocent code.
      let newlines = '';
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') newlines += '\n';
        i++;
      }
      i++;
      out += newlines + ' ';
      continue;
    }
    out += ch;
  }
  return out;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

// ── Case 1: no absolute claim survives in user-visible source ──────────────
//
// Each of these asserts something the code does not do. The app is not offline
// (1v1, cloud backup, Play Games, ads), and it does transmit a persistent
// randomly generated identifier, which is an online identifier and therefore
// declarable in Data Safety whatever the marketing calls it.
console.log('▶ 1. No absolute privacy or offline claim in shipped text');
const BANNED = [
  'Zero-PII', 'Zero PII', 'ZeroPII',
  'Pure Offline', '100% Offline', 'Fully Offline', 'Completely Offline',
  '완전 오프라인', '오프라인 전용',
  '完全オフライン', '完全离线', '完全離線'
];

// The hosted policy is scanned too, and it matters more than the in-app copy:
// it is the document the store listing links to and the one a reviewer reads
// beside the Data Safety form. It carried the same footer, word for word,
// plus a `Zero-PII` badge and heading in two languages.
const POLICY = path.join(ROOT, 'docs/privacy.html');
const scanned = walk(SRC);
if (fs.existsSync(POLICY)) scanned.push(POLICY);

const offenders = [];
for (const file of scanned) {
  const raw = fs.readFileSync(file, 'utf8');
  const code = file.endsWith('.html') ? raw : stripComments(raw);
  code.split('\n').forEach((line, i) => {
    for (const phrase of BANNED) {
      if (line.toLowerCase().includes(phrase.toLowerCase())) {
        offenders.push(`${rel(file)}:${i + 1} → "${phrase}" in: ${line.trim().slice(0, 90)}`);
      }
    }
  });
}
assert.deepStrictEqual(offenders, [],
  'Absolute privacy/offline claims found in code the player can read:\n  ' +
  offenders.join('\n  ') +
  '\n\nThe app reaches the network for 1v1, cloud backup, Play Games and ads, and ' +
  'sends a persistent random identifier. State what is actually collected instead ' +
  'of an absolute — an out-of-date privacy claim contradicts the Data Safety ' +
  'declaration, which is a policy problem rather than a wording one.');
console.log(`  ✅ ${BANNED.length} banned phrases, 0 occurrences across ${scanned.length} files`);

// ── Case 2: the copyright line carries no behavioural claim ────────────────
//
// Structural, not a wording ban. The footer is a place a claim can sit where no
// reviewer of the networking code will ever see it, so nothing describing
// behaviour is allowed to live there at all.
console.log('▶ 2. appInfo.copyright is a copyright notice and nothing more');
const appInfoPath = path.join(SRC, 'config/appInfo.js');
const appInfo = fs.readFileSync(appInfoPath, 'utf8');
const m = appInfo.match(/copyright:\s*'([^']*)'/);
assert(m, 'appInfo.js must define a single-quoted copyright string');
const copyright = m[1];

// A list of forbidden words was written here first and it did not work. It let
// `© 2026 K2Bact. Your data never leaves your phone.` through — a plain claim
// about behaviour, phrased with none of the words on the list. Any blocklist
// only bans the wording already thought of, which is never the wording that
// gets written next.
//
// So the permitted shape is pinned instead. A copyright notice is a year and an
// owner; a sentence of any other shape fails whatever it says.
//
// The owner is pinned by name, not by character class. The class used here was
// [A-Za-z0-9 .,&'-]*, which is room for a sentence: "© 2026 K2Bact. Your data
// never leaves your phone. All rights reserved." fitted it — the very example
// above (external audit V11, 2026-09-12; fixed 2026-09-30). Any pattern loose
// enough to admit an unknown name admits a short claim too. The owner changes
// about never, and when it does, editing this line is the right amount of
// friction.
const OWNER = 'K2Bact';
const COPYRIGHT_SHAPE = new RegExp(`^© \\d{4} ${OWNER}\\. All rights reserved\\.$`);
assert(COPYRIGHT_SHAPE.test(copyright),
  `appInfo.copyright must be exactly "© <year> <owner>. All rights reserved." — got:\n` +
  `    "${copyright}"\n\n` +
  'Anything beyond the notice is a statement about how the app behaves, and the ' +
  'settings footer is not where behaviour is described: the privacy policy modal ' +
  'is, and the settings screen already links to it. A claim here has nothing ' +
  'tying it to the code, which is how the previous one outlived the behaviour it ' +
  'described. Put the claim in the policy, where it sits beside the disclosure ' +
  'that has to stay true with it.');
console.log(`  ✅ copyright is a bare notice — "${copyright}"`);

// ── Case 3: every language discloses the same sections ────────────────────
//
// Thirteen files were edited by hand to correct the claim. The realistic
// mistake is not a wrong translation but a missed file, which leaves one
// language still making the old promise while twelve are honest.
console.log('▶ 3. All 13 languages carry a complete privacy policy');
const REQUIRED = ['sec1Title', 'sec1Desc', 'sec2Title', 'sec2Desc', 'sec3Title', 'sec3Desc', 'sec4Title', 'sec4Desc'];
const locales = fs.readdirSync(LOCALES).filter((n) => fs.statSync(path.join(LOCALES, n)).isDirectory());
assert(locales.length >= 13, `Expected at least 13 locale directories, found ${locales.length}`);

const incomplete = [];
for (const loc of locales) {
  const file = path.join(LOCALES, loc, 'screens.js');
  if (!fs.existsSync(file)) { incomplete.push(`${loc}: screens.js missing`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('privacy: {')) { incomplete.push(`${loc}: no privacy block`); continue; }
  for (const key of REQUIRED) {
    // Either quote style: a value written with double quotes (it holds an apostrophe,
    // or a tool wrote it) used to read as "missing" (2026-09-19).
    const m = text.match(new RegExp(`${key}:\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`));
    const hit = m && [m[0], m[2]];
    // Presence and non-emptiness only. A minimum length was tried and had to go:
    // zh-CN's `1. 无需注册` is seven characters and complete, because a character
    // is a word there. Any length rule tuned for alphabetic text accuses CJK, and
    // a gate that cries wolf gets ignored — including on the day it is right.
    if (!hit) incomplete.push(`${loc}: ${key} missing`);
    else if (hit[1].trim().length === 0) incomplete.push(`${loc}: ${key} is empty`);
  }
}
assert.deepStrictEqual(incomplete, [],
  'Privacy policy is incomplete in some languages:\n  ' + incomplete.join('\n  ') +
  '\n\nA language left behind keeps making the old promise to the players who read it.');
console.log(`  ✅ ${locales.length} languages, ${REQUIRED.length} required keys each`);

// ── Case 1b: the policy must not claim the data stays on the device ───────
//
// Case 1 holds a list of banned phrases, every one of them a wording someone
// already thought of. The Korean policy said 로컬 저장소에만 보관됩니다
// ('stored ONLY in local storage') and sailed through, because that exact
// string was not on the list — the same way a word blocklist once let
// "Your data never leaves your phone" past the copyright check.
//
// So this does not count phrasings. It looks for a contradiction: Case 4
// below already requires this document to name the services data is sent to,
// and the app ships with android:allowBackup="true" and no extraction rules,
// which means Android copies the whole data directory — localStorage included —
// to the player's Google Drive and restores it on reinstall. A document that
// says both things is wrong no matter which words it picks.
//
// The patterns require a storage verb nearby on purpose. "두뇌 지수는 기기
// 안에서만 계산되며" (computed only on the device) is true and must not trip.
console.log(String.fromCharCode(9654) + " 1b. The policy does not claim storage never leaves the device");
const policyText = fs.readFileSync(POLICY, 'utf8');
const EXCLUSIVITY = [
  [/(저장소|기기|단말|스마트폰).{0,20}에만\s*(보관|저장)/, 'claims storage happens only on the device'],
  [/(보관|저장).{0,25}기기\s*(밖|외부).{0,15}(나가지|전송되지|벗어나지)\s*않/, 'claims stored data never leaves the device'],
  [/stored\s+only\s+on\s+(your|the)\s+(device|phone)/i, 'claims storage happens only on the device'],
  [/never\s+leaves?\s+(your|the)\s+(device|phone)/i, 'claims data never leaves the device'],
  [/only\s+(stored|kept|saved)\s+(locally|on-device|on your device)/i, 'claims storage is local only']
];
const exclusivity = [];
policyText.split('\n').forEach((rawLine, i) => {
  // Match the sentence, not the markup. The first version of this check used
  // [^<] to bound the gap and so never saw the very sentence it was written for:
  //   로컬 저장소(localStorage)</strong>에만 보관됩니다
  // has a tag sitting between the noun and 에만. Caught by putting the original
  // sentence back and watching the gate stay green.
  const line = rawLine.replace(/<[^>]*>/g, '');
  for (const [re, why] of EXCLUSIVITY) {
    if (re.test(line)) exclusivity.push(`docs/privacy.html:${i + 1} ${why} — ${rawLine.trim().slice(0, 110)}`);
  }
});
assert.deepStrictEqual(exclusivity, [],
  'The privacy policy says the data stays on the device:\n  ' +
  exclusivity.join('\n  ') +
  '\n\nIt does not. Two things copy it off:\n' +
  '  1. in-app cloud backup writes to Google Play Games saved data\n' +
  '  2. AndroidManifest.xml sets android:allowBackup="true" with no extraction\n' +
  '     rules, so Android Auto Backup copies the app data directory — WebView\n' +
  '     localStorage included — to the player\'s Google Drive and restores it on\n' +
  '     reinstall. This is why a player who deleted the app and installed it\n' +
  '     again from Play still had their old hint balance.\n\n' +
  'Either describe both copies or turn the backup off in the manifest, but do\n' +
  'not promise exclusivity the build does not keep.');
console.log('  ✅ No device-exclusive storage claim survives');

// The other direction of the same coupling. Case 1b stops the policy claiming
// the data stays put; this stops the manifest and the policy drifting apart.
// Section 2 now asserts something specific — that Android copies this app's
// data to the player's Drive and restores it on reinstall — and the only
// reason that is true is the manifest flag. Turn the flag off and the policy
// is wrong the other way round. Neither is pinned in place; they just have to
// move together.
const manifestPath = path.join(ROOT, 'android/app/src/main/AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');
// Since 1.2.7 the flag is off (Play Games is the only off-device copy), and the
// policy says so in all three languages. Mentioning Auto Backup is therefore not
// the signal: saying it is NOT used is. Both directions are checked.
const backupOn = /android:allowBackup\s*=\s*"true"/.test(manifest);
const NOT_USED = [
  /안드로이드 자동 백업\(Google 드라이브\)은 사용하지 않습니다/,
  /Android Auto Backup \(Google Drive\) is not used/,
  /Android の自動バックアップ（Google ドライブ）は使用しません/,
];
const saysNotUsed = NOT_USED.map((re) => re.test(policyText));
if (backupOn) {
  assert(saysNotUsed.every((x) => !x),
    'AndroidManifest.xml sets android:allowBackup="true", so Android copies the\n' +
    'app data directory — WebView localStorage, and with it the hint wallet and\n' +
    'the stored player id — to the Google Drive of the account on the device and\n' +
    'restores it on reinstall. docs/privacy.html says Auto Backup is not used.');
} else {
  assert(saysNotUsed.every(Boolean),
    'AndroidManifest.xml turns Android Auto Backup off, but docs/privacy.html does\n' +
    `not say so in every language (ko, en, ja: ${saysNotUsed.join(', ')}). A player\n` +
    'who is not signed in to Play Games has no off-device copy — the policy must tell them.');
}
console.log(`  ${String.fromCharCode(9989)} manifest backup flag and the policy agree (backup ${backupOn ? 'on' : 'off'})`);

// ── Case 4: the hosted policy names where the data actually goes ───────────
//
// Removing a claim is only half of it. The English half of this document had no
// 1v1 section at all — four sections that went straight from local storage to
// advertising, while the app was talking to Firebase the whole time. Silence
// reads as "nothing leaves", so the destinations have to be named.
console.log('▶ 4. The hosted policy names the services data is sent to');
assert(fs.existsSync(POLICY), 'docs/privacy.html must exist — it is what the store listing links to');
const policy = fs.readFileSync(POLICY, 'utf8');

const MUST_DISCLOSE = [
  ['Firebase', 'where 1v1 matchmaking sends the player ID'],
  ['Play Games', 'where cloud backup writes the saved game'],
  ['AdMob', 'the advertising SDK shipped in the release build']
];
const undisclosed = MUST_DISCLOSE
  .filter(([term]) => !policy.includes(term))
  .map(([term, why]) => `${term} — ${why}`);
assert.deepStrictEqual(undisclosed, [],
  'The hosted privacy policy never names a service the app sends data to:\n  ' +
  undisclosed.join('\n  ') +
  '\n\nAn omission reads to the player as nothing being sent, which is the same ' +
  'false impression the removed claims gave. Name the destination or stop ' +
  'sending to it.');
console.log(`  ✅ ${MUST_DISCLOSE.length} destinations named in docs/privacy.html`);

// Found on 2026-09-18: the page was reassembled with a second </style>, and the
// rules after the first one printed as text above the header on the live site.
// Every text check above still passed — they read words, not the rendered page.
const styleBlocks = (policy.match(/<style[\s>]/g) || []).length;
const styleCloses = (policy.match(/<\/style>/g) || []).length;
const bodyText = (policy.split(/<body[^>]*>/)[1] || '').replace(/<[^>]*>/g, '');
assert(styleBlocks === styleCloses && !/[.#][\w-]+\s*\{[^}]*:[^}]*\}/.test(bodyText),
  'docs/privacy.html shows CSS as page text — an unmatched </style> or a rule outside ' +
  'the <style> block. The live page prints it above the header.');
console.log('  ✅ no stylesheet text leaks into the page body');

// ── Case 4b: what the policy says about ads matches what ships ────────────
//
// The policy names AdMob because that is where ad data will go, and the case
// above requires the destination to be named. But the release build carries no
// advertising SDK today: no play-services-ads in the gradle file, no App ID in
// the manifest, no plugin — which is why AdMobProvider.isReal returns false.
// The document used to state flatly that the app "integrates the Google AdMob
// SDK", which was simply untrue.
//
// So both halves now say so, and this ties the sentence to the build. Getting
// this wrong later is the dangerous direction: serving ads while the policy
// says none are served is under-disclosure, and under-disclosure is what Play
// actually enforces.
console.log('▶ 4b. The policy\'s claim about ads matches the build');

// Dependencies, not text. This read both files whole, and on 2026-09-30 a comment
// in build.gradle explaining R8 named AdMob — after which the build "carried an
// ad SDK" whatever package.json said, and removing the SDK passed silently.
const gradle = fs.readFileSync(path.join(ROOT, 'android/app/build.gradle'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
const pkgJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const deps = Object.keys({ ...pkgJson.dependencies, ...pkgJson.devDependencies });
const shipsAdSdk = /play-services-ads|admob/i.test(gradle) || deps.some((d) => /admob/i.test(d));

// The policy sentence is checked before the permission, deliberately. Both are
// tied to the same fact, and a mutation can only touch one file — so with the
// permission first, adding an ad dependency to gradle tripped the permission
// check and the sentence rule could never be proven by anything.
// One marker per language half of the hosted document.
const NO_ADS_MARKERS = [
  ['광고가 게재되지 않습니다', 'Korean'],
  ['serves no ads', 'English']
];
const declaredAdFree = NO_ADS_MARKERS.filter(([m]) => policy.includes(m));

if (shipsAdSdk) {
  assert.strictEqual(declaredAdFree.length, 0,
    'The build now carries an advertising SDK, but docs/privacy.html still tells ' +
    'players no ads are served (' + declaredAdFree.map(([, l]) => l).join(', ') + ').\n\n' +
    'This is the direction that gets enforced: serving ads while the policy says ' +
    'otherwise is under-disclosure. Remove the sentence from both language halves ' +
    'and check the Data Safety form declares the advertising ID.');
  console.log('  ✅ an ad SDK ships and the policy no longer claims otherwise');
} else {
  assert.strictEqual(declaredAdFree.length, NO_ADS_MARKERS.length,
    'No advertising SDK is in the build, so the policy must say so in both ' +
    'language halves. Missing from: ' +
    NO_ADS_MARKERS.filter(([m]) => !policy.includes(m)).map(([, l]) => l).join(', ') +
    '.\n\nNaming AdMob without saying it is not yet active reads as a claim that ' +
    'the app is already serving ads and collecting an advertising identifier. That ' +
    'is over-disclosure rather than a violation, but it is still the document ' +
    'describing an app that does not exist yet.');
  console.log(`  ✅ no ad SDK ships, and both language halves say so`);
}

// The advertising-ID permission belongs to the same decision. It is the one of
// the three that Google reads mechanically, and it is what the Data Safety form
// asks about, so it must not be declared while nothing can use it. Comments do
// not count — the permission has to be commented out or gone, not merely
// mentioned in a note explaining why it is absent.
const manifestXml = fs.readFileSync(path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
const liveManifest = manifestXml.replace(/<!--[\s\S]*?-->/g, '');
const declaresAdIdPermission = liveManifest.includes('permission.AD_ID');

assert.strictEqual(declaresAdIdPermission, shipsAdSdk,
  declaresAdIdPermission
    ? 'AndroidManifest.xml requests com.google.android.gms.permission.AD_ID, but no\n' +
      'advertising SDK is in the build for it to use. Google reads that permission\n' +
      'mechanically and it drives the advertising-ID question on the Data Safety\n' +
      'form, so a build that tells players no ads are served while asking for the\n' +
      'advertising ID gives two answers to one question.'
    : 'An advertising SDK is in the build but AndroidManifest.xml does not declare\n' +
      'com.google.android.gms.permission.AD_ID. Apps targeting Android 13 or later\n' +
      'need it to read the advertising ID; without it AdMob falls back and the\n' +
      'Data Safety declaration will not match what the SDK actually does.');
console.log(`  ✅ the advertising ID permission matches the build (${shipsAdSdk ? 'declared' : 'absent'})`);

// ── Case 4c: each thing the code sends is described where players read ─────
//
// Found on 2026-09-18. Case 4 checked that the policy names Play Games, and it
// did — while saying the backup happened "only when you use it from Settings"
// (every win uploads it) and that the IQ score "is not transmitted" (it goes to
// a Play Games leaderboard). The in-app copy was older still: no interstitial,
// no Play Games, "stored only on the device". Naming a service is not the same
// as describing what goes to it.
//
// So each row starts from the code. If the call is there, the hosted policy
// must describe it in all three of its languages, and the in-app text in the
// launch languages (ko, en, ja) must too. Remove the call and the row goes
// quiet; the text is then free to drop it.
console.log('▶ 4c. Every flow the code performs is described, in-app and hosted');
const readSrc = (p) => stripComments(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const nicknamePrefix = (readSrc('src/firebase/battleService.js')
  .match(/initPlayerName\(\)\s*\{\s*return `([A-Za-z]+_)\$\{/) || [])[1] || '';
const FLOWS = [
  { what: 'cloud backup runs after every win',
    inCode: () => /saveToCloud\(\)/.test(readSrc('src/utils/gameCompletion.js')),
    hosted: ['이길 때마다', 'every time you win', '勝利するたび'],
    inApp: { ko: '이길 때마다', en: 'every win', ja: '勝利するたび' } },
  { what: 'the IQ score is submitted to a Play Games leaderboard',
    inCode: () => /submitScore\(\{\s*leaderboardId:\s*LEADERBOARD_IDS\.BRAIN_IQ/.test(readSrc('src/services/playGamesService.js')),
    hosted: ['순위표', 'leaderboard', 'リーダーボード'],
    inApp: { ko: '순위표', en: 'leaderboard', ja: 'リーダーボード' } },
  { what: 'a full-screen ad is shown after a win',
    inCode: () => /showPreparedInterstitial\(/.test(readSrc('src/services/adsService.js')),
    hosted: ['전면 광고', 'full-screen ad', '全画面広告'],
    inApp: { ko: '전면 광고', en: 'full-screen ad', ja: '全画面広告' } },
  { what: 'a banner ad is shown',
    inCode: () => /showBanner\(/.test(readSrc('src/components/AdBanner.jsx')),
    hosted: ['배너', 'banner', 'バナー'],
    inApp: { ko: '배너', en: 'banner', ja: 'バナー' } },
  { what: 'rewarded ads are offered',
    inCode: () => /showRewarded\(/.test(readSrc('src/services/adsService.js')),
    hosted: ['보상형', 'rewarded', 'リワード'],
    inApp: { ko: '보상형', en: 'rewarded', ja: 'リワード' } },
  // The prefix is read from the code, not written here: it changed from
  // SudokuMaster_ to Player_ on 2026-09-19 (「SUDOKU」 is a registered mark in
  // Japan), and a hard-coded marker would have kept demanding the old name.
  { what: '1v1 sends an automatic nickname',
    inCode: () => Boolean(nicknamePrefix),
    hosted: [nicknamePrefix],
    inApp: { ko: nicknamePrefix, en: nicknamePrefix, ja: nicknamePrefix } },
  // I-1 (2026-09-30): after a 1v1, each side's moves go to the other when both
  // agreed. Before this the only thing an opponent received was progress.
  { what: 'after a 1v1 the moves are sent to the opponent when both players share',
    inCode: () => /type:\s*'match_log'/.test(readSrc('src/firebase/replayExchange.js')),
    hosted: ['둔 수와 시각', 'moves and their timing', '手と時刻'],
    inApp: { ko: '둔 수와 시각', en: 'moves and their timing', ja: '手と時刻' } },
  // 2026-10-22: usage statistics through Google Analytics for Firebase. The in-app marker is the
  // product name, the hosted ones say the advertising ID is not sent — case 4d ties that sentence
  // to the manifest line that makes it true.
  { what: 'usage statistics go to Google Analytics for Firebase',
    inCode: () => deps.includes('@capacitor-firebase/analytics'),
    hosted: ['광고 식별자(Advertising ID)는 Google Analytics로 보내지 않', 'Your Advertising ID is not sent to Google Analytics', '広告IDは Google Analytics に送信しません'],
    inApp: { ko: 'Google Analytics', en: 'Google Analytics', ja: 'Google Analytics' } },
  { what: 'the Remove Ads purchase goes through Google Play Billing',
    inCode: () => /store\.purchase\(/.test(readSrc('src/billing/playBillingProvider.js')),
    hosted: ['Google Play 결제', 'Google Play Billing', 'Google Play の決済'],
    inApp: { ko: 'Google Play', en: 'Google Play', ja: 'Google Play' } }
];
const privacyBlock = (loc) => {
  const text = fs.readFileSync(path.join(LOCALES, loc, 'screens.js'), 'utf8');
  return (text.match(/privacy: \{[\s\S]*?\n\s*\}/) || [''])[0];
};
const undescribed = [];
let liveFlows = 0;
for (const flow of FLOWS) {
  if (!flow.inCode()) continue;
  liveFlows++;
  for (const marker of flow.hosted) {
    if (!policy.includes(marker)) undescribed.push(`docs/privacy.html lacks "${marker}" — ${flow.what}`);
  }
  for (const [loc, marker] of Object.entries(flow.inApp)) {
    if (!privacyBlock(loc).includes(marker)) undescribed.push(`${loc}/screens.js privacy lacks "${marker}" — ${flow.what}`);
  }
}
// Achievements go both ways. Found on 2026-09-19: the policy said achievements
// are recorded in Play Games while ACHIEVEMENT_IDS was empty and
// unlockAchievement returned 'not_configured' — none existed in the console.
// Over-claiming is not a violation, but it is the document describing an app
// that does not exist. Fill the map and the description becomes required.
const achievementIds = (readSrc('src/services/playGamesService.js')
  .match(/ACHIEVEMENT_IDS\s*=\s*\{([^}]*)\}/) || ['', ''])[1];
const achievementsLive = /['"][^'"]+['"]/.test(achievementIds);
const ACH_HOSTED = ['업적이 Google Play 게임즈에 기록', 'recorded in Google Play Games', 'Google Play ゲームに記録'];
const ACH_INAPP = { ko: '업적이 기록', en: 'records achievements', ja: '実績が記録' };
for (const m of ACH_HOSTED) {
  if (policy.includes(m) !== achievementsLive) {
    undescribed.push(`docs/privacy.html ${achievementsLive ? 'lacks' : 'still claims'} "${m}" — ACHIEVEMENT_IDS is ${achievementsLive ? 'populated' : 'empty'}`);
  }
}
for (const [loc, m] of Object.entries(ACH_INAPP)) {
  if (privacyBlock(loc).includes(m) !== achievementsLive) {
    undescribed.push(`${loc}/screens.js privacy ${achievementsLive ? 'lacks' : 'still claims'} "${m}" — ACHIEVEMENT_IDS is ${achievementsLive ? 'populated' : 'empty'}`);
  }
}

// The two sentences that were false, caught by meaning rather than exact words.
const CONTRADICTIONS = [
  [/(IQ|두뇌 지수|Brain).{0,60}(전송되지 않|not transmitted|送信されません)/i, 'says the IQ score is not sent'],
  [/(직접 사용할 때만|only when you use it from Settings|設定から使用した場合のみ)/, 'says cloud backup happens only on request']
];
const plainPolicy = policy.replace(/<[^>]*>/g, '');
for (const [re, why] of CONTRADICTIONS) {
  if (re.test(plainPolicy)) undescribed.push(`docs/privacy.html ${why}`);
  for (const loc of locales) if (re.test(privacyBlock(loc))) undescribed.push(`${loc}/screens.js privacy ${why}`);
}
assert.deepStrictEqual(undescribed, [],
  'The privacy text does not describe what the code does:\n  ' + undescribed.join('\n  ') +
  '\n\nEach line is a call present in src/. Describe it in the hosted policy (ko, en, ja) and ' +
  'in the in-app text, or remove the call. Naming the service is not enough — say what goes to it.');
console.log(`  ✅ ${liveFlows} live flows described in the hosted policy and in-app (ko, en, ja)`);

// ── Case 4d: Google Analytics does what the policy says (2026-10-22) ───────
//
// The policy says Analytics never gets the advertising ID and uses no identifier where consent
// is required. Both are true only because of five manifest lines and one rule in
// services/analyticsConsent.js. Turn Analytics' ID collection back on, start a consent type
// granted, or grant analytics_storage where Google asks for consent, and the policy becomes
// under-disclosure — the direction Play enforces — while every text check above stays green.
console.log('▶ 4d. Google Analytics: the manifest defaults and the consent rule match the policy');
if (deps.includes('@capacitor-firebase/analytics')) {
  const meta = (name) => (liveManifest.match(new RegExp(`android:name="${name}"\\s+android:value="([^"]*)"`)) || [])[1];
  const wrong = [];
  if (meta('google_analytics_adid_collection_enabled') !== 'false') {
    wrong.push('google_analytics_adid_collection_enabled is not "false" — the policy says the Advertising ID is not sent to Google Analytics');
  }
  for (const c of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization_signals']) {
    if (meta(`google_analytics_default_allow_${c}`) !== 'false') wrong.push(`google_analytics_default_allow_${c} is not "false" — every consent type starts denied`);
  }
  const { analyticsStorageAllowed } = await import(pathToFileURL(path.join(ROOT, 'src/services/analyticsConsent.js')).href);
  for (const [status, want] of [['NOT_REQUIRED', true], ['REQUIRED', false], ['UNKNOWN', false], [null, false]]) {
    const got = analyticsStorageAllowed(status ? { privacyOptionsRequirementStatus: status } : null);
    if (got !== want) wrong.push(`analyticsStorageAllowed(${status}) is ${got} — analytics_storage may be granted only where no consent is asked (NOT_REQUIRED)`);
  }
  const consentSrc = readSrc('src/services/analyticsConsent.js');
  if (/ConsentType\.(AdStorage|AdUserData|AdPersonalization)/.test(consentSrc)) wrong.push('analyticsConsent.js grants an ad consent type — the policy says the statistics are not used for ads');
  if (!/applyAnalyticsConsent\(info\)/.test(readSrc('src/ads/admobProvider.js'))) wrong.push('admobProvider.init no longer hands the consent answer to applyAnalyticsConsent');
  assert.deepStrictEqual(wrong, [],
    'Google Analytics no longer does what the privacy policy says:\n  ' + wrong.join('\n  ') +
    '\n\nEither restore the line, or change the policy (ko, en, ja), the in-app text and the Data ' +
    'safety form together — they describe this build.');
  console.log('  ✅ no advertising ID, every consent starts denied, analytics_storage only where no consent is asked');
} else {
  console.log('  ⏭  no Analytics SDK in the build');
}

// ── Case 5: a number on screen matches the number in the code ─────────────
//
// The achievements screen says "30" in thirteen languages. It is correct today.
// Nothing enforces it: adding a thirty-first achievement leaves all thirteen
// still saying thirty, and no test would notice.
//
// That drift is what bit gate 2-5. Its header claimed 54 missions while the
// repository held 64, so deleting an entire stage made the counts line up and
// the gate reported PERFECT. A stale number certifies the broken state.
console.log('▶ 5. The achievement count on screen matches the code');
// 데이터를 불러와서 센다. 정규식으로 `id:` 를 세는 첫 시도는 35 를 냈다 —
// 같은 파일에 ACHIEVEMENT_TIERS 가 5개 더 있었고 그것까지 셌기 때문이다.
// 실제 목록은 30개다. 세는 방법이 틀리면 멀쩡한 앱을 결함으로 만든다.
const { ACHIEVEMENTS_LIST } = await import('../../../src/data/achievementsData.js');
const actualAchievements = ACHIEVEMENTS_LIST.length;
assert(actualAchievements > 0, 'ACHIEVEMENTS_LIST is empty — the data shape changed');

// 원래 이 검사는 stats.achTitle 이 "🏆 30 Global Achievements" 라고 말하는지,
// 그 30이 코드와 같은지 봤다. 맞는 걱정이었는데 **그 문자열이 어느 화면에도
// 안 떴다.** 고아 키 감사에서 드러났고, 게이트가 죽은 문자열을 지키고 있었다.
//
// 화면이 그리는 건 achievements.unlockedCount 이고 개수를 보간한다. 그래서
// 오늘의 숫자를 고정하는 대신 종류를 금지한다 — 개수는 문장에 적지 말 것.
// 아래 보상 문구 검사와 같은 모양이다.
//
// The sentence is read as the app reads it — the imported string — not as file
// text. Read as text, an escape is digits: Arabic isolates the count with
// ⁦…⁩ so it is not drawn backwards, and the text check called that
// "a bare number 2066" (2026-10-06).
const wrongCount = [];
for (const loc of locales) {
  const file = path.join(LOCALES, loc, 'achievements.js');
  if (!fs.existsSync(file)) continue;
  const mod = await import(pathToFileURL(file).href);
  const line = mod.achievements?.achievements?.unlockedCount;
  if (typeof line !== 'string') { wrongCount.push(`${loc}: unlockedCount missing — the achievements screen has no counter`); continue; }
  if (!line.includes('{total}')) {
    wrongCount.push(`${loc}: names the total instead of interpolating {total} — "${line}"`);
  }
  if (!line.includes('{unlocked}')) {
    wrongCount.push(`${loc}: does not interpolate {unlocked} — "${line}"`);
  }
  const literal = line.replace(/\{[a-z]+\}/gi, '').match(/\d+/);
  if (literal) {
    wrongCount.push(`${loc}: has a bare number ${literal[0]} in the counter — "${line}"`);
  }
}
assert.deepStrictEqual(wrongCount, [],
  'The achievement counter states a number rather than interpolating it:\n  ' +
  wrongCount.join('\n  ') +
  `\n\nACHIEVEMENTS_LIST holds ${actualAchievements} today. A sentence that spells ` +
  'that out goes stale the moment one is added, in all thirteen languages at ' +
  'once, and nothing notices — which is how gate 2-5 came to certify a deleted ' +
  'stage as correct. Interpolate {unlocked} and {total} instead.');
console.log(`  ✅ ${locales.length} languages interpolate the achievement count (${actualAchievements} today)`);

// 같은 종류가 하나 더 있었다. 출석 보상 문구가 "+1" 을 하드코딩하고 있었는데
// claimDailyAttendance() 는 7일차마다 3개를 준다:
//     const bonus = (wallet.streakDays % 7 === 0) ? 3 : 1;
// 개근한 플레이어에게 3개를 주면서 1개라고 말하고 있었다. 값은 처음부터
// hintsAdded 로 돌아오고 있었고, 문구가 그걸 안 쓴 것뿐이다.
//
// 숫자를 문구에 직접 적으면 코드가 바뀔 때 같이 안 바뀐다. 보간을 강제한다.
const hardcodedReward = [];
for (const loc of locales) {
  const file = path.join(LOCALES, loc, 'modals.js');
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const block = text.match(/dailyReward:\s*\{[\s\S]*?\n\s*\}/);
  if (!block) { hardcodedReward.push(`${loc}: dailyReward block missing`); continue; }
  const desc = block[0].match(/desc:\s*'([^']*)'/);
  if (!desc) { hardcodedReward.push(`${loc}: dailyReward.desc missing`); continue; }
  if (!desc[1].includes('{count}')) {
    hardcodedReward.push(`${loc}: names a fixed amount instead of {count} — "${desc[1].replace(/\\n/g, ' ')}"`);
  }
}
assert.deepStrictEqual(hardcodedReward, [],
  'The daily reward text states an amount the code does not always give:\n  ' +
  hardcodedReward.join('\n  ') +
  '\n\nclaimDailyAttendance() returns hintsAdded — interpolate it with {count} ' +
  'rather than writing the number into the sentence.');
console.log(`  ✅ ${locales.length} languages interpolate the reward amount`);

// ── Case 6: the hosted policy is the same document as the local one ───────
//
// Everything above reads `docs/privacy.html` from disk. The store listing links
// to the hosted copy, and those are two different files that only stay equal
// because somebody remembers to upload.
//
// They already diverged once: the in-app policy was corrected while the hosted
// document kept the same false claims, word for word. Checking only the local
// file is checking the copy nobody reads.
//
// The network is not always available, so a failed fetch is reported loudly and
// does not fail the run — but it is never silent. "Could not check" and "checked
// and fine" must not look alike.
console.log('▶ 6. The hosted policy matches the local file');
const HOSTED_POLICY_URL = 'https://k2bact.github.io/privacy.html';

// 줄 끝과 앞뒤 공백만 맞춘다. 그 외의 차이는 실제 내용 차이로 다룬다.
const normalise = (t) => t.replace(/\r\n/g, '\n').trim();

let hosted = null;
let fetchError = null;
try {
  const res = await fetch(HOSTED_POLICY_URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) fetchError = `HTTP ${res.status}`;
  else hosted = await res.text();
} catch (e) {
  fetchError = e?.message || String(e);
}

if (fetchError) {
  console.log(`  ⚠️  검사하지 못함 — ${HOSTED_POLICY_URL} 를 못 읽었다 (${fetchError})`);
  console.log('     오프라인이면 정상이다. 다만 이 실행은 호스팅본을 확인하지 않았다.');
} else {
  const localText = normalise(policy);
  const hostedText = normalise(hosted);
  if (localText !== hostedText) {
    // 어디가 다른지 짚어준다. 전체 diff 는 필요 없고 첫 어긋남이면 충분하다.
    const a = localText.split('\n');
    const b = hostedText.split('\n');
    let firstDiff = -1;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) { firstDiff = i; break; }
    }
    assert.fail(
      `호스팅된 방침이 로컬 파일과 다르다.\n` +
      `  URL   : ${HOSTED_POLICY_URL}\n` +
      `  로컬  : docs/privacy.html (${a.length}줄)\n` +
      `  호스팅: ${b.length}줄\n` +
      (firstDiff >= 0
        ? `  첫 차이 ${firstDiff + 1}번째 줄:\n    로컬  : ${(a[firstDiff] || '(없음)').trim().slice(0, 110)}\n    호스팅: ${(b[firstDiff] || '(없음)').trim().slice(0, 110)}\n`
        : '') +
      `\n로컬 파일을 고쳤으면 저장소에 다시 올려야 한다. 스토어가 링크하는 것은 ` +
      `호스팅본이고, 이용자와 심사자가 읽는 것도 그쪽이다.`
    );
  }
  console.log(`  ✅ 호스팅본과 로컬이 동일 (${hostedText.split('\n').length}줄)`);
}

// ── Case 6b: the site is still verified with Google ───────────────────────
//
// docs/googleff6e49f8eb36eacb.html is the token Search Console handed out, and
// it has to sit at the root of the hosted site forever. If it goes, Google
// un-verifies the domain and Play Console's confirmed developer website goes
// with it.
//
// The app never reads this file, so nothing else would ever notice. A copy in
// the repository with no check on it is just another file nobody looks at —
// which is the thing seventy-four translated keys were deleted for.
console.log('▶ 6b. The Google site verification file is still served');
const VERIFY_FILE = fs.readdirSync(path.join(ROOT, 'docs')).find((f) => /^google[0-9a-f]+\.html$/.test(f));
assert(VERIFY_FILE,
  'docs/ no longer holds a google<hash>.html verification token. If Search ' +
  'Console was re-verified by another method, delete this case with the file; ' +
  'do not leave the case pointing at nothing.');

const verifyLocal = fs.readFileSync(path.join(ROOT, 'docs', VERIFY_FILE), 'utf8').trim();
const VERIFY_URL = `https://k2bact.github.io/${VERIFY_FILE}`;

let verifyHosted = null;
let verifyError = null;
try {
  const res = await fetch(VERIFY_URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) verifyError = `HTTP ${res.status}`;
  else verifyHosted = (await res.text()).trim();
} catch (e) {
  verifyError = e?.message || String(e);
}

if (verifyError) {
  console.log(`  ⚠️  검사하지 못함 — ${VERIFY_URL} 를 못 읽었다 (${verifyError})`);
} else {
  assert.strictEqual(verifyHosted, verifyLocal,
    'The Google site verification file is not being served as written:\n' +
    `  URL   : ${VERIFY_URL}\n` +
    `  기대  : ${verifyLocal}\n` +
    `  실제  : ${verifyHosted}\n\n` +
    'Google checks this file to keep the domain verified. Without it the site ' +
    'silently loses verification, and the developer website confirmed in Play ' +
    'Console goes with it. Nothing in the app reads this file, so this check is ' +
    'the only place it would ever show up.');
  console.log(`  ✅ ${VERIFY_FILE} 가 그대로 서빙되고 있다`);
}

// ── Case 7: the version on screen is the version that shipped ─────────────
//
// The settings footer read "v1.2.0 (Build 14)" on a device running 1.2.1 (15).
// appInfo.js is typed by hand and build.gradle is what actually ships, so the
// two drift apart the moment one is bumped alone.
//
// A version that does not exist makes every bug report point at the wrong
// build. A tester saying "1.2.0 is broken" sends you looking for something
// nobody installed.
console.log('▶ 7. The version shown in settings is the version that ships');
const gradleSrc = fs.readFileSync(path.join(ROOT, 'android/app/build.gradle'), 'utf8');
const gradleCode = (gradleSrc.match(/versionCode\s+(\d+)/) || [])[1];
const gradleName = (gradleSrc.match(/versionName\s+"([^"]+)"/) || [])[1];
assert(gradleCode && gradleName, 'Could not read versionCode/versionName from build.gradle');

const shownName = (appInfo.match(/version:\s*'([^']*)'/) || [])[1];
const shownCode = (appInfo.match(/buildCode:\s*'([^']*)'/) || [])[1];
assert(shownName && shownCode, 'Could not read version/buildCode from appInfo.js');

assert.deepStrictEqual(
  { name: shownName, code: shownCode },
  { name: gradleName, code: gradleCode },
  `The settings screen shows a version that is not the one being built:\n` +
  `  build.gradle : ${gradleName} (${gradleCode})   ← what installs on the device\n` +
  `  appInfo.js   : ${shownName} (${shownCode})   ← what the player reads\n\n` +
  'Bump both together. A version nobody can install makes every bug report ' +
  'point at the wrong build.'
);
console.log(`  ✅ settings and build.gradle agree — ${gradleName} (${gradleCode})`);

console.log('\n======================================================');
console.log('🎉 Privacy claims gate passed — nothing promised that the code breaks.');
console.log('======================================================');
