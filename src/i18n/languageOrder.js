/**
 * languageOrder.js — the order of the buttons in the settings language picker.
 *
 * User decision 2026-09-30:
 *   1. "System" first, top left.
 *   2. The device's own language right beside it — if it is one of ours.
 *   3. Everything else by its English name, alphabetically (the language's name,
 *      not a country's: Arabic and English are spoken in many).
 *
 * The list itself stays in dictionaries.js (SUPPORTED_LANGUAGES); this only orders it.
 * Pure, so gate 2-25 can check it without a browser.
 */

/**
 * @param {Array<{code: string, englishName?: string}>} languages  SUPPORTED_LANGUAGES
 * @param {string|null} systemCode  matchSystemLanguage() — null when the device speaks none of ours
 */
export function orderLanguages(languages, systemCode) {
  const system = languages.filter((l) => l.code === 'auto');
  const own = languages.filter((l) => l.code !== 'auto' && l.code === systemCode);
  const rest = languages
    .filter((l) => l.code !== 'auto' && l.code !== systemCode)
    .sort((a, b) => a.englishName.localeCompare(b.englishName, 'en'));
  return [...system, ...own, ...rest];
}
