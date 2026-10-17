// Soundness check for the killer detectors.
//
// Walk our own killers (every level), and at every moment run EVERY detector — not
// only the one the walk used — and compare each removal and placement with the unique
// solution. One removed true digit means a detector is wrong.
//
//   node scripts/academy/killer/sound.mjs [puzzlesPerLevel=40] [seedPrefix=ks]
import { makeKiller } from './kstate.mjs';
import { walk, finder, ORDER } from './ksolve.mjs';

const perLevel = Number(process.argv[2] || 40);
const prefix = process.argv[3] || 'ks';
const t0 = Date.now();

const found = Object.fromEntries(ORDER.map((t) => [t, 0]));
const wrong = [];
let moments = 0;
let candidateLost = 0;
let puzzles = 0;
let broken = 0;

for (let level = 1; level <= 5; level++) {
  for (let n = 0; n < perLevel; n++) {
    const seed = `${prefix}-${level}-${n}`;
    const k = makeKiller(seed, level);
    puzzles++;
    const res = walk(k, (tech, s) => {
      if (tech === 'reveal') return;
      moments++;
      // The state itself must still hold the solution.
      for (let i = 0; i < 81; i++) {
        if (s.val[i] && s.val[i] !== k.solution[i]) candidateLost++;
        if (!s.val[i] && !(s.cand[i] & (1 << (k.solution[i] - 1)))) candidateLost++;
      }
      const F = finder(s);
      for (const t of ORDER) {
        for (const f of F[t]()) {
          found[t]++;
          for (const [i, d] of f.dels) if (k.solution[i] === d) wrong.push({ seed, t, cell: i, d, f });
          if (f.place && k.solution[f.place[0]] !== f.place[1]) wrong.push({ seed, t, place: f.place, f });
        }
      }
    });
    if (res.broken) broken++;
  }
}

console.log(`puzzles ${puzzles} (levels 1-5 × ${perLevel}) · moments ${moments} · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('findings by technique (all detectors at every moment):');
for (const t of ORDER) console.log(`  ${t.padEnd(7)} ${found[t]}`);
console.log(`solution lost from the state: ${candidateLost} · walks broken: ${broken}`);
console.log(`WRONG removals/placements: ${wrong.length}`);
for (const w of wrong.slice(0, 10)) console.log('  ', JSON.stringify({ ...w, f: { ...w.f, dels: w.f.dels.slice(0, 6) } }));
process.exit(wrong.length || candidateLost || broken ? 1 : 0);
