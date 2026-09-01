import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, DICTIONARIES, detectSystemLanguage } from './dictionaries.js';
import { loadSettings, saveSettings } from '../utils/storage';

export { SUPPORTED_LANGUAGES, DICTIONARIES, detectSystemLanguage };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [langSetting, setLangSetting] = useState(() => {
    try {
      const saved = loadSettings();
      return saved.language || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  const activeLanguage = useMemo(() => {
    if (langSetting === 'auto') {
      return detectSystemLanguage();
    }
    return DICTIONARIES[langSetting] ? langSetting : 'en';
  }, [langSetting]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isRTL = (activeLanguage || '').startsWith('ar');
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = activeLanguage;
      if (document.body) {
        if (isRTL) document.body.classList.add('rtl-layout');
        else document.body.classList.remove('rtl-layout');
      }
    }
  }, [activeLanguage]);

  const changeLanguage = useCallback((newLang) => {
    setLangSetting(newLang);
    try {
      const current = loadSettings();
      saveSettings({ ...current, language: newLang });
    } catch (e) {}
  }, []);

  /**
   * Safe Translation Key Resolver with Param Interpolation and Triple Fallback
   */
  const t = useCallback((keyPath, params = {}) => {
    if (!keyPath) return '';

    if (typeof keyPath === 'object' && keyPath !== null) {
      const current = (activeLanguage || 'ko').toLowerCase();
      if (current.startsWith('es')) return keyPath['es-ES'] || keyPath.es || keyPath.en || keyPath.ko || '';
      if (current.startsWith('zh')) return keyPath['zh-TW'] || keyPath.zh || keyPath.en || keyPath.ko || '';
      if (current.startsWith('ja')) return keyPath.ja || keyPath.en || keyPath.ko || '';
      if (current.startsWith('en')) return keyPath.en || keyPath.ko || '';
      return keyPath.ko || keyPath.en || '';
    }

    const keys = typeof keyPath === 'string' ? keyPath.split('.') : [];
    
    // Helper to traverse a dictionary object
    const resolveFromDict = (dict) => {
      let current = dict;
      for (const k of keys) {
        if (!current || typeof current !== 'object') return null;
        current = current[k];
      }
      return typeof current === 'string' ? current : null;
    };

    // 1. Try active language -> 2. Try English -> 3. Try Korean -> 4. Fallback to raw key
    let text =
      resolveFromDict(DICTIONARIES[activeLanguage]) ||
      resolveFromDict(DICTIONARIES.en) ||
      resolveFromDict(DICTIONARIES.ko) ||
      keyPath;

    // Interpolate dynamic parameters {paramKey}
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  }, [activeLanguage]);

  const value = useMemo(() => ({
    language: langSetting,
    activeLanguage,
    isRTL: (activeLanguage || '').startsWith('ar'),
    setLanguage: changeLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES
  }), [langSetting, activeLanguage, changeLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback safe dummy translation if used outside provider
    return {
      language: 'auto',
      activeLanguage: 'ko',
      isRTL: false,
      setLanguage: () => {},
      t: (key) => key,
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }
  return context;
}
