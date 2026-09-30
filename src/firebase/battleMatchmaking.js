/**
 * battleMatchmaking.js
 * Finding an opponent: the queue, the tickets, claiming one, and building the
 * room that comes out of it.
 *
 * Split out of battleService on 2026-09-23, when RT-2 and RT-3 pushed that file
 * over its code-line budget (gate 0-1). The seam was already there: everything
 * here happens BEFORE a match exists, and everything left in battleService
 * happens while one is being played. These take the service as their first
 * argument rather than living on it, so the file cannot quietly grow state of
 * its own; battleService keeps the public names.
 *
 * The comments that came with this code came with it — the ticket-claiming
 * reasoning in particular is the record of two real bugs (phantom opponents and
 * double rooms) and must not be summarised away.
 */

import { generatePuzzle } from '../engine/SudokuEngine.js';
import { isValidBoardPayload, isValidTicket } from './battleValidation.js';

/**
 * A room id short enough for the database to accept.
 *
 * It used to be `room_{peerId}_{myId}_{now}`. Player ids became the Firebase
 * anonymous uid (RT-2), which is 28 characters, so the id grew to about 76 —
 * past the 64-character limit the rules put on roomId, and every match_created
 * was refused with PERMISSION_DENIED. One player ended up in a room the other
 * never heard about: the host sat in the game, the other kept searching.
 *
 * Nothing reads the ids back out of it — who is in the room is carried in
 * player1 and player2, and the visible code is its last five characters — so it
 * only has to be unique. The clock in base 36 plus six random characters is,
 * and it is 24 characters long.
 */
function newRoomId() {
  return 'room_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * Host: open the match's own room before announcing it (RT-2). True only if the
 * server took it, so match_created says v2 only when the guest can actually join.
 * The announcement itself stays on /bus: a guest running 24 or older listens only
 * there, ignores the v2 flag, and the match runs over /bus as it always has.
 */
async function openMatchRoom(service, roomId, peerId) {
  if (typeof service.channel.openRoom !== 'function') return false;
  // Opening can take up to two seconds on a bad network. A player who cancelled in
  // that time must not be dropped into the match anyway.
  const epoch = service.searchEpoch;
  let ok = false;
  try {
    ok = Boolean(await service.channel.openRoom(roomId, peerId));
  } catch {
    ok = false;
  }
  if (service.searchEpoch !== epoch) {
    if (typeof service.channel.leaveRoom === 'function') service.channel.leaveRoom(roomId);
    return 'cancelled';
  }
  return ok;
}

/**
 * Async because a network transport answers listQueue over the wire. The local
 * transport resolves immediately, so both behave the same to callers — which
 * fire-and-forget and wait for the onMatched callback.
 */
export async function startQuickMatch(service, level = 3, onMatched, onUnavailable) {
  service.onMatchSuccess = onMatched;
  service.searchingLevel = level;

  // A search nobody can answer is not a search. Without a signed-in account the
  // rules refuse every read and write, so this used to run for twelve seconds and
  // end with "no opponent found" — a claim about other players when the truth was
  // that this phone never reached the server (BT-2). Say that instead, at once.
  if (typeof service.channel.canSearch === 'function' && !(await service.channel.canSearch())) {
    if (service.searchingLevel !== level) return;   // cancelled while we asked
    service.searchingLevel = null;
    if (onUnavailable) onUnavailable();
    return;
  }
  if (service.searchingLevel !== level) return;

  await service.adoptProvenIdentity();
  if (service.searchingLevel !== level) return;
  const queue = await service.channel.listQueue();
  // A ticket may have been claimed while we were waiting for that round trip.
  if (service.searchingLevel !== level) return;
  const candidate = queue.find(t => t.playerId !== service.myPlayerId && t.level === level && Date.now() - t.timestamp < 30000);

  /*
   * 큐에서 보이는 것과 가져가는 것은 다르다.
   *
   * 예전에는 `listQueue()` 로 보고 곧바로 `dequeue(peer)` 로 지운 뒤 방을
   * 만들었다. 두 검색자가 같은 티켓을 보면 둘 다 지우고 둘 다 방을 만든다.
   * 대기자는 먼저 온 match_created 하나만 받고 나머지를 버리므로 무사하지만,
   * 늦은 호스트는 오지 않는 상대와 마주 앉는다 — 이름은 뜨고 상대 진행률은
   * 0 에서 멈춘 유령 상대다. 원자적으로 가져가면 한 명만 호스트가 된다.
   *
   * 못 가져갔으면 대기자가 된다. 아래 else 로 떨어져 자기 티켓을 올리고,
   * 상대의 다음 티켓 방송에서 아이디 비교로 정상적으로 짝이 맺어진다.
   */
  const peer = candidate ? await service.channel.claimTicket(candidate.playerId) : null;
  if (service.searchingLevel !== level) return;

  if (peer) {
    const puzzle = generatePuzzle(level);
    const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
    const roomId = newRoomId();
    const payload = {
      roomId, level, puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount,
      player1: { id: peer.playerId, name: peer.playerName },
      player2: { id: service.myPlayerId, name: service.myPlayerName }
    };

    service.searchingLevel = null;
    const room = await openMatchRoom(service, roomId, peer.playerId);
    if (room === 'cancelled') return;
    if (room) payload.v2 = true;
    service.channel.send({ type: 'match_created', ...payload });
    service.setupRoom({
      code: roomId.slice(-5), roomId, level, puzzle: puzzle.puzzle, solution: puzzle.solution,
      initialEmptyCount, opponentId: peer.playerId, opponentName: peer.playerName
    });
    if (onMatched) onMatched(service.currentRoom);
  } else {
    const timestamp = Date.now();
    service.channel.enqueue({ playerId: service.myPlayerId, playerName: service.myPlayerName, level, timestamp });
    // The broadcast must carry the same fields the queue entry does: the
    // receiver runs it through isValidTicket, which rejects a ticket with no
    // timestamp. Omitting it here made every match_ticket unusable.
    service.channel.send({ type: 'match_ticket', playerId: service.myPlayerId, playerName: service.myPlayerName, level, timestamp });
  }
}

/**
 * 호스트가 되려면 티켓 두 장을 가져와야 한다 — 상대의 것과 내 것.
 *
 * ── 상대 것만 가져오면 왜 부족한가 ──────────────────────────────────
 * 셋이 동시에 검색하면 셋 다 빈 큐를 보고 셋 다 티켓을 올린다. A < B < C 에서
 * B 는 A 의 티켓을 가져와 호스트가 되고, 같은 순간 C 는 B 의 티켓을 가져온다.
 * C 의 선점은 부정하지 않다 — B 의 티켓이 그때까지 큐에 있었기 때문이다.
 * B 는 이미 방이 있어 C 의 match_created 를 버리고, C 만 유령과 남는다.
 *
 * 내 티켓은 "나는 아직 짝을 구한다" 는 공개된 약속이다. 호스트가 되는 순간
 * 그 약속을 원자적으로 거둬야 한다. 못 거뒀다면 누군가 이미 나를 데려간 것이고,
 * 그때는 호스트가 되지 않고 그 사람의 match_created 를 기다리는 것이 옳다.
 *
 * 순서가 중요하다. 내 것을 먼저 거둔다 — 남을 데려가기 전에 내가 더 이상
 * 후보가 아님을 확정해야, 두 사람이 서로를 데려가는 교차가 생기지 않는다.
 * 내 것을 거둔 뒤 상대 것을 놓치면 티켓을 다시 올려 검색을 계속한다.
 * 올리지 않으면 큐에서 사라진 채 아무도 나를 찾을 수 없다.
 */
export async function claimBothTickets(service, peerId) {
  const mine = await service.channel.claimTicket(service.myPlayerId);
  if (!mine) return false;                 // 누가 이미 나를 데려갔다

  const theirs = await service.channel.claimTicket(peerId);
  if (theirs) return true;

  // 상대를 놓쳤다. 내 티켓을 되돌려 놓고 계속 기다린다.
  if (service.searchingLevel && !service.currentRoom) {
    await service.channel.enqueue(mine);
    service.channel.send({ type: 'match_ticket', ...mine });
  }
  return false;
}

/**
 * Two players can press quick match close enough together that each sees an
 * empty queue, so both enqueue and both broadcast a ticket. Without a rule for
 * who hosts, both would build a room and then adopt the other's match_created,
 * ending up on different puzzles with mismatched room codes. Comparing ids
 * picks one host with no extra round trip: the smaller id stands down and
 * waits for match_created, which handleMatchCreated already knows how to take.
 */
export async function handleMatchTicket(service, data) {
  if (!service.searchingLevel || service.currentRoom) return;
  if (!isValidTicket(data, service.searchingLevel)) return;
  if (service.myPlayerId < data.playerId) return;

  /*
   * 아이디 비교는 "누가 호스트가 되는가" 만 정하고, "이 상대가 아직
   * 남아 있는가" 는 모른다. 검색자가 셋이면 그 차이가 드러난다.
   *
   * A < B < C 가 동시에 누르면 A 는 B·C 둘 다에게 양보한다. B 는 A 의
   * 티켓을 받아 A 를 상대로 정하고, C 도 A 의 티켓을 받아 A 를 상대로
   * 정한다. A 는 먼저 도착한 match_created 하나만 받아들이므로 무사하지만,
   * 늦은 쪽은 절대 응답하지 않는 상대와 마주 앉는다. 그래서 방을 만들기
   * 전에 상대 티켓을 원자적으로 가져가고, 못 가져가면 계속 검색한다.
   *
   * inFlight 는 동기적으로 세운다. 티켓 두 장이 잇달아 도착하면 두
   * 호출이 각각 다른 상대를 선점해 둘 다 성공할 수 있고, 그러면 방이
   * 두 개 생긴다 — 고치려는 버그를 비동기로 바꾸면서 새로 만드는 셈이다.
   * await 앞에 세우는 것이 요점이다.
   */
  if (service.claimInFlight) return;
  service.claimInFlight = true;
  let ok = false;
  try {
    ok = await claimBothTickets(service, data.playerId);
  } finally {
    service.claimInFlight = false;
  }
  // 기다리는 동안 대기를 그만뒀거나 다른 경로로 방이 생겼을 수 있다.
  if (!ok || !service.searchingLevel || service.currentRoom) return;

  service.searchingLevel = null;

  const puzzle = generatePuzzle(data.level);
  const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
  const roomId = newRoomId();
  const payload = {
    roomId, level: data.level, puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount,
    player1: { id: service.myPlayerId, name: service.myPlayerName },
    player2: { id: data.playerId, name: data.playerName }
  };

  const room = await openMatchRoom(service, roomId, data.playerId);
  if (room === 'cancelled') return;
  if (room) payload.v2 = true;
  service.channel.send({ type: 'match_created', ...payload });
  service.setupRoom({
    code: roomId.slice(-5), roomId, level: data.level, puzzle: puzzle.puzzle, solution: puzzle.solution,
    initialEmptyCount, opponentId: data.playerId, opponentName: data.playerName
  });
  if (service.onMatchSuccess) service.onMatchSuccess(service.currentRoom);
}

export function handleMatchCreated(service, data) {
  if (!service.searchingLevel) return;
  const isForMe = data.player1?.id === service.myPlayerId || data.player2?.id === service.myPlayerId;
  if (!isForMe) return;

  // Never adopt a board a peer sent without checking it is a real puzzle whose
  // givens agree with its solution.
  if (!isValidBoardPayload(data)) return;

  service.searchingLevel = null;
  service.channel.dequeue(service.myPlayerId);
  const opponent = data.player1.id === service.myPlayerId ? data.player2 : data.player1;

  service.setupRoom({
    code: data.roomId.slice(-5), roomId: data.roomId, level: data.level, puzzle: data.puzzle, solution: data.solution,
    initialEmptyCount: data.initialEmptyCount, opponentId: opponent.id, opponentName: opponent.name
  });
  // The host opened a room for this match; answer its handshake. Until that finishes
  // (or if it never does) everything keeps going over /bus — see transport/roomLink.js.
  if (data.v2 === true && typeof service.channel.joinRoom === 'function') {
    Promise.resolve(service.channel.joinRoom(data.roomId)).catch(() => {});
  }
  if (service.onMatchSuccess) service.onMatchSuccess(service.currentRoom);
}
