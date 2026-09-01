/**
 * stage4Diagrams.js
 * Aggregates Stage 4 Fish and Chains diagram translations.
 */

import { STAGE4_FISH_DIAGRAMS } from './stage4FishDiagrams.js';
import { STAGE4_CHAINS_DIAGRAMS } from './stage4ChainsDiagrams.js';

export const STAGE4_DIAGRAMS = {
  ...STAGE4_FISH_DIAGRAMS,
  ...STAGE4_CHAINS_DIAGRAMS
};

export default STAGE4_DIAGRAMS;
