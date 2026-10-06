import { soundHaptic } from '../utils/soundHaptic';
import { getDailyPuzzle } from '../utils/dailyChallenge';
import { getGhostForModeLevel } from '../utils/ghostManager';
import { useConfirm } from '../components/common/ConfirmProvider';
import { gameInProgress } from '../utils/abandonedGame';
import { isDuelMode } from '../utils/storage';

/**
 * Every way of starting a game — Home, the daily puzzle and missions, the tutorial,
 * entering a battle — in one place, split out of App.jsx so that file keeps to
 * wiring screens together. They share one rule: a game in progress that the new
 * one throws away counts as a loss (abandonedGame.js), so each asks first.
 */
export function useGameStarters({
  t, activeScreen, setActiveScreen, setPreviousScreen, cleanupBattleSession,
  setHomeSelectedMode, setActiveDailyDateKey, setIsGuidedTutorial, setGuidedStep,
  startNewGame, resumeSavedGame, gameMode
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

  // variant: the kind of puzzle Home asked for (engine/variants.js). Always passed on,
  // so a new standard game is standard even right after a killer.
  const handleStartSingleGame = async (selectedLevel, isResume = false, mode = 'classic', rivalMode = 'standard', variant = 'classic') => {
    if (!isResume && !(await confirmAbandon())) return;
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setHomeSelectedMode(mode);
    setActiveDailyDateKey(null);
    setIsGuidedTutorial(false);

    if (isResume && resumeSavedGame(selectedLevel, variant)) {
      setActiveScreen('game');
      return;
    }

    if (rivalMode === 'ghost' && variant === 'classic') {
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

    const racesGhost = variant === 'classic' && (rivalMode === 'delta' || rivalMode === 'ghost');
    const ghost = racesGhost ? getGhostForModeLevel(mode, selectedLevel) : null;
    startNewGame(selectedLevel, mode, ghost ? { rivalMode, ghostRecord: ghost, variant } : { variant });
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

  // Restart after a game over, "next puzzle" after a win and the level picker in the
  // game start a fresh puzzle of the kind being played: the same mode, and through
  // puzzleSetup.js the same puzzle type. None of them is the daily puzzle or the
  // tutorial any more. Until 2026-10-06 they passed only a level, so Speedrun and
  // Survival turned into Classic, and the daily key stayed on: every later win granted
  // the daily hint again and wrote a random puzzle's time over the daily record (both
  // reproduced in the browser). A duel has no follow-up of its own here; it stays Classic.
  const startFollowUpGame = (level) => {
    setActiveDailyDateKey(null);   // a follow-up is never the daily puzzle
    setIsGuidedTutorial(false);
    startNewGame(level, isDuelMode(gameMode) ? 'classic' : gameMode);
  };

  const startLiveGuidedTutorial = async () => {
    if (!(await confirmAbandon())) return;
    soundHaptic.playSelectSound();
    cleanupBattleSession();
    setIsGuidedTutorial(true);
    setGuidedStep(0);
    // The tutorial teaches standard sudoku. Without a kind named, a new game takes the
    // one being played (puzzleSetup.js) — right after a killer, the tutorial would be one.
    startNewGame(1, 'classic', { variant: 'classic' });
    setActiveScreen('game');
  };

  return {
    confirmAbandon, navigateToScreen, handleStartSingleGame,
    handleStartDailyPuzzle, handleStartDailyMission, startLiveGuidedTutorial, startFollowUpGame
  };
}
