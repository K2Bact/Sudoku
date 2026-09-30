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
 *   claimTicket(id)      take a ticket atomically; the ticket to the winner,
 *                        null to everyone else. See below — this is not dequeue.
 *   whoAmI()             the id this transport signs messages with. Over
 *                        Firebase it is the anonymous account's uid, which is
 *                        the only id the rules can verify; callers must adopt it
 *                        before putting a ticket or a room id on the wire.
 *   canSearch()          whether a search can go out right now. Over Firebase it
 *                        is false without a signed-in account, because the rules
 *                        refuse every read and write without one (BT-2); it
 *                        retries sign-in before answering.
 *   close()              release listeners/sockets
 *
 * The constructor takes (playerId, onMessage) and delivers every peer message
 * to onMessage, already filtered so a player never receives their own.
 * `listQueue`, `enqueue` and `dequeue` may return promises — callers await or
 * fire-and-forget, and the local transport resolves synchronously.
 *
 * ── Why claimTicket exists and dequeue is not enough ─────────────────────
 * Claiming used to be `listQueue()` then `dequeue(peer)`. Two searchers can
 * read the same ticket in the gap between those two calls, so both delete it
 * and both build a room. The waiting player takes whichever match_created
 * arrives first and drops the rest, so the waiter is fine — but the losing
 * host sits in a room against an opponent who will never answer: the name
 * shows, the progress bar stays at zero. Three searchers make it plain:
 * with A < B < C, A stands down to both and B and C each pick A.
 *
 * claimTicket closes the gap. Whoever sees the value is the one who removed
 * it, so exactly one caller becomes the host and the others stay in the queue
 * and pair up on the next ticket broadcast.
 *
 * A transport that cannot claim atomically must return null rather than fall
 * back to read-then-delete. Nobody hosting is recoverable — both searchers
 * remain waiters and the id comparison pairs them a moment later. A phantom
 * opponent is not recoverable: the player watches a frozen bar until they quit.
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
