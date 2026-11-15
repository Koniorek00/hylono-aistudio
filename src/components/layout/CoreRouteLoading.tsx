import Link from 'next/link';

const fallbackRoutes = [
  {
    id: 'conditions',
    href: '/conditions',
    label: 'Condition guides',
    description: 'Compare goal-led pages before you choose a product, protocol, rental, or support path.',
  },
  {
    id: 'research',
    href: '/research',
    label: 'Research hub',
    description: 'Review cited summaries and evidence notes before you act on a wellness plan.',
  },
  {
    id: 'store',
    href: '/store',
    label: 'Store hub',
    description: 'Open product hubs when you need pricing, device context, and next-step comparisons.',
  },
  {
    id: 'protocols',
    href: '/protocols',
    label: 'Protocol library',
    description: 'Browse structured routines when you want a practical, page-linked plan.',
  },
  {
    id: 'rental',
    href: '/rental',
    label: 'Rental options',
    description: 'Use rental planning for access, delivery context, and onboarding support.',
  },
  {
    id: 'contact',
    href: '/contact',
    label: 'Contact Hylono',
    description: 'Ask for a direct review when the next step needs human guidance.',
  },
] as const;

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="app-loading-heading"
      aria-describedby="app-loading-description"
      className="min-h-screen bg-slate-950 px-6 py-16 text-white"
    >
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Core access fallback
        </p>
        <h1
          id="app-loading-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Continue through Hylono core pages
        </h1>
        <p
          id="app-loading-description"
          className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base"
        >
          This page is still loading. If you need somewhere to go right now, the core Hylono pages
          below cover product comparison, protocols, research, rental planning, and support.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {fallbackRoutes.map((route) => {
            const titleId = `app-loading-route-${route.id}-title`;
            const descriptionId = `app-loading-route-${route.id}-description`;

            return (
              <article
                key={route.href}
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="rounded-lg border border-white/10 bg-slate-950/55 p-5"
              >
                <h2 id={titleId} className="text-lg font-semibold text-white">
                  {route.label}
                </h2>
                <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-300">
                  {route.description}
                </p>
                <Link
                  href={route.href}
                  aria-describedby={descriptionId}
                  className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  Continue to {route.label}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
