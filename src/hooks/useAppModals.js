import { useState, useEffect } from 'react';
import { claimDailyAttendance } from '../utils/wallet';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';

export function useAppModals(isVictory) {
  const [dailyRewardInfo, setDailyRewardInfo] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showStoreReviewModal, setShowStoreReviewModal] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);

  useEffect(() => {
    const reward = claimDailyAttendance();
    if (reward) setDailyRewardInfo(reward);
  }, []);

  useEffect(() => {
    if (isVictory) {
      try {
        const stats = loadStats();
        const reviewStatus = localStorage.getItem('suidoku_review_prompted');
        if (stats.gamesWon >= 5 && !reviewStatus) {
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
