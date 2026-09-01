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

  getMockRanks(category, subKey = 'lv3') {
    if (category === LEADERBOARD_CATEGORIES.BRAIN_IQ) {
      return [
        { rank: 1, name: 'S_Master_KR', score: 156, tier: 'Grand Master', flag: '🇰🇷' },
        { rank: 2, name: 'HexaLogic_JP', score: 152, tier: 'Grand Master', flag: '🇯🇵' },
        { rank: 3, name: 'EulerMind_US', score: 149, tier: 'Mensa Level', flag: '🇺🇸' },
        { rank: 4, name: 'QuantumSolve_TW', score: 145, tier: 'Mensa Level', flag: '🇹🇼' },
        { rank: 5, name: 'AlphaBrain_ES', score: 142, tier: 'Mensa Level', flag: '🇪🇸' },
        { rank: 6, name: 'NeoSudoku_99', score: 138, tier: 'Mensa Level', flag: '🌐' },
        { rank: 7, name: 'LogicRider_KR', score: 135, tier: 'Superior', flag: '🇰🇷' },
        { rank: 8, name: 'PuzzleZen_JP', score: 131, tier: 'Superior', flag: '🇯🇵' },
        { rank: 9, name: 'SmartGrid_US', score: 128, tier: 'Superior', flag: '🇺🇸' },
        { rank: 10, name: 'NovaTactics', score: 125, tier: 'Above Average', flag: '🌐' }
      ];
    }

    if (category === LEADERBOARD_CATEGORIES.PVP_MMR) {
      return [
        { rank: 1, name: 'DragonSolve', score: 2450, tier: 'Grand Master', flag: '🇰🇷' },
        { rank: 2, name: 'ApexLogic', score: 2380, tier: 'Grand Master', flag: '🇯🇵' },
        { rank: 3, name: 'FlashDigit', score: 2290, tier: 'Master', flag: '🇺🇸' },
        { rank: 4, name: 'ZeroMistake', score: 2180, tier: 'Master', flag: '🇹🇼' },
        { rank: 5, name: 'VortexPlayer', score: 2050, tier: 'Diamond', flag: '🇪🇸' },
        { rank: 6, name: 'GridHero_01', score: 1940, tier: 'Platinum', flag: '🌐' },
        { rank: 7, name: 'SwiftPencil', score: 1870, tier: 'Gold', flag: '🇰🇷' },
        { rank: 8, name: 'SpeedCell_9', score: 1760, tier: 'Silver', flag: '🇯🇵' }
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
    const names = [
      'FlashPencil', 'SpeedDemon_KR', 'RapidSudoku_JP', 'GridRunner_US',
      'LogicBlaze_TW', 'AeroSolver_ES', 'HyperGrid', 'NovaClick',
      'ZenMatrix', 'SwiftCell'
    ];
    const flags = ['🇰🇷', '🇯🇵', '🇺🇸', '🇹🇼', '🇪🇸', '🌐', '🇰🇷', '🇯🇵', '🇺🇸', '🌐'];

    return times.map((t, idx) => ({
      rank: idx + 1,
      name: names[idx] || `Solver_${idx + 1}`,
      score: t,
      flag: flags[idx] || '🌐',
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
      score = 1200;
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('suidoku_battle_profile_v1');
          if (raw) score = JSON.parse(raw).mmr || 1200;
        }
      } catch (_) {}
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
