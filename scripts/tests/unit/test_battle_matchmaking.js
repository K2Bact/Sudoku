/**
 * test_battle_matchmaking.js
 *
 * Two players must actually meet. Gate 2-8 checks that a message is well-formed
 * once it arrives; nothing checked that matchmaking ever produces an arrival.
 *
 * It did not, in two ways, both found by running two real BattleService
 * instances against each other:
 *
 *   1. startQuickMatch broadcast `match_ticket` WITHOUT a timestamp, while
 *      isValidTicket rejects any ticket lacking one. Every ticket was sent,
 *      received, and silently dropped — the whole broadcast path was dead. The
 *      only matching that worked was the one-shot listQueue() poll, so the
 *      feature looked fine whenever one player happened to search second.
 *
 *   2. When both players searched close enough together to each see an empty
 *      queue, both broadcast a ticket and nothing decided who hosts. Both would
 *      build a room, then adopt the other's match_created, ending on different
 *      puzzles with room codes that no longer matched — after which every
 *      progress message failed isForRoom and each player saw a frozen opponent.
 *
 * This gate runs the real service over the real LocalTransport, so it fails if
 * either regression returns. It deliberately does not stub the matching logic:
 * a test asserting against its own reimplementation would have passed happily
 * through the entire period both bugs were live.
 */

import assert from 'assert';
import fs from 'fs';
import { isValidTicket } from '../../../src/firebase/battleValidation.js';

console.log('======================================================');
console.log('🤝 Testing 1v1 Matchmaking — do two players actually meet?');
console.log('======================================================\n');

// ── Minimal browser surface LocalTransport needs ───────────────────────────
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k)
};
globalThis.window = globalThis;
globalThis.window.addEventListener = () => {};
globalThis.window.removeEventListener = () => {};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const SERVICE = new URL('../../../src/firebase/battleService.js', import.meta.url).href;

/** Each distinct import URL is a separate module instance, i.e. a separate player. */
async function newPlayer(tag) {
  storage.delete('suidoku_player_id'); // otherwise both players adopt one id
  const mod = await import(`${SERVICE}?player=${tag}`);
  return mod.battleService;
}

// Watch the raw bus, so a dropped ticket is reported as itself rather than as a
// downstream matching failure.
const spy = new BroadcastChannel('suidoku_1v1_realtime');
const seen = [];
spy.onmessage = (e) => seen.push(e.data);

const A = await newPlayer(1);
const B = await newPlayer(2);
assert.notStrictEqual(A.myPlayerId, B.myPlayerId, 'The two players must have distinct ids');
assert.strictEqual(A.canMatchRealPlayers, false,
  'Without Firebase config the local transport must report isCrossDevice: false');

// ── 1. The broadcast ticket must satisfy the validator that consumes it ────
console.log('▶ 1. A broadcast match_ticket is accepted by isValidTicket');
storage.clear();
await A.startQuickMatch(3, () => {});
await wait(150);

const ticketMsg = seen.find((m) => m && m.type === 'match_ticket');
assert(ticketMsg, 'startQuickMatch must broadcast a match_ticket when the queue is empty');
assert(isValidTicket(ticketMsg, 3),
  'The broadcast ticket must pass isValidTicket — a ticket the receiver always ' +
  'rejects (e.g. one with no timestamp) makes the whole broadcast path dead code');
console.log('  ✅ The ticket a player sends is one the other player can act on');
A.leaveRoom();

// ── 2. Staggered search: the ordinary path ────────────────────────────────
console.log('▶ 2. Staggered search — one player waits, the other finds them');
storage.clear();
seen.length = 0;
let roomA = null;
let roomB = null;
await A.startQuickMatch(3, (r) => { roomA = r; });
await wait(120);
await B.startQuickMatch(3, (r) => { roomB = r; });
await wait(300);

assert(roomA && roomB, 'Both players must be matched');
assert.strictEqual(roomA.code, roomB.code, 'Both players must be in the same room');
assert.deepStrictEqual(roomA.puzzle, roomB.puzzle, 'Both players must get the same puzzle');
assert.deepStrictEqual(roomA.solution, roomB.solution, 'Both players must get the same solution');
assert.strictEqual(roomA.opponentId, B.myPlayerId, 'A must see B as the opponent');
assert.strictEqual(roomB.opponentId, A.myPlayerId, 'B must see A as the opponent');
console.log(`  ✅ Same room ${roomA.code}, same board, each sees the other`);
A.leaveRoom();
B.leaveRoom();

// ── 3. Simultaneous search: the race ──────────────────────────────────────
console.log('▶ 3. Simultaneous search — both see an empty queue');
storage.clear();
seen.length = 0;
roomA = null;
roomB = null;
let matchedA = 0;
let matchedB = 0;
await Promise.all([
  A.startQuickMatch(3, (r) => { roomA = r; matchedA++; }),
  B.startQuickMatch(3, (r) => { roomB = r; matchedB++; })
]);
await wait(400);

assert(roomA, 'A must be matched even when both searched at once — not left in the queue forever');
assert(roomB, 'B must be matched even when both searched at once');
assert.strictEqual(A.currentRoom.code, B.currentRoom.code,
  'Both must end in ONE room; two hosts means two boards and a permanently frozen opponent');
assert.deepStrictEqual(A.currentRoom.puzzle, B.currentRoom.puzzle,
  'Both must be solving the same puzzle');
assert.strictEqual(matchedA, 1, 'A must be handed exactly one room');
assert.strictEqual(matchedB, 1, 'B must be handed exactly one room');
console.log(`  ✅ One host elected, single room ${A.currentRoom.code}`);

// ── 4. Search state must not survive the match ────────────────────────────
console.log('▶ 4. A matched player is no longer searching');
assert(!A.searchingLevel && !B.searchingLevel,
  'searchingLevel must be cleared on match; a player still marked as searching ' +
  'will abandon the live room for the next stranger ticket that arrives');

const C = await newPlayer(3);
const codeBefore = A.currentRoom.code;
await C.startQuickMatch(3, () => {});
await wait(300);
assert.strictEqual(A.currentRoom.code, codeBefore,
  'A third player searching must not pull a matched player out of their room');
console.log('  ✅ A third player cannot hijack a match in progress');

// ── 5. Progress reaches the opponent ──────────────────────────────────────
console.log('▶ 5. Progress crosses the transport');
A.sendProgress({ 1: Math.round(A.currentRoom.initialEmptyCount / 2) }, 1);
await wait(200);
assert(B.currentRoom.opponentProgress > 0,
  'B must see A move; a room whose messages never land is a match in name only');
assert.strictEqual(B.currentRoom.opponentProgress, A.currentRoom.myProgress,
  'The opponent bar must show the value that was actually sent');
console.log(`  ✅ B sees A at ${B.currentRoom.opponentProgress}%`);

// ── 5b. Three searching at once: the id rule alone is not enough ──────────
//
// Comparing ids decides WHO hosts. It does not check whether either player is
// still free, and with three searchers that gap is the whole bug.
//
// All three see an empty queue, so all three enqueue and all three broadcast.
// With D < E < F: E takes D's ticket and hosts, and in the same moment F takes
// E's ticket — which is not F doing anything wrong, because E's ticket was
// still sitting in the queue. E already has a room so it drops F's
// match_created, and F is left holding a room against an opponent who will
// never answer: the name renders, the progress bar stays at zero.
//
// The assertion that matters is not "everyone got a room". Under the bug all
// three DO get a room; two of those rooms are simply lies. What has to hold is
// that no room points at an opponent who is in a different room, and that the
// player who paired with nobody is still searching rather than sitting with a
// consumed ticket that no one can find.
//
// Fixing it takes two claims, not one: a host must atomically take the peer's
// ticket AND its own. Its own ticket is the public promise that it is still
// available, and it has to withdraw that promise in the same breath.
console.log('▶ 5b. Three players search at once — nobody gets a phantom opponent');

// Nobody is in a room against somebody who is in a different one, exactly two
// paired, and the one left over is still searching.
function assertNoPhantom(trio, label) {
  const nameById = new Map(trio.map(([n, p]) => [p.myPlayerId, n]));
  const inRoom = trio.filter(([, p]) => p.currentRoom);
  for (const [name, p] of inRoom) {
    const peerName = nameById.get(p.currentRoom.opponentId);
    assert(peerName, `${label}: ${name} is in a room against an id belonging to no player in this test`);
    const peer = trio.find(([n]) => n === peerName)[1];
    assert(
      peer.currentRoom && peer.currentRoom.code === p.currentRoom.code,
      `${label}: ${name} thinks it is playing ${peerName}, but ${peerName} is ` +
        `${peer.currentRoom ? `in room ${peer.currentRoom.code}` : 'in no room'} while ${name} is ` +
        `in ${p.currentRoom.code}. That is the phantom opponent: the match starts, the name shows, ` +
        `and the bar never moves. A host must claim both its own ticket and the peer's, atomically ` +
        `— see claimBothTickets in battleService and claimTicket in the transport contract.`,
    );
  }
  assert.strictEqual(inRoom.length, 2,
    `${label}: exactly two of three must pair and the third stays queued. Got ${inRoom.length} in rooms ` +
    `(${inRoom.map(([n]) => n).join(',')}) — three means somebody is talking to nobody.`);
  const oddOne = trio.find(([, p]) => !p.currentRoom);
  assert(oddOne[1].searchingLevel,
    `${label}: ${oddOne[0]} paired with nobody, so it must still be searching. If its ticket was consumed ` +
    `while it stopped searching, it waits forever and no one can find it.`);
  return `${inRoom.map(([n]) => n).join('+')} in one room, ${oddOne[0]} still searching`;
}
const until = async (ok, ms, what) => {
  const end = Date.now() + ms;
  while (!ok()) {
    if (Date.now() > end) throw new Error(`timed out waiting for ${what}`);
    await wait(10);
  }
};

// i. The order the bug needs, forced (2026-09-30, BACKLOG "2-9 변형이 가끔만 잡습니다").
//
// This section used to start all three with Promise.all and look 700ms later. The
// phantom only appears if F reads the queue after E has become host — and with three
// broadcasts in flight, F sometimes took D's ticket first, and then there was nothing
// to catch: the half-fix mutation below survived one audit in six.
//
// So the order is made, not hoped for. D and E start together — both list an empty
// queue before either enqueues, because every step to that point is an await on an
// in-memory call, so the two interleave the same way every run — and pair off. Only
// once both are in their room does F start. A host that left its own ticket in the
// queue has left it for F to find, every time; a host that withdrew it has not.
{
  storage.clear();
  seen.length = 0;
  const trio = [['D', await newPlayer(11)], ['E', await newPlayer(12)], ['F', await newPlayer(13)]];
  const [[, D], [, E], [, F]] = trio;
  await Promise.all([D.startQuickMatch(3, () => {}), E.startQuickMatch(3, () => {})]);
  await until(() => D.currentRoom && E.currentRoom, 3000, 'D and E to pair');
  await F.startQuickMatch(3, () => {});
  await wait(200);
  console.log(`  ✅ i. forced order: ${assertNoPhantom(trio, 'forced order')}`);
  for (const [, p] of trio) { p.leaveRoom(); p.channel.close(); }
}

// ii. All three at once, as before. The interleaving varies from run to run, so this
// cannot be what catches the half-fix — (i) is. It stays because a different race
// could hide in an order (i) never makes.
{
  storage.clear();
  seen.length = 0;
  // Tags must be unused elsewhere in this file: a tag is a module instance, and 5c's G/H are 21/22.
  const trio = [['D', await newPlayer(31)], ['E', await newPlayer(32)], ['F', await newPlayer(33)]];
  await Promise.all(trio.map(([, p]) => p.startQuickMatch(3, () => {})));
  await wait(700);
  console.log(`  ✅ ii. all at once: ${assertNoPhantom(trio, 'all at once')}`);
  for (const [, p] of trio) { p.leaveRoom(); p.channel.close(); }
}

// ── 5c. Both players finish at once: exactly one of them won ───────────────
//
// handlePlayerProgress used to overwrite the winner whenever the opponent
// reported 100%, with no check on whether the match had already been decided.
// Each device records its own completion first and then receives the other's,
// so both flipped to winner: 'opponent' — a match where BOTH players are shown
// the defeat screen and nobody won.
//
// "Keep whichever was recorded first" is not a fix either: each device sees its
// own completion first, so both would show victory instead. The same
// contradiction, pointing the other way. What is needed is a rule that leads
// two devices to the same answer, which is why the completion message carries
// the solver's own elapsed time — two durations compare cleanly without the
// two clocks agreeing — with the player id as the tiebreak of last resort.
//
// The assertion is symmetry: the two devices must name the same winner. A
// harness that only looked at one side would have passed the broken build.
console.log('▶ 5c. Simultaneous completion — exactly one winner, and both agree');
storage.clear();
seen.length = 0;
const G = await newPlayer(21);
const H = await newPlayer(22);
await G.startQuickMatch(3, () => {});
await wait(120);
await H.startQuickMatch(3, () => {});
await wait(300);
assert(G.currentRoom && H.currentRoom && G.currentRoom.code === H.currentRoom.code,
  'setup: G and H must be in one room before the finish is tested');

// Both report a finished board in the same tick, before either message lands.
G.sendProgress({}, 0);
H.sendProgress({}, 0);
await wait(400);

const gWon = G.currentRoom.winner === 'me';
const hWon = H.currentRoom.winner === 'me';
assert(G.currentRoom.winner && H.currentRoom.winner,
  'both devices must have decided a winner after both boards were completed');
assert(
  gWon !== hWon,
  `The two devices disagree: G says winner=${G.currentRoom.winner} (${G.currentRoom.winnerReason}) ` +
    `and H says winner=${H.currentRoom.winner} (${H.currentRoom.winnerReason}). ` +
    `${!gWon && !hWon ? 'Both players are looking at a defeat screen for a match somebody won. ' : ''}` +
    `${gWon && hWon ? 'Both players are being told they won the same match. ' : ''}` +
    `A simultaneous finish has to be resolved by a rule both sides compute identically ` +
    `— see the elapsed-time tiebreak in handlePlayerProgress.`,
);
console.log(`  ✅ ${gWon ? 'G' : 'H'} won, ${gWon ? 'H' : 'G'} lost — one result, agreed on both devices`);

G.leaveRoom();
H.leaveRoom();
G.channel.close();
H.channel.close();

A.leaveRoom();
B.leaveRoom();
C.leaveRoom();
A.channel.close();
B.channel.close();
C.channel.close();
spy.close();

// ── 6. Leaving a battle must speak the player's language ──────────────────
console.log('▶ 6. Battle exits do not use the native confirm');
const DIALOG_OWNERS = ['src/components/BattleHeader.jsx', 'src/hooks/useBackStack.js'];
for (const rel of DIALOG_OWNERS) {
  const src = fs.readFileSync(rel, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  assert(!/window\.confirm\s*\(/.test(src),
    `${rel} calls window.confirm. Capacitor draws that as a native dialog whose ` +
    'buttons are the literal strings "OK" and "Cancel", hardcoded in ' +
    'BridgeWebChromeClient.java where no app-side locale setting reaches them — ' +
    'so all thirteen languages got a translated question under two English ' +
    'buttons. Confirm through the in-app ConfirmProvider modal instead.');
  assert(/useConfirm|confirmRef/.test(src),
    `${rel} should take confirm() from ConfirmProvider`);
}
console.log('  ✅ Battle exits confirm through the in-app, localised modal');

// ── 7. A search that cannot reach the server says so (BT-2) ────────────────
//
// The published rules refuse every read and write without a signed-in account.
// When anonymous sign-in failed, the search still ran: the queue read came back
// empty, the ticket was refused, and after twelve seconds the lobby said no
// opponent had been found — a claim about other players, when this phone had
// never reached the server. And the database handle is cached for the session,
// so one failed sign-in locked 1v1 out until the app restarted.
console.log('▶ 7. No signed-in account: "could not connect", at once, and a retry that can succeed');
{
  // (a) The matchmaking path asks first and puts nothing on the wire when refused.
  const svc = await newPlayer('offline');
  const ch = svc.channel;
  const orig = { listQueue: ch.listQueue, enqueue: ch.enqueue, send: ch.send, canSearch: ch.canSearch };
  const wire = [];
  ch.listQueue = async () => { wire.push('listQueue'); return []; };
  ch.enqueue = () => { wire.push('enqueue'); };
  ch.send = (m) => { wire.push(`send:${m?.type}`); };
  ch.canSearch = async () => false;
  let unavailable = 0;
  let matched = 0;
  await svc.startQuickMatch(3, () => matched++, () => unavailable++);
  assert.strictEqual(unavailable, 1, 'a search the server will refuse must report that it could not connect (BT-2)');
  assert.strictEqual(matched, 0, 'and must not report a match');
  assert.deepStrictEqual(wire, [], `nothing may go on the wire without an account — saw: ${wire.join(', ')}`);
  assert.strictEqual(svc.searchingLevel, null, 'and the player is no longer searching');
  Object.assign(ch, orig);

  // (b) Cancelled while the answer was on its way: no late "could not connect".
  let answer;
  ch.canSearch = () => new Promise((r) => { answer = r; });
  const pending = svc.startQuickMatch(3, () => matched++, () => unavailable++);
  svc.leaveRoom();
  answer(false);
  await pending;
  assert.strictEqual(unavailable, 1, 'a search the player already cancelled must not come back as "could not connect"');
  Object.assign(ch, orig);
  ch.close();

  // (c) The Firebase transport tries sign-in again, and listens only once signed in.
  const { FirebaseTransport } = await import('../../../src/firebase/transport/firebaseTransport.js');
  const listeners = [];
  let signInCalls = 0;
  let nextUid = null;
  const api = {
    db: {}, uid: null,
    ref: (_db, path) => path,
    onChildAdded: (ref) => { listeners.push(ref); return () => {}; },
    signIn: async () => { signInCalls++; return nextUid; },
  };
  const tr = new FirebaseTransport('local_abc', () => {});
  tr.api = api;
  tr.ready = Promise.resolve(api);
  assert.strictEqual(await tr.canSearch(), false, 'no account, no search');
  assert.strictEqual(signInCalls, 1, 'sign-in is tried again before giving up — a rate limit or a dropped network passes');
  assert.strictEqual(listeners.length, 0, 'no /bus listener without an account: the server cancels it, and a cancelled listener never resumes');
  nextUid = 'uid_after_retry';
  assert.strictEqual(await tr.canSearch(), true, 'a later retry that signs in lets the search go out');
  assert.strictEqual(await tr.whoAmI(), 'uid_after_retry', 'and the transport signs as that account from then on');
  assert.deepStrictEqual(listeners, ['bus'], 'the /bus listener attaches once the account exists');
  await tr.canSearch();
  assert.strictEqual(listeners.length, 1, 'and only once');
  assert.strictEqual(signInCalls, 2, 'a signed-in transport does not sign in again');

  // (d) The pieces that are not reachable from node, held by their structure.
  const read = (rel) => fs.readFileSync(rel, 'utf8');
  const transport = read('src/firebase/transport/firebaseTransport.js');
  const initBody = transport.slice(transport.indexOf('async init()'), transport.indexOf('listen(api) {'));
  assert(/if \(api\.uid\) \{[^}]*this\.listen\(api\)/.test(initBody),
    'init must attach the /bus listener only once signed in');
  const hook = read('src/hooks/useBattleMultiplayer.js');
  const start = hook.slice(hook.indexOf('const handleStartQuickMatch = '), hook.indexOf('const handleCancelQuickMatch = '));
  assert(/startQuickMatch\([\s\S]*\},\s*\(\)\s*=>\s*\{[\s\S]*setMatchUnavailable\(true\)/.test(start),
    'the lobby search must pass a could-not-connect handler that sets matchUnavailable (BT-2)');
  const lobby = read('src/components/BattleLobbyScreen.jsx');
  assert(/matchUnavailable \? t\('battleLobby\.connectFailed'\)/.test(lobby),
    'the lobby must say it could not connect when that is what happened, not that nobody was found');
}
console.log('  ✅ No account: told at once, nothing sent; sign-in retried; /bus heard only once signed in');

// ── 8. A match's own channel, and every way it can fail to exist (RT-2) ─────
//
// In-match traffic moves off the shared /bus into /rooms/{roomId}, which only the
// two players can read — but only after a three-step handshake has shown it works
// both ways (transport/roomLink.js). Each case below is one thing the real world
// can hand a match: both players current, the rules not yet published, a player
// on 24 or older on either side, and a rule that lets a player write but not read.
// In every one of them progress must reach the opponent. In the first, it must
// also stop appearing on /bus.
console.log('▶ 8. The match room: private when both ends prove it, /bus whenever they cannot');
{
  const { localRoomRules } = await import('../../../src/firebase/transport/localTransport.js');
  // Its own ear on /bus. The spy at the top of this file is closed after section 6, and
  // the first version of this section asserted "nothing on /bus" through it: a closed
  // listener hears nothing, so the check passed without having listened.
  const busSeen = [];
  const busSpy = new BroadcastChannel('suidoku_1v1_realtime');
  busSpy.onmessage = (e) => busSeen.push(e.data);
  const OLD = ['openRoom', 'joinRoom', 'sendRoom', 'leaveRoom'];
  const makeOld = (p) => { for (const k of OLD) p.channel[k] = undefined; };
  const restore = (p) => { for (const k of OLD) delete p.channel[k]; };
  let tag = 40;

  async function match(label, { oldFirst = false, oldSecond = false } = {}) {
    storage.clear();
    const first = await newPlayer(++tag);
    const second = await newPlayer(++tag);
    if (oldFirst) makeOld(first);
    if (oldSecond) makeOld(second);
    await first.startQuickMatch(3, () => {});
    await wait(120);
    await second.startQuickMatch(3, () => {});
    await until(() => first.currentRoom && second.currentRoom, 3000, `${label}: both players in a room`);
    await wait(300);   // room to finish a handshake, if there is going to be one
    return [first, second];
  }
  async function progressArrives(from, to, label) {
    busSeen.length = 0;
    const before = to.currentRoom.opponentProgress;
    from.sendProgress({ 1: 1 }, 0);
    await until(() => to.currentRoom.opponentProgress !== before, 2000, `${label}: progress to arrive`);
    // The /bus spy is another listener and can hear it a moment after the player does.
    // Look too early and a message that did go out on /bus reads as one that did not.
    await wait(150);
    return busSeen.some((m) => m && m.type === 'player_progress');
  }
  const done = (...ps) => { for (const p of ps) { p.leaveRoom(); restore(p); p.channel.close(); } };
  const linked = (p) => Boolean(p.channel.room && p.channel.room.ready);

  // a. Both current, rules published: the handshake completes and /bus goes quiet.
  {
    const [a, b] = await match('both current');
    await until(() => linked(a) && linked(b), 2000, 'both ends of the room to be proved');
    assert(!(await progressArrives(a, b, 'room')), 'progress went out on /bus although both ends had proved the room — everyone listening still sees it');
    assert(!(await progressArrives(b, a, 'room back')), 'and the other way too');
    // leaving still reaches the opponent, and the goodbye leaves the room behind it
    let left = false;
    const off = b.subscribeOpponentLeft(() => { left = true; });
    const roomId = a.currentRoom.roomId;
    a.leaveRoom();
    await until(() => left, 2000, 'player_left to arrive over the room');
    off();
    b.leaveRoom();
    await until(() => !storage.has(`suidoku_pvp_room_members:${roomId}`), 2000, 'both memberships to be released');
    done(a, b);
    console.log('  ✅ a. both current: handshake done, progress only in the room, goodbye delivered, room released');
  }

  // b. The rules allowing /rooms are not published yet: nothing changes.
  {
    localRoomRules.roomsAllowed = false;
    const [a, b] = await match('rules not published');
    assert(!linked(a) && !linked(b), 'no room can be proved when the server refuses it');
    assert(await progressArrives(a, b, 'bus'), 'so progress must travel on /bus');
    localRoomRules.roomsAllowed = true;
    done(a, b);
    console.log('  ✅ b. rules not published: /bus, exactly as before');
  }

  // c. A player on 24 or older, as guest and as host.
  for (const [label, opts] of [['old guest', { oldFirst: true }], ['old host', { oldSecond: true }]]) {
    const [a, b] = await match(label, opts);
    assert(!linked(a) && !linked(b), `${label}: an old client cannot finish a handshake, so neither end may switch`);
    assert(await progressArrives(a, b, `${label} a→b`), `${label}: progress a→b over /bus`);
    assert(await progressArrives(b, a, `${label} b→a`), `${label}: progress b→a over /bus`);
    done(a, b);
  }
  console.log('  ✅ c. a player on 24 or older, either side: /bus both ways');

  // d. A rule that lets the guest write but not read. Its hello reaches the host; the
  //    host's ack never reaches it. A host that switched on hello would now be talking
  //    into a room the guest cannot hear.
  {
    storage.clear();
    const guest = await newPlayer(++tag);
    const host = await newPlayer(++tag);
    localRoomRules.unreadableFor.add(guest.myPlayerId);
    await guest.startQuickMatch(3, () => {});
    await wait(120);
    await host.startQuickMatch(3, () => {});
    await until(() => guest.currentRoom && host.currentRoom, 3000, 'unreadable: both in a room');
    await wait(400);
    assert(!linked(host), 'the host switched to the room although the guest never confirmed it could read it');
    assert(!linked(guest), 'the guest cannot read the room, so it must not switch');
    await progressArrives(host, guest, 'unreadable host→guest');
    localRoomRules.unreadableFor.clear();
    done(guest, host);
    console.log('  ✅ d. a guest that cannot read the room: nobody switches, progress still arrives');
  }
  busSpy.close();
}

console.log('\n======================================================');
console.log('🎉 Matchmaking gate passed — two players really do meet.');
console.log('======================================================');
