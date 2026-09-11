/**
 * battleService.js
 * 1v1 Real-Time Multiplayer Matchmaking & Game State Synchronization Engine.
 * 100% Real Players Only (Bot simulations completely removed).
 */

import { generatePuzzle } from '../engine/SudokuEngine.js';
import { aiBotService } from '../engine/aiBotService.js';
import { createAIRoom, runAIBattle } from './aiBattleSession.js';
import { createTransport } from './transport/index.js';
import {
  isValidBoardPayload, isValidProgress, isForRoom, isFromOpponent, isValidTicket
} from './battleValidation.js';

class BattleService {
  constructor() {
    this.currentRoom = null;
    this.listeners = [];
    this.rematchListeners = [];
    this.opponentLeftListeners = [];
    // 티켓 선점이 진행 중인지. 티켓 두 장이 잇달아 도착할 때 방이 두 개
    // 생기는 것을 막는다 — handleMatchTicket 의 주석 참고.
    this.claimInFlight = false;
    this.myPlayerId = this.initPlayerId();
    this.myPlayerName = this.initPlayerName();
    this.channel = createTransport(this.myPlayerId, data => this.handleMessage(data));
  }

  initPlayerId() {
    let id = typeof localStorage !== 'undefined' ? localStorage.getItem('suidoku_player_id') : null;
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('suidoku_player_id', id);
      }
    }
    return id;
  }

  /**
   * Whether a real opponent on another device can be reached at all. The local
   * transport answers false, and the UI must not offer a live 1v1 search that
   * cannot possibly resolve. See transport/index.js.
   */
  get canMatchRealPlayers() {
    return Boolean(this.channel && this.channel.isCrossDevice);
  }

  initPlayerName() {
    return `SudokuMaster_${this.myPlayerId.slice(-4)}`;
  }

  /**
   * Everything arriving here is untrusted. In-match messages must name this room
   * AND come from this room's opponent before they are allowed to change state.
   */
  handleMessage(data) {
    if (!data || typeof data.type !== 'string') return;

    // handleMatchTicket 은 티켓을 원자적으로 선점하려고 await 한다. 여기서
    // 프로미스를 그냥 흘리면 예외가 처리되지 않은 거부가 되고, 리스너
    // 콜백이라 아무도 잡아주지 않는다. 검색 실패는 대기 상태로 남는 것이
    // 옳은 결과이므로 삼키지 않고 기록만 한다.
    if (data.type === 'match_ticket') {
      this.handleMatchTicket(data).catch((e) => {
        console.warn('[battleService] match_ticket handling failed:', e?.message || e);
      });
      return;
    }
    if (data.type === 'match_created') return this.handleMatchCreated(data);

    const room = this.currentRoom;
    if (!isForRoom(data, room) || !isFromOpponent(data, room)) return;

    if (data.type === 'player_progress') this.handlePlayerProgress(data);
    else if (data.type === 'rematch_request') this.rematchListeners.forEach(cb => cb(data));
    else if (data.type === 'rematch_accepted') this.resetForNewMatch(data);
    else if (data.type === 'rematch_declined') {
      room.rematchStatus = 'declined';
      room.rematchSeq = (room.rematchSeq || 0) + 1;
      this.notifyListeners();
    } else if (data.type === 'player_left') {
      this.opponentLeftListeners.forEach(cb => cb());
    }
  }

  /**
   * Async because a network transport answers listQueue over the wire. The local
   * transport resolves immediately, so both behave the same to callers — which
   * fire-and-forget and wait for the onMatched callback.
   */
  async startQuickMatch(level = 3, onMatched) {
    this.onMatchSuccess = onMatched;
    this.searchingLevel = level;

    const queue = await this.channel.listQueue();
    // A ticket may have been claimed while we were waiting for that round trip.
    if (this.searchingLevel !== level) return;
    const candidate = queue.find(t => t.playerId !== this.myPlayerId && t.level === level && Date.now() - t.timestamp < 30000);

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
    const peer = candidate ? await this.channel.claimTicket(candidate.playerId) : null;
    if (this.searchingLevel !== level) return;

    if (peer) {
      const puzzle = generatePuzzle(level);
      const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
      const roomId = `room_${peer.playerId}_${this.myPlayerId}_${Date.now()}`;
      const payload = {
        roomId, level, puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount,
        player1: { id: peer.playerId, name: peer.playerName },
        player2: { id: this.myPlayerId, name: this.myPlayerName }
      };

      this.searchingLevel = null;
      this.channel.send({ type: 'match_created', ...payload });
      this.setupRoom({
        code: roomId.slice(-5), level, puzzle: puzzle.puzzle, solution: puzzle.solution,
        initialEmptyCount, opponentId: peer.playerId, opponentName: peer.playerName
      });
      if (onMatched) onMatched(this.currentRoom);
    } else {
      const timestamp = Date.now();
      this.channel.enqueue({ playerId: this.myPlayerId, playerName: this.myPlayerName, level, timestamp });
      // The broadcast must carry the same fields the queue entry does: the
      // receiver runs it through isValidTicket, which rejects a ticket with no
      // timestamp. Omitting it here made every match_ticket unusable.
      this.channel.send({ type: 'match_ticket', playerId: this.myPlayerId, playerName: this.myPlayerName, level, timestamp });
    }
  }

  /**
   * Two players can press quick match close enough together that each sees an
   * empty queue, so both enqueue and both broadcast a ticket. Without a rule for
   * who hosts, both would build a room and then adopt the other's match_created,
   * ending up on different puzzles with mismatched room codes. Comparing ids
   * picks one host with no extra round trip: the smaller id stands down and
   * waits for match_created, which handleMatchCreated already knows how to take.
   */
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
  async claimBothTickets(peerId) {
    const mine = await this.channel.claimTicket(this.myPlayerId);
    if (!mine) return false;                 // 누가 이미 나를 데려갔다

    const theirs = await this.channel.claimTicket(peerId);
    if (theirs) return true;

    // 상대를 놓쳤다. 내 티켓을 되돌려 놓고 계속 기다린다.
    if (this.searchingLevel && !this.currentRoom) {
      await this.channel.enqueue(mine);
      this.channel.send({ type: 'match_ticket', ...mine });
    }
    return false;
  }

  async handleMatchTicket(data) {
    if (!this.searchingLevel || this.currentRoom) return;
    if (!isValidTicket(data, this.searchingLevel)) return;
    if (this.myPlayerId < data.playerId) return;

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
    if (this.claimInFlight) return;
    this.claimInFlight = true;
    let ok = false;
    try {
      ok = await this.claimBothTickets(data.playerId);
    } finally {
      this.claimInFlight = false;
    }
    // 기다리는 동안 대기를 그만뒀거나 다른 경로로 방이 생겼을 수 있다.
    if (!ok || !this.searchingLevel || this.currentRoom) return;

    this.searchingLevel = null;

    const puzzle = generatePuzzle(data.level);
    const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
    const roomId = `room_${this.myPlayerId}_${data.playerId}_${Date.now()}`;
    const payload = {
      roomId, level: data.level, puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount,
      player1: { id: this.myPlayerId, name: this.myPlayerName },
      player2: { id: data.playerId, name: data.playerName }
    };

    this.channel.send({ type: 'match_created', ...payload });
    this.setupRoom({
      code: roomId.slice(-5), level: data.level, puzzle: puzzle.puzzle, solution: puzzle.solution,
      initialEmptyCount, opponentId: data.playerId, opponentName: data.playerName
    });
    if (this.onMatchSuccess) this.onMatchSuccess(this.currentRoom);
  }

  handleMatchCreated(data) {
    if (!this.searchingLevel) return;
    const isForMe = data.player1?.id === this.myPlayerId || data.player2?.id === this.myPlayerId;
    if (!isForMe) return;

    // Never adopt a board a peer sent without checking it is a real puzzle whose
    // givens agree with its solution.
    if (!isValidBoardPayload(data)) return;

    this.searchingLevel = null;
    this.channel.dequeue(this.myPlayerId);
    const opponent = data.player1.id === this.myPlayerId ? data.player2 : data.player1;

    this.setupRoom({
      code: data.roomId.slice(-5), level: data.level, puzzle: data.puzzle, solution: data.solution,
      initialEmptyCount: data.initialEmptyCount, opponentId: opponent.id, opponentName: opponent.name
    });
    if (this.onMatchSuccess) this.onMatchSuccess(this.currentRoom);
  }

  setupRoom(cfg) {
    this.currentRoom = {
      code: cfg.code, level: cfg.level, puzzle: cfg.puzzle, solution: cfg.solution,
      initialEmptyCount: cfg.initialEmptyCount, status: 'playing', myProgress: 0, myMistakes: 0,
      opponentProgress: 0, opponentMistakes: 0, opponentId: cfg.opponentId, opponentName: cfg.opponentName,
      winner: null, rematchStatus: 'idle',
      // 동시 완성 결승에 쓴다. 두 기기의 방은 match_created 왕복 시간 안에서
      // 시작하므로, 각자 잰 경과 시간은 누가 실제로 빨리 풀었는지를 뜻한다.
      // 벽시계를 맞출 필요가 없다 — 비교하는 것은 두 소요 시간이지 두 시각이 아니다.
      startedAt: Date.now(), myElapsedMs: null, opponentElapsedMs: null
    };
    this.notifyListeners();
  }

  sendProgress(remainingCounts, mistakes) {
    if (!this.currentRoom || this.currentRoom.status !== 'playing') return;
    // Share of initially-empty cells now filled — same scale BattleHeader uses locally.
    const remainingEmpty = Object.values(remainingCounts || {}).reduce((acc, c) => acc + c, 0);
    const totalEmpty = this.currentRoom.initialEmptyCount || 0;
    const filledRatio = totalEmpty > 0 ? (totalEmpty - remainingEmpty) / totalEmpty : (remainingEmpty === 0 ? 1 : 0);
    const progressPct = Math.min(100, Math.max(0, Math.round(filledRatio * 100)));

    this.currentRoom.myProgress = progressPct;
    this.currentRoom.myMistakes = mistakes;

    if (progressPct >= 100) {
      this.currentRoom.status = 'finished';
      this.currentRoom.winner = 'me';
      this.currentRoom.winnerReason = 'my_completion';
      this.currentRoom.myElapsedMs = Date.now() - (this.currentRoom.startedAt || Date.now());
      if (this.currentRoom.isAiMatch) aiBotService.stopMatch();
    } else if (mistakes >= 3) {
      this.currentRoom.status = 'finished';
      this.currentRoom.winner = 'opponent';
      this.currentRoom.winnerReason = 'my_mistakes';
      if (this.currentRoom.isAiMatch) aiBotService.stopMatch();
    }

    this.channel.send({
      type: 'player_progress', roomId: this.currentRoom.code, progressPct, mistakes,
      status: this.currentRoom.status, winner: this.currentRoom.winner,
      elapsedMs: this.currentRoom.myElapsedMs
    });
    this.notifyListeners();
  }

  handlePlayerProgress(data) {
    // Range-check before trusting: a peer must not be able to report 900% or -5.
    if (!this.currentRoom || !isValidProgress(data)) return;
    const room = this.currentRoom;
    room.opponentProgress = data.progressPct;
    room.opponentMistakes = data.mistakes;

    /*
     * 이미 끝난 경기의 결과를 상대 메시지로 덮어쓰지 않는다.
     *
     * 예전에는 조건 없이 덮어썼다. 그래서 둘이 거의 동시에 퍼즐을 끝내면
     * 각자 자기 완성을 먼저 기록하고 나서 상대의 100% 를 받아 winner 를
     * 'opponent' 로 바꿨다. 양쪽 기기가 같은 일을 하므로 결과는
     * **둘 다 패배 화면**이다. 이긴 사람이 없는 경기가 된다.
     *
     * 단순히 "먼저 기록한 것을 지킨다" 로 끝낼 수도 없다. 그러면 양쪽이
     * 각자 자기 완성을 먼저 보므로 둘 다 승리 화면을 본다 — 방향만 반대인
     * 같은 모순이다. 두 기기가 같은 답에 이르는 규칙이 필요하다.
     *
     * 그 규칙은 소요 시간이다. 두 방은 match_created 왕복 시간 안에서
     * 시작하므로 각자 잰 경과 시간은 비교할 수 있고, 실제로 누가 빨리
     * 풀었는지를 뜻한다. 벽시계를 맞출 필요가 없다 — 비교 대상이 두 시각이
     * 아니라 두 소요 시간이기 때문이다. 값이 같거나 없으면 아이디로
     * 가른다. 임의적이지만 양쪽이 반드시 같은 답을 낸다는 점이 중요하고,
     * 그것이 "둘 다 졌다" 보다 낫다.
     */
    if (data.progressPct >= 100) {
      if (room.winnerReason === 'my_completion') {
        room.opponentElapsedMs = Number.isFinite(data.elapsedMs) ? data.elapsedMs : null;
        const mine = room.myElapsedMs;
        const theirs = room.opponentElapsedMs;
        const opponentWasFaster =
          Number.isFinite(mine) && Number.isFinite(theirs) && theirs !== mine
            ? theirs < mine
            : this.myPlayerId > room.opponentId;
        if (opponentWasFaster) {
          room.winner = 'opponent';
          room.winnerReason = 'opponent_completion_tiebreak';
        } else {
          room.winnerReason = 'my_completion_tiebreak';
        }
      } else if (room.status !== 'finished') {
        room.status = 'finished';
        room.winner = 'opponent';
        room.winnerReason = 'opponent_completion';
        room.opponentElapsedMs = Number.isFinite(data.elapsedMs) ? data.elapsedMs : null;
        if (room.isAiMatch) aiBotService.stopMatch();
      }
    } else if (data.mistakes >= 3 && room.status !== 'finished') {
      room.status = 'finished';
      room.winner = 'me';
      room.winnerReason = 'opponent_mistakes';
      if (room.isAiMatch) aiBotService.stopMatch();
    }
    this.notifyListeners();
  }

  requestRematch() {
    if (!this.currentRoom) return;
    this.currentRoom.rematchStatus = 'waiting';
    this.channel.send({
      type: 'rematch_request', roomId: this.currentRoom.code,
      requesterId: this.myPlayerId, requesterName: this.myPlayerName
    });
    this.notifyListeners();
  }

  acceptRematch() {
    if (!this.currentRoom) return;
    const newPuzzle = generatePuzzle(this.currentRoom.level || 3);
    const payload = {
      level: this.currentRoom.level || 3, puzzle: newPuzzle.puzzle, solution: newPuzzle.solution,
      initialEmptyCount: newPuzzle.puzzle.flat().filter(v => v === 0).length
    };
    this.channel.send({ type: 'rematch_accepted', roomId: this.currentRoom.code, ...payload });
    this.resetForNewMatch(payload);
  }

  /**
   * rematchStatus is read by the UI as an event, but it lives on the room as a
   * value that stays put. Two rematches in a row therefore look identical to a
   * listener, so each transition carries a sequence number: 'accepted' twice is
   * two distinct events, and a listener keyed on status+seq acts on each once.
   * Without it the second rematch never restarts the board for the accepting
   * player. winnerReason is cleared too — a stale 'my_mistakes' outliving the
   * match it described is how a fresh board ends up explaining an old defeat.
   */
  resetForNewMatch(data) {
    if (!this.currentRoom || !isValidBoardPayload(data)) return;
    Object.assign(this.currentRoom, {
      puzzle: data.puzzle, solution: data.solution, initialEmptyCount: data.initialEmptyCount,
      status: 'playing', myProgress: 0, myMistakes: 0, opponentProgress: 0, opponentMistakes: 0,
      winner: null, winnerReason: null,
      rematchStatus: 'accepted', rematchSeq: (this.currentRoom.rematchSeq || 0) + 1
    });
    this.notifyListeners();
  }

  declineRematch() {
    if (!this.currentRoom) return;
    this.channel.send({ type: 'rematch_declined', roomId: this.currentRoom.code });
  }

  subscribeRoom(cb) { this.listeners.push(cb); return () => { this.listeners = this.listeners.filter(fn => fn !== cb); }; }
  subscribeRematch(cb) { this.rematchListeners.push(cb); return () => { this.rematchListeners = this.rematchListeners.filter(fn => fn !== cb); }; }
  subscribeOpponentLeft(cb) { this.opponentLeftListeners.push(cb); return () => { this.opponentLeftListeners = this.opponentLeftListeners.filter(fn => fn !== cb); }; }

  startAIBattle(level = 3, onMatched) {
    this.currentRoom = createAIRoom(level);
    runAIBattle(level, () => this.currentRoom, () => this.notifyListeners());
    this.notifyListeners();
    if (onMatched) onMatched(this.currentRoom);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentRoom));
  }

  leaveRoom() {
    aiBotService.stopMatch();
    if (this.searchingLevel) {
      this.channel.dequeue(this.myPlayerId);
      this.searchingLevel = null;
    }
    if (this.currentRoom) {
      if (!this.currentRoom.isAiMatch) {
        this.channel.send({ type: 'player_left', roomId: this.currentRoom.code });
      }
      this.currentRoom = null;
    }
    this.notifyListeners();
  }
}

export const battleService = new BattleService();
if (typeof window !== 'undefined') {
  window.suidokuBattle = battleService;
}
export default battleService;
