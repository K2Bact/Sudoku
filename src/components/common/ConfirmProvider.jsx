import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';
import { soundHaptic } from '../../utils/soundHaptic';

/**
 * In-app replacement for window.confirm().
 *
 * Capacitor draws window.confirm() with a native AlertDialog whose buttons are
 * the literal strings "OK" and "Cancel", hardcoded in BridgeWebChromeClient.java:
 *
 *     .setPositiveButton("OK",  ...)
 *     .setNegativeButton("Cancel", ...)
 *
 * No app-side locale configuration reaches them. So a Korean player leaving a
 * battle read a Korean question under two English buttons, and so did players in
 * the other twelve languages. The message was translated; the only two words
 * they had to act on were not.
 *
 * This renders the question with the app's own modal styling and the app's own
 * dictionary, and hands back a Promise<boolean> so call sites keep reading like
 * the confirm() they replace:
 *
 *     if (await confirm(t('battleHeader.confirmLeave'))) leave();
 *
 * The promise is the point. A native confirm blocks the thread and returns a
 * boolean; nothing else can. Anything that must decide synchronously — the
 * Android back handler saying "I handled this" — should return immediately and
 * do the work inside .then(), rather than pretend it knows the answer yet.
 */

const ConfirmContext = createContext(null);

function useDialogs() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm / useNotify must be used inside <ConfirmProvider>');
  }
  return ctx;
}

/** Ask a yes/no question. Resolves true when the player confirms. */
export function useConfirm() {
  return useDialogs().confirm;
}

/**
 * Tell the player something. Replaces window.alert(), which Capacitor draws
 * with the same hardcoded English "OK" as window.confirm().
 */
export function useNotify() {
  return useDialogs().notify;
}

export function ConfirmProvider({ children }) {
  const { t } = useTranslation();
  const [request, setRequest] = useState(null);
  // Only one question can be on screen; a second call resolves the first as
  // cancelled rather than silently leaving its promise hanging forever.
  const pendingRef = useRef(null);

  const settle = useCallback((answer) => {
    const resolve = pendingRef.current;
    pendingRef.current = null;
    setRequest(null);
    if (resolve) resolve(answer);
  }, []);

  const confirm = useCallback(
    (message, options = {}) =>
      new Promise((resolve) => {
        if (pendingRef.current) pendingRef.current(false);
        pendingRef.current = resolve;
        setRequest({
          message,
          confirmLabel: options.confirmLabel || t('common.confirm'),
          cancelLabel: options.cancelLabel || t('common.cancel')
        });
      }),
    [t]
  );

  const notify = useCallback(
    (message) =>
      new Promise((resolve) => {
        if (pendingRef.current) pendingRef.current(false);
        pendingRef.current = resolve;
        setRequest({ message, confirmLabel: t('common.confirm'), cancelLabel: null });
      }),
    [t]
  );

  const api = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      {request && (
        <div className="modal-overlay confirm-overlay">
          <div className="modal-card confirm-modal-card">
            <div className="modal-icon-header" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <AlertTriangle size={40} />
            </div>
            <p className="modal-desc" style={{ whiteSpace: 'pre-line', marginBottom: '16px' }}>
              {request.message}
            </p>
            <div className="modal-actions-vertical w-100">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  soundHaptic.playSelectSound();
                  settle(true);
                }}
              >
                <span>{request.confirmLabel}</span>
              </button>
              {/* notify() has nothing to decline, so it draws no second button */}
              {request.cancelLabel && (
                <button
                  type="button"
                  className="btn btn-secondary mt-1"
                  onClick={() => {
                    soundHaptic.playSelectSound();
                    settle(false);
                  }}
                >
                  <span>{request.cancelLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
