import { common } from './ar/common.js';
import { modals } from './ar/modals.js';
import { achievements } from './ar/achievements.js';
import { leaderboard } from './ar/leaderboard.js';
import { screens } from './ar/screens.js';

export const ar = {
  ...common,
  ...modals,
  ...achievements,
  ...leaderboard,
  ...screens
};

export default ar;
