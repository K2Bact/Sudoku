import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { useBackLayer } from '../../hooks/useBackLayer';

export function PrivacyPolicyModal({ onClose }) {
  const { t } = useTranslation();
  // Back closes the page, not the settings screen under it (D43).
  useBackLayer(true, onClose);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card privacy-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="modal-icon-header victory" style={{ background: '#dcfce7', color: '#16a34a' }}>
          <Shield size={40} />
        </div>
        <h2>{t('settings.privacyModalTitle')}</h2>
        <p className="modal-desc" style={{ marginBottom: '16px' }}>{t('settings.privacy.subtitle')}</p>
        <div className="privacy-body text-start" style={{ fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-main)', background: 'var(--btn-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--board-grid-line)' }}>
          <p><strong>{t('settings.privacy.sec1Title')}</strong></p>
          <p className="text-muted mb-2">{t('settings.privacy.sec1Desc')}</p>
          <p><strong>{t('settings.privacy.sec2Title')}</strong></p>
          <p className="text-muted mb-2">{t('settings.privacy.sec2Desc')}</p>
          <p><strong>{t('settings.privacy.sec3Title')}</strong></p>
          <p className="text-muted mb-2">{t('settings.privacy.sec3Desc')}</p>
          <p><strong>{t('settings.privacy.sec4Title')}</strong></p>
          <p className="text-muted">{t('settings.privacy.sec4Desc')}</p>
        </div>
        <button type="button" className="btn btn-primary btn-block mt-3 w-100" onClick={onClose}>
          <span>{t('common.confirm')}</span>
        </button>
      </div>
    </div>
  );
}
