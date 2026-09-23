/**
 * test_battle_message_safety.js
 *
 * Battle messages arrive from a peer and must never be trusted on arrival.
 * Before this gate existed, `player_progress` updated the live room without
 * checking which room it named, and `rematch_accepted` adopted the sender's
 * puzzle and solution outright. On the same-device transport that was only
 * crosstalk; behind a real network transport each one is an opening for a peer
 * to rewrite your board or declare your result.
 *
 * Also pins the transport contract, so a future Firebase transport is a drop-in
 * rather than a rewrite of battleService.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePuzzle } from '../../../src/engine/SudokuEngine.js';
import {
  isValidBoardPayload,
  isValidProgress,
  isForRoom,
  isFromOpponent,
  isValidTicket
} from '../../../src/firebase/battleValidation.js';
import { createTransport } from '../../../src/firebase/transport/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

console.log('======================================================');
console.log('🛡️  Testing Battle Message Validation & Transport Contract');
console.log('======================================================\n');

const puzzle = generatePuzzle(3);

// ── Board payloads ─────────────────────────────────────────────────────────
console.log('▶ 1. Board payloads from a peer');
assert(isValidBoardPayload({ puzzle: puzzle.puzzle, solution: puzzle.solution }),
  'A genuine puzzle/solution pair must be accepted');

const brokenSolution = puzzle.solution.map((r) => [...r]);
brokenSolution[0][0] = brokenSolution[0][1]; // duplicate in row
assert(!isValidBoardPayload({ puzzle: puzzle.puzzle, solution: brokenSolution }),
  'A solution that breaks Sudoku rules must be rejected');

const inconsistentPuzzle = puzzle.puzzle.map((r) => [...r]);
outer: for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    if (inconsistentPuzzle[r][c] !== 0) {
      inconsistentPuzzle[r][c] = (inconsistentPuzzle[r][c] % 9) + 1;
      break outer;
    }
  }
}
assert(!isValidBoardPayload({ puzzle: inconsistentPuzzle, solution: puzzle.solution }),
  'A puzzle whose givens contradict its solution must be rejected — it would mark correct entries as mistakes');

assert(!isValidBoardPayload(null), 'A missing payload must be rejected');
assert(!isValidBoardPayload({ puzzle: [[1, 2]], solution: puzzle.solution }),
  'A grid that is not 9x9 must be rejected');
console.log('  ✅ Only a real puzzle consistent with its own solution is accepted');

// ── Progress reports ───────────────────────────────────────────────────────
console.log('▶ 2. Opponent progress reports');
assert(isValidProgress({ progressPct: 45, mistakes: 1 }), 'An in-range report must be accepted');
assert(!isValidProgress({ progressPct: 900, mistakes: 0 }), 'A peer must not claim 900% progress');
assert(!isValidProgress({ progressPct: -1, mistakes: 0 }), 'Negative progress must be rejected');
assert(!isValidProgress({ progressPct: 50, mistakes: -5 }), 'Negative mistakes must be rejected');
assert(!isValidProgress({ progressPct: 50, mistakes: 99 }), 'Mistakes above the 3-strike limit must be rejected');
console.log('  ✅ Out-of-range progress and mistake counts are refused');

// ── Room and sender identity ───────────────────────────────────────────────
console.log('▶ 3. Room and sender identity');
const room = { code: 'AB123', opponentId: 'user_peer' };
assert(isForRoom({ roomId: 'AB123' }, room), 'A message naming this room must be accepted');
assert(!isForRoom({ roomId: 'ZZ999' }, room), 'A message for another room must be ignored');
assert(!isForRoom({}, room), 'A message with no roomId must be ignored');
assert(!isForRoom({ roomId: 'AB123' }, null), 'No room means nothing to act on');
assert(isFromOpponent({ senderId: 'user_peer' }, room), 'The opponent may drive the room');
assert(!isFromOpponent({ senderId: 'user_third_party' }, room), 'A third party must not drive the room');
assert(!isFromOpponent({}, room), 'An unsigned message must be ignored');
assert(isValidTicket({ playerId: 'u2', timestamp: Date.now(), level: 3 }, 3), 'A well-formed ticket is usable');
assert(!isValidTicket({ playerId: 'u2', timestamp: Date.now(), level: 5 }, 3), 'A ticket for another level must not match');
assert(!isValidTicket({ timestamp: Date.now() }, 3), 'A ticket without a playerId must be rejected');
// 타임스탬프 규칙은 이 프로젝트에서 실제로 터진 것이다. 방송이 timestamp 를 빼고
// 나가는 바람에 모든 match_ticket 이 도착 즉시 거부됐고, 1v1 은 조용히 죽어 있었다.
// 변이 테스트에서 이 검증을 통째로 지웠는데도 게이트가 통과했다 — 네 규칙 중
// 셋만 보고 정작 버그를 낸 규칙을 안 보고 있었다.
assert(!isValidTicket({ playerId: 'u2', level: 3 }, 3), 'A ticket without a timestamp must be rejected');
console.log('  ✅ Only the opponent of this exact room can change its state');

// ── Transport contract ─────────────────────────────────────────────────────
console.log('▶ 4. Transport contract');
const transport = createTransport('u1', () => {});
for (const method of ['send', 'listQueue', 'enqueue', 'dequeue', 'close']) {
  assert(typeof transport[method] === 'function', `Transport must implement ${method}()`);
}
assert(typeof transport.isCrossDevice === 'boolean',
  'Transport must declare isCrossDevice so the UI can tell whether a real opponent is reachable');
assert(transport.isCrossDevice === false,
  'The local transport cannot reach another device and must say so. If a network transport ' +
  'is added, update this expectation deliberately — never flip the flag to make a UI look better.');
transport.close();
console.log('  ✅ Contract is complete and the local transport reports its real reach');

// ── Firebase ticket claiming under a transaction retry ───────────────────
//
// Gate 2-9 proves two searchers meet, but it runs on the local transport and
// makes zero Firebase calls, so nothing in the pipeline exercised this method.
// It has to be driven directly.
//
// The contract being pinned is the SDK's, not ours: runTransaction may call the
// update function more than once — when the optimistic write is rejected, it
// re-runs it with the value the server actually holds. Returning `undefined`
// aborts (committed = false); returning anything else, null included, is a
// write that commits. claimTicket kept the ticket it saw on the first call in a
// closure and returned it whenever the transaction committed, so the retry that
// found the ticket already gone still reported a successful claim — two hosts,
// one waiting player, and the ghost opponent the transaction was added to kill.
console.log('\n▶ Firebase claimTicket under a transaction retry');
{
  const { FirebaseTransport } = await import('../../../src/firebase/transport/firebaseTransport.js');
  const TICKET = { playerId: 'peer-1', level: 3 };

  /** An api whose runTransaction feeds `sequence` to the update function in turn. */
  const fakeApi = (sequence) => ({
    db: {},
    ref: () => ({}),
    calls: 0,
    async runTransaction(_ref, updateFn) {
      for (const current of sequence) {
        this.calls++;
        if (updateFn(current) === undefined) return { committed: false };
      }
      return { committed: true };
    },
  });

  const claim = async (sequence) => {
    const t = Object.create(FirebaseTransport.prototype);
    t.api = fakeApi(sequence);
    t.ready = Promise.resolve(t.api);
    const got = await t.claimTicket('peer-1');
    return { claimed: got != null, calls: t.api.calls };
  };

  const uncontended = await claim([TICKET]);
  assert.strictEqual(uncontended.calls, 1, 'the uncontended case must reach the update function');
  assert.strictEqual(uncontended.claimed, true, 'an uncontended ticket must be claimed');

  const absent = await claim([null]);
  assert.strictEqual(absent.claimed, false, 'a queue with no ticket must not produce a claim');

  const contended = await claim([TICKET, null]);
  assert.strictEqual(contended.calls, 2, 'the contended case must actually retry, or it proves nothing');
  assert.strictEqual(contended.claimed, false,
    'a retry that finds the ticket gone must fail the claim — another client already took it');

  // The case that matters most, and the one this test did not have when the
  // first attempt at the fix was written. `null` on the FIRST call does not
  // mean the ticket is gone — it means this client has no cached value for the
  // path yet, which is the normal opening move. Aborting there never reaches
  // the server, so the ticket is never seen and matchmaking stops entirely:
  // gate 3-10 went red, and instrumenting the real transport showed searcher B
  // receiving null twice and a ticket never. Only the second null, after a
  // ticket has been seen in the same transaction, means somebody took it.
  const coldCache = await claim([null, TICKET]);
  assert.strictEqual(coldCache.claimed, true,
    'null before any ticket is an empty local cache, not a lost race — the claim must still succeed');
  assert.strictEqual(coldCache.calls, 2, 'the cold-cache case must reach the server round trip');
}
console.log('  ✅ Claims an uncontended ticket and one that arrives after a cold cache; refuses an absent one and one taken during a retry');

// ── An id on the wire has to be one the database can vouch for (RT-2) ─────
//
// auth != null proved only that SOME client asked. senderId and the queue key
// were strings the client picked, so a signed-in client could write a message
// as the opponent and isFromOpponent — which compares senderId against the
// opponent's id — would wave it through. Two halves have to hold together:
// the rules must tie both ids to auth.uid, and the app must sign with that same
// uid, or every write is denied the moment the rules are published.
{
  const rules = JSON.parse(fs.readFileSync(path.join(root, 'firebase.rules.json'), 'utf8')).rules;

  const queue = rules.queue.$playerId;
  assert(/\$playerId === auth\.uid/.test(queue['.write']),
    'a ticket must be written under the writer own uid, or anyone can queue as anyone');
  assert(/!newData\.exists\(\)/.test(queue['.write']),
    'but removing a ticket must stay open to the other player: that is how claimTicket works');
  assert(/auth\.uid/.test(queue.playerId['.validate']),
    'the ticket own playerId field must equal auth.uid too, not just the key');

  const bus = rules.bus.$messageId;
  assert(/senderId.*auth\.uid/.test(bus['.write']),
    'a message may only be written with the sender own uid (RT-2)');
  assert(/auth\.uid/.test(bus.senderId['.validate']),
    'and senderId itself must be validated against auth.uid');
  assert(/data\.child\('senderId'\)\.val\(\) === auth\.uid/.test(bus['.write']),
    'deleting a message must be the sender own business, or a peer can wipe a live match traffic');
  assert(!/^auth != null$/.test(bus['.write']),
    'the old bare auth != null write rule is what RT-2 was');

  // The app side: the Firebase transport signs with the account uid, and
  // battleService adopts it before anything with an id goes out.
  const transport = fs.readFileSync(path.join(root, 'src/firebase/transport/firebaseTransport.js'), 'utf8');
  assert(/this\.identity = api\.uid/.test(transport),
    'the Firebase transport must take its identity from the signed-in account');
  assert(/senderId: this\.identity/.test(transport),
    'and sign messages with it, not with the id it was handed');
  assert(/async whoAmI\(\)/.test(transport), 'and answer whoAmI() so callers can adopt it');

  const app = fs.readFileSync(path.join(root, 'src/firebase/firebaseApp.js'), 'utf8');
  assert(/uid/.test(app) && /signInAnonymously/.test(app),
    'firebaseApp must carry the uid out of sign-in; nothing else can prove an id');

  const service = fs.readFileSync(path.join(root, 'src/firebase/battleService.js'), 'utf8');
  assert(/adoptProvenIdentity/.test(service), 'battleService must adopt the proven identity');
  // the search itself lives in battleMatchmaking.js since the 2026-09-23 split
  const matchmaking = fs.readFileSync(path.join(root, 'src/firebase/battleMatchmaking.js'), 'utf8');
  const search = matchmaking.slice(matchmaking.indexOf('export async function startQuickMatch'));
  const adoptAt = search.indexOf('adoptProvenIdentity');
  const enqueueAt = search.indexOf('service.channel.enqueue');
  const listAt = search.indexOf('service.channel.listQueue');
  assert(adoptAt > 0 && adoptAt < listAt && adoptAt < enqueueAt,
    'the identity must be adopted BEFORE the queue is read or a ticket is written, '
    + 'or the first ticket of a session still carries the local id');

  // And the local transport answers the same question, so the contract holds
  // for the same-device path too.
  const localOnly = createTransport('local_player', () => {});
  assert.strictEqual(typeof localOnly.whoAmI, 'function', 'every transport must answer whoAmI()');
  const who = await localOnly.whoAmI();
  assert.strictEqual(who, 'local_player', 'with no account to ask, the given id is the identity');
  localOnly.close?.();
}
console.log('  ✅ Ids on the wire are tied to the signed-in account: rules check auth.uid, the app signs with it, and a search adopts it first');

// ── An opponent's board has to be a puzzle (RT-8 / F09) ──────────────────
//
// Checking only that the givens agree with the solution let two useless boards
// through: an empty grid (every given trivially agrees) and a solved one. The
// first hands both players 81 blanks instead of the level they chose; the second
// ends the match before it starts. And initialEmptyCount is what progress is
// measured against, so a board claiming one empty cell would show the sender
// leaping to 100%.
{
  const good = generatePuzzle(3);
  const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
  const blanksOf = (g) => g.flat().filter((v) => v === 0).length;
  const payload = (puzzle, solution, extra = {}) => ({
    puzzle, solution, initialEmptyCount: blanksOf(puzzle), level: 3, ...extra
  });

  assert.strictEqual(isValidBoardPayload(payload(good.puzzle, good.solution), 3), true,
    'a real level 3 board must be accepted — otherwise this check proves nothing');

  assert.strictEqual(isValidBoardPayload(payload(empty, good.solution)), false,
    'an empty grid passed as a puzzle (RT-8 / F09)');
  assert.strictEqual(isValidBoardPayload(payload(good.solution, good.solution)), false,
    'a solved grid passed as a puzzle: the match would be over before it started');

  // ...and with no level named anywhere, which is the case the level rule cannot
  // cover, the board still has to be a board
  assert.strictEqual(isValidBoardPayload({ puzzle: empty, solution: good.solution }), false,
    'an empty grid with no level named must still be rejected — too few clues to be a puzzle at all');
  assert.strictEqual(isValidBoardPayload({ puzzle: good.solution, solution: good.solution }), false,
    'and a solved grid with no level named must be rejected for having nothing left to fill');

  // the count progress is measured against must describe the board it came with
  assert.strictEqual(
    isValidBoardPayload({ ...payload(good.puzzle, good.solution), initialEmptyCount: 1 }, 3), false,
    'initialEmptyCount must match the board, or a peer can appear to finish instantly');

  // and the board must be the level it claims
  const easy = generatePuzzle(1);
  assert.strictEqual(isValidBoardPayload(payload(easy.puzzle, easy.solution, { level: 1 }), 5), false,
    'a level 1 board must not be accepted into a level 5 match');
  assert.strictEqual(isValidBoardPayload(payload(easy.puzzle, easy.solution, { level: 1 }), 1), true,
    'and the same board is fine in the match it belongs to');
  console.log('  ✅ An opponent board must be a real puzzle of this level, with a blank count that describes it');
}

// ── A rematch is a new match, and the old one must not reach into it (RT-3) ──
//
// The room keeps its code across a rematch, so roomId cannot tell two matches
// apart. Three things went wrong because of that, and all three are driven here
// through the real service with a stub transport:
//   F05  an acceptance nobody asked for reset a live board to zero
//   F06  a 'finished' progress message from the previous match ended the new one
//   F07  the clocks carried over, so the photo finish was decided by the old match
{
  const { battleService } = await import('../../../src/firebase/battleService.js');
  const sent = [];
  const realChannel = battleService.channel;
  battleService.channel = {
    isCrossDevice: false,
    send: (m) => sent.push(m),
    listQueue: async () => [],
    enqueue: async () => {},
    dequeue: async () => {},
    claimTicket: async () => null,
    whoAmI: async () => 'me',
    close: () => {}
  };
  const fresh = generatePuzzle(3);
  const openRoom = () => {
    battleService.myPlayerId = 'me';
    battleService.setupRoom({
      code: 'ROOM1', level: 3, puzzle: fresh.puzzle, solution: fresh.solution,
      initialEmptyCount: fresh.puzzle.flat().filter((v) => v === 0).length,
      opponentId: 'them', opponentName: 'Them'
    });
    return battleService.currentRoom;
  };
  const board = () => {
    const p2 = generatePuzzle(3);
    return { puzzle: p2.puzzle, solution: p2.solution,
             initialEmptyCount: p2.puzzle.flat().filter((v) => v === 0).length };
  };
  try {
    // F05: an acceptance out of nowhere, mid-match
    let room = openRoom();
    room.myProgress = 80;
    battleService.handleMessage({ type: 'rematch_accepted', roomId: 'ROOM1', senderId: 'them', ...board() });
    assert.strictEqual(room.myProgress, 80,
      'an acceptance nobody asked for wiped a live board back to zero (RT-3 / F05)');
    assert.strictEqual(room.matchSeq, 0, 'and it must not have started a new match either');

    // ...but a real handshake still works, from either side
    battleService.requestRematch();
    battleService.handleMessage({ type: 'rematch_accepted', roomId: 'ROOM1', senderId: 'them', seq: 0, ...board() });
    assert.strictEqual(room.matchSeq, 1, 'an acceptance to our own request must be taken');
    assert.strictEqual(room.myProgress, 0, 'and it starts the new match');

    room = openRoom();
    room.myProgress = 55;
    battleService.handleMessage({ type: 'rematch_request', roomId: 'ROOM1', senderId: 'them', seq: 0 });
    battleService.handleMessage({ type: 'rematch_accepted', roomId: 'ROOM1', senderId: 'them', seq: 0, ...board() });
    assert.strictEqual(room.matchSeq, 1, 'an acceptance after THEY asked must be taken too');

    // F06: the previous match's finish arriving in the new one
    room = openRoom();
    battleService.requestRematch();
    battleService.handleMessage({ type: 'rematch_accepted', roomId: 'ROOM1', senderId: 'them', seq: 0, ...board() });
    assert.strictEqual(room.matchSeq, 1);
    battleService.handleMessage({
      type: 'player_progress', roomId: 'ROOM1', senderId: 'them', seq: 0,
      progressPct: 100, mistakes: 0, status: 'finished', winner: 'me'
    });
    assert.strictEqual(room.status, 'playing',
      'a finish from the match before ended the new one before a digit was entered (RT-3 / F06)');
    battleService.handleMessage({
      type: 'player_progress', roomId: 'ROOM1', senderId: 'them', seq: 1,
      progressPct: 40, mistakes: 0, status: 'playing', winner: null
    });
    assert.strictEqual(room.opponentProgress, 40, 'the current match progress must still arrive');

    // every in-match message this side sends carries the number — including the
    // progress report, which is the one that carried the stale finish (F06), so
    // it has to be driven for real rather than assumed
    battleService.sendProgress({ 1: 3, 2: 2 }, 0);
    battleService.declineRematch();
    battleService.acceptRematch();   // the one message the receive path cannot produce here
    const stamped = sent.filter((m) => ['player_progress', 'rematch_request', 'rematch_accepted',
                                        'rematch_declined', 'player_left'].includes(m.type));
    for (const type of ['player_progress', 'rematch_request', 'rematch_accepted', 'rematch_declined']) {
      assert(stamped.some((m) => m.type === type), `no ${type} was sent — that check proves nothing`);
    }
    for (const m of stamped) {
      assert.strictEqual(typeof m.seq, 'number', `${m.type} must carry the match number`);
    }

    // F07: the clocks belong to the match, not to the room
    room = openRoom();
    room.startedAt = Date.now() - 300000;
    room.myElapsedMs = 250000;
    room.opponentElapsedMs = 260000;
    battleService.requestRematch();
    battleService.handleMessage({ type: 'rematch_accepted', roomId: 'ROOM1', senderId: 'them', seq: 0, ...board() });
    assert.strictEqual(room.myElapsedMs, null, 'the rematch must start with no elapsed time of its own (RT-3 / F07)');
    assert.strictEqual(room.opponentElapsedMs, null, 'for both players');
    assert(Date.now() - room.startedAt < 5000, 'and the clock must start now, not when the first match did');
    console.log('  ✅ A rematch is its own match: no unasked acceptance, no message from the match before, fresh clocks');
  } finally {
    battleService.channel = realChannel;
    battleService.currentRoom = null;
  }
}

console.log('\n🎉 [PASS] Battle Message Validation & Transport Contract Verified!\n');
