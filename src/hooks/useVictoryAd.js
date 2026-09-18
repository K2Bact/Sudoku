/**
 * useVictoryAd.js
 * Where the post-game interstitial sits: after the win, before the victory screen.
 *
 * ── Why it moved ──────────────────────────────────────────────────────────
 * It used to run when the player tapped Next Game or Home on the victory screen,
 * loading the ad at that moment. AdMob's guidance says both halves of that are
 * wrong. Interstitials should appear before a break page rather than after it,
 * "explicitly before any Continue or Next level buttons", because an ad behind a
 * Next button is a surprise. And ads should be loaded in advance, because one that
 * arrives late appears suddenly under a player who has moved on — on the device it
 * took about a second, long enough for the next puzzle's first taps to land on it.
 * The victory screen's Leaderboard button also skipped the ad entirely.
 *
 * The sequence now:
 *
 *   during play   preload, if an ad would be allowed at all (grace, cap, removed)
 *   win           if allowed AND loaded:
 *                   'pause'  ~1s, input blocked — AdMob: for apps with frequent
 *                            tapping, insert a delay after the level and before the
 *                            interstitial so the player stops tapping
 *                   'ad'     show it, wait for it to close
 *                 otherwise straight on — the win never waits for a load
 *   'modal'       the victory screen; its buttons navigate with no ad behind them
 *
 * Nothing the win earns depends on reaching 'modal'. It is all recorded in
 * handleGameWinLogic before this runs, so closing the app during the ad loses
 * nothing.
 */

import { useEffect, useState } from 'react';
import { adsService } from '../services/adsService.js';

export const VICTORY_AD_PAUSE_MS = 1000;

/**
 * The win-to-victory-screen sequence, without React, so the gate can run it.
 *
 * @param ads          adsService (isPostGameAdReady, showPostGameAd)
 * @param setPhase     receives 'pause' | 'ad' | 'modal'
 * @param wait         ms => Promise, the pause
 * @param isCancelled  () => boolean, true once the screen has gone away
 */
export async function victoryAdSequence({ ads, setPhase, wait, isCancelled }) {
  if (!ads.isPostGameAdReady()) {
    setPhase('modal');
    return;
  }
  setPhase('pause');
  await wait(VICTORY_AD_PAUSE_MS);
  if (isCancelled()) return;
  setPhase('ad');
  try {
    await ads.showPostGameAd();
  } catch {
    /* an ad that throws must not keep the victory screen away */
  }
  if (!isCancelled()) setPhase('modal');
}

/** @returns {'idle'|'pause'|'ad'|'modal'} */
export function useVictoryAd({ isVictory, isGameActive }) {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (isGameActive && !isVictory) adsService.preloadPostGameAd();
  }, [isGameActive, isVictory]);

  useEffect(() => {
    if (!isVictory) {
      setPhase('idle');
      return undefined;
    }
    let cancelled = false;
    victoryAdSequence({
      ads: adsService,
      setPhase,
      wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      isCancelled: () => cancelled,
    });
    return () => {
      cancelled = true;
    };
  }, [isVictory]);

  return phase;
}
