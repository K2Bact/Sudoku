/**
 * Gate 2-32 — The list of open windows the back key closes first (D43).
 *
 * A window a screen opens with its own state puts its close on a list
 * (src/utils/backLayers.js); useBackStack closes the newest before anything
 * else. What this checks is the list itself — the screens and the key are 3-6:
 *   1. the newest closes first, and a window that goes from the middle of the
 *      list (a screen change takes several at once, cleanups in any order)
 *      leaves the others where they were
 *   2. asking the top window to close does not take it off the list — only its
 *      owner does, when it has really gone. A window that stays (an ad loading)
 *      stays the top, and the next back goes to it again, not past it
 *   3. taking an entry off twice is harmless; nothing open → false
 *   4. a rewarded ad holds the back key while it loads and lets go when it
 *      settles, paid, refused or thrown (components/common/adRewardMessage.js)
 */
import assert from 'node:assert/strict';
import { pushBackLayer, closeTopBackLayer, openBackLayerCount } from '../../../src/utils/backLayers.js';
import { watchRewardedAd } from '../../../src/components/common/adRewardMessage.js';

console.log('======================================================');
console.log('QA Gate 2-32: The Back Key Closes The Newest Open Window');
console.log('======================================================');

// 1. Newest first, and a window gone from the middle leaves the rest in place.
{
  const closed = [];
  const offA = pushBackLayer(() => closed.push('A'));
  const offB = pushBackLayer(() => closed.push('B'));
  const offC = pushBackLayer(() => closed.push('C'));
  offB();
  assert.equal(closeTopBackLayer(), true);
  assert.deepEqual(closed, ['C'], 'with the middle window gone, back must still close the newest (C) — the middle one was not taken out by itself');
  offC();
  closeTopBackLayer();
  assert.deepEqual(closed, ['C', 'A'], 'after C goes, back must reach A — the middle one was not taken out by itself');
  offA();
  console.log('  ✅ 1. newest first; a window that goes from the middle leaves the others in place');
}

// 2. Asking the top to close leaves it on the list until its owner takes it off.
{
  let asked = 0;
  const off = pushBackLayer(() => { asked += 1; });
  closeTopBackLayer();
  assert.equal(openBackLayerCount(), 1, 'closeTopBackLayer took the window off the list itself — a window still on screen would be skipped by the next back');
  closeTopBackLayer();
  assert.equal(asked, 2, 'a window that did not close must get the next back too');
  off();
  console.log('  ✅ 2. back asks; only the owner takes the window off');
}

// 3. Twice off is harmless, and an empty list says so.
{
  const off = pushBackLayer(() => {});
  off();
  off();
  assert.equal(openBackLayerCount(), 0, 'taking a window off twice changed the list');
  assert.equal(closeTopBackLayer(), false, 'with nothing open back must fall through to the screen');
  console.log('  ✅ 3. off twice is harmless; nothing open → false');
}

// 4. A rewarded ad holds back while it loads, and lets go however it ends.
{
  let finish;
  const pending = watchRewardedAd({ showRewarded: () => new Promise((resolve) => { finish = resolve; }) });
  await Promise.resolve();
  assert.equal(openBackLayerCount(), 1, 'nothing holds the back key while the ad loads — back would leave the screen under the ad');
  assert.equal(closeTopBackLayer(), true, 'back while the ad loads must be taken (and do nothing)');
  assert.equal(openBackLayerCount(), 1, 'back during the ad load ended the hold');
  finish({ rewarded: true });
  assert.deepEqual(await pending, { rewarded: true });
  assert.equal(openBackLayerCount(), 0, 'the hold stayed after the ad was paid — back would do nothing from then on');

  await watchRewardedAd({ showRewarded: async () => { throw new Error('boom'); } });
  assert.equal(openBackLayerCount(), 0, 'the hold stayed after the ad threw — back would do nothing from then on');
  await watchRewardedAd({ showRewarded: async () => ({ rewarded: false, reason: 'closed_early' }) });
  assert.equal(openBackLayerCount(), 0, 'the hold stayed after the ad was closed early');
  console.log('  ✅ 4. a rewarded ad holds back while it loads and lets go after the ad (paid, refused or thrown)');
}

console.log('\nBack layers gate passed');
