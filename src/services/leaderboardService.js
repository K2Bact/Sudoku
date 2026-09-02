/**
 * leaderboardService.js
 * In-App Global Leaderboard & Real-Time Ranked Ranking Engine.
 * 
 * Provides:
 * 1. Classic Speedrun Leaderboard (Classic Lv.1~Lv.5)
 * 2. Time Attack Speedrun Leaderboard (Time Attack Lv.1~Lv.5)
 * 3. Global Brain IQ Leaderboard (Top % and Mensa Tier)
 * 4. 1v1 PvP MMR Leaderboard
 */

import { loadStats, getPlayGamesUser } from '../utils/storage.js';
import { iqStatsService } from './iqStatsService.js';
import { loadBattleProfile } from '../utils/battleRating.js';

// Language-neutral percentile thresholds, so no translation is needed and no row
// can be mistaken for another human being.
const PERCENTILE_LABELS = [
  'TOP 0.1%', 'TOP 0.5%', 'TOP 1%', 'TOP 3%', 'TOP 5%',
  'TOP 10%', 'TOP 20%', 'TOP 30%', 'TOP 40%', 'TOP 50%'
];

export const LEADERBOARD_CATEGORIES = {
  SPEEDRUN_CLASSIC: 'speedrun_classic',
  SPEEDRUN_TIME_ATTACK: 'speedrun_time_attack',
  BRAIN_IQ: 'brain_iq',
  PVP_MMR: 'pvp_mmr'
};

class LeaderboardService {
  getEffectivePlayerName() {
    try {
      const playUser = getPlayGamesUser();
      if (playUser && (playUser.displayName || playUser.name)) {
        return playUser.displayName || playUser.name;
      }
      const uid = iqStatsService.getOrCreateAnonUid();
      return `Guest_${uid.slice(-4).toUpperCase()}`;
    } catch {
      return 'Guest_77';
    }
  }

  getEffectivePlayerFlag() {
    try {
      const lang = (typeof navigator !== 'undefined' ? (navigator.language || '') : '').toLowerCase();
      if (lang.startsWith('ko')) return '🇰🇷';
      if (lang.startsWith('ja')) return '🇯🇵';
      if (lang.startsWith('zh')) return '🇹🇼';
      if (lang.startsWith('es')) return '🇪🇸';
      if (lang.startsWith('en')) return '🇺🇸';
      return '🌐';
    } catch {
      return '🌐';
    }
  }

  /**
   * Benchmark rows the player measures themselves against.
   *
   * These used to carry invented player names ('S_Master_KR', 'DragonSolve', …)
   * and country flags, presented under a "Global Hall of Fame" heading — players
   * had no way to tell they were reading fiction. They are now labelled as the
   * percentile thresholds they always were. Real global ranking comes from the
   * Play Games leaderboard, which is one tap away in the UI.
   */
  getMockRanks(category, subKey = 'lv3') {
    if (category === LEADERBOARD_CATEGORIES.BRAIN_IQ) {
      return [
        { rank: 1, name: PERCENTILE_LABELS[0], score: 156, tier: 'Grand Master', isBenchmark: true },
        { rank: 2, name: PERCENTILE_LABELS[1], score: 152, tier: 'Grand Master', isBenchmark: true },
        { rank: 3, name: PERCENTILE_LABELS[2], score: 149, tier: 'Mensa Level', isBenchmark: true },
        { rank: 4, name: PERCENTILE_LABELS[3], score: 145, tier: 'Mensa Level', isBenchmark: true },
        { rank: 5, name: PERCENTILE_LABELS[4], score: 142, tier: 'Mensa Level', isBenchmark: true },
        { rank: 6, name: PERCENTILE_LABELS[5], score: 138, tier: 'Mensa Level', isBenchmark: true },
        { rank: 7, name: PERCENTILE_LABELS[6], score: 135, tier: 'Superior', isBenchmark: true },
        { rank: 8, name: PERCENTILE_LABELS[7], score: 131, tier: 'Superior', isBenchmark: true },
        { rank: 9, name: PERCENTILE_LABELS[8], score: 128, tier: 'Superior', isBenchmark: true },
        { rank: 10, name: PERCENTILE_LABELS[9], score: 125, tier: 'Above Average', isBenchmark: true }
      ];
    }

    if (category === LEADERBOARD_CATEGORIES.PVP_MMR) {
      return [
        { rank: 1, name: PERCENTILE_LABELS[0], score: 2450, tier: 'Grand Master', isBenchmark: true },
        { rank: 2, name: PERCENTILE_LABELS[1], score: 2380, tier: 'Grand Master', isBenchmark: true },
        { rank: 3, name: PERCENTILE_LABELS[2], score: 2290, tier: 'Master', isBenchmark: true },
        { rank: 4, name: PERCENTILE_LABELS[3], score: 2180, tier: 'Master', isBenchmark: true },
        { rank: 5, name: PERCENTILE_LABELS[4], score: 2050, tier: 'Diamond', isBenchmark: true },
        { rank: 6, name: PERCENTILE_LABELS[5], score: 1940, tier: 'Platinum', isBenchmark: true },
        { rank: 7, name: PERCENTILE_LABELS[6], score: 1870, tier: 'Gold', isBenchmark: true },
        { rank: 8, name: PERCENTILE_LABELS[7], score: 1760, tier: 'Silver', isBenchmark: true }
      ];
    }

    // Speedrun times in seconds based on level
    const baseTimes = {
      lv1: [48, 52, 59, 64, 71, 79, 85, 92, 105, 118],
      lv2: [85, 92, 104, 115, 126, 138, 149, 160, 175, 190],
      lv3: [142, 155, 168, 182, 195, 210, 225, 240, 260, 285],
      lv4: [220, 238, 255, 275, 298, 320, 345, 370, 400, 435],
      lv5: [340, 365, 395, 420, 455, 490, 530, 570, 620, 680]
    };

    const times = baseTimes[subKey] || baseTimes.lv3;

    return times.map((t, idx) => ({
      rank: idx + 1,
      name: PERCENTILE_LABELS[idx],
      score: t,
      isBenchmark: true,
      isTime: true
    }));
  }

  /**
   * Fetch Top Ranks for selected category and level subKey with dynamic sorting
   */
  async fetchTopRanks(category, subKey = 'lv3') {
    const mockList = this.getMockRanks(category, subKey);
    const myRank = this.getMyRank(category, subKey);

    if (!myRank.score) {
      return mockList.slice(0, 10);
    }

    const isTimeMode = (category === LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC || category === LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK);

    // Create user entry
    const userEntry = {
      name: `${myRank.cleanName} (Me)`,
      score: myRank.score,
      flag: this.getEffectivePlayerFlag(),
      isMe: true,
      isTime: isTimeMode,
      tier: myRank.tier
    };

    // Combine mock list and user entry for unified dynamic ranking
    const combined = [...mockList, userEntry];

    // Sort: lower is better for time, higher is better for points/IQ/MMR
    combined.sort((a, b) => (isTimeMode ? a.score - b.score : b.score - a.score));

    // Assign dynamic ranks with tie support
    let currentRank = 1;
    for (let i = 0; i < combined.length; i++) {
      if (i > 0) {
        const prev = combined[i - 1];
        if (combined[i].score !== prev.score) {
          currentRank = i + 1;
        }
      }
      combined[i].rank = currentRank;
    }

    // If user is inside top 10 (or top 11 tied), show top 10 list including user
    const userIdx = combined.findIndex((item) => item.isMe);
    if (userIdx !== -1 && combined[userIdx].rank <= 10) {
      return combined.slice(0, 10);
    }

    // If user is outside top 10, return top 10 + user entry at bottom
    const top10 = combined.filter((item) => !item.isMe).slice(0, 10);
    top10.push(combined[userIdx]);
    return top10;
  }

  /**
   * Calculate player's local rank and percentile dynamically
   */
  getMyRank(category, subKey = 'lv3') {
    const myName = this.getEffectivePlayerName();
    const stats = loadStats();
    const mockList = this.getMockRanks(category, subKey);
    const isTimeMode = (category === LEADERBOARD_CATEGORIES.SPEEDRUN_CLASSIC || category === LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK);

    let score = null;
    let tier = 'Unranked';

    if (category === LEADERBOARD_CATEGORIES.BRAIN_IQ) {
      score = iqStatsService.calculateBrainIQ(stats);
      const report = iqStatsService.getPercentileReport(score);
      tier = report.tierTitle;
    } else if (category === LEADERBOARD_CATEGORIES.PVP_MMR) {
      // Reads the profile battleRating.js maintains. This used to inline the key
      // string and nothing ever wrote it, so every player showed a flat 1200.
      score = loadBattleProfile().mmr;
      tier = score > 2000 ? 'Master' : score > 1500 ? 'Gold' : 'Silver';
    } else {
      // Speedrun times: Classic vs Time Attack isolation
      const levelNum = Number(subKey.replace('lv', '')) || 3;
      const isTa = category === LEADERBOARD_CATEGORIES.SPEEDRUN_TIME_ATTACK;
      const bestTimes = isTa ? (stats.timeAttackBestTimes || {}) : (stats.bestTimes || {});
      score = bestTimes[levelNum] || null;
    }

    if (score === null || score === undefined) {
      return {
        name: `${myName} (Me)`,
        cleanName: myName,
        score: null,
        rank: '-',
        percentile: '--',
        tier: 'Unranked'
      };
    }

    // Dynamic Rank Computation against Leaderboard
    let betterCount = 0;
    for (const mock of mockList) {
      if (isTimeMode) {
        if (mock.score < score) betterCount++;
      } else {
        if (mock.score > score) betterCount++;
      }
    }

    const calculatedRank = betterCount + 1;
    let percentile = 'Top 50%';

    if (calculatedRank === 1) percentile = 'Top 0.1%';
    else if (calculatedRank === 2) percentile = 'Top 0.5%';
    else if (calculatedRank === 3) percentile = 'Top 1%';
    else if (calculatedRank <= 10) percentile = `Top ${calculatedRank}%`;
    else percentile = `Top ${Math.min(95, calculatedRank * 2)}%`;

    return {
      name: `${myName} (Me)`,
      cleanName: myName,
      score,
      rank: calculatedRank,
      percentile,
      tier,
      isTime: isTimeMode
    };
  }
}

export const leaderboardService = new LeaderboardService();
