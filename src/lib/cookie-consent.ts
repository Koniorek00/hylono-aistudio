export const COOKIE_CONSENT_KEY = 'cookieConsent';
export const COOKIE_CONSENT_EVENT = 'hylono:open-cookie-settings';
export const COOKIE_CONSENT_DRIFT_EVENT = 'hylono:consent-drift';
export const COOKIE_CONSENT_UPDATED_EVENT = 'hylono:consent-updated';

export const openCookieSettings = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
};
