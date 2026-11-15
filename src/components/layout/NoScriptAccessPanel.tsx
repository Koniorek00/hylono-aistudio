import { conditionGoals } from '@/content/conditions';

const supportingRoutes = [
  { href: '/research', label: 'Research hub' },
  { href: '/protocols', label: 'Protocol library' },
  { href: '/rental', label: 'Rental options' },
  { href: '/contact', label: 'Contact Hylono' },
] as const;

export const NOSCRIPT_ACCESS_ACTION_STATUS_ID = 'noscript-access-action-status';
export const NOSCRIPT_ACCESS_ACTION_READY_STATUS =
  'No-script access links are ready: conditions, guide, research, protocol, rental, and contact exits.';

export function NoScriptAccessPanel() {
  return (
    <section
      aria-label="JavaScript disabled notice"
      aria-describedby="noscript-access-description"
      className="mx-auto max-w-6xl px-6 py-10"
    >
      <div className="rounded-lg border border-white/10 bg-slate-950/90 p-6 text-white shadow-2xl shadow-slate-950/30 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          JavaScript disabled
        </p>
        <h1
          id="noscript-access-heading"
          className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Continue through Hylono core and condition guides
        </h1>
        <p
          id="noscript-access-description"
          className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base"
        >
          JavaScript is currently disabled in your browser. Use the links below to open the
          conditions hub, jump to a verified guide, review research, browse protocols, or ask for
          direct support.
        </p>
        <p
          id={NOSCRIPT_ACCESS_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="No-script access action status"
          className="sr-only"
        >
          {NOSCRIPT_ACCESS_ACTION_READY_STATUS}
        </p>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-5">
          <h2 className="text-lg font-semibold text-white">Condition guides</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/conditions"
              aria-describedby={NOSCRIPT_ACCESS_ACTION_STATUS_ID}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/45 hover:bg-white/[0.08] hover:text-cyan-100"
            >
              Open Conditions hub
            </a>
            {conditionGoals.map((goal) => (
              <a
                key={goal.slug}
                href={`/conditions/${goal.slug}`}
                aria-describedby={NOSCRIPT_ACCESS_ACTION_STATUS_ID}
                className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/45 hover:bg-white/[0.08] hover:text-cyan-100"
              >
                Open {goal.title} guide
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {supportingRoutes.map((route) => (
            <article
              key={route.href}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
            >
              <h2 className="text-lg font-semibold text-white">{route.label}</h2>
              <a
                href={route.href}
                aria-describedby={NOSCRIPT_ACCESS_ACTION_STATUS_ID}
                className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/45 hover:bg-white/[0.08] hover:text-cyan-100"
              >
                Open {route.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
