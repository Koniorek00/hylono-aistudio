import Link from 'next/link';
import { Heart, LifeBuoy, ShoppingBag } from 'lucide-react';

const WISHLIST_LOADING_ACTION_STATUS_ID = 'wishlist-loading-action-status';
const wishlistStateActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const wishlistStatePrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function WishlistLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="wishlist-loading-title"
      aria-describedby="wishlist-loading-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          <Heart className="h-3.5 w-3.5 text-cyan-200" />
          Private shortlist
        </div>
        <h1
          id="wishlist-loading-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Preparing saved products.
        </h1>
        <p
          id="wishlist-loading-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          Wishlist access, shortlist actions, and support paths are loading.
        </p>
        <p
          id={WISHLIST_LOADING_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Wishlist loading action status"
          className="sr-only"
        >
          Wishlist loading recovery actions are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/store"
            aria-describedby={`wishlist-loading-description ${WISHLIST_LOADING_ACTION_STATUS_ID}`}
            className={wishlistStatePrimaryActionClassName}
          >
            <ShoppingBag className="h-4 w-4" />
            Browse store
          </Link>
          <Link
            href="/rental"
            aria-describedby={`wishlist-loading-description ${WISHLIST_LOADING_ACTION_STATUS_ID}`}
            className={wishlistStateActionClassName}
          >
            <Heart className="h-4 w-4" />
            Review rental access
          </Link>
          <Link
            href="/help"
            aria-describedby={`wishlist-loading-description ${WISHLIST_LOADING_ACTION_STATUS_ID}`}
            className={wishlistStateActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
        </div>
      </div>
    </section>
  );
}
