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
