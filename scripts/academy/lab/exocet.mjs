// Junior Exocet, derived from its logic (not from any published example).
//
// Row orientation (the column one is the same on the transposed grid):
//   base   B1=(r,a1), B2=(r,a2) — two cells of one mini-row in box b; D = their candidates, |D| 3..4
//   m      the third column of box b
//   targets T1=(r1,t1) in box b2, T2=(r2,t2) in box b3, band rows, r1≠r, r2≠r, r1≠r2
//   companions (r2,t1) and (r1,t2) hold no base digit (candidate or value)
//   S cells  the 18 cells of columns m, t1, t2 outside the band
//   for each d in D, the S cells holding d (candidate or value) are covered by 2 houses
// Proof: if d is the value of a base cell, column m cannot take d inside the band (box b
// already has it, row r already has it), so column m's d is in an S cell. The S cells
// hold at most 2 d's (2 houses, one d each), so at least one of m, t1, t2 has its d inside
// the band — not m, so t1 or t2, not in row r, not in a companion: in T1 or T2. Both base
// values land in the targets, so each target holds a base digit and anything else goes.
import { UNITS, bit, digits, pop, ROW, COL, BOX } from './core.mjs';

const T = (i) => COL(i) * 9 + ROW(i); // transpose index
function transposeState(s) {
  const val = new Array(81), cand = new Array(81);
  for (let i = 0; i < 81; i++) { val[T(i)] = s.val[i]; cand[T(i)] = s.cand[i]; }
  return { val, cand };
}

function coveredByTwoHouses(cells) {
  if (cells.length <= 2) return true;
  const houses = UNITS.map((u) => new Set(u.cells));
  for (let a = 0; a < houses.length; a++) for (let b = a; b < houses.length; b++) {
    if (cells.every((i) => houses[a].has(i) || houses[b].has(i))) return true;
  }
  return false;
}

function jeRows(s) {
  const out = [];
  const holds = (i, d) => s.val[i] === d || (s.cand[i] & bit(d)) !== 0;
  for (let r = 0; r < 9; r++) {
    const band = Math.floor(r / 3) * 3;
    const bandRows = [band, band + 1, band + 2];
    for (let bs = 0; bs < 3; bs++) {
      const boxCols = [bs * 3, bs * 3 + 1, bs * 3 + 2];
      for (const [a1, a2, m] of [[boxCols[0], boxCols[1], boxCols[2]], [boxCols[0], boxCols[2], boxCols[1]], [boxCols[1], boxCols[2], boxCols[0]]]) {
        const B1 = r * 9 + a1, B2 = r * 9 + a2;
        if (s.val[B1] || s.val[B2]) continue;
        const Dm = s.cand[B1] | s.cand[B2];
        if (pop(Dm) < 3 || pop(Dm) > 4) continue;
        const D = digits(Dm);
        const others = [0, 1, 2].filter((x) => x !== bs);
        const [r1s, r2s] = [bandRows.filter((x) => x !== r), bandRows.filter((x) => x !== r)];
        for (const [bA, bB] of [[others[0], others[1]], [others[1], others[0]]]) {
          for (const r1 of r1s) for (const r2 of r2s) {
            if (r1 === r2) continue;
            for (let k1 = 0; k1 < 3; k1++) for (let k2 = 0; k2 < 3; k2++) {
              const t1 = bA * 3 + k1, t2 = bB * 3 + k2;
              const T1 = r1 * 9 + t1, T2 = r2 * 9 + t2;
              if (s.val[T1] || s.val[T2]) continue;
              if (!(s.cand[T1] & Dm) || !(s.cand[T2] & Dm)) continue;
              const comp1 = r2 * 9 + t1, comp2 = r1 * 9 + t2;
              if (D.some((d) => holds(comp1, d) || holds(comp2, d))) continue;
              const S = [];
              for (let rr = 0; rr < 9; rr++) if (!bandRows.includes(rr)) for (const c of [m, t1, t2]) S.push(rr * 9 + c);
              if (!D.every((d) => coveredByTwoHouses(S.filter((i) => holds(i, d))))) continue;
              const dels = [];
              for (const t of [T1, T2]) for (const d of digits(s.cand[t] & ~Dm)) dels.push([t, d]);
              if (dels.length) out.push({ tech: 'Junior Exocet', base: [B1, B2], targets: [T1, T2], companions: [comp1, comp2], crossCols: [m, t1, t2], digits: D, dels });
            }
          }
        }
      }
    }
  }
  return out;
}

export function juniorExocet(s) {
  const rows = jeRows(s).map((f) => ({ ...f, orientation: 'row' }));
  const cols = jeRows(transposeState(s)).map((f) => ({
    ...f, orientation: 'col',
    base: f.base.map(T), targets: f.targets.map(T), companions: f.companions.map(T),
    dels: f.dels.map(([i, d]) => [T(i), d]),
  }));
  return [...rows, ...cols];
}
void BOX;
