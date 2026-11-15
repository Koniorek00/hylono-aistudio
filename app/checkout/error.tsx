'use client';

import Link from 'next/link';
import { AlertTriangle, FileText, LifeBuoy, RefreshCw } from 'lucide-react';

interface CheckoutErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const checkoutErrorActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const checkoutErrorPrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const CHECKOUT_ERROR_ACTION_STATUS_ID = 'checkout-error-action-status';

export default function CheckoutError({ error: _error, reset }: CheckoutErrorProps) {
  return (
    <section
      role="alert"
      aria-labelledby="checkout-error-title"
      aria-describedby="checkout-error-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/[0.10] px-3 py-1 text-[11px] font-semibold uppercase text-amber-100">
          <AlertTriangle className="h-3.5 w-3.5" />
          Checkout recovery
        </div>
        <h1
          id="checkout-error-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Checkout review could not load.
        </h1>
        <p
          id="checkout-error-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          Retry checkout, open Help Center, or review terms before returning to
          the order request.
        </p>
        <p
          id={CHECKOUT_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Checkout error action status"
          className="sr-only"
        >
          Checkout error recovery actions are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            aria-describedby={`checkout-error-description ${CHECKOUT_ERROR_ACTION_STATUS_ID}`}
            className={checkoutErrorPrimaryActionClassName}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/help"
            aria-describedby={`checkout-error-description ${CHECKOUT_ERROR_ACTION_STATUS_ID}`}
            className={checkoutErrorActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
          <Link
            href="/terms"
            aria-describedby={`checkout-error-description ${CHECKOUT_ERROR_ACTION_STATUS_ID}`}
            className={checkoutErrorActionClassName}
          >
            <FileText className="h-4 w-4" />
            Review terms
          </Link>
        </div>
      </div>
    </section>
  );
}
