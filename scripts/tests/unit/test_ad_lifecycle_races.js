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
  const result = await showing;

  assert.strictEqual(result, false,
    '숨김이 진행 중이면 showBanner 는 물러나야 한다');
  assert(!calls.includes('showBanner'),
    '숨김이 아직 끝나지 않았는데 배너를 띄웠다. 의도를 세우는 대입이 await 뒤에 ' +
    '있으면 진행 중인 showBanner 가 자기가 낡았다는 것을 알 방법이 없다. ' +
    '화면 전환은 네이티브 숨김이 끝날 때까지 기다려주지 않으므로, 이것이 기기에서 ' +
    '실제로 일어나는 순서다.');

  releaseHide();
  await hiding;
  console.log('  ✅ 진행 중인 숨김도 낡은 showBanner 를 막는다');
}

console.log('\n======================================================');
console.log('🎉 광고 수명주기 경합 게이트 통과');
console.log('======================================================');
