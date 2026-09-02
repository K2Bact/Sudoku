import React, { useState } from 'react';
import { Swords, Users, ShieldCheck, Globe, Bot } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function BattleLobbyScreen({
  onBack,
  onStartQuickMatch,
  isSearching: isSearchingProp,
  onCancelSearch: onCancelSearchProp,
  matchTimedOut = false,
  onPlayAiInstead
}) {
  const { t } = useTranslation();
  const [internalSearching, setInternalSearching] = useState(false);
  const isSearching = isSearchingProp !== undefined ? isSearchingProp : internalSearching;

  // Calculate current user win rate for MMR matchmaking description
  const stats = loadStats();
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 50;

  const handleCancelSearch = () => {
    soundHaptic.playSelectSound();
    if (onCancelSearchProp) {
      onCancelSearchProp();
    } else {
      setInternalSearching(false);
    }
  };

  const handleQuickMatch = () => {
    soundHaptic.playSelectSound();
    if (isSearchingProp === undefined) {
      setInternalSearching(true);
    }
    // Real user 1v1 quick match
    onStartQuickMatch(3, () => {
      if (isSearchingProp === undefined) {
        setInternalSearching(false);
      }
    });
  };

  const handlePlayAi = () => {
    soundHaptic.playSelectSound();
    if (onPlayAiInstead) onPlayAiInstead(3);
  };

  return (
    <div className="battle-lobby-container">
      {/* Top Mobile App Navigation Bar */}
      <ScreenHeader
        title={t('battleLobby.title')}
        icon={Swords}
        iconColorClass="text-red"
        onBack={onBack}
      />

      {/* Main Full-Screen Scrollable Content Area */}
      <div className="screen-scroll-content">
        {matchTimedOut && !isSearching ? (
          /* The search ended with nobody on the other side. Say so and offer the
             AI match, instead of leaving the player staring at a radar forever. */
          <div className="match-searching-wrapper">
            <div className="match-radar-card" style={{ gap: '14px', padding: '22px 18px' }}>
              <div className="radar-status-badge">
                <Globe size={13} className="text-muted flex-shrink-0" />
                <span style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                  {t('battleLobby.noOpponentFound')}
                </span>
              </div>
              <button type="button" className="btn btn-primary w-100" onClick={handlePlayAi}>
                <Bot size={16} /> {t('battleLobby.playAiInstead')}
              </button>
              <button type="button" className="btn btn-secondary w-100" onClick={handleCancelSearch}>
                {t('common.close')}
              </button>
            </div>
          </div>
        ) : isSearching ? (
          <div className="match-searching-wrapper">
            <div className="match-radar-card">
              {/* Radar Live Status Tag */}
              <div className="radar-status-badge">
                <span className="radar-live-dot" />
                <Globe size={13} className="text-blue flex-shrink-0" />
                <span style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{t('battleLobby.searching')}</span>
              </div>

              {/* Glowing Sonar Radar Waves */}
              <div className="radar-visual-arena">
                <div className="radar-sonar-ring ring-3" />
                <div className="radar-sonar-ring ring-2" />
                <div className="radar-sonar-ring ring-1" />
                <div className="radar-core-badge">
                  <Swords size={32} className="radar-swords-icon" />
                </div>
              </div>

              {/* Informational Matching Card */}
              <div className="radar-details-box">
                <h3 className="radar-headline">{t('battleLobby.autoMatchTitle')}</h3>
                <p className="radar-subtext">{t('battleLobby.autoMatchDesc')}</p>
                <div className="mmr-info-badge radar-mmr-badge">
                  <ShieldCheck size={16} className="text-blue flex-shrink-0" />
                  <span className="mmr-badge-text">{t('battleLobby.mmrBadge', { rate: winRate })}</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                className="btn-modern btn-resume btn-block radar-cancel-btn"
                onClick={handleCancelSearch}
              >
                <span>{t('battleLobby.cancelBtn')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="match-options-mobile-group">
            {/* Quick Match against Real Users (Win-Rate / MMR Based) */}
            <div className="battle-mode-card primary-battle-card">
              <div className="card-header">
                <Users size={26} className="text-blue" />
                <div>
                  <h4>{t('battleLobby.autoMatchTitle')}</h4>
                  <p>{t('battleLobby.autoMatchDesc')}</p>
                </div>
              </div>

              <div className="mmr-info-badge">
                <ShieldCheck size={16} className="text-blue flex-shrink-0" />
                <span className="mmr-badge-text">{t('battleLobby.mmrBadge', { rate: winRate })}</span>
              </div>

              <button
                type="button"
                className="btn-modern btn-play-new btn-block mt-3"
                onClick={handleQuickMatch}
              >
                <Swords size={18} />
                <span>{t('battleLobby.findOpponentBtn')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
