import { useLayoutEffect, useRef } from 'react';

/**
 * Leave room under a screen's content for its fixed bottom nav (D50, 2026-11-06).
 *
 * The home screen's nav is position: fixed, so it takes no room in the page, and
 * the screen kept only 14px under its last card. On a small phone or a larger
 * font the daily card ended up under the nav: where the page fitted the screen it
 * did not scroll at all, and where it did scroll it stopped with ~50px still
 * covered — "the home screen does not scroll" (a friend's report). The nav's
 * height changes with the font, the language and the safe area, so it is
 * measured, not guessed: the nav's parent gets --bottom-nav-h, and its CSS adds
 * that to its bottom padding.
 *
 * Attach the returned ref to the nav itself.
 */
export function useBottomNavRoom() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const nav = ref.current;
    const screen = nav?.parentElement;
    if (!nav || !screen || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => screen.style.setProperty('--bottom-nav-h', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);
  return ref;
}
