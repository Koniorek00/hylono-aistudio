'use client';

import Link from 'next/link';
import { AlertTriangle, LifeBuoy, RefreshCw, ShoppingBag } from 'lucide-react';

interface WishlistErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const wishlistErrorActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const wishlistErrorPrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const WISHLIST_ERROR_ACTION_STATUS_ID = 'wishlist-error-action-status';

export default function WishlistError({ error: _error, reset }: WishlistErrorProps) {
  return (
    <section
      role="alert"
      aria-labelledby="wishlist-error-title"
      aria-describedby="wishlist-error-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
          <AlertTriangle className="h-3.5 w-3.5" />
          Wishlist recovery
        </div>
        <h1
          id="wishlist-error-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Saved products need a reload.
        </h1>
        <p
          id="wishlist-error-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          The private wishlist shell did not finish rendering. Try again, browse store
          options, or open Help Center if saved products remain unavailable.
        </p>
        <p
          id={WISHLIST_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Wishlist error action status"
          className="sr-only"
        >
          Wishlist recovery actions are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            aria-describedby={`wishlist-error-description ${WISHLIST_ERROR_ACTION_STATUS_ID}`}
            className={wishlistErrorPrimaryActionClassName}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/store"
            aria-describedby={`wishlist-error-description ${WISHLIST_ERROR_ACTION_STATUS_ID}`}
            className={wishlistErrorActionClassName}
          >
            <ShoppingBag className="h-4 w-4" />
            Browse store
          </Link>
          <Link
            href="/help"
            aria-describedby={`wishlist-error-description ${WISHLIST_ERROR_ACTION_STATUS_ID}`}
            className={wishlistErrorActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
        </div>
      </div>
    </section>
  );
}
