'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, LifeBuoy, LockKeyhole, RefreshCw } from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';

const ACCOUNT_ERROR_ACTION_STATUS_ID = 'account-error-action-status';
const ACCOUNT_ERROR_ACTION_READY =
  'Account error recovery is ready. Try again retries this local account render, while sign-in and Help Center links leave the error state without changing provider data.';
const accountAccessHref = buildLoginRedirectPath('/account');
const accountErrorActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const accountErrorPrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function AccountError({ reset }: { reset: () => void }) {
  const [actionStatus, setActionStatus] = useState(ACCOUNT_ERROR_ACTION_READY);

  const handleRetry = () => {
    setActionStatus('Retrying the account workspace render. No account, provider, or support request was changed.');
    reset();
  };

  return (
    <section
      role="alert"
      aria-labelledby="account-error-title"
      aria-describedby="account-error-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
          <AlertTriangle className="h-3.5 w-3.5" />
          Account recovery
        </div>
        <h1
          id="account-error-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Account workspace needs a reload.
        </h1>
        <p
          id="account-error-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          The private account shell did not finish rendering. Try again, return to sign in, or open Help Center if account access remains unavailable.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            aria-describedby={ACCOUNT_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus(ACCOUNT_ERROR_ACTION_READY)}
            onClick={handleRetry}
            className={accountErrorPrimaryActionClassName}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href={accountAccessHref}
            aria-describedby={ACCOUNT_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus('Return to sign in is ready for account recovery.')}
            onClick={() => setActionStatus('Opening sign-in recovery for the account workspace.')}
            className={accountErrorActionClassName}
          >
            <LockKeyhole className="h-4 w-4" />
            Return to sign in
          </Link>
          <Link
            href="/help"
            aria-describedby={ACCOUNT_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus('Help Center is ready for account recovery.')}
            onClick={() => setActionStatus('Opening Help Center from account recovery.')}
            className={accountErrorActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
        </div>
        <div
          id={ACCOUNT_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Account error action status"
          className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-50"
        >
          {actionStatus}
        </div>
      </div>
    </section>
  );
}
