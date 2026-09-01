import { useState, useEffect, useRef } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';

export function useThemeManager() {
  const settings = loadSettings();
  const rawTheme = settings.theme || 'matte-dark';
  const initialTheme = rawTheme === 'dark' ? 'matte-dark' : rawTheme;
  const [theme, setTheme] = useState(initialTheme);
  const [themeToastText, setThemeToastText] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    saveSettings({ ...loadSettings(), theme });
  }, [theme]);

  useEffect(() => {
    soundHaptic.setSoundEnabled(soundEnabled);
    saveSettings({ ...loadSettings(), soundEnabled });
  }, [soundEnabled]);

  const showToast = (msg, duration = 2500) => {
    setThemeToastText(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setThemeToastText(null), duration);
  };

  const cycleTheme = () => {
    const themes = ['clay', 'matte-dark', 'pure-ceramic', 'editorial'];
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];

    soundHaptic.playSelectSound();
    setTheme(nextTheme);
    saveSettings({ ...loadSettings(), theme: nextTheme });
  };

  return {
    theme,
    setTheme,
    themeToastText,
    soundEnabled,
    setSoundEnabled,
    cycleTheme,
    showToast
  };
}
