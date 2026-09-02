/**
 * test_academy_purity.js
 *
 * The academy's diagram text must be plain text, and its mini-grids must be
 * grids.
 *
 * Post-mortem #13 records that `<strong>[1단계: 가로줄 4개]</strong>` was printed
 * on screen, tags and all, because React escapes text — the markup sat in the
 * translation data where nothing would ever render it as markup. The same entry
 * records that Last Free Cell drew as a 1×9 column instead of a 3×3 box.
 *
 * It also records that a gate was added — "영구 자동화 테스트로 편입하여 100%
 * 통과 완료", `scripts/test_academy_multilingual_purity.js`. **That file does
 * not exist and nothing academy-related is in the QA pipeline.** The code is
 * currently correct and nothing has been protecting it.
 *
 * A safety net that is written down but not present is worse than a missing
 * one: the next person reads the registry, believes the case is closed, and
 * stops looking. This is that gate, actually in the pipeline this time.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

console.log('======================================================');
console.log('🎓 Testing Academy Text Purity & Diagram Structure');
console.log('======================================================\n');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

// ── 1. No markup in text that React will escape ───────────────────────────
console.log('▶ 1. Academy text carries no HTML tags');
const dataFiles = walk(path.join(ROOT, 'src/data/academy'));
assert(dataFiles.length > 0, 'No academy data files found — has the path moved?');

// React renders these as literal characters, so a tag in a translation string
// reaches the player exactly as typed.
const TAG = /<\/?(strong|b|i|em|br|span|div|p|u|small)\b[^>]*>/i;
const tagged = [];
for (const f of dataFiles) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (TAG.test(line)) tagged.push(`${rel(f)}:${i + 1} → ${line.trim().slice(0, 80)}`);
  });
}
assert.deepStrictEqual(tagged, [],
  'HTML tags found in academy text:\n  ' + tagged.join('\n  ') +
  '\n\nReact escapes these, so the player reads the tag itself. Academy copy must ' +
  'be plain text; use separate elements for emphasis instead of markup in strings.');
console.log(`  ✅ ${dataFiles.length} academy data files, 0 tags`);

// ── 2. Mini-grids are 3×3 boxes, not columns ──────────────────────────────
console.log('▶ 2. Last Free Cell draws a 3×3 box');
const stage1 = fs.readFileSync(path.join(ROOT, 'src/components/academy/Stage1MiniGrids.jsx'), 'utf8');
assert(/mini-3x3-real-board/.test(stage1),
  'Stage1MiniGrids must render mini-3x3-real-board — the technique is about the ' +
  'last empty cell in a BOX, and a 1×9 column does not teach it');
assert(!/mini-col-grid/.test(stage1),
  'Stage1MiniGrids still contains mini-col-grid, the column layout that once ' +
  'replaced the 3×3 box');
console.log('  ✅ 3×3 box grid, no column fallback');

/*
 * A third check was attempted and deliberately dropped: "no caption rendered
 * twice in one component".
 *
 * Counting occurrences per file accused correct code, because
 * Stage2PointingClaiming has four mutually exclusive branches (ppStep 1/2 and
 * claimStep 1/2) and each labels its own diagram with the same key — one at a
 * time on screen, never together. Narrowing it to "twice in a row in source
 * order" accused the same file for the same reason: exclusive branches sit next
 * to each other in the file and nowhere near each other at runtime.
 *
 * Deciding it properly means knowing which branches can render together, and a
 * regex cannot know that. Two checks that hold beat three where one keeps
 * crying wolf — a scan nobody trusts is worse than a missing one, because it
 * reports success in the same voice a working one would use.
 *
 * The visible symptom of the original bug — raw markup on screen — is covered
 * by check 1 above, which is exact. A duplicated caption with no markup in it
 * is cosmetic, and not worth a check that misfires.
 */

console.log('\n======================================================');
console.log('🎉 Academy purity gate passed — plain text, real grids.');
console.log('======================================================');
