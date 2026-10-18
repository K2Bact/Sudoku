/**
 * Gate 2-22 — a game still being played can be resumed; a broken save cannot blank the app.
 *
 * RT-1 (F12, ChatGPT red team 2026-09-20): with the mistake limit off, or in Speedrun,
 * a game carries on past 3 mistakes — but Home's Resume button, the resume itself and
 * the saved-state check all required `mistakes < 3`, so the game could not be reopened.
 * RT-6 (F13): a save whose board was not a 9x9 grid made Resume throw and the screen
 * went blank. One rule now answers both (src/utils/savedGame.js).
 * A killer save must also carry its cages (section 5, 2026-10-01).
 * And its seconds played, which Survival is graded on (section 6, BACKLOG D15) —
 * a killer's worked back on killer numbers (2026-10-14, KP-2).
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const { isResumableGame, playedSecondsOf } = await import('../../../src/utils/savedGame.js');
const { survivalLimitSeconds, survivalCellBonusSeconds } = await import('../../../src/engine/survivalClock.js');

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
// 6. A resumed game keeps the seconds it was played (BACKLOG D15). Survival is
//    graded on them, not on its clock (the time left, +7 s a cell), so a resume
//    that started them again at 0 would grade the rest of the game alone — fast.
{
  const solution = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1));
  const initial = solution.map((row, r) => row.map((v, c) => (r < 4 ? v : 0)));   // 45 blanks
  const board = initial.map((row) => row.slice());
  for (let c = 0; c < 9; c++) board[4][c] = solution[4][c];                       // 9 right
  board[5][0] = solution[5][0] === 9 ? 1 : solution[5][0] + 1;                       // 1 wrong
  const survival = { board, initialBoard: initial, solutionBoard: solution, notes: grid().map((r) => r.map(() => [])), mistakes: 1, gameMode: 'timeLimit', level: 1 };

  // The bonus worked back here must be the bonus the game gives — or old saves are
  // worked back wrong. Since killer Survival (KP-2) both read survivalClock.js, of the
  // save's kind and level; the game's side is read from its source (a React hook).
  const input = fs.readFileSync(path.join(ROOT, 'src/hooks/useGameInput.js'), 'utf8');
  assert(input.includes('addSurvivalBonusTime(survivalCellBonusSeconds(variant, level));'),
    'the game must pay the Survival bonus from survivalClock.js — the table old saves are worked back with');

  assert.strictEqual(playedSecondsOf({ ...survival, timerSeconds: 150, playedSeconds: 333 }), 333, 'a save that kept its seconds played brings them back as they were');
  assert.strictEqual(playedSecondsOf({ ...good(), timerSeconds: 412 }), 412, 'an old Classic save: its clock ran with the time played');
  assert.strictEqual(playedSecondsOf({ ...good({ gameMode: 'timeAttack' }), timerSeconds: 95 }), 95, 'an old Speedrun save: the same');
  // An old Survival save: Lv.1 has 240 s; 150 left after 9 right cells (+63) → 153 s played.
  const worked = 240 - 150 + 7 * 9;
  assert.strictEqual(playedSecondsOf({ ...survival, timerSeconds: 150 }), worked,
    'an old Survival save: limit − time left + 7 s for each RIGHT cell on the board (the wrong one gave nothing)');
  // A killer save is worked back on the killer's numbers: 7 min at Lv.1, 9 s a cell.
  const killerSave = { ...survival, variant: 'killer', timerSeconds: 150 };
  assert.strictEqual(survivalLimitSeconds('killer', 1), 420);
  assert.strictEqual(playedSecondsOf(killerSave), 420 - 150 + survivalCellBonusSeconds('killer', 1) * 9,
    'a killer Survival save worked back on classic numbers (4 min, 7 s a cell) — not the limit and bonus it was played with');
  assert.strictEqual(playedSecondsOf({ ...survival, timerSeconds: 150, playedSeconds: -4 }), worked, 'a broken count is read as missing, not as negative time');
  assert.strictEqual(playedSecondsOf({ ...survival, timerSeconds: 150, solutionBoard: undefined }), 90, 'without the solution no cell is known right: the floor, limit − left');
  assert.strictEqual(playedSecondsOf(null), 0);

  // Saved with the game, put back on resume.
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const lifecycle = strip(fs.readFileSync(path.join(ROOT, 'src/hooks/useGameLifecycle.js'), 'utf8'));
  const saveCall = lifecycle.slice(lifecycle.indexOf('saveGameState({'), lifecycle.indexOf('});', lifecycle.indexOf('saveGameState({')));
  assert(/playedSeconds: s\.playedSeconds,/.test(saveCall), 'the saved game must carry the seconds played');
  const game = strip(fs.readFileSync(path.join(ROOT, 'src/hooks/useSudokuGame.js'), 'utf8'));
  const resume = game.slice(game.indexOf('const resumeSavedGame = '), game.indexOf('return true;', game.indexOf('const resumeSavedGame = ')));
  assert(/resetTimer\(saved\.level, saved\.gameMode, saved\);/.test(resume), 'resuming must put back both clocks from the save');
  const timer = strip(fs.readFileSync(path.join(ROOT, 'src/hooks/useGameTimer.js'), 'utf8'));
  const reset = timer.slice(timer.indexOf('const resetTimer = '), timer.indexOf('setComboCount(0)', timer.indexOf('const resetTimer = ')));
  assert(/setPlayedSeconds\(playedSecondsOf\(saved\)\)/.test(reset), 'the timer must take a saved game\'s seconds played from playedSecondsOf');
  console.log('  ✅ 6. a resumed game keeps its seconds played; an old Survival save works them back from the time left and the right cells');
}
// 7. A resumed game remembers which cells have been paid for (BACKLOG D17). A
//    right digit pays once — Survival +7 s, a Speedrun combo. A resume that
//    forgot would pay every cell already on the board again when erased and
//    placed back. A save from before this was kept treats the cells it shows
//    right as paid: each was placed, and paid, once.
{
  const { newPlayFacts, restorePlayFacts, firstRightAnswer } = await import('../../../src/utils/playFacts.js');
  const solution = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1));
  const initial = solution.map((row, r) => row.map((v, c) => (r < 4 ? v : 0)));
  const board = initial.map((row) => row.slice());
  board[4][0] = solution[4][0];                                   // cell 36 right
  board[4][1] = solution[4][1] === 9 ? 1 : solution[4][1] + 1;    // cell 37 wrong

  const facts = newPlayFacts();
  assert.strictEqual(firstRightAnswer(facts, 40), true, 'the first right digit in a cell pays');
  assert.strictEqual(firstRightAnswer(facts, 40), false, 'the same cell right again does not');
  assert.strictEqual(firstRightAnswer(facts, 41), true, 'another cell still pays');

  const kept = restorePlayFacts({ board, initialBoard: initial, solutionBoard: solution, playFacts: JSON.parse(JSON.stringify(facts)) });
  assert.deepStrictEqual(kept.rewardedCells, [40, 41], 'a saved game keeps the cells it has paid for');
  assert.strictEqual(firstRightAnswer(kept, 40), false, 'and after the resume they do not pay again');

  const old = restorePlayFacts({ board, initialBoard: initial, solutionBoard: solution });
  assert.deepStrictEqual(old.rewardedCells, [36], 'an old save counts the cells it shows right as paid — not the wrong one, not the givens');
  assert.deepStrictEqual(restorePlayFacts({ board: 'broken' }).rewardedCells, [], 'a save without a board to read pays nothing back');

  // The game's best Speedrun combo is kept with the facts (ChatGPT CH18-R01,
  // 2026-10-18): kept beside the clock it was reset by a resume, and a 5-combo
  // before a trip home was saved as 1. An old save knows none.
  const { comboReached } = await import('../../../src/utils/playFacts.js');
  const run = newPlayFacts();
  assert.strictEqual(run.bestCombo, 0, 'a new game has no combo yet');
  comboReached(run, 5);
  comboReached(run, 1);
  assert.strictEqual(run.bestCombo, 5, 'the best combo stays the best when a shorter streak follows');
  const back = restorePlayFacts({ board, initialBoard: initial, solutionBoard: solution, playFacts: JSON.parse(JSON.stringify(run)) });
  assert.strictEqual(back.bestCombo, 5, 'a resumed game keeps the best combo it had reached');
  assert.strictEqual(restorePlayFacts({ board, initialBoard: initial, solutionBoard: solution }).bestCombo, 0, 'a save from before the best was kept reads as none');

  // The hook needs React to run; what it must contain is short, so it is read.
  const input = fs.readFileSync(path.join(ROOT, 'src/hooks/useGameInput.js'), 'utf8');
  const gate = input.indexOf('if (firstRightAnswer(playFactsRef?.current, r * 9 + c)) {');
  for (const pay of ['handleComboSuccess();', 'addSurvivalBonusTime(survivalCellBonusSeconds(variant, level));']) {
    const at = input.indexOf(pay);
    assert(gate > 0 && input.split(pay).length === 2 && at > gate && at - gate < 300,
      `${pay} must be paid in one place, inside the once-a-cell check (useGameInput.js)`);
  }
  console.log('  ✅ 7. a right digit pays once a cell, and a resumed game remembers the cells already paid');
}
console.log('🎉 [2-22] PASSED');
