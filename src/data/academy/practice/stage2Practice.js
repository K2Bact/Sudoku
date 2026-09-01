/**
 * stage2Practice.js
 * Master aggregator for Stage 2 Intermediate Strategies (8 strategies × 2 = 16 missions)
 */

import { STAGE2_PAIRS_PRACTICE } from './stage2PairsPractice.js';
import { STAGE2_TUPLES_PRACTICE } from './stage2TuplesPractice.js';

export const STAGE2_PRACTICE = {
  ...STAGE2_PAIRS_PRACTICE,
  ...STAGE2_TUPLES_PRACTICE
};
