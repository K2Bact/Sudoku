/**
 * firebaseTransport.js
 * Cross-device transport over Firebase Realtime Database.
 *
 * Implements the same contract as LocalTransport (see ./index.js), so
 * battleService does not change at all when this is swapped in — that was the
 * whole point of splitting the transport out first.
 *
 * `isCrossDevice` is true here, and unlike the local transport that is the truth:
 * two phones signed into the same database genuinely see each other's messages.
 *
 * Data layout:
 *   /queue/{playerId}   matchmaking tickets, removed on disconnect
 *   /bus/{pushId}       broadcast messages, each expiring on its own
 *
 * Realtime Database bills by bytes transferred, not by operation count, and every
 * message here is ~100 bytes — which is why this and not Firestore.
 */

import { getDatabase } from '../firebaseApp.js';

const QUEUE_PATH = 'queue';
const BUS_PATH = 'bus';
const TICKET_TTL_MS = 30000;
// Messages older than this are ignored on arrival; a listener that reconnects
// must not replay a finished match.
const MESSAGE_TTL_MS = 60000;

export class FirebaseTransport {
  /** Two devices really can reach each other through this transport. */
  get isCrossDevice() {
    return true;
  }

  constructor(playerId, onMessage) {
    this.playerId = playerId;
    this.onMessage = onMessage;
    this.closed = false;
    this.unsubscribers = [];
    this.startedAt = Date.now();
    this.api = null;
    this.ready = this.init();
  }

  async init() {
    const api = await getDatabase();
    if (this.closed || !api.db) return null;
    this.api = api;

    // Listen for new bus entries only. onChildAdded replays existing children
    // once on attach, which the timestamp guard below filters out.
    const busRef = api.ref(api.db, BUS_PATH);
    const unsub = api.onChildAdded(busRef, (snap) => {
      const payload = snap.val();
      if (!payload || payload.senderId === this.playerId) return;
      // Drop anything from before this session, and anything stale.
      const ts = Number(payload._ts) || 0;
      if (ts < this.startedAt || Date.now() - ts > MESSAGE_TTL_MS) return;
      this.onMessage(payload);
    });
    this.unsubscribers.push(unsub);
    return api;
  }

  async send(message) {
    const api = this.api || (await this.ready);
    if (!api || !api.db) return;
    const payload = { ...message, senderId: this.playerId, _ts: Date.now() };
    try {
      const entryRef = api.push(api.ref(api.db, BUS_PATH));
      await api.set(entryRef, payload);
      // The sender owns cleanup: leaving a match must not leave its traffic behind
      // for the next pair to replay.
      api.onDisconnect(entryRef).remove();
      setTimeout(() => {
        api.remove(entryRef).catch(() => {});
      }, MESSAGE_TTL_MS);
    } catch (e) {
      console.warn('[FirebaseTransport] send failed:', e?.message || e);
    }
  }

  async listQueue() {
    const api = this.api || (await this.ready);
    if (!api || !api.db) return [];
    try {
      const snap = await api.get(api.ref(api.db, QUEUE_PATH));
      const val = snap.val() || {};
      return Object.values(val).filter((t) => t && Date.now() - t.timestamp < TICKET_TTL_MS);
    } catch (e) {
      console.warn('[FirebaseTransport] listQueue failed:', e?.message || e);
      return [];
    }
  }

  async enqueue(ticket) {
    const api = this.api || (await this.ready);
    if (!api || !api.db) return;
    try {
      const ticketRef = api.ref(api.db, `${QUEUE_PATH}/${ticket.playerId}`);
      await api.set(ticketRef, ticket);
      // A player who closes the app mid-search must not sit in the queue forever
      // as a ghost opponent nobody can actually match with.
      api.onDisconnect(ticketRef).remove();
    } catch (e) {
      console.warn('[FirebaseTransport] enqueue failed:', e?.message || e);
    }
  }

  async dequeue(playerId) {
    const api = this.api || (await this.ready);
    if (!api || !api.db) return;
    try {
      await api.remove(api.ref(api.db, `${QUEUE_PATH}/${playerId}`));
    } catch (e) {
      console.warn('[FirebaseTransport] dequeue failed:', e?.message || e);
    }
  }

  /**
   * 티켓 하나를 원자적으로 가져간다. 가져간 쪽에만 티켓이 돌아오고,
   * 늦은 쪽에는 null 이 돌아온다.
   *
   * ── 왜 dequeue 로는 안 되는가 ────────────────────────────────────────
   * 선점이 `listQueue()` 로 읽고 `dequeue(peer)` 로 지우는 두 단계였다.
   * 그 사이에 다른 검색자가 같은 티켓을 읽을 수 있으므로, 둘 다 자기가
   * 이겼다고 믿고 각자 방을 만든다. 대기자는 먼저 도착한 match_created
   * 하나만 받아들이고 나머지는 `if (!this.searchingLevel) return` 으로
   * 버린다. 그래서 대기자는 무사하지만, 늦은 호스트는 절대 오지 않는
   * 상대를 기다리는 방에 혼자 남는다 — 이름은 뜨고 진행률은 0 에서
   * 움직이지 않는 유령 상대가 된다.
   *
   * 검색자가 셋일 때 더 잘 드러난다. A < B < C 가 동시에 누르면 A 는 둘
   * 다에게 양보하고, B 와 C 는 각자 A 를 상대로 정한다. 아이디 비교는
   * 누가 호스트인지만 정하고 상대가 이미 남에게 잡혔는지는 모른다.
   *
   * 트랜잭션은 읽기와 쓰기를 하나로 묶는다. 값을 본 쪽이 곧 지운 쪽이고,
   * 서버가 한 명에게만 committed 를 준다.
   */
  async claimTicket(playerId) {
    const api = this.api || (await this.ready);
    if (!api || !api.db) return null;
    if (!api.runTransaction) {
      // 트랜잭션을 못 쓰는 빌드에서 조용히 경합 있는 선점으로 되돌아가지 않는다.
      // 아무도 선점하지 못하면 두 검색자가 모두 대기자가 되고, 다음 티켓
      // 방송에서 아이디 비교로 정상적으로 짝이 맺어진다. 유령 상대보다 낫다.
      console.warn('[FirebaseTransport] runTransaction unavailable; refusing to claim');
      return null;
    }
    try {
      const ticketRef = api.ref(api.db, `${QUEUE_PATH}/${playerId}`);
      let seen = null;
      const res = await api.runTransaction(ticketRef, (current) => {
        if (!current) return current;   // 이미 남이 가져갔다 — 건드리지 않는다
        seen = current;
        return null;                    // 지운다
      });
      return res?.committed && seen ? seen : null;
    } catch (e) {
      console.warn('[FirebaseTransport] claimTicket failed:', e?.message || e);
      return null;
    }
  }

  close() {
    this.closed = true;
    for (const unsub of this.unsubscribers) {
      try {
        unsub();
      } catch (_) {
        /* already detached */
      }
    }
    this.unsubscribers = [];
    this.dequeue(this.playerId).catch(() => {});
  }
}
