/**
 * find_pure_exocet.mjs — search our own generated puzzles for a "pure" Junior Exocet.
 *
 * Pure means: at the point where singles, locked candidates and subsets are stuck,
 * a Junior Exocet removes a candidate that NO simpler technique in lab/detect.mjs
 * removes (fish, wings, colouring, uniqueness, ALS, 3D Medusa, forcing chains).
 * The two Exocet examples in the academy today are valid but not pure — W-Wing or
 * 3D Medusa reach the same elimination.
 *
 * Every puzzle comes from the app's own generator (src/engine/SudokuEngine.js) and
 * a minimiser; seeds are "pje-<n>", so any hit can be regenerated exactly. Nothing
 * external is read. Each hit is also checked against the puzzle's unique solution.
 *
 * Run (uses all CPU cores but one; stop any time with Ctrl+C — progress is kept):
 *   node scripts/academy/find_pure_exocet.mjs            find 3 pure examples
 *   node scripts/academy/find_pure_exocet.mjs 5           find 5
 *   node scripts/academy/find_pure_exocet.mjs 3 8         use 8 worker threads
 *
 * Output: scripts/academy/lab/pure_exocet_found.json   (the hits)
 *         scripts/academy/lab/pure_exocet_progress.json (next seed to try — a rerun resumes)
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FOUND = path.join(HERE, 'lab', 'pure_exocet_found.json');
const PROGRESS = path.join(HERE, 'lab', 'pure_exocet_progress.json');
const BATCH = 200;

if (isMainThread) {
  const want = Number(process.argv[2] || 3);
  const threads = Number(process.argv[3] || Math.max(1, os.cpus().length - 1));
  const found = fs.existsSync(FOUND) ? JSON.parse(fs.readFileSync(FOUND, 'utf8')) : [];
  let next = fs.existsSync(PROGRESS) ? JSON.parse(fs.readFileSync(PROGRESS, 'utf8')).next : 1;
  let done = 0, stuck = 0, exocets = 0;
  const t0 = Date.now();
  console.log(`Searching with ${threads} threads from seed pje-${next}. Already found: ${found.length}. Target: ${want}.`);
  const save = () => {
    fs.writeFileSync(FOUND, JSON.stringify(found, null, 2) + '\n');
    fs.writeFileSync(PROGRESS, JSON.stringify({ next }) + '\n');
  };
  const workers = [];
  const assign = (w) => { w.postMessage({ from: next, to: next + BATCH }); next += BATCH; };
  for (let k = 0; k < threads; k++) {
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: {} });
    w.on('message', (m) => {
      done += m.count; stuck += m.stuck; exocets += m.exocets;
      for (const hit of m.hits) {
        if (found.some((f) => f.seed === hit.seed)) continue;
        found.push(hit);
        console.log(`\n★ PURE Junior Exocet at ${hit.seed}: ${hit.step}  (${hit.type}, answer ${hit.correct})`);
      }
      save();
      const mins = (Date.now() - t0) / 60000;
      process.stdout.write(`\r  ${done} puzzles · ${stuck} stuck · ${exocets} exocets · ${found.length} pure · ${mins.toFixed(1)} min   `);
      if (found.length >= want) { console.log(`\nDone — ${found.length} pure examples in ${FOUND}`); workers.forEach((x) => x.terminate()); process.exit(0); }
      assign(w);
    });
    w.on('error', (e) => { console.error('\nworker error:', e); process.exit(1); });
    workers.push(w);
    assign(w);
  }
  process.on('SIGINT', () => { save(); console.log(`\nStopped. Resume later from pje-${next}.`); process.exit(0); });
} else {
  const { minimalPuzzle, initState, basicSolve, digits, bit, pop, rc } = await import('./lab/core.mjs');
  const D = await import('./lab/detect.mjs');
  const { juniorExocet } = await import('./lab/exocet.mjs');
  const SIMPLER = [
    (s) => D.fish(s, 2), D.xyWing, D.xyzWing, D.wWing, D.remotePairs, D.simpleColouring, D.uniqueRectangle1,
    D.bugPlus1, D.emptyRectangle, (s) => D.fish(s, 3), (s) => D.fish(s, 2, true), (s) => D.fish(s, 4),
    (s) => D.fish(s, 3, true), D.wxyzWing, D.alsXZ, D.medusa, D.cellForcing,
  ];
  void workerData;
  parentPort.on('message', ({ from, to }) => {
    const hits = [];
    let stuck = 0, exocets = 0;
    for (let n = from; n < to; n++) {
      const seed = `pje-${n}`;
      const { puzzle, solution } = minimalPuzzle(seed);
      const s = initState(puzzle);
      if (basicSolve(s, 'all') !== 'stuck') continue;
      stuck++;
      const jes = juniorExocet(s);
      if (!jes.length) continue;
      exocets++;
      const simpler = new Set(SIMPLER.flatMap((fn) => fn(s)).flatMap((f) => f.dels.map(([i, d]) => `${i}:${d}`)));
      for (const f of jes) {
        const pure = f.dels.filter(([i, d]) => !simpler.has(`${i}:${d}`));
        if (!pure.length) continue;
        if (f.dels.some(([i, d]) => solution[i] === d)) throw new Error(`${seed}: Exocet deleted a true digit — detector bug`);
        const [t, d] = pure[0];
        const left = s.cand[t] & ~bit(d);
        const type = pop(left) === 1 ? 'answer' : 'eliminated';
        hits.push({
          seed, puzzle: puzzle.join(''), base: f.base.map(rc), targets: f.targets.map(rc), digits: f.digits,
          target: rc(t), removed: d, type, correct: type === 'answer' ? digits(left)[0] : d,
          step: `Junior Exocet {${f.digits.join(',')}}: ${f.base.map(rc).join(',')} → ${f.targets.map(rc).join(',')} => ${rc(t)}<>${d}`,
        });
        break;
      }
    }
    parentPort.postMessage({ count: to - from, stuck, exocets, hits });
  });
}
