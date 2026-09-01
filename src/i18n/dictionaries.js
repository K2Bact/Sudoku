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

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', labelKey: 'settings.languages.auto', nativeName: 'Auto', flag: '🌐' },
  { code: 'ko', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'es-ES', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', nativeName: 'العربية', flag: '🇸🇦', isRTL: true }
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

export const detectSystemLanguage = () => {
  if (typeof navigator === 'undefined') return 'ko';
  const sysLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
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
  return 'en';
};

export default DICTIONARIES;
