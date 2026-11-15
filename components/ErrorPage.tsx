import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Home, Mail, HelpCircle, ShoppingBag,
    ArrowLeft, RefreshCw, AlertTriangle, Hexagon,
    MessageCircle, BookOpen, Zap
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import {
    summarizeClientComponentStackForLog,
    summarizeClientErrorForLog,
} from '@/utils/clientLogSafety';

interface ErrorPageProps {
    type?: '404' | 'error' | 'loading';
    message?: string;
    onNavigate?: (page: string) => void;
}

export const ERROR_PAGE_ACTION_STATUS_ID = 'error-page-action-status';

const ERROR_PAGE_ACTION_STATUS_LABEL = 'Error page action status';
const ERROR_PAGE_ACTION_READY_STATUS = 'Error page actions are ready.';

export const ErrorPage: React.FC<ErrorPageProps> = ({
    type = '404',
    message,
    onNavigate
}) => {
    const [actionStatus, setActionStatus] = useState(ERROR_PAGE_ACTION_READY_STATUS);
    const routeHref = (page: string) => (page === 'home' ? '/' : `/${page}`);

    const announceAction = (label: string, action = 'is ready') => {
        setActionStatus(`${label} ${action}.`);
    };

    const handleRouteClick = (page: string, label: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
        announceAction(label, 'selected');

        if (
            !onNavigate ||
            event.defaultPrevented ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        ) {
            return;
        }

        event.preventDefault();
        onNavigate(page);
    };

    const errorConfig = {
        '404': {
            title: "Page Not Found",
            subtitle: "The page you're looking for doesn't exist or has been moved.",
            icon: <AlertTriangle className="text-amber-500" size={48} strokeWidth={1.5} />
        },
        'error': {
            title: "Something Went Wrong",
            subtitle: message || "We encountered an unexpected error. Please try again.",
            icon: <Zap className="text-red-500" size={48} strokeWidth={1.5} />
        },
        'loading': {
            title: "Loading Failed",
            subtitle: "The content couldn't be loaded. Check your connection and try again.",
            icon: <RefreshCw className="text-cyan-500" size={48} strokeWidth={1.5} />
        }
    };

    const config = errorConfig[type];

    const quickLinks = [
        { icon: Home, label: "Homepage", page: "home", desc: "Return to the main page" },
        { icon: ShoppingBag, label: "Store", page: "store", desc: "Browse our products" },
        { icon: HelpCircle, label: "FAQ", page: "faq", desc: "Find answers" },
        { icon: BookOpen, label: "Knowledge Hub", page: "blog", desc: "Read our articles" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                {/* Error Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
                                {config.icon}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 futuristic-font">
                                {config.title}
                            </h1>
                            <p className="text-slate-400 text-sm max-w-md mx-auto">
                                {config.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-8">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                            Quick Actions
                        </h2>

                        <p
                            id={ERROR_PAGE_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={ERROR_PAGE_ACTION_STATUS_LABEL}
                            className="sr-only"
                        >
                            {actionStatus}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={routeHref(link.page)}
                                    aria-describedby={ERROR_PAGE_ACTION_STATUS_ID}
                                    onFocus={() => announceAction(link.label)}
                                    onClick={handleRouteClick(link.page, link.label)}
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-cyan-300 hover:bg-cyan-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-cyan-100 flex items-center justify-center transition-colors">
                                        <link.icon size={18} className="text-slate-500 group-hover:text-cyan-600" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-800">{link.label}</span>
                                        <span className="block text-[10px] text-slate-400">{link.desc}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Try Again Button */}
                        {type !== '404' && (
                            <button
                                type="button"
                                aria-describedby={ERROR_PAGE_ACTION_STATUS_ID}
                                onFocus={() => announceAction('Try again')}
                                onClick={() => {
                                    announceAction('Try again', 'selected');
                                    window.location.reload();
                                }}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mb-8"
                            >
                                <RefreshCw size={14} />
                                Try Again
                            </button>
                        )}

                        {/* Divider */}
                        <div className="border-t border-slate-100 pt-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                                Need Help?
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    href="/help"
                                    aria-describedby={ERROR_PAGE_ACTION_STATUS_ID}
                                    onFocus={() => announceAction('Help Center')}
                                    onClick={handleRouteClick('help', 'Help Center')}
                                    className="flex min-h-11 items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                                >
                                    <MessageCircle size={16} className="text-cyan-500" />
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-700">Help Center</span>
                                        <span className="block text-[9px] text-slate-400">{siteEntity.supportCoverageLabel}</span>
                                    </div>
                                </Link>

                                <a
                                    href={`mailto:${siteEntity.supportEmail}`}
                                    aria-describedby={ERROR_PAGE_ACTION_STATUS_ID}
                                    onFocus={() => announceAction('Email Support')}
                                    onClick={() => announceAction('Email Support', 'selected')}
                                    className="flex min-h-11 items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                                >
                                    <Mail size={16} className="text-purple-500" />
                                    <div className="text-left">
                                        <span className="block text-xs font-semibold text-slate-700">Email Support</span>
                                        <span className="block text-[9px] text-slate-400">{siteEntity.supportEmail}</span>
                                    </div>
                                </a>

                                <Link
                                    href="/contact"
                                    aria-describedby={ERROR_PAGE_ACTION_STATUS_ID}
                                    onFocus={() => announceAction('Contact Hylono')}
                                    onClick={handleRouteClick('contact', 'Contact Hylono')}
                                    className="flex min-h-11 items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                                >
                                    <HelpCircle size={16} className="text-emerald-500" />
                                    <div>
                                        <span className="block text-xs font-semibold text-slate-700">Contact Hylono</span>
                                        <span className="block text-[9px] text-slate-400">{siteEntity.supportHours}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-t border-slate-100">
                        <button
                            type="button"
                            aria-describedby={ERROR_PAGE_ACTION_STATUS_ID}
                            onFocus={() => announceAction('Go Back')}
                            onClick={() => {
                                announceAction('Go Back', 'selected');
                                window.history.back();
                            }}
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Go Back
                        </button>

                        <div className="flex items-center gap-2 text-slate-400">
                            <Hexagon size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Hylono</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Error Boundary Component
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; onNavigate?: (page: string) => void },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode; onNavigate?: (page: string) => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary', {
            error: summarizeClientErrorForLog(error),
            componentStack: summarizeClientComponentStackForLog(errorInfo.componentStack),
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorPage
                    type="error"
                    message={this.state.error?.message}
                    onNavigate={this.props.onNavigate}
                />
            );
        }

        return this.props.children;
    }
}

// 404 Page Export
export const NotFoundPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => (
    <ErrorPage type="404" onNavigate={onNavigate} />
);

// Loading Failed Export
export const LoadingFailedPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => (
    <ErrorPage type="loading" onNavigate={onNavigate} />
);
