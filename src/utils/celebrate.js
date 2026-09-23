import confetti from 'canvas-confetti';

/**
 * celebrate.js — the win confetti, on one small canvas that is made once.
 *
 * canvas-confetti creates a new full-viewport canvas per call and sizes its backing
 * store to the CSS viewport. On a Flip5 the win screen then asked the WebView for a
 * 384x857 canvas while the blurred overlay, the board and the banner were all still
 * on screen — and right after a full-screen ad had closed. The allocation failed 35
 * times in 10 seconds:
 *
 *   SharedImageStub: Unable to create shared image
 *   (CanvasResourceRasterGmbMappable, size: 384x857)
 *
 * Every failed frame left a tile of the dialog unpainted — the "flashing" a player
 * reported, with the board showing through a torn corner of the win card
 * (gemini/flicker_captured_screenshot.png, SudokuDiary ㉜).
 *
 * So: one canvas, reused, at half resolution (a quarter of the pixels), stretched by
 * CSS. Confetti is a blur of moving dots; the lower resolution does not read as
 * blurry. It is skipped entirely when the player asked for reduced motion, and any
 * failure is swallowed — a missing celebration must never take the win screen with it.
 */

const SCALE = 0.5;
let fire = null;
let canvas = null;

function ensureCanvas() {
  if (canvas && canvas.isConnected) return canvas;
  canvas = document.createElement('canvas');
  canvas.className = 'celebrate-canvas';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '2000',
  });
  document.body.appendChild(canvas);
  return canvas;
}

function sizeCanvas(el) {
  el.width = Math.max(1, Math.round(window.innerWidth * SCALE));
  el.height = Math.max(1, Math.round(window.innerHeight * SCALE));
}

export function celebrate(options = {}) {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const el = ensureCanvas();
    sizeCanvas(el);
    if (!fire) fire = confetti.create(el, { resize: false, useWorker: false });
    fire({ particleCount: 80, spread: 75, origin: { y: 0.55 }, disableForReducedMotion: true, ...options });
  } catch (e) {
    console.warn('[celebrate] skipped:', e?.message || e);
  }
}
