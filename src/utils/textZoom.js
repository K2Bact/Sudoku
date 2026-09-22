/**
 * textZoom.js
 * Measure the WebView's system-font multiplier and expose it as --text-zoom.
 *
 * Android WebView scales every font by the phone's font-size setting (capped at
 * 130% by MainActivity). That is right for labels and buttons, and wrong for the
 * digits inside a board cell: the cell's size is set by the space on screen, so a
 * digit that grows 30% no longer fits (BACKLOG U-1). The board divides its digit
 * size by this value to cancel the multiplier there and only there.
 *
 * Measured, not read from a setting: a 100px probe comes back as 100px times
 * whatever multiplier the WebView applies, which is the number the CSS needs.
 */
export function measureTextZoom() {
  if (typeof document === 'undefined') return 1;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;font-size:100px;line-height:1;';
  probe.textContent = '0';
  document.body.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).fontSize) || 100;
  probe.remove();
  const zoom = Math.min(2, Math.max(0.5, px / 100));
  document.documentElement.style.setProperty('--text-zoom', String(zoom));
  return zoom;
}
