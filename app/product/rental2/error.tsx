'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, TriangleAlert } from 'lucide-react';

interface ProductRental2ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const buttonClass =
  'inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 focus-visible:ring-offset-2';
const RENTAL2_ERROR_ACTION_STATUS_ID = 'rental2-error-action-status';
const RENTAL2_ERROR_ACTION_READY =
  'Rental clone error recovery is ready. Try again retries this local route render, while the rental hub link leaves the error state without changing provider data.';

export default function ProductRental2Error({
  error: _error,
  reset,
}: ProductRental2ErrorProps) {
  const [actionStatus, setActionStatus] = useState(RENTAL2_ERROR_ACTION_READY);

  const handleRetry = () => {
    setActionStatus('Retrying the upgraded rental page render. No provider, checkout, or support action was created.');
    reset();
  };

  return (
    <section
      role="alert"
      aria-labelledby="rental2-error-title"
      aria-describedby="rental2-error-description"
      className="min-h-screen bg-slate-950 px-4 pb-20 pt-20 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center shadow-none backdrop-blur sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
          <TriangleAlert size={24} />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Rental clone state
        </p>
        <h1 id="rental2-error-title" className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          The upgraded rental page could not load
        </h1>
        <p id="rental2-error-description" className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          Reload the page or step back to the canonical rental hub while this request retries.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            aria-describedby={RENTAL2_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus(RENTAL2_ERROR_ACTION_READY)}
            onClick={handleRetry}
            className={`${buttonClass} bg-cyan-300 text-slate-950 hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:ring-offset-slate-950`}
          >
            <RefreshCw size={16} className="mr-2" />
            Try again
          </button>
          <Link
            href="/rental"
            aria-describedby={RENTAL2_ERROR_ACTION_STATUS_ID}
            onFocus={() => setActionStatus('Canonical rental hub is ready from the rental clone recovery state.')}
            onClick={() => setActionStatus('Opening the canonical rental hub from rental clone recovery.')}
            className={`${buttonClass} border border-white/10 bg-white/[0.045] text-slate-200 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-cyan-100 focus-visible:ring-offset-slate-950`}
          >
            Open canonical rental hub
          </Link>
        </div>
        <div
          id={RENTAL2_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Rental2 error action status"
          className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-50"
        >
          {actionStatus}
        </div>
      </div>
    </section>
  );
}
