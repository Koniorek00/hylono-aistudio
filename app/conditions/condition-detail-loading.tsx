import type { ConditionGoalPage } from '@/content/conditions';
import { conditionGoalBySlug } from '@/content/conditions';

const conditionLoadingDescriptionId = (slug: ConditionGoalPage['slug']) =>
  `condition-loading-description-${slug}`;
const conditionLoadingActionStatusId = (slug: ConditionGoalPage['slug']) =>
  `condition-loading-action-status-${slug}`;

export function ConditionDetailLoading({
  slug,
}: {
  slug: ConditionGoalPage['slug'];
}) {
  const goal = conditionGoalBySlug[slug];

  if (!goal) {
    return null;
  }

  const descriptionId = conditionLoadingDescriptionId(goal.slug);
  const actionStatusId = conditionLoadingActionStatusId(goal.slug);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <section
          aria-labelledby={`condition-loading-title-${goal.slug}`}
          aria-describedby={descriptionId}
          className="rounded-lg border border-white/10 bg-white/[0.045] p-6 md:p-8"
        >
          <a
            href="/conditions"
            aria-describedby={`${descriptionId} ${actionStatusId}`}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-cyan-100"
          >
            &larr; Back to all goals
          </a>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Loading guide
          </p>
          <h1
            id={`condition-loading-title-${goal.slug}`}
            className="mt-3 text-3xl font-bold text-white"
          >
            Loading {goal.title.toLowerCase()} guide
          </h1>
          <p
            id={descriptionId}
            className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base"
          >
            Preparing the product, protocol, research, rental, and support paths for this goal.
          </p>
          <p
            id={actionStatusId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${goal.title} guide loading action status`}
            className="sr-only"
          >
            {goal.title} guide loading recovery actions are ready.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3" aria-hidden="true">
            <div className="h-16 animate-pulse rounded-lg bg-white/[0.08] motion-reduce:animate-none" />
            <div className="h-16 animate-pulse rounded-lg bg-white/[0.08] motion-reduce:animate-none" />
            <div className="h-16 animate-pulse rounded-lg bg-white/[0.08] motion-reduce:animate-none" />
          </div>
        </section>
      </div>
    </div>
  );
}
