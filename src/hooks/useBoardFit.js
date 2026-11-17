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
/** The smallest board drawn (D44): 9 cells of 16px. */
export const BOARD_MIN_PX = 144;

export function useBoardFit() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const main = ref.current;
    if (!main || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => {
      const kids = [...main.children].filter((c) => !c.classList.contains('board-zone'));
      const gap = parseFloat(getComputedStyle(main).rowGap) || 0;
      // The margin box, not the border box. The rival banner had an 8px margin
      // under it, and leaving that out made the board 8px too tall: the keypad
      // ended 20px above the ad instead of 28 (D20 — gate 3-12 had no banner).
      // The margin is gone now; a neighbour that brings one back is still counted.
      const outer = (c) => {
        const cs = getComputedStyle(c);
        return c.getBoundingClientRect().height + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
      };
      const rest = kids.reduce((sum, c) => sum + outer(c), 0) + gap * kids.length;
      main.style.setProperty('--board-rest', `${Math.ceil(rest)}px`);
      // D44 (2026-11-06): a board under 144px — 16px cells, a third of a fingertip — cannot be played.
      // It stays in the layout (hidden) so it can still be measured, and the window is asked to grow.
      const board = main.querySelector('.board-zone .sudoku-board-container');
      if (board) main.toggleAttribute('data-board-small', board.getBoundingClientRect().width < BOARD_MIN_PX);
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
