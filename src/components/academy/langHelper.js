/**
 * langHelper.js
 * The single way academy content is looked up by language.
 *
 * ── Why there is only one function here now ───────────────────────────────
 * There used to be three lookup paths and they disagreed:
 *
 *   AcademyScreen.jsx      normalised zh-CN and zh-TW to 'zh', es-ES to 'es',
 *                          then read dict[lang]
 *   getAcademyText()       preferred dict['zh-TW'], fell back to dict.zh
 *   getDiagramText()       preferred dict.zh, fell back to dict['zh-TW']
 *                          — the opposite order to its own sibling
 *
 * On top of that, getAcademyText only knew ko/en/ja/zh/es. Those are the five
 * languages the app shipped with; the other eight fell through to Korean. The
 * app grew to thirteen locales and this file never heard about it, because
 * nothing here breaks visibly when it returns the wrong language — it returns
 * *a* string, and a string renders.
 *
 * The academy data now uses the same locale codes as everything else
 * (zh-CN, zh-TW, es-ES — not zh, es), so no translation between two code
 * schemes is needed, and the normalising chains are gone. A second code
 * scheme is what made all of this possible; there is no second scheme now.
 *
 * If you are about to write `startsWith('zh')` in this directory, that is the
 * bug growing back.
 */

import { DIAGRAM_TRANSLATIONS, getDiagramText } from '../../data/academy/diagramTranslations';

/**
 * Read one localised string out of an academy content object.
 *
 * `lang` is the app's locale code exactly as `activeLanguage` reports it
 * (`ko`, `zh-TW`, `es-ES`, …). It is not normalised, shortened or mapped.
 *
 * English is the fallback rather than Korean: a missing translation should
 * read as "not translated yet", and Korean text in a German UI reads as a
 * corrupted app. Korean remains the last resort so nothing renders empty.
 */
export function pickLocale(dict, lang) {
  if (!dict) return '';
  return dict[lang] || dict.en || dict.ko || '';
}

/** Kept for callers that still use the old name. Same behaviour. */
export function getAcademyText(lang, dict) {
  return pickLocale(dict, lang);
}

export { getDiagramText, DIAGRAM_TRANSLATIONS };
export default getAcademyText;
