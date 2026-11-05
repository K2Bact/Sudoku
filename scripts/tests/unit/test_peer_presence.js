/**
 * Gate 2-33 — A 1v1 Says When The Opponent Stops Answering (D37).
 *
 * Two phones, one off the network for 90 seconds (2026-10-30): neither screen
 * changed, and a player whose opponent never came back finished the board alone.
 * Now each side sends a heartbeat while a match is played and the other says
 * "No response" after 12 s with nothing heard (firebase/peerPresence.js). What
 * this drives, through the real battleService on a fake clock and a stub channel:
 *   1. the first beat goes out at once, then every 4 s, on the room only, with
 *      the match number; progress just sent skips the beat
 *   2. an opponent who has sent a heartbeat and then nothing for 12 s is shown as
 *      not answering; anything heard clears it
 *   3. an opponent on 31/32 (progress, never a heartbeat) is never shown as
 *      gone, however long they think (Gemini G2-2)
 *   4. leaving, the opponent leaving, the match ending, a rematch: the beat
 *      stops and nothing is left showing (Gemini M3-2); the AI is never watched
 *   5. this phone's own connection: Offline when Firebase says so, cleared after
 */
import assert from 'node:assert/strict';
import { generatePuzzle } from '../../../src/engine/SudokuEngine.js';
import { BEAT_MS, isOpponentSilent, noteHeard } from '../../../src/firebase/peerPresence.js';

// The number the user saw in the 10-29 plan (Diary 167), written out here so a change
// to the constant cannot move the test along with it.
const SILENT_MS = 12_000;

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

// A clock the test moves by hand, and intervals that run only when it moves.
let now = 1_000_000;
const timers = new Map();
let nextId = 1;
const realNow = Date.now;
Date.now = () => now;
globalThis.setInterval = (fn, ms) => { const id = nextId++; timers.set(id, { fn, ms, at: now + ms }); return id; };
globalThis.clearInterval = (id) => { timers.delete(id); };
const advance = async (ms) => {
  const end = now + ms;
  for (;;) {
    const due = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
    if (!due) break;
    const [id, t] = due;
    now = t.at;
    t.at += t.ms;
    t.fn();
    if (!timers.has(id)) continue;
    await Promise.resolve();
  }
  now = end;
  await Promise.resolve();
};

const { battleService } = await import('../../../src/firebase/battleService.js');

console.log('======================================================');
console.log('QA Gate 2-33: A 1v1 Says When The Opponent Stops Answering (D37)');
console.log('======================================================');

const beats = [];
let connection = null;
let unwatched = 0;
battleService.channel = {
  isCrossDevice: true,
  send: () => {},
  sendRoom: async () => {},
  sendRoomOnly: async (m) => { beats.push({ ...m, at: now }); return true; },
  watchConnection: async (cb) => { connection = cb; return () => { unwatched += 1; connection = null; }; },
  listQueue: async () => [],
  enqueue: async () => {},
  dequeue: async () => {},
  claimTicket: async () => null,
  whoAmI: async () => 'me',
  leaveRoom: () => {},
  close: () => {},
};
let notified = 0;
battleService.subscribeRoom(() => { notified += 1; });

const fresh = generatePuzzle(3);
const open = () => {
  battleService.myPlayerId = 'me';
  battleService.setupRoom({
    code: 'ROOM1', roomId: 'r1', level: 3, puzzle: fresh.puzzle, solution: fresh.solution,
    initialEmptyCount: fresh.puzzle.flat().filter((v) => v === 0).length,
    opponentId: 'them', opponentName: 'Them',
  });
  return battleService.currentRoom;
};
const from = (type, extra = {}) => battleService.handleMessage({ type, roomId: 'ROOM1', senderId: 'them', seq: battleService.currentRoom.matchSeq, ...extra });
const remaining = () => Object.fromEntries([...Array(9)].map((_, i) => [i + 1, 5]));

// 0. The rules alone.
{
  const room = { status: 'playing', heardAt: now };
  noteHeard(room, { type: 'player_progress' }, now);
  assert.equal(isOpponentSilent(room, now + 60_000), false, 'progress alone armed the watch — an opponent on 31/32 thinking for a minute would read as gone');
  noteHeard(room, { type: 'heartbeat' }, now);
  assert.equal(isOpponentSilent(room, now + SILENT_MS), false, 'shown as gone at exactly 12 s');
  assert.equal(isOpponentSilent(room, now + SILENT_MS + 1), true, 'not shown as gone after 12 s with nothing heard');
  assert.equal(isOpponentSilent({ ...room, isAiMatch: true }, now + 60_000), false, 'the AI was watched');
  console.log('  ✅ 0. the rules: armed by a heartbeat, gone after 12 s, never the AI');
}

// 1. Beats: at once, every 4 s, on the room, numbered; progress skips one.
{
  beats.length = 0;
  const room = open();
  await advance(0);
  assert.equal(beats.length, 1, `the first beat must go out at once (sent ${beats.length})`);
  assert.deepEqual([beats[0].type, beats[0].roomId, beats[0].seq], ['heartbeat', 'ROOM1', room.matchSeq], 'the beat must name the room and the match');
  await advance(BEAT_MS);
  assert.equal(beats.length, 2, `a beat every 4 s (sent ${beats.length} by 4 s)`);
  await advance(1000);
  battleService.sendProgress(remaining(), 0);
  await advance(BEAT_MS - 1000);
  assert.equal(beats.length, 2, 'a beat went out a second after progress said the same thing');
  await advance(1000);
  assert.equal(beats.length, 3, 'no beat 4 s after the progress');
  battleService.leaveRoom();
  console.log('  ✅ 1. the first beat at once, then every 4 s, on the room, numbered; progress skips one');
}

// 2. An opponent who beat and then went quiet.
{
  open();
  await advance(0);
  from('heartbeat');
  notified = 0;
  await advance(SILENT_MS);
  assert.equal(battleService.currentRoom.opponentSilent, false, 'shown as not answering before 12 s had passed');
  await advance(1000);
  assert.equal(battleService.currentRoom.opponentSilent, true, 'an opponent silent for 13 s is not shown as not answering');
  assert(notified >= 1, 'the screen was not told the opponent went quiet');
  from('player_progress', { progressPct: 10, mistakes: 0, status: 'playing' });
  await advance(1000);
  assert.equal(battleService.currentRoom.opponentSilent, false, 'progress from the opponent did not clear "No response"');
  battleService.leaveRoom();
  console.log('  ✅ 2. quiet for 12 s after a heartbeat → "No response"; anything heard clears it');
}

// 3. An opponent on 31/32: progress, never a heartbeat.
{
  open();
  await advance(0);
  from('player_progress', { progressPct: 5, mistakes: 0, status: 'playing' });
  await advance(60_000);
  assert.equal(battleService.currentRoom.opponentSilent, false, 'an opponent on 31/32 thinking for a minute was shown as not answering');
  battleService.leaveRoom();
  console.log('  ✅ 3. an opponent on 31/32 is never shown as gone');
}

// 4. Every way out stops the beat and leaves nothing showing.
{
  const stopsAfter = async (label, end) => {
    open();
    await advance(0);
    from('heartbeat');
    await advance(SILENT_MS + 1000);
    assert.equal(battleService.currentRoom?.opponentSilent, true, `${label}: setup — not shown as gone`);
    end();
    const count = beats.length;
    await advance(BEAT_MS * 3);
    assert.equal(beats.length, count, `${label}: the heartbeat kept going after the match was over`);
    assert.equal(battleService.presenceTimer, null, `${label}: the timer was left running`);
    if (battleService.currentRoom) assert.equal(battleService.currentRoom.opponentSilent, false, `${label}: "No response" stayed on`);
  };
  await stopsAfter('leaving', () => battleService.leaveRoom());
  await stopsAfter('the opponent leaving', () => battleService.handleOpponentLeft());
  await stopsAfter('the board finished', () => { battleService.currentRoom.status = 'finished'; });
  battleService.leaveRoom();

  open();
  await advance(0);
  const before = unwatched;
  battleService.resetForNewMatch({ puzzle: fresh.puzzle, solution: fresh.solution, initialEmptyCount: fresh.puzzle.flat().filter((v) => v === 0).length });
  assert.equal(unwatched, before + 1, 'a rematch kept the old connection watch alongside the new one');
  assert.equal(timers.size, 1, `a rematch left ${timers.size} heartbeat timers`);
  battleService.leaveRoom();

  beats.length = 0;
  battleService.currentRoom = { code: 'AI', status: 'playing', isAiMatch: true, matchSeq: 0 };
  battleService.startPresence();
  await advance(BEAT_MS * 2);
  assert.equal(beats.length, 0, 'a heartbeat was sent in a match against the AI');
  battleService.currentRoom = null;
  battleService.stopPresence();
  console.log('  ✅ 4. leaving, the opponent leaving, the end, a rematch: the beat stops and nothing stays; no beat against the AI');
}

// 5. This phone's own connection.
{
  open();
  await advance(0);
  assert(connection, 'the match did not watch this phone\'s own connection');
  connection(false);
  assert.equal(battleService.currentRoom.selfOffline, true, 'this phone lost its connection and the match did not say so');
  connection(true);
  assert.equal(battleService.currentRoom.selfOffline, false, '"Offline" stayed after the connection came back');
  battleService.leaveRoom();
  assert.equal(connection, null, 'leaving kept watching the connection');
  console.log('  ✅ 5. Offline when this phone loses its connection, cleared when it comes back');
}

Date.now = realNow;
console.log('\n[2-33] PASSED — a 1v1 says when the opponent stops answering');
