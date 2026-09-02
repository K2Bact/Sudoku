/**
 * device.js
 * A phone you can believe.
 *
 * On 2026-09-02 the device tooling gave five wrong answers in one session, and
 * not one of them raised an error. Each returned something plausible instead:
 *
 *   1. Playwright was attached over CDP, which auto-dismisses JS dialogs. A real
 *      finger tap opened a confirm and the tool closed it before it drew, so the
 *      screen said "no dialog appeared". The observer changed the observed.
 *   2. With CDP attached, uiautomator stopped reporting the WebView's inner
 *      nodes. Every button "was not on screen".
 *   3. `취소` matched two things — the modal's cancel button and the keypad's
 *      undo button. Taking the first match pressed undo and reported that
 *      cancel did nothing.
 *   4. Coordinates were converted from CSS pixels without adding the WebView's
 *      94px top offset. `input tap` returned exit 0 and hit the status bar.
 *   5. `uiautomator dump` exits 137 on this device but leaves the PREVIOUS
 *      /sdcard/ui.xml in place, so `cat` served a screen from minutes earlier.
 *      That one got as far as telling the user to unfold a phone that was
 *      already open.
 *
 * The common property is the dangerous one: silence. A tool that throws is safe,
 * because the mistake stops there. A tool that answers plausibly turns into a
 * conclusion about the app, and the next thing that happens is someone edits
 * working code. Four of those five got within one step of that.
 *
 * So this module's job is not convenience. It is to make silence impossible:
 *
 *   - every observation proves it is current, or throws          (5)
 *   - "found nothing" is an error, never an answer               (2, 5)
 *   - a tap must be shown to have changed something              (4)
 *   - a selector matching two things is an error, not a choice   (3)
 *   - interfering tools are refused up front, not worked around  (1, 2)
 */

import { execFileSync } from 'child_process';

const ADB = `${process.env.USERPROFILE}\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe`;
const DUMP_PATH = '/sdcard/devicelab-ui.xml';

export class DeviceError extends Error {}

export class Device {
  /**
   * `exec` exists so the self-test can replay the five deceptions without a
   * phone. A harness whose own failure modes are only reachable by plugging in
   * a device would be tested about as often as the phone is on the desk — which
   * is to say, never at the moment it matters.
   */
  constructor(serial, { pkg = 'com.powerneja.suidoku', exec = null } = {}) {
    this.serial = serial;
    this.pkg = pkg;
    this.exec = exec;
  }

  sh(...args) {
    if (this.exec) return this.exec(args);
    return execFileSync(ADB, ['-s', this.serial, ...args], {
      encoding: 'utf8',
      maxBuffer: 1 << 24
    });
  }

  /**
   * Rule 5 — refuse to run while a tool that changes the app's behaviour is
   * attached. Playwright over CDP auto-dismisses window.confirm and suppresses
   * the WebView's accessibility nodes; anything measured through it is a
   * measurement of the tooling. Better to stop than to explain the result later.
   */
  assertNoDebugger() {
    const forwards = this.exec
      ? this.exec(['forward', '--list'])
      : execFileSync(ADB, ['forward', '--list'], { encoding: 'utf8' });
    const mine = forwards.split('\n').filter((l) => l.includes(this.serial) && l.includes('webview_devtools'));
    if (mine.length) {
      throw new DeviceError(
        'CDP 포워딩이 살아 있다:\n  ' + mine.join('\n  ') +
        '\nPlaywright 가 붙어 있으면 JS 다이얼로그를 자동 거절하고 WebView 노드를 가린다. ' +
        '`adb -s ' + this.serial + ' forward --remove-all` 후 다시 실행할 것.'
      );
    }
  }

  /**
   * Rule 1 + 2 — a snapshot proves it is current or throws.
   *
   * The dump file is deleted first, so a failed dump cannot leave the previous
   * screen behind to be read as this one. An empty or malformed result is an
   * error: "the screen has no buttons" and "I could not see the screen" must
   * never arrive as the same value.
   */
  snapshot() {
    this.sh('shell', 'rm', '-f', DUMP_PATH);
    try {
      this.sh('shell', 'uiautomator', 'dump', DUMP_PATH);
    } catch (e) {
      // This device exits 137 after writing the file; the file is the evidence.
    }

    let xml;
    try {
      xml = this.sh('shell', 'cat', DUMP_PATH);
    } catch (e) {
      throw new DeviceError('덤프 파일을 읽지 못했다 — 낡은 화면을 읽느니 여기서 멈춘다');
    }
    if (!xml.includes('<hierarchy')) {
      throw new DeviceError('덤프가 계층 구조를 담고 있지 않다 — 화면을 못 본 것이지 화면이 빈 것이 아니다');
    }

    const nodes = [];
    for (const m of xml.matchAll(/<node[^>]*>/g)) {
      const b = m[0].match(/ bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
      if (!b) continue;
      const [x1, y1, x2, y2] = [+b[1], +b[2], +b[3], +b[4]];
      nodes.push({
        text: (m[0].match(/ text="([^"]*)"/) || [])[1] ?? '',
        cls: (m[0].match(/ class="([^"]*)"/) || [])[1] ?? '',
        pkg: (m[0].match(/ package="([^"]*)"/) || [])[1] ?? '',
        x1, y1, x2, y2,
        cx: (x1 + x2) / 2,
        cy: (y1 + y2) / 2
      });
    }
    if (!nodes.length) {
      throw new DeviceError('덤프에 노드가 하나도 없다 — 관찰 실패로 취급한다');
    }
    return new Snapshot(this, nodes, xml);
  }
}

export class Snapshot {
  constructor(device, nodes, xml) {
    this.device = device;
    this.nodes = nodes;
    this.xml = xml;
  }

  /** Everything the app itself drew, ignoring system chrome. */
  get appNodes() {
    return this.nodes.filter((n) => n.pkg === this.device.pkg);
  }

  /** Text of every labelled node, for error messages that are worth reading. */
  get labels() {
    return this.appNodes.filter((n) => n.text).map((n) => n.text);
  }

  /**
   * Rule 4 — the app must actually be on screen. If the foreground belongs to
   * something else, coordinates from this snapshot land somewhere else too.
   */
  assertAppInFront() {
    if (!this.appNodes.length) {
      throw new DeviceError(
        `${this.device.pkg} 의 노드가 화면에 없다 — 다른 앱이나 잠금화면이 앞에 있다. ` +
        `보이는 것: ${JSON.stringify(this.labels.slice(0, 6))}`
      );
    }
    return this;
  }

  find(matcher) {
    const re = matcher instanceof RegExp ? matcher : new RegExp(`^${matcher}$`);
    return this.appNodes.filter((n) => n.text && re.test(n.text.trim()));
  }

  /**
   * Rule 3 — exactly one, or an error.
   *
   * Two matches is not a chance to guess. `취소` labelled both a modal button
   * and the keypad's undo; taking the first pressed undo and produced a bug
   * report about cancel. If a label is ambiguous, say where you mean with
   * `near`, rather than letting the tool pick.
   */
  one(matcher, { near = null } = {}) {
    let hits = this.find(matcher);
    if (near) {
      const anchor = this.one(near);
      hits = [...hits].sort((a, b) => Math.abs(a.cy - anchor.cy) - Math.abs(b.cy - anchor.cy)).slice(0, 1);
    }
    if (hits.length === 0) {
      throw new DeviceError(
        `"${matcher}" 를 찾지 못했다. 화면에 있는 것: ${JSON.stringify(this.labels.slice(0, 14))}`
      );
    }
    if (hits.length > 1) {
      throw new DeviceError(
        `"${matcher}" 가 ${hits.length}개 매칭됐다 (${hits.map((h) => `@y${Math.round(h.cy)}`).join(', ')}). ` +
        '어느 것인지 정해야 한다 — near 로 기준을 주거나 더 좁은 선택자를 쓸 것. ' +
        '임의로 첫 번째를 고르면 엉뚱한 것을 누르고도 성공했다고 보고하게 된다.'
      );
    }
    return hits[0];
  }

  has(matcher) {
    return this.find(matcher).length > 0;
  }

  /** Native dialog buttons Capacitor hardcodes in English. */
  get nativeDialogButtons() {
    return this.nodes.filter((n) => /^(OK|CANCEL)$/i.test(n.text.trim())).map((n) => n.text);
  }
}
