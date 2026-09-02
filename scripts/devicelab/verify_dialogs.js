/**
 * verify_dialogs.js
 * Presses the app's confirm and notify dialogs on a real phone.
 *
 *   node scripts/devicelab/verify_dialogs.js <serial>
 *
 * Not a QA gate: it needs a device on the desk, so the pipeline cannot depend
 * on it. It is here rather than in a scratch file because the scratch versions
 * of this script were rewritten five times, each time re-learning the same
 * lessons about the tooling. Those lessons now live in devicelab/device.js and
 * this file is short enough to read.
 *
 * What it checks is the thing no browser can: Capacitor draws window.confirm
 * and window.alert with the literal strings "OK" and "Cancel", which no locale
 * setting reaches. The whole point is whether those are gone from a real build,
 * and that question only exists on the device.
 *
 * It refuses to run with a debugger attached — Playwright over CDP dismisses JS
 * dialogs by itself, which once produced a confident report that no dialog
 * appeared at all.
 */

import { Device, DeviceError } from './device.js';
import { relaunch, tap, tapLabel, scrollTo, wait } from './actions.js';

const serial = process.argv[2];
if (!serial) {
  console.error('사용법: node scripts/devicelab/verify_dialogs.js <serial>');
  process.exit(2);
}

const fails = [];
const chk = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✅' : '❌'} ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails.push(label);
};

/** Every dialog in this app must be the in-app modal, never Capacitor's. */
function assertLocalised(snapshot, where) {
  const native = snapshot.nativeDialogButtons;
  chk(`${where}: 네이티브 영어 버튼 없음`, native.length === 0, JSON.stringify(native));
  chk(`${where}: 앱 언어 확인 버튼`, snapshot.has('확인'));
}

const device = new Device(serial);

try {
  console.log(`=== ${serial} ===`);
  await relaunch(device);

  // Whatever greets a fresh launch — attendance reward and friends.
  for (let i = 0; i < 4; i++) {
    const snap = device.snapshot();
    const greeter = snap.find(/^(보상 받기|확인|닫기|시작하기)$/)[0];
    if (!greeter) break;
    await tap(device, greeter, { what: '시작 모달 닫기' });
  }

  console.log('\n▶ 1. 게임 나가기');
  await tapLabel(device, '새 게임');
  let snap = await tapLabel(device, '메인 홈');
  chk('나가기 확인창이 뜬다', snap.has(/이동하시겠|나가시겠/), snap.labels.find((t) => /하시겠/.test(t)));
  assertLocalised(snap, '나가기');

  snap = await tap(device, snap.one('취소', { near: '확인' }), { what: '취소' });
  chk('취소하면 게임에 남는다', snap.has('메인 홈'));

  await tapLabel(device, '메인 홈');
  snap = await tapLabel(device, '확인');
  chk('확인하면 홈으로 나간다', snap.has('새 게임'));

  console.log('\n▶ 2. 재시작 확인 (문장 전체가 하나의 키여야 한다)');
  await tapLabel(device, '새 게임');
  snap = await tapLabel(device, /^다시\s*시작$/);
  const restartMsg = snap.labels.find((t) => /다시\s*시작|처음부터/.test(t) && t.length > 6);
  chk('재시작 확인창이 뜬다', Boolean(restartMsg), restartMsg);
  chk('물음표가 문장 안에 있다', /[?？]/.test(restartMsg || ''),
    "라벨에 '?' 를 이어붙이면 번역자가 고칠 수 없다");
  assertLocalised(snap, '재시작');
  await tap(device, snap.one('취소', { near: '확인' }), { what: '취소' });
  await tapLabel(device, '메인 홈');
  await tapLabel(device, '확인');

  console.log('\n▶ 3. notify() — 버튼이 하나뿐인 알림');
  await tapLabel(device, /오늘의 챌린지/);
  const today = new Date().getDate();
  // The month badge is a two-digit number too, so pick from the calendar grid:
  // day cells sit below the weekday row.
  const weekdayRow = device.snapshot().one('수').cy;
  const future = device.snapshot().appNodes
    .filter((n) => /^\d{1,2}$/.test(n.text.trim()) && +n.text.trim() > today && n.cy > weekdayRow)
    .sort((a, b) => a.cy - b.cy || a.cx - b.cx)[0];
  chk('미래 날짜 셀 발견', Boolean(future), future ? `${future.text}일` : '못 찾음');
  if (future) {
    snap = await tap(device, future, { what: `${future.text}일` });
    chk('알림이 뜬다', snap.has(/해금되지|아직/), snap.labels.find((t) => /해금|아직/.test(t)));
    assertLocalised(snap, '알림');
    chk('알림은 취소 버튼이 없다', snap.find('취소').length === 0);
    snap = await tapLabel(device, '확인');
    chk('확인하면 닫힌다', !snap.has(/해금되지/));
  }
} catch (e) {
  if (e instanceof DeviceError) {
    console.error(`\n❌ 관찰/조작 실패 — 앱이 아니라 도구 쪽 문제일 수 있다:\n${e.message}`);
    process.exit(1);
  }
  throw e;
}

console.log('\n======================================================');
if (fails.length) {
  console.log(`❌ 실패 ${fails.length}건:`);
  fails.forEach((f) => console.log('   -', f));
  process.exit(1);
}
console.log('🎉 실기기 다이얼로그 전부 앱 언어로 동작');
console.log('======================================================');
