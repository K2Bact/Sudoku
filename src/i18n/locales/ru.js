/**
 * Russian (ru) Localization Dictionary
 * Single Source of Truth for Russian strings in Sudoku.
 */
import { common } from './ru/common.js';
import { screens } from './ru/screens.js';
import { modals } from './ru/modals.js';
import { achievements } from './ru/achievements.js';
import { leaderboard } from './ru/leaderboard.js';
import { replay } from './ru/replay.js';
import { killer } from './ru/killer.js';

export const ru = {
  ...common,
  ...screens,
  ...modals,
  ...achievements,
  ...leaderboard,
  ...replay,
  ...killer
};

export default ru;
