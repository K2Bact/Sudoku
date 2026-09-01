/**
 * stage2Diagrams.js
 * Aggregates Stage 2 Pairs and Tuples diagram translations.
 */

import { STAGE2_PAIRS_DIAGRAMS } from './stage2PairsDiagrams.js';
import { STAGE2_TUPLES_DIAGRAMS } from './stage2TuplesDiagrams.js';

export const STAGE2_DIAGRAMS = {
  ...STAGE2_PAIRS_DIAGRAMS,
  ...STAGE2_TUPLES_DIAGRAMS
};

export default STAGE2_DIAGRAMS;
