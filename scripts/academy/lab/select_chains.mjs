// Pick two XY-Chain and two AIC examples from our own puzzles (seed "chain-N").
//
// Same rules as the original selection: found where simpler solving is stuck; the
// target deletion is not also made by any technique earlier in ORDER (so the step
// really needs this one); checked against the puzzle's unique solution. Shorter
// chains first — the example is for learning. Writes picks_chains.json here.
import fs from 'fs';
import { minimalPuzzle, initState, basicSolve, clone, digits, bit, pop } from './core.mjs';
import * as D from './detect.mjs';

const EARLIER = [
  (s) => D.fish(s, 2), D.xyWing, D.xyzWing, D.wWing, D.remotePairs, D.simpleColouring, D.uniqueRectangle1,
  D.bugPlus1, D.emptyRectangle, (s) => D.fish(s, 3), (s) => D.fish(s, 2, true), (s) => D.fish(s, 4),
  (s) => D.fish(s, 3, true), D.wxyzWing, D.alsXZ, D.medusa,
];
const WANT = { 'XY-Chain': 2, AIC: 2 };
const picks = { 'XY-Chain': [], AIC: [] };
const pool = { 'XY-Chain': [], AIC: [] };

function chooseTarget(s, f) {
  const byCell = new Map();
  for (const [i, d] of f.dels) (byCell.get(i) || byCell.set(i, []).get(i)).push(d);
  for (const [i, ds] of byCell) {
    const left = s.cand[i] & ~ds.reduce((a, d) => a | bit(d), 0);
    if (pop(left) === 1) return { t: i, type: 'answer', correct: digits(left)[0], dels: ds };
  }
  for (const [i, ds] of byCell) if (ds.length === 1) return { t: i, type: 'eliminated', correct: ds[0], dels: ds };
  return null;
}
const size = (f) => (f.nodes ? f.nodes.length : f.pattern.length);

const MAX = Number(process.argv[2] || 3000);
for (let n = 1; n <= MAX; n++) {
  const { puzzle, solution } = minimalPuzzle(`chain-${n}`);
  const s = initState(puzzle);
  if (basicSolve(s, 'all') !== 'stuck') continue;
  const earlier = new Set();
  for (const fn of EARLIER) for (const f of fn(s)) for (const [i, d] of f.dels) earlier.add(`${i}:${d}`);
  const xy = D.xyChain(s);
  for (const [name, found, extraEarlier] of [['XY-Chain', xy, null], ['AIC', D.aic(s), xy]]) {
    const blocked = new Set(earlier);
    if (extraEarlier) for (const f of extraEarlier) for (const [i, d] of f.dels) blocked.add(`${i}:${d}`);
    const good = found
      .map((f) => ({ f, tg: chooseTarget(s, f) }))
      .filter(({ tg }) => tg && !tg.dels.some((d) => blocked.has(`${tg.t}:${d}`)))
      .sort((a, b) => (a.tg.type === b.tg.type ? size(a.f) - size(b.f) : a.tg.type === 'answer' ? -1 : 1));
    if (!good.length) continue;
    const { f, tg } = good[0];
    if (f.dels.some(([i, d]) => solution[i] === d)) throw new Error(`${name} chain-${n} unsound`);
    if (tg.type === 'answer' && solution[tg.t] !== tg.correct) throw new Error(`${name} chain-${n} wrong answer`);
    if (tg.type === 'eliminated' && solution[tg.t] === tg.correct) throw new Error(`${name} chain-${n} eliminates truth`);
    pool[name].push({ n, tech: name, f, tg, state: clone(s), puzzle, solution });
  }
}
// best two per technique: answer-type first, then the shortest chain
for (const name of Object.keys(pool)) {
  pool[name].sort((a, b) => (a.tg.type === b.tg.type ? size(a.f) - size(b.f) : a.tg.type === 'answer' ? -1 : 1));
  picks[name] = pool[name].slice(0, WANT[name]);
  for (const p of picks[name]) console.log(`${name} <- chain-${p.n}  size ${size(p.f)}  ${p.tg.type}`);
}
fs.writeFileSync(new URL('./picks_chains.json', import.meta.url), JSON.stringify(picks));
console.log(Object.entries(picks).map(([k, v]) => `${k}: ${v.length}`).join('  '));
