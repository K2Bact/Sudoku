import { soundHaptic } from '../utils/soundHaptic';
import { getDailyPuzzle } from '../utils/dailyChallenge';
import { getGhostForModeLevel } from '../utils/ghostManager';
import { useConfirm } from '../components/common/ConfirmProvider';
import { gameInProgress } from '../utils/abandonedGame';

/**
 * Every way of starting a game — Home, the daily puzzle and missions, the tutorial,
 * entering a battle — in one place, split out of App.jsx so that file keeps to
 * wiring screens together. They share one rule: a game in progress that the new
 * one throws away counts as a loss (abandonedGame.js), so each asks first.
 */
export function useGameStarters({
  t, activeScreen, setActiveScreen, setPreviousScreen, cleanupBattleSession,
  setHomeSelectedMode, setActiveDailyDateKey, setIsGuidedTutorial, setGuidedStep,
  startNewGame, resumeSavedGame
}) {
  // Starting another game throws away the one in progress, and that counts as a loss
  // (abandonedGame.js). Every way of starting one asks first — the player should learn
  // the rule before it costs them, not from the win rate afterwards.
  const confirm = useConfirm();
  const confirmAbandon = async () => !gameInProgress() || confirm(t('common.abandonConfirm'));

  const navigateToScreen = async (screenName) => {
    if ((screenName === 'battleLobby' || screenName === 'aiBattle') && !(await confirmAbandon())) return;
    soundHaptic.playSelectSound();
    setPreviousScreen(activeScreen);
    if (screenName !== 'game') cleanupBattleSession();
    setActiveScreen(screenName);
  };

  const handleStartSingleGame = async (selectedLevel, isResume = false, mode = 'classic', rivalMode = 'standard') => {
    if (!isResume && !(await confirmAbandon())) return;
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

  const handleStartDailyPuzzle = async (dateKey) => {
    if (!(await confirmAbandon())) return;
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setActiveDailyDateKey(dateKey);
    setIsGuidedTutorial(false);
    const dailyData = getDailyPuzzle(dateKey);
    startNewGame(dailyData.level, 'classic', dailyData);
    setActiveScreen('game');
  };

  const handleStartDailyMission = async (mission) => {
    if (!(await confirmAbandon())) return;
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

  const startLiveGuidedTutorial = async () => {
    if (!(await confirmAbandon())) return;
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setIsGuidedTutorial(true);
    setGuidedStep(0);
    startNewGame(1, 'classic');
    setActiveScreen('game');
  };

  return {
    confirmAbandon, navigateToScreen, handleStartSingleGame,
    handleStartDailyPuzzle, handleStartDailyMission, startLiveGuidedTutorial
  };
}
