/**
 * backLayers.js — the windows open on top of a screen, newest last.
 *
 * The Android back key reaches one handler (useBackStack), and that handler knew
 * only the dialogs App owns. A window a screen opens with its own state — the
 * rules card, the privacy page, a locked-mode note, the confirm dialog — was
 * invisible to it, so back went to the screen underneath: on Home "press again
 * to exit", and a second press closed the app with the window still up (D43,
 * release 32 on the emulator, 2026-10-29). A window that is open puts its close
 * here (hooks/useBackLayer.js) and back closes the newest one first.
 *
 * Only the owner takes an entry out, when the window has really gone (its effect
 * cleanup). closeTopBackLayer() asks the top window to close and leaves the entry
 * alone: if the window stays — an ad still loading closes nothing on purpose —
 * it is still the top, and the next back goes to it again instead of past it.
 * A second press before the window has gone is the debounce's (useBackStack).
 */
const layers = [];

/** Put a window on the list. Returns the function that takes it off again. */
export function pushBackLayer(close) {
  const entry = { close };
  layers.push(entry);
  return () => {
    // The owner's entry wherever it is: several windows can go in one render
    // (a screen change), and their cleanups need not run newest first.
    const i = layers.lastIndexOf(entry);
    if (i >= 0) layers.splice(i, 1);
  };
}

/** Ask the newest window to close. False when nothing is open. */
export function closeTopBackLayer() {
  const top = layers[layers.length - 1];
  if (!top) return false;
  top.close();
  return true;
}

export const openBackLayerCount = () => layers.length;
