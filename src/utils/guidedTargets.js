/**
 * guidedTargets.js — the cells the first-game walkthrough points at (KP-18, 2026-11-06).
 *
 * The walkthrough that sat unused in the code named fixed cells ("Row 1, Col 3 —
 * enter 9") on a puzzle that is new every time, and moved on with a Next button
 * whatever the player did. These find, on the board actually being played, a cell
 * that teaches the step — and its answer, so the walkthrough moves on only when the
 * player gets it.
 *
 * A cell counts as filled only when it holds its solution: a wrong entry left on
 * the board must not narrow anything. Every answer returned is checked against the
 * solution, so a wrong deduction here shows up as no target, never as a wrong one.
 *
 * Cells are { r, c }; cages are { cells: [0..80], sum } (killerGenerator.js).
 */
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function known(board, solution, r, c) {
  const v = board?.[r]?.[c] || 0;
  return v && v === solution[r][c] ? v : 0;
}

/** The digits row, column and box still allow in an unfilled cell. */
export function candidatesAt(board, solution, r, c) {
  const used = new Set();
  for (let i = 0; i < 9; i++) {
    used.add(known(board, solution, r, i));
    used.add(known(board, solution, i, c));
  }
  const br = r - (r % 3), bc = c - (c % 3);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) used.add(known(board, solution, br + i, bc + j));
  return ALL.filter((d) => !used.has(d));
}

function* openCells(board, solution) {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!known(board, solution, r, c)) yield { r, c };
}

/** A cell with one digit left (a naked single) — the first in reading order. */
export function findSingleCell(board, solution) {
  for (const { r, c } of openCells(board, solution)) {
    const cands = candidatesAt(board, solution, r, c);
    if (cands.length === 1 && cands[0] === solution[r][c]) return { r, c, num: cands[0] };
  }
  return null;
}

/** A cell with two to four digits left, for a first note; not the one in `avoid`. */
export function findNoteCell(board, solution, avoid = null) {
  for (const { r, c } of openCells(board, solution)) {
    if (avoid && avoid.r === r && avoid.c === c) continue;
    const cands = candidatesAt(board, solution, r, c);
    if (cands.length >= 2 && cands.length <= 4) return { r, c, cands };
  }
  return null;
}

const rc = (i) => ({ r: Math.floor(i / 9), c: i % 9 });

/** A cage with one cell left: its sum minus the rest is the answer. */
export function findCageLastCell(board, solution, cages) {
  for (const cage of cages || []) {
    const open = cage.cells.filter((i) => { const { r, c } = rc(i); return !known(board, solution, r, c); });
    if (open.length !== 1 || cage.cells.length < 2) continue;
    const rest = cage.cells.filter((i) => i !== open[0]).reduce((s, i) => { const { r, c } = rc(i); return s + known(board, solution, r, c); }, 0);
    const { r, c } = rc(open[0]);
    const num = cage.sum - rest;
    if (num === solution[r][c]) return { r, c, num, sum: cage.sum, cage: cage.cells.map(rc) };
  }
  return null;
}

function houses() {
  const list = [];
  for (let b = 0; b < 9; b++) {
    const br = 3 * Math.floor(b / 3), bc = 3 * (b % 3);
    const cells = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push((br + i) * 9 + bc + j);
    list.push({ kind: 'box', cells });
  }
  for (let r = 0; r < 9; r++) list.push({ kind: 'row', cells: ALL.map((_, c) => r * 9 + c) });
  for (let c = 0; c < 9; c++) list.push({ kind: 'col', cells: ALL.map((_, r) => r * 9 + c) });
  return list;
}

/**
 * The rule of 45: a box, row or column holds 45. Take away the cages lying wholly
 * inside it and what is left must make up the difference. When exactly one of the
 * cells left over is still open, that difference is its answer. Boxes first — the
 * way the rule is usually taught. At least one whole cage inside, and a cell the
 * cages alone do not give away (not the last open cell of its own cage).
 */
export function findRule45Cell(board, solution, cages) {
  if (!cages?.length) return null;
  for (const house of houses()) {
    const inHouse = new Set(house.cells);
    const inside = cages.filter((cage) => cage.cells.every((i) => inHouse.has(i)));
    if (!inside.length) continue;
    const covered = new Set(inside.flatMap((cage) => cage.cells));
    const rest = house.cells.filter((i) => !covered.has(i));
    if (!rest.length) continue;
    const open = rest.filter((i) => { const { r, c } = rc(i); return !known(board, solution, r, c); });
    if (open.length !== 1) continue;
    const { r, c } = rc(open[0]);
    const own = cages.find((cage) => cage.cells.includes(open[0]));
    const ownOpen = own ? own.cells.filter((i) => { const p = rc(i); return !known(board, solution, p.r, p.c); }).length : 0;
    if (ownOpen === 1) continue;
    const insideSum = inside.reduce((s, cage) => s + cage.sum, 0);
    const restSum = rest.filter((i) => i !== open[0]).reduce((s, i) => { const p = rc(i); return s + known(board, solution, p.r, p.c); }, 0);
    const num = 45 - insideSum - restSum;
    if (num === solution[r][c]) return { r, c, num, house: house.cells.map(rc), houseKind: house.kind };
  }
  return null;
}
