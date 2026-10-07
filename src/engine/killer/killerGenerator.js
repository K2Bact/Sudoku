/**
 * killerGenerator.js
 * Makes a Killer Sudoku with exactly one solution, from our own random grid.
 *
 * 1. A full classic solution (the same generator classic games use).
 * 2. Cut it into cages: connected groups of cells with no digit twice.
 * 3. Each cage's sum is read off the solution.
 * 4. Make its solution the only one: Lv.1-3 reveal more digits, Lv.4-5 split
 *    cages and keep the digits they were given (makeUnique).
 *
 * The level sets how many digits are given and how many wrong turns the proof
 * may take; cages are cut the same way at every level. With the same seed the
 * same puzzle comes back, so a daily killer is possible later.
 *
 * Measured 2026-10-07 on the dev PC, 200-300 puzzles per level: median 6-20 ms,
 * at most 0.21 s (Lv.4) — the app generates them on the spot, as it does classic.
 */
import { createPRNG, generateFullSolution, shuffle, cloneGrid, createEmptyGrid } from '../SudokuEngine.js';
import { solveKiller } from './killerSolver.js';

// sizes: [cage size, weight] — how often a new cage aims for that size; a 1 is
// a one-cell cage kept on purpose. givens: digits revealed from the start.
// repair: how an ambiguous puzzle is made unique — 'reveal' a digit, or 'split'
// a cage and keep the givens as they are. guesses: how many wrong turns the
// solver may take proving the answer is the only one. Its narrowing is what a
// player does — cage sums, the 45 rule, a digit with one place left — so 0 means
// those alone solve the puzzle, and more means it needs harder reasoning. Past
// it the puzzle is too hard for its level and is changed again, which makes it
// easier.
//
// The levels follow the most played killer app, Easybrain's "Killer Sudoku by
// Sudoku.com" (10M+ installs), measured 2026-10-07 on its 6,300 built-in puzzles
// with this solver. It tells its levels apart by givens alone — Easy 31, Medium
// 26, Hard 10, Expert 0, the same in every puzzle — and cuts cages the same way
// at every level: about 49% two cells, 28% three, 10% four, 2-3% five. One-cell
// cages (never on a given) are 10% at Easy and Medium, 17% at Hard, 6% at Expert:
// each one is a digit shown, so Expert keeps few. Easy to Hard need no wrong turns; Expert's median is
// 1, its 90th percentile 21, 95th 38. Our Lv.2-5 are those four under the same
// names, and Lv.1 is one step below its Easy. Before this our Lv.3 "Medium"
// gave 4-7 digits and bigger cages, and 38% of its puzzles needed wrong turns:
// between its Hard and Expert (user, 2026-10-07: "보통 맞아? 전혀 안 그래 보이는데").
// Lv.4-5 split cages to repair, and splitting leaves one-cell cages, so they aim
// for fewer on purpose.
const CAGE_SIZES = [[1, 11], [2, 50], [3, 27], [4, 10], [5, 3]];
const FEW_SINGLES = [[1, 1], [2, 54], [3, 30], [4, 11], [5, 4]];
export const KILLER_CONFIG = {
  1: { sizes: CAGE_SIZES, givens: 36, repair: 'reveal', guesses: 0 },
  2: { sizes: CAGE_SIZES, givens: 31, repair: 'reveal', guesses: 0 },
  3: { sizes: CAGE_SIZES, givens: 26, repair: 'reveal', guesses: 0 },
  4: { sizes: CAGE_SIZES, givens: 10, repair: 'split', guesses: 0 },
  5: { sizes: FEW_SINGLES, givens: 0, repair: 'split', guesses: 150 },
};

// Past this many wrong turns the search stops and the puzzle counts as too hard.
const SEARCH_LIMIT = 2000;

const neighbours = (cell) => {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  const out = [];
  if (r > 0) out.push(cell - 9);
  if (r < 8) out.push(cell + 9);
  if (c > 0) out.push(cell - 1);
  if (c < 8) out.push(cell + 1);
  return out;
};

function pickSize(sizes, rng) {
  const total = sizes.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [size, w] of sizes) {
    roll -= w;
    if (roll < 0) return size;
  }
  return sizes[sizes.length - 1][0];
}

/**
 * Cut the solved grid into cages. Each new cage starts at the free cell with the
 * fewest free neighbours — starting in the open leaves stranded single cells in
 * the gaps. A single cell that ends up alone by accident joins a neighbouring
 * cage that lacks its digit; a cage that aimed for one cell stays one cell.
 */
export function cutIntoCages(solution, sizes, rng) {
  const digit = solution.flat();
  const cageOf = new Int16Array(81).fill(-1);
  const cages = [];
  const single = new Set();
  const freeAround = (cell) => neighbours(cell).filter((n) => cageOf[n] < 0).length;
  const order = shuffle([...Array(81).keys()], rng);

  for (;;) {
    let start = -1;
    for (const cell of order) {
      if (cageOf[cell] >= 0) continue;
      if (start < 0 || freeAround(cell) < freeAround(start)) start = cell;
    }
    if (start < 0) break;

    const target = pickSize(sizes, rng);
    if (target === 1) single.add(cages.length);
    const cells = [start];
    let used = 1 << digit[start];
    cageOf[start] = cages.length;
    while (cells.length < target) {
      const options = [];
      for (const cell of cells) {
        for (const n of neighbours(cell)) {
          if (cageOf[n] < 0 && !(used & (1 << digit[n])) && !options.includes(n)) options.push(n);
        }
      }
      if (!options.length) break;
      const next = options[Math.floor(rng() * options.length)];
      cells.push(next);
      used |= 1 << digit[next];
      cageOf[next] = cages.length;
    }
    cages.push(cells);
  }

  for (let k = 0; k < cages.length; k++) {
    if (cages[k].length !== 1 || single.has(k)) continue;
    const cell = cages[k][0];
    const homes = neighbours(cell)
      .map((n) => cageOf[n])
      .filter((h) => h !== k && cages[h].length > 0 && !cages[h].some((c) => digit[c] === digit[cell]))
      .sort((a, b) => cages[a].length - cages[b].length);
    if (!homes.length) continue;
    cages[homes[0]].push(cell);
    cageOf[cell] = homes[0];
    cages[k] = [];
  }

  return cages
    .filter((cells) => cells.length > 0)
    .map((cells) => {
      const sorted = [...cells].sort((a, b) => a - b);
      return { cells: sorted, sum: sorted.reduce((sum, c) => sum + digit[c], 0) };
    })
    .sort((a, b) => a.cells[0] - b.cells[0]);
}

/**
 * Split a cage where two solutions disagree, so its two halves each carry their
 * own sum. The half that keeps `cell` grows from it; what is left may fall apart
 * into pieces, and each piece becomes a cage of its own. Every piece of a cage
 * still has no digit twice, so every piece is a valid cage.
 */
function splitCage(cages, cell, digit, rng) {
  const k = cages.findIndex((cage) => cage.cells.includes(cell));
  const cells = cages[k].cells;
  const inCage = new Set(cells);
  const half = new Set([cell]);
  while (half.size < Math.floor(cells.length / 2)) {
    const options = [...half].flatMap(neighbours).filter((n) => inCage.has(n) && !half.has(n));
    if (!options.length) break;
    half.add(options[Math.floor(rng() * options.length)]);
  }
  const pieces = [[...half]];
  const left = new Set(cells.filter((c) => !half.has(c)));
  while (left.size) {
    const piece = [left.values().next().value];
    left.delete(piece[0]);
    for (let i = 0; i < piece.length; i++) {
      for (const n of neighbours(piece[i])) if (left.delete(n)) piece.push(n);
    }
    pieces.push(piece);
  }
  const made = pieces.map((piece) => {
    const sorted = piece.sort((a, b) => a - b);
    return { cells: sorted, sum: sorted.reduce((sum, c) => sum + digit[c], 0) };
  });
  return [...cages.slice(0, k), ...made, ...cages.slice(k + 1)].sort((a, b) => a.cells[0] - b.cells[0]);
}

/**
 * Change the puzzle until its solution is the only one. Each change goes where
 * two solutions disagree, so it removes the ambiguity the search just found:
 * Lv.1-3 reveal that cell's digit, Lv.4-5 split the cage around it and keep the
 * digits they started with. Every change adds information, so this always ends
 * — at worst with every digit known.
 */
function makeUnique(cages, solution, config, rng) {
  const digit = solution.flat();
  const givens = createEmptyGrid();
  const reveal = (cell) => { givens[Math.floor(cell / 9)][cell % 9] = digit[cell]; };
  // A one-cell cage already shows its digit; a given there would be a given wasted.
  const single = new Set(cages.filter((cage) => cage.cells.length === 1).map((cage) => cage.cells[0]));
  for (const cell of shuffle([...Array(81).keys()].filter((c) => !single.has(c)), rng).slice(0, config.givens)) reveal(cell);

  for (;;) {
    // Trying the answer first walks straight to it: one step per open cell, and
    // one more to find the grid full. Every step past those is a wrong turn.
    const open = [...Array(81).keys()].filter((cell) => !givens[Math.floor(cell / 9)][cell % 9]);
    // The search may go further than the level allows: a second solution is
    // found only past some wrong turns, and where it differs is where to repair.
    const straight = open.length + 1;
    const result = solveKiller(cages, givens, { limit: 2, nodeLimit: straight + SEARCH_LIMIT, prefer: solution });
    const guesses = result.nodes - straight;
    if (result.count === 1 && !result.aborted && guesses <= config.guesses) return { cages, givens, guesses };
    // The grid it was cut from always solves it; none found means the solver is wrong.
    if (result.count === 0 && !result.aborted) throw new Error('killer: the puzzle lost the solution it was cut from');
    // Unique but too hard, or undecided: no second solution says where, so anywhere.
    const other = result.solutions.find((s) => s.flat().some((d, i) => d !== digit[i]));
    const disputed = other ? open.filter((cell) => other.flat()[cell] !== digit[cell]) : open;
    if (config.repair === 'split') {
      // Split the biggest cage in dispute: halving a big cage keeps cages
      // two cells or more, halving a pair leaves two one-cell cages.
      const sizeOf = (cell) => cages.find((cage) => cage.cells.includes(cell)).cells.length;
      const biggest = Math.max(...disputed.map(sizeOf));
      if (biggest > 1) {
        const pool = disputed.filter((cell) => sizeOf(cell) === biggest);
        cages = splitCage(cages, pool[Math.floor(rng() * pool.length)], digit, rng);
        // A split can leave a given alone in its cage: the cage now shows that
        // digit, and Lv.4 would play with nine givens, not ten. The cage keeps
        // the digit known, so the given moves to a cell nothing shows yet — only
        // information is added, so the repair still ends.
        for (const cage of cages) {
          const [cell] = cage.cells;
          if (cage.cells.length !== 1 || !givens[Math.floor(cell / 9)][cell % 9]) continue;
          givens[Math.floor(cell / 9)][cell % 9] = 0;
          const shown = new Set(cages.filter((c) => c.cells.length === 1).map((c) => c.cells[0]));
          const free = [...Array(81).keys()].filter((c) => !shown.has(c) && !givens[Math.floor(c / 9)][c % 9]);
          reveal(free[Math.floor(rng() * free.length)]);
        }
        continue;
      }
    }
    reveal(disputed[Math.floor(rng() * disputed.length)]);
  }
}

// A one-cell cage is a given drawn as a cage. Lv.4-5 repair by splitting, and
// splitting pairs leaves them behind: measured 2026-10-06 with the cage mix of
// then, 300 puzzles per level, Lv.4 went past 12 in 2 and Lv.5 in 13 (up to 18).
// Such a cut is thrown away and the grid cut again. With the mix of 2026-10-07
// a cut averages 3-6 of them, at most 12 in 200 per level.
const MAX_ONE_CELL_CAGES = 12;
// Lv.1-3 reveal digits to repair. Measured 2026-10-07, 1000 puzzles per level:
// 80-92% need none, the rest one or two — but one Lv.3 in 1000 took thirteen,
// a "Medium" holding more digits than Lv.1. Past two, the grid is cut again.
const MAX_EXTRA_GIVENS = 2;
const MAX_CUTS = 10;
const oneCellCages = (cages) => cages.filter((cage) => cage.cells.length === 1).length;
const givenCount = (givens) => givens.flat().filter(Boolean).length;

export function generateKillerPuzzle(level = 3, seed = null) {
  const rng = seed ? createPRNG(seed) : Math.random;
  const lv = KILLER_CONFIG[level] ? Number(level) : 3;
  const config = KILLER_CONFIG[lv];
  const solution = generateFullSolution(rng);
  // How far a cut is past either limit. Ten cuts all past has not been seen; keep
  // the least bad if it happens.
  const overBy = (m) => Math.max(0, oneCellCages(m.cages) - MAX_ONE_CELL_CAGES)
    + Math.max(0, givenCount(m.givens) - config.givens - MAX_EXTRA_GIVENS);
  let made = null;
  for (let cut = 0; cut < MAX_CUTS; cut++) {
    const next = makeUnique(cutIntoCages(solution, config.sizes, rng), solution, config, rng);
    if (!made || overBy(next) < overBy(made)) made = next;
    if (overBy(made) === 0) break;
  }
  const { cages, givens, guesses } = made;

  return {
    solution,
    board: givens,
    puzzle: givens,
    initialGrid: cloneGrid(givens),
    level: lv,
    seed: seed || null,
    variant: 'killer',
    cages,
    guesses,
  };
}
