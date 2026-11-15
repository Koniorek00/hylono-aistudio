import type { Metadata } from 'next';
import Link from 'next/link';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import {
  RENTAL_CHECKOUT_SUCCESS_ACTION_READY_STATUS,
  RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID,
} from './action-status';

export const metadata: Metadata = createPageMetadata({
  title: 'Rental Checkout Follow-Up | Hylono',
  description:
    'Review the Hylono rental checkout follow-up page for manual confirmation, support next steps, and policy links.',
  path: '/rental/checkout/success',
  forceNoIndex: true,
});

// [DECISION: /rental/checkout/success is private noindex checkout follow-up because provider return URLs need a safe landing page, but payment or rental approval cannot be implied without backend verification.]
// Rendering strategy: static noindex success shell with conservative confirmation language and no dependency on untrusted query parameters.
export default function RentalCheckoutSuccessPage() {
  return (
    <>
      <StructuredData
        id="jsonld-rental-checkout-success-page"
        data={createWebPageSchema({
          name: 'Hylono Rental Checkout Follow-Up',
          description:
            'A Hylono rental checkout follow-up page for manual confirmation and support next steps.',
          path: '/rental/checkout/success',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-rental-checkout-success-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Rental', path: '/rental' },
          { name: 'Rental Checkout', path: '/rental/checkout' },
          { name: 'Follow-Up', path: '/rental/checkout/success' },
        ])}
      />
      <div className="min-h-screen bg-slate-950 text-white">
        <section className="border-b border-white/10 bg-white/[0.045]">
          <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Rental checkout follow-up
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Your rental checkout handoff reached a safe follow-up page.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              This page does not confirm payment, delivery, inventory, or rental approval. Hylono
              still verifies the request, support context, and any provider status before confirming
              the next step.
            </p>
            <p className="mt-5 rounded-lg border border-white/10 bg-slate-950/55 p-4 text-sm leading-6 text-slate-300">
              If a payment or rental provider sent a reference in the URL, keep that URL for support
              follow-up. Hylono verifies references privately before confirming any rental step.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-4xl gap-4 px-4 py-10 md:grid-cols-3 md:px-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <h2 className="text-lg font-bold text-white">Support owner</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{siteOwnership.commerce.team}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <h2 className="text-lg font-bold text-white">Support hours</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{siteEntity.supportHours}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <h2 className="text-lg font-bold text-white">Next step</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Keep your reference and contact Hylono if you need timing or delivery confirmation.
            </p>
          </div>
        </section>

        <section className="mx-auto flex max-w-4xl flex-col gap-3 px-4 pb-12 sm:flex-row md:px-6">
          <p
            id={RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Rental checkout follow-up action status"
            className="sr-only"
          >
            {RENTAL_CHECKOUT_SUCCESS_ACTION_READY_STATUS}
          </p>
          <Link
            href="/rental"
            aria-describedby={RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            Back to rental hub
          </Link>
          <Link
            href="/contact?intent=rental-checkout"
            aria-describedby={RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            Contact rental support
          </Link>
          <Link
            href="/terms"
            aria-describedby={RENTAL_CHECKOUT_SUCCESS_ACTION_STATUS_ID}
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-3 text-sm font-semibold text-slate-100 underline decoration-cyan-300 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            Review terms
          </Link>
        </section>
      </div>
    </>
  );
}
