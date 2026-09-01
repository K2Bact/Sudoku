import { execSync } from 'child_process';

console.log('======================================================');
console.log('🚀 [QA MASTER PIPELINE] Running Unified 3-Tier Audit...');
console.log('======================================================\n');

function runStep(name, cmd) {
  console.log(`▶️ STEP: ${name}`);
  try {
    execSync(cmd, { stdio: 'inherit', encoding: 'utf8' });
    console.log(`✅ ${name} PASSED!\n`);
    return true;
  } catch (err) {
    console.error(`\n❌ ${name} FAILED!\n`);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// [TIER 0] Code Quality & Static Analysis
// -----------------------------------------------------------------------------
runStep('0-1. Strict < 300 Lines per Code File Audit', 'node -e "' +
  'import { readdirSync, readFileSync, statSync } from \'fs\';' +
  'import { join } from \'path\';' +
  'function walk(d) { let res = []; for (const n of readdirSync(d)) { const f = join(d, n); if (statSync(f).isDirectory()) res = res.concat(walk(f)); else res.push(f); } return res; }' +
  'const bad = walk(\'src\').filter(f => !f.includes(\'i18n\') && !f.includes(\'data\') && (f.endsWith(\'.js\') || f.endsWith(\'.jsx\') || f.endsWith(\'.css\')) && readFileSync(f, \'utf8\').split(\'\\n\').length > 300);' +
  'if (bad.length > 0) { console.error(\'Code files exceeding 300 lines:\', bad); process.exit(1); } else { console.log(\'All source code files < 300 lines!\'); }' +
  '"');

runStep('0-2. Oxlint Static Code Analysis', 'npx oxlint');

// -----------------------------------------------------------------------------
// [TIER 1] Global L10N Engine (13 Locales, 9 Gates + Profile)
// -----------------------------------------------------------------------------
runStep('1. Global L10N Master 9-Gate & Profile Audit', 'node ../app_common/l10n_engine/validator.mjs --app suidoku');

// -----------------------------------------------------------------------------
// [TIER 2] Core Game Logic & Math Unit Tests
// -----------------------------------------------------------------------------
runStep('2-1. Sudoku Mathematical Integrity & Unique Solver Engine', 'node scripts/tests/unit/test_sudoku_math_engine.js');
runStep('2-2. Deterministic PRNG & Daily Challenge Global Sync', 'node scripts/tests/unit/test_deterministic_prng.js');
runStep('2-3. Ghost PB Replay & Delta Pace Calculation Engine', 'node scripts/tests/unit/test_ghost_delta_mode.js');
runStep('2-4. Wallet Balance, Smart Hint & Attendance Streak Engine', 'node scripts/tests/unit/test_wallet_and_hint_engine.js');
runStep('2-5. Academy 54 Interactive Missions Math & Logic Truth', 'node scripts/tests/unit/test_practice_missions.js');
runStep('2-6. AI Battle vs 1v1 PvP Isolation & Popup Audit', 'node scripts/tests/unit/test_battle_ai_separation.js');
runStep('2-7. Global Leaderboards & Cloud Account Save Safety', 'node scripts/tests/unit/test_cloud_leaderboard_safety.js');

// -----------------------------------------------------------------------------
// [TIER 3] UI / UX, Accessibility & Native Platform Tests
// -----------------------------------------------------------------------------
runStep('3-1. Forbidden Hardcoded Text Scanner in Source Code', 'node scripts/tests/ui/check_no_hardcoded_text.js');
runStep('3-2. Android Manifest Zero-PII & Insets Security Contract', 'node scripts/tests/ui/test_android_manifest.js');
runStep('3-3. Modal Box Borders & Non-Overlapping Action Layout', 'node scripts/tests/ui/test_modal_box_borders.js');
runStep('3-4. Theme Contrast & Button State Visibility Audit', 'node scripts/tests/ui/test_theme_and_button_contrast.js');
runStep('3-5. Home Layout Grid & Responsive Layout Audit', 'node scripts/tests/ui/test_home_layout.js');
runStep('3-6. Android Hardware Back Button & Matchmaking Cancel', 'node scripts/tests/ui/test_back_navigation.js');
runStep('3-7. Playwright 13-Language Visual UI Overflow Scan', 'node scripts/tests/ui/check_ui_overflow.js');

console.log('======================================================');
console.log('🎉 [QA MASTER PIPELINE] 100% PERFECT! ALL TIERS & GATES PASSED.');
console.log('======================================================\n');
