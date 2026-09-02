/**
 * transport/index.js
 * The single place that decides how battle messages travel.
 *
 * ── Transport contract ────────────────────────────────────────────────────
 *   get isCrossDevice()  true only if peers on OTHER devices can be reached.
 *                        Callers must branch on this instead of assuming.
 *   send(message)        broadcast to peers; the transport stamps senderId
 *   listQueue()          matchmaking tickets currently waiting
 *   enqueue(ticket)      { playerId, playerName, level, timestamp }
 *   dequeue(playerId)    remove a ticket
 *   close()              release listeners/sockets
 *
 * The constructor takes (playerId, onMessage) and delivers every peer message
 * to onMessage, already filtered so a player never receives their own.
 * `listQueue`, `enqueue` and `dequeue` may return promises — callers await or
 * fire-and-forget, and the local transport resolves synchronously.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Firebase is used when its config is present, and the local same-device
 * transport is the fallback. That fallback is not a nicety: a build without
 * `.env` would otherwise construct a transport that silently fails every call,
 * and the UI would advertise real opponents while nothing could connect.
 * LocalTransport at least reports `isCrossDevice: false` truthfully.
 *
 * Do NOT return true from isCrossDevice on a transport that cannot actually
 * reach another device. The flag is what stops the UI from advertising real
 * opponents it cannot deliver.
 */

import { LocalTransport } from './localTransport.js';
import { FirebaseTransport } from './firebaseTransport.js';
import { hasFirebaseConfig } from '../firebaseApp.js';

export function createTransport(playerId, onMessage) {
  if (hasFirebaseConfig()) return new FirebaseTransport(playerId, onMessage);
  console.warn('[transport] No Firebase config; falling back to same-device transport.');
  return new LocalTransport(playerId, onMessage);
}
