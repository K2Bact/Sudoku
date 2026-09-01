import React from 'react';
import { Gift, Award, CheckCircle2 } from 'lucide-react';
import { soundHaptic } from '../utils/soundHaptic';
import { useTranslation } from '../i18n/i18nContext';

export function DailyRewardModal({ rewardInfo, onConfirm }) {
  const { t } = useTranslation();
  if (!rewardInfo) return null;

  const handleConfirm = () => {
    soundHaptic.playCompleteChime();
    if (onConfirm) onConfirm();
  };

  const { streakDays = 1 } = rewardInfo;

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
          <span>Day {streakDays} Streak</span>
        </div>

        <p className="modal-desc mt-1">
          {t('modals.dailyReward.desc', { days: streakDays })}
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
