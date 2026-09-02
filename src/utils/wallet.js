/**
 * wallet.js
 * Single Source of Truth (SSOT) for User Hints Wallet, Daily Attendance Streaks,
 * and Progression Reward Transactions.
 */

import { getTodayDateKey, daysBetweenKeys } from './dateKey.js';

// Exported so sync/backup code cannot drift onto a different key string.
export const WALLET_STORAGE_KEY = 'suidoku_user_wallet_v1';

const DEFAULT_WALLET = {
  hints: 3,                 // Initial welcome bonus
  lastDailyClaimDate: null, // 'YYYY-MM-DD'
  streakDays: 0,            // Consecutive daily login streak
  totalAdsWatched: 0,       // Rewarded ad count
  history: []               // Transaction log
};

/**
 * Load wallet from localStorage
 */
export function loadWallet() {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_WALLET };
    const parsed = JSON.parse(raw);
    return {
      hints: typeof parsed.hints === 'number' ? parsed.hints : DEFAULT_WALLET.hints,
      lastDailyClaimDate: parsed.lastDailyClaimDate || null,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
      totalAdsWatched: typeof parsed.totalAdsWatched === 'number' ? parsed.totalAdsWatched : 0,
      history: Array.isArray(parsed.history) ? parsed.history.slice(-30) : []
    };
  } catch (e) {
    console.error('Failed to load wallet:', e);
    return { ...DEFAULT_WALLET };
  }
}

/**
 * Save wallet to localStorage
 */
export function saveWallet(wallet) {
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } catch (e) {
    console.error('Failed to save wallet:', e);
  }
}

/**
 * Attempt to consume 1 hint.
 * Returns true if successful, false if insufficient balance.
 */
export function consumeHint() {
  const wallet = loadWallet();
  if (wallet.hints <= 0) {
    return false;
  }
  wallet.hints -= 1;
  wallet.history.push({
    type: 'consume',
    amount: -1,
    date: new Date().toISOString()
  });
  saveWallet(wallet);
  return true;
}

/**
 * Add hints to wallet with reason tag
 */
export function addHints(amount, reason = 'reward') {
  if (amount <= 0) return loadWallet().hints;
  const wallet = loadWallet();
  wallet.hints += amount;
  if (reason === 'ad_reward') {
    wallet.totalAdsWatched += 1;
  }
  wallet.history.push({
    type: 'add',
    reason,
    amount,
    date: new Date().toISOString()
  });
  saveWallet(wallet);
  return wallet.hints;
}

/**
 * Check and claim daily attendance reward
 * Returns { claimed: boolean, hintsAdded: number, streakDays: number } or null if already claimed today
 */
export function claimDailyAttendance() {
  const wallet = loadWallet();
  // Local-time day key, shared with the daily challenge so both reset together
  const today = getTodayDateKey();

  if (wallet.lastDailyClaimDate === today) {
    return null; // Already claimed today
  }

  // Calculate streak
  if (wallet.lastDailyClaimDate) {
    const diffDays = daysBetweenKeys(wallet.lastDailyClaimDate, today);

    if (diffDays === 1) {
      wallet.streakDays += 1;
    } else {
      wallet.streakDays = 1; // Streak reset if missed a day
    }
  } else {
    wallet.streakDays = 1;
  }

  // Bonus: +1 hint everyday, +2 extra on 7-day milestone
  const bonus = (wallet.streakDays % 7 === 0) ? 3 : 1;
  wallet.hints += bonus;
  wallet.lastDailyClaimDate = today;
  wallet.history.push({
    type: 'daily_attendance',
    amount: bonus,
    streak: wallet.streakDays,
    date: new Date().toISOString()
  });

  saveWallet(wallet);

  return {
    claimed: true,
    hintsAdded: bonus,
    streakDays: wallet.streakDays
  };
}
