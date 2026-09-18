import React from 'react';
import { Brain, Award } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';

export function HomeHeroCard({ iqReport, won }) {
  const { t } = useTranslation();
  const tierName = t(`brainReport.tiers.${iqReport.tierKey}`) || iqReport.tierTitle;

  return (
    <div className="home-hero-card">
      <div className="hero-left">
        <span className="hero-tag"><Brain size={12} /> {t('home.brainReportTitle')}</span>
        <h2 className="hero-iq">Sudoku IQ {iqReport.iqScore}</h2>
        <div className="hero-stats-line">
          <span>{t('home.brainPercentileShort', { won })}</span>
        </div>
        <div className="hero-tier-pill">
          {tierName}
        </div>
      </div>
      <div className="hero-right">
        <div className="iq-ring-graphic">
          <Award size={28} className="text-yellow" />
        </div>
      </div>
    </div>
  );
}
