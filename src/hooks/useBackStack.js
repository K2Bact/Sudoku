import { useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { soundHaptic } from '../utils/soundHaptic';
import { useConfirm } from '../components/common/ConfirmProvider';
import { openReplayId, closeReplay } from '../components/replay/replayViewer';
import { isAIRoom } from '../firebase/aiBattleSession';
import { closeTopBackLayer } from '../utils/backLayers';

/**
 * 4-Tier Hardware Back Button & Popstate Navigation Stack
 * Uses single-registration ref binding to prevent async listener duplication and race conditions.
 */
export function useBackStack(props) {
  const stateRef = useRef(props);
  stateRef.current = props;

  // The back handler is registered once and reads everything through refs, so
  // the confirm function goes through one too rather than into the dep array.
  const confirmFn = useConfirm();
  const confirmRef = useRef(confirmFn);
  confirmRef.current = confirmFn;

  const lastBackPressTimeRef = useRef(0);
  // When back was last pressed ON THE HOME SCREEN — the first press there only
  // says "press again", the second within 2s closes the app. It cannot be
  // lastBackPressTimeRef: that is set to `now` before any branch runs, so
  // comparing against it always gave 0 and the first press closed the app
  // (seen on a Flip5, 2026-10-01; the prompt had never once been shown).
  const homeBackAtRef = useRef(0);
  const isHandlingBackRef = useRef(false);

  const handleGlobalBackNavigation = useCallback(() => {
    const now = Date.now();
    // Strict debounce: ignore back events within 600ms or while already handling
    if (isHandlingBackRef.current || now - lastBackPressTimeRef.current < 600) {
      return true;
    }

    isHandlingBackRef.current = true;
    lastBackPressTimeRef.current = now;

    try {
      const {
        activeScreen,
        previousScreen,
        setActiveScreen,
        showBattleResultModal,
        onCloseBattleResult,
        showHintRewardModal,
        setShowHintRewardModal,
        showNewGameModal,
        setShowNewGameModal,
        showStoreReviewModal,
        setShowStoreReviewModal,
        dailyRewardInfo,
        setDailyRewardInfo,
        isGuidedTutorial,
        setIsGuidedTutorial,
        isVictory,
        isGameOver,
        onReturnHome,
        isMatchSearching,
        onCancelQuickMatch,
        activeBattleRoom,
        battleService,
        aiBotService,
        showExitToast,
        t
      } = stateRef.current;

      // 0. A replay lies over everything, the 1v1 result included. Back closes
      // only the replay: the room under it stays, rematch and all.
      if (openReplayId()) {
        soundHaptic.playSelectSound();
        closeReplay();
        return true;
      }

      // 0b. A window a screen opened with its own state — the rules card, the
      // privacy page, a locked-mode note, the confirm dialog, a rewarded ad still
      // loading (utils/backLayers.js). Newest first. Back used to go past them to
      // the screen, and on Home closed the app with the window still up (D43).
      if (closeTopBackLayer()) return true;

      // 1. Priority 1: Open Modals / Dialogs / Matchmaking Search
      if (isMatchSearching) {
        if (onCancelQuickMatch) {
          onCancelQuickMatch();
        }
        return true;
      }
      // Back on a battle result = its own lobby button. That button's handler is
      // what clears showBattleResultModal; App used to hand this hook a no-op
      // setter instead, so after one back the flag stayed on and every later back
      // came into this branch again — the player was stuck in the lobby, and a
      // dialog on top of it (the review prompt) could not be closed with back
      // (Flip5, 2026-10-01).
      if (showBattleResultModal) {
        onCloseBattleResult();
        aiBotService.stopMatch();
        return true;
      }
      if (showHintRewardModal) {
        setShowHintRewardModal(false);
        return true;
      }
      if (showNewGameModal) {
        setShowNewGameModal(false);
        return true;
      }
      if (showStoreReviewModal) {
        setShowStoreReviewModal(false);
        return true;
      }
      if (dailyRewardInfo) {
        setDailyRewardInfo(null);
        return true;
      }
      if (isGuidedTutorial) {
        setIsGuidedTutorial(false);
        setActiveScreen('home');
        return true;
      }

      // 2. Priority 2: Sub-Screens
      if (activeScreen === 'settings' || activeScreen === 'removeAds') {
        soundHaptic.playSelectSound();
        setActiveScreen(previousScreen === 'game' ? 'game' : 'home');
        return true;
      }

      const homeSubScreens = ['brainReport', 'stats', 'academy', 'dailyChallenge', 'battleLobby', 'aiBattle'];
      if (homeSubScreens.includes(activeScreen)) {
        soundHaptic.playSelectSound();
        setActiveScreen('home');
        return true;
      }

      // 3. Priority 3: Active Gameplay Screen (activeScreen === 'game')
      if (activeScreen === 'game') {
        // A finished game: back is the result window's own Home button. It used to
        // ask "leave this game?" of a game already over, then skip what Home
        // tidies — the mode tab, the daily date (D43, Gemini G1-1, 2026-10-30).
        // Ahead of the select sound: Home plays it itself. The review prompt
        // that opens over a win is App's and has been closed above.
        if (!activeBattleRoom && (isVictory || isGameOver) && onReturnHome) {
          onReturnHome();
          return true;
        }
        soundHaptic.playSelectSound();
        // The back handler has to say NOW whether it consumed the event, so it
        // returns true immediately and finishes the work when the player
        // answers. window.confirm() could block and answer inline; an in-app
        // modal cannot, and pretending otherwise would let the event fall
        // through to Android and close the app behind the question.
        if (activeBattleRoom) {
          const isAIBattle = isAIRoom(activeBattleRoom);
          confirmRef.current(t('battleHeader.confirmLeave')).then((ok) => {
            if (!ok) return;
            battleService.leaveRoom();
            aiBotService.stopMatch();
            setActiveScreen(isAIBattle ? 'aiBattle' : 'battleLobby');
          });
          return true;
        }

        confirmRef.current(t('common.confirmLeaveGame')).then((ok) => {
          if (ok) setActiveScreen('home');
        });
        return true;
      }

      // 4. Priority 4: Main Home Screen (activeScreen === 'home')
      if (activeScreen === 'home') {
        if (now - homeBackAtRef.current < 2000) {
          try {
            CapacitorApp.exitApp();
          } catch (e) {}
          return false;
        }
        homeBackAtRef.current = now;
        if (showExitToast) {
          showExitToast(t('common.exitAppPrompt'));
        }
        return true;
      }

      return false;
    } finally {
      setTimeout(() => {
        isHandlingBackRef.current = false;
      }, 400);
    }
  }, []);

  // Single-Registration Capacitor Hardware Back Button Listener (Mount Once)
  useEffect(() => {
    let backHandle = null;
    let isCancelled = false;

    CapacitorApp.addListener('backButton', () => {
      handleGlobalBackNavigation();
    }).then((handle) => {
      if (isCancelled) {
        handle.remove();
      } else {
        backHandle = handle;
      }
    }).catch(() => {});

    return () => {
      isCancelled = true;
      if (backHandle && backHandle.remove) {
        backHandle.remove();
      }
    };
  }, [handleGlobalBackNavigation]);

  // Physical Keyboard / Escape Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Back') {
        e.preventDefault();
        handleGlobalBackNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGlobalBackNavigation]);

  // Browser / Web Popstate Listener
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      handleGlobalBackNavigation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleGlobalBackNavigation]);
}

export default useBackStack;
