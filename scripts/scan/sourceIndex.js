/**
 * sourceIndex.js
 * Reads the tree once and hands every check the same view of it.
 *
 * Checks share this instead of walking the disk themselves, so a scan run costs
 * one read per file and every check agrees on what "the code" is — a check that
 * strips comments differently from its neighbour will disagree with it about
 * whether a symbol is used, and the two will argue in the report.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, sep, relative } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

export const norm = (p) => relative(ROOT, p).split(sep).join('/');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

/** Comments hold the history of past bugs; they must never count as usage. */
export function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

export function buildIndex() {
  const app = new Map();
  const tests = new Map();
  const locales = new Map();

  for (const f of walk(join(ROOT, 'src'))) {
    const rel = norm(f);
    const raw = readFileSync(f, 'utf8');
    if (rel.includes('/i18n/locales/')) locales.set(rel, raw);
    else app.set(rel, { raw, code: stripComments(raw) });
  }

  for (const f of walk(join(ROOT, 'scripts'))) {
    const rel = norm(f);
    if (rel.startsWith('scripts/scan/')) continue; // the scanner is not a consumer
    tests.set(rel, stripComments(readFileSync(f, 'utf8')));
  }

  return { app, tests, locales };
}

/**
 * Where a symbol is referenced, split by who references it.
 *
 * The split matters: something only its own tests use is not dead, but it is
 * not carrying its weight either — it exists to be tested. That is a different
 * conversation from "nothing anywhere touches this", so the scan keeps them
 * apart instead of lumping both under "unused".
 */
export function referencesTo(name, index, exceptFile) {
  const word = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  const app = [];
  const tests = [];
  for (const [file, { code }] of index.app) {
    if (file === exceptFile) continue;
    if (word.test(code)) app.push(file);
  }
  for (const [file, code] of index.tests) {
    if (word.test(code)) tests.push(file);
  }
  return { app, tests };
}
