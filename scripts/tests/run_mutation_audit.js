/**
 * run_mutation_audit.js
 *
 * The QA pipeline asks whether the gates pass. This asks whether they still
 * know how to fail.
 *
 * Every gate here has been green while protecting nothing at least once:
 *
 *   3-10  ended in `.catch(console.error)`, so a timeout exited 0 and the
 *         pipeline stayed green. Proven by pointing it at a selector that does
 *         not exist — it hung, gave up, and reported success.
 *   3-4   guarded its contrast check with `|| className.includes('gradient')`.
 *         The button it measures is always a gradient, so the comparison had
 *         never once executed.
 *   2-5   held a stale expected count of 27/54. Deleting stage5 made the two
 *         numbers agree and it printed PERFECT.
 *   2-14  scanned for a list of banned phrases someone had thought of, and let
 *         the Korean policy say the records live 로컬 저장소에만 — only in local
 *         storage — while Android Auto Backup copied them to Drive.
 *
 * None of those were fixed by making the gate more precise. They were found by
 * breaking the thing the gate claims to protect and watching what it said.
 * Doing that by hand produced four throwaway scripts in one day, so the
 * mutations live next to the gates now and run like anything else.
 *
 * Rules this runner follows, each of them paid for:
 *
 *   1. Attribution comes from the OUTPUT, never the exit code. A harness that
 *      read only the exit code reported that a coupling check had caught a
 *      mutation when the failure actually came from an unrelated case further
 *      down the same gate. Every mutation must name the message it expects.
 *   2. A missing anchor FAILS. It does not skip. An anchor that no longer
 *      matches means the manifest has rotted, and a rotted mutation is exactly
 *      the silent pass this whole file exists to prevent.
 *   3. An anchor must match exactly once. Twice means the mutation is not the
 *      one that was written.
 *   4. The gate must be green before it is mutated. Red-to-red proves nothing.
 *   5. Source files are restored in a finally block, then verified by hash and
 *      by `git status --porcelain` compared against the start.
 *
 * Usage:
 *   node scripts/tests/run_mutation_audit.js                 every manifest
 *   node scripts/tests/run_mutation_audit.js 2-13 2-14       only these gates
 *   node scripts/tests/run_mutation_audit.js --list          what is covered
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST_DIR = path.join(ROOT, 'scripts/tests/mutations');
const BACKUP_DIR = path.join(ROOT, 'test_output/mutation_backups');

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const gitStatus = () => execSync('git status --porcelain', { cwd: ROOT }).toString();

/** Run a gate and hand back its combined output. Exit code is recorded but never judged on its own. */
function runGate(command) {
  try {
    const out = execSync(command, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', timeout: 15 * 60 * 1000 });
    return { exitZero: true, out };
  } catch (e) {
    return {
      exitZero: false,
      out: (e.stdout?.toString() || '') + (e.stderr?.toString() || '')
    };
  }
}

/**
 * Bait for gate 0-4, assembled here rather than written down.
 *
 * That gate hunts for credentials committed to the repository, so testing it
 * needs something credential-shaped — and a manifest holding one is a
 * credential-shaped string in a tracked file, which is the thing the gate
 * exists to stop. The pre-commit hook caught exactly that and refused the
 * commit, which was the correct answer: a detector cannot tell a fixture from
 * a leak, and "it is only a test fixture" is what someone would say about a
 * real one.
 *
 * So nothing here is ever spelled out. The pieces are joined at runtime, no
 * file on disk matches the patterns, and a manifest asks for one by name:
 *
 *     "replace": "// {{BAIT:privateKey}}\n// ...the rest of the line"
 *
 * These are not secrets. They are the shapes of secrets, and they exist for
 * the few milliseconds a mutation is applied.
 */
const SECRET_BAIT = {
  privateKey: ['-----BEGIN', 'RSA', 'PRIVATE', 'KEY-----'].join(' '),
  storePassword: ['store', 'Password'].join('') + ' = ' + '"' + 'notARealPasswordJustBait' + '"'
};

function expandBait(text) {
  return text.replace(/\{\{BAIT:(\w+)\}\}/g, (whole, name) => {
    if (!(name in SECRET_BAIT)) {
      console.error(`❌ A manifest asks for unknown bait: ${whole}`);
      process.exit(1);
    }
    return SECRET_BAIT[name];
  });
}

/**
 * Did this run pass?
 *
 * Normally the answer comes from the output, because rule 1 above was paid for:
 * a harness that judged by exit code alone credited one check with catching a
 * mutation that a different check, further down the same gate, had actually
 * caught.
 *
 * `greenBy: "exit"` is the exception, and it is narrow. It is for a third-party
 * tool that has no case structure and no stable summary line — oxlint prints one
 * line per finding and nothing else, so there is no sentence that means "passed".
 * With a single verdict and nothing to misattribute, the exit code is the whole
 * contract. Do not reach for this on a gate of our own: those have cases, and
 * cases are exactly what gets confused.
 */
function isGreen(manifest, res) {
  if (manifest.greenBy === 'exit') return res.exitZero;
  return res.out.includes(manifest.greenMarker);
}

// ── Load manifests ─────────────────────────────────────────────────────────
if (!fs.existsSync(MANIFEST_DIR)) {
  console.error(`No manifests at ${path.relative(ROOT, MANIFEST_DIR)}`);
  process.exit(1);
}
const manifests = fs.readdirSync(MANIFEST_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(MANIFEST_DIR, f), 'utf8')) }))
  .sort((a, b) => a.gate.localeCompare(b.gate, undefined, { numeric: true }));

const args = process.argv.slice(2);
if (args.includes('--list')) {
  console.log(`${manifests.length} gates carry mutations:\n`);
  for (const m of manifests) {
    console.log(`  ${m.gate.padEnd(6)} ${m.name}`);
    for (const mut of m.mutations) console.log(`         · ${mut.name}`);
  }
  const total = manifests.reduce((n, m) => n + m.mutations.length, 0);
  console.log(`\n${total} mutations in ${manifests.length} manifests.`);
  process.exit(0);
}

const wanted = args.filter((a) => !a.startsWith('--'));
const selected = wanted.length
  ? manifests.filter((m) => wanted.includes(m.gate))
  : manifests;

if (!selected.length) {
  console.error(`No manifest matches ${wanted.join(', ')}. Try --list.`);
  process.exit(1);
}

console.log('======================================================');
console.log('🧬 Mutation Audit — can these gates still fail?');
console.log('======================================================\n');

/**
 * Only one audit at a time.
 *
 * This tool edits files in the shared source tree, so two runs are not
 * independent — and the damage is worse than a lost result. Run A reads a file
 * to hold as "the original" while run B has it mutated; A's original is then B's
 * mutation, and A faithfully restores the broken version when it finishes.
 *
 * That is not hypothetical. Two audits were started at once and both picked
 * AdBanner.jsx. One left `export function __renamedAdBanner` behind in the
 * working tree, and the next unrelated command reported a lint error in a file
 * nobody had touched.
 *
 * A stale lock is possible if a previous run was killed. The message says how
 * old it is and where it is, so the choice to remove it is a person's.
 */
const LOCK = path.join(BACKUP_DIR, '.audit-running');
fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (fs.existsSync(LOCK)) {
  const held = fs.readFileSync(LOCK, 'utf8').trim();
  const ageMin = Math.round((Date.now() - fs.statSync(LOCK).mtimeMs) / 60000);
  console.error('❌ Another mutation audit holds the lock.');
  console.error(`   ${held}`);
  console.error(`   Started ${ageMin} minute(s) ago.`);
  console.error('');
  console.error('   Two audits edit the same source files and restore each other\'s');
  console.error('   mutations as if they were the original. Wait for it to finish.');
  console.error('');
  console.error(`   If that run was killed, check \`git status\` first, then remove:`);
  console.error(`   ${path.relative(ROOT, LOCK)}`);
  process.exit(1);
}
fs.writeFileSync(LOCK, `pid ${process.pid} · gates ${wanted.length ? wanted.join(' ') : 'all'} · started ${new Date().toISOString()}`, 'utf8');
const releaseLock = () => { try { fs.unlinkSync(LOCK); } catch (e) { /* already gone */ } };
process.on('exit', releaseLock);
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(sig, () => {
    // Restore before dying. A killed audit that leaves a mutation behind turns
    // into a bug report against innocent code hours later.
    try { restoreEverything(); } catch (e) { /* reported below */ }
    releaseLock();
    process.exit(130);
  });
}

// ── Safety baseline ────────────────────────────────────────────────────────
const statusBefore = gitStatus();
const touched = new Set();
for (const m of selected) for (const mut of m.mutations) touched.add(mut.file);

const hashesBefore = {};
for (const rel of touched) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`❌ A manifest points at a file that does not exist: ${rel}`);
    console.error('   The manifest has rotted. Fix it rather than removing the mutation.');
    process.exit(1);
  }
  hashesBefore[rel] = sha(full);
}
fs.mkdirSync(BACKUP_DIR, { recursive: true });
console.log(`${selected.length} gates · ${selected.reduce((n, m) => n + m.mutations.length, 0)} mutations · ${touched.size} source files will be edited and restored\n`);

// ── Run ────────────────────────────────────────────────────────────────────
const results = [];

/**
 * The one file that is mutated right now, so a Ctrl-C or a kill can put it back.
 *
 * The finally block below covers a normal failure. It does not cover the process
 * being killed, and a killed audit that leaves `export function __renamedAdBanner`
 * in the tree becomes a lint error against innocent code an hour later.
 */
let inFlight = null;

function restoreEverything() {
  if (!inFlight) return;
  fs.writeFileSync(inFlight.full, inFlight.original, 'utf8');
  console.error(`\n↩ restored ${inFlight.rel} before exiting`);
  inFlight = null;
}

for (const manifest of selected) {
  console.log(`▶ ${manifest.gate}  ${manifest.name}`);

  const base = runGate(manifest.command);
  if (!isGreen(manifest, base)) {
    console.log('  ❌ baseline is not green — nothing can be concluded from mutating it');
    console.log(`     expected ${manifest.greenBy === 'exit' ? 'exit code 0' : `to see: ${manifest.greenMarker}`}`);
    results.push({ gate: manifest.gate, mutation: '(baseline)', verdict: 'BASELINE_RED' });
    console.log('');
    continue;
  }

  for (const mut of manifest.mutations) {
    const rel = mut.file;
    const full = path.join(ROOT, rel);
    const original = fs.readFileSync(full, 'utf8');
    const occurrences = original.split(mut.find).length - 1;

    if (occurrences === 0) {
      console.log(`  ❌ ${mut.name}`);
      console.log('       anchor no longer matches — the manifest has rotted, not the gate');
      console.log(`       looked for: ${JSON.stringify(mut.find.slice(0, 70))}`);
      results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'ANCHOR_MISSING' });
      continue;
    }
    if (occurrences > 1) {
      console.log(`  ❌ ${mut.name}`);
      console.log(`       anchor matches ${occurrences} times — this is not the mutation that was written`);
      results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'ANCHOR_AMBIGUOUS' });
      continue;
    }

    const backup = path.join(BACKUP_DIR, rel.replace(/[\\/]/g, '__'));
    fs.writeFileSync(backup, original, 'utf8');

    // A gate served by `vite preview` reads dist/, not the source tree, so a
    // source mutation is invisible to it until the bundle is rebuilt. Getting
    // this wrong reports SURVIVED for a gate that is in fact fine — the
    // mutation simply never reached the browser.
    const rebuild = () => {
      if (!manifest.rebuild) return;
      try { execSync('npm run build', { cwd: ROOT, stdio: 'pipe' }); }
      catch (e) {
        // A mutation that will not compile is still a valid mutation: the gate
        // must go red. Let the gate run and report on the stale bundle rather
        // than crashing the audit here.
      }
    };

    let res;
    try {
      inFlight = { full, original, rel };
      fs.writeFileSync(full, original.replace(mut.find, expandBait(mut.replace)), 'utf8');
      rebuild();
      res = runGate(manifest.command);
    } finally {
      fs.writeFileSync(full, original, 'utf8');
      rebuild();
      inFlight = null;
      if (sha(full) === hashesBefore[rel]) fs.unlinkSync(backup);
    }

    const stillGreen = isGreen(manifest, res);
    const rightReason = res.out.includes(mut.expectFailure);

    if (stillGreen) {
      console.log(`  ❌ ${mut.name}`);
      console.log('       the gate stayed green. It does not protect this.');
      console.log(`       ${mut.why}`);
      results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'SURVIVED' });
    } else if (!rightReason) {
      console.log(`  ⚠  ${mut.name}`);
      console.log('       the gate went red, but not for the reason claimed —');
      console.log(`       expected: ${JSON.stringify(mut.expectFailure.slice(0, 70))}`);
      console.log('       something else in the same gate failed first, so this check is unproven');
      results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'WRONG_REASON' });
    } else {
      console.log(`  ✅ ${mut.name}`);
      results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'CAUGHT' });
    }
  }
  console.log('');
}

// ── Verify the tree came back ──────────────────────────────────────────────
let restored = true;
for (const rel of touched) {
  if (sha(path.join(ROOT, rel)) !== hashesBefore[rel]) {
    console.error(`❌ NOT RESTORED: ${rel}`);
    console.error(`   A copy of the original is in ${path.relative(ROOT, BACKUP_DIR)}`);
    restored = false;
  }
}
if (gitStatus() !== statusBefore) {
  console.error('❌ git status differs from before the run');
  restored = false;
}

// ── Report ─────────────────────────────────────────────────────────────────
const caught = results.filter((r) => r.verdict === 'CAUGHT').length;
const bad = results.filter((r) => r.verdict !== 'CAUGHT');

console.log('======================================================');
console.log(`${caught}/${results.length} mutations caught · tree ${restored ? 'restored' : 'NOT RESTORED'}`);
if (bad.length) {
  console.log('');
  for (const b of bad) console.log(`  ${b.verdict.padEnd(17)} ${b.gate}  ${b.mutation}`);
  console.log('');
  console.log('SURVIVED means the gate passes while the thing it guards is broken.');
  console.log('WRONG_REASON means an earlier failure hid this one — the check is unproven.');
  console.log('ANCHOR_* means the manifest rotted. Repoint it; do not delete the mutation.');
}
console.log('======================================================');

process.exit(bad.length === 0 && restored ? 0 : 1);
