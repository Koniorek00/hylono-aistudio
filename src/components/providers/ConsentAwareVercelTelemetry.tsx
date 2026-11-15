'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { COOKIE_CONSENT_UPDATED_EVENT } from '../../lib/cookie-consent';

interface ConsentRecord {
  analytics: boolean;
  version: string;
}

const CONSENT_KEY = 'cookieConsent';

const hasAnalyticsConsent = (value: string | null): boolean => {
  if (!value) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ConsentRecord>;
    return parsed.analytics === true && typeof parsed.version === 'string';
  } catch {
    return false;
  }
};

export function ConsentAwareVercelTelemetry() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        setEnabled(hasAnalyticsConsent(localStorage.getItem(CONSENT_KEY)));
      } catch {
        setEnabled(false);
      }
    };

    sync();

    const handleConsentUpdated = () => {
      sync();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY) {
        sync();
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleConsentUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
