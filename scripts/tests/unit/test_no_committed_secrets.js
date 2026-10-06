/**
 * test_no_committed_secrets.js
 *
 * Standing guard against signing material or credentials entering the repository.
 *
 * A release keystore and its password were committed on 2026-09-01 and sat in
 * history until it was rewritten. The pre-commit hook blocks the obvious cases,
 * but hooks live in .git/ — they are not cloned, and `--no-verify` skips them.
 * This gate runs on every `npm run qa`, so the check survives a fresh clone.
 *
 * Scope, in order of how much trouble each represents:
 *   1. Tracked files       — what a commit would publish right now
 *   2. Staged files        — what is queued to be committed
 *   3. Full git history    — every commit reachable from any ref
 *   4. Unreachable objects — content `git add` wrote into .git/objects
 */

import assert from 'assert';
import { execSync, execFileSync } from 'child_process';

const SECRET_FILE_PATTERN = /(^|\/)(.*\.(jks|keystore|p12|pfx|pepk)|keystore\.properties|google-services\.json|\.env(\..*)?)$/i;
const ALLOWED_SUFFIX = /\.example$/i;

// Literal credential assignments. Reading from a properties file or the
// environment is the pattern we *want*, so those forms are excluded.
const SECRET_CONTENT_PATTERNS = [
  { name: 'literal storePassword/keyPassword', re: /(storePassword|keyPassword)\s*[=:]\s*['"][^'"]+['"]/i },
  { name: 'private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{30,}/ }
];
const CONTENT_EXCLUSIONS = /keystoreProperties|System\.getenv|process\.env|CHANGE_ME|\$\{|SECRET_CONTENT_PATTERNS|storePassword\|keyPassword/;

const sh = (cmd) => execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const lines = (out) => (out ? out.split('\n').filter(Boolean) : []);

/**
 * Run a command whose non-zero exit is a legitimate "no results" answer
 * (git grep exits 1 on no match). Shell operators like `|| true` are not
 * portable to the cmd.exe that execSync uses on Windows, so the distinction
 * between "no match" and "command broke" is made here instead — a broken
 * command must fail the gate, never pass it silently.
 */
function shAllowExit1(cmd) {
  try {
    return { ok: true, out: sh(cmd) };
  } catch (err) {
    if (err.status === 1) return { ok: true, out: '' };
    return { ok: false, out: '', error: `exit ${err.status}: ${cmd}` };
  }
}

/**
 * Same contract as shAllowExit1, but argv is passed directly to git with no
 * shell in between. Regex patterns here contain quotes and pipes that cmd.exe
 * mangles, which silently turned the credential scan into a no-op.
 */
function gitAllowExit1(args) {
  try {
    const out = execFileSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return { ok: true, out: out.trim() };
  } catch (err) {
    if (err.status === 1) return { ok: true, out: '' };
    return { ok: false, out: '', error: `exit ${err.status}: git ${args.slice(0, 4).join(' ')}…` };
  }
}

console.log('======================================================');
console.log('🔐 Testing Repository Is Free of Committed Secrets');
console.log('======================================================\n');

const violations = [];

function checkPaths(label, paths) {
  const bad = paths.filter((p) => SECRET_FILE_PATTERN.test(p) && !ALLOWED_SUFFIX.test(p));
  bad.forEach((p) => violations.push(`${label}: ${p}`));
  console.log(`  ${bad.length === 0 ? '✅' : '❌'} ${label}: ${paths.length} path(s) scanned, ${bad.length} violation(s)`);
}

// 1. Tracked files
checkPaths('tracked file', lines(sh('git ls-files')));

// 2. Staged files
checkPaths('staged file', lines(sh('git diff --cached --name-only')));

// 3. Every path that has ever existed in reachable history
//
// One `git log` over every commit's changes, not one `git ls-tree` per commit.
// A path that ever existed was added by some commit, so it appears in that
// commit's change list: --root shows the first commit's files, -m shows what a
// merge brought in, --no-renames names both sides of a move. The per-commit
// loop spawned a process per commit and grew with every commit (7.4s at 62;
// this is 0.4s) — 2026-09-30, when QA's run time was measured step by step.
const historyPaths = new Set(lines(sh('git log --all --root -m --no-renames --name-only --pretty=format:')));
const commitCount = lines(sh('git rev-list --all')).length;
assert(commitCount === 0 || historyPaths.size > 0, 'history has commits but no path was read from it — the history scan did not run');
checkPaths('history file', [...historyPaths]);

// 4. Secret-looking content in the working tree, so it is caught before it is
//    ever staged. `git grep` with no revision searches tracked files only, so
//    git-ignored paths (android/keystore.properties) are correctly skipped.
console.log('');
for (const { name, re } of SECRET_CONTENT_PATTERNS) {
  const res = gitAllowExit1(['grep', '-I', '-n', '-E', '-e', re.source, '--']);
  if (!res.ok) {
    violations.push(`scanner failed to run on working tree for "${name}" (${res.error})`);
    console.log(`  ❌ working tree — ${name}: SCANNER ERROR`);
    continue;
  }
  const hits = lines(res.out).filter((l) => !CONTENT_EXCLUSIONS.test(l) && !/\.example:/i.test(l));
  hits.slice(0, 5).forEach((h) => violations.push(`working tree (${name}): ${h.slice(0, 160)}`));
  console.log(`  ${hits.length === 0 ? '✅' : '❌'} working tree — ${name}: ${hits.length} hit(s)`);
}

// 4b. Secret-looking content in the *index*.
//
// Step 2 checks staged file NAMES only, and step 4's `git grep` with no
// revision reads the working tree. Between them sits a real gap: `git add`
// a credential, then edit the working copy clean, and the blob queued for the
// next commit carries the secret while every check here passes. Reproduced in
// a throwaway repository against this exact file — staged bait present,
// working tree clean, exit 0, "Repository Clean" printed.
//
// `git fsck --unreachable` does not cover it either: Git counts the index as a
// reachability root, so a staged blob is never reported as unreachable.
// `--cached` is the only thing that reads what is actually queued.
console.log('');
for (const { name, re } of SECRET_CONTENT_PATTERNS) {
  const res = gitAllowExit1(['grep', '--cached', '-I', '-n', '-E', '-e', re.source, '--']);
  if (!res.ok) {
    violations.push(`scanner failed to run on the index for "${name}" (${res.error})`);
    console.log(`  ❌ index — ${name}: SCANNER ERROR`);
    continue;
  }
  const hits = lines(res.out).filter((l) => !CONTENT_EXCLUSIONS.test(l) && !/\.example:/i.test(l));
  hits.slice(0, 5).forEach((h) => violations.push(`index (${name}): ${h.slice(0, 160)}`));
  console.log(`  ${hits.length === 0 ? '✅' : '❌'} index — ${name}: ${hits.length} hit(s)`);
}

// 5. Secret-looking content anywhere in reachable history
//
// Every line that was ever committed was ADDED by some commit, so it is a "+"
// line in that commit's patch (--root for the first commit, -m for merges). One
// `git log -p` pass reads each change once. The grep this replaced searched every
// commit's whole tree, once per pattern — the same unchanged files 62 times over,
// three times (15s; this is about 2s). -G only narrows which commits to print;
// the patterns below decide, on added lines, with the same exclusions as before.
console.log('');
const PICKAXE = '(storePassword|keyPassword)|BEGIN [A-Z ]*PRIVATE KEY|AIza[0-9A-Za-z_-]{30,}';
const logRes = gitAllowExit1(['log', '--all', '--root', '-m', '--no-renames', '-p', '--no-color', '-G', PICKAXE, '--pretty=format:@@COMMIT %H']);
if (!logRes.ok) {
  violations.push(`history scan failed to run (${logRes.error}) — cannot certify history as clean`);
  console.log('  ❌ history content: SCANNER ERROR');
} else {
  const hitsByName = new Map(SECRET_CONTENT_PATTERNS.map((p) => [p.name, []]));
  let commit = '';
  let file = '';
  let added = 0;
  for (const line of logRes.out.split('\n')) {
    if (line.startsWith('@@COMMIT ')) { commit = line.slice(9, 17); continue; }
    if (line.startsWith('+++ ')) { file = line.replace(/^\+\+\+ (b\/)?/, ''); continue; }
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    added++;
    const shown = `${commit}:${file}:${line.slice(1)}`;
    if (CONTENT_EXCLUSIONS.test(shown) || /\.example:/i.test(shown)) continue;
    for (const { name, re } of SECRET_CONTENT_PATTERNS) if (re.test(line)) hitsByName.get(name).push(shown);
  }
  for (const [name, hits] of hitsByName) {
    hits.slice(0, 5).forEach((h) => violations.push(`history content (${name}): ${h.slice(0, 160)}`));
    console.log(`  ${hits.length === 0 ? '✅' : '❌'} history content — ${name}: ${hits.length} hit(s)`);
  }
  console.log(`     (${added} added line(s) read in the commits the pickaxe flagged)`);
}

// 5. Objects `git add` left behind without a commit
const fsckRes = shAllowExit1('git fsck --unreachable --no-reflogs');
// A scanner that did not run found nothing, which is not the same as there
// being nothing. Every other tool call in this file makes that distinction;
// this one silently treated a crashed fsck as an empty result.
if (!fsckRes.ok) {
  violations.push(`git fsck failed to run (${fsckRes.error}) — cannot certify unreachable objects as clean`);
}
const unreachable = lines(fsckRes.out).filter((l) => l.startsWith('unreachable blob'));
let leakedBlobs = 0;
// Read every object in one `git cat-file --batch` instead of three processes per
// object (78 objects took ~20s; this is well under one). --batch prints
// "<sha> <type> <size>\n<content>\n" per object; a missing one is "<sha> missing".
const shas = unreachable.map((l) => l.split(/\s+/)[2]).filter(Boolean);
if (shas.length) {
  let raw = Buffer.alloc(0);
  try {
    raw = execFileSync('git', ['cat-file', '--batch'], { input: shas.join('\n') + '\n', maxBuffer: 512 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (err) {
    violations.push(`git cat-file failed to read unreachable objects (exit ${err.status}) — cannot certify them as clean`);
  }
  let at = 0;
  while (at < raw.length) {
    const nl = raw.indexOf(0x0a, at);
    if (nl < 0) break;
    const [sha, type, sizeText] = raw.subarray(at, nl).toString('utf8').split(' ');
    at = nl + 1;
    if (type === 'missing' || sizeText === undefined) continue;
    const size = Number(sizeText);
    const body = raw.subarray(at, at + size);
    at += size + 1;
    if (type !== 'blob' || size > 2 * 1024 * 1024) continue;
    const text = body.toString('utf8');
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text) || /(storePassword|keyPassword)\s*[=:]/i.test(text)) {
      violations.push(`unreachable object ${sha} contains credential material — run: git reflog expire --expire=now --all && git gc --prune=now`);
      leakedBlobs++;
    }
  }
}
console.log(`  ${leakedBlobs === 0 ? '✅' : '❌'} unreachable objects: ${unreachable.length} scanned, ${leakedBlobs} carrying secrets`);

console.log('');
if (violations.length > 0) {
  console.error('❌ Secret material found in the repository:\n');
  violations.forEach((v) => console.error(`   - ${v}`));
  console.error('\n   Signing credentials belong in android/keystore.properties (git-ignored)');
  console.error('   or in SUIDOKU_* environment variables. See android/keystore.properties.example.\n');
}
assert.strictEqual(violations.length, 0, `${violations.length} secret-material violation(s)`);

console.log('🎉 [PASS] No Committed Secrets — Repository Clean!\n');
