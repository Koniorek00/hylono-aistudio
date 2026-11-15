'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, LifeBuoy, LockKeyhole, RefreshCw } from 'lucide-react';

interface LoginErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const LOGIN_ERROR_ACTION_STATUS_ID = 'login-error-action-status';
const LOGIN_ERROR_ACTION_READY =
  'Sign-in error recovery is ready. Try again retries this local access render, while sign-in and Help Center links leave the error state without account or provider changes.';
const loginErrorActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const loginErrorPrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function LoginError({ error: _error, reset }: LoginErrorProps) {
  const [actionStatus, setActionStatus] = useState(LOGIN_ERROR_ACTION_READY);

  const handleRetry = () => {
    setActionStatus('Retrying the sign-in screen render. No account, provider, or support request was changed.');
    reset();
  };

  return (
    <section
      role="alert"
      aria-labelledby="login-error-title"
      aria-describedby="login-error-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
          <AlertTriangle className="h-3.5 w-3.5" />
          Sign-in recovery
        </div>
        <h1
          id="login-error-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Sign-in needs a reload.
        </h1>
        <p
          id="login-error-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          The account access screen did not finish rendering. Try again, return to
          sign in, or open Help Center if access remains unavailable.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            aria-describedby={LOGIN_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus(LOGIN_ERROR_ACTION_READY)}
            onClick={handleRetry}
            className={loginErrorPrimaryActionClassName}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/login?auth=required"
            aria-describedby={LOGIN_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus('Return to sign in is ready for access recovery.')}
            onClick={() => setActionStatus('Opening sign-in recovery.')}
            className={loginErrorActionClassName}
          >
            <LockKeyhole className="h-4 w-4" />
            Return to sign in
          </Link>
          <Link
            href="/help"
            aria-describedby={LOGIN_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus('Help Center is ready for sign-in recovery.')}
            onClick={() => setActionStatus('Opening Help Center from sign-in recovery.')}
            className={loginErrorActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
        </div>
        <div
          id={LOGIN_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Login error action status"
          className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-50"
        >
          {actionStatus}
        </div>
      </div>
    </section>
  );
}
