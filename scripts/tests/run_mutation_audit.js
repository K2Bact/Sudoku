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

/**
 * 파일을 쓰되, 윈도우에서 일시적으로 잠긴 경우 잠깐 기다렸다 다시 시도한다.
 *
 * 이 감사는 소스를 고쳤다 되돌린다. 되돌리는 쪽에서 예외가 나면 **작업트리가
 * 변이 상태로 남는다** — 감사가 낼 수 있는 결과 중 가장 나쁘다. 잘못된 판정은
 * 다시 돌리면 되지만, 더럽혀진 트리는 다음에 무엇을 빌드하든 오염시킨다.
 *
 * 2026-09-11 에 실제로 났다. `npm run build` 직후 `aiBattleSession.js` 를
 * 되돌리는 자리에서 `UNKNOWN (errno -4094)` 이 났고 감사가 죽었다. 원인은
 * 코드가 아니라 다른 프로세스(백신이나 방금 끝난 빌드)가 파일을 잡고 있던
 * 것이고, 몇십 밀리초면 풀린다. 백업 덕분에 손으로 복구할 수 있었지만
 * **복구가 필요했다는 것 자체가 이 자리의 결함이다.**
 *
 * 끝까지 실패하면 던진다. 조용히 넘어가면 더러운 트리를 깨끗하다고 보고하게 된다.
 */
function writeWithRetry(file, body, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.writeFileSync(file, body, 'utf8');
      return;
    } catch (e) {
      const transient = e.code === 'UNKNOWN' || e.code === 'EBUSY' || e.code === 'EPERM';
      if (!transient || i === attempts - 1) throw e;
      // 동기 대기. 이 함수는 finally 안에서도 불리므로 await 을 쓸 수 없다.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (i + 1));
    }
  }
}
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

    /*
     * `rebuildFixture` — 게이트가 기준선 스냅샷과 대조한다면, 그 스냅샷을 다시
     * 찍어 통과시키려는 시도까지 재현해야 한다.
     *
     * 게이트 2-19 는 "지금 쓰는 한자 목록" 과 대조한다. 그 목록은 한 명령으로
     * 다시 만들 수 있고, **실패할 때마다 습관적으로 다시 만들면 게이트가
     * 아무것도 막지 않는다.** 그것이 이 게이트가 죽는 가장 그럴듯한 경로다.
     *
     * 이 필드가 있는 변이는 오염을 넣은 뒤 스냅샷을 다시 만들고 나서 게이트를
     * 돌린다. 그래도 빨개져야 한다 — 스냅샷과 짝을 이루는 자기모순 검사는
     * 근거가 데이터에 있어 재생성으로 지워지지 않기 때문이다.
     *
     * 스냅샷 파일은 아래 finally 에서 다른 변이 파일과 같은 방식으로 되돌린다.
     */
    const fixtureFiles = [];
    const rebuildFixture = () => {
      if (!mut.rebuildFixture) return;
      try { execSync(mut.rebuildFixture, { cwd: ROOT, stdio: 'pipe' }); }
      catch (e) { /* 재생성이 실패해도 게이트를 돌려 무슨 말을 하는지 본다 */ }
    };
    if (mut.rebuildFixture) {
      // 재생성이 건드릴 파일을 미리 백업한다. 무엇이 바뀔지는 명령이 알지만,
      // 이 감사가 아는 것은 "작업트리를 원상복구해야 한다" 뿐이다.
      for (const f of fs.readdirSync(path.join(ROOT, 'scripts/tests/fixtures'))) {
        if (!f.endsWith('.json')) continue;
        const fp = path.join(ROOT, 'scripts/tests/fixtures', f);
        fixtureFiles.push([fp, fs.readFileSync(fp, 'utf8')]);
      }
    }

    let res;
    try {
      inFlight = { full, original, rel };
      writeWithRetry(full, original.replace(mut.find, expandBait(mut.replace)));
      rebuild();
      rebuildFixture();
      res = runGate(manifest.command);
    } finally {
      for (const [fp, body] of fixtureFiles) writeWithRetry(fp, body);
      writeWithRetry(full, original);
      rebuild();
      inFlight = null;
      if (sha(full) === hashesBefore[rel]) fs.unlinkSync(backup);
    }

    const stillGreen = isGreen(manifest, res);
    const rightReason = res.out.includes(mut.expectFailure);

    /*
     * `expectSurvival` — 일부러 통과해야 하는 변이.
     *
     * 게이트가 무엇을 잡는가만 검사하면 한쪽만 고정된다. **무엇을 잡으면 안
     * 되는가**도 고정해야 한다. 오탐은 누락보다 덜 위험해 보이지만, 시끄러운
     * 게이트는 무시당하고 무시당하는 게이트는 검사처럼 보이는 장식이 된다.
     *
     * 실제로 그런 일이 있었다. 하드코딩 스캐너(3-1)가 한국어 **주석**을
     * 위반으로 보고했다. 그것을 조용히 만드는 가장 쉬운 방법은 주석을 영어로
     * 바꾸는 것이고, 그러면 이 저장소에서 가장 값나가는 것 — 왜 그렇게
     * 고쳤는지의 기록 — 이 사라진다. 그래서 "주석은 통과해야 한다" 를
     * 변이로 고정했다.
     *
     * 남용하면 위험하다. SURVIVED 를 이 플래그로 덮어 통과시키는 순간
     * 이 감사는 아무 말도 하지 않게 된다. 그래서 `why` 에 왜 통과가 옳은지
     * 적혀 있지 않으면 받지 않는다.
     */
    if (mut.expectSurvival) {
      if (!mut.why || mut.why.length < 40) {
        console.log(`  🚫 ${mut.name}`);
        console.log('       expectSurvival 인데 why 가 비었거나 너무 짧다 —');
        console.log('       통과가 옳은 이유를 적지 않은 면제는 면제가 아니다');
        results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'UNJUSTIFIED_SURVIVAL' });
      } else if (stillGreen) {
        console.log(`  ✅ ${mut.name}  [통과해야 정상]`);
        results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'CAUGHT' });
      } else {
        console.log(`  ❌ ${mut.name}  [통과해야 정상]`);
        console.log('       the gate went red on something it must not object to.');
        console.log(`       ${mut.why}`);
        results.push({ gate: manifest.gate, mutation: mut.name, verdict: 'FALSE_POSITIVE' });
      }
    } else if (stillGreen) {
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
  console.log('FALSE_POSITIVE means the gate objected to something it must not —');
  console.log('  noise, which gets a gate muted, and a muted gate reads as coverage.');
  console.log('UNJUSTIFIED_SURVIVAL means expectSurvival was claimed with no reason written.');
  console.log('WRONG_REASON means an earlier failure hid this one — the check is unproven.');
  console.log('ANCHOR_* means the manifest rotted. Repoint it; do not delete the mutation.');
}
console.log('======================================================');

process.exit(bad.length === 0 && restored ? 0 : 1);
