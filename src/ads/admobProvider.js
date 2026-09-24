/**
 * admobProvider.js
 * The real one. Not enabled during closed testing — see ads/index.js.
 *
 * This is live now, running against Google's published sample unit ids. Those
 * always return a test ad: no revenue, no impressions on a live unit, and
 * clicking them is not invalid traffic. Clicking your own LIVE ads is, which is
 * how AdMob accounts get suspended — so the sample ids stay until release and
 * the first live impression comes from a real player.
 *
 * There is no import of the plugin package. Capacitor registers native plugins
 * on `window.Capacitor.Plugins` at runtime, so this file compiles and ships
 * fine without `@capacitor-community/admob` installed, and starts working the
 * moment it is. A static import would break the build for everyone until then.
 *
 * GOTCHA that already cost this project once (see Play Games): a Capacitor
 * plugin object is a Proxy, so `await plugin` invokes `plugin.then()` and the
 * native layer answers "PlayGames.then() is not implemented". Only ever await
 * the RESULT OF A METHOD CALL, never the plugin itself.
 */

import { watchRewarded, withTimeout } from './rewardedWatch.js';
import { InterstitialSlot } from './interstitialWatch.js';
import {
  bannerWidth,
  rebuildBannerIfWidthChanged,
  watchBannerWidth,
  stopWatchingBannerWidth,
} from './bannerWidthWatcher.js';
export { BANNER_REBUILD_MIN_INTERVAL_MS } from './bannerWidthWatcher.js';

/**
 * Cancel the navigation-bar inset the AdMob plugin adds on Android 15+.
 *
 * The plugin assumes an edge-to-edge window and pushes the banner up by the
 * navigation bar's height. MainActivity already keeps the WebView above the
 * navigation bar, so the push was applied twice: the banner floated about 50dp
 * above the bottom, over the space the layout had not reserved for it, with a
 * dark band beneath (BACKLOG U-1; measured on a Flip5, Android 16, 2026-09-19).
 * `margin` is applied to the bottom as margin·density + inset, so −inset
 * brings the banner back to the bottom of the WebView.
 */
async function bannerMargin() {
  try {
    const info = window.Capacitor?.Plugins?.NativeInfo;
    if (!info) return 0;
    const { navInsetDp = 0, sdkInt = 0 } = await info.get();
    return sdkInt >= 35 && navInsetDp > 0 ? -navInsetDp : 0;
  } catch {
    return 0;
  }
}

function plugin() {
  if (typeof window === 'undefined') return null;
  const plugins = window.Capacitor && window.Capacitor.Plugins;
  return (plugins && plugins.AdMob) || null;
}

/**
 * Google publishes fixed sample unit ids that always return a test ad. They are
 * what makes it safe to run the real SDK during closed testing: no revenue, no
 * impressions on a live unit, and clicking them is not invalid traffic. Clicking
 * your own LIVE ads is, and that is how accounts get suspended.
 *
 * `isTesting` is passed alongside so the SDK marks the request as a test even if
 * a real unit id is configured. Both signals, not one.
 */
/**
 * 설정값을 읽는 한 곳.
 *
 * Vite 는 빌드 시점에 `import.meta.env.X` 를 literal 로 바꿔 넣는다. 그래서
 * 앱에서는 그것만으로 충분하다. 하지만 Node 에서 이 모듈을 그대로 불러오면
 * `import.meta.env` 가 없고, 그러면 광고 단위 아이디가 빈 문자열이 되어
 * showBanner 가 아무 일도 하지 않고 false 를 돌려준다.
 *
 * 그 침묵이 문제였다. 광고 수명주기를 검사하려고 쓴 첫 판본이 3개 절을
 * 통과했는데, 실제로는 매 절이 "아이디가 없어서 즉시 반환" 을 확인하고 있었다.
 * 통과가 검사의 통과가 아니라 검사가 닿지 못했다는 뜻이었다.
 *
 * `process.env` 를 대체로 읽는다. 브라우저 번들에는 process 가 없으므로
 * typeof 로 막고, 앱 동작은 달라지지 않는다.
 */
function readEnv() {
  const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) || null;
  if (viteEnv) return viteEnv;
  return (typeof process !== 'undefined' && process.env) || {};
}

/**
 * A debuggable APK — `gradlew assembleDebug` — never requests a live ad unit.
 *
 * Capacitor sets `window.Capacitor.DEBUG` from the installed app's
 * FLAG_DEBUGGABLE (Bridge.isDevMode → JSExport.getGlobalJS). A debug APK has it;
 * a release bundle signed for Play does not. So this is decided by what was
 * actually installed, not by an environment variable someone has to remember.
 *
 * Why it has to be structural: every APK this project builds goes onto the
 * developer's own phone (the Flip 5 is the APK device; the Flip 6 runs the store
 * build). .env ships real unit ids with testing off, because that is what
 * production needs. Built as-is, a debug APK would show that phone live ads,
 * and a tap on one is invalid traffic — the path to a suspended AdMob account.
 * On 2026-09-17, after a reinstall, the Flip 5 reported test-device hash B75B…
 * while .env registered DD0A… — which phone that belonged to is not recorded,
 * but the Flip 5 was not covered by it. The first debug APK that day was only
 * safe because the build command overrode the variables by hand.
 */
function isDebugBuild() {
  return typeof window !== 'undefined' && Boolean(window.Capacitor && window.Capacitor.DEBUG === true);
}

function isTestingAds() {
  if (isDebugBuild()) return true;
  const env = readEnv();
  return String(env.VITE_ADMOB_TESTING || '').toLowerCase() === 'true';
}

function unitIds() {
  const env = readEnv();
  return {
    banner: env.VITE_ADMOB_BANNER_ID || '',
    interstitial: env.VITE_ADMOB_INTERSTITIAL_ID || '',
    rewarded: env.VITE_ADMOB_REWARDED_ID || ''
  };
}

/**
 * 우리 기기만 테스트 광고를 받게 한다.
 *
 * `VITE_ADMOB_TESTING` 은 전부 아니면 전무다. `true` 면 모든 이용자가 테스트
 * 광고를 보므로 수익이 0 이고, `false` 면 **우리 기기도 실제 광고를 받는다.**
 * 그 상태에서 우리가 광고를 누르면 무효 트래픽이고, 그것이 AdMob 계정이
 * 정지되는 경로다.
 *
 * 그래서 "테스트하려면 앱을 깔지 말라" 가 답이 될 수 없다. 기기에 깔아서
 * 확인하는 것은 해야 하는 일이다. 구글이 주는 답은 기기를 등록하는 것이고,
 * SDK 문서의 표현 그대로 **"등록된 기기의 요청은 테스트 광고를 받고 무효
 * 트래픽을 생성하지 않는다."** 등록되지 않은 기기는 그대로 실제 광고를 받는다.
 *
 * 기기 ID 는 앱을 한 번 실행하면 logcat 에 찍힌다:
 *   adb logcat | findstr "RequestConfiguration.Builder"
 * 거기 나온 해시를 `.env` 의 `VITE_ADMOB_TEST_DEVICE_IDS` 에 넣는다
 * (쉼표로 여러 개). 이 값은 기기마다 다르고 앱을 지웠다 깔면 바뀔 수 있다.
 *
 * 비어 있으면 아무 기기도 등록하지 않는다 — 그때는 `VITE_ADMOB_TESTING` 이
 * 유일한 방어선이므로, 그것을 끄기 전에 여기를 채우는 것이 순서다.
 */
function testDeviceIds() {
  // No registered devices on a debug build. The plugin uses the real unit id for
  // a registered test device and trusts Google to serve it a test ad; with none
  // registered it substitutes Google's sample unit id (AdViewIdHelper.getFinalAdId).
  // A debug build takes the second path always, so a live unit id never leaves it.
  if (isDebugBuild()) return [];
  const env = readEnv();
  return String(env.VITE_ADMOB_TEST_DEVICE_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 던져진 실패 뒤 다시 시도하기까지 기다리는 시간.
 *
 * 0 이면 화면을 옮길 때마다 동의 정보를 다시 받아오려 들고, 통신이 끊긴
 * 동안에는 그 시도가 실패보다 비싸다. 너무 길면 통신이 돌아와도 광고가
 * 돌아오지 않는다. 30초는 한 판 사이에 한 번 정도 다시 시도하는 간격이다.
 */
const RETRY_AFTER_ERROR_MS = 30000;

export class AdMobProvider {
  constructor() {
    this.initPromise = null;
    /** Set by init(). Null until consent has been resolved one way or the other. */
    this.canRequestAds = null;
    /** 마지막으로 예외가 던져진 시각. 동의 거부에는 쓰지 않는다 — 그건 결론이다. */
    this.transientFailureAt = null;
    /**
     * 배너가 보여야 하는가에 대한 현재 의도.
     *
     * showBanner 는 init() 과 네이티브 호출을 await 한다. 그 사이에 화면이
     * 바뀌어 hideBanner 가 먼저 끝나면, 뒤늦게 깨어난 showBanner 가 숨기라고
     * 한 화면 위에 배너를 띄운다. 배너는 화면 하단에 고정된 네이티브
     * 오버레이라서 지금 보이는 것을 덮는다. 의도를 따로 들고 있어야
     * await 에서 깨어난 쪽이 자기가 낡았는지 알 수 있다.
     */
    this.bannerWanted = false;
    // The native view survives hideBanner; calling showBanner again neither
    // reveals it nor resolves its PluginCall in the installed Android SDK.
    this.bannerCreated = false;
    /** The window width the current banner was built for; a change rebuilds it. */
    this.bannerWidth = 0;
    this.widthWatcher = null;
    this.lastBannerRebuildAt = 0;
    this.rebuildDeferred = null;
    this.bannerQueue = Promise.resolve();
    /** The rewarded flow in progress, so a second tap joins it instead of loading another ad. */
    this.rewardedInFlight = null;
    /**
     * How long to wait for a rewarded ad to load. Without a ceiling a load that
     * never answers leaves the player on a spinner with every button hidden.
     * Instance fields rather than constants so the lifecycle gate can shrink
     * them instead of waiting fifteen real seconds.
     */
    this.rewardLoadTimeoutMs = 15000;
    /** After the reward is earned, how long to wait for the ad to close before trusting the reward anyway. */
    this.rewardDismissGraceMs = 30000;
    /** Absolute ceiling on a shown rewarded ad that reports nothing at all. */
    this.rewardShowCeilingMs = 180000;
    /**
     * The post-game interstitial is loaded ahead of time and shown at the win.
     * Loading at the moment of showing put a second of latency between the
     * player's tap and the ad appearing, which is how an ad lands under a finger
     * still tapping; AdMob asks for ads to be loaded in advance for that reason.
     */
    this.interstitial = new InterstitialSlot();
  }

  get id() {
    return 'admob';
  }

  /**
   * True only when the SDK is actually present AND configured. Selecting this
   * provider is not the same as being able to serve: without the plugin
   * installed or the unit ids set, claiming a real ad would be the same lie the
   * fake provider exists to avoid.
   */
  get isReal() {
    const ids = unitIds();
    return Boolean(plugin() && ids.rewarded && ids.banner);
  }

  /**
   * Consent first, then the SDK.
   *
   * Google decides whether this user is in a region that requires consent; we
   * do not guess from a locale. `canRequestAds` is the SDK's own answer to
   * "may I ask for an ad for this person", and it is the only thing that gates
   * a request — reading the status string ourselves would be re-implementing a
   * judgement the SDK already makes.
   *
   * Anything that goes wrong here turns ads off rather than on. Serving a
   * personalised ad to someone whose consent state could not be read is the
   * failure this whole flow exists to prevent.
   */
  init() {
    if (this.initPromise) return this.initPromise;

    /*
     * 실패를 영구히 기억하지 않는다. 단, 결론이 난 실패는 기억한다.
     *
     * 예전에는 첫 호출의 프로미스를 그대로 캐시했다. 앱을 켠 순간 통신이
     * 끊겨 있으면 동의 정보 조회가 던지고, 그 false 가 프로세스가 사는 동안
     * 캐시된다. 통신이 돌아와도 그 세션 내내 광고가 꺼진 채로 남았다.
     *
     * 그렇다고 전부 다시 시도하면 안 된다. 세 가지 결과를 갈라야 한다:
     *   · 이용자가 동의하지 않았다   → 영구적으로 맞다. 다시 묻는 것이 위반이다.
     *   · 플러그인이 없다 (웹)        → 영구적으로 맞다. 바뀔 일이 없다.
     *   · 예외가 던져졌다             → 일시적일 수 있다. 다시 시도해도 된다.
     *
     * 그래서 catch 에서만 캐시를 비우고, 쿨다운을 둔다. 쿨다운이 없으면
     * 통신이 계속 끊긴 상태에서 화면을 옮길 때마다 동의 폼을 다시 받아오려
     * 들고, 그건 실패보다 비싸다.
     */
    if (this.transientFailureAt && Date.now() - this.transientFailureAt < RETRY_AFTER_ERROR_MS) {
      return Promise.resolve(false);
    }

    this.initPromise = (async () => {
      const admob = plugin();
      if (!admob) return false;
      try {
        let info = await admob.requestConsentInfo();

        if (info?.status === 'REQUIRED' && info?.isConsentFormAvailable) {
          info = await admob.showConsentForm();
        }

        this.canRequestAds = Boolean(info?.canRequestAds);
        if (!this.canRequestAds) {
          console.info('[ads] consent not given; no ads will be requested');
          return false;
        }

        // 등록할 기기가 있을 때만 켠다. 이 플래그는 "전부 테스트" 스위치가
        // 아니라 아래 목록을 테스트 기기로 등록할지 여부다 — 목록이 비어 있는데
        // 켜면 아무 기기도 등록되지 않고 이름만 오해를 부른다.
        const testDevices = testDeviceIds();
        await admob.initialize({
          initializeForTesting: testDevices.length > 0,
          testingDevices: testDevices
        });
        return true;
      } catch (e) {
        this.canRequestAds = false;
        // 일시적 실패로 취급한다 — 캐시를 비워 쿨다운 뒤 다시 시도할 수 있게.
        // 여기서 비워도 이 호출의 반환값은 영향받지 않는다: 바깥의
        // `return this.initPromise` 는 이 async 본문이 돌기 전에 이미 실행됐고,
        // 호출자는 그 프로미스 객체를 들고 있다.
        this.transientFailureAt = Date.now();
        this.initPromise = null;
        console.warn('[ads] consent or initialize failed; ads stay off for now:', e?.message || e);
        return false;
      }
    })();
    return this.initPromise;
  }

  /**
   * The settings entry a user needs to change their mind later. Google requires
   * a way back into the choice for anyone the consent form was shown to.
   */
  /**
   * Whether this user has a consent choice to return to. Only true where the
   * SDK says a privacy options form is required — showing the entry anywhere
   * else would be a menu that does nothing.
   */
  async hasPrivacyOptions() {
    const admob = plugin();
    if (!admob) return false;
    try {
      const info = await admob.requestConsentInfo();
      return info?.privacyOptionsRequirementStatus === 'REQUIRED';
    } catch (e) {
      console.warn('[ads] could not read consent state:', e?.message || e);
      return false;
    }
  }

  async showPrivacyOptions() {
    const admob = plugin();
    if (!admob) return false;
    try {
      await admob.showPrivacyOptionsForm();
      return true;
    } catch (e) {
      console.warn('[ads] privacy options form failed:', e?.message || e);
      return false;
    }
  }

  /**
   * Resolves { rewarded, reason } — always, whatever the ad does.
   *
   *   rewarded true   reason null
   *   rewarded false  reason 'dismissed'       closed before the reward
   *                   reason 'unavailable'     no plugin, no consent, failed or slow to load
   *                   reason 'failed_to_show'  loaded but could not be shown
   *
   * "Always" is the point. Awaiting showRewardVideoAd() directly left the
   * promise pending forever when the ad was closed early, and the game-over
   * modal sat on a spinner with every button hidden. See rewardedWatch.js.
   */
  showRewarded() {
    if (this.rewardedInFlight) return this.rewardedInFlight;
    const run = this.runRewarded().finally(() => {
      this.rewardedInFlight = null;
    });
    this.rewardedInFlight = run;
    return run;
  }

  async runRewarded() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.rewarded) return { rewarded: false, reason: 'unavailable' };
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return { rewarded: false, reason: 'unavailable' };

    try {
      await withTimeout(
        admob.prepareRewardVideoAd({ adId: ids.rewarded, isTesting: isTestingAds() }),
        this.rewardLoadTimeoutMs,
      );
    } catch (e) {
      console.warn('[ads] rewarded ad did not load:', e?.message || e);
      return { rewarded: false, reason: 'unavailable' };
    }
    return watchRewarded(admob, {
      dismissGraceMs: this.rewardDismissGraceMs,
      showCeilingMs: this.rewardShowCeilingMs,
    });
  }


  /**
   * The banner is a native overlay pinned to the bottom of the screen, not an
   * element inside the WebView. AdBanner reserves the height so the overlay does
   * not sit on top of the keypad; this puts the ad in that space.
   */
  async showBanner() {
    // 의도를 먼저, 동기적으로 세운다. await 뒤에 세우면 그 사이에 들어온
    // hideBanner 를 덮어쓴다.
    this.bannerWanted = true;

    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.banner) return false;
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    // 기다리는 동안 화면이 바뀌었으면 여기서 멈춘다. 이 확인이 없으면
    // 숨기라고 한 화면 위에 배너가 뜬다.
    if (!this.bannerWanted) return false;
    if (!this.canRequestAds) return false;
    // The slot AdBanner reserves has to be as tall as the banner the SDK draws.
    // A fixed 52px was shorter than the adaptive banner on wide phones (about 64
    // at 412dp), so the overlay covered the top of the keypad (BACKLOG U-1).
    // The SDK reports the real size in dp, which is CSS px in the WebView.
    this.watchBannerWidth();
    if (!this.sizeListener && typeof admob.addListener === 'function') {
      this.sizeListener = admob.addListener('bannerAdSizeChanged', (info) => {
        const h = Number(info?.height) || 0;
        if (h > 0) document.documentElement.style.setProperty('--ad-banner-h', `${h}px`);
      });
    }
    try {
      return await this.queueBanner(async () => {
        // A previous native operation may have kept this request waiting.
        if (!this.bannerWanted) return false; // Recheck after waiting for native work.
        if (this.bannerCreated) {
          await admob.resumeBanner();
        } else {
          this.bannerWidth = bannerWidth();
          await admob.showBanner({
            adId: ids.banner,
            adSize: 'ADAPTIVE_BANNER',
            position: 'BOTTOM_CENTER',
            margin: await bannerMargin(),
            isTesting: isTestingAds()
          });
          this.bannerCreated = true;
        }
        // Do not enqueue this cleanup behind the operation that is awaiting it.
        if (!this.bannerWanted) {
          await admob.hideBanner();
          return false;
        }
        return true;
      });
    } catch (e) {
      // A banner that fails to load must not take the screen with it. The
      // reserved space stays empty and the game keeps working.
      console.warn('[ads] banner failed:', e?.message || e);
      return false;
    }
  }

  /**
   * Rebuild the banner when the window changed width, and watch for that.
   *
   * The policy lives in bannerWidthWatcher.js; what stays here is the native
   * plugin and the queue it has to go through. Both are kept as methods because
   * the watcher calls back into provider.rebuildBannerIfWidthChanged() when a
   * deferred rebuild comes due.
   */
  rebuildBannerIfWidthChanged() {
    return rebuildBannerIfWidthChanged(this, plugin());
  }

  watchBannerWidth() {
    watchBannerWidth(this);
  }

  async hideBanner() {
    // 의도를 먼저, 동기적으로. 이 대입이 await 뒤로 밀리면 진행 중인
    // showBanner 가 자기가 낡았다는 것을 알 방법이 없다.
    this.bannerWanted = false;
    stopWatchingBannerWidth(this);

    const admob = plugin();
    if (!admob) return;
    try {
      await this.queueBanner(() => admob.hideBanner());
    } catch (e) {
      console.warn('[ads] hideBanner failed:', e?.message || e);
    }
  }

  queueBanner(operation) {
    const pending = this.bannerQueue.then(operation);
    // A rejected native call must not poison later show/hide requests.
    this.bannerQueue = pending.catch(() => {});
    return pending;
  }

  isInterstitialReady(now = Date.now()) {
    return this.interstitial.isReady(now);
  }

  /** Load the post-game interstitial now so it can be shown without delay at the win. */
  async preloadInterstitial() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.interstitial) return false;
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return false;
    return this.interstitial.load(() =>
      admob.prepareInterstitial({ adId: ids.interstitial, isTesting: isTestingAds() }));
  }

  /** Show what preloadInterstitial loaded; resolves { shown, reason } once it has closed. */
  async showPreparedInterstitial() {
    return this.interstitial.show(plugin());
  }
}
