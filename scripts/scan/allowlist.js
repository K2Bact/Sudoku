/**
 * allowlist.js
 * Things the scan would flag that are fine, each with the reason it is fine.
 *
 * The reason is not decoration. A bare list of names rots into "whatever was
 * noisy that week", and once a scan cries wolf people stop reading it — which
 * is exactly how the hardcoded-text gate came to report "0 hardcoded strings"
 * while four English literals shipped to thirteen locales. An entry nobody can
 * justify in one line should be deleted from here and fixed in the code.
 *
 * Add an entry ONLY when the finding is genuinely not a defect. Never add one
 * to quiet a finding you have not understood yet.
 */

export const ALLOW = {
  /**
   * Exported symbols with no consumer outside their own file.
   *
   * Two honest reasons appear below and nothing else should join them:
   *   - a module's own vocabulary, exported so its tests can reach it
   *   - a storage module's write half, where only the read half has callers yet
   * Anything that cannot be described in one line belongs in the report, not here.
   */
  unusedExports: [
    { name: 'default', reason: 'default re-exports mirror a named export the app already uses' },

    // Engine internals the maths gate exercises directly. Deleting the exports
    // would make the engine untestable in exchange for a quieter report.
    { name: 'isValidPlacement', reason: 'SudokuEngine internal; gate 2-1 tests it directly' },
    { name: 'createPRNG', reason: 'SudokuEngine internal; gate 2-2 tests determinism through it' },
    { name: 'shuffle', reason: 'SudokuEngine internal; used by generation, asserted by gate 2-1' },
    { name: 'countSolutions', reason: 'SudokuEngine internal; uniqueness proof in gate 2-1' },
    { name: 'generateFullSolution', reason: 'SudokuEngine internal; gate 2-1 builds boards with it' },
    { name: 'AIBotService', reason: 'the class behind the aiBotService singleton the app imports' },
    { name: 'createAdProvider', reason: 'the ads seam, exercised by gate 2-10 without module state' },
    { name: 'getAcademyText', reason: 'used by the academy translation generator in scripts/' },
    { name: 'ALL_PRACTICE_MISSIONS', reason: 'the mission corpus gate 2-5 validates' },

    // Write halves whose read halves are live. Storage modules are read far more
    // often than written, and a save function with no current caller is a gap in
    // usage, not dead code — deleting it removes the ability to persist at all.
    { name: 'saveWallet', reason: 'wallet write half; loadWallet is used throughout' },
    { name: 'saveBattleProfile', reason: 'MMR write half; applyBattleResult persists through it' },
    { name: 'saveGhostRecords', reason: 'ghost write half; loadGhostRecords pairs with it' },
    { name: 'loadGhostRecords', reason: 'ghost read half, used inside ghostManager' },

    // Identifier tables the module itself indexes into.
    { name: 'BATTLE_PROFILE_KEY', reason: 'storage key, used inside battleRating' },
    { name: 'LEADERBOARD_IDS', reason: 'Play Games id table, indexed inside playGamesService' },
    { name: 'ACHIEVEMENT_IDS', reason: 'Play Games id table, indexed inside playGamesService' },
    { name: 'subscribePlayGames', reason: 'bridge subscription API, kept beside initPlayGamesListener' },
    { name: 'getPlayGamesProfile', reason: 'bridge read API, kept beside initPlayGamesListener' }
  ],

  /** Keys present in every locale that no component reads. */
  orphanI18nKeys: [],

  /** Values a hook returns that nothing destructures. */
  unreadHookValues: [],

  /**
   * Placeholders deliberately left in the string because the caller fills them
   * somewhere the scan cannot see. There should be almost none of these.
   */
  unresolvedPlaceholders: [],

  /** Props passed to a component that it does not declare. */
  propMismatches: [
    { name: 'children', reason: 'React passes children implicitly; components need not declare it' },
    { name: 'key', reason: 'React list identity, never reaches the component' },
    { name: 'ref', reason: 'forwarded by React, not a normal prop' },
    { name: 'className', reason: 'commonly spread onto a root element' },
    { name: 'style', reason: 'commonly spread onto a root element' }
  ]
};

export function isAllowed(kind, name) {
  return (ALLOW[kind] || []).some((e) => e.name === name);
}

export function reasonFor(kind, name) {
  const hit = (ALLOW[kind] || []).find((e) => e.name === name);
  return hit ? hit.reason : null;
}
