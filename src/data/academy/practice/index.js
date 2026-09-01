/**
 * index.js
 * Master Aggregator for all 54 Academy Interactive Practice Missions (27 strategies × 2)
 */

import { STAGE1_PRACTICE } from './stage1Practice.js';
import { STAGE2_PRACTICE } from './stage2Practice.js';
import { STAGE3_PRACTICE } from './stage3Practice.js';
import { STAGE4_PRACTICE } from './stage4Practice.js';
import { STAGE5_PRACTICE } from './stage5Practice.js';

export const ALL_PRACTICE_MISSIONS = {
  ...STAGE1_PRACTICE,
  ...STAGE2_PRACTICE,
  ...STAGE3_PRACTICE,
  ...STAGE4_PRACTICE,
  ...STAGE5_PRACTICE
};

export function getPracticeMissions(strategyId) {
  return ALL_PRACTICE_MISSIONS[strategyId] || [];
}
