/**
 * When the first-game walkthrough is offered (KP-18, 2026-11-06).
 *
 * Once per kind, before the first game of that kind from Home's standard tab — a
 * player who has already played one (classic: the main record, killer: its own
 * record) is not asked, and nobody is asked twice. The Academy can start it again
 * at any time (AcademyScreen).
 */
import { loadSettings, saveSettings, loadStats } from './storage.js';

export function shouldOfferWalkthrough(kind, mode) {
  if (mode !== 'classic') return false;
  const offered = loadSettings().guidedOffered || {};
  if (offered[kind]) return false;
  const stats = loadStats();
  const record = kind === 'killer' ? stats.killer || {} : stats;
  return !(record.gamesPlayed > 0);
}

export function markWalkthroughOffered(kind) {
  const settings = loadSettings();
  saveSettings({ ...settings, guidedOffered: { ...(settings.guidedOffered || {}), [kind]: true } });
}
