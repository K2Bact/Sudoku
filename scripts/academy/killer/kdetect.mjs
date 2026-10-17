// Killer technique detectors, written from the techniques' definitions
// (docs/research/killer_strategies_2026-10-15.md §2), not from anyone's examples.
//
// Each returns findings { tech, dels: [[cell, digit]], place?: [cell, digit], ...pattern }.
// Soundness is tested separately (sound.mjs): run on thousands of our own killers and
// compared with the unique solution — a detector that ever removes a true digit is wrong.
//
//   K1   cage remainder        a cage with one open cell: that cell is the rest of the sum
//   K2   unique combination    a cage whose sum and size allow one digit set: nothing else in it
//   K14  two-cell arithmetic   a two-cell cage of sum N: no digit outside N-9..N-1, never N/2
//   K3   45 rule, one cell     one house; the cages almost cover it and one cell is in or out
//   K4   must-contain digit    a digit in every set the cage can make, cage inside a house:
//                              not elsewhere in that house
//   K5   45 rule, more cells   the cells left in or out form a hidden cage (2-3 cells), or one
//                              cell from two or three houses (90, 135)
//   K6   innie-outie difference  one cell in, one cell out: their difference is fixed
//   K7   cage splitting        the cells left in or out are all one cage's part: that part's
//                              sum is fixed, and so is the rest of the cage
//   K11  combination filter    (not taught; keeps the lab solving) each cell keeps only the
//                              digits some full assignment of its cage uses
import { lockedCandidates, subsets, UNITS } from '../lab/core.mjs';
import { bit, digits, pop, SETS, HOUSE_SETS, cageRest, arithmeticSets, assignments } from './kstate.mjs';

const delsOutside = (s, cells, allowed) => {
  const out = [];
  for (const i of cells) for (const d of digits(s.cand[i] & ~allowed)) out.push([i, d]);
  return out;
};

// ── Classic steps, as findings ───────────────────────────────────────────────
export function findSingles(s) {
  const out = [];
  for (let i = 0; i < 81; i++) if (!s.val[i] && pop(s.cand[i]) === 1) out.push({ tech: 'single', kind: 'naked', place: [i, digits(s.cand[i])[0]], dels: [] });
  for (const u of UNITS) for (let d = 1; d <= 9; d++) {
    if (u.cells.some((i) => s.val[i] === d)) continue;
    const where = u.cells.filter((i) => s.cand[i] & bit(d));
    if (where.length === 1) out.push({ tech: 'single', kind: 'hidden', unit: `${u.type}${u.k + 1}`, place: [where[0], d], dels: [] });
  }
  return out;
}
export const findLocked = (s) => lockedCandidates(s, false).map((f) => ({ ...f, tech: 'locked' }));
export const findSubsets = (s) => subsets(s, false).map((f) => ({ ...f, tech: 'subset', kind: f.tech }));

// ── K1 ───────────────────────────────────────────────────────────────────────
export function findK1(s) {
  const out = [];
  s.cages.forEach((cage, k) => {
    if (cage.cells.length < 2) return;
    const { open, rest } = cageRest(s, cage);
    if (open.length !== 1 || rest < 1 || rest > 9) return;
    if (s.cand[open[0]] & bit(rest)) out.push({ tech: 'K1', cage: k, place: [open[0], rest], dels: [] });
  });
  return out;
}

// ── K2 · K14 · K4 (arithmetic only — what a player reads off the cage) ─────────
export function findK2(s) {
  const out = [];
  s.cages.forEach((cage, k) => {
    const { open } = cageRest(s, cage);
    if (open.length < 2) return;
    const sets = arithmeticSets(s, cage);
    if (sets.length !== 1) return;
    const dels = delsOutside(s, open, sets[0]);
    if (dels.length) out.push({ tech: 'K2', cage: k, set: digits(sets[0]), dels });
  });
  return out;
}

export function findK14(s) {
  const out = [];
  s.cages.forEach((cage, k) => {
    if (cage.cells.length !== 2 || cage.cells.some((i) => s.val[i])) return;
    const sets = SETS[2][cage.sum];
    if (sets.length < 2) return; // one set is K2
    const union = sets.reduce((a, m) => a | m, 0);
    const dels = delsOutside(s, cage.cells, union);
    if (dels.length) out.push({ tech: 'K14', cage: k, sum: cage.sum, allowed: digits(union), dels });
  });
  return out;
}

export function findK4(s) {
  const out = [];
  s.cages.forEach((cage, k) => {
    const { open } = cageRest(s, cage);
    if (open.length < 2) return;
    const sets = arithmeticSets(s, cage);
    if (!sets.length) return;
    const must = sets.reduce((a, m) => a & m, 511);
    if (!must) return;
    for (const u of UNITS) {
      if (!open.every((i) => u.cells.includes(i))) continue;
      const others = u.cells.filter((i) => !cage.cells.includes(i));
      const dels = [];
      for (const i of others) for (const d of digits(s.cand[i] & must)) dels.push([i, d]);
      if (dels.length) out.push({ tech: 'K4', cage: k, must: digits(must), sets: sets.length, unit: `${u.type}${u.k + 1}`, dels });
    }
  });
  return out;
}

// ── K3 · K5 · K6 · K7: one engine for the 45 rule ─────────────────────────────
// For houses H (k of them, adding up to 45k) take the cages inside H and any choice of
// the cages that cross its edge (Q). Cells of H outside Q are innies (I), cells of Q
// outside H are outies (O), and   sum(I) - sum(O) = 45k - sum(Q).
// Groups of at most three open cells are solved exhaustively; a candidate no solution
// uses is gone.
const MAX_GROUP = 3;
const MAX_PARTIAL = 12;

export function find45(s) {
  const out = [];
  const seen = new Set();
  for (const H of HOUSE_SETS) {
    const touch = [];
    s.cages.forEach((c, k) => { if (c.cells.some((i) => H.set.has(i))) touch.push(k); });
    const inside = touch.filter((k) => s.cages[k].cells.every((i) => H.set.has(i)));
    const partial = touch.filter((k) => !inside.includes(k));
    if (partial.length > MAX_PARTIAL) continue;
    const insideCells = new Set(inside.flatMap((k) => s.cages[k].cells));
    const insideSum = inside.reduce((a, k) => a + s.cages[k].sum, 0);
    for (let mask = 0; mask < (1 << partial.length); mask++) {
      const chosen = partial.filter((_, j) => mask & (1 << j));
      const qCells = new Set(insideCells);
      let qSum = insideSum;
      for (const k of chosen) { qSum += s.cages[k].sum; s.cages[k].cells.forEach((i) => qCells.add(i)); }
      const I = H.cells.filter((i) => !qCells.has(i));
      const O = [...qCells].filter((i) => !H.set.has(i));
      const Io = I.filter((i) => !s.val[i]);
      const Oo = O.filter((i) => !s.val[i]);
      const a = Io.length;
      const b = Oo.length;
      if (a + b === 0 || a + b > MAX_GROUP) continue;
      let D = 45 * H.k - qSum;
      for (const i of I) if (s.val[i]) D -= s.val[i];
      for (const i of O) if (s.val[i]) D += s.val[i];
      const cells = [...Io, ...Oo];
      const sols = assignments(s, cells, (v) => {
        let x = 0;
        for (let j = 0; j < a; j++) x += v[j];
        for (let j = a; j < cells.length; j++) x -= v[j];
        return x === D;
      });
      if (!sols.length) continue; // a contradiction is not a lesson
      const dels = [];
      cells.forEach((c, j) => {
        const used = sols.reduce((m, v) => m | bit(v[j]), 0);
        for (const d of digits(s.cand[c] & ~used)) dels.push([c, d]);
      });
      const place = a + b === 1 && sols.length === 1 ? [cells[0], sols[0][0]] : null;
      if (!dels.length && !(place && pop(s.cand[cells[0]]) > 1)) continue;
      let tech;
      if (a + b === 1) tech = H.k === 1 ? 'K3' : 'K5';
      else if (a && b) tech = a === 1 && b === 1 ? 'K6' : 'K6m';
      else {
        const group = a ? Io : Oo;
        const one = s.cageOf[group[0]];
        tech = group.every((i) => s.cageOf[i] === one) ? 'K7' : 'K5';
      }
      const key = `${tech}|${dels.map(([i, d]) => `${i}:${d}`).join(',')}|${place}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ tech, house: H.name, k: H.k, cages: chosen.concat(inside), innies: Io, outies: Oo, diff: D, dels, place });
    }
  }
  return out;
}

// ── K11 (lab only) ───────────────────────────────────────────────────────────
export function findK11(s) {
  const out = [];
  s.cages.forEach((cage, k) => {
    const { open, rest } = cageRest(s, cage);
    if (open.length < 2 || open.length > 6) return;
    const sols = assignments(s, open, (v) => v.reduce((x, y) => x + y, 0) === rest);
    if (!sols.length) return;
    const dels = [];
    open.forEach((c, j) => {
      const used = sols.reduce((m, v) => m | bit(v[j]), 0);
      for (const d of digits(s.cand[c] & ~used)) dels.push([c, d]);
    });
    if (dels.length) out.push({ tech: 'K11', cage: k, dels });
  });
  return out;
}
