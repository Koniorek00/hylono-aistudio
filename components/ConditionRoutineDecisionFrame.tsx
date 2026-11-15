import Link from 'next/link';

type ConditionRoutineFrameSlug = 'recovery' | 'sleep';

const conditionRoutineFrames: Record<
  ConditionRoutineFrameSlug,
  {
    eyebrow: string;
    heading: string;
    id: string;
    intro: string;
    links: Array<{
      title: string;
      body: string;
      href: string;
      label: string;
    }>;
  }
> = {
  recovery: {
    eyebrow: 'Recovery answer frame',
    heading: 'Recovery routine decision frame',
    id: 'recovery-routine-decision-frame',
    intro:
      'Use this recovery guide to decide what to check first after training blocks, demanding work periods, or return-to-routine planning. It does not promise faster recovery, readiness, soreness reduction, or performance outcomes.',
    links: [
      {
        title: 'Start with evidence context',
        body:
          'Review the HBOT performance and soreness records plus hydrogen fatigue-capacity context before treating any stack as evidence of personal response.',
        href: '/research',
        label: 'Review recovery evidence',
      },
      {
        title: 'Choose the anchor path',
        body:
          'Use HBOT as the main product path only when session time, pressure tolerance, space, and support requirements are realistic.',
        href: '/product/hbot',
        label: 'Review HBOT fit',
      },
      {
        title: 'Check the protocol burden',
        body:
          'Use the Recovery Oxygen Foundation protocol to compare routine steps, cadence, and practical limits before building a stack.',
        href: '/protocols/recovery-oxygen-foundation',
        label: 'Review recovery protocol',
      },
      {
        title: 'Confirm access before ownership',
        body:
          'Use rental planning when delivery, cost, setup support, or routine adherence need confirmation before a purchase decision.',
        href: '/rental',
        label: 'Check rental fit',
      },
    ],
  },
  sleep: {
    eyebrow: 'Sleep support frame',
    heading: 'Sleep support decision frame',
    id: 'sleep-support-decision-frame',
    intro:
      'Use this sleep guide to choose a lower-stimulation routine path for evening planning. It is not clinical sleep care and does not promise better sleep quality, insomnia relief, overnight recovery, or measurable sleep outcomes.',
    links: [
      {
        title: 'Start with limited evidence context',
        body:
          'Review the population-specific HBOT and hydrogen records before treating any sleep-adjacent stack as proof for a general bedtime result.',
        href: '/research',
        label: 'Review sleep-adjacent evidence',
      },
      {
        title: 'Choose the quietest first path',
        body:
          'Use PEMF as the first product path only when the routine can stay short, quiet, and low-stimulation before bedtime.',
        href: '/product/pemf',
        label: 'Review PEMF fit',
      },
      {
        title: 'Check the protocol burden',
        body:
          'Use the stress-balance protocol to compare hydrogen as a lower-friction companion rather than as a sleep outcome claim.',
        href: '/protocols/stress-balance-h2-foundation',
        label: 'Review stress-balance protocol',
      },
      {
        title: 'Confirm access before ownership',
        body:
          'Use rental planning when setup friction, room timing, device brightness, or follow-through need confirmation before purchase.',
        href: '/rental',
        label: 'Check rental fit',
      },
    ],
  },
};

export function ConditionRoutineDecisionFrame({
  condition,
}: {
  condition: ConditionRoutineFrameSlug;
}) {
  const frame = conditionRoutineFrames[condition];

  return (
    <section
      aria-labelledby={frame.id}
      className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] md:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        {frame.eyebrow}
      </p>
      <h2 id={frame.id} className="mt-2 text-xl font-bold text-slate-950 break-words">
        {frame.heading}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 break-words">
        {frame.intro}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {frame.links.map((item, index) => {
          const titleId = `${frame.id}-link-${index + 1}-title`;
          const descriptionId = `${frame.id}-link-${index + 1}-description`;

          return (
            <article
              key={item.href}
              aria-labelledby={titleId}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 min-w-0 flex flex-col justify-between"
            >
              <div>
                <h3 id={titleId} className="text-sm font-semibold text-slate-950 break-words">
                  {item.title}
                </h3>
                <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-slate-600 break-words">
                  {item.body}
                </p>
              </div>
              <Link
                href={item.href}
                aria-describedby={descriptionId}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-100 break-words"
              >
                {item.label}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
