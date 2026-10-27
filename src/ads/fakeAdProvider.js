/**
 * fakeAdProvider.js
 * The placeholder that runs during Play closed testing.
 *
 * It reaches no network, loads no SDK, and shows no sponsor. `isReal` is false
 * and that is the truth about it — every placement asks before it draws, so the
 * banner slot says "ad space, placeholder" instead of naming an advertiser that
 * is not there.
 *
 * That honesty is the point. The version this replaced printed
 * "Official Google AdMob Sponsored Ad" in thirteen languages with an AdMob tag
 * beside it, while no AdMob SDK existed anywhere in the project. A player has
 * no way to tell that apart from a real ad, which makes it a false statement to
 * the user and a misuse of Google's name.
 *
 * Rewards ARE granted. The reward path is real product behaviour that has to
 * keep working — hints, revives and past-puzzle unlocks all depend on it — so
 * the placeholder resolves exactly like a completed ad would. Only the
 * advertising is absent.
 */

/** Long enough to feel like a real ad break, short enough not to punish testers. */
const REWARDED_MS = 2500;

export class FakeAdProvider {
  get id() {
    return 'fake';
  }

  /** No network, no SDK, no advertiser. Callers must not claim otherwise. */
  get isReal() {
    return false;
  }

  async init() {
    return true;
  }

  showRewarded() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ rewarded: true, reason: null }), REWARDED_MS);
    });
  }

  /**
   * Nothing is ever loaded, so the win goes straight to the victory screen with
   * no pause. A placeholder that paused the game for an ad that does not exist
   * would look like a freeze to a closed tester.
   */
  preloadInterstitial() {
    return Promise.resolve(false);
  }

  isInterstitialReady() {
    return false;
  }

  showPreparedInterstitial() {
    return Promise.resolve({ shown: false, reason: 'not_ready' });
  }

  /**
   * No advertiser, no banner. The seam has to answer the same calls on both
   * sides or the caller ends up asking which provider it has, which is the
   * branching this seam exists to remove.
   */
  showBanner() {
    return Promise.resolve(false);
  }

  hideBanner() {
    return Promise.resolve();
  }

  /** No SDK, so there is no consent to revisit and no form to open. */
  hasPrivacyOptions() {
    return Promise.resolve(false);
  }

  /** No SDK, no consent state — Analytics stays at its denied defaults. */
  consentInfo() {
    return Promise.resolve(null);
  }

  showPrivacyOptions() {
    return Promise.resolve(false);
  }
}
