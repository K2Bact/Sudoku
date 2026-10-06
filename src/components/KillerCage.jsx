import React from 'react';

/**
 * KillerCage.jsx — a killer's cages, drawn cell by cell.
 *
 * Each cell draws its own share of its cage's dashed outline: the sides it
 * shares with another cage, set in from the edge so two neighbouring cages'
 * lines stay apart, and the short corner pieces where its cage turns around a
 * cell of another cage. One picture laid over the whole board would drift off
 * the cells: the thick box lines make some cells a few pixels narrower than
 * others, and a dashed line inset by a few pixels has no room for that.
 */

// How far the outline sits inside the cell, in percent of the cell.
const INSET = 11;

export function CageOutline({ cell, cageOf }) {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  const same = (dr, dc) => {
    const y = r + dr;
    const x = c + dc;
    return y >= 0 && y < 9 && x >= 0 && x < 9 && cageOf[y * 9 + x] === cageOf[cell];
  };
  const up = same(-1, 0);
  const down = same(1, 0);
  const left = same(0, -1);
  const right = same(0, 1);
  const a = INSET;
  const b = 100 - INSET;

  const lines = [];
  if (!up) lines.push([left ? 0 : a, a, right ? 100 : b, a]);
  if (!down) lines.push([left ? 0 : a, b, right ? 100 : b, b]);
  if (!left) lines.push([a, up ? 0 : a, a, down ? 100 : b]);
  if (!right) lines.push([b, up ? 0 : a, b, down ? 100 : b]);
  // Where the cage wraps around a corner cell of another cage, the lines of the
  // two neighbours meet here and need joining.
  if (up && left && !same(-1, -1)) lines.push([0, a, a, a], [a, 0, a, a]);
  if (up && right && !same(-1, 1)) lines.push([b, a, 100, a], [b, 0, b, a]);
  if (down && left && !same(1, -1)) lines.push([0, b, a, b], [a, b, a, 100]);
  if (down && right && !same(1, 1)) lines.push([b, b, 100, b], [b, b, b, 100]);

  return (
    <svg className="cage-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
