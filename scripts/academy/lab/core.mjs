// Grid model, puzzle generation and basic solving for the academy example lab.
//
// Everything here is our own: the full-grid generator is the app's SudokuEngine,
// the minimiser and the solving steps are written for this lab. No external puzzle,
// grid or text is read.
import * as Engine from '../../../src/engine/SudokuEngine.js';

export const ROW = (i) => Math.floor(i / 9);
export const COL = (i) => i % 9;
export const BOX = (i) => Math.floor(ROW(i) / 3) * 3 + Math.floor(COL(i) / 3);
export const rc = (i) => `r${ROW(i) + 1}c${COL(i) + 1}`;

export const UNITS = [];
for (let k = 0; k < 9; k++) UNITS.push({ type: 'row', k, cells: [...Array(9)].map((_, j) => k * 9 + j) });
for (let k = 0; k < 9; k++) UNITS.push({ type: 'col', k, cells: [...Array(9)].map((_, j) => j * 9 + k) });
for (let k = 0; k < 9; k++) {
  const br = Math.floor(k / 3) * 3, bc = (k % 3) * 3;
  UNITS.push({ type: 'box', k, cells: [...Array(9)].map((_, j) => (br + Math.floor(j / 3)) * 9 + bc + (j % 3)) });
}
export const PEERS = Array.from({ length: 81 }, (_, i) => {
  const s = new Set();
  for (const u of UNITS) if (u.cells.includes(i)) u.cells.forEach((j) => s.add(j));
  s.delete(i);
  return s;
});
export const sees = (a, b) => a !== b && PEERS[a].has(b);

export const bit = (d) => 1 << (d - 1);
export const digits = (m) => { const out = []; for (let d = 1; d <= 9; d++) if (m & bit(d)) out.push(d); return out; };
export const pop = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

// ── Puzzles ────────────────────────────────────────────────────────────────
export function makePRNG(seed) { return Engine.createPRNG(seed); }

export function solveCount(vals, limit = 2) {
  const g = vals.slice();
  let count = 0;
  let first = null;
  const rec = () => {
    if (count >= limit) return;
    let best = -1, bestM = 0, bestN = 10;
    for (let i = 0; i < 81; i++) if (!g[i]) {
      let m = 511;
      for (const p of PEERS[i]) if (g[p]) m &= ~bit(g[p]);
      const n = pop(m);
      if (!n) return;
      if (n < bestN) { best = i; bestM = m; bestN = n; if (n === 1) break; }
    }
    if (best < 0) { count++; if (!first) first = g.slice(); return; }
    for (const d of digits(bestM)) { g[best] = d; rec(); g[best] = 0; }
  };
  rec();
  return { count, solution: first };
}

/** A minimal puzzle: from a random full grid, remove every clue that keeps the solution unique. */
export function minimalPuzzle(seed) {
  const rng = makePRNG(seed);
  const full = Engine.generateFullSolution(rng).flat();
  const vals = full.slice();
  const order = Engine.shuffle([...Array(81).keys()], rng);
  for (const i of order) {
    const keep = vals[i];
    vals[i] = 0;
    if (solveCount(vals, 2).count !== 1) vals[i] = keep;
  }
  return { puzzle: vals, solution: full };
}

// ── Candidate state ───────────────────────────────────────────────────────
export function initState(puzzle) {
  const val = puzzle.slice();
  const cand = new Array(81).fill(0);
  for (let i = 0; i < 81; i++) if (!val[i]) {
    let m = 511;
    for (const p of PEERS[i]) if (val[p]) m &= ~bit(val[p]);
    cand[i] = m;
  }
  return { val, cand };
}
export const clone = (s) => ({ val: s.val.slice(), cand: s.cand.slice() });

export function place(s, i, d) {
  s.val[i] = d;
  s.cand[i] = 0;
  for (const p of PEERS[i]) s.cand[p] &= ~bit(d);
}

/** Naked and hidden singles until none. Returns false on contradiction. */
export function singles(s) {
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < 81; i++) if (!s.val[i]) {
      if (!s.cand[i]) return false;
      if (pop(s.cand[i]) === 1) { place(s, i, digits(s.cand[i])[0]); progress = true; }
    }
    for (const u of UNITS) for (let d = 1; d <= 9; d++) {
      if (u.cells.some((i) => s.val[i] === d)) continue;
      const where = u.cells.filter((i) => !s.val[i] && (s.cand[i] & bit(d)));
      if (!where.length) return false;
      if (where.length === 1) { place(s, where[0], d); progress = true; }
    }
  }
  return true;
}

/** Locked candidates (pointing + claiming). Applies one round; returns the eliminations made. */
export function lockedCandidates(s, apply = true) {
  const found = [];
  for (const box of UNITS.filter((u) => u.type === 'box')) for (let d = 1; d <= 9; d++) {
    const where = box.cells.filter((i) => s.cand[i] & bit(d));
    if (where.length < 2) continue;
    for (const lineType of ['row', 'col']) {
      const key = lineType === 'row' ? ROW : COL;
      if (new Set(where.map(key)).size !== 1) continue;
      const line = UNITS.find((u) => u.type === lineType && u.k === key(where[0]));
      const dels = line.cells.filter((i) => BOX(i) !== box.k && (s.cand[i] & bit(d))).map((i) => [i, d]);
      if (dels.length) found.push({ tech: 'pointing', digit: d, pattern: where, box: box.k, line: lineType, dels });
    }
  }
  for (const line of UNITS.filter((u) => u.type !== 'box')) for (let d = 1; d <= 9; d++) {
    const where = line.cells.filter((i) => s.cand[i] & bit(d));
    if (where.length < 2 || new Set(where.map(BOX)).size !== 1) continue;
    const box = UNITS.find((u) => u.type === 'box' && u.k === BOX(where[0]));
    const dels = box.cells.filter((i) => !line.cells.includes(i) && (s.cand[i] & bit(d))).map((i) => [i, d]);
    if (dels.length) found.push({ tech: 'claiming', digit: d, pattern: where, dels });
  }
  if (apply) for (const f of found) for (const [i, d] of f.dels) s.cand[i] &= ~bit(d);
  return found;
}

function combos(arr, k, start = 0, acc = [], out = []) {
  if (acc.length === k) { out.push(acc.slice()); return out; }
  for (let i = start; i < arr.length; i++) { acc.push(arr[i]); combos(arr, k, i + 1, acc, out); acc.pop(); }
  return out;
}
export { combos };

/** Naked and hidden subsets of size 2..4. One pass; returns eliminations made. */
export function subsets(s, apply = true) {
  const found = [];
  for (const u of UNITS) {
    const open = u.cells.filter((i) => !s.val[i]);
    for (let k = 2; k <= 4; k++) {
      for (const set of combos(open.filter((i) => pop(s.cand[i]) <= k), k)) {
        const m = set.reduce((a, i) => a | s.cand[i], 0);
        if (pop(m) !== k) continue;
        const dels = [];
        for (const i of open) if (!set.includes(i)) for (const d of digits(s.cand[i] & m)) dels.push([i, d]);
        if (dels.length) found.push({ tech: 'naked', size: k, pattern: set, dels });
      }
      const ds = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => open.some((i) => s.cand[i] & bit(d)));
      for (const dset of combos(ds, k)) {
        const dm = dset.reduce((a, d) => a | bit(d), 0);
        const cells = open.filter((i) => s.cand[i] & dm);
        if (cells.length !== k) continue;
        if (!dset.every((d) => cells.some((i) => s.cand[i] & bit(d)))) continue;
        const dels = [];
        for (const i of cells) for (const d of digits(s.cand[i] & ~dm)) dels.push([i, d]);
        if (dels.length) found.push({ tech: 'hidden', size: k, pattern: cells, dels });
      }
    }
  }
  if (apply) for (const f of found) for (const [i, d] of f.dels) s.cand[i] &= ~bit(d);
  return found;
}

/**
 * Solve with singles, locked candidates and subsets until stuck.
 * `upTo` limits which basic steps may be used ('singles' | 'locked' | 'all').
 */
export function basicSolve(s, upTo = 'all') {
  for (;;) {
    if (!singles(s)) return 'contradiction';
    if (s.val.every(Boolean)) return 'solved';
    if (upTo === 'singles') return 'stuck';
    if (lockedCandidates(s).length) continue;
    if (upTo === 'locked') return 'stuck';
    if (subsets(s).length) continue;
    return 'stuck';
  }
}
