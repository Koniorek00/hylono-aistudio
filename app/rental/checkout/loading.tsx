import Link from 'next/link';

const actionClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function RentalCheckoutLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="rental-checkout-loading-title"
      aria-describedby="rental-checkout-loading-description"
      className="min-h-screen bg-slate-950 px-6 pb-24 pt-32 text-white"
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.045] p-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
          Rental checkout
        </p>
        <h1
          id="rental-checkout-loading-title"
          className="text-3xl font-black text-white futuristic-font"
        >
          Preparing rental request
        </h1>
        <p
          id="rental-checkout-loading-description"
          className="mt-3 max-w-2xl text-sm leading-6 text-slate-300"
        >
          We are loading the rental summary, plan details, and delivery form. You can return to
          rental options or contact support while this page finishes.
        </p>

        <div className="mt-8 grid gap-3" aria-hidden="true">
          <div className="h-20 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
          <div className="h-12 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
          <div className="h-12 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/rental"
            aria-describedby="rental-checkout-loading-description"
            className={`${actionClassName} bg-cyan-300 text-black hover:bg-cyan-200`}
          >
            Back to rental options
          </Link>
          <Link
            href="/contact?intent=rental"
            aria-describedby="rental-checkout-loading-description"
            className={`${actionClassName} border border-white/10 bg-white/[0.045] text-slate-100 hover:bg-white/[0.08]`}
          >
            Ask for rental guidance
          </Link>
        </div>
      </div>
    </section>
  );
}
