import React from 'react';
import { Gift, Award, CheckCircle2 } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';
import { useBackLayer } from '../hooks/useBackLayer';

export function DailyRewardModal({ rewardInfo, onConfirm }) {
  const { t } = useTranslation();
  // On the list of open windows, so a reward that opens over a note on Home
  // (a claim on the way back to the app, D45) is the one back closes first.
  useBackLayer(Boolean(rewardInfo), () => { if (onConfirm) onConfirm(); });
  if (!rewardInfo) return null;

  const handleConfirm = () => {
    soundHaptic.playCompleteChime();
    if (onConfirm) onConfirm();
  };

  // hintsAdded 는 claimDailyAttendance() 가 처음부터 돌려주고 있었다. 문구가
  // "+1" 을 하드코딩하는 바람에, 7일차에 3개를 주면서 1개라고 말하고 있었다.
  const { streakDays = 1, hintsAdded = 1 } = rewardInfo;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon-header" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
          <Gift size={44} />
        </div>

        <h2>{t('modals.dailyReward.title')}</h2>
        <div className="daily-streak-badge my-2" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#10b981',
          borderRadius: '999px',
          fontWeight: '800',
          fontSize: '13px'
        }}>
          <Award size={16} />
          <span>{t('modals.dailyReward.streakBadge', { days: streakDays })}</span>
        </div>

        <p className="modal-desc mt-1">
          {t('modals.dailyReward.desc', { days: streakDays, count: hintsAdded })}
        </p>

        <div className="modal-actions-vertical w-100 mt-3">
          <button type="button" className="btn btn-primary btn-lg" onClick={handleConfirm} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle2 size={20} />
            <span>{t('modals.dailyReward.confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
