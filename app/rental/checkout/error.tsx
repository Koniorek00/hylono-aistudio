'use client';

import Link from 'next/link';

interface RentalCheckoutErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const actionClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const RENTAL_CHECKOUT_ERROR_ACTION_STATUS_ID = 'rental-checkout-error-action-status';

export default function RentalCheckoutError({ error: _error, reset }: RentalCheckoutErrorProps) {
  return (
    <section
      role="alert"
      aria-labelledby="rental-checkout-error-title"
      aria-describedby="rental-checkout-error-description"
      className="min-h-screen bg-slate-950 px-6 pb-24 pt-32 text-white"
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.045] p-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
          Rental checkout
        </p>
        <h1
          id="rental-checkout-error-title"
          className="text-3xl font-black text-white futuristic-font"
        >
          Rental checkout could not load
        </h1>
        <p
          id="rental-checkout-error-description"
          className="mt-3 max-w-2xl text-sm leading-6 text-slate-300"
        >
          Please retry the checkout request, return to rental options, or ask Hylono for rental
          guidance if the problem continues.
        </p>
        <p
          id={RENTAL_CHECKOUT_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Rental checkout error action status"
          className="sr-only"
        >
          Rental checkout recovery actions are ready.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            aria-describedby={`rental-checkout-error-description ${RENTAL_CHECKOUT_ERROR_ACTION_STATUS_ID}`}
            className={`${actionClassName} bg-cyan-300 text-black hover:bg-cyan-200`}
          >
            Try again
          </button>
          <Link
            href="/rental"
            aria-describedby={`rental-checkout-error-description ${RENTAL_CHECKOUT_ERROR_ACTION_STATUS_ID}`}
            className={`${actionClassName} border border-white/10 bg-white/[0.045] text-slate-100 hover:bg-white/[0.08]`}
          >
            Back to rental options
          </Link>
          <Link
            href="/contact?intent=rental"
            aria-describedby={`rental-checkout-error-description ${RENTAL_CHECKOUT_ERROR_ACTION_STATUS_ID}`}
            className={`${actionClassName} border border-white/10 bg-white/[0.045] text-slate-100 hover:bg-white/[0.08]`}
          >
            Ask for rental guidance
          </Link>
        </div>
      </div>
    </section>
  );
}
