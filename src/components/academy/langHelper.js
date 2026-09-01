/**
 * Academy Multilingual Text Helper
 */
import { DIAGRAM_TRANSLATIONS, getDiagramText } from '../../data/academy/diagramTranslations';

export function getAcademyText(lang, dict) {
  if (!dict) return '';
  const currentLang = (lang || 'ko').toLowerCase();
  if (currentLang.startsWith('es')) return dict['es-ES'] || dict.es || dict.en || dict.ko || '';
  if (currentLang.startsWith('zh')) return dict['zh-TW'] || dict.zh || dict.en || dict.ko || '';
  if (currentLang.startsWith('ja')) return dict.ja || dict.en || dict.ko || '';
  if (currentLang.startsWith('en')) return dict.en || dict.ko || '';
  return dict.ko || dict.en || '';
}

export { getDiagramText, DIAGRAM_TRANSLATIONS };
export default getAcademyText;
