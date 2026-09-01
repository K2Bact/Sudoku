import React, { useState } from 'react';
import { AppScreenRouter } from './components/screens/AppScreenRouter';
import { GameModalsContainer } from './components/modals/GameModalsContainer';
import { RematchToastBanner } from './components/battle/RematchToastBanner';
import { soundHaptic } from './utils/soundHaptic';
import { getDailyPuzzle } from './utils/dailyChallenge';
import { getGhostForModeLevel } from './utils/ghostManager';
import { battleService } from './firebase/battleService';
import { aiBotService } from './engine/aiBotService';
import { loadSettings, saveSettings } from './utils/storage';
import { useSudokuGame } from './hooks/useSudokuGame';
import { useBackStack } from './hooks/useBackStack';
import { useThemeManager } from './hooks/useThemeManager';
import { useAppModals } from './hooks/useAppModals';
import { useBattleMultiplayer } from './hooks/useBattleMultiplayer';
import { useGameProps } from './hooks/useGameProps';
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
    handleStartQuickMatch,
    handleCancelQuickMatch,
    handleRequestRematch,
    handleAcceptRematch,
    handleDeclineRematch,
    cleanupBattleSession,
    handleCloseBattleResult
  } = useBattleMultiplayer({ showToast, startNewGame: (...args) => game.startNewGame(...args), setActiveScreen, t });

  const game = useSudokuGame(activeScreen, activeBattleRoom, activeDailyDateKey, showToast);
  const {
    level, gameMode, mistakes, setMistakes,
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
    showBattleResultModal, setShowBattleResultModal: () => {},
    showHintRewardModal: game.showHintRewardModal,
    setShowHintRewardModal: game.setShowHintRewardModal,
    showNewGameModal, setShowNewGameModal,
    showStoreReviewModal, setShowStoreReviewModal,
    dailyRewardInfo, setDailyRewardInfo,
    isGuidedTutorial, setIsGuidedTutorial,
    activeBattleRoom, battleService, aiBotService,
    showExitToast: (msg) => showToast(msg, 2000), t
  });

  const navigateToScreen = (screenName) => {
    soundHaptic.playSelectSound();
    setPreviousScreen(activeScreen);
    if (screenName !== 'game') cleanupBattleSession();
    setActiveScreen(screenName);
  };

  const handleStartSingleGame = (selectedLevel, isResume = false, mode = 'classic', rivalMode = 'standard') => {
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setHomeSelectedMode(mode);
    setActiveDailyDateKey(null);
    setIsGuidedTutorial(false);

    if (isResume && resumeSavedGame(selectedLevel)) {
      setActiveScreen('game');
      return;
    }

    if (rivalMode === 'ghost') {
      const ghost = getGhostForModeLevel(mode, selectedLevel);
      if (ghost && (ghost.puzzle || ghost.board)) {
        startNewGame(selectedLevel, mode, {
          board: ghost.puzzle || ghost.board,
          solution: ghost.solution,
          seed: ghost.seed,
          rivalMode: 'ghost',
          ghostRecord: ghost
        });
        setActiveScreen('game');
        return;
      }
    }

    const ghost = (rivalMode === 'delta' || rivalMode === 'ghost') ? getGhostForModeLevel(mode, selectedLevel) : null;
    startNewGame(selectedLevel, mode, ghost ? { rivalMode, ghostRecord: ghost } : null);
    setActiveScreen('game');
  };

  const handleStartDailyPuzzle = (dateKey) => {
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setActiveDailyDateKey(dateKey);
    setIsGuidedTutorial(false);
    const dailyData = getDailyPuzzle(dateKey);
    startNewGame(dailyData.level, 'classic', dailyData);
    setActiveScreen('game');
  };

  const handleStartDailyMission = (mission) => {
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setActiveDailyDateKey(mission.dateKey);
    setIsGuidedTutorial(false);

    if (mission.actionType === 'open_battle') {
      setActiveScreen('battleLobby');
    } else if (mission.actionType === 'play_speedrun') {
      setHomeSelectedMode('timeAttack');
      const dailyData = getDailyPuzzle(mission.dateKey);
      startNewGame(mission.actionLevel || 3, 'timeAttack', dailyData);
      setActiveScreen('game');
    } else {
      const dailyData = getDailyPuzzle(mission.dateKey);
      startNewGame(mission.actionLevel || mission.minLevel || 3, 'classic', dailyData);
      setActiveScreen('game');
    }
  };

  const startLiveGuidedTutorial = () => {
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setIsGuidedTutorial(true);
    setGuidedStep(0);
    startNewGame(1, 'classic');
    setActiveScreen('game');
  };

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
        isVictory={isVictory}
        timerSeconds={timerSeconds}
        mistakes={mistakes}
        onNextGame={startNewGame}
        onOpenLeaderboard={() => {
          setStatsInitialTab('leaderboard');
          game.setIsVictory(false);
          navigateToScreen('stats');
        }}
        showBattleResultModal={showBattleResultModal}
        activeBattleRoom={activeBattleRoom}
        isRematchWaiting={isRematchWaiting}
        rematchSecondsLeft={rematchSecondsLeft}
        isOpponentLeft={isOpponentLeft}
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
        onSelectNewGameLevel={(lvl) => { setShowNewGameModal(false); startNewGame(lvl); }}
        showStoreReviewModal={showStoreReviewModal}
        onCloseStoreReviewModal={() => setShowStoreReviewModal(false)}
        achievementToast={achievementToast}
      />
    </div>
  );
}

export default App;
