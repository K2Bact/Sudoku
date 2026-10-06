import React from 'react';
import { Trophy, Award } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { ACHIEVEMENT_TIERS } from '../../data/achievementsData';

export function AchievementToast({ achievement }) {
  const { t } = useTranslation();
  if (!achievement) return null;

  const tierObj = ACHIEVEMENT_TIERS[achievement.tier?.toUpperCase()] || ACHIEVEMENT_TIERS.BRONZE;

  return (
    <div className="achievement-toast-floating">
      <div className="ach-toast-card">
        <div className="ach-toast-icon-wrap">
          <span className="ach-toast-emoji">{achievement.icon || '🏆'}</span>
        </div>
        <div className="ach-toast-text-col">
          <div className="ach-toast-header">
            <Trophy size={13} className="text-yellow" />
            <span className="ach-toast-badge-title">{t('achievements.unlockedToast')}</span>
          </div>
          <span className="ach-toast-title">{t(achievement.titleKey)}</span>
        </div>
        <div className="ach-toast-points-badge">
          <Award size={12} />
          <span><bdi dir="ltr">+{tierObj.points}</bdi></span>
        </div>
      </div>
    </div>
  );
}
