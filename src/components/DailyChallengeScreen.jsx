import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Award, CheckCircle2, Lock, Target, Gift, Zap, Info } from 'lucide-react';
import { ScreenHeader } from './common/ScreenHeader';
import { loadDailyRecords, getTodayDateKey, getMonthlyBadgeProgress, getDailyMission } from '../utils/dailyChallenge';
import { soundHaptic } from '../utils/soundHaptic';
import { adsService } from '../services/adsService';
import { useTranslation } from '../i18n/i18nContext';
import { useNotify } from './common/ConfirmProvider';

export function DailyChallengeScreen({ onBack, onStartDailyPuzzle, onStartDailyMission }) {
  const { t } = useTranslation();
  const notify = useNotify();
  const records = loadDailyRecords();
  const todayKey = getTodayDateKey();
  const todayMission = getDailyMission(todayKey);
  const isTodayCompleted = !!records[todayKey]?.completed;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const todayDateNum = now.getDate();

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
  const badgeProgress = getMonthlyBadgeProgress(currentYear, currentMonth);

  const [pendingUnlockDate, setPendingUnlockDate] = useState(null);
  const [watchingAdForDate, setWatchingAdForDate] = useState(null);

  /**
   * Unlocking a past puzzle costs one rewarded ad. This used to run a ten-second
   * interval of its own and unlock when it hit zero, which meant no ad service
   * was ever involved and the countdown was the whole feature. It now waits on
   * adsService, so the placeholder and a real AdMob ad both drive it, and a
   * player who dismisses a real ad early gets nothing.
   */
  const handleUnlockWithAd = async (targetDate) => {
    setWatchingAdForDate(targetDate);
    const { rewarded } = await adsService.showRewarded();
    setWatchingAdForDate(null);
    if (!rewarded) return;
    if (onStartDailyPuzzle) onStartDailyPuzzle(targetDate);
  };

  const handleStartMissionClick = () => {
    soundHaptic.playSelectSound();
    if (onStartDailyMission) onStartDailyMission(todayMission);
    else if (onStartDailyPuzzle) onStartDailyPuzzle(todayKey);
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
      setPendingUnlockDate(dateKey);
      return;
    }

    // 3. 오늘 미완료 퍼즐 시작
    if (onStartDailyPuzzle) onStartDailyPuzzle(dateKey);
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
      <ScreenHeader title={t('daily.header', { month: currentMonth })} icon={CalendarIcon} iconColorClass="text-blue" onBack={onBack} />

      <div className="screen-scroll-content">
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
            <h4>{t('daily.badgeTitle', { month: currentMonth })}</h4>
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
            <p style={{ fontWeight: '800', color: '#eab308' }}>{t('daily.unlockingAd')}</p>
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
    </div>
  );
}
export default DailyChallengeScreen;
