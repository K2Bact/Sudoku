/**
 * Stage 3 Practice (Verified)
 * Aggregates Stage 3 Wings and Chains practice missions.
 */

import { STAGE3_WINGS_PRACTICE } from './stage3WingsPractice.js';
import { STAGE3_CHAINS_PRACTICE } from './stage3ChainsPractice.js';

export const STAGE3_PRACTICE = {
  ...STAGE3_WINGS_PRACTICE,
  ...STAGE3_CHAINS_PRACTICE
};

export default STAGE3_PRACTICE;
