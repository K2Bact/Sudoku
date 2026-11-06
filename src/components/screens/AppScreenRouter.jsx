import React from 'react';
import { HomeScreen } from '../HomeScreen';
import { AcademyScreen } from '../AcademyScreen';
import { BrainReportScreen } from '../BrainReportScreen';
import { DailyChallengeScreen } from '../DailyChallengeScreen';
import { StatsScreen } from '../StatsScreen';
import { BattleLobbyScreen } from '../BattleLobbyScreen';
import { AIBattleScreen } from '../AIBattleScreen';
import { RemoveAdsScreen } from '../RemoveAdsScreen';
import { SettingsScreen } from '../SettingsScreen';
import { GameScreen } from './GameScreen';
import { hasSavedGameState } from '../../utils/storage';
import { adsService } from '../../services/adsService';
import { battleService } from '../../firebase/battleService';
import { aiRoomGame } from '../../firebase/aiBattleSession';

export function AppScreenRouter({
  activeScreen,
  previousScreen,
  setActiveScreen,
  navigateToScreen,
  handleStartSingleGame,
  theme,
  cycleTheme,
  soundEnabled,
  setSoundEnabled,
  startLiveGuidedTutorial,
  startNewGame,
  handleStartDailyPuzzle,
  handleStartDailyMission,
  setActiveBattleRoom,
  onStartQuickMatch,
  isMatchSearching,
  matchTimedOut,
  matchUnavailable,
  onPlayAiInstead,
  onCancelQuickMatch,
  setAdRefreshTrigger,
  setTheme,
  saveSettings,
  loadSettings,
  gameProps,
  homeSelectedMode,
  setHomeSelectedMode,
  statsInitialTab = 'stats'
}) {
  const returnToParent = (canReturnToGame = false) => {
    if (canReturnToGame && previousScreen === 'game') {
      setActiveScreen('game');
    } else {
      setActiveScreen('home');
    }
  };

  return (
    <>
      {activeScreen === 'home' && (
        <HomeScreen
          onStartGuided={startLiveGuidedTutorial}
          onStartSingleGame={handleStartSingleGame}
          onStartGame={handleStartSingleGame}
          onOpenDailyChallenge={() => navigateToScreen('dailyChallenge')}
          onOpenBrainReport={() => navigateToScreen('brainReport')}
          onOpenStats={() => navigateToScreen('stats')}
          onOpenTutorial={() => navigateToScreen('academy')}
          onOpenSettings={() => navigateToScreen('settings')}
          onOpenBattleMatch={() => navigateToScreen('battleLobby')}
          onOpenAIBattle={() => navigateToScreen('aiBattle')}
          onCycleTheme={cycleTheme}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          selectedMode={homeSelectedMode}
          onSelectMode={setHomeSelectedMode}
          hintsRemaining={gameProps?.hintsRemaining}
        />
      )}

      {activeScreen === 'academy' && (
        <AcademyScreen
          onStartGuided={startLiveGuidedTutorial}
          onBack={() => returnToParent(false)}
        />
      )}

      {activeScreen === 'brainReport' && (
        <BrainReportScreen
          onBack={() => returnToParent(false)}
        />
      )}

      {activeScreen === 'dailyChallenge' && (
        <DailyChallengeScreen
          onBack={() => returnToParent(false)}
          onStartDailyPuzzle={handleStartDailyPuzzle}
          onStartDailyMission={handleStartDailyMission}
        />
      )}

      {activeScreen === 'stats' && (
        <StatsScreen
          onBack={() => returnToParent(false)}
          initialTab={statsInitialTab || 'stats'}
        />
      )}

      {activeScreen === 'battleLobby' && (
        <BattleLobbyScreen
          onOpen={() => battleService.warmUp()}
          onBack={() => returnToParent(false)}
          isSearching={isMatchSearching}
          matchTimedOut={matchTimedOut}
          matchUnavailable={matchUnavailable}
          onPlayAiInstead={onPlayAiInstead}
          onCancelSearch={onCancelQuickMatch}
          onStartQuickMatch={onStartQuickMatch || ((lvl, cb, kind) => {
            battleService.startQuickMatch(lvl, (room) => {
              setActiveBattleRoom(room);
              startNewGame(room.level, 'battle', aiRoomGame(room));
              setActiveScreen('game');
              if (cb) cb();
            }, undefined, kind);
          })}
        />
      )}

      {activeScreen === 'aiBattle' && (
        <AIBattleScreen
          onBack={() => returnToParent(false)}
          onStartAIBattle={(aiLevel, variant) => {
            battleService.startAIBattle(aiLevel, (room) => {
              setActiveBattleRoom(room);
              startNewGame(aiLevel, 'aiBattle', aiRoomGame(room));
              setActiveScreen('game');
            }, variant);
          }}
        />
      )}

      {/* The screen is not reachable unless a purchase can actually complete.
          The entry button is already hidden in that case; this is the second
          lock, because a screen that sells something nobody can buy is exactly
          what shipped before — price placeholder, a fake "결제 처리 중", and the
          product handed over free. */}
      {activeScreen === 'removeAds' && adsService.canPurchase && (
        <RemoveAdsScreen
          onBack={() => returnToParent(true)}
          onPurchaseSuccess={() => {
            // adsService already wrote the entitlement, and only after the
            // store confirmed ownership. Setting it again here would be the
            // router deciding a purchase happened, which is not its business.
            setAdRefreshTrigger(prev => prev + 1);
            returnToParent(true);
          }}
        />
      )}

      {activeScreen === 'settings' && (
        <SettingsScreen
          onBack={() => returnToParent(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          theme={theme}
          onSelectTheme={(t) => {
            setTheme(t);
            saveSettings({ ...loadSettings(), theme: t });
          }}
        />
      )}

      {activeScreen === 'game' && <GameScreen {...gameProps} />}
    </>
  );
}
