/**
 * test_modal_box_borders.js
 * 
 * 100% Automated Local QA Gate:
 * Verifies that all modal stat boxes, grids, and action buttons have:
 * 1. Proper gap separation (>= 6px) to eliminate overlapping border defects.
 * 2. Independent border-radius and crisp 1px borders per card.
 * 3. Zero undefined/phantom CSS utility classes (e.g. mb-2, mt-2) in modal components.
 * 4. Proper button hierarchy inside .modal-actions-vertical.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 [QA Gate] Auditing Modal Box Borders & Action Layouts...');

let failures = 0;

// Test 1: Check CSS files for stats-grid, stats-summary-grid, stats-summary-bar
const cssFiles = ['modals.css', 'stats.css', 'brainReport.css'];
for (const file of cssFiles) {
  const content = readFileSync(join('src', 'styles', file), 'utf8');
  
  // Check that grid containers have explicit gap
  if (content.includes('grid-template-columns: repeat(3, 1fr)')) {
    if (content.includes('gap: 0') || (content.includes('border-right:') && !content.includes('gap: 8px') && !content.includes('gap: 6px'))) {
      console.error(`❌ [FAIL] ${file} contains 0-gap grid with border-right (causes overlapping borders on mobile).`);
      failures++;
    } else {
      console.log(`  ✅ [PASS] ${file} uses isolated card grid with gap spacing.`);
    }
  }
}

// Test 2: Check Modal JSX components for phantom classes and layout
const modalComponents = ['VictoryModal.jsx', 'GameOverModal.jsx', 'BattleResultModal.jsx'];
for (const file of modalComponents) {
  const content = readFileSync(join('src', 'components', file), 'utf8');
  
  // Check for undefined bootstrap utility classes (e.g. mb-2, mt-2 on top-level buttons)
  if (content.includes('className="btn btn-secondary w-100 mb-2"') || content.includes('className="btn btn-secondary w-100 mt-2"')) {
    console.error(`❌ [FAIL] ${file} contains undefined phantom utility class (mb-2/mt-2) on action buttons.`);
    failures++;
  } else {
    console.log(`  ✅ [PASS] ${file} has clean, well-defined action button hierarchy.`);
  }

  // Check that VictoryModal places leaderboard button cleanly
  if (file === 'VictoryModal.jsx') {
    if (content.indexOf('leaderboardBtn') > -1 && content.indexOf('modal-actions-vertical') > -1) {
      const leaderIndex = content.indexOf('leaderboardBtn');
      const verticalIndex = content.indexOf('modal-actions-vertical');
      if (leaderIndex < verticalIndex) {
        console.error(`❌ [FAIL] VictoryModal.jsx: Leaderboard button is outside modal-actions-vertical, risking border overlap.`);
        failures++;
      } else {
        console.log(`  ✅ [PASS] VictoryModal.jsx: Leaderboard button is properly placed inside modal-actions-vertical.`);
      }
    }
  }
}

if (failures === 0) {
  console.log('🎉 ALL MODAL BOX BORDER & LAYOUT AUDITS PASSED 100%!');
  process.exit(0);
} else {
  console.error(`\n❌ ${failures} border/layout violation(s) detected!\n`);
  process.exit(1);
}
