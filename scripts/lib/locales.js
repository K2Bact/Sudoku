/**
 * locales.js
 * The one place a check may learn which languages this app ships.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 * Four separate checks used to carry their own copy of the locale list:
 *
 *   check_ui_overflow.js            13  ✅
 *   test_battle_ai_separation.js    13  ✅
 *   test_cloud_leaderboard_safety.js 13  ✅
 *   test_practice_missions.js        5  ❌  ['ko','en','ja','zh','es']
 *
 * The last one had drifted, and it drifted in the way that hurts: it kept
 * passing. A check that holds its own copy of the list cannot detect the list
 * changing, because the check IS one of the copies. `zh-TW` and `es-ES` were
 * added to the app and that file never heard about it — and behind it, the
 * academy's 64 practice missions were falling back to English for both
 * languages while the gate reported green.
 *
 * So: no check may write a locale list. It asks here, and here reads the app.
 *
 * ── Two sources, deliberately cross-checked ──────────────────────────────
 * The app has two places that know which languages exist, and they have to
 * agree or something is already broken:
 *
 *   src/i18n/locales/*.js              the translations that actually load
 *   dictionaries.js SUPPORTED_LANGUAGES  the buttons the player can press
 *
 * A locale file with no button is invisible. A button with no locale file is
 * a language that renders as English. Nothing checked this before, so the
 * check lives here — every test that asks for the list pays for it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales');
const DICTIONARIES = path.join(ROOT, 'src/i18n/dictionaries.js');

/** Locale codes that have a translation file on disk. */
function fromFiles() {
  return fs.readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((f) => f.replace(/\.js$/, ''))
    .sort();
}

/**
 * Locale codes the language selector offers.
 *
 * `auto` is dropped: it is a instruction to follow the device, not a language,
 * and it has no translation file by design.
 */
function fromSelector() {
  const src = fs.readFileSync(DICTIONARIES, 'utf8');
  const block = src.slice(src.indexOf('export const SUPPORTED_LANGUAGES'));
  const end = block.indexOf('\n]');
  const list = block.slice(0, end === -1 ? undefined : end);
  return [...list.matchAll(/code:\s*'([^']+)'/g)]
    .map((m) => m[1])
    .filter((c) => c !== 'auto')
    .sort();
}

const files = fromFiles();
const selector = fromSelector();

const onlyFiles = files.filter((c) => !selector.includes(c));
const onlySelector = selector.filter((c) => !files.includes(c));

if (onlyFiles.length || onlySelector.length) {
  const lines = ['The two lists of supported languages disagree.', ''];
  if (onlyFiles.length) {
    lines.push(`  translation file but no button:  ${onlyFiles.join(', ')}`);
    lines.push('    → nobody can select this language; the translations never load.');
  }
  if (onlySelector.length) {
    lines.push(`  button but no translation file:  ${onlySelector.join(', ')}`);
    lines.push('    → selecting this language shows English.');
  }
  lines.push('');
  lines.push('  src/i18n/locales/*.js  and  dictionaries.js SUPPORTED_LANGUAGES');
  lines.push('  must name the same set. Fix whichever one is behind.');
  throw new Error(lines.join('\n'));
}

/**
 * Every locale this app ships, sorted. Read it — do not copy it into a test.
 *
 * If you find yourself writing `['ko', 'en', ...]` in a check, that array is
 * a copy of this one and will be wrong within a release or two.
 */
export const LOCALES = Object.freeze(files);

/** How many languages ship. Derived, never asserted against a literal. */
export const LOCALE_COUNT = LOCALES.length;
