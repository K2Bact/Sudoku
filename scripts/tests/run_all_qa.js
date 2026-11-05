import { execSync } from 'child_process';
import fs from 'fs';

/*
 * Two runs, not one (2026-09-30, after measuring every step).
 *
 *   npm run qa:quick   every change — about 75 seconds (measured 2026-09-30)
 *   npm run qa         before an AAB, and after touching layout, CSS or a gate — ~10 min
 *
 * The full run took 18 minutes and 93% of it was Tier 3: browser gates that
 * start a preview server and tap through screens in 13 languages. Every logic,
 * data, translation and static check — Tiers 0 to 2, 37 of them — took 35
 * seconds together. Quick runs all of those, the build, the static Tier 3
 * checks, and one real play-through (3-8), and skips the other browser sweeps.
 * It says so at the end: a quick pass is not a release check.
 */
const QUICK = process.argv.includes('--quick');
const QUICK_TIER3 = new Set(['3-0', '3-0b', '3-1', '3-2', '3-3', '3-8']);
const skipped = [];

/*
 * Every step says when it started and how long it took, and the run ends with
 * the slowest steps and a TSV under test_output/qa_runs/ (git-ignored). Until
 * 2026-09-30 there was no timing at all, and "QA takes tens of minutes" could
 * only be answered by timing every step by hand — which showed one gate was 61%.
 * The TSVs let the next "why is it slow" be read, not re-measured.
 */
const RUN_START = new Date();
const times = [];
const clock = (d = new Date()) => d.toTimeString().slice(0, 8);
const secs = (ms) => `${(ms / 1000).toFixed(1)}s`;

function summary(outcome) {
  const total = Date.now() - RUN_START.getTime();
  const slowest = [...times].sort((a, b) => b.ms - a.ms).slice(0, 8);
  console.log(`⏱  ${clock(RUN_START)} → ${clock()} · ${times.length} step(s) · ${secs(total)}`);
  slowest.forEach((t) => console.log(`     ${secs(t.ms).padStart(7)}  ${t.name}`));
  try {
    const p = (n) => String(n).padStart(2, '0');
    const d = RUN_START;
    const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; // local, like the console
    fs.mkdirSync('test_output/qa_runs', { recursive: true });
    fs.writeFileSync(`test_output/qa_runs/qa-${stamp}${QUICK ? '-quick' : ''}.tsv`,
      ['start\tseconds\tresult\tstep', ...times.map((t) => `${t.start}\t${(t.ms / 1000).toFixed(1)}\t${t.result}\t${t.name}`),
        `total\t${(total / 1000).toFixed(1)}\t${outcome}\t`].join('\n') + '\n');
  } catch { /* the log is a convenience; the run's verdict does not depend on it */ }
}

console.log('======================================================');
console.log(`🚀 [QA MASTER PIPELINE] Running Unified 3-Tier Audit${QUICK ? ' — QUICK (browser sweeps skipped)' : ''}... (${clock(RUN_START)})`);
console.log('======================================================\n');

function runStep(name, cmd) {
  const id = name.split('. ')[0];
  if (QUICK && id.startsWith('3-') && !QUICK_TIER3.has(id)) {
    skipped.push(id);
    console.log(`⏭  STEP: ${name} — skipped in quick mode\n`);
    return true;
  }
  const start = new Date();
  console.log(`▶️ STEP: ${name}   [${clock(start)}]`);
  try {
    execSync(cmd, { stdio: 'inherit', encoding: 'utf8' });
    const ms = Date.now() - start.getTime();
    times.push({ name, ms, start: clock(start), result: 'pass' });
    console.log(`✅ ${name} PASSED! (${secs(ms)})\n`);
    return true;
  } catch (err) {
    const ms = Date.now() - start.getTime();
    times.push({ name, ms, start: clock(start), result: 'FAIL' });
    console.error(`\n❌ ${name} FAILED! (${secs(ms)})\n`);
    summary('FAIL');
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// [TIER 0] Code Quality & Static Analysis
// -----------------------------------------------------------------------------
runStep('0-1. File Size & Responsibility Separation', 'node scripts/tests/unit/test_file_responsibility.js');

runStep('0-2. ESLint Static Analysis (files parse, React hook rules, undefined names)', 'npx eslint .');
runStep('0-3. Node ESM Import Extension Compliance', 'node scripts/tests/unit/test_esm_import_extensions.js');
runStep('0-4. No Committed Secrets or Signing Material', 'node scripts/tests/unit/test_no_committed_secrets.js');
runStep('0-4b. The Secrets Gate Catches Planted Material', 'node scripts/tests/unit/test_secrets_gate_catches_bait.js');
runStep('0-5. Firebase Config Reaches the Build (keys set; not a live connection)', 'node scripts/tests/unit/test_firebase_config_present.js');
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
runStep('2-4. Hint Wallet (a count of hints, no coins), Smart Hint & Daily Attendance', 'node scripts/tests/unit/test_wallet_and_hint_engine.js');
runStep('2-5. Academy Interactive Missions Math & Logic Truth (classic and killer)', 'node scripts/tests/unit/test_practice_missions.js');
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
runStep('2-23. The Win Screen Does Not Ask For A Full-Screen Canvas', 'node scripts/tests/unit/test_victory_effects.js');
runStep('2-24. A Level Has One Name (buttons, missions, achievements, store)', 'node scripts/tests/unit/test_level_names.js');
runStep('2-25. Language Picker Order (System, device language, then A-Z by English name)', 'node scripts/tests/unit/test_language_order.js');
runStep('2-26. 1v1 Replays (recorded, stored, exchanged only by agreement)', 'node scripts/tests/unit/test_match_replay.js');
runStep('2-27. Killer Sudoku Puzzles Are Sound (cages, sums, one solution, levels)', 'node scripts/tests/unit/test_killer_engine.js');
runStep('2-28. A Killer Game Plays And Counts As A Killer (notes, mistakes, records, merge)', 'node scripts/tests/unit/test_killer_play.js');
runStep('2-29. Signed Latin Tokens In RTL Text Are Isolated (+10, S+, Lv.4+ drawn as written)', 'node scripts/tests/unit/test_rtl_signed_tokens.js');
runStep('2-30. Every Achievement Can Be Earned, And Only By Doing What It Says', 'node scripts/tests/unit/test_achievements.js');
runStep('2-31. A Win Pays The Mission On Its Card (the 15th win, both kinds, level and Speedrun missions)', 'node scripts/tests/unit/test_daily_mission_win.js');
runStep('2-32. The Back Key Closes The Newest Open Window (the list, out-of-order removal, a rewarded ad holding back)', 'node scripts/tests/unit/test_back_layers.js');

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
runStep('3-0b. Firebase Config Is Inside The Bundle Just Built', 'node scripts/tests/unit/test_firebase_config_present.js --built');

runStep('3-1. Forbidden Hardcoded Text Scanner in Source Code', 'node scripts/tests/ui/check_no_hardcoded_text.js');
runStep('3-2. Android Manifest: No Dangerous Permission (app + merged) & Insets Contract', 'node scripts/tests/ui/test_android_manifest.js');
runStep('3-3. Modal Layout Regressions (grid gaps, phantom classes, leaderboard placement)', 'node scripts/tests/ui/test_modal_box_borders.js');
runStep('3-4. Theme Contrast & Button State Visibility Audit', 'node scripts/tests/ui/test_theme_and_button_contrast.js');
runStep('3-5. Home Layout Grid & Responsive Layout Audit', 'node scripts/tests/ui/test_home_layout.js');
runStep('3-6. Android Hardware Back Button & Matchmaking Cancel', 'node scripts/tests/ui/test_back_navigation.js');
runStep('3-7. Playwright 13-Language Visual UI Overflow Scan', 'node scripts/tests/ui/check_ui_overflow.js');
runStep('3-8. Real Gameplay End-to-End (play, tap, win)', 'node scripts/tests/ui/test_gameplay_e2e.js');
runStep('3-9. Ad Placements End-to-End (banner, purchase)', 'node scripts/tests/ui/test_ads_placements_e2e.js');
runStep('3-10. 1v1 Matchmaking & Rematch End-to-End (two browsers)', 'node scripts/tests/unit/test_rematch_flow.js');
runStep('3-11. Academy Practice Play-Through (every mission in ko and ar, each layout and stage in the other 11 languages)', 'node scripts/tests/ui/test_academy_practice_play.js');
runStep('3-12. The Game Screen Fits the Phone (sizes × font scale × ghost race, banner gap)', 'node scripts/tests/ui/test_game_layout_fit.js');
runStep('3-13. Each Academy Card Is As Tall As Its Tallest Tab', 'node scripts/tests/ui/test_academy_card_height.js');
runStep('3-14. The 1v1 Lobby Says When It Cannot Connect (blocked sign-in, 13 languages)', 'node scripts/tests/ui/test_battle_connect_failure.js');
runStep('3-15. The App Starts When The Network Does Not Answer (no startup requests, fonts bundled)', 'node scripts/tests/ui/test_offline_start.js');
runStep('3-16. The Game Header Fits (13 languages × every kind and mode, and the AI battle header × 360/320px × font 1/1.3)', 'node scripts/tests/ui/test_game_header_fit.js');
runStep('3-17. The 1v1 Replay Screen (opens, ends on its moves, says why, fits; 13 languages)', 'node scripts/tests/ui/test_match_replay_screen.js');
runStep('3-18. A Killer Game On The Screen (home switch, cages drawn, killer record only; 13 languages)', 'node scripts/tests/ui/test_killer_screens.js');
runStep('3-19. A Game Started From Inside A Game Keeps Its Mode And Leaves The Daily (restart, next, level picker)', 'node scripts/tests/ui/test_follow_up_game.js');
runStep('3-20. The Last Move Writes What The Screen Shows (a hint on the last cell or with the pencil on, a resumed daily, a final Speedrun combo, a clock that stops at 1 s)', 'node scripts/tests/ui/test_hints_and_last_moves.js');
runStep('3-21. Attendance Is Paid On Home, Not Only At Start (back to the front on Home, not in a game, once a day)', 'node scripts/tests/ui/test_attendance_return.js');

console.log('======================================================');
summary('pass');
if (QUICK) {
  console.log(`✅ [QA QUICK] Every step it ran passed — ${skipped.length} browser sweep(s) skipped: ${skipped.join(', ')}`);
  console.log('   This is not a release check. Run `npm run qa` before building an AAB.');
} else {
  console.log('🎉 [QA MASTER PIPELINE] 100% PERFECT! ALL TIERS & GATES PASSED.');
}
console.log('======================================================\n');
