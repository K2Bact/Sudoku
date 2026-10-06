/** mm:ss for a replay's clock and its summary. */
export function clock(ms) {
  const s = Math.floor(Math.max(0, ms || 0) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
