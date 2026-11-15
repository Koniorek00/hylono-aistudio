'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { COOKIE_CONSENT_EVENT } from '@/src/lib/cookie-consent';
import { SharedStyles } from './RouteStyles';

const CookieConsent = dynamic(
  () =>
    import('../../../components/CookieConsent').then((module) => ({
      default: module.CookieConsent,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

const MultitoolContainer = dynamic(
  () =>
    import('../ui/Multitool/MultitoolContainer').then((module) => ({
      default: module.MultitoolContainer,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

export function GlobalOverlays({ deferTools = false, showConsent = true }: { deferTools?: boolean; showConsent?: boolean }) {
  const [isMultitoolReady, setIsMultitoolReady] = useState(false);
  const [cookieSettingsOpenSignal, setCookieSettingsOpenSignal] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const schedule =
      'requestIdleCallback' in window
        ? window.requestIdleCallback.bind(window)
        : (callback: () => void) => window.setTimeout(callback, 400);
    const cancel =
      'cancelIdleCallback' in window
        ? window.cancelIdleCallback.bind(window)
        : (handle: number) => window.clearTimeout(handle);

    const handle = deferTools ? window.setTimeout(() => {
      setIsMultitoolReady(true);
    }, 5000) : schedule(() => {
      setIsMultitoolReady(true);
    });

    return () => {
      if (deferTools) window.clearTimeout(handle);
      else cancel(handle);
    };
  }, [deferTools]);

  useEffect(() => {
    const handler = () => {
      setIsMultitoolReady(true);
      setCookieSettingsOpenSignal((signal) => signal + 1);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handler);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
  }, []);

  return (
    <>
      {showConsent && <CookieConsent forceOpenSignal={cookieSettingsOpenSignal} />}
      {isMultitoolReady && <><SharedStyles /><MultitoolContainer showFab={false} /></>}
    </>
  );
}
