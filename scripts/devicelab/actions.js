/**
 * actions.js
 * Taps that have to prove they landed.
 *
 * `adb shell input tap` returns exit 0 whether it pressed a button or the
 * status bar. On 2026-09-02 a coordinate conversion dropped the WebView's 94px
 * top offset; every tap "succeeded" and nothing happened, and the missing
 * effect was read as the app being broken. On the same day a tap landed on a
 * keypad button that shared a label with the modal button it was aiming at, and
 * the modal staying open was read as cancel not working.
 *
 * A tap in a test is never speculative — it is aimed at something, and the aim
 * is a claim that can be checked. So every tap here states what it expects and
 * fails if that did not happen. An action nobody verified is not evidence.
 */

import { DeviceError } from './device.js';

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** A cheap identity for "what the screen looks like right now". */
function fingerprint(snapshot) {
  return snapshot.appNodes
    .map((n) => `${n.text}@${Math.round(n.cx)},${Math.round(n.cy)}`)
    .join('|');
}

/**
 * Tap a node and require the screen to react.
 *
 * `expect` may be:
 *   a function  (snapshotAfter) => boolean   the specific thing you expect
 *   omitted                                   merely that something changed
 *
 * "Something changed" is the weakest useful claim, and it is still enough to
 * catch a tap that missed entirely — which is the failure that cost the most
 * time, precisely because adb reported success.
 */
export async function tap(device, node, { expect = null, what = 'tap', settle = 1800 } = {}) {
  if (!node || typeof node.cx !== 'number') {
    throw new DeviceError(`${what}: 좌표가 없는 대상은 누를 수 없다`);
  }

  const before = device.snapshot();
  const beforePrint = fingerprint(before);

  device.sh('shell', 'input', 'tap', String(Math.round(node.cx)), String(Math.round(node.cy)));
  await wait(settle);

  const after = device.snapshot();

  if (expect) {
    if (!expect(after)) {
      throw new DeviceError(
        `${what}: 눌렀지만 기대한 결과가 아니다 (@${Math.round(node.cx)},${Math.round(node.cy)}).\n` +
        `  화면: ${JSON.stringify(after.labels.slice(0, 14))}`
      );
    }
    return after;
  }

  if (fingerprint(after) === beforePrint) {
    throw new DeviceError(
      `${what}: 눌렀는데 화면이 그대로다 (@${Math.round(node.cx)},${Math.round(node.cy)}).\n` +
      '  adb 는 빗나간 탭도 성공으로 보고한다. 좌표가 화면 밖이거나, 모달이 가리고 있거나,\n' +
      '  대상이 실제로는 클릭 대상이 아닐 수 있다.\n' +
      `  화면: ${JSON.stringify(after.labels.slice(0, 14))}`
    );
  }
  return after;
}

/** Tap by label, resolved through Snapshot.one so ambiguity is an error. */
export async function tapLabel(device, matcher, opts = {}) {
  const snap = device.snapshot().assertAppInFront();
  const node = snap.one(matcher, { near: opts.near ?? null });
  return tap(device, node, { what: `"${matcher}"`, ...opts });
}

/** Scroll until a label is both present and actually on screen. */
export async function scrollTo(device, matcher, { tries = 6, height = 2640 } = {}) {
  for (let i = 0; i < tries; i++) {
    const snap = device.snapshot();
    const hits = snap.find(matcher);
    // uiautomator reports bounds for nodes scrolled out of view, so presence in
    // the tree is not the same as reachability by a finger.
    const visible = hits.find((n) => n.cy > 150 && n.cy < height - 200);
    if (visible) return visible;
    device.sh('shell', 'input', 'swipe', '540', String(height - 640), '540', '900', '300');
    await wait(900);
  }
  throw new DeviceError(`"${matcher}" 를 화면 안으로 가져오지 못했다 (${tries}회 스크롤)`);
}

/** Launch the app fresh and wait for it to be the thing on screen. */
export async function relaunch(device, { activity = '.MainActivity', settle = 8000 } = {}) {
  device.assertNoDebugger();
  device.sh('shell', 'am', 'force-stop', device.pkg);
  device.sh('shell', 'am', 'start', '-n', `${device.pkg}/${activity}`);
  await wait(settle);
  return device.snapshot().assertAppInFront();
}
