// Technique detectors. Each returns findings { tech, digit?, pattern, fins?, groups?, dels:[[cell,digit]], place? }.
// Written from the techniques' definitions; soundness is tested separately against
// thousands of solved puzzles (a detector that ever deletes a true digit is wrong).
import { UNITS, PEERS, sees, bit, digits, pop, ROW, COL, BOX, combos, clone, place, singles } from './core.mjs';

const lines = (type) => UNITS.filter((u) => u.type === type);
const has = (s, i, d) => (s.cand[i] & bit(d)) !== 0;

// ── Fish (basic and finned), size 2..4 ──
export function fish(s, size, finned = false) {
  const out = [];
  for (let d = 1; d <= 9; d++) for (const [baseT, coverT, key] of [['row', 'col', COL], ['col', 'row', ROW]]) {
    const bases = lines(baseT).map((u) => ({ u, where: u.cells.filter((i) => has(s, i, d)) })).filter((b) => b.where.length >= 2 && (finned || b.where.length <= size));
    for (const combo of combos(bases, size)) {
      const all = combo.flatMap((b) => b.where);
      if (!finned) {
        const cover = [...new Set(all.map(key))];
        if (cover.length !== size) continue;
        const baseIdx = new Set(combo.map((b) => b.u.k));
        const dels = [];
        for (const k of cover) for (const i of lines(coverT)[k].cells) if (has(s, i, d) && !baseIdx.has(baseT === 'row' ? ROW(i) : COL(i))) dels.push([i, d]);
        if (dels.length) out.push({ tech: ['', '', 'X-Wing', 'Swordfish', 'Jellyfish'][size], digit: d, pattern: all, dels });
      } else {
        // choose cover lines = `size` lines; fins = base candidates outside the cover, all in one box
        const coverKeys = [...new Set(all.map(key))];
        for (const cover of combos(coverKeys, size)) {
          const fins = all.filter((i) => !cover.includes(key(i)));
          if (!fins.length || new Set(fins.map(BOX)).size !== 1) continue;
          // every base line must still have a candidate inside the cover (else it is not a finned fish of this size)
          if (!combo.every((b) => b.where.some((i) => cover.includes(key(i))))) continue;
          const finBox = BOX(fins[0]);
          const baseIdx = new Set(combo.map((b) => b.u.k));
          const dels = [];
          for (const k of cover) for (const i of lines(coverT)[k].cells) {
            if (!has(s, i, d) || baseIdx.has(baseT === 'row' ? ROW(i) : COL(i))) continue;
            if (BOX(i) === finBox && fins.every((f) => sees(i, f))) dels.push([i, d]);
          }
          if (dels.length) out.push({ tech: ['', '', 'Finned X-Wing', 'Finned Swordfish', 'Finned Jellyfish'][size], digit: d, pattern: all.filter((i) => !fins.includes(i)), fins, dels });
        }
      }
    }
  }
  return out;
}

// ── Wings ──
export function xyWing(s) {
  const out = [];
  const bi = [...Array(81).keys()].filter((i) => pop(s.cand[i]) === 2);
  for (const p of bi) {
    const [x, y] = digits(s.cand[p]);
    const w1s = bi.filter((w) => sees(w, p) && has(s, w, x) && !has(s, w, y));
    const w2s = bi.filter((w) => sees(w, p) && has(s, w, y) && !has(s, w, x));
    for (const a of w1s) for (const b of w2s) {
      const za = s.cand[a] & ~bit(x), zb = s.cand[b] & ~bit(y);
      if (za !== zb || a === b) continue;
      const z = digits(za)[0];
      const dels = [];
      for (let i = 0; i < 81; i++) if (i !== p && i !== a && i !== b && has(s, i, z) && sees(i, a) && sees(i, b)) dels.push([i, z]);
      if (dels.length) out.push({ tech: 'XY-Wing', digit: z, pattern: [p], wings: [a, b], dels });
    }
  }
  return out;
}
export function xyzWing(s) {
  const out = [];
  for (let p = 0; p < 81; p++) if (pop(s.cand[p]) === 3) {
    const pm = s.cand[p];
    const ws = [...PEERS[p]].filter((w) => pop(s.cand[w]) === 2 && (s.cand[w] & pm) === s.cand[w]);
    for (const [a, b] of combos(ws, 2)) {
      if ((s.cand[a] | s.cand[b]) !== pm || s.cand[a] === s.cand[b]) continue;
      const zm = s.cand[a] & s.cand[b];
      if (pop(zm) !== 1) continue;
      const z = digits(zm)[0];
      const dels = [];
      for (let i = 0; i < 81; i++) if (![p, a, b].includes(i) && has(s, i, z) && sees(i, p) && sees(i, a) && sees(i, b)) dels.push([i, z]);
      if (dels.length) out.push({ tech: 'XYZ-Wing', digit: z, pattern: [p], wings: [a, b], dels });
    }
  }
  return out;
}
/** 4 cells, 4 digits in total, exactly one non-restricted digit Z (at least one cell must be Z). */
export function wxyzWing(s) {
  const out = [];
  for (let p = 0; p < 81; p++) {
    const pc = pop(s.cand[p]);
    if (pc < 2 || pc > 4) continue;
    const ws = [...PEERS[p]].filter((w) => w > -1 && pop(s.cand[w]) >= 2 && pop(s.cand[w]) <= 4);
    for (const trio of combos(ws, 3)) {
      const cells = [p, ...trio];
      const m = cells.reduce((a, i) => a | s.cand[i], 0);
      if (pop(m) !== 4) continue;
      const nonRestricted = digits(m).filter((d) => {
        const w = cells.filter((i) => has(s, i, d));
        return w.some((a) => w.some((b) => a !== b && !sees(a, b)));
      });
      if (nonRestricted.length !== 1) continue;
      // all four must not already be a naked quad in one unit (that is a simpler technique)
      if (UNITS.some((u) => cells.every((i) => u.cells.includes(i)))) continue;
      const z = nonRestricted[0];
      const zc = cells.filter((i) => has(s, i, z));
      const dels = [];
      for (let i = 0; i < 81; i++) if (!cells.includes(i) && has(s, i, z) && zc.every((c) => sees(i, c))) dels.push([i, z]);
      if (dels.length) out.push({ tech: 'WXYZ-Wing', digit: z, pattern: [p], wings: trio, dels });
    }
  }
  // de-duplicate identical patterns found from different pivots
  const seen = new Set();
  return out.filter((f) => { const k = [...f.pattern, ...f.wings].sort((a, b) => a - b).join(',') + ':' + f.dels.map((x) => x.join('-')).join(','); if (seen.has(k)) return false; seen.add(k); return true; });
}
export function wWing(s) {
  const out = [];
  const bi = [...Array(81).keys()].filter((i) => pop(s.cand[i]) === 2);
  for (const [a, b] of combos(bi, 2)) {
    if (s.cand[a] !== s.cand[b] || sees(a, b)) continue;
    const [x1, y1] = digits(s.cand[a]);
    for (const [x, y] of [[x1, y1], [y1, x1]]) {
      for (const u of UNITS) {
        const w = u.cells.filter((i) => has(s, i, x));
        if (w.length !== 2 || w.includes(a) || w.includes(b)) continue;
        const [p, q] = w;
        const ok = (sees(p, a) && sees(q, b)) || (sees(p, b) && sees(q, a));
        if (!ok) continue;
        const dels = [];
        for (let i = 0; i < 81; i++) if (i !== a && i !== b && has(s, i, y) && sees(i, a) && sees(i, b)) dels.push([i, y]);
        if (dels.length) out.push({ tech: 'W-Wing', digit: y, pattern: [a, b], link: [p, q], linkDigit: x, dels });
      }
    }
  }
  return out;
}

// ── Chains and colouring ──
export function remotePairs(s) {
  const out = [];
  const bi = [...Array(81).keys()].filter((i) => pop(s.cand[i]) === 2);
  const pairs = new Set(bi.map((i) => s.cand[i]));
  for (const m of pairs) {
    const cells = bi.filter((i) => s.cand[i] === m);
    const colour = new Map();
    for (const start of cells) {
      if (colour.has(start)) continue;
      const comp = [start];
      colour.set(start, 0);
      for (let k = 0; k < comp.length; k++) for (const n of cells) if (sees(comp[k], n) && !colour.has(n)) { colour.set(n, 1 - colour.get(comp[k])); comp.push(n); }
      if (comp.length < 4) continue;
      const [x, y] = digits(m);
      const dels = [];
      for (let i = 0; i < 81; i++) {
        if (comp.includes(i) || !(s.cand[i] & m)) continue;
        const seen = comp.filter((c) => sees(i, c));
        // opposite colours seen from cells that do NOT see each other: that is the remote part
        const hit = seen.some((a) => seen.some((b) => colour.get(a) !== colour.get(b) && !sees(a, b)));
        if (hit) for (const d of [x, y]) if (has(s, i, d)) dels.push([i, d]);
      }
      if (dels.length) out.push({ tech: 'Remote Pair', pattern: comp, colour, dels });
    }
  }
  return out;
}
export function simpleColouring(s) {
  const out = [];
  for (let d = 1; d <= 9; d++) {
    const adj = new Map();
    for (const u of UNITS) {
      const w = u.cells.filter((i) => has(s, i, d));
      if (w.length === 2) { for (const [a, b] of [w, [w[1], w[0]]]) (adj.get(a) || adj.set(a, new Set()).get(a)).add(b); }
    }
    const colour = new Map();
    for (const start of adj.keys()) {
      if (colour.has(start)) continue;
      const comp = [start];
      colour.set(start, 0);
      for (let k = 0; k < comp.length; k++) for (const n of adj.get(comp[k])) if (!colour.has(n)) { colour.set(n, 1 - colour.get(comp[k])); comp.push(n); }
      if (comp.length < 4) continue;
      // wrap: two cells of one colour see each other → that colour is false
      for (const c of [0, 1]) {
        const cc = comp.filter((i) => colour.get(i) === c);
        if (cc.some((a) => cc.some((b) => a !== b && sees(a, b)))) {
          out.push({ tech: 'Simple Colors (wrap)', digit: d, pattern: comp, colour, dels: cc.map((i) => [i, d]) });
        }
      }
      // trap: an uncoloured cell sees both colours
      const dels = [];
      for (let i = 0; i < 81; i++) {
        if (comp.includes(i) || !has(s, i, d)) continue;
        const seen = comp.filter((c) => sees(i, c));
        if (seen.some((a) => colour.get(a) === 0) && seen.some((a) => colour.get(a) === 1)) dels.push([i, d]);
      }
      if (dels.length) out.push({ tech: 'Simple Colors (trap)', digit: d, pattern: comp, colour, dels });
    }
  }
  return out;
}

// ── Uniqueness ──
export function uniqueRectangle1(s) {
  const out = [];
  const bi = [...Array(81).keys()].filter((i) => pop(s.cand[i]) === 2);
  for (const [a, b] of combos(bi, 2)) {
    if (s.cand[a] !== s.cand[b]) continue;
    if (ROW(a) !== ROW(b) && COL(a) !== COL(b)) continue;
    for (let k = 0; k < 9; k++) {
      const [c, d] = ROW(a) === ROW(b) ? [k * 9 + COL(a), k * 9 + COL(b)] : [ROW(a) * 9 + k, ROW(b) * 9 + k];
      if (c === a || c === b || s.val[c] || s.val[d]) continue;
      const corners = [a, b, c, d];
      if (new Set(corners.map(BOX)).size !== 2) continue;
      if (new Set(corners.map(ROW)).size !== 2 || new Set(corners.map(COL)).size !== 2) continue;
      for (const [third, fourth] of [[c, d], [d, c]]) {
        if (s.cand[third] !== s.cand[a]) continue;
        if ((s.cand[fourth] & s.cand[a]) !== s.cand[a] || pop(s.cand[fourth]) < 3) continue;
        const dels = digits(s.cand[a]).map((x) => [fourth, x]);
        out.push({ tech: 'Unique Rectangle Type 1', pattern: [a, b, third], target: fourth, dels });
      }
    }
  }
  return out;
}
export function bugPlus1(s) {
  const open = [...Array(81).keys()].filter((i) => !s.val[i]);
  const tri = open.filter((i) => pop(s.cand[i]) === 3);
  if (tri.length !== 1 || open.some((i) => pop(s.cand[i]) !== 2 && i !== tri[0])) return [];
  const t = tri[0];
  const extra = digits(s.cand[t]).filter((d) => UNITS.filter((u) => u.cells.includes(t)).every((u) => u.cells.filter((i) => has(s, i, d)).length === 3));
  if (extra.length !== 1) return [];
  // every other (unit, digit) must count 0 or 2
  for (const u of UNITS) for (let d = 1; d <= 9; d++) {
    const n = u.cells.filter((i) => has(s, i, d)).length;
    const exempt = u.cells.includes(t) && d === extra[0];
    if (!exempt && n !== 0 && n !== 2) return [];
  }
  return [{ tech: 'BUG+1', pattern: [t], place: [t, extra[0]], dels: digits(s.cand[t]).filter((d) => d !== extra[0]).map((d) => [t, d]) }];
}

// ── Empty rectangle ──
export function emptyRectangle(s) {
  const out = [];
  for (let d = 1; d <= 9; d++) for (let bx = 0; bx < 9; bx++) {
    const box = UNITS.find((u) => u.type === 'box' && u.k === bx).cells;
    const w = box.filter((i) => has(s, i, d));
    if (w.length < 2) continue;
    const rowsB = [...new Set(box.map(ROW))], colsB = [...new Set(box.map(COL))];
    for (const R of rowsB) for (const C of colsB) {
      if (!w.every((i) => ROW(i) === R || COL(i) === C)) continue;
      if (w.every((i) => ROW(i) === R) || w.every((i) => COL(i) === C)) continue; // that is plain pointing
      // conjugate pair in a column c2 outside the box, one end in row R
      for (let c2 = 0; c2 < 9; c2++) {
        if (colsB.includes(c2)) continue;
        const cw = [...Array(9).keys()].map((r) => r * 9 + c2).filter((i) => has(s, i, d));
        if (cw.length !== 2) continue;
        const p = cw.find((i) => ROW(i) === R), q = cw.find((i) => ROW(i) !== R);
        if (p === undefined || q === undefined || rowsB.includes(ROW(q))) continue;
        const z = ROW(q) * 9 + C;
        if (has(s, z, d)) out.push({ tech: 'Empty Rectangle', digit: d, pattern: w, link: [p, q], box: bx, dels: [[z, d]] });
      }
      // conjugate pair in a row r2 outside the box, one end in column C
      for (let r2 = 0; r2 < 9; r2++) {
        if (rowsB.includes(r2)) continue;
        const rw = [...Array(9).keys()].map((c) => r2 * 9 + c).filter((i) => has(s, i, d));
        if (rw.length !== 2) continue;
        const p = rw.find((i) => COL(i) === C), q = rw.find((i) => COL(i) !== C);
        if (p === undefined || q === undefined || colsB.includes(COL(q))) continue;
        const z = R * 9 + COL(q);
        if (has(s, z, d)) out.push({ tech: 'Empty Rectangle', digit: d, pattern: w, link: [p, q], box: bx, dels: [[z, d]] });
      }
    }
  }
  return out;
}

// ── ALS-XZ ──
function alsList(s) {
  const list = [];
  for (const u of UNITS) {
    const open = u.cells.filter((i) => !s.val[i]);
    for (let n = 1; n <= 3; n++) for (const cells of combos(open, n)) {
      const m = cells.reduce((a, i) => a | s.cand[i], 0);
      if (pop(m) === n + 1) list.push({ cells, m, key: cells.slice().sort((a, b) => a - b).join(',') });
    }
  }
  const seen = new Set();
  return list.filter((a) => (seen.has(a.key) ? false : (seen.add(a.key), true)));
}
export function alsXZ(s) {
  const out = [];
  const L = alsList(s);
  for (let x = 0; x < L.length; x++) for (let y = x + 1; y < L.length; y++) {
    const A = L[x], B = L[y];
    if (A.cells.some((i) => B.cells.includes(i))) continue;
    const common = digits(A.m & B.m);
    if (common.length < 2) continue;
    for (const X of common) {
      const xa = A.cells.filter((i) => has(s, i, X)), xb = B.cells.filter((i) => has(s, i, X));
      if (!xa.every((a) => xb.every((b) => sees(a, b)))) continue; // restricted common
      for (const Z of common) {
        if (Z === X) continue;
        const zc = [...A.cells, ...B.cells].filter((i) => has(s, i, Z));
        const dels = [];
        for (let i = 0; i < 81; i++) if (!A.cells.includes(i) && !B.cells.includes(i) && has(s, i, Z) && zc.every((c) => sees(i, c))) dels.push([i, Z]);
        if (dels.length) out.push({ tech: 'ALS-XZ', X, digit: Z, A: A.cells, B: B.cells, dels });
      }
    }
  }
  return out;
}

// ── 3D Medusa ──
export function medusa(s) {
  const out = [];
  const key = (i, d) => i * 10 + d;
  const adj = new Map();
  const link = (a, b) => { (adj.get(a) || adj.set(a, new Set()).get(a)).add(b); (adj.get(b) || adj.set(b, new Set()).get(b)).add(a); };
  for (let i = 0; i < 81; i++) if (pop(s.cand[i]) === 2) { const [a, b] = digits(s.cand[i]); link(key(i, a), key(i, b)); }
  for (const u of UNITS) for (let d = 1; d <= 9; d++) { const w = u.cells.filter((i) => has(s, i, d)); if (w.length === 2) link(key(w[0], d), key(w[1], d)); }
  const colour = new Map();
  for (const start of adj.keys()) {
    if (colour.has(start)) continue;
    const comp = [start];
    colour.set(start, 0);
    for (let k = 0; k < comp.length; k++) for (const n of adj.get(comp[k])) if (!colour.has(n)) { colour.set(n, 1 - colour.get(comp[k])); comp.push(n); }
    const ds = new Set(comp.map((k) => k % 10));
    if (comp.length < 6 || ds.size < 2) continue; // needs to be genuinely 3D
    const col = (i, d) => (colour.has(key(i, d)) && comp.includes(key(i, d)) ? colour.get(key(i, d)) : null);
    const compSet = new Set(comp);
    const inComp = (i, d) => compSet.has(key(i, d));
    const colourFalse = (c) => comp.filter((k) => colour.get(k) === c).map((k) => [Math.floor(k / 10), k % 10]);
    // rule 1/2: a colour contradicts itself
    for (const c of [0, 1]) {
      const cs = comp.filter((k) => colour.get(k) === c);
      const twiceInCell = cs.some((a) => cs.some((b) => a !== b && Math.floor(a / 10) === Math.floor(b / 10)));
      const twiceInUnit = cs.some((a) => cs.some((b) => a !== b && a % 10 === b % 10 && sees(Math.floor(a / 10), Math.floor(b / 10))));
      if (twiceInCell || twiceInUnit) out.push({ tech: '3D Medusa', rule: twiceInCell ? 1 : 2, colour, comp, dels: colourFalse(c) });
    }
    const dels = [];
    for (let i = 0; i < 81; i++) for (const d of digits(s.cand[i])) {
      if (inComp(i, d)) continue;
      const cellCols = digits(s.cand[i]).map((e) => (inComp(i, e) ? colour.get(key(i, e)) : null)).filter((x) => x !== null);
      const seeCols = comp.filter((k) => k % 10 === d && sees(i, Math.floor(k / 10))).map((k) => colour.get(k));
      if (cellCols.includes(0) && cellCols.includes(1)) dels.push([i, d, 3]);
      else if (seeCols.includes(0) && seeCols.includes(1)) dels.push([i, d, 4]);
      else if (cellCols.length && seeCols.some((c) => !cellCols.includes(c))) dels.push([i, d, 5]);
    }
    if (dels.length) out.push({ tech: '3D Medusa', rule: dels[0][2], colour, comp, dels: dels.map(([i, d]) => [i, d]) });
    void col;
  }
  return out;
}

// ── Cell forcing chain (singles propagation from each candidate of one cell) ──
export function cellForcing(s) {
  const out = [];
  for (let i = 0; i < 81; i++) {
    const cs = digits(s.cand[i]);
    if (cs.length < 2 || cs.length > 3) continue;
    const results = [];
    let bad = false;
    for (const d of cs) {
      const t = clone(s);
      place(t, i, d);
      if (!singles(t)) { bad = true; break; }
      results.push(t);
    }
    if (bad) continue;
    for (let j = 0; j < 81; j++) {
      if (j === i || s.val[j]) continue;
      const v = results.map((t) => t.val[j]);
      if (v.every((x) => x && x === v[0])) {
        out.push({ tech: 'Forcing Chain', source: i, place: [j, v[0]], dels: digits(s.cand[j]).filter((d) => d !== v[0]).map((d) => [j, d]) });
      }
    }
  }
  return out;
}

// ── XY-Chain (bi-value cells only) ──
// start ≠ x ⇒ start = y ⇒ each next cell (sees the last, holds its value) is forced
// to its other digit ⇒ … ⇒ end = x. So x sits in start or end: any cell seeing both
// loses x. Three cells is an XY-Wing and a single repeated pair is a Remote Pair —
// both have their own lessons — so a chain here is ≥4 cells over mixed pairs.
export function xyChain(s, maxLen = 7) {
  const out = [];
  const bi = [...Array(81).keys()].filter((i) => pop(s.cand[i]) === 2);
  const seen = new Set();
  for (const start of bi) {
    for (const x of digits(s.cand[start])) {
      const path = [start];
      const dfs = (cur, v) => {
        if (path.length >= maxLen) return;
        for (const n of bi) {
          if (path.includes(n) || !sees(cur, n) || !has(s, n, v)) continue;
          const w = digits(s.cand[n] & ~bit(v))[0];
          path.push(n);
          if (w === x && path.length >= 4 && !path.every((p) => s.cand[p] === s.cand[start])) {
            const dels = [];
            for (let i = 0; i < 81; i++) if (!path.includes(i) && has(s, i, x) && sees(i, start) && sees(i, n)) dels.push([i, x]);
            const key = `${[start, n].sort((a, b) => a - b).join('-')}:${x}:${dels.map(([i]) => i).join(',')}`;
            if (dels.length && !seen.has(key)) {
              seen.add(key);
              out.push({ tech: 'XY-Chain', digit: x, pattern: path.slice(), dels });
            }
          }
          dfs(n, w);
          path.pop();
        }
      };
      dfs(start, digits(s.cand[start] & ~bit(x))[0]);
    }
  }
  return out;
}

// ── AIC (alternating inference chain, type 1: both ends the same digit) ──
// Nodes are (cell, digit). A strong link is a bi-value cell (i,a)=(i,b) or a digit
// with exactly two places in a unit (i,d)=(j,d); a weak link is two nodes that
// cannot both be true (same cell, or same digit in peers). Chain: S W S … S from
// (i1,x) to (i2,x). If (i1,x) is false the chain forces (i2,x) true, so x is in i1
// or i2 and every cell seeing both loses x. To be an AIC and not an X-Chain or
// XY-Chain it must use BOTH kinds of strong link.
export function aic(s, maxStrong = 4) {
  const out = [];
  const node = (i, d) => i * 10 + d;
  const strong = new Map();
  const addS = (a, b, kind) => {
    for (const [p, q] of [[a, b], [b, a]]) (strong.get(p) || strong.set(p, []).get(p)).push({ to: q, kind });
  };
  for (let i = 0; i < 81; i++) if (pop(s.cand[i]) === 2) { const [a, b] = digits(s.cand[i]); addS(node(i, a), node(i, b), 'cell'); }
  for (const u of UNITS) for (let d = 1; d <= 9; d++) {
    const w = u.cells.filter((i) => has(s, i, d));
    if (w.length === 2) addS(node(w[0], d), node(w[1], d), 'unit');
  }
  const weak = (n) => {
    const i = Math.floor(n / 10), d = n % 10, res = [];
    for (const e of digits(s.cand[i])) if (e !== d) res.push(node(i, e));
    for (const p of PEERS[i]) if (has(s, p, d)) res.push(node(p, d));
    return res;
  };
  const seen = new Set();
  for (const startNode of strong.keys()) {
    const x = startNode % 10, i1 = Math.floor(startNode / 10);
    const path = [startNode];
    const kinds = [];
    // at a node reached by a strong link (so it is "true" under the assumption)
    const fromTrue = (n, nStrong) => {
      const i2 = Math.floor(n / 10);
      if (nStrong >= 2 && n % 10 === x && i2 !== i1 && kinds.includes('cell') && kinds.includes('unit')) {
        const dels = [];
        const inPath = new Set(path.map((p) => Math.floor(p / 10)));
        for (let i = 0; i < 81; i++) if (!inPath.has(i) && has(s, i, x) && sees(i, i1) && sees(i, i2)) dels.push([i, x]);
        const key = `${[i1, i2].sort((a, b) => a - b).join('-')}:${x}:${dels.map(([i]) => i).join(',')}`;
        if (dels.length && !seen.has(key)) {
          seen.add(key);
          out.push({ tech: 'AIC', digit: x, nodes: path.slice(), pattern: [...new Set(path.map((p) => Math.floor(p / 10)))], dels });
        }
      }
      if (nStrong >= maxStrong) return;
      for (const w of weak(n)) {
        if (path.includes(w)) continue;
        path.push(w);
        for (const { to, kind } of strong.get(w) || []) {
          if (path.includes(to)) continue;
          path.push(to); kinds.push(kind);
          fromTrue(to, nStrong + 1);
          path.pop(); kinds.pop();
        }
        path.pop();
      }
    };
    for (const { to, kind } of strong.get(startNode)) {
      path.push(to); kinds.push(kind);
      fromTrue(to, 1);
      path.pop(); kinds.pop();
    }
  }
  return out;
}
