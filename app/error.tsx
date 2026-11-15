'use client';

import Link from 'next/link';
import { useState } from 'react';

const ROOT_ERROR_ACTION_STATUS_ID = 'root-error-action-status';
const ROOT_ERROR_ACTION_READY =
  'Root error recovery is ready. Try again retries this local page render without creating a support request, account change, or provider action.';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  const [actionStatus, setActionStatus] = useState(ROOT_ERROR_ACTION_READY);

  const handleRetry = () => {
    setActionStatus('Retrying this local page render. No support request, account change, or provider action was created.');
    reset();
  };

  return (
    <div
      role="alert"
      aria-labelledby="root-error-title"
      aria-describedby="root-error-description"
      className="flex min-h-[50vh] w-full items-center justify-center bg-slate-950 px-6 py-16 text-white"
    >
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 sm:p-10">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-amber-100">
          Something went wrong
        </p>
        <h2 id="root-error-title" className="font-editorial mt-3 break-words text-3xl text-white">
          Unexpected application error
        </h2>
        <p id="root-error-description" className="mt-3 break-words text-sm leading-6 text-slate-300">
          We couldn&apos;t load this section. Please try again. If the problem persists, contact
          support.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            aria-describedby={ROOT_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus(ROOT_ERROR_ACTION_READY)}
            onClick={handleRetry}
            className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            Try again
          </button>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            Contact support
          </Link>
        </div>
        {/* Announced to assistive tech only; it describes the action, it is not page copy. */}
        <div
          id={ROOT_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Root error action status"
          className="sr-only"
        >
          {actionStatus}
        </div>
      </div>
    </div>
  );
}
