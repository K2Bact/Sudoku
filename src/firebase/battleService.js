/**
 * battleService.js
 * 1v1 Real-Time Multiplayer Matchmaking & Game State Synchronization Engine.
 * 100% Real Players Only (Bot simulations completely removed).
 */

import { generatePuzzle } from '../engine/SudokuEngine.js';
import { aiBotService } from '../engine/aiBotService.js';
import { BattleChannel } from './battleChannel.js';

class BattleService {
  constructor() {
    this.currentRoom = null;
    this.listeners = [];
    this.rematchListeners = [];
    this.opponentLeftListeners = [];
    this.myPlayerId = this.initPlayerId();
    this.myPlayerName = this.initPlayerName();
    this.channel = new BattleChannel(this.myPlayerId, this.myPlayerName, data => this.handleMessage(data));
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

  initPlayerName() {
    return `SudokuMaster_${this.myPlayerId.slice(-4)}`;
  }

  handleMessage(data) {
    if (!data) return;
    if (data.type === 'match_ticket') this.handleMatchTicket(data);
    else if (data.type === 'match_created') this.handleMatchCreated(data);
    else if (data.type === 'player_progress') this.handlePlayerProgress(data);
    else if (data.type === 'rematch_request') this.rematchListeners.forEach(cb => cb(data));
    else if (data.type === 'rematch_accepted') this.resetForNewMatch(data);
    else if (data.type === 'rematch_declined' && this.currentRoom) {
      this.currentRoom.rematchStatus = 'declined';
      this.notifyListeners();
    } else if (data.type === 'player_left') {
      this.opponentLeftListeners.forEach(cb => cb());
    }
  }

  startQuickMatch(level = 3, onMatched) {
    this.onMatchSuccess = onMatched;
    this.searchingLevel = level;

    const queue = this.channel.getMatchQueue();
    const peer = queue.find(t => t.playerId !== this.myPlayerId && t.level === level && Date.now() - t.timestamp < 30000);

    if (peer) {
      this.channel.removeFromQueue(peer.playerId);
      const puzzle = generatePuzzle(level);
      const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
      const roomId = `room_${peer.playerId}_${this.myPlayerId}_${Date.now()}`;
      const payload = {
        roomId, level, puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount,
        player1: { id: peer.playerId, name: peer.playerName },
        player2: { id: this.myPlayerId, name: this.myPlayerName }
      };

      this.channel.broadcast({ type: 'match_created', ...payload });
      this.setupRoom({
        code: roomId.slice(-5), level, puzzle: puzzle.puzzle, solution: puzzle.solution,
        initialEmptyCount, opponentId: peer.playerId, opponentName: peer.playerName
      });
      if (onMatched) onMatched(this.currentRoom);
    } else {
      this.channel.addToQueue({ playerId: this.myPlayerId, playerName: this.myPlayerName, level, timestamp: Date.now() });
      this.channel.broadcast({ type: 'match_ticket', playerId: this.myPlayerId, playerName: this.myPlayerName, level });
    }
  }

  handleMatchTicket(data) {
    if (!this.searchingLevel || this.searchingLevel !== data.level) return;
    this.channel.removeFromQueue(this.myPlayerId);
    this.channel.removeFromQueue(data.playerId);

    const puzzle = generatePuzzle(data.level);
    const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
    const roomId = `room_${this.myPlayerId}_${data.playerId}_${Date.now()}`;
    const payload = {
      roomId, level: data.level, puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount,
      player1: { id: this.myPlayerId, name: this.myPlayerName },
      player2: { id: data.playerId, name: data.playerName }
    };

    this.channel.broadcast({ type: 'match_created', ...payload });
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

    this.searchingLevel = null;
    this.channel.removeFromQueue(this.myPlayerId);
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
    const filled = Object.values(remainingCounts || {}).reduce((acc, c) => acc + (9 - c), 0);
    const progressPct = Math.min(100, Math.round((filled / 81) * 100));

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

    this.channel.broadcast({
      type: 'player_progress', roomId: this.currentRoom.code, progressPct, mistakes,
      status: this.currentRoom.status, winner: this.currentRoom.winner
    });
    this.notifyListeners();
  }

  handlePlayerProgress(data) {
    if (!this.currentRoom) return;
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
    this.channel.broadcast({
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
    this.channel.broadcast({ type: 'rematch_accepted', roomId: this.currentRoom.code, ...payload });
    this.resetForNewMatch(payload);
  }

  resetForNewMatch(data) {
    if (!this.currentRoom) return;
    Object.assign(this.currentRoom, {
      puzzle: data.puzzle, solution: data.solution, initialEmptyCount: data.initialEmptyCount,
      status: 'playing', myProgress: 0, myMistakes: 0, opponentProgress: 0, opponentMistakes: 0,
      winner: null, rematchStatus: 'accepted'
    });
    this.notifyListeners();
  }

  declineRematch() {
    if (!this.currentRoom) return;
    this.channel.broadcast({ type: 'rematch_declined', roomId: this.currentRoom.code });
  }

  subscribeRoom(cb) { this.listeners.push(cb); return () => { this.listeners = this.listeners.filter(fn => fn !== cb); }; }
  subscribeRematch(cb) { this.rematchListeners.push(cb); return () => { this.rematchListeners = this.rematchListeners.filter(fn => fn !== cb); }; }
  subscribeOpponentLeft(cb) { this.opponentLeftListeners.push(cb); return () => { this.opponentLeftListeners = this.opponentLeftListeners.filter(fn => fn !== cb); }; }

  startAIBattle(level = 3, onMatched) {
    const puzzle = generatePuzzle(level);
    const initialEmptyCount = puzzle.puzzle.flat().filter(v => v === 0).length;
    const botNames = ['AI AlphaDoku', 'AI MindBot', 'AI DeepSudoku', 'AI QuantumBot'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];

    this.currentRoom = {
      code: 'AI_' + Math.random().toString(36).substring(2, 6).toUpperCase(), level,
      puzzle: puzzle.puzzle, solution: puzzle.solution, initialEmptyCount, status: 'playing',
      myProgress: 0, myMistakes: 0, opponentProgress: 0, opponentMistakes: 0,
      opponentId: 'ai_bot', opponentName: botName, winner: null, rematchStatus: 'idle', isAiMatch: true
    };

    aiBotService.startMatch(
      level,
      (botState) => {
        if (!this.currentRoom || !this.currentRoom.isAiMatch) return;
        if (this.currentRoom.status === 'finished' || this.currentRoom.winner) {
          aiBotService.stopMatch();
          return;
        }
        this.currentRoom.opponentProgress = botState.progress;
        this.currentRoom.opponentMistakes = botState.mistakes;
        if (botState.mistakes >= 3 && !this.currentRoom.winner) {
          this.currentRoom.winner = 'me';
          this.currentRoom.winnerReason = 'opponent_mistakes';
          this.currentRoom.status = 'finished';
          aiBotService.stopMatch();
        } else if (botState.progress >= 100 && !this.currentRoom.winner) {
          this.currentRoom.winner = 'opponent';
          this.currentRoom.winnerReason = 'opponent_completion';
          this.currentRoom.status = 'finished';
          aiBotService.stopMatch();
        }
        this.notifyListeners();
      },
      () => {
        if (!this.currentRoom || !this.currentRoom.isAiMatch) return;
        if (this.currentRoom.status === 'finished' || this.currentRoom.winner) {
          aiBotService.stopMatch();
          return;
        }
        this.currentRoom.opponentProgress = 100;
        if (!this.currentRoom.winner) {
          this.currentRoom.winner = 'opponent';
          this.currentRoom.status = 'finished';
        }
        aiBotService.stopMatch();
        this.notifyListeners();
      }
    );

    this.notifyListeners();
    if (onMatched) onMatched(this.currentRoom);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentRoom));
  }

  leaveRoom() {
    aiBotService.stopMatch();
    if (this.searchingLevel) {
      this.channel.removeFromQueue(this.myPlayerId);
      this.searchingLevel = null;
    }
    if (this.currentRoom) {
      if (!this.currentRoom.isAiMatch) {
        this.channel.broadcast({ type: 'player_left', roomId: this.currentRoom.code });
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
