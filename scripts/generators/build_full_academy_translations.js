import fs from 'fs';
import path from 'path';

console.log('🚀 Running Complete Academy 13-Language Multilingual Master Builder...');

// 1. Update src/components/academy/langHelper.js
const langHelperCode = `/**
 * langHelper.js
 * Master Multilingual Resolver for Academy Text & Diagrams (13 Languages)
 */
import { DIAGRAM_TRANSLATIONS, getDiagramText } from '../../data/academy/diagramTranslations';

export function getAcademyText(lang, dict) {
  if (!dict || typeof dict !== 'object') return '';
  const currentLang = (lang || 'ko').toLowerCase();

  // 1. Exact match
  if (dict[currentLang]) return dict[currentLang];

  // 2. Language prefix normalization
  const prefix = currentLang.split('-')[0];
  if (dict[prefix]) return dict[prefix];

  // 3. Dialect fallbacks
  if (prefix === 'zh') return dict['zh-TW'] || dict.zh || dict['zh-CN'] || dict.en || dict.ko || '';
  if (prefix === 'es') return dict['es-ES'] || dict.es || dict.en || dict.ko || '';
  if (prefix === 'pt') return dict['pt-BR'] || dict.pt || dict.en || dict.ko || '';
  if (prefix === 'de') return dict.de || dict.en || dict.ko || '';
  if (prefix === 'fr') return dict.fr || dict.en || dict.ko || '';
  if (prefix === 'it') return dict.it || dict.en || dict.ko || '';
  if (prefix === 'ru') return dict.ru || dict.en || dict.ko || '';
  if (prefix === 'hi') return dict.hi || dict.en || dict.ko || '';
  if (prefix === 'ar') return dict['ar-SA'] || dict.ar || dict.en || dict.ko || '';
  if (prefix === 'ja') return dict.ja || dict.en || dict.ko || '';

  return dict.en || dict.ko || '';
}

export { getDiagramText, DIAGRAM_TRANSLATIONS };
export default getAcademyText;
`;

fs.writeFileSync('src/components/academy/langHelper.js', langHelperCode, 'utf8');
console.log('✅ Updated src/components/academy/langHelper.js');
