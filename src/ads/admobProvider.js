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

function isTestingAds() {
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

  async showRewarded() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.rewarded) return { rewarded: false };
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return { rewarded: false };
    try {
      await admob.prepareRewardVideoAd({ adId: ids.rewarded, isTesting: isTestingAds() });
      const result = await admob.showRewardVideoAd();
      // The SDK reports the reward it granted; no reward object means the
      // player closed the ad early and is owed nothing.
      return { rewarded: Boolean(result && (result.type || result.amount)) };
    } catch (e) {
      console.warn('[ads] rewarded ad failed:', e?.message || e);
      return { rewarded: false };
    }
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
    try {
      await admob.showBanner({
        adId: ids.banner,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: isTestingAds()
      });
      // 네이티브 호출이 도는 동안에도 화면은 바뀔 수 있다. 그때는 이미 떠버린
      // 배너를 되돌린다 — 의도가 '숨김' 인데 화면에 남아 있게 두지 않는다.
      if (!this.bannerWanted) {
        await this.hideBanner();
        return false;
      }
      return true;
    } catch (e) {
      // A banner that fails to load must not take the screen with it. The
      // reserved space stays empty and the game keeps working.
      console.warn('[ads] banner failed:', e?.message || e);
      return false;
    }
  }

  async hideBanner() {
    // 의도를 먼저, 동기적으로. 이 대입이 await 뒤로 밀리면 진행 중인
    // showBanner 가 자기가 낡았다는 것을 알 방법이 없다.
    this.bannerWanted = false;

    const admob = plugin();
    if (!admob) return;
    try {
      await admob.hideBanner();
    } catch (e) {
      console.warn('[ads] hideBanner failed:', e?.message || e);
    }
  }

  async showInterstitial() {
    const admob = plugin();
    const ids = unitIds();
    if (!admob || !ids.interstitial) return;
    // init() resolves consent. Without it we do not know whether this user may
    // be shown an ad at all, and asking anyway is the violation.
    await this.init();
    if (!this.canRequestAds) return;
    try {
      await admob.prepareInterstitial({ adId: ids.interstitial, isTesting: isTestingAds() });
      await admob.showInterstitial();
    } catch (e) {
      console.warn('[ads] interstitial failed:', e?.message || e);
    }
  }
}
