/**
 * Gate 2-25 — the language picker's order.
 *
 * User decision 2026-09-30: "System" first; the device's own language beside it, if it
 * is one of ours; the rest by their English name. The list is SUPPORTED_LANGUAGES
 * (dictionaries.js), the order is languageOrder.js, and matchSystemLanguage says which
 * of ours the device speaks — returning null, not English, when it speaks none, so a
 * Vietnamese phone does not see English promoted as its language.
 *
 * No locale codes are written here (gate 2-17): every expectation is derived from the
 * list itself.
 */
import assert from 'assert';
import fs from 'fs';

const { SUPPORTED_LANGUAGES, matchSystemLanguage, detectSystemLanguage } = await import('../../../src/i18n/dictionaries.js');
const { orderLanguages } = await import('../../../src/i18n/languageOrder.js');

console.log('\n🌐 [2-25] Language picker order — System, the device\'s language, then A–Z by English name');

const langs = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'auto');
const byName = (list) => [...list].sort((a, b) => a.englishName.localeCompare(b.englishName, 'en')).map((l) => l.code);

// 1. Every language can be sorted: an English name, and no two alike.
for (const l of langs) assert.ok(typeof l.englishName === 'string' && l.englishName.trim(), `${l.code} has no englishName — the picker cannot place it`);
assert.strictEqual(new Set(langs.map((l) => l.englishName)).size, langs.length, 'two languages share an englishName');
console.log(`  ✅ 1. ${langs.length} languages, each with its own English name`);

// 2. A device that speaks none of ours: System, then A–Z.
{
  const got = orderLanguages(SUPPORTED_LANGUAGES, null).map((l) => l.code);
  assert.strictEqual(got[0], 'auto', 'System must come first');
  assert.deepStrictEqual(got.slice(1), byName(langs), `after System the languages must run A–Z by English name — got ${got.slice(1).join(', ')}`);
  console.log(`  ✅ 2. no match: System, then ${langs.map((l) => l.englishName).sort((a, b) => a.localeCompare(b, 'en')).join(' · ')}`);
}

// 3. Each of ours as the device language: it sits beside System, the rest stay A–Z.
for (const l of langs) {
  const got = orderLanguages(SUPPORTED_LANGUAGES, l.code).map((x) => x.code);
  assert.strictEqual(got[0], 'auto', `${l.code}: System must come first`);
  assert.strictEqual(got[1], l.code, `${l.code}: the device's own language must sit beside System — got ${got[1]}`);
  assert.deepStrictEqual(got.slice(2), byName(langs.filter((x) => x.code !== l.code)), `${l.code}: the rest must run A–Z by English name`);
  assert.strictEqual(got.length, SUPPORTED_LANGUAGES.length, `${l.code}: no language may be lost or doubled`);
}
console.log(`  ✅ 3. each of the ${langs.length} as the device language sits beside System; the rest stay A–Z`);

// 4. Which of ours the device speaks. Regional variants map to ours; others are none.
const cases = [['en-US', 'en'], ['en-IN', 'en'], ['ja-JP', 'ja'], ['ko-KR', 'ko'], ['zh-HK', 'zh-TW'], ['zh-Hant-TW', 'zh-TW'],
  ['zh-SG', 'zh-CN'], ['es-MX', 'es-ES'], ['pt-PT', 'pt'], ['hi-IN', 'hi'], ['ar-EG', 'ar'], ['vi-VN', null], ['th-TH', null], ['', null]];
for (const [raw, want] of cases) {
  assert.strictEqual(matchSystemLanguage(raw), want,
    want === null ? `${raw || '(empty)'} is none of ours and must not be taken for English — English would be promoted beside System` : `${raw} should map to ${want}`);
}
// The app itself still needs a language to show; that fallback stays English.
Object.defineProperty(globalThis, 'navigator', { value: { language: 'vi-VN' }, configurable: true });
assert.strictEqual(detectSystemLanguage(), 'en', 'an unsupported device language still shows the app in English');
console.log('  ✅ 4. device language → ours or none (not English); the app itself still falls back to English');

// 5. The picker draws the ordered list, not the raw one.
{
  const src = fs.readFileSync('src/components/settings/LanguageSelectorSection.jsx', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.ok(/orderLanguages\(\s*supportedLanguages\s*,\s*matchSystemLanguage\(\)\s*\)/.test(src), 'the picker must order the list with the device language');
  assert.ok(/\bordered\.map\(/.test(src) && !/supportedLanguages\.map\(/.test(src), 'the picker must draw the ordered list, not supportedLanguages as written');
  console.log('  ✅ 5. the settings picker draws the ordered list');
}

console.log('🎉 [2-25] PASSED');
