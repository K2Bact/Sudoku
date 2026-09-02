/**
 * test_devicelab_catches_lies.js
 *
 * The device harness exists because the tooling gave five wrong answers in one
 * session and never raised an error. This gate replays all five and requires
 * the harness to refuse each one.
 *
 * It runs without a phone on purpose. A harness whose own failure modes can
 * only be reached by plugging in a device gets tested when the device happens
 * to be on the desk, which is never the moment it matters. Every deception here
 * is reproduced from a canned adb response.
 *
 * If any case starts passing silently, the harness has gone back to answering
 * plausibly — which is the exact behaviour it was built to stop.
 */

import assert from 'assert';
import { Device, DeviceError } from '../../devicelab/device.js';
import { tap } from '../../devicelab/actions.js';

console.log('======================================================');
console.log('🕵️  Testing the Device Harness Refuses to Be Fooled');
console.log('======================================================\n');

const PKG = 'com.powerneja.suidoku';

/** Build a uiautomator dump from [text, x1, y1, x2, y2] tuples. */
function dump(rows, pkg = PKG) {
  const nodes = rows.map(([text, x1, y1, x2, y2]) =>
    `<node text="${text}" class="android.widget.Button" package="${pkg}" ` +
    `bounds="[${x1},${y1}][${x2},${y2}]" />`);
  return `<?xml version='1.0'?><hierarchy rotation="0">${nodes.join('')}</hierarchy>`;
}

/**
 * A fake adb that models the dump FILE, not just the dump command.
 *
 * This matters more than it looks. The first version of this fake made `cat`
 * fail whenever the dump failed — which is the behaviour the `rm -f` safeguard
 * produces, so removing the safeguard changed nothing and the test passed
 * either way. It was asserting against its own conclusion. The real device
 * leaves the previous file in place, and that file is the whole bug.
 */
function fakeDevice(script) {
  const state = { taps: [], dumpCount: 0, file: script.leftover ?? null };
  const exec = (args) => {
    const joined = args.join(' ');
    if (joined.startsWith('forward')) return script.forwards ?? '';
    if (joined.includes('input tap')) {
      state.taps.push(args.slice(-2).map(Number));
      return '';
    }
    if (joined.startsWith('shell rm')) {
      state.file = null;
      return '';
    }
    if (joined.includes('uiautomator dump')) {
      state.dumpCount++;
      // A failed dump does NOT clear the file — that is the trap.
      if (script.dumpThrows) throw new Error('exit 137');
      state.file = typeof script.xml === 'function' ? script.xml(state) : script.xml;
      return 'UI hierchary dumped';
    }
    if (joined.startsWith('shell cat')) {
      if (state.file === null) throw new Error('No such file or directory');
      return state.file;
    }
    return '';
  };
  return { device: new Device('FAKE', { exec }), state };
}

function refuses(label, fn, expectedFragment) {
  let threw = null;
  try {
    const r = fn();
    if (r && typeof r.then === 'function') {
      return r.then(
        () => { throw new Error(`${label}: 통과해버렸다 — 속임수를 못 잡음`); },
        (e) => {
          assert(e instanceof DeviceError, `${label}: DeviceError 가 아니라 ${e.constructor.name}`);
          assert(e.message.includes(expectedFragment),
            `${label}: 메시지에 "${expectedFragment}" 가 없다 — 실제: ${e.message.slice(0, 120)}`);
          console.log(`  ✅ ${label}`);
        }
      );
    }
  } catch (e) {
    threw = e;
  }
  assert(threw, `${label}: 통과해버렸다 — 속임수를 못 잡음`);
  assert(threw instanceof DeviceError, `${label}: DeviceError 가 아니라 ${threw.constructor.name}`);
  assert(threw.message.includes(expectedFragment),
    `${label}: 메시지에 "${expectedFragment}" 가 없다 — 실제: ${threw.message.slice(0, 120)}`);
  console.log(`  ✅ ${label}`);
  return null;
}

// ── 1. Playwright attached over CDP ───────────────────────────────────────
console.log('▶ 1. CDP 가 붙어 있으면 다이얼로그를 자동 거절한다');
{
  const { device } = fakeDevice({
    forwards: 'FAKE tcp:9301 localabstract:webview_devtools_remote_1234\n'
  });
  refuses('붙어 있는 디버거를 감지하고 거부', () => device.assertNoDebugger(), 'CDP 포워딩');
}

// ── 2. Dump failed, previous screen left behind ───────────────────────────
console.log('▶ 2. 덤프가 실패했는데 낡은 화면이 남아 있다');
{
  // The exact trap: a perfectly valid dump of a screen from minutes ago is
  // sitting in the file, and this dump fails. Without the delete, `cat` hands
  // it over and the harness reports the past as the present.
  const stale = dump([['새 게임', 61, 1435, 1018, 1576]]);
  const { device, state } = fakeDevice({ dumpThrows: true, leftover: stale });
  refuses('낡은 화면 대신 오류', () => device.snapshot(), '낡은 화면을 읽느니');
  assert.strictEqual(state.file, null, '스냅샷은 읽기 전에 낡은 파일을 지워야 한다');

  // And a dump that wrote only its own log line is not a screen either.
  const { device: d2 } = fakeDevice({ leftover: null, xml: 'UI hierchary dumped to: /sdcard/x' });
  refuses('계층 구조가 없으면 오류', () => d2.snapshot(), '화면을 못 본 것이지');
}

// ── 3. WebView nodes missing while CDP is attached ────────────────────────
console.log('▶ 3. 노드가 안 보이는 것과 화면이 빈 것은 다르다');
{
  const { device } = fakeDevice({ xml: '<?xml version="1.0"?><hierarchy rotation="0"></hierarchy>' });
  refuses('빈 덤프를 답으로 받지 않음', () => device.snapshot(), '노드가 하나도 없다');

  // System chrome only: the app is not in front, so its coordinates are stale.
  const { device: d2 } = fakeDevice({ xml: dump([['설정', 0, 0, 100, 100]], 'com.android.systemui') });
  refuses('앱이 앞에 없으면 오류', () => d2.snapshot().assertAppInFront(), '노드가 화면에 없다');
}

// ── 4. An ambiguous label ─────────────────────────────────────────────────
console.log('▶ 4. 같은 라벨이 둘이면 고르지 않고 멈춘다');
{
  // Exactly the shape that pressed the keypad's undo instead of the modal's
  // cancel, then reported that cancel did nothing.
  const { device } = fakeDevice({
    xml: dump([
      ['취소', 100, 1300, 300, 1400],   // keypad undo
      ['확인', 100, 1900, 900, 2000],   // modal confirm
      ['취소', 100, 2050, 900, 2150]    // modal cancel
    ])
  });
  const snap = device.snapshot();
  refuses('중복 매칭은 오류', () => snap.one('취소'), '2개 매칭됐다');

  const picked = snap.one('취소', { near: '확인' });
  assert.strictEqual(Math.round(picked.cy), 2100,
    'near 로 기준을 주면 모달의 취소를 고른다 (키패드 되돌리기가 아니라)');
  console.log('  ✅ near 로 기준을 주면 올바른 쪽을 고른다');

  refuses('없는 라벨도 오류', () => snap.one('있을 리 없는 버튼'), '찾지 못했다');
}

// ── 5. A tap that lands nowhere ───────────────────────────────────────────
console.log('▶ 5. 빗나간 탭은 성공이 아니다');
{
  const same = dump([['새 게임', 61, 1435, 1018, 1576]]);
  const { device, state } = fakeDevice({ xml: same });
  const node = device.snapshot().one('새 게임');
  await refuses(
    '화면이 안 바뀌면 오류',
    () => tap(device, node, { what: '새 게임', settle: 0 }),
    '화면이 그대로다'
  );
  assert.strictEqual(state.taps.length, 1, '탭은 실제로 실행됐다 — adb 는 성공을 보고했다');
  console.log('  ✅ adb 가 exit 0 을 줘도 효과가 없으면 실패로 본다');
}

// ── The harness still lets correct interactions through ───────────────────
console.log('▶ 6. 정상 동작은 그대로 통과한다');
{
  const home = dump([['새 게임', 61, 1435, 1018, 1576]]);
  const game = dump([['메인 홈', 33, 144, 126, 237], ['지우개', 300, 2400, 500, 2500]]);
  // The screen must change only once a tap has actually been issued — keying
  // this on dump count instead made the "before" snapshot already show the
  // result, so the two matched and the tap looked like it had missed.
  const { device } = fakeDevice({ xml: (s) => (s.taps.length ? game : home) });
  const node = device.snapshot().one('새 게임');
  const after = await tap(device, node, { what: '새 게임', settle: 0 });
  assert(after.has('메인 홈'), '탭 후 새 화면이 관찰돼야 한다');
  console.log('  ✅ 화면이 바뀌면 통과하고 새 스냅샷을 돌려준다');
}

console.log('\n======================================================');
console.log('🎉 다섯 가지 속임수를 전부 거부한다.');
console.log('======================================================');
