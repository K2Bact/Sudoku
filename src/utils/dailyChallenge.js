/**
 * dailyChallenge.js
 * Adaptive User Skill-based Daily Mission generator and monthly calendar storage manager.
 */

import { createPuzzle } from '../engine/variants.js';
import { loadStats } from './storage.js';
import { getTodayDateKey } from './dateKey.js';

// Exported so sync/backup code cannot drift onto a different key string.
export const DAILY_STORAGE_KEY = 'suidoku_daily_records_v1';

// Re-exported so existing importers keep resolving it from here
export { getTodayDateKey };

// Determine user skill tier based on wins and clear history

/**
 * 같은 파일의 getDailyMission 이 난이도를 고를 때 쓴다. 모듈 밖에서는
 * 쓰이지 않으므로 export 하지 않는다.
 */
function getUserSkillTier(stats = loadStats()) {
  // Wins and levels of either kind: a killer player is as far along as a classic
  // one with the same record (user, 2026-10-07: the kinds differ in the puzzle only).
  const killer = stats.killer || {};
  const wins = (stats.gamesWon || 0) + (killer.gamesWon || 0);
  const cleared = (lv) => Boolean((stats.bestTimes || {})[lv] || (killer.bestTimes || {})[lv]);

  if (wins < 3 || (!cleared(3) && !cleared(4) && !cleared(5))) {
    return 'beginner'; // New / Beginner
  }
  if (wins < 15 || (!cleared(4) && !cleared(5))) {
    return 'intermediate'; // Intermediate
  }
  return 'advanced'; // Advanced / Master
}

/**
 * Generate Adaptive Daily Mission for a given dateKey
 * Tailored dynamically to the user's skill progression.
 */
export function getDailyMission(dateKey = getTodayDateKey(), stats = loadStats()) {
  const tier = getUserSkillTier(stats);
  const dayNum = parseInt(dateKey.replace(/-/g, ''), 10);
  const missionTypeIdx = dayNum % 3; // 0, 1, or 2 for mission diversity

  if (tier === 'beginner') {
    if (missionTypeIdx === 0) {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'beginner',
        type: 'level_clear',
        minLevel: 1,
        titleKey: 'daily.missions.beginnerLv1Title',
        descKey: 'daily.missions.beginnerLv1Desc',
        targetCount: 1,
        actionType: 'play_level',
        actionLevel: 1,
        rewardHint: 1
      };
    } else if (missionTypeIdx === 1) {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'beginner',
        type: 'level_clear',
        minLevel: 2,
        titleKey: 'daily.missions.beginnerLv2Title',
        descKey: 'daily.missions.beginnerLv2Desc',
        targetCount: 1,
        actionType: 'play_level',
        actionLevel: 2,
        rewardHint: 1
      };
    } else {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'beginner',
        type: 'play_battle',
        minLevel: 1,
        titleKey: 'daily.missions.battleTitle',
        descKey: 'daily.missions.battleDesc',
        targetCount: 1,
        actionType: 'open_battle',
        actionLevel: 1,
        rewardHint: 1
      };
    }
  } else if (tier === 'intermediate') {
    if (missionTypeIdx === 0) {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'intermediate',
        type: 'level_clear',
        minLevel: 3,
        titleKey: 'daily.missions.medLv3Title',
        descKey: 'daily.missions.medLv3Desc',
        targetCount: 1,
        actionType: 'play_level',
        actionLevel: 3,
        rewardHint: 1
      };
    } else if (missionTypeIdx === 1) {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'intermediate',
        type: 'speedrun',
        minLevel: 3,
        titleKey: 'daily.missions.speedrunTitle',
        descKey: 'daily.missions.speedrunDesc',
        targetCount: 1,
        actionType: 'play_speedrun',
        actionLevel: 3,
        rewardHint: 1
      };
    } else {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'intermediate',
        type: 'play_battle',
        minLevel: 3,
        titleKey: 'daily.missions.battleTitle',
        descKey: 'daily.missions.battleDesc',
        targetCount: 1,
        actionType: 'open_battle',
        actionLevel: 3,
        rewardHint: 1
      };
    }
  } else {
    // Advanced / Master Tier
    if (missionTypeIdx === 0) {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'advanced',
        type: 'level_clear',
        minLevel: 4,
        titleKey: 'daily.missions.advLv4Title',
        descKey: 'daily.missions.advLv4Desc',
        targetCount: 1,
        actionType: 'play_level',
        actionLevel: 4,
        rewardHint: 1
      };
    } else if (missionTypeIdx === 1) {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'advanced',
        type: 'expert_clear',
        minLevel: 5,
        titleKey: 'daily.missions.advLv5Title',
        descKey: 'daily.missions.advLv5Desc',
        targetCount: 1,
        actionType: 'play_level',
        actionLevel: 5,
        rewardHint: 1
      };
    } else {
      return {
        id: `mission_${dateKey}`,
        dateKey,
        tier: 'advanced',
        type: 'play_battle',
        minLevel: 4,
        titleKey: 'daily.missions.battleTitle',
        descKey: 'daily.missions.battleDesc',
        targetCount: 1,
        actionType: 'open_battle',
        actionLevel: 4,
        rewardHint: 1
      };
    }
  }
}

// The day's puzzle, seeded by the date so every player gets the same one.
// Of either kind since 2026-10-21 (KP-4, user 2026-10-07: one calendar, "통합"):
// the daily screen's switch picks standard or killer, the day's mission sets the
// level for both, and the killer generator is seeded the same way.
export function getDailyPuzzle(dateKey = getTodayDateKey(), variant = 'classic') {
  const mission = getDailyMission(dateKey);
  const targetLevel = mission.actionLevel || mission.minLevel || 3;
  const puzzleData = createPuzzle(variant, targetLevel, dateKey);
  return {
    ...puzzleData,
    dateKey,
    level: targetLevel,
    isDaily: true,
  };
}

// Load daily completion records
export function loadDailyRecords() {
  try {
    const data = localStorage.getItem(DAILY_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// Save completed daily challenge record. One per day whichever kind cleared it —
// the calendar is one (KP-4) — with the kind written down (variant).
// via: 'mission' when the day's mission finished it rather than its puzzle (D36) — the calendar
// then says why that day's puzzle no longer opens. Records written before have no `via`.
export function recordDailyCompletion(dateKey = getTodayDateKey(), timeSeconds = 0, mistakes = 0, variant = 'classic', via = 'puzzle') {
  const records = loadDailyRecords();
  records[dateKey] = {
    completed: true,
    timeSeconds,
    mistakes,
    variant,
    via: via === 'mission' ? 'mission' : 'puzzle',
    completedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save daily record:', e);
  }
  return records;
}

// Check if month badge is unlocked (requires 15+ completions in a month)
export function getMonthlyBadgeProgress(year, month) {
  const records = loadDailyRecords();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  
  let completedCount = 0;
  Object.keys(records).forEach(key => {
    if (key.startsWith(prefix) && records[key].completed) {
      completedCount++;
    }
  });

  const targetCount = 15;
  const isUnlocked = completedCount >= targetCount;

  return {
    completedCount,
    targetCount,
    isUnlocked,
  };
}
