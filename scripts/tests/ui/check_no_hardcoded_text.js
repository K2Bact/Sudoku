/**
 * check_no_hardcoded_text.js
 *
 * Every user-facing string must come from t('key') and exist in all 13 locales.
 *
 * This gate used to look for Korean characters ONLY, and reported
 * "0 hardcoded strings" while four English literals were rendering to every
 * locale — among them `📺 Watching rewarded ad... (3s)`, which was also wrong
 * about the duration and claimed a real advertiser during closed testing.
 *
 * That gap was not bad luck. The base locale of this app is English, so an
 * untranslated English literal reads as perfectly finished code to whoever
 * writes it, and to every reviewer after. Korean is the language a contributor
 * has to go out of their way to hardcode. The scanner was watching the door
 * nobody walks through.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

const koreanRegex = /[가-힯]/;

/**
 * Product names that deliberately stay in English in every locale. Keep this
 * list short: each entry is a string no translator will ever be able to reach.
 */
const BRAND_TERMS = ['Sudoku IQ', 'Sudoku PRO', 'ONLINE PVP', 'VS AI', 'DAILY'];

/**
 * Literal prose sitting between JSX tags, e.g. `<p>Watching ad</p>`.
 * `{t('...')}` and every other expression carries braces and is skipped.
 */
function hardcodedJsxText(line) {
  const found = [];
  for (const match of line.matchAll(/>([^<>{}]+)</g)) {
    const text = match[1].trim();
    if (!text) continue;
    if (BRAND_TERMS.includes(text)) continue;
    // Three letters is enough to be a word rather than a symbol, unit or arrow.
    if ((text.match(/[A-Za-z]/g) || []).length < 3) continue;
    // SHOUTED LABELS and dotted.identifiers are decoration, not prose.
    if (/^[A-Z0-9_.\-\s]+$/.test(text)) continue;
    found.push(text);
  }
  return found;
}

// Files allowed to contain internal localized data dictionaries
const allowedFiles = [
  'src/i18n',
  'src/data/',
  'src/components/academy/Stage',
  'src/services/'
];

const targetFiles = walk('src').filter((f) => {
  if (!f.endsWith('.jsx') && !f.endsWith('.js')) return false;
  return !allowedFiles.some((af) => f.replace(/\\/g, '/').includes(af));
});

console.log('🔍 [QA Hardcode Scanner] Inspecting source files for forbidden hardcoded text...');

const violations = [];

for (const f of targetFiles) {
  let raw = readFileSync(f, 'utf8');
  // Strip block comments and JSX comments
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  raw = raw.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  /*
   * 줄 끝 주석도 걷어낸다. 줄 전체가 주석인 경우만 건너뛰면
   *
   *     if (!mine) return false;   // 누가 이미 나를 데려갔다
   *
   * 이 한국어 하드코딩으로 보고된다. 주석은 이용자에게 닿지 않으므로
   * 위반이 아니고, 이 보고는 순전히 소음이다. 소음이 쌓인 게이트는
   * 무시당하고, 무시당하는 게이트는 검사처럼 보이는 장식이 된다.
   *
   * 같은 약점이 게이트 2-17 에도 있었고 같은 방식으로 고쳤다.
   *
   * 문자열 안의 `//` 는 건드리지 않아야 한다 — `'https://…'` 가 흔하다.
   * 그래서 앞에 콜론이나 역슬래시가 오는 경우를 뺀다.
   *
   * 이것은 완전한 파서가 아니고, 남는 구멍의 방향을 정확히 적어둔다:
   * `const a = 'x//y'; const b = '안녕';` 처럼 문자열 안에 콜론 없는 `//` 가
   * 있으면 그 뒤가 주석으로 취급되어 **위반이 가려진다.** 자바스크립트를
   * 제대로 토큰화하지 않는 한 이 구멍은 남는다.
   *
   * 그 위험을 받아들인 이유: `'x//y'` 형태는 이 저장소에 하나도 없고,
   * 반대쪽 비용은 지금 당장 실재했다 — 한국어 주석 하나 때문에 게이트가
   * 빨개지고, 그런 일이 반복되면 사람이 게이트를 끄거나 주석을 영어로
   * 바꾸기 시작한다. 후자가 더 나쁘다. 이 저장소의 주석은 왜 그렇게 고쳤는지를
   * 한국어로 설명하고 있고, 그게 이 프로젝트에서 가장 값나가는 부분이다.
   *
   * 이 구멍을 메우려면 토큰화가 필요하다. 그때까지는 여기 적힌 것이 전부다.
   */
  const lines = raw.split('\n').map((line) => line.replace(/(^|[^:\\])\/\/.*$/, '$1'));
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    if (koreanRegex.test(trimmed)) {
      violations.push({ file: f, line: idx + 1, text: trimmed });
      return;
    }

    if (f.endsWith('.jsx')) {
      for (const text of hardcodedJsxText(line)) {
        violations.push({ file: f, line: idx + 1, text: `(English) ${text}` });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`\n❌ [QA Hardcode Scanner] FOUND ${violations.length} HARDCODED STRINGS:`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}:${v.line} -> ${v.text}`);
  });
  console.error(
    '\n🚨 All user-facing strings MUST use t("key") and be registered in all 13 locale dictionaries.' +
    '\n   A literal that happens to be English is not exempt — it reaches every locale untranslated.\n'
  );
  process.exit(1);
} else {
  console.log(`✅ [QA Hardcode Scanner] PASSED! Inspected ${targetFiles.length} UI & Hook files with 0 hardcoded strings.`);
}
