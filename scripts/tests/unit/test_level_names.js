/**
 * Gate 2-24 — a level has one name.
 *
 * The level buttons take their names from `levels` in each locale. Daily missions,
 * achievements and the store listing name levels too, in their own sentences, and
 * nothing tied them to the buttons. On 2026-09-28 (SudokuDiary 52, BACKLOG ES-1 /
 * LV-1) the thirteen dictionaries held 161 "Lv.N <name>" mentions and 28 used a
 * name the buttons did not: 「Lv.1 매우 쉬움」 for a level the button calls 입문 (a
 * "very easy" level the app does not have), "Lv.5 Meister" under a button that says
 * Experte. Spanish had it the other way round — the buttons were one step off from
 * its own missions, so Lv.2 was "Medio" on the home screen and "Fácil" in the
 * daily mission. The store descriptions were the same kind of copy: nine of
 * thirteen named levels the app did not have.
 *
 * Both checks read `levels` — the one place the buttons read — and nothing else:
 *   1. every "Lv.N <text>" in a dictionary continues with levels[N]
 *      ("Lv.4 이상", "Lv.4 以上" — "Lv.4 and above" — are not names, and pass)
 *   2. every store description names the five levels on one line, in order,
 *      exactly as the buttons do
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { LOCALES } from '../../lib/locales.js';

// How a level is written before its number. Not every locale says "Lv.": Portuguese
// writes Nv., Russian Ур., Hindi स्तर, Arabic (ال)مستوى. The first version of this gate
// looked for "Lv." alone, reported those four languages clean, and they were not —
// Nv.5 Mestre, Ур.5 Мастер, स्तर 5 मास्टर, مستوى 1 سهل جداً all under different buttons.
//
// Since 2026-09-30 every language writes Lv. (user: "Lv 는 게이머 전세계 공통"). The home buttons
// always said Lv.3 in all thirteen while the game header and the missions said Ур.3 in Russian —
// one level, two marks on the way from the button to the board. The other prefixes stay in this
// pattern so that one coming back is caught (check 3) rather than silently not counted.
// A locale whose missions name levels but match none of these fails below, so a new
// prefix cannot hide the same way.
const LEVEL_MARK = /(?:Lv\.|Nv\.|Ур\.|स्तर|(?:ال)?مستوى)\s?([1-5])\+?\s+/gu;
// "Lv.4 and above" in the languages that write it right after the level.
const AND_ABOVE = ['이상', '以上'];
// Check 3: a level written any other way, with a number or the {level} slot.
const OTHER_MARK = /(?:Nv\.|Ур\.|स्तर|(?:ال)?مستوى)\s?(?:[1-5]|\{level\})/u;
// Arabic may put the name in brackets or give it the article: (مبتدئ), الخبير.
const lead = (s) => s.replace(/^[(（]\s*/, '').replace(/^ال/, '');

const flatten = (o, pre = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const p = pre ? `${pre}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, p, out);
    else if (typeof v === 'string') out[p] = v;
  }
  return out;
};

console.log('\n🏷️  [2-24] A level has one name — buttons, missions, achievements, store');

// Locales come from scripts/lib/locales.js, which reads the app (gate 2-17). Each one's
// store text is found by name — store_description_<locale>.txt, or <language> for
// es-ES — so a locale with no listing, or with two, fails here instead of being skipped.
const dir = path.resolve('src/i18n/locales');
const storeFiles = fs.readdirSync(path.resolve('store_assets'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .flatMap((d) => fs.readdirSync(path.resolve('store_assets', d.name))
    .filter((f) => /^store_description_.+\.txt$/.test(f))
    .map((f) => path.join(d.name, f)));
const storeFileFor = (loc) => {
  const hits = storeFiles.filter((f) => {
    const tag = path.basename(f).replace(/^store_description_|\.txt$/g, '');
    return tag === loc || tag === loc.split('-')[0];
  });
  assert.strictEqual(hits.length, 1, `${loc}: expected one store description, found ${hits.length} (${hits.join(', ')})`);
  return hits[0];
};

const problems = [];
let mentions = 0;
for (const loc of LOCALES) {
  const storeFile = storeFileFor(loc);
  const dict = (await import(pathToFileURL(path.join(dir, `${loc}.js`)).href)).default;
  const names = dict.levels;
  assert.ok(names && [1, 2, 3, 4, 5].every((n) => typeof names[n] === 'string' && names[n]),
    `${loc}: levels 1–5 must all be named`);

  // 1. Every "Lv.N …" in the dictionary continues with the button's name.
  let here = 0;
  for (const [key, text] of Object.entries(flatten(dict))) {
    const other = text.match(OTHER_MARK);
    if (other) problems.push(`${loc} ${key}: writes the level as "${other[0]}" — the app writes Lv. in every language`);
    for (const m of text.matchAll(LEVEL_MARK)) {
      here++;
      const rest = text.slice(m.index + m[0].length);
      const n = m[1];
      if (lead(rest).startsWith(lead(names[n])) || AND_ABOVE.some((w) => rest.startsWith(w))) continue;
      problems.push(`${loc} ${key}: "${m[0]}${rest.slice(0, 24)}…" — the Lv.${n} button says "${names[n]}"`);
    }
  }
  // Every locale has daily missions for Lv.1–5; finding none means the prefix is unknown.
  if (here < 5) problems.push(`${loc}: only ${here} level mention(s) found — does this language write levels with a prefix LEVEL_MARK does not know?`);
  mentions += here;

  // 2. The store listing names the five levels together, in order, as the app does.
  const store = fs.readFileSync(path.resolve('store_assets', storeFile), 'utf8');
  const inOrder = (line) => {
    let at = -1;
    for (let n = 1; n <= 5; n++) {
      at = line.indexOf(names[n], at + 1);
      if (at < 0) return false;
    }
    return true;
  };
  if (!store.split('\n').some(inOrder)) {
    problems.push(`${loc} ${storeFile}: no line names the five levels as the buttons do (${[1, 2, 3, 4, 5].map((n) => names[n]).join(' · ')})`);
  }
}

console.log(`  ${mentions} "Lv.N" mentions across ${LOCALES.length} locales · ${LOCALES.length} store descriptions`);
if (problems.length) {
  console.log(`\n🚨 ${problems.length} level name(s) that are not the button's:`);
  for (const p of problems) console.log(` - ${p}`);
  console.log('\n❌ [2-24] FAILED — a level named two ways reads as two different levels');
  process.exit(1);
}
assert.ok(mentions > 100, `only ${mentions} "Lv.N" mentions found — the scan is not reaching the dictionaries`);
console.log('  ✅ every mission and achievement names a level as its button does');
console.log('  ✅ every language writes the level as Lv.');
console.log('  ✅ every store description lists the five levels as the app does');
console.log('🎉 [2-24] PASSED');
