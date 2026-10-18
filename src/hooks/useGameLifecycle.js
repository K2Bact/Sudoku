import { useEffect, useRef } from 'react';
import { saveGameState } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';

// Bounds how stale the saved clock can get between meaningful moves. The board
// itself is saved the moment it changes; this only exists so a game abandoned
// mid-think does not resume with a badly out-of-date timer.
const CLOCK_FLUSH_MS = 10000;

/**
 * useGameLifecycle.js
 * Handles auto-saving, page visibility changes, app suspend/resume audio, and auto-pause.
 *
 * Saving is driven by *changes*, not by the clock. Listing timerSeconds as an
 * effect dependency used to serialise the whole board, notes and solution to
 * localStorage once per second, and tear down / re-register the visibility
 * listeners just as often — pure main-thread jank on low-end devices.
 */
export function useGameLifecycle({
  board,
  initialBoard,
  solutionBoard,
  notes,
  mistakes,
  timerSeconds,
  playedSeconds = 0,
  level,
  gameMode,
  variant = 'classic',
  cages = null,
  isFastEntryMode,
  lockedNumber,
  adHintsUsedThisGame = 0,
  hintsUsedCount = 0,
  playFactsRef = null,
  dailyDateKey = null,
  activeScreen,
  isGameOver,
  isVictory,
  activeBattleRoom,
  setIsPaused
}) {
  // Mirror of the live state, so the effects below can read the newest values
  // without naming them as dependencies (which is what caused the per-second work).
  const latest = useRef();
  latest.current = {
    board,
    initialBoard,
    solutionBoard,
    notes,
    mistakes,
    timerSeconds,
    playedSeconds,
    level,
    gameMode,
    variant,
    cages,
    isFastEntryMode,
    lockedNumber,
    adHintsUsedThisGame,
    hintsUsedCount,
    playFactsRef,
    dailyDateKey,
    activeScreen,
    isGameOver,
    isVictory,
    activeBattleRoom,
    setIsPaused
  };

  const saveNow = useRef();
  saveNow.current = () => {
    const s = latest.current;
    if (!s || s.activeScreen !== 'game' || s.isGameOver || s.isVictory || s.activeBattleRoom) return;
    saveGameState({
      board: s.board,
      initialBoard: s.initialBoard,
      solutionBoard: s.solutionBoard,
      notes: s.notes,
      mistakes: s.mistakes,
      timerSeconds: s.timerSeconds,
      // How long the game has been played; in Survival the clock above is the time
      // left, and the grade reads this instead (useGameTimer, BACKLOG D15).
      playedSeconds: s.playedSeconds,
      level: s.level,
      gameMode: s.gameMode,
      // A killer cannot be resumed without its cages (savedGame.js).
      variant: s.variant,
      cages: s.cages,
      isFastEntryMode: s.isFastEntryMode,
      lockedNumber: s.lockedNumber,
      adHintsUsedThisGame: s.adHintsUsedThisGame,
      // Without this a player could use hints, relaunch, and still register a
      // "zero-hint" personal best — the Ghost PB policy was bypassable.
      hintsUsedCount: s.hintsUsedCount,
      // Notes placed and Fast Entry used so far — the achievements read them at
      // the win, and a resumed game must still know them (playFacts.js). Saved
      // whenever the board or the notes change, which is when they change.
      playFacts: s.playFactsRef?.current ? { ...s.playFactsRef.current } : undefined,
      // The day this game is the daily puzzle of, or null. It lived only in App's
      // state, so a daily finished after a relaunch or a trip home was a plain win:
      // no calendar mark, no daily hint (CH18-03, 2026-10-18; savedGame.js).
      dailyDateKey: s.dailyDateKey || null
    });
  };

  // 1. Save whenever something the player actually did changes. Note the absence
  //    of timerSeconds here — that is the whole point of the hook's design.
  useEffect(() => {
    saveNow.current();
  }, [
    board,
    initialBoard,
    solutionBoard,
    notes,
    mistakes,
    level,
    gameMode,
    variant,
    cages,
    isFastEntryMode,
    lockedNumber,
    adHintsUsedThisGame,
    dailyDateKey,
    activeScreen,
    isGameOver,
    isVictory,
    activeBattleRoom
  ]);

  // 2. Low-frequency clock flush, so an idle game keeps a roughly current timer.
  //    Ten seconds instead of one is a ~90% cut in writes.
  useEffect(() => {
    if (activeScreen !== 'game' || isGameOver || isVictory || activeBattleRoom) return undefined;
    const id = setInterval(() => saveNow.current(), CLOCK_FLUSH_MS);
    return () => clearInterval(id);
  }, [activeScreen, isGameOver, isVictory, activeBattleRoom]);

  // 3. Mobile lifecycle: auto-pause, flush the save, and put audio to sleep.
  //    Registered once for the life of the hook; the handler reads from `latest`.
  useEffect(() => {
    const handleVisibilityChange = () => {
      const s = latest.current;
      if (document.visibilityState === 'hidden') {
        soundHaptic.suspend();
        if (s.activeScreen === 'game' && !s.isGameOver && !s.isVictory && !s.activeBattleRoom) {
          if (s.setIsPaused) s.setIsPaused(true);
          if (s.board.some(row => row.some(cell => cell !== 0))) saveNow.current();
        }
      } else if (document.visibilityState === 'visible') {
        soundHaptic.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, []);
}
