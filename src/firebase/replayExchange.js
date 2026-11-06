/**
 * replayExchange.js — after a 1v1 ends, both players may swap their moves.
 *
 * ── The rule (I-1, user 2026-09-30) ───────────────────────────────────────
 * A replay is for seeing how the other player won, so it needs their moves — and
 * some players will not want theirs shown. So it is mutual: each side says
 * whether it shares (setting 「대전 기록 공유」, on by default), and moves are
 * sent only when BOTH said yes. Turning it off keeps your moves and costs you
 * theirs. Nothing is exchanged during a match, so nobody can copy a move.
 *
 *   match ends   → each side: replay_share { share }
 *   both true    → each side: match_log { log }   (the moves, as a JSON string)
 *   no answer    → an older app (24, 25) does not know the question; nothing is
 *                  sent to it, and the replay says so after SHARE_ANSWER_MS.
 *
 * Messages carry the match number, so battleService's isForThisMatch keeps a log
 * from one match out of the rematch after it. A received log is checked against
 * the puzzle (replayRecord.isPlausibleOpponentLog) before it is shown; a log that
 * does not hold together is dropped and the replay shows the opponent's reported
 * progress instead. The log is a string, not arrays: the database turns arrays
 * into keyed objects and drops empty slots.
 *
 * Room messages are deleted from the server about a minute after they are sent
 * (firebaseTransport MESSAGE_TTL_MS) — the moves stay only on the two phones.
 *
 * The recorder, the store and the setting are passed in (createReplayExchange),
 * so a test can give two players two of each; the app uses the default below.
 */
import { snapshot as recorderSnapshot, replayKeyFor } from '../utils/replay/matchRecorder.js';
import { saveReplay as storeSave, updateReplay as storeUpdate } from '../utils/replay/replayStore.js';
import { gridToString, isPlausibleOpponentLog, MAX_EVENTS, SHARE_ANSWER_MS } from '../utils/replay/replayRecord.js';
import { loadSettings } from '../utils/storage.js';

const MAX_LOG_CHARS = 200000;
const MAX_PROGRESS = 600;

/** Whether this player shares their moves. On unless they turned it off. */
export function sharesMoves() {
  try {
    return loadSettings().shareMatchReplay !== false;
  } catch {
    return true;
  }
}

/** Keep what the opponent reported, as it arrived — the fallback when no moves come. */
export function noteOpponentProgress(room, data) {
  if (!room || room.isAiMatch) return;
  room.oppProgress = room.oppProgress || [];
  if (room.oppProgress.length >= MAX_PROGRESS) return;
  const t = Math.max(0, Math.round(Date.now() - (room.startedAt || Date.now())));
  room.oppProgress.push([t, Number(data.progressPct) || 0, Number(data.mistakes) || 0]);
}

export function createReplayExchange({ snapshot, saveReplay, updateReplay, shares }) {
  // `from`: change the state only out of these — a late 'declined' must not undo 'shared'.
  const markShare = (id, shareState, from = null) => updateReplay(id, (r) => (
    from && !from.includes(r.opp.shareState) ? r : { ...r, opp: { ...r.opp, shareState } }
  ));

  function sendLogIfAgreed(service) {
    const room = service.currentRoom;
    const rp = room?.replay;
    if (!rp || !rp.share || rp.theirShare !== true || rp.logSent) return;
    rp.logSent = true;
    const snap = snapshot(room);
    const events = snap?.events || [];
    if (events.length > MAX_EVENTS) return;
    const log = snap?.truncated ? { v: 1, events, truncated: true } : { v: 1, events };
    service.sendInRoom({ type: 'match_log', roomId: room.code, seq: room.matchSeq, log: JSON.stringify(log) });
  }

  /** Save this match's replay once and say whether this side shares. */
  function finishReplay(service) {
    try {
      const room = service.currentRoom;
      if (!room || room.isAiMatch || room.status !== 'finished') return;
      const id = replayKeyFor(room);
      if (room.replay?.id === id) return;
      const share = shares();
      const theirShare = room.earlyShare ?? null;
      room.replay = { id, share, theirShare, logSent: false };
      room.earlyShare = undefined;
      const snap = snapshot(room);
      const events = snap?.events || [];
      // How long each player was in the match: to their own finish, or else to
      // the moment it ended — which is now, here. Not the time of their last move:
      // a Flip5 that lost a 1:59 match showed "0:07, 38.7 a minute" because its
      // last digit went in at 0:07 (2026-10-01).
      const endedAt = room.myElapsedMs ?? Math.max(0, Date.now() - (room.startedAt || Date.now()));
      saveReplay({
        v: 1, id, savedAt: Date.now(), pinned: false, level: room.level,
        puzzle: gridToString(room.puzzle), solution: gridToString(room.solution),
        ...(room.variant === 'killer' && room.cages ? { variant: 'killer', cages: room.cages } : {}),   // KP-14
        winner: room.winner, reason: room.winnerReason || '',
        me: { name: service.myPlayerName, elapsedMs: endedAt, mistakes: room.myMistakes, events, truncated: snap?.truncated === true },
        opp: {
          name: room.opponentName, elapsedMs: room.opponentElapsedMs ?? endedAt, mistakes: room.opponentMistakes,
          progress: room.oppProgress || [], events: null,
          shareState: !share ? 'off' : theirShare === false ? 'declined' : theirShare === true ? 'agreed' : 'pending',
        },
      });
      service.sendInRoom({ type: 'replay_share', roomId: room.code, seq: room.matchSeq, share });
      sendLogIfAgreed(service);
    } catch {
      // A replay that could not be saved or offered is a missing replay, nothing more.
    }
  }

  /** The opponent's answer to "shall we exchange?". */
  function handleReplayShare(service, data) {
    try {
      const room = service.currentRoom;
      if (!room || room.isAiMatch) return;
      const theirs = data.share === true;
      if (!room.replay || room.replay.id !== replayKeyFor(room)) {
        // Their answer can arrive before this side has seen the match end.
        room.earlyShare = theirs;
        return;
      }
      room.replay.theirShare = theirs;
      if (room.replay.share) markShare(room.replay.id, theirs ? 'agreed' : 'declined', ['pending']);
      sendLogIfAgreed(service);
    } catch { /* see finishReplay */ }
  }

  /** The opponent's moves. Kept only if this side agreed to exchange, and only if they hold together. */
  function handleMatchLog(service, data) {
    try {
      const room = service.currentRoom;
      const rp = room?.replay;
      if (!rp || !rp.share || rp.id !== replayKeyFor(room)) return;
      if (typeof data.log !== 'string' || data.log.length > MAX_LOG_CHARS) return;
      let parsed;
      // One log per match: the first one decides. A second — resent, or pushed by
      // a modified app — must not replace moves already kept, nor an 'invalid'
      // already given. (Whether this side shares at all is the check above.)
      const OPEN = ['pending', 'agreed'];
      const settled = (r) => Array.isArray(r.opp.events) || r.opp.shareState === 'invalid';
      try { parsed = JSON.parse(data.log); } catch { markShare(rp.id, 'invalid', OPEN); return; }
      const truncated = parsed?.truncated === true;
      updateReplay(rp.id, (r) => {
        if (settled(r)) return r;
        const events = isPlausibleOpponentLog(parsed?.events, r, { truncated });
        return { ...r, opp: { ...r.opp, events, truncated: Boolean(events) && truncated, shareState: events ? 'shared' : 'invalid' } };
      });
    } catch { /* see finishReplay */ }
  }

  /**
   * The result can change after the replay was saved: both players finish, and the
   * tiebreak on elapsed time goes the other way when the opponent's 100% arrives
   * (battleService.handlePlayerProgress). Keep the stored replay in step.
   */
  function refreshReplayResult(service) {
    try {
      const room = service.currentRoom;
      const rp = room?.replay;
      if (!rp) return;
      updateReplay(rp.id, (r) => ({
        ...r, winner: room.winner, reason: room.winnerReason || r.reason,
        opp: { ...r.opp, elapsedMs: room.opponentElapsedMs ?? r.opp.elapsedMs, mistakes: room.opponentMistakes, progress: room.oppProgress || r.opp.progress },
      }));
    } catch { /* see finishReplay */ }
  }

  /**
   * This side is leaving the match: back to the lobby, or a rematch starting.
   * Nothing more for this match will be heard, so a yes whose moves have not
   * come — or, within SHARE_ANSWER_MS, no answer yet — is recorded as missed.
   * Left alone it would read "their app does not support replays" later, which
   * was not what happened (review, 2026-10-01).
   */
  function abandonReplay(service) {
    try {
      const rp = service.currentRoom?.replay;
      if (!rp) return;
      updateReplay(rp.id, (r) => {
        const s = r.opp.shareState;
        const early = Date.now() - r.savedAt <= SHARE_ANSWER_MS;
        return s === 'agreed' || (s === 'pending' && early) ? { ...r, opp: { ...r.opp, shareState: 'missed' } } : r;
      });
    } catch { /* see finishReplay */ }
  }

  return { finishReplay, handleReplayShare, handleMatchLog, refreshReplayResult, abandonReplay };
}

export const { finishReplay, handleReplayShare, handleMatchLog, refreshReplayResult, abandonReplay } = createReplayExchange({
  snapshot: recorderSnapshot, saveReplay: storeSave, updateReplay: storeUpdate, shares: sharesMoves,
});
