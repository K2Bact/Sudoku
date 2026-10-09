import { useState, useEffect } from 'react';
import { claimDailyAttendance } from '../utils/wallet';
import { checkAndUnlockAchievements } from '../utils/achievementManager';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';

export function useAppModals(isVictory) {
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
  // (a killer win from 1.4.0, a Logic Score that already passed 135).
  useEffect(() => {
    const reward = claimDailyAttendance();
    if (reward) setDailyRewardInfo(reward);
    checkAndUnlockAchievements();
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
