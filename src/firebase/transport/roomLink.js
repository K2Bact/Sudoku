/**
 * roomLink.js — a match's own channel, used only once both ends have proved it works.
 *
 * ── Why (RT-2, 2026-09-30) ─────────────────────────────────────────────────
 * Every 1v1 message went to one shared path, /bus, and every signed-in client
 * could read all of it: every match's progress, rematches and departures, and
 * every phone listening downloaded every match's traffic. Tickets and the room
 * announcement have to be public — that is how two strangers find each other —
 * but what happens inside a match does not. So a match gets its own path,
 * /rooms/{roomId}/msgs, which the rules let only its two members read or write.
 *
 * ── Why a handshake, and why three steps ──────────────────────────────────
 * Two things can be missing, and neither may break a match:
 *   - the other player runs a version without rooms (24 and older), and
 *   - the server has not been given the rules that allow the path yet.
 * So the room is only used after both directions have been shown to work:
 *
 *   guest → hello   proves the guest can write and the host can read
 *   host  → ack     proves the host can write and the guest can read
 *   guest → ready   tells the host its ack arrived
 *
 * The guest switches on ack; the host switches on ready. A host that switched on
 * hello would be trusting a direction nobody had tested — if the guest could not
 * read the room, the host's messages would vanish and the guest would watch a
 * frozen bar. Until a side has switched it keeps sending on /bus, and both sides
 * always listen to both, so a handshake that never completes costs nothing: the
 * match simply runs the way it always has.
 *
 * ── What a transport supplies ─────────────────────────────────────────────
 *   claim(roomId, peerId)        host: create the room with both members → bool
 *   attach(roomId, onPayload, onDenied)  listen to the room → unsubscribe()
 *   write(roomId, payload)       add one message → bool
 *   release(roomId)              drop this player's membership
 */

const HANDSHAKE = new Set(['room_hello', 'room_ack', 'room_ready']);

export class RoomLink {
  constructor(io, getIdentity, deliver) {
    this.io = io;
    this.getIdentity = getIdentity;
    this.deliver = deliver;
    this.roomId = null;
    this.role = null;
    this.ready = false;
    this.denied = false;
    this.unsubscribe = null;
  }

  stamp(message) {
    return { ...message, senderId: this.getIdentity(), _ts: Date.now() };
  }

  listen(roomId) {
    this.unsubscribe = this.io.attach(
      roomId,
      (payload) => this.onPayload(payload),
      () => { this.denied = true; },
    );
  }

  onPayload(payload) {
    if (!payload || typeof payload.type !== 'string') return;
    if (payload.senderId === this.getIdentity()) return;
    if (!HANDSHAKE.has(payload.type)) {
      this.deliver(payload);
      return;
    }
    if (payload.type === 'room_hello' && this.role === 'host') {
      this.io.write(this.roomId, this.stamp({ type: 'room_ack', roomId: this.roomId }));
    } else if (payload.type === 'room_ack' && this.role === 'guest' && !this.denied) {
      this.ready = true;
      this.io.write(this.roomId, this.stamp({ type: 'room_ready', roomId: this.roomId }));
    } else if (payload.type === 'room_ready' && this.role === 'host') {
      this.ready = true;
    }
  }

  /** Host: make the room and listen. False means the server refused — stay on /bus. */
  async host(roomId, peerId) {
    this.roomId = roomId;
    this.role = 'host';
    const ok = await this.io.claim(roomId, peerId);
    if (!ok) return false;
    this.listen(roomId);
    return true;
  }

  /** Guest: listen, then say hello. Nothing switches until the ack comes back. */
  async guest(roomId) {
    this.roomId = roomId;
    this.role = 'guest';
    this.listen(roomId);
    await this.io.write(roomId, this.stamp({ type: 'room_hello', roomId }));
  }

  /** Send on the room if both ends have proved it. False means: send on /bus instead. */
  async send(message) {
    if (!this.ready) return false;
    return this.io.write(this.roomId, this.stamp(message));
  }

  close() {
    if (this.unsubscribe) {
      try { this.unsubscribe(); } catch { /* already detached */ }
    }
    this.unsubscribe = null;
    if (this.roomId && this.role) {
      Promise.resolve(this.io.release(this.roomId)).catch(() => {});
    }
    this.ready = false;
    this.roomId = null;
    this.role = null;
  }
}
