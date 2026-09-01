import { useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { soundHaptic } from '../utils/soundHaptic';

/**
 * 4-Tier Hardware Back Button & Popstate Navigation Stack
 * Uses single-registration ref binding to prevent async listener duplication and race conditions.
 */
export function useBackStack(props) {
  const stateRef = useRef(props);
  stateRef.current = props;

  const lastBackPressTimeRef = useRef(0);
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
        setShowBattleResultModal,
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
        isMatchSearching,
        onCancelQuickMatch,
        activeBattleRoom,
        battleService,
        aiBotService,
        showExitToast,
        t
      } = stateRef.current;

      // 1. Priority 1: Open Modals / Dialogs / Matchmaking Search
      if (isMatchSearching) {
        if (onCancelQuickMatch) {
          onCancelQuickMatch();
        }
        return true;
      }
      if (showBattleResultModal) {
        setShowBattleResultModal(false);
        const isAIBattle = activeBattleRoom?.isAIBattle || activeBattleRoom?.opponentName?.includes('AI') || activeBattleRoom?.opponentName?.toLowerCase().includes('bot');
        battleService.leaveRoom();
        aiBotService.stopMatch();
        setActiveScreen(isAIBattle ? 'aiBattle' : 'battleLobby');
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
        soundHaptic.playSelectSound();
        if (activeBattleRoom) {
          const isAIBattle = activeBattleRoom?.isAIBattle || activeBattleRoom?.opponentName?.includes('AI') || activeBattleRoom?.opponentName?.toLowerCase().includes('bot');
          const confirmMsg = t('battleHeader.confirmLeave');
          if (window.confirm(confirmMsg)) {
            battleService.leaveRoom();
            aiBotService.stopMatch();
            setActiveScreen(isAIBattle ? 'aiBattle' : 'battleLobby');
          }
          return true;
        }

        const confirmMsg = t('common.confirmLeaveGame');
        if (window.confirm(confirmMsg)) {
          setActiveScreen('home');
        }
        return true;
      }

      // 4. Priority 4: Main Home Screen (activeScreen === 'home')
      if (activeScreen === 'home') {
        if (now - lastBackPressTimeRef.current < 2000) {
          try {
            CapacitorApp.exitApp();
          } catch (e) {}
          return false;
        } else {
          lastBackPressTimeRef.current = now;
          if (showExitToast) {
            showExitToast(t('common.exitAppPrompt'));
          }
          return true;
        }
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
