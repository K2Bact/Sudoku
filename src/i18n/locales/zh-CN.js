/**
 * Simplified Chinese (zh-CN) Localization Dictionary
 * Single Source of Truth for Simplified Chinese strings in Sudoku.
 */
import { common } from './zh-CN/common.js';
import { screens } from './zh-CN/screens.js';
import { modals } from './zh-CN/modals.js';
import { achievements } from './zh-CN/achievements.js';
import { leaderboard } from './zh-CN/leaderboard.js';
import { replay } from './zh-CN/replay.js';
import { killer } from './zh-CN/killer.js';

export const zhCN = {
  ...common,
  ...screens,
  ...modals,
  ...achievements,
  ...leaderboard,
  ...replay,
  ...killer
};

export default zhCN;
