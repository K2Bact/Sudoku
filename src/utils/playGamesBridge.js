/**
 * playGamesBridge.js
 * Bridges Google Play Games Services events to Javascript web application.
 */

import { savePlayGamesUser, getPlayGamesUser } from './storage.js';
import { playGamesService } from '../services/playGamesService.js';

let currentUser = getPlayGamesUser();
const listeners = new Set();

/**
 * Attempt a silent sign-in and announce the result on the same window event the
 * listener below already consumes. Nothing used to dispatch that event, so the
 * bridge sat idle and getPlayGamesUser() never returned a real profile.
 */
export async function attemptSilentSignIn() {
  try {
    const res = await playGamesService.signIn(false);
    if (res.success && res.gamerTag) {
      window.dispatchEvent(new CustomEvent('playGamesSignedIn', {
        detail: { displayName: res.gamerTag, playerId: res.playerId }
      }));
    }
    return res;
  } catch (e) {
    console.warn('[PlayGamesBridge] silent sign-in failed:', e?.message || e);
    return { success: false };
  }
}

export function initPlayGamesListener() {
  if (typeof window === 'undefined') return;

  window.addEventListener('playGamesSignedIn', (event) => {
    const detail = event.detail || {};
    if (detail.displayName) {
      currentUser = {
        displayName: detail.displayName,
        playerId: detail.playerId,
        lastLogin: Date.now()
      };
      savePlayGamesUser(currentUser);
      listeners.forEach((callback) => {
        try {
          callback(currentUser);
        } catch (err) {
          console.error('[PlayGamesBridge] listener error:', err);
        }
      });
      console.log('[PlayGamesBridge] Successfully signed in as:', currentUser.displayName);
    }
  });

  // Deferred until after first paint so sign-in never competes with the first
  // render, and so the Capacitor bridge is certainly up before the first native
  // call. (A separate "reading 'triggerEvent'" error fires ~600ms into launch on
  // Android; it reproduces with sign-in disabled entirely, so it is not from here.)
  const start = () => setTimeout(() => { attemptSilentSignIn(); }, 1500);

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

export function subscribePlayGames(callback) {
  listeners.add(callback);
  if (currentUser) {
    callback(currentUser);
  }
  return () => listeners.delete(callback);
}

export function getPlayGamesProfile() {
  return currentUser;
}
