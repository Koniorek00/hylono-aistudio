import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Hero Gemini - Elite Front Page Prototype | Hylono',
  description:
    'Internal Hylono front page prototype for comparing wellness-technology navigation, evidence review, protocol planning, and rental access paths.',
  path: '/hero-gemini',
  forceNoIndex: true,
});

// [DECISION: SSG noindex because /hero-gemini is an internal front-page prototype and must not compete with the canonical homepage.]
// Rendering strategy: server-routed prototype shell with noindex metadata and an isolated client presentation experiment.
export default function HeroGeminiPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Internal prototype</p>
      <h1 className="mt-4 text-4xl font-bold">Hero Gemini prototype is unavailable</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        This internal prototype module is not part of the current public build. Continue with the canonical Hylono homepage instead.
      </p>
      <a className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white" href="/">
        Return to homepage
      </a>
    </section>
  );
}
