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
  'home.modes.timeAttack.badge',      // SPEEDRUN
  'header.levelPrefix',               // "Lv.{level}" — abbreviation + token
  'rematchToast.countdown',           // "{seconds}s"
  // Just the number: the victory card shows it next to its own label (mistakesLabel).
  // English was always "{count}"; hi joined it on 2026-09-29 so "1 गलतियां" stopped appearing.
  'modals.victory.mistakesCount',     // "{count}"
  // Same reason: the stats row shows it beside survivalTotalWins. "{count} Clears" read
  // "1 Clears" and the app has no plural rules (BACKLOG PL-1, 2026-09-29).
  'stats.survivalWinsUnit',           // "{count}"
  'brainReport.percentilePrefix',     // "Top " — followed by a number
  'common.confirm',                   // OK
  // One score name in every language, the same as the Play Games leaderboard, so the
  // developer has one name to keep track of (user decision 2026-09-19). ja writes it in katakana.
  'home.scoreLabel',                  // Logic Score
  'brainReport.scoreLabel',           // Logic Score
]);

/** Keys whose value is one or two letters — day initials and the like. */
const INITIALS = /^calendar\.days\./;

/**
 * (locale, key) pairs where the translation genuinely equals the English word.
 * Each of these was checked by hand; they are coincidences, not omissions.
 */
const COINCIDENTAL = new Set([
  'de|common.pause',                  // Pause ist deutsch
  'de|settings.languages.auto',       // System ist deutsch
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
  // Labels that were English literals in components until 2026-09-30 (SudokuAITalk DE29-12).
  // They are keys now; these locales write them the English way on purpose.
  'de|achievements.tiers.bronze',      // Bronze ist deutsch
  'de|achievements.tiers.gold',        // Gold ist deutsch
  'fr|achievements.tiers.bronze',      // bronze est français
  'pt|achievements.tiers.bronze',      // bronze é português
  'es-ES|achievements.pointsTotal',    // pts = puntos
  'fr|achievements.pointsTotal',       // pts = points
  'pt|achievements.pointsTotal',       // pts = pontos
  'fr|keypad.notesOn',                 // Notes is French (keypad.notes above); ON/OFF is the switch loanword
  'fr|keypad.notesOff',                // idem
  'de|replay.pause',                   // Pause ist deutsch (as common.pause)
  'fr|replay.pause',                   // pause est français (as common.pause)
  'fr|replay.sumNotes',                // Notes (as keypad.notes)
  // AI is how these languages write it — the mode titles already say AI 봇 대전, AI ボット対戦,
  // AI 机器人对战, AI 機器人對戰. German, the Romance languages and Russian use KI / IA / ИИ.
  'ko|home.modes.aiBattle.badge',      // VS AI
  'ja|home.modes.aiBattle.badge',      // VS AI
  'hi|home.modes.aiBattle.badge',      // VS AI — "vs" is everyday in India (IND vs AUS)
  'ko|battleHeader.aiTag',             // AI
  'ja|battleHeader.aiTag',             // AI
  'zh-CN|battleHeader.aiTag',          // AI
  'zh-TW|battleHeader.aiTag',          // AI
  'hi|battleHeader.aiTag',             // AI
  // Killer Sudoku (2026-10-01). The puzzle is sold under the English word in these
  // languages — Killer-Sudoku, Sudoku Killer — and Standard is German, French and
  // Italian as it is English. es-ES and pt say Estándar / Padrão and are not listed for it.
  'de|variants.classic',               // Standard
  'fr|variants.classic',               // Standard
  'it|variants.classic',               // Standard
  'de|variants.killer',                // Killer
  'de|killer.badge',                   // KILLER
  'de|killer.stats.title',             // Killer
  'fr|variants.killer',                // Killer
  'fr|killer.badge',                   // KILLER
  'fr|killer.stats.title',             // Killer
  'it|variants.killer',                // Killer
  'it|killer.badge',                   // KILLER
  'it|killer.stats.title',             // Killer
  'es-ES|variants.killer',             // Killer
  'es-ES|killer.badge',                // KILLER
  'es-ES|killer.stats.title',          // Killer
  'pt|variants.killer',                // Killer
  'pt|killer.badge',                   // KILLER
  'pt|killer.stats.title',             // Killer
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

// Marks that are someone else's in one market only. 「数独／SUDOKU」 is Nikoli's
// registered mark in Japan, classes 9/16/28/41 (J-PlatPat, 2026-09-19) — software
// included. Elsewhere "sudoku" is used generically, so this is per locale.
const MARKS_BY_LOCALE = { ja: /数独|sudoku/i };

// "PB" — personal best — is an English abbreviation that no locale explained. The German review
// could not tell what it meant; the user took it out on 2026-09-30 (BACKLOG HC-1): the ghost banner
// names the mode, and the hint notice says "personal best" in words.
const PB = /(^|[^A-Za-z])PB([^A-Za-z]|$)/;

const problems = { hangul: [], empty: [], sameAsEn: [], trademark: [], pb: [] };

for (const loc of LOCALES) {
  for (const k of keys) {
    const v = dict[loc]?.[k];
    if (typeof v !== 'string') continue;

    if (!v.trim()) { problems.empty.push(`[${loc}] ${k}`); continue; }

    if (PB.test(v)) problems.pb.push(`[${loc}] ${k} = "${v.slice(0, 50)}"`);
    if (TRADEMARKS.test(v)) problems.trademark.push(`[${loc}] ${k} = "${v.slice(0, 50)}"`);
    if (MARKS_BY_LOCALE[loc]?.test(v)) problems.trademark.push(`[${loc}] ${k} = "${v.slice(0, 50)}" (local mark)`);

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

// The launcher label is not in the JS locales — Android reads it from res/values-<lang>.
// Without values-ja the Japanese home screen falls back to values/ and shows "Sudoku".
const jaStrings = path.join(path.dirname(LOCALES_DIR), '../../android/app/src/main/res/values-ja/strings.xml');
if (!fs.existsSync(jaStrings)) problems.trademark.push('[ja] android res/values-ja/strings.xml missing — launcher falls back to "Sudoku"');
else {
  const label = (fs.readFileSync(jaStrings, 'utf8').match(/name="app_name">([^<]*)</) || [])[1] || '';
  if (!label || MARKS_BY_LOCALE.ja.test(label)) problems.trademark.push(`[ja] launcher app_name = "${label}" (local mark or empty)`);
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
report('PB 라는 약자가 없다', problems.pb,
  '개인 최고 기록은 그 언어의 말로 씁니다(사용자 2026-09-30, BACKLOG HC-1). 배너는 모드 이름을 씁니다.');
report('남의 상표 이름이 없다', problems.trademark,
  '1인 개발에 법률 자문이 없다. 다른 단체·제품의 등록 상표를 등급이나 업적 이름으로 쓰지 않는다.');
report('빈 문자열이 없다', problems.empty,
  '빈 값은 화면에 아무것도 그리지 않고 조용히 지나갑니다.');
report('영어를 그대로 둔 자리가 없다', problems.sameAsEn,
  '그 언어에서도 같은 단어가 맞다면 COINCIDENTAL 에, 모든 언어에서 영어로 둘 값이면 ' +
  'INTENTIONALLY_ENGLISH 에 이유와 함께 추가하십시오. 목록이 길어지는 것 자체가 신호입니다.');

// ── One mode, one name ───────────────────────────────────────────────────
//
// Each mode is written in three places — the tab, the badge on its card and the
// card's title — and they had drifted apart. Korean called one mode 타임어택 on
// the tab, 스피드런 on the badge and "타임어택 (스피드런)" in the title: three
// names for one thing on one screen. German mixed Zeitrennen with SPEEDRUN,
// Spanish Contrarreloj with SPEEDRUN, Arabic and Traditional Chinese each ran
// two words per mode (user report, 2026-09-26: "말 헷갈린다").
//
// Nothing else in this file would notice: every string is present, translated
// and non-empty. It is only wrong when you read two of them together.
//
// Two rules, because two different things go wrong:
//
//   1. the badge uses an unrelated word — SPEEDRUN where the tab says
//      Zeitrennen. "Unrelated" has to survive inflection: German Klassisch and
//      Klassik ARE the same word, and demanding they match letter for letter
//      would ask for bad German. Sharing a four-character opening, or one
//      containing the other, counts as the same name.
//
//   2. the title carries a second name in brackets — "타임어택 (스피드런)",
//      "Überleben (Zeitlimit)". That one is exact: a mode's title needs no
//      alias, and if it does the alias is the name.
console.log('\n▶ 모드 이름이 탭·배지·제목에서 같은가');
{
  const bare = (v) => String(v || '').replace(/^[^\p{L}\p{N}]+/u, '').trim().toLocaleLowerCase();
  const related = (a, b) => {
    if (!a || !b) return true;
    if (a.includes(b) || b.includes(a)) return true;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i >= 4;
  };
  const problems = [];
  for (const loc of LOCALES) {
    for (const mode of ['classic', 'timeAttack', 'timeLimit']) {
      const tab = bare(dict[loc][`home.modeTabs.${mode}`]);
      if (!tab) continue;
      const badge = bare(dict[loc][`home.modes.${mode}.badge`]);
      const title = dict[loc][`home.modes.${mode}.title`] || '';
      if (badge && !related(badge, tab)) {
        problems.push(`[${loc}] ${mode}: 탭 "${tab}" 와 배지 "${badge}" 가 다른 말이다`);
      }
      const alias = title.match(/[（(]([^）)]+)[）)]/);
      if (alias) {
        problems.push(`[${loc}] ${mode}: 제목 "${title}" 이 괄호로 두 번째 이름 "${alias[1]}" 을 달고 있다`);
      }
      if (title && !related(bare(title), tab)) {
        problems.push(`[${loc}] ${mode}: 탭 "${tab}" 인데 제목은 "${title}" 로 시작한다`);
      }
    }
  }
  report('한 모드를 탭·배지·제목이 같은 이름으로 부른다', problems,
    '같은 모드를 자리마다 다른 말로 부르면, 이용자는 그것이 같은 모드인지 알 수 없습니다. ' +
    '그 언어의 탭 이름 하나로 통일하십시오. 어형 변화는 같은 이름으로 봅니다 — ' +
    '문제는 다른 낱말과 괄호 속 별명입니다.');
}

console.log('\n======================================================');
if (failed > 0) {
  console.error(`❌ [AUDIT FAILED] ${failed} check(s) failed.`);
  process.exit(1);
}
console.log('🎉 [PASS] 기계로 확인 가능한 미번역 흔적이 없습니다.');
console.log('   (문장이 자연스러운지는 이 게이트가 판단하지 않습니다 — 13개 언어 전부 미감수)');
console.log('======================================================');
