/**
 * Hindi (hi) Localization Dictionary
 * Single Source of Truth for Hindi strings in Sudoku.
 */
import { common } from './hi/common.js';
import { screens } from './hi/screens.js';
import { modals } from './hi/modals.js';
import { achievements } from './hi/achievements.js';
import { leaderboard } from './hi/leaderboard.js';

export const hi = {
  ...common,
  ...screens,
  ...modals,
  ...achievements,
  ...leaderboard
};

export default hi;
