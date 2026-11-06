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

import { RoomLink } from './roomLink.js';

const BUS_KEY = 'suidoku_pvp_bus';
const QUEUE_KEY = 'suidoku_pvp_queue';
const TICKET_TTL_MS = 30000;
const membersKey = (roomId) => `suidoku_pvp_room_members:${roomId}`;

/**
 * The match's own channel on one device, answering the way the published Firebase
 * rules do (firebase.rules.json, /rooms): only the two members may read or write,
 * and a room is created once. Two switches stand in for what the server decides,
 * so gate 2-9 can run every case the network can produce:
 *   roomsAllowed    false = the new rules are not published yet
 *   unreadableFor   ids whose reads the server refuses (a rule that is wrong)
 *   killerQueue     false = the /queue_killer rules are not published yet (KP-10):
 *                   a killer ticket is refused, as the server would refuse it
 */
export const localRoomRules = { roomsAllowed: true, unreadableFor: new Set(), killerQueue: true };

export class LocalTransport {
  /** No peer on another device can ever be reached through this transport. */
  get isCrossDevice() {
    return false;
  }

  /** Same question as the Firebase transport answers; here there is no account to ask. */
  async whoAmI() {
    return this.playerId;
  }

  /** Nothing to sign in to on this device, so a search can always go out. */
  async canSearch() {
    return true;
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

  /** Which queue the next search uses, as over Firebase (KP-10): a killer search waits apart. */
  useQueue(kind) {
    this.queueKind = kind === 'killer' ? 'killer' : 'classic';
  }

  get queueKey() {
    return this.queueKind === 'killer' ? `${QUEUE_KEY}_killer` : QUEUE_KEY;
  }

  listQueue() {
    try {
      const q = JSON.parse(localStorage.getItem(this.queueKey) || '[]');
      return q.filter((item) => Date.now() - item.timestamp < TICKET_TTL_MS);
    } catch {
      return [];
    }
  }

  /** False when the ticket did not go in — as Firebase answers a refused write. */
  enqueue(ticket) {
    if (this.queueKind === 'killer' && !localRoomRules.killerQueue) return false;
    const queue = this.listQueue().filter((t) => t.playerId !== ticket.playerId);
    queue.push(ticket);
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (_) {
      /* ignore */
    }
    return true;
  }

  dequeue(playerId) {
    const queue = this.listQueue().filter((t) => t.playerId !== playerId);
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
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

  // ── The match's own channel (RT-2) — see roomLink.js ─────────────────────
  roomIo() {
    const members = (roomId) => {
      try { return JSON.parse(localStorage.getItem(membersKey(roomId)) || '[]'); } catch { return []; }
    };
    const isMember = (roomId) => localRoomRules.roomsAllowed && members(roomId).includes(this.playerId);
    this.roomWriters = this.roomWriters || new Map();
    return {
      claim: (roomId, peerId) => {
        if (!localRoomRules.roomsAllowed || localStorage.getItem(membersKey(roomId))) return false;
        localStorage.setItem(membersKey(roomId), JSON.stringify([this.playerId, peerId]));
        return true;
      },
      attach: (roomId, onPayload, onDenied) => {
        if (!isMember(roomId) || localRoomRules.unreadableFor.has(this.playerId) || typeof BroadcastChannel === 'undefined') {
          onDenied();
          return () => {};
        }
        const ch = new BroadcastChannel(`suidoku_room_${roomId}`);
        ch.onmessage = (e) => onPayload(e.data);
        return () => ch.close();
      },
      write: (roomId, payload) => {
        if (!isMember(roomId) || typeof BroadcastChannel === 'undefined') return false;
        if (!this.roomWriters.has(roomId)) this.roomWriters.set(roomId, new BroadcastChannel(`suidoku_room_${roomId}`));
        this.roomWriters.get(roomId).postMessage(payload);
        return true;
      },
      release: (roomId) => {
        const left = members(roomId).filter((id) => id !== this.playerId);
        if (left.length) localStorage.setItem(membersKey(roomId), JSON.stringify(left));
        else localStorage.removeItem(membersKey(roomId));
        const w = this.roomWriters.get(roomId);
        if (w) { w.close(); this.roomWriters.delete(roomId); }
      },
    };
  }

  newRoomLink() {
    this.leaveRoom();
    this.room = new RoomLink(this.roomIo(), () => this.playerId, (p) => this.onMessage(p));
    return this.room;
  }

  openRoom(roomId, peerId) { return this.newRoomLink().host(roomId, peerId); }

  joinRoom(roomId) { return this.newRoomLink().guest(roomId); }

  async sendRoom(message) {
    if (this.room && (await this.room.send(message))) return;
    this.send(message);
  }

  /** Heartbeats go on the room or not at all, as over Firebase (D37). */
  async sendRoomOnly(message) {
    return Boolean(this.room && (await this.room.send(message)));
  }

  leaveRoom(roomId) {
    if (!this.room || (roomId && this.room.roomId !== roomId)) return;
    this.room.close();
    this.room = null;
  }

  close() {
    this.leaveRoom();
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
