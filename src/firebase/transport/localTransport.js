/**
 * localTransport.js
 * Same-device transport: BroadcastChannel plus a localStorage bus/queue.
 *
 * This is what the app has always used, now behind the transport contract in
 * ./index.js so a network transport can replace it without touching battleService.
 *
 * IMPORTANT — `isCrossDevice` is false, and that is the truth about this
 * transport, not a placeholder. BroadcastChannel and the storage event are both
 * same-origin, same-browser-profile mechanisms. An Android app has exactly one
 * WebView, so two phones can never see each other's messages. Anything that
 * offers "play against a real person" on top of this transport is showing the
 * player something that cannot happen. Read the flag; do not assume.
 */

const BUS_KEY = 'suidoku_pvp_bus';
const QUEUE_KEY = 'suidoku_pvp_queue';
const TICKET_TTL_MS = 30000;

export class LocalTransport {
  /** No peer on another device can ever be reached through this transport. */
  get isCrossDevice() {
    return false;
  }

  /** Same question as the Firebase transport answers; here there is no account to ask. */
  async whoAmI() {
    return this.playerId;
  }

  constructor(playerId, onMessage) {
    this.playerId = playerId;
    this.onMessage = onMessage;
    this.channel = null;
    this.storageHandler = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('suidoku_1v1_realtime');
      this.channel.onmessage = (event) => {
        if (event.data && event.data.senderId !== this.playerId) this.onMessage(event.data);
      };
    }

    // Storage events reach other tabs of the same origin
    this.storageHandler = (e) => {
      if (e.key !== BUS_KEY || !e.newValue) return;
      try {
        const payload = JSON.parse(e.newValue);
        if (payload && payload.senderId !== this.playerId) this.onMessage(payload);
      } catch (_) {
        /* malformed bus entry: ignore */
      }
    };
    window.addEventListener('storage', this.storageHandler);
  }

  send(message) {
    const payload = { ...message, senderId: this.playerId, _ts: Date.now() };
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (_) {
        /* channel closed */
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(BUS_KEY, JSON.stringify(payload));
      } catch (_) {
        /* quota or private mode */
      }
    }
  }

  listQueue() {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      return q.filter((item) => Date.now() - item.timestamp < TICKET_TTL_MS);
    } catch {
      return [];
    }
  }

  enqueue(ticket) {
    const queue = this.listQueue().filter((t) => t.playerId !== ticket.playerId);
    queue.push(ticket);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (_) {
      /* ignore */
    }
  }

  dequeue(playerId) {
    const queue = this.listQueue().filter((t) => t.playerId !== playerId);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (_) {
      /* ignore */
    }
  }

  /**
   * 티켓 하나를 가져간다. 가져간 쪽에만 티켓이, 늦은 쪽에는 null 이 돌아온다.
   *
   * 여기서는 자바스크립트가 한 줄기로 돌기 때문에 읽기와 쓰기 사이에 다른
   * 탭이 끼어들 수 없고, 그래서 별도의 장치가 필요하지 않다. 같은 기기의 두
   * 탭이라도 각 호출이 통째로 끝난 뒤에야 다음 호출이 시작된다.
   *
   * 그래도 이 메서드를 두 전송 계층에 모두 두는 이유는, 양쪽이 같은 호출에
   * 답해야 battleService 가 어느 전송인지 묻지 않고 쓸 수 있기 때문이다.
   * 한쪽에만 있으면 로컬로 떨어지는 빌드에서 함수가 없어 터진다.
   */
  claimTicket(playerId) {
    const before = this.listQueue();
    const ticket = before.find((t) => t.playerId === playerId);
    if (!ticket) return null;
    this.dequeue(playerId);
    return ticket;
  }

  close() {
    if (this.channel) {
      try {
        this.channel.close();
      } catch (_) {
        /* already closed */
      }
      this.channel = null;
    }
    if (this.storageHandler && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageHandler);
      this.storageHandler = null;
    }
  }
}
