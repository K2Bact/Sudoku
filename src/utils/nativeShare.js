import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.powerneja.suidoku';

/**
 * Robust Native Android / iOS / Web Share Utility
 * Automatically prioritizes Capacitor Native Share Dialog, then Web Share API, then Clipboard fallback.
 */
export async function shareContent({ title, text, url = PLAY_STORE_URL, dialogTitle = 'Share Suidoku' }) {
  // 1. Capacitor Native Android / iOS Share
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle
      });
      return { success: true, method: 'native' };
    } catch (e) {
      if (e.message && e.message.includes('canceled')) {
        return { success: false, method: 'canceled' };
      }
      console.warn('Capacitor Share failed, attempting web fallback:', e);
    }
  }

  // 2. Web Share API (Mobile Browsers)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const shareData = { title, text };
      if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        shareData.url = url;
      }
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true, method: 'web_share' };
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        return { success: false, method: 'canceled' };
      }
      console.warn('Web Share API failed, attempting clipboard fallback:', e);
    }
  }

  // 3. Fallback: Copy to Clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      const fullText = url ? `${text}\n${url}` : text;
      await navigator.clipboard.writeText(fullText);
      return { success: true, method: 'clipboard' };
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  }

  return { success: false, method: 'none' };
}
