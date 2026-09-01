/**
 * diagramTranslations.js
 * 
 * 100% Comprehensive 5-Language Master Catalog for all Academy Mini-Diagrams.
 * Aggregates modular stage diagrams across Stages 1 to 5.
 */

import { STAGE1_DIAGRAMS } from './diagrams/stage1Diagrams.js';
import { STAGE2_DIAGRAMS } from './diagrams/stage2Diagrams.js';
import { STAGE3_DIAGRAMS } from './diagrams/stage3Diagrams.js';
import { STAGE4_DIAGRAMS } from './diagrams/stage4Diagrams.js';
import { STAGE5_DIAGRAMS } from './diagrams/stage5Diagrams.js';

export const DIAGRAM_TRANSLATIONS = {
  ...STAGE1_DIAGRAMS,
  ...STAGE2_DIAGRAMS,
  ...STAGE3_DIAGRAMS,
  ...STAGE4_DIAGRAMS,
  ...STAGE5_DIAGRAMS
};

export function getDiagramText(type, key, lang = 'ko') {
  const strategyDict = DIAGRAM_TRANSLATIONS[type];
  if (!strategyDict) return '';
  const item = strategyDict[key];
  if (!item) return '';
  const normalized = (lang || 'ko').toLowerCase();
  if (normalized.startsWith('zh')) return item.zh || item['zh-TW'] || item.en || item.ko || '';
  if (normalized.startsWith('es')) return item.es || item['es-ES'] || item.en || item.ko || '';
  if (normalized.startsWith('de')) return item.de || item.en || item.ko || '';
  if (normalized.startsWith('fr')) return item.fr || item.en || item.ko || '';
  if (normalized.startsWith('pt')) return item.pt || item.en || item.ko || '';
  if (normalized.startsWith('it')) return item.it || item.en || item.ko || '';
  if (normalized.startsWith('ru')) return item.ru || item.en || item.ko || '';
  if (normalized.startsWith('hi')) return item.hi || item.en || item.ko || '';
  if (normalized.startsWith('ar')) return item.ar || item.en || item.ko || '';
  if (normalized.startsWith('ja')) return item.ja || item.en || item.ko || '';
  if (normalized.startsWith('en')) return item.en || item.ko || '';
  return item.ko || item.en || '';
}

export default DIAGRAM_TRANSLATIONS;
