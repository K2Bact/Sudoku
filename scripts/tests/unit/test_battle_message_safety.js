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
import { generatePuzzle } from '../../../src/engine/SudokuEngine.js';
import {
  isValidBoardPayload,
  isValidProgress,
  isForRoom,
  isFromOpponent,
  isValidTicket
} from '../../../src/firebase/battleValidation.js';
import { createTransport } from '../../../src/firebase/transport/index.js';

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

console.log('\n🎉 [PASS] Battle Message Validation & Transport Contract Verified!\n');
