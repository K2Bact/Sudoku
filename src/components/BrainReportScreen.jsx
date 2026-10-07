import React, { useState, useEffect } from 'react';
import { Brain, Share2, Zap, Target, Shield, Eye, Award, Trophy, Gamepad2 } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';
import { iqStatsService, combinedRecord } from '../services/iqStatsService';
import { useTranslation } from '../i18n/i18nContext';
import { shareContent } from '../utils/nativeShare';
import { playGamesService } from '../services/playGamesService';
import { connectPlayGames } from '../utils/playGamesBridge';

export function BrainReportScreen({ onBack }) {
  const { t } = useTranslation();
  const [shareToast, setShareToast] = useState(null);
  // The world ranking is the Logic Score ranking, so it sits next to the score.
  // Play Games owns it; this screen can only open Google's own view of it.
  const [signedIn, setSignedIn] = useState(() => playGamesService.isNative() && playGamesService.isAuthenticated);
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    const onSignedIn = () => setSignedIn(playGamesService.isNative() && playGamesService.isAuthenticated);
    window.addEventListener('playGamesSignedIn', onSignedIn);
    return () => window.removeEventListener('playGamesSignedIn', onSignedIn);
  }, []);

  const handleOpenRanking = async () => {
    soundHaptic.playSelectSound();
    const res = await playGamesService.showLeaderboards();
    if (!res.success) setSignedIn(false);
  };

  const handleConnect = async () => {
    if (connecting) return;
    soundHaptic.playSelectSound();
    setConnecting(true);
    const ok = await connectPlayGames();
    setConnecting(false);
    if (ok) setSignedIn(true);
    else {
      setShareToast(t('cloudSync.playGamesFailed'));
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const stats = loadStats();
  // Both kinds, as the Logic Score above them counts both (iqStatsService combinedRecord).
  const { gamesPlayed: played, gamesWon: won } = combinedRecord(stats);
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  // Calculate Mental Agility Index (Brain Score)
  const brainIQ = iqStatsService.calculateBrainIQ(stats);
  const report = iqStatsService.getPercentileReport(brainIQ);

  const tierTitle = report.tierKey
    ? (t(`brainReport.tiers.${report.tierKey}`) || t(`tiers.${report.tierKey}.title`) || report.tierTitle)
    : report.tierTitle;
  const tierDesc = report.tierKey
    ? (t(`brainReport.tiers.${report.tierKey}Desc`) || t(`tiers.${report.tierKey}.desc`) || report.tierDescription)
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
    // The share line carries the score and the tier. It used to add "Top X% of
    // players", which was this score on a fixed curve, not a place among players.
    const text = t('brainReport.shareText', {
      iq: report.iqScore,
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
          {/* The tier sits beside the ring, not under it (user, 2026-10-07). */}
          <div className="iq-hero-row">
            <div className="iq-circle">
              <span className="iq-label">{t('brainReport.scoreLabel')}</span>
              <span className="iq-number">{report.iqScore}</span>
            </div>
            <div className="tier-badge-pill">
              <Award size={14} className="text-yellow inline-icon" />
              <span className="tier-title fw-bold">{tierTitle}</span>
            </div>
          </div>
          <p className="iq-desc text-muted mt-2">{tierDesc}</p>
          {/* What moves the score — the ranking uses it, so the player should be able to
              find out without guessing (user, 2026-09-19). */}
          <details className="score-how" style={{ marginTop: '10px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
              {t('brainReport.scoreHowTitle')}
            </summary>
            <p style={{ margin: '8px 0 0', fontSize: '12.5px', lineHeight: 1.55, color: 'var(--text-muted)' }}>
              {t('brainReport.scoreHowBody')}
            </p>
          </details>
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

        {/* World ranking — Play Games only (the totals live on the Stats screen) */}
        <div className="stats-card world-ranking-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {signedIn ? (
            <button type="button" className="btn-modern btn-block" onClick={handleOpenRanking}>
              <Trophy size={16} />
              <span>{t('leaderboard.openPlayGames')}</span>
            </button>
          ) : (
            <>
              <button type="button" className="btn-modern btn-block" onClick={handleConnect} disabled={connecting}>
                <Gamepad2 size={16} />
                <span>{t('cloudSync.playGamesConnect')}</span>
              </button>
              <p className="text-muted" style={{ margin: '8px 0 0', fontSize: '12px', textAlign: 'center' }}>
                {t('cloudSync.playGamesConnectDesc')}
              </p>
            </>
          )}
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
