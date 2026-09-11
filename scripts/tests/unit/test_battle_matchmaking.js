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
storage.clear();
seen.length = 0;
const trio = [
  ['D', await newPlayer(11)],
  ['E', await newPlayer(12)],
  ['F', await newPlayer(13)],
];
await Promise.all(trio.map(([, p]) => p.startQuickMatch(3, () => {})));
await wait(700);

const nameById = new Map(trio.map(([n, p]) => [p.myPlayerId, n]));
const inRoom = trio.filter(([, p]) => p.currentRoom);

for (const [name, p] of inRoom) {
  const peerName = nameById.get(p.currentRoom.opponentId);
  assert(peerName, `${name} is in a room against an id belonging to no player in this test`);
  const peer = trio.find(([n]) => n === peerName)[1];
  assert(
    peer.currentRoom && peer.currentRoom.code === p.currentRoom.code,
    `${name} thinks it is playing ${peerName}, but ${peerName} is ` +
      `${peer.currentRoom ? `in room ${peer.currentRoom.code}` : 'in no room'} while ${name} is ` +
      `in ${p.currentRoom.code}. That is the phantom opponent: the match starts, the name shows, ` +
      `and the bar never moves. A host must claim both its own ticket and the peer's, atomically ` +
      `— see claimBothTickets in battleService and claimTicket in the transport contract.`,
  );
}
assert.strictEqual(inRoom.length, 2,
  `Exactly two of three must pair and the third stays queued. Got ${inRoom.length} in rooms ` +
  `(${inRoom.map(([n]) => n).join(',')}) — three means somebody is talking to nobody.`);
const oddOne = trio.find(([, p]) => !p.currentRoom);
assert(oddOne[1].searchingLevel,
  `${oddOne[0]} paired with nobody, so it must still be searching. If its ticket was consumed ` +
  `while it stopped searching, it waits forever and no one can find it.`);
console.log(`  ✅ ${inRoom.map(([n]) => n).join('+')} in one room, ${oddOne[0]} still searching`);

for (const [, p] of trio) {
  p.leaveRoom();
  p.channel.close();
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

console.log('\n======================================================');
console.log('🎉 Matchmaking gate passed — two players really do meet.');
console.log('======================================================');
