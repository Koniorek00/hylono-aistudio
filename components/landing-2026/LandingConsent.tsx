'use client';

import { useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
  openCookieSettings,
} from '@/src/lib/cookie-consent';
import { parseConsentPayload, type ConsentRecord } from '@/src/lib/consentParity';

const version = '1.1';
function writeCookie(record: ConsentRecord) {
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(record))}; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export function CookiePreferencesButton() {
  return (
    <button type="button" onClick={openCookieSettings}>
      Cookie preferences
    </button>
  );
}

/** Native controls preserve the site's consent record, cookie and notification contract. */
export function LandingConsent() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    let record: ConsentRecord | null = null;
    try {
      record = parseConsentPayload(localStorage.getItem(COOKIE_CONSENT_KEY));
    } catch {
      /* Storage may be unavailable. */
    }
    if (record?.version === version) {
      setAnalytics(record.analytics);
      setMarketing(record.marketing);
      writeCookie(record);
    } else {
      try {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
      } catch {
        /* Storage may be unavailable. */
      }
      document.cookie = `${COOKIE_CONSENT_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
      setVisible(true);
    }
    const open = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, open);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, open);
  }, []);

  function save(allowAnalytics: boolean, allowMarketing: boolean) {
    const record: ConsentRecord = {
      essential: true,
      analytics: allowAnalytics,
      marketing: allowMarketing,
      timestamp: new Date().toISOString(),
      version,
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
    } catch {
      /* The cookie remains available. */
    }
    writeCookie(record);
    setAnalytics(allowAnalytics);
    setMarketing(allowMarketing);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: record }));
    setStatus('Cookie preferences saved.');
    setVisible(false);
  }
  return (
    <>
      <p className="hy26-consentStatus" role="status">
        {status}
      </p>
      {visible && (
        <section className="hy26-consent" aria-label="Cookie preferences">
          <h2>A small choice. Yours.</h2>
          <p>
            Essential cookies keep the site working. Optional analytics and marketing stay off until
            you choose. <a href="/cookie-policy">Read the cookie policy</a>.
          </p>
          <div className="hy26-consentActions">
            <button type="button" onClick={() => save(false, false)}>
              Essential only
            </button>
            <button type="button" onClick={() => save(true, true)}>
              Accept all
            </button>
          </div>
          <details>
            <summary>Choose individually</summary>
            <label>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />{' '}
              Analytics
            </label>
            <label>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
              />{' '}
              Marketing
            </label>
            <button type="button" onClick={() => save(analytics, marketing)}>
              Save preferences
            </button>
          </details>
        </section>
      )}
    </>
  );
}
