import React, { useState } from 'react';
import { Brain, Share2, Zap, Target, Shield, Eye, Award } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';
import { iqStatsService } from '../services/iqStatsService';
import { useTranslation } from '../i18n/i18nContext';
import { shareContent } from '../utils/nativeShare';

export function BrainReportScreen({ onBack }) {
  const { t } = useTranslation();
  const [shareToast, setShareToast] = useState(null);
  const stats = loadStats();
  const played = stats.gamesPlayed || 0;
  const won = stats.gamesWon || 0;
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  // Calculate Mental Agility Index (Brain Score)
  const brainIQ = iqStatsService.calculateBrainIQ(stats);
  const report = iqStatsService.getPercentileReport(brainIQ);

  const tierTitle = report.tierKey
    ? (t(`brainReport.tiers.${report.tierKey}`) || t(`tiers.${report.tierKey}.title`) || report.tierTitle)
    : report.tierTitle;
  const tierDesc = report.tierKey
    ? (t(`brainReport.tiers.${report.tierKey}Desc`, { percentile: report.topPercentile }) || t(`tiers.${report.tierKey}.desc`, { percentile: report.topPercentile }) || report.tierDescription)
    : report.tierDescription;

  // Every sub-score is computed from recorded play. See calculateCognitiveProfile.
  const profile = iqStatsService.calculateCognitiveProfile(stats);
  const attributes = [
    { label: t('brainReport.speed'), val: `${profile.speed}/100`, icon: <Zap size={18} className="text-yellow" /> },
    { label: t('brainReport.logic'), val: `${profile.logic}/100`, icon: <Brain size={18} className="text-purple" /> },
    { label: t('brainReport.accuracy'), val: `${winRate}%`, icon: <Target size={18} className="text-red" /> },
    { label: t('brainReport.durability'), val: `${profile.endurance}/100`, icon: <Shield size={18} className="text-green" /> },
    { label: t('brainReport.focus'), val: `${profile.focus}/100`, icon: <Eye size={18} className="text-blue" /> }
  ];

  const handleShareIQ = async () => {
    soundHaptic.playSelectSound();
    const percentileText = `${t('brainReport.percentilePrefix')}${report.topPercentile}%`;
    const text = t('brainReport.shareText', {
      iq: report.iqScore,
      percentile: percentileText,
      tier: tierDesc
    });
    const res = await shareContent({
      title: t('brainReport.shareTitle'),
      text,
      dialogTitle: t('brainReport.shareTitle')
    });
    if (res.method === 'clipboard') {
      setShareToast(t('brainReport.copiedToast'));
      setTimeout(() => setShareToast(null), 2500);
    } else if (res.method === 'none') {
      // Every share path failed. Say so — silence reads as a dead button.
      setShareToast(t('common.shareUnavailable'));
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  return (
    <div className="brain-screen-container">
      {/* Top Mobile App Navigation Bar */}
      <ScreenHeader
        title={t('brainReport.title')}
        icon={Brain}
        iconColorClass="text-purple"
        onBack={onBack}
      />

      {/* Main Full-Screen Scrollable Content Area */}
      <div className="screen-scroll-content">
        {/* IQ Hero Ring */}
        <div className="brain-iq-hero text-center">
          <div className="iq-circle mx-auto">
            <span className="iq-label">Sudoku IQ</span>
            <span className="iq-number">{report.iqScore}</span>
          </div>
          <div className="tier-badge-pill mt-3">
            <Award size={14} className="text-yellow inline-icon" />
            <span className="tier-title fw-bold">{tierTitle}</span>
          </div>
          <p className="iq-desc text-muted mt-2">{tierDesc}</p>
        </div>

        {/* Attributes Breakdown List */}
        <div className="stats-card">
          <h4 className="fw-bold mb-3">{t('brainReport.attributesTitle')}</h4>
          <div className="attributes-list">
            {attributes.map((attr, idx) => (
              <div key={idx} className="attribute-row">
                <div className="attr-name">
                  {attr.icon}
                  <span>{attr.label}</span>
                </div>
                <span className="attr-val fw-bold">{attr.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="stats-card">
          <h4 className="fw-bold mb-3">{t('brainReport.overallStats')}</h4>
          <div className="stats-summary-bar">
            <div>
              <span className="lbl">{t('brainReport.totalPlayed')}</span>
              <span className="val fw-bold">{played}</span>
            </div>
            <div>
              <span className="lbl">{t('brainReport.totalWon')}</span>
              <span className="val fw-bold">{won}</span>
            </div>
            <div>
              <span className="lbl">{t('brainReport.winRate')}</span>
              <span className="val fw-bold">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <button type="button" className="btn-modern btn-play-new btn-block mt-2" onClick={handleShareIQ}>
          <Share2 size={18} />
          <span>{t('brainReport.shareCardBtn')}</span>
        </button>

        {shareToast && (
          <div className="theme-toast-banner" style={{ top: 'auto', bottom: '80px' }}>
            {shareToast}
          </div>
        )}
      </div>
    </div>
  );
}
