/**
 * peerPresence.js — whether the 1v1 opponent is still there (D37, 2026-10-30).
 *
 * A match had no word for an opponent who went quiet. Two phones, one taken off
 * the network for 90 seconds: neither screen changed — the other side's
 * progress simply stopped — and a player whose opponent never came back had to
 * finish the board alone (2026-10-27 and 2026-10-30). BT-3's forfeit only follows
 * a goodbye, which a crash or a lost connection never sends. The user, 10-29:
 * "표시하도록 수정해야지" — say so, nothing more (no forfeit).
 *
 * So each side sends a heartbeat every few seconds while the match is played, on
 * the match's own room channel, and the other side says "no response" after a
 * stretch with nothing heard. The rules, kept here so a gate can run them on a
 * fake clock (2-33):
 *   - Watching starts with the first heartbeat heard, never with progress. 31 and
 *     32 send progress but no heartbeat; armed by progress, an opponent on those
 *     versions thinking over a move for 12 s would read as gone (Gemini G2-2).
 *   - Once watching, anything the opponent sends counts as heard. A side that
 *     has just sent progress skips that beat — progress says the same thing.
 *   - Only while the match is played, and never against the AI (it is on this
 *     phone).
 */
export const BEAT_MS = 4000;
export const SILENT_MS = 12000;

/** Everything from the opponent says they are there; a heartbeat starts the watching. */
export function noteHeard(room, data, now) {
  if (!room) return;
  room.heardAt = now;
  if (data?.type === 'heartbeat') room.peerBeats = true;
}

/** Whether this side owes the opponent a heartbeat now. */
export function beatDue(room, now) {
  return Boolean(room && room.status === 'playing' && !room.isAiMatch && now - (room.sentAt || 0) >= BEAT_MS);
}

/** Whether to say the opponent is not answering. */
export function isOpponentSilent(room, now) {
  return Boolean(room && room.peerBeats && room.status === 'playing' && !room.isAiMatch && now - (room.heardAt || 0) > SILENT_MS);
}

/**
 * Start the heartbeat and both watches for the service's current match — the one
 * on the opponent, and the one on this phone's own connection (in the 2026-10-30
 * test the side that dropped off did not know it either). A one-second tick sends
 * a beat when one is due and says when the opponent went quiet. It stops itself
 * once the match is no longer played, and every way out of a match stops it as
 * well (Gemini M3-2): the opponent leaving, this side leaving, a rematch.
 */
export function startPresence(service) {
  stopPresence(service);
  const room = service.currentRoom;
  if (!room || room.isAiMatch) return;
  const token = (service.presenceToken = {});
  Object.assign(room, { peerBeats: false, heardAt: Date.now(), sentAt: 0, opponentSilent: false, selfOffline: false });
  const tick = () => {
    if (service.presenceToken !== token || service.currentRoom !== room || room.status !== 'playing') {
      if (service.presenceToken === token) stopPresence(service);
      return;
    }
    const now = Date.now();
    if (beatDue(room, now)) {
      room.sentAt = now;
      // The match's room only: /bus reaches every player online. A room not yet
      // proven sends nothing, and the next tick tries again.
      const sent = typeof service.channel.sendRoomOnly === 'function'
        ? service.channel.sendRoomOnly({ type: 'heartbeat', roomId: room.code, seq: room.matchSeq })
        : false;
      Promise.resolve(sent)
        .then((ok) => { if (!ok && room.sentAt === now) room.sentAt = 0; })
        .catch(() => { if (room.sentAt === now) room.sentAt = 0; });
    }
    const silent = isOpponentSilent(room, now);
    if (silent !== room.opponentSilent) {
      room.opponentSilent = silent;
      service.notifyListeners();
    }
  };
  tick(); // the first beat at once, so a new-version opponent starts watching (Gemini M2-2)
  service.presenceTimer = setInterval(tick, 1000);
  // In Node (the unit gates) a timer keeps the process alive; a browser's is a number.
  service.presenceTimer?.unref?.();
  if (typeof service.channel.watchConnection === 'function') {
    Promise.resolve(service.channel.watchConnection((up) => {
      if (service.presenceToken !== token || service.currentRoom !== room) return;
      if (!up !== room.selfOffline) {
        room.selfOffline = !up;
        service.notifyListeners();
      }
    })).then((unwatch) => {
      if (service.presenceToken === token) service.unwatchConnection = unwatch;
      else if (typeof unwatch === 'function') unwatch();
    }).catch(() => {});
  }
}

/** Stop the heartbeat and both watches, and take down anything they were showing. */
export function stopPresence(service) {
  service.presenceToken = null;
  if (service.presenceTimer) {
    clearInterval(service.presenceTimer);
    service.presenceTimer = null;
  }
  if (typeof service.unwatchConnection === 'function') {
    try { service.unwatchConnection(); } catch { /* already detached */ }
  }
  service.unwatchConnection = null;
  if (service.currentRoom) Object.assign(service.currentRoom, { opponentSilent: false, selfOffline: false });
}
