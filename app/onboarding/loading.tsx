import Link from 'next/link';
import { ClipboardCheck, LifeBuoy, PackageCheck } from 'lucide-react';

const ONBOARDING_LOADING_ACTION_STATUS_ID = 'onboarding-loading-action-status';
const onboardingStateActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const onboardingStatePrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function OnboardingLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="onboarding-loading-title"
      aria-describedby="onboarding-loading-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-semibold uppercase text-slate-300">
          <ClipboardCheck className="h-3.5 w-3.5 text-cyan-200" />
          Onboarding checklist
        </div>
        <h1
          id="onboarding-loading-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl"
        >
          Preparing onboarding checklist.
        </h1>
        <p
          id="onboarding-loading-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          Setup steps, policy references, and support paths are loading before you
          continue your onboarding review.
        </p>
        <p
          id={ONBOARDING_LOADING_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Onboarding loading action status"
          className="sr-only"
        >
          Onboarding loading recovery actions are ready.
        </p>
        <div className="mt-6 grid gap-3" aria-hidden="true">
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-white/[0.045] motion-reduce:animate-none" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/help"
            aria-describedby={`onboarding-loading-description ${ONBOARDING_LOADING_ACTION_STATUS_ID}`}
            className={onboardingStatePrimaryActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
          <Link
            href="/contact?source=onboarding&intent=setup"
            aria-describedby={`onboarding-loading-description ${ONBOARDING_LOADING_ACTION_STATUS_ID}`}
            className={onboardingStateActionClassName}
          >
            <ClipboardCheck className="h-4 w-4" />
            Contact support
          </Link>
          <Link
            href="/shipping"
            aria-describedby={`onboarding-loading-description ${ONBOARDING_LOADING_ACTION_STATUS_ID}`}
            className={onboardingStateActionClassName}
          >
            <PackageCheck className="h-4 w-4" />
            Review delivery guidance
          </Link>
        </div>
      </div>
    </section>
  );
}
