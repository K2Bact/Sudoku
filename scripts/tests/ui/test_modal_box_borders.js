/**
 * test_modal_box_borders.js
 *
 * Three layout regressions that have happened in the result modals, pinned so
 * they do not come back. This is source reading, not rendering: it looks at CSS
 * rules and JSX text, never at a laid-out modal.
 *
 * Checked:
 *   1. Each three-column stat grid (.stats-grid, .stats-summary-grid,
 *      .stats-summary-bar) has a gap of at least 6px IN ITS OWN RULE. With no gap
 *      the cards' borders sat on top of each other on a phone.
 *   2. The result modals do not carry `mb-2` / `mt-2` on an action button — class
 *      names from another framework that this app never defines.
 *   3. VictoryModal's leaderboard button is written after the opening of
 *      .modal-actions-vertical, where it used to sit outside and collide.
 *
 * NOT checked — the header used to promise these (external audit V11,
 * 2026-09-12; narrowed 2026-09-30): border-radius, border widths, computed
 * styles, and whether any element really is a child of another in the DOM.
 * Checking those means opening each modal in a browser, and the win modal needs
 * a won game to open. Until that exists, this gate says only the three things
 * above.
 *
 * Test 1 used to search each whole FILE for "gap: 0" and "gap: 8px", so a
 * gap anywhere else in the file answered for the grid. It now reads the rule.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 [QA Gate] Modal layout regressions (grid gaps, phantom classes, leaderboard placement)...');

let failures = 0;
const MIN_GAP_PX = 6;

/** The innermost rule blocks of a stylesheet, with their selectors. */
function rules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
}

function gapPx(body) {
  const m = body.match(/(?:^|;)\s*(?:column-)?gap\s*:\s*([\d.]+)(px|rem)?/);
  if (!m) return null;
  return Number(m[1]) * (m[2] === 'rem' ? 16 : 1);
}

// Test 1: every three-column grid rule carries its own gap
const GRIDS = [['modals.css', '.stats-grid'], ['stats.css', '.stats-summary-grid'], ['brainReport.css', '.stats-summary-bar']];
for (const [file, selector] of GRIDS) {
  const found = rules(readFileSync(join('src', 'styles', file), 'utf8'))
    .filter((r) => r.selector.split(',').map((s) => s.trim()).includes(selector) && /grid-template-columns\s*:\s*repeat\(3,\s*1fr\)/.test(r.body));
  if (!found.length) {
    console.error(`❌ [FAIL] ${file}: no ${selector} rule with a three-column grid — the check did not reach it`);
    failures++;
    continue;
  }
  for (const r of found) {
    const gap = gapPx(r.body);
    if (gap === null || gap < MIN_GAP_PX) {
      console.error(`❌ [FAIL] ${file} ${selector}: gap ${gap === null ? 'missing' : `${gap}px`} — the cards' borders overlap on a phone (need >= ${MIN_GAP_PX}px)`);
      failures++;
    } else {
      console.log(`  ✅ [PASS] ${file} ${selector}: gap ${gap}px`);
    }
  }
}

// Test 2: no phantom utility classes on the result modals' action buttons
const modalComponents = ['VictoryModal.jsx', 'GameOverModal.jsx', 'BattleResultModal.jsx'];
for (const file of modalComponents) {
  const content = readFileSync(join('src', 'components', file), 'utf8');
  if (/className="[^"]*\bbtn\b[^"]*\b(?:mb|mt)-2\b[^"]*"/.test(content)) {
    console.error(`❌ [FAIL] ${file} contains undefined phantom utility class (mb-2/mt-2) on action buttons.`);
    failures++;
  } else {
    console.log(`  ✅ [PASS] ${file}: no mb-2 / mt-2 on a button`);
  }

  // Test 3: the leaderboard button comes after the vertical action group opens
  if (file === 'VictoryModal.jsx') {
    const leaderIndex = content.indexOf('leaderboardBtn');
    const verticalIndex = content.indexOf('modal-actions-vertical');
    if (leaderIndex < 0 || verticalIndex < 0) {
      console.error('❌ [FAIL] VictoryModal.jsx: leaderboardBtn or modal-actions-vertical not found — the check did not reach its subject');
      failures++;
    } else if (leaderIndex < verticalIndex) {
      console.error('❌ [FAIL] VictoryModal.jsx: Leaderboard button is outside modal-actions-vertical, risking border overlap.');
      failures++;
    } else {
      console.log('  ✅ [PASS] VictoryModal.jsx: leaderboard button written after .modal-actions-vertical opens');
    }
  }
}

if (failures === 0) {
  console.log('🎉 Modal layout regression checks passed (3 grids, 3 modals, 1 placement).');
  process.exit(0);
} else {
  console.error(`\n❌ ${failures} border/layout violation(s) detected!\n`);
  process.exit(1);
}
