'use client';

import { useEffect } from 'react';
import { startSentryWithConsent } from '../../../instrumentation-client';
import { initPostHog } from '../../lib/analytics';
import {
  COOKIE_CONSENT_DRIFT_EVENT,
  COOKIE_CONSENT_UPDATED_EVENT,
} from '../../lib/cookie-consent';
import {
  detectConsentDrift,
  parseConsentCookie,
  parseConsentPayload,
} from '../../lib/consentParity';

// Must match the key in CookieConsent.tsx
const CONSENT_KEY = 'cookieConsent';

interface ConsentDetail {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export function Providers() {
  useEffect(() => {
    const deferAnalyticsInit = () => {
      const schedule =
        'requestIdleCallback' in window
          ? window.requestIdleCallback.bind(window)
          : (callback: () => void) => window.setTimeout(callback, 1);

      schedule(() => {
        void initPostHog();
      });
    };

    let localStorageRaw: string | null = null;
    try { localStorageRaw = localStorage.getItem(CONSENT_KEY); } catch { /* ignore */ }
    const localStorageConsent = parseConsentPayload(localStorageRaw);
    const cookieConsent = parseConsentCookie(document.cookie, CONSENT_KEY);
    const driftReport = detectConsentDrift(localStorageConsent, cookieConsent);

    if (driftReport.hasDrift) {
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_DRIFT_EVENT, {
          detail: driftReport,
        })
      );
    }

    // Returning visitor: initialize analytics only if previously consented.
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<ConsentDetail>;
        if (stored.analytics === true && stored.essential === true && stored.version === '1.1') {
          deferAnalyticsInit();
          // Error telemetry is gated on the same consent signal as product
          // analytics. Before this, instrumentation-client.ts called Sentry.init() at
          // module scope, so the SDK was live for visitors who had declined.
          // sendDefaultPii: false limits the payload; it does not undo the breach.
          startSentryWithConsent();
        }
      }
    } catch {
      // Corrupted localStorage — skip analytics init.
    }

    // New consent granted this session.
    const handleConsentUpdate = (e: Event) => {
      if ('detail' in e) {
        const detail = (e as CustomEvent<ConsentDetail>).detail;
        if (detail?.analytics === true && detail.essential === true && detail.version === '1.1') {
          deferAnalyticsInit();
          startSentryWithConsent();
        }
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdate);
    };
  }, []);

  return null;
}
