import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Award, CheckCircle2, Lock, Target, Gift, Zap, Info } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadDailyRecords, getTodayDateKey, getMonthlyBadgeProgress, getDailyMission } from '../utils/dailyChallenge';
import { soundHaptic } from '../utils/soundHaptic';
import { adsService } from '../services/adsService';
import { useTranslation } from '../i18n/i18nContext';
import { useNotify } from './common/ConfirmProvider';
import { adRewardMessage, watchRewardedAd } from './common/adRewardMessage';
import { VariantSwitch } from './home/VariantSwitch';
import { RulesModal } from './home/RulesModal';
import { usePuzzleKind } from '../hooks/usePuzzleKind';
import { loadSettings, saveSettings } from '../utils/storage';
import { useBackLayer } from '../hooks/useBackLayer';

export function DailyChallengeScreen({ onBack, onStartDailyPuzzle, onStartDailyMission }) {
  const { t, activeLanguage } = useTranslation();
  const notify = useNotify();
  // The kind the day is played as: the switch Home and the AI lobby share
  // (usePuzzleKind.js). One calendar for both — user 2026-10-07, KP-4: "통합" —
  // so a day is ticked once, whichever kind cleared it.
  const [variant, setVariant] = usePuzzleKind();
  // The first killer starts after its rules, as on Home and in the AI lobby.
  // Before the ad that unlocks a past day, not after it: closing the rules there
  // would have spent the ad on nothing.
  const [afterRules, setAfterRules] = useState(null);
  const begin = (go) => (variant === 'killer' && !loadSettings().killerRulesSeen ? setAfterRules(() => go) : go());
  const records = loadDailyRecords();
  const todayKey = getTodayDateKey();
  const todayMission = getDailyMission(todayKey);
  const isTodayCompleted = !!records[todayKey]?.completed;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  // The month as each language names it — "September", "9月", "9월", "septiembre".
  // The bare number read as "Daily Challenges (9)" and "9 Master" in English.
  const monthName = (() => {
    try { return new Intl.DateTimeFormat(activeLanguage || undefined, { month: 'long' }).format(now); }
    catch { return String(currentMonth); }
  })();
  const todayDateNum = now.getDate();

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
  const badgeProgress = getMonthlyBadgeProgress(currentYear, currentMonth);

  const [pendingUnlockDate, setPendingUnlockDate] = useState(null);
  const [watchingAdForDate, setWatchingAdForDate] = useState(null);
  // Back is the unlock window's Cancel, not the way out of the calendar (D43).
  useBackLayer(Boolean(pendingUnlockDate), () => setPendingUnlockDate(null));

  /**
   * Unlocking a past puzzle costs one rewarded ad. This used to run a ten-second
   * interval of its own and unlock when it hit zero, which meant no ad service
   * was ever involved and the countdown was the whole feature. It now waits on
   * adsService, so the placeholder and a real AdMob ad both drive it, and a
   * player who dismisses a real ad early gets nothing.
   */
  const handleUnlockWithAd = async (targetDate) => {
    if (watchingAdForDate) return;
    setWatchingAdForDate(targetDate);
    const result = await watchRewardedAd(adsService);
    setWatchingAdForDate(null);
    if (!result.rewarded) {
      // Used to return silently: the overlay vanished and the day stayed locked
      // with no word about why.
      notify(adRewardMessage(result, t));
      return;
    }
    if (onStartDailyPuzzle) onStartDailyPuzzle(targetDate, variant);
  };

  const handleStartMissionClick = () => {
    soundHaptic.playSelectSound();
    const go = () => {
      if (onStartDailyMission) onStartDailyMission(todayMission, variant);
      else if (onStartDailyPuzzle) onStartDailyPuzzle(todayKey, variant);
    };
    // A battle mission opens the lobby, which has the switch and the rules of its own.
    if (todayMission.actionType === 'open_battle') go();
    else begin(go);
  };

  const handleDayClick = (dayNum) => {
    const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    // 1. 이미 완료한 날짜는 당일/과거 상관없이 무반응 (게임 재진입 차단)
    if (records[dateKey]?.completed) {
      return;
    }

    if (dayNum > todayDateNum) {
      soundHaptic.playSelectSound();
      notify(t('daily.futureAlert'));
      return;
    }

    soundHaptic.playSelectSound();

    // 2. 지난 미완료 날짜는 광고 해금 확인 팝업
    if (dayNum < todayDateNum) {
      begin(() => setPendingUnlockDate(dateKey));
      return;
    }

    // 3. 오늘 미완료 퍼즐 시작
    begin(() => onStartDailyPuzzle && onStartDailyPuzzle(dateKey, variant));
  };

  const weekdays = [
    { key: 'sun', label: t('calendar.days.sun') },
    { key: 'mon', label: t('calendar.days.mon') },
    { key: 'tue', label: t('calendar.days.tue') },
    { key: 'wed', label: t('calendar.days.wed') },
    { key: 'thu', label: t('calendar.days.thu') },
    { key: 'fri', label: t('calendar.days.fri') },
    { key: 'sat', label: t('calendar.days.sat') }
  ];

  return (
    <div className="daily-screen-container">
      <ScreenHeader title={t('daily.header', { month: monthName })} icon={CalendarIcon} iconColorClass="text-blue" onBack={onBack} />

      <div className="screen-scroll-content">
        {/* 0. Standard or killer — what the mission and the calendar start (KP-4) */}
        <VariantSwitch variant={variant} onChange={setVariant} />

        {/* 1. Daily Mission Card */}
        <div className="daily-mission-card">
          <div className="mission-top-row">
            <div className="mission-title-group">
              <Target size={18} className="text-yellow" />
              <h3>{t('daily.missionCardTitle')}</h3>
            </div>
            <span className={`mission-tier-badge ${todayMission.tier}`}>{t(`daily.tiers.${todayMission.tier}`)}</span>
          </div>

          <div className="mission-body-box">
            <h4 className="mission-target-title">{t(todayMission.titleKey)}</h4>
            <p className="mission-target-desc">{t(todayMission.descKey)}</p>
          </div>

          <div className="mission-footer-row">
            <span className="mission-reward-pill">
              <Gift size={13} />
              <span>{t('daily.missionReward')}</span>
            </span>
            {isTodayCompleted ? (
              <div className="mission-completed-badge"><CheckCircle2 size={16} /><span>{t('daily.missionCompleted')}</span></div>
            ) : (
              <button type="button" className="btn-modern btn-play-new" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleStartMissionClick}>
                <Zap size={15} /><span>{t('daily.missionStartBtn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Badge Progress Card */}
        <div className="badge-progress-card">
          <div className="badge-icon-box"><Award size={36} className={badgeProgress.isUnlocked ? 'unlocked' : 'locked'} /></div>
          <div className="badge-info">
            <h4>{t('daily.badgeTitle', { month: monthName })}</h4>
            <p>{t('daily.badgeDesc', { completed: badgeProgress.completedCount, target: badgeProgress.targetCount })}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, (badgeProgress.completedCount / badgeProgress.targetCount) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* 3. Rewarded Ad Overlay */}
        {watchingAdForDate && (
          <div className="inline-ad" style={{ flexDirection: 'column', gap: '8px' }}>
            <div className="spinner"></div>
            {/* 어느 쪽인지 말한다. 자리표시자 공급자가 도는 동안엔 광고주가 없고,
                플레이어에게 다르게 말하는 것은 배너가 하던 거짓말과 같다.
                GameOverModal 과 HintRewardModal 은 이미 이렇게 하고 있었고
                여기만 빠져 있었다. */}
            <p style={{ fontWeight: '800', color: '#eab308' }}>
              {adsService.isReal ? t('daily.unlockingAd') : t('modals.hintReward.adPlaceholder')}
            </p>
          </div>
        )}

        {/* 4. Calendar Card */}
        <div className="calendar-card">
          <div className="calendar-header-row">
            <div className="calendar-title-group"><Award size={16} className="text-yellow" /><h4>{t('daily.calendarTitle')}</h4></div>
            <span className="calendar-month-badge">{currentYear}.{String(currentMonth).padStart(2, '0')}</span>
          </div>

          <div className="calendar-weekdays-row">
            {weekdays.map((w) => (<span key={w.key} className={`weekday-label ${w.key}`}>{w.label}</span>))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (<div key={`empty-${i}`} className="calendar-day-empty" />))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
              const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dayNum === todayDateNum;
              const isCompleted = records[dateKey]?.completed;
              const isMissed = dayNum < todayDateNum && !isCompleted;
              return (
                <button type="button"
                  key={dayNum}
                  className={`calendar-day-btn ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''} ${isMissed ? 'missed' : ''} ${dayNum > todayDateNum ? 'future' : ''}`}
                  onClick={() => handleDayClick(dayNum)}
                >
                  <span className="day-number">{dayNum}</span>
                  <div className="day-stamp-slot">
                    {isCompleted ? <span className="stamp-badge-completed"><CheckCircle2 size={13} /></span>
                      : isMissed ? <span className="stamp-badge-missed"><Lock size={11} /></span>
                      : isToday ? <span className="stamp-badge-today"><span className="today-glow-dot" /></span>
                      : <span className="stamp-badge-empty" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="calendar-past-notice">
            <Info size={16} className="calendar-past-notice-icon" />
            <span>{t('daily.pastUnlockNotice')}</span>
          </div>
        </div>
      </div>

      {/* 5. Past Date Unlock Modal */}
      {pendingUnlockDate && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '340px', position: 'relative' }}>
            <div className="modal-icon-header" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Lock size={36} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px' }}>{t('daily.unlockModalTitle')}</h3>
            <p className="modal-desc" style={{ marginBottom: '16px', whiteSpace: 'pre-line' }}>
              {t('daily.unlockModalDesc', { date: pendingUnlockDate })}
            </p>
            <div className="modal-actions-vertical w-100">
              <button type="button"
                className="btn btn-primary"
                onClick={() => {
                  const target = pendingUnlockDate;
                  setPendingUnlockDate(null);
                  handleUnlockWithAd(target);
                }}
              >
                <Zap size={16} />
                <span>{t('daily.unlockModalConfirmBtn')}</span>
              </button>
              <button type="button" className="btn btn-secondary mt-1" onClick={() => setPendingUnlockDate(null)}>
                <span>{t('daily.unlockModalCancelBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {afterRules && (
        <RulesModal
          variant="killer"
          onClose={() => setAfterRules(null)}
          onStart={() => {
            saveSettings({ ...loadSettings(), killerRulesSeen: true });
            const go = afterRules;
            setAfterRules(null);
            go();
          }}
        />
      )}
    </div>
  );
}
export default DailyChallengeScreen;
