/**
 * print_firebase_rules.js
 *
 * Prints firebase.rules.json in the shape the Firebase console wants, so the
 * rules can be pasted without editing them by hand.
 *
 *   node scripts/store/print_firebase_rules.js          print it
 *   node scripts/store/print_firebase_rules.js --copy   put ONLY the JSON on the clipboard
 *
 * The repo file carries a long "//" block explaining every rule — why senderId
 * must equal auth.uid, why deleting is asymmetric, why roomId is capped at 64.
 * That explanation is the point of keeping the rules in the repo, but the
 * console's validator only knows the "rules" key, so it has to come off before
 * pasting. Doing that by hand is how a brace goes missing, and a rules file
 * with a missing brace is a 1v1 feature that half works.
 *
 * One source of truth: this reads the same file the transport is reviewed
 * against. It never writes a second copy.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'firebase.rules.json');

const parsed = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!parsed.rules) {
  console.error(`${SRC} has no "rules" key — nothing to publish.`);
  process.exit(1);
}

const out = JSON.stringify({ rules: parsed.rules }, null, 2);

// --copy: the JSON alone, on the clipboard. Printing it made the reader find where
// the JSON starts under a Korean notice, and a terminal panel that wraps long lines
// makes that worse (2026-09-30, user: "firebase 어떻게 하는지 다시 제대로 알려줘").
// The rules are ASCII, so clip.exe's codepage cannot garble them.
if (process.argv.includes('--copy')) {
  if (!/^[\x00-\x7F]*$/.test(out)) {
    console.error('The rules contain non-ASCII text; clip.exe could garble it. Print instead and copy by hand.');
    process.exit(1);
  }
  if (process.platform !== 'win32') {
    console.error('--copy uses clip.exe (Windows). Print instead.');
    process.exit(1);
  }
  execSync('clip', { input: out });
  const lines = out.split('\n').length;
  console.log(`클립보드에 규칙 JSON 만 넣었다 — ${lines}줄 · ${out.length}자 · "{" 로 시작해 "}" 로 끝난다.`);
  console.log('Firebase 콘솔 > Realtime Database > 규칙 탭 > 편집기 클릭 > Ctrl+A > Ctrl+V > [게시]');
  process.exit(0);
}

console.log('─'.repeat(68));
console.log('Firebase 콘솔 > Realtime Database > 규칙 에 아래 JSON 을 통째로 붙여넣고');
console.log('[게시] 를 누른다. 줄이 꺾여 보여서 고르기 어려우면 --copy 를 쓴다.');
console.log('─'.repeat(68));
console.log(out);
console.log('─'.repeat(68));
console.log(`${out.split('\n').length}줄 · 원본 ${path.relative(ROOT, SRC)} (설명 주석은 원본에 있다)`);
