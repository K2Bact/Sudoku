/**
 * Gate 2-22 — a game still being played can be resumed; a broken save cannot blank the app.
 *
 * RT-1 (F12, ChatGPT red team 2026-09-20): with the mistake limit off, or in Speedrun,
 * a game carries on past 3 mistakes — but Home's Resume button, the resume itself and
 * the saved-state check all required `mistakes < 3`, so the game could not be reopened.
 * RT-6 (F13): a save whose board was not a 9x9 grid made Resume throw and the screen
 * went blank. One rule now answers both (src/utils/savedGame.js).
 * A killer save must also carry its cages (section 5, 2026-10-01).
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const { isResumableGame } = await import('../../../src/utils/savedGame.js');

console.log('\n▶️ [2-22] A game still being played can be resumed; a broken save cannot blank the app');

const grid = (v = 0) => Array.from({ length: 9 }, () => Array(9).fill(v));
const good = (over = {}) => ({ board: grid(), initialBoard: grid(), solutionBoard: grid(5), notes: grid().map((r) => r.map(() => [])), mistakes: 0, gameMode: 'classic', ...over });

// 1. Still being played → resumable, however many mistakes
assert.strictEqual(isResumableGame(good({ mistakes: 3 })), true, 'limit off: 3 mistakes, game still on');
assert.strictEqual(isResumableGame(good({ mistakes: 7, gameMode: 'timeAttack' })), true, 'Speedrun: mistakes cost time, the game goes on');
assert.strictEqual(isResumableGame(good({ mistakes: 2 })), true);
// 2. Finished → not resumable
assert.strictEqual(isResumableGame(good({ isGameOver: true })), false, 'a game that ended stays ended');
assert.strictEqual(isResumableGame(good({ isVictory: true })), false);
// 3. Broken → not offered
assert.strictEqual(isResumableGame(good({ board: 'broken' })), false, 'a string board (F13) must not reach the resume');
assert.strictEqual(isResumableGame(good({ board: grid().slice(0, 8) })), false, '8 rows');
assert.strictEqual(isResumableGame(good({ initialBoard: grid(10) })), false, 'digits above 9');
assert.strictEqual(isResumableGame(good({ solutionBoard: grid(0) })), false, 'a solution with blanks');
assert.strictEqual(isResumableGame(good({ notes: 'x' })), false);
assert.strictEqual(isResumableGame(good({ mistakes: 'x' })), false);
assert.strictEqual(isResumableGame(null), false);
assert.strictEqual(isResumableGame(good({ solutionBoard: undefined, notes: undefined })), true, 'older saves without these fields still resume');
console.log('  ✅ 1. still-playing games resume at any mistake count; finished and malformed saves are not offered');

// 4. Every place that decides uses the one rule — no copy of the old condition left
const uses = {
  'src/utils/storage.js': 'hasSavedGameState',
  'src/components/HomeScreen.jsx': 'Resume button',
  'src/hooks/useSudokuGame.js': 'resumeSavedGame',
  'src/utils/abandonedGame.js': 'quit-as-loss',
};
for (const [file, what] of Object.entries(uses)) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  assert(/isResumableGame\(/.test(code), `${file} (${what}) must decide with isResumableGame`);
  assert(!/mistakes\s*\|\|\s*0\)\s*<\s*3|mistakes\s*<\s*3/.test(code), `${file} (${what}) still has its own "mistakes < 3" — the copy that hid RT-1`);
}
console.log('  ✅ 2. Home, resume, saved-state check and quit-as-loss all ask the same rule');

// 5. A killer save brings its cages (2026-10-01). Without them its board is a near-empty
//    grid no rule pins down; resumed, it would be played as an unsolvable classic puzzle.
{
  const rowCages = Array.from({ length: 9 }, (_, r) => ({ cells: Array.from({ length: 9 }, (_, c) => r * 9 + c), sum: 45 }));
  assert.strictEqual(isResumableGame(good({ variant: 'killer', cages: rowCages })), true, 'a killer save with its cages resumes');
  assert.strictEqual(isResumableGame(good({ variant: 'killer' })), false, 'a killer save without its cages must not be offered');
  assert.strictEqual(isResumableGame(good({ variant: 'killer', cages: rowCages.slice(1) })), false, 'cages that leave cells out are not a killer');
  // Every cell covered, and cell 0 in a second cage too — only the repeat is wrong here.
  assert.strictEqual(isResumableGame(good({ variant: 'killer', cages: [...rowCages, { cells: [0], sum: 5 }] })), false, 'a cell in two places is not a cage set');
  assert.strictEqual(isResumableGame(good()), true, 'a save from before puzzle kinds (no variant) is classic and resumes');
  console.log('  ✅ 5. a killer save resumes only with a whole set of cages; older saves are classic');
}
console.log('🎉 [2-22] PASSED');
