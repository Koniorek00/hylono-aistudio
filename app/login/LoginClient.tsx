'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn as authSignIn } from 'next-auth/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Headphones,
  AlertCircle,
  Loader2,
  X,
  Box,
  FileText,
  BarChart2,
  Calendar,
  Info,
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { DEFAULT_AUTH_SUCCESS_PATH } from '@/lib/auth-redirect';
import type { SocialAuthProviderOption } from '@/lib/auth-provider-types';
import { navigateWithScroll } from '@/src/lib/navigation';
import analytics from '@/src/lib/analytics';

const AUTH_SUBMIT_STATUS_ID = 'auth-submit-status';
const AUTH_ACTION_STATUS_ID = 'auth-action-status';
const AUTH_ERROR_MESSAGE_ID = 'auth-error-message';

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
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const msg = (error as { message: string }).message;
    return SAFE_CREDENTIAL_AUTH_MESSAGES.has(msg) ? msg : fallback;
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
  provider: string;
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.98 1.07.08 2.16-.54 2.81-1.32z" />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" width="18" height="18" aria-hidden="true">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function ProviderIcon({ id }: { id: string }) {
  switch (id) {
    case 'google':
      return <GoogleIcon className="shrink-0" />;
    case 'apple':
      return <AppleIcon className="shrink-0 text-slate-900" />;
    case 'facebook':
      return <FacebookIcon className="shrink-0" />;
    case 'microsoft':
    case 'azure-ad':
      return <MicrosoftIcon className="shrink-0" />;
    default:
      return (
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[11px] font-bold text-white uppercase shrink-0"
        >
          {id.charAt(0)}
        </span>
      );
  }
}

interface LoginClientProps {
  authRequired: boolean;
  callbackPath: string;
  socialProviders: SocialAuthProviderOption[];
}

export function LoginClient({
  authRequired,
  callbackPath,
  socialProviders,
}: LoginClientProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorScope, setErrorScope] = useState<AuthErrorScope | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [actionStatusMessage, setActionStatusMessage] = useState(
    'Auth dialog actions are ready.'
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigateWithScroll(router, '/');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [router]);

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
      redirectTo: callbackPath,
    });
    setStatus('loading');
    setErrorScope(null);
    setErrorMessage('');
    setLoadingMessage('Signing you in');

    try {
      const result = await authSignIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
        ...(callbackPath ? { redirectTo: callbackPath } : {}),
      });

      if (result?.error) {
        setStatus('error');
        setErrorScope('credentials');
        setLoadingMessage('');
        setErrorMessage(
          result.code === 'rate_limited'
            ? 'Too many sign-in attempts. Please wait a few minutes and try again.'
            : 'Invalid email or password.'
        );
        return;
      }

      if (result?.url) {
        window.location.assign(result.url);
        return;
      }

      setStatus('idle');
      setLoadingMessage('');
      router.push(callbackPath || DEFAULT_AUTH_SUCCESS_PATH);
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
      redirectTo: callbackPath,
    });

    try {
      await authSignIn(provider.id, {
        redirectTo: callbackPath || DEFAULT_AUTH_SUCCESS_PATH,
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

  const continuationLabel = getAuthContinuationLabel(callbackPath);
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

  return (
    <div className="loginPageRoot">
      {/* Background Architectural Canvas with Directional Scrim */}
      <div className="loginBgWrapper" aria-hidden="true">
        <Image
          src="/images/login/dusk-terrace.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="loginBgImage"
        />
        <div className="loginScrimOverlay" />
        <div className="loginAmbientGlow" />
      </div>

      {/* Primary Accessible Landmark & Viewport Container */}
      <div className="loginContentWrapper">
        <div className="loginSplitGrid">
          {/* Left Narrative Column */}
          <div className="loginNarrativeCol">
            {/* Brand Masthead */}
            <div>
              <Link
                href="/"
                className="loginBrandLink"
                aria-label="Hylono Home"
              >
                <span className="font-heading text-xl sm:text-2xl font-bold tracking-[0.25em] text-white uppercase">
                  HYLONO
                </span>
                <span className="mt-1 text-[10px] sm:text-xs font-semibold tracking-[0.22em] text-slate-300 uppercase font-sans">
                  WELLNESS TECHNOLOGIES / REAL PROGRESS
                </span>
              </Link>
            </div>

            {/* Editorial Lead Headline & Description */}
            <div>
              <p className="loginHeroHeading">
                Your next step continues here.
              </p>
              <p className="loginHeroLead">
                Sign in to your Hylono account to access your information and continue exploring our wellness technologies.
              </p>
            </div>

            {/* Quick Links Navigation */}
            <nav aria-label="Quick links" className="loginQuickNav">
              <ul className="loginQuickNavList">
                <li>
                  <Link href="/products" className="loginQuickNavLink">
                    <Box className="loginQuickNavIcon text-cyan-400" aria-hidden="true" />
                    <span>PRODUCTS</span>
                  </Link>
                </li>
                <li>
                  <Link href="/protocols" className="loginQuickNavLink">
                    <FileText className="loginQuickNavIcon text-purple-400" aria-hidden="true" />
                    <span>PROTOCOLS</span>
                  </Link>
                </li>
                <li>
                  <Link href="/research" className="loginQuickNavLink">
                    <BarChart2 className="loginQuickNavIcon text-emerald-400" aria-hidden="true" />
                    <span>RESEARCH</span>
                  </Link>
                </li>
                <li>
                  <Link href="/rental" className="loginQuickNavLink">
                    <Calendar className="loginQuickNavIcon text-amber-400" aria-hidden="true" />
                    <span>RENTALS</span>
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="loginQuickNavLink">
                    <Headphones className="loginQuickNavIcon text-cyan-400" aria-hidden="true" />
                    <span>SUPPORT</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Floating White Sanctuary Card */}
          <div className="loginCardContainer">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-modal-title"
              className="loginAuthCard"
            >
              <h1 className="sr-only">Login</h1>

              {/* Close / Return home action button */}
              <button
                type="button"
                onClick={() => {
                  setActionStatusMessage('Closing the login dialog.');
                  navigateWithScroll(router, '/');
                }}
                className="loginCloseButton"
                aria-label="Close login dialog"
                aria-describedby={AUTH_ACTION_STATUS_ID}
                onFocus={() => setActionStatusMessage('Close login dialog action focused.')}
              >
                <X size={18} aria-hidden="true" />
              </button>

              {/* Bento Grid: Main Form (Left) + Access Help Rail (Right) */}
              <div className="loginCardBento">
                {/* Main Form Sub-Column */}
                <div className="loginFormColumn">
                  <h2 id="login-modal-title" className="loginCardTitle">
                    Sign in to continue
                  </h2>
                  <p className="loginCardDescription">
                    Use your Hylono account email and password to continue. Access help is available below.
                  </p>

                  {/* Context-aware access warning notice */}
                  {authRequired ? (
                    <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-700">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <p className="font-semibold text-slate-900">Sign-in required</p>
                          <p className="mt-1">
                            You need to sign in before opening {continuationLabel}.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Loading status banner */}
                  {isLoading ? (
                    <div
                      className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-900"
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <div className="flex items-start gap-3">
                        <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-cyan-600" aria-hidden="true" />
                        <div>
                          <p className="font-semibold">Signing you in</p>
                          <p className="mt-1">{loadingMessage}.</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Error banner */}
                  {status === 'error' ? (
                    <div
                      className="mb-6 p-4 bg-red-50/90 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-3"
                      role="alert"
                      aria-live="assertive"
                      aria-atomic="true"
                    >
                      <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-red-900">Sign-in failed</p>
                        <p id={AUTH_ERROR_MESSAGE_ID} className="mt-1">
                          {errorBannerMessage}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Screen Reader Live Statuses */}
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

                  {/* Credential Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    aria-busy={isLoading}
                    aria-describedby={AUTH_SUBMIT_STATUS_ID}
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="auth-email"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                          aria-hidden="true"
                        />
                        <input
                          id="auth-email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          disabled={isLoading}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="loginInputField"
                          placeholder="your@email.com"
                          aria-describedby={authFieldDescriptionIds}
                          aria-invalid={isCredentialsError}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="auth-password"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                      >
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                          aria-hidden="true"
                        />
                        <input
                          id="auth-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={formData.password}
                          disabled={isLoading}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="loginInputField"
                          placeholder="Enter password"
                          aria-describedby={authFieldDescriptionIds}
                          aria-invalid={isCredentialsError}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowPassword(!showPassword);
                            setActionStatusMessage(
                              showPassword ? 'Password is hidden.' : 'Password is visible.'
                            );
                          }}
                          disabled={isLoading}
                          className="absolute right-2 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-controls="auth-password"
                          aria-pressed={showPassword}
                          aria-describedby={AUTH_ACTION_STATUS_ID}
                          onFocus={() => setActionStatusMessage('Password visibility toggle focused.')}
                        >
                          {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600">Minimum 6 characters.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      aria-describedby={authSubmitDescriptionIds}
                      className="loginSubmitButton"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                      <span>{isLoading ? 'Signing in' : 'Sign In'}</span>
                      {!isLoading && <ArrowRight size={16} aria-hidden="true" />}
                    </button>
                  </form>

                  {/* Social Sign-in Section */}
                  <div className="my-6 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                      OR CONTINUE WITH
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {socialProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => {
                          void handleSocialLogin(provider);
                        }}
                        disabled={isLoading || !provider.enabled}
                        className="loginSocialButton"
                        aria-disabled={!provider.enabled}
                        aria-describedby={AUTH_SUBMIT_STATUS_ID}
                        title={
                          provider.enabled
                            ? `Continue with ${provider.name}`
                            : `${provider.name} sign-in is unavailable in this environment`
                        }
                      >
                        <ProviderIcon id={provider.id} />
                        <span className="text-sm font-medium text-slate-700">
                          Continue with {provider.name}
                        </span>
                        {!provider.enabled && (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Unavailable
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {socialProviders.some((provider) => !provider.enabled) ? (
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                      Some social sign-in options are unavailable in this environment until their provider credentials are configured.
                    </p>
                  ) : null}
                </div>

                {/* Right Bento Rail: Access Help & Support */}
                <div className="loginHelpRail">
                  <div>
                    <div className="loginHelpRailHeader">
                      <div className="loginHelpIconBadge">
                        <Headphones size={20} aria-hidden="true" />
                      </div>
                      <h3 className="loginHelpTitle">Need access help?</h3>
                    </div>

                    <p className="loginHelpBody">
                      Open the Help Center or email {siteEntity.supportEmail} for access issues or provider setup.
                    </p>

                    <p className="loginHelpHours">
                      Support hours: {siteEntity.supportHours}.
                    </p>

                    <div className="mt-5 space-y-2.5">
                      <Link
                        href="/help"
                        {...getAuthActionStatusProps('Opening login help center support.')}
                        className="loginHelpButtonPrimary"
                      >
                        <span>Open Help Center</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>

                      <a
                        href={`mailto:${siteEntity.supportEmail}`}
                        {...getAuthActionStatusProps('Opening login support email.')}
                        className="loginHelpButtonSecondary"
                      >
                        <Mail size={14} aria-hidden="true" />
                        <span>Email {siteEntity.supportEmail}</span>
                      </a>
                    </div>
                  </div>

                  <div className="loginHelpFooterNote">
                    <FileText size={16} className="text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Use the support options above for access help. This screen is for sign-in only.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
