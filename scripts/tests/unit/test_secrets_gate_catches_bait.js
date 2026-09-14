/**
 * test_secrets_gate_catches_bait.js
 *
 * The secrets gate is checked the way the device harness is (2-12): by handing
 * it planted material and requiring it to object, in a throwaway repository
 * that is deleted afterwards. Nothing here touches the real index or working
 * tree, and no real credential is ever written — the bait is a fake password.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * 0-4 checked staged file NAMES but never staged CONTENT. `git add` a
 * credential, then edit the working copy clean, and the blob queued for the
 * next commit carries the secret while the gate printed "Repository Clean" and
 * exited 0. That was reproduced against the real gate file before it was
 * fixed, and case C below is that reproduction, kept.
 *
 * `git fsck --unreachable` does not close the gap, because Git counts the index
 * as a reachability root — a staged blob is reachable by definition and is
 * never listed. Only `git grep --cached` reads what is actually queued.
 *
 * ── Why the clean case is here too ────────────────────────────────────────
 * A gate that fails on everything catches every bait and is worthless. Case A
 * is the control: if it ever goes red, the cases below stop meaning anything,
 * because "objected" would no longer be evidence that it objected to the bait.
 */

import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GATE = path.join(HERE, 'test_no_committed_secrets.js');

// Not a credential. Shaped like one so the gate's literal-assignment pattern
// matches, and marked so anyone who finds it in a log knows what it is.
//
// Assembled from two halves on purpose. Written out in full it is a literal
// password assignment sitting in a tracked file, and gate 0-4 objects to it —
// correctly, because nothing in the text tells it this one is a prop. The
// alternative was to add this file to CONTENT_EXCLUSIONS, which would carve a
// permanent hole in the gate so that its own test could exist. Splitting the
// string costs one line and leaves the gate exactly as strict as it was.
const BAIT = 'store' + 'Password="not-a-real-password-qa-bait"';
const SAFE = 'buildFlavor=debug';

console.log('======================================================');
console.log('🪤  Testing the Secrets Gate Catches Planted Material');
console.log('======================================================\n');

const git = (dir, ...args) =>
  execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** Run the real gate inside `dir`; return its exit code. */
function runGate(dir) {
  try {
    execFileSync(process.execPath, [GATE], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

/**
 * Build a throwaway repository, let `fill` arrange it, run the gate, clean up.
 * Returns where the bait actually ended up alongside the verdict, so a case
 * that never planted anything cannot be read as a passing check.
 */
function scenario(fill) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'suidoku-secrets-'));
  try {
    git(dir, 'init', '-q');
    git(dir, 'config', 'user.email', 'qa@local');
    git(dir, 'config', 'user.name', 'qa');
    fs.writeFileSync(path.join(dir, 'README.md'), '# throwaway\n');
    git(dir, 'add', '.');
    git(dir, 'commit', '-q', '-m', 'base');

    fill(dir);

    const target = path.join(dir, 'build-config.txt');
    const working = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    return {
      exit: runGate(dir),
      inIndex: git(dir, 'diff', '--cached').includes(BAIT),
      inWorkingTree: working.includes(BAIT),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const write = (dir, body) => fs.writeFileSync(path.join(dir, 'build-config.txt'), body + '\n');

// A. Control — nothing planted anywhere.
const clean = scenario((dir) => {
  write(dir, SAFE);
  git(dir, 'add', 'build-config.txt');
});
assert.strictEqual(clean.inIndex, false, 'control must not plant bait');
assert.strictEqual(clean.exit, 0, 'a repository with no credential must pass, or nothing below means anything');
console.log('  ✅ A. clean repository passes (exit 0)');

// B. Bait in the working tree — the case the gate already covered.
const working = scenario((dir) => {
  write(dir, BAIT);
  git(dir, 'add', 'build-config.txt');
});
assert.strictEqual(working.inWorkingTree, true, 'case B must leave bait in the working tree');
assert.strictEqual(working.exit, 1, 'a credential in the working tree must fail the gate');
console.log('  ✅ B. credential in the working tree is caught (exit 1)');

// C. Bait in the index only — the gap. Staged, then the working copy cleaned.
const staged = scenario((dir) => {
  write(dir, BAIT);
  git(dir, 'add', 'build-config.txt');
  write(dir, SAFE);
});
assert.strictEqual(staged.inIndex, true, 'case C must leave bait staged');
assert.strictEqual(staged.inWorkingTree, false, 'case C must leave the working tree clean');
assert.strictEqual(
  staged.exit, 1,
  'a credential staged for the next commit must fail the gate even when the working copy is clean',
);
console.log('  ✅ C. credential staged but not in the working tree is caught (exit 1)');

console.log('\n🎉 [PASS] The secrets gate objects to planted material and stays quiet without it.\n');
