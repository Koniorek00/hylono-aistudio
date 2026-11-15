
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { signIn as authSignIn, signOut as authSignOut } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff, X, UserCircle, Package, Settings, LogOut, AlertCircle, Loader2, LifeBuoy, RotateCcw } from 'lucide-react';
import { siteEntity } from '../content/site-entity';
import { DEFAULT_AUTH_SUCCESS_PATH } from '../lib/auth-redirect';
import type { SocialAuthProviderId, SocialAuthProviderOption } from '../lib/auth-provider-types';
import { TechType } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { OptimizedImage } from './shared/OptimizedImage';
import analytics from '../src/lib/analytics';

const SOCIAL_PROVIDER_BADGE_STYLES: Record<SocialAuthProviderId, string> = {
    google: 'bg-red-50 text-red-600',
    facebook: 'bg-blue-50 text-blue-600',
    apple: 'bg-slate-900 text-white',
};

const SocialProviderBadge: React.FC<{ provider: SocialAuthProviderOption }> = ({
    provider,
}) => (
    <span
        aria-hidden="true"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black uppercase ${SOCIAL_PROVIDER_BADGE_STYLES[provider.id]}`}
    >
        {provider.name.charAt(0)}
    </span>
);

const HELP_CENTER_PATH = '/help';
const AUTH_SUBMIT_STATUS_ID = 'auth-submit-status';
const AUTH_ACTION_STATUS_ID = 'auth-action-status';
const AUTH_ERROR_MESSAGE_ID = 'auth-error-message';
const ACCOUNT_ACTION_STATUS_ID = 'account-action-status';

type AuthErrorScope = 'credentials' | 'social';

const SAFE_CREDENTIAL_AUTH_MESSAGES = new Set([
    'Invalid email or password.',
    'Too many sign-in attempts. Please wait a few minutes and try again.',
]);

const getAuthContinuationLabel = (redirectTo?: string) =>
    redirectTo?.startsWith('/account') ? 'your Hylono account' : 'your requested page';

const getAuthErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return SAFE_CREDENTIAL_AUTH_MESSAGES.has(error.message) ? error.message : fallback;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
    ) {
        return SAFE_CREDENTIAL_AUTH_MESSAGES.has(error.message) ? error.message : fallback;
    }

    return fallback;
};

const getCredentialValidationMessage = ({
    email,
    password,
}: {
    email: string;
    password: string;
}) => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail && !password) {
        return 'Enter your email and password to sign in.';
    }

    if (!normalizedEmail) {
        return 'Enter your email address.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return 'Enter a valid email address.';
    }

    if (!password) {
        return 'Enter your password.';
    }

    if (password.length < 6) {
        return 'Password must be at least 6 characters.';
    }

    return null;
};

const getRedirectScope = (redirectTo?: string) => {
    if (!redirectTo) {
        return 'default';
    }

    if (redirectTo.startsWith('/account')) {
        return 'account';
    }

    if (redirectTo.startsWith('/nexus')) {
        return 'nexus';
    }

    return 'other';
};

const trackLoginAttempt = ({
    authRequired,
    method,
    provider,
    redirectTo,
}: {
    authRequired: boolean;
    method: 'credentials' | 'social';
    provider: SocialAuthProviderId | 'credentials';
    redirectTo?: string;
}) => {
    analytics.capture('login_attempt', {
        auth_required: authRequired,
        method,
        provider,
        redirect_scope: getRedirectScope(redirectTo),
        redirect_target_present: Boolean(redirectTo),
        route: '/login',
    });
};

// --- Main Login Modal ---
interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    authRequired?: boolean;
    redirectTo?: string;
    socialProviders: SocialAuthProviderOption[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    authRequired = false,
    redirectTo,
    socialProviders,
}) => {
    const signIn = async ({ email, password }: { email: string; password: string }) => {
        const result = await authSignIn('credentials', {
            email,
            password,
            redirect: false,
            ...(redirectTo ? { redirectTo } : {}),
        });
        if (result?.error) {
            return {
                error: {
                    message:
                        result.code === 'rate_limited'
                            ? 'Too many sign-in attempts. Please wait a few minutes and try again.'
                            : 'Invalid email or password.',
                },
            };
        }
        return { error: null, url: result?.url ?? null };
    };

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorScope, setErrorScope] = useState<AuthErrorScope | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [actionStatusMessage, setActionStatusMessage] = useState(
        'Auth dialog actions are ready.'
    );

    // Focus trap for accessibility
    const trapRef = useFocusTrap({
        active: isOpen,
        escapeDeactivates: false,
        clickOutsideDeactivates: false
    });

    const resetState = React.useCallback(() => {
        setFormData({ email: '', password: '' });
        setStatus('idle');
        setErrorScope(null);
        setErrorMessage('');
        setLoadingMessage('');
    }, []);

    useEffect(() => {
        if (!isOpen) resetState();
    }, [isOpen, resetState]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;

            event.preventDefault();
            onClose();
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationMessage = getCredentialValidationMessage(formData);

        if (validationMessage) {
            setStatus('error');
            setErrorScope('credentials');
            setLoadingMessage('');
            setErrorMessage(validationMessage);
            return;
        }

        trackLoginAttempt({
            authRequired,
            method: 'credentials',
            provider: 'credentials',
            redirectTo,
        });
        setStatus('loading');
        setErrorScope(null);
        setErrorMessage('');
        setLoadingMessage('Signing you in');

        try {
            const { error, url } = await signIn({
                email: formData.email.trim(),
                password: formData.password
            });
            if (error) throw error;
            if (url && redirectTo) {
                window.location.assign(url);
                return;
            }
            setStatus('idle');
            setLoadingMessage('');
            onClose();
        } catch (err: unknown) {
            setStatus('error');
            setErrorScope('credentials');
            setLoadingMessage('');
            setErrorMessage(
                getAuthErrorMessage(
                    err,
                    'Check your email and password and try again.'
                )
            );
        }
    };

    const handleSocialLogin = async (provider: SocialAuthProviderOption) => {
        if (!provider.enabled) {
            return;
        }

        setStatus('loading');
        setErrorScope(null);
        setErrorMessage('');
        setLoadingMessage(`Starting ${provider.name} sign-in`);
        trackLoginAttempt({
            authRequired,
            method: 'social',
            provider: provider.id,
            redirectTo,
        });

        try {
            await authSignIn(provider.id, {
                redirectTo: redirectTo ?? DEFAULT_AUTH_SUCCESS_PATH,
            });
            setStatus('idle');
            setLoadingMessage('');
        } catch {
            setStatus('error');
            setErrorScope('social');
            setLoadingMessage('');
            setErrorMessage(`Could not start ${provider.name} sign-in. Please try again.`);
        }
    };

    const continuationLabel = getAuthContinuationLabel(redirectTo);
    const isCredentialsError = status === 'error' && errorScope === 'credentials';
    const isLoading = status === 'loading';
    const errorBannerMessage =
        errorScope === 'credentials'
            ? `Sign-in failed. ${errorMessage}`
            : errorMessage;
    const authSubmitStatusMessage =
        status === 'loading'
            ? `${loadingMessage}.`
            : status === 'error'
                ? errorBannerMessage
                : 'Ready to sign in with your Hylono account credentials.';
    const authSubmitDescriptionIds = isCredentialsError
        ? `${AUTH_SUBMIT_STATUS_ID} ${AUTH_ERROR_MESSAGE_ID}`
        : AUTH_SUBMIT_STATUS_ID;
    const authFieldDescriptionIds = isCredentialsError
        ? `${AUTH_SUBMIT_STATUS_ID} ${AUTH_ERROR_MESSAGE_ID}`
        : AUTH_SUBMIT_STATUS_ID;
    const getAuthActionStatusProps = (message: string) => ({
        'aria-describedby': AUTH_ACTION_STATUS_ID,
        onClick: () => setActionStatusMessage(message),
        onFocus: () => setActionStatusMessage(message),
    });
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: reduceMotion ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: reduceMotion ? 1 : 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        data-login-backdrop=""
                        onClick={onClose}
                    />

                    <motion.div
                        ref={trapRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="login-modal-title"
                        initial={{ opacity: reduceMotion ? 1 : 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: reduceMotion ? 1 : 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.2 }}
                        className="relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-lg bg-white p-8"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setActionStatusMessage('Closing the login dialog.');
                                onClose();
                            }}
                            className="absolute top-4 right-4 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0"
                            aria-label="Close login dialog"
                            aria-describedby={AUTH_ACTION_STATUS_ID}
                            onFocus={() => setActionStatusMessage('Close login dialog action focused.')}
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <h1 className="sr-only">Login</h1>
                            <motion.div
                                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                                className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4"
                            >
                                <User className="text-white" size={28} />
                            </motion.div>
                            <h2 id="login-modal-title" className="text-2xl font-bold text-slate-900">
                                Sign in to continue
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Use your Hylono account email and password to continue. Access help is available below.
                            </p>
                        </div>

                        {authRequired ? (
                            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                <p className="font-semibold text-slate-900">Sign-in required</p>
                                <p className="mt-1">You need to sign in before opening {continuationLabel}.</p>
                            </div>
                        ) : null}

                        {isLoading ? (
                            <div className="mb-6 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900" role="status" aria-live="polite" aria-atomic="true">
                                <div className="flex items-start gap-3">
                                    <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin" />
                                    <div>
                                        <p className="font-semibold">Signing you in</p>
                                        <p className="mt-1">{loadingMessage}.</p>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {status === 'error' ? (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-3" role="alert" aria-live="assertive" aria-atomic="true">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900">Sign-in failed</p>
                                    <p id={AUTH_ERROR_MESSAGE_ID} className="mt-1">{errorBannerMessage}</p>
                                </div>
                            </div>
                        ) : null}

                        <p
                            id={AUTH_SUBMIT_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Auth form submit status"
                            className="sr-only"
                        >
                            {authSubmitStatusMessage}
                        </p>
                        <p
                            id={AUTH_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Auth dialog action status"
                            className="sr-only"
                        >
                            {actionStatusMessage}
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            aria-busy={isLoading}
                            aria-describedby={AUTH_SUBMIT_STATUS_ID}
                            noValidate
                        >

                                <div>
                                    <label htmlFor="auth-email" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                id="auth-email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                disabled={isLoading}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                                placeholder="your@email.com"
                                                aria-describedby={authFieldDescriptionIds}
                                                aria-invalid={isCredentialsError}
                                            />
                                    </div>
                                </div>

                                <div>
                                    <div>
                                        <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                id="auth-password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                value={formData.password}
                                                disabled={isLoading}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                                placeholder="Enter password"
                                                aria-describedby={authFieldDescriptionIds}
                                                aria-invalid={isCredentialsError}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPassword(!showPassword);
                                                    setActionStatusMessage(
                                                        showPassword
                                                            ? 'Password is hidden.'
                                                            : 'Password is visible.'
                                                    );
                                                }}
                                                disabled={isLoading}
                                                className="absolute right-2 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:text-slate-300 motion-reduce:transition-none motion-reduce:duration-0"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                aria-controls="auth-password"
                                                aria-pressed={showPassword}
                                                aria-describedby={AUTH_ACTION_STATUS_ID}
                                                onFocus={() => setActionStatusMessage('Password visibility toggle focused.')}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    aria-describedby={authSubmitDescriptionIds}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none motion-reduce:duration-0"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {isLoading ? 'Signing in' : 'Sign In'}
                                </button>
                            </form>

                        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-900">Need access help?</p>
                            <p className="mt-1">
                                Open the Help Center or email {siteEntity.supportEmail} for access issues or provider setup. Support hours: {siteEntity.supportHours}.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                                <Link
                                    href={HELP_CENTER_PATH}
                                    {...getAuthActionStatusProps('Opening login help center support.')}
                                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0"
                                >
                                    Open Help Center
                                </Link>
                                <a
                                    href={`mailto:${siteEntity.supportEmail}`}
                                    {...getAuthActionStatusProps('Opening login support email.')}
                                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0"
                                >
                                    Email {siteEntity.supportEmail}
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative bg-white px-4 text-xs text-slate-600">OR CONTINUE WITH</div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {socialProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    type="button"
                                    onClick={() => {
                                        void handleSocialLogin(provider);
                                    }}
                                    disabled={isLoading || !provider.enabled}
                                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0 ${
                                        provider.enabled
                                            ? 'hover:bg-slate-50'
                                            : 'cursor-not-allowed bg-slate-50 opacity-70'
                                    }`}
                                    aria-disabled={!provider.enabled}
                                    aria-describedby={AUTH_SUBMIT_STATUS_ID}
                                    title={
                                        provider.enabled
                                            ? `Continue with ${provider.name}`
                                            : `${provider.name} sign-in is unavailable in this environment`
                                    }
                                >
                                    <SocialProviderBadge provider={provider} />
                                    <span className="text-sm font-medium text-slate-700">
                                        Continue with {provider.name}
                                    </span>
                                    {!provider.enabled ? (
                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Unavailable
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                        </div>

                        {socialProviders.some((provider) => !provider.enabled) ? (
                            <p className="mt-3 text-xs leading-relaxed text-slate-400">
                                Some social sign-in options are unavailable in this environment
                                until their provider credentials are configured.
                            </p>
                        ) : null}

                        <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">
                            Use the support options above for access help. This screen is for sign-in only.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

type AccountTabId = 'orders' | 'rentals' | 'profile' | 'settings';

interface AccountRental {
    id: string;
    productTitle: string;
    image: string;
    statusLabel: string;
    startDate: string;
    endDate: string;
}

interface AccountEmptyStateProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description: string;
    primaryActionLabel?: string;
    primaryActionHref?: string;
    onPrimaryAction?: () => void;
    getActionStatusProps: (message: string) => {
        'aria-describedby': string;
        onClick: () => void;
        onFocus: () => void;
    };
}

const accountActionClassName =
    'inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0';

const accountPrimaryActionClassName =
    'inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0';

const AccountSupportActions: React.FC<Pick<AccountEmptyStateProps, 'getActionStatusProps'>> = ({
    getActionStatusProps,
}) => (
    <div className="mt-4 flex flex-wrap gap-3">
        <Link
            href="/help"
            {...getActionStatusProps('Opening account help center support.')}
            className={accountActionClassName}
        >
            Open Help Center
        </Link>
        <a
            href={`mailto:${siteEntity.supportEmail}`}
            {...getActionStatusProps('Opening account support email.')}
            className={accountActionClassName}
        >
            Email {siteEntity.supportEmail}
        </a>
    </div>
);

const AccountEmptyState: React.FC<AccountEmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    primaryActionLabel,
    primaryActionHref,
    onPrimaryAction,
    getActionStatusProps,
}) => {
    const primaryActionStatusProps = primaryActionLabel
        ? getActionStatusProps(`Opening ${primaryActionLabel} from ${title}.`)
        : null;

    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <Icon size={44} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">{description}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
                {primaryActionLabel && primaryActionHref && primaryActionStatusProps ? (
                    <Link
                        href={primaryActionHref}
                        {...primaryActionStatusProps}
                        onClick={() => {
                            primaryActionStatusProps.onClick();
                            onPrimaryAction?.();
                        }}
                        className={accountPrimaryActionClassName}
                    >
                        {primaryActionLabel}
                    </Link>
                ) : primaryActionLabel && onPrimaryAction && primaryActionStatusProps ? (
                    <button
                        type="button"
                        {...primaryActionStatusProps}
                        onClick={() => {
                            primaryActionStatusProps.onClick();
                            onPrimaryAction();
                        }}
                        className={accountPrimaryActionClassName}
                    >
                        {primaryActionLabel}
                    </button>
                ) : null}
                <Link
                    href="/help"
                    {...getActionStatusProps(`Opening account help from ${title}.`)}
                    className={accountActionClassName}
                >
                    Get account help
                </Link>
            </div>
        </div>
    );
};

// --- Account Dashboard Component ---
export const AccountPage: React.FC<{
    onNavigate: (page: string, tech?: TechType, mode?: string) => void;
    ownedTech?: TechType[];
    sessionUser?: {
        email?: string | null;
        name?: string | null;
    } | null;
}> = ({ onNavigate, sessionUser = null }) => {
    const user = sessionUser;
    const isPreviewMode = !user?.email;
    const displayName = user?.name ?? user?.email ?? 'Guest Preview';
    const signOut = () => {
        void authSignOut({ callbackUrl: '/' });
    };
    const [activeTab, setActiveTab] = useState<AccountTabId>('profile');
    const [accountActionStatus, setAccountActionStatus] = useState(
        'Account workspace actions are ready.'
    );
    const accountRentalsEnabled = useFeatureFlag('feature_account_rentals');

    const activeRentals: AccountRental[] = [];

    const tabs: Array<{ id: AccountTabId; label: string; icon: React.ComponentType<{ size?: number }> }> = [
        { id: 'orders', label: 'Orders', icon: Package },
        ...(accountRentalsEnabled ? [{ id: 'rentals' as const, label: 'Rentals', icon: RotateCcw }] : []),
        { id: 'profile', label: 'Profile', icon: UserCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const focusTabByIndex = (nextIndex: number) => {
        const nextTab = tabs[nextIndex];
        if (!nextTab) {
            return;
        }

        setActiveTab(nextTab.id);
        setAccountActionStatus(`${nextTab.label} account section selected.`);
        tabRefs.current[nextIndex]?.focus();
    };

    const getAccountActionStatusProps = (message: string) => ({
        'aria-describedby': ACCOUNT_ACTION_STATUS_ID,
        onClick: () => setAccountActionStatus(message),
        onFocus: () => setAccountActionStatus(message),
    });

    const selectAccountTab = (tab: { id: AccountTabId; label: string }) => {
        setActiveTab(tab.id);
        setAccountActionStatus(`${tab.label} account section selected.`);
    };

    const handleTabKeyDown = (
        event: React.KeyboardEvent<HTMLButtonElement>,
        currentIndex: number
    ) => {
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                focusTabByIndex((currentIndex + 1) % tabs.length);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                focusTabByIndex((currentIndex - 1 + tabs.length) % tabs.length);
                break;
            case 'Home':
                event.preventDefault();
                focusTabByIndex(0);
                break;
            case 'End':
                event.preventDefault();
                focusTabByIndex(tabs.length - 1);
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="mx-auto max-w-5xl px-6">
                <p
                    id={ACCOUNT_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Account action status"
                    className="sr-only"
                >
                    {accountActionStatus}
                </p>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Private workspace</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">My Account</h1>
                        <p className="mt-2 text-sm text-slate-600">Welcome back, {displayName}</p>
                    </div>
                    {isPreviewMode ? (
                        <span className="inline-flex min-h-11 items-center rounded-lg bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-800">
                            Preview Mode
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setAccountActionStatus('Signing out of the account workspace.');
                                signOut();
                            }}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0"
                            aria-label="Sign out of your Hylono account"
                            aria-describedby={ACCOUNT_ACTION_STATUS_ID}
                            onFocus={() => setAccountActionStatus('Sign out action focused.')}
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    )}
                </div>

                {isPreviewMode ? (
                    <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900" role="status">
                        <p className="font-semibold">Preview account shell</p>
                        <p className="mt-1">
                            Authentication is not active in this environment, so member actions stay unavailable until sign-in is configured.
                        </p>
                    </div>
                ) : null}

                <div className="mb-8 rounded-lg border border-slate-200 bg-white px-5 py-4">
                    <div className="flex items-start gap-3">
                        <LifeBuoy size={20} className="mt-0.5 shrink-0 text-cyan-600" />
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Account support</h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                Use Help Center guidance or email {siteEntity.supportEmail} for access, order, or profile questions.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Support hours: {siteEntity.supportHours}.</p>
                            <AccountSupportActions getActionStatusProps={getAccountActionStatusProps} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-4">
                    <div
                        className="space-y-2"
                        role="tablist"
                        aria-label="Account sections"
                        aria-orientation="vertical"
                    >
                        {tabs.map((tab, index) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    id={`account-tab-${tab.id}`}
                                    ref={(tabElement) => {
                                        tabRefs.current[index] = tabElement;
                                    }}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`account-panel-${tab.id}`}
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => selectAccountTab(tab)}
                                    onFocus={() => setAccountActionStatus(`${tab.label} account section focused.`)}
                                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                                    aria-describedby={ACCOUNT_ACTION_STATUS_ID}
                                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none motion-reduce:duration-0 ${
                                        isActive
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <tab.icon size={18} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        id={`account-panel-${activeTab}`}
                        role="tabpanel"
                        aria-labelledby={`account-tab-${activeTab}`}
                        className="rounded-lg border border-slate-100 bg-white p-6 md:col-span-3 md:p-8"
                    >
                        {accountRentalsEnabled && activeTab === 'rentals' ? (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Rentals</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Rental records appear here only when they are connected to the signed-in account.
                                </p>

                                {activeRentals.length === 0 ? (
                                    <div className="mt-6">
                                        <AccountEmptyState
                                            icon={RotateCcw}
                                            title="No rental records available"
                                            description="There are no rental records to show in this account shell. Open rental planning for current access options or contact support for an existing rental."
                                            primaryActionLabel="Explore rentals"
                                            primaryActionHref="/rental"
                                            onPrimaryAction={() => onNavigate('rental')}
                                            getActionStatusProps={getAccountActionStatusProps}
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-4">
                                        {activeRentals.map((rental) => (
                                            <article key={rental.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                                <div className="flex flex-col gap-4 md:flex-row">
                                                    <OptimizedImage
                                                        src={rental.image}
                                                        alt={rental.productTitle}
                                                        width={160}
                                                        height={112}
                                                        sizes="(max-width: 768px) 100vw, 160px"
                                                        className="h-28 w-full rounded-lg bg-slate-100 object-cover md:w-40"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h3 className="font-bold text-slate-900">{rental.productTitle}</h3>
                                                            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                                {rental.statusLabel}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-600">Period: {rental.startDate} to {rental.endDate}</p>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Orders</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Order records appear here only when they are connected to the signed-in account.
                                </p>
                                <div className="mt-6">
                                    <AccountEmptyState
                                        icon={Package}
                                        title="No order records available"
                                        description="There are no order records to show in this account shell. Browse the store or contact support for help with an existing purchase."
                                        primaryActionLabel="Browse store"
                                        primaryActionHref="/store"
                                        onPrimaryAction={() => onNavigate('store')}
                                        getActionStatusProps={getAccountActionStatusProps}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Profile</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Profile values are read-only here until account editing is connected.
                                </p>
                                <div className="mt-6 max-w-md space-y-6">
                                    <div>
                                        <label htmlFor="account-profile-name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Name</label>
                                        <input id="account-profile-name" type="text" readOnly value={user?.name || ''} aria-describedby={ACCOUNT_ACTION_STATUS_ID} onFocus={() => setAccountActionStatus('Profile name is read-only until account editing is connected.')} className="min-h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="account-profile-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
                                        <input id="account-profile-email" type="email" readOnly value={user?.email ?? ''} aria-describedby={ACCOUNT_ACTION_STATUS_ID} onFocus={() => setAccountActionStatus('Profile email is read-only until account editing is connected.')} className="min-h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500" />
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                        Need to update account details? Use the support links above so the change can be handled with account verification.
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeTab === 'settings' ? (
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Settings</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Settings controls stay hidden until the connected account service is available.
                                </p>
                                <div className="mt-6">
                                    <AccountEmptyState
                                        icon={Settings}
                                        title="Settings are not available yet"
                                        description="Notification, language, data export, and connected-device controls are not active in this account shell."
                                        getActionStatusProps={getAccountActionStatusProps}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
