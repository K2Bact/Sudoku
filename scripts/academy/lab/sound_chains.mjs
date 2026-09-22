// Soundness check for the chain detectors: run them on our own puzzles at the point
// where basic solving is stuck, and compare every deletion with the unique solution.
// One deleted true digit means the detector is wrong.  node sound_chains.mjs [N]
import { minimalPuzzle, initState, basicSolve } from './core.mjs';
import { xyChain, aic } from './detect.mjs';

const N = Number(process.argv[2] || 300);
const tally = { 'XY-Chain': [0, 0], AIC: [0, 0] };
const t0 = Date.now();
for (let n = 1; n <= N; n++) {
  const { puzzle, solution } = minimalPuzzle(`sound-${n}`);
  const s = initState(puzzle);
  if (basicSolve(s, 'all') !== 'stuck') continue;
  for (const [name, fn] of [['XY-Chain', xyChain], ['AIC', aic]]) {
    for (const f of fn(s)) {
      tally[name][0]++;
      for (const [i, d] of f.dels) {
        if (solution[i] === d) { tally[name][1]++; console.log(`UNSOUND ${name} sound-${n}: deletes ${d} at ${i}`); }
      }
    }
  }
}
for (const [k, [found, bad]] of Object.entries(tally)) console.log(`${k}: ${found} findings, ${bad} true digits deleted`);
console.log(`${N} puzzles in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
