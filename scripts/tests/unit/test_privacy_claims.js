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
 *   Case 2  the copyright line is a copyright line, carrying no claim at all
 *   Case 3  every language discloses the same four sections — none half-edited
 *   Case 4  the hosted policy names the services the app actually sends to
 *
 * Case 2 is the structural half. The footer rotted because it was a place a
 * claim could live where nothing would ever check it; forbidding claims there
 * outright is what stops the next one, not banning today's exact wording.
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
import { fileURLToPath } from 'url';

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
const COPYRIGHT_SHAPE = /^© \d{4} [A-Za-z0-9][A-Za-z0-9 .,&'-]*\. All rights reserved\.$/;
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
    const hit = text.match(new RegExp(`${key}:\\s*'([^']*)'`));
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

const wrongCount = [];
for (const loc of locales) {
  const file = path.join(LOCALES, loc, 'screens.js');
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/achTitle:\s*['"`]([^'"`]*)['"`]/);
  if (!m) { wrongCount.push(`${loc}: achTitle missing`); continue; }
  const claimed = (m[1].match(/\d+/) || [])[0];
  if (!claimed) { wrongCount.push(`${loc}: achTitle names no number — "${m[1]}"`); continue; }
  if (Number(claimed) !== actualAchievements) {
    wrongCount.push(`${loc}: screen says ${claimed}, code has ${actualAchievements} — "${m[1]}"`);
  }
}
assert.deepStrictEqual(wrongCount, [],
  'The achievement count shown to players disagrees with the code:\n  ' +
  wrongCount.join('\n  ') +
  '\n\nUpdate every locale together, or stop printing the number. A count that ' +
  'drifts is a claim the code contradicts, and a stale one makes a deletion look correct.');
console.log(`  ✅ ${locales.length} languages all say ${actualAchievements}, matching the code`);

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

console.log('\n======================================================');
console.log('🎉 Privacy claims gate passed — nothing promised that the code breaks.');
console.log('======================================================');
