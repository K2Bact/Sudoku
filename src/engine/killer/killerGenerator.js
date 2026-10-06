/**
 * killerGenerator.js
 * Makes a Killer Sudoku with exactly one solution, from our own random grid.
 *
 * 1. A full classic solution (the same generator classic games use).
 * 2. Cut it into cages: connected groups of cells with no digit twice.
 * 3. Each cage's sum is read off the solution.
 * 4. Make its solution the only one: Lv.1-3 reveal digits, Lv.4-5 split cages
 *    and reveal none (makeUnique).
 *
 * The level sets how big cages grow and how many digits are given. With the
 * same seed the same puzzle comes back, so a daily killer is possible later.
 *
 * Measured 2026-10-01 on the dev PC, 100 puzzles per level: Lv.1-3 under 0.12 s
 * each, Lv.4-5 median 0.05 s and at most 0.34 s — about twice what a classic
 * Lv.5 takes, which the app already generates on the spot.
 */
import { createPRNG, generateFullSolution, shuffle, cloneGrid, createEmptyGrid } from '../SudokuEngine.js';
import { solveKiller } from './killerSolver.js';

// sizes: [cage size, weight] — how often a new cage aims for that size.
// givens: digits revealed from the start. repair: how an ambiguous puzzle is
// made unique — 'reveal' a digit, or 'split' a cage and keep the grid empty.
// guesses: how many wrong turns the solver may take proving the answer is the
// only one. Its narrowing is what a player does — cage sums, the 45 rule, a
// digit with one place left — so 0 means those alone solve the puzzle, and
// more means it needs harder reasoning. Past it the puzzle is too hard for its
// level and is changed again, which makes it easier.
//
// Measured 2026-10-01 before this cap, 100 puzzles per level (wrong turns,
// median / 90th percentile / max): Lv.1 0/0/0, Lv.2 0/0/2, Lv.3 0/16/173,
// Lv.4 9/894/1902, Lv.5 22/821/1577. A Lv.5 at 1,248 took a plain search
// longer than eight minutes to check; a person would be guessing too.
export const KILLER_CONFIG = {
  1: { sizes: [[2, 55], [3, 40], [4, 5]], givens: 18, repair: 'reveal', guesses: 0 },
  2: { sizes: [[2, 45], [3, 40], [4, 15]], givens: 10, repair: 'reveal', guesses: 0 },
  3: { sizes: [[2, 35], [3, 40], [4, 20], [5, 5]], givens: 4, repair: 'reveal', guesses: 20 },
  4: { sizes: [[2, 25], [3, 35], [4, 25], [5, 15]], givens: 0, repair: 'split', guesses: 100 },
  5: { sizes: [[2, 15], [3, 30], [4, 30], [5, 20], [6, 5]], givens: 0, repair: 'split', guesses: 300 },
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
 * the gaps. A single cell that still ends up alone joins a neighbouring cage that
 * lacks its digit, so a one-cell cage (a given in disguise) is rare.
 */
export function cutIntoCages(solution, sizes, rng) {
  const digit = solution.flat();
  const cageOf = new Int16Array(81).fill(-1);
  const cages = [];
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
    if (cages[k].length !== 1) continue;
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
 * Lv.1-3 reveal that cell's digit, Lv.4-5 split the cage around it and give no
 * digits at all. Every change adds information, so this always ends — at worst
 * with every digit known.
 */
function makeUnique(cages, solution, config, rng) {
  const digit = solution.flat();
  const givens = createEmptyGrid();
  const reveal = (cell) => { givens[Math.floor(cell / 9)][cell % 9] = digit[cell]; };
  for (const cell of shuffle([...Array(81).keys()], rng).slice(0, config.givens)) reveal(cell);

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
        continue;
      }
    }
    reveal(disputed[Math.floor(rng() * disputed.length)]);
  }
}

// A one-cell cage is a given drawn as a cage. Lv.4-5 repair by splitting, and
// splitting pairs leaves them behind: measured 2026-10-06, 300 puzzles per level,
// Lv.4 went past 12 in 2 and Lv.5 in 13 (up to 18) — a "no givens" level holding
// more known digits than Lv.3. Such a cut is thrown away and the grid cut again.
// Gate 2-27 checked this limit on 8 fixed seeds, none of them in that 4%.
const MAX_ONE_CELL_CAGES = 12;
const MAX_CUTS = 10;
const oneCellCages = (cages) => cages.filter((cage) => cage.cells.length === 1).length;

export function generateKillerPuzzle(level = 3, seed = null) {
  const rng = seed ? createPRNG(seed) : Math.random;
  const lv = KILLER_CONFIG[level] ? Number(level) : 3;
  const config = KILLER_CONFIG[lv];
  const solution = generateFullSolution(rng);
  // Ten cuts all past the limit has not been seen; keep the least decayed if it happens.
  let made = null;
  for (let cut = 0; cut < MAX_CUTS; cut++) {
    const next = makeUnique(cutIntoCages(solution, config.sizes, rng), solution, config, rng);
    if (!made || oneCellCages(next.cages) < oneCellCages(made.cages)) made = next;
    if (oneCellCages(made.cages) <= MAX_ONE_CELL_CAGES) break;
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
