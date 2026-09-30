/**
 * test_ad_lifecycle_races.js
 * QA Gate: 광고 초기화와 배너 표시가 시간 순서에 지지 않는다.
 *
 * ── 이 게이트가 생긴 이유 ────────────────────────────────────────────────
 * 게이트 2-10(Ad Honesty) 은 화면이 하는 '주장' 을 본다 — 광고주가 없는데
 * 광고라고 적어두지 않았는가, 모든 배치가 정말 제공자를 거치는가. 정적
 * 검사이고, 그 일은 잘 한다.
 *
 * 잘 하지 못하는 일이 있다. 코드가 옳은 순서로 적혀 있어도 await 두 개가
 * 엇갈리면 결과가 달라지는 종류의 결함은 소스를 읽어서 찾을 수 없다.
 * 교차 검토에서 두 건이 나왔고 둘 다 실물이었다:
 *
 *   1. init() 이 첫 호출의 프로미스를 영구히 캐시했다. 앱을 켠 순간 통신이
 *      끊겨 있으면 동의 정보 조회가 던지고, 그 false 가 프로세스가 사는
 *      동안 남는다. 통신이 돌아와도 그 세션 내내 광고가 꺼져 있었다.
 *      이 실패는 화면에 아무 흔적을 남기지 않는다 — 광고가 없는 것과
 *      광고를 못 받는 것이 이용자에게 똑같이 보인다.
 *
 *   2. showBanner() 가 init() 을 await 하는 동안 화면이 바뀌면, 뒤늦게
 *      깨어난 쪽이 hideBanner() 를 지나쳐 배너를 띄웠다. 배너는 화면 하단에
 *      고정된 네이티브 오버레이라서 지금 보이는 화면을 덮는다.
 *
 * 그래서 이 게이트는 가짜 Capacitor 플러그인을 끼우고 실제 제공자를 돌린다.
 * 플러그인 응답이 언제 풀리는지를 검사가 직접 잡고 있으므로, 기기에서 한 번에
 * 한 번 정도 일어나는 엇갈림을 매번 재현할 수 있다.
 */

import assert from 'assert';

console.log('======================================================');
console.log('🧪 광고 수명주기 경합 — init 캐시와 배너 표시/숨김');
console.log('======================================================\n');

// ── 가짜 Capacitor AdMob 플러그인 ────────────────────────────────────────
// 응답을 손으로 풀 수 있게 만든다. setTimeout 으로 흉내내면 엇갈림이
// 타이밍에 따라 나타나기도 하고 안 나타나기도 하는 검사가 된다.
function makeStub() {
  const calls = [];
  let releaseConsent = null;
  let releaseHide = null;
  const stub = {
    consentThrows: false,
    requestConsentInfo() {
      calls.push('requestConsentInfo');
      if (stub.consentThrows) return Promise.reject(new Error('network down'));
      return new Promise((resolve) => {
        releaseConsent = () => resolve({ status: 'OBTAINED', canRequestAds: true });
      });
    },
    initialize() { calls.push('initialize'); return Promise.resolve(); },
    showBanner() { calls.push('showBanner'); return Promise.resolve(); },
    hideBanner() {
      calls.push('hideBanner');
      // 네이티브 숨김이 아직 끝나지 않은 상태를 만들 수 있어야 한다. 그 틈이
      // 없으면 "의도를 await 뒤에 세운다" 는 결함을 재현할 수 없다.
      if (!stub.holdHide) return Promise.resolve();
      return new Promise((resolve) => { releaseHide = resolve; });
    },
  };
  return {
    stub,
    calls,
    release: () => releaseConsent && releaseConsent(),
    releaseHide: () => releaseHide && releaseHide(),
  };
}

globalThis.window = globalThis;

/*
 * 광고 단위 아이디를 넣어준다. 없으면 showBanner 가 init 에 닿기도 전에
 * `if (!admob || !ids.banner) return false` 로 빠지고, 이 검사는 경합 대신
 * "아이디가 없다" 를 확인하게 된다. 첫 판본이 실제로 그랬다 — 세 절이
 * 통과했는데 어느 절도 검사 대상에 닿지 못했다.
 *
 * 진짜 아이디가 아니라 형태만 갖춘 값이다. 여기서 네트워크로 나가는 것은
 * 없고, 플러그인 자체가 가짜다.
 */
process.env.VITE_ADMOB_BANNER_ID = 'ca-app-pub-0000000000000000/0000000001';
process.env.VITE_ADMOB_INTERSTITIAL_ID = 'ca-app-pub-0000000000000000/0000000002';
process.env.VITE_ADMOB_REWARDED_ID = 'ca-app-pub-0000000000000000/0000000003';
process.env.VITE_ADMOB_TESTING = 'true';

const PROVIDER = new URL('../../../src/ads/admobProvider.js', import.meta.url).href;

/**
 * 쿨다운보다 확실히 긴 시간. 제공자의 상수를 여기에 베껴 적지 않는다 —
 * 그러면 상수가 바뀔 때 이 검사가 조용히 낡는다. 넉넉히 크게 잡아
 * 어떤 합리적 쿨다운보다 길게 만드는 것으로 충분하다.
 */
const RETRY_LONGER_THAN_COOLDOWN_MS = 60 * 60 * 1000;

/** 각 시나리오는 새 모듈 인스턴스를 쓴다. 캐시가 시나리오를 넘어가면 안 된다. */
let instance = 0;
async function newProvider(stub) {
  globalThis.window.Capacitor = { Plugins: { AdMob: stub } };
  const mod = await import(`${PROVIDER}?case=${++instance}`);
  return new mod.AdMobProvider();
}

// ── 1. 던져진 실패는 영구적이지 않다 ──────────────────────────────────────
console.log('▶ 1. 통신 실패 뒤 다시 시도할 수 있다');
{
  const { stub, calls } = makeStub();
  stub.consentThrows = true;
  const p = await newProvider(stub);

  assert.strictEqual(await p.init(), false, '통신이 끊긴 첫 시도는 false 여야 한다');
  assert.strictEqual(p.initPromise, null,
    '던져진 실패는 캐시에 남아서는 안 된다. 남으면 통신이 돌아와도 이 세션 내내 ' +
    '광고가 꺼진 채로 있고, 그 사실이 화면에 드러나지 않는다.');

  // 쿨다운 안에서는 다시 묻지 않는다 — 실패보다 비싼 재시도를 반복하지 않기 위해.
  const before = calls.length;
  assert.strictEqual(await p.init(), false, '쿨다운 안에서는 여전히 false');
  assert.strictEqual(calls.length, before,
    '쿨다운 안에서 동의 정보를 다시 받아오면, 통신이 끊긴 동안 화면을 옮길 때마다 ' +
    '조회가 되풀이된다');

  // 쿨다운이 지나면 다시 시도한다. 스텁을 성공 응답으로 바꿔 두고, 재시도가
  // 플러그인에 도달했는지와 결과가 true 인지를 본다.
  p.transientFailureAt = Date.now() - RETRY_LONGER_THAN_COOLDOWN_MS;
  stub.consentThrows = false;
  stub.requestConsentInfo = () => {
    calls.push('requestConsentInfo');
    return Promise.resolve({ status: 'OBTAINED', canRequestAds: true });
  };
  assert.strictEqual(await p.init(), true,
    '쿨다운이 지난 뒤 통신이 돌아왔으면 초기화가 성공해야 한다. 실패를 영구히 ' +
    '캐시하던 코드에서는 여기가 영원히 false 였다.');
  assert(calls.length > before, '재시도가 실제로 플러그인에 도달해야 한다');
  console.log('  ✅ 던져진 실패는 쿨다운 뒤 재시도되고, 쿨다운 안에서는 조용하다');
}

// ── 2. 동의 거부는 영구적이다 ─────────────────────────────────────────────
console.log('▶ 2. 동의하지 않은 이용자에게는 다시 묻지 않는다');
{
  const { stub, calls } = makeStub();
  stub.requestConsentInfo = () => {
    calls.push('requestConsentInfo');
    return Promise.resolve({ status: 'OBTAINED', canRequestAds: false });
  };
  const p = await newProvider(stub);

  assert.strictEqual(await p.init(), false, '동의가 없으면 false');
  assert(p.initPromise, '동의 거부는 결론이므로 캐시되어야 한다');
  const before = calls.length;
  await p.init();
  await p.init();
  assert.strictEqual(calls.length, before,
    '동의하지 않은 이용자에게 동의 폼을 되풀이해 묻는 것은 재시도가 아니라 위반이다. ' +
    '일시적 실패와 결론난 거부를 같이 취급하면 이 경계가 무너진다.');
  assert.strictEqual(await p.showBanner(), false, '동의가 없으면 배너도 뜨지 않는다');
  console.log('  ✅ 동의 거부는 한 번만 묻고 영구히 기억한다');
}

// ── 3. 기다리는 사이 화면이 바뀌면 배너를 띄우지 않는다 ───────────────────
console.log('▶ 3. init 을 기다리는 중에 숨기라고 하면 배너가 뜨지 않는다');
{
  const { stub, calls, release } = makeStub();
  const p = await newProvider(stub);

  // 화면이 배너를 요청한다. init 의 동의 조회가 아직 풀리지 않았다.
  const showing = p.showBanner();
  await Promise.resolve();
  assert(calls.includes('requestConsentInfo'), 'showBanner 는 init 을 거쳐야 한다');
  assert(!calls.includes('showBanner'), '아직 배너를 띄우지 않았다');

  // 이용자가 화면을 벗어난다. 아직 뜨지 않은 배너를 숨기라고 한다.
  await p.hideBanner();

  // 이제 동의 조회가 풀린다 — 뒤늦게 깨어난 showBanner 가 이어서 돈다.
  release();
  const result = await showing;

  assert.strictEqual(result, false,
    'showBanner 는 자기가 낡았다는 것을 알고 false 를 돌려야 한다');
  assert(!calls.includes('showBanner'),
    '기다리는 사이 숨기라고 했는데 배너를 띄웠다. 배너는 화면 하단에 고정된 ' +
    '네이티브 오버레이라서 지금 보이는 화면 위에 얹힌다 — 게임판을 가리거나 ' +
    '설정 화면 아래 붙어 앉는다. 의도를 await 앞에서 동기적으로 세우고, ' +
    'await 에서 깨어난 뒤 다시 확인해야 한다.');
  console.log('  ✅ 낡은 showBanner 는 스스로 물러난다');
}

// ── 4. 순서가 반대면 배너가 떠야 한다 ─────────────────────────────────────
// 3번을 "항상 안 띄운다" 로 통과시킬 수 없게 만드는 짝이다. 숨김이 먼저
// 오지 않았다면 배너는 정상적으로 떠야 한다.
console.log('▶ 4. 숨김이 오지 않았다면 배너는 정상적으로 뜬다');
{
  const { stub, calls, release } = makeStub();
  const p = await newProvider(stub);
  const showing = p.showBanner();
  await Promise.resolve();
  release();
  assert.strictEqual(await showing, true, '숨김이 없었으면 배너가 떠야 한다');
  assert(calls.includes('showBanner'), '플러그인의 showBanner 가 실제로 불려야 한다');
  console.log('  ✅ 정상 경로는 그대로 동작한다');
}

// ── 5. 숨김이 아직 진행 중일 때도 배너가 뜨지 않는다 ──────────────────────
//
// 3번만으로는 부족하다. 3번은 hideBanner 의 완료를 기다리므로, 의도를 세우는
// 대입이 await 앞에 있든 뒤에 있든 결과가 같다. 실제로 변이 검사에서 그
// 결함이 SURVIVED 로 나왔다.
//
// 기기에서 일어나는 일은 이쪽이다. 화면 전환은 배너를 숨기라고 부르고 곧바로
// 다음 화면을 그린다 — 네이티브 숨김이 끝날 때까지 기다려주지 않는다. 그
// 사이에 init 이 풀리면, 의도가 아직 '표시' 로 남아 있는 showBanner 가
// 깨어나 배너를 띄운다. 그래서 대입은 반드시 await 앞, 동기적이어야 한다.
console.log('▶ 5. 숨김이 아직 끝나지 않았어도 배너가 뜨지 않는다');
{
  const { stub, calls, release, releaseHide } = makeStub();
  stub.holdHide = true;
  const p = await newProvider(stub);

  const showing = p.showBanner();
  await Promise.resolve();
  assert(!calls.includes('showBanner'), '아직 배너를 띄우지 않았다');

  // 화면 전환이 숨김을 부르고 기다리지 않는다. 네이티브 숨김은 진행 중이다.
  const hiding = p.hideBanner();
  await Promise.resolve();
  assert(calls.includes('hideBanner'), '숨김이 플러그인까지 도달해야 한다');

  // 숨김이 아직 끝나지 않은 상태에서 동의가 풀린다.
  release();
  // 숨김을 끝낸 뒤에 판정한다. 22 부터 배너 호출은 큐(queueBanner)로 한 줄로 서므로,
  // 낡은 showBanner 가 물러나지 않으면 숨김 뒤에 줄을 서서 기다린다 — 숨김을 붙잡은 채
  // `await showing` 을 하면 판정 대신 테스트가 멈췄다(2026-09-30 전체 변이 감사의
  // WRONG_REASON: 결함은 잡았지만 "unsettled top-level await" 로). 그래서 먼저 몇 틱을
  // 흘려 그동안 배너가 안 떴는지 보고, 숨김을 풀고, 그 뒤 결과를 본다.
  for (let i = 0; i < 5; i++) await Promise.resolve();
  assert(!calls.includes('showBanner'),
    '숨김이 아직 끝나지 않았는데 배너를 띄웠다.');
  releaseHide();
  await hiding;
  const result = await Promise.race([
    showing,
    new Promise((resolve) => setTimeout(() => resolve('timeout'), 2000)),
  ]);

  assert.notStrictEqual(result, 'timeout', 'showBanner 가 숨김이 끝난 뒤에도 끝나지 않았다');
  assert.strictEqual(result, false,
    '숨김이 진행 중이면 showBanner 는 물러나야 한다');
  assert(!calls.includes('showBanner'),
    '숨김이 끝나자 배너를 띄웠다. 의도를 세우는 대입이 await 뒤에 ' +
    '있으면 진행 중인 showBanner 가 자기가 낡았다는 것을 알 방법이 없다. ' +
    '화면 전환은 네이티브 숨김이 끝날 때까지 기다려주지 않으므로, 이것이 기기에서 ' +
    '실제로 일어나는 순서다.');
  console.log('  ✅ 진행 중인 숨김도 낡은 showBanner 를 막는다');
}

// ── 6. 보상형 광고는 무슨 일이 있어도 끝난다 ─────────────────────────────
//
// @capacitor-community/admob 8.1.0 의 안드로이드 구현은 showRewardVideoAd 의
// 약속을 **보상을 받았을 때만** resolve 한다. 닫힘(Dismissed)과 표시 실패
// (FailedToShow)는 이벤트만 쏘고 약속은 건드리지 않는다. 그래서 광고를 중간에
// 닫으면 `await showRewardVideoAd()` 가 영원히 끝나지 않았고, 부활 창은 버튼을
// 모두 숨긴 채 스피너만 돌았다 — 다시 시작도, 홈도 못 누르는 상태.
//
// 기기에서 한 번 닫아보면 재현되지만 그 경로는 한 번도 실기 검증된 적이 없다
// (2026-09-05 기록은 보상 받는 경로뿐). 가짜 플러그인이 네이티브와 같은 방식으로
// 움직이게 만들고 — 보상 때만 약속을 풀고, 나머지는 이벤트만 — 각 경로가
// 정해진 시간 안에 끝나는지를 본다.
console.log('▶ 6. 보상형 광고: 닫든 실패하든 결과가 돌아온다');

function makeRewardStub() {
  const listeners = new Map();
  const ctl = { prepareMode: 'resolve', prepareCalls: 0, showCalls: 0 };
  let resolveShow = null;
  let rejectShow = null;
  const stub = {
    requestConsentInfo: () => Promise.resolve({ status: 'OBTAINED', canRequestAds: true }),
    initialize: () => Promise.resolve(),
    addListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
      return Promise.resolve({ remove: () => { listeners.get(name).delete(fn); return Promise.resolve(); } });
    },
    prepareRewardVideoAd() {
      ctl.prepareCalls++;
      if (ctl.prepareMode === 'reject') return Promise.reject(new Error('No fill'));
      if (ctl.prepareMode === 'hang') return new Promise(() => {});
      return Promise.resolve({ adUnitId: 'stub' });
    },
    // 네이티브와 같다: 이 약속은 보상 때만 풀린다. 닫힘·실패는 풀지 않는다.
    showRewardVideoAd() {
      ctl.showCalls++;
      return new Promise((resolve, reject) => { resolveShow = resolve; rejectShow = reject; });
    },
  };
  const emit = (name, data = {}) => {
    for (const fn of [...(listeners.get(name) || [])]) fn(data);
  };
  return {
    stub,
    ctl,
    emit,
    earn: () => {
      emit('onRewardedVideoAdReward', { type: 'Reward', amount: 1 });
      resolveShow({ type: 'Reward', amount: 1 });
    },
    rejectShow: (e) => rejectShow(e),
    resolveShowWith: (v) => resolveShow(v),
    listenerCount: () => [...listeners.values()].reduce((n, s) => n + s.size, 0),
  };
}

/** `promise` 가 ms 안에 끝났는지. 끝나지 않는 약속을 기다리다 게이트가 멈추지 않게 한다. */
async function within(promise, ms) {
  let timer;
  const late = new Promise((r) => { timer = setTimeout(() => r({ settled: false }), ms); });
  const out = await Promise.race([promise.then((value) => ({ settled: true, value })), late]);
  clearTimeout(timer);
  return out;
}
const tick = () => new Promise((r) => setTimeout(r, 0));
async function untilShown(ctl) {
  for (let i = 0; i < 50 && ctl.showCalls === 0; i++) await tick();
  assert.strictEqual(ctl.showCalls, 1, '광고 표시까지 도달해야 한다 — 닿지 못한 검사는 아무것도 증명하지 않는다');
}
async function rewardProvider(r) {
  const p = await newProvider(r.stub);
  // 실제 값(15초 · 30초 · 3분)을 기다리지 않도록 줄인다. 시간 초과 검사가 아닌
  // 절에서는 넉넉히 두어, 타이머가 아니라 이벤트가 결과를 냈다는 것을 보장한다.
  p.rewardLoadTimeoutMs = 5000;
  p.rewardDismissGraceMs = 5000;
  p.rewardShowCeilingMs = 5000;
  return p;
}
const SETTLE_MS = 500;

{
  // 6a. 보상 없이 닫힘. 출하된 결함 — 여기서 영원히 멈췄다. 맨 앞에 둔다:
  //     이 결함을 되살렸을 때 다른 절이 먼저 터지면 원인이 가려진다.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  const run = p.showRewarded();
  await untilShown(r.ctl);
  r.emit('onRewardedVideoAdDismissed');
  const done = await within(run, SETTLE_MS);
  assert(done.settled,
    '광고를 중간에 닫았는데 결과가 돌아오지 않는다. 플러그인은 이 경우 약속을 풀지 ' +
    '않으므로 닫힘 이벤트를 들어야 한다. 이것이 출하된 결함이다 — 부활 창이 버튼을 ' +
    '숨긴 채 스피너만 돌았다.');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'dismissed' }, '중간에 닫으면 보상 없음, 이유는 dismissed');
  assert.strictEqual(r.listenerCount(), 0, '닫힌 뒤 리스너가 남아 있다');
  console.log('  ✅ 보상 없이 닫힘: 멈추지 않고 dismissed 로 끝난다');
}
{
  // 6b. 보상 → 닫힘. 보상 순간이 아니라 닫힌 뒤에 끝나야 한다.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  const run = p.showRewarded();
  await untilShown(r.ctl);
  r.earn();
  const early = await within(run, 50);
  assert.strictEqual(early.settled, false,
    '보상 이벤트 순간에 끝났다. 광고가 아직 화면에 있는데 부활·힌트가 적용되면 ' +
    '게임판이 광고 뒤에서 바뀐다. 닫힘까지 기다려야 한다.');
  r.emit('onRewardedVideoAdDismissed');
  const done = await within(run, SETTLE_MS);
  assert(done.settled, '보상 후 닫혔는데 결과가 돌아오지 않았다');
  assert.deepStrictEqual(done.value, { rewarded: true, reason: null }, '끝까지 본 광고는 보상이다');
  assert.strictEqual(r.listenerCount(), 0, '끝난 뒤에도 리스너가 남아 있다 — 다음 광고의 이벤트를 이 흐름이 받는다');
  console.log('  ✅ 보상 → 닫힘: 닫힌 뒤에 보상으로 끝나고 리스너를 정리한다');
}
{
  // 6c. 불러왔지만 띄우지 못함 — 이것도 이벤트만 온다.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  const run = p.showRewarded();
  await untilShown(r.ctl);
  r.emit('onRewardedVideoAdFailedToShow', { code: 0, message: 'show failed' });
  const done = await within(run, SETTLE_MS);
  assert(done.settled, '표시 실패 이벤트가 왔는데 결과가 돌아오지 않는다');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'failed_to_show' });
  console.log('  ✅ 표시 실패: failed_to_show 로 끝난다');
}
{
  // 6d. 불러오기 실패 (no fill). 「준비 중」 심사 동안 흔해지는 경우.
  const r = makeRewardStub();
  r.ctl.prepareMode = 'reject';
  const p = await rewardProvider(r);
  const done = await within(p.showRewarded(), SETTLE_MS);
  assert(done.settled, '불러오기가 실패했는데 결과가 돌아오지 않는다');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'unavailable' });
  assert.strictEqual(r.ctl.showCalls, 0, '불러오지 못한 광고를 띄우려 하면 안 된다');
  console.log('  ✅ 불러오기 실패: unavailable, 표시는 시도하지 않는다');
}
{
  // 6e. 불러오기가 응답하지 않음 — 시간 제한이 없으면 여기서도 멈춘다.
  const r = makeRewardStub();
  r.ctl.prepareMode = 'hang';
  const p = await rewardProvider(r);
  p.rewardLoadTimeoutMs = 30;
  const done = await within(p.showRewarded(), SETTLE_MS);
  assert(done.settled, '응답 없는 불러오기에 시간 제한이 없다. 스피너가 끝나지 않는다.');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'unavailable' });
  assert.strictEqual(r.ctl.showCalls, 0, '시간이 지난 불러오기 뒤에 표시를 시도하면 안 된다');
  console.log('  ✅ 불러오기 무응답: 시간 제한 뒤 unavailable');
}
{
  // 6f. 보상은 받았는데 닫힘 이벤트가 끝내 오지 않음 — 받은 보상은 줘야 한다.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  p.rewardDismissGraceMs = 30;
  const run = p.showRewarded();
  await untilShown(r.ctl);
  r.earn();
  const done = await within(run, SETTLE_MS);
  assert(done.settled, '보상 후 닫힘 이벤트가 없으면 결과가 영영 안 온다');
  assert.deepStrictEqual(done.value, { rewarded: true, reason: null }, '받은 보상을 이벤트 누락 때문에 뺏으면 안 된다');
  console.log('  ✅ 보상 후 닫힘 누락: 유예 뒤 보상으로 끝난다');
}
{
  // 6g. 아무 신호도 없음 — 마지막 상한.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  p.rewardShowCeilingMs = 40;
  const run = p.showRewarded();
  await untilShown(r.ctl);
  const done = await within(run, SETTLE_MS);
  assert(done.settled, '표시된 광고가 아무것도 알리지 않으면 영원히 기다린다');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'failed_to_show' });
  console.log('  ✅ 무신호: 상한 뒤 failed_to_show');
}
{
  // 6h. 보상 뒤에 표시 호출이 reject — 받은 보상은 그대로.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  const run = p.showRewarded();
  await untilShown(r.ctl);
  r.emit('onRewardedVideoAdReward', { type: 'Reward', amount: 1 });
  r.rejectShow(new Error('late native error'));
  const done = await within(run, SETTLE_MS);
  assert(done.settled, '보상 뒤 오류에 결과가 돌아오지 않는다');
  assert.deepStrictEqual(done.value, { rewarded: true, reason: null }, '보상 뒤에 난 오류가 보상을 되돌리면 안 된다');
  console.log('  ✅ 보상 뒤 오류: 보상 유지');
}
{
  // 6i. 웹 구현: 광고 없이 { type: '', amount: 0 } 을 즉시 돌려준다.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  const run = p.showRewarded();
  await untilShown(r.ctl);
  r.resolveShowWith({ type: '', amount: 0 });
  const done = await within(run, SETTLE_MS);
  assert(done.settled, '빈 응답에 결과가 돌아오지 않는다 — 상한까지 스피너가 돈다');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'unavailable' }, '광고를 안 보여준 응답은 보상이 아니다');
  console.log('  ✅ 빈 보상 응답: 보상 아님, 바로 끝난다');
}
{
  // 6j. 연타 — 두 번째 탭은 진행 중인 흐름에 합류한다.
  const r = makeRewardStub();
  const p = await rewardProvider(r);
  const first = p.showRewarded();
  const second = p.showRewarded();
  assert.strictEqual(first, second, '진행 중에 다시 부르면 같은 흐름이어야 한다');
  await untilShown(r.ctl);
  assert.strictEqual(r.ctl.prepareCalls, 1, '연타가 광고를 두 번 불러오면 안 된다');
  r.emit('onRewardedVideoAdDismissed');
  await within(first, SETTLE_MS);
  const third = p.showRewarded();
  assert.notStrictEqual(third, first, '끝난 뒤에는 새 흐름이 시작되어야 한다 — 영원히 옛 결과를 돌려주면 안 된다');
  r.ctl.prepareMode = 'reject';
  await within(third, SETTLE_MS);
  console.log('  ✅ 연타: 한 번만 불러오고, 끝나면 다음 요청을 받는다');
}
{
  // 6k. 동의가 없으면 요청도 안 하고 unavailable.
  const r = makeRewardStub();
  r.stub.requestConsentInfo = () => Promise.resolve({ status: 'OBTAINED', canRequestAds: false });
  const p = await rewardProvider(r);
  const done = await within(p.showRewarded(), SETTLE_MS);
  assert(done.settled, '동의가 없을 때 결과가 돌아오지 않는다');
  assert.deepStrictEqual(done.value, { rewarded: false, reason: 'unavailable' });
  assert.strictEqual(r.ctl.prepareCalls, 0, '동의 없이 광고를 불러오면 위반이다');
  console.log('  ✅ 동의 없음: 요청 없이 unavailable');
}

// ── 7. 디버그 APK 는 진짜 광고 단위를 요청하지 않는다 ──────────────────────
//
// 이 프로젝트가 만드는 APK 는 전부 개발자 폰에 깔린다. .env 는 프로덕션용이라
// 실제 단위 ID 에 테스트 꺼짐이고, 그대로 빌드하면 개발자 폰이 실제 광고를
// 받는다 — 누르면 무효 트래픽이다. 2026-09-17 플립5 는 재설치 뒤 .env 에 등록된
// 테스트 기기 해시와 다른 해시를 보고했다. 그날 첫 디버그 APK 가 안전했던 것은
// 빌드 명령에 변수를 손으로 덮어썼기 때문뿐이다.
//
// 그래서 판정을 사람의 기억에서 설치된 앱으로 옮겼다. Capacitor 가 FLAG_DEBUGGABLE
// 로 window.Capacitor.DEBUG 를 세운다. 여기서는 .env 를 프로덕션과 같게 두고,
// DEBUG 가 켜졌을 때 세 광고 모두 테스트로 요청되고 등록 기기가 비는지, 꺼졌을
// 때는 .env 그대로인지를 본다. 둘째 절이 없으면 "항상 테스트" 로도 통과한다 —
// 그러면 프로덕션 수익이 0 이 된다.
console.log('▶ 7. 디버그 빌드는 .env 와 무관하게 테스트 광고만 요청한다');
{
  const saved = { t: process.env.VITE_ADMOB_TESTING, d: process.env.VITE_ADMOB_TEST_DEVICE_IDS };
  process.env.VITE_ADMOB_TESTING = 'false';
  process.env.VITE_ADMOB_TEST_DEVICE_IDS = 'REGISTERED_HASH_FROM_ENV';

  const requestsFor = async (debug) => {
    const seen = {};
    const stub = {
      requestConsentInfo: () => Promise.resolve({ status: 'OBTAINED', canRequestAds: true }),
      initialize: (o) => { seen.initialize = o; return Promise.resolve(); },
      showBanner: (o) => { seen.banner = o; return Promise.resolve(); },
      hideBanner: () => Promise.resolve(),
      prepareInterstitial: (o) => { seen.interstitial = o; return Promise.resolve(); },
      showInterstitial: () => Promise.resolve(),
      // 요청 옵션만 보면 되므로 불러오기에서 멈춘다.
      prepareRewardVideoAd: (o) => { seen.rewarded = o; return Promise.reject(new Error('stop after request')); },
      addListener: () => Promise.resolve({ remove: () => Promise.resolve() }),
    };
    const p = await newProvider(stub);
    globalThis.window.Capacitor.DEBUG = debug;
    await p.showBanner();
    await p.preloadInterstitial();
    await p.showRewarded();
    return seen;
  };

  try {
    const debug = await requestsFor(true);
    for (const kind of ['banner', 'interstitial', 'rewarded']) {
      assert(debug[kind], `디버그 빌드에서 ${kind} 요청에 도달하지 못했다 — 닿지 못한 검사는 아무것도 증명하지 않는다`);
      assert.strictEqual(debug[kind].isTesting, true,
        `디버그 APK 의 ${kind} 가 테스트로 요청되지 않았다. .env 는 프로덕션 값이고, 이 APK 는 ` +
        '개발자 폰에 깔린다. 실제 광고를 누르면 무효 트래픽이고 AdMob 계정 정지 사유다.');
    }
    assert.deepStrictEqual(debug.initialize, { initializeForTesting: false, testingDevices: [] },
      '디버그 빌드는 등록 기기를 비워야 한다. 등록된 기기에는 플러그인이 실제 단위 ID 를 쓰고 ' +
      '(AdViewIdHelper), 비어 있어야 구글 샘플 ID 로 바꾼다. 기기 해시는 재설치로 달라질 수 있다.');

    const release = await requestsFor(false);
    for (const kind of ['banner', 'interstitial', 'rewarded']) {
      assert.strictEqual(release[kind]?.isTesting, false,
        `릴리스 빌드의 ${kind} 가 테스트로 요청됐다 — 프로덕션 수익이 0 이 된다`);
    }
    assert.deepStrictEqual(release.initialize.testingDevices, ['REGISTERED_HASH_FROM_ENV'],
      '릴리스 빌드는 .env 에 등록된 테스트 기기를 그대로 써야 한다');
    console.log('  ✅ 디버그: 세 광고 모두 테스트 · 등록 기기 없음  /  릴리스: .env 그대로');
  } finally {
    if (saved.t === undefined) delete process.env.VITE_ADMOB_TESTING; else process.env.VITE_ADMOB_TESTING = saved.t;
    if (saved.d === undefined) delete process.env.VITE_ADMOB_TEST_DEVICE_IDS; else process.env.VITE_ADMOB_TEST_DEVICE_IDS = saved.d;
  }
}

// ── 8. 승리 뒤 전면광고: 미리 불러두고, 닫힐 때까지 기다린다 ─────────────────
//
// 전면광고는 이제 승리와 승리 화면 사이에 있다. AdMob 안내대로 다음 버튼 뒤가
// 아니라 쉬는 화면 앞이고, 늦게 도착한 광고가 다음 판 첫 터치를 받지 않도록 미리
// 불러둔다. 여기서 깨지면 안 되는 것:
//   - 불러오기는 동의 확인 뒤에만, 겹쳐 불러도 한 번만
//   - 보여주기는 불러오지 않는다 — 준비 안 됐으면 기다리지 않고 건너뛴다
//   - 플러그인의 showInterstitial 은 광고가 뜨는 순간 풀린다(8.1.0). 승리 화면은
//     interstitialAdDismissed 까지 기다려야 한다
//   - 아무 이벤트도 안 오면(웹 스텁 등) 오래 붙잡지 않는다
//   - 끝나면 리스너를 떼어낸다
console.log('▶ 8. 승리 뒤 전면광고는 미리 불러두고, 닫힐 때까지 승리 화면을 미룬다');
{
  const makeInterstitialStub = ({ canRequestAds = true } = {}) => {
    const calls = [];
    const listeners = new Map();
    let releaseLoad = null;
    const stub = {
      onShow: null,
      requestConsentInfo: () => Promise.resolve({ status: 'OBTAINED', canRequestAds }),
      initialize: () => Promise.resolve(),
      prepareInterstitial: () => {
        calls.push('prepareInterstitial');
        return new Promise((resolve) => { releaseLoad = resolve; });
      },
      showInterstitial: () => {
        calls.push('showInterstitial');
        if (stub.onShow) stub.onShow();
        return Promise.resolve();
      },
      addListener: (name, fn) => {
        listeners.set(name, fn);
        return Promise.resolve({ remove: () => { listeners.delete(name); return Promise.resolve(); } });
      },
    };
    return {
      stub,
      calls,
      emit: (name) => listeners.get(name) && listeners.get(name)(),
      listening: () => listeners.size,
      loadCount: () => calls.filter((c) => c === 'prepareInterstitial').length,
      releaseLoad: () => releaseLoad && releaseLoad(),
    };
  };
  const STILL_WAITING = 'STILL_WAITING';
  const settleSoon = (p, ms = 50) =>
    Promise.race([p, new Promise((r) => setTimeout(() => r(STILL_WAITING), ms))]);
  const flush = async (h) => { for (let i = 0; i < 20 && !h.calls.length; i++) await Promise.resolve(); };
  const loaded = async (h) => {
    const p = await newProvider(h.stub);
    const loading = p.preloadInterstitial();
    await flush(h);
    h.releaseLoad();
    assert.strictEqual(await loading, true, '불러오기가 성공해야 이어지는 검사가 대상에 닿는다');
    return p;
  };

  // A. 동의가 없으면 불러오지 않는다.
  {
    const h = makeInterstitialStub({ canRequestAds: false });
    const p = await newProvider(h.stub);
    assert.strictEqual(await p.preloadInterstitial(), false, '동의가 없으면 불러오기는 false');
    assert.strictEqual(h.loadCount(), 0,
      '동의 없는 이용자에게 전면광고를 요청했다 — 동의 절차가 존재하는 이유를 건너뛴 것이다');
    console.log('  ✅ A. 동의 없음: 요청 없음');
  }

  // B. 겹친 불러오기는 한 번. 준비 전 보여주기는 기다리지 않고 건너뛴다.
  {
    const h = makeInterstitialStub();
    const p = await newProvider(h.stub);
    const first = p.preloadInterstitial();
    const second = p.preloadInterstitial();
    await flush(h);
    assert.strictEqual(p.isInterstitialReady(), false, '불러오는 중에는 준비되지 않았다');
    assert.deepStrictEqual(await settleSoon(p.showPreparedInterstitial()), { shown: false, reason: 'not_ready' },
      '준비 안 된 광고를 보여달라면 곧바로 건너뛰어야 한다 — 승리가 불러오기를 기다리면 안 된다');
    assert(!h.calls.includes('showInterstitial'), '준비 안 된 광고의 show 를 플러그인에 보냈다');
    for (let i = 0; i < 20; i++) await Promise.resolve();
    assert.strictEqual(h.loadCount(), 1,
      '게임 화면이 다시 그려질 때마다 preload 가 불린다. 매번 요청하면 요청만 쌓이고 노출은 하나 — 일치율이 떨어진다');
    h.releaseLoad();
    assert.deepStrictEqual([await first, await second], [true, true], '두 호출 모두 같은 불러오기의 결과를 받아야 한다');
    assert.strictEqual(await p.preloadInterstitial(), true, '이미 준비됐으면 true');
    assert.strictEqual(h.loadCount(), 1, '준비된 광고를 다시 요청했다');
    console.log('  ✅ B. 겹친 불러오기는 한 번 · 준비 전 보여주기는 즉시 건너뜀');
  }

  // C. 보여주기는 닫힘 이벤트까지 기다리고, 리스너를 떼고, 광고를 소진한다.
  {
    const h = makeInterstitialStub();
    const p = await loaded(h);
    h.stub.onShow = () => h.emit('interstitialAdShowed');
    const showing = p.showPreparedInterstitial();
    assert.strictEqual(await settleSoon(showing), STILL_WAITING,
      '광고가 떠 있는 동안 풀렸다. 플러그인의 showInterstitial 은 광고가 뜨자마자 풀리므로, ' +
      '그걸 기다리면 승리 화면이 광고 밑에서 먼저 나타난다');
    assert.strictEqual(h.loadCount(), 1, '보여주기가 광고를 다시 불러왔다');
    h.emit('interstitialAdDismissed');
    assert.deepStrictEqual(await settleSoon(showing), { shown: true, reason: null }, '닫힘 이벤트에서 풀려야 한다');
    await new Promise((r) => setTimeout(r, 0));
    assert.strictEqual(h.listening(), 0, '끝난 뒤 리스너가 남았다 — 다음 광고의 이벤트가 끝난 대기를 건드린다');
    assert.strictEqual(p.isInterstitialReady(), false, '한 번 보여준 광고는 다시 쓸 수 없다');
    console.log('  ✅ C. 닫힘 이벤트까지 기다리고, 리스너를 떼고, 광고를 소진한다');
  }

  // D. 보여주기 실패 이벤트는 곧바로 풀린다.
  {
    const h = makeInterstitialStub();
    const p = await loaded(h);
    h.stub.onShow = () => h.emit('interstitialAdFailedToShow');
    assert.deepStrictEqual(await settleSoon(p.showPreparedInterstitial()), { shown: false, reason: 'failed_to_show' },
      '보여주기에 실패했는데 승리 화면이 기다리고 있다');
    console.log('  ✅ D. 보여주기 실패는 곧장 승리 화면으로');
  }

  // E. 안 뜨면 짧게만, 떴는데 안 닫히면 상한까지만.
  {
    const h = makeInterstitialStub();
    const p = await loaded(h);
    p.interstitial.showedTimeoutMs = 20;
    p.interstitial.showCeilingMs = 1000;
    assert.deepStrictEqual(await settleSoon(p.showPreparedInterstitial(), 300), { shown: false, reason: 'not_shown' },
      '광고가 뜨지 않았는데(Showed 없음) 상한까지 붙잡았다. 이용자는 방금 이긴 판 위에서 멈춘 화면을 본다');

    const h2 = makeInterstitialStub();
    const p2 = await loaded(h2);
    p2.interstitial.showedTimeoutMs = 20;
    p2.interstitial.showCeilingMs = 80;
    h2.stub.onShow = () => h2.emit('interstitialAdShowed');
    assert.deepStrictEqual(await settleSoon(p2.showPreparedInterstitial(), 300), { shown: true, reason: 'no_dismiss_event' },
      '닫힘 이벤트가 끝내 안 오면 상한에서 넘어가야 한다 — 영원히 기다리면 승리 화면이 안 나온다');
    console.log('  ✅ E. 안 뜨면 짧게, 안 닫히면 상한까지만');
  }

  // F. 오래된 광고는 없는 것으로 친다.
  {
    const h = makeInterstitialStub();
    const p = await loaded(h);
    assert.strictEqual(p.isInterstitialReady(Date.now() + 56 * 60 * 1000), false,
      '불러온 지 55분이 넘은 광고를 준비됐다고 했다. 전면광고는 한 시간이면 만료되고, 만료된 광고는 뜨지 않는다');
    console.log('  ✅ F. 55분 지난 광고는 준비 안 됨');
  }
}

// ── 9. 승리 순서: 준비됐으면 멈춤 → 광고 → 승리 화면, 아니면 곧장 승리 화면 ───
console.log('▶ 9. 승리 순서는 멈춤 → 광고 → 승리 화면이고, 준비 안 됐으면 기다리지 않는다');
{
  const { victoryAdSequence, VICTORY_AD_PAUSE_MS } = await import('../../../src/hooks/useVictoryAd.js');
  const run = async ({ ready, show = async () => ({ shown: true, reason: null }), cancelAt = null }) => {
    const log = [];
    let cancelled = false;
    await victoryAdSequence({
      ads: {
        isPostGameAdReady: () => ready,
        showPostGameAd: async () => { log.push('show'); return show(); },
      },
      setPhase: (ph) => { log.push(ph); if (ph === cancelAt) cancelled = true; },
      wait: async (ms) => { log.push(`wait:${ms}`); },
      isCancelled: () => cancelled,
    });
    return log;
  };
  const full = ['pause', `wait:${VICTORY_AD_PAUSE_MS}`, 'ad', 'show', 'modal'];

  assert.deepStrictEqual(await run({ ready: false }), ['modal'],
    '광고가 준비 안 됐으면 멈춤 없이 곧장 승리 화면이어야 한다 — 승리가 불러오기를 기다리면 안 된다');
  assert.deepStrictEqual(await run({ ready: true }), full,
    '준비됐으면 멈춤이 광고보다 먼저여야 한다. 빠르게 두드리는 게임이라 멈춤이 없으면 ' +
    '마지막 터치 다음 터치가 막 뜬 광고에 떨어진다 — 의도하지 않은 클릭이다');
  assert(VICTORY_AD_PAUSE_MS >= 500 && VICTORY_AD_PAUSE_MS <= 3000,
    `멈춤 ${VICTORY_AD_PAUSE_MS}ms — 터치를 끊을 만큼 길고, 승리를 지루하게 만들지 않을 만큼 짧아야 한다`);
  assert.deepStrictEqual(await run({ ready: true, show: async () => { throw new Error('boom'); } }), full,
    '광고가 던져도 승리 화면은 나와야 한다');
  assert.deepStrictEqual(await run({ ready: true, cancelAt: 'pause' }), ['pause', `wait:${VICTORY_AD_PAUSE_MS}`],
    '멈춤 사이 화면을 떠났으면 광고를 띄우지 않는다 — 떠난 화면 위의 광고는 이유 없는 광고다');
  console.log('  ✅ 준비 안 됨 → 곧장 · 준비됨 → 멈춤 → 광고 → 화면 · 던져도 화면 · 떠났으면 광고 없음');
}

// Model the installed Android SDK, not an idealised show/hide toggle:
// hide keeps the view GONE; show on an existing view reloads it, stays hidden,
// and never resolves its PluginCall. Only resume makes that view visible again.
function nativeBannerStub() {
  const ctl = { exists: false, visible: false, creates: 0, resumes: 0, removes: 0, hold: null, waiting: [], failResume: false, widths: [] };
  const finish = (kind, action) => {
    if (ctl.hold !== kind) { action(); return Promise.resolve(); }
    return new Promise(resolve => ctl.waiting.push(() => { action(); resolve(); }));
  };
  return {
    ctl,
    stub: {
      requestConsentInfo: () => Promise.resolve({ status: 'OBTAINED', canRequestAds: true }),
      initialize: () => Promise.resolve(),
      showBanner() {
        if (ctl.exists) return new Promise(() => {});
        ctl.exists = true;
        ctl.creates++;
        // 앵커드 어댑티브 배너는 만들어지는 순간의 창 폭으로 크기가 정해진다.
        ctl.widths.push(globalThis.innerWidth || 0);
        return finish('show', () => { ctl.visible = true; });
      },
      hideBanner: () => finish('hide', () => { ctl.visible = false; }),
      // 네이티브에는 이것도 있다. hideBanner 는 뷰를 GONE 으로 둘 뿐이고,
      // 뷰를 없애는 것은 이쪽이다 — 새 폭으로 다시 만들려면 반드시 거쳐야 한다.
      removeBanner: () => finish('remove', () => {
        ctl.exists = false; ctl.visible = false; ctl.removes++;
      }),
      resumeBanner() {
        ctl.resumes++;
        if (ctl.failResume) return Promise.reject(new Error('resume failed'));
        return finish('resume', () => { if (ctl.exists) ctl.visible = true; });
      },
    },
    release() { ctl.hold = null; ctl.waiting.shift()?.(); },
  };
}
async function waitForBannerCall(b) {
  for (let i = 0; i < 50 && !b.ctl.waiting.length; i++) await tick();
  assert(b.ctl.waiting.length, '보류할 네이티브 배너 호출까지 도달해야 한다');
}
console.log('▶ 배너: 네이티브 뷰 재사용·재진입·빠른 화면 전환');
{
  const b = nativeBannerStub();
  const p = await newProvider(b.stub);
  assert.strictEqual(await p.showBanner(), true);
  assert(b.ctl.visible, '첫 배너가 실제로 보여야 한다');
  for (let i = 0; i < 3; i++) {
    await p.hideBanner();
    assert(!b.ctl.visible, '홈에서는 배너가 숨겨져야 한다');
    const result = await within(p.showBanner(), SETTLE_MS);
    assert(result.settled, '재진입한 배너 표시가 끝나지 않는다');
    assert(result.value && b.ctl.visible, '재진입한 배너가 다시 보이지 않는다');
  }
  assert.strictEqual(b.ctl.creates, 1, '기존 네이티브 배너를 재사용해야 한다');
  b.ctl.failResume = true;
  assert.strictEqual(await p.showBanner(), false);
  b.ctl.failResume = false;
  const retry = await within(p.showBanner(), SETTLE_MS);
  assert(retry.settled && retry.value, '실패한 배너 호출 뒤에 재시도할 수 없다');
  console.log('  ✅ 세 번 재진입해도 다시 보이고, 실패 뒤 재시도 가능');
}
{
  const b = nativeBannerStub();
  b.ctl.hold = 'show';
  const p = await newProvider(b.stub);
  const first = p.showBanner();
  const second = p.showBanner();
  await waitForBannerCall(b);
  b.release();
  const result = await within(Promise.all([first, second]), SETTLE_MS);
  assert(result.settled && result.value.every(Boolean), '동시 배너 요청이 중복 생성 경로에서 멈췄다');
  assert(b.ctl.visible && b.ctl.creates === 1);
  console.log('  ✅ 첫 표시가 진행 중이어도 중복 생성하지 않는다');
}
for (const leaveAgain of [false, true]) {
  const b = nativeBannerStub();
  const p = await newProvider(b.stub);
  await p.showBanner();
  b.ctl.hold = 'hide';
  const hiding = p.hideBanner();
  await waitForBannerCall(b);
  const showing = p.showBanner();
  await tick();
  assert.strictEqual(b.ctl.resumes, 0, '숨김이 끝나기 전에 배너를 재표시했다');
  const lastHide = leaveAgain ? p.hideBanner() : Promise.resolve();
  b.release();
  const result = await within(Promise.all([hiding, showing, lastHide]), SETTLE_MS);
  assert(result.settled, '빠른 화면 전환 중 배너 처리가 멈췄다');
  assert.strictEqual(b.ctl.visible, !leaveAgain, '늦은 숨김이 마지막 화면의 배너 상태를 뒤집었다');
  if (leaveAgain) assert.strictEqual(b.ctl.resumes, 0, '대기 중 낡아진 배너가 홈에서 다시 표시됐다');
}
for (const kind of ['show', 'resume']) {
  const b = nativeBannerStub();
  const p = await newProvider(b.stub);
  if (kind === 'resume') { await p.showBanner(); await p.hideBanner(); }
  b.ctl.hold = kind;
  const showing = p.showBanner();
  await waitForBannerCall(b);
  const hiding = p.hideBanner();
  b.release();
  const result = await within(Promise.all([showing, hiding]), SETTLE_MS);
  assert(result.settled && result.value[0] === false && !b.ctl.visible,
    '진행 중인 네이티브 표시 뒤에 홈으로 나갔는데 배너가 남았다');
}
console.log('  ✅ 표시·숨김이 엇갈려도 마지막 화면의 의도를 따른다');

// ── 배너 폭: 회전하면 새 폭으로 다시 만든다 ──────────────────────────────
//
// 실기에서만 드러난 결함이다. 앵커드 어댑티브 배너는 **만들 때 크기가 정해지고
// 스스로 바뀌지 않는다.** 앱이 세로로 잠겨 있던 동안에는 드러날 수 없었다.
// 태블릿 회전을 연 뒤(V22 ③), 태블릿 폭으로 넓힌 플립6에서 재보니:
//
//   가로 화면 2640 폭 · 앱 WebView x 94..2640
//   배너                x 94..1174   ← 세로 폭 1080 그대로, 오른쪽 1,400px 검정
//
// 광고주는 구석에 처박힌, 아무도 읽지 않는 배너 값을 내고 있었다.
// 에뮬레이터로는 못 찾는다 — 처음부터 가로로 켜면 배너도 가로 폭으로 만들어진다.
// **회전을 거쳐야** 보인다. 그래서 이 절은 회전 자체를 흉내낸다.
console.log('▶ 배너 폭: 창이 넓어지면 배너를 다시 만든다');
{
  // 이 게이트의 window 는 globalThis 라서 이벤트 API 가 없다. 감시자가 실제로
  // 붙는지 보려면 있어야 한다 — 없으면 제공자는 조용히 감시를 건너뛴다.
  const registry = new Map();
  globalThis.addEventListener = (name, fn) => {
    if (!registry.has(name)) registry.set(name, new Set());
    registry.get(name).add(fn);
  };
  globalThis.removeEventListener = (name, fn) => { registry.get(name)?.delete(fn); };
  const dispatch = (name) => { for (const fn of [...(registry.get(name) || [])]) fn(); };
  const listeners = () => [...registry.values()].reduce((n, set) => n + set.size, 0);

  // A document just real enough to hold the one custom property the app
  // reserves the slot's height with. Without it the provider's guard skips the
  // reset and this section would pass for the wrong reason.
  const reserve = new Map();
  globalThis.document = {
    documentElement: {
      style: {
        setProperty: (k, v) => reserve.set(k, v),
        removeProperty: (k) => reserve.delete(k),
      },
    },
  };

  globalThis.innerWidth = 1080;
  const b = nativeBannerStub();
  const p = await newProvider(b.stub);
  assert.strictEqual(await p.showBanner(), true);
  assert.deepStrictEqual(b.ctl.widths, [1080], '첫 배너는 세로 폭으로 만들어진다');
  assert(listeners() > 0,
    '배너를 띄웠는데 창 폭 감시가 붙지 않았다. 감시가 없으면 회전 뒤 배너는 옛 폭 그대로다.');

  // 세로 배너가 보고한 높이. 아래에서 "지워졌는가" 를 묻기 전에, 애초에 값이
  // 있었다는 것을 세워둔다 — 없는 값이 없어진 것을 통과로 읽으면 안 된다.
  globalThis.document.documentElement.style.setProperty('--ad-banner-h', '50px');
  assert(reserve.get('--ad-banner-h') === '50px');

  // 키보드가 열리거나 소프트키 줄이 생기는 정도의 변화. 광고를 다시 받아오면
  // 그 요청은 낭비다 — 화면은 그대로이고 배너도 그 폭에 맞다.
  globalThis.innerWidth = 1080 - 24;
  assert.strictEqual(await p.rebuildBannerIfWidthChanged(), false);
  assert.strictEqual(b.ctl.creates, 1, '작은 폭 변화로 광고를 다시 요청했다');

  // 회전. 안드로이드는 회전 한 번에 resize 를 여러 번 쏘고, 중간 값들은 아직
  // 자리를 잡지 못한 창 크기다. 모아서 한 번 처리하지 않으면 그 중간 폭으로도
  // 광고를 새로 받아온다 — 회전 한 번에 요청 두세 번.
  for (const [at, w] of [[0, 1200], [200, 1600], [400, 2100], [600, 2640]]) {
    await new Promise((r) => setTimeout(r, at ? 200 : 0));
    globalThis.innerWidth = w;
    dispatch(at === 600 ? 'orientationchange' : 'resize');
  }
  await new Promise((r) => setTimeout(r, 900));

  assert.strictEqual(b.ctl.removes, 1,
    'hideBanner 로는 부족하다 — 그 뷰는 살아남고 resumeBanner 가 같은 폭으로 되돌린다. ' +
    'removeBanner 로 없애야 새 폭으로 다시 만들어진다. 그리고 회전이 이벤트를 세 번 쏴도 ' +
    '재생성은 한 번이어야 한다 — 회전 한 번에 광고 요청 세 번은 낭비다.');
  assert.deepStrictEqual(b.ctl.widths, [1080, 2640],
    '회전 뒤에도 배너가 옛 폭이다. 화면 왼쪽에 붙은 채 오른쪽이 검게 비는 그림이 되고, ' +
    '광고주는 아무도 읽지 않는 구석 배너 값을 낸다.');
  assert(b.ctl.visible, '다시 만든 배너가 보이지 않는다');
  assert(!reserve.has('--ad-banner-h'),
    '배너를 다시 만들면서 앱이 잡아둔 높이를 그대로 남겼다. 그 값은 사라진 배너의 것이다 — ' +
    '가로로 돌면 50px 을 잡아둔 자리에 90px 짜리가 그려져 키패드를 덮고(U-1 그 자체), ' +
    '세로로 돌아오면 50px 배너 자리에 90px 을 잡아둔 채 검은 띠가 남는다. ' +
    '값을 지우면 screens.css 의 폭 기반 추정값으로 돌아가고, 그것은 어댑티브 배너와 같은 식이라 ' +
    '새 폭에서 곧바로 맞다.');

  // ── 회전을 반복해도 광고 요청이 그만큼 나가지는 않는다 ──────────────────
  //
  // 디바운스는 **한 번의** 회전을 한 번으로 묶을 뿐이다. 스무 번 돌리면 스무 번
  // 요청이다 — AdMob 이 제공하는 어떤 갱신 주기보다 빠르고, 계정을 들여다보게
  // 만드는 모양의 트래픽이다. 창 간격 안의 재생성은 버리는 것이 아니라 간격 끝으로
  // 미루고, 미뤄진 쪽은 그때의 폭을 다시 읽는다 — 원래 방향으로 되돌아왔으면
  // 아무 일도 일어나지 않는다.
  const { BANNER_REBUILD_MIN_INTERVAL_MS } = await import(`${PROVIDER}?case=${instance}`);
  assert(BANNER_REBUILD_MIN_INTERVAL_MS >= 10000 && BANNER_REBUILD_MIN_INTERVAL_MS <= 120000,
    `재생성 최소 간격 ${BANNER_REBUILD_MIN_INTERVAL_MS}ms — 요청 폭주를 막을 만큼 길고, ` +
    '진짜 회전을 오래 잘못된 폭으로 두지 않을 만큼 짧아야 한다');
  {
    const before = b.ctl.creates;
    // 방금 다시 만든 참이다. 곧바로 또 돌린다.
    globalThis.innerWidth = 1080;
    assert.strictEqual(await p.rebuildBannerIfWidthChanged(), false,
      '간격 안의 재생성이 곧바로 광고를 다시 요청했다');
    assert.strictEqual(b.ctl.creates, before, '간격 안에서 배너를 다시 만들었다');
    assert(p.rebuildDeferred, '미루지 않고 그냥 버렸다 — 회전은 남아 있는데 배너는 옛 폭 그대로다');

    // 간격이 300ms 남은 것처럼 만들어 두고, 미뤄둔 쪽이 실제로 도는지 본다.
    clearTimeout(p.rebuildDeferred);
    p.rebuildDeferred = null;
    p.lastBannerRebuildAt = Date.now() - (BANNER_REBUILD_MIN_INTERVAL_MS - 300);
    assert.strictEqual(await p.rebuildBannerIfWidthChanged(), false);
    assert(p.rebuildDeferred, '미뤄둔 작업이 잡히지 않았다');
    await new Promise((r) => setTimeout(r, 800));
    assert.strictEqual(b.ctl.creates, before + 1,
      '간격이 지났는데도 미뤄둔 재생성이 돌지 않았다. 버리는 것과 미루는 것은 다르다 — ' +
      '버리면 배너는 다음 화면 전환까지 옛 폭으로 남는다.');
    assert.deepStrictEqual(b.ctl.widths, [1080, 2640, 1080], '미뤄진 재생성이 그때의 폭을 읽지 않았다');
  }

  // 홈으로 나간 뒤의 회전이 배너를 되살리면, 배너 없는 화면 위에 배너가 얹힌다.
  await p.hideBanner();
  assert.strictEqual(listeners(), 0, '배너를 내렸는데 감시자가 남았다');
  globalThis.innerWidth = 1080;
  assert.strictEqual(await p.rebuildBannerIfWidthChanged(), false,
    '배너를 원하지 않는 화면에서 회전이 배너를 되살렸다');
  assert(!b.ctl.visible);

  delete globalThis.addEventListener;
  delete globalThis.removeEventListener;
  delete globalThis.innerWidth;
  delete globalThis.document;
  console.log('  ✅ 회전하면 새 폭으로 한 번만 다시 만들고, 떠난 화면에서는 되살리지 않는다');
}

console.log('\n======================================================');
console.log('🎉 광고 수명주기 경합 게이트 통과');
console.log('======================================================');
