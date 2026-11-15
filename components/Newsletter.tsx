'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Sparkles, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  submitNewsletterFormAction,
  type FormActionResult,
} from '../src/actions/formActions';
import { HoneypotField } from './shared/HoneypotField';
import { TurnstileWidget } from './shared/TurnstileWidget';

const NEWSLETTER_FOOTER_STATUS_ID = 'newsletter-footer-submit-status';
const NEWSLETTER_SECTION_STATUS_ID = 'newsletter-section-submit-status';

export interface NewsletterProps {
  variant?: 'default' | 'reference';
}

export const Newsletter: React.FC<NewsletterProps> = ({ variant = 'default' }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [footerError, setFooterError] = useState<string | null>(null);
    const [researchUpdates, setResearchUpdates] = useState(false);
    const [protocolReleases, setProtocolReleases] = useState(false);
    const [actionState, formAction, pending] = useActionState<FormActionResult, FormData>(
        submitNewsletterFormAction,
        { success: false, message: '' }
    );

    useEffect(() => {
        if (actionState.success) {
            setSubmitted(true);
            setEmail('');
            setFooterError(null);
            return;
        }

        if (actionState.message) {
            setFooterError(actionState.message);
        }
    }, [actionState.success, actionState.message]);

    const footerDescriptionIds = footerError
        ? `${NEWSLETTER_FOOTER_STATUS_ID} newsletter-footer-error`
        : NEWSLETTER_FOOTER_STATUS_ID;
    const footerSubmitStatusMessage = pending
        ? 'Subscribing to Hylono updates now.'
        : footerError
          ? 'Newsletter signup needs review before it can be submitted.'
          : 'Ready to request Hylono product and research updates after email and consent are complete.';

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-5 py-3 max-w-md shadow-xs"
                role="status"
                aria-live="polite"
                aria-label="Footer newsletter confirmation status"
            >
                <Check size={18} aria-hidden="true" className="text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-emerald-900">{actionState.message || "You're on the list! Check your inbox for updates."}</span>
            </motion.div>
        );
    }

    if (variant === 'reference') {
        return (
            <div className="w-full">
                <form
                    action={formAction}
                    aria-describedby={footerDescriptionIds}
                    className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8"
                >
                    <HoneypotField />
                    <TurnstileWidget />
                    <input type="hidden" name="source" value="footer" />
                    <input type="hidden" name="consentContext" value="footer newsletter signup" />
                    <input type="hidden" name="consentToUpdates" value="on" />

                    {/* Pill Input Container */}
                    <div className="relative flex w-full max-w-md items-center rounded-full border border-slate-300/80 bg-white/90 px-2 py-1 shadow-sm backdrop-blur-xs transition-all focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-500/20">
                        <label htmlFor="newsletter-email-footer" className="sr-only">
                            Your email address
                        </label>
                        <input
                            id="newsletter-email-footer"
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setFooterError(null);
                            }}
                            placeholder="Your email address"
                            aria-label="Email address for newsletter"
                            aria-invalid={Boolean(footerError)}
                            aria-describedby={footerDescriptionIds}
                            className="min-h-11 w-full bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={pending}
                            aria-describedby={NEWSLETTER_FOOTER_STATUS_ID}
                            aria-label={pending ? 'Subscribing to newsletter' : 'Submit email subscription'}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111e28] text-white transition-all hover:bg-[#1b2f3f] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        >
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Dual Checkboxes matching reference design */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-5">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 select-none hover:text-slate-900 transition-colors">
                            <input
                                type="checkbox"
                                checked={researchUpdates}
                                onChange={(e) => setResearchUpdates(e.target.checked)}
                                className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-cyan-500"
                            />
                            <span>Research updates</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 select-none hover:text-slate-900 transition-colors">
                            <input
                                type="checkbox"
                                checked={protocolReleases}
                                onChange={(e) => setProtocolReleases(e.target.checked)}
                                className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-cyan-500"
                            />
                            <span>Protocol releases</span>
                        </label>
                    </div>
                </form>

                <p
                    id={NEWSLETTER_FOOTER_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Footer newsletter submit status"
                    className="sr-only"
                >
                    {footerSubmitStatusMessage}
                </p>
                {footerError && (
                    <p id="newsletter-footer-error" role="alert" className="mt-2 text-xs font-medium text-rose-600">
                        {footerError}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <form action={formAction} aria-describedby={footerDescriptionIds} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <HoneypotField />
                <TurnstileWidget />
                <input type="hidden" name="source" value="footer" />
                <input type="hidden" name="consentContext" value="footer newsletter signup" />
                <div className="relative min-w-0 flex-1">
                    <label htmlFor="newsletter-email-footer" className="sr-only">Email address</label>
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                    <input
                        id="newsletter-email-footer"
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setFooterError(null);
                        }}
                        placeholder="your@email.com"
                        aria-label="Email address for newsletter"
                        aria-invalid={Boolean(footerError)}
                        aria-describedby={footerDescriptionIds}
                        className="min-h-11 w-full rounded-lg border border-white/20 bg-white/[0.045] py-3 pl-12 pr-4 text-base text-white placeholder:text-white/60 outline-none transition-colors focus:border-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    />
                </div>
                <button
                    type="submit"
                    disabled={pending}
                    aria-describedby={NEWSLETTER_FOOTER_STATUS_ID}
                    className="min-h-11 rounded-lg bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200 w-full sm:w-auto sm:min-w-32"
                >
                    {pending ? 'Subscribing...' : 'Subscribe'}
                </button>
                <label className="flex gap-2 text-xs leading-5 text-slate-300 sm:basis-full">
                    <input
                        type="checkbox"
                        name="consentToUpdates"
                        value="on"
                        required
                        aria-required="true"
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-white/[0.045] text-cyan-300"
                    />
                    <span>I agree to receive product and research updates and understand I can request unsubscribe support at any time.</span>
                </label>
            </form>
            <p
                id={NEWSLETTER_FOOTER_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Footer newsletter submit status"
                className="mt-3 text-xs text-slate-300"
            >
                {footerSubmitStatusMessage}
            </p>
            {footerError && (
                <p id="newsletter-footer-error" role="alert" className="mt-3 text-sm text-amber-200">
                    {footerError}
                </p>
            )}
        </div>
    );
};

export const NewsletterSection: React.FC = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [homeError, setHomeError] = useState<string | null>(null);
    const [actionState, formAction, pending] = useActionState<FormActionResult, FormData>(
        submitNewsletterFormAction,
        { success: false, message: '' }
    );

    useEffect(() => {
        if (actionState.success) {
            setSubmitted(true);
            setEmail('');
            setHomeError(null);
        } else if (actionState.message) {
            setHomeError(actionState.message);
        }
    }, [actionState.success, actionState.message]);

    const homeDescriptionIds = homeError
        ? `${NEWSLETTER_SECTION_STATUS_ID} newsletter-section-error`
        : NEWSLETTER_SECTION_STATUS_ID;
    const homeSubmitStatusMessage = pending
        ? 'Subscribing to Hylono updates from the homepage section now.'
        : homeError
          ? 'Homepage newsletter signup needs review before it can be submitted.'
          : 'Ready to request Hylono product and research updates from the homepage section after email and consent are complete.';

    return (
        <section className="relative overflow-hidden bg-slate-950 py-24">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
                <Sparkles className="mx-auto mb-6 text-cyan-400" size={32} />
                <h2 className="text-3xl font-bold text-white mb-4">Get Hylono updates</h2>
                <p className="text-slate-400 mb-8">
                    Get research notes, product updates, and planning guidance from Hylono.
                </p>

                {submitted ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 p-6 text-emerald-400"
                        role="status"
                        aria-live="polite"
                        aria-label="Home newsletter confirmation status"
                    >
                        <Check className="mx-auto mb-2" size={32} aria-hidden="true" />
                        <p className="font-bold">Subscription request saved.</p>
                        <p className="text-sm opacity-80">{actionState.message || 'Your subscription is recorded.'}</p>
                    </motion.div>
                ) : (
                    <form action={formAction} aria-describedby={homeDescriptionIds} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <HoneypotField />
                        <TurnstileWidget />
                        <input type="hidden" name="source" value="home-section" />
                        <input type="hidden" name="consentContext" value="home newsletter section" />
                        <label htmlFor="newsletter-email-section" className="sr-only">Email address</label>
                        <input
                            id="newsletter-email-section"
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            aria-label="Email address for newsletter"
                            aria-invalid={Boolean(homeError)}
                            aria-describedby={homeDescriptionIds}
                            className="min-h-11 flex-1 rounded-lg border border-white/20 bg-white/[0.045] px-6 py-3 text-white placeholder:text-white/60 outline-none transition-colors focus:border-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 min-w-0"
                        />
                        <button
                            type="submit"
                            disabled={pending}
                            aria-describedby={NEWSLETTER_SECTION_STATUS_ID}
                            className="min-h-11 rounded-lg bg-cyan-300 px-8 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200 w-full sm:w-auto shrink-0"
                        >
                            {pending ? 'Subscribing...' : 'Subscribe'}
                        </button>
                        <label className="flex gap-2 text-left text-xs leading-5 text-slate-300 sm:col-span-2 sm:basis-full">
                            <input
                                type="checkbox"
                                name="consentToUpdates"
                                value="on"
                                required
                                aria-required="true"
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/[0.045] text-cyan-300"
                            />
                            <span>I agree to receive product and research updates and understand I can request unsubscribe support at any time.</span>
                        </label>
                        <p
                            id={NEWSLETTER_SECTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Home newsletter submit status"
                            className="text-left text-xs text-slate-300 sm:col-span-2 sm:basis-full"
                        >
                            {homeSubmitStatusMessage}
                        </p>
                    </form>
                )}

                {homeError && (
                    <div id="newsletter-section-error" role="alert" className="flex items-start gap-2 mt-4 text-amber-200 text-xs text-left max-w-md mx-auto">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{homeError}</span>
                    </div>
                )}
                <p className="text-xs text-slate-500 mt-4">
                    Product and research updates only. Unsubscribe anytime.
                </p>
            </div>
        </section>
    );
};
