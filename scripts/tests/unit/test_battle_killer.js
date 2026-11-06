/**
 * test_battle_killer.js — gate 2-36: a killer 1v1 (KP-10, KP-14; 2026-11-06)
 *
 * A killer match goes everywhere a standard one does, cages beside the board:
 * the search, the room, the rematch, the replay. And it must never reach an app
 * up to build 33, which knows only standard boards — on Firebase the /queue rule
 * refuses any field it does not name, and an old app reading a killer ticket from
 * /queue would host a STANDARD room against a player who searched for killer.
 *
 * So a killer search waits in its own queue, its broadcast tickets say what they
 * are, a ticket or a board that says nothing is standard (exactly what an old app
 * sends), and a search the server refuses — the /queue_killer rules not published
 * yet — says "could not connect" rather than waiting twelve seconds for nobody.
 *
 * Like gate 2-9 this runs real BattleService instances over the real
 * LocalTransport; nothing about matching is stubbed. Messages an old app would
 * send are put on the bus raw, and each "ignored" is paired with the same
 * message being acted on by a search of its own kind — an ignore that would
 * also ignore the right ticket proves nothing.
 */

import assert from 'assert';
import fs from 'fs';
import { isValidCageSet } from '../../../src/engine/variants.js';
import { dealMatchBoard, ticketKind, kindField } from '../../../src/firebase/battleKind.js';
import { isValidMatchBoard, isValidKillerPayload, isValidTicket } from '../../../src/firebase/battleValidation.js';
import { gridToString, normalizeRecord } from '../../../src/utils/replay/replayRecord.js';
import { createReplayExchange } from '../../../src/firebase/replayExchange.js';

console.log('======================================================');
console.log('🧩 Gate 2-36: killer 1v1 — killer meets killer, never an old app');
console.log('======================================================\n');

const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};
globalThis.window = globalThis;
globalThis.window.addEventListener = () => {};
globalThis.window.removeEventListener = () => {};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (ok, ms, what) => {
  const end = Date.now() + ms;
  while (!ok()) {
    if (Date.now() > end) throw new Error(`timed out waiting for ${what}`);
    await wait(10);
  }
};
const SERVICE = new URL('../../../src/firebase/battleService.js', import.meta.url).href;
const { localRoomRules } = await import('../../../src/firebase/transport/localTransport.js');
let tag = 0;
const players = [];
async function newPlayer() {
  storage.delete('suidoku_player_id');
  const p = (await import(`${SERVICE}?killer=${++tag}`)).battleService;
  players.push(p);
  return p;
}
const done = (...ps) => { for (const p of ps) { p.leaveRoom(); p.channel.close(); } };

// The bus as everyone hears it, and a mouth for an old app.
const seen = [];
const ear = new BroadcastChannel('suidoku_1v1_realtime');
ear.onmessage = (e) => seen.push(e.data);
const mouth = new BroadcastChannel('suidoku_1v1_realtime');
const say = (m) => mouth.postMessage({ ...m, senderId: 'gate_injector', _ts: Date.now() });

const sumsMatch = (room) => room.cages.every((c) => c.cells.reduce((s, i) => s + room.solution[Math.floor(i / 9)][i % 9], 0) === c.sum);
function assertKillerRoom(room, label) {
  assert(room, `${label}: no room`);
  assert.strictEqual(room.variant, 'killer', `${label}: the room says ${room.variant}, not killer — the game would start as a standard board`);
  assert(isValidCageSet(room.cages), `${label}: the room's cages do not cover the board once`);
  assert(sumsMatch(room), `${label}: a cage sum is not its cells' sum in the solution`);
}

// ── 1. Two killer searches meet, in a killer room with the same cages ─────
console.log('▶ 1. Killer meets killer — staggered and at once');
{
  storage.clear();
  seen.length = 0;
  const A = await newPlayer();
  const B = await newPlayer();
  await A.startQuickMatch(3, () => {}, undefined, 'killer');
  await wait(120);
  const ticket = seen.find((m) => m?.type === 'match_ticket');
  assert(ticket && ticket.kind === 'killer', 'a killer search must say so in its broadcast ticket');
  assert(isValidTicket(ticket, 3), 'and the ticket must still be one the validator accepts');
  assert(storage.get('suidoku_pvp_queue_killer')?.includes(A.myPlayerId), 'the killer ticket waits in the killer queue');
  assert(!(storage.get('suidoku_pvp_queue') || '').includes(A.myPlayerId),
    'and not in the standard queue — an app up to 33 reads that one and would host a standard room for it');
  await B.startQuickMatch(3, () => {}, undefined, 'killer');
  await until(() => A.currentRoom && B.currentRoom, 3000, 'two killer searches to pair');
  assertKillerRoom(A.currentRoom, 'staggered, waiter');
  assertKillerRoom(B.currentRoom, 'staggered, host');
  assert.strictEqual(A.currentRoom.code, B.currentRoom.code, 'one room');
  assert.deepStrictEqual(A.currentRoom.cages, B.currentRoom.cages, 'both players must get the same cages');
  assert.deepStrictEqual(A.currentRoom.puzzle, B.currentRoom.puzzle, 'and the same board');
  const created = seen.find((m) => m?.type === 'match_created');
  assert(isValidKillerPayload(created), 'the match_created on the wire is a whole killer board');
  done(A, B);

  storage.clear();
  const C = await newPlayer();
  const D = await newPlayer();
  await Promise.all([C.startQuickMatch(3, () => {}, undefined, 'killer'), D.startQuickMatch(3, () => {}, undefined, 'killer')]);
  await until(() => C.currentRoom && D.currentRoom, 3000, 'two simultaneous killer searches to pair');
  assert.strictEqual(C.currentRoom.code, D.currentRoom.code, 'at once: one host, one room');
  assertKillerRoom(C.currentRoom, 'at once');
  assert.deepStrictEqual(C.currentRoom.cages, D.currentRoom.cages, 'at once: the same cages');
  done(C, D);
  console.log('  ✅ Same room, same board, same cages; the ticket says killer and waits in its own queue');
}

// ── 2. A killer search and a standard one never meet ──────────────────────
console.log('▶ 2. Killer and standard stay apart — and neither is starved');
{
  storage.clear();
  seen.length = 0;
  const K = await newPlayer();
  const S = await newPlayer();
  await K.startQuickMatch(3, () => {}, undefined, 'killer');
  await wait(120);
  await S.startQuickMatch(3, () => {});
  await wait(400);
  assert(!K.currentRoom && !S.currentRoom, `a killer and a standard search paired (${K.currentRoom?.variant || S.currentRoom?.variant}) — one of them is now on the wrong board`);
  assert(K.searchingLevel && S.searchingLevel, 'both must still be searching');
  const sTicket = seen.find((m) => m?.type === 'match_ticket' && m.playerId === S.myPlayerId);
  assert(sTicket && !('kind' in sTicket), 'a standard ticket must carry no kind field: old apps see exactly what they always saw');
  // A second standard search finds the first, and the killer is left waiting.
  const S2 = await newPlayer();
  await S2.startQuickMatch(3, () => {});
  await until(() => S.currentRoom && S2.currentRoom, 3000, 'two standard searches to pair');
  assert.strictEqual(S.currentRoom.variant, 'classic', 'the standard pair plays standard');
  assert.strictEqual(S.currentRoom.cages, null, 'with no cages');
  assert(!K.currentRoom && K.searchingLevel, 'the killer search is still waiting, untouched');
  done(K, S, S2);
  console.log('  ✅ Killer vs standard: no match; standard pairs with standard; the killer keeps waiting');
}

// ── 3. What an app up to 33 sends is standard, and a killer search ignores it ──
console.log('▶ 3. An old app\'s ticket and board: ignored by killer, taken by standard');
{
  // 3a. An old app searching after us: its ticket goes into /queue and onto the bus, with
  //     no kind field. Its id sorts first, so the searcher would be the host.
  const oldTicket = { type: 'match_ticket', playerId: '0ld_app_player', playerName: 'Old', level: 3, timestamp: Date.now() };
  assert(isValidTicket(oldTicket, 3), 'setup: the old ticket is otherwise a valid one');
  assert.strictEqual(ticketKind(oldTicket), 'classic', 'a ticket that says nothing is standard');
  const oldAppSearches = () => {
    const { type, ...t } = { ...oldTicket, timestamp: Date.now() };
    storage.set('suidoku_pvp_queue', JSON.stringify([...JSON.parse(storage.get('suidoku_pvp_queue') || '[]'), t]));
    say({ type, ...t });
  };
  storage.clear();
  seen.length = 0;
  const K = await newPlayer();
  await K.startQuickMatch(3, () => {}, undefined, 'killer');
  await wait(80);
  oldAppSearches();
  await wait(250);
  assert(!K.currentRoom, `a killer search hosted a room for an old app's ticket — the old app gets a standard board it cannot tell apart, the killer player a ${K.currentRoom?.variant} room`);
  assert(!seen.some((m) => m?.type === 'match_created'), 'and nothing may be sent to the old app');
  // The killer queue already keeps the two apart: K's claim on the old ticket would find
  // nothing in /queue_killer. But to make that claim K first withdraws its own ticket and
  // then puts it back — a moment in which another killer searcher finds an empty queue —
  // and broadcasts it again, once for every old ticket it hears. A ticket of the other
  // kind must not touch K's own.
  const kTickets = seen.filter((m) => m?.type === 'match_ticket' && m.playerId === K.myPlayerId).length;
  assert.strictEqual(kTickets, 1,
    `the killer search broadcast its ticket ${kTickets} times: a ticket it could never take made it withdraw and re-post its own (handleMatchTicket must skip the other kind before claiming)`);
  done(K);
  storage.clear();
  const S = await newPlayer();
  await S.startQuickMatch(3, () => {});
  await wait(80);
  oldAppSearches();
  await until(() => S.currentRoom, 2000, 'a standard search to take the old ticket (the control)');
  assert.strictEqual(S.currentRoom.opponentId, oldTicket.playerId, 'control: a standard search does host the old app');
  done(S);

  // 3b. The old ticket in the standard queue: a killer search never reads that queue.
  storage.clear();
  storage.set('suidoku_pvp_queue', JSON.stringify([{ playerId: '0ld_app_player', playerName: 'Old', level: 3, timestamp: Date.now() }]));
  const K2 = await newPlayer();
  await K2.startQuickMatch(3, () => {}, undefined, 'killer');
  await wait(150);
  assert(!K2.currentRoom, 'a killer search took a ticket from the standard queue');
  assert(storage.get('suidoku_pvp_queue').includes('0ld_app_player'), 'and the old app\'s ticket is still there for a standard search');
  done(K2);

  // 3c. A board of the other kind, addressed to the searcher.
  const offer = (to, board) => ({ type: 'match_created', roomId: `room_gate_${tag}`, level: 3, ...board,
    player1: { id: 'gate_host', name: 'Host' }, player2: { id: to.myPlayerId, name: to.myPlayerName } });
  storage.clear();
  const K3 = await newPlayer();
  const S3 = await newPlayer();
  await K3.startQuickMatch(3, () => {}, undefined, 'killer');
  await S3.startQuickMatch(3, () => {});
  // K3 and S3 do not pair (2), so each is free to take one offer.
  say(offer(K3, dealMatchBoard(3, 'classic')));
  say(offer(S3, dealMatchBoard(3, 'killer')));
  await wait(250);
  assert(!K3.currentRoom, 'a killer search adopted a standard board');
  assert(!S3.currentRoom, 'a standard search adopted a killer board — an app that cannot draw cages would be asked to');
  say(offer(K3, dealMatchBoard(3, 'killer')));
  say(offer(S3, dealMatchBoard(3, 'classic')));
  await until(() => K3.currentRoom && S3.currentRoom, 2000, 'the boards of the right kind to be adopted (the control)');
  assertKillerRoom(K3.currentRoom, 'control, killer offer');
  assert.strictEqual(S3.currentRoom.variant, 'classic', 'control, standard offer');
  done(K3, S3);
  console.log('  ✅ Old ticket and other-kind boards ignored; the same messages are taken by the right kind');
}

// ── 4. The killer queue refused: "could not connect", at once ─────────────
console.log('▶ 4. /queue_killer rules not published — the search says it could not connect');
{
  storage.clear();
  seen.length = 0;
  localRoomRules.killerQueue = false;
  const K = await newPlayer();
  let unavailable = 0;
  let matched = 0;
  await K.startQuickMatch(3, () => matched++, () => unavailable++, 'killer');
  assert.strictEqual(unavailable, 1, 'a refused killer ticket must report "could not connect" — otherwise the lobby waits and then says nobody came');
  assert.strictEqual(matched, 0, 'and no match');
  assert.strictEqual(K.searchingLevel, null, 'and the player is no longer searching');
  await wait(80);
  assert(!seen.some((m) => m?.type === 'match_ticket'), 'and no ticket is broadcast for a search that is not in any queue');
  // Standard is untouched by the killer rules.
  const S1 = await newPlayer();
  const S2 = await newPlayer();
  await S1.startQuickMatch(3, () => {});
  await wait(100);
  await S2.startQuickMatch(3, () => {});
  await until(() => S1.currentRoom && S2.currentRoom, 3000, 'standard to pair while the killer queue is refused');
  localRoomRules.killerQueue = true;
  done(K, S1, S2);
  console.log('  ✅ Refused: told at once, nothing broadcast; standard 1v1 unaffected');
}

// ── 5. A rematch keeps the kind ───────────────────────────────────────────
console.log('▶ 5. Rematch: killer deals killer, standard deals standard');
async function rematch(kind) {
  storage.clear();
  const A = await newPlayer();
  const B = await newPlayer();
  await A.startQuickMatch(3, () => {}, undefined, kind);
  await wait(120);
  await B.startQuickMatch(3, () => {}, undefined, kind);
  await until(() => A.currentRoom && B.currentRoom, 3000, `${kind}: the first match`);
  const before = JSON.stringify(A.currentRoom.puzzle);
  const seq = A.currentRoom.matchSeq;
  A.requestRematch();
  await until(() => B.currentRoom.rematchAsked, 2000, `${kind}: the rematch request to arrive`);
  B.acceptRematch();
  await until(() => A.currentRoom.matchSeq !== seq && B.currentRoom.matchSeq !== seq, 2000, `${kind}: both to start the rematch`);
  assert.notStrictEqual(JSON.stringify(A.currentRoom.puzzle), before, `${kind}: the rematch is a new board`);
  assert.deepStrictEqual(A.currentRoom.puzzle, B.currentRoom.puzzle, `${kind}: the same new board on both sides`);
  return [A, B];
}
{
  const [A, B] = await rematch('killer');
  assertKillerRoom(A.currentRoom, 'killer rematch, requester');
  assertKillerRoom(B.currentRoom, 'killer rematch, accepter');
  assert.deepStrictEqual(A.currentRoom.cages, B.currentRoom.cages, 'killer rematch: the same new cages');
  // An acceptance carrying a standard board, from the opponent, to a question A did ask:
  // everything about it is right but the kind. Then the same with a killer board (the control).
  A.requestRematch();
  const seq = A.currentRoom.matchSeq;
  const accept = (board) => mouth.postMessage({ type: 'rematch_accepted', roomId: A.currentRoom.code, seq, level: 3, ...board,
    senderId: B.myPlayerId, _ts: Date.now() });
  accept(dealMatchBoard(3, 'classic'));
  await wait(250);
  assert.strictEqual(A.currentRoom.matchSeq, seq, 'a killer room took a standard board as its rematch — the match changes kind under the player');
  assert.strictEqual(A.currentRoom.variant, 'killer', 'and stays a killer');
  accept(dealMatchBoard(3, 'killer'));
  await until(() => A.currentRoom.matchSeq !== seq, 2000, 'a killer rematch board from the opponent to be taken (the control)');
  assertKillerRoom(A.currentRoom, 'killer rematch, control');
  done(A, B);
  const [C, D] = await rematch('classic');
  assert.strictEqual(C.currentRoom.variant, 'classic', 'standard rematch stays standard');
  assert.strictEqual(C.currentRoom.cages, null, 'with no cages');
  done(C, D);
  console.log('  ✅ A killer rematch is a new killer with new cages, the same on both sides');
}

// ── 6. The board validator, by kind ───────────────────────────────────────
console.log('▶ 6. isValidMatchBoard: each kind checked for what makes it playable');
{
  const k = dealMatchBoard(3, 'killer');
  const c = dealMatchBoard(3, 'classic');
  assert(isValidMatchBoard(k, undefined, 'killer'), 'a dealt killer board is valid as killer');
  assert(isValidMatchBoard(c, 3, 'classic'), 'a dealt standard board is valid as standard');
  assert(!isValidMatchBoard(k, 3, 'classic'), 'a killer board offered to a standard search is refused');
  assert(!isValidMatchBoard(c, 3, 'killer'), 'a standard board offered to a killer search (or rematch) is refused');
  const lv5 = dealMatchBoard(5, 'killer');
  assert(isValidMatchBoard(lv5, undefined, 'killer'), 'a Lv.5 killer — which may give no digits at all — is valid');
  const bad = (change) => { const b = JSON.parse(JSON.stringify(k)); change(b); return isValidMatchBoard(b, undefined, 'killer'); };
  assert(!bad((b) => { b.cages[0].sum += 1; }), 'a cage sum that is not its cells\' sum is refused — the board would have no answer');
  assert(!bad((b) => { b.cages.pop(); }), 'cages that leave cells uncovered are refused');
  assert(!bad((b) => { b.cages = null; }), 'a killer with no cages is refused');
  assert(!bad((b) => { b.puzzle = b.solution; }), 'a killer with nothing left to fill is refused');
  assert(!bad((b) => { b.initialEmptyCount += 1; }), 'a wrong empty count is refused');
  assert(!bad((b) => {
    const i = b.puzzle.flat().findIndex((v) => v !== 0);
    const [r, col] = i >= 0 ? [Math.floor(i / 9), i % 9] : [0, 0];
    b.puzzle[r][col] = (b.solution[r][col] % 9) + 1;
  }), 'a given that disagrees with the solution is refused');
  // A repeated digit in a cage, with the sum kept right: merge two neighbouring cages
  // whose digits overlap, so only the repeat check can catch it.
  const digit = k.solution.flat();
  let merged = null;
  for (let x = 0; x < k.cages.length && !merged; x++) {
    for (let y = x + 1; y < k.cages.length && !merged; y++) {
      const dx = new Set(k.cages[x].cells.map((i) => digit[i]));
      if (k.cages[y].cells.some((i) => dx.has(digit[i]))) merged = [x, y];
    }
  }
  assert(merged, 'setup: two cages that share a digit');
  assert(!bad((b) => {
    const [x, y] = merged;
    b.cages[x] = { cells: [...b.cages[x].cells, ...b.cages[y].cells], sum: b.cages[x].sum + b.cages[y].sum };
    b.cages.splice(y, 1);
  }), 'a cage with a digit twice is refused, even when its sum adds up');
  assert.deepStrictEqual(kindField('classic'), {}, 'a standard ticket adds no field');
  console.log('  ✅ Kinds kept apart; bad sums, gaps, no cages, no blanks, wrong givens, repeats refused');
}

// ── 7. The replay keeps the cages (KP-14) ─────────────────────────────────
console.log('▶ 7. A killer match\'s replay is saved with its cages, and a damaged set is dropped');
{
  const k = dealMatchBoard(3, 'killer');
  const records = [];
  const ex = createReplayExchange({
    snapshot: () => ({ events: [] }),
    saveReplay: (r) => { const n = normalizeRecord(r); if (n) records.push(n); return n; },
    updateReplay: () => null,
    shares: () => false,
  });
  const svc = { myPlayerName: 'A', sendInRoom: () => {}, currentRoom: {
    code: 'K1', matchSeq: 0, level: 3, puzzle: k.puzzle, solution: k.solution, variant: 'killer', cages: k.cages,
    status: 'finished', winner: 'me', winnerReason: 'my_completion', startedAt: Date.now() - 60000, opponentName: 'B', oppProgress: [],
  } };
  ex.finishReplay(svc);
  assert.strictEqual(records.length, 1, 'the killer match was saved');
  assert.strictEqual(records[0].variant, 'killer', 'the killer match was saved as a killer');
  assert.deepStrictEqual(records[0].cages, k.cages, 'with its cages — without them the replay shows a board with too few digits to make sense of');
  const base = { v: 1, id: 'R1-0', level: 3, puzzle: gridToString(k.puzzle), solution: gridToString(k.solution), winner: 'me',
    me: { name: 'A', elapsedMs: 1, mistakes: 0, events: [] }, opp: { name: 'B', elapsedMs: 1, mistakes: 0, progress: [], events: null, shareState: 'off' } };
  const kept = normalizeRecord({ ...base, variant: 'killer', cages: k.cages });
  assert.deepStrictEqual(kept.cages, k.cages, 'a stored killer replay is read back with its cages');
  const torn = normalizeRecord({ ...base, variant: 'killer', cages: k.cages.slice(1) });
  assert(torn && !torn.cages && !torn.variant, 'a torn cage set is dropped, the replay kept — a damaged record can fail to show its cages, never break');
  const plain = normalizeRecord(base);
  assert(plain && !('variant' in plain) && !('cages' in plain), 'a standard replay is exactly what it was');
  console.log('  ✅ Saved with cages, read back with cages; torn cages dropped, the replay kept');
}

// ── 8. Over Firebase: the killer queue path, a refused write, the rules ───
console.log('▶ 8. Firebase: /queue_killer for killer, false for a refused write, rules the same as /queue');
{
  const { FirebaseTransport } = await import('../../../src/firebase/transport/firebaseTransport.js');
  const writes = [];
  let refuse = false;
  const api = {
    db: {}, uid: 'uid_gate',
    ref: (_db, path) => path,
    set: async (path, v) => { if (refuse) throw new Error('PERMISSION_DENIED'); writes.push([path, v]); },
    onDisconnect: () => ({ remove() {} }),
    remove: async () => {},
  };
  const tr = new FirebaseTransport('uid_gate', () => {});
  tr.api = api;
  tr.ready = Promise.resolve(api);
  tr.useQueue('killer');
  assert.strictEqual(await tr.enqueue({ playerId: 'uid_gate', level: 3, timestamp: 1 }), true, 'an accepted write answers true');
  assert.strictEqual(writes[0][0], 'queue_killer/uid_gate', `a killer ticket must go to /queue_killer, not ${writes[0][0]}`);
  tr.useQueue('classic');
  await tr.enqueue({ playerId: 'uid_gate', level: 3, timestamp: 1 });
  assert.strictEqual(writes[1][0], 'queue/uid_gate', 'a standard ticket stays in /queue');
  refuse = true;
  tr.useQueue('killer');
  assert.strictEqual(await tr.enqueue({ playerId: 'uid_gate', level: 3, timestamp: 1 }), false,
    'a write the server refuses must answer false — that is what turns unpublished rules into "could not connect"');
  tr.close?.();

  const rules = JSON.parse(fs.readFileSync('firebase.rules.json', 'utf8')).rules;
  assert(rules.queue_killer, 'firebase.rules.json must have /queue_killer — without it every killer search is refused');
  assert.deepStrictEqual(rules.queue_killer, rules.queue,
    '/queue_killer must hold the same rules as /queue: the same ticket shape, the same owner checks');
  console.log('  ✅ Killer to /queue_killer, standard to /queue; refused = false; the rules match /queue');
}

// ── 9. The lobby and the game start pass the kind through ─────────────────
console.log('▶ 9. The lobby searches for the chosen kind, and the game starts with the room\'s cages');
{
  const read = (rel) => fs.readFileSync(rel, 'utf8');
  const lobby = read('src/components/BattleLobbyScreen.jsx');
  assert(/<VariantSwitch variant=\{variant\}/.test(lobby), 'the 1v1 lobby must offer the kind switch');
  assert(/onStartQuickMatch\(3, [\s\S]*?\}, variant\);/.test(lobby), 'the lobby must search for the chosen kind');
  const hook = read('src/hooks/useBattleMultiplayer.js');
  const start = hook.slice(hook.indexOf('const handleStartQuickMatch = '), hook.indexOf('const handleCancelQuickMatch = '));
  assert(/const handleStartQuickMatch = \(lvl, onComplete, kind = 'classic'\)/.test(hook) && /\},\s*kind\);\s*\};\s*$/.test(start.trim() + '\n'),
    'handleStartQuickMatch must take the kind and hand it to battleService.startQuickMatch, as its last argument');
  assert(/startNewGame\(lvl, 'battle', aiRoomGame\(room\)\)/.test(start), 'a matched game starts with the room\'s kind and cages');
  assert(/rematchStatus === 'accepted'[\s\S]{0,900}aiRoomGame\(room\)/.test(hook), 'a rematch starts with the room\'s kind and cages');
  const router = read('src/components/screens/AppScreenRouter.jsx');
  assert(/startNewGame\(room\.level, 'battle', aiRoomGame\(room\)\)/.test(router), 'the router\'s fallback search starts with the room\'s kind too');
  const replay = read('src/components/replay/ReplayScreen.jsx');
  assert(/cages=\{record\.cages \|\| null\}/.test(replay), 'the replay board draws the record\'s cages (gate 3-17 looks at them)');
  console.log('  ✅ Kind from the lobby to the search; room kind and cages into the game, the rematch and the replay');
}

ear.close();
mouth.close();
for (const p of players) { try { p.leaveRoom(); p.channel.close(); } catch { /* closed */ } }

console.log('\n======================================================');
console.log('🎉 [2-36] PASSED — killer meets killer, never an old app.');
console.log('======================================================');
process.exit(0);
