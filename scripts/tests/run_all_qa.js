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
runStep('0-4b. The Secrets Gate Catches Planted Material', 'node scripts/tests/unit/test_secrets_gate_catches_bait.js');
runStep('0-5. Firebase Config Reaches the Build (1v1 is live)', 'node scripts/tests/unit/test_firebase_config_present.js');
runStep('0-6. Scan — Did the Signed-Up Player Turn Up?', 'node scripts/scan/run_scan.js');

// -----------------------------------------------------------------------------
// [TIER 1] Global L10N Engine (13 Locales, 9 Gates + Profile)
// -----------------------------------------------------------------------------
runStep('1. Global L10N Master 9-Gate & Profile Audit', 'node ../../app_common/l10n_engine/validator.mjs --app suidoku');

// -----------------------------------------------------------------------------
// [TIER 2] Core Game Logic & Math Unit Tests
// -----------------------------------------------------------------------------
runStep('2-1. Sudoku Mathematical Integrity & Unique Solver Engine', 'node scripts/tests/unit/test_sudoku_math_engine.js');
runStep('2-2. Deterministic PRNG & Daily Challenge Global Sync', 'node scripts/tests/unit/test_deterministic_prng.js');
runStep('2-3. Ghost PB Replay & Delta Pace Calculation Engine', 'node scripts/tests/unit/test_ghost_delta_mode.js');
runStep('2-4. Wallet Balance, Smart Hint & Attendance Streak Engine', 'node scripts/tests/unit/test_wallet_and_hint_engine.js');
runStep('2-5. Academy 64 Interactive Missions Math & Logic Truth', 'node scripts/tests/unit/test_practice_missions.js');
runStep('2-5b. Academy Text Purity & Diagram Structure', 'node scripts/tests/unit/test_academy_purity.js');
runStep('2-6. AI Battle vs 1v1 PvP Isolation & Popup Audit', 'node scripts/tests/unit/test_battle_ai_separation.js');
runStep('2-7. Global Leaderboards & Cloud Account Save Safety', 'node scripts/tests/unit/test_cloud_leaderboard_safety.js');
runStep('2-8. Battle Message Validation & Transport Contract', 'node scripts/tests/unit/test_battle_message_safety.js');
runStep('2-9. 1v1 Matchmaking — Two Players Actually Meet', 'node scripts/tests/unit/test_battle_matchmaking.js');
runStep('2-10. Ad Honesty & Provider Contract', 'node scripts/tests/unit/test_ads_honesty.js');
runStep('2-11. No Native Dialogs (localised buttons)', 'node scripts/tests/unit/test_no_native_dialogs.js');
runStep('2-12. Device Harness Refuses to Be Fooled', 'node scripts/tests/unit/test_devicelab_catches_lies.js');
runStep('2-13. Billing Honesty (nothing sold that cannot be charged)', 'node scripts/tests/unit/test_billing_honesty.js');
runStep('2-14. Privacy Claims Match Actual Behaviour', 'node scripts/tests/unit/test_privacy_claims.js');
runStep('2-15. Every Translated Key Is Reachable', 'node scripts/tests/unit/test_locale_keys_reachable.js');
runStep('2-16. Academy Content Under The l10n Engine', 'node scripts/tests/unit/test_academy_l10n.js');
runStep('2-17. No Hand-Copied Locale Lists', 'node scripts/tests/unit/test_no_hardcoded_locales.js');
runStep('2-18. Translation Actually Happened', 'node scripts/tests/unit/test_translation_actually_happened.js');
runStep('2-19. CJK Script Purity (no Simplified in ja or zh-TW)', 'node scripts/tests/unit/test_cjk_script_purity.js');
runStep('2-20. Ad Lifecycle Races (init cache, banner show/hide)', 'node scripts/tests/unit/test_ad_lifecycle_races.js');
runStep('2-21. A Best Time Is A Record Only When It Was Played For One', 'node scripts/tests/unit/test_record_eligibility.js');
runStep('2-22. A Game Still Being Played Can Be Resumed', 'node scripts/tests/unit/test_saved_game_resume.js');

// -----------------------------------------------------------------------------
// [TIER 3] UI / UX, Accessibility & Native Platform Tests
// -----------------------------------------------------------------------------
// Tier 3 runs against a browser, and the browser is served dist/ by
// `vite preview`. Without this build those gates check whatever was compiled
// last, which is not necessarily the source sitting in the tree. A mutation
// that deleted the matchmaking-cancel branch outright left gate 3-6 green for
// exactly this reason — the changed code had never reached the bundle.
//
// The build takes well under a second. A tier that silently validates a stale
// bundle costs considerably more than that.
runStep('3-0. Build the bundle Tier 3 will actually test', 'npm run build');

runStep('3-1. Forbidden Hardcoded Text Scanner in Source Code', 'node scripts/tests/ui/check_no_hardcoded_text.js');
runStep('3-2. Android Manifest Zero-PII & Insets Security Contract', 'node scripts/tests/ui/test_android_manifest.js');
runStep('3-3. Modal Box Borders & Non-Overlapping Action Layout', 'node scripts/tests/ui/test_modal_box_borders.js');
runStep('3-4. Theme Contrast & Button State Visibility Audit', 'node scripts/tests/ui/test_theme_and_button_contrast.js');
runStep('3-5. Home Layout Grid & Responsive Layout Audit', 'node scripts/tests/ui/test_home_layout.js');
runStep('3-6. Android Hardware Back Button & Matchmaking Cancel', 'node scripts/tests/ui/test_back_navigation.js');
runStep('3-7. Playwright 13-Language Visual UI Overflow Scan', 'node scripts/tests/ui/check_ui_overflow.js');
runStep('3-8. Real Gameplay End-to-End (play, tap, win)', 'node scripts/tests/ui/test_gameplay_e2e.js');
runStep('3-9. Ad Placements End-to-End (banner, purchase)', 'node scripts/tests/ui/test_ads_placements_e2e.js');
runStep('3-10. 1v1 Matchmaking & Rematch End-to-End (two browsers)', 'node scripts/tests/unit/test_rematch_flow.js');
runStep('3-11. Academy Practice Play-Through (64 missions × 13 languages)', 'node scripts/tests/ui/test_academy_practice_play.js');
runStep('3-12. The Game Screen Fits the Phone (sizes × font scale, banner gap)', 'node scripts/tests/ui/test_game_layout_fit.js');
runStep('3-13. Each Academy Card Is As Tall As Its Tallest Tab', 'node scripts/tests/ui/test_academy_card_height.js');

console.log('======================================================');
console.log('🎉 [QA MASTER PIPELINE] 100% PERFECT! ALL TIERS & GATES PASSED.');
console.log('======================================================\n');
