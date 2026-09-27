/**
 * print_firebase_rules.js
 *
 * Prints firebase.rules.json in the shape the Firebase console wants, so the
 * rules can be pasted without editing them by hand.
 *
 *   node scripts/store/print_firebase_rules.js
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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'firebase.rules.json');

const parsed = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!parsed.rules) {
  console.error(`${SRC} has no "rules" key — nothing to publish.`);
  process.exit(1);
}

const out = JSON.stringify({ rules: parsed.rules }, null, 2);

console.log('─'.repeat(68));
console.log('Firebase 콘솔 > Realtime Database > 규칙 에 아래를 통째로 붙여넣고');
console.log('[게시] 를 누른다. 붙여넣기 전에 반드시 읽을 것:');
console.log('');
console.log('  이 규칙은 senderId 가 로그인 계정의 uid 와 같기를 요구한다.');
console.log('  그렇게 서명하는 것은 빌드 22(1.3.0)부터다. 21 을 쓰는 이용자는');
console.log('  게시하는 순간 1v1 쓰기가 전부 거부된다 — 22 가 퍼진 뒤에 게시할 것.');
console.log('─'.repeat(68));
console.log(out);
console.log('─'.repeat(68));
console.log(`${out.split('\n').length}줄 · 원본 ${path.relative(ROOT, SRC)} (설명 주석은 원본에 있다)`);
