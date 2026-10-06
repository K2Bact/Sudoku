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
import { recordKillerWin } from './killerStats.js';

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

  // A killer keeps its own record and nothing else (user decision 2026-10-01):
  // the ghost, the daily mission, the achievements and the Logic Score on the
  // leaderboard are all measured on classic puzzles, and a killer's times would
  // not compare with them.
  if (variant === 'killer') {
    recordKillerWin(level, timerSeconds, { countsAsRecord: eligibility.counts });
    backUpToCloud();
    return;
  }

  recordGameWin(level, timerSeconds, gameMode, {
    isFlawless: mistakes === 0,
    comboCount,
    hintsUsed,
    countsAsRecord: eligibility.counts
  });

  // Ghost & Delta Time PB — the same rule as the best times above
  recordGhostRun(gameMode, level, {
    timeSeconds: timerSeconds,
    hintsUsed,
    countsAsRecord: eligibility.counts,
    puzzle: initialBoard,
    solution: solutionBoard,
    totalEmptyCells,
    timeline
  });

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
  // here, before anything is shown.
  checkAndUnlockAchievements({
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

  // Google Play Games Real-Time Leaderboard Submission
  try {
    const updatedStats = loadStats();
    const currentIQ = iqStatsService.calculateBrainIQ(updatedStats);
    playGamesService.submitBrainIQ(currentIQ);
    playGamesService.submitScore(gameMode, level, timerSeconds);
  } catch (e) {
    // 리더보드 제출이 실패해도 게임 완료 처리는 계속돼야 한다 — 클라우드가
    // 안 된다고 플레이어의 승리 기록까지 잃을 수는 없다. 다만 조용히 넘어가면
    // 제출이 영원히 실패해도 아무도 모른다.
    console.warn('[GameCompletion] Play Games submission failed:', e?.message || e);
  }

  // Moved here from VictoryModal for the same reason as the grade.
  backUpToCloud();
}
