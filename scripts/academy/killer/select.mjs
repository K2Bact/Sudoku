// Pick academy examples for the killer techniques from our own killers.
//
// A moment counts for technique T only when the walk used T there — every technique
// before it in ORDER found nothing (ksolve.mjs). From each such moment one finding is
// made into a question:
//   placement   K1, K3, a one-cell K5   "which digit goes here?"
//   removal     the rest                "which candidate goes?" — the target cell loses
//                                       exactly one digit, so the answer is one digit
// Smaller pictures first: few cells involved, few cages, a box before a line.
// Writes picks_killer.json here (another seed prefix: picks_killer_<prefix>.json, so a wider
// search never overwrites the picks the academy already uses) and prints how often each
// level needed each technique.
//
//   node scripts/academy/killer/select.mjs [puzzlesPerLevel=200] [seedPrefix=kl] [levels=1,2,3,4,5]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { makeKiller, digits, HOUSE_SETS } from './kstate.mjs';
import { walk, ORDER } from './ksolve.mjs';

const TAUGHT = ['K1', 'K2', 'K14', 'K3', 'K4', 'K5', 'K6', 'K7'];
const KEEP = 12;
const perLevel = Number(process.argv[2] || 200);
const prefix = process.argv[3] || 'kl';
const LEVELS = (process.argv[4] || '1,2,3,4,5').split(',').map(Number);
const OUT = prefix === 'kl' ? 'picks_killer.json' : `picks_killer_${prefix}.json`;
const here = path.dirname(fileURLToPath(import.meta.url));

const bins = Object.fromEntries(TAUGHT.map((t) => [t, []]));
const byLevel = Array.from({ length: 6 }, () => Object.fromEntries([...ORDER, 'reveal'].map((t) => [t, 0])));
const puzzlesAt = new Array(6).fill(0);

function question(f, s) {
  if (f.place) return { asks: 'placed', target: f.place[0], answer: f.place[1] };
  const per = new Map();
  for (const [i, d] of f.dels) per.set(i, [...(per.get(i) || []), d]);
  const ones = [...per].filter(([, ds]) => ds.length === 1);
  if (!ones.length) return null;
  // K4: the target is outside the cage — that is the point of the lesson.
  const pool = f.tech === 'K4' ? ones.filter(([i]) => s.cageOf[i] !== f.cage) : ones;
  if (!pool.length) return null;
  pool.sort((a, b) => a[0] - b[0]);
  return { asks: 'eliminated', target: pool[0][0], answer: pool[0][1][0] };
}

function involved(f, s) {
  const cells = new Set();
  const addCage = (k) => s.cages[k].cells.forEach((i) => cells.add(i));
  if (f.cage !== undefined) addCage(f.cage);
  for (const k of f.cages || []) addCage(k);
  for (const i of [...(f.innies || []), ...(f.outies || [])]) cells.add(i);
  for (const [i] of f.dels) cells.add(i);
  if (f.place) cells.add(f.place[0]);
  return [...cells];
}

function score(f, s, q) {
  const cells = involved(f, s);
  let x = cells.length + 2 * (f.cages ? f.cages.length : 1);
  if (f.house) {
    x += f.house.startsWith('b') ? 0 : 3; // a box is easier to see than a line
    // The lesson is "45 minus the cages". When digits already placed in the house take
    // part in the sum, it reads as "count what is left" instead — prefer houses where
    // the cages do the work, and emptier houses over crowded ones.
    const H = HOUSE_SETS.find((h) => h.name === f.house);
    const qCells = new Set(f.cages.flatMap((k) => s.cages[k].cells));
    const inRelation = [...H.cells.filter((i) => !qCells.has(i)), ...[...qCells].filter((i) => !H.set.has(i))];
    // Cage splitting is the cage cut at the edge: 45 gives the part inside, the cage sum
    // the part outside. A digit already placed on either side turns it into a remainder
    // sum (K1) — so for K7 a placed digit almost rules the moment out, and the outside part
    // (both sums used) reads as the split better than the inside part (that is K5).
    const placedIn = inRelation.filter((i) => s.val[i]).length;
    x += (f.tech === 'K7' ? 15 : 3) * placedIn;
    if (f.tech === 'K7') {
      const group = f.outies.length ? f.outies : f.innies;
      const X = s.cages[s.cageOf[group[0]]];
      x += 15 * X.cells.filter((i) => s.val[i]).length;
      if (!f.outies.length) x += 10;
    }
    x += 0.5 * H.cells.filter((i) => s.val[i]).length;
  }
  if (f.k > 1) x += 6 * (f.k - 1);
  x += 0.05 * s.val.filter(Boolean).length; // an emptier board is a simpler picture
  if (f.tech === 'K4' && f.sets === 1) x += 8; // a true "must contain" has several sets
  if (f.tech === 'K2' || f.tech === 'K14') {
    const cage = s.cages[f.cage];
    if (cage.cells.some((i) => s.val[i])) x += 4; // an untouched cage reads easier
  }
  if (q.asks === 'eliminated') x += 1;
  return x;
}

const t0 = Date.now();
for (const level of LEVELS) {
  for (let n = 0; n < perLevel; n++) {
    const seed = `${prefix}-${level}-${n}`;
    const k = makeKiller(seed, level);
    puzzlesAt[level]++;
    const usedHere = new Set();
    let step = 0;
    walk(k, (tech, s, found) => {
      step++;
      usedHere.add(tech);
      if (!TAUGHT.includes(tech)) return;
      let best = null;
      for (const f of found) {
        const q = question(f, s);
        if (!q) continue;
        const sc = score(f, s, q);
        if (!best || sc < best.score) best = { f, q, score: sc };
      }
      if (!best) return;
      bins[tech].push({
        seed, level, step, score: best.score,
        cages: k.cages, val: s.val, cand: s.cand,
        finding: best.f, question: best.q, involved: involved(best.f, s),
        solution: k.solution,
      });
    });
    for (const t of usedHere) byLevel[level][t]++;
  }
}

const picks = {};
for (const t of TAUGHT) {
  bins[t].sort((a, b) => a.score - b.score);
  // one moment per puzzle, so the examples are different boards
  const seen = new Set();
  picks[t] = bins[t].filter((p) => !seen.has(p.seed) && seen.add(p.seed)).slice(0, KEEP);
}
fs.writeFileSync(path.join(here, OUT), JSON.stringify(picks));

console.log(`${puzzlesAt.slice(1).reduce((a, b) => a + b, 0)} puzzles · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('\nmoments found per technique (all levels) → kept');
for (const t of TAUGHT) {
  const best = picks[t][0];
  console.log(`  ${t.padEnd(4)} ${String(bins[t].length).padStart(6)} → ${picks[t].length}` +
    (best ? `   best: ${best.seed} step ${best.step} score ${best.score} ${best.question.asks} r${Math.floor(best.question.target / 9) + 1}c${best.question.target % 9 + 1}=${best.question.answer}` : ''));
}
console.log('\nshare of puzzles that needed the technique at least once (by level)');
console.log(`→ ${OUT}`);
console.log('       ' + LEVELS.map((l) => `Lv${l}`.padStart(6)).join(''));
for (const t of [...ORDER, 'reveal']) {
  console.log(`  ${t.padEnd(6)}` + LEVELS.map((l) => `${Math.round((100 * byLevel[l][t]) / puzzlesAt[l])}%`.padStart(6)).join(''));
}
export { digits };
