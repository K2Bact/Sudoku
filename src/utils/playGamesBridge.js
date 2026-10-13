/**
 * playGamesBridge.js
 * Bridges Google Play Games Services events to Javascript web application.
 */

import { savePlayGamesUser, getPlayGamesUser } from './storage.js';
import { playGamesService } from '../services/playGamesService.js';
import { syncAchievementsToPlayGames } from './achievementManager.js';

/**
 * 자동 로그인을 그만둘지 기억하는 키.
 *
 * 실기기에서 확인: 취소해도 다음 실행에 같은 구글 계정 창이 다시 뜬다.
 * 플러그인은 silent:true 여도 로그인 이력이 없으면 UI 를 띄우므로, JS 가
 * 쥔 손잡이는 "다시 시도할 것인가" 하나뿐이다.
 */
const AUTO_SIGNIN_BLOCKED_KEY = 'suidoku_pg_auto_signin_blocked_v1';

function isAutoSignInBlocked() {
  try {
    return localStorage.getItem(AUTO_SIGNIN_BLOCKED_KEY) === '1';
  } catch {
    // 저장소를 못 읽으면 묻지 않는 쪽으로 기운다. 조르는 것보다 낫다.
    return true;
  }
}

/** 자동 시도를 멈춘다. 설정 화면의 버튼은 계속 동작한다. */
function blockAutoSignIn() {
  try { localStorage.setItem(AUTO_SIGNIN_BLOCKED_KEY, '1'); } catch { /* 저장 못 해도 흐름은 계속 */ }
}

/** 사용자가 직접 로그인에 성공했을 때 다시 허용한다. */
export function allowAutoSignIn() {
  try { localStorage.removeItem(AUTO_SIGNIN_BLOCKED_KEY); } catch { /* 무시 */ }
}

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

/**
 * Interactive sign-in from a real tap: Google's sign-in UI, then the same silent path
 * so the profile is stored and 'playGamesSignedIn' fires. Returns true when signed in.
 * Settings and the Play Analysis screen both offer it.
 */
export async function connectPlayGames() {
  const res = await playGamesService.signIn(true);
  if (!res.success) return false;
  // 직접 켰으니 자동 로그인 차단을 푼다. 다음 실행부터 세션이 조용히 복원된다.
  allowAutoSignIn();
  await attemptSilentSignIn();
  return true;
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
      // Achievements earned while signed out reach Play Games now (D11 ④).
      syncAchievementsToPlayGames().catch((e) => console.warn('[PlayGamesBridge] achievement sync failed:', e?.message || e));
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
  const start = () => setTimeout(async () => {
    // 한 번 거절한 사람에게 켤 때마다 구글 계정 창을 다시 들이밀지 않는다.
    if (isAutoSignInBlocked()) return;

    // 시도하기 **전에** 막는다. 처음에는 "실패하면 막는다" 로 썼는데 전혀 듣지
    // 않았다 — 실기기 로그를 보면 네이티브는
    //   W SuidokuPlayGames: Play Games sign-in failed or cancelled
    // 를 남기는데 JS 쪽 로그는 하나도 없다. 플러그인이 취소 시 프로미스를
    // 해결하지 않아 await 가 영원히 걸려 있고, 그 뒤 줄은 실행될 기회가 없다.
    //
    // 그래서 순서를 뒤집었다. 먼저 막고, 성공했을 때만 푼다. 프로미스가
    // 돌아오든 말든 결과가 같다.
    blockAutoSignIn();
    const res = await attemptSilentSignIn();
    if (res && res.success) allowAutoSignIn();
  }, 1500);

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
