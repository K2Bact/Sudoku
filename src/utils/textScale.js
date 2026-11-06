/**
 * textScale.js — the in-app text size and high contrast (D9, 2026-11-06).
 *
 * Why (user 2026-10-02): the second most common request in competing apps'
 * reviews was "the text is small / the contrast is low" (34 reviews). The app
 * followed the phone's font size only, capped at 130%, and the board's digits
 * did not follow it at all — they are sized to their cells (textZoom.js).
 *
 * One setting, four steps, moves both:
 *   - the app's text: the WebView's text zoom becomes the phone's font scale
 *     times the step, capped at 0.85..1.3 as MainActivity always capped it — the
 *     layouts are gated up to 1.3 (3-12, 3-16), and past it the board loses room.
 *     The zoom is native, so it goes through NativeInfoPlugin.setTextScale, which
 *     also keeps the step for the next start (MainActivity applies it before the
 *     page loads). In a browser there is no plugin and only the board changes.
 *   - the board: digits by at most 1.2, notes by at most 1.15. Measured on a 412px
 *     board: the digit font's text box is 1.4em, so at 1.2 it is exactly a cell
 *     (41px) and at 1.3 it is 44.5px — taller than the cell, which gate 3-12
 *     counts as a digit bigger than its cell. The 1.15 for notes is a margin, not a
 *     measurement: a killer note sits inside the dashed cage (13% padding), and by
 *     arithmetic a 1.3 note would be about 11.8px in 11.3px of room on that board.
 *     The page cannot measure it — a note's text box is taller than its slot even at
 *     the normal size — so gate 2-34 holds the number and nothing measures the ink.
 * High contrast is a class on <html>: each theme's muted text and grid lines get
 * darker (or lighter, on the dark theme), and the lines get thicker (contrast.css).
 */
import { measureTextZoom } from './textZoom.js';

export const TEXT_STEPS = Object.freeze([
  { id: 'small', factor: 0.9 },
  { id: 'normal', factor: 1 },
  { id: 'large', factor: 1.15 },
  { id: 'xlarge', factor: 1.3 },
]);
export const DIGIT_STEP_MAX = 1.2;
export const NOTE_STEP_MAX = 1.15;

export function textStepFactor(id) {
  return (TEXT_STEPS.find((s) => s.id === id) || TEXT_STEPS[1]).factor;
}

/**
 * Put the display settings on the page: the board's steps, the contrast class,
 * and the WebView's text zoom. Resolves once the zoom is in place and measured.
 */
export async function applyDisplaySettings({ textSize = 'normal', highContrast = false } = {}) {
  if (typeof document === 'undefined') return;
  const factor = textStepFactor(textSize);
  const root = document.documentElement;
  root.style.setProperty('--board-digit-step', String(Math.min(factor, DIGIT_STEP_MAX)));
  root.style.setProperty('--board-note-step', String(Math.min(factor, NOTE_STEP_MAX)));
  root.classList.toggle('high-contrast', Boolean(highContrast));
  const native = typeof window !== 'undefined' ? window.Capacitor?.Plugins?.NativeInfo : null;
  if (native && typeof native.setTextScale === 'function') {
    try {
      await native.setTextScale({ step: factor });
    } catch {
      /* an older native build without the method: the board still changes */
    }
    // The new zoom shows on the next frame; measure after it, not before.
    if (typeof requestAnimationFrame === 'function') await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }
  measureTextZoom();
}
