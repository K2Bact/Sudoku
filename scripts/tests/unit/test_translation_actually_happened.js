/**
 * test_translation_actually_happened.js
 * QA Gate: a string that was never translated does not ship as if it was.
 *
 * ── What this can and cannot see ──────────────────────────────────────────
 * All thirteen locales are machine translated and none has had a native
 * review. No gate can judge whether the German reads naturally — that is not
 * what this checks and pretending otherwise would be worse than checking
 * nothing.
 *
 * What it does check is the way machine translation fails *visibly*:
 *
 *   1. the source language is left sitting in another locale's value
 *   2. a value is empty
 *   3. a value is byte-identical to English when it should not be
 *
 * Number three is the interesting one and also the noisy one. Seventy-eight
 * values match English today and almost all of them are correct: `Pause` is
 * German, `Notes` is French, `S` is Sonntag, and `Sudoku` is the app's name in
 * every language. A check that reported all seventy-eight would be ignored
 * within a week, and an ignored gate is worse than no gate — it looks like
 * coverage.
 *
 * So the exceptions are enumerated, each with a reason. Adding one is a
 * deliberate act; the list is short enough to read, and if it starts growing
 * that is itself the signal.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LOCALES } from '../../lib/locales.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales');

/**
 * Keys that are English in every language on purpose: the app's own name,
 * interpolation-only strings, and badges kept as English loanwords.
 */
const INTENTIONALLY_ENGLISH = new Set([
  'home.title',                       // the app is called Sudoku everywhere
  'home.badge',                       // PRO — brand tier label
  'home.modes.daily.badge',           // NEW
  'home.modes.timeAttack.badge',      // SPEEDRUN
  'header.levelPrefix',               // "Lv.{level}" — abbreviation + token
  'rematchToast.countdown',           // "{seconds}s"
  'brainReport.percentilePrefix',     // "Top " — followed by a number
  'common.confirm',                   // OK
]);

/** Keys whose value is one or two letters — day initials and the like. */
const INITIALS = /^calendar\.days\./;

/**
 * (locale, key) pairs where the translation genuinely equals the English word.
 * Each of these was checked by hand; they are coincidences, not omissions.
 */
const COINCIDENTAL = new Set([
  'de|common.pause',                  // Pause ist deutsch
  'fr|common.pause',                  // pause est français
  'de|achievements.win_5.title',      // "High Five" is the loanword in German
  'fr|achievements.win_5.title',      // idem
  'fr|levels.5',                      // Expert
  'fr|keypad.notes',                  // Notes
  'fr|achievements.statsTab',         // Stats
  'it|home.nav.stats',                // Stats
  'it|common.home',                   // Home
  'it|battleResult.homeBtn',          // Home
  'pt|settings.privacy.sec2Title',     // Google Play Games is the product's own name in pt-BR and hi
  'hi|settings.privacy.sec2Title',     // idem
]);

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else if (typeof v === 'string') out[key] = v;
  }
  return out;
}

async function load(locale) {
  const dir = path.join(LOCALES_DIR, locale);
  const merged = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    const mod = await import('file:///' + path.join(dir, f).replace(/\\/g, '/'));
    Object.assign(merged, mod.default || mod[Object.keys(mod)[0]] || {});
  }
  return flatten(merged);
}

console.log('======================================================');
console.log('🧪 QA Gate: Translation Actually Happened');
console.log('======================================================\n');

const dict = {};
for (const loc of LOCALES) dict[loc] = await load(loc);

const keys = Object.keys(dict.en || {});
console.log(`  로케일 ${LOCALES.length}개 · 키 ${keys.length}개\n`);

const HANGUL = /[가-힯]/;
const LATIN_ONLY = /^[\x20-\x7E\s]+$/;

// Someone else's trademark, in any script. "Mensa" was taken out of the tier
// names on 2026-09-17 and survived in the iq_150 achievement title in all 13
// languages until the 1.2.6 AAB was opened on 2026-09-19 — transliterated, so a
// search for the Latin word alone found six of the thirteen.
const TRADEMARKS = /mensa(?![a-z])|멘사|メンサ|门萨|門薩|менс[аы]|مينسا|मेंसा/i;

const problems = { hangul: [], empty: [], sameAsEn: [], trademark: [] };

for (const loc of LOCALES) {
  for (const k of keys) {
    const v = dict[loc]?.[k];
    if (typeof v !== 'string') continue;

    if (!v.trim()) { problems.empty.push(`[${loc}] ${k}`); continue; }

    if (TRADEMARKS.test(v)) problems.trademark.push(`[${loc}] ${k} = "${v.slice(0, 50)}"`);

    // The source language of this project is Korean. Hangul anywhere else means
    // a string was copied before it was translated.
    if (loc !== 'ko' && HANGUL.test(v)) {
      problems.hangul.push(`[${loc}] ${k} = "${v.slice(0, 50)}"`);
    }

    if (loc === 'en') continue;
    if (v !== dict.en?.[k]) continue;
    if (!LATIN_ONLY.test(v)) continue;              // shared CJK is not evidence
    if (INTENTIONALLY_ENGLISH.has(k)) continue;
    if (INITIALS.test(k)) continue;
    if (COINCIDENTAL.has(`${loc}|${k}`)) continue;
    problems.sameAsEn.push(`[${loc}] ${k} = "${v.slice(0, 50)}"`);
  }
}

let failed = 0;
function report(name, list, advice) {
  if (list.length === 0) { console.log(`  ✅ [PASS] ${name}`); return; }
  failed++;
  console.error(`  ❌ [FAIL] ${name} — ${list.length}건`);
  for (const l of list.slice(0, 10)) console.error(`      ${l}`);
  if (list.length > 10) console.error(`      … 외 ${list.length - 10}건`);
  console.error(`      ${advice}\n`);
}

report('비한국어 로케일에 한글이 없다', problems.hangul,
  '원문을 복사하고 번역하지 않은 자리입니다. 해당 언어로 옮기십시오.');
report('남의 상표 이름이 없다', problems.trademark,
  '1인 개발에 법률 자문이 없다. 다른 단체·제품의 등록 상표를 등급이나 업적 이름으로 쓰지 않는다.');
report('빈 문자열이 없다', problems.empty,
  '빈 값은 화면에 아무것도 그리지 않고 조용히 지나갑니다.');
report('영어를 그대로 둔 자리가 없다', problems.sameAsEn,
  '그 언어에서도 같은 단어가 맞다면 COINCIDENTAL 에, 모든 언어에서 영어로 둘 값이면 ' +
  'INTENTIONALLY_ENGLISH 에 이유와 함께 추가하십시오. 목록이 길어지는 것 자체가 신호입니다.');

console.log('\n======================================================');
if (failed > 0) {
  console.error(`❌ [AUDIT FAILED] ${failed} check(s) failed.`);
  process.exit(1);
}
console.log('🎉 [PASS] 기계로 확인 가능한 미번역 흔적이 없습니다.');
console.log('   (문장이 자연스러운지는 이 게이트가 판단하지 않습니다 — 13개 언어 전부 미감수)');
console.log('======================================================');
