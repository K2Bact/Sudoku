/**
 * diagramTranslations.js
 * 
 * 100% Comprehensive 5-Language Master Catalog for all Academy Mini-Diagrams.
 * Aggregates modular stage diagrams across Stages 1 to 5.
 */

import { STAGE1_DIAGRAMS } from './diagrams/stage1Diagrams.js';
import { STAGE2_DIAGRAMS } from './diagrams/stage2Diagrams.js';
import { STAGE3_DIAGRAMS } from './diagrams/stage3Diagrams.js';
import { STAGE5_DIAGRAMS } from './diagrams/stage5Diagrams.js';

export const DIAGRAM_TRANSLATIONS = {
  ...STAGE1_DIAGRAMS,
  ...STAGE2_DIAGRAMS,
  ...STAGE3_DIAGRAMS,
  ...STAGE5_DIAGRAMS
};

/**
 * Read one diagram caption in the requested language.
 *
 * `lang` is the app's locale code as-is (`zh-TW`, `es-ES`, …). This function
 * used to hold a chain of `startsWith` branches that mapped those codes down
 * to the shorter keys this data once used — and the chain had to be extended
 * by hand every time a language was added. Its sibling in langHelper.js was
 * never extended, so the two disagreed about which key wins for Chinese.
 *
 * The data now uses the same codes as the rest of the app, so there is
 * nothing to map. One lookup, one fallback.
 */
export function getDiagramText(type, key, lang = 'ko') {
  const strategyDict = DIAGRAM_TRANSLATIONS[type];
  if (!strategyDict) return '';
  const item = strategyDict[key];
  if (!item) return '';
  return item[lang] || item.en || item.ko || '';
}

export default DIAGRAM_TRANSLATIONS;
