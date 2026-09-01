/**
 * playGamesBridge.js
 * Bridges Google Play Games Services events to Javascript web application.
 */

import { savePlayGamesUser, getPlayGamesUser } from './storage.js';

let currentUser = getPlayGamesUser();
const listeners = new Set();

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
