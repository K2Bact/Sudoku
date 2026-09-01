/**
 * Korean (ko) Localization Dictionary
 * Single Source of Truth for Korean strings in Sudoku.
 */
import { common } from './ko/common.js';
import { screens } from './ko/screens.js';
import { modals } from './ko/modals.js';
import { achievements } from './ko/achievements.js';
import { leaderboard } from './ko/leaderboard.js';

export const ko = {
  ...common,
  ...screens,
  ...modals,
  ...achievements,
  ...leaderboard
};

export default ko;
