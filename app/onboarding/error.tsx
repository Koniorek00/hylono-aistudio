'use client';

import Link from 'next/link';
import { AlertTriangle, ClipboardCheck, LifeBuoy, RefreshCw } from 'lucide-react';

interface OnboardingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const onboardingErrorActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const onboardingErrorPrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const ONBOARDING_ERROR_ACTION_STATUS_ID = 'onboarding-error-action-status';

export default function OnboardingError({ error: _error, reset }: OnboardingErrorProps) {
  return (
    <section
      role="alert"
      aria-labelledby="onboarding-error-title"
      aria-describedby="onboarding-error-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/[0.10] px-3 py-1 text-[11px] font-semibold uppercase text-amber-100">
          <AlertTriangle className="h-3.5 w-3.5" />
          Onboarding recovery
        </div>
        <h1
          id="onboarding-error-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl"
        >
          Onboarding checklist could not load.
        </h1>
        <p
          id="onboarding-error-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          Retry the onboarding checklist, open Help Center, or contact support if
          setup, access, or policy details remain unavailable.
        </p>
        <p
          id={ONBOARDING_ERROR_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Onboarding error action status"
          className="sr-only"
        >
          Onboarding error recovery actions are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            aria-describedby={`onboarding-error-description ${ONBOARDING_ERROR_ACTION_STATUS_ID}`}
            className={onboardingErrorPrimaryActionClassName}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/help"
            aria-describedby={`onboarding-error-description ${ONBOARDING_ERROR_ACTION_STATUS_ID}`}
            className={onboardingErrorActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
          <Link
            href="/contact?source=onboarding&intent=setup"
            aria-describedby={`onboarding-error-description ${ONBOARDING_ERROR_ACTION_STATUS_ID}`}
            className={onboardingErrorActionClassName}
          >
            <ClipboardCheck className="h-4 w-4" />
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
