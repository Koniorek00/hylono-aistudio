import Link from 'next/link';
import { FileText, LifeBuoy, ShoppingBag } from 'lucide-react';

const CHECKOUT_LOADING_ACTION_STATUS_ID = 'checkout-loading-action-status';
const checkoutStateActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const checkoutStatePrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function CheckoutLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="checkout-loading-title"
      aria-describedby="checkout-loading-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-semibold uppercase text-slate-300">
          <ShoppingBag className="h-3.5 w-3.5 text-cyan-200" />
          Checkout request
        </div>
        <h1
          id="checkout-loading-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Preparing checkout review.
        </h1>
        <p
          id="checkout-loading-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          Cart items, delivery fields, payment options, and policy references are
          loading before you submit an order request.
        </p>
        <p
          id={CHECKOUT_LOADING_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Checkout loading action status"
          className="sr-only"
        >
          Checkout loading recovery actions are ready.
        </p>
        <div className="mt-6 grid gap-3" aria-hidden="true">
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/store"
            aria-describedby={`checkout-loading-description ${CHECKOUT_LOADING_ACTION_STATUS_ID}`}
            className={checkoutStatePrimaryActionClassName}
          >
            <ShoppingBag className="h-4 w-4" />
            Browse store
          </Link>
          <Link
            href="/help"
            aria-describedby={`checkout-loading-description ${CHECKOUT_LOADING_ACTION_STATUS_ID}`}
            className={checkoutStateActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
          <Link
            href="/terms"
            aria-describedby={`checkout-loading-description ${CHECKOUT_LOADING_ACTION_STATUS_ID}`}
            className={checkoutStateActionClassName}
          >
            <FileText className="h-4 w-4" />
            Review terms
          </Link>
        </div>
      </div>
    </section>
  );
}
