import Link from 'next/link';

const NOT_FOUND_TITLE_ID = 'not-found-title';
const NOT_FOUND_DESCRIPTION_ID = 'not-found-description';
const NOT_FOUND_ACTION_STATUS_ID = 'not-found-action-status';
const NOT_FOUND_ACTION_READY =
  'Not found recovery is ready. Back to home returns to the public Hylono home page without creating a support request, account change, or provider action.';

// Where a visitor who followed a dead link most likely wanted to go.
const NOT_FOUND_ROUTES = [
  { href: '/store', label: 'Browse the store' },
  { href: '/help', label: 'Help centre' },
  { href: '/contact', label: 'Contact us' },
] as const;

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center bg-slate-950 px-6 py-20 text-white">
      <section
        aria-labelledby={NOT_FOUND_TITLE_ID}
        aria-describedby={NOT_FOUND_DESCRIPTION_ID}
        className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.045] px-6 py-12 text-center sm:px-10"
      >
        <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">404</p>
        <h1
          id={NOT_FOUND_TITLE_ID}
          className="font-editorial mt-4 break-words text-4xl text-white md:text-5xl"
        >
          Page not found
        </h1>
        <p id={NOT_FOUND_DESCRIPTION_ID} className="mt-4 break-words text-slate-300">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/"
            aria-describedby={`${NOT_FOUND_DESCRIPTION_ID} ${NOT_FOUND_ACTION_STATUS_ID}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Back to home
          </Link>
          {NOT_FOUND_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              {route.label}
            </Link>
          ))}
        </div>
        {/* Announced to assistive tech only; it describes the action, it is not page copy. */}
        <div
          id={NOT_FOUND_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Not found action status"
          className="sr-only"
        >
          {NOT_FOUND_ACTION_READY}
        </div>
      </section>
    </div>
  );
}
