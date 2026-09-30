import React from 'react';
import { Swords, Bot, Calendar, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';

export function HomeBottomBanners({
  onOpenBattleMatch,
  onOpenAIBattle,
  onOpenDailyChallenge
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Row of 2 Cards: 1v1 Online Battle & AI Bot Battle */}
      <div className="home-dual-banner-row">
        {/* Card 2A: 1v1 Online Battle */}
        <div className="modern-game-card half-banner-card battle-card-banner" onClick={onOpenBattleMatch}>
          <span className="card-badge red-badge"><Swords size={11} /> ONLINE PVP</span>
          <h3>{t('home.modes.battle.title')}</h3>
          <p>{t('home.modes.battle.desc')}</p>
        </div>

        {/* Card 2B: AI Bot Battle */}
        <div className="modern-game-card half-banner-card ai-card-banner" onClick={onOpenAIBattle || onOpenBattleMatch}>
          <span className="card-badge purple-badge"><Bot size={11} /> {t('home.modes.aiBattle.badge')}</span>
          <h3>{t('home.modes.aiBattle.title')}</h3>
          <p>{t('home.modes.aiBattle.desc')}</p>
        </div>
      </div>

      {/* Card 3: Daily Challenge */}
      <div className="modern-game-card daily-card-banner" onClick={onOpenDailyChallenge}>
        <div className="daily-banner-content">
          <span className="card-badge yellow-badge"><Calendar size={12} /> {t('home.modes.daily.badge')}</span>
          <h3>{t('home.modes.daily.title')}</h3>
          <p>{t('home.modes.daily.desc')}</p>
        </div>
        <ChevronRight size={22} className="daily-arrow-icon" />
      </div>
    </>
  );
}
