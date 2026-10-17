// Solve a killer the way the lessons are ordered, and record each moment.
//
// At every step the easiest technique that finds something is used, and all of its
// findings are applied. So a moment recorded for technique T is one where every
// technique before T in ORDER found nothing — T is needed there, not merely usable.
// When nothing in ORDER works, one cell is revealed from the solution (counted as a
// "reveal") so the walk can go on; the order of the academy, not a full solver.
import { findSingles, findLocked, findSubsets, findK1, findK2, findK14, findK4, find45, findK11 } from './kdetect.mjs';
import { initKiller, cloneK, placeK, bit, digits, pop } from './kstate.mjs';

// Lesson order (K1 K2 K14 K3 K4 K5 K6 K7) with the classic steps where SudokuWiki's
// killer solver puts them: singles first, locked candidates after the one-cell 45,
// subsets before the many-cell 45. K6m (more than one in and out) and K11 are not taught.
export const ORDER = ['single', 'K1', 'K2', 'K14', 'K3', 'locked', 'K4', 'subset', 'K5', 'K6', 'K7', 'K6m', 'K11'];

export function finder(s) {
  let f45 = null;
  const of45 = (t) => (f45 ??= find45(s)).filter((f) => f.tech === t);
  return {
    single: () => findSingles(s),
    K1: () => findK1(s),
    K2: () => findK2(s),
    K14: () => findK14(s),
    K3: () => of45('K3'),
    locked: () => findLocked(s),
    K4: () => findK4(s),
    subset: () => findSubsets(s),
    K5: () => of45('K5'),
    K6: () => of45('K6'),
    K7: () => of45('K7'),
    K6m: () => of45('K6m'),
    K11: () => findK11(s),
  };
}

export function apply(s, findings) {
  for (const f of findings) {
    for (const [i, d] of f.dels) s.cand[i] &= ~bit(d);
    if (f.place && !s.val[f.place[0]] && (s.cand[f.place[0]] & bit(f.place[1]))) placeK(s, f.place[0], f.place[1]);
  }
}

/**
 * Walk one killer. onMoment(tech, stateBefore, findings) is called before each step is
 * applied. Returns { steps, reveals, solved, broken }.
 */
export function walk(k, onMoment = () => {}) {
  const s = initKiller(k);
  // A one-cell cage is a given in all but drawing.
  k.cages.forEach((c) => { if (c.cells.length === 1 && !s.val[c.cells[0]]) placeK(s, c.cells[0], c.sum); });
  let steps = 0;
  let reveals = 0;
  for (let guard = 0; guard < 2000; guard++) {
    if (s.val.every(Boolean)) return { steps, reveals, solved: true, broken: false };
    if (s.val.some((v, i) => !v && !s.cand[i])) return { steps, reveals, solved: false, broken: true };
    const F = finder(s);
    let done = false;
    for (const t of ORDER) {
      const found = F[t]();
      if (!found.length) continue;
      onMoment(t, cloneK(s), found);
      apply(s, found);
      steps++;
      done = true;
      break;
    }
    if (done) continue;
    // Stuck: reveal the open cell with the fewest candidates.
    let best = -1;
    for (let i = 0; i < 81; i++) if (!s.val[i] && (best < 0 || pop(s.cand[i]) < pop(s.cand[best]))) best = i;
    onMoment('reveal', cloneK(s), [{ tech: 'reveal', place: [best, k.solution[best]], dels: [] }]);
    placeK(s, best, k.solution[best]);
    reveals++;
  }
  return { steps, reveals, solved: false, broken: true };
}

export { digits };
