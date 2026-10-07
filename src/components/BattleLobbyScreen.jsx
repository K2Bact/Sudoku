import React, { useState, useEffect } from 'react';
import { Swords, Users, ShieldCheck, Globe, Bot, RotateCcw } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadStats } from '../utils/storage';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { sharesMoves } from '../firebase/replayExchange';

export function BattleLobbyScreen({
  onOpen,
  onBack,
  onStartQuickMatch,
  isSearching: isSearchingProp,
  onCancelSearch: onCancelSearchProp,
  matchTimedOut = false,
  matchUnavailable = false,
  onPlayAiInstead
}) {
  const { t } = useTranslation();
  const [internalSearching, setInternalSearching] = useState(false);

  // Opening this screen is the player saying they want 1v1, so this is where the
  // network connection is worth making — not at app start, where it cost every
  // player an anonymous account they never used (SudokuDiary ㊷).
  useEffect(() => { if (onOpen) onOpen(); }, [onOpen]);
  const isSearching = isSearchingProp !== undefined ? isSearchingProp : internalSearching;

  // The player's own clear rate across all games. It is not used for matching —
  // matching pairs players by puzzle level only — so the badge says what it is and
  // no longer calls itself skill-based. With no games played there is no rate; it
  // used to show 50% as if that were a record.
  const stats = loadStats();
  const clearRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : null;

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

  // No level here on purpose. This opens the AI lobby, where the player picks
  // one of the five; passing a number from this screen is what pinned every
  // fallback match to Lv.3.
  const handlePlayAi = () => {
    soundHaptic.playSelectSound();
    if (onPlayAiInstead) onPlayAiInstead();
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
        {(matchTimedOut || matchUnavailable) && !isSearching ? (
          /* The search ended with nobody on the other side — or could not start,
             because this phone never reached the server (BT-2). Say which, and
             offer the AI match, which needs no connection. */
          <div className="match-searching-wrapper">
            <div className="match-radar-card" style={{ gap: '14px', padding: '22px 18px' }}>
              <div className="radar-status-badge">
                <Globe size={13} className="text-muted flex-shrink-0" />
                {/* overflowWrap 'anywhere', not 'break-word': keep-all turns a Japanese
                    sentence (no spaces) into one unbreakable run, and break-word does not
                    lower the min-content width, so the run pushed 21px past the pill at 360px
                    (red team 2026-09-29). 'anywhere' breaks inside it only when it must. */}
                <span style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                  {matchUnavailable ? t('battleLobby.connectFailed') : t('battleLobby.noOpponentFound')}
                </span>
              </div>
              {/* Searching again is for "nobody came", not for "could not connect": the
                  same tap would most likely hit the same wall (user, 2026-10-07). */}
              {!matchUnavailable && (
                <button type="button" className="btn btn-primary w-100 btn-search-again" onClick={handleQuickMatch}>
                  <RotateCcw size={16} /> {t('battleLobby.searchAgain')}
                </button>
              )}
              <button type="button" className={`btn ${matchUnavailable ? 'btn-primary' : 'btn-secondary'} w-100`} onClick={handlePlayAi}>
                <Bot size={16} /> {t('battleLobby.playAiInstead')}
              </button>
              {/* "Back", not "Close": it leaves the search for the lobby (user, 2026-10-07). */}
              <button type="button" className="btn btn-secondary w-100" onClick={handleCancelSearch}>
                {t('common.back')}
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
                {clearRate !== null && (
                  <div className="mmr-info-badge radar-mmr-badge">
                    <ShieldCheck size={16} className="text-blue flex-shrink-0" />
                    <span className="mmr-badge-text">{t('battleLobby.mmrBadge', { rate: clearRate })}</span>
                  </div>
                )}
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
            {/* Quick Match against real users — paired by puzzle level */}
            <div className="battle-mode-card primary-battle-card">
              <div className="card-header">
                <Users size={26} className="text-blue" />
                <div>
                  <h4>{t('battleLobby.autoMatchTitle')}</h4>
                  <p>{t('battleLobby.autoMatchDesc')}</p>
                </div>
              </div>

              {clearRate !== null && (
                <div className="mmr-info-badge">
                  <ShieldCheck size={16} className="text-blue flex-shrink-0" />
                  <span className="mmr-badge-text">{t('battleLobby.mmrBadge', { rate: clearRate })}</span>
                </div>
              )}

              <button
                type="button"
                className="btn-modern btn-play-new btn-block mt-3"
                onClick={handleQuickMatch}
              >
                <Swords size={18} />
                <span>{t('battleLobby.findOpponentBtn')}</span>
              </button>

              {/* Said before the match, not after: the moves go to the opponent once it ends. */}
              <p className="battle-replay-note">{sharesMoves() ? t('replay.lobbyNoteOn') : t('replay.lobbyNoteOff')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
