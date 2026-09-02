/**
 * aiBattleSession.js
 * Solo practice match against the simulated bot.
 *
 * Split out of battleService so the PvP path holds only peer-to-peer concerns.
 * Nothing here touches the transport: an AI match is entirely local, has no
 * opponent to validate, and must never be confused with a real 1v1 room —
 * `isAiMatch: true` is the flag every caller branches on.
 */

import { generatePuzzle } from '../engine/SudokuEngine.js';
import { aiBotService } from '../engine/aiBotService.js';

const BOT_NAMES = ['AI AlphaDoku', 'AI MindBot', 'AI DeepSudoku', 'AI QuantumBot'];

export function createAIRoom(level = 3) {
  const puzzle = generatePuzzle(level);
  return {
    code: 'AI_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    level,
    puzzle: puzzle.puzzle,
    solution: puzzle.solution,
    initialEmptyCount: puzzle.puzzle.flat().filter((v) => v === 0).length,
    status: 'playing',
    myProgress: 0,
    myMistakes: 0,
    opponentProgress: 0,
    opponentMistakes: 0,
    opponentId: 'ai_bot',
    opponentName: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
    winner: null,
    rematchStatus: 'idle',
    isAiMatch: true
  };
}

/**
 * Drive the bot for `room`. `getRoom` is read every tick so a match that has
 * been left or replaced stops updating a stale object.
 */
export function runAIBattle(level, getRoom, notify) {
  const finish = (winner, reason) => {
    const room = getRoom();
    if (!room || room.winner) return false;
    room.winner = winner;
    room.winnerReason = reason;
    room.status = 'finished';
    aiBotService.stopMatch();
    return true;
  };

  const stillLive = () => {
    const room = getRoom();
    if (!room || !room.isAiMatch || room.status === 'finished' || room.winner) {
      aiBotService.stopMatch();
      return false;
    }
    return true;
  };

  aiBotService.startMatch(
    level,
    (botState) => {
      if (!stillLive()) return;
      const room = getRoom();
      room.opponentProgress = botState.progress;
      room.opponentMistakes = botState.mistakes;
      if (botState.mistakes >= 3) finish('me', 'opponent_mistakes');
      else if (botState.progress >= 100) finish('opponent', 'opponent_completion');
      notify();
    },
    () => {
      if (!stillLive()) return;
      // Reached only if onUpdate did not already settle the match.
      getRoom().opponentProgress = 100;
      finish('opponent', 'opponent_completion');
      notify();
    }
  );
}
