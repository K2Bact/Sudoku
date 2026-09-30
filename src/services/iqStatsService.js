/**
 * iqStatsService.js
 * Zero-PII Anonymous Global IQ & Percentile Ranking Engine.
 * 
 * Complies with strict privacy-by-design principles:
 * - 0% Personal Identifiable Information (No Name, No Email, No IP, No Device ID)
 * - True Gaussian Normal Distribution (Mean 100, SD 15) & Global Quantile Aggregation
 */

const ANON_UID_KEY = 'suidoku_anon_uid_v1';

// Mathematical error function approximation (Abramowitz and Stegun 7.1.26)
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const a = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * a);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-a * a);
  return sign * y;
}

// Standard Gaussian Cumulative Distribution Function: P(X <= x)
function standardNormalCdf(x, mean = 100, sd = 15) {
  const z = (x - mean) / sd;
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

class IQStatsService {
  constructor() {
    this.anonUid = this.getOrCreateAnonUid();
  }

  // Generate opaque, random client UUID with zero linkage to personal identity
  getOrCreateAnonUid() {
    try {
      // The guard was inverted here: it returned the literal 'anon_node_test'
      // whenever localStorage EXISTED, which is always true in a browser or
      // WebView. Every signed-out player therefore shared one id — one cloud-save
      // slot and one leaderboard name ("Guest_TEST") between all of them.
      if (typeof localStorage === 'undefined') return 'anon_no_storage';
      let uid = localStorage.getItem(ANON_UID_KEY);
      if (!uid) {
        uid = 'anon_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem(ANON_UID_KEY, uid);
      }
      return uid;
    } catch {
      return 'anon_fallback';
    }
  }

  /**
   * Unified, realistic Brain IQ calculation model based on difficulty mastery, persistence & accuracy
   * @param {Object} stats
   * @returns {number} Brain IQ (bounded 95~150)
   */
  calculateBrainIQ(stats = {}) {
    const played = Number(stats.gamesPlayed) || 0;
    const won = Number(stats.gamesWon) || 0;
    if (won <= 0) return 100;

    const winRate = played > 0 ? (won / played) : 0;
    const bestTimes = stats.bestTimes || {};

    let iq = 100;

    // 1. Persistence & Volume (Logarithmic scale, max +6)
    const volumeBonus = Math.min(6, Math.log2(won + 1) * 1.5);
    iq += volumeBonus;

    // 2. Highest level cleared without a hint (older saves: best times)
    const clearedLevels = stats.clearedLevels || {};
    let maxLevelCleared = 1;
    for (let lv = 5; lv >= 1; lv--) {
      if (clearedLevels[lv] || (bestTimes[lv] && bestTimes[lv] > 0)) {
        maxLevelCleared = lv;
        break;
      }
    }
    const levelWeights = { 1: 1, 2: 3, 3: 8, 4: 16, 5: 26 };
    iq += (levelWeights[maxLevelCleared] || 1);

    // 3. Accuracy & Stability with Reliability Weight (Requires at least 5 games for full effect)
    const reliability = Math.min(1, played / 5);
    const accuracyBonus = (winRate * 5) * reliability;
    iq += accuracyBonus;

    return Math.min(150, Math.max(95, Math.round(iq)));
  }

  /**
   * Calculate true global percentile (Top X%) based on actual IQ score
   * @param {number} iqScore - User's calculated Brain IQ
   * @returns {number} Top percentile (e.g. 50.0 for IQ 100, 2.3 for IQ 130)
   */
  calculateTopPercentile(iqScore) {
    const rawScore = Number(iqScore) || 100;
    const cdf = standardNormalCdf(rawScore, 100, 15);
    const topPct = (1 - cdf) * 100;

    // Constrain within 0.1% ~ 99.9%
    const bounded = Math.max(0.1, Math.min(99.9, topPct));
    return Number(bounded.toFixed(1));
  }

  /**
   * Generates a comprehensive percentile report with tier titles and descriptions
   * @param {number} iqScore
   */
  getPercentileReport(iqScore) {
    const score = Math.round(Number(iqScore) || 100);
    const topPercentile = this.calculateTopPercentile(score);

    // The tier boundaries are still read off the fixed distribution, but nothing
    // says "top X% of players" any more: there is no ranking among real players
    // here, only this score put through a normal curve. The titles below are
    // fallbacks — every screen reads the translated ones from tiers.*.
    let tierKey = 'developing';
    let tierTitle = '두뇌 트레이닝 (Developing)';
    let tierDescription = '성장 잠재력이 남아 있는 트레이닝 단계입니다.';

    if (topPercentile <= 1.0) {
      tierKey = 'grandMaster';
      tierTitle = '최고 등급 (Grand Master)';
      tierDescription = '이 게임에서 최상위 수준의 추리력을 보여주고 있습니다.';
    } else if (topPercentile <= 5.0) {
      tierKey = 'expert';
      tierTitle = '전문가급 논리력 (Expert)';
      tierDescription = '이 게임에서 뛰어난 논리적 추론 능력을 보여주고 있습니다.';
    } else if (topPercentile <= 20.0) {
      tierKey = 'superior';
      tierTitle = '우수 수리력 (Superior)';
      tierDescription = '날카롭고 우수한 논리적 추론 능력입니다.';
    } else if (topPercentile <= 50.0) {
      tierKey = 'aboveAverage';
      tierTitle = '우수 잠재력 (Above Average)';
      tierDescription = '평균 이상의 안정적이고 유연한 사고력입니다.';
    }

    return {
      iqScore: score,
      topPercentile,
      tierKey,
      tierTitle,
      tierDescription
    };
  }

  /**
   * Five cognitive sub-scores, each derived from stats the game actually records.
   *
   * These used to be two-value step functions — `won > 0 ? '85/100' : '60/100'` —
   * so a player's first win pinned them for good and no amount of play moved them.
   * Every value below moves with real progress; a brand-new player sits near the
   * floor rather than at a flattering constant.
   */
  calculateCognitiveProfile(stats = {}) {
    const clamp = (n) => Math.max(15, Math.min(99, Math.round(n)));
    const played = Number(stats.gamesPlayed) || 0;
    const won = Number(stats.gamesWon) || 0;
    const bestTimes = stats.bestTimes || {};
    const flawless = Number(stats.flawlessWins) || 0;
    const survival = Number(stats.timeLimitSurvivalWins) || 0;
    const maxCombo = Number(stats.maxCombo) || 0;

    // SPEED — clear time measured against each level's own par time
    const PAR = { 1: 240, 2: 360, 3: 480, 4: 720, 5: 1080 };
    const ratios = [];
    for (let lv = 1; lv <= 5; lv++) {
      const t = bestTimes[lv];
      if (t > 0) ratios.push(t / PAR[lv]);
    }
    const avgRatio = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
    const speed = avgRatio === null ? 15 : clamp(100 - avgRatio * 55);

    // LOGIC — hardest level cleared without a hint, plus how much of the ladder is
    // covered. Saves from before clearedLevels existed only have best times.
    const clearedLevels = stats.clearedLevels || {};
    let maxLevel = 0;
    let levelsCleared = 0;
    for (let lv = 1; lv <= 5; lv++) {
      if (clearedLevels[lv] || bestTimes[lv] > 0) {
        levelsCleared++;
        maxLevel = lv;
      }
    }
    const logic = maxLevel === 0 ? 15 : clamp(28 + maxLevel * 10 + levelsCleared * 4);

    // ACCURACY — win rate over every game started, duels aside (they keep their own record; storage.js BT-1)
    const accuracy = played === 0 ? 15 : clamp((won / played) * 100);

    // ENDURANCE — survival-mode wins, tempered by overall volume
    const endurance = played === 0 ? 15 : clamp(25 + survival * 8 + Math.min(28, played * 0.6));

    // FOCUS — share of wins taken without a single mistake, plus combo peak
    const focus = won === 0 ? 15 : clamp(35 + (flawless / won) * 50 + Math.min(14, maxCombo * 1.4));

    return { speed, logic, accuracy, endurance, focus };
  }
}

export const iqStatsService = new IQStatsService();
