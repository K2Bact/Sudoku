import ko from './locales/ko.js';
import en from './locales/en.js';
import ja from './locales/ja.js';
import zhTW from './locales/zh-TW.js';
import zhCN from './locales/zh-CN.js';
import esES from './locales/es-ES.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import pt from './locales/pt.js';
import it from './locales/it.js';
import ru from './locales/ru.js';
import hi from './locales/hi.js';
import ar from './locales/ar.js';

// englishName is what the settings picker sorts by (languageOrder.js, user 2026-09-30):
// the language's English name, not the country's — Arabic and English belong to many.
export const SUPPORTED_LANGUAGES = [
  { code: 'auto', labelKey: 'settings.languages.auto', nativeName: 'Auto', flag: '🌐' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷' },
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', nativeName: '简体中文', englishName: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', nativeName: '繁體中文', englishName: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'es-ES', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', isRTL: true }
];

export const DICTIONARIES = {
  ko,
  en,
  ja,
  'zh-CN': zhCN,
  'zh-Hans': zhCN,
  'zh-SG': zhCN,
  'zh-MY': zhCN,
  zh: zhCN,
  'zh-TW': zhTW,
  'zh-Hant': zhTW,
  'zh-HK': zhTW,
  'zh-MO': zhTW,
  'es-ES': esES,
  es: esES,
  de,
  'de-DE': de,
  'de-AT': de,
  'de-CH': de,
  fr,
  'fr-FR': fr,
  'fr-CA': fr,
  'fr-BE': fr,
  'fr-CH': fr,
  pt,
  'pt-BR': pt,
  'pt-PT': pt,
  it,
  'it-IT': it,
  'it-CH': it,
  ru,
  'ru-RU': ru,
  'ru-KZ': ru,
  'ru-BY': ru,
  hi,
  'hi-IN': hi,
  ar,
  'ar-SA': ar,
  'ar-AE': ar,
  'ar-EG': ar,
  'ar-QA': ar,
  'ar-KW': ar
};

/**
 * Which of our languages the device speaks, or null when it speaks none of them.
 *
 * Kept apart from detectSystemLanguage because the two answer different questions.
 * The app has to show SOME language, so detection falls back to English. The
 * settings picker puts the device's language next to "System" — and a Vietnamese
 * phone must not see English promoted there as if it were its language.
 */
export const matchSystemLanguage = (raw = typeof navigator === 'undefined' ? '' : (navigator.language || navigator.userLanguage || '')) => {
  const sysLang = String(raw).toLowerCase();
  if (sysLang.startsWith('ko')) return 'ko';
  if (sysLang.startsWith('ja')) return 'ja';
  if (sysLang === 'zh-tw' || sysLang === 'zh-hk' || sysLang === 'zh-mo' || sysLang.includes('hant')) return 'zh-TW';
  if (sysLang.startsWith('zh')) return 'zh-CN';
  if (sysLang.startsWith('es')) return 'es-ES';
  if (sysLang.startsWith('de')) return 'de';
  if (sysLang.startsWith('fr')) return 'fr';
  if (sysLang.startsWith('pt')) return 'pt';
  if (sysLang.startsWith('it')) return 'it';
  if (sysLang.startsWith('ru')) return 'ru';
  if (sysLang.startsWith('hi')) return 'hi';
  if (sysLang.startsWith('ar')) return 'ar';
  if (sysLang.startsWith('en')) return 'en';
  return null;
};

export const detectSystemLanguage = () => {
  if (typeof navigator === 'undefined') return 'ko';
  return matchSystemLanguage() || 'en';
};

export default DICTIONARIES;
