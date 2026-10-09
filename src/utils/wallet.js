/**
 * wallet.js
 * Single Source of Truth (SSOT) for User Hints Wallet, Daily Attendance Streaks,
 * and Progression Reward Transactions.
 */

import { getTodayDateKey, daysBetweenKeys } from './dateKey.js';

// Exported so sync/backup code cannot drift onto a different key string.
export const WALLET_STORAGE_KEY = 'suidoku_user_wallet_v1';

// The hint count on screen used to be a copy of wallet.hints held in React
// state and refreshed by hand at each call site. Five places refreshed it;
// seven places wrote to the wallet. The daily attendance claim and the battle
// mission reward were the two that forgot, so the home screen kept showing the
// balance from before the claim until some unrelated action happened to refresh
// it. A hand-invalidated cache gains a new way to drift with every new writer,
// so the wallet announces its own balance instead and the screen listens.
//
// A plain listener list rather than a window event: this runs in one WebView
// JS context, and it keeps the mechanism testable in Node without a DOM.
const balanceListeners = new Set();

/**
 * Subscribe to hint balance changes. Returns an unsubscribe function.
 * The listener receives the new balance.
 */
export function subscribeToWallet(listener) {
  if (typeof listener !== 'function') return () => {};
  balanceListeners.add(listener);
  return () => balanceListeners.delete(listener);
}

function announceBalance(hints) {
  for (const listener of balanceListeners) {
    // One broken listener must not stop the others from being told.
    try {
      listener(hints);
    } catch (e) {
      console.error('Wallet listener failed:', e);
    }
  }
}

const DEFAULT_WALLET = {
  hints: 3,                 // Initial welcome bonus
  lastDailyClaimDate: null, // 'YYYY-MM-DD'
  streakDays: 0,            // Consecutive daily login streak
  // Days the app was opened, in all — kept from 2026-10-08 for the visit
  // achievements (30 / 100 / 365 days). Unlike the streak a missed day does not
  // reset it. Days before that date were never counted, so it starts at 0.
  totalVisitDays: 0,
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
      totalVisitDays: typeof parsed.totalVisitDays === 'number' ? parsed.totalVisitDays : 0,
      totalAdsWatched: typeof parsed.totalAdsWatched === 'number' ? parsed.totalAdsWatched : 0,
      history: Array.isArray(parsed.history) ? parsed.history.slice(-30) : []
    };
  } catch (e) {
    console.error('Failed to load wallet:', e);
    return { ...DEFAULT_WALLET };
  }
}

/**
 * Save the wallet. Returns whether it actually reached storage.
 *
 * It used to swallow the failure and say nothing, so consumeHint returned true
 * after a write that never happened: the hint was handed out and the balance was
 * back at its old value on the next load — a free hint every time storage is
 * full, and a screen disagreeing with the game (RT-7 / F11).
 */
export function saveWallet(wallet) {
  let saved = true;
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } catch (e) {
    saved = false;
    console.error('Failed to save wallet:', e);
  }
  // Announce even if the write threw: the in-memory balance the caller just
  // computed is what the rest of this session will act on, and a screen showing
  // a different number than the game is using is the failure being fixed here.
  announceBalance(wallet.hints);
  return saved;
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
  const before = wallet.hints;
  wallet.hints -= 1;
  wallet.history.push({
    type: 'consume',
    amount: -1,
    date: new Date().toISOString()
  });
  if (!saveWallet(wallet)) {
    // The spend did not persist, so it did not happen. Put the balance the
    // screen is showing back where the stored one really is and say no —
    // otherwise the hint is given away and the balance returns on the next load.
    announceBalance(before);
    return false;
  }
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
  if (!saveWallet(wallet)) {
    // Same rule in the other direction: a reward that did not persist is not a
    // reward. The caller is told the balance that is really stored, so it cannot
    // congratulate the player on hints they will not have in a minute.
    const stored = loadWallet().hints;
    announceBalance(stored);
    return stored;
  }
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

  wallet.totalVisitDays += 1;

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
