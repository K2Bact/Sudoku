// Turn a killer pick (our own puzzle + one finding, select.mjs) into an academy mission:
// the same shape as the classic 9x9 missions (gate 2-5 re-solves it), plus `cages`.
//
// What the board shows:
//   digits      every placed digit
//   notes       only where the step works — the cells it changes, the target, and the
//               cells left in or out of a 45 sum (their candidates are part of the
//               reasoning). Elsewhere a killer this early has eight or nine candidates
//               in every cell; drawn, they hide the cages the lesson is about.
//   colour      the cage (K1 K2 K14 K4) or the house (K3 K5 K6 K7) the step reads,
//               and the cells left in or out in a second colour
import { HOUSE_SETS, digits } from './kstate.mjs';

const PATTERN = { background: 'rgba(59, 130, 246, 0.16)' };
const GROUP = { background: 'rgba(168, 85, 247, 0.24)' };

export function toMission(pick, id) {
  const f = pick.finding;
  const q = pick.question;
  const notesAt = new Set([q.target, ...f.dels.map(([i]) => i)]);
  for (const i of [...(f.innies || []), ...(f.outies || [])]) notesAt.add(i);
  if (f.place) notesAt.add(f.place[0]);

  const pattern = new Set();
  if (f.house) HOUSE_SETS.find((h) => h.name === f.house).cells.forEach((i) => pattern.add(i));
  else pick.cages[f.cage].cells.forEach((i) => pattern.add(i));
  const group = new Set([...(f.innies || []), ...(f.outies || [])]);

  const cells = pick.val.map((v, i) => {
    const cell = {};
    if (v) cell.val = v;
    else if (notesAt.has(i)) cell.notes = digits(pick.cand[i]);
    if (group.has(i)) cell.style = GROUP;
    else if (pattern.has(i)) cell.style = PATTERN;
    return cell;
  });

  const byCell = new Map();
  for (const [i, d] of f.dels) byCell.set(i, [...(byCell.get(i) || []), d]);
  const mission = {
    id,
    layoutType: 'grid9x9',
    asks: q.asks === 'eliminated' ? 'eliminated' : undefined,
    targetIndex: q.target,
    correctVal: q.answer,
    cages: pick.cages.map((c) => ({ cells: c.cells, sum: c.sum })),
    cells,
  };
  if (f.place) mission.placements = [[f.place[0], f.place[1]]];
  else mission.eliminations = [...byCell].sort((a, b) => a[0] - b[0]);
  if (!mission.asks) delete mission.asks;
  return mission;
}
