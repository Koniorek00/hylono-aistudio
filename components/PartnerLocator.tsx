'use client';

import Link from 'next/link';
import {
  partnerDirectoryMeta,
  partnerRequestChecklist,
  partnerTypeDescriptions,
  partnerTypeLabels,
  type PartnerType,
} from '@/content/partners';
import { siteEntity } from '@/content/site-entity';
import { buildLocatorContactHref } from '@/lib/contact-prefill';

const introductionTypes = (Object.keys(partnerTypeLabels) as PartnerType[]).map((type) => ({
  type,
  label: partnerTypeLabels[type],
  description: partnerTypeDescriptions[type],
}));

const primaryLinkClasses =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-300/40 bg-cyan-400/15 px-6 py-3 text-base font-semibold text-cyan-50 transition hover:bg-cyan-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200';

const secondaryLinkClasses =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200';

const darkPanelClasses = 'rounded-lg border border-white/10 bg-white/[0.045] p-5';

export function PartnerLocator() {
  return (
    <div className="min-h-screen bg-slate-950 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <section className="rounded-lg border border-white/10 bg-white/[0.045] p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Partner introductions
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Request a Hylono partner introduction
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            The locator is currently a guided introduction page. Public partner cards stay paused
            while records are reviewed before publication.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={buildLocatorContactHref({ intent: 'curious' })}
              className={`${primaryLinkClasses} sm:whitespace-nowrap`}
            >
              Request guided introduction
            </Link>
            <Link
              href={buildLocatorContactHref({ intent: 'rental' })}
              className={`${secondaryLinkClasses} sm:whitespace-nowrap`}
            >
              Ask about rental alternatives
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className={darkPanelClasses}>
              <h2 className="text-base font-semibold text-white">Page posture</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {partnerDirectoryMeta.verificationLabel}
              </p>
            </div>
            <div className={darkPanelClasses}>
              <h2 className="text-base font-semibold text-white">Support scope</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {partnerDirectoryMeta.nextStepLabel}
              </p>
            </div>
            <div className={darkPanelClasses}>
              <h2 className="text-base font-semibold text-white">Support coverage</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {siteEntity.supportCoverageLabel}. {siteEntity.supportHours}.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {introductionTypes.map(({ type, label, description }) => (
            <article
              key={type}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
                {label}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {label} introduction
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
              <Link
                href={buildLocatorContactHref({
                  intent: 'curious',
                  partnerType: label,
                })}
                className={`${primaryLinkClasses} mt-6 px-5 text-sm`}
              >
                Request {label} introduction
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-8 rounded-lg border border-white/10 bg-white/[0.045] p-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              What to include in your request
            </h2>
            <ul className="mt-6 space-y-3">
              {partnerRequestChecklist.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-4 text-sm leading-6 text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-lg border border-white/10 bg-slate-950/35 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Verified Hylono context
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">{siteEntity.description}</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Support email:{' '}
              <a
                className="underline-offset-4 hover:text-white hover:underline"
                href={`mailto:${siteEntity.supportEmail}`}
              >
                {siteEntity.supportEmail}
              </a>
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
