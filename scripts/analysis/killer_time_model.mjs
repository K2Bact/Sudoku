/**
 * killer_time_model.mjs — how much longer a killer takes than a classic, by level.
 *
 * The speedrun grade (S+ / S / A / B / C) is set in seconds per level for classic
 * puzzles (src/utils/speedrunRank.js). Those numbers were put in by hand on
 * 2026-09-01 — nothing records how — and a killer cannot use them: it takes
 * longer by design (KP-8). We have no player times to measure. So both kinds are
 * solved here the way a person does, one deduction at a time, each priced by how
 * much thought it takes; the killer's thresholds are the classic ones times the
 * ratio of the two prices at each level (user, 2026-10-07: option 1).
 *
 * A person's moves, cheapest first — after each one, back to the singles:
 *   single        a cell with one candidate, or a digit with one place in a unit   1
 *   locked        a digit's places in a box all in one row/column, or the reverse  2
 *   cage          a cage's sum and size leave only some sets of digits             2
 *   innie         the 45 rule: a row/column/box minus its whole cages is a cage    3
 *   subset        two or three cells holding two or three digits between them      3
 *   hidden pair   two digits with the same two places in a unit                   4
 *   guess         stuck: try the answer in the narrowest cell                    15
 *   scan          finding a single takes longer when few are there to find:
 *                 4 ÷ (singles on the board at that moment), added to each single
 * The prices are a model, not a measurement. The script also runs other prices
 * to show how far the ratio moves with them.
 *
 *   node scripts/analysis/killer_time_model.mjs [puzzles per level, default 200]
 */
import { generatePuzzle } from '../../src/engine/SudokuEngine.js';
import { generateKillerPuzzle } from '../../src/engine/killer/killerGenerator.js';
import { UNITS, innies } from '../../src/engine/killer/killerSolver.js';

const N = Number(process.argv[2] || 200);
const PRICES = {
  base: { single: 1, scan: 1, locked: 2, cage: 2, innie: 3, subset: 3, hidden: 4, guess: 15 },
  'no scan': { single: 1, scan: 0, locked: 2, cage: 2, innie: 3, subset: 3, hidden: 4, guess: 15 },
  'cheap arithmetic': { single: 1, scan: 1, locked: 2, cage: 1.5, innie: 2, subset: 3, hidden: 4, guess: 15 },
  'dear arithmetic': { single: 1, scan: 1, locked: 2, cage: 3, innie: 5, subset: 3, hidden: 4, guess: 15 },
  'dear scan': { single: 1, scan: 2, locked: 2, cage: 2, innie: 3, subset: 3, hidden: 4, guess: 15 },
  'dear guess': { single: 1, scan: 1, locked: 2, cage: 2, innie: 3, subset: 3, hidden: 4, guess: 30 },
};
const CLASSIC_THRESHOLDS = { 1: [60, 90, 150, 240], 2: [90, 150, 240, 360], 3: [120, 210, 330, 480], 4: [180, 300, 480, 660], 5: [240, 420, 660, 900] };

const bit = (d) => 1 << d;
const ALL = 0x3fe;
const pop = (m) => { let c = 0; for (let d = 1; d <= 9; d++) if (m & bit(d)) c++; return c; };
const digitsOf = (m) => { const out = []; for (let d = 1; d <= 9; d++) if (m & bit(d)) out.push(d); return out; };
const UNITS_OF = Array.from({ length: 81 }, () => []);
UNITS.forEach((u, i) => u.forEach((c) => UNITS_OF[c].push(i)));
const PEERS = Array.from({ length: 81 }, (_, c) => [...new Set(UNITS_OF[c].flatMap((u) => UNITS[u]))].filter((x) => x !== c));
const ROW = (c) => Math.floor(c / 9), COL = (c) => c % 9, BOX = (c) => 3 * Math.floor(ROW(c) / 3) + Math.floor(COL(c) / 3);

/** Solve like a person; count the moves of each kind. */
function solveCounting(givens, solution, cages = null) {
  const val = givens.slice();
  const cand = val.map((v) => (v ? 0 : ALL));
  const cageOf = new Array(81).fill(-1);
  if (cages) cages.forEach((cg, i) => cg.cells.forEach((c) => { cageOf[c] = i; }));
  const virtual = cages ? innies(cages) : [];
  const counts = { single: 0, scan: 0, locked: 0, cage: 0, innie: 0, subset: 0, hidden: 0, guess: 0 };

  const place = (c, d) => {
    val[c] = d; cand[c] = 0;
    for (const p of PEERS[c]) cand[p] &= ~bit(d);
    if (cages) for (const p of cages[cageOf[c]].cells) cand[p] &= ~bit(d);
  };
  givens.forEach((d, c) => { if (d) { val[c] = 0; place(c, d); } });

  // A group of cells that all differ and add up to `sum` — a cage, or the leftover
  // of a unit under the 45 rule. Keep in each cell only digits that some full
  // assignment of the group uses; returns true if anything went.
  const narrowGroup = (cells, sum) => {
    const open = cells.filter((c) => !val[c]);
    if (!open.length) return false;
    const rest = sum - cells.reduce((s, c) => s + val[c], 0);
    const usable = open.map(() => 0);
    const used = new Set(cells.filter((c) => val[c]).map((c) => val[c]));
    const pick = [];
    const go = (i, left) => {
      if (i === open.length) {
        if (left === 0) pick.forEach((d, k) => { usable[k] |= bit(d); });
        return;
      }
      for (const d of digitsOf(cand[open[i]])) {
        if (used.has(d) || d > left) continue;
        used.add(d); pick.push(d);
        go(i + 1, left - d);
        pick.pop(); used.delete(d);
      }
    };
    go(0, rest);
    let changed = false;
    open.forEach((c, k) => { if ((cand[c] & usable[k]) !== cand[c]) { cand[c] &= usable[k]; changed = true; } });
    // A digit every assignment uses, all of whose places lie in one unit, leaves
    // the rest of that unit.
    const must = digitsOf(usable.reduce((a, m) => a | m, 0)).filter((d) => open.every((c, k) => !(usable[k] & bit(d))) === false);
    for (const d of must) {
      const holders = open.filter((c) => cand[c] & bit(d));
      const everyAssignmentHasIt = (() => {
        // d is forced if no assignment avoids it: test by removing it.
        let ok = false; const pick2 = []; const used2 = new Set(cells.filter((c) => val[c]).map((c) => val[c]));
        const go2 = (i, left) => {
          if (ok) return;
          if (i === open.length) { if (left === 0) ok = true; return; }
          for (const e of digitsOf(cand[open[i]])) {
            if (e === d || used2.has(e) || e > left) continue;
            used2.add(e); pick2.push(e); go2(i + 1, left - e); pick2.pop(); used2.delete(e);
          }
        };
        go2(0, rest);
        return !ok;
      })();
      if (!everyAssignmentHasIt || !holders.length) continue;
      for (const u of UNITS) {
        if (!holders.every((h) => u.includes(h))) continue;
        for (const p of u) if (!cells.includes(p) && (cand[p] & bit(d))) { cand[p] &= ~bit(d); changed = true; }
      }
    }
    return changed;
  };

  const steps = [
    ['locked', () => {
      for (let b = 0; b < 9; b++) {
        const box = UNITS[b * 3 + 2];
        for (let d = 1; d <= 9; d++) {
          const at = box.filter((c) => cand[c] & bit(d));
          if (at.length < 2) continue;
          for (const line of [ROW, COL]) {
            if (at.every((c) => line(c) === line(at[0]))) {
              const unit = UNITS[line === ROW ? line(at[0]) * 3 : line(at[0]) * 3 + 1];
              let changed = false;
              for (const p of unit) if (!box.includes(p) && (cand[p] & bit(d))) { cand[p] &= ~bit(d); changed = true; }
              if (changed) return true;
            }
          }
        }
      }
      for (let i = 0; i < 18; i++) {
        const line = UNITS[Math.floor(i / 2) * 3 + (i % 2)];
        for (let d = 1; d <= 9; d++) {
          const at = line.filter((c) => cand[c] & bit(d));
          if (at.length < 2 || !at.every((c) => BOX(c) === BOX(at[0]))) continue;
          let changed = false;
          for (const p of UNITS[BOX(at[0]) * 3 + 2]) if (!line.includes(p) && (cand[p] & bit(d))) { cand[p] &= ~bit(d); changed = true; }
          if (changed) return true;
        }
      }
      return false;
    }],
    ['cage', () => (cages ? cages.some((cg) => narrowGroup(cg.cells, cg.sum)) : false)],
    ['innie', () => virtual.some((g) => narrowGroup(g.cells, g.sum))],
    ['subset', () => {
      for (const u of UNITS) {
        const open = u.filter((c) => !val[c]);
        for (const size of [2, 3]) {
          const pickC = (start, chosen, mask) => {
            if (chosen.length === size) {
              if (pop(mask) !== size) return false;
              let changed = false;
              for (const p of open) if (!chosen.includes(p) && (cand[p] & mask)) { cand[p] &= ~mask; changed = true; }
              return changed;
            }
            for (let i = start; i < open.length; i++) {
              const m = mask | cand[open[i]];
              if (pop(m) > size) continue;
              if (pickC(i + 1, [...chosen, open[i]], m)) return true;
            }
            return false;
          };
          if (pickC(0, [], 0)) return true;
        }
      }
      return false;
    }],
    ['hidden', () => {
      for (const u of UNITS) {
        const places = {};
        for (let d = 1; d <= 9; d++) { const at = u.filter((c) => cand[c] & bit(d)); if (at.length === 2) places[d] = at; }
        const ds = Object.keys(places).map(Number);
        for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) {
          const [a, b] = [places[ds[i]], places[ds[j]]];
          if (a[0] !== b[0] || a[1] !== b[1]) continue;
          const keep = bit(ds[i]) | bit(ds[j]);
          let changed = false;
          for (const c of a) if (cand[c] & ~keep) { cand[c] &= keep; changed = true; }
          if (changed) return true;
        }
      }
      return false;
    }],
  ];

  for (let guard = 0; guard < 5000; guard++) {
    if (val.every(Boolean)) break;
    // Singles: a cell with one candidate, or a digit with one place in a unit.
    // All of them are found, to price the one taken by how many were there.
    const found = new Map();
    val.forEach((v, c) => { if (!v && pop(cand[c]) === 1) found.set(c, digitsOf(cand[c])[0]); });
    for (const u of UNITS) {
      for (let d = 1; d <= 9; d++) {
        if (u.some((c) => val[c] === d)) continue;
        const at = u.filter((c) => cand[c] & bit(d));
        if (at.length === 1 && !found.has(at[0])) found.set(at[0], d);
      }
    }
    if (found.size) {
      const [single, digit] = found.entries().next().value;
      if (digit !== solution[single]) throw new Error('the model deduced a wrong digit');
      place(single, digit); counts.single++; counts.scan += 4 / found.size; continue;
    }
    const moved = steps.find(([, run]) => run());
    if (moved) { counts[moved[0]]++; continue; }
    const narrow = val.map((v, c) => (v ? 99 : pop(cand[c]))).reduce((best, n, c, a) => (n < a[best] ? c : best), 0);
    place(narrow, solution[narrow]); counts.guess++;
  }
  return counts;
}

const priceOf = (counts, prices) => Object.entries(counts).reduce((s, [k, n]) => s + n * prices[k], 0);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const runs = { classic: {}, killer: {} };
for (let level = 1; level <= 5; level++) {
  runs.classic[level] = []; runs.killer[level] = [];
  for (let k = 0; k < N; k++) {
    const c = generatePuzzle(level, `time-model-c-${level}-${k}`);
    runs.classic[level].push(solveCounting(c.puzzle.flat(), c.solution.flat()));
    const kp = generateKillerPuzzle(level, `time-model-k-${level}-${k}`);
    runs.killer[level].push(solveCounting(kp.board.flat(), kp.solution.flat(), kp.cages));
  }
}

const avg = (list, key) => (list.reduce((s, x) => s + x[key], 0) / list.length).toFixed(1);
console.log(`\n${N} puzzles per level and kind — moves per puzzle (mean)`);
for (const kind of ['classic', 'killer']) {
  for (let level = 1; level <= 5; level++) {
    const l = runs[kind][level];
    console.log(`  ${kind.padEnd(7)} Lv.${level}  single ${avg(l, 'single').padStart(5)}  locked ${avg(l, 'locked').padStart(4)}  cage ${avg(l, 'cage').padStart(5)}  innie ${avg(l, 'innie').padStart(4)}  subset ${avg(l, 'subset').padStart(4)}  hidden ${avg(l, 'hidden').padStart(4)}  guess ${avg(l, 'guess').padStart(4)}`);
  }
}
const ratios = {};
for (const [name, prices] of Object.entries(PRICES)) {
  const line = [];
  for (let level = 1; level <= 5; level++) {
    const c = median(runs.classic[level].map((x) => priceOf(x, prices)));
    const k = median(runs.killer[level].map((x) => priceOf(x, prices)));
    (ratios[name] ||= {})[level] = k / c;
    line.push(`Lv.${level} ${c.toFixed(0)}→${k.toFixed(0)} ×${(k / c).toFixed(2)}`);
  }
  console.log(`\nprices "${name}": classic→killer median effort  ${line.join(' | ')}`);
}
console.log('');
for (const name of ['no scan', 'base', 'dear scan']) {
  const e = [1, 2, 3, 4, 5].map((l) => median(runs.classic[l].map((x) => priceOf(x, PRICES[name]))));
  console.log(`check "${name}": classic effort from Lv.1  ${e.map((x) => (x / e[0]).toFixed(2)).join(' / ')}`);
}
console.log(`  the hand-set S+ times from Lv.1  ${[1, 2, 3, 4, 5].map((l) => (CLASSIC_THRESHOLDS[l][0] / CLASSIC_THRESHOLDS[1][0]).toFixed(2)).join(' / ')}`);
const round = (s) => Math.max(10, Math.round(s / 10) * 10);
console.log('\nkiller thresholds (classic × base ratio, to 10 s):');
for (let level = 1; level <= 5; level++) {
  console.log(`  ${level}: [${CLASSIC_THRESHOLDS[level].map((t) => round(t * ratios.base[level])).join(', ')}],`);
}
