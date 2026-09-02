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

    if (data.type === 'match_ticket') return this.handleMatchTicket(data);
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
    const peer = queue.find(t => t.playerId !== this.myPlayerId && t.level === level && Date.now() - t.timestamp < 30000);

    if (peer) {
      this.channel.dequeue(peer.playerId);
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
  handleMatchTicket(data) {
    if (!this.searchingLevel || this.currentRoom) return;
    if (!isValidTicket(data, this.searchingLevel)) return;
    if (this.myPlayerId < data.playerId) return;

    this.searchingLevel = null;
    this.channel.dequeue(this.myPlayerId);
    this.channel.dequeue(data.playerId);

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
      winner: null, rematchStatus: 'idle'
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
      if (this.currentRoom.isAiMatch) aiBotService.stopMatch();
    } else if (mistakes >= 3) {
      this.currentRoom.status = 'finished';
      this.currentRoom.winner = 'opponent';
      this.currentRoom.winnerReason = 'my_mistakes';
      if (this.currentRoom.isAiMatch) aiBotService.stopMatch();
    }

    this.channel.send({
      type: 'player_progress', roomId: this.currentRoom.code, progressPct, mistakes,
      status: this.currentRoom.status, winner: this.currentRoom.winner
    });
    this.notifyListeners();
  }

  handlePlayerProgress(data) {
    // Range-check before trusting: a peer must not be able to report 900% or -5.
    if (!this.currentRoom || !isValidProgress(data)) return;
    this.currentRoom.opponentProgress = data.progressPct;
    this.currentRoom.opponentMistakes = data.mistakes;

    if (data.progressPct >= 100) {
      this.currentRoom.status = 'finished';
      this.currentRoom.winner = 'opponent';
      this.currentRoom.winnerReason = 'opponent_completion';
      if (this.currentRoom.isAiMatch) aiBotService.stopMatch();
    } else if (data.mistakes >= 3) {
      this.currentRoom.status = 'finished';
      this.currentRoom.winner = 'me';
      this.currentRoom.winnerReason = 'opponent_mistakes';
      if (this.currentRoom.isAiMatch) aiBotService.stopMatch();
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
