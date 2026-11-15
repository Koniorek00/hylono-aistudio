import type { Metadata } from 'next';
import type { TechData } from '@/types';
import { siteEntity } from '@/content/site-entity';
import { env } from '@/lib/env';
import { buildProductSecondaryRouteContactHref } from '@/lib/contact-prefill';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { ProductTrackedLink } from './ProductTrackedLink';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const SECONDARY_ROUTE_EXIT_ROUTES = [
  {
    description:
      'Use the supported product hubs when you need published comparison, pricing context, or next-step guidance.',
    href: '/store',
    title: 'Supported product hubs',
  },
  {
    description:
      'Use the research hub when the question is evidence-led, limitation-aware, or closer to protocol context than commerce.',
    href: '/research',
    title: 'Research hub',
  },
  {
    description:
      'Use the rental hub when you need monthly-plan, delivery, onboarding, or support-scope context.',
    href: '/rental',
    title: 'Rental planning',
  },
  {
    description:
      'Use help when the question is operational, support-led, or policy-related rather than a page-discovery question.',
    href: '/help',
    title: 'Help center',
  },
] as const;

const getSecondaryProductRouteTitle = (productName: string) =>
  `${productName} guide | Hylono secondary product page`;

const getSecondaryProductRouteDescription = (productName: string) =>
  `Use this secondary Hylono page to move ${productName} questions into stronger product, research, rental, and contact pages without treating it as a full product-detail page.`;

export const createSecondaryProductRouteMetadata = ({
  canonicalSlug,
  productName,
}: {
  canonicalSlug: string;
  productName: string;
}): Metadata =>
  createPageMetadata({
    title: getSecondaryProductRouteTitle(productName),
    description: getSecondaryProductRouteDescription(productName),
    path: `/product/${canonicalSlug}`,
    forceNoIndex: true,
  });

interface SecondaryProductRouteProps {
  canonicalSlug: string;
  techData: TechData;
}

export function SecondaryProductRoute({
  canonicalSlug,
  techData,
}: SecondaryProductRouteProps) {
  const productName = techData.name;
  const path = `/product/${canonicalSlug}`;
  const description = getSecondaryProductRouteDescription(productName);
  const contactHref = buildProductSecondaryRouteContactHref({
    productName,
    productSlug: canonicalSlug,
  });
  const webPageSchema = {
    ...createWebPageSchema({
      name: `${productName} guide`,
      description,
      path,
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: [
      { '@type': 'DefinedTerm', name: productName },
      { '@type': 'DefinedTerm', name: 'Secondary product page' },
    ],
    mainEntity: {
      '@type': 'DefinedTerm',
      name: `${productName} secondary page`,
      description:
        'A secondary orientation page that sends visitors to stronger published product, research, rental, help, and contact pages.',
    },
    relatedLink: [
      ...SECONDARY_ROUTE_EXIT_ROUTES.map((route) => `${SITE_URL}${route.href}`),
      `${SITE_URL}/contact`,
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: [
        '#secondary-product-route-headline',
        '#secondary-product-route-description',
      ],
    },
  };
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: `${productName} guide`, path },
  ]);

  return (
    <>
      <StructuredData
        id={`jsonld-${canonicalSlug}-secondary-page`}
        data={webPageSchema}
      />
      <StructuredData
        id={`jsonld-${canonicalSlug}-secondary-breadcrumb`}
        data={breadcrumbSchema}
      />
      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
            Secondary product page
          </p>
          <h1
            id="secondary-product-route-headline"
            className="mt-4 text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl"
          >
            Use {productName} as a secondary product guide
          </h1>
          <p
            id="secondary-product-route-description"
            className="mt-5 text-base leading-7 text-slate-300 sm:text-lg"
          >
            This URL stays available for {productName}-related orientation. It is not the
            supported Hylono destination for full product-detail comparisons, pricing
            commitments, technical specification claims, or delivery-policy decisions.
          </p>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Use the stronger pages below when you need published product hubs, research
            context, rental planning, or a manual handoff.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ProductTrackedLink
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            ctaRole="primary"
            eventName="product_route_cta_clicked"
            href="/store"
            productSlug={canonicalSlug}
            source="secondary_route"
          >
            Open supported product hubs
          </ProductTrackedLink>
          <ProductTrackedLink
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            ctaRole="supporting"
            href="/rental"
            productSlug={canonicalSlug}
            source="secondary_route"
          >
            Open rental planning
          </ProductTrackedLink>
          <ProductTrackedLink
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            ctaRole="supporting"
            href={contactHref}
            productSlug={canonicalSlug}
            source="secondary_route"
          >
            Contact Hylono about {productName}
          </ProductTrackedLink>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span>
            {siteEntity.supportCoverageLabel}: {siteEntity.serviceArea} |{' '}
            {siteEntity.supportHours}
          </span>
          <ProductTrackedLink
            className="font-semibold text-cyan-200 underline decoration-cyan-300/70 underline-offset-4 hover:text-cyan-100"
            ctaRole="supporting"
            href="/help"
            productSlug={canonicalSlug}
            source="secondary_route"
          >
            Open help center
          </ProductTrackedLink>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Choose the strongest published next step
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {SECONDARY_ROUTE_EXIT_ROUTES.map((route) => (
              <article
                key={route.href}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20 transition-colors hover:border-cyan-300/35 hover:bg-white/[0.07] motion-reduce:transition-none"
              >
                <h3 className="text-lg font-bold text-white">{route.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {route.description}
                </p>
                <ProductTrackedLink
                  className="mt-4 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-cyan-200 underline decoration-cyan-300/70 underline-offset-4 transition-colors hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                  ctaRole="supporting"
                  href={route.href}
                  productSlug={canonicalSlug}
                  source="secondary_route"
                >
                  Open {route.title.toLowerCase()}
                </ProductTrackedLink>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-slate-950/20">
          <h2 className="text-xl font-bold text-white">Ownership and support</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Hylono keeps this page accessible for modality-specific orientation, but the
            maintained product, policy, and support context lives on the canonical store,
            research, rental, help, and contact pages.
          </p>
        </section>
        </div>
      </section>
    </>
  );
}
