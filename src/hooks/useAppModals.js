import { useState, useEffect, useRef } from 'react';
import { claimAttendanceNow } from '../utils/attendanceClaim';
import { checkAndUnlockAchievements } from '../utils/achievementManager';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';

export function useAppModals(isVictory, activeScreen) {
  const [dailyRewardInfo, setDailyRewardInfo] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showStoreReviewModal, setShowStoreReviewModal] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);

  useEffect(() => {
    if (isVictory) {
      try {
        const stats = loadStats();
        const reviewStatus = localStorage.getItem('suidoku_review_prompted');
        // Wins of either kind: a killer player has played the app as much (user, 2026-10-07).
        const wins = (stats.gamesWon || 0) + (stats.killer?.gamesWon || 0);
        if (wins >= 5 && !reviewStatus) {
          const timer = setTimeout(() => setShowStoreReviewModal(true), 1800);
          return () => clearTimeout(timer);
        }
      } catch (e) {}
    }
  }, [isVictory]);

  // Global Celebratory Achievement Listener
  useEffect(() => {
    const handleAchievementUnlock = (e) => {
      const ach = e.detail;
      if (ach) {
        soundHaptic.playCompleteChime();
        setAchievementToast(ach);
        setTimeout(() => {
          setAchievementToast(null);
        }, 3600);
      }
    };

    window.addEventListener('sudoku_achievement_unlocked', handleAchievementUnlock);
    return () => window.removeEventListener('sudoku_achievement_unlocked', handleAchievementUnlock);
  }, []);

  // Attendance, then every achievement once. Below the listener on purpose:
  // effects run in order, and an unlock announced before it is attached shows
  // no toast. The check at start is what gives the day-count and streak badges
  // on the day they are reached, and hands out a badge earned before it existed
  // (a killer win from 1.4.0, a Logic Score that already passed 135). A claim
  // runs that check itself (utils/attendanceClaim.js), so it runs here only when
  // there was nothing to claim.
  useEffect(() => {
    const reward = claimAttendanceNow();
    if (reward) setDailyRewardInfo(reward);
    else checkAndUnlockAchievements();
  }, []);

  // Attendance again on Home (D45): arriving there, and coming back to the app
  // while there — a phone that keeps the app in the background never starts it
  // again, and a day that passed with the app open was paid only after a restart.
  // Not in a game: a window over the board would cut into a move; the claim waits
  // for Home. On the first render this finds the day claimed above and does nothing.
  const screenRef = useRef(activeScreen);
  screenRef.current = activeScreen;
  useEffect(() => {
    if (activeScreen !== 'home') return;
    const reward = claimAttendanceNow();
    if (reward) setDailyRewardInfo(reward);
  }, [activeScreen]);
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || screenRef.current !== 'home') return;
      const reward = claimAttendanceNow({ sync: true });
      if (reward) setDailyRewardInfo(reward);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return {
    dailyRewardInfo,
    setDailyRewardInfo,
    showNewGameModal,
    setShowNewGameModal,
    showStoreReviewModal,
    setShowStoreReviewModal,
    achievementToast,
  };
}
