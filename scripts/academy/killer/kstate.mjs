// Killer board state for the academy example lab: values, candidates and cages.
//
// The classic lab's grid model (../lab/core.mjs) is reused as it is — units, peers,
// candidate masks, singles, locked candidates, subsets. A killer adds one rule to it:
// the digits of a cage are all different and add up to the cage's sum. Placing a digit
// therefore also strikes it from the other cells of its cage.
//
// Puzzles come from the app's own killer generator (src/engine/killer). No outside
// puzzle, grid or text is read.
import { generateKillerPuzzle } from '../../../src/engine/killer/killerGenerator.js';
import { PEERS, UNITS, bit, digits, pop } from '../lab/core.mjs';

export { PEERS, UNITS, bit, digits, pop };

/** A killer from the app's generator, flattened: { cages, givens[81], solution[81] }. */
export function makeKiller(seed, level) {
  const p = generateKillerPuzzle(level, seed);
  return {
    seed,
    level,
    cages: p.cages.map((c) => ({ cells: c.cells.slice(), sum: c.sum })),
    givens: p.board.flat(),
    solution: p.solution.flat(),
  };
}

/** Cell -> index of its cage. */
export function cageIndex(cages) {
  const of = new Array(81).fill(-1);
  cages.forEach((c, k) => c.cells.forEach((i) => { of[i] = k; }));
  return of;
}

/** Peers plus cage-mates: the cells a cell may not repeat. */
export function killerPeers(cages) {
  const of = cageIndex(cages);
  return Array.from({ length: 81 }, (_, i) => {
    const s = new Set(PEERS[i]);
    for (const j of cages[of[i]].cells) if (j !== i) s.add(j);
    return s;
  });
}

export function initKiller(k) {
  const of = cageIndex(k.cages);
  const kp = killerPeers(k.cages);
  const s = { val: new Array(81).fill(0), cand: new Array(81).fill(511), cages: k.cages, cageOf: of, kpeers: kp };
  for (let i = 0; i < 81; i++) if (k.givens[i]) placeK(s, i, k.givens[i]);
  return s;
}

export const cloneK = (s) => ({ ...s, val: s.val.slice(), cand: s.cand.slice() });

export function placeK(s, i, d) {
  s.val[i] = d;
  s.cand[i] = 0;
  for (const p of s.kpeers[i]) s.cand[p] &= ~bit(d);
}

// ── Cage arithmetic ──────────────────────────────────────────────────────────
// SETS[n][sum]: every set (as a digit mask) of n different digits adding up to sum.
export const SETS = Array.from({ length: 10 }, () => Array.from({ length: 46 }, () => []));
for (let m = 1; m < 512; m++) {
  let sum = 0;
  for (const d of digits(m)) sum += d;
  SETS[pop(m)][sum].push(m);
}

/**
 * What is left of a cage once its placed digits are taken out: the open cells, the
 * sum they must make, and the digits they may not use (already in the cage).
 */
export function cageRest(s, cage) {
  const open = cage.cells.filter((i) => !s.val[i]);
  let used = 0;
  let rest = cage.sum;
  for (const i of cage.cells) if (s.val[i]) { used |= bit(s.val[i]); rest -= s.val[i]; }
  return { open, rest, used };
}

/** The digit sets the open cells of a cage can make, by arithmetic alone (no candidates). */
export function arithmeticSets(s, cage) {
  const { open, rest, used } = cageRest(s, cage);
  if (rest < 0 || rest > 45) return [];
  return SETS[open.length][rest].filter((m) => !(m & used));
}

/**
 * Assignments of digits to `cells` that respect their candidates, never repeat a digit
 * between two cells that may not repeat, and pass `ok(values)`. Small groups only.
 */
export function assignments(s, cells, ok) {
  const out = [];
  const vals = [];
  const rec = (k) => {
    if (k === cells.length) { if (ok(vals)) out.push(vals.slice()); return; }
    for (const d of digits(s.cand[cells[k]])) {
      let clash = false;
      for (let j = 0; j < k; j++) if (vals[j] === d && s.kpeers[cells[k]].has(cells[j])) { clash = true; break; }
      if (clash) continue;
      vals.push(d);
      rec(k + 1);
      vals.pop();
    }
  };
  rec(0);
  return out;
}

// ── Houses for the 45 rule ───────────────────────────────────────────────────
// One house adds up to 45. Two or three next to each other — rows, columns, or boxes
// along a band or a stack — add up to 90 or 135. Each set once (three boxes of a band
// are its three rows).
const rows = UNITS.filter((u) => u.type === 'row');
const cols = UNITS.filter((u) => u.type === 'col');
const boxes = UNITS.filter((u) => u.type === 'box');
const run = (list, start, n) => list.slice(start, start + n).flatMap((u) => u.cells);

export const HOUSE_SETS = [];
const seen = new Set();
const addSet = (cells, k, name) => {
  const key = [...cells].sort((a, b) => a - b).join(',');
  if (seen.has(key)) return;
  seen.add(key);
  HOUSE_SETS.push({ cells, set: new Set(cells), k, name });
};
for (const [list, label] of [[rows, 'r'], [cols, 'c'], [boxes, 'b']]) {
  for (let i = 0; i < 9; i++) addSet(list[i].cells, 1, `${label}${i + 1}`);
}
for (let n = 2; n <= 3; n++) {
  for (const [list, label] of [[rows, 'r'], [cols, 'c']]) {
    for (let i = 0; i + n <= 9; i++) addSet(run(list, i, n), n, `${label}${i + 1}-${i + n}`);
  }
  // boxes along a band (0,1,2 / 3,4,5 / 6,7,8) and a stack (0,3,6 / 1,4,7 / 2,5,8)
  for (let band = 0; band < 3; band++) {
    for (let i = 0; i + n <= 3; i++) {
      addSet(boxes.slice(band * 3 + i, band * 3 + i + n).flatMap((u) => u.cells), n, `b${band * 3 + i + 1}-${band * 3 + i + n}`);
      const stack = [0, 1, 2].map((j) => boxes[j * 3 + band]);
      addSet(stack.slice(i, i + n).flatMap((u) => u.cells), n, `b${stack[i].k + 1}|${stack[i + n - 1].k + 1}`);
    }
  }
}
