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
  isValidBoardPayload, isValidProgress, isForRoom, isFromOpponent, isForThisMatch
} from './battleValidation.js';
import {
  startQuickMatch, claimBothTickets, handleMatchTicket, handleMatchCreated
} from './battleMatchmaking.js';

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
   * Take the id the transport can actually prove, before anything goes on the wire.
   *
   * The id above is generated here and stored here, so it says only what this
   * phone decided to call itself. Over Firebase the transport signs with the
   * anonymous account's uid instead, and the published rules reject a message or
   * a ticket carrying anybody else's (RT-2) — so a ticket built from the local id
   * would be refused, and, worse, a peer could previously put the opponent's id
   * on a message and battleValidation.isFromOpponent would wave it through.
   *
   * Called at the start of every path that puts an id on the wire rather than in
   * the constructor, because the uid arrives over the network: the constructor
   * cannot wait, and a search happens long after startup. It is idempotent.
   */
  async adoptProvenIdentity() {
    if (!this.channel || typeof this.channel.whoAmI !== 'function') return this.myPlayerId;
    try {
      const proven = await this.channel.whoAmI();
      if (proven && proven !== this.myPlayerId) {
        const namedAfterOldId = this.myPlayerName === `Player_${this.myPlayerId.slice(-4)}`;
        this.myPlayerId = proven;
        if (namedAfterOldId) this.myPlayerName = this.initPlayerName();
      }
    } catch (e) {
      console.warn('[Battle] could not read the proven identity:', e?.message || e);
    }
    return this.myPlayerId;
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
    return `Player_${this.myPlayerId.slice(-4)}`;
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
    if (!isForThisMatch(data, room)) return;

    if (data.type === 'player_progress') this.handlePlayerProgress(data);
    else if (data.type === 'rematch_request') {
      // Remember that they asked. Without this the acceptance below has nothing
      // to check itself against.
      room.rematchAsked = true;
      this.rematchListeners.forEach(cb => cb(data));
    } else if (data.type === 'rematch_accepted') {
      // An acceptance answers a question. Nobody asked one, so this is either a
      // replay or a peer trying to wipe a live board back to zero (RT-3 / F05).
      if (room.rematchStatus !== 'waiting' && !room.rematchAsked) return;
      this.resetForNewMatch(data);
    }
    else if (data.type === 'rematch_declined') {
      room.rematchStatus = 'declined';
      room.rematchSeq = (room.rematchSeq || 0) + 1;
      this.notifyListeners();
    } else if (data.type === 'player_left') {
      this.opponentLeftListeners.forEach(cb => cb());
    }
  }

  /**
   * Finding an opponent lives in battleMatchmaking.js — see the header there.
   * These four keep their names so callers and tests do not have to know.
   */
  startQuickMatch(level = 3, onMatched) { return startQuickMatch(this, level, onMatched); }

  claimBothTickets(peerId) { return claimBothTickets(this, peerId); }

  handleMatchTicket(data) { return handleMatchTicket(this, data); }

  handleMatchCreated(data) { return handleMatchCreated(this, data); }

  setupRoom(cfg) {
    this.currentRoom = {
      code: cfg.code, level: cfg.level, puzzle: cfg.puzzle, solution: cfg.solution,
      initialEmptyCount: cfg.initialEmptyCount, status: 'playing', myProgress: 0, myMistakes: 0,
      opponentProgress: 0, opponentMistakes: 0, opponentId: cfg.opponentId, opponentName: cfg.opponentName,
      winner: null, rematchStatus: 'idle',
      // Which match this room is on, counted from 0 and raised by every rematch.
      // Every in-match message carries it, so a message from the match before
      // cannot land in this one (RT-3 / F06).
      matchSeq: 0,
      // Whether a rematch handshake is actually open. An acceptance is only
      // meaningful if somebody asked — see handleMessage (RT-3 / F05).
      rematchAsked: false,
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
      type: 'player_progress', roomId: this.currentRoom.code, seq: this.currentRoom.matchSeq,
      progressPct, mistakes,
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
    this.currentRoom.rematchAsked = false;
    this.channel.send({
      type: 'rematch_request', roomId: this.currentRoom.code, seq: this.currentRoom.matchSeq,
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
    this.channel.send({
      type: 'rematch_accepted', roomId: this.currentRoom.code, seq: this.currentRoom.matchSeq, ...payload
    });
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
    // The level is this room's, not the one in the message: a rematch cannot
    // quietly change the difficulty both players agreed to.
    if (!this.currentRoom || !isValidBoardPayload(data, this.currentRoom.level)) return;
    Object.assign(this.currentRoom, {
      puzzle: data.puzzle, solution: data.solution, initialEmptyCount: data.initialEmptyCount,
      status: 'playing', myProgress: 0, myMistakes: 0, opponentProgress: 0, opponentMistakes: 0,
      winner: null, winnerReason: null,
      rematchStatus: 'accepted', rematchSeq: (this.currentRoom.rematchSeq || 0) + 1,
      // A new match, so a new number: everything still in the air from the last
      // one is now addressed to a match that is over (RT-3 / F06).
      matchSeq: (this.currentRoom.matchSeq || 0) + 1,
      rematchAsked: false,
      // And a new clock. These decide the photo finish when both players fill the
      // last cell at once; carried over from the previous match they would hand
      // the win to whoever won last time (RT-3 / F07).
      startedAt: Date.now(), myElapsedMs: null, opponentElapsedMs: null
    });
    this.notifyListeners();
  }

  declineRematch() {
    if (!this.currentRoom) return;
    this.channel.send({ type: 'rematch_declined', roomId: this.currentRoom.code, seq: this.currentRoom.matchSeq });
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
        this.channel.send({ type: 'player_left', roomId: this.currentRoom.code, seq: this.currentRoom.matchSeq });
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
