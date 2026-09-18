import React from 'react';
import { GameOverModal } from '../GameOverModal';
import { VictoryModal } from '../VictoryModal';
import { BattleResultModal } from '../BattleResultModal';
import { HintRewardModal } from '../HintRewardModal';
import { DailyRewardModal } from '../DailyRewardModal';
import { NewGameModal } from '../NewGameModal';
import { StoreReviewModal } from './StoreReviewModal';
import { AchievementToast } from './AchievementToast';
import { VictoryPauseOverlay } from './VictoryPauseOverlay';
import { useVictoryAd } from '../../hooks/useVictoryAd';

/**
 * GameModalsContainer
 * Centralized coordinator for all game dialogs and reward modals.
 * Strictly guards game-specific modals so they only appear during active gameplay.
 */
export function GameModalsContainer({
  activeScreen = 'game',

  // Game Over
  isGameOver,
  hasRevived = false,
  onRevive,
  onRestartGame,
  onReturnHome,
  level,

  // Victory
  isVictory,
  gameMode = 'classic',
  timerSeconds,
  mistakes,
  onNextGame,
  onOpenLeaderboard,

  // 1v1 Battle Result
  showBattleResultModal,
  activeBattleRoom,
  isRematchWaiting,
  rematchSecondsLeft,
  isOpponentLeft,
  lastRatingChange,
  onCloseBattleResult,
  onRematchBattle,
  onLeaveBattleToHome,

  // Hint Reward (rewarded ad)
  showHintRewardModal,
  adHintsUsed = 0,
  onCloseHintReward,
  onRewardHintSuccess,

  // Daily Attendance Streak
  dailyRewardInfo,
  onConfirmDailyReward,

  // New Game Level Selector
  showNewGameModal,
  onCloseNewGameModal,
  onSelectNewGameLevel,

  // Store Review Prompt
  showStoreReviewModal,
  onCloseStoreReviewModal,

  // Achievement Celebration Toast
  achievementToast
}) {
  const isGameActive = activeScreen === 'game';

  // The post-game interstitial runs between the win and this victory screen,
  // not behind its buttons. See hooks/useVictoryAd.js for why it moved.
  const showVictory = Boolean(isVictory && isGameActive);
  const victoryPhase = useVictoryAd({ isVictory: showVictory, isGameActive });

  return (
    <>
      {/* 1. Game Over (Single Revive or Restart) - Single Player ONLY */}
      {isGameOver && isGameActive && !activeBattleRoom && (
        <GameOverModal
          hasRevived={hasRevived}
          onRevive={onRevive}
          onRestart={() => onRestartGame(level)}
          onReturnHome={onReturnHome}
        />
      )}

      {/* 2. Victory Celebration */}
      {showVictory && victoryPhase !== 'modal' && <VictoryPauseOverlay />}
      {showVictory && victoryPhase === 'modal' && (
        <VictoryModal
          timerSeconds={timerSeconds}
          gameMode={gameMode}
          mistakes={mistakes}
          level={level}
          onNextGame={() => onNextGame(level)}
          onReturnHome={onReturnHome}
          onOpenLeaderboard={onOpenLeaderboard}
        />
      )}

      {/* 3. 1v1 Battle Result */}
      {showBattleResultModal && activeBattleRoom && isGameActive && (
        <BattleResultModal
          room={activeBattleRoom}
          isRematchWaiting={isRematchWaiting}
          rematchSecondsLeft={rematchSecondsLeft}
          isOpponentLeft={isOpponentLeft}
          lastRatingChange={lastRatingChange}
          onClose={onCloseBattleResult}
          onRematch={onRematchBattle}
          onReturnHome={onLeaveBattleToHome}
        />
      )}

      {/* 4. Strategic Hint Replenishment (Rewarded Video Ad) */}
      <HintRewardModal
        isOpen={showHintRewardModal && isGameActive}
        onClose={onCloseHintReward}
        onRewardSuccess={onRewardHintSuccess}
        adHintsUsed={adHintsUsed}
      />

      {/* 5. Daily Login Attendance Streak Reward */}
      <DailyRewardModal
        rewardInfo={dailyRewardInfo}
        onConfirm={onConfirmDailyReward}
      />

      {/* 6. New Game Level Selector */}
      <NewGameModal
        isOpen={showNewGameModal && isGameActive}
        currentLevel={level}
        onClose={onCloseNewGameModal}
        onStartGame={onSelectNewGameLevel}
      />

      {/* 7. Dopamine-timed Store 5-Star Review Prompt */}
      <StoreReviewModal
        isOpen={showStoreReviewModal}
        onClose={onCloseStoreReviewModal}
      />

      {/* 8. Global Achievement Unlock Celebratory Toast */}
      <AchievementToast achievement={achievementToast} />
    </>
  );
}
