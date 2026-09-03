import { recordGameWin, loadStats } from './storage.js';
import { recordDailyCompletion, getDailyMission, getTodayDateKey, loadDailyRecords } from './dailyChallenge.js';
import { loadWallet, addHints } from './wallet.js';
import { recordGhostRun } from './ghostManager.js';
import { checkAndUnlockAchievements } from './achievementManager.js';
import { iqStatsService } from '../services/iqStatsService.js';
import { playGamesService } from '../services/playGamesService.js';

export function handleGameWinLogic({
  level,
  timerSeconds,
  gameMode,
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
  recordGameWin(level, timerSeconds, gameMode, {
    isFlawless: mistakes === 0,
    comboCount
  });

  // Record Ghost & Delta Time PB (strictly requires 0 hints used)
  recordGhostRun(gameMode, level, {
    timeSeconds: timerSeconds,
    hintsUsed,
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

  // 30 Core Achievements Autonomous Check & Unlock
  checkAndUnlockAchievements({
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
}
