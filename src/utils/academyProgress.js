/**
 * academyProgress.js — which academy techniques the player has practised.
 *
 * The academy kept nothing until 2026-10-08: each technique's practice board
 * said "solved" and forgot it. The academy achievements need to know (D11: the
 * first technique, all of stage 3, all of them), so a technique counts as
 * practised once either of its practice boards is solved.
 *
 * It goes into the cloud backup with the rest (cloudSyncService), merged as a
 * union: a technique practised on either phone stays practised.
 */
import { ACADEMY_STAGES } from '../data/academyStrategies.js';

export const ACADEMY_PROGRESS_KEY = 'suidoku_academy_progress_v1';

export function loadAcademyProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(ACADEMY_PROGRESS_KEY) || 'null');
    const solved = raw && typeof raw.solved === 'object' && !Array.isArray(raw.solved) ? raw.solved : {};
    return { solved };
  } catch {
    return { solved: {} };
  }
}

/** Mark a technique practised. Returns true the first time, false after. */
export function markPracticeSolved(strategyId) {
  if (!strategyId) return false;
  const progress = loadAcademyProgress();
  if (progress.solved[strategyId]) return false;
  progress.solved[strategyId] = true;
  try {
    localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save academy progress:', e);
    return false;
  }
  return true;
}

/** Techniques practised, overall and in one stage ('stage1' … 'stage5'). */
export function academyCounts(progress = loadAcademyProgress()) {
  const solved = (ids) => ids.filter((id) => progress.solved[id]).length;
  const all = ACADEMY_STAGES.flatMap((s) => s.strategies.map((x) => x.id));
  const byStage = Object.fromEntries(ACADEMY_STAGES.map((s) => {
    const ids = s.strategies.map((x) => x.id);
    return [s.id, { solved: solved(ids), total: ids.length }];
  }));
  return { solved: solved(all), total: all.length, byStage };
}
