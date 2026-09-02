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
          onStartSingleGame={handleStartSingleGame}
          onStartGame={handleStartSingleGame}
          onOpenDailyChallenge={() => navigateToScreen('dailyChallenge')}
          onOpenBrainReport={() => navigateToScreen('brainReport')}
          onOpenStats={() => navigateToScreen('stats')}
          onOpenTutorial={() => navigateToScreen('academy')}
          onOpenSettings={() => navigateToScreen('settings')}
          onOpenBattleMatch={() => navigateToScreen('battleLobby')}
          onOpenAIBattle={() => navigateToScreen('aiBattle')}
          hasSavedGame={hasSavedGameState()}
          theme={theme}
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
          onBack={() => returnToParent(false)}
          onStartGuidedTutorial={startLiveGuidedTutorial}
        />
      )}

      {activeScreen === 'brainReport' && (
        <BrainReportScreen
          onBack={() => returnToParent(false)}
          onStartTraining={() => {
            setActiveScreen('game');
            startNewGame(3);
          }}
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
          onPlayAgain={() => {
            setActiveScreen('game');
            startNewGame(3);
          }}
        />
      )}

      {activeScreen === 'battleLobby' && (
        <BattleLobbyScreen
          onBack={() => returnToParent(false)}
          isSearching={isMatchSearching}
          matchTimedOut={matchTimedOut}
          onPlayAiInstead={onPlayAiInstead}
          onCancelSearch={onCancelQuickMatch}
          onStartQuickMatch={onStartQuickMatch || ((lvl, cb) => {
            battleService.startQuickMatch(lvl, (room) => {
              setActiveBattleRoom(room);
              startNewGame(room.level, 'battle', { board: room.puzzle, solution: room.solution });
              setActiveScreen('game');
              if (cb) cb();
            });
          })}
        />
      )}

      {activeScreen === 'aiBattle' && (
        <AIBattleScreen
          onBack={() => returnToParent(false)}
          onStartAIBattle={(aiLevel) => {
            battleService.startAIBattle(aiLevel, (room) => {
              setActiveBattleRoom(room);
              startNewGame(aiLevel, 'aiBattle', { board: room.puzzle, solution: room.solution });
              setActiveScreen('game');
            });
          }}
        />
      )}

      {activeScreen === 'removeAds' && (
        <RemoveAdsScreen
          onBack={() => returnToParent(true)}
          onPurchaseSuccess={() => {
            adsService.setAdsRemoved(true);
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
