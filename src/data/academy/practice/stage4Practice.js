/**
 * stage4Practice.js
 * Stage 4 Master Practice Aggregator (8 strategies × 2 = 16 missions)
 * Strictly obeys modular architecture and sub-300 lines limit.
 */
import { STAGE4_FISH_PRACTICE } from './stage4FishPractice.js';
import { STAGE4_CHAINS_PRACTICE } from './stage4ChainsPractice.js';

export const STAGE4_PRACTICE = {
  ...STAGE4_FISH_PRACTICE,
  ...STAGE4_CHAINS_PRACTICE
};
