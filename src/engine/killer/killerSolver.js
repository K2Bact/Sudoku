/**
 * killerSolver.js
 * Counts the solutions of a Killer Sudoku: the classic rules, plus cages — the
 * digits in a cage are all different and add up to the cage's sum.
 *
 * Cells are numbered 0..80 (row * 9 + col). A cage is { cells: [index...], sum }.
 * Digit masks use bits 1..9, so a digit d is the bit (1 << d).
 *
 * Guessing alone is hopeless on a killer with no givens, so before each guess
 * the solver narrows every cell the way a person does:
 *   - a cage can only be finished by certain sets of digits ("17 in two cells"
 *     is 8 and 9), and a set some cell of the cage cannot take is out;
 *   - the 45 rule: a row, column or box adds up to 45, so the cells of it not
 *     covered by cages lying wholly inside it add up to 45 minus those cages.
 *     Those cells are all different too, so they work as one more cage.
 */

const ALL = 0x3fe;
const MAX_SUM = 45;

const POPCOUNT = new Uint8Array(1024);
for (let m = 1; m < 1024; m++) POPCOUNT[m] = POPCOUNT[m >> 1] + (m & 1);

// SETS[count][sum]: every set of `count` different digits adding up to `sum`.
const SETS = Array.from({ length: 10 }, () => Array.from({ length: MAX_SUM + 1 }, () => []));
for (let set = 0; set < 512; set++) {
  const digits = set << 1;
  let count = 0;
  let sum = 0;
  for (let d = 1; d <= 9; d++) if (digits & (1 << d)) { count++; sum += d; }
  SETS[count][sum].push(digits);
}

export const UNITS = [];
for (let i = 0; i < 9; i++) {
  UNITS.push([...Array(9).keys()].map((j) => i * 9 + j));
  UNITS.push([...Array(9).keys()].map((j) => j * 9 + i));
  UNITS.push([...Array(9).keys()].map((j) => (3 * Math.floor(i / 3) + Math.floor(j / 3)) * 9 + 3 * (i % 3) + (j % 3)));
}
const UNITS_OF = Array.from({ length: 81 }, () => []);
UNITS.forEach((cells, u) => cells.forEach((cell) => UNITS_OF[cell].push(u)));

/** The 45 rule, once per row, column and box: the leftover cells and what they add up to. */
export function innies(cages) {
  const out = [];
  for (const unit of UNITS) {
    const inside = new Set(unit);
    let covered = 0;
    const rest = new Set(unit);
    for (const cage of cages) {
      if (!cage.cells.every((cell) => inside.has(cell))) continue;
      covered += cage.sum;
      cage.cells.forEach((cell) => rest.delete(cell));
    }
    if (rest.size > 0 && rest.size < 9) out.push({ cells: [...rest], sum: 45 - covered });
  }
  return out;
}

/**
 * How many solutions the puzzle has, up to `limit`, and the first ones found.
 *
 * `givens` is a 9×9 grid (0 = empty) or null. `nodeLimit` bounds the search: a
 * puzzle that needs more guesses than that comes back `aborted`, and the caller
 * treats it as undecided rather than waiting on it.
 *
 * `prefer` is a solution to try first at every guess. The generator knows the
 * answer it built the puzzle from; trying it first finds that answer almost at
 * once, and the rest of the search is only the question that matters — is there
 * another one. The count is the same with or without it.
 *
 * @returns {{ count: number, solutions: number[][][], aborted: boolean, nodes: number }}
 */
export function solveKiller(cages, givens = null, { limit = 2, nodeLimit = 20000, prefer = null } = {}) {
  const preferred = prefer ? prefer.flat() : null;
  const groups = [...cages, ...innies(cages)];
  const groupsOf = Array.from({ length: 81 }, () => []);
  groups.forEach((group, k) => group.cells.forEach((cell) => groupsOf[cell].push(k)));

  const grid = new Int8Array(81);
  const unitUsed = new Uint16Array(UNITS.length);
  const groupUsed = new Uint16Array(groups.length);
  const sumLeft = new Int16Array(groups.length);
  const cellsLeft = new Int8Array(groups.length);
  groups.forEach((group, k) => { sumLeft[k] = group.sum; cellsLeft[k] = group.cells.length; });

  const solutions = [];
  let count = 0;
  let nodes = 0;
  let aborted = false;

  const place = (cell, d) => {
    const bit = 1 << d;
    grid[cell] = d;
    for (const u of UNITS_OF[cell]) unitUsed[u] |= bit;
    for (const k of groupsOf[cell]) { groupUsed[k] |= bit; sumLeft[k] -= d; cellsLeft[k]--; }
  };
  const unplace = (cell, d) => {
    const bit = 1 << d;
    grid[cell] = 0;
    for (const u of UNITS_OF[cell]) unitUsed[u] &= ~bit;
    for (const k of groupsOf[cell]) { groupUsed[k] &= ~bit; sumLeft[k] += d; cellsLeft[k]++; }
  };

  // Every empty cell's candidates, narrowed until nothing more falls out.
  // False when some cell or cage is left with no way to go on.
  const narrow = (cand) => {
    for (let cell = 0; cell < 81; cell++) {
      if (grid[cell]) { cand[cell] = 0; continue; }
      let mask = ALL;
      for (const u of UNITS_OF[cell]) mask &= ~unitUsed[u];
      if (!mask) return false;
      cand[cell] = mask;
    }
    for (let changed = true; changed;) {
      changed = false;
      for (let k = 0; k < groups.length; k++) {
        if (!cellsLeft[k]) continue;
        if (sumLeft[k] < 0 || sumLeft[k] > MAX_SUM) return false;
        let possible = 0;
        for (const set of SETS[cellsLeft[k]][sumLeft[k]]) {
          if (set & groupUsed[k]) continue;
          let reached = 0;
          let fits = true;
          for (const cell of groups[k].cells) {
            if (grid[cell]) continue;
            const m = cand[cell] & set;
            if (!m) { fits = false; break; }
            reached |= m;
          }
          if (fits && reached === set) possible |= set;
        }
        if (!possible) return false;
        for (const cell of groups[k].cells) {
          if (grid[cell] || (cand[cell] & possible) === cand[cell]) continue;
          cand[cell] &= possible;
          if (!cand[cell]) return false;
          changed = true;
        }
      }
      // In each row, column and box: a cell down to one digit takes it from the
      // others, and a digit with one place left takes that cell.
      for (let u = 0; u < UNITS.length; u++) {
        const cells = UNITS[u];
        const need = ALL & ~unitUsed[u];
        let once = 0;
        let twice = 0;
        for (const cell of cells) { twice |= once & cand[cell]; once |= cand[cell]; }
        if ((once & need) !== need) return false;
        const lone = once & ~twice;
        for (const cell of cells) {
          const m = cand[cell];
          if (!m) continue;
          const only = m & lone;
          if (only && only !== m) {
            if (POPCOUNT[only] > 1) return false;
            cand[cell] = only;
            changed = true;
          }
          if (POPCOUNT[cand[cell]] !== 1) continue;
          for (const other of cells) {
            if (other === cell || !(cand[other] & cand[cell])) continue;
            cand[other] &= ~cand[cell];
            if (!cand[other]) return false;
            changed = true;
          }
        }
      }
    }
    return true;
  };

  // A given that breaks a rule leaves nothing to solve.
  if (givens) {
    const cand = new Uint16Array(81);
    for (let cell = 0; cell < 81; cell++) {
      const d = givens[Math.floor(cell / 9)][cell % 9];
      if (!d) continue;
      if (!narrow(cand) || !(cand[cell] & (1 << d))) return { count: 0, solutions, aborted, nodes };
      place(cell, d);
    }
  }

  // Each depth keeps its own candidate and guess lists, so a step back finds its
  // own untouched. Depth never passes 81: every step fills one cell.
  const candAt = Array.from({ length: 82 }, () => new Uint16Array(81));
  const placesAt = Array.from({ length: 82 }, () => new Int8Array(9));

  const search = (depth) => {
    if (++nodes > nodeLimit) { aborted = true; return; }
    const cand = candAt[depth];
    if (!narrow(cand)) return;

    let best = -1;
    let bestCount = 10;
    for (let cell = 0; cell < 81; cell++) {
      if (grid[cell]) continue;
      const n = POPCOUNT[cand[cell]];
      if (n < bestCount) { best = cell; bestCount = n; }
    }
    if (best < 0) {
      count++;
      if (solutions.length < limit) {
        const solved = [];
        for (let r = 0; r < 9; r++) solved.push(Array.from(grid.subarray(r * 9, r * 9 + 9)));
        solutions.push(solved);
      }
      return;
    }

    // A digit that a row, column or box still needs, with fewer places to go
    // than the best cell has digits, is the narrower guess. One place is a
    // forced move; none is a dead end.
    const places = placesAt[depth];
    let unitDigit = 0;
    let unitCount = bestCount;
    for (let u = 0; u < UNITS.length && unitCount > 1; u++) {
      const need = ALL & ~unitUsed[u];
      for (let d = 1; d <= 9; d++) {
        const bit = 1 << d;
        if (!(need & bit)) continue;
        let n = 0;
        for (const cell of UNITS[u]) if (cand[cell] & bit) n++;
        if (n === 0) return;
        if (n < unitCount) {
          unitCount = n;
          unitDigit = d;
          let i = 0;
          for (const cell of UNITS[u]) if (cand[cell] & bit) places[i++] = cell;
        }
      }
    }

    if (unitDigit) {
      if (preferred) {
        const first = places.subarray(0, unitCount).findIndex((cell) => preferred[cell] === unitDigit);
        if (first > 0) [places[0], places[first]] = [places[first], places[0]];
      }
      for (let i = 0; i < unitCount; i++) {
        place(places[i], unitDigit);
        search(depth + 1);
        unplace(places[i], unitDigit);
        if (count >= limit || aborted) return;
      }
      return;
    }
    const mask = cand[best];
    const first = preferred && (mask & (1 << preferred[best])) ? preferred[best] : 0;
    for (let step = 0; step <= 9; step++) {
      const d = step === 0 ? first : step;
      if (!d || (step > 0 && d === first) || !(mask & (1 << d))) continue;
      place(best, d);
      search(depth + 1);
      unplace(best, d);
      if (count >= limit || aborted) return;
    }
  };

  search(0);
  return { count, solutions, aborted, nodes };
}
