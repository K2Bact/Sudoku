/**
 * aiBattleSession.js
 * Solo practice match against the simulated bot.
 *
 * Split out of battleService so the PvP path holds only peer-to-peer concerns.
 * Nothing here touches the transport: an AI match is entirely local, has no
 * opponent to validate, and must never be confused with a real 1v1 room —
 * `isAiMatch: true` is the flag every caller branches on.
 */

import { createPuzzle, variantOf } from '../engine/variants.js';
import { aiBotService } from '../engine/aiBotService.js';

// Which bot a room faces. The room keeps the id and the screen names it in the player's
// language (battleHeader.botNames) — the names were English in every language, and
// German says KI, the Romance languages IA, Russian ИИ (D28, 2026-10-22).
export const BOT_IDS = ['grandmaster', 'solver', 'logic', 'swift'];

/**
 * A new match against the bot, on a puzzle of the kind asked for — classic or
 * killer (KP-11, 2026-10-14). A killer room carries its cages, and the game is
 * dealt from the room (aiRoomGame), so the board, the bot's pace and a rematch
 * all read the one kind the room was made with.
 */
export function createAIRoom(level = 3, variant = 'classic') {
  const puzzle = createPuzzle(variant, level);
  return {
    code: 'AI_' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    level,
    variant: variantOf(puzzle),
    cages: puzzle.cages || null,
    puzzle: puzzle.puzzle,
    solution: puzzle.solution,
    initialEmptyCount: puzzle.puzzle.flat().filter((v) => v === 0).length,
    status: 'playing',
    myProgress: 0,
    myMistakes: 0,
    opponentProgress: 0,
    opponentMistakes: 0,
    opponentId: 'ai_bot',
    botId: BOT_IDS[Math.floor(Math.random() * BOT_IDS.length)],
    winner: null,
    rematchStatus: 'idle',
    isAiMatch: true
  };
}

/**
 * Whether `room` is a match against the bot — the room's own flag and nothing else.
 *
 * Six places used to decide it as `room.isAIBattle || opponentName.includes('AI') ||
 * opponentName includes 'bot'` (2026-10-21). Nothing ever set `isAIBattle`, so the header,
 * the back button and the leave button found an AI room only through the bot's English
 * name — translating the names (BACKLOG D28) would have shown every AI battle as a 1v1.
 * And a real player is named Player_ + the last four characters of their id, so about one
 * opponent in 1,200 had AI or bot in their name: the rematch started an AI battle and
 * closing the result went to the AI screen.
 */
export function isAIRoom(room) {
  return Boolean(room?.isAiMatch);
}

/**
 * The name the opponent is shown by. A bot is named from its id in the player's language;
 * a person by the name their device sent. `t` is the caller's translator; `fallback` is a
 * name handed in separately (the result card takes one). Both screens that name the
 * opponent ask here, so the header and the result card cannot disagree.
 */
export function opponentDisplayName(room, t, fallback = null) {
  if (isAIRoom(room)) {
    return BOT_IDS.includes(room.botId) ? t(`battleHeader.botNames.${room.botId}`) : t('home.modes.aiBattle.title');
  }
  return room?.opponentName ?? fallback ?? t('battleResult.opponent');
}

/**
 * The game an AI room deals — what startNewGame is handed, for the first match
 * and every rematch. The kind and the cages travel with the board: handed only
 * the board and the solution, a killer was played as a classic with a killer's
 * givens (often none), no cages drawn and no cage told about in a mistake.
 */
export function aiRoomGame(room) {
  return { board: room.puzzle, solution: room.solution, variant: variantOf(room), cages: room.cages || null };
}

/**
 * Drive the bot for `room`. `getRoom` is read every tick so a match that has
 * been left or replaced stops updating a stale object. The bot's pace is the
 * room's kind's (botProfile): read off the room, it cannot race a killer board
 * at the classic pace.
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
    },
    variantOf(getRoom())
  );
}
