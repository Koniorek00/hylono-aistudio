"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import Link from 'next/link';
import {
    COOKIE_CONSENT_EVENT,
    COOKIE_CONSENT_KEY,
    COOKIE_CONSENT_UPDATED_EVENT,
    openCookieSettings,
} from '@/src/lib/cookie-consent';
import { useFocusTrap } from '../hooks/useFocusTrap';

// Consent schema version — bump this when categories change to re-prompt users
const CONSENT_VERSION = '1.1';
const CONSENT_COOKIE_KEY = 'cookieConsent';
const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const COOKIE_CONSENT_ACTION_STATUS_ID = 'cookie-consent-action-status';
export const COOKIE_CONSENT_ACTION_STATUS_LABEL = 'Cookie consent action status';

export interface CookiePreferences {
    essential: true;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
    version: string;
}

const writeConsentCookie = (record: CookiePreferences): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const encoded = encodeURIComponent(JSON.stringify(record));
    const secureAttribute =
        typeof window !== 'undefined' && window.location.protocol === 'https:'
            ? '; Secure'
            : '';

    document.cookie = `${CONSENT_COOKIE_KEY}=${encoded}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureAttribute}`;
};

const clearConsentCookie = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const secureAttribute =
        typeof window !== 'undefined' && window.location.protocol === 'https:'
            ? '; Secure'
            : '';

    document.cookie = `${CONSENT_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secureAttribute}`;
};

const parseStoredConsent = (raw: string): CookiePreferences | null => {
    try {
        const stored: Partial<CookiePreferences> = JSON.parse(raw);

        if (stored.version !== CONSENT_VERSION) {
            return null;
        }

        if (typeof stored.timestamp !== 'string') {
            return null;
        }

        if (typeof stored.analytics !== 'boolean' || typeof stored.marketing !== 'boolean') {
            return null;
        }

        return {
            essential: true,
            analytics: stored.analytics,
            marketing: stored.marketing,
            timestamp: stored.timestamp,
            version: CONSENT_VERSION,
        };
    } catch {
        return null;
    }
};

export { openCookieSettings };

const getCookiePreferenceSummary = (prefs: Pick<CookiePreferences, 'analytics' | 'marketing'>) =>
    `Analytics ${prefs.analytics ? 'enabled' : 'disabled'}; marketing ${
        prefs.marketing ? 'enabled' : 'disabled'
    }.`;

interface CookieSettingsButtonProps {
    className?: string;
    label?: string;
}

export const CookieSettingsButton: React.FC<CookieSettingsButtonProps> = ({
    className,
    label = 'Cookie Settings',
}) => {
    return (
        <button
            type="button"
            onClick={openCookieSettings}
            className={className}
        >
            {label}
        </button>
    );
};

interface CookieConsentProps {
    forceOpenSignal?: number;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ forceOpenSignal }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true as const, // Required for core site behavior and cannot be changed
        analytics: false,
        marketing: false,
    });
    const [actionStatus, setActionStatus] = useState('Cookie consent manager ready.');
    const bannerShellRef = useRef<HTMLDivElement>(null);
    const customizeButtonRef = useRef<HTMLButtonElement>(null);
    const consentDialogRef = useFocusTrap<HTMLDivElement>({
        active: isVisible && showSettings,
        initialFocus: showSettings
            ? '#cookie-consent-settings-close'
            : false,
        clickOutsideDeactivates: false,
        escapeDeactivates: false,
    });

    useEffect(() => {
        let isMounted = true;
        const showBanner = () => {
            if (isMounted) {
                setActionStatus(
                    'Cookie consent banner ready. Optional analytics and marketing stay off until accepted.'
                );
                setIsVisible(true);
            }
        };

        let raw: string | null = null;
        try {
            raw = localStorage.getItem(COOKIE_CONSENT_KEY);
        } catch {
            // Storage inaccessible (private browsing) — show banner
            showBanner();
            return () => { isMounted = false; };
        }

        if (!raw) {
            // No consent stored → show banner immediately (consent-first)
            clearConsentCookie();
            showBanner();
            return () => { isMounted = false; };
        }

        const stored = parseStoredConsent(raw);
        if (!stored) {
            // Corrupted data → re-prompt
            try { localStorage.removeItem(COOKIE_CONSENT_KEY); } catch { /* ignore */ }
            clearConsentCookie();
            showBanner();
            return () => { isMounted = false; };
        }

        // Returning visitors: keep server-readable consent parity in sync
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(stored));
        } catch { /* ignore */ }
        writeConsentCookie(stored);
        setPreferences({
            essential: true,
            analytics: stored.analytics,
            marketing: stored.marketing,
        });
        setActionStatus(`Saved cookie preferences active. ${getCookiePreferenceSummary(stored)}`);

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!forceOpenSignal) {
            return;
        }

        setShowSettings(true);
        setIsVisible(true);
        setActionStatus(
            `Cookie preference settings opened. ${getCookiePreferenceSummary(preferences)}`
        );
    }, [forceOpenSignal]);

    // Listen for the global "open cookie settings" event (from footer link)
    useEffect(() => {
        const handler = () => {
            setShowSettings(true);
            setIsVisible(true);
            setActionStatus(
                `Cookie preference settings opened. ${getCookiePreferenceSummary(preferences)}`
            );
        };
        window.addEventListener(COOKIE_CONSENT_EVENT, handler);
        return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
    }, [preferences]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || !showSettings) {
                return;
            }

            event.preventDefault();
            setShowSettings(false);
            setActionStatus(
                `Returned to cookie consent banner. ${getCookiePreferenceSummary(preferences)}`
            );
            window.requestAnimationFrame(() => customizeButtonRef.current?.focus());
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, preferences, showSettings]);

    useEffect(() => {
        const root = document.documentElement;
        const offsetProperty = '--hylono-cookie-banner-offset';

        if (!isVisible) {
            root.style.removeProperty(offsetProperty);
            return;
        }

        const updateOffset = () => {
            const height = bannerShellRef.current?.getBoundingClientRect().height ?? 0;
            root.style.setProperty(offsetProperty, `${Math.ceil(height)}px`);
        };

        updateOffset();
        window.addEventListener('resize', updateOffset);

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && bannerShellRef.current) {
            resizeObserver = new ResizeObserver(updateOffset);
            resizeObserver.observe(bannerShellRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateOffset);
            resizeObserver?.disconnect();
            root.style.removeProperty(offsetProperty);
        };
    }, [isVisible, showSettings]);

    const saveConsent = (prefs: { essential: true; analytics: boolean; marketing: boolean }) => {
        const record: CookiePreferences = {
            ...prefs,
            timestamp: new Date().toISOString(),
            version: CONSENT_VERSION,
        };
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
        } catch { /* ignore */ }
        writeConsentCookie(record);
        // Notify analytics module (and any other listeners) of the consent change
        window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: record }));
    };

    const handleAcceptAll = () => {
        saveConsent({ essential: true, analytics: true, marketing: true });
        setActionStatus('All cookie preferences saved. Analytics enabled; marketing enabled.');
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleAcceptEssential = () => {
        saveConsent({ essential: true, analytics: false, marketing: false });
        setActionStatus(
            'Essential-only cookie preferences saved. Analytics disabled; marketing disabled.'
        );
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
        setActionStatus(`Cookie preferences saved. ${getCookiePreferenceSummary(preferences)}`);
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleOpenSettings = () => {
        setShowSettings(true);
        setActionStatus(
            `Cookie preference settings opened. ${getCookiePreferenceSummary(preferences)}`
        );
    };

    const handleBackToBanner = () => {
        setShowSettings(false);
        setActionStatus(
            `Returned to cookie consent banner. ${getCookiePreferenceSummary(preferences)}`
        );
    };

    const handlePreferenceToggle = (key: 'analytics' | 'marketing', checked: boolean) => {
        const nextPreferences = { ...preferences, [key]: checked };
        setPreferences(nextPreferences);
        setActionStatus(
            `${key === 'analytics' ? 'Analytics' : 'Marketing'} cookies ${
                checked ? 'enabled' : 'disabled'
            }. ${getCookiePreferenceSummary(nextPreferences)}`
        );
    };

    return (
        <>
            <div
                id={COOKIE_CONSENT_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={COOKIE_CONSENT_ACTION_STATUS_LABEL}
                className="sr-only"
            >
                {actionStatus}
            </div>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={bannerShellRef}
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none max-w-md w-[calc(100%-2rem)]"
                        role={showSettings ? 'dialog' : 'region'}
                        aria-modal={showSettings ? 'true' : undefined}
                        aria-label={showSettings ? 'Cookie consent settings' : 'Cookie consent banner'}
                        aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                    >
                    <div
                        ref={consentDialogRef}
                        tabIndex={-1}
                        className={`pointer-events-auto w-full ${
                            showSettings ? 'max-h-[85vh] overflow-y-auto rounded-[2rem] border border-slate-800 bg-slate-950/98 p-6 shadow-2xl text-slate-100 backdrop-blur-2xl' : ''
                        }`}
                    >
                        {!showSettings ? (
                            <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 p-2.5 sm:p-5 lg:p-6 rounded-[2rem] shadow-2xl text-slate-100 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                                            <Cookie size={15} />
                                        </div>
                                        <h3 className="text-sm font-bold text-white tracking-wide">
                                            We use cookies
                                        </h3>
                                    </div>
                                    <button
                                        ref={customizeButtonRef}
                                        type="button"
                                        onClick={handleOpenSettings}
                                        className="inline-flex min-h-11 min-w-0 items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
                                        title="Configure cookie settings"
                                        aria-label="Open cookie preference settings"
                                        aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                    >
                                        <Settings size={16} aria-hidden="true" />
                                    </button>
                                </div>

                                <p className="text-xs leading-relaxed text-slate-300">
                                    Essential cookies keep Hylono working. Optional analytics stay off until accepted. Read our{' '}
                                    <Link href="/cookie-policy" className="text-cyan-400 hover:underline">
                                        Cookie Policy
                                    </Link>.
                                </p>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleAcceptEssential}
                                        className="inline-flex min-h-11 min-w-0 items-center justify-center px-3.5 py-2 rounded-lg border border-slate-700/80 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                                        aria-label="Essential Only - Reject Optional Cookies"
                                        aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                    >
                                        Essential Only
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAcceptAll}
                                        className="inline-flex min-h-11 min-w-0 items-center justify-center px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors"
                                        aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                    >
                                        Accept All
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 id="cookie-consent-settings-title" className="font-bold text-white text-lg">
                                        Cookie Preferences
                                    </h3>
                                    <button
                                        id="cookie-consent-settings-close"
                                        type="button"
                                        onClick={handleBackToBanner}
                                        className="text-slate-400 hover:text-slate-200"
                                        aria-label="Back to cookie banner"
                                        aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                    >
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* Essential — always on, non-toggleable */}
                                    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg">
                                        <div>
                                            <span className="font-medium text-white">Essential Cookies</span>
                                            <p className="text-xs text-slate-400">Required for site functionality. Cannot be disabled.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked
                                            disabled
                                            className="w-5 h-5 accent-cyan-500"
                                            aria-label="Essential cookies (required)"
                                        />
                                    </div>

                                    {/* Analytics */}
                                    <label className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
                                        <div>
                                            <span className="font-medium text-white">Analytics Cookies</span>
                                            <p className="text-xs text-slate-400">Used for opted-in site analytics through PostHog.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.analytics}
                                            onChange={(e) =>
                                                handlePreferenceToggle('analytics', e.target.checked)
                                            }
                                            className="w-5 h-5 accent-cyan-500"
                                            aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                        />
                                    </label>

                                    {/* Marketing */}
                                    <label className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
                                        <div>
                                            <span className="font-medium text-white">Marketing Cookies</span>
                                            <p className="text-xs text-slate-400">Stores your marketing preference so optional tags can respect it if enabled.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.marketing}
                                            onChange={(e) =>
                                                handlePreferenceToggle('marketing', e.target.checked)
                                            }
                                            className="w-5 h-5 accent-cyan-500"
                                            aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                        />
                                    </label>
                                </div>

                                <p className="text-xs text-slate-400 mb-4">
                                    Your consent is recorded with a timestamp and version number. You can reopen Cookie Settings from the footer at any time.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleSavePreferences}
                                    className="w-full min-h-11 min-w-0 py-3 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
                                    aria-describedby={COOKIE_CONSENT_ACTION_STATUS_ID}
                                >
                                    <Check size={16} aria-hidden="true" /> Save Preferences
                                </button>
                            </div>
                        )}
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
