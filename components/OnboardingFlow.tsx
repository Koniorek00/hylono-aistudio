import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Circle, ExternalLink, LifeBuoy, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { siteEntity } from '@/content/site-entity';
import analytics from '@/src/lib/analytics';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

interface OnboardingFlowProps {
    onComplete: () => void;
}

interface ChecklistItem {
    id: string;
    title: string;
    status: 'ready' | 'pending';
    details?: string;
    links?: { label: string; href: string; external?: boolean }[];
}

const CHECKLIST: ChecklistItem[] = [
    {
        id: 'context',
        title: 'Confirm your onboarding context',
        status: 'ready',
        details:
            'Use this step to keep product fit, rental access, delivery, and setup questions in one support path before the first session.',
        links: [
            { label: 'Open help center', href: '/help' },
            { label: 'Contact support', href: '/contact?source=onboarding&intent=support' },
        ],
    },
    {
        id: 'access',
        title: 'Review access and policy details',
        status: 'pending',
        details:
            'Check delivery, return, and warranty pages before setup if a commercial or logistics detail is unclear.',
        links: [
            { label: 'Delivery guidance', href: '/shipping' },
            { label: 'Return policy', href: '/returns' },
            { label: 'Warranty overview', href: '/warranty' },
        ],
    },
    {
        id: 'setup',
        title: 'Prepare your setup space',
        status: 'pending',
        details:
            'Use educational setup guidance before arranging a device area, accessories, and first-use support.',
        links: [{ label: 'Open learning hub', href: '/learning' }],
    },
    {
        id: 'first-session',
        title: 'Review first-session guidance',
        status: 'pending',
        details:
            'Start with conservative protocol guidance and contact support if you need personalized setup help.',
        links: [
            { label: 'Review protocols', href: '/protocols' },
            { label: 'Planning help before your first session', href: '/learning' },
        ],
    },
    {
        id: 'support',
        title: 'Keep support available',
        status: 'pending',
        details:
            'Use help or email support before continuing when setup, access, or protocol-fit details are unresolved.',
        links: [
            { label: `Email ${siteEntity.supportEmail}`, href: `mailto:${siteEntity.supportEmail}`, external: true },
            { label: 'Open contact page', href: '/contact?source=onboarding&intent=setup' },
        ],
    },
];

const focusRingClass =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600';

export const ONBOARDING_ACTION_STATUS_ID = 'onboarding-action-status';
const ONBOARDING_ACTION_STATUS_LABEL = 'Onboarding action status';

const secondaryActionClass =
    `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-cyan-300 hover:text-cyan-700 motion-reduce:transition-none ${focusRingClass}`;

const inlineLinkClass =
    `inline-flex min-h-11 items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-cyan-700 underline-offset-4 transition-colors hover:text-cyan-800 hover:underline motion-reduce:transition-none ${focusRingClass}`;

const getAnalyticsDestination = (href: string) =>
    href.startsWith('mailto:') ? 'mailto:support' : href;

const trackOnboardingAction = (
    action: string,
    properties: Record<string, string | boolean> = {},
) => {
    analytics.capture('onboarding_route_action_clicked', {
        route: '/onboarding',
        action,
        ...properties,
    });
};

const getInitialOnboardingActionStatus = () =>
    `Onboarding checklist ready: ${CHECKLIST.length} setup steps available, first step expanded.`;

const getPausedOnboardingActionStatus = () =>
    'Onboarding checklist paused. Help, email support, and continue actions are available.';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const onboardingEnabled = useFeatureFlag('feature_onboarding');
    const prefersReducedMotion = useReducedMotion();
    const [expandedItem, setExpandedItem] = useState<string | null>(
        CHECKLIST[0]?.id ?? null
    );
    const [actionStatus, setActionStatus] = useState(() =>
        onboardingEnabled
            ? getInitialOnboardingActionStatus()
            : getPausedOnboardingActionStatus()
    );

    useEffect(() => {
        setActionStatus(
            onboardingEnabled
                ? getInitialOnboardingActionStatus()
                : getPausedOnboardingActionStatus()
        );
    }, [onboardingEnabled]);

    if (!onboardingEnabled) {
        return (
            <section
                aria-labelledby="onboarding-paused-title"
                className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-slate-100 p-4"
            >
                <div
                    className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-2xl md:p-8"
                >
                    <h1 id="onboarding-paused-title" className="mb-3 text-2xl font-black text-slate-900 futuristic-font">
                        Onboarding checklist paused
                    </h1>
                    <p className="mb-5 text-sm text-slate-600">
                        Use help or contact support if setup, access, or delivery details are unclear.
                    </p>
                    <p
                        id={ONBOARDING_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={ONBOARDING_ACTION_STATUS_LABEL}
                        className="sr-only"
                    >
                        {actionStatus}
                    </p>
                    <div className="mb-6 grid gap-2 sm:grid-cols-2">
                        <Link
                            href="/help"
                            aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                            className={secondaryActionClass}
                            onClick={() => {
                                setActionStatus('Opening help center from the paused onboarding checklist.');
                                trackOnboardingAction('paused_support_transition', {
                                    destination: '/help',
                                });
                            }}
                        >
                            <LifeBuoy size={16} aria-hidden="true" /> Open help center
                        </Link>
                        <a
                            href={`mailto:${siteEntity.supportEmail}`}
                            aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                            className={secondaryActionClass}
                            onClick={() => {
                                setActionStatus('Opening email support from the paused onboarding checklist.');
                                trackOnboardingAction('paused_support_transition', {
                                    destination: 'mailto:support',
                                });
                            }}
                        >
                            <Users size={16} aria-hidden="true" /> Email support
                        </a>
                    </div>
                    <button
                        type="button"
                        aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                        onClick={() => {
                            setActionStatus('Continuing from the paused onboarding checklist.');
                            trackOnboardingAction('paused_continue_clicked');
                            onComplete();
                        }}
                        className={`min-h-11 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 motion-reduce:transition-none ${focusRingClass}`}
                    >
                        Continue
                    </button>
                </div>
            </section>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] bg-slate-100 p-4 py-8">
            <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
                aria-labelledby="onboarding-title"
                aria-describedby={`onboarding-summary ${ONBOARDING_ACTION_STATUS_ID}`}
                className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-2xl"
            >
                <div className="p-6 md:p-8 border-b border-slate-100">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
                        {siteEntity.supportCoverageLabel}
                    </p>
                    <h1 id="onboarding-title" className="text-2xl md:text-3xl font-black text-slate-900 futuristic-font">
                        Your onboarding checklist
                    </h1>
                    <p id="onboarding-summary" className="text-sm text-slate-600 mt-2">
                        Review setup steps, open policy pages, and keep support available before continuing.
                    </p>
                    <p
                        id={ONBOARDING_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={ONBOARDING_ACTION_STATUS_LABEL}
                        className="sr-only"
                    >
                        {actionStatus}
                    </p>
                </div>

                <div className="p-6 md:p-8 space-y-3">
                    {CHECKLIST.map((item) => {
                        const isExpanded = expandedItem === item.id;
                        return (
                            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextExpanded = !isExpanded;
                                        setExpandedItem(nextExpanded ? item.id : null);
                                        setActionStatus(
                                            `${item.title} ${nextExpanded ? 'expanded' : 'collapsed'}. ${
                                                item.status === 'ready'
                                                    ? 'Ready to review.'
                                                    : 'Pending your review.'
                                            }`
                                        );
                                        trackOnboardingAction('checklist_step_toggled', {
                                            step_id: item.id,
                                            step_status: item.status,
                                            next_state: nextExpanded ? 'expanded' : 'collapsed',
                                        });
                                    }}
                                    className={`w-full text-left min-h-11 rounded-2xl px-4 py-4 flex items-start gap-3 transition-colors hover:bg-white motion-reduce:transition-none ${focusRingClass}`}
                                    aria-expanded={isExpanded}
                                    aria-controls={`onboarding-step-${item.id}`}
                                    aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                                >
                                    <Circle
                                        size={18}
                                        className={item.status === 'ready' ? 'text-cyan-600 mt-0.5' : 'text-slate-400 mt-0.5'}
                                        aria-hidden="true"
                                    />
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            {item.status === 'ready' ? 'Ready to review' : 'Pending your review'}
                                        </span>
                                    </span>
                                </button>

                                {isExpanded && (item.details || item.links) && (
                                    <div id={`onboarding-step-${item.id}`} className="px-4 pb-4 pl-11">
                                        {item.details && <p className="text-sm text-slate-600 mb-2">{item.details}</p>}
                                        <div className="space-y-1">
                                            {item.links?.map((link) => (
                                                link.external ? (
                                                    <a
                                                        key={link.label}
                                                        href={link.href}
                                                        className={`${inlineLinkClass} mr-4`}
                                                        target="_blank"
                                                        rel="noreferrer noopener"
                                                        aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                                                        onClick={() => {
                                                            setActionStatus(
                                                                `${link.label} opened from ${item.title}.`
                                                            );
                                                            trackOnboardingAction('checklist_link_clicked', {
                                                                step_id: item.id,
                                                                step_status: item.status,
                                                                destination: getAnalyticsDestination(link.href),
                                                                external: true,
                                                            });
                                                        }}
                                                    >
                                                        {link.label}
                                                        <ExternalLink size={12} aria-hidden="true" />
                                                    </a>
                                                ) : (
                                                    <Link
                                                        key={link.label}
                                                        href={link.href}
                                                        className={`${inlineLinkClass} mr-4`}
                                                        aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                                                        onClick={() => {
                                                            setActionStatus(
                                                                `${link.label} opened from ${item.title}.`
                                                            );
                                                            trackOnboardingAction('checklist_link_clicked', {
                                                                step_id: item.id,
                                                                step_status: item.status,
                                                                destination: link.href,
                                                                external: false,
                                                            });
                                                        }}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-8">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-5">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Onboarding support</p>
                        <p className="mb-3 text-sm text-slate-600">{siteEntity.supportHours}</p>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/help"
                                className={secondaryActionClass}
                                aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                                onClick={() => {
                                    setActionStatus('Opening help center from onboarding support.');
                                    trackOnboardingAction('support_transition_clicked', {
                                        destination: '/help',
                                    });
                                }}
                            >
                                <LifeBuoy size={14} aria-hidden="true" /> Open help center
                            </Link>
                            <Link
                                href="/contact?source=onboarding&intent=setup"
                                className={secondaryActionClass}
                                aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                                onClick={() => {
                                    setActionStatus('Opening contact support from onboarding support.');
                                    trackOnboardingAction('support_transition_clicked', {
                                        destination: '/contact?source=onboarding&intent=setup',
                                    });
                                }}
                            >
                                <Users size={14} aria-hidden="true" /> Contact support
                            </Link>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-describedby={ONBOARDING_ACTION_STATUS_ID}
                        onClick={() => {
                            setActionStatus('Onboarding review finished. Returning to the main Hylono route.');
                            trackOnboardingAction('finish_review_clicked');
                            onComplete();
                        }}
                        className={`w-full min-h-11 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold transition-colors hover:bg-slate-800 motion-reduce:transition-none ${focusRingClass}`}
                    >
                        Finish onboarding review
                    </button>
                </div>
            </motion.section>
        </div>
    );
};
