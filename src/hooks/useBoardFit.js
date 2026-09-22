import { useLayoutEffect, useRef } from 'react';

/**
 * Tell the board how much of the game area its neighbours already take.
 *
 * The board must be the largest square that fits (BACKLOG U-1), but the space
 * left over should fall BELOW the keypad, not between board and keypad: the
 * banner is pinned to the bottom, and a keypad sitting 12px above an ad invites
 * accidental ad taps, which AdMob treats as a policy problem. So the board is not
 * a flex-grow child; it is sized as min(width, area height − everything else),
 * and "everything else" is measured here into --board-rest on the game area.
 *
 * Measured with a ResizeObserver, because the keypad and header change height
 * with the system font size, the language and the rival banner.
 */
export function useBoardFit() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const main = ref.current;
    if (!main || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => {
      const kids = [...main.children].filter((c) => !c.classList.contains('board-zone'));
      const gap = parseFloat(getComputedStyle(main).rowGap) || 0;
      const rest = kids.reduce((sum, c) => sum + c.getBoundingClientRect().height, 0) + gap * kids.length;
      main.style.setProperty('--board-rest', `${Math.ceil(rest)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(main);
    [...main.children].forEach((c) => ro.observe(c));
    const mo = new MutationObserver(() => {
      ro.disconnect();
      ro.observe(main);
      [...main.children].forEach((c) => ro.observe(c));
      update();
    });
    mo.observe(main, { childList: true });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, []);
  return ref;
}
