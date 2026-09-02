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
runStep('0-1. File Size & Responsibility Separation', 'node scripts/tests/unit/test_file_responsibility.js');

runStep('0-2. Oxlint Static Code Analysis', 'npx oxlint');
runStep('0-3. Node ESM Import Extension Compliance', 'node scripts/tests/unit/test_esm_import_extensions.js');
runStep('0-4. No Committed Secrets or Signing Material', 'node scripts/tests/unit/test_no_committed_secrets.js');
runStep('0-5. Firebase Config Reaches the Build (1v1 is live)', 'node scripts/tests/unit/test_firebase_config_present.js');
runStep('0-6. Scan — Did the Signed-Up Player Turn Up?', 'node scripts/scan/run_scan.js');

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
runStep('2-5b. Academy Text Purity & Diagram Structure', 'node scripts/tests/unit/test_academy_purity.js');
runStep('2-6. AI Battle vs 1v1 PvP Isolation & Popup Audit', 'node scripts/tests/unit/test_battle_ai_separation.js');
runStep('2-7. Global Leaderboards & Cloud Account Save Safety', 'node scripts/tests/unit/test_cloud_leaderboard_safety.js');
runStep('2-8. Battle Message Validation & Transport Contract', 'node scripts/tests/unit/test_battle_message_safety.js');
runStep('2-9. 1v1 Matchmaking — Two Players Actually Meet', 'node scripts/tests/unit/test_battle_matchmaking.js');
runStep('2-10. Ad Honesty & Provider Contract', 'node scripts/tests/unit/test_ads_honesty.js');
runStep('2-11. No Native Dialogs (localised buttons)', 'node scripts/tests/unit/test_no_native_dialogs.js');
runStep('2-12. Device Harness Refuses to Be Fooled', 'node scripts/tests/unit/test_devicelab_catches_lies.js');
runStep('2-13. Billing Honesty (nothing sold that cannot be charged)', 'node scripts/tests/unit/test_billing_honesty.js');

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
runStep('3-8. Real Gameplay End-to-End (play, tap, win)', 'node scripts/tests/ui/test_gameplay_e2e.js');
runStep('3-9. Ad Placements End-to-End (banner, purchase)', 'node scripts/tests/ui/test_ads_placements_e2e.js');

console.log('======================================================');
console.log('🎉 [QA MASTER PIPELINE] 100% PERFECT! ALL TIERS & GATES PASSED.');
console.log('======================================================\n');
