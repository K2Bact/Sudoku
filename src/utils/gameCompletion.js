import { recordGameWin, loadStats, loadSettings } from './storage.js';
import { recordEligibility } from './recordEligibility.js';
import { recordDailyCompletion, getDailyMission, getTodayDateKey, loadDailyRecords } from './dailyChallenge.js';
import { loadWallet, addHints } from './wallet.js';
import { recordGhostRun } from './ghostManager.js';
import { checkAndUnlockAchievements } from './achievementManager.js';
import { iqStatsService } from '../services/iqStatsService.js';
import { playGamesService } from '../services/playGamesService.js';
import { cloudSyncService } from '../services/cloudSyncService.js';
import { speedrunRankFor } from './speedrunRank.js';

// Cloud backup last, after everything has been written locally, so the upload
// carries this win. Not awaited: the victory sequence must not wait on the network.
function backUpToCloud() {
  Promise.resolve()
    .then(() => cloudSyncService.saveToCloud())
    .catch((e) => console.warn('[GameCompletion] cloud save failed:', e?.message || e));
}

export function handleGameWinLogic({
  level,
  timerSeconds,
  gameMode,
  variant = 'classic',
  mistakes,
  activeDailyDateKey,
  clearGameState,
  setIsVictory,
  setHintsRemaining,
  hintsUsed = 0,
  notesUsedCount = 0,
  usedFastEntryThisGame = false,
  comboCount = 0,
  survivalRemainingSeconds = 0,
  initialBoard = null,
  solutionBoard = null,
  totalEmptyCells = 40,
  timeline = []
}) {
  setIsVictory(true);
  clearGameState();
  const eligibility = recordEligibility({
    gameMode,
    hintsUsed,
    limitMistakes: loadSettings().limitMistakes ?? true,
    mistakes
  });

  // One win, one path, whatever the puzzle: the kind only chooses which record
  // is written (storage.js recordOf). The two kinds differ in the puzzle alone
  // (user, 2026-10-07); this replaces the killer branch of 2026-10-01 that kept
  // its own short record and skipped everything below.
  //
  // Two steps below still pass a killer by, each until its killer half exists
  // (BACKLOG, killer order ③-④): the achievements are counted on the classic
  // record, and the ghost table has no kind in its key — a killer run there would
  // race classic players. They are guarded by name, not by an early return, so
  // nothing new added to this path can miss a killer by accident.
  const isKiller = variant === 'killer';

  recordGameWin(level, timerSeconds, gameMode, {
    isFlawless: mistakes === 0,
    comboCount,
    hintsUsed,
    countsAsRecord: eligibility.counts
  }, variant);

  // Ghost & Delta Time PB — the same rule as the best times above. ④ for killer.
  if (!isKiller) recordGhostRun(gameMode, level, {
    timeSeconds: timerSeconds,
    hintsUsed,
    countsAsRecord: eligibility.counts,
    puzzle: initialBoard,
    solution: solutionBoard,
    totalEmptyCells,
    timeline
  });

  // The daily mission counts a win of either kind.
  if (activeDailyDateKey) {
    recordDailyCompletion(activeDailyDateKey, timerSeconds, mistakes);
    addHints(1, 'daily_challenge');
    setHintsRemaining(loadWallet().hints);
  } else {
    const todayKey = getTodayDateKey();
    const dailyRecords = loadDailyRecords();
    const mission = getDailyMission(todayKey);

    let missionPassed = false;
    if (mission.type === 'level_clear' && level >= mission.minLevel) {
      missionPassed = true;
    } else if (mission.type === 'speedrun' && gameMode === 'timeAttack') {
      missionPassed = true;
    } else if (mission.type === 'expert_clear' && level >= 5) {
      missionPassed = true;
    }

    if (missionPassed && !dailyRecords[todayKey]?.completed) {
      recordDailyCompletion(todayKey, timerSeconds, mistakes);
      addHints(1, 'daily_mission');
      setHintsRemaining(loadWallet().hints);
    }
  }

  // 30 Core Achievements Autonomous Check & Unlock — the clear grade included.
  // The S+ unlock used to run from VictoryModal's mount; the modal now comes
  // after the post-game interstitial, so everything the win earns is recorded
  // here, before anything is shown. ③ for killer (D11).
  if (!isKiller) checkAndUnlockAchievements({
    rank: speedrunRankFor(level, gameMode, timerSeconds).rank,
    level,
    timerSeconds,
    gameMode,
    mistakes,
    isFlawless: mistakes === 0,
    isDaily: Boolean(activeDailyDateKey),
    hintsUsed,
    notesUsedCount,
    usedFastEntryThisGame,
    comboCount,
    survivalRemainingSeconds
  });

  // Google Play Games Real-Time Leaderboard Submission. The Logic Score counts
  // both kinds (user, 2026-10-08: one app, one score), so a killer win sends it
  // too. Per-level time boards would be classic times; they stay classic-only
  // until such boards exist and say which kind they rank (BACKLOG D3).
  {
    try {
      const updatedStats = loadStats();
      const currentIQ = iqStatsService.calculateBrainIQ(updatedStats);
      playGamesService.submitBrainIQ(currentIQ);
      if (!isKiller) playGamesService.submitScore(gameMode, level, timerSeconds);
    } catch (e) {
      // 리더보드 제출이 실패해도 게임 완료 처리는 계속돼야 한다 — 클라우드가
      // 안 된다고 플레이어의 승리 기록까지 잃을 수는 없다. 다만 조용히 넘어가면
      // 제출이 영원히 실패해도 아무도 모른다.
      console.warn('[GameCompletion] Play Games submission failed:', e?.message || e);
    }
  }

  // Moved here from VictoryModal for the same reason as the grade.
  backUpToCloud();
}
