'use client';

import { useState } from 'react';
// global-error replaces the root layout, so it must bring its own stylesheet.
import './globals.css';

const GLOBAL_ERROR_ACTION_STATUS_ID = 'global-error-action-status';
const GLOBAL_ERROR_ACTION_READY =
  'Global error recovery is ready. Try again retries this local page render without creating a support request, account change, or provider action.';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error: _error, reset }: GlobalErrorProps) {
  const [actionStatus, setActionStatus] = useState(GLOBAL_ERROR_ACTION_READY);

  const handleRetry = () => {
    setActionStatus('Retrying this local page render. No support request, account change, or provider action was created.');
    reset();
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 sm:p-10">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-amber-100">
            Application Error
          </p>
          <h1 className="font-editorial mt-3 break-words text-4xl text-white">A critical error occurred</h1>
          <p className="mt-3 break-words text-sm leading-6 text-slate-300">
            We weren&apos;t able to render this page. Please retry, and if the issue persists,
            contact Hylono support.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              aria-describedby={GLOBAL_ERROR_ACTION_STATUS_ID}
              onFocus={() => setActionStatus(GLOBAL_ERROR_ACTION_READY)}
              onClick={handleRetry}
              className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            >
              Try again
            </button>
            {/* A plain anchor: the app router may be what failed. */}
            <a
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            >
              Contact Hylono support
            </a>
          </div>
          {/* Announced to assistive tech only; it describes the action, it is not page copy. */}
          <div
            id={GLOBAL_ERROR_ACTION_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Global error action status"
            className="sr-only"
          >
            {actionStatus}
          </div>
        </div>
      </body>
    </html>
  );
}
