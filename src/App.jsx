import React, { useState } from 'react';
import { AppScreenRouter } from './components/screens/AppScreenRouter';
import { GameModalsContainer } from './components/modals/GameModalsContainer';
import { RematchToastBanner } from './components/battle/RematchToastBanner';
import { ReplayHost } from './components/replay/ReplayHost';
import { soundHaptic } from './utils/soundHaptic';
import { battleService } from './firebase/battleService';
import { aiBotService } from './engine/aiBotService';
import { loadSettings, saveSettings } from './utils/storage';
import { useSudokuGame } from './hooks/useSudokuGame';
import { useBackStack } from './hooks/useBackStack';
import { useThemeManager } from './hooks/useThemeManager';
import { useAppModals } from './hooks/useAppModals';
import { useBattleMultiplayer } from './hooks/useBattleMultiplayer';
import { useGameProps } from './hooks/useGameProps';
import { useCloudAutoSync } from './hooks/useCloudAutoSync';
import { useGameStarters } from './hooks/useGameStarters';
import { useTranslation } from './i18n/i18nContext';
import './App.css';

export function App() {
  const { t } = useTranslation();

  const [activeScreen, setActiveScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [homeSelectedMode, setHomeSelectedMode] = useState('classic');
  const [statsInitialTab, setStatsInitialTab] = useState('stats');
  const [activeDailyDateKey, setActiveDailyDateKey] = useState(null);
  const [isGuidedTutorial, setIsGuidedTutorial] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [adRefreshTrigger, setAdRefreshTrigger] = useState(0);

  const {
    theme,
    setTheme,
    themeToastText,
    soundEnabled,
    setSoundEnabled,
    cycleTheme,
    showToast
  } = useThemeManager();

  const {
    activeBattleRoom,
    setActiveBattleRoom,
    showBattleResultModal,
    incomingRematchRequest,
    isRematchWaiting,
    rematchSecondsLeft,
    isOpponentLeft,
    isMatchSearching,
    matchTimedOut,
    matchUnavailable,
    startAIFallback,
    lastRatingChange,
    handleStartQuickMatch,
    handleCancelQuickMatch,
    handleRequestRematch,
    handleAcceptRematch,
    handleDeclineRematch,
    cleanupBattleSession,
    handleCloseBattleResult
  } = useBattleMultiplayer({ showToast, startNewGame: (...args) => game.startNewGame(...args), setActiveScreen, t });

  useCloudAutoSync();
  const game = useSudokuGame(activeScreen, activeBattleRoom, activeDailyDateKey, showToast);
  const {
    level, gameMode, variant, mistakes, setMistakes, hintsUsedCount,
    hasRevived, setHasRevived, timerSeconds, setTimerSeconds,
    isGameOver, setIsGameOver, isVictory,
    startNewGame, resumeSavedGame, handleRewardHint
  } = game;

  const {
    dailyRewardInfo, setDailyRewardInfo,
    showNewGameModal, setShowNewGameModal,
    showStoreReviewModal, setShowStoreReviewModal,
    achievementToast
  } = useAppModals(isVictory);

  useBackStack({
    activeScreen, previousScreen, setActiveScreen,
    isMatchSearching, onCancelQuickMatch: handleCancelQuickMatch,
    showBattleResultModal, onCloseBattleResult: handleCloseBattleResult,
    showHintRewardModal: game.showHintRewardModal,
    setShowHintRewardModal: game.setShowHintRewardModal,
    showNewGameModal, setShowNewGameModal,
    showStoreReviewModal, setShowStoreReviewModal,
    dailyRewardInfo, setDailyRewardInfo,
    isGuidedTutorial, setIsGuidedTutorial,
    activeBattleRoom, battleService, aiBotService,
    showExitToast: (msg) => showToast(msg, 2000), t
  });

  const {
    confirmAbandon, navigateToScreen, handleStartSingleGame,
    handleStartDailyPuzzle, handleStartDailyMission, startLiveGuidedTutorial
  } = useGameStarters({
    t, activeScreen, setActiveScreen, setPreviousScreen, cleanupBattleSession,
    setHomeSelectedMode, setActiveDailyDateKey, setIsGuidedTutorial, setGuidedStep,
    startNewGame, resumeSavedGame
  });

  const handleReturnHome = () => {
    try {
      soundHaptic.playSelectSound();
      setIsGameOver(false);
      setShowNewGameModal(false);
      cleanupBattleSession();
      if (['classic', 'timeAttack', 'timeLimit'].includes(gameMode)) {
        setHomeSelectedMode(gameMode);
      }
      setActiveDailyDateKey(null);
      setIsGuidedTutorial(false);
    } finally {
      setActiveScreen('home');
    }
  };

  const gameProps = useGameProps(game, {
    activeBattleRoom,
    setActiveBattleRoom,
    setActiveScreen,
    setShowNewGameModal,
    navigateToScreen,
    theme,
    cycleTheme,
    soundEnabled,
    setSoundEnabled,
    isGuidedTutorial,
    guidedStep,
    setGuidedStep,
    setIsGuidedTutorial,
    adRefreshTrigger,
    onReturnHome: handleReturnHome
  });

  return (
    <div className="app-viewport">
      {themeToastText && <div className="theme-toast-banner">{themeToastText}</div>}

      {/* Top Sliding Rematch Notification Toast */}
      {incomingRematchRequest && (
        <RematchToastBanner
          requesterName={incomingRematchRequest.requesterName}
          onAccept={handleAcceptRematch}
          onDecline={handleDeclineRematch}
        />
      )}

      <AppScreenRouter
        activeScreen={activeScreen}
        previousScreen={previousScreen}
        setActiveScreen={setActiveScreen}
        navigateToScreen={navigateToScreen}
        handleStartSingleGame={handleStartSingleGame}
        theme={theme}
        cycleTheme={cycleTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        startLiveGuidedTutorial={startLiveGuidedTutorial}
        startNewGame={startNewGame}
        handleStartDailyPuzzle={handleStartDailyPuzzle}
        handleStartDailyMission={handleStartDailyMission}
        setActiveBattleRoom={setActiveBattleRoom}
        onStartQuickMatch={handleStartQuickMatch}
        isMatchSearching={isMatchSearching}
        matchTimedOut={matchTimedOut}
        matchUnavailable={matchUnavailable}
        onPlayAiInstead={startAIFallback}
        onCancelQuickMatch={handleCancelQuickMatch}
        setAdRefreshTrigger={setAdRefreshTrigger}
        setTheme={setTheme}
        saveSettings={saveSettings}
        loadSettings={loadSettings}
        gameProps={gameProps}
        homeSelectedMode={homeSelectedMode}
        setHomeSelectedMode={setHomeSelectedMode}
        statsInitialTab={statsInitialTab}
      />

      <GameModalsContainer
        activeScreen={activeScreen}
        isGameOver={isGameOver}
        hasRevived={hasRevived}
        onRevive={() => {
          setHasRevived(true);
          setMistakes(2);
          if (gameMode === 'timeLimit') setTimerSeconds(prev => Math.max(prev, 60));
          setIsGameOver(false);
        }}
        onRestartGame={startNewGame}
        onReturnHome={handleReturnHome}
        level={level}
        gameMode={gameMode}
        variant={variant}
        isVictory={isVictory}
        timerSeconds={timerSeconds}
        mistakes={mistakes}
        hintsUsed={hintsUsedCount}
        onNextGame={startNewGame}
        onOpenLeaderboard={() => {
          setStatsInitialTab('stats');
          game.setIsVictory(false);
          navigateToScreen('stats');
        }}
        showBattleResultModal={showBattleResultModal}
        activeBattleRoom={activeBattleRoom}
        isRematchWaiting={isRematchWaiting}
        rematchSecondsLeft={rematchSecondsLeft}
        isOpponentLeft={isOpponentLeft}
        lastRatingChange={lastRatingChange}
        onCloseBattleResult={handleCloseBattleResult}
        onRematchBattle={handleRequestRematch}
        onLeaveBattleToHome={handleReturnHome}
        showHintRewardModal={game.showHintRewardModal}
        adHintsUsed={game.adHintsUsedThisGame}
        onCloseHintReward={() => game.setShowHintRewardModal(false)}
        onRewardHintSuccess={handleRewardHint}
        dailyRewardInfo={dailyRewardInfo}
        onConfirmDailyReward={() => setDailyRewardInfo(null)}
        showNewGameModal={showNewGameModal}
        onCloseNewGameModal={() => setShowNewGameModal(false)}
        onSelectNewGameLevel={async (lvl) => {
          setShowNewGameModal(false);
          if (await confirmAbandon()) startNewGame(lvl);
        }}
        showStoreReviewModal={showStoreReviewModal}
        onCloseStoreReviewModal={() => setShowStoreReviewModal(false)}
        achievementToast={achievementToast}
      />

      {/* A 1v1 replay, over whatever is showing (replayViewer.js). */}
      <ReplayHost matchLive={activeBattleRoom?.status === 'playing'} />
    </div>
  );
}

export default App;
