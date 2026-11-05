import { claimDailyAttendance } from './wallet.js';
import { checkAndUnlockAchievements } from './achievementManager.js';
import { cloudSyncService } from '../services/cloudSyncService.js';

/**
 * Claim today's attendance and what follows a claim (D45, 2026-10-30).
 *
 * Attendance used to be claimed once, when the app started. A phone that kept
 * the app in the background got nothing the next day until the app was killed,
 * and two days of that broke the streak (emulator, 2026-10-29). useAppModals now
 * claims on Home as well: arriving there, and coming back to the app while there.
 *
 * Synchronous: the reward (or null) comes back at once, for the reward window.
 * A claim checks the achievements, so the day-count and streak badges arrive on
 * the day they are reached. `sync` is for the claim on the way back to the app:
 * the backup useCloudAutoSync starts on the same event looks before this claim,
 * finds nothing new and skips (cloudSyncService.hasUnsyncedChanges), so this one
 * asks again. Not waited for — backups queue themselves, and one that cannot run
 * (signed out, offline) just skips.
 */
export function claimAttendanceNow({ sync = false } = {}) {
  const reward = claimDailyAttendance();
  if (reward) {
    checkAndUnlockAchievements();
    if (sync) cloudSyncService.syncIfNeeded().catch(() => {});
  }
  return reward;
}
