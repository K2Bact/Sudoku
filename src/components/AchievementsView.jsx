import React, { useState } from 'react';
import { Trophy, Lock, CheckCircle2, Award } from 'lucide-react';
import { ACHIEVEMENTS_LIST, ACHIEVEMENT_TIERS } from '../data/achievementsData.js';
import { loadUnlockedAchievements } from '../utils/achievementManager.js';
import { useTranslation } from '../i18n/i18nContext';
import { soundHaptic } from '../utils/soundHaptic';

export function AchievementsView() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const unlockedMap = loadUnlockedAchievements();

  const totalCount = ACHIEVEMENTS_LIST.length;
  const unlockedCount = Object.keys(unlockedMap).length;
  const pct = Math.round((unlockedCount / totalCount) * 100);

  // Calculate total trophy score
  const totalPoints = ACHIEVEMENTS_LIST.reduce((acc, ach) => {
    if (unlockedMap[ach.id]) {
      const tierObj = ACHIEVEMENT_TIERS[ach.tier?.toUpperCase()] || ACHIEVEMENT_TIERS.BRONZE;
      return acc + (tierObj.points || 10);
    }
    return acc;
  }, 0);

  const categories = [
    { id: 'all', label: t('achievements.categories.all') },
    { id: 'progression', label: t('achievements.categories.progression') },
    { id: 'logic', label: t('achievements.categories.logic') },
    { id: 'speed', label: t('achievements.categories.speed') },
    { id: 'difficulty', label: t('achievements.categories.difficulty') },
    { id: 'special', label: t('achievements.categories.special') }
  ];

  const filteredList = selectedCategory === 'all'
    ? ACHIEVEMENTS_LIST
    : ACHIEVEMENTS_LIST.filter((a) => a.category === selectedCategory);

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="achievements-view-wrapper">
      {/* 1. Header Trophy Score Hero Card */}
      <div className="stats-card achievement-hero-card">
        <div className="hero-top-row">
          <div className="trophy-badge-wrap">
            <Trophy size={28} className="trophy-icon" />
          </div>
          <div className="hero-text-col">
            <h3 className="hero-title">{t('achievements.tabTitle')}</h3>
            <span className="hero-progress-text">
              {t('achievements.unlockedCount', { unlocked: unlockedCount, total: totalCount, pct })}
            </span>
          </div>
          <div className="points-pill">
            <Award size={14} />
            <span>{totalPoints} pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="ach-progress-track">
          <div className="ach-progress-bar" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="ach-category-pills">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              soundHaptic.playSelectSound();
              setSelectedCategory(cat.id);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. 30 Achievements Cards List */}
      <div className="ach-cards-list">
        {filteredList.map((ach) => {
          const isUnlocked = Boolean(unlockedMap[ach.id]);
          const unlockInfo = unlockedMap[ach.id];
          const tierObj = ACHIEVEMENT_TIERS[ach.tier?.toUpperCase()] || ACHIEVEMENT_TIERS.BRONZE;

          return (
            <div
              key={ach.id}
              className={`ach-card ${isUnlocked ? 'unlocked' : 'locked'} tier-${ach.tier}`}
            >
              <div className="ach-card-icon-col">
                <div className="ach-icon-box">
                  {isUnlocked ? (
                    <span className="ach-emoji">{ach.icon}</span>
                  ) : (
                    <Lock size={22} className="lock-icon" />
                  )}
                </div>
              </div>

              <div className="ach-card-info-col">
                <div className="ach-title-row">
                  <h4 className="ach-title">{t(ach.titleKey)}</h4>
                  <span className={`ach-tier-tag ${ach.tier}`}>
                    {tierObj.label} (+{tierObj.points})
                  </span>
                </div>
                <p className="ach-desc">{t(ach.descKey)}</p>

                <div className="ach-status-footer">
                  {isUnlocked ? (
                    <span className="ach-unlocked-badge">
                      <CheckCircle2 size={12} />
                      {t('achievements.unlockedAt', { date: formatDate(unlockInfo?.unlockedAt) })}
                    </span>
                  ) : (
                    <span className="ach-locked-badge">
                      {t('achievements.lockedBadge')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
