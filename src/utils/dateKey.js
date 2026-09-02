/**
 * dateKey.js
 * Single source of truth for "what day is it" across every daily system
 * (daily challenge, attendance streak, monthly badges).
 *
 * Always LOCAL time. Deriving the key from toISOString() would key the day off
 * UTC, so in KST the reset would land at 09:00 local and a player could claim
 * two "days" of attendance between 08:59 and 09:01.
 */

// Today in the player's own timezone, formatted as YYYY-MM-DD
export function getTodayDateKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Whole days between two YYYY-MM-DD keys (both parsed identically, so DST-safe)
export function daysBetweenKeys(fromKey, toKey) {
  const from = new Date(`${fromKey}T00:00:00Z`);
  const to = new Date(`${toKey}T00:00:00Z`);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}
